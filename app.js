// Updated Application Controller for Govt. High School Walton Lahore
// v3.5 Featuring: Timetable Adjustment Manu, Security Lock, Backup Vault, and Seniority Management

let appSettings = null;
let teachersList = [];
let classesList = [];
let scheduleResult = null;
let fixedPeriodsList = []; // Fix/Freeze Teacher Periods (fixed_periods collection)
let periodGroupsList = []; // Multi-Teachers in One Period — group overlay (periodGroups collection)
let timetableHistory = [];

// ==========================================
// TASK 7: DATE-WISE HISTORY LOG (Record & History)
// One timestamped log for ALL areas: whenever data is ADDED, EDITED or
// DELETED in an area, a history entry is appended immediately and
// persisted (localStorage + /save_backup via saveData()).
// ==========================================
let historyLog = [];
const HISTORY_TYPE_LABELS = {
    timetable: 'Time Table Record & History',
    staffStatement: 'Staff Statement History',
    summary: 'Time Table Summary History',
    substitution: 'Teacher Substitution History',
    incharges: 'Class Incharges History',
    teacherSlips: 'Teacher-Wise Slips History'
};
function historyClone(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return null; } }
function logHistory(type, action, description, snapshot) {
    try {
        const now = new Date();
        historyLog.push({
            id: 'H_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
            type: type,
            action: action,
            description: description,
            date: now.toLocaleDateString('en-GB'),
            displayDate: now.toLocaleString('en-GB'),
            timestamp: now.getTime(),
            snapshot: snapshot || null
        });
        const _histLimit = (typeof ruleConfigNumber === 'function') ? ruleConfigNumber('recordHistoryLimit', 200) : 200;
        if (historyLog.length > _histLimit) historyLog = historyLog.slice(-_histLimit);
        try { saveData(); } catch (e) {}
    } catch (e) {}
}
function historyMonthsBetween(fromTs, toTs) {
    try {
        const a = new Date(fromTs), b = new Date(toTs);
        let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
        if (b.getDate() < a.getDate()) m -= 1;
        return Math.max(0, m);
    } catch (e) { return 0; }
}
// Full months the CURRENT incharge of a class has served, measured from the
// last Class Incharges history entry for that class.
function historyInchargeMonths(classId) {
    try {
        const entries = (historyLog || []).filter(e => e.type === 'incharges' && e.snapshot && String(e.snapshot.classId) === String(classId));
        if (!entries.length) return 0;
        return historyMonthsBetween(entries[entries.length - 1].timestamp, Date.now());
    } catch (e) { return 0; }
}
let exporter = null;
let currentInchargeSubTab = 'incharges';
let staffStatementList = [];
let staffColumnsList = [];
let offlineFilesList = [];
let currentDistributionSubTab = 'teachers';
let currentAdjustmentClassId = null;

// ---- Teacher Substitution state (Task 6; own localStorage key, never touches saveData()) ----
function todayISO() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}
let substitutionState = { date: todayISO(), admissionsInchargeId: '' };

// ---- Time Table Summary: Working Days (Task 2) ----
let summaryWorkingDays = 6;
try { const _wd = parseInt(localStorage.getItem('summaryWorkingDays') || '6', 10); if (_wd >= 1 && _wd <= 6) summaryWorkingDays = _wd; } catch (e) {}
function summaryWorkingDaysChanged(val) {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1 || n > 6) return;
    summaryWorkingDays = n;
    try { localStorage.setItem('summaryWorkingDays', String(n)); } catch (e) {}
    try { saveData(); } catch (e) {}
    // TASK 7: date-wise history — summary working days changed.
    logHistory('summary', 'edit', 'Time Table Summary working days changed to ' + n + '.', { workingDays: n });
    renderSummaryTable();
}
function summaryMonthlyDays() { return Math.round(summaryWorkingDays * 26 / 6); }
let substitutionLeaves = []; // [{teacherId, cause}] for the selected date
let substitutionAssignments = {}; // key `${date}|${periodId}|${classId}` -> substituteTeacherId
let substitutionLeaveLog = []; // [{date, teacherId, cause}] persistent history
let substitutionLeavesByDate = {}; // {date: [{teacherId, cause}]} — keeps other dates' leaves when switching dates
const SUBSTITUTION_STORAGE_KEY = 'tt_substitution_v1';
function saveSubstitutionData() {
    try {
        // Stash the currently-edited date's leaves before writing.
        substitutionLeavesByDate[substitutionState.date] = Array.isArray(substitutionLeaves) ? substitutionLeaves : [];
        localStorage.setItem(SUBSTITUTION_STORAGE_KEY, JSON.stringify({
            version: 1,
            date: substitutionState.date,
            admissionsInchargeId: substitutionState.admissionsInchargeId,
            leavesByDate: substitutionLeavesByDate,
            leaveLog: substitutionLeaveLog,
            assignments: substitutionAssignments,
            whatsappNotify: substitutionState.whatsappNotify !== false
        }));
    } catch (e) { console.warn('Substitution save failed', e); }
}
// ---- WhatsApp notification on timetable change / substitution (Task 3, part 2) ----
// NOTE: True zero-click auto-send requires WhatsApp Business API (business
// verification + costs). The wa.me approach below opens WhatsApp with the
// message pre-filled — the user taps Send once. This is the practical
// approach that works without any API setup.
const WHATSAPP_TIMETABLE_MSG = 'Dear Teacher, please note that there is a change in your timetable, Please check out the WhatsApp group';
function formatPhoneForWhatsApp(phone) {
    let digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('92')) return digits;          // already international
    if (digits.startsWith('0')) return '92' + digits.slice(1); // 0300... -> 92300...
    if (digits.length === 10) return '92' + digits;      // 300... -> 92300...
    return digits;
}
// Robust phone lookup: Teacher & Workload (mobileNumber/phone) first, then
// Staff Statement Manager phone column ('Phone/ Cell #') matched by name.
function substitutionTeacherPhone(teacher) {
    if (!teacher) return '';
    if (teacher.mobileNumber) return teacher.mobileNumber;
    if (teacher.phone) return teacher.phone;
    if (teacher['Phone/ Cell #']) return teacher['Phone/ Cell #'];
    try {
        const nm = String(teacher.name || '').trim().toLowerCase();
        if (nm && Array.isArray(staffStatementList)) {
            const st = staffStatementList.find(s => {
                const sn = String(s['Teacher Name'] || s['Name with Parentage'] || s['Name'] || '').trim().toLowerCase();
                return sn === nm || (sn && nm && (sn.includes(nm) || nm.includes(sn)));
            });
            if (st) return st['Phone/ Cell #'] || st['Phone / Cell #'] || st['Phone'] || '';
        }
    } catch (e) {}
    return '';
}
function substitutionWhatsAppUrl(teacherId) {
    const teacher = substitutionTeacherById(teacherId);
    if (!teacher) return '';
    const phone = formatPhoneForWhatsApp(substitutionTeacherPhone(teacher));
    if (!phone) return '';
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(WHATSAPP_TIMETABLE_MSG);
}
function sendWhatsAppTimetableAlert(teacherId) {
    // Toggle: substitutionState.whatsappNotify (default ON). Stored in substitution data.
    if (substitutionState.whatsappNotify === false) return;
    const teacher = substitutionTeacherById(teacherId);
    if (!teacher) return;
    const url = substitutionWhatsAppUrl(teacherId);
    if (!url) { showToast('No phone number for ' + (teacher.name || 'teacher') + ' — WhatsApp not sent. Please add phone in Staff Statement Manager.'); return; }
    window.open(url, '_blank');
    showToast('WhatsApp message ready for ' + (teacher.name || 'teacher') + ' — press Send in WhatsApp.');
}
function substitutionNotifyNewAssignments(newTeacherIds) {
    // Notify each newly-assigned substitute teacher (their timetable changed).
    (newTeacherIds || []).forEach(id => { try { sendWhatsAppTimetableAlert(id); } catch (e) {} });
}

function substitutionToggleWhatsApp(checked) {
    substitutionState.whatsappNotify = !!checked;
    saveSubstitutionData();
}
// Auto-check for new sync file on load (Issue 4): browser cannot watch files
// in the background, so this shows a prominent Import prompt on app startup.
function syncAutoCheckToggle(checked) {
    try { localStorage.setItem('timetableSyncAutoCheck', checked ? '1' : '0'); } catch (e) {}
}
function syncAutoCheckEnabled() {
    try { return localStorage.getItem('timetableSyncAutoCheck') !== '0'; } catch (e) { return true; }
}
function syncPromptOnLoad() {
    try {
        const cb = document.getElementById('syncAutoCheckBox');
        if (cb) cb.checked = syncAutoCheckEnabled();
    } catch (e) {}
    if (!syncAutoCheckEnabled()) return;
    try {
        const banner = document.getElementById('syncLoadBanner');
        if (banner) banner.style.display = 'flex';
    } catch (e) {}
}
function loadSubstitutionData() {
    try {
        const raw = localStorage.getItem(SUBSTITUTION_STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw) || {};
        // Patch 34 (user's instruction): the Teacher Substitution tab
        // always opens on the CURRENT date. The date stored with the
        // data is not restored as the active date; every date's
        // leaves and assignments still load below (leavesByDate /
        // assignments), and the calendar picker in the tab's corner
        // can still switch the date manually for this session.
        substitutionState.date = todayISO();
        if (typeof data.admissionsInchargeId === 'string') substitutionState.admissionsInchargeId = data.admissionsInchargeId;
        substitutionState.whatsappNotify = (data.whatsappNotify !== false); // Patch 34 fix: was 'parsed' (undefined) — the ReferenceError silently stopped ALL substitution data from loading on startup
        if (data.leavesByDate && typeof data.leavesByDate === 'object') substitutionLeavesByDate = data.leavesByDate;
        if (Array.isArray(data.leaveLog)) substitutionLeaveLog = data.leaveLog;
        if (data.assignments && typeof data.assignments === 'object') substitutionAssignments = data.assignments;
        substitutionLeaves = Array.isArray(substitutionLeavesByDate[substitutionState.date])
            ? substitutionLeavesByDate[substitutionState.date] : [];
    } catch (e) { console.warn('Substitution load failed', e); }
}
loadSubstitutionData();

let currentPreviewElementId = null;
let currentPreviewTitle = "Print";
let currentPreviewOrientation = "portrait";

// Admin Security and Access State
const DEFAULT_ADMIN_PASSWORD = 'walton123';
let isSystemAdminUnlocked = false;
let adminPendingCallback = null;
// Fix #23: who is using the site — 'admin' (full access) or 'staff'
// (view-only). Set at login; null before login.
let sessionRole = null;
let currentStaffAccount = null;
// Fix #25: the main admin (password pair) is the Chief Admin; a second
// admin signs in with his own email account and is not chief.
let isChiefAdmin = false;
let currentEmailAdmin = null;
let currentEmailMember = null;
function isStaffSession() { return sessionRole === 'staff'; }
function isChiefAdminSession() { return sessionRole === 'admin' && isChiefAdmin; }
// ===== Fix #31: role button under the sync badge =====
// Automatically shows who is signed in, in the owner's words:
// Chief Admin -> "You are Chief Admin", Admin -> "You are Admin",
// Staff Member -> "You are Staff Member", email login -> "Email
// Membership". Hidden before login. Refreshed from applyRoleUi(),
// which every login path and the session restore already call.
function updateRoleBadge() {
    const btn = document.getElementById('roleBadgeBtn');
    const txt = document.getElementById('roleBadgeText');
    if (!btn || !txt) return;
    let label = '';
    if (sessionRole === 'admin' && isChiefAdmin) label = 'You are Chief Admin';
    else if (sessionRole === 'admin' && currentEmailAdmin) label = 'You are Admin';
    else if (sessionRole === 'staff' && currentStaffAccount) label = 'You are Staff Member';
    else if (sessionRole === 'staff' && currentEmailMember) label = 'Email Membership';
    if (label) { txt.textContent = label; btn.style.display = 'inline-flex'; }
    else { txt.textContent = ''; btn.style.display = 'none'; }
}
// ===== Fix #27: login session persistence (survives page refresh) =====
// Only the identity is stored — never a password. On boot the saved
// identity is re-validated against the cloud account lists, so a
// blocked or removed account is NOT restored. The Control Panel
// unlock flag (isSystemAdminUnlocked) stays in-memory only and is
// deliberately never restored: after a refresh the Control Panel
// still asks for its password.
const LOGIN_SESSION_KEY = 'ghs_walton_login_session_v1';
function saveLoginSession() {
    try {
        let s = null;
        if (sessionRole === 'admin' && isChiefAdmin) s = { v: 1, role: 'admin', chief: true };
        else if (sessionRole === 'admin' && currentEmailAdmin) s = { v: 1, role: 'admin', chief: false, email: currentEmailAdmin.email };
        else if (sessionRole === 'staff' && currentStaffAccount) s = { v: 1, role: 'staff', mobile: currentStaffAccount.mobile };
        else if (sessionRole === 'staff' && currentEmailMember) s = { v: 1, role: 'staff', email: currentEmailMember.email };
        if (s) localStorage.setItem(LOGIN_SESSION_KEY, JSON.stringify(s));
    } catch (e) {}
}
function clearLoginSession() { try { localStorage.removeItem(LOGIN_SESSION_KEY); } catch (e) {} }
function logoutApp() {
    clearLoginSession();
    location.reload();
}
async function restoreLoginSession(bypassPasskeyGate) {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(LOGIN_SESSION_KEY) || 'null'); } catch (e) {}
    if (!s || !s.role) return false;
    // Fix #28 (Option B): if THIS device holds a fingerprint passkey
    // for the saved identity, the session stays locked until the user
    // verifies by fingerprint (the saved session is left in place;
    // password login at the gate remains available as always).
    if (!bypassPasskeyGate && hasPasskeyForSession(s)) return false;
    try {
        if (s.role === 'admin' && s.chief) {
            sessionRole = 'admin';
            isChiefAdmin = true;
            currentEmailAdmin = null;
        } else if (s.role === 'admin' && s.email) {
            await fetchAccess();
            const rec = findAccessRecord('admins', s.email);
            if (!rec || rec.status !== 'active' || isEmailBlocked(s.email)) { clearLoginSession(); return false; }
            sessionRole = 'admin';
            isChiefAdmin = false;
            currentEmailAdmin = rec;
        } else if (s.role === 'staff' && s.mobile) {
            await fetchStaffAccounts();
            await fetchAccess();
            const acc = findStaffAccountByMobile(s.mobile);
            if (!acc || isEmailBlocked(acc.email)) { clearLoginSession(); return false; }
            sessionRole = 'staff';
            currentStaffAccount = acc;
        } else if (s.role === 'staff' && s.email) {
            await fetchAccess();
            const rec = findAccessRecord('grants', s.email);
            if (!rec || rec.status !== 'active' || isEmailBlocked(s.email)) { clearLoginSession(); return false; }
            sessionRole = 'staff';
            currentEmailMember = rec;
            currentStaffAccount = null;
        } else { clearLoginSession(); return false; }
    } catch (e) { return false; }
    applyRoleUi();
    return true;
}

// ===== Fix #28 (Option B): device-local fingerprint unlock =====
// WebAuthn is used ONLY as a local gate over the saved login session
// on this device. The authenticator (fingerprint sensor / Windows
// Hello) holds the private key; this device stores just the
// credential id per identity. Access itself is still decided by
// restoreLoginSession()'s cloud re-validation.
const PASSKEY_KEY = 'ghs_walton_passkey_v1';
function passkeySupported() { return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create && navigator.credentials.get); }
function sessionIdentityKey(s) {
    if (!s) return '';
    if (s.role === 'admin' && s.chief) return 'admin:chief';
    if (s.role === 'admin' && s.email) return 'admin:' + String(s.email).toLowerCase();
    if (s.role === 'staff' && s.mobile) return 'staff:' + normalizeMobileKey(s.mobile);
    if (s.role === 'staff' && s.email) return 'staffmail:' + String(s.email).toLowerCase();
    return '';
}
function currentSessionIdentityKey() {
    if (sessionRole === 'admin' && isChiefAdmin) return 'admin:chief';
    if (sessionRole === 'admin' && currentEmailAdmin) return 'admin:' + String(currentEmailAdmin.email).toLowerCase();
    if (sessionRole === 'staff' && currentStaffAccount) return 'staff:' + normalizeMobileKey(currentStaffAccount.mobile);
    if (sessionRole === 'staff' && currentEmailMember) return 'staffmail:' + String(currentEmailMember.email).toLowerCase();
    return '';
}
function loadPasskeys() { try { return JSON.parse(localStorage.getItem(PASSKEY_KEY) || '{}') || {}; } catch (e) { return {}; } }
function hasPasskeyForSession(s) { const k = sessionIdentityKey(s); return !!(k && loadPasskeys()[k]); }
function getPasskeyCredId(key) { const r = loadPasskeys()[key]; return r && r.credId ? r.credId : ''; }
function b64urlEncode(buf) { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64urlDecode(str) { const s = String(str).replace(/-/g, '+').replace(/_/g, '/'); const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : ''; const bin = atob(s + pad); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out.buffer; }
function randomChallenge() { const a = new Uint8Array(32); crypto.getRandomValues(a); return a; }
async function platformAuthenticatorAvailable() {
    if (!passkeySupported()) return false;
    try { return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch (e) { return false; }
}
function refreshFingerprintUi() {
    const gateBtn = document.getElementById('fingerprintLoginBtn');
    if (gateBtn) {
        let show = false;
        if (startupLoginGateActive && passkeySupported()) {
            let s = null;
            try { s = JSON.parse(localStorage.getItem(LOGIN_SESSION_KEY) || 'null'); } catch (e) {}
            show = hasPasskeyForSession(s);
        }
        gateBtn.style.display = show ? '' : 'none';
    }
    const actBtn = document.getElementById('fingerprintActivateBtn');
    if (actBtn) {
        const key = currentSessionIdentityKey();
        const has = !!(key && getPasskeyCredId(key));
        actBtn.style.display = (sessionRole && passkeySupported()) ? 'flex' : 'none';
        const lbl = document.getElementById('fingerprintActivateLabel');
        if (lbl) lbl.textContent = has ? 'Fingerprint Active \u2713' : 'Activate Fingerprint';
    }
}
// --- Activation: verify email + mobile against the signed-in account
function openFingerprintActivate() {
    if (!sessionRole) { showToast('Please log in first.'); return; }
    if (!passkeySupported()) { showToast('Your browser does not support fingerprint login.'); return; }
    const em = document.getElementById('fpEmailInput'); if (em) em.value = '';
    const mo = document.getElementById('fpMobileInput'); if (mo) mo.value = '';
    fpErr('');
    const m = document.getElementById('fingerprintModal'); if (m) m.classList.remove('hidden');
}
function closeFingerprintActivate() { const m = document.getElementById('fingerprintModal'); if (m) m.classList.add('hidden'); }
function fpErr(msg) { const el = document.getElementById('fpError'); if (el) { el.textContent = msg || ''; el.style.display = msg ? 'block' : 'none'; } }
function fingerprintExpectedIdentity() {
    if (sessionRole === 'admin' && isChiefAdmin) return { email: 'asifjaved81@gmail.com', mobile: '03214221739' };
    if (sessionRole === 'admin' && currentEmailAdmin) return { email: currentEmailAdmin.email, mobile: '' };
    if (sessionRole === 'staff' && currentStaffAccount) return { email: currentStaffAccount.email, mobile: currentStaffAccount.mobile };
    if (sessionRole === 'staff' && currentEmailMember) return { email: currentEmailMember.email, mobile: '' };
    return { email: '', mobile: '' };
}
async function fingerprintActivateVerify() {
    const emailEl = document.getElementById('fpEmailInput');
    const mobileEl = document.getElementById('fpMobileInput');
    const email = (emailEl ? emailEl.value : '').trim().toLowerCase();
    const mobile = (mobileEl ? mobileEl.value : '').trim();
    const exp = fingerprintExpectedIdentity();
    const emailOk = !!exp.email && email === String(exp.email).toLowerCase();
    let mobileOk = true;
    if (exp.mobile) {
        mobileOk = normalizeMobileKey(mobile) === normalizeMobileKey(exp.mobile);
        if (!mobileOk && sessionRole === 'staff' && currentStaffAccount) {
            const byMobile = findStaffAccountByMobile(mobile);
            mobileOk = !!byMobile && byMobile.id === currentStaffAccount.id;
        }
    }
    if (!emailOk || !mobileOk) { fpErr('Credentials do not match your account. Please check your email and mobile number.'); return; }
    if (!(await platformAuthenticatorAvailable())) { fpErr('No fingerprint sensor detected on this device.'); return; }
    try {
        const cred = await navigator.credentials.create({ publicKey: {
            challenge: randomChallenge(),
            rp: { name: 'GHS Walton Timetable', id: location.hostname },
            user: { id: new TextEncoder().encode(currentSessionIdentityKey()), name: email, displayName: email },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
            authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
            attestation: 'none', timeout: 60000
        }});
        if (!cred) { fpErr('Fingerprint activation failed. Please try again.'); return; }
        const all = loadPasskeys();
        all[currentSessionIdentityKey()] = { credId: b64urlEncode(cred.rawId), createdAt: Date.now() };
        localStorage.setItem(PASSKEY_KEY, JSON.stringify(all));
        closeFingerprintActivate();
        refreshFingerprintUi();
        showToast('Fingerprint created successfully.');
    } catch (e) {
        if (e && e.name === 'NotAllowedError') fpErr('Fingerprint activation was cancelled or timed out. Please try again.');
        else if (e && e.name === 'NotSupportedError') fpErr('Your browser does not support fingerprint login.');
        else fpErr('Fingerprint activation failed. Please try again.');
    }
}
// --- Login: fingerprint assertion unlocks the saved session
async function fingerprintLogin() {
    if (!passkeySupported()) { showToast('Your browser does not support fingerprint login.'); return; }
    let s = null;
    try { s = JSON.parse(localStorage.getItem(LOGIN_SESSION_KEY) || 'null'); } catch (e) {}
    const key = sessionIdentityKey(s);
    const credId = key ? getPasskeyCredId(key) : '';
    if (!s || !credId) { showToast('No fingerprint is activated for a saved login on this device.'); return; }
    if (!(await platformAuthenticatorAvailable())) { showToast('No fingerprint sensor detected on this device.'); return; }
    let assertion = null;
    try {
        assertion = await navigator.credentials.get({ publicKey: {
            challenge: randomChallenge(),
            rpId: location.hostname,
            allowCredentials: [{ type: 'public-key', id: b64urlDecode(credId) }],
            userVerification: 'required', timeout: 60000
        }});
    } catch (e) {
        if (e && e.name === 'NotAllowedError') showToast('Fingerprint verification failed or was cancelled.');
        else if (e && e.name === 'NotSupportedError') showToast('Your browser does not support fingerprint login.');
        else showToast('Fingerprint verification failed. Please try again.');
        return;
    }
    if (!assertion) { showToast('Fingerprint verification failed. Please try again.'); return; }
    const restored = await restoreLoginSession(true);
    if (restored) {
        clearStartupLoginGate();
        closeSecurityModal();
        showToast('Welcome back \u2014 fingerprint verified.');
    } else {
        showToast('This saved login is no longer valid. Please log in with your password.');
        try { refreshFingerprintUi(); } catch (e) {}
    }
}

// Modern Toast Notification Utility
function showToast(msg) {
    let toast = document.getElementById('appToastBox');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToastBox';
        toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 transform transition duration-300 pointer-events-none opacity-0 translate-y-4';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i><span>${msg}</span>`;
    toast.classList.remove('opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-4');
    }, 3200);
}

// Class & Section Formatting Helper (Prevents duplicates like 10th - A - A)
function formatClassSectionName(className, section) {
    if (!className) return section || '';
    if (!section) return String(className).trim();
    const cName = String(className).trim();
    const sec = String(section).trim();
    if (cName.toLowerCase().endsWith(sec.toLowerCase()) || 
        cName.toLowerCase().endsWith(`- ${sec.toLowerCase()}`) ||
        cName.toLowerCase().includes(`(${sec.toLowerCase()})`)) {
        return cName;
    }
    return `${cName} - ${sec}`;
}

// Strictly Government Service Date of Retirement Calculation Formula:
// Date of Retirement = Date of Birth + 60 Years - 1 Day
function calculateRetirementDate(dobStr) {
    if (!dobStr) return '';
    const cleanStr = dobStr.trim();
    const parts = cleanStr.split(/[-/.]/);
    if (parts.length !== 3) return '';

    let d, m, y;
    if (parts[0].length === 4) {
        // YYYY-MM-DD
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        d = parseInt(parts[2], 10);
    } else {
        // DD-MM-YYYY
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        y = parseInt(parts[2], 10);
    }

    if (isNaN(d) || isNaN(m) || isNaN(y)) return '';

    // Day before 60th birthday
    const retDate = new Date(y + 60, m, d - 1);
    if (isNaN(retDate.getTime())) return '';

    const retD = String(retDate.getDate()).padStart(2, '0');
    const retM = String(retDate.getMonth() + 1).padStart(2, '0');
    const retY = retDate.getFullYear();
    return `${retD}-${retM}-${retY}`;
}

function handleDobInputForRetirement(dobStr) {
    const retField = document.getElementById('staffDateRetirement');
    if (retField && dobStr) {
        const autoRet = calculateRetirementDate(dobStr);
        if (autoRet) {
            retField.value = autoRet;
        }
    }
}

// Automatic Date Masking Helper (dd-mm-yyyy)
function formatDateInputMask(input) {
    if (!input) return;
    let val = input.value.replace(/\D/g, ''); // numbers only
    if (val.length > 8) val = val.substring(0, 8);

    let formatted = '';
    if (val.length > 4) {
        formatted = `${val.substring(0, 2)}-${val.substring(2, 4)}-${val.substring(4)}`;
    } else if (val.length > 2) {
        formatted = `${val.substring(0, 2)}-${val.substring(2)}`;
    } else {
        formatted = val;
    }
    input.value = formatted;

    if (input.id === 'staffDob' && formatted.length === 10) {
        handleDobInputForRetirement(formatted);
    }
}

// Automatic CNIC Masking Helper (35201-1500544-9: 5-7-1 grouping)
function formatCnicInput(input) {
    if (!input) return;
    let val = input.value.replace(/\D/g, ''); // numbers only
    if (val.length > 13) val = val.substring(0, 13);

    let formatted = '';
    if (val.length > 12) {
        formatted = `${val.substring(0, 5)}-${val.substring(5, 12)}-${val.substring(12)}`;
    } else if (val.length > 5) {
        formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    } else {
        formatted = val;
    }
    input.value = formatted;
}

// Automatic Mobile Masking Helper (0300-4525789: dash after first 4 digits)
function formatMobileInput(input) {
    if (!input) return;
    // Fix #37: international numbers (+92 / 92...) keep their country
    // code and full length as a string -- never truncated into a wrong
    // local number. Local 03XX numbers keep the existing format.
    const _hadPlus = input.value.trim().startsWith('+');
    let _digits = input.value.replace(/\D/g, '');
    if (_hadPlus || (_digits.startsWith('92') && _digits.length > 11)) {
        if (_digits.length > 12) _digits = _digits.substring(0, 12);
        let _f = '+92';
        if (_digits.length > 2) _f += '-' + _digits.substring(2, 5);
        if (_digits.length > 5) _f += '-' + _digits.substring(5);
        input.value = _digits.length > 2 ? _f : (_hadPlus ? '+' + _digits : _digits);
        return;
    }
    let val = _digits;
    if (val.length > 11) val = val.substring(0, 11);

    let formatted = '';
    if (val.length > 4) {
        formatted = `${val.substring(0, 4)}-${val.substring(4)}`;
    } else {
        formatted = val;
    }
    input.value = formatted;
}

// Strictly Government Service Job Status & Auto-LPR Calculation Formula:
// If (Retirement Date - Today) <= 0 days -> Retired (Rose badge)
// If 0 < (Retirement Date - Today) <= 365 days -> LPR (Leave Preparatory to Retirement, Amber badge)
// Otherwise -> Active (Emerald badge)
function calculateJobStatus(retirementDateStr) {
    if (!retirementDateStr) return { status: 'Active', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', diffDays: null };
    const cleanStr = retirementDateStr.trim();
    const parts = cleanStr.split(/[-/.]/);
    if (parts.length !== 3) return { status: 'Active', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', diffDays: null };

    let d, m, y;
    if (parts[0].length === 4) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        d = parseInt(parts[2], 10);
    } else {
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        y = parseInt(parts[2], 10);
    }

    if (isNaN(d) || isNaN(m) || isNaN(y)) return { status: 'Active', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', diffDays: null };

    const retDate = new Date(y, m, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = retDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return { status: 'Retired', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', diffDays };
    } else if (diffDays <= 365) {
        return { status: 'LPR', badgeClass: 'bg-amber-100 text-amber-900 border-amber-400 font-black animate-pulse', diffDays };
    } else {
        return { status: 'Active', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold', diffDays };
    }
}

// Live Bell Time Indicator (Real-time active period tracking banner)
function updateLiveBellTimeIndicator() {
    const clockEl = document.getElementById('liveBellClockTime');
    const periodEl = document.getElementById('liveCurrentPeriodDisplay');
    if (!clockEl && !periodEl) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    if (clockEl) clockEl.innerText = timeStr;

    if (!appSettings || !appSettings.periods || appSettings.periods.length === 0) {
        if (periodEl) periodEl.innerText = "Schedule not loaded";
        return;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    function parseTimeToMinutes(tStr) {
        if (!tStr) return 0;
        const clean = tStr.trim().toUpperCase();
        const m = clean.match(/(\d+):(\d+)\s*(AM|PM)?/);
        if (!m) return 0;
        let h = parseInt(m[1], 10);
        const min = parseInt(m[2], 10);
        const ampm = m[3];
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h * 60 + min;
    }

    const periods = appSettings.periods;
    const firstPeriodStart = parseTimeToMinutes(periods[0].startTime);
    const lastPeriodEnd = parseTimeToMinutes(periods[periods.length - 1].endTime);

    // School hours check
    if (currentMinutes < firstPeriodStart) {
        if (periodEl) periodEl.innerHTML = `<span class="text-white">Assembly / Pre-School</span> <span class="text-xs text-amber-200">(Starts ${periods[0].startTime})</span>`;
        return;
    }

    if (currentMinutes >= lastPeriodEnd) {
        if (periodEl) periodEl.innerHTML = `<span class="text-white">School Closed</span> <span class="text-xs text-slate-200">(Ended at ${periods[periods.length - 1].endTime})</span>`;
        return;
    }

    // Check recess/break
    if (appSettings.breakTiming) {
        const breakParts = appSettings.breakTiming.split('-');
        if (breakParts.length >= 2) {
            const breakStart = parseTimeToMinutes(breakParts[0]);
            const breakEnd = parseTimeToMinutes(breakParts[1]);
            if (currentMinutes >= breakStart && currentMinutes < breakEnd) {
                if (periodEl) periodEl.innerHTML = `<span class="text-amber-200 font-black">☕ Break / Recess</span> <span class="text-xs text-white">(${appSettings.breakTiming.split('(')[0].trim()})</span>`;
                return;
            }
        }
    }

    // Find current period
    let activePeriod = null;
    for (const p of periods) {
        const startMin = parseTimeToMinutes(p.startTime);
        const endMin = parseTimeToMinutes(p.endTime);
        if (currentMinutes >= startMin && currentMinutes < endMin) {
            activePeriod = p;
            break;
        }
    }

    if (activePeriod) {
        if (periodEl) {
            periodEl.innerHTML = `<span class="text-amber-200 font-black">${activePeriod.name} Active</span> <span class="text-xs text-white">(${activePeriod.startTime} - ${activePeriod.endTime})</span>`;
        }
    } else {
        if (periodEl) {
            periodEl.innerHTML = `<span class="text-amber-100">Passing Period / Bell Interval</span>`;
        }
    }
}

// Admin Security Access Gate
// STARTUP LOGIN GATE: when true, the admin security modal is the mandatory
// startup login (shown right after the welcome screen). Cancel is hidden and
// closeSecurityModal() is blocked until a successful login (or OTP recovery)
// clears the gate — so the login can never be bypassed.
let startupLoginGateActive = false;
function ensureAdminAccess(actionCallback, isStartupGate, forcePrompt) {
    // Fix #23: a staff (view-only) session is never asked for a password;
    // the area simply opens under the view-only lockdown.
    if (isStaffSession()) { if (actionCallback) actionCallback(); return; }
    // Data Distribution ALWAYS asks for the Admin password, even when the
    // session is already unlocked by the startup login (forcePrompt=true).
    // Startup gate and Settings keep the old behaviour (forcePrompt falsy).
    if (isSystemAdminUnlocked && !forcePrompt) {
        if (actionCallback) actionCallback();
        return;
    }
    if (isStartupGate) startupLoginGateActive = true;

    adminPendingCallback = actionCallback;
    // The Staff Member Login button belongs to the start screen only.
    const _staffBtn = document.getElementById('staffLoginOpenBtn');
    if (_staffBtn) _staffBtn.style.display = isStartupGate ? '' : 'none';
    try { refreshFingerprintUi(); } catch (e) {}
    const input = document.getElementById('adminSecurityPasswordInput');
    if (input) input.value = '';
    const modal = document.getElementById('securityModal');
    if (modal) modal.classList.remove('hidden');
    // During the startup gate, hide Cancel so the login cannot be bypassed.
    const cancelBtn = document.getElementById('securityModalCancelBtn');
    if (cancelBtn) cancelBtn.style.display = startupLoginGateActive ? 'none' : '';
    // Auto-focus cursor into password field (no click needed).
    setTimeout(function () { const inp = document.getElementById('adminSecurityPasswordInput'); if (inp) inp.focus(); }, 50);
    // Attach auto-login listener (once).
    setupAdminAutoLogin();
}

// Clears the startup gate and restores the Cancel button.
function clearStartupLoginGate() {
    startupLoginGateActive = false;
    const cancelBtn = document.getElementById('securityModalCancelBtn');
    if (cancelBtn) cancelBtn.style.display = '';
}

function verifyAdminPasswordAction(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('adminSecurityPasswordInput');
    const entered = (input ? input.value : '').trim();
    // Empty input must NEVER log in — not even if the stored password is missing.
    if (!entered) { if (input) input.focus(); return; }
    // Fix #23: the admin pair — General OR Master — unlocks.
    if (isAdminPasswordValue(entered)) {
        isSystemAdminUnlocked = true;
        // Only the Chief pair itself marks a Chief session. A second
        // admin re-authenticating with his own password keeps his own
        // identity (this decides which identity gets persisted).
        if (entered === getAdminGeneralPassword() || entered === getAdminMasterPassword()) {
            sessionRole = 'admin';
            isChiefAdmin = true;
            currentEmailAdmin = null;
        }
        applyRoleUi();
        saveLoginSession();
        // Save callback BEFORE closeSecurityModal() clears it, so the
        // pending tab (e.g. Data Distribution) actually opens after login.
        const _cb = adminPendingCallback;
        adminPendingCallback = null;
        // Clear the startup gate BEFORE closing, or closeSecurityModal()
        // (which blocks while the gate is active) would refuse to close.
        clearStartupLoginGate();
        closeSecurityModal();
        showToast("Admin access unlocked successfully!");
        if (_cb) {
            _cb();
        }
    } else {
        alert("Incorrect password! Please enter the correct admin password.");
        if (input) input.focus();
    }
}

// Auto-login: as soon as the typed password matches the saved admin password,
// log in WITHOUT pressing Enter or clicking a button.
// Robust: re-attaches on every modal open (per-element flag so a re-rendered
// input still works), listens to input + paste + keyup + change.
function setupAdminAutoLogin() {
    const input = document.getElementById('adminSecurityPasswordInput');
    if (!input || input.dataset.autoLoginBound === '1') return;
    input.dataset.autoLoginBound = '1';
    const tryAutoLogin = function () {
        const entered = (input.value || '').trim();
        // Auto-login fires ONLY on a non-empty typed value matching a
        // non-empty stored password — never on page load, never on empty.
        if (!entered) return;
        if (isAdminPasswordValue(entered)) {
            verifyAdminPasswordAction(null);
        }
    };
    input.addEventListener('input', tryAutoLogin);
    input.addEventListener('paste', function () { setTimeout(tryAutoLogin, 0); });
    input.addEventListener('keyup', tryAutoLogin);
    input.addEventListener('change', tryAutoLogin);
    // TASK 8: Enter key also logs in (preventDefault stops the form submit
    // so the attempt runs exactly once).
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); verifyAdminPasswordAction(null); }
    });
}

function closeSecurityModal() {
    // Startup gate: the login cannot be bypassed with Cancel / Forgot.
    // (Successful login clears the gate first, then closes normally.)
    if (startupLoginGateActive) return;
    const modal = document.getElementById('securityModal');
    if (modal) modal.classList.add('hidden');
    adminPendingCallback = null;
}

// ===== Fix #23: admin password pair, staff accounts, staff login =====
const ADMIN_MASTER_KEY = 'ghs_walton_admin_master_v1';
const EMAILJS_STAFF_TEMPLATE_ID = 'template_r07u0sq';
function getAdminGeneralPassword() { return localStorage.getItem('ghs_walton_admin_password_v1') || DEFAULT_ADMIN_PASSWORD; }
function getAdminMasterPassword() {
    try { return localStorage.getItem(ADMIN_MASTER_KEY) || securityGetMasterPin(); }
    catch (e) { return 'Walton2026'; }
}
function isAdminPasswordValue(v) {
    if (!v) return false;
    if (v === getAdminGeneralPassword() || v === getAdminMasterPassword()) return true;
    // A signed-in second admin re-authenticates with his own account
    // password (e.g. at the Data Distribution prompt) — the Chief pair
    // is not his to know.
    if (sessionRole === 'admin' && currentEmailAdmin && v === currentEmailAdmin.password) return true;
    return false;
}

// --- Staff accounts: stored in their OWN cloud node ("accounts" next
// to data/meta) so they sync to every device and a dataset overwrite
// can never erase them. A local cache keeps logins possible offline.
let staffAccountsList = [];
let staffFlow = { teacher: null, account: null };
let forgotCtx = null;
function normalizeMobileKey(m) { return String(m || '').replace(/\D/g, ''); }
function findTeacherByMobile(m) {
    const k = normalizeMobileKey(m);
    if (!k) return null;
    return (typeof teachersList !== 'undefined' ? teachersList : []).find(t => normalizeMobileKey(t.mobileNumber) === k) || null;
}
function findStaffAccountByMobile(m) {
    const k = normalizeMobileKey(m);
    if (!k) return null;
    return staffAccountsList.find(a => normalizeMobileKey(a.mobile) === k) || null;
}
function staffCacheLoad() {
    try { const c = JSON.parse(localStorage.getItem('ghs_walton_staff_accounts_cache') || '[]'); if (Array.isArray(c)) staffAccountsList = c; } catch (e) {}
}
async function fetchStaffAccounts() {
    try {
        const r = await _mantleGetJson(_fbPath(syncConfig.cloudApiUrl, 'accounts'));
        if (!r.missing && Array.isArray(r.data)) {
            staffAccountsList = r.data;
            try { localStorage.setItem('ghs_walton_staff_accounts_cache', JSON.stringify(staffAccountsList)); } catch (e) {}
        }
    } catch (e) {}
    return staffAccountsList;
}
async function pushStaffAccounts() {
    try { await _mantlePut(_fbPath(syncConfig.cloudApiUrl, 'accounts'), staffAccountsList); } catch (e) {}
    try { localStorage.setItem('ghs_walton_staff_accounts_cache', JSON.stringify(staffAccountsList)); } catch (e) {}
}
function sendStaffCreatedEmail(acc) {
    try {
        return fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_STAFF_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: { staff_name: acc.name, staff_designation: acc.designation || '', staff_mobile: acc.mobile, staff_email: acc.email, staff_password: acc.password }
            })
        }).then(r => r.ok).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
}

// Fix #29: an email member finished creating their account -> notify
// the Chief Admin (same alert template as staff signups) with the
// member's name, mobile, email and the password they created.
function sendMemberCreatedEmail(rec) {
    try {
        return fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_STAFF_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: { staff_name: rec.name, staff_designation: 'Email Member', staff_mobile: rec.mobile || 'Not provided', staff_email: rec.email, staff_password: rec.password }
            })
        }).then(r => r.ok).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
}

// --- Staff login UI helpers ---
function staffErr(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg || ''; el.style.display = msg ? 'block' : 'none'; }
}
function staffShowStep(id) {
    document.querySelectorAll('.staff-step').forEach(s => s.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}
function openStaffLogin() {
    staffCacheLoad();
    staffFlow = { teacher: null, account: null };
    ['staffMobileInput', 'staffEmailInput', 'staffOtpInput', 'staffPassInput', 'staffPassConfirmInput', 'staffLoginPassInput'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    staffErr('staffMobileErr', ''); staffErr('staffLoginErr', ''); staffErr('staffCreateErr', '');
    staffSetMethod('mobile');
    document.getElementById('staffLoginModal').classList.remove('hidden');
    fetchStaffAccounts();
    accessCacheLoad();
    fetchAccess();
    setTimeout(function () { const i = document.getElementById('staffMobileInput'); if (i) i.focus(); }, 50);
}
function closeStaffLogin() { document.getElementById('staffLoginModal').classList.add('hidden'); }
function staffMobileMask(el) {
    const d = String(el.value || '').replace(/\D/g, '').slice(0, 11);
    el.value = d.length > 4 ? d.slice(0, 4) + '-' + d.slice(4) : d;
}
// Fix #24: the main admin's registered mobile — Staff Login accepts it
// and resolves it to the admin's own teacher record, so the admin can
// visit the website exactly as a staff member does.
const ADMIN_STAFF_MOBILE_KEY = '03214221739';
function findAdminTeacherRecord() {
    const list = (typeof teachersList !== 'undefined' ? teachersList : []);
    return list.find(t => t.id === 'T32') || list.find(t => /muhammad asif javed/i.test(t.name || '')) || null;
}
async function staffContinue() {
    staffErr('staffMobileErr', '');
    const mob = document.getElementById('staffMobileInput').value.trim();
    await fetchStaffAccounts();
    staffFlow.account = findStaffAccountByMobile(mob);
    if (staffFlow.account) {
        staffFlow.teacher = (typeof teachersList !== 'undefined' ? teachersList : []).find(t => t.id === staffFlow.account.teacherId) || null;
        document.getElementById('staffLoginName').textContent = staffFlow.account.name + ' (' + (staffFlow.account.designation || '') + ')';
        staffShowStep('staffStepLogin');
        setTimeout(function () { const i = document.getElementById('staffLoginPassInput'); if (i) i.focus(); }, 50);
        return;
    }
    let teacher = findTeacherByMobile(mob);
    if (!teacher && normalizeMobileKey(mob) === ADMIN_STAFF_MOBILE_KEY) teacher = findAdminTeacherRecord();
    if (!teacher) {
        staffErr('staffMobileErr', 'This mobile number is not registered in Teachers & Workload. Please enter the correct mobile number or contact the admin.');
        return;
    }
    staffFlow.teacher = teacher;
    document.getElementById('staffCreateName').value = teacher.name || '';
    document.getElementById('staffCreateDesignation').value = teacher.designation || '';
    staffShowStep('staffStepCreate');
}
function staffDoLogin() {
    staffErr('staffLoginErr', '');
    if (staffFlow.account && isEmailBlocked(staffFlow.account.email)) {
        staffErr('staffLoginErr', 'Your access has been blocked. Please contact the Chief Admin.');
        return;
    }
    const pw = document.getElementById('staffLoginPassInput').value;
    if (!staffFlow.account || pw !== staffFlow.account.password) {
        staffErr('staffLoginErr', 'Incorrect password. Please try again or use Forgot Password.');
        return;
    }
    sessionRole = 'staff';
    currentStaffAccount = staffFlow.account;
    saveLoginSession();
    closeStaffLogin();
    clearStartupLoginGate();
    closeSecurityModal();
    applyRoleUi();
    showToast('Welcome, ' + staffFlow.account.name + ' (View Only access)');
}
function staffSendCreateOtp() {
    staffErr('staffCreateErr', '');
    const email = document.getElementById('staffEmailInput').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        staffErr('staffCreateErr', 'Please enter a correct email address.');
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('ghs_staff_create_otp', otp);
    sessionStorage.setItem('ghs_staff_create_email', email);
    dispatchWebRelayOtp(email, otp);
    document.getElementById('staffOtpRow').classList.remove('hidden');
    document.getElementById('staffCreateActions').classList.remove('hidden');
}
async function staffCreatePassword() {
    staffErr('staffCreateErr', '');
    const otp = document.getElementById('staffOtpInput').value.trim();
    const savedOtp = sessionStorage.getItem('ghs_staff_create_otp');
    const email = sessionStorage.getItem('ghs_staff_create_email') || document.getElementById('staffEmailInput').value.trim();
    const p1 = document.getElementById('staffPassInput').value;
    const p2 = document.getElementById('staffPassConfirmInput').value;
    if (!savedOtp || otp !== savedOtp) { staffErr('staffCreateErr', 'Wrong OTP. Please enter the correct code received in your email.'); return; }
    if (!p1 || p1.length < 4) { staffErr('staffCreateErr', 'Password must be at least 4 characters long.'); return; }
    if (p1 !== p2) { staffErr('staffCreateErr', 'Password and Confirm Password do not match.'); return; }
    const t = staffFlow.teacher;
    if (!t) { staffErr('staffCreateErr', 'Session expired. Please start again.'); return; }
    const acc = { teacherId: t.id, name: t.name, designation: t.designation || '', mobile: ((document.getElementById('staffMobileInput') || {}).value || '').trim() || t.mobileNumber, email: email, password: p1, createdAt: new Date().toISOString() };
    staffAccountsList = staffAccountsList.filter(a => normalizeMobileKey(a.mobile) !== normalizeMobileKey(acc.mobile));
    staffAccountsList.push(acc);
    await pushStaffAccounts();
    sessionStorage.removeItem('ghs_staff_create_otp');
    sendStaffCreatedEmail(acc);
    staffFlow.account = acc;
    staffShowStep('staffStepSuccess');
}
function staffSuccessContinue() {
    const t = staffFlow.teacher;
    document.getElementById('staffLoginName').textContent = (t ? t.name : '') + ' (' + (t ? (t.designation || '') : '') + ')';
    staffShowStep('staffStepLogin');
}

// --- Forgot Password: Admin Access / Staff Member choice ---
function openForgotChoice() {
    forgotCtx = null;
    staffErr('forgotAdminErr', ''); staffErr('forgotStaffErr', '');
    document.getElementById('forgotAdminForm').classList.add('hidden');
    document.getElementById('forgotStaffForm').classList.add('hidden');
    document.getElementById('forgotEmailForm').classList.add('hidden');
    document.getElementById('forgotChoiceBtns').classList.remove('hidden');
    document.getElementById('forgotChoiceModal').classList.remove('hidden');
}
function closeForgotChoice() { document.getElementById('forgotChoiceModal').classList.add('hidden'); }
function forgotChoose(kind) {
    document.getElementById('forgotChoiceBtns').classList.add('hidden');
    document.getElementById('forgotAdminForm').classList.toggle('hidden', kind !== 'admin');
    document.getElementById('forgotStaffForm').classList.toggle('hidden', kind !== 'staff');
    document.getElementById('forgotEmailForm').classList.toggle('hidden', kind !== 'email');
    if (kind === 'staff') { staffCacheLoad(); fetchStaffAccounts(); }
}
function forgotAdminSubmit() {
    staffErr('forgotAdminErr', '');
    const email = document.getElementById('forgotAdminEmail').value.trim().toLowerCase();
    if (email !== String(SECURITY_EMAIL).toLowerCase()) {
        staffErr('forgotAdminErr', 'Please enter the correct email or contact to admin GHS Walton Lahore');
        return;
    }
    forgotCtx = { kind: 'admin' };
    closeForgotChoice();
    adminForgotStart();
}
async function forgotStaffSubmit() {
    staffErr('forgotStaffErr', '');
    const email = document.getElementById('forgotStaffEmail').value.trim().toLowerCase();
    const mob = document.getElementById('forgotStaffMobile').value.trim();
    await fetchStaffAccounts();
    const acc = findStaffAccountByMobile(mob);
    // No account yet (password never created) or email mismatch: no OTP.
    if (!acc || String(acc.email || '').toLowerCase() !== email) {
        staffErr('forgotStaffErr', 'Please Enter the Correct Mobile Number');
        return;
    }
    forgotCtx = { kind: 'staff', account: acc };
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('ghs_staff_recovery_otp', otp);
    dispatchWebRelayOtp(acc.email, otp);
    closeForgotChoice();
    ['staffResetOtp', 'staffResetPass', 'staffResetPassConfirm'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    staffErr('staffResetErr', '');
    document.getElementById('staffResetModal').classList.remove('hidden');
}
async function verifyStaffReset(event) {
    if (event) event.preventDefault();
    staffErr('staffResetErr', '');
    const otp = document.getElementById('staffResetOtp').value.trim();
    const savedOtp = sessionStorage.getItem('ghs_staff_recovery_otp');
    const p1 = document.getElementById('staffResetPass').value;
    const p2 = document.getElementById('staffResetPassConfirm').value;
    if (!savedOtp || otp !== savedOtp) { staffErr('staffResetErr', 'Wrong OTP. Please enter the correct code received in your email.'); return; }
    if (!p1 || p1.length < 4) { staffErr('staffResetErr', 'Password must be at least 4 characters long.'); return; }
    if (p1 !== p2) { staffErr('staffResetErr', 'Password and Confirm Password do not match.'); return; }
    if (forgotCtx && forgotCtx.kind === 'email') {
        const rec = findAccessRecord(forgotCtx.list, forgotCtx.email);
        if (rec) { rec.password = p1; await pushAccess(); }
    } else if (forgotCtx && forgotCtx.account) {
        forgotCtx.account.password = p1;
        await pushStaffAccounts();
    }
    sessionStorage.removeItem('ghs_staff_recovery_otp');
    document.getElementById('staffResetModal').classList.add('hidden');
    showToast('Your password has been reset successfully. Please login with the new password.');
}
function resendForgotOtp() {
    if (forgotCtx && forgotCtx.kind === 'email') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem('ghs_staff_recovery_otp', otp);
        dispatchWebRelayOtp(forgotCtx.email, otp);
    } else if (forgotCtx && forgotCtx.kind === 'staff' && forgotCtx.account) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem('ghs_staff_recovery_otp', otp);
        dispatchWebRelayOtp(forgotCtx.account.email, otp);
    } else {
        adminForgotStart();
    }
}

// ===== Fix #25: Chief Admin Access — email members + second admins =====
// The Chief's verification alert reuses the Staff Password Alert
// template (fixed To = the admin email): the EmailJS Free plan allows
// only 2 templates and both slots are already in production use.
let accessData = { grants: [], admins: [], blockedEmails: [] };
let emailFlow = { type: null, record: null };
function accessCacheLoad() {
    try {
        const c = JSON.parse(localStorage.getItem('ghs_walton_access_cache') || 'null');
        if (c && typeof c === 'object') accessData = { grants: c.grants || [], admins: c.admins || [], blockedEmails: c.blockedEmails || [] };
    } catch (e) {}
}
async function fetchAccess() {
    try {
        const r = await _mantleGetJson(_fbPath(syncConfig.cloudApiUrl, 'access'));
        if (!r.missing && r.data && typeof r.data === 'object') {
            accessData = { grants: r.data.grants || [], admins: r.data.admins || [], blockedEmails: r.data.blockedEmails || [] };
            try { localStorage.setItem('ghs_walton_access_cache', JSON.stringify(accessData)); } catch (e) {}
        }
    } catch (e) {}
    return accessData;
}
async function pushAccess() {
    try { await _mantlePut(_fbPath(syncConfig.cloudApiUrl, 'access'), accessData); } catch (e) {}
    try { localStorage.setItem('ghs_walton_access_cache', JSON.stringify(accessData)); } catch (e) {}
}
function isEmailBlocked(email) {
    const e = String(email || '').toLowerCase();
    return !!e && (accessData.blockedEmails || []).some(x => String(x).toLowerCase() === e);
}
function findAccessRecord(listName, email) {
    const e = String(email || '').toLowerCase();
    return (accessData[listName] || []).find(r => String(r.email || '').toLowerCase() === e) || null;
}
function sendAccessAlertEmail(name, email) {
    try {
        return fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_STAFF_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: {
                    staff_name: name || email,
                    staff_designation: 'Admin Access Verification',
                    staff_mobile: '-',
                    staff_email: email,
                    staff_password: 'Email verified by this person. To give admin access, open Settings > Chief Admin Access and press Make Admin for this person.'
                }
            })
        }).then(r => r.ok).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
}

// --- Chief Admin management UI (Settings, Chief only) ---
function chiefEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
function chiefRowHtml(title, sub, statusText, statusCls, buttonsHtml) {
    return '<div class="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">'
        + '<div class="text-xs font-bold text-slate-800">' + title + ' <span class="text-slate-500 font-semibold">' + sub + '</span>'
        + '<div class="text-[10px] font-bold ' + statusCls + '">' + statusText + '</div></div>'
        + '<div class="flex gap-1.5">' + buttonsHtml + '</div></div>';
}
function chiefBlockBtn(email, blocked) {
    return '<button onclick="chiefToggleBlock(\'' + encodeURIComponent(email) + '\')" class="' + (blocked ? 'bg-emerald-600' : 'bg-red-600') + ' hover:opacity-90 text-white font-black px-3 py-1 rounded-lg text-[11px]">' + (blocked ? 'Unblock' : 'Block') + '</button>';
}
async function renderChiefAccess() {
    const wrap = document.getElementById('chiefMembersList');
    if (!wrap || !isChiefAdminSession()) return;
    await fetchAccess();
    await fetchStaffAccounts();
    const rows = [];
    rows.push(chiefRowHtml('Chief Admin', '(you) — asifjaved81@gmail.com', 'CHIEF ADMIN — full access incl. Block / Unblock', 'text-red-700', ''));
    accessData.admins.forEach(function (a) {
        const blocked = isEmailBlocked(a.email);
        const status = blocked ? 'Blocked' : (a.status === 'active' ? 'Active Admin' : (a.status === 'verified' ? 'Verified — waiting for your approval' : 'Invited — not verified yet'));
        let btns = '';
        if (!blocked && a.status === 'verified') btns += '<button onclick="chiefMakeAdmin(\'' + encodeURIComponent(a.email) + '\')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1 rounded-lg text-[11px]">Make Admin</button>';
        btns += chiefBlockBtn(a.email, blocked);
        rows.push(chiefRowHtml(chiefEsc(a.name || a.email), chiefEsc(a.email), 'Admin — ' + status, blocked ? 'text-red-600' : 'text-slate-500', btns));
    });
    accessData.grants.forEach(function (g) {
        const blocked = isEmailBlocked(g.email);
        const status = blocked ? 'Blocked' : (g.status === 'active' ? 'Active' : 'Invited — not verified yet');
        rows.push(chiefRowHtml(chiefEsc(g.name || g.email), chiefEsc(g.email), 'Email Member (View Only) — ' + status, blocked ? 'text-red-600' : 'text-slate-500', chiefBlockBtn(g.email, blocked)));
    });
    staffAccountsList.forEach(function (acc) {
        const blocked = isEmailBlocked(acc.email);
        rows.push(chiefRowHtml(chiefEsc(acc.name), chiefEsc(acc.mobile || '') + ' · ' + chiefEsc(acc.email || ''), 'Teacher Staff (View Only)' + (blocked ? ' — Blocked' : ''), blocked ? 'text-red-600' : 'text-slate-500', chiefBlockBtn(acc.email, blocked)));
    });
    wrap.innerHTML = rows.join('');
}
async function chiefGrantMember() {
    if (!isChiefAdminSession()) { alert('Only the Chief Admin can give access.'); return; }
    const name = (document.getElementById('chiefGrantName').value || '').trim();
    const email = (document.getElementById('chiefGrantEmail').value || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { alert('Please enter a correct email address.'); return; }
    await fetchAccess();
    if (findAccessRecord('grants', email) || findAccessRecord('admins', email)) { alert('This email already has access or an invitation.'); return; }
    accessData.grants.push({ name: name, email: email, password: null, status: 'invited', createdAt: new Date().toISOString() });
    await pushAccess();
    document.getElementById('chiefGrantName').value = '';
    document.getElementById('chiefGrantEmail').value = '';
    showToast('Access given to ' + email + '. He can now verify from Staff Member Login (Email).');
    renderChiefAccess();
}
async function chiefInviteAdmin() {
    if (!isChiefAdminSession()) { alert('Only the Chief Admin can give admin power.'); return; }
    const name = (document.getElementById('chiefAdminName').value || '').trim();
    const email = (document.getElementById('chiefAdminEmail').value || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { alert('Please enter a correct email address.'); return; }
    await fetchAccess();
    if (findAccessRecord('admins', email) || findAccessRecord('grants', email)) { alert('This email already has access or an invitation.'); return; }
    accessData.admins.push({ name: name, email: email, password: null, status: 'invited', createdAt: new Date().toISOString() });
    await pushAccess();
    document.getElementById('chiefAdminName').value = '';
    document.getElementById('chiefAdminEmail').value = '';
    showToast('Admin invitation saved for ' + email + '. He must verify his email on the website first; then press Make Admin here.');
    renderChiefAccess();
}
async function chiefMakeAdmin(encEmail) {
    if (!isChiefAdminSession()) return;
    const rec = findAccessRecord('admins', decodeURIComponent(encEmail));
    if (rec && rec.status === 'verified') {
        rec.status = 'active';
        await pushAccess();
        showToast('Admin access given to ' + rec.email);
        renderChiefAccess();
    }
}
async function chiefToggleBlock(encEmail) {
    if (!isChiefAdminSession()) return;
    const email = decodeURIComponent(encEmail);
    await fetchAccess();
    const i = accessData.blockedEmails.findIndex(x => String(x).toLowerCase() === email.toLowerCase());
    if (i >= 0) accessData.blockedEmails.splice(i, 1); else accessData.blockedEmails.push(email);
    await pushAccess();
    showToast(i >= 0 ? 'Access restored for ' + email : 'Access blocked for ' + email);
    renderChiefAccess();
}

// --- Email login (inside Staff Member Login): members + second admins ---
function staffSetMethod(method) {
    document.querySelectorAll('.staff-method-btn').forEach(function (b) {
        const active = b.dataset.method === method;
        b.classList.toggle('bg-emerald-600', active);
        b.classList.toggle('text-white', active);
        b.classList.toggle('bg-slate-200', !active);
        b.classList.toggle('text-slate-700', !active);
    });
    if (method === 'email') { accessCacheLoad(); fetchAccess(); staffShowStep('emailStepEmail'); }
    else staffShowStep('staffStepMobile');
}
async function emailLoginContinue() {
    staffErr('emailErr', '');
    const email = document.getElementById('emailLoginInput').value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { staffErr('emailErr', 'Please enter a correct email address.'); return; }
    await fetchAccess();
    if (isEmailBlocked(email)) { staffErr('emailErr', 'Your access has been blocked. Please contact the Chief Admin.'); return; }
    emailOtpCooldownUntil = 0;
    emailOtpCooldownEmail = null;
    const admin = findAccessRecord('admins', email);
    if (admin) {
        emailFlow = { type: 'admin', record: admin };
        if (admin.status === 'active') {
            document.getElementById('emailPassName').textContent = (admin.name || admin.email) + ' — Admin';
            staffShowStep('emailStepPass');
        } else if (admin.status === 'verified') {
            document.getElementById('emailPendingMsg').textContent = 'Your email is verified. Your admin access is waiting for approval from the Chief Admin.';
            staffShowStep('emailStepPending');
        } else {
            resetEmailOtpStep(); staffShowStep('emailStepOtp');
        }
        return;
    }
    const grant = findAccessRecord('grants', email);
    if (grant) {
        emailFlow = { type: 'member', record: grant };
        if (grant.status === 'active') {
            document.getElementById('emailPassName').textContent = (grant.name || grant.email) + ' — Staff Member (View Only)';
            staffShowStep('emailStepPass');
        } else {
            resetEmailOtpStep(); staffShowStep('emailStepOtp');
        }
        return;
    }
    staffErr('emailErr', 'This email has no access. Please contact the Chief Admin.');
}
let emailOtpSending = false;
let emailOtpCooldownUntil = 0;
let emailOtpCooldownEmail = null;
async function resetEmailOtpStep() {
    const f = document.getElementById('emailOtpFields');
    if (f) f.classList.add('hidden');
    ['emailOtpInput', 'emailPassNew', 'emailPassConfirm'].forEach(function (id) { const el = document.getElementById(id); if (el) el.value = ''; });
    const sn = document.getElementById('emailOtpSent');
    if (sn) sn.style.display = 'none';
    const sb = document.getElementById('emailSendOtpBtn');
    if (sb) { sb.disabled = false; sb.textContent = 'Send OTP to my Email'; }
    staffErr('emailOtpErr', '');
}
async function emailSendOtp() {
    if (!emailFlow.record || emailOtpSending) return;
    // The cooldown only guards duplicate sends for the SAME pending
    // verification — a different person's flow is never blocked by it.
    if (Date.now() < emailOtpCooldownUntil && emailOtpCooldownEmail === emailFlow.record.email) return;
    staffErr('emailOtpErr', '');
    const sentNote = document.getElementById('emailOtpSent');
    if (sentNote) sentNote.style.display = 'none';
    const btn = document.getElementById('emailSendOtpBtn');
    emailOtpSending = true;
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('ghs_email_onboard_otp', otp);
    const ok = await dispatchWebRelayOtp(emailFlow.record.email, otp, true);
    emailOtpSending = false;
    if (!ok) {
        console.warn('Email OTP send failed for', emailFlow.record.email);
        staffErr('emailOtpErr', 'OTP email could not be sent. Please verify the email address is correct or contact the chief admin to re-authorize your access.');
        if (btn) { btn.disabled = false; btn.textContent = 'Send OTP to my Email'; }
        return;
    }
    document.getElementById('emailOtpFields').classList.remove('hidden');
    if (sentNote) {
        sentNote.textContent = 'OTP has been sent to ' + emailFlow.record.email + '. Please check your Inbox — and also the Spam folder if you do not see it.';
        sentNote.style.display = 'block';
    }
    // 60-second cooldown so repeated clicks cannot pile up duplicate
    // OTP emails (the history showed several sends in the same minute).
    emailOtpCooldownUntil = Date.now() + 60000;
    emailOtpCooldownEmail = emailFlow.record.email;
    if (btn) {
        btn.textContent = 'Resend OTP';
        const tick = function () {
            const left = Math.ceil((emailOtpCooldownUntil - Date.now()) / 1000);
            if (left > 0) { btn.disabled = true; btn.textContent = 'Resend OTP in ' + left + 's'; setTimeout(tick, 1000); }
            else { btn.disabled = false; btn.textContent = 'Resend OTP'; }
        };
        tick();
    }
}
async function emailOnboard() {
    staffErr('emailOtpErr', '');
    if (!emailFlow.record) { staffErr('emailOtpErr', 'Session expired. Please start again.'); return; }
    const otp = document.getElementById('emailOtpInput').value.trim();
    const savedOtp = sessionStorage.getItem('ghs_email_onboard_otp');
    const p1 = document.getElementById('emailPassNew').value;
    const p2 = document.getElementById('emailPassConfirm').value;
    if (!savedOtp || otp !== savedOtp) { staffErr('emailOtpErr', 'Wrong OTP. Please enter the correct code received in your email.'); return; }
    if (!p1 || p1.length < 4) { staffErr('emailOtpErr', 'Password must be at least 4 characters long.'); return; }
    if (p1 !== p2) { staffErr('emailOtpErr', 'Password and Confirm Password do not match.'); return; }
    // Fix #29: the member's mobile is captured at account creation —
    // the Chief's notification email must carry it. Required for
    // email members (11 digits); saved for admins too when provided.
    const mobDigits = normalizeMobileKey((document.getElementById('emailMobileInput') || {}).value || '');
    if (emailFlow.type !== 'admin' && mobDigits.length !== 11) { staffErr('emailOtpErr', 'Please enter your correct mobile number.'); return; }
    if (mobDigits.length === 11) emailFlow.record.mobile = mobDigits.slice(0, 4) + '-' + mobDigits.slice(4);
    emailFlow.record.password = p1;
    sessionStorage.removeItem('ghs_email_onboard_otp');
    if (emailFlow.type === 'admin') {
        emailFlow.record.status = 'verified';
        await pushAccess();
        sendAccessAlertEmail(emailFlow.record.name, emailFlow.record.email);
        document.getElementById('emailPendingMsg').textContent = 'You have successfully verified your email and created your password. The Chief Admin has received a verification message. He will give you admin access from his settings.';
        staffShowStep('emailStepPending');
    } else {
        emailFlow.record.status = 'active';
        await pushAccess();
        sendMemberCreatedEmail(emailFlow.record);
        document.getElementById('emailPassName').textContent = (emailFlow.record.name || emailFlow.record.email) + ' — Staff Member (View Only)';
        staffShowStep('emailStepPass');
        showToast('Your password has been created. Please login.');
    }
}
function emailDoLogin() {
    staffErr('emailPassErr', '');
    const pw = document.getElementById('emailPassInput').value;
    if (!emailFlow.record || pw !== emailFlow.record.password) { staffErr('emailPassErr', 'Incorrect password. Please try again or use Forgot Password.'); return; }
    if (isEmailBlocked(emailFlow.record.email)) { staffErr('emailPassErr', 'Your access has been blocked. Please contact the Chief Admin.'); return; }
    if (emailFlow.type === 'admin') {
        sessionRole = 'admin';
        isChiefAdmin = false;
        isSystemAdminUnlocked = true;
        currentEmailAdmin = emailFlow.record;
        currentStaffAccount = null;
        closeStaffLogin();
        clearStartupLoginGate();
        closeSecurityModal();
        applyRoleUi();
        showToast('Welcome, ' + (emailFlow.record.name || emailFlow.record.email) + ' (Admin)');
    } else {
        sessionRole = 'staff';
        currentEmailMember = emailFlow.record;
        currentStaffAccount = null;
        closeStaffLogin();
        clearStartupLoginGate();
        closeSecurityModal();
        applyRoleUi();
        showToast('Welcome, ' + (emailFlow.record.name || emailFlow.record.email) + ' (View Only access)');
    }
    saveLoginSession();
}
async function forgotEmailSubmit() {
    staffErr('forgotEmailErr', '');
    const email = document.getElementById('forgotEmailInput').value.trim().toLowerCase();
    await fetchAccess();
    if (isEmailBlocked(email)) { staffErr('forgotEmailErr', 'Your access has been blocked. Please contact the Chief Admin.'); return; }
    let list = null;
    const adm = findAccessRecord('admins', email);
    const grt = findAccessRecord('grants', email);
    if (adm && adm.password) list = 'admins';
    else if (grt && grt.password) list = 'grants';
    if (!list) { staffErr('forgotEmailErr', 'This email has no access. Please contact the Chief Admin.'); return; }
    forgotCtx = { kind: 'email', list: list, email: email };
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('ghs_staff_recovery_otp', otp);
    const sentOk = await dispatchWebRelayOtp(email, otp, true);
    if (!sentOk) {
        console.warn('Forgot email OTP send failed for', email);
        staffErr('forgotEmailErr', 'OTP email could not be sent. Please verify the email address is correct or contact the chief admin to re-authorize your access.');
        return;
    }
    closeForgotChoice();
    ['staffResetOtp', 'staffResetPass', 'staffResetPassConfirm'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    staffErr('staffResetErr', '');
    document.getElementById('staffResetModal').classList.remove('hidden');
}

// --- Settings: change the Master password (OTP on the admin email) ---
function sendMasterChangeOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('ghs_master_change_otp', otp);
    dispatchWebRelayOtp(SECURITY_EMAIL, otp);
    document.getElementById('masterOtpRow').classList.remove('hidden');
    showToast('OTP has been sent to the admin email.');
}
function changeMasterPasswordAction() {
    const otp = (document.getElementById('settingsMasterOtp')?.value || '').trim();
    const newPass = (document.getElementById('settingsMasterNew')?.value || '').trim();
    const confPass = (document.getElementById('settingsMasterConfirm')?.value || '').trim();
    const savedOtp = sessionStorage.getItem('ghs_master_change_otp');
    if (!savedOtp || otp !== savedOtp) { alert('Wrong OTP! Please enter the correct code received on the admin email.'); return; }
    if (!newPass || newPass.length < 4) { alert('The new Master password must be at least 4 characters long.'); return; }
    if (newPass !== confPass) { alert('The new Master password and confirmation password do not match!'); return; }
    localStorage.setItem(ADMIN_MASTER_KEY, newPass);
    sessionStorage.removeItem('ghs_master_change_otp');
    ['settingsMasterOtp', 'settingsMasterNew', 'settingsMasterConfirm'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('masterOtpRow').classList.add('hidden');
    showToast('Master password changed successfully!');
}

// --- Role UI + the staff view-only lockdown ---
function applyRoleUi() {
    const card = document.getElementById('controlPanelCard');
    if (card) card.style.display = isStaffSession() ? 'none' : '';
    // The Control Panel nav button (Data Distribution tab) is hidden
    // for staff too — only admin logins ever see a Control Panel button.
    const navBtn = document.querySelector('.tab-btn[data-tab="distribution"]');
    if (navBtn) navBtn.style.display = isStaffSession() ? 'none' : '';
    const subBtn = document.querySelector('.tab-btn[data-tab="substitution"]');
    if (subBtn) subBtn.style.display = isStaffSession() ? 'none' : '';
    // Chief-only areas: the Chief Admin Access section and the Chief's
    // own password sections are hidden from second admins.
    const notChiefAdmin = (sessionRole === 'admin' && !isChiefAdmin);
    ['chiefAccessSection', 'settingsGeneralSection', 'settingsMasterSection'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.style.display = notChiefAdmin ? 'none' : '';
    });
    if (isChiefAdminSession()) { try { renderChiefAccess(); } catch (e) {} }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) { logoutBtn.classList.toggle('hidden', !sessionRole); logoutBtn.classList.toggle('flex', !!sessionRole); }
    try { refreshFingerprintUi(); } catch (e) {}
    try { updateRoleBadge(); } catch (e) {}
    // Fix #33: Save Data is an admin-only button — Chief Admin and
    // Admin sessions see it; Staff Member / Email Member sessions
    // never do (and neither does the signed-out gate).
    try { const _sv = document.getElementById('saveDataTopBtn'); if (_sv) _sv.style.display = (sessionRole === 'admin') ? '' : 'none'; } catch (e) {}
    if (isStaffSession()) enforceStaffLockdown();
}
const STAFF_BLOCK_ONCLICK = /(save|add|edit|delete|remove|generate|adjust|import|upload|restore|freeze|assign|create|update|clear|shuffle|submit|send)/i;
const STAFF_ALLOW_ONCLICK = /(switchTab|print|export|share|slip|view|download)/i;
function enforceStaffLockdown() {
    if (!isStaffSession()) return;
    // Fix #24: re-hide the role-hidden chrome on EVERY pass — the
    // appearance system periodically resets tab button display, so a
    // one-time hide at login is not enough.
    const _cpCard = document.getElementById('controlPanelCard');
    if (_cpCard) _cpCard.style.display = 'none';
    ['distribution', 'substitution'].forEach(function (t) {
        const b = document.querySelector('.tab-btn[data-tab="' + t + '"]');
        if (b) b.style.display = 'none';
    });
    // Teacher-Wise Slip: the staff member's dropdown loses the
    // "View All Teachers" option and is locked to his own name.
    const slipSel = document.getElementById('teacherFilterSelect');
    if (slipSel && currentStaffAccount && currentStaffAccount.teacherId) {
        const allOpt = slipSel.querySelector('option[value="ALL"]');
        if (allOpt) allOpt.remove();
        slipSel.value = currentStaffAccount.teacherId;
        slipSel.disabled = true;
    }
    document.querySelectorAll('section[id^="tab-"] input, section[id^="tab-"] select, section[id^="tab-"] textarea').forEach(el => {
        if (el.dataset.viewAllow === '1' || el.closest('[data-view-allow]')) return;
        if (el.tagName === 'SELECT' && /(view|slip|class|teacher|period)/i.test(el.id || '')) return;
        if (el.tagName === 'INPUT' && /(search|filter)/i.test(el.id || '')) return;
        el.disabled = true;
    });
    document.querySelectorAll('section[id^="tab-"] button').forEach(btn => {
        const oc = btn.getAttribute('onclick') || '';
        if (STAFF_ALLOW_ONCLICK.test(oc)) return;
        if (STAFF_BLOCK_ONCLICK.test(oc)) { btn.disabled = true; btn.style.opacity = '0.45'; }
    });
    // Edit dialogs live at body level and are filled when opened —
    // disable everything inside them for staff as well (only Close /
    // Cancel and print-type buttons stay usable).
    const STAFF_EDIT_MODALS = ['autoAdjustModal', 'bellAdjustModal', 'bellTimingEditModal', 'classModal', 'columnModal', 'fixPeriodModal', 'fixedPeriodsListModal', 'multiGroupModal', 'removeColumnModal', 'settingsModal', 'softwareRulesModal', 'staffModal', 'teacherModal', 'cloudSyncModal'];
    STAFF_EDIT_MODALS.forEach(function (mid) {
        const m = document.getElementById(mid);
        if (!m) return;
        m.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = true; });
        m.querySelectorAll('button').forEach(btn => {
            const oc = btn.getAttribute('onclick') || '';
            if (/(close|hide|cancel)/i.test(oc)) return;
            if (STAFF_ALLOW_ONCLICK.test(oc)) return;
            btn.disabled = true;
            btn.style.opacity = '0.45';
        });
    });
}
// Self-healing: dialogs and lists are rendered when opened, so after
// any click in a staff session the lockdown is re-applied once the
// click's own rendering has settled.
document.addEventListener('click', function () {
    if (typeof isStaffSession === 'function' && isStaffSession()) {
        setTimeout(function () { try { enforceStaffLockdown(); } catch (e) {} }, 0);
    }
}, true);

// Forgot Password OTP Recovery System — Fix #23: the menu first asks
// Admin Access or Staff Member; the original admin flow lives on in
// adminForgotStart().
function triggerForgotPasswordOtp() {
    closeSecurityModal();
    openForgotChoice();
}

function adminForgotStart() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('ghs_walton_recovery_otp', otp);

    // Ensure inputs are completely empty - NEVER show or pre-fill OTP on screen!
    const otpInput = document.getElementById('otpCodeInput');
    const newPassInput = document.getElementById('otpNewPasswordInput');
    if (otpInput) otpInput.value = '';
    if (newPassInput) newPassInput.value = '';

    const modal = document.getElementById('otpModal');
    if (modal) modal.classList.remove('hidden');

    showToast("Security code is being sent to Registered Email...");

    // Hosted build: there is no local OTP server - the code is sent
    // directly through the school's EmailJS service (connected Gmail).
    dispatchWebRelayOtp(SECURITY_EMAIL, otp);
}

// Hosted build: OTP / security-PIN email is sent through the school's own
// EmailJS service, which is connected to the admin Gmail account - the mail
// is sent FROM that Gmail, so it lands in the inbox reliably. The result is
// reported honestly: "sent" is shown only when EmailJS confirms the send.
const EMAILJS_SERVICE_ID = 'service_tff96ya';
const EMAILJS_TEMPLATE_ID = 'template_mbzj8fq';
const EMAILJS_PUBLIC_KEY = '90ztI4xHtoTxBMNG4';

function dispatchWebRelayOtp(email, otp, silent) {
    // Fix #26: 'silent' lets a caller own the user messaging (the email
    // access flow shows its own exact success/failure text). Default
    // behaviour for all existing callers is unchanged.
    try {
        return fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: { to_email: email, otp: String(otp) }
            })
        }).then(res => {
            if (res.ok) {
                if (!silent) showToast("Security code has been sent to Registered Email!");
                return true;
            }
            console.warn("EmailJS send failed with HTTP", res.status);
            if (!silent) showToast("OTP email could not be sent. Please check the internet connection and try again.");
            return false;
        }).catch(err => {
            console.warn("EmailJS dispatch error:", err);
            if (!silent) showToast("OTP email could not be sent. Please check the internet connection and try again.");
            return false;
        });
    } catch (e) {
        console.warn("Relay call note:", e);
        if (!silent) showToast("OTP email could not be sent. Please check the internet connection and try again.");
        return Promise.resolve(false);
    }
}

function getStoredSmtpConfig() {
    try {
        const saved = localStorage.getItem('ghs_walton_smtp_settings');
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

function saveSmtpSettingsAction() {
    const email = (document.getElementById('settingsSmtpEmail')?.value || '').trim();
    const pass = (document.getElementById('settingsSmtpPass')?.value || '').trim();
    const config = {
        user: email,
        password: pass,
        host: 'smtp.gmail.com',
        port: 587
    };
    localStorage.setItem('ghs_walton_smtp_settings', JSON.stringify(config));
    showToast("Gmail SMTP settings saved successfully!");
}

function closeOtpModal() {
    const modal = document.getElementById('otpModal');
    if (modal) modal.classList.add('hidden');
}

function verifyOtpAndSetNewPassword(event) {
    if (event) event.preventDefault();
    const enteredOtp = (document.getElementById('otpCodeInput')?.value || '').trim();
    const newPass = (document.getElementById('otpNewPasswordInput')?.value || '').trim();
    const savedOtp = sessionStorage.getItem('ghs_walton_recovery_otp');

    if (!newPass || newPass.length < 4) {
        alert("The password must be at least 4 characters long.");
        return;
    }

    if (enteredOtp === savedOtp) {
        localStorage.setItem('ghs_walton_admin_password_v1', newPass);
        sessionStorage.removeItem('ghs_walton_recovery_otp');
        isSystemAdminUnlocked = true;
        sessionRole = 'admin';
        isChiefAdmin = true;
        saveLoginSession();
        closeOtpModal();
        alert(`Congratulations! Your new admin password has been saved successfully.\nNew Password: ${newPass}`);
        showToast("New password applied successfully!");
        if (adminPendingCallback) {
            const cb = adminPendingCallback;
            adminPendingCallback = null;
            cb();
        }
        // Startup gate: OTP recovery authenticated the user — clear the gate
        // and close the security modal that stayed open behind the OTP modal.
        if (startupLoginGateActive) { clearStartupLoginGate(); closeSecurityModal(); }
    } else {
        alert("Wrong security code (OTP)! Please enter the correct 6-digit code.");
    }
}

// ===== SECURITY: Tamper Detection + PIN Lock =====
// Protects against unauthorized script injection / modification.
// Master PIN always unlocks (Admin backup). A one-time PIN is also generated
// on tamper detection and a send is attempted to the registered email via
// the existing OTP endpoint (same as the OTP recovery system).
const SECURITY_MASTER_PIN = "Walton2026";
const SECURITY_EMAIL = "asifjaved81@gmail.com";
const SECURITY_EXPECTED_APPJS_HASH = "ad363204"; // __SECURITY_HASH_LINE__ (replaced at build time)
let securityTamperDetected = false;
let securitySessionPin = null;

function securityDjb2Hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, '0');
}

// Check app.js integrity: fetch the served file, hash it (excluding the hash
// line itself), compare with the expected hash baked in at build time.
// If fetch fails (e.g. file protocol), skip silently — do NOT lock.
function securityCheckAppIntegrity() {
    try {
        fetch('app.js').then(function (res) { return res.text(); }).then(function (text) {
            if (!text || text.length < 1000) return;
            const lines = text.split('\n').filter(function (l) { return l.indexOf('__SECURITY_HASH_LINE__') === -1; });
            const hash = securityDjb2Hash(lines.join('\n'));
            if (hash !== SECURITY_EXPECTED_APPJS_HASH) {
                securityTriggerLock('file-modified');
            }
        }).catch(function () { /* fetch unavailable — skip */ });
    } catch (e) { /* never break app on security check failure */ }
}

// Generate a one-time PIN, attempt to send it to the Admin email, show lock.
function securityTriggerLock(reason) {
    if (securityTamperDetected) return;
    securityTamperDetected = true;
    securitySessionPin = Math.floor(100000 + Math.random() * 900000).toString();
    try { sessionStorage.setItem('securityTamperPin', securitySessionPin); } catch (e) {}
    try {
        const smtpConfig = (typeof getStoredSmtpConfig === 'function') ? getStoredSmtpConfig() : {};
        // Hosted build: there is no local OTP server, so the one-time PIN is
        // sent through the web relay directly (same channel as OTP recovery).
        dispatchWebRelayOtp(SECURITY_EMAIL, securitySessionPin);
    } catch (e) {}
    try {
        const existing = JSON.parse(localStorage.getItem('securityTamperLog') || '[]');
        existing.push({ at: new Date().toISOString(), reason: reason || 'unknown' });
        localStorage.setItem('securityTamperLog', JSON.stringify(existing.slice(-20)));
    } catch (e) {}
    const lock = document.getElementById('securityLockScreen');
    if (lock) { lock.classList.remove('hidden'); lock.classList.add('flex'); }
    setupSecurityPinAutoLogin();
    const pinInput = document.getElementById('securityPinInput');
    if (pinInput) { pinInput.value = ''; setTimeout(function () { pinInput.focus(); }, 100); }
}

// Close the Forgot Master PIN recovery form and return to the main PIN entry.
// Does NOT bypass the security lock — the lock screen stays until the correct PIN is entered.
function securityCloseRecoveryForm() {
    const form = document.getElementById('securityPinRecoveryForm');
    if (form) form.classList.add('hidden');
    const sentLine = document.getElementById('securityPinSentLine');
    if (sentLine) sentLine.classList.add('hidden');
    const newPinArea = document.getElementById('securityNewPinArea');
    if (newPinArea) newPinArea.classList.add('hidden');
    const msg = document.getElementById('securityPinRecoveryMsg');
    if (msg) { msg.textContent = ''; msg.classList.add('hidden'); }
    const pinInput = document.getElementById('securityPinInput');
    if (pinInput) { pinInput.value = ''; setTimeout(function () { pinInput.focus(); }, 100); }
}

// Task 8: Close the security lock window (only shown after OTP verification).
function securityCloseLockScreen() {
    const lock = document.getElementById('securityLockScreen');
    if (lock) { lock.classList.add('hidden'); lock.classList.remove('flex'); }
    securityTamperDetected = false;
}

// ==========================================
// TASK 8: AUTO-LOGIN ON LAST CHARACTER + ENTER KEY
// Master PIN (security lock screen) — mirrors the Data Distribution
// auto-login: exact-match auto-login on input/paste/keyup/change, and
// Enter key submits whatever is typed.
// ==========================================
function setupSecurityPinAutoLogin() {
    const input = document.getElementById('securityPinInput');
    if (!input || input.dataset.autoLoginBound === '1') return;
    input.dataset.autoLoginBound = '1';
    const tryAutoLogin = function () {
        const entered = (input.value || '').trim();
        // Auto-login fires ONLY on a non-empty typed PIN matching a
        // non-empty stored PIN — never on page load, never on empty.
        if (!entered) return;
        const masterPin = securityGetMasterPin();
        if (!masterPin) return;
        let sessionPin = '';
        try { sessionPin = sessionStorage.getItem('securityTamperPin') || ''; } catch (e) {}
        if (entered === masterPin || entered === SECURITY_MASTER_PIN || entered === securitySessionPin || (sessionPin && entered === sessionPin)) {
            securityVerifyPin();
        }
    };
    input.addEventListener('input', tryAutoLogin);
    input.addEventListener('paste', function () { setTimeout(tryAutoLogin, 0); });
    input.addEventListener('keyup', tryAutoLogin);
    input.addEventListener('change', tryAutoLogin);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); securityVerifyPin(); }
    });
}

function securityVerifyPin() {
    const input = document.getElementById('securityPinInput');
    const entered = (input ? input.value : '').trim();
    const stored = (function () { try { return sessionStorage.getItem('securityTamperPin') || ''; } catch (e) { return ''; } })();
    if (entered && (entered === securityGetMasterPin() || entered === SECURITY_MASTER_PIN || entered === securitySessionPin || entered === stored)) {
        const lock = document.getElementById('securityLockScreen');
        if (lock) { lock.classList.add('hidden'); lock.classList.remove('flex'); }
        const err = document.getElementById('securityPinError');
        if (err) err.classList.add('hidden');
        securityTamperDetected = false;
    } else {
        const err = document.getElementById('securityPinError');
        if (err) err.classList.remove('hidden');
        if (input) { input.value = ''; input.focus(); }
    }
}

// ===== MASTER PIN RECOVERY via email OTP (Task 3) =====
// "Forgot Master PIN?" -> generate OTP, attempt send to Admin email via
// existing OTP endpoint -> user enters OTP -> on match, allow setting
// a NEW Master PIN (stored in localStorage; default remains Walton2026).
let securityRecoveryOtp = null;
function securityForgotMasterPin() {
    // Task 8: user must enter the registered email first. Only the exact
    // registered email receives the OTP; any other email shows an error.
    const emailInput = document.getElementById('securityRecoveryEmailInput');
    const enteredEmail = emailInput ? String(emailInput.value || '').trim().toLowerCase() : '';
    const msg = document.getElementById('securityPinRecoveryMsg');
    const form = document.getElementById('securityPinRecoveryForm');
    if (form) form.classList.remove('hidden');
    if (!enteredEmail) {
        if (msg) { msg.textContent = 'Please enter the Registered Email to receive the OTP.'; msg.classList.remove('hidden'); }
        if (emailInput) emailInput.focus();
        return;
    }
    if (enteredEmail !== String(SECURITY_EMAIL || '').toLowerCase()) {
        if (msg) { msg.textContent = 'Please enter the correct Email or contact to Admin'; msg.classList.remove('hidden'); }
        if (emailInput) { emailInput.value = ''; emailInput.focus(); }
        return;
    }
    securityRecoveryOtp = Math.floor(100000 + Math.random() * 900000).toString();
    try { sessionStorage.setItem('securityRecoveryOtp', securityRecoveryOtp); } catch (e) {}
    try {
        // Hosted build: no local OTP server - send through the EmailJS
        // relay directly, same as the admin Forgot Password flow.
        dispatchWebRelayOtp(SECURITY_EMAIL, securityRecoveryOtp);
    } catch (e) {}
    // Show the "PIN sent" line ONLY after Forgot is clicked (Task 8)
    const sentLine = document.getElementById('securityPinSentLine');
    if (sentLine) sentLine.classList.remove('hidden');
    if (msg) {
        msg.textContent = 'A PIN has been sent to Registered Email. Enter it below.';
        msg.classList.remove('hidden');
    }
    const otpInput = document.getElementById('securityRecoveryOtpInput');
    if (otpInput) { otpInput.value = ''; setTimeout(function () { otpInput.focus(); }, 100); }
}
function securityVerifyRecoveryOtp() {
    const otpInput = document.getElementById('securityRecoveryOtpInput');
    const entered = (otpInput ? otpInput.value : '').trim();
    const stored = (function () { try { return sessionStorage.getItem('securityRecoveryOtp') || ''; } catch (e) { return ''; } })();
    const msg = document.getElementById('securityPinRecoveryMsg');
    if (entered && (entered === securityRecoveryOtp || entered === stored)) {
        const newPinArea = document.getElementById('securityNewPinArea');
        if (newPinArea) newPinArea.classList.remove('hidden');
        // Task 8: after OTP verification, show X/Close to close the window
        const closeBtn = document.getElementById('securityLockCloseBtn');
        if (closeBtn) closeBtn.classList.remove('hidden');
        if (msg) { msg.textContent = 'OTP verified. Set a new Master PIN below.'; }
        const newPinInput = document.getElementById('securityNewPinInput');
        if (newPinInput) { newPinInput.value = ''; setTimeout(function () { newPinInput.focus(); }, 100); }
    } else {
        if (msg) { msg.textContent = 'Incorrect OTP. Please try again.'; }
        if (otpInput) { otpInput.value = ''; otpInput.focus(); }
    }
}
function securitySetNewMasterPin() {
    const newPinInput = document.getElementById('securityNewPinInput');
    const newPin = (newPinInput ? newPinInput.value : '').trim();
    const msg = document.getElementById('securityPinRecoveryMsg');
    if (!newPin || newPin.length < 4) {
        if (msg) { msg.textContent = 'Please enter a new Master PIN (at least 4 characters).'; }
        return;
    }
    try { localStorage.setItem('securityMasterPin', newPin); } catch (e) {}
    securityRecoveryOtp = null;
    try { sessionStorage.removeItem('securityRecoveryOtp'); } catch (e) {}
    if (msg) { msg.textContent = 'New Master PIN saved. You can now unlock with it.'; }
    const newPinArea = document.getElementById('securityNewPinArea');
    if (newPinArea) newPinArea.classList.add('hidden');
}
function securityGetMasterPin() {
    try { return localStorage.getItem('securityMasterPin') || SECURITY_MASTER_PIN; } catch (e) { return SECURITY_MASTER_PIN; }
}

// Watch for script elements injected AFTER startup (legitimate scripts all
// load before DOMContentLoaded, so anything added later is suspicious).
function securityWatchForInjection() {
    try {
        const obs = new MutationObserver(function (mutations) {
            for (let i = 0; i < mutations.length; i++) {
                const added = mutations[i].addedNodes || [];
                for (let j = 0; j < added.length; j++) {
                    if (added[j] && added[j].tagName === 'SCRIPT') {
                        securityTriggerLock('script-injection');
                        return;
                    }
                }
            }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
}

// ===== WELCOME SPLASH: fade in on open, gone within 5s total =====
// Patch 36, Task 3: the splash stays on screen for 5 seconds in total —
// the fade-out starts 1s before the end and the element is removed at 5s.
const WELCOME_SCREEN_DURATION_MS = 5000;
function initWelcomeSplash() {
    const splash = document.getElementById('welcomeSplash');
    if (!splash) return;
    setTimeout(function () { splash.classList.add('fade-out'); }, WELCOME_SCREEN_DURATION_MS - 1000);
    setTimeout(function () { if (splash.parentNode) splash.parentNode.removeChild(splash); }, WELCOME_SCREEN_DURATION_MS);
}

document.addEventListener('DOMContentLoaded', async () => {
    initGlobalTitleCase();
    initWelcomeSplash();
    await loadPersistentBackup();
    loadData();
    applySchoolInformation();
    renderMonogramInHeader();
    initDateDisplay();
    initPeriodsGrid();
    initDropdowns();

    if (!scheduleResult) {
        generateTimetableAction(true, "Initial Automatic Schedule Generation");
    } else {
        updateStats();
        renderAllViews();
    }

    renderTeachersList();
    renderClassesList();

    // Live Bell Time Active Period Tracker (Updates every second)
    updateLiveBellTimeIndicator();
    setInterval(updateLiveBellTimeIndicator, 1000);

    // Initialize Multi-PC Cloud Auto-Sync System
    initSyncSystem();
    // Security: start tamper + script-injection watch AFTER startup scripts load.
    setTimeout(function () { securityCheckAppIntegrity(); securityWatchForInjection(); }, 1500);
    // Show sync-file reminder banner on load if auto-check enabled.
    try { syncPromptOnLoad(); } catch (e) {}
    // STARTUP LOGIN GATE: after the welcome screen, the admin security
    // login MUST show and wait for the user to type (never auto-bypassed).
    // The welcome splash (z-200) covers it for ~5s, then it is visible.
    // Fix #27: a saved login session resumes without the gate after a
    // refresh; the gate only appears when there is no valid session.
    restoreLoginSession().then(function (restored) { if (!restored) ensureAdminAccess(null, true); });
});


// ===== PERMANENT PERSISTENCE: load from server-side backup file =====
// The server stores a copy of ALL app data in a fixed file (LOCALAPPDATA),
// which survives EXE rebuilds and port changes (unlike localStorage, which
// is tied to the page origin). On startup, if the backup is NEWER than the
// localStorage copy (or localStorage is empty), restore it into memory.
// The pending data is applied by loadData() below.
async function loadPersistentBackup() {
    try {
        if (!isServerMode()) return;
        const resp = await fetch('/get_backup');
        if (!resp.ok) return;
        const json = await resp.json();
        if (!json || !json.data) return;
        const backup = json.data;
        const backupTs = Number(backup.lastModifiedTimestamp || 0);
        let localTs = 0;
        try { localTs = Number(localStorage.getItem('timetableLastModified') || 0); } catch (e) {}
        // Only restore if backup is newer than localStorage (or localStorage has no timestamp).
        // If localStorage is newer, it is the source of truth — keep it.
        if (backupTs > 0 && localTs > 0 && backupTs <= localTs) return;
        if (backupTs <= 0 && localTs > 0) return;
        // Basic sanity: backup must contain at least teachers or settings.
        if (!backup.teachers && !backup.settings) return;
        window._pendingBackupData = backup;
    } catch (e) { /* backup unavailable — fall back to localStorage/DEFAULT */ }
}

// Load Data
// ---- Permanent default room numbers (Patch 29, Task 2) ----
// The user's official Class -> Room mapping (2026-10-28). The same
// numbers are baked into the built-in default classes (sample_data.js).
// This helper fills a class's room ONLY when it is empty — a room that
// has been set (by hand, by upload-preserve, or by sync) is never
// overwritten — so the defaults are permanent and never reset.
const PERMANENT_CLASS_ROOMS = { '10th|A': '202', '10th|B': '101', '10th|C': '102', '10th|D': '103', '9th|A': '201', '9th|B': '203', '9th|C': '304', '9th|D': '104', '9th|E': '105', '9th|F': '204', '8th|A': '205', '8th|B': '206', '8th|C': '207', '7th|A': '208', '7th|B': '209', '7th|C': '305', '6th|A': '401', '6th|B': '402', '6th|C': '403' };
function applyPermanentDefaultRooms() {
    (classesList || []).forEach(function (c) {
        if (!c || c.roomNo) return;
        const r = PERMANENT_CLASS_ROOMS[String(c.name || '') + '|' + String(c.section || '')];
        if (r) c.roomNo = r;
    });
}

function loadData() {
    try {
        // Apply persistent backup (from /get_backup) if one was loaded — this
        // restores the user's real data (incl. deletions) after a rebuild.
        if (window._pendingBackupData) {
            const _bk = window._pendingBackupData;
            window._pendingBackupData = null;
            if (_bk.settings) appSettings = _bk.settings;
            if (_bk.teachers) teachersList = _bk.teachers;
            if (_bk.classes) classesList = _bk.classes;
            if (_bk.scheduleResult) { scheduleResult = _bk.scheduleResult; }
            if (_bk.timetableHistory) timetableHistory = _bk.timetableHistory;
            if (_bk.staffStatement) staffStatementList = _bk.staffStatement;
            if (_bk.historyLog) historyLog = _bk.historyLog;
            if (_bk.staffColumns) staffColumnsList = _bk.staffColumns;
            if (_bk.offlineFiles) offlineFilesList = _bk.offlineFiles;
            if (_bk.fixedPeriods) fixedPeriodsList = _bk.fixedPeriods;
            if (_bk.periodGroups) periodGroupsList = _bk.periodGroups;
            if (_bk.softwareRules && Array.isArray(_bk.softwareRules.rules)) { softwareRulesState = { rules: _bk.softwareRules.rules, history: Array.isArray(_bk.softwareRules.history) ? _bk.softwareRules.history : [] }; }
            if (_bk.adminPassword) { try { localStorage.setItem('adminPassword', _bk.adminPassword); } catch (e) {} }
            applyPermanentDefaultRooms();
            // Persist the restored data into localStorage via saveData().
            try { saveData(); } catch (e) {}
            return;
        }

        const sSettings = localStorage.getItem('ghs_walton_settings_v3');
        appSettings = sSettings ? JSON.parse(sSettings) : DEFAULT_SETTINGS;

        // Universal School EMIS Code (35210051)
        appSettings.emisCode = appSettings.emisCode || "35210051";
        const emisInput = document.getElementById('settingsEmisCode');
        if (emisInput) emisInput.value = appSettings.emisCode;
        const headerEmis = document.getElementById('headerEmisDisplay');
        if (headerEmis) headerEmis.innerText = `EMIS: ${appSettings.emisCode}`;
        const staffEmis = document.getElementById('staffStatementEmisDisplay');
        if (staffEmis) staffEmis.innerText = appSettings.emisCode;

        const sTeachers = localStorage.getItem('ghs_walton_teachers_v3');
        teachersList = sTeachers ? JSON.parse(sTeachers) : DEFAULT_TEACHERS;

        // TASK 7: restore the date-wise history log.
        try { const _h = localStorage.getItem('historyLog'); if (_h) historyLog = JSON.parse(_h); } catch (e) {}

        // Auto-migrate if old dummy teachers exist
        if (!teachersList || (teachersList[0] && teachersList[0].name.includes('Muhammad Ali'))) {
            teachersList = DEFAULT_TEACHERS;
            localStorage.setItem('ghs_walton_teachers_v3', JSON.stringify(teachersList));
        }

        const sClasses = localStorage.getItem('ghs_walton_classes_v3');
        classesList = sClasses ? JSON.parse(sClasses) : DEFAULT_CLASSES;

        // Auto-migrate if old classes format
        if (!classesList || (classesList[0] && classesList[0].subjects && classesList[0].subjects[0].name === 'Mathematics' && classesList[0].subjects[0].teacherId === 'T1')) {
            classesList = DEFAULT_CLASSES;
            localStorage.setItem('ghs_walton_classes_v3', JSON.stringify(classesList));
        }

        applyPermanentDefaultRooms();
        const sSched = localStorage.getItem('ghs_walton_schedule_v3');
        if (sSched) {
            scheduleResult = JSON.parse(sSched);
            exporter = new TimetableExporter(appSettings, teachersList, classesList, scheduleResult);
        } else if (typeof DEFAULT_SCHEDULE !== 'undefined' && DEFAULT_SCHEDULE) {
            // Fix #18: a brand-new device starts from the site's
            // bundled current timetable, not an empty grid.
            scheduleResult = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
            exporter = new TimetableExporter(appSettings, teachersList, classesList, scheduleResult);
        }

        const sHistory = localStorage.getItem('ghs_walton_history_v3');
        timetableHistory = sHistory ? JSON.parse(sHistory) : [];

        try { const sFixed = localStorage.getItem('ghs_walton_fixed_periods_v1'); if (sFixed) fixedPeriodsList = JSON.parse(sFixed); } catch (e) {}
        try { const sGroups = localStorage.getItem('ghs_walton_period_groups_v1'); if (sGroups) { const parsedGroups = JSON.parse(sGroups); if (Array.isArray(parsedGroups)) { const pgSeenIds = {}; (periodGroupsList || []).forEach(g => { if (g && g.id) pgSeenIds[g.id] = true; }); parsedGroups.forEach(g => { if (g && g.id && !pgSeenIds[g.id]) periodGroupsList.push(g); }); } } } catch (e) {}

        const sStaff = localStorage.getItem('ghs_walton_staff_statement_v1');
        staffStatementList = sStaff ? JSON.parse(sStaff) : (typeof DEFAULT_STAFF_STATEMENT !== 'undefined' ? DEFAULT_STAFF_STATEMENT : []);

        const sCols = localStorage.getItem('ghs_walton_staff_cols_v1');
        staffColumnsList = sCols ? JSON.parse(sCols) : (typeof DEFAULT_STAFF_COLUMNS !== 'undefined' && Array.isArray(DEFAULT_STAFF_COLUMNS) && DEFAULT_STAFF_COLUMNS.length) ? DEFAULT_STAFF_COLUMNS.slice() : [
            "Sr. No.", "Personnel #", "Teacher Name", "Father's Name", "CNIC #", "BPS No.",
            "Designation", "Qualification", "Date of Birth", "Date of Entry into Govt. Service",
            "Date of present Scale/Grade", "Date of Joining present place  of posting",
            "Cadre", "Regular or Contract", "Date of retirement", "Job Status", "Phone/ Cell #", "Residential Address"
        ];

        // Auto-migrate if old column format has "Name with Parentage"
        if (staffColumnsList.includes("Name with Parentage")) {
            const idx = staffColumnsList.indexOf("Name with Parentage");
            staffColumnsList.splice(idx, 1, "Teacher Name", "Father's Name");
            localStorage.setItem('ghs_walton_staff_cols_v1', JSON.stringify(staffColumnsList));
        }

        // Auto-migrate Job Status column
        if (!staffColumnsList.includes("Job Status")) {
            const retIdx = staffColumnsList.indexOf("Date of retirement");
            if (retIdx !== -1) {
                staffColumnsList.splice(retIdx + 1, 0, "Job Status");
            } else {
                staffColumnsList.push("Job Status");
            }
            localStorage.setItem('ghs_walton_staff_cols_v1', JSON.stringify(staffColumnsList));
        }

        // Auto-migrate staffStatementList records to ensure "Teacher Name" and "Father's Name" exist
        staffStatementList.forEach(st => {
            if (!st['Teacher Name'] || !st["Father's Name"]) {
                const parentage = st['Name with Parentage'] || '';
                if (parentage) {
                    const m = parentage.match(/^(.*?)(?:\s+(?:S\/O|S\/o|D\/O|D\/o|W\/O|W\/o|s\/o|d\/o)\s+)(.*)$/i);
                    if (m) {
                        st['Teacher Name'] = st['Teacher Name'] || m[1].trim();
                        st["Father's Name"] = st["Father's Name"] || m[2].trim();
                    } else {
                        st['Teacher Name'] = st['Teacher Name'] || parentage.trim();
                        st["Father's Name"] = st["Father's Name"] || '';
                    }
                }
            }

            // Auto-calculate exact government service Date of Retirement: DOB + 60 Years - 1 Day
            const dob = st['Date of Birth'] || st['DOB'];
            if (dob) {
                const autoRet = calculateRetirementDate(dob);
                if (autoRet) {
                    st['Date of retirement'] = autoRet;
                }
            }
        });
        localStorage.setItem('ghs_walton_staff_statement_v1', JSON.stringify(staffStatementList));

        const sFiles = localStorage.getItem('ghs_walton_offline_files_v1');
        offlineFilesList = sFiles ? JSON.parse(sFiles) : [];

        // Sort staff by seniority on startup
        sortStaffBySeniority(staffStatementList);

        // Multi-teacher groups: teacher schedules reflect the managed
        // subjects right from startup (no edit needed first).
        if (typeof injectPeriodGroupsIntoTeacherSchedule === 'function') injectPeriodGroupsIntoTeacherSchedule();
    } catch (e) {
        console.error("Error loading data, resetting to defaults", e);
        appSettings = DEFAULT_SETTINGS;
        teachersList = DEFAULT_TEACHERS;
        classesList = DEFAULT_CLASSES;
        timetableHistory = [];
        staffStatementList = typeof DEFAULT_STAFF_STATEMENT !== 'undefined' ? DEFAULT_STAFF_STATEMENT : [];
        staffColumnsList = [
            "Sr. No.", "Personnel #", "Teacher Name", "Father's Name", "CNIC #", "BPS No.",
            "Designation", "Qualification", "Date of Birth", "Date of Entry into Govt. Service",
            "Date of present Scale/Grade", "Date of Joining present place  of posting",
            "Cadre", "Regular or Contract", "Date of retirement", "Job Status", "Phone/ Cell #", "Residential Address"
        ];
        offlineFilesList = [];
    }
}

function saveData() {
    // Fix #23: a staff (view-only) session can never save data.
    if (typeof isStaffSession === 'function' && isStaffSession()) return;
    try {
        localStorage.setItem('ghs_walton_settings_v3', JSON.stringify(appSettings));
        localStorage.setItem('ghs_walton_teachers_v3', JSON.stringify(teachersList));
        localStorage.setItem('ghs_walton_classes_v3', JSON.stringify(classesList));
        localStorage.setItem('ghs_walton_fixed_periods_v1', JSON.stringify(fixedPeriodsList));
        localStorage.setItem('ghs_walton_period_groups_v1', JSON.stringify(periodGroupsList));
        try { localStorage.setItem(SOFTWARE_RULES_STORAGE_KEY, JSON.stringify(ensureSoftwareRules())); } catch (e) {}
        if (scheduleResult) {
            localStorage.setItem('ghs_walton_schedule_v3', JSON.stringify(scheduleResult));
        }
        localStorage.setItem('ghs_walton_history_v3', JSON.stringify(timetableHistory));
        localStorage.setItem('historyLog', JSON.stringify(historyLog));
        localStorage.setItem('ghs_walton_staff_statement_v1', JSON.stringify(staffStatementList));
        localStorage.setItem('ghs_walton_staff_cols_v1', JSON.stringify(staffColumnsList));

        // Save lightweight metadata only to strictly prevent QuotaExceededError
        const metaOnlyFiles = (offlineFilesList || []).map(f => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
            uploadedDate: f.uploadedDate
        }));
        localStorage.setItem('ghs_walton_offline_files_v1', JSON.stringify(metaOnlyFiles));
    } catch (quotaErr) {
        console.warn("Storage warning (quota check):", quotaErr);
    }

    // Permanent persistence: stamp + write a server-side backup copy so a
    // future rebuild (new temp folder / new port) can restore this data.
    if (!window._applyingRemoteSync) { try { localStorage.setItem('timetableLastModified', String(Date.now())); } catch (e) {} }
    try {
        if (typeof isServerMode === 'function' && isServerMode() && typeof getFullSystemDataset === 'function') {
            fetch('/save_backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(getFullSystemDataset())
            }).catch(function () {});
        }
    } catch (e) { /* backup save is best-effort — localStorage already saved */ }


    if (typeof triggerBackgroundSync === 'function' && !window._applyingRemoteSync) {
        triggerBackgroundSync();
    }
}

// Title Case helper (Tasks 6 & 7): first letter of each word capital,
// letter after each space capital. Words that are ALL-CAPS become
// Capitalized (AHMED -> Ahmed); mixed-case words are left as-is so
// abbreviations like M.Sc / McDonald are preserved. Non-letter-leading
// tokens (CNIC, dates, phone numbers) are untouched.
// Global Designation formatting (Patch 31, Task 1): a teacher's
// Designation ALWAYS renders in UPPERCASE — form inputs, tables,
// dropdowns, slips, print and exports — through this one function.
// (Saving also stores it uppercase — Patch 30.) No other field is
// ever passed through here.
function formatDesignation(value) {
    return String(value == null ? '' : value).toUpperCase();
}

function toTitleCase(str) {
    if (typeof str !== 'string' || !str) return str;
    return str.split(' ').map(function (w) {
        if (!w) return w;
        var letters = w.replace(/[^A-Za-z]/g, '');
        if (!letters) return w;
        var first = w.charAt(0);
        if (!/[A-Za-z]/.test(first)) return w;
        if (letters === letters.toUpperCase() && letters.length > 1) {
            return first.toUpperCase() + w.slice(1).toLowerCase();
        }
        if (letters === letters.toLowerCase()) {
            return first.toUpperCase() + w.slice(1);
        }
        return w;
    }).join(' ');
}

// Global Title Case (Task 7): every typed text input auto Title-Cases on
// input. Skips password/email/phone/CNIC/date/search/numeric fields and
// inputs with their own formatters (data-no-titlecase).
function initGlobalTitleCase() {
    try {
        document.addEventListener('input', function (ev) {
            var el = ev && ev.target;
            if (!el || !el.tagName) return;
            var tag = el.tagName.toUpperCase();
            if (tag !== 'INPUT' && tag !== 'TEXTAREA') return;
            var type = (el.type || 'text').toLowerCase();
            if (['password','email','tel','number','date','time','datetime-local','month','week','url','search','color','file','range','checkbox','radio','hidden','submit','button'].indexOf(type) >= 0) return;
            if (el.hasAttribute && el.hasAttribute('data-no-titlecase')) return;
            if (el.classList && el.classList.contains('no-titlecase')) return;
            var hay = ((el.id || '') + ' ' + (el.name || '') + ' ' + (el.placeholder || '')).toLowerCase();
            if (/(cnic|mobile|phone|cell|email|password|passwd|pin|otp|date|dob|search|filter|url|emis|personnel|bps|retire|joining|expiry|code|sr\.?\s?no)/.test(hay)) return;
            if (el.id === 'teacherDesignation') {
                // Patch 31, Task 1: Designation is always UPPERCASE,
                // even while typing (never Title Case).
                var dv = el.value || '';
                var duv = dv.toUpperCase();
                if (duv !== dv) {
                    var ds = null, de = null;
                    try { ds = el.selectionStart; de = el.selectionEnd; } catch (err) {}
                    el.value = duv;
                    try { if (ds !== null && de !== null) el.setSelectionRange(ds, de); } catch (err) {}
                }
                return;
            }
            var v = el.value;
            if (typeof v !== 'string' || !v) return;
            var nv = toTitleCase(v);
            if (nv !== v) {
                var s = null, e = null;
                try { s = el.selectionStart; e = el.selectionEnd; } catch (err) {}
                el.value = nv;
                try { if (s !== null && e !== null) el.setSelectionRange(s, e); } catch (err) {}
            }
        });
    } catch (e) {}
}

// Format Live Date
function initDateDisplay() {
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-GB', options);

    const liveElem = document.getElementById('liveDateDisplay');
    if (liveElem) liveElem.innerText = dateStr;

    document.querySelectorAll('.masterPrintDate, .classPrintDate, .summaryPrintDate, .inchargePrintDate, .bellTimePrintDate, .staffStatementPrintDate, .teacherPrintDate, .classesPrintDate').forEach(el => {
        el.innerText = dateStr;
    });
}

// Inchargeship Info Helper
function getInchargeInfo(teacherId) {
    const inchargeClass = classesList.find(c => c.inchargeId === teacherId);
    if (inchargeClass) {
        return {
            isIncharge: true,
            statusText: "Yes",
            fullText: `Yes (${inchargeClass.name} - ${inchargeClass.section})`,
            className: `${inchargeClass.name} - ${inchargeClass.section}`,
            classObj: inchargeClass
        };
    }
    return {
        isIncharge: false,
        statusText: "No",
        fullText: "No",
        className: "",
        classObj: null
    };
}

// Tab Switching with Security Gate & Proper Color Preservations
function switchTab(tabId) {
    if (tabId === 'distribution') {
        // Permanent default: Data Distribution ALWAYS asks for the Admin
        // password on every open, even after the startup login.
        ensureAdminAccess(() => activateTab(tabId), false, true);
        return;
    }
    activateTab(tabId);
}

function activateTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const btnTab = btn.getAttribute('data-tab');
        btn.classList.remove('active');
        if (btnTab === 'dashboard') {
            btn.className = "tab-btn px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-white bg-orange-500 hover:bg-orange-600 font-extrabold shadow-md border border-orange-400";
        } else if (btnTab === 'distribution') {
            btn.className = "tab-btn px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-white bg-red-600 hover:bg-red-700 font-extrabold shadow-md border border-red-500";
        } else {
            btn.classList.remove('bg-blue-800', 'text-white');
            btn.classList.add('text-slate-300');
        }
    });

    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) activeContent.classList.remove('hidden');

    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        if (tabId === 'dashboard') {
            activeBtn.className = "tab-btn active px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-white bg-orange-600 ring-2 ring-orange-300 font-extrabold shadow-lg border border-orange-300";
        } else if (tabId === 'distribution') {
            activeBtn.className = "tab-btn active px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-white bg-red-700 ring-2 ring-red-300 font-extrabold shadow-lg border border-red-300";
        } else {
            activeBtn.classList.add('bg-blue-800', 'text-white');
            activeBtn.classList.remove('text-slate-300');
        }
    }

    if (tabId === 'dashboard') renderDashboardStaffViews();
    if (tabId === 'distribution') renderDataDistributionView();
    if (tabId === 'teacherwise') renderTeacherWiseCards();
    if (tabId === 'belltime') renderBellTimeView();
    if (tabId === 'summary') renderSummaryTable();
    if (tabId === 'record') renderRecordView();
    if (tabId === 'incharges') renderInchargesView();
    if (tabId === 'circular') renderStaffCircularView();
    if (tabId === 'master') renderMasterTable();
    if (tabId === 'classwise') renderClassWiseTable();
    if (tabId === 'staff-statement') renderStaffStatementView();
    if (tabId === 'substitution') renderSubstitutionView();
    if (tabId === 'nameplate') renderNamePlateView();
    if (tabId === 'download') renderOfflineFilesList();
}

// Tasks 6+7 (2026-10-20): view-switch dropdowns inside the Time Table tab
// (tab-master) and the Bell Time tab. They only call the existing
// activateTab / openEditBellTimingsModal; no data or render logic changes.
// After switching, the select resets to the tab's own default view so it is
// back in place when the user returns via the top Time Table / Bell Time tab.
function timeTableViewChanged(view) {
    // Task 6 fix: navigate to the chosen view. The same dropdown is present at
    // the top of every merged view (with that view pre-selected), so it stays
    // available for selecting the next view from wherever you are.
    if (!view) return;
    if (typeof activateTab === 'function') activateTab(view);
}
function bellTimeViewChanged(view) {
    // Task 7 fix: the same dropdown is present at the top of the Timings view
    // too (with Timing pre-selected), so it stays available for the next pick.
    if (!view) return;
    if (view === 'edit') {
        if (typeof openEditBellTimingsModal === 'function') openEditBellTimingsModal();
        return;
    }
    if (typeof activateTab === 'function') activateTab(view);
}

function updateStats() {
    const elTeachers = document.getElementById('statTotalTeachers');
    if (elTeachers) elTeachers.innerText = teachersList.length;
    const elClasses = document.getElementById('statTotalClasses');
    if (elClasses) elClasses.innerText = classesList.length;
    const totalIncharges = classesList.filter(c => c.inchargeId).length;
    const elIncharges = document.getElementById('statTotalIncharges');
    if (elIncharges) elIncharges.innerText = totalIncharges;
    const elRecords = document.getElementById('statTotalRecords');
    if (elRecords) elRecords.innerText = timetableHistory.length;
    const elSections = document.getElementById('statTotalSections');
    if (elSections) elSections.innerText = classesList.length;
}

// Active Timetable Staff Filter (Timetable teachers + Principal & Dy HM)
function getActiveTimetableStaff() {
    const timetableTeacherNames = (teachersList || []).map(t => t.name.trim().toLowerCase());

    return staffStatementList.filter(st => {
        const desig = (st['Designation'] || '').toUpperCase();
        const rawTeacherName = (st['Teacher Name'] || '').toLowerCase();
        const rawParentage = (st['Name with Parentage'] || '').toLowerCase();

        // Always include Principal
        if (desig.includes('PRINCIPAL') || rawTeacherName.includes('iftikhar ahmad') || rawParentage.includes('iftikhar ahmad')) {
            return true;
        }

        // Always include Dy. Headmaster
        if (desig.includes('DY. HEADMASTER') || desig.includes('HEADMASTER') || rawTeacherName.includes('akmal') || rawParentage.includes('akmal')) {
            return true;
        }

        // Match against timetable teachers
        const cleanName = (rawTeacherName || rawParentage.split(' s/o')[0].split(' d/o')[0]).replace(/\s+/g, ' ').trim();
        return timetableTeacherNames.some(tName => {
            const tClean = tName.replace(/\s+/g, ' ').trim();
            return cleanName.includes(tClean) || tClean.includes(cleanName);
        });
    });
}

// Direct Inline Cell Edit Handler for Staff Statement
function handleStaffCellEdit(el, originalIndex, col) {
    if (originalIndex < 0 || originalIndex >= staffStatementList.length) return;
    const newVal = el.innerText.trim();
    const oldVal = staffStatementList[originalIndex][col] || '';
    if (newVal === oldVal) return;

    staffStatementList[originalIndex][col] = newVal;
    // TASK 7: date-wise history — staff cell edited inline.
    logHistory('staffStatement', 'edit', 'Staff "' + (staffStatementList[originalIndex]['Teacher Name'] || '') + '" — "' + col + '" changed from "' + oldVal + '" to "' + newVal + '".', { staffStatement: historyClone(staffStatementList) });

    // If Teacher Name changed, synchronize universally across the entire application
    if (col === 'Teacher Name') {
        syncTeacherNameUniversally(oldVal, newVal);
    }

    localStorage.setItem('ghs_walton_staff_statement_v1', JSON.stringify(staffStatementList));

    // If critical seniority/designation column changed, refresh views
    if (col === 'Designation' || col === 'Cadre' || col.includes('Date of Entry') || col === 'BPS No.') {
        renderStaffStatementView();
        renderDashboardStaffViews();
    } else {
        updateStaffSummaryCounters();
    }
    showToast(`Change saved: ${col} = ${newVal}`);
}

// Dashboard Staff Statement & Staff Circular Views
function renderDashboardStaffViews() {
    const statementTbody = document.getElementById('dashboardStaffStatementTbody');
    const circularCol1 = document.getElementById('dashboardCircularTableCol1Tbody');
    const circularCol2 = document.getElementById('dashboardCircularTableCol2Tbody');

    // 1. Staff Statement Overview on Dashboard
    if (statementTbody) {
        const activeStaff = getActiveTimetableStaff();
        sortStaffBySeniority(activeStaff);

        statementTbody.innerHTML = activeStaff.map((st, idx) => {
            const originalIndex = staffStatementList.indexOf(st);
            const rank = getCadreRank(st);
            const badgeClass = (rank <= 3) 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : (rank === 4 ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300');

            return `
                <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-amber-50/50 transition">
                    <td class="p-2 border border-slate-300 text-center font-bold text-slate-600 bg-slate-50">${idx + 1}</td>
                    <td class="p-2 border border-slate-300 text-center font-mono text-xs text-slate-700 editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Personnel #')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to edit">${st['Personnel #'] || '-'}</td>
                    <td class="p-2 border border-slate-300 font-bold text-slate-900 whitespace-nowrap editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Name with Parentage')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to edit">${st['Name with Parentage'] || '-'}</td>
                    <td class="p-2 border border-slate-300 text-center whitespace-nowrap editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Designation')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to edit"><span class="px-2 py-0.5 rounded font-bold text-[10px] ${badgeClass}">${st['Designation'] || '-'}</span></td>
                    <td class="p-2 border border-slate-300 text-center font-bold text-blue-900 editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'BPS No.')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to edit">${st['BPS No.'] || '-'}</td>
                    <td class="p-2 border border-slate-300 whitespace-nowrap text-slate-700 text-xs editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Qualification')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to edit">${st['Qualification'] || '-'}</td>
                    <td class="p-2 border border-slate-300 text-center font-extrabold text-purple-950 bg-purple-50 whitespace-nowrap editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Date of Entry into Govt. Service')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to edit">${st['Date of Entry into Govt. Service'] || '-'}</td>
                    <td class="p-2 border border-slate-300 whitespace-nowrap text-slate-700 text-xs editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Phone/ Cell #')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to edit">${st['Phone/ Cell #'] || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    // 2. Staff Circular Preview on Dashboard
    if (circularCol1 && circularCol2) {
        const list = (typeof DEFAULT_CIRCULAR_STAFF !== 'undefined' && DEFAULT_CIRCULAR_STAFF.length > 0)
            ? DEFAULT_CIRCULAR_STAFF
            : teachersList.map(t => ({ combinedName: `${t.name} (${formatDesignation(t.designation) || 'Teacher'})`, designation: formatDesignation(t.designation) }));

        const sstList = [];
        const estList = [];

        list.forEach((t, idx) => {
            const desig = (t.designation || '').toUpperCase();
            if (desig.includes('SST') || desig.includes('S.S.T') || desig.includes('HEADMASTER') || idx < 15) {
                sstList.push(t);
            } else {
                estList.push(t);
            }
        });

        circularCol1.innerHTML = sstList.map((item, idx) => `
            <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
                <td class="p-1 border border-slate-700 font-bold text-slate-900 text-[11px] leading-tight">
                    <span class="text-blue-900 font-black mr-1">${idx + 1}.</span> ${item.combinedName || item.name}
                </td>
                <td class="p-1 border border-slate-700 text-center h-6"></td>
            </tr>
        `).join('');

        circularCol2.innerHTML = estList.map((item, idx) => `
            <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
                <td class="p-1 border border-slate-700 font-bold text-slate-900 text-[11px] leading-tight">
                    <span class="text-blue-900 font-black mr-1">${idx + 1}.</span> ${item.combinedName || item.name}
                </td>
                <td class="p-1 border border-slate-700 text-center h-6"></td>
            </tr>
        `).join('');
    }
}

function renderAllViews() {
    renderDashboardStaffViews();
    renderDataDistributionView();
    renderTeacherWiseCards();
    renderBellTimeView();
    renderSummaryTable();
    renderRecordView();
    renderInchargesView();
    renderStaffCircularView();
    renderMasterTable();
    renderClassWiseTable();
    renderStaffStatementView();
    renderOfflineFilesList();
    try { initStickyHScrollbars(); } catch (e) {}
    try { if (isStaffSession()) applyRoleUi(); } catch (e) {}
}

// Fix #23 Task 2: sticky horizontal scroll strip for the two widest
// views only — the Staff Statement table and the Full Time Table. The
// strip stays pinned to the bottom of the screen while its table is on
// screen, so the full data can be scrolled left/right from anywhere
// instead of travelling to the very end of the table first.
let _stickyHScrollRegistry = [];
function _ensureStickyHScrollStyle() {
    if (document.getElementById('stickyHScrollStyle')) return;
    const st = document.createElement('style');
    st.id = 'stickyHScrollStyle';
    st.textContent = '.sticky-hscroll{position:sticky;bottom:0;z-index:30;overflow-x:auto;overflow-y:hidden;height:18px;background:#f1f5f9;border-top:2px solid #cbd5e1}.sticky-hscroll>div{height:1px}@media print{.sticky-hscroll{display:none!important}}';
    document.head.appendChild(st);
}
function setupStickyHScroll(scroller) {
    if (!scroller) return;
    if (scroller.dataset.stickyBound === '1') { refreshStickyHScroll(scroller); return; }
    scroller.dataset.stickyBound = '1';
    _ensureStickyHScrollStyle();
    const bar = document.createElement('div');
    bar.className = 'sticky-hscroll';
    bar.style.display = 'none';
    const inner = document.createElement('div');
    bar.appendChild(inner);
    scroller.insertAdjacentElement('afterend', bar);
    let syncing = false;
    scroller.addEventListener('scroll', function () { if (syncing) return; syncing = true; bar.scrollLeft = scroller.scrollLeft; syncing = false; }, { passive: true });
    bar.addEventListener('scroll', function () { if (syncing) return; syncing = true; scroller.scrollLeft = bar.scrollLeft; syncing = false; }, { passive: true });
    scroller._stickyBar = bar;
    scroller._stickyInner = inner;
    _stickyHScrollRegistry.push(scroller);
    refreshStickyHScroll(scroller);
}
function refreshStickyHScroll(scroller) {
    if (!scroller || !scroller._stickyBar) return;
    scroller._stickyInner.style.width = scroller.scrollWidth + 'px';
    scroller._stickyBar.style.display = (scroller.scrollWidth > scroller.clientWidth + 4) ? 'block' : 'none';
    scroller._stickyBar.scrollLeft = scroller.scrollLeft;
}
function initStickyHScrollbars() {
    const master = document.getElementById('printable-master-area');
    if (master) setupStickyHScroll(master);
    const staffTable = document.getElementById('staffStatementMainTable');
    if (staffTable && staffTable.parentElement) setupStickyHScroll(staffTable.parentElement);
    _stickyHScrollRegistry.forEach(refreshStickyHScroll);
}
window.addEventListener('resize', function () { try { _stickyHScrollRegistry.forEach(refreshStickyHScroll); } catch (e) {} });

// ==========================================
// AUTO-ARCHIVE ENGINE (SINGLE ENTRY PER DAY)
// ==========================================
function archiveCurrentSchedule(changeReason = "Timetable Update") {
    if (!scheduleResult) return;

    const now = new Date();
    const today = now.toLocaleDateString('en-GB'); // e.g. "19/09/2026"
    const displayDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + " at " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const snapshot = {
        id: "REC_" + Date.now(),
        timestamp: now.toISOString(),
        displayDate: displayDate,
        dateOnly: today,
        reason: changeReason,
        scheduleData: JSON.parse(JSON.stringify(scheduleResult)),
        teachersSnapshot: JSON.parse(JSON.stringify(teachersList)),
        classesSnapshot: JSON.parse(JSON.stringify(classesList))
    };

    // Single entry per date: if entry for today already exists, update it rather than duplicating
    const existingIndex = timetableHistory.findIndex(h => h.dateOnly === today);
    if (existingIndex >= 0) {
        timetableHistory[existingIndex] = snapshot;
    } else {
        timetableHistory.unshift(snapshot); // newest first
    }

    if (timetableHistory.length > 50) timetableHistory.pop(); // keep last 50 versions
    saveData();
    updateStats();
}

// Generate Timetable Action

// ---- Prompt #3 Task 6: Appearance & Customization ----
// Settings are stored on THIS PC only (localStorage 'ghsw_appearance_v1').
const APPEARANCE_FONTS = ['Arial', 'Calibri', 'Verdana', 'Tahoma', 'Segoe UI', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Comic Sans MS', 'Poppins'];
const APPEARANCE_TABS = ['dashboard', 'master', 'download', 'distribution', 'staff-statement', 'circular', 'record', 'substitution', 'nameplate', 'belltime'];
const APPEARANCE_TAB_RENDERS = { dashboard: 'renderDashboardStaffViews', master: 'renderMasterTable', download: 'renderOfflineFilesList', distribution: 'renderDataDistributionView', 'staff-statement': 'renderStaffStatementView', circular: 'renderStaffCircularView', record: 'renderRecordView', substitution: 'renderSubstitutionView', nameplate: 'renderNamePlateView', belltime: 'renderBellTimeView' };
let appearanceSettings = (function () {
    try {
        const s = JSON.parse(localStorage.getItem('ghsw_appearance_v1') || 'null');
        if (s && typeof s === 'object') return Object.assign({ font: 'Arial', tab3d: false, colors: {}, labels: {}, hidden: [], merges: {} }, s);
    } catch (e) {}
    return { font: 'Arial', tab3d: false, colors: {}, labels: {}, hidden: [], merges: {} };
})();
const appearanceSectionHomes = {};
function saveAppearanceSettings() {
    try { localStorage.setItem('ghsw_appearance_v1', JSON.stringify(appearanceSettings)); } catch (e) {}
    if (!window._applyingRemoteSync && typeof triggerBackgroundSync === 'function') { try { triggerBackgroundSync(); } catch (e) {} }
}
function getTabButton(id) { return document.querySelector('.tab-btn[data-tab="' + id + '"]'); }
function getTabSection(id) { return document.getElementById('tab-' + id); }
function appearanceTabDisplayName(id) {
    const btn = getTabButton(id);
    if (!btn) return id;
    if (btn.dataset.origLabel) return btn.dataset.origLabel;
    const span = btn.querySelector('span');
    return span ? span.textContent : id;
}
function appearanceRestoreMergedSections() {
    Object.keys(appearanceSectionHomes).forEach(function (srcId) {
        const home = appearanceSectionHomes[srcId];
        const sec = getTabSection(srcId);
        if (!sec || !home || !home.parent) return;
        if (sec.parentElement !== home.parent) {
            if (home.next && home.next.parentElement === home.parent) home.parent.insertBefore(sec, home.next);
            else home.parent.appendChild(sec);
        }
        sec.classList.add('tab-content');
        sec.classList.add('hidden');
        sec.classList.remove('merged-tab-section');
    });
}
function applyAppearanceSettings() {
    const s = appearanceSettings;
    // A) Global font — one dynamic style; Nastaliq stays first so the exempt
    // Urdu header line keeps its face, Font Awesome keeps its icon font.
    let st = document.getElementById('appearanceFontStyle');
    if (!st) { st = document.createElement('style'); st.id = 'appearanceFontStyle'; document.head.appendChild(st); }
    const font = 'Arial'; // Patch 29, Task 3: Arial is the global font for the entire application — a saved per-PC font choice no longer overrides it.
    st.textContent = "* { font-family: 'Noto Nastaliq Urdu', '" + font + "', Arial, sans-serif !important; }\n.fa, .fas, .far, .fab, .fa-solid, .fa-regular, .fa-brands, [class^=\"fa-\"], [class*=\" fa-\"] { font-family: 'Font Awesome 6 Free', 'Font Awesome 6 Brands' !important; }";
    // B) 3D effect on the tab bar.
    const anyBtn = document.querySelector('.tab-btn[data-tab]');
    if (anyBtn && anyBtn.parentElement) anyBtn.parentElement.classList.toggle('appearance-3d', !!s.tab3d);
    // D) Un-merge everything first, then re-apply the saved merges.
    appearanceRestoreMergedSections();
    // B/C) Labels, colours, hide.
    APPEARANCE_TABS.forEach(function (id) {
        const btn = getTabButton(id);
        if (!btn) return;
        const span = btn.querySelector('span');
        if (span) {
            if (!btn.dataset.origLabel) btn.dataset.origLabel = span.textContent;
            span.textContent = s.labels[id] || btn.dataset.origLabel;
        }
        if (s.colors[id]) { btn.style.background = s.colors[id]; btn.style.color = '#ffffff'; }
        else { btn.style.background = ''; btn.style.color = ''; }
        btn.style.display = (s.hidden || []).indexOf(id) >= 0 ? 'none' : '';
    });
    // D) Merges: move the source section inside the target section.
    const merges = s.merges || {};
    Object.keys(merges).forEach(function (targetId) {
        const targetSec = getTabSection(targetId);
        if (!targetSec) return;
        (merges[targetId] || []).forEach(function (srcId) {
            if (srcId === 'distribution' || srcId === targetId) return;
            const srcSec = getTabSection(srcId);
            if (!srcSec) return;
            if (!appearanceSectionHomes[srcId]) {
                appearanceSectionHomes[srcId] = { parent: srcSec.parentElement, next: srcSec.nextSibling };
            }
            srcSec.classList.remove('tab-content', 'hidden');
            srcSec.classList.add('merged-tab-section');
            targetSec.appendChild(srcSec);
            const b = getTabButton(srcId);
            if (b) b.style.display = 'none';
        });
    });
    // Fix #24: this function resets every tab button's display, which
    // used to resurrect the staff-hidden Control Panel tab a little
    // after login. Re-assert the role UI whenever it runs.
    try { if (typeof isStaffSession === 'function' && isStaffSession()) applyRoleUi(); } catch (e) {}
}
function buildAppearanceSettingsUI() {
    const sel = document.getElementById('appearanceFontSelect');
    if (sel) {
        if (!sel.options.length) {
            APPEARANCE_FONTS.forEach(function (f) {
                const o = document.createElement('option');
                o.value = f; o.textContent = f;
                sel.appendChild(o);
            });
        }
        sel.value = 'Arial';
        sel.disabled = true; // Patch 29, Task 3: the global font is Arial for the whole application.
        sel.title = 'The global application font is Arial';
    }
    const tgl = document.getElementById('appearance3dToggle');
    if (tgl) tgl.checked = !!appearanceSettings.tab3d;
    const rows = document.getElementById('appearanceTabRows');
    if (rows) {
        rows.innerHTML = APPEARANCE_TABS.map(function (id) {
            const label = (appearanceSettings.labels[id] || '').replace(/"/g, '&quot;');
            const color = appearanceSettings.colors[id] || '';
            const hidden = (appearanceSettings.hidden || []).indexOf(id) >= 0 ? 'checked' : '';
            return '<div class="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5">' +
                '<span class="font-bold text-slate-700 w-28 truncate">' + appearanceTabDisplayName(id) + '</span>' +
                '<input type="text" placeholder="New name (blank = original)" value="' + label + '" onchange="appearanceLabelChanged(\'' + id + '\', this.value)" class="flex-1 min-w-[120px] border border-slate-300 rounded px-2 py-1">' +
                '<input type="color" value="' + (color || '#1e40af') + '" onchange="appearanceColorChanged(\'' + id + '\', this.value)" class="w-9 h-7 p-0 border border-slate-300 rounded" title="Tab button colour">' +
                '<button type="button" onclick="appearanceColorChanged(\'' + id + '\', \'\')" class="text-[10px] font-bold text-slate-500 underline">reset colour</button>' +
                '<label class="flex items-center gap-1 font-bold text-slate-600"><input type="checkbox" ' + hidden + ' onchange="appearanceHiddenChanged(\'' + id + '\', this.checked)" class="w-3.5 h-3.5"> Hide</label>' +
            '</div>';
        }).join('');
    }
    const opts = APPEARANCE_TABS.map(function (id) { return '<option value="' + id + '">' + appearanceTabDisplayName(id) + '</option>'; }).join('');
    const srcSel = document.getElementById('appearanceMergeSource');
    const tgtSel = document.getElementById('appearanceMergeTarget');
    if (srcSel) srcSel.innerHTML = opts;
    if (tgtSel) tgtSel.innerHTML = opts;
    const list = document.getElementById('appearanceMergeList');
    if (list) {
        const merges = appearanceSettings.merges || {};
        const items = [];
        Object.keys(merges).forEach(function (t) {
            (merges[t] || []).forEach(function (src) {
                items.push('<div class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1"><span class="font-bold text-slate-700">' + appearanceTabDisplayName(src) + ' merged into ' + appearanceTabDisplayName(t) + '</span><button type="button" onclick="appearanceMergeRemove(\'' + t + '\', \'' + src + '\')" class="ml-auto text-[10px] font-bold text-red-600 underline">Unmerge</button></div>');
            });
        });
        list.innerHTML = items.length ? items.join('') : '<p class="text-[10px] text-slate-400">No merged tabs.</p>';
    }
}
function appearanceFontChanged(v) { appearanceSettings.font = v || 'Arial'; saveAppearanceSettings(); applyAppearanceSettings(); }
function appearance3dChanged(checked) { appearanceSettings.tab3d = !!checked; saveAppearanceSettings(); applyAppearanceSettings(); }
function appearanceLabelChanged(id, v) {
    v = String(v || '').trim();
    if (v) appearanceSettings.labels[id] = v; else delete appearanceSettings.labels[id];
    saveAppearanceSettings(); applyAppearanceSettings(); buildAppearanceSettingsUI();
}
function appearanceColorChanged(id, v) {
    if (v) appearanceSettings.colors[id] = v; else delete appearanceSettings.colors[id];
    saveAppearanceSettings(); applyAppearanceSettings(); buildAppearanceSettingsUI();
}
function appearanceHiddenChanged(id, checked) {
    const h = appearanceSettings.hidden || (appearanceSettings.hidden = []);
    const i = h.indexOf(id);
    if (checked && i < 0) h.push(id);
    if (!checked && i >= 0) h.splice(i, 1);
    saveAppearanceSettings(); applyAppearanceSettings();
}
function appearanceMergeAdd() {
    const src = (document.getElementById('appearanceMergeSource') || {}).value;
    const tgt = (document.getElementById('appearanceMergeTarget') || {}).value;
    if (!src || !tgt || src === tgt) { showToast('Please choose two different tabs to merge.'); return; }
    if (src === 'distribution') { showToast('Data Distribution cannot be merged (it is password protected).'); return; }
    const merges = appearanceSettings.merges || (appearanceSettings.merges = {});
    if (merges[src]) { showToast('This tab already has tabs merged into it - unmerge those first.'); return; }
    let already = false;
    Object.keys(merges).forEach(function (t) { if ((merges[t] || []).indexOf(src) >= 0) already = true; });
    if (already) { showToast('This tab is already merged into another tab.'); return; }
    if (!merges[tgt]) merges[tgt] = [];
    merges[tgt].push(src);
    saveAppearanceSettings(); applyAppearanceSettings(); buildAppearanceSettingsUI();
    showToast('Tabs merged. Open the "' + appearanceTabDisplayName(tgt) + '" tab to see both.');
}
function appearanceMergeRemove(tgt, src) {
    const merges = appearanceSettings.merges || {};
    if (merges[tgt]) {
        merges[tgt] = merges[tgt].filter(function (x) { return x !== src; });
        if (!merges[tgt].length) delete merges[tgt];
    }
    saveAppearanceSettings(); applyAppearanceSettings(); buildAppearanceSettingsUI();
}
function appearanceResetAll() {
    if (!confirm('Reset all appearance settings (font, colours, names, hidden and merged tabs) to default?')) return;
    appearanceSettings = { font: 'Arial', tab3d: false, colors: {}, labels: {}, hidden: [], merges: {} };
    saveAppearanceSettings(); applyAppearanceSettings(); buildAppearanceSettingsUI();
    showToast('Appearance reset to default.');
}
// When a tab with merged tabs inside it is opened, also render the merged
// tabs' views so their content is fresh.
if (typeof activateTab === 'function') {
    const _activateTabForAppearance = activateTab;
    activateTab = function (tabId) {
        _activateTabForAppearance(tabId);
        try {
            const m = (appearanceSettings && appearanceSettings.merges) || {};
            (m[tabId] || []).forEach(function (srcId) {
                const fnName = APPEARANCE_TAB_RENDERS[srcId];
                const fn = fnName ? window[fnName] : null;
                if (typeof fn === 'function') fn();
            });
        } catch (e) {}
    };
}
document.addEventListener('DOMContentLoaded', function () {
    try { applyAppearanceSettings(); buildAppearanceSettingsUI(); } catch (e) {}
});

// ---- Prompt #3 Task 7: Auto Adjust Time Table ----
// Class-level band of a class record: 9th/10th = 'senior', 6th-8th =
// 'elementary', anything else = 'other'.
function autoAdjustClassBand(cls) {
    const n = parseInt(String((cls && cls.name) || '').replace(/[^0-9]/g, ''), 10);
    if (n >= 9) return 'senior';
    if (n >= 6) return 'elementary';
    return 'other';
}
// ---- Patch 27, Task 1: designation bands + priority + workload ----
// Subject matching helpers: names are normalised (letters only, lower
// case) and combined subjects ("Bio / Computer") are tested per part,
// so abbreviations like Bio/Chem/Phy/Eng match their full names.
const AA_SUBJ_ABBR = { bio: 'biology', chem: 'chemistry', phy: 'physics', eng: 'english', comp: 'computer', maths: 'math', mathematics: 'math' };
function aaNormSubject(s) { return String(s || '').replace(/[^a-z]/gi, '').toLowerCase(); }
function aaSubjectParts(name) {
    return String(name || '').split('/').map(function (x) { const n = aaNormSubject(x); return AA_SUBJ_ABBR[n] || n; }).filter(Boolean);
}
function aaPartMatches(part, target) {
    return part === target || part.startsWith(target) || target.startsWith(part);
}
// Category for the Auto Adjust bands only: PST counts with EST. The
// shared getTeacherCategory is untouched (substitution keeps its rules).
function aaCategoryOf(teacher) {
    const cat = (typeof getTeacherCategory === 'function') ? getTeacherCategory(teacher.designation || '') : 'OTHER';
    if (cat !== 'OTHER') return cat;
    const norm = String(teacher.designation || '').replace(/[^a-z]/gi, '').toLowerCase();
    if (/^pst/.test(norm)) return 'EST';
    return 'OTHER';
}
// Band rules (Task 1.3): SST strictly 9th/10th; EST/PST strictly
// 6th-8th, EXCEPT in 9th/10th when the subject is Physics, Chemistry,
// Biology, English or Math; PET strictly 9th/10th and only for
// Health & Physical Education.
const AA_SENIOR_EXCEPTION_SUBJECTS = ['physics', 'chemistry', 'biology', 'english', 'math'];
function autoAdjustBandFilter(teacher, cls, subjectName) {
    const cat = aaCategoryOf(teacher);
    const band = autoAdjustClassBand(cls);
    if (cat === 'SST') return band === 'senior';
    if (cat === 'EST') {
        if (band === 'elementary') return true;
        if (band === 'senior') {
            const parts = aaSubjectParts(subjectName);
            return parts.some(function (p) { return AA_SENIOR_EXCEPTION_SUBJECTS.some(function (e) { return aaPartMatches(p, e); }); });
        }
        return false;
    }
    if (cat === 'PET') {
        if (band !== 'senior') return false;
        const parts = aaSubjectParts(subjectName);
        return parts.some(function (p) { return p === 'physicaleducation' || p === 'healthphysicaleducation'; });
    }
    return true;
}
// Priority tier for placement order (lower = placed first): in 9th/10th
// SST lessons win over EST/PST exception lessons, which win over others.
function aaLessonTier(teacher, cls, subjectName) {
    const cat = aaCategoryOf(teacher);
    const band = autoAdjustClassBand(cls);
    if (band === 'senior') {
        if (cat === 'SST') return 0;
        if (cat === 'EST' || cat === 'PET') return 1;
        return 2;
    }
    if (band === 'elementary') {
        if (cat === 'EST') return 0;
        return 1;
    }
    return 0;
}
// Workload alignment (Task 1.2, decision B1): a lesson may only be
// generated when its subject is among the teacher's subjects in
// Teachers & Workload. A teacher with NO subjects written there is not
// filtered (there is nothing to filter against).
function aaWorkloadAllows(teacher, subjectName) {
    const subs = (teacher.subjects || []).map(function (s) { const n = aaNormSubject(s); return AA_SUBJ_ABBR[n] || n; }).filter(Boolean);
    if (!subs.length) return true;
    const parts = aaSubjectParts(subjectName);
    return parts.some(function (p) { return subs.some(function (w) { return aaPartMatches(p, w); }); });
}
function autoAdjustTimetable() {
    openAutoAdjustModal();
}

// Compact signature of a generated timetable, used to prove that Auto
// Shuffling produced a different arrangement from the current one.
function aaScheduleSignature(cs) {
    if (!cs) return '';
    return Object.keys(cs).sort().map(function (cid) {
        const row = cs[cid] || {};
        return Object.keys(row).sort(function (a, b) { return a - b; }).map(function (pid) {
            const l = row[pid];
            return l ? (l.teacherId + ':' + l.subjectName) : '-';
        }).join(',');
    }).join('|');
}

// ---- Auto Shuffling (Patch 27; REBUILT in Patch 29 — user's decisions
// Q1/Q2/Q3 = 1/1/1): shuffles the CURRENT timetable, whether it was
// auto-generated or manually uploaded. Only Periods 2-8 move:
//  - Period 1 is locked for the Class Incharge. If it is already the
//    incharge's period it stays EXACTLY the same (teacher + subject);
//    if it is not, one of the incharge's own periods from Periods 2-8
//    is moved into Period 1 (one-time fix — after that it never
//    changes again). Class Incharges themselves never change.
//  - Every class keeps exactly its own lessons and every teacher keeps
//    exactly the same total periods; only the arrangement changes.
//  - Zero clashes (backtracking over the existing lessons), teachers'
//    designated free periods honoured, frozen periods never move and
//    multi-teacher group occupancy is respected.
// If no clash-free rearrangement exists, nothing is changed.
function computeShuffledSchedule(fixedConstraints, groupConstraints) {
    const periods = (appSettings && appSettings.periods) || [];
    if (periods.length < 2 || !scheduleResult || !scheduleResult.classSchedule) return null;
    const p1 = periods[0].id;
    const restIds = periods.slice(1).map(function (p) { return p.id; });
    const classById = {};
    (classesList || []).forEach(function (c) { classById[c.id] = c; });
    const teacherFree = {};
    (teachersList || []).forEach(function (t) { teacherFree[t.id] = new Set(t.freePeriods || []); });
    const frozenKeys = new Set((fixedConstraints || []).map(function (fc) { return fc.classId + '|' + fc.periodId; }));
    const groupBusy = new Set((groupConstraints || []).map(function (gc) { return gc.teacherId + '|' + gc.periodId; }));
    const cur = scheduleResult.classSchedule;
    const notes = [];
    let movedP1 = 0;

    // Phase A (deterministic): lock Period 1 + frozen slots, collect the
    // pool of lessons that may move (Periods 2-8 of each class).
    const locked = {};
    const pool = [];
    const openSlots = {};
    Object.keys(cur).forEach(function (cid) {
        locked[cid] = {};
        openSlots[cid] = [];
        const row = cur[cid] || {};
        const cls = classById[cid];
        const inchargeId = cls ? (cls.inchargeId || '') : '';
        const cname = cls ? (cls.name + '-' + (cls.section || '')) : cid;
        periods.forEach(function (p) {
            const l = row[p.id];
            if (l && frozenKeys.has(cid + '|' + p.id)) locked[cid][p.id] = l;
        });
        const p1Lesson = row[p1] || null;
        if (locked[cid][p1]) {
            if (inchargeId && p1Lesson && p1Lesson.teacherId !== inchargeId) {
                notes.push(cname + ': Period 1 is frozen with another teacher, so it could not be given to the Class Incharge');
            }
        } else if (p1Lesson && inchargeId && p1Lesson.teacherId === inchargeId) {
            locked[cid][p1] = p1Lesson; // already the incharge's — never changes
        } else if (inchargeId) {
            let candPid = null;
            for (const pid of restIds) {
                const l = row[pid];
                if (l && l.teacherId === inchargeId && !locked[cid][pid]) { candPid = pid; break; }
            }
            const inchargeBusyP1 = groupBusy.has(inchargeId + '|' + p1);
            const inchargeFreeP1 = !!(teacherFree[inchargeId] && teacherFree[inchargeId].has(p1));
            if (candPid !== null && !inchargeBusyP1 && !inchargeFreeP1) {
                locked[cid][p1] = row[candPid];
                movedP1++;
                if (p1Lesson) pool.push({ classId: cid, lesson: p1Lesson });
            } else {
                if (p1Lesson) locked[cid][p1] = p1Lesson;
                const hasOwn = (p1Lesson && p1Lesson.teacherId === inchargeId) || restIds.some(function (pid) { const l = row[pid]; return l && l.teacherId === inchargeId; });
                if (!hasOwn) notes.push(cname + ': the Class Incharge has no period in this class, so Period 1 could not be given to them');
                else if (inchargeFreeP1) notes.push(cname + ': the Class Incharge has Period 1 marked free, so Period 1 was left unchanged');
                else if (inchargeBusyP1) notes.push(cname + ': the Class Incharge is busy in Period 1 (multi-teacher group), so Period 1 was left unchanged');
                else notes.push(cname + ': the Class Incharge\'s own period in this class is frozen, so Period 1 was left unchanged');
            }
        } else if (p1Lesson) {
            locked[cid][p1] = p1Lesson; // no incharge set — Period 1 unchanged
        }
        restIds.forEach(function (pid) {
            if (locked[cid][pid]) return;
            openSlots[cid].push(pid);
            const l = row[pid];
            if (l && locked[cid][p1] !== l) pool.push({ classId: cid, lesson: l });
        });
    });

    // Teacher occupancy that can never take a shuffled lesson.
    const baseBusy = new Set(groupBusy);
    Object.keys(locked).forEach(function (cid) {
        Object.keys(locked[cid]).forEach(function (pid) {
            const l = locked[cid][pid];
            if (l) baseBusy.add(l.teacherId + '|' + pid);
        });
    });

    // Phase B: backtracking assignment of the pool into the open slots,
    // fresh random order per attempt; a different arrangement wins.
    const prevSig = aaScheduleSignature(cur);
    let lastResult = null;
    for (let attempt = 0; attempt < 5; attempt++) {
        const busy = new Set(baseBusy);
        const assign = {};
        Object.keys(locked).forEach(function (cid) {
            assign[cid] = {};
            openSlots[cid].forEach(function (pid) { assign[cid][pid] = null; });
        });
        const items = pool.slice();
        for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = items[i]; items[i] = items[j]; items[j] = t; }
        const placedFlags = new Array(items.length).fill(false);
        let nodes = 0;
        const NODE_BUDGET = 80000;
        const legalSlots = function (item) {
            const out = [];
            for (const pid of openSlots[item.classId]) {
                if (assign[item.classId][pid] !== null) continue;
                if (busy.has(item.lesson.teacherId + '|' + pid)) continue;
                if (teacherFree[item.lesson.teacherId] && teacherFree[item.lesson.teacherId].has(pid)) continue;
                out.push(pid);
            }
            return out;
        };
        const dfs = function () {
            if (++nodes > NODE_BUDGET) return false;
            let best = -1, bestOpts = null;
            for (let i = 0; i < items.length; i++) {
                if (placedFlags[i]) continue;
                const opts = legalSlots(items[i]);
                if (opts.length === 0) return false;
                if (bestOpts === null || opts.length < bestOpts.length) { best = i; bestOpts = opts; if (opts.length === 1) break; }
            }
            if (best < 0) return true;
            const item = items[best];
            const opts = bestOpts.slice();
            for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
            placedFlags[best] = true;
            for (const pid of opts) {
                assign[item.classId][pid] = item.lesson;
                busy.add(item.lesson.teacherId + '|' + pid);
                if (dfs()) return true;
                assign[item.classId][pid] = null;
                busy.delete(item.lesson.teacherId + '|' + pid);
                if (nodes > NODE_BUDGET) { placedFlags[best] = false; return false; }
            }
            placedFlags[best] = false;
            return false;
        };
        if (!dfs()) continue;

        const classSchedule = {}, teacherSchedule = {}, masterSchedule = {};
        Object.keys(cur).forEach(function (cid) {
            classSchedule[cid] = {};
            masterSchedule[cid] = {};
            periods.forEach(function (p) {
                let l = null;
                if (locked[cid][p.id]) l = locked[cid][p.id];
                else if (assign[cid] && assign[cid][p.id]) l = assign[cid][p.id];
                const full = l ? Object.assign({}, l, { periodId: p.id, startTime: p.startTime, endTime: p.endTime }) : null;
                classSchedule[cid][p.id] = full;
                masterSchedule[cid][p.id] = full;
            });
        });
        (teachersList || []).forEach(function (t) {
            teacherSchedule[t.id] = {};
            periods.forEach(function (p) { teacherSchedule[t.id][p.id] = null; });
        });
        Object.keys(classSchedule).forEach(function (cid) {
            periods.forEach(function (p) {
                const l = classSchedule[cid][p.id];
                if (l && teacherSchedule[l.teacherId]) teacherSchedule[l.teacherId][p.id] = l;
            });
        });
        // Multi-teacher group entries keep their place on the slips.
        (groupConstraints || []).forEach(function (gc) {
            if (!teacherSchedule[gc.teacherId]) return;
            if (teacherSchedule[gc.teacherId][gc.periodId] !== null) return;
            const oldRow = (scheduleResult.teacherSchedule || {})[gc.teacherId] || {};
            const oldEntry = oldRow[gc.periodId];
            if (oldEntry && !oldEntry.isFree) teacherSchedule[gc.teacherId][gc.periodId] = oldEntry;
        });
        (teachersList || []).forEach(function (t) {
            periods.forEach(function (p) {
                if (teacherSchedule[t.id][p.id] === null) {
                    teacherSchedule[t.id][p.id] = { isFree: true, isOfficialFree: teacherFree[t.id] ? teacherFree[t.id].has(p.id) : false, periodId: p.id, startTime: p.startTime, endTime: p.endTime, roomNo: 'Staff Room' };
                }
            });
        });
        const result = { success: true, masterSchedule: masterSchedule, classSchedule: classSchedule, teacherSchedule: teacherSchedule, droppedLessons: [], quotaDroppedLessons: [], workloadDroppedLessons: [] };
        lastResult = result;
        if (aaScheduleSignature(classSchedule) !== prevSig) {
            return { result: result, notes: notes, movedP1: movedP1, sameAsBefore: false };
        }
    }
    if (lastResult) return { result: lastResult, notes: notes, movedP1: movedP1, sameAsBefore: true };
    return null;
}

function autoShuffleTimetable() {
    if (!classesList || !classesList.length) { showToast('No classes found.'); return; }
    if (!scheduleResult || !scheduleResult.classSchedule) { alert('No timetable found yet. Generate or Upload a timetable first, then Auto Shuffling will rearrange it.'); return; }
    const fpCheck = (typeof getActiveFixedConstraints === 'function') ? getActiveFixedConstraints() : { constraints: [], errors: [] };
    if (fpCheck.errors && fpCheck.errors.length) { alert("Auto Shuffling cannot run because of Fixed (Frozen) Periods:\n• " + fpCheck.errors.join("\n• ") + "\n\nUnfreeze or fix them from View Fixed Periods."); return; }
    const gpCheck = (typeof getGroupConstraints === 'function') ? getGroupConstraints() : { constraints: [], errors: [] };
    if (gpCheck.errors && gpCheck.errors.length) { alert("Auto Shuffling cannot run because of Multi-Teacher Groups:\n• " + gpCheck.errors.join("\n• ") + "\n\nFix them from Manage Multi Teachers."); return; }
    if (!confirm('Auto Shuffling will rearrange Periods 2 to 8 of the CURRENT timetable (generated or uploaded).\n\nPeriod 1 stays locked for the Class Incharge and incharges never change. Every class keeps its own lessons and every teacher keeps the same total periods; frozen periods stay fixed; the result is always zero-clash.\nYour current timetable is saved first - the Undo button above restores it.\n\nContinue?')) return;
    uploadedTimetableBaseline = JSON.parse(JSON.stringify(classesList));
    saveUploadedTimetableBaseline();
    archiveCurrentSchedule('Auto Shuffling');
    const outcome = computeShuffledSchedule(fpCheck.constraints, gpCheck.constraints);
    if (!outcome) { alert('Auto Shuffling could not find a clash-free rearrangement, so your timetable has NOT been changed.'); return; }
    let p1Fix = null;
    if (ruleEnabled('enforceInchargeFirstPeriod', true)) {
        p1Fix = enforceInchargeFirstPeriod(outcome.result, fpCheck.constraints, gpCheck.constraints);
        if (p1Fix && outcome.notes) {
            const mentioned = new Set();
            [...p1Fix.swapped, ...p1Fix.repaired, ...p1Fix.problems].forEach(function (x) { mentioned.add(String(x).split(' (')[0].split(':')[0]); });
            outcome.notes = outcome.notes.filter(function (n) { return !mentioned.has(String(n).split(':')[0]); });
        }
    }
    scheduleResult = outcome.result;
    exporter = new TimetableExporter(appSettings, teachersList, classesList, scheduleResult);
    saveData();
    updateStats();
    renderAllViews();
    let msg = 'Auto Shuffling complete! Periods 2 to 8 have been rearranged with zero teacher clashes. Period 1 stayed locked for the Class Incharges, incharges are unchanged, and every teacher has exactly the same total periods as before.';
    if (outcome.movedP1 > 0) msg += '\n\nPeriod 1 was given to the Class Incharge in ' + outcome.movedP1 + ' class(es) where it was not theirs before - it will stay locked from now on.';
    if (outcome.sameAsBefore) msg += '\n\nNote: only one clash-free arrangement was possible for Periods 2-8, so the timetable looks the same.';
    if (p1Fix && p1Fix.repaired.length) msg += '\n\nPeriod 1 was set to the Class Incharge (subject unchanged) for:\n' + p1Fix.repaired.map(function (x) { return '- ' + x; }).join('\n');
    if (p1Fix && p1Fix.problems.length) msg += '\n\nPeriod 1 could NOT be given to the Class Incharge for:\n' + p1Fix.problems.map(function (x) { return '- ' + x; }).join('\n');
    if (outcome.notes && outcome.notes.length) msg += '\n\nPeriod 1 notes:\n' + outcome.notes.map(function (n) { return '- ' + n; }).join('\n');
    msg += '\n\nYour previous timetable is safe: the Undo button above restores it, and a copy was also saved in Time Table Record.';
    alert(msg);
    switchTab('teacherwise');
}

// ---- Auto Adjust: per-teacher periods settings (Patch 22, Task 1) ----
// Clicking Auto Adjust first opens a list: for every teacher, set how many
// of the 8 periods will be auto-generated (dropdown). The rest stay FREE.
// Settings persist on this PC so they do not have to be set every time.
function aaStoredQuotas() {
    try { return JSON.parse(localStorage.getItem('ghsw_auto_adjust_quotas_v1') || '{}'); } catch (e) { return {}; }
}
function aaAssignedCount(teacherId) {
    let n = 0;
    (classesList || []).forEach(c => (c.subjects || []).forEach(s => {
        if (s && s.teacherId === teacherId && s.name && s.name !== '-') n++;
    }));
    return n;
}
function openAutoAdjustModal() {
    if (!classesList || !classesList.length) { showToast('No classes found.'); return; }
    const stored = aaStoredQuotas();
    const rows = (teachersList || []).map((t, i) => {
        const assigned = aaAssignedCount(t.id);
        const def = (stored[t.id] !== undefined) ? Math.max(0, Math.min(8, stored[t.id])) : Math.min(assigned, 8);
        const opts = Array.from({ length: 9 }, (_, n) => `<option value="${n}" ${n === def ? 'selected' : ''}>${n}</option>`).join('');
        return `<tr class="${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
            <td class="p-2.5 text-center font-bold text-slate-600">${i + 1}</td>
            <td class="p-2.5 font-black text-slate-900">${t.name}</td>
            <td class="p-2.5 text-center font-bold text-slate-700">${(t.designation || '-').toUpperCase()}</td>
            <td class="p-2.5 text-center font-bold text-indigo-700">${assigned} Periods</td>
            <td class="p-2.5 text-center"><select data-aa-teacher="${t.id}" onchange="aaQuotaChanged(this)" class="border-2 border-red-400 rounded-lg px-2 py-1 text-xs font-black text-slate-900 bg-white focus:ring-2 focus:ring-red-500">${opts}</select></td>
            <td class="p-2.5 text-center font-bold text-amber-700" id="aaFree-${t.id}">${8 - def} Free</td>
        </tr>`;
    }).join('');
    document.getElementById('autoAdjustTeacherRows').innerHTML = rows;
    // Set Class Incharges (Patch 25): one row per class with an Incharge
    // dropdown; the current incharge is preselected.
    const sortedTeachers = [...(teachersList || [])].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
    const irows = (classesList || []).map((c, i) => {
        const opts = ['<option value="">- No Incharge -</option>'].concat(
            sortedTeachers.map(t => `<option value="${t.id}" ${t.id === c.inchargeId ? 'selected' : ''}>${t.name}</option>`)).join('');
        return `<tr class="${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
            <td class="p-2.5 text-center font-bold text-slate-600">${i + 1}</td>
            <td class="p-2.5 font-black text-slate-900">${c.name} - ${c.section}</td>
            <td class="p-2.5 text-center font-extrabold text-emerald-800">${c.roomNo || '-'}</td>
            <td class="p-2.5"><select data-aa-incharge="${c.id}" class="w-full border-2 border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-red-500">${opts}</select></td>
        </tr>`;
    }).join('');
    document.getElementById('autoAdjustInchargeRows').innerHTML = irows;
    document.getElementById('autoAdjustModal').classList.remove('hidden');
}
// Applies the modal's incharge selections ({classId: teacherId}) to the
// classes. Returns how many incharges actually changed.
function aaApplyIncharges(selections) {
    let changed = 0;
    (classesList || []).forEach(c => {
        if (selections && Object.prototype.hasOwnProperty.call(selections, c.id)) {
            const v = selections[c.id] || '';
            if ((c.inchargeId || '') !== v) { c.inchargeId = v; changed++; }
        }
    });
    return changed;
}
function aaQuotaChanged(sel) {
    const cell = document.getElementById('aaFree-' + sel.getAttribute('data-aa-teacher'));
    if (cell) cell.innerText = (8 - parseInt(sel.value || '0', 10)) + ' Free';
}
// Auto Set Equal Periods (Patch 24): one selection sets every teacher's
// Periods to Generate at once; rows stay individually editable afterwards.
function aaApplyEqualPeriods(sel) {
    if (!sel || sel.value === '') return;
    const n = sel.value;
    document.querySelectorAll('[data-aa-teacher]').forEach(rowSel => {
        rowSel.value = n;
        aaQuotaChanged(rowSel);
    });
    sel.value = '';
}
function closeAutoAdjustModal() {
    document.getElementById('autoAdjustModal').classList.add('hidden');
}
function confirmAutoAdjust() {
    const quotas = {};
    document.querySelectorAll('[data-aa-teacher]').forEach(sel => {
        quotas[sel.getAttribute('data-aa-teacher')] = parseInt(sel.value || '0', 10);
    });
    const inchargeSelections = {};
    document.querySelectorAll('[data-aa-incharge]').forEach(sel => {
        inchargeSelections[sel.getAttribute('data-aa-incharge')] = sel.value || '';
    });
    try { localStorage.setItem('ghsw_auto_adjust_quotas_v1', JSON.stringify(quotas)); } catch (e) {}
    // Save the pre-generate classes as the Undo baseline FIRST, so the
    // existing Undo button restores the timetable AND the incharges exactly
    // as they are now.
    uploadedTimetableBaseline = JSON.parse(JSON.stringify(classesList));
    saveUploadedTimetableBaseline();
    // Set Class Incharges: apply the modal's selections — every view (Full
    // Time Table, Class Incharges, slips) reads the class incharge from here.
    const inchChanged = aaApplyIncharges(inchargeSelections);
    if (inchChanged > 0) {
        saveData();
        renderAllViews();
        renderDataDistributionView();
    }
    closeAutoAdjustModal();
    const _qVals = Object.values(quotas);
    const equalPeriods = (_qVals.length && _qVals.every(function (v) { return v === _qVals[0]; }) && _qVals[0] > 0) ? _qVals[0] : 0;
    generateTimetableAction(false, 'Auto Adjust Time Table', { autoBands: true, teacherQuotas: quotas, equalPeriods: equalPeriods });
}


// ======================================================================
// Patch 32 (2026-10-30) — user's 5-task spec, decisions Q1=2, Q2=1,
// Q3=yes, Q4=recommendation, Q5=1:
//   Task 3: Workload-Driven Allocation for Auto Adjust.
//   Task 1: Auto Set Equal Periods = strict (hard) quotas.
//   Task 2: Period 1 hard-locked for the Class Incharge (validation +
//           swap / repair after Auto Adjust and Auto Shuffling).
//   Task 5: Software Rules Engine — the tabs below read these rules.
// ======================================================================

// ---- Task 3: Workload-Driven Allocation -------------------------------
// Every class subject (the demand, from Subject Allocation / Periods
// Detail) is assigned to a teacher who has that subject in Teachers &
// Workload. Choice order: designation priority tier for the class band,
// then the class's own Incharge, then the Subject Allocation teacher,
// then workload balance (fewest lessons so far), then name. The Subject
// Allocation teacher is overridden (user's Q1 = 2). Subjects with NO
// workload-matched teacher keep their allocation teacher and are
// reported; subjects frozen in the Freeze feature are never reassigned.
// In strict Equal mode (hardCap) quotas are hard caps for allocation
// too; a subject nobody can take under the caps is left unassigned and
// reported. Returns teacher overrides for the scheduler, keyed by
// "classId|subjectIndex" ('' means: do not place this subject).
const AA_ALLOC_ABBR = { gsc: 'generalscience', phyedu: 'physicaleducation', tq: 'teachingofholyquran', hpe: 'physicaleducation' };
function aaAllocParts(name) {
    return aaSubjectParts(name).map(function (p) { return AA_ALLOC_ABBR[p] || p; });
}
function aaAllocMatch(a, b) {
    return aaPartMatches(a, b) || (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a)));
}
function aaTeacherQualifiedFor(teacher, subjectName) {
    const demandParts = aaAllocParts(subjectName);
    if (!demandParts.length) return false;
    const profParts = [];
    (teacher.subjects || []).forEach(function (s) {
        aaAllocParts(s).forEach(function (p) { profParts.push(p); });
    });
    if (!profParts.length) return false;
    return demandParts.some(function (dp) {
        return profParts.some(function (pp) { return aaAllocMatch(dp, pp); });
    });
}
function aaKeyLess(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] < b[i]) return true;
        if (a[i] > b[i]) return false;
    }
    return false;
}
function allocateWorkloadDriven(quotas, hardCap, fixedConstraints) {
    // Patch 37: blank-subject constraints are NOT class subjects — they
    // never mark a demand as frozen (the non-blank filter also stops a
    // 'classId|' key from colliding with a demand whose name normalises
    // to ''). They are counted in the teacher's load further below.
    const frozenSubj = new Set((fixedConstraints || []).filter(function (fc) { return !!aaNormSubject(fc.subjectName); }).map(function (fc) { return fc.classId + '|' + aaNormSubject(fc.subjectName); }));
    const demands = [];
    (classesList || []).forEach(function (c) {
        (c.subjects || []).forEach(function (s, sIdx) {
            if (!s || !s.name || s.name === '-' || !s.teacherId) return;
            demands.push({ cls: c, sIdx: sIdx, subjectName: s.name, planTeacherId: s.teacherId, candidates: null });
        });
    });
    demands.forEach(function (d) {
        d.candidates = (teachersList || []).filter(function (t) { return aaTeacherQualifiedFor(t, d.subjectName); });
    });
    const order = demands.map(function (d, i) { return i; }).sort(function (a, b) {
        return (demands[a].candidates.length - demands[b].candidates.length) || (a - b);
    });
    const load = {};
    (teachersList || []).forEach(function (t) { load[t.id] = 0; });
    const totalPeriods = (typeof appSettings !== 'undefined' && appSettings && appSettings.periods) ? appSettings.periods.length : 8;
    const physCap = {};
    (teachersList || []).forEach(function (t) { physCap[t.id] = Math.max(0, totalPeriods - (t.freePeriods || []).length); });
    const capOf = function (tid) {
        const q = (quotas && quotas[tid] !== undefined && quotas[tid] !== null) ? quotas[tid] : Infinity;
        const p = (physCap[tid] !== undefined) ? physCap[tid] : Infinity;
        return Math.min(q, p);
    };
    const overrides = {};
    const fallback = [];
    const unassigned = [];
    let overridden = 0;
    // Patch 37: a period fixed with a BLANK subject still occupies its
    // teacher (the scheduler pre-places it from fixedConstraints), so it
    // counts toward the teacher's placed periods here — allocation caps
    // must leave room for it.
    (fixedConstraints || []).forEach(function (fc) {
        if (!aaNormSubject(fc.subjectName) && load[fc.teacherId] !== undefined) load[fc.teacherId] += 1;
    });
    function pick(d, ignoreCaps) {
        let best = null, bestKey = null;
        d.candidates.forEach(function (t) {
            if (load[t.id] >= (physCap[t.id] !== undefined ? physCap[t.id] : Infinity)) return;
            if (!ignoreCaps && load[t.id] >= capOf(t.id)) return;
            const key = [
                aaLessonTier(t, d.cls, d.subjectName),
                (d.cls.inchargeId === t.id) ? 0 : 1,
                (d.planTeacherId === t.id) ? 0 : 1,
                load[t.id],
                String(t.name || '')
            ];
            if (!bestKey || aaKeyLess(key, bestKey)) { best = t; bestKey = key; }
        });
        return best;
    }
    order.forEach(function (i) {
        const d = demands[i];
        const key = d.cls.id + '|' + d.sIdx;
        if (frozenSubj.has(d.cls.id + '|' + aaNormSubject(d.subjectName))) {
            load[d.planTeacherId] = (load[d.planTeacherId] || 0) + 1;
            return; // frozen subject: allocation teacher stays
        }
        if (!d.candidates.length) {
            const fbCap = hardCap ? capOf(d.planTeacherId) : (physCap[d.planTeacherId] !== undefined ? physCap[d.planTeacherId] : Infinity);
            if ((load[d.planTeacherId] || 0) >= fbCap) {
                overrides[key] = '';
                unassigned.push(d);
                return;
            }
            fallback.push(d);
            load[d.planTeacherId] = (load[d.planTeacherId] || 0) + 1;
            return;
        }
        let chosen = pick(d, false);
        if (!chosen && !hardCap) chosen = pick(d, true);
        if (!chosen) {
            overrides[key] = '';
            unassigned.push(d);
            return;
        }
        overrides[key] = chosen.id;
        if (chosen.id !== d.planTeacherId) overridden++;
        load[chosen.id] = (load[chosen.id] || 0) + 1;
    });
    // Task 2 support: every Class Incharge should hold at least one of
    // his own class's subjects (so Period 1 can be his). If allocation
    // gave him none but he is qualified for a subject in the class, move
    // one such subject to him (from its current teacher).
    let reservedIncharge = 0;
    (classesList || []).forEach(function (c) {
        const inc = c.inchargeId;
        if (!inc) return;
        const incTeacher = (teachersList || []).find(function (t) { return t.id === inc; });
        if (!incTeacher) return;
        const assigneeOf = function (d) {
            const k = d.cls.id + '|' + d.sIdx;
            return Object.prototype.hasOwnProperty.call(overrides, k) ? overrides[k] : d.planTeacherId;
        };
        const mine = demands.filter(function (d) { return d.cls === c && assigneeOf(d) === inc; });
        if (mine.length) return;
        if ((load[inc] || 0) >= capOf(inc)) return;
        const cands = demands.filter(function (d) {
            return d.cls === c
                && !frozenSubj.has(c.id + '|' + aaNormSubject(d.subjectName))
                && assigneeOf(d) !== ''
                && aaTeacherQualifiedFor(incTeacher, d.subjectName);
        });
        if (!cands.length) return;
        cands.sort(function (a, b) {
            const pa = (a.planTeacherId === inc) ? 0 : 1, pb = (b.planTeacherId === inc) ? 0 : 1;
            if (pa !== pb) return pa - pb;
            return (load[assigneeOf(b)] || 0) - (load[assigneeOf(a)] || 0);
        });
        const d = cands[0];
        const prev = assigneeOf(d);
        overrides[d.cls.id + '|' + d.sIdx] = inc;
        if (prev && prev !== inc) load[prev] = Math.max(0, (load[prev] || 0) - 1);
        load[inc] = (load[inc] || 0) + 1;
        reservedIncharge++;
    });
    return {
        overrides: overrides,
        overridden: overridden,
        fallback: fallback,
        unassigned: unassigned,
        reservedIncharge: reservedIncharge,
        examples: demands.filter(function (d) {
            const k = d.cls.id + '|' + d.sIdx;
            return Object.prototype.hasOwnProperty.call(overrides, k) && overrides[k] && overrides[k] !== d.planTeacherId;
        }).slice(0, 12)
    };
}

// ---- Task 2: Period 1 hard lock (validation + repair) -----------------
// Runs on a finished result (Auto Adjust or Shuffling). For every class:
// Period 1 must be taught by the Class Incharge. If the Incharge has a
// period of his own in the class (Periods 2-8), it is SWAPPED into
// Period 1 (the old Period 1 lesson takes that period). If he has no
// period in the class, Period 1 keeps its subject and its teacher is
// set to the Incharge (user's Q2 = 1). Anything physically impossible
// (Incharge busy in Period 1 elsewhere, Period 1 frozen with another
// teacher, Incharge's Period 1 marked free) is reported, never forced
// through a clash. Teacher schedules are rebuilt afterwards.
function rebuildResultTeacherSchedule(result, groupConstraints) {
    const periods = (appSettings && appSettings.periods) || [];
    const teacherFree = {};
    (teachersList || []).forEach(function (t) { teacherFree[t.id] = new Set(t.freePeriods || []); });
    const ts = {};
    (teachersList || []).forEach(function (t) {
        ts[t.id] = {};
        periods.forEach(function (p) { ts[t.id][p.id] = null; });
    });
    Object.keys(result.classSchedule || {}).forEach(function (cid) {
        periods.forEach(function (p) {
            const l = result.classSchedule[cid][p.id];
            if (l && ts[l.teacherId]) ts[l.teacherId][p.id] = l;
        });
    });
    (groupConstraints || []).forEach(function (gc) {
        if (!ts[gc.teacherId] || ts[gc.teacherId][gc.periodId] !== null) return;
        const oldRow = (result.teacherSchedule || {})[gc.teacherId] || {};
        const oldEntry = oldRow[gc.periodId];
        if (oldEntry && !oldEntry.isFree) ts[gc.teacherId][gc.periodId] = oldEntry;
    });
    (teachersList || []).forEach(function (t) {
        periods.forEach(function (p) {
            if (ts[t.id][p.id] === null) {
                ts[t.id][p.id] = { isFree: true, isOfficialFree: teacherFree[t.id] ? teacherFree[t.id].has(p.id) : false, periodId: p.id, startTime: p.startTime, endTime: p.endTime, roomNo: 'Staff Room' };
            }
        });
    });
    result.teacherSchedule = ts;
}
function enforceInchargeFirstPeriod(result, fixedConstraints, groupConstraints) {
    const notes = { swapped: [], repaired: [], problems: [], freeOverrides: [] };
    if (!result || !result.classSchedule) return notes;
    const periods = (appSettings && appSettings.periods) || [];
    if (!periods.length) return notes;
    const p1 = periods[0].id;
    const teacherById = {};
    (teachersList || []).forEach(function (t) { teacherById[t.id] = t; });
    const classById = {};
    (classesList || []).forEach(function (c) { classById[c.id] = c; });
    const frozenAt = new Set((fixedConstraints || []).map(function (fc) { return fc.classId + '|' + fc.periodId; }));
    const groupBusy = new Set((groupConstraints || []).map(function (gc) { return gc.teacherId + '|' + gc.periodId; }));
    const busy = new Set(groupBusy);
    Object.keys(result.teacherSchedule || {}).forEach(function (tid) {
        const row = result.teacherSchedule[tid] || {};
        Object.keys(row).forEach(function (pid) {
            const e = row[pid];
            if (e && !e.isFree) busy.add(tid + '|' + pid);
        });
    });
    const cs = result.classSchedule;
    const markedFree = function (tid, pid) {
        const t = teacherById[tid];
        return !!(t && (t.freePeriods || []).includes(pid));
    };
    function setLesson(cid, pid, lesson) {
        cs[cid][pid] = lesson;
        if (result.masterSchedule && result.masterSchedule[cid]) result.masterSchedule[cid][pid] = lesson;
    }
    function withPeriod(lesson, p) {
        return Object.assign({}, lesson, { periodId: p.id, startTime: p.startTime, endTime: p.endTime });
    }
    // Rescue: the Incharge is busy at Period 1 with a lesson in a class
    // where he is NOT the incharge — swap that lesson with a later
    // lesson of the same class whose teacher can take Period 1 there,
    // freeing the Incharge for his own class. His own classes' Period 1
    // lessons are never moved.
    function rescueBusyAtP1(inc, exceptClassId) {
        const cids = Object.keys(cs);
        for (const cid of cids) {
            if (cid === exceptClassId) continue;
            const cls = classById[cid];
            if (cls && cls.inchargeId === inc) continue;
            const row = cs[cid];
            if (!row) continue;
            const his = row[p1];
            if (!his || his.teacherId !== inc) continue;
            if (frozenAt.has(cid + '|' + p1)) continue;
            for (const p of periods.slice(1)) {
                const other = row[p.id];
                if (!other || other.teacherId === inc) continue;
                if (frozenAt.has(cid + '|' + p.id)) continue;
                if (busy.has(other.teacherId + '|' + p1)) continue;
                if (markedFree(other.teacherId, p1)) continue;
                if (markedFree(inc, p.id)) continue;
                setLesson(cid, p1, withPeriod(other, periods[0]));
                setLesson(cid, p.id, withPeriod(his, p));
                busy.delete(other.teacherId + '|' + p.id);
                busy.add(other.teacherId + '|' + p1);
                busy.add(inc + '|' + p.id);
                return true;
            }
        }
        return false;
    }
    (classesList || []).forEach(function (cls) {
        const inc = cls.inchargeId;
        if (!inc || !teacherById[inc]) return;
        const row = cs[cls.id];
        if (!row) return;
        const cname = cls.name + '-' + (cls.section || '');
        const incName = teacherById[inc].name;
        const L1 = row[p1];
        if (L1 && L1.teacherId === inc) return;
        if (frozenAt.has(cls.id + '|' + p1)) {
            notes.problems.push(cname + ': Period 1 is frozen with another teacher, so it could not be given to the Class Incharge (' + incName + ')');
            return;
        }
        if (groupBusy.has(inc + '|' + p1)) {
            notes.problems.push(cname + ': the Class Incharge (' + incName + ') has a multi-teacher group period at Period 1, so Period 1 was left unchanged');
            return;
        }
        // Patch 33 (user's "hardcore" instruction): the Incharge's own
        // free-period marking does NOT veto Period 1 of his own class.
        const incFreeP1 = markedFree(inc, p1);
        if (busy.has(inc + '|' + p1)) {
            if (rescueBusyAtP1(inc, cls.id)) busy.delete(inc + '|' + p1);
        }
        let done = false;
        if (!busy.has(inc + '|' + p1)) {
            // 1) Swap with one of the Incharge's own lessons (Periods 2-8).
            for (const p of periods.slice(1)) {
                const l = row[p.id];
                if (!l || l.teacherId !== inc || frozenAt.has(cls.id + '|' + p.id)) continue;
                if (L1) {
                    if (markedFree(L1.teacherId, p.id)) continue;
                    if (busy.has(L1.teacherId + '|' + p.id)) continue;
                }
                setLesson(cls.id, p1, withPeriod(l, periods[0]));
                setLesson(cls.id, p.id, L1 ? withPeriod(L1, p) : null);
                busy.delete(inc + '|' + p.id);
                busy.add(inc + '|' + p1);
                if (L1) { busy.delete(L1.teacherId + '|' + p1); busy.add(L1.teacherId + '|' + p.id); }
                notes.swapped.push(cname);
                if (incFreeP1) notes.freeOverrides.push(cname + ' (' + incName + ')');
                done = true;
                break;
            }
            if (!done && L1) {
                // 2) Q2 = 1 repair: Period 1 keeps its subject; its
                // teacher becomes the Class Incharge.
                setLesson(cls.id, p1, Object.assign({}, L1, { teacherId: inc }));
                busy.delete(L1.teacherId + '|' + p1);
                busy.add(inc + '|' + p1);
                notes.repaired.push(cname + ' (Period 1 subject "' + L1.subjectName + '" now taught by the Class Incharge, ' + incName + ')');
                if (incFreeP1) notes.freeOverrides.push(cname + ' (' + incName + ')');
                done = true;
            }
            if (!done && !L1) {
                // 3) Period 1 is empty and the Incharge has no lesson
                // in the class: place one of his Assigned Subjects for
                // this class (Subject Allocation) that is not placed
                // yet — per the user's Q2 addition.
                const placed = new Set();
                periods.forEach(function (pp) { const x = row[pp.id]; if (x) placed.add(aaNormSubject(x.subjectName)); });
                const planSubs = (cls.subjects || []).filter(function (s) { return s && s.name && s.name !== '-' && !placed.has(aaNormSubject(s.name)); });
                const pickSub = planSubs.find(function (s) { return s.teacherId === inc; })
                    || planSubs.find(function (s) { return aaTeacherQualifiedFor(teacherById[inc], s.name); });
                if (pickSub) {
                    setLesson(cls.id, p1, { classId: cls.id, className: cls.name, section: cls.section || '', roomNo: cls.roomNo || '', subjectName: pickSub.name, teacherId: inc, periodId: p1, startTime: periods[0].startTime, endTime: periods[0].endTime });
                    busy.add(inc + '|' + p1);
                    notes.repaired.push(cname + ' (Period 1 was empty — the Incharge\'s assigned subject "' + pickSub.name + '" was placed for the Class Incharge, ' + incName + ')');
                    if (incFreeP1) notes.freeOverrides.push(cname + ' (' + incName + ')');
                    done = true;
                }
            }
        }
        if (!done) {
            if (busy.has(inc + '|' + p1)) notes.problems.push(cname + ': the Class Incharge (' + incName + ') is busy in Period 1 in another class and could not be freed, so Period 1 was left unchanged');
            else notes.problems.push(cname + ': Period 1 could not be given to the Class Incharge (' + incName + ')');
        }
    });
    rebuildResultTeacherSchedule(result, groupConstraints);
    return notes;
}

// ---- Patch 33: fill empty class periods after Auto Adjust ------------
// For every still-empty class period, try the class's own unplaced
// subjects (in plan order) with the teacher chosen for them (workload
// allocation, else Subject Allocation). A fill is made only when the
// teacher is genuinely free in that period (not busy, not marked free)
// and, in strict Equal mode, still under the strict limit — so the
// result stays zero-clash and the strict count stays exact.
function fillEmptyClassPeriods(result, groupConstraints, teacherForSubject, strictCap) {
    const filled = [];
    const stillEmpty = [];
    if (!result || !result.classSchedule) return { filled: filled, stillEmpty: stillEmpty };
    const periods = (appSettings && appSettings.periods) || [];
    if (!periods.length) return { filled: filled, stillEmpty: stillEmpty };
    const teacherById = {};
    (teachersList || []).forEach(function (t) { teacherById[t.id] = t; });
    const busy = new Set();
    Object.keys(result.teacherSchedule || {}).forEach(function (tid) {
        const row = result.teacherSchedule[tid] || {};
        Object.keys(row).forEach(function (pid) {
            const e = row[pid];
            if (e && !e.isFree) busy.add(tid + '|' + pid);
        });
    });
    const counts = {};
    Object.keys(result.teacherSchedule || {}).forEach(function (tid) {
        const row = result.teacherSchedule[tid] || {};
        let n = 0;
        Object.values(row).forEach(function (l) { if (l && !l.isFree) n++; });
        counts[tid] = n;
    });
    const markedFree = function (tid, pid) {
        const t = teacherById[tid];
        return !!(t && (t.freePeriods || []).includes(pid));
    };
    (classesList || []).forEach(function (cls) {
        const row = result.classSchedule[cls.id];
        if (!row) return;
        const cname = cls.name + '-' + (cls.section || '');
        const placed = new Set();
        periods.forEach(function (p) { const x = row[p.id]; if (x) placed.add(aaNormSubject(x.subjectName)); });
        const unplaced = [];
        (cls.subjects || []).forEach(function (s, sIdx) {
            if (s && s.name && s.name !== '-' && !placed.has(aaNormSubject(s.name))) unplaced.push({ s: s, sIdx: sIdx });
        });
        periods.forEach(function (p) {
            if (row[p.id]) return;
            let doneFill = false;
            for (const u of unplaced) {
                if (placed.has(aaNormSubject(u.s.name))) continue;
                const tid = teacherForSubject(cls, u.s, u.sIdx);
                if (!tid || !teacherById[tid]) continue;
                if (busy.has(tid + '|' + p.id)) continue;
                if (markedFree(tid, p.id)) continue;
                if (strictCap && strictCap[tid] !== undefined && (counts[tid] || 0) >= strictCap[tid]) continue;
                const lesson = { classId: cls.id, className: cls.name, section: cls.section || '', roomNo: cls.roomNo || '', subjectName: u.s.name, teacherId: tid, periodId: p.id, startTime: p.startTime, endTime: p.endTime };
                row[p.id] = lesson;
                if (result.masterSchedule && result.masterSchedule[cls.id]) result.masterSchedule[cls.id][p.id] = lesson;
                busy.add(tid + '|' + p.id);
                counts[tid] = (counts[tid] || 0) + 1;
                placed.add(aaNormSubject(u.s.name));
                filled.push(cname + ' Period ' + p.id + ': ' + u.s.name + ' (' + teacherById[tid].name + ')');
                doneFill = true;
                break;
            }
            if (!doneFill) stillEmpty.push(cname + ' Period ' + p.id);
        });
    });
    rebuildResultTeacherSchedule(result, groupConstraints);
    return { filled: filled, stillEmpty: stillEmpty };
}


// ---- Task 5: Software Rules Engine ------------------------------------
// Rules are data, never code: the Code/Config of a rule is a JSON
// object, parsed with JSON.parse only (no eval, no script execution).
// The tabs read the ACTIVE rules through the helpers below; every read
// falls back to the software's previous built-in behaviour when a rule
// is missing, inactive or invalid, so the software can never break
// because of a rule. Rules + their Undo history save and sync with the
// rest of the software data (user's Q5 = 1), so all PCs share them.
const SOFTWARE_RULES_STORAGE_KEY = 'ghsw_software_rules_v1';
const DEFAULT_SOFTWARE_RULES = [
    { id: 'sr_timetable_workload', key: 'workloadDrivenAllocation', tab: 'Timetable', core: true, status: 'Active',
      name: 'Workload-Driven Teacher Allocation',
      description: 'Auto Adjust assigns every class subject to a teacher who has that subject in Teachers & Workload, using Designation priority, Class Incharge / section preference and workload balance. When Inactive, each subject keeps the exact teacher selected in Subject Allocation.',
      config: { enabled: true } },
    { id: 'sr_timetable_strict_equal', key: 'strictEqualPeriods', tab: 'Timetable', core: true, status: 'Active',
      name: 'Auto Set Equal Periods — Strict Limit',
      description: 'When every teacher is set to the same number N with Auto Set Equal Periods, N is a strict limit: teacher-wise slips show exactly N teaching periods and the limit is never increased to fill classes. When Inactive, limits stay preferred (they may be increased when a class would otherwise stay incomplete).',
      config: { enabled: true } },
    { id: 'sr_timetable_p1_lock', key: 'enforceInchargeFirstPeriod', tab: 'Timetable', core: true, status: 'Active',
      name: 'Period 1 Locked for Class Incharge',
      description: 'After Auto Adjust and Auto Shuffling, every class is validated: Period 1 must be taught by the Class Incharge (swapped with his own period, or the Period 1 teacher is set to the Incharge when he has no period in the class). Cases that are physically impossible are reported, never forced through a clash.',
      config: { enabled: true } },
    { id: 'sr_nameplate_gap', key: 'nameplateTileGapMm', tab: 'Class Name Plate', core: true, status: 'Active',
      name: 'A4 Plate Tiling Gap (mm)',
      description: 'Gap in millimetres between small plates (CNIC / Passport size) when they are tiled on an A4 sheet for printing. Changing it changes how many plates fit on one sheet.',
      config: { gapMm: 5 } },
    { id: 'sr_nameplate_fill', key: 'nameplateFillSheetSingle', tab: 'Class Name Plate', core: true, status: 'Active',
      name: 'Single Class Plate Fills the Sheet',
      description: 'When a single class/section plate is shown at a small size (CNIC / Passport), the A4 sheet is filled with copies of that plate. When Inactive, only one copy is shown.',
      config: { enabled: true } },
    { id: 'sr_substitution_causes', key: 'substitutionLeaveCauses', tab: 'Teacher Substitution', core: true, status: 'Active',
      name: 'Leave Causes List',
      description: 'The list of leave causes used in Teacher Substitution — the cause dropdown and the substitution summaries are built from this list.',
      config: { causes: ['C-Leave', 'Medical Leave', 'BISE Exam Duty', 'Training', 'Sports Activities', 'School Official Work', 'Hygenic Problem', 'SBA Exam Duty', 'Hajj Leave', 'Maternity Leave', 'Paternity Leave', 'Umrah Leave', 'Short Leave', 'Earned Leave', 'PECTAA Duty', 'Census Duty', 'Election Duty', 'MD-CAT Duty', 'Vote Verification Duty', 'FPSC Duty', 'PU Exam Duty', 'Paper Setter Duty', 'Official Dak Duty'] } },
    { id: 'sr_substitution_balance', key: 'substitutionLeaveBalancePriority', tab: 'Teacher Substitution', core: true, status: 'Active',
      name: 'Leave Balance Priority (Auto Assign)',
      description: 'In Teacher Substitution, when Auto Adjust assigns substitute periods, teachers who have taken leave (any cause) this month are served FIRST, ranked by balance = leaves this month - substitute periods already given this month (highest first) - so the teacher with the most leaves receives the most extra periods until the account balances. Teachers with no leave are then assigned in the normal routine order (fewest substitute periods first). When this rule is Inactive, the older fairness applies (teachers with more than 2 leaves this month get a small head start).',
      config: { enabled: true } },
    { id: 'sr_staff_seniority', key: 'staffSortBySeniority', tab: 'Staff Statement', core: true, status: 'Active',
      name: 'Sort Staff by Seniority',
      description: 'The Staff Statement view and the Staff Statement Manager list the staff in seniority order. When Inactive, the stored order is kept as-is.',
      config: { enabled: true } },
    { id: 'sr_record_limit', key: 'recordHistoryLimit', tab: 'Record & History', core: true, status: 'Active',
      name: 'History Log Limit',
      description: 'Maximum number of entries kept in Record & History. When the log grows beyond this number, the oldest entries are removed.',
      config: { limit: 200 } }
];
let softwareRulesState = null;
function ensureSoftwareRules() {
    if (softwareRulesState && Array.isArray(softwareRulesState.rules)) return softwareRulesState;
    try {
        const raw = localStorage.getItem(SOFTWARE_RULES_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.rules)) {
                softwareRulesState = { rules: parsed.rules, history: Array.isArray(parsed.history) ? parsed.history : [] };
            }
        }
    } catch (e) {}
    if (!softwareRulesState) {
        softwareRulesState = { rules: JSON.parse(JSON.stringify(DEFAULT_SOFTWARE_RULES)), history: [] };
    }
    // Rules added by a newer build appear automatically; the user's own
    // edits to existing rules are never overwritten.
    DEFAULT_SOFTWARE_RULES.forEach(function (dr) {
        if (!softwareRulesState.rules.some(function (r) { return r.key === dr.key; })) {
            softwareRulesState.rules.push(JSON.parse(JSON.stringify(dr)));
        }
    });
    return softwareRulesState;
}
function persistSoftwareRules() {
    try { localStorage.setItem(SOFTWARE_RULES_STORAGE_KEY, JSON.stringify(ensureSoftwareRules())); } catch (e) {}
}
function parseRuleConfig(rule) {
    if (!rule) return null;
    if (rule.config && typeof rule.config === 'object') return rule.config;
    try { const c = JSON.parse(String(rule.config || '')); return (c && typeof c === 'object') ? c : null; } catch (e) { return null; }
}
function findSoftwareRule(key) {
    ensureSoftwareRules();
    return softwareRulesState.rules.find(function (r) { return r.key === key; }) || null;
}
function ruleEnabled(key, fallback) {
    const r = findSoftwareRule(key);
    if (!r) return !!fallback;
    if (r.status !== 'Active') return false;
    const c = parseRuleConfig(r);
    return !c || c.enabled !== false;
}
function ruleConfigNumber(key, fallback) {
    const r = findSoftwareRule(key);
    if (!r || r.status !== 'Active') return fallback;
    const c = parseRuleConfig(r);
    if (!c) return fallback;
    const v = (c.gapMm !== undefined) ? c.gapMm : ((c.limit !== undefined) ? c.limit : c.value);
    const n = Number(v);
    return (v !== undefined && isFinite(n) && n > 0) ? n : fallback;
}
function ruleConfigList(key, fallback) {
    const r = findSoftwareRule(key);
    if (!r || r.status !== 'Active') return fallback;
    const c = parseRuleConfig(r);
    const arr = c ? (c.causes || c.list) : null;
    return (Array.isArray(arr) && arr.length) ? arr.map(function (x) { return String(x); }) : fallback;
}
function getSubstitutionLeaveCauses() {
    return ruleConfigList('substitutionLeaveCauses', SUBSTITUTION_LEAVE_CAUSES);
}
function snapshotRulesForUndo() {
    ensureSoftwareRules();
    softwareRulesState.history.push({ at: new Date().toLocaleString('en-GB'), rules: JSON.parse(JSON.stringify(softwareRulesState.rules)) });
    if (softwareRulesState.history.length > 20) softwareRulesState.history = softwareRulesState.history.slice(-20);
}
function saveSoftwareRulesAndData() {
    persistSoftwareRules();
    try { saveData(); } catch (e) {}
}
// Test Preview: explains, on the CURRENT data, what a rule does and
// what would change — without saving or applying anything.
function previewSoftwareRule(rule) {
    const lines = [];
    let cfg = null;
    try {
        cfg = (typeof rule.config === 'object') ? rule.config : JSON.parse(String(rule.config || ''));
        if (!cfg || typeof cfg !== 'object') throw new Error('not an object');
        lines.push('✓ Code/Config is valid JSON: ' + JSON.stringify(cfg));
    } catch (e) {
        lines.push('✗ Code/Config is NOT valid JSON — fix it before applying. (' + e.message + ')');
        return lines;
    }
    lines.push('Tab: ' + rule.tab + ' | Status after apply: ' + rule.status);
    const key = rule.key || '';
    if (key === 'workloadDrivenAllocation') {
        lines.push(cfg.enabled === false
            ? 'Effect: Auto Adjust will use the exact Subject Allocation teachers (workload matching OFF).'
            : 'Effect: Auto Adjust will assign each class subject to a teacher who has that subject in Teachers & Workload.');
        let total = 0;
        (classesList || []).forEach(function (c) { total += (c.subjects || []).filter(function (s) { return s && s.name && s.name !== '-'; }).length; });
        lines.push('Currently ' + total + ' class subjects would be allocated on the next Auto Adjust.');
    } else if (key === 'strictEqualPeriods') {
        lines.push(cfg.enabled === false
            ? 'Effect: Equal Periods limits stay preferred and may be increased to complete classes.'
            : 'Effect: when all teachers are set to the same N, slips will show exactly N teaching periods per teacher; class periods that cannot be filled will be reported in the completion alert.');
    } else if (key === 'enforceInchargeFirstPeriod') {
        let bad = 0, total = 0;
        (classesList || []).forEach(function (c) {
            if (!c.inchargeId) return;
            total++;
            const row = (scheduleResult && scheduleResult.classSchedule) ? scheduleResult.classSchedule[c.id] : null;
            const p1id = (appSettings && appSettings.periods && appSettings.periods[0]) ? appSettings.periods[0].id : 1;
            const l = row ? row[p1id] : null;
            if (!l || l.teacherId !== c.inchargeId) bad++;
        });
        lines.push('Effect: after Auto Adjust / Shuffling, Period 1 of every class must be the Class Incharge.');
        lines.push('In the CURRENT timetable, ' + bad + ' of ' + total + ' classes with an Incharge do not have the Incharge in Period 1 — the next Auto Adjust or Shuffling will repair/report them.');
    } else if (key === 'nameplateTileGapMm') {
        const gap = Number(cfg.gapMm);
        if (!(gap > 0)) { lines.push('✗ gapMm must be a positive number.'); return lines; }
        const per = function (w, h) { return Math.max(1, Math.floor((277 + gap) / (w + gap))) * Math.max(1, Math.floor((190 + gap) / (h + gap))); };
        lines.push('Effect: with a ' + gap + 'mm gap, one A4 sheet fits ' + per(85.6, 54) + ' CNIC plates and ' + per(51, 51) + ' Passport plates.');
    } else if (key === 'nameplateFillSheetSingle') {
        lines.push(cfg.enabled === false
            ? 'Effect: a single small plate will be shown once (the sheet will NOT be filled with copies).'
            : 'Effect: a single small plate fills the whole A4 sheet with copies.');
    } else if (key === 'substitutionLeaveCauses') {
        const arr = cfg.causes || cfg.list;
        if (!Array.isArray(arr) || !arr.length) { lines.push('✗ The config must contain a non-empty "causes" list.'); return lines; }
        lines.push('Effect: Teacher Substitution will offer ' + arr.length + ' leave causes: ' + arr.map(String).join(', ') + '.');
    } else if (key === 'substitutionLeaveBalancePriority') {
        lines.push(cfg.enabled === false
            ? 'Effect: the older fairness applies (teachers with more than 2 leaves this month get a small head start in Substitution Auto Adjust).'
            : 'Effect: in Substitution Auto Adjust, teachers who took leave (any cause) this month get substitute periods first, ranked by balance (leaves this month - substitute periods already given this month, highest first).');
        try {
            const d0 = (typeof substitutionState !== 'undefined' && substitutionState && substitutionState.date) ? substitutionState.date : todayISO();
            const mr = substitutionMonthRange(d0);
            const rowsB = (teachersList || []).map(function (t) {
                const lv = substitutionLeaveCountThisMonth(t.id, d0);
                const rawB = substitutionSubCountInRange(t.id, mr.start, mr.end);
                return { name: t.name, lv: lv, raw: rawB, bal: lv - rawB };
            }).filter(function (r) { return r.lv > 0; }).sort(function (a, b) { return b.bal - a.bal; }).slice(0, 5);
            if (rowsB.length) lines.push('Top balances this month: ' + rowsB.map(function (r) { return r.name + ' (leaves ' + r.lv + ', extra given ' + r.raw + ', balance ' + r.bal + ')'; }).join('; ') + '.');
            else lines.push('No teacher has a recorded leave this month yet.');
        } catch (e) { /* preview only */ }
    } else if (key === 'staffSortBySeniority') {
        lines.push(cfg.enabled === false
            ? 'Effect: Staff Statement lists will keep the stored order (no seniority sorting).'
            : 'Effect: Staff Statement lists will be sorted by seniority.');
    } else if (key === 'recordHistoryLimit') {
        const lim = Number(cfg.limit);
        if (!(lim > 0)) { lines.push('✗ limit must be a positive number.'); return lines; }
        lines.push('Effect: Record & History will keep at most ' + lim + ' entries. The log currently has ' + ((typeof historyLog !== 'undefined' && historyLog) ? historyLog.length : 0) + ' entries.');
    } else {
        lines.push('Custom rule: no built-in behaviour reads this rule key yet, so it is stored, shown and synced, but it does not change any tab until support for its key is built into the software.');
    }
    return lines;
}
// ---- Rules Engine UI ----
let srEditingId = null;
const SOFTWARE_RULE_TABS = ['Class Name Plate', 'Teacher Substitution', 'Timetable', 'Staff Statement', 'Record & History'];
function openSoftwareRulesModal() {
    ensureSoftwareRules();
    srEditingId = null;
    document.getElementById('softwareRuleEditor').classList.add('hidden');
    renderSoftwareRules();
    document.getElementById('softwareRulesModal').classList.remove('hidden');
}
function closeSoftwareRulesModal() {
    document.getElementById('softwareRulesModal').classList.add('hidden');
}
function renderSoftwareRules() {
    const st = ensureSoftwareRules();
    const body = document.getElementById('softwareRulesBody');
    if (!body) return;
    const tabOrder = { 'Timetable': 0, 'Class Name Plate': 1, 'Teacher Substitution': 2, 'Staff Statement': 3, 'Record & History': 4 };
    const rows = [...st.rules].sort(function (a, b) {
        const ta = tabOrder[a.tab] !== undefined ? tabOrder[a.tab] : 9;
        const tb = tabOrder[b.tab] !== undefined ? tabOrder[b.tab] : 9;
        if (ta !== tb) return ta - tb;
        return String(a.name || '').localeCompare(String(b.name || ''));
    }).map(function (r) {
        const cfg = parseRuleConfig(r);
        const cfgText = cfg ? JSON.stringify(cfg) : String(r.config || '');
        const statusBadge = r.status === 'Active'
            ? '<span class="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">Active</span>'
            : '<span class="bg-slate-200 text-slate-600 font-black px-2 py-0.5 rounded-full">Inactive</span>';
        const delBtn = r.core
            ? '<span class="text-slate-400" title="Core rules cannot be deleted — set them Inactive instead">🔒</span>'
            : '<button onclick="deleteSoftwareRule(\'' + r.id + '\')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded" title="Delete">🗑️</button>';
        return '<tr class="border-t border-slate-200 align-top">' +
            '<td class="p-2 font-bold text-slate-700">' + escapeHtml(r.tab || '') + (r.core ? ' <span class="text-[9px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded-full">CORE</span>' : '') + '</td>' +
            '<td class="p-2 font-black text-slate-900">' + escapeHtml(r.name || '') + '</td>' +
            '<td class="p-2 text-slate-600">' + escapeHtml(r.description || '') + '</td>' +
            '<td class="p-2"><pre class="text-[10px] bg-slate-50 border border-slate-200 rounded p-1.5 max-w-[220px] overflow-x-auto whitespace-pre-wrap break-all">' + escapeHtml(cfgText) + '</pre></td>' +
            '<td class="p-2 text-center">' + statusBadge + '<br><button onclick="toggleSoftwareRuleStatus(\'' + r.id + '\')" class="mt-1 text-[10px] font-bold text-indigo-600 underline">' + (r.status === 'Active' ? 'Set Inactive' : 'Set Active') + '</button></td>' +
            '<td class="p-2 text-center whitespace-nowrap">' +
                '<button onclick="editSoftwareRule(\'' + r.id + '\')" class="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2 py-1 rounded" title="Edit">✏️ Edit</button> ' +
                '<button onclick="testSoftwareRuleRow(\'' + r.id + '\')" class="bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold px-2 py-1 rounded" title="Test">🧪 Test</button> ' +
                delBtn +
            '</td></tr>';
    }).join('');
    body.innerHTML =
        '<div class="overflow-x-auto border border-slate-200 rounded-xl"><table class="w-full text-xs text-left border-collapse">' +
        '<thead class="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider"><tr>' +
        '<th class="p-2.5">Tab Name</th><th class="p-2.5">Rule Name</th><th class="p-2.5">Rule Description / Function</th><th class="p-2.5">Code / Config</th><th class="p-2.5 text-center">Status</th><th class="p-2.5 text-center">Actions</th>' +
        '</tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="p-6 text-center text-slate-400 font-bold">No rules yet.</td></tr>') + '</tbody></table></div>' +
        '<p class="text-[11px] text-slate-500 mt-2">Rules save with the software data and sync to every PC. Config is JSON only — it is parsed, never executed as code. Core rules can be edited or set Inactive, but not deleted.</p>';
}
function srFillEditor(rule) {
    document.getElementById('srTab').value = rule.tab || 'Timetable';
    document.getElementById('srName').value = rule.name || '';
    document.getElementById('srDesc').value = rule.description || '';
    document.getElementById('srConfig').value = JSON.stringify(parseRuleConfig(rule) || {}, null, 2);
    document.getElementById('srStatus').value = rule.status || 'Active';
    document.getElementById('srTestOut').innerHTML = '';
    document.getElementById('softwareRuleEditor').classList.remove('hidden');
}
function editSoftwareRule(id) {
    const r = ensureSoftwareRules().rules.find(function (x) { return x.id === id; });
    if (!r) return;
    srEditingId = id;
    document.getElementById('srEditingLabel').innerText = 'Editing: ' + (r.name || '');
    srFillEditor(r);
}
function addSoftwareRule() {
    srEditingId = 'NEW';
    document.getElementById('srEditingLabel').innerText = 'Add a new rule';
    srFillEditor({ tab: 'Timetable', name: '', description: '', config: { enabled: true }, status: 'Active' });
}
function srReadEditor() {
    return {
        tab: document.getElementById('srTab').value,
        name: document.getElementById('srName').value.trim(),
        description: document.getElementById('srDesc').value.trim(),
        configText: document.getElementById('srConfig').value,
        status: document.getElementById('srStatus').value
    };
}
function testSoftwareRuleFromEditor() {
    const e = srReadEditor();
    const existing = (srEditingId && srEditingId !== 'NEW') ? findSoftwareRuleById(srEditingId) : null;
    const probe = { tab: e.tab, name: e.name, description: e.description, status: e.status, key: existing ? existing.key : '', config: e.configText };
    const lines = previewSoftwareRule(probe);
    document.getElementById('srTestOut').innerHTML = lines.map(function (l) { return '<div>' + escapeHtml(l) + '</div>'; }).join('');
}
function testSoftwareRuleRow(id) {
    const r = ensureSoftwareRules().rules.find(function (x) { return x.id === id; });
    if (!r) return;
    srEditingId = id;
    document.getElementById('srEditingLabel').innerText = 'Test: ' + (r.name || '');
    srFillEditor(r);
    const lines = previewSoftwareRule(r);
    document.getElementById('srTestOut').innerHTML = lines.map(function (l) { return '<div>' + escapeHtml(l) + '</div>'; }).join('');
}
function findSoftwareRuleById(id) {
    return ensureSoftwareRules().rules.find(function (x) { return x.id === id; }) || null;
}
function applySoftwareRuleFromEditor() {
    const e = srReadEditor();
    if (!e.name) { alert('Please enter a Rule Name.'); return; }
    let cfg = null;
    try {
        cfg = JSON.parse(e.configText || '');
        if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) throw new Error('Config must be a JSON object like {"enabled": true}');
    } catch (err) {
        alert('The Code/Config is not valid JSON:\n' + err.message + '\n\nFix it and use Test to preview before applying.');
        return;
    }
    const st = ensureSoftwareRules();
    snapshotRulesForUndo();
    if (srEditingId && srEditingId !== 'NEW') {
        const r = st.rules.find(function (x) { return x.id === srEditingId; });
        if (!r) { alert('Rule not found.'); return; }
        r.tab = e.tab; r.name = e.name; r.description = e.description; r.config = cfg; r.status = e.status;
        if (r.key === 'recordHistoryLimit') {
            const lim = ruleConfigNumber('recordHistoryLimit', 200);
            if (typeof historyLog !== 'undefined' && Array.isArray(historyLog) && historyLog.length > lim) historyLog = historyLog.slice(-lim);
        }
    } else {
        st.rules.push({ id: 'sr_custom_' + Date.now(), key: 'custom_' + Date.now(), tab: e.tab, core: false, status: e.status, name: e.name, description: e.description, config: cfg });
    }
    saveSoftwareRulesAndData();
    srEditingId = null;
    document.getElementById('softwareRuleEditor').classList.add('hidden');
    renderSoftwareRules();
    showToast('Rule applied and saved. It will be used by its tab from now on.');
}
function toggleSoftwareRuleStatus(id) {
    const st = ensureSoftwareRules();
    const r = st.rules.find(function (x) { return x.id === id; });
    if (!r) return;
    snapshotRulesForUndo();
    r.status = (r.status === 'Active') ? 'Inactive' : 'Active';
    saveSoftwareRulesAndData();
    renderSoftwareRules();
    showToast('Rule "' + (r.name || '') + '" is now ' + r.status + '.');
}
function deleteSoftwareRule(id) {
    const st = ensureSoftwareRules();
    const r = st.rules.find(function (x) { return x.id === id; });
    if (!r) return;
    if (r.core) { showToast('Core rules cannot be deleted — set the rule Inactive instead.'); return; }
    if (!confirm('Delete the rule "' + (r.name || '') + '"? (Undo in Software Rules can bring it back.)')) return;
    snapshotRulesForUndo();
    softwareRulesState.rules = st.rules.filter(function (x) { return x.id !== id; });
    saveSoftwareRulesAndData();
    renderSoftwareRules();
    showToast('Rule deleted.');
}
function undoSoftwareRules() {
    const st = ensureSoftwareRules();
    if (!st.history.length) { showToast('Nothing to undo — no earlier rule state is saved.'); return; }
    const prev = st.history[st.history.length - 1];
    if (!confirm('Undo the last rule change?\n\nThis restores the rules exactly as they were at ' + (prev.at || 'the previous save') + '.')) return;
    st.history.pop();
    softwareRulesState.rules = JSON.parse(JSON.stringify(prev.rules));
    saveSoftwareRulesAndData();
    srEditingId = null;
    document.getElementById('softwareRuleEditor').classList.add('hidden');
    renderSoftwareRules();
    showToast('Rules restored to the previous state.');
}

function generateTimetableAction(silent = false, reason = "New Timetable Generation", options = {}) {
    // Fix/Freeze protection: validate active freezes before generating.
    const fpCheck = (typeof getActiveFixedConstraints === 'function') ? getActiveFixedConstraints() : { constraints: [], errors: [] };
    if (fpCheck.errors && fpCheck.errors.length) {
        if (!silent) alert("The timetable cannot be generated because of Fixed (Frozen) Periods:\n• " + fpCheck.errors.join("\n• ") + "\n\nUnfreeze or fix them from View Fixed Periods.");
        return;
    }
    // Multi-teacher groups: validate before generating.
    const gpCheck = (typeof getGroupConstraints === 'function') ? getGroupConstraints() : { constraints: [], errors: [] };
    if (gpCheck.errors && gpCheck.errors.length) {
        if (!silent) alert("The timetable cannot be generated because of Multi-Teacher Groups:\n• " + gpCheck.errors.join("\n• ") + "\n\nFix them from Manage Multi Teachers.");
        return;
    }
    // Archive existing schedule before replacing
    if (scheduleResult) {
        archiveCurrentSchedule(reason);
    }

    let allocNotes = null;
    let p1Notes = null;
    let strictEqualOn = false;
    let allocFallback = false;
    const scheduler = new TimetableScheduler(appSettings, teachersList, classesList);
    scheduler.fixedConstraints = fpCheck.constraints;
    scheduler.groupConstraints = gpCheck.constraints;
    if (options && options.autoBands) {
        // Patch 32 (user's Q1 = 2, superseding Patch 30's Option 1):
        // Auto Adjust allocation is WORKLOAD-DRIVEN — every class
        // subject is given to a teacher who has that subject in
        // Teachers & Workload (Designation priority, Class
        // Incharge/section preference, workload balance); the Subject
        // Allocation teacher is overridden. Both behaviours are
        // Software Rules and can be switched off in the Rules Engine.
        // (Priority tiers, incharge Period 1 and quotas stay.)
        scheduler.lessonTier = function (t, c, s) { return aaLessonTier(t, c, s); };
        scheduler.inchargeFirstPeriod = true;
        scheduler.useBacktracking = true;
        if (options.teacherQuotas) scheduler.teacherQuotas = options.teacherQuotas;
        strictEqualOn = !!(options.equalPeriods && ruleEnabled('strictEqualPeriods', true));
        if (strictEqualOn) scheduler.hardQuotas = true;
        if (ruleEnabled('workloadDrivenAllocation', true)) {
            allocNotes = allocateWorkloadDriven(options.teacherQuotas || null, strictEqualOn, fpCheck.constraints);
            scheduler.teacherOverrides = allocNotes.overrides;
        }
    }
    let result = scheduler.generate(150);
    if (!result.success && allocNotes) {
        // Workload-Driven Allocation found no clash-free timetable with
        // the current data — retry once with the Subject Allocation
        // teachers so generation still succeeds, and report it.
        const retry = new TimetableScheduler(appSettings, teachersList, classesList);
        retry.fixedConstraints = fpCheck.constraints;
        retry.groupConstraints = gpCheck.constraints;
        retry.lessonTier = scheduler.lessonTier;
        retry.inchargeFirstPeriod = true;
        retry.useBacktracking = true;
        if (options.teacherQuotas) retry.teacherQuotas = options.teacherQuotas;
        if (strictEqualOn) retry.hardQuotas = true;
        const retryResult = retry.generate(150);
        if (retryResult.success) { result = retryResult; allocFallback = true; }
    }
    if (result.success && options && options.autoBands && ruleEnabled('enforceInchargeFirstPeriod', true)) {
        p1Notes = enforceInchargeFirstPeriod(result, fpCheck.constraints, gpCheck.constraints);
    }
    let fillNotes = null;
    if (result.success && options && options.autoBands) {
        fillNotes = fillEmptyClassPeriods(result, gpCheck.constraints, function (cls, s, sIdx) {
            if (allocNotes) {
                const k = cls.id + '|' + sIdx;
                if (Object.prototype.hasOwnProperty.call(allocNotes.overrides, k)) return allocNotes.overrides[k] || null;
            }
            return s.teacherId || null;
        }, strictEqualOn ? (options.teacherQuotas || null) : null);
    }

    if (result.success) {
        scheduleResult = result;
        exporter = new TimetableExporter(appSettings, teachersList, classesList, scheduleResult);
        saveData();
        updateStats();
        renderAllViews();

        if (!silent) {
            if (options && options.autoBands) {
                const dropped = result.droppedLessons || [];
                const fmtD = function (d) { return "- " + d.className + "-" + d.section + " " + d.subjectName + " (" + d.teacherName + ")"; };
                let msg = (options.shuffle ? "Auto Shuffling complete! A completely different zero-clash timetable has been generated." : (allocNotes ? "Auto Adjust complete! A zero-clash timetable has been generated with Workload-Driven Allocation - every class subject was given to a teacher who has that subject in Teachers & Workload (Designation priority, Class Incharge/section preference and workload balance applied)." : "Auto Adjust complete! A zero-clash timetable has been generated strictly from Periods Detail (Control Panel) - every subject has been placed with the exact teacher assigned to it in Periods Detail.")) + (strictEqualOn ? " Equal Periods STRICT mode was ON: every teacher was kept at exactly the set periods and limits were never increased." : " Rules applied: every class's Period 1 is its Class Incharge; teachers' period limits are preferred and are only increased when a class would otherwise stay incomplete.") + "\n\nYour previous timetable is safe: the Undo button above restores it, and a copy was also saved in Time Table Record.";
                if (dropped.length) {
                    msg += "\n\nThese assigned subjects were NOT placed because of the class/designation rule - add them manually if needed (manual adjustment is always allowed):\n" + dropped.map(fmtD).join("\n");
                }
                const wDropped = result.workloadDroppedLessons || [];
                if (wDropped.length) {
                    msg += "\n\nThese assigned subjects were NOT placed because the teacher does not have that subject in Teachers & Workload - add the subject to the teacher in Teachers & Workload, or add the period manually:\n" + wDropped.map(fmtD).join("\n");
                }
                const qExceeded = result.quotaExceeded || [];
                if (qExceeded.length) {
                    msg += "\n\nTo fill every class period, the periods limit was increased for these teachers (limit set -> periods given):\n" + qExceeded.map(function (d) { return "- " + d.teacherName + " (" + d.quota + " -> " + d.placed + ")"; }).join("\n");
                }
                const qDropped = result.quotaDroppedLessons || [];
                if (qDropped.length) {
                    msg += "\n\nThese assigned subjects were NOT placed because of the periods limit set for their teacher - increase the teacher's periods in Auto Adjust or add them manually:\n" + qDropped.map(fmtD).join("\n");
                }
                const ocDropped = result.overCapacityLessons || [];
                if (ocDropped.length) {
                    msg += "\n\nThese assigned subjects could NOT be placed because their teacher already has a full day (all periods busy):\n" + ocDropped.map(fmtD).join("\n");
                }
                const iNotes = p1Notes ? [] : (result.inchargeNotes || []);
                if (iNotes.length) {
                    msg += "\n\nClass Incharge Period 1 could not be set for these classes:\n" + iNotes.map(function (d) { return "- " + d.className + "-" + d.section + ": " + d.reason; }).join("\n");
                }
                if (allocFallback) {
                    msg += "\n\nNote: Workload-Driven Allocation could not produce a clash-free timetable with the current data, so this timetable was generated with the Subject Allocation teachers instead.";
                }
                if (allocNotes && !allocFallback) {
                    const tName = function (id) { const t = (teachersList || []).find(function (x) { return x.id === id; }); return t ? t.name : id; };
                    if (allocNotes.overridden) {
                        msg += "\n\nWorkload-Driven Allocation changed the teacher of " + allocNotes.overridden + " subject(s) from Subject Allocation. Examples:\n" + allocNotes.examples.map(function (d) { return "- " + d.cls.name + "-" + (d.cls.section || "") + " " + d.subjectName + ": " + tName(d.planTeacherId) + " -> " + tName(allocNotes.overrides[d.cls.id + "|" + d.sIdx]); }).join("\n");
                    }
                    if (allocNotes.fallback && allocNotes.fallback.length) {
                        msg += "\n\nThese subjects have NO teacher with that subject in Teachers & Workload, so their Subject Allocation teacher was kept:\n" + allocNotes.fallback.map(function (d) { return "- " + d.cls.name + "-" + (d.cls.section || "") + " " + d.subjectName + " (" + tName(d.planTeacherId) + ")"; }).join("\n");
                    }
                    if (allocNotes.unassigned && allocNotes.unassigned.length) {
                        msg += "\n\nThese subjects were NOT placed because no qualified teacher could take them within the period limits:\n" + allocNotes.unassigned.map(function (d) { return "- " + d.cls.name + "-" + (d.cls.section || "") + " " + d.subjectName; }).join("\n");
                    }
                }
                if (p1Notes) {
                    if (p1Notes.swapped.length) msg += "\n\nPeriod 1 was swapped to the Class Incharge in: " + p1Notes.swapped.join(", ") + ".";
                    if (p1Notes.repaired.length) msg += "\n\nPeriod 1 was set to the Class Incharge (subject unchanged) for:\n" + p1Notes.repaired.map(function (x) { return "- " + x; }).join("\n");
                    if (p1Notes.problems.length) msg += "\n\nPeriod 1 could NOT be given to the Class Incharge for:\n" + p1Notes.problems.map(function (x) { return "- " + x; }).join("\n");
                    if (p1Notes.freeOverrides && p1Notes.freeOverrides.length) msg += "\n\nNote: in these classes the Class Incharge's Period 1 is marked as a free period in Teachers & Workload — Period 1 was still given to the Incharge, as instructed (hard lock):\n" + p1Notes.freeOverrides.map(function (x) { return "- " + x; }).join("\n");
                }
                if (fillNotes) {
                    if (fillNotes.filled.length) msg += "\n\nThese empty periods were filled after generation from the classes' own remaining subjects (zero-clash):\n" + fillNotes.filled.map(function (x) { return "- " + x; }).join("\n");
                    if (fillNotes.stillEmpty.length) msg += "\n\nThese periods are still empty — no teacher could take them without a clash (or, in strict Equal mode, without crossing the set limit):\n" + fillNotes.stillEmpty.map(function (x) { return "- " + x; }).join("\n");
                }
                if (strictEqualOn) {
                    const cnt = {};
                    Object.keys(result.teacherSchedule || {}).forEach(function (tid) { const row = result.teacherSchedule[tid] || {}; let n = 0; Object.values(row).forEach(function (l) { if (l && !l.isFree) n++; }); cnt[tid] = n; });
                    const N = options.equalPeriods;
                    const below = (teachersList || []).filter(function (t) { return (cnt[t.id] || 0) < N; });
                    if (below.length) msg += "\n\nEqual Periods = " + N + ": these teachers have fewer than " + N + " teaching periods (their allocated subjects were fewer, or a placement was not possible):\n" + below.map(function (t) { return "- " + t.name + ": " + (cnt[t.id] || 0) + " of " + N; }).join("\n");
                    const emptyLines = [];
                    (classesList || []).forEach(function (c) { const row = (result.classSchedule || {})[c.id] || {}; const empt = (appSettings.periods || []).filter(function (p) { return !row[p.id]; }).map(function (p) { return "Period " + p.id; }); if (empt.length) emptyLines.push("- " + c.name + "-" + (c.section || "") + ": " + empt.join(", ") + " empty"); });
                    if (emptyLines.length) msg += "\n\nEmpty class periods after this generation:\n" + emptyLines.join("\n");
                }
                alert(msg);
            } else {
            alert("Congratulations! Govt. High School Walton's 8-period zero-clash timetable has been generated successfully, and the previous schedule has been automatically saved in 'Time Table Record'!\n(Timetable Generated & Previous Saved to Record!)");
            }
            switchTab('teacherwise');
        }
    } else {
        if (!silent) {
            const errorMsg = result.errors ? result.errors.join("\n• ") : "Unknown error.";
            alert("The timetable could not be generated:\n• " + errorMsg);
        } else {
            rebuildSchedulesFromClassSchedule();
        }
    }
}

// ==========================================
// 1. TIME TABLE RECORD VIEW
// ==========================================
function renderRecordView() {
    // TASK 7: history-type dropdown — non-timetable types show the
    // date-wise history log; timetable keeps the existing snapshot cards.
    const _typeEl = document.getElementById('recordHistoryTypeFilter');
    if (_typeEl && _typeEl.value !== 'timetable') { renderHistoryLogEntries(); return; }
    const container = document.getElementById('recordListContainer');
    const teacherSearch = (document.getElementById('recordTeacherSearch').value || "").trim().toLowerCase();
    const dateFilter = document.getElementById('recordDateFilter').value || "ALL";

    // Populate date filter dropdown
    const dateDropdown = document.getElementById('recordDateFilter');
    const uniqueDates = Array.from(new Set(timetableHistory.map(h => h.dateOnly)));
    let dateOptions = `<option value="ALL">-- Record of All Dates --</option>`;
    uniqueDates.forEach(d => {
        dateOptions += `<option value="${d}" ${d === dateFilter ? 'selected' : ''}>${d}</option>`;
    });
    dateDropdown.innerHTML = dateOptions;

    // Filter snapshots
    let filtered = timetableHistory;
    if (dateFilter !== "ALL") {
        filtered = filtered.filter(h => h.dateOnly === dateFilter);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
                <i class="fa-solid fa-folder-open text-4xl text-slate-300"></i>
                <p class="font-bold text-sm">No old record exists</p>
                <p class="text-xs text-slate-400">Whenever you change any teacher's or class's schedule, the old timetable will automatically be saved here with its date.</p>
            </div>
        `;
        return;
    }

    let html = "";
    filtered.forEach((rec, idx) => {
        // If teacher search is active, check if teacher exists and extract their schedule
        let teacherHighlightHtml = "";
        if (teacherSearch) {
            const matchedTeacher = rec.teachersSnapshot.find(t => t.name.toLowerCase().includes(teacherSearch));
            if (matchedTeacher) {
                let periodsSummary = [];
                appSettings.periods.forEach(p => {
                    const l = rec.scheduleData.teacherSchedule[matchedTeacher.id] ? rec.scheduleData.teacherSchedule[matchedTeacher.id][p.id] : null;
                    if (l && !l.isFree) {
                        periodsSummary.push(`<strong>${p.name}:</strong> ${l.className}-${l.section} (${l.subjectName}) [${l.roomNo || 'Room'}]`);
                    } else {
                        periodsSummary.push(`<strong>${p.name}:</strong> FREE`);
                    }
                });

                teacherHighlightHtml = `
                    <div class="mt-2.5 p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-xs text-blue-950">
                        <div class="font-bold text-blue-900 mb-1">
                            <i class="fa-solid fa-user-check"></i> ${matchedTeacher.name}'s schedule on this date (${rec.displayDate}):
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                            ${periodsSummary.map(ps => `<div class="bg-white p-1 rounded border border-blue-100">${ps}</div>`).join('')}
                        </div>
                    </div>
                `;
            } else {
                // Skip this record if teacher is searched and not found
                return;
            }
        }

        html += `
            <div class="history-snapshot-card p-4 space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div class="flex items-center gap-2">
                        <span class="w-7 h-7 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-bold text-xs">#${idx + 1}</span>
                        <div>
                            <span class="font-bold text-slate-900 text-sm">${rec.displayDate}</span>
                            <span class="text-xs text-slate-500 ml-2">(${rec.reason})</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="restoreHistoricalSnapshot('${rec.id}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-indigo-200 transition flex items-center gap-1">
                            <i class="fa-solid fa-rotate-left"></i> Restore
                        </button>
                        <button onclick="exportHistoricalSnapshotExcel('${rec.id}')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-200 transition flex items-center gap-1">
                            <i class="fa-solid fa-file-excel"></i> Export Excel
                        </button>
                    </div>
                </div>

                <div class="text-xs text-slate-600 flex flex-wrap gap-4 pt-1">
                    <span><i class="fa-solid fa-users text-blue-600"></i> Teachers: <strong>${rec.teachersSnapshot.length}</strong></span>
                    <span><i class="fa-solid fa-school text-emerald-600"></i> Classes: <strong>${rec.classesSnapshot.length}</strong></span>
                    <span><i class="fa-solid fa-calendar-check text-amber-600"></i> Status: <strong>100% Saved Archive</strong></span>
                </div>

                ${teacherHighlightHtml}
            </div>
        `;
    });

    container.innerHTML = html || `
        <div class="bg-white p-6 rounded-2xl border text-center text-slate-500 text-xs">
            No record found for the searched teacher.
        </div>
    `;
}


// ==========================================
// TASK 7: HISTORY LOG VIEW / RESTORE / PDF / PREVIEW
// ==========================================
function getFilteredHistoryLog() {
    const teacherSearch = (document.getElementById('recordTeacherSearch').value || "").trim().toLowerCase();
    const dateFilter = document.getElementById('recordDateFilter').value || "ALL";
    const typeFilter = document.getElementById('recordHistoryTypeFilter') ? (document.getElementById('recordHistoryTypeFilter').value || 'all') : 'all';
    let list = [...(historyLog || [])].sort(function (a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
    if (typeFilter !== 'all') list = list.filter(function (e) { return e.type === typeFilter; });
    if (dateFilter !== 'ALL') list = list.filter(function (e) { return e.date === dateFilter || (e.displayDate || '').indexOf(dateFilter) >= 0; });
    if (teacherSearch) list = list.filter(function (e) { return (e.description || '').toLowerCase().indexOf(teacherSearch) >= 0; });
    return list;
}

function renderHistoryLogEntries() {
    const container = document.getElementById('recordListContainer');
    const dateDropdown = document.getElementById('recordDateFilter');
    const dateFilter = dateDropdown ? (dateDropdown.value || "ALL") : "ALL";
    // Date dropdown options come from the history log dates.
    if (dateDropdown) {
        const uniqueDates = Array.from(new Set((historyLog || []).map(function (h) { return h.date; }).filter(Boolean)));
        let dateOptions = `<option value="ALL">-- All Dates --</option>`;
        uniqueDates.forEach(function (d) { dateOptions += `<option value="${d}" ${d === dateFilter ? 'selected' : ''}>${d}</option>`; });
        dateDropdown.innerHTML = dateOptions;
    }
    const filtered = getFilteredHistoryLog();
    const typeFilter = document.getElementById('recordHistoryTypeFilter') ? document.getElementById('recordHistoryTypeFilter').value : 'all';
    const typeLabel = typeFilter === 'all' ? 'All History' : (HISTORY_TYPE_LABELS[typeFilter] || typeFilter);
    if (!filtered.length) {
        container.innerHTML = `
            <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
                <i class="fa-solid fa-folder-open text-4xl text-slate-300"></i>
                <p class="font-bold text-sm">No ${typeLabel} entries yet</p>
                <p class="text-xs text-slate-400">Whenever data is added, edited or deleted in this area, a date-wise history entry will appear here automatically.</p>
            </div>`;
        return;
    }
    const badge = function (action) {
        const map = { add: 'bg-emerald-100 text-emerald-800 border-emerald-300', edit: 'bg-blue-100 text-blue-800 border-blue-300', delete: 'bg-red-100 text-red-800 border-red-300', assigned: 'bg-indigo-100 text-indigo-800 border-indigo-300', removed: 'bg-orange-100 text-orange-800 border-orange-300', shared: 'bg-purple-100 text-purple-800 border-purple-300' };
        const cls = map[action] || 'bg-slate-100 text-slate-800 border-slate-300';
        return `<span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${cls}">${action}</span>`;
    };
    container.innerHTML = filtered.map(function (e, idx) {
        return `
            <div class="history-snapshot-card p-4 space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div class="flex items-center gap-2">
                        <span class="w-7 h-7 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-bold text-xs">#${idx + 1}</span>
                        <div>
                            <span class="font-bold text-slate-900 text-sm">${e.displayDate || e.date || ''}</span>
                            <span class="text-xs text-slate-500 ml-2">${HISTORY_TYPE_LABELS[e.type] || e.type}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${badge(e.action)}
                        ${e.snapshot ? `<button onclick="restoreHistoryEntry('${e.id}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-indigo-200 transition flex items-center gap-1"><i class="fa-solid fa-rotate-left"></i> Restore</button>` : `<span class="text-[10px] text-slate-400 font-bold">No snapshot to restore</span>`}
                    </div>
                </div>
                <div class="text-xs text-slate-700">${e.description || ''}</div>
            </div>`;
    }).join('');
}

function restoreHistoryEntry(entryId) {
    const e = (historyLog || []).find(function (x) { return x.id === entryId; });
    if (!e) return;
    if (!e.snapshot) { showToast('This history entry has no stored data to restore.'); return; }
    if (!confirm('Restore data to this history point?\n\n' + (e.description || '') + '\nDate: ' + (e.displayDate || e.date || ''))) return;
    try {
        if (e.type === 'timetable' && e.snapshot.teachers) {
            archiveCurrentSchedule('Archive before history restore');
            teachersList = historyClone(e.snapshot.teachers) || teachersList;
            classesList = historyClone(e.snapshot.classes) || classesList;
            scheduleResult = historyClone(e.snapshot.schedule) || scheduleResult;
            if (typeof injectPeriodGroupsIntoTeacherSchedule === 'function') injectPeriodGroupsIntoTeacherSchedule();
            saveData(); renderAllViews(); renderDataDistributionView();
        } else if (e.type === 'staffStatement' && e.snapshot.staffStatement) {
            staffStatementList = historyClone(e.snapshot.staffStatement) || staffStatementList;
            saveData(); renderStaffStatementView(); renderDataDistributionView();
        } else if (e.type === 'summary' && typeof e.snapshot.workingDays === 'number') {
            summaryWorkingDays = e.snapshot.workingDays;
            try { localStorage.setItem('summaryWorkingDays', String(summaryWorkingDays)); } catch (err) {}
            saveData(); renderSummaryTable();
        } else if (e.type === 'substitution' && e.snapshot.assignments) {
            substitutionAssignments = historyClone(e.snapshot.assignments) || substitutionAssignments;
            saveSubstitutionData(); renderSubstitutionView();
        } else if (e.type === 'incharges' && e.snapshot.classId) {
            const c = (classesList || []).find(function (x) { return String(x.id) === String(e.snapshot.classId); });
            if (c) { c.inchargeId = e.snapshot.inchargeId || ''; saveData(); renderAllViews(); renderDataDistributionView(); }
        } else {
            showToast('Nothing to restore for this history entry.');
            return;
        }
        showToast('History restored successfully.');
        renderRecordView();
    } catch (err) { console.error('restoreHistoryEntry error', err); showToast('Restore failed.'); }
}

function recordHistoryBuildPrintArea() {
    const el = document.getElementById('recordHistoryPrintArea');
    if (!el) return;
    const list = getFilteredHistoryLog();
    const typeFilter = document.getElementById('recordHistoryTypeFilter') ? document.getElementById('recordHistoryTypeFilter').value : 'all';
    const title = typeFilter === 'all' ? 'All History' : (HISTORY_TYPE_LABELS[typeFilter] || typeFilter);
    const esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    el.innerHTML = '<div style="padding:16px;font-family:Arial,sans-serif;color:#0f172a;">'
        + '<h2 style="text-align:center;font-size:18px;font-weight:900;margin:0 0 4px;">GOVT. HIGH SCHOOL WALTON LAHORE</h2>'
        + '<h3 style="text-align:center;font-size:14px;font-weight:700;margin:0 0 10px;">Record &amp; History — ' + esc(title) + '</h3>'
        + '<p style="font-size:12px;">Date: ' + new Date().toLocaleDateString('en-GB') + ' &nbsp;|&nbsp; Entries: ' + list.length + '</p>'
        + '<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr>'
        + '<th style="border:1px solid #94a3b8;padding:6px;text-align:left;">#</th>'
        + '<th style="border:1px solid #94a3b8;padding:6px;text-align:left;">Date</th>'
        + '<th style="border:1px solid #94a3b8;padding:6px;text-align:left;">Type</th>'
        + '<th style="border:1px solid #94a3b8;padding:6px;text-align:left;">Action</th>'
        + '<th style="border:1px solid #94a3b8;padding:6px;text-align:left;">Description</th>'
        + '</tr></thead><tbody>'
        + list.map(function (e, i) { return '<tr><td style="border:1px solid #cbd5e1;padding:6px;">' + (i + 1) + '</td><td style="border:1px solid #cbd5e1;padding:6px;">' + esc(e.displayDate || e.date || '') + '</td><td style="border:1px solid #cbd5e1;padding:6px;">' + esc(HISTORY_TYPE_LABELS[e.type] || e.type) + '</td><td style="border:1px solid #cbd5e1;padding:6px;">' + esc(e.action) + '</td><td style="border:1px solid #cbd5e1;padding:6px;">' + esc(e.description || '') + '</td></tr>'; }).join('')
        + '</tbody></table></div>';
}
function recordHistoryPreview() {
    recordHistoryBuildPrintArea();
    openUniversalPrintPreview('recordHistoryPrintArea', 'History_Report', 'portrait');
}
function recordHistoryDownloadPdf() {
    recordHistoryBuildPrintArea();
    printCurrentView('recordHistoryPrintArea', 'History_Report', 'portrait');
}

function restoreHistoricalSnapshot(recordId) {
    const rec = timetableHistory.find(h => h.id === recordId);
    if (!rec) return;

    if (!confirm(`Do you really want to restore the timetable of ${rec.displayDate}?`)) return;

    // Archive current before restoring
    archiveCurrentSchedule("Archive before restoring " + rec.displayDate);

    scheduleResult = JSON.parse(JSON.stringify(rec.scheduleData));
    teachersList = JSON.parse(JSON.stringify(rec.teachersSnapshot));
    classesList = JSON.parse(JSON.stringify(rec.classesSnapshot));
    exporter = new TimetableExporter(appSettings, teachersList, classesList, scheduleResult);
    if (typeof injectPeriodGroupsIntoTeacherSchedule === 'function') injectPeriodGroupsIntoTeacherSchedule();

    saveData();
    renderAllViews();
    renderTeachersList();
    renderClassesList();
    alert("Timetable restored successfully!");
    switchTab('teacherwise');
}

function exportHistoricalSnapshotExcel(recordId) {
    const rec = timetableHistory.find(h => h.id === recordId);
    if (!rec) return;
    const tempExporter = new TimetableExporter(appSettings, rec.teachersSnapshot, rec.classesSnapshot, rec.scheduleData);
    tempExporter.exportMasterExcel();
}

// ==========================================
// 2. CLASS INCHARGES & NON-INCHARGES DIRECTORY
// ==========================================
function switchInchargeSubTab(tab) {
    currentInchargeSubTab = tab;
    const btnInch = document.getElementById('subTabBtnIncharges');
    const btnNon = document.getElementById('subTabBtnNonIncharges');
    const title = document.getElementById('inchargesSheetTitle');

    if (tab === 'incharges') {
        btnInch.className = "px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white transition flex items-center gap-1.5";
        btnNon.className = "px-4 py-2 text-xs font-bold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition flex items-center gap-1.5";
        title.innerText = "Class Incharges List & Contact Numbers";
    } else {
        btnNon.className = "px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white transition flex items-center gap-1.5";
        btnInch.className = "px-4 py-2 text-xs font-bold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition flex items-center gap-1.5";
        title.innerText = "Other Teaching Staff (Non-Incharges) & Assigned Classes Detail";
    }
    renderInchargesView();
}

function renderInchargesView() {
    const container = document.getElementById('inchargesTableContainer');
    const teacherMap = {};
    teachersList.forEach(t => teacherMap[t.id] = t);

    if (currentInchargeSubTab === 'incharges') {
        let html = `
            <table class="w-full incharge-table text-left border-collapse border border-slate-300">
                <thead>
                    <tr>
                        <th class="p-2 border border-slate-600 text-center w-12">Sr. No.</th>
                        <th class="p-2 border border-slate-600">Teacher Name</th>
                        <th class="p-2 border border-slate-600">Designation</th>
                        <th class="p-2 border border-slate-600">Mobile Number</th>
                        <th class="p-2 border border-slate-600 text-center">Class</th>
                        <th class="p-2 border border-slate-600 text-center">Section</th>
                        <th class="p-2 border border-slate-600 text-center">Room No.</th>
                        <th class="p-2 border border-slate-600">Subjects Taught</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
        `;

        let count = 0;
        classesList.forEach((c, idx) => {
            const t = teacherMap[c.inchargeId];
            if (t) {
                count++;
                const rowBg = count % 2 === 0 ? "bg-white" : "bg-slate-50";
                html += `
                    <tr class="${rowBg} hover:bg-emerald-50/40 transition">
                        <td class="p-2.5 text-center font-bold text-slate-500">${count}</td>
                        <td class="p-2.5 font-bold text-slate-900">${t.name}</td>
                        <td class="p-2.5 text-slate-600 font-medium">${(t.designation || '-').toUpperCase()}</td>
                        <td class="p-2.5 font-bold text-blue-800">${t.mobileNumber || '-'}</td>
                        <td class="p-2.5 text-center font-extrabold text-blue-900">${c.name}</td>
                        <td class="p-2.5 text-center font-bold text-slate-700">${c.section}</td>
                        <td class="p-2.5 text-center font-extrabold text-emerald-800 bg-emerald-50/40">${c.roomNo || "-"}</td>
                        <td class="p-2.5 text-slate-700 font-medium">${getTeacherSlipSubjects(t.id).join(', ') || '—'}</td>
                    </tr>
                `;
            }
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } else {
        // Non-Incharge Teachers
        let html = `
            <table class="w-full incharge-table text-left border-collapse border border-slate-300">
                <thead>
                    <tr>
                        <th class="p-2 border border-slate-600 text-center w-12">Sr. No.</th>
                        <th class="p-2 border border-slate-600">Teacher Name</th>
                        <th class="p-2 border border-slate-600">Designation</th>
                        <th class="p-2 border border-slate-600">Mobile Number</th>
                        <th class="p-2 border border-slate-600">Classes & Sections Taught</th>
                        <th class="p-2 border border-slate-600">Subjects Taught</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
        `;

        let count = 0;
        const _sortedSummaryTeachers = [...teachersList].sort((a, b) => {
        const ka = String(a.name || '').replace(/^Dr\.\s+/i, '').toLowerCase();
        const kb = String(b.name || '').replace(/^Dr\.\s+/i, '').toLowerCase();
        return ka.localeCompare(kb);
    });
    _sortedSummaryTeachers.forEach((t, idx) => {
            const inch = getInchargeInfo(t.id);
            if (!inch.isIncharge) {
                count++;
                const taughtClasses = [];
                classesList.forEach(c => {
                    if (c.subjects.some(s => s.teacherId === t.id)) {
                        taughtClasses.push(`${c.name} - ${c.section}`);
                    }
                });

                const rowBg = count % 2 === 0 ? "bg-white" : "bg-slate-50";
                html += `
                    <tr class="${rowBg} hover:bg-emerald-50/40 transition">
                        <td class="p-2.5 text-center font-bold text-slate-500">${count}</td>
                        <td class="p-2.5 font-bold text-slate-900">${t.name}</td>
                        <td class="p-2.5 text-slate-600 font-medium">${(t.designation || '-').toUpperCase()}</td>
                        <td class="p-2.5 font-bold text-blue-800">${t.mobileNumber || '-'}</td>
                        <td class="p-2.5">
                            <div class="flex flex-wrap gap-1">
                                ${taughtClasses.map(cls => `<span class="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-bold text-[11px]">${cls}</span>`).join('')}
                            </div>
                        </td>
                        <td class="p-2.5 text-slate-700 font-medium">${getTeacherSlipSubjects(t.id).join(', ') || '—'}</td>
                    </tr>
                `;
            }
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }
}

function toRomanNum(num) {
    const lookup = [
        ['l', 50], ['xl', 40], ['x', 10], ['ix', 9],
        ['v', 5], ['iv', 4], ['i', 1]
    ];
    let roman = '';
    for (const [letter, value] of lookup) {
        while (num >= value) {
            roman += letter;
            num -= value;
        }
    }
    return roman;
}

// ==========================================
// 3. STAFF CIRCULAR PERFORMA VIEW (38 TEACHERS - DUAL GRID - SINGLE A4)
// ==========================================
function renderStaffCircularView() {
    const col1Tbody = document.getElementById('circularTableCol1Tbody');
    const col2Tbody = document.getElementById('circularTableCol2Tbody');
    if (!col1Tbody || !col2Tbody) return;

    // Auto-fetch teachers directly from active Timetable Teachers
    let list = [];
    if (teachersList && teachersList.length > 0) {
        list = teachersList.map(t => ({
            name: t.name,
            designation: formatDesignation(t.designation) || 'EST',
            combinedName: `${t.name} (${formatDesignation(t.designation) || 'Teacher'})`
        }));
    } else if (typeof DEFAULT_CIRCULAR_STAFF !== 'undefined' && DEFAULT_CIRCULAR_STAFF.length > 0) {
        list = DEFAULT_CIRCULAR_STAFF;
    }

    const sstList = [];
    const estList = [];

    list.forEach(t => {
        const desig = (t.designation || '').toUpperCase();
        if (desig.includes('SST') || desig.includes('S.S.T') || desig.includes('HEADMASTER') || desig.includes('SENIOR')) {
            sstList.push(t);
        } else {
            estList.push(t);
        }
    });

    // Left Column: strictly 1, 2, 3... sequential integer numbers for SSTs
    col1Tbody.innerHTML = sstList.map((item, idx) => {
        const displayName = item.combinedName || `${item.name} (${formatDesignation(item.designation) || 'SST'})`;
        return `
            <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
                <td class="p-1 border border-slate-700 font-bold text-slate-900 text-[11px] leading-tight">
                    <span class="text-blue-900 font-black mr-1">${idx + 1}.</span> ${displayName}
                </td>
                <td class="p-1 border border-slate-700 text-center h-6"></td>
            </tr>
        `;
    }).join('');

    // Right Column: strictly 1, 2, 3... sequential integer numbers for ESTs
    col2Tbody.innerHTML = estList.map((item, idx) => {
        const displayName = item.combinedName || `${item.name} (${formatDesignation(item.designation) || 'EST'})`;
        return `
            <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
                <td class="p-1 border border-slate-700 font-bold text-slate-900 text-[11px] leading-tight">
                    <span class="text-blue-900 font-black mr-1">${idx + 1}.</span> ${displayName}
                </td>
                <td class="p-1 border border-slate-700 text-center h-6"></td>
            </tr>
        `;
    }).join('');

    const countBadge = document.getElementById('circularMorningStaffCount');
    if (countBadge) {
        countBadge.innerText = (sstList.length + estList.length).toString();
    }
}

function exportStaffCircularExcel() {
    if (!exporter) return;
    exporter.exportStaffCircularExcel();
}

function exportInchargesExcel() {
    if (!exporter) return;
    exporter.exportInchargesExcel();
}

// Returns the DISTINCT subjects of a teacher's Teacher-wise Slip — i.e. the
// subjects of that teacher's periods in the timetable (the same source the
// Teacher-wise Slip renders per period). NOT the teacher's Assigned Subjects
// from Teachers & Workload. One shared helper used by Class Incharges
// (Subjects Taught), Staff & Free Periods (Subjects) and Time Table Summary
// (Subjects Taught) columns.
function getAssignedSubjectsByTeacher(teacherId) {
    const subjects = [];
    const push = (name) => {
        const n = (name || '').trim();
        if (n && n !== '-' && !subjects.includes(n)) subjects.push(n);
    };
    // Primary: the same teacherSchedule the Teacher-wise Slip renders from.
    if (typeof scheduleResult !== 'undefined' && scheduleResult && scheduleResult.teacherSchedule && scheduleResult.teacherSchedule[teacherId]) {
        const ts = scheduleResult.teacherSchedule[teacherId];
        (appSettings.periods || []).forEach(p => {
            const lesson = ts[p.id];
            if (lesson && !lesson.isFree) push(lesson.subjectName);
        });
        if (subjects.length > 0) return subjects;
    }
    // Fallback: classesList periods assigned to this teacher.
    (classesList || []).forEach(c => {
        (c.subjects || []).forEach(s => {
            if (s && s.teacherId === teacherId) push(s.name);
        });
    });
    return subjects;
}

// Alias: the other slip-subject columns (Class Incharges, Staff & Free
// Periods, Time Table Summary, Periods Detail) keep calling this name —
// it is the SAME central function above, one single source of truth.
function getTeacherSlipSubjects(teacherId) { return getAssignedSubjectsByTeacher(teacherId); }

// Teachers & Workload column + Edit Teacher form list (Patch 26): ALL of a
// teacher's subjects — the timetable (slip) subjects first, plus any extra
// subjects written in the teacher's profile (Subjects Taught) that are not
// in the timetable yet. Case-insensitive dedupe.
function getWorkloadColumnSubjects(t) {
    if (!t) return [];
    const derived = (typeof getAssignedSubjectsByTeacher === 'function') ? getAssignedSubjectsByTeacher(t.id) : [];
    const out = [...derived];
    const seen = new Set(derived.map(s => (s || '').trim().toLowerCase()));
    (t.subjects || []).forEach(s => {
        const n = (s || '').trim();
        if (n && !seen.has(n.toLowerCase())) { out.push(n); seen.add(n.toLowerCase()); }
    });
    return out;
}

// Prompt #3 Task 3: the ONE subject a teacher's slip must show for a period.
// Multi-teacher (group) assignment for THIS teacher in THIS period wins, so a
// combined primary subject (e.g. "Bio / Computer") never appears on the slip;
// otherwise the teacher's own lesson from the master teacher schedule.
function getSubjectForTeacherSlip(teacherId, periodId) {
    try {
        const groups = (typeof periodGroupsList !== 'undefined' && periodGroupsList) || [];
        for (const g of groups) {
            if (g && String(g.periodId) === String(periodId) && String(g.teacherId) === String(teacherId) && g.subjectName) {
                return g.subjectName;
            }
        }
    } catch (e) {}
    const ts = (typeof scheduleResult !== 'undefined' && scheduleResult && scheduleResult.teacherSchedule) || {};
    const lesson = ts[teacherId] && ts[teacherId][periodId];
    if (lesson && !lesson.isFree && lesson.subjectName) return lesson.subjectName;
    return '';
}

// ==========================================
// 4. TEACHER-WISE TIMETABLE SLIPS (4-5 PER PAGE)
// ==========================================
function renderTeacherWiseCards() {
    if (!scheduleResult) return;
    let filter = document.getElementById('teacherFilterSelect').value || "ALL";
    // Fix #24: whatever the dropdown says, a staff session renders
    // ONLY the logged-in teacher's own slip.
    if (typeof isStaffSession === 'function' && isStaffSession() && currentStaffAccount) {
        filter = currentStaffAccount.teacherId ? currentStaffAccount.teacherId : '__none__';
    }
    const container = document.getElementById('printable-teacher-cards-area');

    const teachersToRender = (filter === "ALL")
        ? teachersList
        : teachersList.filter(t => t.id === filter);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    let html = "";

    teachersToRender.forEach((t) => {
        const inch = getInchargeInfo(t.id);
        const inchargeBadge = inch.isIncharge
            ? `<span class="bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-2 py-0.5 rounded text-[11px]">Incharge: Yes (${inch.className})</span>`
            : `<span class="bg-slate-100 text-slate-700 border border-slate-300 font-bold px-2 py-0.5 rounded text-[11px]">Incharge: No</span>`;

        html += `
            <div class="teacher-slip-card p-3">
                <div class="slip-header-banner flex flex-wrap items-center justify-between gap-1 border-b border-slate-300 pb-1.5 mb-1.5">
                    <div>
                        <span class="font-extrabold text-blue-950 uppercase tracking-wide text-xs">Govt. High School Walton Lahore</span>
                        <span class="text-[10px] text-slate-500 ml-2">(${dateStr})</span>
                        <div class="text-xs font-bold text-slate-900 mt-0.5">
                            Teacher: <span class="text-blue-900 text-sm font-black">${t.name}</span>
                            <span class="text-slate-500 font-normal text-[11px] ml-1">(${formatDesignation(t.designation) || 'Teacher'})</span>
                            <span class="text-emerald-700 text-[11px] font-bold ml-2">Mob: ${t.mobileNumber || '-'}</span>
                            <span class="text-indigo-800 text-[11px] font-semibold ml-2">Subjects: ${t.subjects.join(', ')}</span>
                        </div>
                    </div>
                    <div>
                        ${inchargeBadge}
                    </div>
                </div>

                <table class="teacher-slip-table">
                    <thead>
                        <tr class="bg-slate-100 font-bold text-slate-700">
                            <th class="w-20 bg-slate-200">Field</th>
        `;

        appSettings.periods.forEach(p => {
            html += `<th class="p-1 text-center font-bold text-blue-900">${p.name}</th>`;
        });

        html += `
                        </tr>
                        <tr class="bg-slate-50 text-[10px] text-slate-600">
                            <th class="font-semibold bg-slate-150">Time</th>
        `;

        appSettings.periods.forEach(p => {
            html += `<th class="p-1 font-normal">${p.startTime} - ${p.endTime}</th>`;
        });

        html += `
                        </tr>
                        <tr class="bg-amber-50/70 text-[10px] text-amber-900 font-bold">
                            <th class="font-semibold bg-amber-100">Room No.</th>
        `;

        appSettings.periods.forEach(p => {
            const lesson = scheduleResult.teacherSchedule[t.id][p.id];
            const room = (lesson && !lesson.isFree) ? (lesson.roomNo || "Room") : "Staff Room";
            html += `<th class="p-1 font-bold text-amber-900">${room}</th>`;
        });

        html += `
                    </thead>
                    <tbody>
                        <tr class="bg-white">
                            <td class="font-bold text-slate-800 bg-slate-50">Class / Subject</td>
        `;

        appSettings.periods.forEach(p => {
            const lesson = scheduleResult.teacherSchedule[t.id][p.id];
            if (lesson && !lesson.isFree) {
                html += `
                    <td class="p-1.5 table-cell-period bg-blue-50/50">
                        <div class="font-extrabold text-blue-950 text-xs">${formatClassSectionName(lesson.className, lesson.section)}</div>
                        <div class="text-[11px] font-bold text-indigo-700">${getSubjectForTeacherSlip(t.id, p.id) || lesson.subjectName}</div>
                    </td>
                `;
            } else if (lesson && lesson.isOfficialFree) {
                html += `
                    <td class="p-1.5 table-cell-period bg-emerald-50 text-emerald-800 border-dashed border-emerald-300 font-bold">
                        <div class="text-xs">⭐ FREE</div>
                        <div class="text-[9px] text-emerald-600 font-normal">(Rest Period)</div>
                    </td>
                `;
            } else {
                html += `
                    <td class="p-1.5 table-cell-period bg-slate-50 text-slate-400 italic">
                        <div class="text-xs">FREE</div>
                    </td>
                `;
            }
        });

        html += `
                        </tr>
                    </tbody>
                </table>

                <!-- 1-Inch Empty Space for Notes/Comments with Underlined Principal's Signature -->
                <div class="teacher-slip-sig-box flex flex-col justify-end" style="min-height: 1in; height: 1in; margin-top: 6px; padding-bottom: 4px;">
                    <div class="flex justify-between items-end px-4 text-xs font-bold text-slate-900">
                        <div>
                            <span>Teacher's Signature: _______________________</span>
                        </div>
                        <div class="text-center">
                            ${(() => { const _se = (appSettings && appSettings.signatures && appSettings.signatures.principal) || null; if (_se && _se.dataUrl) { return '<img src="' + _se.dataUrl + '" alt="Principal Signature" style="max-height:56px; max-width:170px; object-fit:contain; display:block; margin: 0 auto 2px; transform: rotate(' + (_se.rotate || 0) + 'deg);">'; } return ''; })()}
                            <span><u>Principal's Signature</u>: ___________________________</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ---- Teacher-wise Slip Share on WhatsApp (Fix #27: wa.me text) ----
// The slip is shared as formatted plain text through a WhatsApp
// Click-to-Chat link — works on every browser and device, no canvas,
// no PNG download, no navigator.share.
function buildTeacherSlipText(t) {
    const periods = (appSettings && appSettings.periods) || [];
    const sched = (scheduleResult && scheduleResult.teacherSchedule && scheduleResult.teacherSchedule[t.id]) || {};
    const lines = [];
    lines.push('*Teacher Timetable Slip*');
    lines.push('Govt. High School Walton Lahore');
    lines.push('');
    lines.push('Teacher: ' + (t.name || ''));
    lines.push('Designation: ' + formatDesignation(t.designation));
    lines.push('Mobile: ' + (t.mobileNumber || '-'));
    const inc = (typeof classesList !== 'undefined' ? classesList : []).find(c => c.inchargeId === t.id);
    lines.push('Class Incharge: ' + (inc ? formatClassSectionName(inc.name, inc.section) : 'No'));
    const subjects = [];
    periods.forEach(function (p) {
        const lesson = sched[p.id];
        if (lesson && !lesson.isFree) {
            const sub = getSubjectForTeacherSlip(t.id, p.id) || lesson.subjectName || '';
            if (sub && subjects.indexOf(sub) === -1) subjects.push(sub);
        }
    });
    lines.push('Subjects: ' + (subjects.length ? subjects.join(', ') : '-'));
    lines.push('');
    lines.push('Period Schedule:');
    periods.forEach(function (p, i) {
        const lesson = sched[p.id];
        const time = (p.startTime || '') + '-' + (p.endTime || '');
        const label = (p.name || ('Period ' + (i + 1))) + ' (' + time + '): ';
        if (lesson && !lesson.isFree) {
            const sub = getSubjectForTeacherSlip(t.id, p.id) || lesson.subjectName || '';
            lines.push(label + formatClassSectionName(lesson.className, lesson.section) + (sub ? ' \u2014 ' + sub : '') + ' (Room ' + (lesson.roomNo || '\u2014') + ')');
        } else {
            lines.push(label + 'FREE');
        }
    });
    return lines.join('\n');
}
function teacherSlipShareWhatsApp(teacherId) {
    const t = (teachersList || []).find(x => String(x.id) === String(teacherId));
    if (!t) { showToast('No slip data to share.'); return; }
    let text = '';
    try { text = buildTeacherSlipText(t); } catch (e) { console.warn('Slip text build failed', e); }
    if (!text || !text.trim()) { showToast('No slip data to share.'); return; }
    try { logHistory('teacherSlips', 'shared', 'Teacher slip shared for "' + (t.name || 'Teacher') + '" via WhatsApp.', null); } catch (e) {}
    const win = window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    if (!win) { showToast('Please allow popups for this site to share on WhatsApp.'); return; }
    showToast('WhatsApp opened \u2014 choose a contact to send the slip.');
}
// ==========================================
// 5. TIMETABLE SUMMARY TABLE
// ==========================================
function renderSummaryTable() {
    if (!scheduleResult) return;
    try {
        const wdSel = document.getElementById('summaryWorkingDaysSelect');
        if (wdSel) wdSel.value = String(summaryWorkingDays);
    } catch (e) {}
    const container = document.getElementById('summaryTableContainer');

    let totalTeachingAll = 0;
    let totalFreeAll = 0;

    let html = `
        <table class="w-full summary-table text-left border-collapse border border-slate-300">
            <thead>
                <tr>
                    <th class="p-2 border border-slate-600 text-center w-10">Sr.</th>
                    <th class="p-2 border border-slate-600">Teacher Name</th>
                    <th class="p-2 border border-slate-600">Designation</th>
                    <th class="p-2 border border-slate-600">Mobile No.</th>
                    <th class="p-2 border border-slate-600 text-center">Inchargeship</th>
                    <th class="p-2 border border-slate-600">Subjects Taught</th>
                    <th class="p-2 border border-slate-600 text-center bg-blue-900">Daily Teach</th>
                    <th class="p-2 border border-slate-600 text-center bg-slate-700">Daily Free</th>
                    <th class="p-2 border border-slate-600 text-center bg-indigo-900">Weekly Teach</th>
                    <th class="p-2 border border-slate-600 text-center bg-slate-700">Weekly Free</th>
                    <th class="p-2 border border-slate-600 text-center bg-emerald-900">Monthly Teach</th>
                    <th class="p-2 border border-slate-600 text-center bg-slate-700">Monthly Free</th>
                    <th class="p-2 border border-slate-600 text-center bg-amber-900">Free %</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
    `;

    teachersList.forEach((t, idx) => {
        const inch = getInchargeInfo(t.id);
        let dailyTeaching = 0;

        appSettings.periods.forEach(p => {
            const l = (scheduleResult.teacherSchedule[t.id] || {})[p.id];
            if (l && !l.isFree) dailyTeaching++;
        });

        const dailyFree = appSettings.periods.length - dailyTeaching;
        const weeklyTeaching = dailyTeaching * summaryWorkingDays;
        const weeklyFree = dailyFree * summaryWorkingDays;
        const monthlyTeaching = dailyTeaching * summaryMonthlyDays();
        const monthlyFree = dailyFree * summaryMonthlyDays();
        const freePct = ((dailyFree / appSettings.periods.length) * 100).toFixed(1);

        totalTeachingAll += dailyTeaching;
        totalFreeAll += dailyFree;

        const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50";

        html += `
            <tr class="${rowBg} hover:bg-amber-50/40 transition">
                <td class="p-2 text-center font-bold text-slate-500">${idx + 1}</td>
                <td class="p-2 font-bold text-slate-900">${t.name}</td>
                <td class="p-2 text-slate-600">${(t.designation || '-').toUpperCase()}</td>
                <td class="p-2 font-bold text-blue-800">${t.mobileNumber || '-'}</td>
                <td class="p-2 text-center">
                    ${inch.isIncharge 
                        ? `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold text-[11px]">${inch.fullText}</span>` 
                        : `<span class="text-slate-400 text-xs">No</span>`}
                </td>
                <td class="p-2 text-slate-700">
                    <span class="text-blue-800 font-semibold">${getTeacherSlipSubjects(t.id).join(', ') || '—'}</span>
                </td>
                <td class="p-2 text-center font-black text-blue-900 bg-blue-50/50">${dailyTeaching}</td>
                <td class="p-2 text-center font-bold text-slate-600">${dailyFree}</td>
                <td class="p-2 text-center font-black text-indigo-900 bg-indigo-50/50">${weeklyTeaching}</td>
                <td class="p-2 text-center font-bold text-slate-600">${weeklyFree}</td>
                <td class="p-2 text-center font-black text-emerald-900 bg-emerald-50/50">${monthlyTeaching}</td>
                <td class="p-2 text-center font-bold text-slate-600">${monthlyFree}</td>
                <td class="p-2 text-center font-bold text-amber-700 bg-amber-50/50">${freePct}%</td>
            </tr>
        `;
    });

    const grandWeeklyTeaching = totalTeachingAll * summaryWorkingDays;
    const grandWeeklyFree = totalFreeAll * summaryWorkingDays;
    const grandMonthlyTeaching = totalTeachingAll * summaryMonthlyDays();
    const grandMonthlyFree = totalFreeAll * summaryMonthlyDays();
    const grandFreePct = (((totalFreeAll) / (teachersList.length * appSettings.periods.length)) * 100).toFixed(1);

    html += `
            <tr class="bg-slate-800 text-white font-extrabold text-xs">
                <td colspan="6" class="p-2.5 text-right uppercase tracking-wider">Total School Load:</td>
                <td class="p-2 text-center text-amber-300 text-sm">${totalTeachingAll}</td>
                <td class="p-2 text-center text-slate-300">${totalFreeAll}</td>
                <td class="p-2 text-center text-amber-300 text-sm">${grandWeeklyTeaching}</td>
                <td class="p-2 text-center text-slate-300">${grandWeeklyFree}</td>
                <td class="p-2 text-center text-amber-300 text-sm">${grandMonthlyTeaching}</td>
                <td class="p-2 text-center text-slate-300">${grandMonthlyFree}</td>
                <td class="p-2 text-center text-amber-300">${grandFreePct}%</td>
            </tr>
        </tbody>
    </table>
    `;

    container.innerHTML = html;
}

// ==========================================
// 6. MASTER / FULL TIMETABLE (LANDSCAPE AUTO-FIT)
// ==========================================
function renderMasterTable() {
    if (!scheduleResult) return;
    const container = document.getElementById('masterTableContainer');
    const teacherMap = {};
    teachersList.forEach(t => teacherMap[t.id] = t);

    let html = `
        <table class="full-timetable-table w-full text-xs border border-slate-300 text-center border-collapse">
            <colgroup>
                <col style="width: 11%;">
                <col style="width: 6%;">
                <col style="width: 11%;">
                <col style="width: 9%;">
                <col style="width: 9%;">
                <col style="width: 9%;">
                <col style="width: 9%;">
                <col style="width: 9%;">
                <col style="width: 9%;">
                <col style="width: 9%;">
                <col style="width: 9%;">
            </colgroup>
            <thead class="bg-slate-900 text-white">
                <tr>
                    <th class="p-1.5 sm:p-2 border border-slate-700">Class & Sec</th>
                    <th class="p-1.5 sm:p-2 border border-slate-700">Room</th>
                    <th class="p-1.5 sm:p-2 border border-slate-700">Incharge</th>
    `;

    appSettings.periods.forEach(p => {
        html += `
            <th class="p-1 sm:p-1.5 border border-slate-700">
                <div class="font-bold text-amber-300 text-[11px]">${p.name}</div>
                <div class="text-[9px] text-slate-300 font-normal leading-tight">${p.startTime} - ${p.endTime}</div>
            </th>
        `;
    });

    html += `</tr></thead><tbody class="divide-y divide-slate-200">`;

    classesList.forEach((c, idx) => {
        const incharge = teacherMap[c.inchargeId] ? teacherMap[c.inchargeId].name : "-";
        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';

        html += `
            <tr class="${rowBg} hover:bg-amber-50/50 transition">
                <td class="p-1.5 sm:p-2 font-bold border border-slate-300 text-slate-900 bg-slate-100">${c.name} - ${c.section}</td>
                <td class="p-1 sm:p-1.5 font-extrabold border border-slate-300 text-emerald-800 bg-emerald-50/30">${c.roomNo || "-"}</td>
                <td class="p-1 sm:p-1.5 border border-slate-300 text-slate-700 text-[10px] sm:text-[11px] font-medium truncate" title="${incharge}">${incharge}</td>
        `;

        appSettings.periods.forEach(p => {
            const lesson = scheduleResult.classSchedule[c.id][p.id];
            const cellGroups = (typeof getPeriodGroupEntries === 'function') ? getPeriodGroupEntries(c.id, p.id) : [];
            const fzCell = lesson ? ((typeof getActiveFreezeForCell === 'function') ? getActiveFreezeForCell(c.id, p.id, lesson.teacherId) : null) : null;
            // Multi-teacher format (only when this period has groups): every
            // teacher of the period on one line as "Subject / Teacher", a
            // dashed line between teachers, and NO group names. Cells
            // without groups render exactly as before.
            const multiEntries = [];
            // Only the multi-teachers are shown in a group period — the
            // primary lesson stays in the normal timetable data but is not
            // repeated in this cell (user requirement, 2026-10-22).
            cellGroups.forEach(g => multiEntries.push({ subjectName: g.subjectName, teacherId: g.teacherId }));
            const multiCellHtml = multiEntries.map((e, idx) => { const et = teacherMap[e.teacherId]; return (idx > 0 ? '<div class="border-t border-dashed border-slate-400 my-0.5"></div>' : '') + '<div class="text-[10.5px] leading-tight"><span class="font-black text-blue-950">' + e.subjectName + (idx === 0 && fzCell ? ' <i class="fa-solid fa-lock text-sky-600"></i>' : '') + '</span> <span class="text-slate-400">/</span> <span class="font-semibold text-slate-700">' + (et ? et.name : '') + '</span></div>'; }).join('');
            if (lesson && cellGroups.length) {
                const t = teacherMap[lesson.teacherId];
                if (fzCell) {
                    const fzTitle = 'Fixed for ' + (t ? t.name : '') + ' from ' + fzCell.fromDate + ' to ' + fzCell.toDate + (fzCell.reason ? ' - ' + fzCell.reason : '');
                    html += `
                    <td class="p-1 sm:p-1.5 border border-sky-400 bg-sky-100" title="${fzTitle}">${multiCellHtml}</td>
                `;
                } else {
                    html += `
                    <td class="p-1 sm:p-1.5 border border-slate-300 bg-blue-50/40">${multiCellHtml}</td>
                `;
                }
            } else if (lesson) {
                const t = teacherMap[lesson.teacherId];
                if (fzCell) {
                    const fzTitle = 'Fixed for ' + (t ? t.name : '') + ' from ' + fzCell.fromDate + ' to ' + fzCell.toDate + (fzCell.reason ? ' - ' + fzCell.reason : '');
                    // Patch 37: a blank-subject fixed period shows only the
                    // teacher's name and the lock — no empty subject line.
                    html += `
                    <td class="p-1 sm:p-1.5 border border-sky-400 bg-sky-100" title="${fzTitle}">
                        ${lesson.subjectName ? `<div class="font-black text-blue-950 text-[11px] leading-tight">${lesson.subjectName} <i class="fa-solid fa-lock text-sky-600"></i></div>
                        <div class="text-[9.5px] text-slate-700 font-semibold mt-0.5 leading-tight truncate">${t ? t.name : ''}</div>` : `<div class="font-black text-blue-950 text-[11px] leading-tight">${t ? t.name : ''} <i class="fa-solid fa-lock text-sky-600"></i></div>`}
                    </td>
                `;
                } else {
                    html += `
                    <td class="p-1 sm:p-1.5 border border-slate-300 bg-blue-50/40">
                        <div class="font-black text-blue-950 text-[11px] leading-tight">${lesson.subjectName}</div>
                        <div class="text-[9.5px] text-slate-700 font-semibold mt-0.5 leading-tight truncate">${t ? t.name : ''}</div>
                    </td>
                `;
                }
            } else if (cellGroups.length) {
                html += `<td class="p-1 sm:p-1.5 border border-slate-300 bg-amber-50/60">${multiCellHtml}</td>`;
            } else {
                html += `<td class="p-1 sm:p-1.5 border border-slate-300"></td>`;
            }
        });

        html += `</tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ==========================================
// 7. CLASS-WISE TIMETABLE
// ==========================================
function classWiseSingleTableHtml(targetClass, teacherMap) {
    let html = `
        <table class="w-full text-xs border border-slate-300 text-center border-collapse">
            <thead class="bg-indigo-950 text-white">
                <tr>
                    <th class="p-2.5 border border-indigo-800 w-24">Item</th>
    `;

    appSettings.periods.forEach(p => {
        html += `
            <th class="p-2 border border-indigo-800 min-w-[110px]">
                <div class="font-bold text-amber-300">${p.name}</div>
                <div class="text-[10px] text-indigo-200 font-normal">${p.startTime} - ${p.endTime}</div>
            </th>
        `;
    });

    html += `
                </tr>
            </thead>
            <tbody>
                <tr class="bg-amber-50/60 font-bold text-amber-900 border-b border-slate-300">
                    <td class="p-2 bg-amber-100 font-bold">Room No.</td>
    `;

    appSettings.periods.forEach(() => {
        html += `<td class="p-2 font-extrabold text-emerald-800">${targetClass.roomNo || "-"}</td>`;
    });

    html += `
                </tr>
                <tr class="bg-white">
                    <td class="p-3 font-bold bg-slate-100 text-slate-800">Subject & Teacher</td>
    `;

    appSettings.periods.forEach(p => {
        const lesson = scheduleResult.classSchedule[targetClass.id][p.id];
        const cwGroups = (typeof getPeriodGroupEntries === 'function') ? getPeriodGroupEntries(targetClass.id, p.id) : [];
        const cwGroupsHtml = cwGroups.map(g => { const gt = teacherMap[g.teacherId]; return '<div class="border-t border-dashed border-amber-300 mt-1.5 pt-1"><div class="font-black text-blue-900 text-sm">' + g.subjectName + '</div><div class="text-xs text-indigo-800 font-bold mt-0.5">' + (gt ? gt.name : '') + '</div></div>'; }).join('');
        if (cwGroups.length) {
            html += `<td class="p-2 border border-slate-300 bg-amber-50/60">${cwGroupsHtml}</td>`;
        } else if (lesson) {
            const t = teacherMap[lesson.teacherId];
            html += `
                <td class="p-2 border border-slate-300 table-cell-period bg-blue-50/40">
                    <div class="font-black text-blue-900 text-sm">${lesson.subjectName}</div>
                    <div class="text-xs text-indigo-800 font-bold mt-1">${t ? t.name : ''}</div>
                </td>
            `;
        } else {
            html += `<td class="p-2 border border-slate-300"></td>`;
        }
    });

    html += `</tr></tbody></table>`;
    return html;
}

function renderClassWiseTable() {
    if (!scheduleResult) return;
    const select = document.getElementById('classSelectFilter');
    const selVal = select.value || (classesList[0] && classesList[0].id);
    if (!selVal) return;

    const teacherMap = {};
    teachersList.forEach(t => teacherMap[t.id] = t);
    const container = document.getElementById('classWiseTableContainer');

    // TASK 3: "View All Classes" — show every class timetable, one after another.
    if (selVal === 'ALL_CLASSES') {
        document.getElementById('classPrintName').innerText = 'All Classes';
        document.getElementById('classPrintRoom').innerText = '-';
        document.getElementById('classPrintIncharge').innerText = '-';
        const sorted = [...classesList].sort((a, b) => (`${a.name} - ${a.section}`).localeCompare(`${b.name} - ${b.section}`, undefined, { numeric: true, sensitivity: 'base' }));
        container.innerHTML = sorted.map(c => {
            const incharge = teacherMap[c.inchargeId] ? teacherMap[c.inchargeId].name : "-";
            return `<div class="classwise-sheet mb-6">
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700 mb-2">
                    <span>Class: <strong class="text-blue-900 text-sm">${c.name} - ${c.section}</strong></span>
                    <span>Room No: <strong class="text-emerald-800">${c.roomNo || "-"}</strong></span>
                    <span>Incharge: <strong class="text-indigo-900">${incharge}</strong></span>
                </div>` + classWiseSingleTableHtml(c, teacherMap) + `</div>`;
        }).join('');
        return;
    }

    const targetClass = classesList.find(c => c.id === selVal);
    if (!targetClass) return;

    const incharge = teacherMap[targetClass.inchargeId] ? teacherMap[targetClass.inchargeId].name : "-";

    document.getElementById('classPrintName').innerText = `${targetClass.name} - ${targetClass.section}`;
    document.getElementById('classPrintRoom').innerText = targetClass.roomNo || "-";
    document.getElementById('classPrintIncharge').innerText = incharge;

    container.innerHTML = classWiseSingleTableHtml(targetClass, teacherMap);
}

// ==========================================
// EXPORTS & HELPERS
// ==========================================
function exportMasterExcel() {
    if (!exporter) return;
    exporter.exportMasterExcel();
}

function exportTeacherWiseExcel() {
    if (!exporter) return;
    exporter.exportTeacherWiseExcel(null);
}

function exportSummaryExcel() {
    if (!exporter) return;
    exporter.exportSummaryExcel();
}

function exportClassWiseExcel() {
    if (!exporter) return;
    const cid = document.getElementById('classSelectFilter').value;
    exporter.exportClassWiseExcel(cid === 'ALL_CLASSES' ? null : cid);
}

function exportBellTimeExcel() {
    if (!exporter) return;
    exporter.exportBellTimeExcel();
}

function printBellTimePDF() {
    if (!exporter) return;
    exporter.printBellTimePDF();
}

function exportTeachersExcelAction() {
    if (!exporter) return;
    exporter.exportTeachersExcel(teachersList);
}

function exportClassesExcelAction() {
    if (!exporter) return;
    exporter.exportClassesExcel(classesList);
}

function printCurrentView(elementId, title, orientation = "portrait") {
    if (!exporter) return;
    exporter.printElement(elementId, title, orientation);
}

function initDropdowns() {
    const teacherFilter = document.getElementById('teacherFilterSelect');
    if (teacherFilter) {
        teacherFilter.innerHTML = `<option value="ALL">-- View All Teachers --</option>` +
            [...teachersList].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })).map(t => `<option value="${t.id}">${t.name} (${formatDesignation(t.designation) || 'Teacher'})</option>`).join('');
    }

    const classSelect = document.getElementById('classSelectFilter');
    if (classSelect) {
        // TASK 3: "View All Classes" as the TOP option of the Class dropdown.
        // Preserve the user's current selection across rebuilds (initDropdowns
        // runs on every save — without this the view would jump to All Classes).
        const _prevClassSel = classSelect.value;
        classSelect.innerHTML = `<option value="ALL_CLASSES">View All Classes</option>` + [...classesList].sort((a, b) => (`Class: ${a.name} - ${a.section} (${a.roomNo || ''})`).localeCompare(`Class: ${b.name} - ${b.section} (${b.roomNo || ''})`, undefined, { sensitivity: 'base' })).map(c => `<option value="${c.id}">Class: ${c.name} - ${c.section} (${c.roomNo || ''})</option>`).join('');
        if (_prevClassSel && classSelect.querySelector(`option[value="${_prevClassSel}"]`)) classSelect.value = _prevClassSel;
        else if (!_prevClassSel) { const _first = classSelect.querySelector('option:not([value="ALL_CLASSES"])'); if (_first) classSelect.value = _first.value; }
    }
}

// ==========================================
// BELL TIME MODULE (STRICTLY 2 COLUMNS: PERIOD NO. & BELL TIMING)
// ==========================================
function renderBellTimeView() {
    const tbody = document.getElementById('bellTimeTbody');
    if (!tbody) return;

    let html = "";
    appSettings.periods.forEach((p, idx) => {
        const isEven = idx % 2 === 1;
        const rowBg = isEven ? "bg-slate-50/80" : "bg-white";
        html += `
            <tr class="${rowBg} hover:bg-amber-50/50 transition">
                <td class="p-3.5 border-2 border-slate-300 font-black text-blue-950 text-base">
                    ${p.name}
                </td>
                <td class="p-3.5 border-2 border-slate-300 font-mono text-slate-900 text-base font-bold">
                    ${p.startTime} - ${p.endTime}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    try { renderStoredSignatures(); } catch (e) {}

    const breakDisp = document.getElementById('bellTimeBreakDisplay');
    if (breakDisp) {
        breakDisp.innerText = appSettings.breakTiming || "10:40 AM - 11:10 AM (After 4th Period)";
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    document.querySelectorAll('.bellTimePrintDate').forEach(el => el.innerText = dateStr);
}

// ---- Task 4: Bell Time Share WhatsApp (Ultra HD PNG) ----
// Generates the bell-time schedule as an Ultra HD PNG, downloads it, and opens
// WhatsApp with a message (wa.me cannot pre-attach files; user attaches the PNG).
function bellTimeShareWhatsApp() {
    try {
        const canvas = document.createElement('canvas');
        const W = 2400, pad = 80, rowH = 110, headH = 130, titleH = 260;
        const periods = (appSettings && appSettings.periods) || [];
        const H = titleH + headH + Math.max(periods.length, 1) * rowH + 220;
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, 0, W, 200);
        ctx.fillStyle = '#ffffff'; ctx.font = '700 76px Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Daily Bell Timing Schedule', W / 2, 95);
        ctx.font = '400 44px Arial, sans-serif';
        ctx.fillText('Govt. High School Walton Lahore', W / 2, 162);
        ctx.font = '700 44px Arial, sans-serif'; ctx.textAlign = 'left';
        ctx.fillStyle = '#1e40af'; ctx.fillRect(pad, titleH, W - pad * 2, headH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Period No.', pad + 40, titleH + 82);
        ctx.fillText('Bell Timing', pad + 900, titleH + 82);
        ctx.font = '400 42px Arial, sans-serif';
        periods.forEach((p, i) => {
            const y = titleH + headH + i * rowH;
            if (i % 2 === 0) { ctx.fillStyle = '#f1f5f9'; ctx.fillRect(pad, y, W - pad * 2, rowH); }
            ctx.fillStyle = '#0f172a';
            ctx.fillText(p.name || ('Period ' + (i + 1)), pad + 40, y + 72);
            ctx.fillText((p.startTime || '') + ' - ' + (p.endTime || ''), pad + 900, y + 72);
            ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(pad, y + rowH); ctx.lineTo(W - pad, y + rowH); ctx.stroke();
        });
        // Signatures (with uploaded signature images if available)
        const sigY = titleH + headH + Math.max(periods.length, 1) * rowH + 130;
        ctx.fillStyle = '#0f172a'; ctx.font = '700 38px Arial, sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('Incharge Time Table: ____________________', pad, sigY);
        ctx.textAlign = 'right';
        ctx.fillText('Headmaster / Principal: ____________________', W - pad, sigY);
        // Draw uploaded signatures above the lines if present
        try {
            const sigs = (typeof getStoredSignatures === 'function') ? getStoredSignatures() : {};
            const drawSig = (dataUrl, cx) => {
                if (!dataUrl) return;
                const img = new Image();
                img.onload = function () {
                    const w = 340, h = Math.round(340 * img.naturalHeight / Math.max(img.naturalWidth, 1));
                    ctx.drawImage(img, cx - w / 2, sigY - h - 12, w, h);
                };
                img.src = dataUrl;
            };
            drawSig(sigs.incharge, pad + 420);
            drawSig(sigs.principal, W - pad - 420);
        } catch (e) {}
        const link = document.createElement('a');
        link.download = 'Bell_Timings_UltraHD.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        const msg = 'Daily Bell Timing Schedule — Govt. High School Walton Lahore. Ultra HD PNG downloaded — please attach it here.';
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
        showToast('Bell timings PNG downloaded — WhatsApp opened.');
    } catch (e) { console.warn('Bell Time Share WhatsApp failed', e); showToast('Bell timings share failed.'); }
}
// Fix #23 Task 1: AM/PM auto-set from the hour (Asif's confirmed rule:
// 7-11 = AM, 12 and 1-6 = PM). Whatever meridiem was typed, the saved
// value is rewritten from the hour, so a bare "1:05" can never again be
// stored as 1:05 AM. A 24-hour entry (13:05) is converted too.
function autoMeridiemForHour(h) {
    if (h >= 7 && h <= 11) return 'AM';
    return 'PM';
}
function normalizeBellTimeString(str) {
    const s = String(str || '');
    const m = s.match(/(\d{1,2})\s*[:.]\s*(\d{2})/);
    if (!m) return s;
    let h = parseInt(m[1], 10);
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return h + ':' + m[2] + ' ' + autoMeridiemForHour(h);
}
function normalizeBellTimeField(el) {
    if (!el) return;
    const v = normalizeBellTimeString(el.value);
    if (v) el.value = v;
}
function normalizeBreakTimingString(str) {
    return String(str || '').replace(/(\d{1,2})\s*[:.]\s*(\d{2})/g, function (mm) { return normalizeBellTimeString(mm); });
}

function openEditBellTimingsModal() {
    const container = document.getElementById('bellTimingModalInputs');
    if (!container) return;

    let html = "";
    appSettings.periods.forEach(p => {
        html += `
            <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span class="w-24 font-bold text-blue-900 text-xs">${p.name}:</span>
                <div class="flex-1 flex items-center gap-1.5">
                    <input type="text" id="modal_p_start_${p.id}" value="${p.startTime}" onchange="normalizeBellTimeField(this)" class="w-full border border-slate-300 rounded px-2 py-1 font-mono text-xs" required placeholder="Start Time">
                    <span class="text-slate-400 font-bold">-</span>
                    <input type="text" id="modal_p_end_${p.id}" value="${p.endTime}" onchange="normalizeBellTimeField(this)" class="w-full border border-slate-300 rounded px-2 py-1 font-mono text-xs" required placeholder="End Time">
                </div>
            </div>
        `;
    });
    container.innerHTML = html;

    const breakInput = document.getElementById('modalBreakTiming');
    if (breakInput) {
        breakInput.value = appSettings.breakTiming || "10:40 AM - 11:10 AM (Recess)";
    }

    document.getElementById('bellTimingEditModal').classList.remove('hidden');
}

function closeEditBellTimingsModal() {
    document.getElementById('bellTimingEditModal').classList.add('hidden');
}

function saveBellTimingsFromModal(e) {
    e.preventDefault();
    archiveCurrentSchedule("Bell Timings Modification");

    appSettings.periods.forEach(p => {
        const sEl = document.getElementById(`modal_p_start_${p.id}`);
        const eEl = document.getElementById(`modal_p_end_${p.id}`);
        normalizeBellTimeField(sEl);
        normalizeBellTimeField(eEl);
        const start = sEl.value.trim();
        const end = eEl.value.trim();
        if (start) p.startTime = start;
        if (end) p.endTime = end;
    });

    const breakEl = document.getElementById('modalBreakTiming');
    const breakVal = normalizeBreakTimingString(breakEl.value.trim());
    breakEl.value = breakVal;
    if (breakVal) {
        appSettings.breakTiming = breakVal;
    }

    saveData();
    exporter = new TimetableExporter(appSettings, teachersList, classesList, scheduleResult);
    initPeriodsGrid();
    renderAllViews();
    closeEditBellTimingsModal();
    alert("Bell timings updated successfully! These timings have automatically changed in all teachers' timetables and print sheets.");
}

function initPeriodsGrid() {
    const grid = document.getElementById('periodsTimingGrid');
    if (!grid) return;

    grid.innerHTML = appSettings.periods.map(p => `
        <div class="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
            <div class="font-bold text-xs text-blue-900 flex items-center justify-between">
                <span>${p.name}</span>
                <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">P${p.id}</span>
            </div>
            <div class="space-y-1">
                <label class="text-[10px] text-slate-500">Start Time:</label>
                <input type="text" id="p_start_${p.id}" value="${p.startTime}" onchange="normalizeBellTimeField(this)" class="w-full border border-slate-300 rounded px-2 py-1 text-xs">
            </div>
            <div class="space-y-1">
                <label class="text-[10px] text-slate-500">End Time:</label>
                <input type="text" id="p_end_${p.id}" value="${p.endTime}" onchange="normalizeBellTimeField(this)" class="w-full border border-slate-300 rounded px-2 py-1 text-xs">
            </div>
        </div>
    `).join('');
}

function savePeriodTimings() {
    archiveCurrentSchedule("Timings Modification");
    appSettings.periods.forEach(p => {
        const sEl = document.getElementById(`p_start_${p.id}`);
        const eEl = document.getElementById(`p_end_${p.id}`);
        normalizeBellTimeField(sEl);
        normalizeBellTimeField(eEl);
        const start = sEl.value.trim();
        const end = eEl.value.trim();
        if (start) p.startTime = start;
        if (end) p.endTime = end;
    });

    saveData();
    exporter = new TimetableExporter(appSettings, teachersList, classesList, scheduleResult);
    renderAllViews();
    alert("Timings of all 8 periods have been saved!");
}

// ==========================================
// TEACHERS CRUD & MOBILE & FREE PERIODS
// ==========================================
function renderTeachersList() {
    const tbody = document.getElementById('teachersListTbody');
    if (!tbody) return;

    const _sortedTeachers = [...teachersList].sort((a, b) => {
        const ka = String(a.name || '').replace(/^Dr\.\s+/i, '').toLowerCase();
        const kb = String(b.name || '').replace(/^Dr\.\s+/i, '').toLowerCase();
        return ka.localeCompare(kb);
    });
    tbody.innerHTML = _sortedTeachers.map(t => {
        const inch = getInchargeInfo(t.id);
        const inchargeBadge = inch.isIncharge
            ? `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[11px]">${inch.fullText}</span>`
            : `<span class="text-slate-400 text-xs">No</span>`;

        const freeList = (t.freePeriods || []).length > 0
            ? t.freePeriods.map(p => `Period ${p}`).join(', ')
            : "None";

        return `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-3 font-bold text-slate-900">${t.name}</td>
                <td class="p-3 text-slate-600">${(t.designation || '-').toUpperCase()}</td>
                <td class="p-3 font-bold text-blue-800">${t.mobileNumber || '-'}</td>
                <td class="p-3">${inchargeBadge}</td>
                <td class="p-3">
                    <span class="text-blue-700 font-medium">${getTeacherSlipSubjects(t.id).join(', ') || '—'}</span>
                </td>
                <td class="p-3 font-bold text-amber-700">${freeList}</td>
            </tr>
        `;
    }).join('');
}

function renderFreePeriodsCheckboxes(existingFree = []) {
    const container = document.getElementById('freePeriodsCheckboxes');
    const freeSet = new Set(existingFree);

    let html = "";
    appSettings.periods.forEach(p => {
        const checked = freeSet.has(p.id) ? 'checked' : '';
        html += `
            <label class="flex flex-col items-center gap-1 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-amber-50 transition">
                <span class="font-bold text-blue-900 text-xs">${p.name}</span>
                <input type="checkbox" value="${p.id}" class="free-p-cb accent-amber-600 h-4 w-4" ${checked}>
                <span class="text-[9px] text-slate-400">Free</span>
            </label>
        `;
    });
    container.innerHTML = html;
}

function openAddTeacherModal() {
    document.getElementById('teacherModalTitle').innerText = "Add New Teacher";
    document.getElementById('teacherId').value = "";
    document.getElementById('teacherName').value = "";
    document.getElementById('teacherDesignation').value = "SST";
    document.getElementById('teacherMobile').value = "";
    document.getElementById('teacherSubjects').value = "";
    renderFreePeriodsCheckboxes([]);
    document.getElementById('teacherModal').classList.remove('hidden');
}

function editTeacher(id) {
    const t = teachersList.find(x => x.id === id);
    if (!t) return;
    document.getElementById('teacherModalTitle').innerText = "Edit Teacher Details";
    document.getElementById('teacherId').value = t.id;
    document.getElementById('teacherName').value = t.name;
    document.getElementById('teacherDesignation').value = (t.designation || "").toUpperCase(); // Patch 30, Task 2: Designation always shows in UPPERCASE
    document.getElementById('teacherMobile').value = t.mobileNumber || "";
    // Task 3 (Patch 22) + Patch 26: show the same subjects the Assigned
    // Subjects column shows — timetable subjects plus the teacher's written
    // subjects — so everything in the column can be edited here.
    const derivedSubjects = (typeof getWorkloadColumnSubjects === 'function') ? getWorkloadColumnSubjects(t) : [];
    document.getElementById('teacherSubjects').value = (derivedSubjects.length ? derivedSubjects : (t.subjects || [])).join(", ");
    renderFreePeriodsCheckboxes(t.freePeriods || []);
    document.getElementById('teacherModal').classList.remove('hidden');
}

function closeTeacherModal() {
    document.getElementById('teacherModal').classList.add('hidden');
}

// Task 3 / Raasta B helpers (Patch 22): subjects removed from a teacher's
// list in the Edit Teacher form also free that teacher's periods of those
// subjects in every class. Matching uses the exact subject names the
// Assigned Subjects column shows (the teacher's slip subjects).
function aaRemovedSubjectNames(oldList, newList) {
    const norm = (s) => (s || '').trim().toLowerCase();
    const keep = new Set((newList || []).map(norm));
    return (oldList || []).filter(n => n && norm(n) !== '' && !keep.has(norm(n)));
}
function freeTeacherSubjectPeriods(teacherId, removedNames) {
    if (!removedNames || !removedNames.length) return [];
    const norm = (s) => (s || '').trim().toLowerCase();
    const removed = new Set(removedNames.map(norm));
    const freed = [];
    (classesList || []).forEach(c => {
        (c.subjects || []).forEach(s => {
            if (s && s.teacherId === teacherId && s.name && s.name !== '-' && removed.has(norm(s.name))) {
                freed.push({ className: c.name, section: c.section || '', subjectName: s.name });
                s.name = '-';
                s.teacherId = '';
            }
        });
    });
    return freed;
}

// Fix #37: the teacher record in Teachers & Workload is the ONE
// canonical source for a teacher's mobile number. Staff accounts hold
// a login copy of that number; when the Chief/Admin edits the record,
// the copy is brought in step so staff keep signing in with -- and
// seeing -- the same number the slips show.
function resyncStaffAccountMobile(teacherId, mobileNumber) {
    const mob = String(mobileNumber || '').trim();
    if (!teacherId || !mob) return;
    if (typeof staffAccountsList === 'undefined' || !Array.isArray(staffAccountsList)) return;
    let changed = false;
    staffAccountsList.forEach(a => {
        if (a && a.teacherId === teacherId && a.mobile !== mob) { a.mobile = mob; changed = true; }
    });
    if (typeof currentStaffAccount !== 'undefined' && currentStaffAccount && currentStaffAccount.teacherId === teacherId && currentStaffAccount.mobile !== mob) {
        currentStaffAccount.mobile = mob;
    }
    if (changed && typeof pushStaffAccounts === 'function') pushStaffAccounts();
}

function saveTeacherAction(e) {
    e.preventDefault();
    archiveCurrentSchedule("Teacher Profile Modification");

    const id = document.getElementById('teacherId').value || `T_${Date.now()}`;
    const name = document.getElementById('teacherName').value.trim();
    const designation = document.getElementById('teacherDesignation').value.trim().toUpperCase(); // Patch 30, Task 2: Designation is always saved in UPPERCASE
    const mobileNumber = document.getElementById('teacherMobile').value.trim();
    const subjectsRaw = document.getElementById('teacherSubjects').value.trim();
    const subjects = subjectsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

    // Raasta B: subjects removed from the list free this teacher's periods
    // of those subjects in all classes (they become FREE periods).
    const _existingTeacher = (teachersList || []).find(x => x.id === id) || null;
    const _oldDerivedSubjects = _existingTeacher ? getWorkloadColumnSubjects(_existingTeacher) : [];
    const freedPeriods = freeTeacherSubjectPeriods(id, aaRemovedSubjectNames(_oldDerivedSubjects, subjects));

    const freePeriods = [];
    document.querySelectorAll('.free-p-cb:checked').forEach(cb => {
        freePeriods.push(parseInt(cb.value));
    });

    const teacherObj = {
        id,
        name,
        designation,
        mobileNumber,
        subjects,
        maxPeriodsPerDay: 6,
        freePeriods
    };

    const existingIdx = teachersList.findIndex(t => t.id === id);
    const _isNewTeacher = existingIdx < 0;
    if (existingIdx >= 0) {
        teachersList[existingIdx] = teacherObj;
    } else {
        teachersList.push(teacherObj);
    }

    saveData();
    // Fix #37: canonical mobile write -- staff login copy follows the
    // record, and this save pushes with force (the active Chief/Admin
    // editor's record wins) instead of the debounced soft push that a
    // stale baseline could divert away from the cloud.
    try { resyncStaffAccountMobile(id, mobileNumber); } catch (e) {}
    try { triggerBackgroundSync(getFullSystemDataset(), true); } catch (e) {}
    // TASK 7: date-wise history — teacher added / edited.
    logHistory('timetable', _isNewTeacher ? 'add' : 'edit', 'Teacher "' + name + '" (' + designation + ')' + (_isNewTeacher ? ' added.' : ' updated.'), { teachers: historyClone(teachersList), classes: historyClone(classesList), schedule: historyClone(scheduleResult) });
    closeTeacherModal();
    renderTeachersList();
    initDropdowns();
    updateStats();
    rebuildSchedulesFromClassSchedule();
    renderAllViews();
    renderDataDistributionView();
    if (freedPeriods.length) {
        showToast(`Teacher "${name}" saved. Removed subject(s) freed ${freedPeriods.length} period(s): ${freedPeriods.map(f => f.className + '-' + f.section + ' ' + f.subjectName).join(', ')} - assign them from Periods Detail.`);
    } else {
        showToast(`Teacher "${name}" details saved successfully!`);
    }
}

function deleteTeacher(id) {
    try {
        const t = teachersList.find(x => x.id === id);
        const teacherName = t ? t.name : 'Teacher';

        try {
            archiveCurrentSchedule("Deleted Teacher: " + teacherName);
        } catch (e) {
            console.warn("Archive note:", e);
        }

        teachersList = teachersList.filter(x => x.id !== id);

        // Clean up references in classesList
        (classesList || []).forEach(c => {
            if (c.inchargeId === id) c.inchargeId = "";
            (c.subjects || []).forEach(s => {
                if (s.teacherId === id) s.teacherId = "";
            });
        });

        // Clean up scheduleResult
        if (scheduleResult) {
            if (scheduleResult.teacherSchedule && scheduleResult.teacherSchedule[id]) {
                delete scheduleResult.teacherSchedule[id];
            }
            if (scheduleResult.classSchedule) {
                Object.keys(scheduleResult.classSchedule).forEach(cid => {
                    Object.keys(scheduleResult.classSchedule[cid] || {}).forEach(pid => {
                        const l = scheduleResult.classSchedule[cid][pid];
                        if (l && l.teacherId === id) {
                            scheduleResult.classSchedule[cid][pid] = null;
                        }
                    });
                });
            }
            if (scheduleResult.masterSchedule) {
                Object.keys(scheduleResult.masterSchedule).forEach(cid => {
                    Object.keys(scheduleResult.masterSchedule[cid] || {}).forEach(pid => {
                        const l = scheduleResult.masterSchedule[cid][pid];
                        if (l && l.teacherId === id) {
                            scheduleResult.masterSchedule[cid][pid] = null;
                        }
                    });
                });
            }
        }

        try { rebuildSchedulesFromClassSchedule(); } catch (e) { console.warn(e); }
        saveData();
        // TASK 7: date-wise history — teacher deleted.
        logHistory('timetable', 'delete', 'Teacher "' + teacherName + '" deleted.', { teachers: historyClone(teachersList), classes: historyClone(classesList), schedule: historyClone(scheduleResult) });
        try { renderTeachersList(); } catch (e) { console.warn(e); }
        try { initDropdowns(); } catch (e) { console.warn(e); }
        try { updateStats(); } catch (e) { console.warn(e); }
        try { renderAllViews(); } catch (e) { console.warn(e); }
        try { renderDataDistributionView(); } catch (e) { console.warn(e); }
        showToast(`Teacher "${teacherName}" data deleted successfully!`);
    } catch (err) {
        console.error("deleteTeacher error:", err);
        showToast("Teacher data deleted successfully!");
    }
}

// ==========================================
// CLASSES CRUD & ROOM NUMBERS
// ==========================================
function renderClassesList() {
    const tbody = document.getElementById('classesListTbody');
    if (!tbody) return;

    const teacherMap = {};
    teachersList.forEach(t => teacherMap[t.id] = t);

    tbody.innerHTML = classesList.map(c => {
        const incharge = teacherMap[c.inchargeId] ? teacherMap[c.inchargeId].name : "-";
        return `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-3 font-bold text-slate-900">${c.name}</td>
                <td class="p-3 text-slate-700 font-semibold">${c.section}</td>
                <td class="p-3 font-extrabold text-emerald-800">${c.roomNo || "-"}</td>
                <td class="p-3 font-bold text-indigo-900">${incharge}</td>
                <td class="p-3 text-xs text-slate-600">${c.subjects.length} Subjects</td>
            </tr>
        `;
    }).join('');
}

function openAddClassModal() {
    document.getElementById('classModalTitle').innerText = "Add New Class";
    document.getElementById('classId').value = "";
    document.getElementById('className').value = "";
    document.getElementById('classSection').value = "";
    document.getElementById('classRoomNo').value = "";
    populateInchargeSelect("");
    renderClassSubjectRows([]);
    document.getElementById('classModal').classList.remove('hidden');
}

function editClass(id) {
    const c = classesList.find(x => x.id === id);
    if (!c) return;
    document.getElementById('classModalTitle').innerText = "Edit Class & Room Number";
    document.getElementById('classId').value = c.id;
    document.getElementById('className').value = c.name;
    document.getElementById('classSection').value = c.section;
    document.getElementById('classRoomNo').value = c.roomNo || "";
    populateInchargeSelect(c.inchargeId);
    renderClassSubjectRows(c.subjects);
    document.getElementById('classModal').classList.remove('hidden');
}

function closeClassModal() {
    document.getElementById('classModal').classList.add('hidden');
}

function populateInchargeSelect(selectedId) {
    const select = document.getElementById('classIncharge');
    select.innerHTML = `<option value="">-- No Incharge --</option>` + [...teachersList].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })).map(t => `
        <option value="${t.id}" ${t.id === selectedId ? 'selected' : ''}>${t.name} (${formatDesignation(t.designation)})</option>
    `).join('');
}

function renderClassSubjectRows(subjects) {
    const container = document.getElementById('classSubjectsRowsContainer');
    container.innerHTML = "";
    if (subjects.length === 0) {
        addClassSubjectRow("Mathematics", "");
    } else {
        subjects.forEach(s => addClassSubjectRow(s.name, s.teacherId));
    }
}

function addClassSubjectRow(name = "", teacherId = "") {
    const container = document.getElementById('classSubjectsRowsContainer');
    const row = document.createElement('div');
    row.className = "flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 class-subject-row";

    let teacherOptions = `<option value="">-- Select Teacher --</option>`;
    [...teachersList].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })).forEach(t => {
        teacherOptions += `<option value="${t.id}" ${t.id === teacherId ? 'selected' : ''}>${t.name}</option>`;
    });

    row.innerHTML = `
        <input type="text" placeholder="Subject Name" value="${name}" class="sub-name flex-1 border border-slate-300 rounded px-2 py-1 text-xs" required>
        <select class="sub-teacher flex-1 border border-slate-300 rounded px-2 py-1 text-xs" required>
            ${teacherOptions}
        </select>
        <button type="button" onclick="this.closest('.class-subject-row').remove()" class="text-red-500 hover:text-red-700 text-xs px-2 py-1" title="Delete">
            <i class="fa-solid fa-trash-can text-base"></i>
        </button>
    `;
    container.appendChild(row);
}

function saveClassAction(e) {
    e.preventDefault();
    archiveCurrentSchedule("Class Profile Modification");

    const id = document.getElementById('classId').value || `C_${Date.now()}`;
    const name = document.getElementById('className').value.trim();
    const section = document.getElementById('classSection').value.trim();
    const roomNo = document.getElementById('classRoomNo').value.trim() || `Room ${name}`;
    const inchargeId = document.getElementById('classIncharge').value;

    const subjects = [];
    document.querySelectorAll('#classSubjectsRowsContainer .class-subject-row').forEach(row => {
        const subName = row.querySelector('.sub-name').value.trim();
        const subTeacher = row.querySelector('.sub-teacher').value;
        if (subName && subTeacher) {
            subjects.push({ name: subName, teacherId: subTeacher });
        }
    });

    const classObj = { id, name, section, roomNo, inchargeId, subjects };

    const existingIdx = classesList.findIndex(c => c.id === id);
    const _oldClass = existingIdx >= 0 ? classesList[existingIdx] : null;
    const _isNewClass = existingIdx < 0;
    if (existingIdx >= 0) {
        classesList[existingIdx] = classObj;
    } else {
        classesList.push(classObj);
    }

    saveData();
    // TASK 7: date-wise history — class added / edited.
    logHistory('timetable', _isNewClass ? 'add' : 'edit', 'Class "' + name + ' - ' + section + '" (Room ' + roomNo + ')' + (_isNewClass ? ' added.' : ' updated.'), { teachers: historyClone(teachersList), classes: historyClone(classesList), schedule: historyClone(scheduleResult) });
    // TASK 7: Class Incharges history — record who was incharge, in which
    // year, for how many months, with the change date.
    (function () {
        const _oldIn = _oldClass ? String(_oldClass.inchargeId || '') : '';
        const _newIn = String(inchargeId || '');
        if (_oldIn === _newIn) return;
        const _now = new Date();
        const _dateStr = _now.toLocaleDateString('en-GB');
        if (_newIn) {
            const _nt = (teachersList || []).find(function (x) { return String(x.id) === _newIn; });
            const _months = _oldClass ? historyInchargeMonths(id) : 0;
            logHistory('incharges', 'assigned', 'Teacher "' + ((_nt && _nt.name) || '-') + '" assigned as incharge of Class "' + name + ' - ' + section + '" — Year ' + _now.getFullYear() + ', Date ' + _dateStr + (_oldClass ? ' (previous incharge served ' + _months + ' month(s)).' : ' (new class).'), { classId: id, className: name, section: section, inchargeId: _newIn, prevInchargeId: _oldIn, months: _months, year: _now.getFullYear(), date: _dateStr });
        } else if (_oldIn) {
            const _ot = (teachersList || []).find(function (x) { return String(x.id) === _oldIn; });
            const _months = historyInchargeMonths(id);
            logHistory('incharges', 'removed', 'Teacher "' + ((_ot && _ot.name) || '-') + '" removed as incharge of Class "' + name + ' - ' + section + '" — Year ' + _now.getFullYear() + ', Date ' + _dateStr + ' (served ' + _months + ' month(s)).', { classId: id, className: name, section: section, inchargeId: '', prevInchargeId: _oldIn, months: _months, year: _now.getFullYear(), date: _dateStr });
        }
    })();
    closeClassModal();
    renderClassesList();
    initDropdowns();
    updateStats();
    rebuildSchedulesFromClassSchedule();
    renderAllViews();
    renderDataDistributionView();
    showToast(`Class "${name} - ${section}" details saved successfully!`);
}

function deleteClass(id) {
    const c = classesList.find(x => x.id === id);
    const className = c ? `${c.name} - ${c.section}` : 'Class';

    archiveCurrentSchedule("Deleted Class: " + className);
    classesList = classesList.filter(x => x.id !== id);
    // TASK 7: date-wise history — class deleted (+ incharge tenure closed).
    (function () {
        logHistory('timetable', 'delete', 'Class "' + className + '" deleted.', { teachers: historyClone(teachersList), classes: historyClone(classesList), schedule: historyClone(scheduleResult) });
        if (c && c.inchargeId) {
            const _t = (teachersList || []).find(function (x) { return String(x.id) === String(c.inchargeId); });
            const _now = new Date();
            const _months = historyInchargeMonths(id);
            logHistory('incharges', 'removed', 'Teacher "' + ((_t && _t.name) || '-') + '" removed as incharge of Class "' + className + '" (class deleted) — Year ' + _now.getFullYear() + ', Date ' + _now.toLocaleDateString('en-GB') + ' (served ' + _months + ' month(s)).', { classId: id, className: className, inchargeId: '', prevInchargeId: String(c.inchargeId), months: _months, year: _now.getFullYear(), date: _now.toLocaleDateString('en-GB') });
        }
    })();

    if (scheduleResult) {
        if (scheduleResult.classSchedule && scheduleResult.classSchedule[id]) {
            delete scheduleResult.classSchedule[id];
        }
        if (scheduleResult.masterSchedule && scheduleResult.masterSchedule[id]) {
            delete scheduleResult.masterSchedule[id];
        }
    }

    saveData();
    renderClassesList();
    initDropdowns();
    updateStats();
    rebuildSchedulesFromClassSchedule();
    renderAllViews();
    renderDataDistributionView();
    showToast(`Class "${className}" deleted successfully!`);
}

// ==========================================
// 8. SENIORITY SORTING ENGINE & DATE PARSER
// ==========================================
function parseGovtServiceDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return new Date(2099, 11, 31).getTime();
    const parts = dateStr.trim().split(/[-/.]/);
    if (parts.length === 3) {
        let day, month, year;
        if (parts[0].length === 4) {
            // YYYY-MM-DD
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            day = parseInt(parts[2], 10);
        } else {
            // DD-MM-YYYY or DD-MM-YY
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            year = parseInt(parts[2], 10);
            if (year < 100) {
                year = year > 50 ? 1900 + year : 2000 + year;
            }
        }
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day).getTime();
        }
    }
    return new Date(2099, 11, 31).getTime();
}

function getCadreRank(staff) {
    const desig = ((staff['Designation'] || '') + ' ' + (staff['Cadre'] || '')).toUpperCase();
    const name = (staff['Name with Parentage'] || '').toUpperCase();

    // 1: Principal (Always Serial 1)
    if (desig.includes('PRINCIPAL') || name.includes('IFTIKHAR AHMAD')) {
        return 1;
    }
    // 2: Dy. Headmaster (Always Serial 2)
    if (desig.includes('HEADMASTER') || desig.includes('DY.') || name.includes('MUHAMMAD AKMAL')) {
        return 2;
    }
    // 3: All SSTs (Secondary School Teachers)
    if (desig.includes('SST') || desig.includes('S.S.T')) {
        return 3;
    }
    // 4: All ESTs (Elementary School Teachers, PET, SV, Drawing, Arabic)
    if (desig.includes('EST') || desig.includes('E.S.T') || desig.includes('PET') || desig.includes('S.V') || desig.includes('DRAWING') || desig.includes('ARABIC')) {
        return 4;
    }
    // 5: All PSTs (Primary School Teachers)
    if (desig.includes('PST') || desig.includes('P.S.T')) {
        return 5;
    }
    return 6;
}

function sortStaffBySeniority(list) {
    return list.sort((a, b) => {
        const rankA = getCadreRank(a);
        const rankB = getCadreRank(b);
        if (rankA !== rankB) {
            return rankA - rankB; // 1 (Principal) -> 2 (Dy. Headmaster) -> 3 (SSTs) -> 4 (ESTs) -> 5 (PSTs) -> 6 (Others)
        }
        // Fixed order for Principal (1) and Dy Headmaster (2)
        if (rankA === 1 || rankA === 2) return 0;

        // Within same cadre (SST, EST, PST): strictly sorted by Date of Entry into Govt. Service (earliest first)
        const dateA = parseGovtServiceDate(a['Date of Entry into Govt. Service']);
        const dateB = parseGovtServiceDate(b['Date of Entry into Govt. Service']);
        if (dateA !== dateB) {
            return dateA - dateB;
        }
        // If Date of Entry is equal, higher BPS first
        const bpsA = parseInt(a['BPS No.'] || 0, 10);
        const bpsB = parseInt(b['BPS No.'] || 0, 10);
        if (bpsA !== bpsB) {
            return bpsB - bpsA;
        }
        // If equal, older age first
        const dobA = parseGovtServiceDate(a['Date of Birth']);
        const dobB = parseGovtServiceDate(b['Date of Birth']);
        return dobA - dobB;
    });
}

// ==========================================
// 9. STAFF STATEMENT (SERVICE RECORD & SENIORITY)
// ==========================================
function renderStaffStatementView() {
    const thead = document.getElementById('staffStatementThead');
    const tbody = document.getElementById('staffStatementTbody');
    const summaryBox = document.getElementById('staffStatementSummaryBox');
    const countBadge = document.getElementById('staffCountBadge');
    if (!thead || !tbody) return;

    const searchTerm = (document.getElementById('staffSearchInput')?.value || '').trim().toLowerCase();
    const cadreFilter = document.getElementById('staffCadreFilter')?.value || 'ALL';

    // Strictly high school timetable staff + Principal & Dy. Headmaster
    let activeStaff = getActiveTimetableStaff();
    if (ruleEnabled('staffSortBySeniority', true)) sortStaffBySeniority(activeStaff);

    // Filter
    let filtered = activeStaff.filter(st => {
        if (cadreFilter !== 'ALL') {
            const rank = getCadreRank(st);
            if (cadreFilter === 'SST' && rank > 3) return false;
            if (cadreFilter === 'EST' && rank !== 4) return false;
            if (cadreFilter === 'PST' && rank !== 5) return false;
        }

        if (searchTerm) {
            const combined = Object.values(st).join(' ').toLowerCase();
            return combined.includes(searchTerm);
        }
        return true;
    });

    if (countBadge) {
        countBadge.innerText = `${filtered.length} Teachers (High School & Administration: ${activeStaff.length} total staff)`;
    }

    // Dynamic Header (Strictly Read-Only, No Actions Column)
    let headerHtml = `<tr class="bg-purple-950 text-white font-extrabold text-[11px] uppercase tracking-wider">`;
    staffColumnsList.forEach(col => {
        headerHtml += `<th class="p-2 border border-purple-900 text-center whitespace-nowrap">${col}</th>`;
    });
    headerHtml += `</tr>`;
    thead.innerHTML = headerHtml;

    // Dynamic Body (Strictly Read-Only, No inline edit, No actions)
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${staffColumnsList.length}" class="p-8 text-center text-slate-400 font-bold">
                    No staff member found matching the filter or search criteria.
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filtered.map((st, idx) => {
            const originalIndex = staffStatementList.indexOf(st);
            const rank = getCadreRank(st);
            const badgeClass = (rank <= 3) 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : (rank === 4 ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300');

            let rowHtml = `<tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-purple-50/40 transition">`;
            staffColumnsList.forEach(col => {
                if (col === 'Sr. No.') {
                    rowHtml += `<td class="p-2 border border-slate-300 text-center font-bold text-slate-600 bg-slate-50">${idx + 1}</td>`;
                } else if (col === 'Job Status') {
                    const retVal = st['Date of retirement'] || st['Retirement Date'] || '';
                    const jobInfo = calculateJobStatus(retVal);
                    rowHtml += `
                        <td class="p-2 border border-slate-300 text-center whitespace-nowrap">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black border ${jobInfo.badgeClass}">
                                ${jobInfo.status}
                            </span>
                        </td>
                    `;
                } else {
                    const cellVal = st[col] || '';
                    const extraClass = (col === 'Teacher Name' || col === 'Name with Parentage') ? 'font-bold text-slate-900' :
                                       (col === "Father's Name") ? 'font-semibold text-slate-800' :
                                       (col === 'Date of Entry into Govt. Service') ? 'font-extrabold text-purple-950 bg-purple-50' :
                                       (col === 'Date of retirement') ? 'font-extrabold text-purple-900 bg-purple-50/40 text-center' :
                                       (col === 'BPS No.') ? 'font-bold text-blue-900 text-center' :
                                       (col === 'Designation') ? 'font-bold text-slate-800 text-center' : 'text-slate-700';

                    rowHtml += `
                        <td class="p-2 border border-slate-300 whitespace-nowrap ${extraClass}">
                            ${cellVal}
                        </td>
                    `;
                }
            });

            rowHtml += `</tr>`;
            return rowHtml;
        }).join('');
    }

    updateStaffSummaryCounters();

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    document.querySelectorAll('.staffStatementPrintDate').forEach(el => el.innerText = dateStr);

    try { renderStoredSignatures(); } catch (e) {}
}

function downloadStaffStatementPDF() {
    printCurrentView('printableStaffStatement', 'Staff_Statement', 'landscape');
}

// ==========================================
// TASK 6: Staff Statement — Import File (Excel .xlsx/.xls)
// Maps Excel headers to Staff Statement columns, applies Title Case to
// text fields, then replaces the Staff Statement data (after confirm).
// ==========================================
async function handleStaffStatementImport(event) {
    const file = event && event.target && event.target.files ? event.target.files[0] : null;
    if (event && event.target) event.target.value = '';
    if (!file) return;
    try {
        if (typeof XLSX === 'undefined') { showToast('Excel library not loaded.'); return; }
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) { showToast('No data found in this file.'); return; }
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!data || !data.length) { showToast('No data found in this file.'); return; }

        const norm = function (s) { return String(s == null ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase(); };
        const colNorm = {};
        (staffColumnsList || []).forEach(function (c) { colNorm[norm(c)] = c; });
        // Legacy header alias: "Name with Parentage" splits into Teacher/Father names.
        colNorm['name with parentage'] = 'Name with Parentage';

        // Find header row: first row containing at least one known column.
        let headerIdx = -1, headerMap = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i] || [];
            const map = [];
            let known = 0;
            row.forEach(function (cell, j) {
                const key = colNorm[norm(cell)];
                if (key) { map[j] = key; known++; } else { map[j] = null; }
            });
            if (known >= 1) { headerIdx = i; headerMap = map; break; }
        }
        if (headerIdx < 0) { showToast('Header row not found. The file must contain Staff Statement column names.'); return; }

        const skipped = [];
        (data[headerIdx] || []).forEach(function (cell, j) {
            if (String(cell == null ? '' : cell).trim() && !headerMap[j]) skipped.push(String(cell).trim());
        });

        // Columns that must NOT be Title-Cased (codes / dates / numbers).
        const noCaseCols = ['Sr. No.', 'Personnel #', 'CNIC #', 'BPS No.', 'Date of Birth',
            'Date of Entry into Govt. Service', 'Date of present Scale/Grade',
            'Date of Joining present place  of posting', 'Date of retirement',
            'Phone/ Cell #', 'Job Status'];

        const records = [];
        for (let i = headerIdx + 1; i < data.length; i++) {
            const row = data[i] || [];
            let allEmpty = true;
            row.forEach(function (c) { if (String(c == null ? '' : c).trim()) allEmpty = false; });
            if (allEmpty) continue;
            const rec = {};
            headerMap.forEach(function (col, j) {
                if (!col) return;
                let val = String(row[j] == null ? '' : row[j]).trim();
                if (col === 'Name with Parentage') {
                    // Split "Name S/o Father" into Teacher Name + Father's Name.
                    const m = val.split(/\s+(?:S\/|D\/)[oO]\s+/);
                    rec['Teacher Name'] = (m[0] || '').trim();
                    rec["Father's Name"] = (m[1] || '').trim();
                    rec[col] = val;
                    if (noCaseCols.indexOf('Teacher Name') < 0) rec['Teacher Name'] = toTitleCase(rec['Teacher Name']);
                    if (noCaseCols.indexOf("Father's Name") < 0) rec["Father's Name"] = toTitleCase(rec["Father's Name"]);
                    return;
                }
                if (noCaseCols.indexOf(col) < 0) val = toTitleCase(val);
                rec[col] = val;
            });
            if (!rec['Sr. No.']) rec['Sr. No.'] = String(records.length + 1);
            records.push(rec);
        }
        if (!records.length) { showToast('No staff rows found in this file.'); return; }

        const msg = 'Import ' + records.length + ' staff record(s) from "' + file.name + '"?\n'
            + (skipped.length ? ('Skipped columns (not matched): ' + skipped.join(', ') + '\n') : '')
            + 'This will REPLACE the current Staff Statement data. Continue?';
        if (!window.confirm(msg)) return;

        staffStatementList = records;
        saveData();
        // TASK 7: date-wise history — staff records imported from Excel.
        logHistory('staffStatement', 'add', 'Imported ' + records.length + ' staff record(s) from Excel file "' + (file && file.name ? file.name : '') + '" (replaced previous Staff Statement data).', { staffStatement: historyClone(staffStatementList) });
        try { renderStaffStatementView(); } catch (e) {}
        try { renderDashboardStaffViews(); } catch (e) {}
        showToast('Imported ' + records.length + ' staff record(s)' + (skipped.length ? ('. Skipped: ' + skipped.join(', ')) : '.'));
    } catch (err) {
        console.warn('Staff Statement import failed', err);
        showToast('Import failed: ' + (err && err.message ? err.message : 'Unknown error'));
    }
}

// ==========================================
// TASK 8: Class Name Plate
// Data source: classesList (Time Table Adjustment Menu / All Classes
// Overview) + teachersList for the Class Incharge name. Nothing hardcoded.
// ==========================================
function nameplateInchargeName(cls) {
    try {
        const t = (teachersList || []).find(function (x) { return String(x.id) === String(cls.inchargeId); });
        if (t && t.name) return t.name;
        if (cls.inchargeName) return cls.inchargeName;
    } catch (e) {}
    return '—';
}
function nameplateClassTitleHtml(cls) {
    const name = String((cls && cls.name) || '');
    const m = name.match(/^(\d+)(st|nd|rd|th)$/i);
    const base = m ? (m[1] + '<sup style="font-size:0.42em; vertical-align:super;">' + m[2].toLowerCase() + '</sup>') : name;
    return base + ' (' + (cls.section || '') + ')';
}
// ---- Name Plate size: presets + custom (mm), saved across sessions ----
const NAMEPLATE_PRESETS = { a4: { w: 297, h: 210 }, cnic: { w: 85.6, h: 54 }, passport: { w: 51, h: 51 } };
let nameplateSize = (function () {
    try {
        const s = JSON.parse(localStorage.getItem('ghsw_nameplate_size_v1') || 'null');
        if (s && +s.w > 0 && +s.h > 0) return { w: +s.w, h: +s.h };
    } catch (e) {}
    return { w: 297, h: 210 };
})();
function getNameplateSizeMm() { return nameplateSize; }
// ---- Name Plate text style (Patch 27, Task 2): ONE global style for ALL
// plates — Bold / Italic / Underline + font size — saved on this PC.
// Default matches the plate's existing design (bold text, 100% size).
let nameplateTextStyle = (function () {
    try {
        const s = JSON.parse(localStorage.getItem('ghsw_nameplate_style_v1') || 'null');
        if (s) return { bold: s.bold !== false, italic: !!s.italic, underline: !!s.underline, scale: Math.max(0.7, Math.min(1.4, +s.scale || 1)) };
    } catch (e) {}
    return { bold: true, italic: false, underline: false, scale: 1 };
})();
function nameplateSaveStyle() {
    try { localStorage.setItem('ghsw_nameplate_style_v1', JSON.stringify(nameplateTextStyle)); } catch (e) {}
    if (!window._applyingRemoteSync && typeof triggerBackgroundSync === 'function') { try { triggerBackgroundSync(); } catch (e) {} }
}
function nameplateToggleFmt(key) {
    nameplateTextStyle[key] = !nameplateTextStyle[key];
    nameplateSaveStyle();
    nameplateSyncStyleControls();
    nameplateRefreshView();
}
const NAMEPLATE_FONT_SCALES = [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4];
function nameplateFontScaleStep(dir) {
    let i = NAMEPLATE_FONT_SCALES.indexOf(nameplateTextStyle.scale);
    if (i < 0) i = 3;
    i = Math.max(0, Math.min(NAMEPLATE_FONT_SCALES.length - 1, i + dir));
    nameplateTextStyle.scale = NAMEPLATE_FONT_SCALES[i];
    nameplateSaveStyle();
    nameplateSyncStyleControls();
    nameplateRefreshView();
}
function nameplateResetFmt() {
    nameplateTextStyle = { bold: true, italic: false, underline: false, scale: 1 };
    nameplateSaveStyle();
    nameplateSyncStyleControls();
    nameplateRefreshView();
}
function nameplateSyncStyleControls() {
    const map = { bold: 'npFmtBold', italic: 'npFmtItalic', underline: 'npFmtUnderline' };
    Object.keys(map).forEach(function (k) {
        const b = document.getElementById(map[k]);
        if (b) b.classList.toggle('active', !!nameplateTextStyle[k]);
    });
    const lbl = document.getElementById('npFontScaleLabel');
    if (lbl) lbl.textContent = Math.round((nameplateTextStyle.scale || 1) * 100) + '%';
}
function nameplateIsDefaultSize() { return Math.abs(nameplateSize.w - 297) < 0.01 && Math.abs(nameplateSize.h - 210) < 0.01; }
function setNameplateSizeMm(w, h) {
    nameplateSize = { w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10 };
    try { localStorage.setItem('ghsw_nameplate_size_v1', JSON.stringify(nameplateSize)); } catch (e) {}
    if (!window._applyingRemoteSync && typeof triggerBackgroundSync === 'function') { try { triggerBackgroundSync(); } catch (e) {} }

    nameplateSyncSizeControls();
    nameplateUpdatePrintStyle();
    nameplateRefreshView();
}
function nameplateSetPreset(key) {
    const p = NAMEPLATE_PRESETS[key];
    if (p) setNameplateSizeMm(p.w, p.h);
}
function nameplateCustomSizeChanged() {
    const wEl = document.getElementById('npCustomW'), hEl = document.getElementById('npCustomH'), uEl = document.getElementById('npUnit');
    if (!wEl || !hEl) return;
    let w = parseFloat(wEl.value), h = parseFloat(hEl.value);
    if (!(w > 0) || !(h > 0)) return;
    if (uEl && uEl.value === 'in') { w = w * 25.4; h = h * 25.4; }
    setNameplateSizeMm(w, h);
}
function nameplateSyncSizeControls() {
    const wEl = document.getElementById('npCustomW'), hEl = document.getElementById('npCustomH'), uEl = document.getElementById('npUnit');
    if (wEl && hEl) {
        const f = (uEl && uEl.value === 'in') ? 25.4 : 1;
        wEl.value = Math.round((nameplateSize.w / f) * 100) / 100;
        hEl.value = Math.round((nameplateSize.h / f) * 100) / 100;
    }
    document.querySelectorAll('[data-np-preset]').forEach(function (b) {
        const p = NAMEPLATE_PRESETS[b.getAttribute('data-np-preset')];
        const active = p && Math.abs(p.w - nameplateSize.w) < 0.01 && Math.abs(p.h - nameplateSize.h) < 0.01;
        b.classList.toggle('active', !!active);
    });
}
function nameplateUpdatePrintStyle() {
    // Patch 20 (Task 1): non-A4 plates now print tiled on A4 sheets, so the
    // patch-19 small named-page @page rule is retired — the style stays empty.
    const st = document.getElementById('npPrintStyle');
    if (st) st.textContent = '';
}
// Patch 20 (Task 1): A4-sheet grid for small plates. A4 landscape printable
// area is ~277 x 190mm; cards tile with a 5mm gap (CNIC -> 3x3 = 9 per sheet,
// Passport -> 5x3 = 15 per sheet).
let nameplateViewMode = 'single';
function nameplateCopiesPerSheet() {
    const s = getNameplateSizeMm();
    const gap = (typeof ruleConfigNumber === 'function') ? ruleConfigNumber('nameplateTileGapMm', 5) : 5;
    const cols = Math.max(1, Math.floor((277 + gap) / (s.w + gap)));
    const rows = Math.max(1, Math.floor((190 + gap) / (s.h + gap)));
    return cols * rows;
}
function nameplateGridWrap(innerHtml) {
    const s = getNameplateSizeMm();
    const gap = (typeof ruleConfigNumber === 'function') ? ruleConfigNumber('nameplateTileGapMm', 5) : 5;
    return '<div class="nameplate-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(' + s.w + 'mm, 1fr)); gap:' + gap + 'mm;">' + innerHtml + '</div>';
}
function nameplateRefreshView() {
    const area = document.getElementById('nameplatePrintableArea');
    if (!area) return;
    const plates = area.querySelectorAll('.nameplate-page');
    if (!plates.length) return;
    if (nameplateViewMode === 'all') { nameplateViewAll(); return; }
    const classSel = document.getElementById('nameplateClassSelect');
    const secSel = document.getElementById('nameplateSectionSelect');
    if (classSel && secSel && classSel.value && secSel.value) nameplateSubmit();
}

function nameplatePlateHtml(cls) {
    const inch = nameplateInchargeName(cls);
    const inchUpper = String(inch || '—').toUpperCase();
    // Patch 27, Task 2: the one global plate text style.
    const npSt = nameplateTextStyle;
    const npSc = npSt.scale || 1;
    const npW = npSt.bold ? 900 : 400;
    const npLW = npSt.bold ? 800 : 400;
    const npIt = npSt.italic ? 'italic' : 'normal';
    const npU = npSt.underline ? 'text-decoration:underline; ' : '';
    const npClamp = function (a, b, c) { return 'clamp(' + Math.round(a * npSc) + 'px, ' + (Math.round(b * npSc * 100) / 100) + 'vw, ' + Math.round(c * npSc) + 'px)'; };
    if (nameplateIsDefaultSize()) {
        return '' +
        '<div class="nameplate-page" style="position:relative; background:#ffffff; width:100%; aspect-ratio:297/210; display:flex; align-items:center; justify-content:center; overflow:hidden; box-sizing:border-box; padding:16px;">' +
            '<div style="position:absolute; inset:14px; border:1.20cm double #0f766e; pointer-events:none;"></div>' +
            '<div style="position:absolute; inset:26px; border:2px solid #7c3aed; pointer-events:none;"></div>' +
            '<span style="position:absolute; top:4px; left:12px; color:#0f766e; font-size:24px; line-height:1;">&#10022;</span>' +
            '<span style="position:absolute; top:4px; right:12px; color:#7c3aed; font-size:24px; line-height:1;">&#10022;</span>' +
            '<span style="position:absolute; bottom:4px; left:12px; color:#7c3aed; font-size:24px; line-height:1;">&#10022;</span>' +
            '<span style="position:absolute; bottom:4px; right:12px; color:#0f766e; font-size:24px; line-height:1;">&#10022;</span>' +
            '<div style="text-align:center; position:relative; padding:10px;">' +
                '<div style="font-size:' + Math.round(150 * npSc) + 'px; font-weight:' + npW + '; font-style:' + npIt + '; ' + npU + 'color:#000000; line-height:1; font-family:Arial, sans-serif; white-space:nowrap;">' + nameplateClassTitleHtml(cls) + '</div>' +
                '<div style="font-size:' + npClamp(24, 4.5, 54) + '; font-weight:' + npLW + '; font-style:' + npIt + '; color:#000000; text-decoration:underline; text-decoration-color:#b91c1c; margin-top:' + Math.round(18 * npSc) + 'px;">Incharge:</div>' +
                '<div style="font-size:' + npClamp(28, 5.5, 64) + '; font-weight:' + npW + '; font-style:' + npIt + '; ' + npU + 'color:#000000; margin-top:' + Math.round(10 * npSc) + 'px; font-family:Arial, sans-serif;">' + inchUpper + '</div>' +
            '</div>' +
        '</div>';
    }
    const s = getNameplateSizeMm();
    const k = s.w / 297;
    const px = function (v) { return Math.round(v * k * 10) / 10; };
    return '' +
        '<div class="nameplate-page" style="position:relative; background:#ffffff; width:' + s.w + 'mm; height:' + s.h + 'mm; max-width:100%; margin:0 auto; display:flex; align-items:center; justify-content:center; overflow:hidden; box-sizing:border-box; padding:' + px(16) + 'px;">' +
            '<div style="position:absolute; inset:' + px(14) + 'px; border:' + px(45) + 'px double #0f766e; pointer-events:none;"></div>' +
            '<div style="position:absolute; inset:' + px(26) + 'px; border:' + Math.max(1, px(2)) + 'px solid #7c3aed; pointer-events:none;"></div>' +
            '<span style="position:absolute; top:' + px(4) + 'px; left:' + px(12) + 'px; color:#0f766e; font-size:' + px(24) + 'px; line-height:1;">&#10022;</span>' +
            '<span style="position:absolute; top:' + px(4) + 'px; right:' + px(12) + 'px; color:#7c3aed; font-size:' + px(24) + 'px; line-height:1;">&#10022;</span>' +
            '<span style="position:absolute; bottom:' + px(4) + 'px; left:' + px(12) + 'px; color:#7c3aed; font-size:' + px(24) + 'px; line-height:1;">&#10022;</span>' +
            '<span style="position:absolute; bottom:' + px(4) + 'px; right:' + px(12) + 'px; color:#0f766e; font-size:' + px(24) + 'px; line-height:1;">&#10022;</span>' +
            '<div style="text-align:center; position:relative; padding:' + px(10) + 'px;">' +
                '<div style="font-size:' + px(150 * npSc) + 'px; font-weight:' + npW + '; font-style:' + npIt + '; ' + npU + 'color:#000000; line-height:1; font-family:Arial, sans-serif; white-space:nowrap;">' + nameplateClassTitleHtml(cls) + '</div>' +
                '<div style="font-size:' + px(54 * npSc) + 'px; font-weight:' + npLW + '; font-style:' + npIt + '; color:#000000; text-decoration:underline; text-decoration-color:#b91c1c; margin-top:' + px(18) + 'px;">Incharge:</div>' +
                '<div style="font-size:' + px(64 * npSc) + 'px; font-weight:' + npW + '; font-style:' + npIt + '; ' + npU + 'color:#000000; margin-top:' + px(10) + 'px; font-family:Arial, sans-serif;">' + inchUpper + '</div>' +
            '</div>' +
        '</div>';
}
function renderNamePlateView() {
    const classSel = document.getElementById('nameplateClassSelect');
    const secSel = document.getElementById('nameplateSectionSelect');
    if (!classSel || !secSel) return;
    const classes = (typeof classesList !== 'undefined' && classesList) ? classesList : [];
    const names = [];
    classes.forEach(function (c) { if (c && c.name && names.indexOf(c.name) < 0) names.push(c.name); });
    names.sort(function (a, b) { return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }); });
    const prevClass = classSel.value;
    classSel.innerHTML = '<option value="">Select Class</option>' + names.map(function (n) { return '<option value="' + n + '">' + n + '</option>'; }).join('');
    if (prevClass && names.indexOf(prevClass) >= 0) classSel.value = prevClass;
    nameplateClassChanged();
    nameplateSyncSizeControls();
    nameplateSyncStyleControls();
    nameplateUpdatePrintStyle();
}
function nameplateClassChanged() {
    const classSel = document.getElementById('nameplateClassSelect');
    const secSel = document.getElementById('nameplateSectionSelect');
    if (!classSel || !secSel) return;
    const name = classSel.value;
    const secs = [];
    (classesList || []).forEach(function (c) {
        if (c && c.name === name && c.section && secs.indexOf(c.section) < 0) secs.push(c.section);
    });
    secs.sort(function (a, b) { return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }); });
    secSel.innerHTML = '<option value="">Select Section</option>' + secs.map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
    nameplateSectionChanged();
}
function nameplateSectionChanged() {
    const classSel = document.getElementById('nameplateClassSelect');
    const secSel = document.getElementById('nameplateSectionSelect');
    if (!classSel || !secSel) return;
    if (classSel.value && secSel.value) nameplateSubmit();
}

function nameplateSubmit() {
    const classSel = document.getElementById('nameplateClassSelect');
    const secSel = document.getElementById('nameplateSectionSelect');
    const area = document.getElementById('nameplatePrintableArea');
    if (!classSel || !secSel || !area) return;
    const name = classSel.value, sec = secSel.value;
    if (!name || !sec) { showToast('Please select Class and Section.'); return; }
    const cls = (classesList || []).find(function (c) { return c && c.name === name && c.section === sec; });
    if (!cls) { showToast('Class not found.'); return; }
    nameplateViewMode = 'single';
    if (nameplateIsDefaultSize()) { area.innerHTML = nameplatePlateHtml(cls); return; }
    // Small size: fill the whole A4 sheet with copies of this card.
    const copies = ((typeof ruleEnabled === 'function') && !ruleEnabled('nameplateFillSheetSingle', true)) ? 1 : nameplateCopiesPerSheet();
    let html = '';
    for (let i = 0; i < copies; i++) html += nameplatePlateHtml(cls);
    area.innerHTML = nameplateGridWrap(html);
}
function nameplateViewAll() {
    const area = document.getElementById('nameplatePrintableArea');
    if (!area) return;
    const sorted = (classesList || []).slice().sort(function (a, b) {
        const byName = String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true, sensitivity: 'base' });
        if (byName) return byName;
        return String(a.section || '').localeCompare(String(b.section || ''), undefined, { sensitivity: 'base' });
    });
    if (!sorted.length) { showToast('No classes found.'); return; }
    nameplateViewMode = 'all';
    const joined = sorted.map(function (c) { return nameplatePlateHtml(c); }).join('');
    area.innerHTML = nameplateIsDefaultSize() ? joined : nameplateGridWrap(joined);
}

function updateStaffSummaryCounters() {
    const summaryBox = document.getElementById('staffStatementSummaryBox');
    if (!summaryBox) return;

    const activeStaff = getActiveTimetableStaff();
    let sstCount = 0;
    let estCount = 0;
    activeStaff.forEach(st => {
        const rank = getCadreRank(st);
        if (rank <= 3) sstCount++;
        else if (rank === 4) estCount++;
    });

    summaryBox.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>SSTs / Admin Staff: <strong class="text-amber-800 text-sm">${sstCount}</strong></span>
        </div>
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>ESTs (Elementary Teachers): <strong class="text-blue-800 text-sm">${estCount}</strong></span>
        </div>
        <div class="flex items-center gap-2 bg-purple-900 text-white px-3 py-1.5 rounded-lg shadow-sm">
            <i class="fa-solid fa-users"></i>
            <span>High School Active Staff: <strong class="text-amber-300 text-sm">${activeStaff.length}</strong></span>
        </div>
    `;
}

function openAddStaffModal() {
    document.getElementById('staffModalTitle').innerText = "Add New Staff Member";
    document.getElementById('staffIndex').value = "-1";
    document.getElementById('staffPersonnelNo').value = "";
    if (document.getElementById('staffTeacherName')) document.getElementById('staffTeacherName').value = "";
    if (document.getElementById('staffFatherName')) document.getElementById('staffFatherName').value = "";
    if (document.getElementById('staffName')) document.getElementById('staffName').value = "";
    document.getElementById('staffCnic').value = "";
    document.getElementById('staffBps').value = "16";
    document.getElementById('staffDesignation').value = "SST";
    document.getElementById('staffQualification').value = "";
    document.getElementById('staffDob').value = "";
    document.getElementById('staffDateEntry').value = "";
    document.getElementById('staffDateScale').value = "";
    document.getElementById('staffDatePosting').value = "";
    document.getElementById('staffCadre').value = "General";
    document.getElementById('staffStatus').value = "Regular";
    document.getElementById('staffDateRetirement').value = "";
    document.getElementById('staffPhone').value = "";
    document.getElementById('staffAddress').value = "";

    renderStaffModalCustomFields(null);
    document.getElementById('staffModal').classList.remove('hidden');
}

function closeStaffModal() {
    const modal = document.getElementById('staffModal');
    if (modal) modal.classList.add('hidden');
}

function renderStaffModalCustomFields(staffRecord = null) {
    const section = document.getElementById('staffCustomFieldsSection');
    const container = document.getElementById('staffModalCustomFieldsContainer');
    if (!section || !container) return;

    const coreCols = [
        'Sr. No.', 'Personnel #', 'Teacher Name', "Father's Name", 'Name with Parentage',
        'CNIC #', 'BPS No.', 'Designation', 'Qualification', 'Date of Birth',
        'Date of Entry into Govt. Service', 'Date of present Scale/Grade',
        'Date of Joining present place  of posting', 'Date of Joining present post',
        'Cadre', 'Regular or Contract', 'Date of retirement',
        'Phone/ Cell #', 'Phone / Cell #', 'Residential Address'
    ];

    const customCols = staffColumnsList.filter(c => !coreCols.includes(c));
    if (customCols.length === 0) {
        section.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    section.classList.remove('hidden');
    container.innerHTML = customCols.map(col => {
        const val = staffRecord ? (staffRecord[col] || '') : '';
        const lowerCol = col.toLowerCase();
        let customOnInput = '';
        if (lowerCol.includes('cnic')) customOnInput = 'oninput="formatCnicInput(this)"';
        else if (lowerCol.includes('date')) customOnInput = 'oninput="formatDateInputMask(this)"';
        else if (lowerCol.includes('phone') || lowerCol.includes('mobile') || lowerCol.includes('cell')) customOnInput = 'oninput="formatMobileInput(this)"';
        return `
            <div>
                <label class="block font-bold text-purple-900 mb-1 flex items-center justify-between">
                    <span>${col}</span>
                    <span class="text-[10px] text-purple-600 font-normal">(Custom Column)</span>
                </label>
                <input type="text" data-custom-col="${col}" value="${val}" ${customOnInput} placeholder="Enter data for ${col}" class="w-full border border-purple-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-purple-500 bg-purple-50/30 text-purple-950 font-semibold">
            </div>
        `;
    }).join('');
}

function editStaffAction(index) {
    const st = staffStatementList[index];
    if (!st) return;

    document.getElementById('staffModalTitle').innerText = "Edit Staff Service Record";
    document.getElementById('staffIndex').value = index;
    document.getElementById('staffPersonnelNo').value = st['Personnel #'] || "";

    const tName = st['Teacher Name'] || (st['Name with Parentage'] ? st['Name with Parentage'].split(/\s+(?:S\/O|S\/o|D\/O|D\/o|W\/O|W\/o|s\/o|d\/o)\s+/i)[0].trim() : "");
    const fName = st["Father's Name"] || (st['Name with Parentage'] ? (st['Name with Parentage'].split(/\s+(?:S\/O|S\/o|D\/O|D\/o|W\/O|W\/o|s\/o|d\/o)\s+/i)[1] || "").trim() : "");

    if (document.getElementById('staffTeacherName')) document.getElementById('staffTeacherName').value = tName;
    if (document.getElementById('staffFatherName')) document.getElementById('staffFatherName').value = fName;
    if (document.getElementById('staffName')) document.getElementById('staffName').value = st['Name with Parentage'] || tName;

    document.getElementById('staffCnic').value = st['CNIC #'] || "";
    document.getElementById('staffBps').value = st['BPS No.'] || "";
    document.getElementById('staffDesignation').value = st['Designation'] || "";
    document.getElementById('staffQualification').value = st['Qualification'] || "";
    document.getElementById('staffDob').value = st['Date of Birth'] || "";
    document.getElementById('staffDateEntry').value = st['Date of Entry into Govt. Service'] || "";
    document.getElementById('staffDateScale').value = st['Date of present Scale/Grade'] || "";
    document.getElementById('staffDatePosting').value = st['Date of Joining present place  of posting'] || st['Date of Joining present post'] || "";
    document.getElementById('staffCadre').value = st['Cadre'] || "";
    document.getElementById('staffStatus').value = st['Regular or Contract'] || "";
    document.getElementById('staffDateRetirement').value = st['Date of retirement'] || "";
    document.getElementById('staffPhone').value = st['Phone/ Cell #'] || st['Phone / Cell #'] || "";
    document.getElementById('staffAddress').value = st['Residential Address'] || "";

    renderStaffModalCustomFields(st);
    document.getElementById('staffModal').classList.remove('hidden');
}

function saveStaffAction(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('staffIndex').value, 10);

    const teacherName = document.getElementById('staffTeacherName') 
        ? document.getElementById('staffTeacherName').value.trim() 
        : (document.getElementById('staffName') ? document.getElementById('staffName').value.trim() : '');
    const fatherName = document.getElementById('staffFatherName') ? document.getElementById('staffFatherName').value.trim() : '';
    const nameWithParentage = fatherName ? `${teacherName} S/O ${fatherName}` : teacherName;

    const record = {
        "Personnel #": document.getElementById('staffPersonnelNo').value.trim(),
        "Teacher Name": teacherName,
        "Father's Name": fatherName,
        "Name with Parentage": nameWithParentage,
        "CNIC #": document.getElementById('staffCnic').value.trim(),
        "BPS No.": document.getElementById('staffBps').value.trim(),
        "Designation": document.getElementById('staffDesignation').value.trim(),
        "Qualification": document.getElementById('staffQualification').value.trim(),
        "Date of Birth": document.getElementById('staffDob').value.trim(),
        "Date of Entry into Govt. Service": document.getElementById('staffDateEntry').value.trim(),
        "Date of present Scale/Grade": document.getElementById('staffDateScale').value.trim(),
        "Date of Joining present place  of posting": document.getElementById('staffDatePosting').value.trim(),
        "Cadre": document.getElementById('staffCadre').value.trim(),
        "Regular or Contract": document.getElementById('staffStatus').value.trim(),
        "Date of retirement": document.getElementById('staffDateRetirement').value.trim(),
        "Phone/ Cell #": document.getElementById('staffPhone').value.trim(),
        "Residential Address": document.getElementById('staffAddress').value.trim()
    };

    // Read and save all dynamic custom columns
    document.querySelectorAll('#staffModalCustomFieldsContainer input[data-custom-col]').forEach(input => {
        const colName = input.getAttribute('data-custom-col');
        if (colName) {
            record[colName] = input.value.trim();
        }
    });

    if (idx >= 0 && idx < staffStatementList.length) {
        const existing = staffStatementList[idx];
        const oldTeacherName = existing['Teacher Name'] || existing['Name with Parentage'];
        staffStatementList[idx] = Object.assign({}, existing, record);
        if (oldTeacherName && teacherName && oldTeacherName.trim().toLowerCase() !== teacherName.toLowerCase()) {
            syncTeacherNameUniversally(oldTeacherName, teacherName);
        }
    } else {
        staffStatementList.push(record);
    }

    sortStaffBySeniority(staffStatementList);
    saveData();
    // TASK 7: date-wise history — staff record added / edited.
    logHistory('staffStatement', (idx >= 0 && idx < staffStatementList.length) ? 'edit' : 'add', 'Staff record "' + teacherName + '"' + ((idx >= 0 && idx < staffStatementList.length) ? ' updated.' : ' added.'), { staffStatement: historyClone(staffStatementList) });
    closeStaffModal();
    renderStaffStatementView();
    renderDataDistributionView();
    renderAllViews();
    showToast("Staff record saved successfully and the seniority order has been arranged automatically!");
}

function deleteStaffAction(index) {
    try {
        let st = null;
        if (typeof index === 'number' && index >= 0 && index < staffStatementList.length) {
            st = staffStatementList[index];
            staffStatementList.splice(index, 1);
        } else if (typeof index === 'string') {
            const idx = staffStatementList.findIndex(x => (x['CNIC #'] === index || x['Personnel #'] === index || x['Teacher Name'] === index));
            if (idx >= 0) {
                st = staffStatementList[idx];
                staffStatementList.splice(idx, 1);
            }
        }

        saveData();
        renderStaffStatementView();
        renderDataDistributionView();
        renderAllViews();
        const name = st ? (st['Teacher Name'] || st['Name with Parentage'] || 'Staff Member') : 'Staff Member';
        // TASK 7: date-wise history — staff record deleted.
        logHistory('staffStatement', 'delete', 'Staff record "' + name + '" deleted.', { staffStatement: historyClone(staffStatementList) });
        showToast(`Staff member "${name}" record deleted!`);
    } catch (err) {
        console.error("deleteStaffAction error:", err);
        showToast("Staff record deleted!");
    }
}

function openAddColumnModal() {
    document.getElementById('newColumnNameInput').value = '';
    document.getElementById('columnModal').classList.remove('hidden');
}

function closeColumnModal() {
    document.getElementById('columnModal').classList.add('hidden');
}

function saveNewColumnAction(e) {
    e.preventDefault();
    const colName = document.getElementById('newColumnNameInput').value.trim();
    if (!colName) return;

    if (staffColumnsList.includes(colName)) {
        alert("This column already exists!");
        return;
    }

    staffColumnsList.push(colName);
    saveData();
    closeColumnModal();
    renderStaffStatementView();
    renderDataDistributionView();
    showToast(`New column "${colName}" added successfully!`);
}

// Remove Custom Column from Staff Statement
function openRemoveColumnModal() {
    const container = document.getElementById('removeColumnListContainer');
    if (!container) return;

    // Preserve core identity columns from accidental deletion
    const permanentCols = ['Sr. No.', 'Teacher Name'];
    const removable = staffColumnsList.filter(c => !permanentCols.includes(c));

    if (removable.length === 0) {
        container.innerHTML = `<p class="p-4 text-center text-slate-400 font-bold">No column available.</p>`;
    } else {
        container.innerHTML = removable.map(col => `
            <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span class="font-bold text-slate-800">${col}</span>
                <button onclick="removeCustomColumnAction('${col}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1 rounded-lg border border-red-200 transition flex items-center gap-1" title="Delete">
                    <i class="fa-solid fa-trash-can text-base"></i> Remove Column
                </button>
            </div>
        `).join('');
    }

    document.getElementById('removeColumnModal').classList.remove('hidden');
}

function closeRemoveColumnModal() {
    const modal = document.getElementById('removeColumnModal');
    if (modal) modal.classList.add('hidden');
}

function removeCustomColumnAction(colName) {
    if (!confirm(`Do you really want to remove the column "${colName}" from the Staff Statement?`)) return;

    staffColumnsList = staffColumnsList.filter(c => c !== colName);
    staffStatementList.forEach(st => {
        delete st[colName];
    });

    saveData();
    renderStaffStatementView();
    renderDataDistributionView();
    openRemoveColumnModal();
    showToast;
}

function exportStaffStatementExcelAction() {
    if (!exporter) return;
    exporter.exportStaffStatementExcel(staffStatementList, staffColumnsList);
}

// ==========================================
// 10. OFFLINE FILE STORAGE ENGINE & PREVIEW (HIGH-CAPACITY INDEXEDDB + LOCAL DISK)
// ==========================================
const IDB_NAME = "GHS_Walton_Offline_Store";
const IDB_VERSION = 1;
const IDB_STORE = "offline_files_data";
let offlineFilesDataCache = {};
let currentOfflineFilesView = 'thumb';

function openOfflineFilesDB() {
    return new Promise((resolve) => {
        if (!window.indexedDB) {
            resolve(null);
            return;
        }
        try {
            const req = indexedDB.open(IDB_NAME, IDB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) {
                    db.createObjectStore(IDB_STORE, { keyPath: "id" });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        } catch (e) {
            resolve(null);
        }
    });
}

async function saveFileToStore(id, dataUrl) {
    offlineFilesDataCache[id] = dataUrl;
    try {
        const db = await openOfflineFilesDB();
        if (db) {
            const tx = db.transaction(IDB_STORE, "readwrite");
            const store = tx.objectStore(IDB_STORE);
            store.put({ id, dataUrl });
        }
    } catch (e) {
        console.warn("IDB put err:", e);
    }

    if (isServerMode()) {
        try {
            fetch('/save_offline_file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, dataUrl })
            }).catch(() => {});
        } catch (e) {}
    }
}

async function getFileFromStore(id) {
    if (offlineFilesDataCache[id]) return offlineFilesDataCache[id];
    try {
        const db = await openOfflineFilesDB();
        if (db) {
            const p = new Promise(resolve => {
                const tx = db.transaction(IDB_STORE, "readonly");
                const store = tx.objectStore(IDB_STORE);
                const req = store.get(id);
                req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
                req.onerror = () => resolve(null);
            });
            const res = await p;
            if (res) {
                offlineFilesDataCache[id] = res;
                return res;
            }
        }
    } catch (e) {
        console.warn("IDB get err:", e);
    }

    if (isServerMode()) {
        try {
            const resp = await fetch(`/get_offline_file?id=${encodeURIComponent(id)}`);
            if (resp.ok) {
                const json = await resp.json();
                if (json && json.dataUrl) {
                    offlineFilesDataCache[id] = json.dataUrl;
                    return json.dataUrl;
                }
            }
        } catch (e) {}
    }
    return null;
}

async function deleteFileFromStore(id) {
    delete offlineFilesDataCache[id];
    try {
        const db = await openOfflineFilesDB();
        if (db) {
            const tx = db.transaction(IDB_STORE, "readwrite");
            const store = tx.objectStore(IDB_STORE);
            store.delete(id);
        }
    } catch (e) {}

    if (isServerMode()) {
        try {
            fetch('/delete_offline_file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            }).catch(() => {});
        } catch (e) {}
    }
}

function setOfflineFilesView(mode) {
    currentOfflineFilesView = mode;
    const thumbGrid = document.getElementById('offlineFilesThumbnailGrid');
    const tableContainer = document.getElementById('offlineFilesTableContainer');
    const btnThumb = document.getElementById('offlineViewBtnThumb');
    const btnList = document.getElementById('offlineViewBtnList');

    if (mode === 'list') {
        if (thumbGrid) thumbGrid.classList.add('hidden');
        if (tableContainer) tableContainer.classList.remove('hidden');
        if (btnThumb) {
            btnThumb.className = "px-2.5 py-1 text-xs font-bold rounded-md text-slate-600 hover:text-slate-900 transition";
        }
        if (btnList) {
            btnList.className = "px-2.5 py-1 text-xs font-bold rounded-md bg-teal-600 text-white shadow-xs transition";
        }
    } else {
        if (thumbGrid) thumbGrid.classList.remove('hidden');
        if (tableContainer) tableContainer.classList.add('hidden');
        if (btnThumb) {
            btnThumb.className = "px-2.5 py-1 text-xs font-bold rounded-md bg-teal-600 text-white shadow-xs transition";
        }
        if (btnList) {
            btnList.className = "px-2.5 py-1 text-xs font-bold rounded-md text-slate-600 hover:text-slate-900 transition";
        }
    }
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function handleFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
        showToast("File size is too large! Please upload a file smaller than 50 MB.");
        event.target.value = '';
        return;
    }

    showToast(`Uploading file "${file.name}"...`);

    const reader = new FileReader();
    reader.onload = async function(e) {
        const fileId = "FILE_" + Date.now();
        const dataUrl = e.target.result;

        await saveFileToStore(fileId, dataUrl);

        const fileObj = {
            id: fileId,
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type || file.name.split('.').pop().toUpperCase(),
            uploadedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        offlineFilesList.unshift(fileObj);
        saveData();
        renderOfflineFilesList();
        showToast(`File "${file.name}" (${fileObj.size}) saved successfully!`);
        event.target.value = '';
    };
    reader.onerror = function() {
        showToast("An error occurred while reading the file.");
        event.target.value = '';
    };
    reader.readAsDataURL(file);
}

const handleOfflineFileUpload = handleFileUpload;

function getFileIconClass(fileName) {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'fa-solid fa-file-pdf text-red-600';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'fa-solid fa-file-excel text-emerald-600';
    if (['doc', 'docx'].includes(ext)) return 'fa-solid fa-file-word text-blue-600';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'fa-solid fa-file-image text-purple-600';
    return 'fa-solid fa-file-lines text-teal-600';
}

function getFileIconBg(fileName) {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'bg-red-50 text-red-600 border border-red-200';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    if (['doc', 'docx'].includes(ext)) return 'bg-blue-50 text-blue-600 border border-blue-200';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'bg-purple-50 text-purple-600 border border-purple-200';
    return 'bg-teal-50 text-teal-600 border border-teal-200';
}

function renderOfflineFilesList() {
    const thumbGrid = document.getElementById('offlineFilesThumbnailGrid');
    const tbody = document.getElementById('offlineFilesTbody');
    const countBadge = document.getElementById('offlineFilesCount');

    if (countBadge) countBadge.innerText = `${offlineFilesList.length} Saved Files`;

    // 1. Render Thumbnail Grid
    if (thumbGrid) {
        if (offlineFilesList.length === 0) {
            thumbGrid.innerHTML = `
                <div class="col-span-full p-8 text-center bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-300">
                    <i class="fa-solid fa-folder-open text-4xl text-slate-300 mb-2 block"></i>
                    <p class="text-sm font-bold text-slate-600">No offline file has been saved yet</p>
                    <p class="text-xs text-slate-400 mt-1">Upload any PDF, Excel file or document through the upload box below.</p>
                </div>
            `;
        } else {
            thumbGrid.innerHTML = offlineFilesList.map(f => `
                <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-teal-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 group">
                    <div class="flex items-start gap-3">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${getFileIconBg(f.name)} group-hover:scale-105 transition">
                            <i class="${getFileIconClass(f.name)}"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                            <h4 class="font-extrabold text-xs text-slate-900 truncate" title="${f.name}">${f.name}</h4>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${f.type}</span>
                                <span class="text-[11px] font-mono font-semibold text-slate-500">${f.size}</span>
                            </div>
                            <p class="text-[10px] text-slate-400 mt-1">${f.uploadedDate}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <button onclick="previewOfflineFile('${f.id}')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-xs transition active:scale-95">
                            <i class="fa-solid fa-eye text-indigo-600"></i> Preview
                        </button>
                        <button onclick="downloadOfflineFile('${f.id}')" class="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-xs transition active:scale-95">
                            <i class="fa-solid fa-download text-emerald-600"></i> Download
                        </button>
                        <button onclick="deleteOfflineFile('${f.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-1.5 rounded-xl text-xs transition active:scale-95" title="Delete">
                            <i class="fa-solid fa-trash-can text-base"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    // 2. Render Compact Table View
    if (tbody) {
        if (offlineFilesList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-8 text-center text-slate-400">
                        <i class="fa-solid fa-folder-open text-3xl mb-2 text-slate-300 block"></i>
                        No offline file has been saved yet. Upload a file using the button below.
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = offlineFilesList.map((f, idx) => `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-2.5 text-center font-bold text-slate-500">${idx + 1}</td>
                    <td class="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                        <i class="${getFileIconClass(f.name)} text-base"></i>
                        <span class="truncate max-w-xs" title="${f.name}">${f.name}</span>
                    </td>
                    <td class="p-2.5 font-semibold text-slate-600">${f.type}</td>
                    <td class="p-2.5 font-mono text-slate-600">${f.size}</td>
                    <td class="p-2.5 text-slate-500 text-[11px]">${f.uploadedDate}</td>
                    <td class="p-2.5 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="previewOfflineFile('${f.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-xs border border-slate-300 transition flex items-center gap-1">
                                <i class="fa-solid fa-eye text-indigo-600"></i> Preview
                            </button>
                            <button onclick="downloadOfflineFile('${f.id}')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-xs border border-emerald-200 transition flex items-center gap-1">
                                <i class="fa-solid fa-download text-emerald-600"></i> Download
                            </button>
                            <button onclick="deleteOfflineFile('${f.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-1 rounded-lg text-xs border border-red-200 transition" title="Delete">
                                <i class="fa-solid fa-trash-can text-base"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }
}

async function previewOfflineFile(fileId) {
    const fileObj = offlineFilesList.find(f => f.id === fileId);
    if (!fileObj) return;

    let dataUrl = await getFileFromStore(fileId);
    if (!dataUrl && fileObj.dataUrl) dataUrl = fileObj.dataUrl;

    if (!dataUrl) {
        showToast("File data is loading, please click again in a moment...");
        return;
    }

    const titleEl = document.getElementById('filePreviewModalTitle');
    const contentEl = document.getElementById('filePreviewModalContent');
    const modal = document.getElementById('filePreviewModal');
    if (!modal || !contentEl) return;

    if (titleEl) titleEl.innerText = `${fileObj.name} (${fileObj.size})`;

    const ext = fileObj.name.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
        contentEl.innerHTML = `
            <div class="flex flex-col items-center justify-center p-2 max-w-full">
                <img src="${dataUrl}" alt="${fileObj.name}" class="max-w-full max-h-[70vh] rounded-xl shadow-lg border object-contain bg-white">
                <div class="mt-3">
                    <button onclick="downloadOfflineFile('${fileObj.id}')" class="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow">
                        <i class="fa-solid fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    } else if (ext === 'pdf') {
        contentEl.innerHTML = `
            <div class="w-full h-[75vh] flex flex-col">
                <iframe src="${dataUrl}" class="w-full flex-1 rounded-xl border border-slate-300 bg-white" title="${fileObj.name}"></iframe>
            </div>
        `;
    } else if (['txt', 'csv', 'json', 'log'].includes(ext)) {
        let textContent = "Loading...";
        try {
            const base64Data = dataUrl.split(',')[1];
            textContent = decodeURIComponent(escape(atob(base64Data)));
        } catch (e) {
            textContent = "Content could not be loaded. Please download and view it.";
        }
        contentEl.innerHTML = `
            <div class="w-full h-[70vh] flex flex-col p-2 space-y-2">
                <div class="flex justify-end">
                    <button onclick="downloadOfflineFile('${fileObj.id}')" class="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition">
                        <i class="fa-solid fa-download mr-1"></i> Download
                    </button>
                </div>
                <pre class="w-full flex-1 p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-auto border border-slate-700 whitespace-pre-wrap">${escapeHtml(textContent)}</pre>
            </div>
        `;
    } else {
        contentEl.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 shadow text-center max-w-md mx-auto">
                <div class="w-20 h-20 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-4xl mb-4 border border-teal-200">
                    <i class="${getFileIconClass(fileObj.name)}"></i>
                </div>
                <h4 class="font-extrabold text-slate-900 text-base mb-1">${fileObj.name}</h4>
                <p class="text-xs text-slate-500 mb-4 font-mono">${fileObj.size} | ${fileObj.type}</p>
                <p class="text-xs text-slate-600 mb-4">
                    This file can be viewed in its related application after downloading, instead of opening directly in the system preview.
                </p>
                <button onclick="downloadOfflineFile('${fileObj.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2">
                    <i class="fa-solid fa-download"></i> Download File
                </button>
            </div>
        `;
    }

    modal.classList.remove('hidden');
}

function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) modal.classList.add('hidden');
    const contentEl = document.getElementById('filePreviewModalContent');
    if (contentEl) contentEl.innerHTML = '';
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function downloadOfflineFile(fileId) {
    const fileObj = offlineFilesList.find(f => f.id === fileId);
    if (!fileObj) return;

    let dataUrl = await getFileFromStore(fileId);
    if (!dataUrl && fileObj.dataUrl) dataUrl = fileObj.dataUrl;

    if (!dataUrl) {
        showToast("File data could not be loaded.");
        return;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileObj.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast;
}

async function deleteOfflineFile(fileId) {
    const fileObj = offlineFilesList.find(f => f.id === fileId);
    const fileName = fileObj ? fileObj.name : 'File';

    offlineFilesList = offlineFilesList.filter(f => f.id !== fileId);
    await deleteFileFromStore(fileId);
    saveData();
    renderOfflineFilesList();
    showToast(`File "${fileName}" deleted successfully!`);
}

// Universal PDF Downloader & Direct Document Print Trigger
function downloadDocumentPdf(title, elementId, orientation = 'portrait') {
    try {
        renderAllViews();
        if (exporter && typeof exporter.printElement === 'function') {
            const oldTitle = document.title;
            document.title = `${title}_Govt_High_School_Walton_${new Date().toISOString().slice(0, 10)}`;
            exporter.printElement(elementId, title, orientation);
            setTimeout(() => {
                document.title = oldTitle;
            }, 2500);
        } else {
            openUniversalPrintPreview(elementId, title, orientation);
        }
    } catch (err) {
        console.error("downloadDocumentPdf error:", err);
        openUniversalPrintPreview(elementId, title, orientation);
    }
}

// ==========================================
// 11. UNIVERSAL PRINT PREVIEW CONTROLLER
// ==========================================
function openUniversalPrintPreview(elementId, title = "Print_Preview", defaultOrientation = "portrait") {
    currentPreviewElementId = elementId;
    currentPreviewTitle = title;
    currentPreviewOrientation = defaultOrientation;

    const targetEl = document.getElementById(elementId);
    if (!targetEl) {
        alert("Content not found.");
        return;
    }

    const titleEl = document.getElementById('previewModalTitle');
    if (titleEl) {
        titleEl.innerText = `${title.replace(/_/g, ' ')} - Print Preview`;
    }

    const paperSheet = document.getElementById('previewPaperSheet');
    if (paperSheet) {
        // Deep clone to avoid modifying active application DOM
        const clone = targetEl.cloneNode(true);

        // Strip non-printable UI controls
        clone.querySelectorAll('button, input, select, textarea, .no-print, [data-action], .action-btn, .actions-column').forEach(el => el.remove());

        // Fast attribute cleanup
        clone.querySelectorAll('[contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
            el.removeAttribute('title');
        });

        paperSheet.innerHTML = clone.innerHTML;
    }

    setPreviewOrientation(defaultOrientation);
    setPreviewZoom('fit');

    const modal = document.getElementById('universalPrintPreviewModal');
    if (modal) modal.classList.remove('hidden');
}

function closeUniversalPrintPreview() {
    const modal = document.getElementById('universalPrintPreviewModal');
    if (modal) modal.classList.add('hidden');
    const paperSheet = document.getElementById('previewPaperSheet');
    if (paperSheet) paperSheet.innerHTML = '';
}

function setPreviewOrientation(orientation) {
    currentPreviewOrientation = orientation;
    const paper = document.getElementById('previewPaperSheet');
    const btnPortrait = document.getElementById('previewBtnPortrait');
    const btnLandscape = document.getElementById('previewBtnLandscape');

    if (orientation === 'landscape') {
        if (paper) {
            paper.classList.remove('portrait');
            paper.classList.add('landscape');
        }
        if (btnLandscape) {
            btnLandscape.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-blue-600 text-white";
        }
        if (btnPortrait) {
            btnPortrait.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-300 hover:text-white";
        }
    } else {
        if (paper) {
            paper.classList.remove('landscape');
            paper.classList.add('portrait');
        }
        if (btnPortrait) {
            btnPortrait.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-blue-600 text-white";
        }
        if (btnLandscape) {
            btnLandscape.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-300 hover:text-white";
        }
    }
}

function setPreviewZoom(zoomType) {
    const paper = document.getElementById('previewPaperSheet');
    const btnFit = document.getElementById('previewBtnFit');
    const btn100 = document.getElementById('previewBtn100');

    if (zoomType === '100') {
        if (paper) paper.style.transform = 'scale(1)';
        if (btn100) btn100.className = "px-2.5 py-1.5 rounded-lg text-xs font-bold transition bg-slate-700 text-white";
        if (btnFit) btnFit.className = "px-2.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white";
    } else {
        if (paper) paper.style.transform = '';
        if (btnFit) btnFit.className = "px-2.5 py-1.5 rounded-lg text-xs font-bold transition bg-slate-700 text-white";
        if (btn100) btn100.className = "px-2.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white";
    }
}

function executePrintFromPreview() {
    if (!currentPreviewElementId || !exporter) return;
    exporter.printElement(currentPreviewElementId, currentPreviewTitle, currentPreviewOrientation);
}

// ==========================================
// 12. DATA DISTRIBUTION (CORE PROCESSING ENGINE)
// ==========================================
let currentDistributionSelectedClassId = null;

function switchDistributionSubTab(subTabId) {
    currentDistributionSubTab = subTabId;
    document.querySelectorAll('.dist-sub-btn').forEach(btn => {
        // Task 1: .dist-sub-btn-fix buttons keep black/yellow always —
        // skip all color-class manipulation for them, only toggle 'active'.
        if (btn.classList.contains('dist-sub-btn-fix')) {
            btn.classList.remove('active');
            return;
        }
        btn.classList.remove('active', 'bg-indigo-600', 'text-white');
        btn.classList.add('text-slate-600');
    });

    const activeBtn = document.getElementById(`distSubTabBtn-${subTabId}`);
    if (activeBtn) {
        if (activeBtn.classList.contains('dist-sub-btn-fix')) {
            activeBtn.classList.add('active');
        } else {
            activeBtn.classList.add('active', 'bg-indigo-600', 'text-white');
            activeBtn.classList.remove('text-slate-600');
        }
    }

    renderDataDistributionView();
}

function syncTeacherNameUniversally(oldName, newName) {
    if (!oldName || !newName || oldName.trim().toLowerCase() === newName.trim().toLowerCase()) return;
    const oldTrim = oldName.trim();
    const newTrim = newName.trim();

    // 1. Update teachersList
    let matchedTeacher = null;
    teachersList.forEach(t => {
        if (t.name.trim().toLowerCase() === oldTrim.toLowerCase()) {
            t.name = newTrim;
            matchedTeacher = t;
        }
    });

    // 2. Update staffStatementList
    staffStatementList.forEach(st => {
        const stTeacherName = (st['Teacher Name'] || '').trim();
        const stParentage = (st['Name with Parentage'] || '').trim();
        if (stTeacherName.toLowerCase() === oldTrim.toLowerCase() || 
            stParentage.toLowerCase().startsWith(oldTrim.toLowerCase())) {
            st['Teacher Name'] = newTrim;
            if (st["Father's Name"]) {
                st['Name with Parentage'] = `${newTrim} S/O ${st["Father's Name"]}`;
            } else {
                st['Name with Parentage'] = newTrim;
            }
        }
    });

    // 3. Update scheduleResult
    if (scheduleResult) {
        if (scheduleResult.classSchedule) {
            Object.values(scheduleResult.classSchedule).forEach(daySlots => {
                Object.values(daySlots).forEach(slot => {
                    if (slot && slot.teacherName && slot.teacherName.trim().toLowerCase() === oldTrim.toLowerCase()) {
                        slot.teacherName = newTrim;
                    }
                });
            });
        }
        if (scheduleResult.teacherSchedule && matchedTeacher) {
            if (scheduleResult.teacherSchedule[matchedTeacher.id]) {
                Object.values(scheduleResult.teacherSchedule[matchedTeacher.id]).forEach(slot => {
                    if (slot && slot.teacherName && slot.teacherName.trim().toLowerCase() === oldTrim.toLowerCase()) {
                        slot.teacherName = newTrim;
                    }
                });
            }
        }
    }

    saveData();
    renderAllViews();
    showToast(`The teacher's name has been synced successfully in all documents and timetables: ${oldTrim} ➔ ${newTrim}`);
}

function syncAndRegenerateAction() {
    try {
        try {
            archiveCurrentSchedule("Data Distribution Sync & Manual Re-generation");
        } catch (e) {
            console.warn(e);
        }

        // 1. Rebuild schedules directly from assigned classes & slots
        rebuildSchedulesFromClassSchedule();

        // 2. Refresh exporter
        if (typeof TimetableExporter !== 'undefined') {
            exporter = new TimetableExporter(appSettings, teachersList, classesList, scheduleResult);
        }

        // 3. Save locally and trigger background cloud sync
        saveData();

        // 4. Update stats and all view tabs
        try { updateStats(); } catch (e) { console.warn(e); }
        try { renderAllViews(); } catch (e) { console.warn(e); }
        try { renderDataDistributionView(); } catch (e) { console.warn(e); }

        if (typeof triggerBackgroundSync === 'function') {
            triggerBackgroundSync();
        }

        showToast("All data, classes, incharges and the timetable have been synced and permanently saved successfully!");
    } catch (err) {
        console.error("syncAndRegenerateAction error:", err);
        showToast("Data synced successfully!");
    }
}

function handleDistributionTeacherNameEdit(el, teacherId) {
    const t = teachersList.find(x => x.id === teacherId);
    if (!t) return;
    const newName = el.innerText.trim();
    if (!newName || newName === t.name) return;
    const oldName = t.name;
    t.name = newName;
    syncTeacherNameUniversally(oldName, newName);
}

function handleClassInchargeChange(classId, teacherId) {
    const c = classesList.find(x => x.id === classId);
    if (!c) return;
    c.inchargeId = teacherId || null;
    saveData();
    renderAllViews();
    renderDataDistributionView();
    const t = teachersList.find(x => x.id === teacherId);
    showToast(`Class ${c.name} - ${c.section} incharge changed: ${t ? t.name : 'None'}`);
}

function updateClassSubjectTeacher(classId, subjectIndex, teacherId) {
    const c = classesList.find(x => x.id === classId);
    if (!c || !c.subjects || !c.subjects[subjectIndex]) return;
    c.subjects[subjectIndex].teacherId = teacherId;
    saveData();
    renderAllViews();
    renderDataDistributionView();
    showToast(`The teacher of subject "${c.subjects[subjectIndex].name}" has been changed!`);
}

function updateClassSubjectName(classId, subjectIndex, newName) {
    const c = classesList.find(x => x.id === classId);
    if (!c || !c.subjects || !c.subjects[subjectIndex]) return;
    c.subjects[subjectIndex].name = newName.trim();
    saveData();
    renderAllViews();
    showToast(`Subject name changed: ${newName}`);
}

function addClassSubjectSlot(classId) {
    const c = classesList.find(x => x.id === classId);
    if (!c) return;
    if (!c.subjects) c.subjects = [];
    c.subjects.push({
        name: `Subject ${c.subjects.length + 1}`,
        teacherId: teachersList[0] ? teachersList[0].id : ""
    });
    saveData();
    renderAllViews();
    renderDataDistributionView();
    showToast(`New subject slot added in class ${c.name} - ${c.section}!`);
}

function removeClassSubjectSlot(classId, subjectIndex) {
    const c = classesList.find(x => x.id === classId);
    if (!c || !c.subjects || !c.subjects[subjectIndex]) return;
    const subName = c.subjects[subjectIndex].name;
    if (!confirm(`Do you really want to remove the subject "${subName}" from this class?`)) return;
    c.subjects.splice(subjectIndex, 1);
    saveData();
    renderAllViews();
    renderDataDistributionView();
    showToast(`Subject "${subName}" removed successfully!`);
}

function selectDistributionClassAllocations(classId) {
    currentDistributionSelectedClassId = classId;
    switchDistributionSubTab('allocations');
}

function renderDataDistributionView() {
    const container = document.getElementById('distributionMainContainer');
    if (!container) return;

    if (currentDistributionSubTab === 'teachers') {
        renderDistTeachersSubTab(container);
    } else if (currentDistributionSubTab === 'classes') {
        renderDistClassesSubTab(container);
    } else if (currentDistributionSubTab === 'allocations') {
        renderDistAllocationsSubTab(container);
    } else if (currentDistributionSubTab === 'statement') {
        renderDistStatementSubTab(container);
    }
}

// Sub-Tab 1: Teachers & Workload
function renderDistTeachersSubTab(container) {
    const searchVal = (document.getElementById('distTeacherSearchInput')?.value || '').trim().toLowerCase();

    // Workload calculation map
    const workloadMap = {};
    teachersList.forEach(t => workloadMap[t.id] = 0);
    classesList.forEach(c => {
        (c.subjects || []).forEach(s => {
            if (s.teacherId && workloadMap[s.teacherId] !== undefined) {
                workloadMap[s.teacherId]++;
            }
        });
    });

    const filtered = teachersList.filter(t => {
        if (!searchVal) return true;
        return t.name.toLowerCase().includes(searchVal) ||
               (t.designation || '').toLowerCase().includes(searchVal) ||
               (t.mobileNumber || '').includes(searchVal) ||
               (t.subjects || []).join(' ').toLowerCase().includes(searchVal);
    });

    let html = `
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div class="flex items-center gap-3">
                    <span class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-lg font-black">
                        <i class="fa-solid fa-user-tie"></i>
                    </span>
                    <div>
                        <h3 class="font-extrabold text-base text-slate-900">Teachers & Workload Control</h3>
                        <p class="text-xs text-slate-500">Click a teacher's name to rename directly; the update applies automatically in all timetables and documents.</p>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <input type="text" id="distTeacherSearchInput" value="${searchVal}" oninput="renderDataDistributionView()" placeholder="Search teacher..." class="border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 w-44">
                    <button onclick="openAddTeacherModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow transition">
                        <i class="fa-solid fa-user-plus"></i> Add New Teacher
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-xs text-left border-collapse">
                    <thead class="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                        <tr>
                            <th class="p-2.5 text-center border-r border-slate-800 w-12">Sr.</th>
                            <th class="p-2.5 border-r border-slate-800 w-16 text-center">ID</th>
                            <th class="p-2.5 border-r border-slate-800">Teacher Name (Live Edit)</th>
                            <th class="p-2.5 border-r border-slate-800 text-center">Designation</th>
                            <th class="p-2.5 border-r border-slate-800 text-center">Mobile #</th>
                            <th class="p-2.5 border-r border-slate-800">Assigned Subjects</th>
                            <th class="p-2.5 border-r border-slate-800 text-center">Workload</th>
                            <th class="p-2.5 border-r border-slate-800 text-center">Incharge Of</th>
                            <th class="p-2.5 border-r border-slate-800 text-center">Free Period</th>
                            <th class="p-2.5 text-center w-24 actions-column no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
    `;

    if (filtered.length === 0) {
        html += `<tr><td colspan="10" class="p-8 text-center text-slate-400 font-bold">No teacher found.</td></tr>`;
    } else {
        filtered.forEach((t, idx) => {
            const inch = getInchargeInfo(t.id);
            const inchargeBadge = inch.isIncharge
                ? `<span class="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">${inch.fullText}</span>`
                : `<span class="text-slate-400 text-[11px]">No</span>`;

            const freeList = (t.freePeriods || []).length > 0
                ? t.freePeriods.map(p => `P${p}`).join(', ')
                : "-";

            const count = workloadMap[t.id] || 0;
            const workloadBadge = (count > 6)
                ? `<span class="bg-red-100 text-red-800 font-black px-2 py-0.5 rounded-full border border-red-300 text-[11px]">${count} Periods</span>`
                : (count === 6 
                    ? `<span class="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300 text-[11px]">${count} Periods (Complete)</span>`
                    : `<span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300 text-[11px]">${count} Periods</span>`);

            html += `
                <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-indigo-50/40 transition">
                    <td class="p-2.5 text-center font-bold text-slate-600 bg-slate-100/50">${idx + 1}</td>
                    <td class="p-2.5 font-mono text-center text-slate-500 font-bold">${t.id}</td>
                    <td class="p-2.5 font-black text-slate-900 editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleDistributionTeacherNameEdit(this, '${t.id}')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to Edit">
                        ${t.name}
                    </td>
                    <td class="p-2.5 text-center font-bold text-slate-700">${(t.designation || '-').toUpperCase()}</td>
                    <td class="p-2.5 text-center font-mono font-bold text-blue-900">${t.mobileNumber || '-'}</td>
                    <td class="p-2.5 text-indigo-700 font-semibold">${getWorkloadColumnSubjects(t).join(', ') || '—'}</td>
                    <td class="p-2.5 text-center">${workloadBadge}</td>
                    <td class="p-2.5 text-center">${inchargeBadge}</td>
                    <td class="p-2.5 text-center font-bold text-amber-700">${freeList}</td>
                    <td class="p-2.5 text-center actions-column no-print">
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="editTeacher('${t.id}')" class="bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded text-xs transition" title="Edit">
                                <i class="fa-solid fa-pencil text-base"></i>
                            </button>
                            <button onclick="deleteTeacher('${t.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded text-xs transition" title="Delete">
                                <i class="fa-solid fa-trash-can text-base"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div>`;
    container.innerHTML = html;
}

// Sub-Tab 2: Timetable Adjustment Manu (All-in-One Master Timetable Controller)
function renderDistAdjustmentSubTab(container) {
    if (!currentAdjustmentClassId && classesList.length > 0) {
        currentAdjustmentClassId = classesList[0].id;
    }

    const currentClass = classesList.find(c => c.id === currentAdjustmentClassId) || classesList[0];
    if (!currentClass) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400 font-bold">No class exists. Click the "New Class" button above.</div>`;
        return;
    }

    // Teacher map lookup
    const teacherMap = {};
    teachersList.forEach(t => teacherMap[t.id] = t);

    // Current incharge teacher
    const inchargeTeacher = teacherMap[currentClass.inchargeId] || null;

    // Ensure 8 period slots in currentClass.subjects
    if (!currentClass.subjects) currentClass.subjects = [];
    while (currentClass.subjects.length < appSettings.periods.length) {
        currentClass.subjects.push({
            name: "General Studies",
            teacherId: teachersList[0] ? teachersList[0].id : ""
        });
    }

    // Class selection dropdown options (sorted alphabetically by display text)
    let classOptionsHtml = [...classesList].sort((a, b) => (`${a.name} - ${a.section} (${a.roomNo || 'Room'})`).localeCompare(`${b.name} - ${b.section} (${b.roomNo || 'Room'})`, undefined, { sensitivity: 'base' })).map(c => `
        <option value="${c.id}" ${c.id === currentClass.id ? 'selected' : ''}>
            ${c.name} - ${c.section} (${c.roomNo || 'Room'})
        </option>
    `).join('');

    // Incharge dropdown options (shows Name, Mobile, and Subjects) — teachers sorted alphabetically by name
    let inchargeSelectHtml = `<option value="">-- No Incharge --</option>`;
    [...teachersList].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })).forEach(t => {
        const isSel = (t.id === currentClass.inchargeId) ? 'selected' : '';
        const phone = t.mobileNumber ? ` | 📱 ${t.mobileNumber}` : '';
        const subj = (t.subjects && t.subjects.length > 0) ? ` | 📚 ${t.subjects.join(', ')}` : '';
        inchargeSelectHtml += `<option value="${t.id}" ${isSel}>${t.name} (${formatDesignation(t.designation) || 'Teacher'})${phone}${subj}</option>`;
    });

    // 1st Column dropdowns: Class / Section / Room (user-specified orders, NOT alphabetical).
    // If the current value is not in the list, it is appended as an extra selected option (never lose data).
    const buildPreservingSelectOptions = (options, currentValue) => {
        const cur = currentValue || '';
        let opts = options.map(o => `<option value="${o}" ${o === cur ? 'selected' : ''}>${o}</option>`).join('');
        if (cur && !options.includes(cur)) opts += `<option value="${cur}" selected>${cur}</option>`;
        return opts;
    };
    const classNameOptionsHtml = buildPreservingSelectOptions(['ECE', 'Prep', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'], currentClass.name);
    const sectionOptionsHtml = buildPreservingSelectOptions(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], currentClass.section);
    const roomOptionsHtml = buildPreservingSelectOptions(['101', '102', '103', '104', '105', '201', '202', '203', '204', '205', '206', '207', '208', '209', '301', '302', '303', '304', '305', '306', '401', '402', '403', '404', '405', 'ECE', 'Hall'], currentClass.roomNo || '');

    let html = `
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <!-- Header Banner -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div class="flex items-center gap-3">
                    <span class="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-lg font-black shadow-sm">
                        <i class="fa-solid fa-sliders"></i>
                    </span>
                    <div>
                        <h3 class="font-extrabold text-base text-slate-900">Timetable Adjustment Menu</h3>
                        <p class="text-xs text-slate-500">
                            Set the class, section, room #, incharge and the subjects & teachers of all 8 periods from one window. Changes apply instantly in all slips and charts.
                        </p>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <label class="text-xs font-bold text-slate-700">Select Class:</label>
                    <select onchange="selectAdjustmentClass(this.value)" class="border-2 border-red-500 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-red-500 shadow-sm">
                        ${classOptionsHtml}
                    </select>
                    <div class="flex flex-col gap-1">
                    <button onclick="openAddClassModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 shadow transition">
                        <i class="fa-solid fa-plus"></i> New Class
                    </button>
                    <button onclick="undoAdjustmentToUploaded()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 shadow transition" title="Restore timetable to the last uploaded file setting">
                        <i class="fa-solid fa-rotate-left"></i> Undo
                    </button>
                    <button onclick="document.getElementById('uploadTimetableInput').click()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 shadow transition" title="Import timetable from Word (.docx) or Excel (.xlsx) file">
                        <i class="fa-solid fa-upload"></i> Upload Time Table
                    </button>
                    </div>
                    <input type="file" id="uploadTimetableInput" accept=".docx,.xlsx" style="display:none" onchange="handleUploadTimetableFile(event)">
                </div>
            </div>

            <div class="mt-3">
                <button onclick="autoAdjustTimetable()" class="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition" title="Auto-generate the complete timetable from the assigned subjects">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Auto Adjust Time Table
                </button>
                <p class="text-[11px] text-slate-500 mt-1 text-center">Opens the teacher periods list - set how many periods of each teacher will be generated. Every class's Period 1 is its Class Incharge; teachers only teach their Teachers &amp; Workload subjects; SST first in 9th/10th, EST/PST in 6th-8th (Physics, Chemistry, Biology, English, Math also allowed in 9th/10th after SST), PET only Health &amp; Physical Education in 9th/10th; zero teacher clash. Your current timetable is saved first (Undo brings it back).</p>
            </div>
            <div class="mt-2">
                <button onclick="autoShuffleTimetable()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition" title="Generate a completely different clash-free timetable">
                    <i class="fa-solid fa-shuffle"></i> Auto Shuffling
                </button>
                <p class="text-[11px] text-slate-500 mt-1 text-center">Every click generates a completely different, fully populated, zero-clash timetable with the same rules. Class Incharges stay fixed in Period 1 and frozen periods stay fixed. Your current timetable is saved first (Undo brings it back).</p>
            </div>

            <!-- SECTION 1: MASTER CLASS INFORMATION (Class, Section, Room #, Incharge) -->
            <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-4 border border-indigo-800/40">
                <div class="flex items-center justify-between border-b border-indigo-800/60 pb-2.5">
                    <span class="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <span>1st Column: Basic Information & Class Incharge Selection (incl. Mobile & Subjects)</span>
                    </span>
                    <span class="text-[11px] bg-indigo-800/80 px-2.5 py-0.5 rounded-full text-indigo-200 font-mono">
                        Class ID: ${currentClass.id}
                    </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <!-- 1. Class -->
                    <div>
                        <label class="block font-bold text-xs text-indigo-200 mb-1">Class:</label>
                        <select onchange="selectAdjustmentClassByNameSection('name', this.value)" class="w-full bg-slate-800 border border-indigo-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-400">
                            ${classNameOptionsHtml}
                        </select>
                    </div>

                    <!-- 2. Section -->
                    <div>
                        <label class="block font-bold text-xs text-indigo-200 mb-1">Section:</label>
                        <select onchange="selectAdjustmentClassByNameSection('section', this.value)" class="w-full bg-slate-800 border border-indigo-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-400">
                            ${sectionOptionsHtml}
                        </select>
                    </div>

                    <!-- 3. Room No. -->
                    <div>
                        <label class="block font-bold text-xs text-indigo-200 mb-1">Room #:</label>
                        <select onchange="updateAdjustmentClassField('${currentClass.id}', 'roomNo', this.value)" class="w-full bg-slate-800 border border-indigo-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-400">
                            ${roomOptionsHtml}
                        </select>
                    </div>

                    <!-- 4. Class Incharge -->
                    <div>
                        <label class="block font-bold text-xs text-amber-300 mb-1">Class Incharge:</label>
                        <select onchange="updateAdjustmentClassField('${currentClass.id}', 'inchargeId', this.value)" class="w-full bg-slate-800 border-2 border-amber-400 text-white font-bold text-xs rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-amber-400">
                            ${inchargeSelectHtml}
                        </select>
                    </div>
                </div>

                <!-- Incharge Live Detail Badge -->
                <div class="bg-indigo-900/60 p-3 rounded-xl border border-indigo-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                            <i class="fa-solid fa-id-badge text-sm"></i>
                        </span>
                        <div>
                            <span class="text-indigo-300 text-[11px]">Assigned Class Incharge:</span>
                            <span class="font-extrabold text-emerald-400 ml-1">
                                ${inchargeTeacher ? inchargeTeacher.name : 'No incharge assigned'}
                            </span>
                            ${inchargeTeacher ? `<span class="text-indigo-200 text-[11px] ml-2 font-mono">(${formatDesignation(inchargeTeacher.designation) || 'Teacher'})</span>` : ''}
                        </div>
                    </div>
                    ${inchargeTeacher ? `
                        <div class="flex items-center gap-4 text-xs font-semibold text-slate-200">
                            <span><i class="fa-solid fa-phone text-amber-300 mr-1"></i> Phone Number: <strong class="font-mono text-white">${inchargeTeacher.mobileNumber || '-'}</strong></span>
                            <span><i class="fa-solid fa-book-open text-sky-300 mr-1"></i> Subjects: <strong class="text-white">${(inchargeTeacher.subjects || []).join(', ') || '-'}</strong></span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- SECTION 2: 8 PERIODS ADJUSTMENT MATRIX (Period 1 to 8) -->
            <div class="space-y-3" id="adjPeriodsDetailSection">
                <div class="flex items-center justify-between border-b pb-2">
                    <h4 class="font-bold text-sm text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-clock text-amber-600"></i>
                        <span>Periods Detail (Periods 1 to 8: Subject & Concerned Teacher Selection)</span>
                    </h4>
                    <span class="text-xs text-slate-500 font-medium">
                        Total 8 Periods | Teacher-wise slips, class incharges and the master chart will sync automatically
                    </span>
                </div>

                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                    <table class="w-full text-xs text-left border-collapse">
                        <thead class="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                            <tr>
                                <th class="p-2.5 text-center border-r border-slate-800 w-28">Period No. & Timing</th>
                                <th class="p-2.5 border-r border-slate-800 w-1/4">Subject</th>
                                <th class="p-2.5 border-r border-slate-800">Multi Teachers (Groups)</th>
                                <th class="p-2.5 border-r border-slate-800 w-1/3">Concern Subject Teacher</th>
                                <th class="p-2.5 border-r border-slate-800">Teacher's Phone & Subjects</th>
                                <th class="p-2.5 text-center w-20 actions-column no-print">Quick Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
    `;

    appSettings.periods.forEach((p, pIdx) => {
        const lesson = (scheduleResult && scheduleResult.classSchedule && scheduleResult.classSchedule[currentClass.id])
            ? scheduleResult.classSchedule[currentClass.id][p.id]
            : null;

        const subObj = currentClass.subjects[pIdx] || { name: "", teacherId: "" };
        const currentSubName = lesson ? lesson.subjectName : (subObj.name || "");
        const currentTeacherId = lesson ? lesson.teacherId : (subObj.teacherId || "");

        const teacherObj = teacherMap[currentTeacherId] || null;

        // Teacher select options (teachers sorted alphabetically by name)
        let teacherOptions = `<option value="">-- Select Teacher --</option>`;
        [...teachersList].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })).forEach(t => {
            const isSel = (t.id === currentTeacherId) ? 'selected' : '';
            teacherOptions += `<option value="${t.id}" ${isSel}>${t.name} (${formatDesignation(t.designation) || 'Teacher'})</option>`;
        });

        const isEven = pIdx % 2 === 1;
        const periodGroups = (typeof getPeriodGroupEntries === 'function') ? getPeriodGroupEntries(currentClass.id, p.id) : [];
        const groupsDetailText = periodGroups.length ? periodGroups.map(g => `${g.subjectName} — ${(teacherMap[g.teacherId] || {}).name || ''} (${g.group || 'Group'})`).join(', ') : '—';
        const groupTeacherNames = periodGroups.map(g => (teacherMap[g.teacherId] || {}).name || '').filter(Boolean).join(', ');

        html += `
            <tr class="${isEven ? 'bg-slate-50/80' : 'bg-white'} hover:bg-amber-50/40 transition">
                <!-- Period No & Timing -->
                <td class="p-2.5 text-center border-r border-slate-200 font-extrabold text-blue-950 bg-slate-100/60">
                    <div class="text-xs font-black">${p.name}</div>
                    <div class="text-[10px] font-mono text-slate-500">${p.startTime} - ${p.endTime}</div>
                </td>

                <!-- Subject Name -->
                <td class="p-2.5 border-r border-slate-200">
                    <input type="text"
                        value="${currentSubName}"
                        placeholder="Enter subject (e.g.: English / Chemistry)"
                        onchange="updateAdjustmentPeriodSubject('${currentClass.id}', ${pIdx}, this.value)"
                        class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500">
                </td>

                <!-- Multi Teachers (Groups) Detail -->
                <td class="p-2.5 border-r border-slate-200">
                    <div class="text-[11px] font-bold text-indigo-800 leading-relaxed">${groupsDetailText}</div>
                </td>

                <!-- Teacher Selector (plain text names when this period has multi teachers) -->
                <td class="p-2.5 border-r border-slate-200">
                    ${periodGroups.length ? `
                        <div class="text-xs font-bold text-slate-800 py-1.5">${groupTeacherNames}</div>
                    ` : `
                    <select onchange="updateAdjustmentPeriodTeacher('${currentClass.id}', ${pIdx}, this.value)"
                        class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500">
                        ${teacherOptions}
                    </select>
                    `}
                </td>

                <!-- Teacher Phone & Subjects Live Info -->
                <td class="p-2.5 border-r border-slate-200">
                    ${teacherObj ? `
                        <div class="flex items-center gap-3 text-[11px]">
                            <span class="font-mono text-blue-900 font-bold flex items-center gap-1">
                                <i class="fa-solid fa-phone text-emerald-600"></i> ${teacherObj.mobileNumber || '-'}
                            </span>
                            <span class="text-slate-600 truncate max-w-xs" title="${getTeacherSlipSubjects(teacherObj.id).join(', ')}">
                                <i class="fa-solid fa-book-bookmark text-indigo-500"></i> ${getTeacherSlipSubjects(teacherObj.id).join(', ') || '—'}
                            </span>
                        </div>
                    ` : `<span class="text-slate-400 text-xs italic">No teacher selected</span>`}
                </td>

                <!-- Quick Action -->
                <td class="p-2.5 text-center actions-column no-print">
                    <button onclick="clearAdjustmentPeriodSlot('${currentClass.id}', ${pIdx})"
                        class="bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 p-1.5 rounded text-xs transition" title="Clear Period Slot">
                        <i class="fa-solid fa-eraser"></i>
                    </button>
                    <button onclick="openMultiGroupModal('${currentClass.id}', ${p.id})"
                        class="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-1.5 rounded text-[10px] transition shadow-sm" title="Manage Multi-Teachers / Groups for this period">
                        <i class="fa-solid fa-users"></i> Manage Multi Teachers${periodGroups.length ? ` (${periodGroups.length + (currentTeacherId ? 1 : 0)})` : ''}
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Bottom Action Toolbar -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                <div class="text-xs text-slate-500 font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-circle-check text-emerald-600"></i>
                    <span>Changes made here update the teacher-wise slips, class incharges and the master timetable live.</span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="syncAndRegenerateAction()" class="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2 px-4 rounded-xl shadow transition flex items-center gap-1.5 hover:scale-105 active:scale-95">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <span>Sync &amp; Update All</span>
                    </button>
                </div>
            </div>

            <!-- SECTION 3: ALL CLASSES AT A GLANCE TABLE -->
            <div class="space-y-3 pt-4 border-t">
                <div class="flex items-center justify-between">
                    <h4 class="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-table-list text-indigo-600"></i>
                        <span>All Classes Overview</span>
                    </h4>
                    <span class="text-xs font-bold text-slate-500">${classesList.length} classes are listed</span>
                </div>

                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                    <table class="w-full text-xs text-left border-collapse">
                        <thead class="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                            <tr>
                                <th class="p-2.5 text-center border-r border-slate-800 w-12">Sr.</th>
                                <th class="p-2.5 border-r border-slate-800">Class & Section</th>
                                <th class="p-2.5 border-r border-slate-800 text-center">Room No.</th>
                                <th class="p-2.5 border-r border-slate-800">Class Incharge</th>
                                <th class="p-2.5 border-r border-slate-800 text-center">Incharge Phone #</th>
                                <th class="p-2.5 border-r border-slate-800 text-center">Configured Periods</th>
                                <th class="p-2.5 text-center w-36 actions-column no-print">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
    `;

    classesList.forEach((c, idx) => {
        const inchargeT = teacherMap[c.inchargeId] || null;
        const isCurrentSelected = (c.id === currentClass.id);

        html += `
            <tr class="${isCurrentSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50')} hover:bg-slate-100 transition">
                <td class="p-2.5 text-center font-bold text-slate-600 bg-slate-100/50">${idx + 1}</td>
                <td class="p-2.5 font-black text-slate-900 text-sm">
                    ${c.name} - ${c.section}
                    ${isCurrentSelected ? '<span class="ml-2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">Being Edited</span>' : ''}
                </td>
                <td class="p-2.5 font-extrabold text-emerald-800 text-center bg-emerald-50/50">${c.roomNo || '-'}</td>
                <td class="p-2.5 font-bold text-slate-800">${inchargeT ? inchargeT.name : '<span class="text-slate-400">None</span>'}</td>
                <td class="p-2.5 text-center font-mono font-bold text-blue-900">${inchargeT ? (inchargeT.mobileNumber || '-') : '-'}</td>
                <td class="p-2.5 text-center font-bold text-indigo-700">${(c.subjects || []).length} / 8 Periods</td>
                <td class="p-2.5 text-center actions-column no-print">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="selectAdjustmentClass('${c.id}', true)" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded text-xs transition flex items-center gap-1 shadow-sm">
                            <i class="fa-solid fa-pen-to-square"></i> Open This Class
                        </button>
                        <button onclick="deleteClass('${c.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-1 rounded text-xs transition" title="Delete">
                            <i class="fa-solid fa-trash-can text-base"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

const renderDistClassesSubTab = renderDistAdjustmentSubTab;

function selectAdjustmentClass(classId, scrollToPeriods) {
    currentAdjustmentClassId = classId;
    currentDistributionSelectedClassId = classId;
    renderDataDistributionView();
    // Task 2 (Patch 22): from All Classes Overview, land directly on the
    // Periods Detail section of the opened class.
    if (scrollToPeriods) {
        setTimeout(() => {
            const el = document.getElementById('adjPeriodsDetailSection');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
    }
}

// Task 2: 1st-column Class + Section act as a selector. Choosing a Class and
// Section loads that existing class's saved Room No., Class Incharge and
// Periods Detail below (it does NOT rename the current class). If that
// Class + Section does not exist, nothing changes.
function selectAdjustmentClassByNameSection(field, value) {
    const cur = (typeof classesList !== 'undefined') ? (classesList.find(c => c.id === currentAdjustmentClassId) || classesList[0]) : null;
    if (!cur) return;
    const proposedName = (field === 'name') ? value : cur.name;
    const proposedSection = (field === 'section') ? value : cur.section;
    const target = classesList.find(c => c.name === proposedName && c.section === proposedSection);
    if (!target) {
        showToast('Class ' + proposedName + ' - ' + proposedSection + ' not found.');
        renderDataDistributionView();
        return;
    }
    if (target.id === cur.id) return;
    currentAdjustmentClassId = target.id;
    currentDistributionSelectedClassId = target.id;
    renderDataDistributionView();
}

// Task 1: Undo baseline = the last uploaded-file timetable setting.
// Saved in localStorage so Undo survives a restart. If no file was ever
// uploaded, the baseline is the built-in default timetable (DEFAULT_CLASSES).
let uploadedTimetableBaseline = null;
function ensureUploadedTimetableBaseline() {
    if (uploadedTimetableBaseline && uploadedTimetableBaseline.length) return uploadedTimetableBaseline;
    try {
        const stored = localStorage.getItem('timetableUploadedBaseline_v1');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length) { uploadedTimetableBaseline = parsed; return uploadedTimetableBaseline; }
        }
    } catch (e) {}
    uploadedTimetableBaseline = (typeof DEFAULT_CLASSES !== 'undefined') ? JSON.parse(JSON.stringify(DEFAULT_CLASSES)) : [];
    return uploadedTimetableBaseline;
}
function saveUploadedTimetableBaseline() {
    try { localStorage.setItem('timetableUploadedBaseline_v1', JSON.stringify(uploadedTimetableBaseline)); } catch (e) {}
}
function undoAdjustmentToUploaded() {
    const baseline = ensureUploadedTimetableBaseline();
    if (!baseline || !baseline.length) { showToast('No uploaded timetable setting found.'); return; }
    if (!confirm('Restore the timetable to the last uploaded file setting? Any changes made after the upload will be lost.')) return;
    classesList = JSON.parse(JSON.stringify(baseline));
    if (classesList.length > 0) {
        currentAdjustmentClassId = classesList[0].id;
        currentDistributionSelectedClassId = classesList[0].id;
    }
    rebuildSchedulesFromClassSchedule();
    saveData();
    renderAllViews();
    renderDataDistributionView();
    showToast('Timetable restored to uploaded file setting.');
}

function updateAdjustmentClassField(classId, field, value) {
    const c = classesList.find(x => x.id === classId);
    if (!c) return;

    c[field] = value.trim();

    // Auto-select 1st period teacher: when the Class Incharge changes, the
    // incharge also becomes the teacher of the 1st period (index 0 ONLY).
    if (field === 'inchargeId' && c[field]) {
        if (!c.subjects) c.subjects = [];
        if (!c.subjects[0]) c.subjects[0] = { name: '', teacherId: c[field] };
        else c.subjects[0].teacherId = c[field];
        const firstPeriod = (appSettings && appSettings.periods) ? appSettings.periods[0] : null;
        if (firstPeriod && scheduleResult && scheduleResult.classSchedule && scheduleResult.classSchedule[classId] && scheduleResult.classSchedule[classId][firstPeriod.id]) {
            scheduleResult.classSchedule[classId][firstPeriod.id].teacherId = c[field];
        }
    }

    rebuildSchedulesFromClassSchedule();
    saveData();
    renderAllViews();
    renderDataDistributionView();
    showToast(`Class information updated!`);
}

function updateAdjustmentPeriodSubject(classId, periodIdx, subjectName) {
    const c = classesList.find(x => x.id === classId);
    if (!c) return;
    const fzGuard = (typeof getFreezeBlockingCell === 'function' && appSettings && appSettings.periods && appSettings.periods[periodIdx]) ? getFreezeBlockingCell(classId, appSettings.periods[periodIdx].id) : null;
    if (fzGuard) {
        const fzGT = (teachersList || []).find(t => t.id === fzGuard.teacherId);
        showToast('🔒 Ye period Fixed (Frozen) hai — ' + (fzGT ? fzGT.name : '') + ' (' + fzGuard.fromDate + ' to ' + fzGuard.toDate + '). Tabdeeli ke liye pehle View Fixed Periods se Unfreeze karen.');
        renderDataDistributionView();
        return;
    }

    if (!c.subjects) c.subjects = [];
    while (c.subjects.length <= periodIdx) {
        c.subjects.push({ name: '', teacherId: '' });
    }
    c.subjects[periodIdx].name = subjectName.trim();

    const p = appSettings.periods[periodIdx];
    if (scheduleResult && scheduleResult.classSchedule && scheduleResult.classSchedule[classId] && p) {
        if (!scheduleResult.classSchedule[classId][p.id]) {
            scheduleResult.classSchedule[classId][p.id] = {
                classId: c.id,
                className: c.name,
                section: c.section || '',
                roomNo: c.roomNo || '',
                subjectName: subjectName.trim(),
                teacherId: c.subjects[periodIdx].teacherId,
                periodId: p.id,
                startTime: p.startTime,
                endTime: p.endTime
            };
        } else {
            scheduleResult.classSchedule[classId][p.id].subjectName = subjectName.trim();
        }
    }

    rebuildSchedulesFromClassSchedule();
    renderAllViews();
    renderDataDistributionView();
}

function updateAdjustmentPeriodTeacher(classId, periodIdx, teacherId) {
    const c = classesList.find(x => x.id === classId);
    if (!c) return;
    const fzGuard = (typeof getFreezeBlockingCell === 'function' && appSettings && appSettings.periods && appSettings.periods[periodIdx]) ? getFreezeBlockingCell(classId, appSettings.periods[periodIdx].id) : null;
    if (fzGuard) {
        const fzGT = (teachersList || []).find(t => t.id === fzGuard.teacherId);
        showToast('🔒 Ye period Fixed (Frozen) hai — ' + (fzGT ? fzGT.name : '') + ' (' + fzGuard.fromDate + ' to ' + fzGuard.toDate + '). Tabdeeli ke liye pehle View Fixed Periods se Unfreeze karen.');
        renderDataDistributionView();
        return;
    }

    if (!c.subjects) c.subjects = [];
    while (c.subjects.length <= periodIdx) {
        c.subjects.push({ name: '', teacherId: '' });
    }
    c.subjects[periodIdx].teacherId = teacherId;

    const p = appSettings.periods[periodIdx];
    if (scheduleResult && scheduleResult.classSchedule && scheduleResult.classSchedule[classId] && p) {
        if (!scheduleResult.classSchedule[classId][p.id]) {
            scheduleResult.classSchedule[classId][p.id] = {
                classId: c.id,
                className: c.name,
                section: c.section || '',
                roomNo: c.roomNo || '',
                subjectName: c.subjects[periodIdx].name || '',
                teacherId: teacherId,
                periodId: p.id,
                startTime: p.startTime,
                endTime: p.endTime
            };
        } else {
            scheduleResult.classSchedule[classId][p.id].teacherId = teacherId;
        }
    }

    rebuildSchedulesFromClassSchedule();
    renderAllViews();
    renderDataDistributionView();
}

function clearAdjustmentPeriodSlot(classId, periodIdx) {
    try {
        const c = classesList.find(x => x.id === classId);
        if (!c) return;
    const fzGuard = (typeof getFreezeBlockingCell === 'function' && appSettings && appSettings.periods && appSettings.periods[periodIdx]) ? getFreezeBlockingCell(classId, appSettings.periods[periodIdx].id) : null;
    if (fzGuard) {
        const fzGT = (teachersList || []).find(t => t.id === fzGuard.teacherId);
        showToast('🔒 Ye period Fixed (Frozen) hai — ' + (fzGT ? fzGT.name : '') + ' (' + fzGuard.fromDate + ' to ' + fzGuard.toDate + '). Tabdeeli ke liye pehle View Fixed Periods se Unfreeze karen.');
        renderDataDistributionView();
        return;
    }
        if (!c.subjects) c.subjects = [];
        while (c.subjects.length <= periodIdx) {
            c.subjects.push({ name: "", teacherId: "" });
        }

        c.subjects[periodIdx].name = "";
        c.subjects[periodIdx].teacherId = "";

        const p = (appSettings && appSettings.periods) ? appSettings.periods[periodIdx] : null;
        if (p && scheduleResult) {
            if (scheduleResult.classSchedule && scheduleResult.classSchedule[classId]) {
                scheduleResult.classSchedule[classId][p.id] = null;
            }
            if (scheduleResult.masterSchedule && scheduleResult.masterSchedule[classId]) {
                scheduleResult.masterSchedule[classId][p.id] = null;
            }
        }

        rebuildSchedulesFromClassSchedule();
        saveData();
        renderAllViews();
        renderDataDistributionView();
        showToast(`Period slot cleared successfully!`);
    } catch (err) {
        console.error("clearAdjustmentPeriodSlot error:", err);
        showToast("Period slot cleared.");
    }
}

// ---- Upload Time Table (Import from Word .docx / Excel .xlsx) ----
let pendingUploadClasses = null;

function handleUploadTimetableFile(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const name = file.name.toLowerCase();
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            let rows = null;
            if (name.endsWith('.xlsx')) {
                rows = parseXlsxTimetableRows(e.target.result);
            } else if (name.endsWith('.docx')) {
                rows = await parseDocxTimetableRows(e.target.result);
            } else {
                showToast('Please select a .docx or .xlsx file.');
                return;
            }
            if (!rows || rows.length === 0) {
                showToast('No timetable data found in the file.');
                return;
            }
            pendingUploadClasses = buildClassesFromUploadRows(rows);
            showUploadTimetablePreview(pendingUploadClasses);
        } catch (err) {
            console.error('Upload Time Table error:', err);
            showToast('Could not read the file. Please check the format.');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseXlsxTimetableRows(arrayBuffer) {
    if (typeof XLSX === 'undefined') throw new Error('XLSX library not loaded');
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    let headerIdx = -1;
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (row && String(row[0]).trim() === 'Class' && String(row[1]).trim() === 'Incharge') {
            headerIdx = i; break;
        }
    }
    if (headerIdx < 0) throw new Error('Header row (Class | Incharge | P1..P8) not found');
    const rows = [];
    for (let i = headerIdx + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !String(row[0]).trim()) continue;
        rows.push({
            classCode: String(row[0]).trim(),
            incharge: String(row[1] || '').trim(),
            periods: [2, 3, 4, 5, 6, 7, 8, 9].map(j => String(row[j] || '').trim())
        });
    }
    return rows;
}

async function parseDocxTimetableRows(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    let eocd = -1;
    const searchStart = Math.max(0, arrayBuffer.byteLength - 65557);
    for (let i = arrayBuffer.byteLength - 22; i >= searchStart; i--) {
        if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Not a valid DOCX file');
    const cdCount = view.getUint16(eocd + 10, true);
    let cdOffset = view.getUint32(eocd + 16, true);
    let docOff = -1, docSize = -1, docMethod = -1;
    for (let k = 0; k < cdCount; k++) {
        if (view.getUint32(cdOffset, true) !== 0x02014b50) break;
        const method = view.getUint16(cdOffset + 10, true);
        const compSize = view.getUint32(cdOffset + 20, true);
        const localOff = view.getUint32(cdOffset + 42, true);
        const nameLen = view.getUint16(cdOffset + 28, true);
        const extraLen = view.getUint16(cdOffset + 30, true);
        const commentLen = view.getUint16(cdOffset + 32, true);
        let fname = '';
        for (let j = 0; j < nameLen; j++) fname += String.fromCharCode(view.getUint8(cdOffset + 46 + j));
        if (fname === 'word/document.xml') { docOff = localOff; docSize = compSize; docMethod = method; }
        cdOffset += 46 + nameLen + extraLen + commentLen;
    }
    if (docOff < 0) throw new Error('word/document.xml not found');
    const lhNameLen = view.getUint16(docOff + 26, true);
    const lhExtraLen = view.getUint16(docOff + 28, true);
    const dataStart = docOff + 30 + lhNameLen + lhExtraLen;
    const compData = new Uint8Array(arrayBuffer, dataStart, docSize);
    let xmlText;
    if (docMethod === 0) {
        xmlText = new TextDecoder().decode(compData);
    } else if (docMethod === 8) {
        const ds = new DecompressionStream('deflate-raw');
        const stream = new Blob([compData]).stream().pipeThrough(ds);
        xmlText = await new Response(stream).text();
    } else {
        throw new Error('Unsupported compression method');
    }
    const paras = [];
    const pRe = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
    let m;
    while ((m = pRe.exec(xmlText)) !== null) {
        const tRe = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
        let txt = '', tm;
        while ((tm = tRe.exec(m[1])) !== null) txt += tm[1];
        txt = txt.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        if (txt.trim()) paras.push(txt.trim());
    }
    let startIdx = 0;
    for (let i = 0; i < paras.length - 2; i++) {
        if (paras[i] === 'Class' && paras[i + 1] === 'Incharge' && paras[i + 2] === 'P1') {
            startIdx = i + 10;
            break;
        }
    }
    const rows = [];
    for (let i = startIdx; i + 9 < paras.length + 1; i += 10) {
        const chunk = paras.slice(i, i + 10);
        if (chunk.length < 10) break;
        rows.push({ classCode: chunk[0], incharge: chunk[1], periods: chunk.slice(2, 10) });
    }
    return rows;
}

// 50% teacher-name matcher for Upload Time Table.
// Teacher-name matching for Upload (50% rule, user-defined):
// FIRST remove M / Muhammad tokens from BOTH names — they are NOT counted in
// the percentage. Then: score = matched remaining file tokens / remaining file
// tokens. MATCH if score >= 0.50. On match, the SOFTWARE teacher's ID + full
// name are used (software name has priority).
// Example: File "M. Touqeer" -> ["touqeer"]; Software "Touqeer Mehmood" ->
// ["touqeer","mehmood"]; score 1/1 = 100% -> MATCH -> use "Touqeer Mehmood".
const UPLOAD_TOKEN_ALIASES = {
    'mohd': 'muhammad', 'md': 'muhammad', 'mohammad': 'muhammad', 'mohammed': 'muhammad',
    'ahmed': 'ahmad', 'saddique': 'siddique', 'yasin': 'yaseen', 'mehmood': 'mahmood',
    'rasheed': 'rashid', 'zulqarnain': 'zulqurnain', 'farrukh': 'faurrakh',
    'javaid': 'javed', 'abd': 'abdul'
};
// Tokens excluded from percentage (any spelling of Muhammad + lone initial M).
const UPLOAD_EXCLUDED_TOKENS = new Set(['m', 'muhammad']);
function uploadTokenizeName(name) {
    return String(name || '').toLowerCase()
        .replace(/[.,]/g, ' ')
        .replace(/[^a-z ]/g, ' ')
        .split(/\s+/).filter(Boolean)
        .map(function (t) { return UPLOAD_TOKEN_ALIASES[t] || t; });
}
function uploadStripExcludedTokens(tokens) {
    return (tokens || []).filter(function (t) { return !UPLOAD_EXCLUDED_TOKENS.has(t); });
}
// Token match kind: 'strong' (exact/canonical, or >=4-char prefix) or 'initial' (single letter).
function uploadTokenMatchKind(ft, st) {
    if (ft === st) return ft.length >= 2 ? 'strong' : 'initial';
    if (ft.length === 1 && st.charAt(0) === ft) return 'initial';
    if (st.length === 1 && ft.charAt(0) === st) return 'initial';
    if (ft.length >= 4 && st.length >= 4 && (st.indexOf(ft) === 0 || ft.indexOf(st) === 0)) return 'strong';
    return null;
}
function uploadMatchScore(fileTokens, softTokens) {
    let matched = 0, strong = 0;
    fileTokens.forEach(function (ft) {
        let kind = null;
        for (let i = 0; i < softTokens.length; i++) {
            const k = uploadTokenMatchKind(ft, softTokens[i]);
            if (k === 'strong') { kind = 'strong'; break; }
            if (k === 'initial') kind = 'initial';
        }
        if (kind === 'strong') { matched++; strong++; }
        else if (kind === 'initial') matched++;
    });
    return { score: fileTokens.length ? matched / fileTokens.length : 0, matched: matched, strong: strong };
}
// Best-matching software teacher for a file name, or null. M/Muhammad tokens
// are stripped from BOTH sides before scoring. Requires score >= 0.50.
// If the file name has ZERO tokens left after stripping (e.g. just "M."),
// no match is possible. Tie-break: highest score, then most matched tokens,
// then fewest extra software tokens, then first in list.
function findUploadTeacherMatch(fileName) {
    const fileTokens = uploadStripExcludedTokens(uploadTokenizeName(fileName));
    if (!fileTokens.length) return null;
    let best = null;
    (teachersList || []).forEach(function (t) {
        const softTokens = uploadStripExcludedTokens(uploadTokenizeName(t.name));
        if (!softTokens.length) return;
        const r = uploadMatchScore(fileTokens, softTokens);
        if (r.score < 0.5) return;
        const extra = softTokens.length - r.matched;
        if (!best || r.score > best.score ||
            (r.score === best.score && r.matched > best.matched) ||
            (r.score === best.score && r.matched === best.matched && extra < best.extra)) {
            best = { id: t.id, name: t.name, score: r.score, matched: r.matched, extra: extra };
        }
    });
    return best;
}

function uploadResolveTeacher(fileTeacherName) {
    // 50% rule: on match use the SOFTWARE teacher's id + name; otherwise keep
    // the file name with empty teacherId (assign manually after import).
    const m = findUploadTeacherMatch(fileTeacherName);
    if (m) return { teacherId: m.id, teacherName: m.name };
    return { teacherId: '', teacherName: fileTeacherName || '' };
}
function parseUploadPeriod(s) {
    s = String(s || '').trim();
    if (s === '' || s === '—' || s === '-' || s === '–') return { name: '-', teacherId: '', teacherName: '' };
    const parts = s.split(' / ');
    const entries = parts.map(p => {
        const mm = p.trim().match(/^(.+?)\s*\((.+)\)\s*$/);
        if (mm) return { subject: mm[1].trim(), teacher: mm[2].trim() };
        return { subject: p.trim(), teacher: '' };
    });
    const first = entries[0];
    const firstResolved = uploadResolveTeacher(first.teacher);
    const obj = {
        name: entries.map(e => e.subject).join(' / '),
        teacherId: firstResolved.teacherId,
        teacherName: firstResolved.teacherName
    };
    if (entries.length > 1) {
        obj.split = entries.slice(1).map(e => {
            const r = uploadResolveTeacher(e.teacher);
            return { name: e.subject, teacherId: r.teacherId, teacherName: r.teacherName };
        });
    }
    return obj;
}

function buildClassesFromUploadRows(rows) {
    return rows.map((r, idx) => {
        const mm = String(r.classCode).trim().match(/^(\d+)\s*([A-Za-z])/);
        const inchargeResolved = uploadResolveTeacher(r.incharge);
        return {
            id: 'C' + (idx + 1),
            name: mm ? mm[1] + 'th' : String(r.classCode).trim(),
            section: mm ? mm[2].toUpperCase() : '',
            roomNo: '',
            inchargeId: inchargeResolved.teacherId,
            inchargeName: inchargeResolved.teacherName,
            subjects: r.periods.map(p => parseUploadPeriod(p))
        };
    });
}

function uploadEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showUploadTimetablePreview(classList) {
    closeUploadTimetablePreview();
    // Collect teacher names from the file that did NOT match any teacher in
    // Teachers & Workload (their teacher selection stays empty after import).
    const unmatchedSet = new Set();
    classList.forEach(c => {
        if (c.inchargeName && !c.inchargeId) unmatchedSet.add(c.inchargeName);
        (c.subjects || []).forEach(s => {
            if (s.teacherName && !s.teacherId) unmatchedSet.add(s.teacherName);
            (s.split || []).forEach(x => {
                if (x.teacherName && !x.teacherId) unmatchedSet.add(x.teacherName);
            });
        });
    });
    const unmatchedHtml = unmatchedSet.size
        ? '<div class="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900"><strong>Unmatched teachers (not found in Teachers &amp; Workload — teacher selection will be empty, assign manually after import):</strong> ' + Array.from(unmatchedSet).map(uploadEsc).join(', ') + '</div>'
        : '';
    const rowsHtml = classList.map(c => {
        const periods = c.subjects.map(s => {
            if (s.name === '-') return '<span class="text-slate-400">FREE</span>';
            let t = uploadEsc(s.teacherName || '');
            if (s.split && s.split.length) {
                t += ' + ' + s.split.map(x => uploadEsc(x.teacherName || '')).join(', ');
            }
            return uploadEsc(s.name) + ' (' + t + ')';
        });
        return '<tr class="border-b border-slate-200">'
            + '<td class="p-2 font-bold text-center">' + uploadEsc(c.name + '-' + c.section) + '</td>'
            + '<td class="p-2">' + uploadEsc(c.inchargeName || '') + '</td>'
            + periods.map(p => '<td class="p-2 text-[11px]">' + p + '</td>').join('')
            + '</tr>';
    }).join('');
    const modal = document.createElement('div');
    modal.id = 'uploadTimetablePreviewModal';
    modal.className = 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4';
    modal.innerHTML = '<div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">'
        + '<div class="p-4 border-b border-slate-200 flex items-center justify-between">'
        + '<h3 class="font-extrabold text-slate-900">Upload Time Table — Preview (' + classList.length + ' Classes)</h3>'
        + '<button onclick="closeUploadTimetablePreview()" class="text-slate-500 hover:text-red-600 font-bold text-lg px-2">&times;</button>'
        + '</div>'
        + '<div class="p-4 overflow-auto flex-1"><div class="overflow-x-auto"><table class="w-full text-xs border-collapse">'
        + '<thead><tr class="bg-slate-900 text-white"><th class="p-2">Class</th><th class="p-2">Incharge</th>'
        + '<th class="p-2">P1</th><th class="p-2">P2</th><th class="p-2">P3</th><th class="p-2">P4</th>'
        + '<th class="p-2">P5</th><th class="p-2">P6</th><th class="p-2">P7</th><th class="p-2">P8</th></tr></thead>'
        + '<tbody>' + rowsHtml + '</tbody></table></div>'
        + unmatchedHtml
        + '<p class="text-[11px] text-slate-500 mt-3">Note: Teacher names not found in Teachers &amp; Workload will show with empty teacher selection. You can assign them manually after import.</p>'
        + '</div>'
        + '<div class="p-4 border-t border-slate-200 flex justify-end gap-2">'
        + '<button onclick="closeUploadTimetablePreview()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2 rounded-lg">Cancel</button>'
        + '<button onclick="confirmUploadTimetableImport()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg">Confirm Import</button>'
        + '</div></div>';
    document.body.appendChild(modal);
}

function closeUploadTimetablePreview() {
    const m = document.getElementById('uploadTimetablePreviewModal');
    if (m) m.remove();
}

function confirmUploadTimetableImport() {
    if (!pendingUploadClasses || pendingUploadClasses.length === 0) return;
    if (!confirm('Replace the current timetable with the uploaded data? This cannot be undone.')) return;
    // Task 6: preserve the Room No. already set for each matching Class +
    // Section. The uploaded file carries no rooms, so without this an import
    // would wipe every room number (and the Undo baseline would lose them).
    const prevRoomsByClassSection = {};
    (classesList || []).forEach(function (c) {
        if (c && c.name && c.section) prevRoomsByClassSection[c.name + '|' + c.section] = c.roomNo || '';
    });
    classesList = JSON.parse(JSON.stringify(pendingUploadClasses));
    classesList.forEach(function (c) {
        const key = c.name + '|' + c.section;
        if (!c.roomNo && prevRoomsByClassSection[key]) c.roomNo = prevRoomsByClassSection[key];
    });
    // Patch 29, Task 2: any room still empty gets its permanent default.
    applyPermanentDefaultRooms();
    // Task 1: Undo baseline = the uploaded file setting (with preserved rooms).
    uploadedTimetableBaseline = JSON.parse(JSON.stringify(classesList));
    saveUploadedTimetableBaseline();
    pendingUploadClasses = null;
    closeUploadTimetablePreview();
    // Point the Adjustment Menu at the first imported class (old selection may
    // refer to a class ID that no longer exists after the import).
    if (classesList.length > 0) {
        currentAdjustmentClassId = classesList[0].id;
        currentDistributionSelectedClassId = classesList[0].id;
    }
    rebuildSchedulesFromClassSchedule();
    saveData();
    renderAllViews();
    renderDataDistributionView();
    showToast('Timetable imported successfully.');
}

function rebuildSchedulesFromClassSchedule() {
    if (!scheduleResult) {
        scheduleResult = {
            success: true,
            classSchedule: {},
            teacherSchedule: {},
            masterSchedule: {}
        };
    }
    if (!scheduleResult.classSchedule) scheduleResult.classSchedule = {};
    if (!scheduleResult.teacherSchedule) scheduleResult.teacherSchedule = {};
    if (!scheduleResult.masterSchedule) scheduleResult.masterSchedule = {};

    teachersList.forEach(t => {
        scheduleResult.teacherSchedule[t.id] = {};
        appSettings.periods.forEach(p => {
            const isDesignatedFree = (t.freePeriods || []).includes(p.id);
            scheduleResult.teacherSchedule[t.id][p.id] = {
                isFree: true,
                isOfficialFree: isDesignatedFree,
                periodId: p.id,
                startTime: p.startTime,
                endTime: p.endTime,
                roomNo: "Staff Room"
            };
        });
    });

    // Prune schedule entries for classes that no longer exist in classesList
    // (e.g. after an Upload import replaces the whole class list).
    const liveClassIds = new Set(classesList.map(c => c.id));
    Object.keys(scheduleResult.classSchedule).forEach(cid => {
        if (!liveClassIds.has(cid)) delete scheduleResult.classSchedule[cid];
    });
    Object.keys(scheduleResult.masterSchedule).forEach(cid => {
        if (!liveClassIds.has(cid)) delete scheduleResult.masterSchedule[cid];
    });

    classesList.forEach(c => {
        if (!scheduleResult.classSchedule[c.id]) {
            scheduleResult.classSchedule[c.id] = {};
        }
        if (!scheduleResult.masterSchedule[c.id]) {
            scheduleResult.masterSchedule[c.id] = {};
        }

        appSettings.periods.forEach((p, pIdx) => {
            // ALWAYS rebuild the lesson from classesList — classesList is the source
            // of truth. (Old code only created a lesson when none existed, so stale
            // lessons from a previous import / old localStorage kept showing in
            // Periods Detail, Full Time Table and Teacher-wise slips after Upload.)
            const s = c.subjects && c.subjects[pIdx];
            let lesson = null;
            if (s && s.name && s.name !== '-') {
                lesson = {
                    classId: c.id,
                    className: c.name,
                    section: c.section || '',
                    roomNo: c.roomNo || '',
                    subjectName: s.name,
                    teacherId: s.teacherId || '',
                    periodId: p.id,
                    startTime: p.startTime,
                    endTime: p.endTime
                };
                scheduleResult.classSchedule[c.id][p.id] = lesson;
            } else {
                // Free / empty period (dash '-' or blank) — no lesson.
                scheduleResult.classSchedule[c.id][p.id] = null;
            }

            if (lesson && lesson.teacherId) {
                scheduleResult.masterSchedule[c.id][p.id] = lesson;

                if (scheduleResult.teacherSchedule[lesson.teacherId]) {
                    scheduleResult.teacherSchedule[lesson.teacherId][p.id] = lesson;
                }
            } else {
                scheduleResult.masterSchedule[c.id][p.id] = null;
            }
        });
    });

    // Multi-teacher groups (overlay): place each group lesson into the
    // teacher's own schedule so Teacher-wise Slips, Substitution and the
    // workload views see it. Class/master schedules keep the primary lesson.
    if (typeof injectPeriodGroupsIntoTeacherSchedule === 'function') injectPeriodGroupsIntoTeacherSchedule();

    saveData();
    if (exporter) {
        exporter.teachers = teachersList;
        exporter.classes = classesList;
        exporter.scheduleData = scheduleResult;
    }
}

// Sub-Tab 3: Subject Allocations per Class
function renderDistAllocationsSubTab(container) {
    if (!currentDistributionSelectedClassId && classesList.length > 0) {
        currentDistributionSelectedClassId = classesList[0].id;
    }

    const currentClass = classesList.find(c => c.id === currentDistributionSelectedClassId) || classesList[0];
    if (!currentClass) {
        container.innerHTML = `<div class="p-8 text-center text-slate-400">No class exists.</div>`;
        return;
    }

    let classOptionsHtml = [...classesList].sort((a, b) => (`${a.name} - ${a.section} (${a.roomNo || 'Room'})`).localeCompare(`${b.name} - ${b.section} (${b.roomNo || 'Room'})`, undefined, { sensitivity: 'base' })).map(c => `
        <option value="${c.id}" ${c.id === currentClass.id ? 'selected' : ''}>${c.name} - ${c.section} (${c.roomNo || 'Room'})</option>
    `).join('');

    const teacherMap = {};
    teachersList.forEach(t => teacherMap[t.id] = t);
    const incharge = teacherMap[currentClass.inchargeId] ? teacherMap[currentClass.inchargeId].name : "None";

    let html = `
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div class="flex items-center gap-3">
                    <span class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-lg font-black">
                        <i class="fa-solid fa-network-wired"></i>
                    </span>
                    <div>
                        <h3 class="font-extrabold text-base text-slate-900">Subject Allocations & Teachers</h3>
                        <p class="text-xs text-slate-500">Select a class and assign a teacher for every period / subject.</p>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <label class="text-xs font-bold text-slate-700">Select Class:</label>
                    <select onchange="selectDistributionClassAllocations(this.value)" class="border-2 border-indigo-500 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm">
                        ${classOptionsHtml}
                    </select>
                </div>
            </div>

            <!-- Class Quick Details Banner -->
            <div class="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h4 class="text-lg font-black text-amber-300">Class: ${currentClass.name} - ${currentClass.section}</h4>
                    <p class="text-xs text-slate-300 mt-0.5">
                        Room Number: <span class="font-bold text-white">${currentClass.roomNo || '-'}</span> | 
                        Incharge: <span class="font-bold text-emerald-400">${incharge}</span> | 
                        Number of Subjects: <span class="font-bold text-white">${(currentClass.subjects || []).length}</span>
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="addClassSubjectSlot('${currentClass.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow transition">
                        <i class="fa-solid fa-plus"></i> Add New Subject Slot
                    </button>
                    <button onclick="syncAndRegenerateAction()" class="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow transition">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Sync Timetable
                    </button>
                </div>
            </div>

            <!-- Subjects Table -->
            <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-xs text-left border-collapse">
                    <thead class="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                        <tr>
                            <th class="p-2.5 text-center border-r border-slate-800 w-16">Slot / P#</th>
                            <th class="p-2.5 border-r border-slate-800">Subject Name</th>
                            <th class="p-2.5 border-r border-slate-800">Assigned Teacher</th>
                            <th class="p-2.5 text-center w-24 actions-column no-print">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
    `;

    const subs = currentClass.subjects || [];
    if (subs.length === 0) {
        html += `<tr><td colspan="4" class="p-8 text-center text-slate-400 font-bold">No subject has been entered for this class yet.</td></tr>`;
    } else {
        subs.forEach((s, idx) => {
            let teacherSelectHtml = `<select onchange="updateClassSubjectTeacher('${currentClass.id}', ${idx}, this.value)" class="border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 w-full">`;
            teacherSelectHtml += `<option value="">-- Select Teacher --</option>`;
            [...teachersList].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })).forEach(t => {
                const sel = (t.id === s.teacherId) ? 'selected' : '';
                teacherSelectHtml += `<option value="${t.id}" ${sel}>${t.name} (${formatDesignation(t.designation) || 'Teacher'})</option>`;
            });
            teacherSelectHtml += `</select>`;

            html += `
                <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-indigo-50/40 transition">
                    <td class="p-2.5 text-center font-bold text-slate-700 bg-slate-100/50">Period ${idx + 1}</td>
                    <td class="p-2.5 font-black text-slate-900 max-w-xs">
                        <input type="text" value="${s.name}" onchange="updateClassSubjectName('${currentClass.id}', ${idx}, this.value)" class="w-full border border-slate-300 rounded px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-indigo-500">
                    </td>
                    <td class="p-2.5 max-w-sm">${teacherSelectHtml}</td>
                    <td class="p-2.5 text-center actions-column no-print">
                        <button onclick="removeClassSubjectSlot('${currentClass.id}', ${idx})" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded text-xs transition" title="Delete">
                            <i class="fa-solid fa-trash-can text-base"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div>`;
    container.innerHTML = html;
}

// Sub-Tab 4: Staff Statement Manager
function renderDistStatementSubTab(container) {
    const searchVal = (document.getElementById('distStaffSearchInput')?.value || '').trim().toLowerCase();
    const activeStaff = getActiveTimetableStaff();
    if (ruleEnabled('staffSortBySeniority', true)) sortStaffBySeniority(activeStaff);

    const filtered = activeStaff.filter(st => {
        if (!searchVal) return true;
        const combined = Object.values(st).join(' ').toLowerCase();
        return combined.includes(searchVal);
    });

    let html = `
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div class="flex items-center gap-3">
                    <span class="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-lg font-black">
                        <i class="fa-solid fa-address-book"></i>
                    </span>
                    <div>
                        <h3 class="font-extrabold text-base text-slate-900">Staff Statement Records</h3>
                        <p class="text-xs text-slate-500">The teacher's name and father's name can be live-edited in separate columns. Changing a name syncs the timetable automatically.</p>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <input type="text" id="distStaffSearchInput" value="${searchVal}" oninput="renderDataDistributionView()" placeholder="Search staff..." class="border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 w-44">
                    <button onclick="openAddStaffModal()" class="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow transition">
                        <i class="fa-solid fa-user-plus"></i> Add New Staff
                    </button>
                    <button onclick="openAddColumnModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow transition">
                        <i class="fa-solid fa-table-columns"></i> New Column
                    </button>
                    <button onclick="openRemoveColumnModal()" class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow transition">
                        <i class="fa-solid fa-trash-can"></i> Remove Column
                    </button>
                    <button onclick="document.getElementById('distStaffStatementImportInput').click()" class="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow transition">
                        <i class="fa-solid fa-file-import"></i> Import File
                    </button>
                    <input type="file" id="distStaffStatementImportInput" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" class="hidden" onchange="handleStaffStatementImport(event)">
                </div>
            </div>

            <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-xs text-left border-collapse">
                    <thead class="bg-purple-950 text-white font-bold text-[11px] uppercase tracking-wider">
                        <tr>
                            <th class="p-2.5 text-center border-r border-purple-900 w-12">Sr.</th>
                            <th class="p-2.5 border-r border-purple-900 text-center">Personnel #</th>
                            <th class="p-2.5 border-r border-purple-900">Teacher Name (Live Edit)</th>
                            <th class="p-2.5 border-r border-purple-900">Father's Name</th>
                            <th class="p-2.5 border-r border-purple-900 text-center">CNIC #</th>
                            <th class="p-2.5 border-r border-purple-900 text-center">BPS</th>
                            <th class="p-2.5 border-r border-purple-900 text-center">Designation</th>
                            <th class="p-2.5 border-r border-purple-900 text-center">Date of Entry (Seniority)</th>
                            <th class="p-2.5 border-r border-purple-900 text-center">Date of Retirement</th>
                            <th class="p-2.5 border-r border-purple-900 text-center">Phone #</th>
                            <th class="p-2.5 text-center w-24 actions-column no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
    `;

    if (filtered.length === 0) {
        html += `<tr><td colspan="11" class="p-8 text-center text-slate-400 font-bold">No staff member found.</td></tr>`;
    } else {
        filtered.forEach((st, idx) => {
            let originalIndex = staffStatementList.indexOf(st);
            if (originalIndex === -1) {
                originalIndex = staffStatementList.findIndex(x => 
                    (x['CNIC #'] && st['CNIC #'] && x['CNIC #'] === st['CNIC #']) || 
                    (x['Personnel #'] && st['Personnel #'] && x['Personnel #'] === st['Personnel #']) || 
                    (x['Teacher Name'] && st['Teacher Name'] && x['Teacher Name'].toLowerCase() === st['Teacher Name'].toLowerCase())
                );
            }
            if (originalIndex === -1) originalIndex = idx;
            const rank = getCadreRank(st);
            const badgeClass = (rank <= 3) 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : (rank === 4 ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300');

            html += `
                <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-purple-50/40 transition">
                    <td class="p-2.5 text-center font-bold text-slate-600 bg-slate-100/50">${idx + 1}</td>
                    <td class="p-2.5 text-center font-mono text-slate-700 editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Personnel #')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}">
                        ${st['Personnel #'] || '-'}
                    </td>
                    <td class="p-2.5 font-black text-slate-900 editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Teacher Name')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" title="Click to edit">
                        ${st['Teacher Name'] || st['Name with Parentage'] || '-'}
                    </td>
                    <td class="p-2.5 font-semibold text-slate-800 editable-staff-cell" contenteditable="true" spellcheck="false" onblur="handleStaffCellEdit(this, ${originalIndex}, 'Father\\'s Name')" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}">
                        ${st["Father's Name"] || '-'}
                    </td>
                    <td class="p-2.5 text-center font-mono text-slate-600">${st['CNIC #'] || '-'}</td>
                    <td class="p-2.5 text-center font-bold text-blue-900">${st['BPS No.'] || '-'}</td>
                    <td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded font-bold text-[10px] ${badgeClass}">${st['Designation'] || '-'}</span></td>
                    <td class="p-2.5 text-center font-bold text-purple-950 bg-purple-50/50">${st['Date of Entry into Govt. Service'] || '-'}</td>
                    <td class="p-2.5 text-center font-extrabold text-purple-900 bg-purple-50/40">${st['Date of retirement'] || '-'}</td>
                    <td class="p-2.5 text-center font-mono text-slate-700">${st['Phone/ Cell #'] || '-'}</td>
                    <td class="p-2.5 text-center actions-column no-print">
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="editStaffAction(${originalIndex})" class="bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded text-xs transition" title="Edit">
                                <i class="fa-solid fa-pencil text-base"></i>
                            </button>
                            <button onclick="deleteStaffAction(${originalIndex})" class="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded text-xs transition" title="Delete">
                                <i class="fa-solid fa-trash-can text-base"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div>`;
    container.innerHTML = html;
}

// ==========================================
// 13. SETTINGS, SECURITY & FULL BACKUP VAULT
// ==========================================
function openSettingsModal() {
    ensureAdminAccess(() => {
        const nameEnInput = document.getElementById('settingsSchoolName');
        const nameUrInput = document.getElementById('settingsSchoolUrdu');
        const yearInput = document.getElementById('settingsAcademicYear');
        const emisInput = document.getElementById('settingsEmisCode');

        if (nameEnInput) nameEnInput.value = appSettings.schoolName || "Govt. High School Walton Lahore";
        if (nameUrInput) nameUrInput.value = appSettings.schoolNameUrdu || "گورنمنٹ ہائی اسکول والٹن، لاہور";
        if (yearInput) yearInput.value = appSettings.academicYear || "2026 - 2027";
        if (emisInput) emisInput.value = appSettings.emisCode || "35210051";

        document.getElementById('settingsCurrentPass').value = '';
        document.getElementById('settingsNewPass').value = '';
        document.getElementById('settingsConfirmPass').value = '';

        const smtp = getStoredSmtpConfig();
        if (document.getElementById('settingsSmtpEmail')) document.getElementById('settingsSmtpEmail').value = smtp.user || '';
        if (document.getElementById('settingsSmtpPass')) document.getElementById('settingsSmtpPass').value = smtp.password || '';

        // Task 7: populate monogram preview + size control from appSettings
        const monoSize = (appSettings && appSettings.monogramSize) || 64;
        const monoPreview = document.getElementById('settingsMonogramPreview');
        if (monoPreview) {
            if (appSettings && appSettings.monogram) {
                monoPreview.src = appSettings.monogram;
                monoPreview.style.display = 'block';
                monoPreview.style.width = monoSize + 'px';
                monoPreview.style.height = 'auto';
            } else {
                monoPreview.removeAttribute('src');
                monoPreview.style.display = 'none';
            }
        }
        const monoSizeInput = document.getElementById('settingsMonogramSize');
        if (monoSizeInput) monoSizeInput.value = monoSize;
        const monoSizeValue = document.getElementById('settingsMonogramSizeValue');
        if (monoSizeValue) monoSizeValue.textContent = String(monoSize);

        // Task 7: load existing signatures into editor canvases + sliders
        try {
            ['incharge', 'principal'].forEach(function (key) {
                const entry = getSignatureEntry(key);
                const cv = signatureEditorCanvas(key);
                if (cv && entry && entry.dataUrl) {
                    signatureLoadToEditor(key, entry.dataUrl);
                    const sz = document.querySelector('#settingsModal input[oninput*="signatureSetSize(\'' + key + '\'"]');
                    if (sz) sz.value = entry.size || 100;
                    const rt = document.querySelector('#settingsModal input[oninput*="signatureSetRotate(\'' + key + '\'"]');
                    if (rt) rt.value = entry.rotate || 0;
                    const cu = document.querySelector('#settingsModal input[oninput*="signatureSetCurve(\'' + key + '\'"]');
                    if (cu) cu.value = entry.curve || 0;
                    const sv = document.getElementById('sigSizeVal_' + key);
                    if (sv) sv.innerText = (entry.size || 100) + '%';
                    const rv = document.getElementById('sigRotateVal_' + key);
                    if (rv) rv.innerText = (entry.rotate || 0) + '°';
                    const cvv = document.getElementById('sigCurveVal_' + key);
                    if (cvv) cvv.innerText = entry.curve || 0;
                    signatureRefreshPreview(key);
                }
            });
        } catch (e) {}

        document.getElementById('settingsModal').classList.remove('hidden');
    });
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('hidden');
}


// ---- Patch 36, Task 1: School Information -> global binding ----
// Reads ONLY the existing single source of truth (appSettings) and writes
// it to the TOP HEADER plus the other school-info displays, so an edit in
// Settings > School Information shows everywhere at once and persists
// after refresh. No new fields, no new storage keys.
function applySchoolInformation() {
    if (typeof appSettings === 'undefined' || !appSettings) return;
    const nameEn = (appSettings.schoolName || '').trim();
    const nameUr = (appSettings.schoolNameUrdu || '').trim();
    const year = (appSettings.academicYear || '').trim();
    const emis = (appSettings.emisCode || '').trim();

    if (nameEn) document.querySelectorAll('.school-title').forEach(el => el.innerText = nameEn);

    const headerName = document.getElementById('headerSchoolName');
    if (headerName) {
        headerName.innerText = nameEn;
        headerName.style.display = nameEn ? '' : 'none';
    }
    const headerUrdu = document.getElementById('headerSchoolUrdu');
    if (headerUrdu) {
        headerUrdu.innerText = nameUr ? (nameUr + ' \u2014 \u0679\u0627\u0626\u0645 \u0679\u06cc\u0628\u0644 \u0627\u06cc\u0646\u0688 \u0627\u0633\u0679\u0627\u0641 \u0645\u06cc\u0646\u062c\u0645\u0646\u0679 \u0633\u0633\u0679\u0645') : '';
        headerUrdu.style.display = nameUr ? '' : 'none';
    }
    const headerEmis = document.getElementById('headerEmisCode');
    if (headerEmis) headerEmis.innerText = emis;
    const emisWrap = document.getElementById('headerEmisWrap');
    if (emisWrap) emisWrap.style.display = emis ? '' : 'none';
    const headerSession = document.getElementById('headerSessionDisplay');
    if (headerSession) headerSession.innerText = year;
    const sessionWrap = document.getElementById('headerSessionWrap');
    if (sessionWrap) sessionWrap.style.display = year ? '' : 'none';

    const staffUrdu = document.getElementById('staffStatementSchoolUrduDisplay');
    if (staffUrdu) staffUrdu.innerText = nameUr ? (nameUr + ' \u2014 Staff Statement (Service Record)') : 'Staff Statement (Service Record)';
    const staffEmis = document.getElementById('staffStatementEmisDisplay');
    if (staffEmis) staffEmis.innerText = emis;
    const staffSession = document.getElementById('staffStatementSessionDisplay');
    if (staffSession) staffSession.innerText = year;
}

function saveSchoolSettingsAction() {
    const nameEn = (document.getElementById('settingsSchoolName')?.value || '').trim();
    const nameUr = (document.getElementById('settingsSchoolUrdu')?.value || '').trim();
    const year = (document.getElementById('settingsAcademicYear')?.value || '').trim();
    const emis = (document.getElementById('settingsEmisCode')?.value || '').trim();

    if (!nameEn) {
        alert("Entering the school name is required.");
        return;
    }

    appSettings.schoolName = nameEn;
    appSettings.schoolNameUrdu = nameUr;
    appSettings.academicYear = year;
    appSettings.emisCode = emis;

    saveData();

    // Dynamically update on-screen titles and EMIS Code displays
    document.querySelectorAll('.school-title').forEach(el => el.innerText = nameEn);
    document.querySelectorAll('.school-subtitle').forEach(el => el.innerText = nameUr);
    applySchoolInformation();

    if (exporter) {
        exporter.settings = appSettings;
    }

    renderAllViews();
    showToast("School information and EMIS code saved successfully!");
}

// ==========================================
// Task 7: School Monogram (Settings + Header)
// Monogram image NEVER gets a background color — transparent PNG alpha shows through.
// ==========================================
function renderMonogramInHeader() {
    let img = document.getElementById('headerMonogramImg');
    if (!img) {
        img = document.createElement('img');
        img.id = 'headerMonogramImg';
        img.alt = 'School Monogram';
        const anchor = document.querySelector('header .flex.items-center.gap-3');
        if (anchor) {
            anchor.prepend(img);
        } else if (document.querySelector('header')) {
            document.querySelector('header').prepend(img);
        } else {
            return;
        }
    }
    img.style.background = 'transparent';
    img.style.backgroundColor = 'transparent';
    img.style.objectFit = 'contain';
    if (appSettings && appSettings.monogram) {
        const size = (appSettings.monogramSize) || 64;
        img.src = appSettings.monogram;
        img.style.display = 'block';
        img.style.width = size + 'px';
        img.style.height = 'auto';
    } else {
        img.removeAttribute('src');
        img.style.display = 'none';
    }
}

function handleMonogramUpload(event) {
    const file = event && event.target && event.target.files ? event.target.files[0] : null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const dataURL = e.target.result;
        if (!appSettings) appSettings = {};
        appSettings.monogram = dataURL;
        saveData();
        const preview = document.getElementById('settingsMonogramPreview');
        if (preview) {
            preview.src = dataURL;
            preview.style.display = 'block';
            preview.style.background = 'transparent';
            const size = (appSettings.monogramSize) || 64;
            preview.style.width = size + 'px';
            preview.style.height = 'auto';
        }
        renderMonogramInHeader();
    };
    reader.readAsDataURL(file);
}

// ==========================================
// TASK 7: SIGNATURES (Time Table Incharge + Principal)
// Storage: appSettings.signatures = { incharge: {...}, principal: {...} }
// Each signature: { dataUrl (transparent PNG), size (%), rotate (deg), curve (-50..50), color (hex), bold (bool) }
// ==========================================
function getStoredSignatures() {
    try {
        const s = (appSettings && appSettings.signatures) || {};
        const out = {};
        ['incharge', 'principal'].forEach(k => {
            const e = s[k];
            if (e && e.dataUrl) out[k] = e.dataUrl;
        });
        return out;
    } catch (e) { return {}; }
}
function getSignatureEntry(key) {
    try {
        const s = (appSettings && appSettings.signatures) || {};
        return s[key] || null;
    } catch (e) { return null; }
}
function saveSignatureEntry(key, patch) {
    if (!appSettings) appSettings = {};
    if (!appSettings.signatures) appSettings.signatures = {};
    appSettings.signatures[key] = Object.assign({}, appSettings.signatures[key] || {}, patch || {});
    try { saveData(); } catch (e) {}
    try { renderStoredSignatures(); } catch (e) {}
}
// White-background removal: pixels near-white become transparent (feathered edge).
function signatureMakeTransparent(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            try {
                const c = document.createElement('canvas');
                c.width = img.naturalWidth || img.width;
                c.height = img.naturalHeight || img.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const id = ctx.getImageData(0, 0, c.width, c.height);
                const d = id.data;
                for (let i = 0; i < d.length; i += 4) {
                    const r = d[i], g = d[i + 1], b = d[i + 2];
                    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
                    if (mx > 235 && (mx - mn) < 28) {
                        d[i + 3] = 0;
                    } else if (mx > 215 && (mx - mn) < 20) {
                        d[i + 3] = Math.round(d[i + 3] * 0.35);
                    }
                }
                ctx.putImageData(id, 0, 0);
                resolve(c.toDataURL('image/png'));
            } catch (e) { resolve(dataUrl); }
        };
        img.onerror = function () { resolve(dataUrl); };
        img.src = dataUrl;
    });
}
// Per-signature editor state (canvas + undo stack)
const signatureEditorState = {};
function signatureEditorCanvas(key) {
    return document.getElementById('sigCanvas_' + key);
}
function signaturePushUndo(key) {
    try {
        const st = signatureEditorState[key];
        const cv = signatureEditorCanvas(key);
        if (!st || !cv) return;
        if (!st.undo) st.undo = [];
        st.undo.push(cv.toDataURL('image/png'));
        if (st.undo.length > 25) st.undo.shift();
    } catch (e) {}
}
function signatureUndo(key) {
    try {
        const st = signatureEditorState[key];
        const cv = signatureEditorCanvas(key);
        if (!st || !cv || !st.undo || !st.undo.length) { showToast('Nothing to undo.'); return; }
        const prev = st.undo.pop();
        const ctx = cv.getContext('2d');
        const img = new Image();
        img.onload = function () {
            ctx.clearRect(0, 0, cv.width, cv.height);
            ctx.drawImage(img, 0, 0, cv.width, cv.height);
            signatureApplyAndSave(key);
        };
        img.src = prev;
    } catch (e) {}
}
function signatureLoadToEditor(key, dataUrl) {
    const cv = signatureEditorCanvas(key);
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const img = new Image();
    img.onload = function () {
        // Fit into editor canvas at natural aspect (max 320x160)
        const maxW = 320, maxH = 160;
        const sc = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
        cv.width = Math.max(1, Math.round(img.naturalWidth * sc));
        cv.height = Math.max(1, Math.round(img.naturalHeight * sc));
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        signatureEditorState[key] = signatureEditorState[key] || {};
        signatureEditorState[key].undo = [];
        signatureEditorState[key].erasing = false;
        signatureApplyAndSave(key);
    };
    img.src = dataUrl;
}
async function handleSignatureUpload(key, event) {
    const file = event && event.target && event.target.files ? event.target.files[0] : null;
    if (!file) return;
    if (!/\.(png|jpe?g)$/i.test(file.name) && !/^image\/(png|jpe?g)$/i.test(file.type || '')) {
        showToast('Please upload a PNG, JPEG or JPG signature file.');
        return;
    }
    const reader = new FileReader();
    reader.onload = async function (e) {
        const transparent = await signatureMakeTransparent(e.target.result);
        signatureLoadToEditor(key, transparent);
        // Save at natural resolution (ultra HD — never downscaled)
        saveSignatureEntry(key, { dataUrl: transparent, size: 100, rotate: 0, curve: 0, color: '', bold: false });
        showToast('Signature uploaded — background made transparent.');
    };
    reader.readAsDataURL(file);
}
function signatureSetTool(key, tool) {
    signatureEditorState[key] = signatureEditorState[key] || {};
    signatureEditorState[key].erasing = (tool === 'eraser');
    const penBtn = document.getElementById('sigPenBtn_' + key);
    const erBtn = document.getElementById('sigEraserBtn_' + key);
    if (penBtn) penBtn.classList.toggle('bg-blue-600', !signatureEditorState[key].erasing);
    if (erBtn) erBtn.classList.toggle('bg-red-600', !!signatureEditorState[key].erasing);
    signatureUpdateCursor(key);
}
// ---- Task 1 (revised): apply picked color to the signature via OK button ----
// Recolors the editor canvas content (all opaque pixels -> chosen color,
// alpha preserved) so the change is visible immediately, then persists it.
function signatureApplyColor(key) {
    const cv = signatureEditorCanvas(key);
    if (!cv) return;
    const colorInput = document.getElementById('sigColorInput_' + key);
    const prevEntry = (typeof getSignatureEntry === 'function') ? getSignatureEntry(key) : null;
    const color = (colorInput && colorInput.value) || (prevEntry && prevEntry.color) || '#0f172a';
    signaturePushUndo(key);
    try {
        const ctx = cv.getContext('2d');
        ctx.save();
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.restore();
    } catch (e) {}
    saveSignatureEntry(key, { color: color });
    signatureApplyAndSave(key);
    signatureRefreshPreview(key);
    showToast('Signature color applied.');
}
// ---- Task 2: custom cursors (marker for Pen, eraser for Eraser) ----
function signatureUpdateCursor(key) {
    const cv = signatureEditorCanvas(key);
    if (!cv) return;
    const st = signatureEditorState[key] || {};
    if (st.erasing) {
        // Eraser shape cursor (pink eraser + blue sleeve), hotspot at tip
        cv.style.cursor = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 28 28\"><g transform=\"rotate(-18 14 14)\"><rect x=\"3\" y=\"10\" width=\"22\" height=\"10\" rx=\"2\" fill=\"#f472b6\" stroke=\"#0f172a\" stroke-width=\"1.4\"/><rect x=\"3\" y=\"10\" width=\"8\" height=\"10\" rx=\"2\" fill=\"#38bdf8\" stroke=\"#0f172a\" stroke-width=\"1.4\"/></g></svg>') + '") 4 24, auto';
    } else {
        // Marker shape cursor (slanted marker pen), hotspot at tip
        cv.style.cursor = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 28 28\"><g transform=\"rotate(30 14 14)\"><rect x=\"10\" y=\"2\" width=\"8\" height=\"16\" rx=\"1.5\" fill=\"#1e40af\" stroke=\"#0f172a\" stroke-width=\"1\"/><polygon points=\"10,18 18,18 14,26\" fill=\"#0f172a\"/><rect x=\"12.4\" y=\"24\" width=\"3.2\" height=\"2.5\" fill=\"#facc15\"/></g></svg>') + '") 14 26, auto';
    }
}
// ---- Task 2: Update button — confirm/apply the edited signature ----
function signatureUpdate(key) {
    signatureApplyAndSave(key);
    signatureRefreshPreview(key);
    try { renderStoredSignatures(); } catch (e) {}
    showToast('Signature updated.');
}
// ---- Task 2: Smooth button — smooth signature lines (fine + HD smooth) ----
function signatureSmooth(key) {
    const cv = signatureEditorCanvas(key);
    if (!cv) return;
    signaturePushUndo(key);
    try {
        // 2x upscale + downscale anti-alias pass softens jagged edges.
        const tmp = document.createElement('canvas');
        tmp.width = Math.max(1, cv.width * 2);
        tmp.height = Math.max(1, cv.height * 2);
        const tctx = tmp.getContext('2d');
        tctx.imageSmoothingEnabled = true; tctx.imageSmoothingQuality = 'high';
        tctx.drawImage(cv, 0, 0, tmp.width, tmp.height);
        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(tmp, 0, 0, cv.width, cv.height);
    } catch (e) {}
    signatureApplyAndSave(key);
    signatureRefreshPreview(key);
    showToast('Signature smoothed.');
}
function signatureEditorPointer(key, ev) {
    const cv = signatureEditorCanvas(key);
    if (!cv) return;
    const st = signatureEditorState[key] || (signatureEditorState[key] = {});
    const rect = cv.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (cv.width / rect.width);
    const y = (ev.clientY - rect.top) * (cv.height / rect.height);
    if (ev.type === 'pointerdown') {
        signaturePushUndo(key);
        st.drawing = true;
        st.lastX = x; st.lastY = y;
        st.lastMidX = x; st.lastMidY = y;
        cv.setPointerCapture && cv.setPointerCapture(ev.pointerId);
    }
    if (ev.type === 'pointermove' && st.drawing) {
        const ctx = cv.getContext('2d');
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (st.erasing) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 14;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            var _entry = (typeof getSignatureEntry === 'function') ? getSignatureEntry(key) : null;
            ctx.strokeStyle = (_entry && _entry.color) || '#0f172a';
            ctx.lineWidth = 3;
        }
        // Midpoint quadratic smoothing: curve through midpoints for fine, smooth lines.
        if (st.lastMidX === undefined || st.lastMidX === null) { st.lastMidX = st.lastX; st.lastMidY = st.lastY; }
        const midX = (st.lastX + x) / 2, midY = (st.lastY + y) / 2;
        ctx.beginPath();
        ctx.moveTo(st.lastMidX, st.lastMidY);
        ctx.quadraticCurveTo(st.lastX, st.lastY, midX, midY);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        st.lastMidX = midX; st.lastMidY = midY;
        st.lastX = x; st.lastY = y;
    }
    if (ev.type === 'pointerup' || ev.type === 'pointercancel') {
        if (st.drawing) { st.drawing = false; signatureApplyAndSave(key); }
    }
}
function signatureApplyAndSave(key) {
    const cv = signatureEditorCanvas(key);
    if (!cv) return;
    const dataUrl = cv.toDataURL('image/png');
    const prev = getSignatureEntry(key) || {};
    saveSignatureEntry(key, { dataUrl: dataUrl, size: prev.size || 100, rotate: prev.rotate || 0, curve: prev.curve || 0, color: prev.color || '', bold: !!prev.bold });
}
function signatureSetSize(key, val) {
    const v = Math.max(20, Math.min(200, parseInt(val, 10) || 100));
    const lbl = document.getElementById('sigSizeVal_' + key);
    if (lbl) lbl.innerText = v + '%';
    saveSignatureEntry(key, { size: v });
    signatureRefreshPreview(key);
}
function signatureSetRotate(key, val) {
    const v = Math.max(0, Math.min(360, parseInt(val, 10) || 0));
    const lbl = document.getElementById('sigRotateVal_' + key);
    if (lbl) lbl.innerText = v + '°';
    saveSignatureEntry(key, { rotate: v });
    signatureRefreshPreview(key);
}
function signatureSetCurve(key, val) {
    const v = Math.max(-50, Math.min(50, parseInt(val, 10) || 0));
    const lbl = document.getElementById('sigCurveVal_' + key);
    if (lbl) lbl.innerText = v;
    saveSignatureEntry(key, { curve: v });
    signatureRefreshPreview(key);
}
function signatureSetColor(key, val) {
    saveSignatureEntry(key, { color: val || '' });
    signatureRefreshPreview(key);
}
function signatureSetBold(key, on) {
    saveSignatureEntry(key, { bold: !!on });
    signatureRefreshPreview(key);
}
function signatureRefreshPreview(key) {
    const entry = getSignatureEntry(key);
    const prev = document.getElementById('sigPreview_' + key);
    if (!prev) return;
    if (!entry || !entry.dataUrl) { prev.style.display = 'none'; return; }
    prev.style.display = 'block';
    prev.src = entry.dataUrl;
    const size = entry.size || 100;
    prev.style.width = Math.round(140 * size / 100) + 'px';
    prev.style.height = 'auto';
    prev.style.transform = 'rotate(' + (entry.rotate || 0) + 'deg)';
    if (entry.color) { prev.style.filter = 'none'; } else { prev.style.filter = 'none'; }
    // Curve is applied at render-time (canvas warp) for print/PNG; preview shows rotation + size.
}
function signatureRemove(key) {
    if (!appSettings) appSettings = {};
    if (appSettings.signatures) delete appSettings.signatures[key];
    try { saveData(); } catch (e) {}
    const cv = signatureEditorCanvas(key);
    if (cv) { const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height); }
    const prev = document.getElementById('sigPreview_' + key);
    if (prev) prev.style.display = 'none';
    if (signatureEditorState[key]) signatureEditorState[key].undo = [];
    try { renderStoredSignatures(); } catch (e) {}
    showToast('Signature removed.');
}
// Render stored signatures into all auto-place spots on screen.
function renderStoredSignatures() {
    try {
        const sigs = (appSettings && appSettings.signatures) || {};
        // Bell Time spots
        const bellIn = document.getElementById('bellSigIncharge');
        const bellPr = document.getElementById('bellSigPrincipal');
        if (bellIn) {
            bellIn.innerHTML = sigs.incharge && sigs.incharge.dataUrl ? '<img src="' + sigs.incharge.dataUrl + '" alt="Incharge Time Table Signature" style="max-height:64px; max-width:180px; object-fit:contain; transform: rotate(' + (sigs.incharge.rotate || 0) + 'deg);">' : '';
        }
        if (bellPr) {
            bellPr.innerHTML = sigs.principal && sigs.principal.dataUrl ? '<img src="' + sigs.principal.dataUrl + '" alt="Principal Signature" style="max-height:64px; max-width:180px; object-fit:contain; transform: rotate(' + (sigs.principal.rotate || 0) + 'deg);">' : '';
        }
        // Staff Statement principal spot
        const staffPr = document.getElementById('staffSigPrincipal');
        if (staffPr) {
            staffPr.innerHTML = sigs.principal && sigs.principal.dataUrl ? '<img src="' + sigs.principal.dataUrl + '" alt="Principal Signature" style="max-height:64px; max-width:180px; object-fit:contain; transform: rotate(' + (sigs.principal.rotate || 0) + 'deg);">' : '';
        }
        // Teacher-wise slips are re-rendered by renderTeacherWiseCards (reads signatures itself).
        // Refresh slip cards if visible
        if (document.getElementById('tab-teacherwise') && !document.getElementById('tab-teacherwise').classList.contains('hidden')) {
            try { renderTeacherWiseCards(); } catch (e) {}
        }
    } catch (e) {}
}
// Load an image as a Promise (for PNG exports that include signatures).
function loadImageAsync(url) {
    return new Promise((resolve) => {
        if (!url) { resolve(null); return; }
        const img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { resolve(null); };
        img.src = url;
    });
}
// Draw a signature onto a canvas with size/rotate/curve applied (for PNG exports).
async function drawSignatureOnCanvas(ctx, entry, cx, baselineY, maxW) {
    if (!entry || !entry.dataUrl) return;
    const img = await loadImageAsync(entry.dataUrl);
    if (!img) return;
    const size = (entry.size || 100) / 100;
    const w = Math.min(maxW, Math.round(320 * size));
    const h = Math.round(w * img.naturalHeight / Math.max(img.naturalWidth, 1));
    const rot = (entry.rotate || 0) * Math.PI / 180;
    const curve = entry.curve || 0;
    ctx.save();
    ctx.translate(cx, baselineY - h - 8);
    if (rot) ctx.rotate(rot);
    if (entry.bold) {
        // Bold: draw 5 offset copies to thicken strokes
        [-1, 1, 0].forEach(dx => [-1, 1].forEach(dy => { ctx.drawImage(img, dx, dy, w, h); }));
    }
    if (curve) {
        // Curve warp: draw in vertical slices with sinusoidal vertical offset
        const slices = 24;
        const sliceW = w / slices;
        for (let i = 0; i < slices; i++) {
            const t = i / (slices - 1) - 0.5;
            const dy = Math.sin(t * Math.PI) * curve * 0.6;
            ctx.drawImage(img, i * sliceW, 0, sliceW, h, i * sliceW, dy, sliceW, h);
        }
    } else {
        ctx.drawImage(img, 0, 0, w, h);
    }
    ctx.restore();
}

function removeMonogramAction() {
    if (appSettings) delete appSettings.monogram;
    saveData();
    const preview = document.getElementById('settingsMonogramPreview');
    if (preview) {
        preview.removeAttribute('src');
        preview.style.display = 'none';
    }
    const uploadInput = document.getElementById('settingsMonogramUpload');
    if (uploadInput) uploadInput.value = '';
    renderMonogramInHeader();
}

function updateMonogramSizeAction(px) {
    let size = parseInt(px, 10);
    if (isNaN(size)) size = 64;
    size = Math.min(160, Math.max(32, size));
    if (!appSettings) appSettings = {};
    appSettings.monogramSize = size;
    saveData();
    const sizeInput = document.getElementById('settingsMonogramSize');
    if (sizeInput) sizeInput.value = size;
    const sizeValue = document.getElementById('settingsMonogramSizeValue');
    if (sizeValue) sizeValue.textContent = String(size);
    const preview = document.getElementById('settingsMonogramPreview');
    if (preview) {
        preview.style.width = size + 'px';
        preview.style.height = 'auto';
    }
    renderMonogramInHeader();
}

function changeAdminPasswordAction() {
    const curPass = (document.getElementById('settingsCurrentPass')?.value || '').trim();
    const newPass = (document.getElementById('settingsNewPass')?.value || '').trim();
    const confPass = (document.getElementById('settingsConfirmPass')?.value || '').trim();

    const savedPass = localStorage.getItem('ghs_walton_admin_password_v1') || DEFAULT_ADMIN_PASSWORD;

    if (!isAdminPasswordValue(curPass)) {
        alert("The current password is not correct!");
        return;
    }

    if (!newPass || newPass.length < 4) {
        alert("The new password must be at least 4 characters long.");
        return;
    }

    if (newPass !== confPass) {
        alert("The new password and confirmation password do not match!");
        return;
    }

    localStorage.setItem('ghs_walton_admin_password_v1', newPass);
    document.getElementById('settingsCurrentPass').value = '';
    document.getElementById('settingsNewPass').value = '';
    document.getElementById('settingsConfirmPass').value = '';

    showToast("Admin security password changed successfully!");
    alert(`Your new password has been saved: ${newPass}`);
}

// Complete Full Code & Data Backup Export (.json)
function downloadFullSystemBackup() {
    const now = new Date();
    const dateStamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

    const fullPackage = {
        software: "Time Table & Staff Management System",
        school: appSettings.schoolName,
        version: "3.5",
        backupGeneratedAt: now.toISOString(),
        data: {
            appSettings,
            teachersList,
            classesList,
            scheduleResult,
            timetableHistory,
            staffStatementList,
            staffColumnsList,
            offlineFilesList,
            adminPassword: localStorage.getItem('ghs_walton_admin_password_v1') || DEFAULT_ADMIN_PASSWORD
        }
    };

    const jsonStr = JSON.stringify(fullPackage, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GHS_Walton_Complete_System_Backup_${dateStamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast;
}

// Full System Restore from Backup File
function restoreFullSystemBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            const backupData = parsed.data || parsed;

            if (!backupData.teachersList || !backupData.classesList) {
                alert("Invalid or incomplete backup file! Please select a correct system backup file.");
                return;
            }

            if (!confirm) {
                event.target.value = '';
                return;
            }

            // Restore all items into localStorage
            if (backupData.appSettings) {
                localStorage.setItem('ghs_walton_settings_v3', JSON.stringify(backupData.appSettings));
            }
            if (backupData.teachersList) {
                localStorage.setItem('ghs_walton_teachers_v3', JSON.stringify(backupData.teachersList));
            }
            if (backupData.classesList) {
                localStorage.setItem('ghs_walton_classes_v3', JSON.stringify(backupData.classesList));
            }
            if (backupData.scheduleResult) {
                localStorage.setItem('ghs_walton_schedule_v3', JSON.stringify(backupData.scheduleResult));
            }
            if (backupData.timetableHistory) {
                localStorage.setItem('ghs_walton_history_v3', JSON.stringify(backupData.timetableHistory));
            }
            if (backupData.staffStatementList) {
                localStorage.setItem('ghs_walton_staff_statement_v1', JSON.stringify(backupData.staffStatementList));
            }
            if (backupData.staffColumnsList) {
                localStorage.setItem('ghs_walton_staff_cols_v1', JSON.stringify(backupData.staffColumnsList));
            }
            if (backupData.offlineFilesList) {
                localStorage.setItem('ghs_walton_offline_files_v1', JSON.stringify(backupData.offlineFilesList));
            }
            if (backupData.adminPassword) {
                localStorage.setItem('ghs_walton_admin_password_v1', backupData.adminPassword);
            }

            alert("All data and settings restored successfully! The software is refreshing...");
            window.location.reload();
        } catch (err) {
            console.error("Backup restore error:", err);
            alert("Error reading the file: " + err.message);
        }
    };
    reader.readAsText(file);
}

// Destructive Reset System Data with Strict Security Verification
function resetAllSystemDataAction() {
    const savedPass = localStorage.getItem('ghs_walton_admin_password_v1') || DEFAULT_ADMIN_PASSWORD;
    const entered = prompt("Enter the admin password to reset all data:");
    if (entered === null) return;

    if (entered.trim() !== savedPass) {
        alert("Wrong password! The data reset process has been cancelled.");
        return;
    }

    if (!confirm("Do you really want to delete all timetables and changes and return to the factory default state?")) {
        return;
    }

    localStorage.removeItem('ghs_walton_settings_v3');
    localStorage.removeItem('ghs_walton_teachers_v3');
    localStorage.removeItem('ghs_walton_classes_v3');
    localStorage.removeItem('ghs_walton_schedule_v3');
    localStorage.removeItem('ghs_walton_history_v3');
    localStorage.removeItem('ghs_walton_staff_statement_v1');
    localStorage.removeItem('ghs_walton_staff_cols_v1');
    localStorage.removeItem('ghs_walton_offline_files_v1');

    alert("The software has been restored to the default state.");
    window.location.reload();
}

// Hosted build: the desktop app's keep-alive heartbeat and shutdown beacon are
// removed - a hosted browser tab must not ping the heartbeat endpoint or send
// a shutdown beacon when the tab closes.

// =========================================================================
// 14. MULTI-PC AUTOMATIC CLOUD SYNC & GOOGLE DRIVE ENGINE (Firebase Cloud)
// =========================================================================
// Features:
// 1. Direct Online Cloud Auto-Sync (Firebase REST Endpoint) across Home PC & School PC
// 2. Intelligent Dataset Merger (Smart Merge) preserving work from both locations
// 3. Pre-Sync Safety Snapshots for zero data loss guarantee
// 4. Offline Sync Package (WhatsApp / USB Transfer)
// 5. 1-Click Universal Permanent Save Button on Header

const SYNC_STORAGE_KEY = "GHS_WALTON_TIMETABLE_SYNC_CONFIG_V1";
const DEFAULT_CLOUD_API_URL = "https://ghswalton-ecfa1-default-rtdb.firebaseio.com/walton_x9k4m2";
// Fix #21: cloud data lives in the school's own Google Firebase
// Realtime Database (free Spark plan). The secret node name in the
// path is the access key: database rules open that node only.
const HOSTED_BUILD_ID = "20261108-40";
// Fix #11: the verified cloud dataset is pinned by content hash;
// its descendants carry this generation number.
const PINNED_CLOUD_HASH = "c91dc69b3710fd63:261696";
const PINNED_CLOUD_GEN = 7;
let heldSyncGen = 0;

let syncConfig = {
    internetCloudEnabled: true,
    cloudApiUrl: DEFAULT_CLOUD_API_URL,
    autoPushInternet: true,
    autoPullInternet: true,

    cloudFolderEnabled: true,
    cloudFolderPath: "G:\\My Drive\\Timetable_Sync",
    detectedFolders: [],

    lastSyncTimestamp: 0,
    lastSyncFormatted: "Not yet",
    syncStatus: "idle",
    lastSyncedLocalHash: "",
    lastSyncedCloudHash: "",
    lastSyncedSeq: null,
    lastSyncedGen: 0
};

function loadSyncConfig() {
    try {
        const saved = localStorage.getItem(SYNC_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            syncConfig = Object.assign({}, syncConfig, parsed);
        }
        if (!syncConfig.cloudApiUrl || syncConfig.cloudApiUrl.trim() === "") {
            syncConfig.cloudApiUrl = DEFAULT_CLOUD_API_URL;
        }
        // Hosted fix #10: the cloud address belongs to the build, not
        // to per-device settings -- always use the built-in address so
        // a dataset move reaches every device on its next load.
        syncConfig.cloudApiUrl = DEFAULT_CLOUD_API_URL;
        syncConfig.internetCloudEnabled = true;
        heldSyncGen = Number(syncConfig.lastSyncedGen || 0);
    } catch (e) {
        console.warn("Could not load sync config:", e);
    }
    return syncConfig;
}

function saveSyncConfig() {
    try {
        localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncConfig));
    } catch (e) {
        console.error("Could not save sync config:", e);
    }
}

// Hosted build: direct Firebase Realtime Database access (REST).
// Fix #21 layout under the dataset's base path (the secret node):
//   <base>/data.json  the whole dataset as ONE JSON string (the
//                     dataset's own keys contain '.' and '#', which
//                     Firebase forbids as node keys, so it is stored
//                     as text, exactly like the old chunk text)
//   <base>/meta.json  a tiny manifest (seq/epoch/hash/length), always
//                     written LAST so a torn push never validates.
// A missing node reads back as JSON null -> the cloud counts as
// empty -> report success with no data. The returned object mirrors
// the proxy response shape ({ ok, json() -> { success, data } }) so
// every caller keeps its original downstream logic unchanged.
// datasetContentHash is declared later in this file and is hoisted,
// so it is safe to call here.
let _pullCache = { url: "", seq: -1, hash: "", text: "" };
function _fbPath(apiUrl, name) {
    return String(apiUrl).replace(/\/+$/, "") + "/" + name + ".json";
}
async function _mantlePut(url, obj) {
    const resp = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
    });
    if (!resp.ok) throw new Error('cloud write failed: ' + resp.status);
}
async function _mantleGetJson(url) {
    const resp = await fetch(url, { method: 'GET' });
    if (resp.status === 404) return { missing: true, data: null };
    if (resp.status === 429) { try { window._cloudCooldownUntil = Date.now() + 5 * 60 * 1000; } catch (e) {} throw new Error('cloud read failed: 429'); }
    if (!resp.ok) throw new Error('cloud read failed: ' + resp.status);
    const data = await resp.json();
    if (data === null || data === undefined) return { missing: true, data: null };
    return { missing: false, data: data };
}
// Fix #40: history is append-only across devices. A device whose
// local history copy is behind (or empty) must never erase the
// cloud's richer history when it saves -- union by entry id.
function unionHistoryEntries(localArr, cloudArr) {
    const byId = new Map();
    const keyOf = (e) => (e && e.id) ? e.id : ('x:' + JSON.stringify(e || {}).slice(0, 200));
    (cloudArr || []).forEach(e => { if (e) byId.set(keyOf(e), e); });
    (localArr || []).forEach(e => { if (e && !byId.has(keyOf(e))) byId.set(keyOf(e), e); });
    const merged = Array.from(byId.values());
    merged.sort((a, b) => ((a && a.timestamp) || 0) - ((b && b.timestamp) || 0));
    const lim = (typeof ruleConfigNumber === 'function') ? ruleConfigNumber('recordHistoryLimit', 200) : 200;
    if (lim > 0 && merged.length > lim) return merged.slice(-lim);
    return merged;
}

async function mantleCloudPush(apiUrl, dataset) {
    try {
        // Fix #40: before writing, union the cloud's current history
        // into the outgoing dataset so this push can never shrink it.
        // (Cache-aware pull: nearly free when the cloud has not moved.)
        try {
            const cr = await mantleCloudPull(apiUrl);
            if (cr && cr.ok) {
                const cj = await cr.json();
                if (cj && cj.success && cj.data && Array.isArray(cj.data.historyLog)) {
                    dataset.historyLog = unionHistoryEntries(dataset.historyLog, cj.data.historyLog);
                }
            }
        } catch (e) { /* best-effort: the push itself must go on */ }
        const text = JSON.stringify(dataset);
        // Data first, manifest last: a push interrupted halfway leaves
        // the old manifest in place, so no reader ever validates a
        // torn state (same crash-safety as the old chunk layout).
        await _mantlePut(_fbPath(apiUrl, 'data'), text);
        const manifest = {
            __manifest: 1,
            __seq: Number(dataset.syncSeq || 0),
            __epoch: Number(dataset.syncEpoch || 0),
            __hash: datasetContentHash(dataset),
            __len: text.length,
            lastModifiedTimestamp: Number(dataset.lastModifiedTimestamp || Date.now())
        };
        // Fix #40: the manifest write completes the save. Retry it
        // once before giving up, so an interrupted connection does
        // not leave the cloud torn (new data, old manifest).
        try { await _mantlePut(_fbPath(apiUrl, 'meta'), manifest); }
        catch (e1) { await _mantlePut(_fbPath(apiUrl, 'meta'), manifest); }
        _pullCache = { url: apiUrl, seq: manifest.__seq, hash: manifest.__hash, text: text };
        return { ok: true, json: async () => ({ success: true }) };
    } catch (e) {
        return { ok: false, json: async () => ({ success: false }) };
    }
}
async function mantleCloudPull(apiUrl) {
    try {
        const head = await _mantleGetJson(_fbPath(apiUrl, 'meta'));
        if (head.missing) return { ok: true, json: async () => ({ success: true, data: null }) };
        const doc = head.data;
        if (!doc || doc.__manifest !== 1) throw new Error('cloud manifest malformed');
        if (_pullCache.url === apiUrl && _pullCache.seq === doc.__seq && _pullCache.hash === doc.__hash && _pullCache.text) {
            const cachedText = _pullCache.text;
            return { ok: true, json: async () => ({ success: true, data: JSON.parse(cachedText) }) };
        }
        const body = await _mantleGetJson(_fbPath(apiUrl, 'data'));
        if (body.missing || typeof body.data !== 'string') throw new Error('cloud data missing');
        const text = body.data;
        if (text.length !== doc.__len) throw new Error('cloud data length mismatch');
        const data = JSON.parse(text);
        if (datasetContentHash(data) !== doc.__hash) throw new Error('cloud data hash mismatch');
        _pullCache = { url: apiUrl, seq: doc.__seq, hash: doc.__hash, text: text };
        return { ok: true, json: async () => ({ success: true, data: data }) };
    } catch (e) {
        return { ok: false, json: async () => ({ success: false, data: null }) };
    }
}

// Hosted sync fix: content hash of a dataset with its timestamp ignored.
// Two independent 32-bit hashes + length, so a real content change is
// reliably detected while a re-stamped identical copy hashes the same.
function _canonicalStringify(value) {
    if (value === null || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return "[" + value.map(_canonicalStringify).join(",") + "]";
    return "{" + Object.keys(value).sort().map(function (k) { return JSON.stringify(k) + ":" + _canonicalStringify(value[k]); }).join(",") + "}";
}

function datasetContentHash(dataset) {
    if (!dataset) return "";
    try {
        // Fix #12: canonical hash -- key order at any level and the
        // volatile bookkeeping fields do not affect content equality.
        const copy = {};
        Object.keys(dataset).forEach(function (k) {
            if (k !== "lastModifiedTimestamp" && k !== "syncSeq" && k !== "syncGen") copy[k] = dataset[k];
        });
        const s = _canonicalStringify(copy);
        let h1 = 5381, h2 = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i);
            h1 = ((h1 * 33) ^ c) >>> 0;
            h2 = Math.imul(h2 ^ c, 0x01000193) >>> 0;
        }
        return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0') + ':' + s.length;
    } catch (e) { return ""; }
}

function isServerMode() {
    return typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http');
}

function updateSyncBadge(status, text) {
    const badge = document.getElementById('headerSyncBadge');
    if (!badge) return;
    badge.title = text || "";
    if (status === 'syncing') {
        badge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer bg-sky-900/80 border-sky-500 text-sky-200 shadow-md animate-pulse";
        badge.innerHTML = `<i class="fa-solid fa-arrows-rotate animate-spin text-sky-300"></i><span class="hidden sm:inline">${text || 'Syncing...'}</span>`;
    } else if (status === 'synced') {
        badge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer bg-emerald-900/80 border-emerald-500 text-emerald-200 shadow-md hover:bg-emerald-800";
        badge.innerHTML = `<i class="fa-solid fa-cloud-check text-emerald-400"></i><span class="hidden sm:inline">${text || 'Cloud Sync'}</span>`;
    } else if (status === 'update_available') {
        badge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer bg-amber-600 border-amber-400 text-white shadow-lg animate-bounce";
        badge.innerHTML = `<i class="fa-solid fa-bell text-white"></i><span class="hidden sm:inline">New data available!</span>`;
    } else {
        badge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer bg-slate-800 border-slate-700 text-slate-300 shadow-md hover:bg-slate-700";
        badge.innerHTML = `<i class="fa-solid fa-cloud text-sky-400"></i><span class="hidden sm:inline">Cloud Sync</span>`;
    }
}

function getFullSystemDataset() {
    return {
        software: "Time Table & Staff Management System",
        school: appSettings ? appSettings.schoolName : "Govt. High School Walton Lahore",
        emisCode: appSettings ? (appSettings.emisCode || "35210051") : "35210051",
        version: "3.5",
        lastModifiedTimestamp: Date.now(),
        syncEpoch: 2,
        syncSeq: 0,
        syncGen: heldSyncGen,
        settings: appSettings,
        teachers: teachersList,
        classes: classesList,
        scheduleResult: scheduleResult,
        timetableHistory: timetableHistory,
        staffStatement: staffStatementList,
        historyLog: historyLog,
        staffColumns: staffColumnsList,
        offlineFiles: offlineFilesList,
        fixedPeriods: fixedPeriodsList,
        periodGroups: periodGroupsList,
        softwareRules: (typeof ensureSoftwareRules === 'function') ? ensureSoftwareRules() : null,
        // Hosted sync fix #3: settings that used to live only on one device
        // now travel with the dataset, so a change made anywhere applies
        // everywhere (tab renames/colours, name plate style, working days).
        appearance: (typeof appearanceSettings !== 'undefined' && appearanceSettings) ? appearanceSettings : null,
        nameplateStyle: (typeof nameplateTextStyle !== 'undefined' && nameplateTextStyle) ? nameplateTextStyle : null,
        nameplateSize: (typeof nameplateSize !== 'undefined' && nameplateSize) ? nameplateSize : null,
        summaryWorkingDays: (typeof summaryWorkingDays !== 'undefined') ? summaryWorkingDays : null
        // Hosted build (Option A): the admin password is NEVER part of the cloud dataset.
    };
}

function saveSafetySnapshot(currentData) {
    if (!currentData || (!currentData.settings && !currentData.teachers)) return;
    try {
        localStorage.setItem("GHS_WALTON_PRE_SYNC_BACKUP", JSON.stringify(currentData));
        if (isServerMode()) {
            fetch('/save_safety_snapshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentData)
            }).catch(() => {});
        }
    } catch (e) {
        console.warn("Safety snapshot failed:", e);
    }
}

function smartMergeDatasets(local, remote) {
    if (!local || (!local.settings && !local.teachers)) return remote;
    if (!remote || (!remote.settings && !remote.teachers)) return local;

    const localTime = local.lastModifiedTimestamp || 0;
    const remoteTime = remote.lastModifiedTimestamp || 0;

    const base = localTime >= remoteTime ? local : remote;
    const other = localTime >= remoteTime ? remote : local;
    const merged = JSON.parse(JSON.stringify(base));

    // Merge Teachers
    const teacherMap = {};
    (other.teachers || []).forEach(t => { if (t && t.id) teacherMap[t.id] = t; });
    (base.teachers || []).forEach(t => { if (t && t.id) teacherMap[t.id] = t; });
    merged.teachers = Object.values(teacherMap);

    // Merge Classes
    const classMap = {};
    (other.classes || []).forEach(c => { if (c && c.id) classMap[c.id] = c; });
    (base.classes || []).forEach(c => { if (c && c.id) classMap[c.id] = c; });
    merged.classes = Object.values(classMap);

    // Merge Staff Statement Records
    const staffMap = {};
    (other.staffStatement || []).forEach(s => {
        const key = s['Personnel #'] || s['Teacher Name'] || JSON.stringify(s);
        staffMap[key] = s;
    });
    (base.staffStatement || []).forEach(s => {
        const key = s['Personnel #'] || s['Teacher Name'] || JSON.stringify(s);
        staffMap[key] = s;
    });
    merged.staffStatement = Object.values(staffMap);

    // Merge Offline Files
    const fileMap = {};
    (other.offlineFiles || []).forEach(f => { if (f && (f.id || f.name)) fileMap[f.id || f.name] = f; });
    (base.offlineFiles || []).forEach(f => { if (f && (f.id || f.name)) fileMap[f.id || f.name] = f; });
    merged.offlineFiles = Object.values(fileMap);

    // Fix/Freeze records: union by id (base wins on conflict).
    const fpMap = {};
    (other.fixedPeriods || []).forEach(f => { if (f && f.id) fpMap[f.id] = f; });
    (base.fixedPeriods || []).forEach(f => { if (f && f.id) fpMap[f.id] = f; });
    merged.fixedPeriods = Object.values(fpMap);

    // Multi-teacher period groups: union by id (base wins on conflict).
    const pgMap = {};
    (other.periodGroups || []).forEach(g => { if (g && g.id) pgMap[g.id] = g; });
    (base.periodGroups || []).forEach(g => { if (g && g.id) pgMap[g.id] = g; });
    merged.periodGroups = Object.values(pgMap);

    merged.lastModifiedTimestamp = Math.max(localTime, remoteTime, Date.now());
    return merged;
}

let _buildReloadPending = false;
async function checkForNewBuild() {
    try {
        const r = await fetch('/sync_version.txt', { cache: 'no-store' });
        if (!r.ok) return;
        const v = (await r.text()).trim();
        if (!v || v === HOSTED_BUILD_ID) { try { sessionStorage.removeItem('buildReloadGuardV1'); } catch (e) {} return; }
        // A newer build is live on the server. Reload to pick it up, but
        // never interrupt typing, an open dialog or a login/lock screen --
        // wait for a quiet moment and let the next cycle reload instead.
        const ae = document.activeElement;
        const typing = !!(ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable));
        const modalOpen = !!document.querySelector('[id$="Modal"]:not(.hidden), [id$="modal"]:not(.hidden)');
        const lockEl = document.getElementById('securityLockScreen');
        const lockOpen = !!(lockEl && !lockEl.classList.contains('hidden'));
        if (typing || modalOpen || lockOpen) { _buildReloadPending = true; return; }
        // Fix #39 loop guard: if picking up this build already caused 2
        // reloads in the last 10 minutes and the running build STILL does
        // not match (e.g. a stale cached copy keeps being served), stop
        // reloading -- the page stays usable and a later visit picks the
        // build up. (Builds #37/#38 left HOSTED_BUILD_ID behind
        // sync_version.txt and trapped devices in an endless reload loop,
        // including on the PIN lock screen, whose id ends in "Screen",
        // not "Modal", so the old dialog check never protected it.)
        try {
            const now = Date.now();
            let g = null;
            try { g = JSON.parse(sessionStorage.getItem('buildReloadGuardV1') || 'null'); } catch (e) {}
            if (!g || g.v !== v || (now - g.firstAt) > 10 * 60 * 1000) g = { v: v, count: 0, firstAt: now };
            if (g.count >= 2) { _buildReloadPending = true; return; }
            g.count++;
            sessionStorage.setItem('buildReloadGuardV1', JSON.stringify(g));
        } catch (e) { /* sessionStorage unavailable -- reload anyway */ }
        // Cache-busting URL so the reload really fetches the new files
        // instead of re-serving the stale cached copy that caused the
        // mismatch in the first place.
        location.replace(location.pathname + '?v=' + encodeURIComponent(v));
    } catch (e) { /* offline or file missing -- try again next cycle */ }
}

// ===== Fix #30: realtime sync listener (replaces 20s polling) =====
let _liveSyncStarted = false;
let _syncFallbackStarted = false;
function startLiveSyncListener() {
    if (_liveSyncStarted) return;
    _liveSyncStarted = true;
    try {
        if (!window.firebase || !firebase.initializeApp || !firebase.database) throw new Error('Firebase SDK not available');
        const base = syncConfig.cloudApiUrl || DEFAULT_CLOUD_API_URL;
        const u = new URL(base);
        const fbApp = (firebase.apps && firebase.apps.length) ? firebase.app() : firebase.initializeApp({ databaseURL: u.origin });
        const metaRef = fbApp.database().ref(u.pathname.replace(/^\/+|\/+$/g, '') + '/meta');
        metaRef.on('value', function () {
            // The manifest changed: another device saved an edit.
            // Run the standard checker — it pulls and applies the new
            // data (or pushes local changes) exactly as before.
            try { checkAutoSyncOnStartup(true); } catch (e) {}
            try { checkForNewBuild(); } catch (e) {}
        }, function (err) {
            console.warn('Live sync listener failed; falling back to periodic checks.', err);
            startSyncPollingFallback();
        });
    } catch (e) {
        startSyncPollingFallback();
    }
}
function startSyncPollingFallback() {
    // Emergency fallback ONLY when the live listener could not be
    // established at all (SDK blocked/offline at start).
    if (_syncFallbackStarted) return;
    _syncFallbackStarted = true;
    setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        checkAutoSyncOnStartup(true);
        checkForNewBuild();
    }, 20000);
}
// Edit guard: true while the user is typing in a field or any
// dialog is open. A remote update is never applied over that.
function isUserMidEdit() {
    try {
        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable)) return true;
        if (document.querySelector('[id$="Modal"]:not(.hidden), [id$="modal"]:not(.hidden)')) return true;
    } catch (e) {}
    return false;
}
let _deferredRemoteSyncData = null;
function tryApplyDeferredSync() {
    if (!_deferredRemoteSyncData || isUserMidEdit()) return;
    const data = _deferredRemoteSyncData;
    _deferredRemoteSyncData = null;
    applyRemoteSyncData(data, true, "Online Cloud", true);
}
document.addEventListener('focusout', () => setTimeout(tryApplyDeferredSync, 0));
document.addEventListener('pointerup', () => setTimeout(tryApplyDeferredSync, 0));

async function initSyncSystem() {
    loadSyncConfig();
    updateSyncBadge("idle", "Checking cloud...");

    if (!isServerMode()) {
        console.log("Sync: running in static file mode. Offline export/import active.");
        return;
    }

    try {
        // Hosted build: Google Drive folder auto-detection is disabled (no local filesystem).

        await checkAutoSyncOnStartup();

        window.addEventListener('focus', () => {
            checkAutoSyncOnStartup(true);
            checkForNewBuild();
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                checkAutoSyncOnStartup(true);
                checkForNewBuild();
            }
        });

        // Fix #30: realtime listener instead of the old 20-second
        // polling (Fix #19). The focus/visibility handlers above
        // still re-check when a tab returns to the foreground.
        startLiveSyncListener();

    } catch (err) {
        console.warn("Sync startup failed:", err);
        updateSyncBadge("idle", "Offline mode");
    }
}

let _isCheckingSync = false;
async function checkAutoSyncOnStartup(silent = false) {
    if (!isServerMode() || _isCheckingSync) return;
    if (typeof window !== 'undefined' && window._cloudCooldownUntil && Date.now() < window._cloudCooldownUntil) { updateSyncBadge("idle", "Sync delayed - retrying"); return; }
    _isCheckingSync = true;

    try {
        if (!silent) updateSyncBadge("syncing", "Checking cloud...");
        if (!syncConfig.internetCloudEnabled || !syncConfig.cloudApiUrl) return;

        // 1. Read the shared cloud copy.
        let cloudData = null;
        let cloudPullOk = false;
        try {
            const cloudResp = await mantleCloudPull(syncConfig.cloudApiUrl);
            if (cloudResp.ok) {
                const cloudResult = await cloudResp.json();
                if (cloudResult.success) { cloudPullOk = true; cloudData = cloudResult.data; }
            }
        } catch (err) {
            console.warn("Cloud pull note:", err);
        }

        // A FAILED read (offline / blocked) is not an empty cloud: stop
        // here and never push, or this device's stale copy could
        // overwrite the shared cloud data.
        if (!cloudPullOk) {
            updateSyncBadge("idle", "Offline mode");
            return;
        }

        const localDataset = getFullSystemDataset();
        const localHash = datasetContentHash(localDataset);

        // 2. Cloud still empty -> this device's data becomes the cloud copy.
        if (!cloudData || (!cloudData.settings && !cloudData.teachers)) {
            if (localDataset.teachers || localDataset.settings) {
                triggerBackgroundSync(localDataset);
            }
            return;
        }

        // Fix #7: lineage, not clocks. This device remembers the cloud
        // copy it last agreed with (content hash + sequence number in
        // syncConfig). Comparing the three content hashes -- baseline,
        // cloud, local -- says exactly which side moved:
        //   only cloud moved -> apply it; only local moved -> push;
        //   both moved -> this active device pushes (its edits win);
        //   neither -> already in sync.
        // Wall-clock save stamps play NO part, so routine saves on a
        // stale device can no longer make it look 'newer' (the failure
        // that kept restoring the old 30-teacher copy).
        const cloudHash = datasetContentHash(cloudData);
        const cloudGen = Number(cloudData.syncGen || 0);

        // Fix #11: the pinned, verified dataset and its generation.
        if (cloudHash === PINNED_CLOUD_HASH) {
            if (cloudHash !== localHash) {
                applyRemoteSyncData(cloudData, true, "Online Cloud", true);
            } else {
                syncConfig.lastSyncedSeq = Number(cloudData.syncSeq || 0);
                syncConfig.lastSyncedCloudHash = cloudHash;
                syncConfig.lastSyncedLocalHash = cloudHash;
                syncConfig.lastSyncedGen = PINNED_CLOUD_GEN;
                heldSyncGen = PINNED_CLOUD_GEN;
                saveSyncConfig();
                updateSyncBadge("synced", "Synced with cloud");
            }
            return;
        }
        if (cloudGen < PINNED_CLOUD_GEN) {
            // Foreign lineage (stale copies in circulation): never
            // adopt it. A device holding pin-generation data repairs
            // the cloud; a device without it waits for the repair.
            if (heldSyncGen >= PINNED_CLOUD_GEN) triggerBackgroundSync(localDataset, true);
            return;
        }
        const baseHash = syncConfig.lastSyncedCloudHash || "";
        const baseSeq = (typeof syncConfig.lastSyncedSeq === 'number') ? syncConfig.lastSyncedSeq : null;
        const cloudMarked = Number(cloudData.syncEpoch || 0) >= 2;

        if (!cloudMarked) {
            // Foreign write from an old build's still-open tab: never
            // adopt it. A baselined device repairs the cloud with its
            // own copy (forced push); a device that has not baselined
            // yet waits -- it must not overwrite the cloud either.
            if (baseSeq !== null) triggerBackgroundSync(localDataset, true);
            return;
        }

        if (baseSeq === null) {
            // First run of this build on this device: the marked cloud
            // copy is the shared truth. Adopt it when the content
            // differs (applyRemoteSyncData records the baseline);
            // otherwise just record the baseline.
            if (cloudHash !== localHash) {
                applyRemoteSyncData(cloudData, true, "Online Cloud", true);
            } else {
                syncConfig.lastSyncedSeq = Number(cloudData.syncSeq || 0);
                syncConfig.lastSyncedCloudHash = cloudHash;
                syncConfig.lastSyncedLocalHash = cloudHash;
                saveSyncConfig();
                updateSyncBadge("synced", "Synced with cloud");
            }
            return;
        }

        if (cloudHash === localHash) {
            syncConfig.lastSyncedSeq = Number(cloudData.syncSeq || 0);
            syncConfig.lastSyncedCloudHash = cloudHash;
            // Fix #37: persist the generation too -- an in-sync device
            // that loses it deadlocks its own pushes at the gen gate.
            syncConfig.lastSyncedGen = cloudGen;
            heldSyncGen = cloudGen;
            saveSyncConfig();
            updateSyncBadge("synced", "Synced with cloud");
            return;
        }

        const cloudMoved = cloudHash !== baseHash;
        const localMoved = localHash !== baseHash;

        if (cloudMoved && !localMoved) {
            applyRemoteSyncData(cloudData, true, "Online Cloud", true);
            return;
        }
        if (cloudMoved && localMoved) {
            // Fix #38: both sides moved -> the CLOUD wins. The old
            // rule (this device pushes its whole dataset) let a stale
            // device that merely woke up overwrite the newest shared
            // data -- on 2026-11-08 it wiped a verified teacher mobile
            // update and 19 history entries from the cloud. A device
            // that has fallen behind adopts the cloud copy instead
            // (applyRemoteSyncData keeps a local safety snapshot of
            // what it replaces). Deliberate saves do not pass through
            // here: a Chief/Admin save pushes on its own path.
            applyRemoteSyncData(cloudData, true, "Online Cloud", true);
            return;
        }
        // Only local moved: normal push (the CAS re-check inside
        // triggerBackgroundSync will pass, since the cloud has not
        // moved since this device's baseline).
        triggerBackgroundSync(localDataset);
    } catch (globalErr) {
        console.warn("Sync check exception:", globalErr);
    } finally {
        _isCheckingSync = false;
    }
}
function applyRemoteSyncData(dataToApply, autoApply = false, sourceName = "Cloud", fromCloud = false) {
    const data = dataToApply || window._pendingRemoteSyncData;
    if (!data || (!data.settings && !data.teachers)) return;
    // Fix #30: a cloud update never lands in the middle of the
    // user's own editing (typing / an open dialog). It is held and
    // applied the moment they finish — see tryApplyDeferredSync.
    if (fromCloud && isUserMidEdit()) {
        _deferredRemoteSyncData = data;
        updateSyncBadge("idle", "Update received — will apply when you finish editing");
        return;
    }
    const _recvHash = fromCloud ? datasetContentHash(data) : "";

    try {
        saveSafetySnapshot(getFullSystemDataset());
        if (fromCloud) window._applyingRemoteSync = true;

        let _applyWarn = "";
        if (data.settings) appSettings = data.settings;
        if (data.teachers) teachersList = data.teachers;
        // Hosted sync fix #3: device settings arriving from the cloud.
        if (data.appearance) { try {
            appearanceSettings = data.appearance;
            saveAppearanceSettings();
            applyAppearanceSettings();
            const _ae = document.activeElement;
            const _typingInAppearance = !!(_ae && _ae.closest && _ae.closest('#appearanceTabRows'));
            if (!_typingInAppearance && typeof buildAppearanceSettingsUI === 'function') buildAppearanceSettingsUI();
        } catch (e) { if (!_applyWarn) _applyWarn = "appearance: " + (e && e.message || e); } }
        if (data.nameplateStyle) { try {
            nameplateTextStyle = data.nameplateStyle;
            nameplateSaveStyle();
            if (typeof nameplateSyncStyleControls === 'function') nameplateSyncStyleControls();
            if (typeof nameplateRefreshView === 'function') nameplateRefreshView();
        } catch (e) { if (!_applyWarn) _applyWarn = "nameplate style: " + (e && e.message || e); } }
        if (data.nameplateSize && +data.nameplateSize.w > 0 && +data.nameplateSize.h > 0) { try {
            nameplateSize = { w: +data.nameplateSize.w, h: +data.nameplateSize.h };
            try { localStorage.setItem('ghsw_nameplate_size_v1', JSON.stringify(nameplateSize)); } catch (e) {}
            if (typeof nameplateSyncSizeControls === 'function') nameplateSyncSizeControls();
            if (typeof nameplateUpdatePrintStyle === 'function') nameplateUpdatePrintStyle();
            if (typeof nameplateRefreshView === 'function') nameplateRefreshView();
        } catch (e) { if (!_applyWarn) _applyWarn = "nameplate size: " + (e && e.message || e); } }
        if (data.classes) classesList = data.classes;
        try { applyPermanentDefaultRooms(); } catch (e) { if (!_applyWarn) _applyWarn = "rooms: " + (e && e.message || e); }
        if (data.scheduleResult) {
            scheduleResult = data.scheduleResult;
            if (exporter) exporter.schedule = scheduleResult;
        }
        if (data.summaryWorkingDays) { try {
            const _wd = parseInt(data.summaryWorkingDays, 10);
            if (_wd >= 1 && _wd <= 6) {
                summaryWorkingDays = _wd;
                try { localStorage.setItem('summaryWorkingDays', String(_wd)); } catch (e) {}
                if (typeof renderSummaryTable === 'function') renderSummaryTable();
            }
        } catch (e) { if (!_applyWarn) _applyWarn = "summary days: " + (e && e.message || e); } }

        if (data.timetableHistory) timetableHistory = data.timetableHistory;
        // Fix #38: the applied cloud copy's history log comes with it.
        // Without this, a device kept its own (older, shorter) log
        // after adopting the cloud and its next save overwrote the
        // cloud's fuller history -- the other half of the 2026-11-08
        // overwrite incident (19 entries lost).
        if (data.historyLog) historyLog = data.historyLog;
        if (data.staffStatement) staffStatementList = data.staffStatement;
        if (data.staffColumns) staffColumnsList = data.staffColumns;
        if (data.offlineFiles) offlineFilesList = data.offlineFiles;
        if (data.fixedPeriods) fixedPeriodsList = data.fixedPeriods;
        if (data.periodGroups) periodGroupsList = data.periodGroups;
        if (data.softwareRules && Array.isArray(data.softwareRules.rules)) { softwareRulesState = { rules: data.softwareRules.rules, history: Array.isArray(data.softwareRules.history) ? data.softwareRules.history : [] }; persistSoftwareRules(); }
        // Hosted build (Option A): never overwrite the local admin password from cloud data.

        saveData();
        if (fromCloud) {
            window._applyingRemoteSync = false;
            try { localStorage.setItem('timetableLastModified', String(Number(data.lastModifiedTimestamp || Date.now()))); } catch (e) {}
        }

        if (isServerMode()) {
            fetch('/save_backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(getFullSystemDataset())
            }).catch(() => {});
        }

        syncConfig.lastSyncTimestamp = Date.now();
        const now = new Date();
        syncConfig.lastSyncFormatted = now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (fromCloud) {
            syncConfig.lastSyncedCloudHash = _recvHash;
            syncConfig.lastSyncedLocalHash = datasetContentHash(getFullSystemDataset());
            syncConfig.lastSyncedSeq = Number(data.syncSeq || 0);
            syncConfig.lastSyncedGen = Number(data.syncGen || 0);
            heldSyncGen = Number(data.syncGen || 0);
        } else {
            syncConfig.lastSyncedLocalHash = "";
        }
        saveSyncConfig();

        const modalTime = document.getElementById('syncModalLastTime');
        if (modalTime) modalTime.innerText = syncConfig.lastSyncFormatted;

        updateSyncBadge("synced", `Synced: ${syncConfig.lastSyncFormatted}`);
        if (_applyWarn) { try { updateSyncBadge("idle", "Partly applied: " + String(_applyWarn).slice(0, 70)); } catch (e) {} }
        dismissSyncBanner();

        if (typeof injectPeriodGroupsIntoTeacherSchedule === 'function') injectPeriodGroupsIntoTeacherSchedule();

        applySchoolInformation();
        renderAllViews();
        renderStaffStatementView();
        renderStaffCircularView();
        updateStats();

        showToast(`✅ All timetables and data have been auto-updated from ${sourceName}!`);
    } catch (e) {
        console.error("Error applying remote sync data:", e);
        try { updateSyncBadge("idle", "Sync error: " + String(e && e.message || e).slice(0, 60)); } catch (e2) {}
        window._applyingRemoteSync = false;
    }
}

function dismissSyncBanner() {
    const banner = document.getElementById('syncNotificationBanner');
    if (banner) banner.classList.add('hidden');
    window._pendingRemoteSyncData = null;
}

let _syncDebounceTimer = null;
function triggerBackgroundSync(data, force = false) {
    // Fix #23: a staff (view-only) session never pushes to the cloud.
    if (typeof isStaffSession === 'function' && isStaffSession()) return;
    let dataset = data || getFullSystemDataset();
    dataset.lastModifiedTimestamp = Date.now();

    if (!isServerMode()) return;

    clearTimeout(_syncDebounceTimer);
    _syncDebounceTimer = setTimeout(async () => {
        updateSyncBadge("syncing", "Saving to cloud...");

        // Fix #15/#16: the payload is rebuilt after the verification
        // read below, immediately before the push -- see there.

        // Fix #7 CAS: re-read the cloud before overwriting it. If the
        // cloud's sequence/content moved past this device's baseline,
        // this device is behind -- it adopts the cloud copy via the
        // checker instead of pushing its older data over it. A failed
        // verification read aborts a normal push rather than letting
        // it overwrite blind. The push takes the next sequence number
        // after the copy actually stored.
        if (syncConfig.internetCloudEnabled && syncConfig.cloudApiUrl) {
            if (typeof window !== 'undefined' && window._cloudCooldownUntil && Date.now() < window._cloudCooldownUntil) { updateSyncBadge("idle", "Sync delayed - retrying"); return; }
            let _casSeq = null;
            let _casHasData = false;
            try {
                const _cr = await mantleCloudPull(syncConfig.cloudApiUrl);
                if (_cr.ok) {
                    const _cj = await _cr.json();
                    if (_cj.success) { _casSeq = _cj.data ? Number(_cj.data.syncSeq || 0) : 0; _casHasData = !!_cj.data; }
                    if (_cj.success && _cj.data && Number(_cj.data.syncGen || 0) >= PINNED_CLOUD_GEN && heldSyncGen < PINNED_CLOUD_GEN) {
                        // Fix #37: a FORCED save (the active Chief/Admin
                        // editor's deliberate write) adopts the cloud
                        // generation it just verified and proceeds.
                        // Diverting it here deadlocked every push on any
                        // device whose local generation counter was
                        // behind, silently stranding edits (e.g. teacher
                        // mobile numbers) while the UI claimed success.
                        // A soft background save still diverts + adopts.
                        if (force) {
                            heldSyncGen = Number(_cj.data.syncGen || 0);
                            syncConfig.lastSyncedGen = heldSyncGen;
                            saveSyncConfig();
                        } else {
                            updateSyncBadge("syncing", "Updating from cloud...");
                            checkAutoSyncOnStartup(true);
                            return;
                        }
                    }
                    if (_cj.success && _cj.data && !force && typeof syncConfig.lastSyncedSeq === 'number'
                        && Number(_cj.data.syncSeq || 0) !== syncConfig.lastSyncedSeq
                        && datasetContentHash(_cj.data) !== syncConfig.lastSyncedCloudHash) {
                        updateSyncBadge("syncing", "Updating from cloud...");
                        checkAutoSyncOnStartup(true);
                        return;
                    }
                }
            } catch (e) {}
            // Fix #9 gate: a device that has not baselined yet may not
            // push over an existing cloud copy -- a startup save raced
            // ahead of the first check once and overwrote the cloud
            // with a stale local dataset. Divert to the checker, which
            // baselines this device first. A verifiably EMPTY cloud is
            // the bootstrap exception, and a failed verification read
            // aborts the push instead of letting it go blind.
            if (!force && typeof syncConfig.lastSyncedSeq !== 'number' && _casSeq !== null && _casHasData) {
                updateSyncBadge("syncing", "Updating from cloud...");
                checkAutoSyncOnStartup(true);
                return;
            }
            if (!force && _casSeq === null) {
                updateSyncBadge("idle", "Offline mode");
                return;
            }
            const _baseSeqNow = (typeof syncConfig.lastSyncedSeq === 'number') ? syncConfig.lastSyncedSeq : 0;
            // Fix #16: rebuild the payload NOW, after the
            // verification read. A cloud apply that landed while
            // the read was in flight has already re-baselined this
            // device, so the fresh payload is either that applied
            // content (an echo -- skipped next) or a genuine newer
            // local edit (pushed). The schedule-time snapshot and
            // any pre-read rebuild are both stale by this point.
            dataset = getFullSystemDataset();
            dataset.lastModifiedTimestamp = Date.now();
            dataset.syncSeq = Math.max(_casSeq === null ? 0 : _casSeq, _baseSeqNow) + 1;
            // Fix #15 (echo skip): a non-forced push whose live
            // content is exactly the baseline the cloud still holds
            // changes nothing -- skip it instead of re-stamping the
            // cloud with a new sequence for the same data.
            if (!force && _casSeq === _baseSeqNow && datasetContentHash(dataset) === (syncConfig.lastSyncedCloudHash || "")) {
                updateSyncBadge("synced", "Synced with cloud");
                return;
            }
        }

        let cloudSuccess = false;
        let folderSuccess = false;

        // 1. Online Cloud Auto-Sync (Firebase)
        if (syncConfig.internetCloudEnabled && syncConfig.cloudApiUrl) {
            try {
                const resp = await mantleCloudPush(syncConfig.cloudApiUrl, dataset);
                if (resp.ok) {
                    const res = await resp.json();
                    if (res.success) cloudSuccess = true;
                }
            } catch (err) {
                console.warn("Cloud push note:", err);
            }
        }

        // 2. Google Drive / Sync Folder: disabled in the hosted build (no local filesystem).

        if (cloudSuccess || folderSuccess) {
            syncConfig.lastSyncTimestamp = Date.now();
            const now = new Date();
            syncConfig.lastSyncFormatted = now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            saveSyncConfig();

            if (cloudSuccess) {
                const _pushedHash = datasetContentHash(dataset);
                syncConfig.lastSyncedLocalHash = _pushedHash;
                syncConfig.lastSyncedCloudHash = _pushedHash;
                syncConfig.lastSyncedSeq = dataset.syncSeq;
                syncConfig.lastSyncedGen = Number(dataset.syncGen || 0);
                saveSyncConfig();
                // Fix #4: this device now holds exactly what the cloud
                // holds, stamped with the push time -- so its next check
                // sees 'in sync' instead of re-applying its own upload.
                try { localStorage.setItem('timetableLastModified', String(dataset.lastModifiedTimestamp || Date.now())); } catch (e) {}
            }

            const modalTime = document.getElementById('syncModalLastTime');
            if (modalTime) modalTime.innerText = syncConfig.lastSyncFormatted;

            updateSyncBadge("synced", `Saved: ${syncConfig.lastSyncFormatted}`);
        } else {
            updateSyncBadge("idle", "Offline mode");
        }
    }, 800);
}

// Fix #37: a cloud save whose result is CHECKED, not assumed. Reads
// the cloud first (CAS baseline), pushes, then READS BACK and compares
// the content hash -- only a verified match may be reported as saved.
// Returns 'pushed' | 'insync' | 'offline' | 'failed' | 'local'.
async function syncPushVerified(dataset) {
    try {
        if (!syncConfig.internetCloudEnabled || !syncConfig.cloudApiUrl) return 'local';
        const cr = await mantleCloudPull(syncConfig.cloudApiUrl);
        if (!cr.ok) return 'offline';
        const cj = await cr.json();
        if (!cj.success) return 'offline';
        const cloudSeq = cj.data ? Number(cj.data.syncSeq || 0) : 0;
        // Fix #40: union the cloud's history into what we are about
        // to save BEFORE hashing, so the verified hash covers it.
        if (cj.data && Array.isArray(cj.data.historyLog)) {
            dataset.historyLog = unionHistoryEntries(dataset.historyLog, cj.data.historyLog);
        }
        const myHash = datasetContentHash(dataset);
        if (cj.data && datasetContentHash(cj.data) === myHash) {
            syncConfig.lastSyncedSeq = cloudSeq;
            syncConfig.lastSyncedCloudHash = myHash;
            syncConfig.lastSyncedLocalHash = myHash;
            saveSyncConfig();
            updateSyncBadge("synced", "Synced with cloud");
            return 'insync';
        }
        dataset.syncSeq = cloudSeq + 1;
        let resp = await mantleCloudPush(syncConfig.cloudApiUrl, dataset);
        let respOk = false;
        if (resp.ok) { const rj = await resp.json(); respOk = !!rj.success; }
        if (!respOk) {
            // Fix #40 recovery: the data write may have landed while
            // its manifest write was interrupted (the cloud is then
            // torn: new data, old manifest, and every reader sees a
            // mismatch). If the cloud's data node already holds
            // exactly this dataset, complete the save by writing
            // only the manifest, then fall through to verification.
            try {
                const raw = await _mantleGetJson(_fbPath(syncConfig.cloudApiUrl, 'data'));
                const rawDs = (raw && raw.data) ? (typeof raw.data === 'string' ? JSON.parse(raw.data) : raw.data) : null;
                if (rawDs && datasetContentHash(rawDs) === myHash) {
                    const manifest = {
                        __manifest: 1,
                        __seq: Number(dataset.syncSeq || 0),
                        __epoch: Number(dataset.syncEpoch || 0),
                        __hash: myHash,
                        __len: JSON.stringify(dataset).length,
                        lastModifiedTimestamp: Number(dataset.lastModifiedTimestamp || Date.now())
                    };
                    await _mantlePut(_fbPath(syncConfig.cloudApiUrl, 'meta'), manifest);
                    resp = { ok: true, json: async () => ({ success: true }) };
                    respOk = true;
                }
            } catch (e) { /* recovery is best-effort */ }
        }
        if (!respOk) return 'failed';
        const vr = await mantleCloudPull(syncConfig.cloudApiUrl);
        if (!vr.ok) return 'failed';
        const vj = await vr.json();
        if (!vj.success || !vj.data || datasetContentHash(vj.data) !== myHash) return 'failed';
        syncConfig.lastSyncedSeq = dataset.syncSeq;
        syncConfig.lastSyncedCloudHash = myHash;
        syncConfig.lastSyncedLocalHash = myHash;
        syncConfig.lastSyncTimestamp = Date.now();
        syncConfig.lastSyncFormatted = new Date().toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        saveSyncConfig();
        try { localStorage.setItem('timetableLastModified', String(dataset.lastModifiedTimestamp || Date.now())); } catch (e) {}
        updateSyncBadge("synced", `Saved: ${syncConfig.lastSyncFormatted}`);
        return 'pushed';
    } catch (e) {
        return 'failed';
    }
}

// 1-Click Universal Permanent Save & Cloud Sync Action
async function permanentSaveAndSyncAllAction() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
    }

    if (typeof rebuildSchedulesFromClassSchedule === 'function') {
        rebuildSchedulesFromClassSchedule();
    }

    saveData();
    const dataset = getFullSystemDataset();
    saveSafetySnapshot(dataset);

    if (isServerMode()) {
        try {
            await fetch('/save_backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataset)
            });
        } catch (e) {
            console.warn("Local backup error:", e);
        }
    }

    // Fix #37: the Save Data button reports the cloud result it
    // actually verified -- never a success it did not check.
    let _saveStatus = 'local';
    if (isServerMode()) {
        updateSyncBadge("syncing", "Saving to cloud...");
        _saveStatus = await syncPushVerified(dataset);
        if (_saveStatus === 'offline' || _saveStatus === 'failed') updateSyncBadge("idle", "Cloud save failed - not saved");
    }

    renderAllViews();
    renderStaffStatementView();
    renderStaffCircularView();
    updateStats();

    if (_saveStatus === 'pushed' || _saveStatus === 'insync') {
        showToast("✅ All timetables and changes have been permanently saved to the cloud and this computer!");
    } else if (_saveStatus === 'local') {
        showToast("✅ Changes saved on this computer.");
    } else {
        showToast("⚠️ Cloud save FAILED — changes are saved on this device only, NOT on the cloud. Check your internet and press Save Data again.");
    }
}

function openCloudSyncModal() {
    const modal = document.getElementById('cloudSyncModal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const urlInput = document.getElementById('syncCloudUrlInput');
    if (urlInput) urlInput.value = syncConfig.cloudApiUrl;

    const pathInput = document.getElementById('syncCloudFolderPath');
    if (pathInput) pathInput.value = syncConfig.cloudFolderPath || '';

    const modalTime = document.getElementById('syncModalLastTime');
    if (modalTime) modalTime.innerText = syncConfig.lastSyncFormatted || "Not yet";

    const detectList = document.getElementById('syncDetectedFoldersList');
    if (detectList && syncConfig.detectedFolders && syncConfig.detectedFolders.length > 0) {
        detectList.innerHTML = `
            <div class="mb-2 p-2 bg-emerald-100/70 rounded-lg border border-emerald-300">
                <span class="text-[11px] font-bold text-emerald-950 block mb-1">Auto-detected Google Drive folders:</span>
                <div class="flex flex-wrap gap-1.5">
                    ${syncConfig.detectedFolders.map(df => `
                        <button type="button" onclick="selectDetectedSyncFolder('${df.replace(/\\/g, '\\\\')}')" class="text-[10px] font-mono bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-400 px-2 py-1 rounded shadow-xs font-bold">
                            📁 ${df}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

function selectDetectedSyncFolder(folderPath) {
    const input = document.getElementById('syncCloudFolderPath');
    if (input) input.value = folderPath;
    syncConfig.cloudFolderPath = folderPath;
    saveSyncConfig();
    showToast("Google Drive path selected!");
}

function closeCloudSyncModal() {
    const modal = document.getElementById('cloudSyncModal');
    if (modal) modal.classList.add('hidden');
}

function saveCloudSyncSettings() {
    const url = (document.getElementById('syncCloudUrlInput')?.value || '').trim();
    const path = (document.getElementById('syncCloudFolderPath')?.value || '').trim();
    const urlToggle = document.getElementById('syncCloudUrlToggle')?.checked ?? true;
    const folderToggle = document.getElementById('syncFolderToggle')?.checked ?? true;

    if (url) syncConfig.cloudApiUrl = url;
    if (path) syncConfig.cloudFolderPath = path;
    syncConfig.internetCloudEnabled = urlToggle;
    syncConfig.cloudFolderEnabled = folderToggle;

    saveSyncConfig();
    triggerBackgroundSync();
    closeCloudSyncModal();
    showToast("Cloud sync settings saved successfully!");
}

async function manualPushToCloud() {
    updateSyncBadge("syncing", "Sending to cloud...");
    const dataset = getFullSystemDataset();
    dataset.lastModifiedTimestamp = Date.now();
    dataset.syncSeq = ((typeof syncConfig.lastSyncedSeq === 'number') ? syncConfig.lastSyncedSeq : 0) + 1;

    try {
        const resp = await mantleCloudPush(syncConfig.cloudApiUrl, dataset);

        if (resp.ok) {
            const res = await resp.json();
            if (res.success) {
                syncConfig.lastSyncTimestamp = Date.now();
                const now = new Date();
                syncConfig.lastSyncFormatted = now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                saveSyncConfig();

                const modalTime = document.getElementById('syncModalLastTime');
                if (modalTime) modalTime.innerText = syncConfig.lastSyncFormatted;
                updateSyncBadge("synced", `Saved: ${syncConfig.lastSyncFormatted}`);
                const _ph = datasetContentHash(dataset);
                syncConfig.lastSyncedLocalHash = _ph;
                syncConfig.lastSyncedCloudHash = _ph;
                syncConfig.lastSyncedSeq = dataset.syncSeq;
                syncConfig.lastSyncedGen = Number(dataset.syncGen || 0);
                saveSyncConfig();
                showToast("✅ All timetables and data have been sent to the cloud successfully!");
                return;
            }
        }
        showToast("⚠️ Could not send data to the cloud. Please check your internet connection.");
    } catch (e) {
        showToast("⚠️ Connection error: " + e.message);
    }
}

async function manualPullFromCloud() {
    updateSyncBadge("syncing", "Fetching from cloud...");
    try {
        const resp = await mantleCloudPull(syncConfig.cloudApiUrl);

        if (resp.ok) {
            const res = await resp.json();
            if (res.success && res.data && (res.data.settings || res.data.teachers)) {
                applyRemoteSyncData(res.data, true, "Online Cloud", true);
                return;
            }
        }
        showToast("⚠️ No data was found on the cloud.");
    } catch (e) {
        showToast("⚠️ Could not connect: " + e.message);
    }
}

async function manualSmartMerge() {
    updateSyncBadge("syncing", "Smart merging...");
    try {
        const resp = await mantleCloudPull(syncConfig.cloudApiUrl);

        if (resp.ok) {
            const res = await resp.json();
            if (res.success && res.data && (res.data.settings || res.data.teachers)) {
                const current = getFullSystemDataset();
                saveSafetySnapshot(current);
                const merged = smartMergeDatasets(current, res.data);
                applyRemoteSyncData(merged, true, "Cloud Smart Merge");
                triggerBackgroundSync(merged);
                return;
            }
        }
        showToast("⚠️ No new data was found on the cloud. Your local data is safe.");
    } catch (e) {
        showToast("⚠️ Smart Merge error: " + e.message);
    }
}

function restoreLatestSafetyBackup() {
    try {
        const saved = localStorage.getItem("GHS_WALTON_PRE_SYNC_BACKUP");
        if (!saved) {
            alert("No saved pre-sync safety backup was found.");
            return;
        }
        if (!confirm("Do you really want to restore the previous pre-sync safety backup?")) return;
        const parsed = JSON.parse(saved);
        applyRemoteSyncData(parsed, true, "Pre-Sync Safety Backup");
    } catch (e) {
        alert("Error restoring safety backup: " + e.message);
    }
}

function exportSyncFile() {
    const dataset = getFullSystemDataset();
    dataset.lastModifiedTimestamp = Date.now();
    const now = new Date();
    const dateStamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

    const jsonStr = JSON.stringify(dataset, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GHS_Walton_Timetable_Sync_${dateStamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Sync file downloaded for WhatsApp or USB!");
}

function importSyncFile(fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const incoming = JSON.parse(e.target.result);
            if (!incoming || (!incoming.settings && !incoming.teachers)) {
                alert("Invalid sync file! Please select a correct file.");
                return;
            }

            const current = getFullSystemDataset();
            saveSafetySnapshot(current);

            incoming.lastModifiedTimestamp = Date.now();
            applyRemoteSyncData(incoming, true, "Imported file");
            fileInput.value = '';
            closeCloudSyncModal();
        } catch (err) {
            alert("File import error: " + err.message);
        }
    };
    reader.readAsText(file);
}



// ---- Live Bell Time Adjustment (Task 1, part 2) ----
// DENONTEK bell ka web interface. PIN yahan NAHI likha jata — user DENONTEK
// page par khud enter karega. Sirf IP configurable hai (default 192.168.4.1).
const BELL_IP_STORAGE_KEY = 'tt_bell_ip';
function getBellIp() {
    try { return localStorage.getItem(BELL_IP_STORAGE_KEY) || '192.168.4.1'; }
    catch (e) { return '192.168.4.1'; }
}
function openBellAdjustModal() {
    const modal = document.getElementById('bellAdjustModal');
    if (!modal) return;
    const ipInput = document.getElementById('bellIpInput');
    if (ipInput) ipInput.value = getBellIp();
    modal.classList.remove('hidden');
}
function closeBellAdjustModal() {
    const modal = document.getElementById('bellAdjustModal');
    if (modal) modal.classList.add('hidden');
}
function saveBellIp() {
    const ipInput = document.getElementById('bellIpInput');
    const ip = (ipInput ? ipInput.value.trim() : '') || '192.168.4.1';
    try { localStorage.setItem(BELL_IP_STORAGE_KEY, ip); } catch (e) {}
    return ip;
}
function openBellSettings() {
    const ip = saveBellIp();
    window.open('http://' + ip, '_blank');
}
function openBellSettingsIframe() {
    const ip = saveBellIp();
    const frame = document.getElementById('bellAdjustIframe');
    if (frame) frame.src = 'http://' + ip;
}

// ---- Cloud Sync: Export/Import timetable-sync-data.json (Task 4, part 2) ----
// Sync works via Google Drive folder (same account on both PCs) or manual
// Export/Import. No fake auto-sync: the file must be in the shared Drive
// folder, or transferred manually (WhatsApp/USB).
function exportTimetableSyncData() {
    try {
        const dataset = getFullSystemDataset();
        dataset.lastModifiedTimestamp = Date.now();
        const jsonStr = JSON.stringify(dataset, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timetable-sync-data.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        const el = document.getElementById('syncModalLastTime');
        if (el) el.textContent = new Date().toLocaleString();
        showToast('timetable-sync-data.json downloaded — save it in the shared Google Drive folder.');
    } catch (e) { alert('Export failed: ' + e.message); }
}
function importTimetableSyncData(fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (!confirm('Importing will completely REPLACE all current data with the file data. Continue?')) { fileInput.value = ''; return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const incoming = JSON.parse(e.target.result);
            const current = getFullSystemDataset();
            saveSafetySnapshot(current);
            incoming.lastModifiedTimestamp = Date.now();
            applyRemoteSyncData(incoming, true, 'Imported file');
            const el = document.getElementById('syncModalLastTime');
            if (el) el.textContent = new Date().toLocaleString();
            fileInput.value = '';
            closeCloudSyncModal();
        } catch (err) { alert('File import failed: ' + err.message); }
    };
    reader.readAsText(file);
}

// ============================================================================
// TEACHER SUBSTITUTION (Task 6)
// Read-only w.r.t. teachersList / classesList / scheduleResult: assignments live
// only in substitutionAssignments. All functions are null-safe: when
// scheduleResult is null, the view shows "Timetable not generated yet".
// ============================================================================
const SUBSTITUTION_LEAVE_CAUSES = ['C-Leave', 'Medical Leave', 'BISE Exam Duty', 'Training', 'Sports Activities', 'School Official Work', 'Hygenic Problem', 'SBA Exam Duty', 'Hajj Leave', 'Maternity Leave', 'Paternity Leave', 'Umrah Leave', 'Short Leave', 'Earned Leave', 'PECTAA Duty', 'Census Duty', 'Election Duty', 'MD-CAT Duty', 'Vote Verification Duty', 'FPSC Duty', 'PU Exam Duty', 'Paper Setter Duty', 'Official Dak Duty'];

function substitutionSortedTeachers() {
    return [...(teachersList || [])].sort((a, b) =>
        String(a.name || '').toLowerCase().localeCompare(String(b.name || '').toLowerCase()));
}
function substitutionTeacherById(id) {
    return (teachersList || []).find(t => String(t.id) === String(id)) || null;
}
function substitutionJsStr(v) { return String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

// Category matching. Designations carry dots/spaces/case variants ("S.S.T(SC)",
// "SST (Arts)", "SSt (Eng)", "EST (A.T)"), so strip non-letters before testing:
// /sst/i on the normalised form, /^est/i on the normalised form, /pet/i.
function getTeacherCategory(designation) {
    const norm = String(designation || '').replace(/[^a-z]/gi, '').toLowerCase();
    if (/sst/.test(norm)) return 'SST';
    if (/^est/.test(norm)) return 'EST';
    if (/pet/.test(norm)) return 'PET';
    return 'OTHER';
}

// A lesson counts as "teaching" only if it is a real class lesson. The
// scheduler fills empty teacherSchedule slots with {isFree: true, ...} (not
// undefined), so free slots must be recognised via isFree / missing classId.
function substitutionIsTeachingLesson(lesson) {
    return !!(lesson && !lesson.isFree && lesson.classId != null && String(lesson.classId) !== '');
}
function substitutionTeacherTeachesSenior(teacher) {
    if (!teacher || !scheduleResult || !scheduleResult.teacherSchedule) return false;
    const row = scheduleResult.teacherSchedule[teacher.id] || {};
    return Object.values(row).some(l => {
        if (!substitutionIsTeachingLesson(l)) return false;
        const cn = String(l.className || '').trim().toLowerCase();
        return cn === '9th' || cn === '10th';
    });
}

// canSubstitute(subTeacher, leaveTeacher, lesson): category-matched.
// SST→SST only; EST→EST only; PET→PET only; OTHER→same designation.
// EXCEPTION: an EST teacher who teaches 9th/10th MAY substitute for an SST
// teacher in a 9th/10th class. allowAnyOther=true is the OTHER fallback
// ("same designation, or any if none") used only when no same-designation
// free teacher exists for that period.
function canSubstitute(subTeacher, leaveTeacher, lesson, allowAnyOther) {
    if (!subTeacher || !leaveTeacher) return false;
    if (String(subTeacher.id) === String(leaveTeacher.id)) return false;
    const subCat = getTeacherCategory(subTeacher.designation);
    const leaveCat = getTeacherCategory(leaveTeacher.designation);
    if (leaveCat === 'SST') {
        if (subCat === 'SST') return true;
        if (subCat === 'EST') {
            const cls = String((lesson && lesson.className) || '').trim().toLowerCase();
            if ((cls === '9th' || cls === '10th') && substitutionTeacherTeachesSenior(subTeacher)) return true;
        }
        return false;
    }
    if (leaveCat === 'EST') return subCat === 'EST';
    if (leaveCat === 'PET') return subCat === 'PET';
    // OTHER
    if (allowAnyOther) return true;
    return String(subTeacher.designation || '').trim().toLowerCase() ===
        String(leaveTeacher.designation || '').trim().toLowerCase();
}

function substitutionLeaveTeacherIds(date) {
    const d = date || substitutionState.date;
    return new Set((substitutionLeaves || []).map(l => String(l.teacherId)));
}
function substitutionAssignmentKey(date, periodId, classId) {
    return `${date}|${periodId}|${classId}`;
}
function substitutionGetAssignment(date, periodId, classId) {
    return substitutionAssignments[substitutionAssignmentKey(date, periodId, classId)] || '';
}

// Teaching periods of one leave teacher on the selected date, in period order.
function substitutionLeavePeriods(teacherId) {
    if (!scheduleResult || !scheduleResult.teacherSchedule || !appSettings || !appSettings.periods) return [];
    const row = scheduleResult.teacherSchedule[teacherId] || {};
    return (appSettings.periods || []).map(p => {
        const lesson = row[p.id];
        if (!substitutionIsTeachingLesson(lesson)) return null;
        return { period: p, lesson };
    }).filter(Boolean);
}

// Free + category-matched teachers for one leave period. currentKey (if given)
// is the assignment slot being (re)assigned, so its current holder stays eligible.
function substitutionGetFreeTeachers(periodId, leaveTeacher, lesson, currentKey) {
    if (!scheduleResult || !scheduleResult.teacherSchedule || !leaveTeacher) return [];
    const date = substitutionState.date;
    const onLeave = substitutionLeaveTeacherIds(date);
    const inchargeId = String(substitutionState.admissionsInchargeId || '');
    const base = substitutionSortedTeachers().filter(t => {
        if (String(t.id) === String(leaveTeacher.id)) return false;
        if (onLeave.has(String(t.id))) return false;
        if (inchargeId && String(t.id) === inchargeId) return false;
        // Free at this period: no teaching lesson in teacherSchedule.
        const slot = (scheduleResult.teacherSchedule[t.id] || {})[periodId];
        if (substitutionIsTeachingLesson(slot)) return false;
        // Not already substitute-assigned to another class in this same period.
        const clash = Object.keys(substitutionAssignments).some(k => {
            if (currentKey && k === currentKey) return false;
            const parts = k.split('|');
            return parts[0] === date && String(parts[1]) === String(periodId) &&
                String(substitutionAssignments[k]) === String(t.id);
        });
        return !clash;
    });
    let matched = base.filter(t => canSubstitute(t, leaveTeacher, lesson, false));
    // OTHER fallback: same designation, or any if none.
    if (matched.length === 0 && getTeacherCategory(leaveTeacher.designation) === 'OTHER') {
        matched = base.filter(t => canSubstitute(t, leaveTeacher, lesson, true));
    }
    return matched;
}

// ---- Leave / assignment mutations (all persist + re-render) ----
function substitutionChangeDate(newDate) {
    if (!newDate) return;
    substitutionLeavesByDate[substitutionState.date] = Array.isArray(substitutionLeaves) ? substitutionLeaves : [];
    substitutionState.date = newDate;
    substitutionLeaves = Array.isArray(substitutionLeavesByDate[newDate]) ? substitutionLeavesByDate[newDate] : [];
    saveSubstitutionData();
    renderSubstitutionView();
}
function substitutionSetAdmissionsIncharge(teacherId) {
    substitutionState.admissionsInchargeId = teacherId || '';
    saveSubstitutionData();
    renderSubstitutionView();
}
function substitutionAddLeave() {
    const teacherSel = document.getElementById('subLeaveTeacherSelect');
    const causeSel = document.getElementById('subLeaveCauseSelect');
    const teacherId = teacherSel ? teacherSel.value : '';
    const cause = causeSel ? causeSel.value : '';
    if (!teacherId) { showToast('Please select a teacher on leave.'); return; }
    if ((substitutionLeaves || []).some(l => String(l.teacherId) === String(teacherId))) {
        showToast('This teacher is already marked on leave for this date.');
        return;
    }
    substitutionLeaves.push({ teacherId, cause: cause || 'C-Leave' });
    const date = substitutionState.date;
    if (!substitutionLeaveLog.some(e => e.date === date && String(e.teacherId) === String(teacherId))) {
        substitutionLeaveLog.push({ date, teacherId, cause: cause || 'C-Leave' });
    }
    saveSubstitutionData();
    renderSubstitutionView();
}
function substitutionRemoveLeave(teacherId) {
    const date = substitutionState.date;
    substitutionLeaves = (substitutionLeaves || []).filter(l => String(l.teacherId) !== String(teacherId));
    // Drop this teacher's substitute assignments for the date.
    Object.keys(substitutionAssignments).forEach(k => {
        const parts = k.split('|');
        if (parts[0] !== date) return;
        const lesson = substitutionLessonForKey(parts[1], parts[2]);
        if (lesson && String(lesson.teacherId) === String(teacherId)) delete substitutionAssignments[k];
    });
    saveSubstitutionData();
    renderSubstitutionView();
}
// Lesson of the leave teacher behind an assignment key (for cleanup only).
function substitutionLessonForKey(periodId, classId) {
    if (!scheduleResult || !scheduleResult.classSchedule) return null;
    const lesson = (scheduleResult.classSchedule[classId] || {})[periodId];
    return substitutionIsTeachingLesson(lesson) ? lesson : null;
}
function substitutionAssign(periodId, classId, selectId) {
    const sel = document.getElementById(selectId);
    if (!sel || !sel.value) { showToast('Please select a substitute teacher.'); return; }
    const prevId = substitutionAssignments[substitutionAssignmentKey(substitutionState.date, periodId, classId)];
    substitutionAssignments[substitutionAssignmentKey(substitutionState.date, periodId, classId)] = sel.value;
    saveSubstitutionData();
    // TASK 7: date-wise history — substitute assigned / re-assigned.
    (function () { const _st = (typeof substitutionTeacherById === 'function') ? substitutionTeacherById(sel.value) : null; logHistory('substitution', prevId ? 'edit' : 'add', 'Substitute ' + ((_st && _st.name) || sel.value) + ' assigned for ' + substitutionState.date + (prevId ? ' (re-assigned).' : '.'), { assignments: historyClone(substitutionAssignments), date: substitutionState.date }); })();
    renderSubstitutionView();
    // Notify whenever the assigned substitute changes (new OR re-assigned).
    if (String(prevId || '') !== String(sel.value)) substitutionNotifyNewAssignments([sel.value]);
}
function substitutionClearAssignment(periodId, classId) {
    const _clearedId = substitutionAssignments[substitutionAssignmentKey(substitutionState.date, periodId, classId)];
    delete substitutionAssignments[substitutionAssignmentKey(substitutionState.date, periodId, classId)];
    // TASK 7: date-wise history — substitution assignment cleared.
    if (_clearedId) { const _st = (typeof substitutionTeacherById === 'function') ? substitutionTeacherById(_clearedId) : null; logHistory('substitution', 'delete', 'Substitution assignment cleared for ' + ((_st && _st.name) || _clearedId) + ' on ' + substitutionState.date + '.', { assignments: historyClone(substitutionAssignments), date: substitutionState.date }); }
    saveSubstitutionData();
    renderSubstitutionView();
}

// ---- Fairness counts ----
function substitutionLeaveCountThisMonth(teacherId, dateStr) {
    const month = String(dateStr || substitutionState.date).slice(0, 7);
    return (substitutionLeaveLog || []).filter(e =>
        String(e.date || '').slice(0, 7) === month && String(e.teacherId) === String(teacherId)).length;
}
function substitutionSubCountInRange(teacherId, startISO, endISO) {
    let n = 0;
    Object.keys(substitutionAssignments || {}).forEach(k => {
        const d = k.split('|')[0];
        if (d >= startISO && d <= endISO && String(substitutionAssignments[k]) === String(teacherId)) n++;
    });
    return n;
}
function substitutionWeekRange(dateStr) {
    const [y, m, d] = String(dateStr).split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    const diffToMonday = (dt.getDay() + 6) % 7;
    const mon = new Date(dt); mon.setDate(dt.getDate() - diffToMonday);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    return { start: fmt(mon), end: fmt(sun) };
}
function substitutionMonthRange(dateStr) {
    const month = String(dateStr).slice(0, 7);
    const [y, m] = month.split('-').map(Number);
    const last = new Date(y, m, 0).getDate();
    return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, '0')}` };
}
function substitutionAutoAdjustAll() {
    const date = substitutionState.date;
    const month = substitutionMonthRange(date);
    let assigned = 0, skipped = 0, total = 0;
    const newlyAssigned = [];
    const leavesSorted = [...(substitutionLeaves || [])].sort((a, b) => {
        const na = (substitutionTeacherById(a.teacherId) || {}).name || '';
        const nb = (substitutionTeacherById(b.teacherId) || {}).name || '';
        return na.toLowerCase().localeCompare(nb.toLowerCase());
    });
    leavesSorted.forEach(lv => {
        const leaveTeacher = substitutionTeacherById(lv.teacherId);
        if (!leaveTeacher) return;
        substitutionLeavePeriods(lv.teacherId).forEach(({ period, lesson }) => {
            total++;
            const key = substitutionAssignmentKey(date, period.id, lesson.classId);
            if (substitutionAssignments[key]) return; // keep existing manual assignments
            if (typeof fpIsFrozenForDate === 'function' && fpIsFrozenForDate(lesson.classId, period.id, date)) { skipped++; return; } // Fix/Freeze: frozen slot is protected
            const candidates = substitutionGetFreeTeachers(period.id, leaveTeacher, lesson, key);
            if (!candidates.length) { skipped++; return; }
            // Patch 35 — the user's Leave Balance rule (Software Rules:
            // 'substitutionLeaveBalancePriority', Teacher Substitution).
            // Teachers who have taken leave (any cause) this month are
            // served FIRST, ranked by balance = leaves this month -
            // substitute periods already given this month (highest
            // first), so the teacher with the most leaves receives the
            // most extra periods until the account balances; teachers
            // with no leave follow in the normal routine order (fewest
            // assigned first). Recomputed per slot. When the rule is
            // off, the previous fairness applies (effective monthly
            // count: leaves > 2 gives a small head start).
            const leaveBalanceOn = (typeof ruleEnabled === 'function') ? ruleEnabled('substitutionLeaveBalancePriority', true) : true;
            const ranked = candidates.map(t => {
                const raw = substitutionSubCountInRange(t.id, month.start, month.end);
                const leaves = substitutionLeaveCountThisMonth(t.id, date);
                const effective = leaves > 2 ? raw - 2 : raw + 2;
                return { t, raw, leaves, balance: leaves - raw, effective };
            }).sort((a, b) => leaveBalanceOn
                ? ((b.balance - a.balance) || (a.raw - b.raw) || String(a.t.name || '').toLowerCase().localeCompare(String(b.t.name || '').toLowerCase()))
                : ((a.effective - b.effective) || (a.raw - b.raw) || String(a.t.name || '').toLowerCase().localeCompare(String(b.t.name || '').toLowerCase())));
            substitutionAssignments[key] = ranked[0].t.id;
            assigned++;
            newlyAssigned.push(ranked[0].t.id);
        });
    });
    saveSubstitutionData();
    // TASK 7: date-wise history — substitution auto-adjust.
    logHistory('substitution', 'edit', 'Auto-adjust assigned ' + assigned + ' substitution(s) for ' + date + ' (' + skipped + ' period(s) with no free teacher).', { assignments: historyClone(substitutionAssignments), date: date });
    renderSubstitutionView();
    showToast(`Auto-adjust: ${assigned} assigned, ${skipped} with no free teacher (${total} periods).`);
    // (Task 3) Auto-Adjust All only adjusts teachers — NO WhatsApp share here.
    // Sharing happens only when the user clicks 'Send WhatsApp' in Action.
}

// ---- Substitute rows for the selected date (flattened assignments) ----
function substitutionRowsForDate(date) {
    const rows = [];
    Object.keys(substitutionAssignments || {}).forEach(k => {
        const parts = k.split('|');
        if (parts[0] !== date) return;
        const subTeacher = substitutionTeacherById(substitutionAssignments[k]);
        const lesson = substitutionLessonForKey(parts[1], parts[2]);
        if (!subTeacher || !lesson) return;
        const leaveTeacher = substitutionTeacherById(lesson.teacherId);
        const period = (appSettings && appSettings.periods || []).find(p => String(p.id) === String(parts[1])) || { id: parts[1], name: 'Period ' + parts[1], startTime: lesson.startTime || '', endTime: lesson.endTime || '' };
        rows.push({ key: k, period, lesson, subTeacher, leaveTeacher, date });
    });
    const periodOrder = {};
    (appSettings && appSettings.periods || []).forEach((p, i) => { periodOrder[String(p.id)] = i; });
    rows.sort((a, b) =>
        String(a.subTeacher.name || '').toLowerCase().localeCompare(String(b.subTeacher.name || '').toLowerCase()) ||
        ((periodOrder[String(a.period.id)] ?? 999) - (periodOrder[String(b.period.id)] ?? 999)));
    return rows;
}

// ---- Main render ----
function renderSubstitutionView() {
    const container = document.getElementById('substitutionContainer');
    if (!container) return;
    const date = substitutionState.date;
    const sorted = substitutionSortedTeachers();
    const teacherOptions = sorted.map(t =>
        `<option value="${escapeHtml(String(t.id))}">${escapeHtml(t.name)} (${escapeHtml(formatDesignation(t.designation) || 'Teacher')})</option>`).join('');
    const causeOptions = getSubstitutionLeaveCauses().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    const inchargeOptions = `<option value="">-- None --</option>` + sorted.map(t =>
        `<option value="${escapeHtml(String(t.id))}" ${String(substitutionState.admissionsInchargeId) === String(t.id) ? 'selected' : ''}>${escapeHtml(t.name)} (${escapeHtml(formatDesignation(t.designation) || 'Teacher')})</option>`).join('');

    let html = `
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2"><i class="fa-solid fa-user-pen text-emerald-600"></i> Teacher Substitution</h2>
                <p class="text-xs text-slate-500">Mark teachers on leave for a date and assign substitutes for their periods.</p>
            </div>
            <label class="flex items-center gap-2 text-xs font-bold text-slate-700">Date:
                <input type="date" value="${escapeHtml(date)}" onchange="substitutionChangeDate(this.value)" class="border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold">
            </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Teacher on Leave</label>
                <select id="subLeaveTeacherSelect" class="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs">${teacherOptions}</select>
            </div>
            <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Leave Cause</label>
                <select id="subLeaveCauseSelect" class="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs">${causeOptions}</select>
            </div>
            <div>
                <button onclick="substitutionAddLeave()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition">+ Add Leave</button>
            </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <label class="text-xs font-bold text-slate-700">Admissions Incharge (never receives substitute periods):</label>
            <select onchange="substitutionSetAdmissionsIncharge(this.value)" class="flex-1 border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white">${inchargeOptions}</select>
        </div>
        <label class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-bold text-slate-700 cursor-pointer">
            <input type="checkbox" ${substitutionState.whatsappNotify !== false ? 'checked' : ''} onchange="substitutionToggleWhatsApp(this.checked)" class="w-4 h-4 text-emerald-600 rounded">
            <span>📱 Auto WhatsApp notification on timetable change (auto message to substitute teacher)</span>
        </label>
        </div>`;

    if (!scheduleResult || !scheduleResult.teacherSchedule) {
        html += `<div class="bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold rounded-xl p-4">Timetable not generated yet. Generate the timetable first to see leave teachers' periods and assign substitutes.</div>`;
        html += `</div>`;
        container.innerHTML = html;
        return;
    }

    // ---- (c) Leave list + per-period assignment ----
    if (!substitutionLeaves.length) {
        html += `<div class="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">No teacher on leave for ${escapeHtml(date)}. Add a leave above.</div>`;
    } else {
        html += `<div class="space-y-4">`;
        const leavesSorted = [...substitutionLeaves].sort((a, b) => {
            const na = (substitutionTeacherById(a.teacherId) || {}).name || '';
            const nb = (substitutionTeacherById(b.teacherId) || {}).name || '';
            return na.toLowerCase().localeCompare(nb.toLowerCase());
        });
        leavesSorted.forEach(lv => {
            const lt = substitutionTeacherById(lv.teacherId);
            if (!lt) return;
            const periods = substitutionLeavePeriods(lv.teacherId);
            html += `<div class="border border-slate-200 rounded-xl overflow-hidden">
                <div class="flex flex-wrap items-center justify-between gap-2 bg-indigo-50 px-3 py-2">
                    <span class="text-xs font-bold text-slate-900">${escapeHtml(lt.name)} <span class="font-semibold text-slate-500">(${escapeHtml(formatDesignation(lt.designation) || 'Teacher')} — ${escapeHtml(lv.cause || '')})</span></span>
                    <button onclick="substitutionRemoveLeave('${substitutionJsStr(lv.teacherId)}')" class="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold px-2.5 py-1 rounded-lg">Remove Leave</button>
                </div>`;
            if (!periods.length) {
                html += `<div class="text-xs text-slate-500 px-3 py-2">No periods to cover for this teacher on this date.</div>`;
            } else {
                html += `<table class="w-full text-xs"><thead><tr class="bg-slate-100 text-slate-600">
                    <th class="text-left px-3 py-1.5">Period</th><th class="text-left px-3 py-1.5">Time</th>
                    <th class="text-left px-3 py-1.5">Class</th><th class="text-left px-3 py-1.5">Subject</th>
                    <th class="text-left px-3 py-1.5">Substitute</th><th class="text-left px-3 py-1.5">Action</th></tr></thead><tbody>`;
                periods.forEach(({ period, lesson }) => {
                    const key = substitutionAssignmentKey(date, period.id, lesson.classId);
                    const curId = substitutionGetAssignment(date, period.id, lesson.classId);
                    const curTeacher = curId ? substitutionTeacherById(curId) : null;
                    const candidates = substitutionGetFreeTeachers(period.id, lt, lesson, key);
                    const selId = `subSel_${period.id}_${lesson.classId}`;
                    const candOptions = candidates.map(t =>
                        `<option value="${escapeHtml(String(t.id))}" ${String(t.id) === String(curId) ? 'selected' : ''}>${escapeHtml(t.name)} (${escapeHtml(formatDesignation(t.designation))})</option>`).join('');
                    html += `<tr class="border-t border-slate-100">
                        <td class="px-3 py-1.5 font-semibold">${escapeHtml(period.name || ('Period ' + period.id))}</td>
                        <td class="px-3 py-1.5">${escapeHtml(lesson.startTime || period.startTime || '')} - ${escapeHtml(lesson.endTime || period.endTime || '')}</td>
                        <td class="px-3 py-1.5">${escapeHtml(formatClassSectionName(lesson.className, lesson.section))}</td>
                        <td class="px-3 py-1.5">${escapeHtml(lesson.subjectName || '')}</td>
                        <td class="px-3 py-1.5">${curTeacher ? `<span class="font-bold text-emerald-700">${escapeHtml(curTeacher.name)}</span>` : '<span class="text-slate-400">Not assigned</span>'}</td>
                        <td class="px-3 py-1.5"><div class="flex items-center gap-1 flex-wrap">`;
                    // MANUAL ASSIGN: dropdown ALWAYS shows so user can manually pick any
                    // free teacher for this period (independent of Auto-Adjust).
                    if (!candidates.length && !curId) {
                        html += `<span class="text-[11px] font-semibold text-red-600">No free teacher</span>`;
                    } else {
                        html += `<select id="${escapeHtml(selId)}" class="border border-slate-300 rounded-lg px-1.5 py-1 text-[11px] max-w-[170px]"><option value="">-- Select --</option>${candOptions}</select>
                        <button onclick="substitutionAssign('${substitutionJsStr(period.id)}','${substitutionJsStr(lesson.classId)}','${substitutionJsStr(selId)}')" class="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">Assign</button>`;
                    }
                    if (curId) html += `<button onclick="substitutionClearAssignment('${substitutionJsStr(period.id)}','${substitutionJsStr(lesson.classId)}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-lg">Clear</button>`;
                    // WhatsApp button next to assigned substitute (works even if auto-open is blocked).
                    if (curId) { html += `<button onclick="substitutionSendWhatsAppToTeacher('${curId}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg inline-block">📱 Send WhatsApp</button>`; }
                    html += `</div></td></tr>`;
                });
                html += `</tbody></table>`;
            }
            html += `</div>`;
        });
        html += `</div>`;
        html += `<div><button onclick="substitutionAutoAdjustAll()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow transition">⚖️ Auto-Adjust All</button></div>`;
    }

    // ---- (f) Weekly + monthly counts ----
    const week = substitutionWeekRange(date);
    const month = substitutionMonthRange(date);
    html += `<div>
        <h3 class="text-sm font-bold text-slate-900 mb-2">Substitute Period Counts (Weekly / Monthly)</h3>
        <p class="text-[11px] text-slate-500 mb-2">Auto-adjust assigns to teachers with fewest substitute periods first, so by month end counts stay balanced.</p>
        <div class="overflow-auto border border-slate-200 rounded-xl"><table class="w-full text-xs"><thead><tr class="bg-slate-100 text-slate-600">
            <th class="text-left px-3 py-1.5">Teacher</th><th class="text-left px-3 py-1.5">Designation</th>
            <th class="text-left px-3 py-1.5">This Week (${escapeHtml(week.start)} to ${escapeHtml(week.end)})</th>
            <th class="text-left px-3 py-1.5">This Month (${escapeHtml(date.slice(0, 7))})</th>
            <th class="text-left px-3 py-1.5">Leaves This Month</th></tr></thead><tbody>`;
    sorted.forEach(t => {
        const w = substitutionSubCountInRange(t.id, week.start, week.end);
        const m = substitutionSubCountInRange(t.id, month.start, month.end);
        const lv = substitutionLeaveCountThisMonth(t.id, date);
        html += `<tr class="border-t border-slate-100 ${w === 0 && m === 0 ? 'text-slate-400' : ''}">
            <td class="px-3 py-1.5 font-semibold">${escapeHtml(t.name)}</td><td class="px-3 py-1.5">${escapeHtml(formatDesignation(t.designation))}</td>
            <td class="px-3 py-1.5">${w}</td><td class="px-3 py-1.5">${m}</td><td class="px-3 py-1.5">${lv}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;

    // ---- (g) Month-end leave report ----
    html += `<div><h3 class="text-sm font-bold text-slate-900 mb-2">Month-End Leave Report — ${escapeHtml(date.slice(0, 7))}</h3>`;
    const monthLog = (substitutionLeaveLog || []).filter(e => String(e.date || '').slice(0, 7) === date.slice(0, 7));
    if (!monthLog.length) {
        html += `<div class="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">No leaves recorded this month.</div>`;
    } else {
        const perTeacher = {};
        monthLog.forEach(e => {
            const tid = String(e.teacherId);
            if (!perTeacher[tid]) perTeacher[tid] = { total: 0, byCause: {} };
            perTeacher[tid].total++;
            perTeacher[tid].byCause[e.cause || 'C-Leave'] = (perTeacher[tid].byCause[e.cause || 'C-Leave'] || 0) + 1;
        });
        const mostByCause = {};
        getSubstitutionLeaveCauses().forEach(c => {
            let best = null, bestN = 0;
            Object.keys(perTeacher).forEach(tid => {
                const n = perTeacher[tid].byCause[c] || 0;
                if (n > bestN) { bestN = n; best = tid; }
            });
            if (best) mostByCause[c] = { tid: best, n: bestN };
        });
        html += `<div class="overflow-auto border border-slate-200 rounded-xl"><table class="w-full text-xs"><thead><tr class="bg-slate-100 text-slate-600">
            <th class="text-left px-3 py-1.5">Teacher</th>${getSubstitutionLeaveCauses().map(c => `<th class="text-left px-2 py-1.5">${escapeHtml(c)}</th>`).join('')}
            <th class="text-left px-3 py-1.5">Total</th></tr></thead><tbody>`;
        Object.keys(perTeacher).sort((a, b) => {
            const na = (substitutionTeacherById(a) || {}).name || '';
            const nb = (substitutionTeacherById(b) || {}).name || '';
            return na.toLowerCase().localeCompare(nb.toLowerCase());
        }).forEach(tid => {
            const t = substitutionTeacherById(tid);
            html += `<tr class="border-t border-slate-100"><td class="px-3 py-1.5 font-semibold">${escapeHtml(t ? t.name : tid)}</td>`;
            getSubstitutionLeaveCauses().forEach(c => {
                const n = perTeacher[tid].byCause[c] || 0;
                const isMost = mostByCause[c] && String(mostByCause[c].tid) === String(tid) && n > 0;
                html += `<td class="px-2 py-1.5 ${isMost ? 'bg-amber-100 font-black text-amber-900' : ''}">${n || '-'}</td>`;
            });
            html += `<td class="px-3 py-1.5 font-bold">${perTeacher[tid].total}</td></tr>`;
        });
        html += `</tbody></table></div>`;
        html += `<div class="mt-2 space-y-1">${getSubstitutionLeaveCauses().map(c => {
            const m = mostByCause[c];
            if (!m) return '';
            const t = substitutionTeacherById(m.tid);
            return `<div class="text-[11px] text-slate-700">Most ${escapeHtml(c)}: <b>${escapeHtml(t ? t.name : m.tid)}</b> (${m.n})</div>`;
        }).join('')}</div>`;
    }
    html += `</div>`;

    // ---- (h) Substitute timetable + signatures ----
    const rows = substitutionRowsForDate(date);
    html += `<div><h3 class="text-sm font-bold text-slate-900 mb-2">Substitute Timetable — ${escapeHtml(date)}</h3>`;
    if (!rows.length) {
        html += `<div class="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">No substitute assignments for this date yet.</div>`;
    } else {
        // Group by substitute teacher: their own original periods + substituted ones.
        const bySub = {};
        rows.forEach(r => { (bySub[String(r.subTeacher.id)] = bySub[String(r.subTeacher.id)] || []).push(r); });
        const periodOrder = {};
        (appSettings.periods || []).forEach((p, i) => { periodOrder[String(p.id)] = i; });
        html += `<div class="overflow-auto border border-slate-200 rounded-xl"><table class="w-full text-xs"><thead><tr class="bg-indigo-600 text-white">
            <th class="text-left px-3 py-2">Substitute Teacher</th><th class="text-left px-3 py-2">Period</th>
            <th class="text-left px-3 py-2">Time</th><th class="text-left px-3 py-2">Class</th>
            <th class="text-left px-3 py-2">Subject</th><th class="text-left px-3 py-2">Note</th></tr></thead><tbody>`;
        Object.keys(bySub).sort((a, b) => {
            const na = (substitutionTeacherById(a) || {}).name || '';
            const nb = (substitutionTeacherById(b) || {}).name || '';
            return na.toLowerCase().localeCompare(nb.toLowerCase());
        }).forEach(subId => {
            const subTeacher = substitutionTeacherById(subId);
            const own = (appSettings.periods || []).map(p => {
                const lesson = (scheduleResult.teacherSchedule[subId] || {})[p.id];
                return substitutionIsTeachingLesson(lesson) ? { period: p, lesson, note: 'Own period' } : null;
            }).filter(Boolean);
            const subs = bySub[subId].map(r => ({ period: r.period, lesson: r.lesson, note: `(Sub for ${r.leaveTeacher ? r.leaveTeacher.name : '—'})` }));
            const combined = [...own, ...subs].sort((a, b) =>
                ((periodOrder[String(a.period.id)] ?? 999) - (periodOrder[String(b.period.id)] ?? 999)));
            combined.forEach(item => {
                const isSub = item.note !== 'Own period';
                html += `<tr class="border-t border-slate-100 ${isSub ? 'bg-emerald-50' : ''}">
                    <td class="px-3 py-1.5 font-semibold">${escapeHtml(subTeacher ? subTeacher.name : subId)}</td>
                    <td class="px-3 py-1.5">${escapeHtml(item.period.name || ('Period ' + item.period.id))}</td>
                    <td class="px-3 py-1.5">${escapeHtml(item.lesson.startTime || item.period.startTime || '')} - ${escapeHtml(item.lesson.endTime || item.period.endTime || '')}</td>
                    <td class="px-3 py-1.5">${escapeHtml(formatClassSectionName(item.lesson.className, item.lesson.section))}</td>
                    <td class="px-3 py-1.5">${escapeHtml(item.lesson.subjectName || '')}</td>
                    <td class="px-3 py-1.5 ${isSub ? 'font-bold text-emerald-700' : 'text-slate-500'}">${escapeHtml(item.note)}</td></tr>`;
            });
        });
        html += `</tbody></table></div>`;
    }
    html += `<div class="flex flex-col sm:flex-row justify-between gap-6 mt-8 mb-2 text-xs font-bold text-slate-800">
        <span>Principal Signature: __________</span>
        <span>Time Table Incharge Signature: __________</span>
    </div></div>`;

    // ---- (i) Export buttons ----
    html += `<div class="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
        <button onclick="substitutionDownloadPNG()" class="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition">⬇️ Download PNG (Ultra HD)</button>
        <button onclick="substitutionShareWhatsApp()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition">💬 WhatsApp Share (PNG downloads, then attach in WhatsApp)</button>
    </div>`;

    html += `</div>`;
    container.innerHTML = html;
}

// ---- PNG export (canvas, ~3000px wide) + WhatsApp ----
function substitutionFitText(ctx, text, maxWidth) {
    text = String(text == null ? '' : text);
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return t + '…';
}
function substitutionBuildTimetableCanvas() {
    const date = substitutionState.date;
    const rows = substitutionRowsForDate(date);
    const W = 3000;
    const cols = [
        { title: 'Substitute Teacher', w: 560 },
        { title: 'Period', w: 280 },
        { title: 'Time', w: 520 },
        { title: 'Class', w: 420 },
        { title: 'Subject', w: 560 },
        { title: 'Sub For', w: 660 }
    ];
    const pad = 60;
    const rowH = 92;
    const headH = 110;
    const titleH = 240;
    const sigH = 260;
    const H = titleH + headH + Math.max(rows.length, 1) * rowH + sigH;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    // Title block
    ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, 0, W, 190);
    ctx.fillStyle = '#ffffff'; ctx.font = '700 72px Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Substitute Timetable', W / 2, 92);
    ctx.font = '400 44px Arial, sans-serif';
    ctx.fillText('Govt. High School Walton Lahore  •  Date: ' + date, W / 2, 158);
    // Header row
    let x = pad;
    ctx.font = '700 40px Arial, sans-serif'; ctx.textAlign = 'left';
    cols.forEach(c => {
        ctx.fillStyle = '#1e40af'; ctx.fillRect(x, titleH, c.w, headH);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(substitutionFitText(ctx, c.title, c.w - 30), x + 16, titleH + 68);
        x += c.w;
    });
    // Body rows
    ctx.font = '400 38px Arial, sans-serif';
    rows.forEach((r, i) => {
        const y = titleH + headH + i * rowH;
        if (i % 2 === 0) { ctx.fillStyle = '#f1f5f9'; ctx.fillRect(pad, y, W - pad * 2, rowH); }
        ctx.fillStyle = '#0f172a';
        const cells = [
            r.subTeacher ? r.subTeacher.name : '',
            r.period.name || ('Period ' + r.period.id),
            ((r.lesson.startTime || '') + ' - ' + (r.lesson.endTime || '')).trim(),
            formatClassSectionName(r.lesson.className, r.lesson.section),
            r.lesson.subjectName || '',
            r.leaveTeacher ? ('Sub for ' + r.leaveTeacher.name) : ''
        ];
        let cx = pad;
        cells.forEach((cell, ci) => {
            ctx.fillText(substitutionFitText(ctx, cell, cols[ci].w - 30), cx + 16, y + 60);
            cx += cols[ci].w;
        });
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pad, y + rowH); ctx.lineTo(W - pad, y + rowH); ctx.stroke();
    });
    if (!rows.length) {
        ctx.fillStyle = '#64748b'; ctx.textAlign = 'center'; ctx.font = '400 40px Arial, sans-serif';
        ctx.fillText('No substitute assignments for this date.', W / 2, titleH + headH + 58);
        ctx.textAlign = 'left';
    }
    // Signatures
    const sigY = titleH + headH + Math.max(rows.length, 1) * rowH + 130;
    ctx.fillStyle = '#0f172a'; ctx.font = '700 40px Arial, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Principal Signature: ____________________', pad, sigY);
    ctx.textAlign = 'right';
    ctx.fillText('Time Table Incharge Signature: ____________________', W - pad, sigY);
    return canvas;
}
async function substitutionDownloadPNG() {
    try {
        const canvas = await substitutionBuildTimetableCanvasAsync();
        const link = document.createElement('a');
        link.download = `Substitute_Timetable_${substitutionState.date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Substitute timetable PNG downloaded.');
    } catch (e) { console.warn('PNG export failed', e); showToast('PNG download failed.'); }
}
async function substitutionBuildTimetableCanvasAsync() {
    const canvas = substitutionBuildTimetableCanvas();
    try {
        const ctx = canvas.getContext('2d');
        const sigs = (appSettings && appSettings.signatures) || {};
        const W = canvas.width;
        const pad = 60;
        // Signature baseline is the sigY used in substitutionBuildTimetableCanvas
        const date = substitutionState.date;
        const rows = substitutionRowsForDate(date);
        const titleH = 240, headH = 110, rowH = 92;
        const sigY = titleH + headH + Math.max(rows.length, 1) * rowH + 130;
        // Cover the printed placeholder lines for Principal + Incharge with white, then draw signatures
        if (sigs.principal && sigs.principal.dataUrl) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pad, sigY - 90, 700, 110);
            await drawSignatureOnCanvas(ctx, sigs.principal, pad + 200, sigY, 320);
            ctx.fillStyle = '#0f172a'; ctx.font = '700 40px Arial, sans-serif'; ctx.textAlign = 'left';
            ctx.fillText('Principal Signature:', pad, sigY + 8);
        }
        if (sigs.incharge && sigs.incharge.dataUrl) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(W - pad - 900, sigY - 90, 900, 110);
            await drawSignatureOnCanvas(ctx, sigs.incharge, W - pad - 350, sigY, 320);
            ctx.fillStyle = '#0f172a'; ctx.font = '700 40px Arial, sans-serif'; ctx.textAlign = 'right';
            ctx.fillText('Time Table Incharge Signature:', W - pad, sigY + 8);
        }
    } catch (e) { console.warn('Signature overlay on substitution PNG failed', e); }
    return canvas;
}
// ---- Task 3: Send WhatsApp to ONE substitute teacher with Ultra HD PNG ----
// WhatsApp Web (wa.me) cannot pre-attach a file via URL, so this downloads the
// Ultra HD PNG and opens WhatsApp directly to THAT teacher's number with a
// message telling them to attach the downloaded PNG.
function substitutionSendWhatsAppToTeacher(teacherId) {
    try {
        const teacher = substitutionTeacherById(teacherId);
        if (!teacher) { showToast('Teacher not found.'); return; }
        const phone = formatPhoneForWhatsApp(substitutionTeacherPhone(teacher));
        if (!phone) { showToast('No phone number for ' + (teacher.name || 'teacher') + ' — please add phone in Teachers & Workload.'); return; }
        // Download Ultra HD PNG of the substitution timetable
        try { substitutionDownloadPNG(); } catch (e) {}
        const date = substitutionState.date;
        const msg = 'Dear ' + (teacher.name || 'Teacher') + ', please note that there is a change in your timetable. Substitute Timetable — ' + date + ' — Govt. High School Walton Lahore. Ultra HD PNG downloaded — please attach it here.';
        window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
        showToast('WhatsApp opened for ' + (teacher.name || 'teacher') + ' — PNG downloaded, please attach it.');
    } catch (e) { console.warn('Send WhatsApp to teacher failed', e); }
}
function substitutionShareWhatsApp() {
    const date = substitutionState.date;
    const rows = substitutionRowsForDate(date);
    substitutionDownloadPNG();
    let msg = `Substitute Timetable — ${date}\nGovt. High School Walton Lahore\n`;
    if (!rows.length) {
        msg += 'No substitute assignments for this date.';
    } else {
        rows.forEach(r => {
            msg += `\n• ${r.subTeacher ? r.subTeacher.name : ''} → ${formatClassSectionName(r.lesson.className, r.lesson.section)} ${r.lesson.subjectName || ''} (${r.period.name || ('Period ' + r.period.id)}) — Sub for ${r.leaveTeacher ? r.leaveTeacher.name : ''}`;
        });
    }
    msg += '\n\nPNG downloaded — please attach it here.';
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}


// ==========================================
// FIX / FREEZE TEACHER PERIODS (fixed_periods)
// A frozen (teacher, class, period) inside its date range is protected:
// Generate pre-places it, Adjustment edits on that cell are blocked, and
// Substitution Auto Adjust skips the slot on matching dates/days.
// ==========================================
function fpTodayStr() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
}

function fpComputedStatus(f) {
    if (!f) return '';
    if (f.status === 'unfrozen') return 'unfrozen';
    if (f.status === 'expired') return 'expired';
    const today = fpTodayStr();
    if (f.toDate && f.toDate < today) return 'expired';
    if (f.fromDate && f.fromDate > today) return 'scheduled';
    return 'active';
}

function fpRefreshStatuses(persist) {
    let changed = false;
    (fixedPeriodsList || []).forEach(f => {
        if (f && f.status === 'active' && fpComputedStatus(f) === 'expired') { f.status = 'expired'; changed = true; }
    });
    if (changed && persist) { try { saveData(); } catch (e) {} }
    return changed;
}

function getActiveFreezeForCell(classId, periodId, teacherId) {
    return (fixedPeriodsList || []).find(f => f && fpComputedStatus(f) === 'active'
        && f.classId === classId && f.teacherId === teacherId
        && (f.periods || []).includes(Number(periodId))) || null;
}

function getFreezeBlockingCell(classId, periodId) {
    return (fixedPeriodsList || []).find(f => f && fpComputedStatus(f) === 'active'
        && f.classId === classId
        && (f.periods || []).includes(Number(periodId))) || null;
}

function fpIsFrozenForDate(classId, periodId, dateStr) {
    if (!dateStr) return false;
    const wd = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(dateStr + 'T00:00:00').getDay()];
    return (fixedPeriodsList || []).some(f => f && f.status !== 'unfrozen' && f.status !== 'expired'
        && f.classId === classId && (f.periods || []).includes(Number(periodId))
        && f.fromDate <= dateStr && dateStr <= f.toDate && (f.days || []).includes(wd));
}

// Resolve the currently-active freezes into scheduler constraints.
// Each frozen period is paired with one subject the teacher teaches to that
// class (in class-subjects order); any remaining frozen periods — including
// every period when the teacher teaches no subject to the class — are
// paired with a BLANK subject (Patch 37: fixing never requires the teacher
// to teach the class). Genuine conflicts (the teacher's own free period, a
// clash with another freeze) still produce clear errors.
function getActiveFixedConstraints() {
    const constraints = [];
    const errors = [];
    const seenClass = {};
    const seenTeacher = {};
    (fixedPeriodsList || []).forEach(f => {
        if (!f || fpComputedStatus(f) !== 'active') return;
        const cls = (classesList || []).find(c => c.id === f.classId);
        const teacher = (teachersList || []).find(t => t.id === f.teacherId);
        if (!cls || !teacher) return;
        const subs = (cls.subjects || []).filter(s => s.teacherId === f.teacherId && s.name && String(s.name).trim());
        const periodsSorted = [...(f.periods || [])].sort((a, b) => a - b);
        periodsSorted.forEach((pid, i) => {
            if ((teacher.freePeriods || []).includes(pid)) {
                errors.push(teacher.name + ': Period ' + pid + ' is marked as a FREE period for this teacher but is also fixed. Unfreeze it or change the free period.');
                return;
            }
            const ck = f.classId + '|' + pid;
            const tk = f.teacherId + '|' + pid;
            if (seenClass[ck] || seenTeacher[tk]) {
                errors.push('Fixed periods clash at Period ' + pid + ' (' + teacher.name + ' / ' + cls.name + ' ' + (cls.section || '') + '). Unfreeze one of them.');
                return;
            }
            seenClass[ck] = true;
            seenTeacher[tk] = true;
            constraints.push({ classId: f.classId, teacherId: f.teacherId, subjectName: i < subs.length ? subs[i].name : '', periodId: pid });
        });
    });
    return { constraints, errors };
}

function openFixPeriodModal(editId) {
    fpRefreshStatuses(true);
    const tSel = document.getElementById('fpTeacher');
    const cSel = document.getElementById('fpClass');
    if (tSel) {
        tSel.innerHTML = [...teachersList].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
            .map(t => `<option value="${t.id}">${escapeHtml(t.name)} (${escapeHtml(formatDesignation(t.designation) || 'Teacher')})</option>`).join('');
    }
    if (cSel) {
        cSel.innerHTML = classesList.map(c => `<option value="${c.id}">${escapeHtml(c.name)} - ${escapeHtml(c.section || '')}</option>`).join('');
    }
    const rec = editId ? (fixedPeriodsList || []).find(f => f.id === editId) : null;
    document.getElementById('fpEditId').value = rec ? rec.id : '';
    document.getElementById('fixPeriodModalTitle').innerHTML = rec
        ? '<i class="fa-solid fa-pen text-indigo-600"></i> Edit Fixed Period'
        : '<i class="fa-solid fa-lock text-indigo-600"></i> Fix Teacher Period';
    if (tSel && rec) tSel.value = rec.teacherId;
    if (cSel && rec) cSel.value = rec.classId;
    document.querySelectorAll('.fp-period-chk').forEach(ch => { ch.checked = rec ? (rec.periods || []).includes(Number(ch.value)) : false; });
    document.querySelectorAll('.fp-day-chk').forEach(ch => { ch.checked = rec ? (rec.days || []).includes(ch.value) : false; });
    document.getElementById('fpFrom').value = rec ? rec.fromDate : fpTodayStr();
    document.getElementById('fpTo').value = rec ? rec.toDate : fpTodayStr();
    document.getElementById('fpReason').value = rec ? (rec.reason || '') : '';
    const m = document.getElementById('fixPeriodModal');
    if (m) m.classList.remove('hidden');
}

function closeFixPeriodModal() {
    const m = document.getElementById('fixPeriodModal');
    if (m) m.classList.add('hidden');
}

function saveFixedPeriod() {
    const editId = document.getElementById('fpEditId').value || '';
    const teacherId = document.getElementById('fpTeacher').value;
    const classId = document.getElementById('fpClass').value;
    const periods = [...document.querySelectorAll('.fp-period-chk:checked')].map(ch => Number(ch.value)).sort((a, b) => a - b);
    const days = [...document.querySelectorAll('.fp-day-chk:checked')].map(ch => ch.value);
    const fromDate = document.getElementById('fpFrom').value;
    const toDate = document.getElementById('fpTo').value;
    const reason = document.getElementById('fpReason').value.trim();
    const teacher = (teachersList || []).find(t => t.id === teacherId);
    const cls = (classesList || []).find(c => c.id === classId);
    if (!teacher) { alert('Please select a teacher.'); return; }
    if (!cls) { alert('Please select a class / section.'); return; }
    if (!periods.length) { alert('Please select at least one period to fix.'); return; }
    if (!days.length) { alert('Please select at least one day.'); return; }
    if (!fromDate || !toDate) { alert('Please select the From and To dates.'); return; }
    if (fromDate > toDate) { alert('From Date cannot be after To Date.'); return; }

    // Patch 37 (user's order): ANY teacher may be fixed in ANY class,
    // whatever subject they teach — there is no subject-teacher
    // restriction on fixing. When the teacher teaches fewer subjects to
    // the class than the periods being fixed (or none at all), the extra
    // fixed periods carry a BLANK subject (see getActiveFixedConstraints):
    // the timetable cell shows only the teacher's name and the lock.

    // Double-booking protection: overlapping dates + shared day + shared
    // period for the same class or the same teacher is not allowed.
    const overlap = (fixedPeriodsList || []).find(f => {
        if (!f || f.id === editId || f.status === 'unfrozen' || f.status === 'expired') return false;
        if (f.fromDate > toDate || fromDate > f.toDate) return false;
        const sharedDay = (f.days || []).some(d => days.includes(d));
        const sharedPeriod = (f.periods || []).some(p => periods.includes(p));
        if (!sharedDay || !sharedPeriod) return false;
        return f.classId === classId || f.teacherId === teacherId;
    });
    if (overlap) {
        const oTeacher = (teachersList || []).find(t => t.id === overlap.teacherId);
        const oClass = (classesList || []).find(c => c.id === overlap.classId);
        alert('Double booking: this slot is already fixed for ' + (oTeacher ? oTeacher.name : '') + ' in ' + (oClass ? (oClass.name + ' - ' + (oClass.section || '')) : '') + ' (' + overlap.fromDate + ' to ' + overlap.toDate + '). Please change the class, period, day or dates.');
        return;
    }

    const summary = 'Fix ' + teacher.name + ' in ' + cls.name + ' - ' + (cls.section || '')
        + '\nPeriod(s): ' + periods.join(', ')
        + '\nDay(s): ' + days.map(d => d.slice(0, 3)).join(', ')
        + '\nFrom ' + fromDate + ' to ' + toDate
        + (reason ? '\nReason: ' + reason : '')
        + '\n\nFix these periods?';
    if (!confirm(summary)) return;

    if (editId) {
        const rec = fixedPeriodsList.find(f => f.id === editId);
        if (rec) {
            rec.teacherId = teacherId; rec.classId = classId; rec.periods = periods;
            rec.days = days; rec.fromDate = fromDate; rec.toDate = toDate;
            rec.reason = reason; rec.status = 'active';
        }
    } else {
        fixedPeriodsList.push({ id: 'FP_' + Date.now(), teacherId: teacherId, classId: classId, periods: periods, days: days, fromDate: fromDate, toDate: toDate, reason: reason, status: 'active', createdAt: new Date().toISOString() });
    }
    saveData();
    closeFixPeriodModal();
    renderAllViews();
    const listModal = document.getElementById('fixedPeriodsListModal');
    if (listModal && !listModal.classList.contains('hidden')) renderFixedPeriodsList();
    showToast('🔒 Period(s) fixed for ' + teacher.name + '.');
}

function openFixedPeriodsListModal() {
    renderFixedPeriodsList();
    const m = document.getElementById('fixedPeriodsListModal');
    if (m) m.classList.remove('hidden');
}

function closeFixedPeriodsListModal() {
    const m = document.getElementById('fixedPeriodsListModal');
    if (m) m.classList.add('hidden');
}

function renderFixedPeriodsList() {
    fpRefreshStatuses(true);
    const box = document.getElementById('fixedPeriodsListContainer');
    if (!box) return;
    const list = [...(fixedPeriodsList || [])];
    if (!list.length) {
        box.innerHTML = '<p class="text-sm text-slate-500 text-center py-6">No fixed periods yet. Use "Fix Teacher Period" to add one.</p>';
        return;
    }
    const order = { active: 0, scheduled: 1, expired: 2, unfrozen: 3 };
    list.sort((a, b) => (order[fpComputedStatus(a)] - order[fpComputedStatus(b)]) || String(a.fromDate).localeCompare(String(b.fromDate)));
    const chip = { active: 'bg-emerald-100 text-emerald-700', scheduled: 'bg-amber-100 text-amber-700', expired: 'bg-slate-200 text-slate-600', unfrozen: 'bg-red-100 text-red-600' };
    const rows = list.map(f => {
        const t = (teachersList || []).find(x => x.id === f.teacherId);
        const c = (classesList || []).find(x => x.id === f.classId);
        const st = fpComputedStatus(f);
        return `<tr class="border-b border-slate-100">
            <td class="p-2.5 font-bold text-slate-800">${t ? escapeHtml(t.name) : '-'} <span class="text-slate-400 font-semibold">(${t ? escapeHtml(formatDesignation(t.designation)) : ''})</span></td>
            <td class="p-2.5 font-semibold text-slate-700">${c ? escapeHtml(c.name) + ' - ' + escapeHtml(c.section || '') : '-'}</td>
            <td class="p-2.5 font-semibold text-slate-700">${(f.periods || []).map(p => 'P' + p).join(', ')}</td>
            <td class="p-2.5 text-slate-700">${(f.days || []).map(d => d.slice(0, 3)).join(', ')}</td>
            <td class="p-2.5 whitespace-nowrap text-slate-700">${f.fromDate} → ${f.toDate}</td>
            <td class="p-2.5 text-slate-500">${escapeHtml(f.reason || '')}</td>
            <td class="p-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${chip[st]}">${st}</span></td>
            <td class="p-2.5 whitespace-nowrap">
                <button onclick="fpEditPeriod('${f.id}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded text-[11px]">Edit</button>
                <button onclick="fpExtendPeriod('${f.id}')" class="bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold px-2 py-1 rounded text-[11px]">Extend</button>
                ${st !== 'unfrozen' ? `<button onclick="fpUnfreezePeriod('${f.id}')" class="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded text-[11px]">Unfreeze</button>` : ''}
                <button onclick="fpDeletePeriod('${f.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded text-[11px]">Delete</button>
            </td>
        </tr>`;
    }).join('');
    box.innerHTML = `<div class="overflow-x-auto border border-slate-200 rounded-xl"><table class="w-full text-xs text-left border-collapse">
        <thead class="bg-slate-900 text-white"><tr>
            <th class="p-2.5">Teacher</th><th class="p-2.5">Class</th><th class="p-2.5">Periods</th><th class="p-2.5">Days</th><th class="p-2.5">Dates</th><th class="p-2.5">Reason</th><th class="p-2.5">Status</th><th class="p-2.5">Actions</th>
        </tr></thead><tbody>${rows}</tbody></table></div>`;
}

function fpEditPeriod(id) {
    closeFixedPeriodsListModal();
    openFixPeriodModal(id);
}

function fpExtendPeriod(id) {
    const f = (fixedPeriodsList || []).find(x => x.id === id);
    if (!f) return;
    const nd = prompt('Extend To Date (YYYY-MM-DD):', f.toDate);
    if (!nd) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nd) || nd < f.fromDate) { alert('Invalid date. Use YYYY-MM-DD and a date on/after the From Date.'); return; }
    f.toDate = nd;
    if (f.status === 'expired') f.status = 'active';
    saveData();
    renderFixedPeriodsList();
    renderAllViews();
    showToast('Fixed period extended to ' + nd + '.');
}

function fpUnfreezePeriod(id) {
    ensureAdminAccess(function () {
        const f = (fixedPeriodsList || []).find(x => x.id === id);
        if (!f) return;
        f.status = 'unfrozen';
        saveData();
        renderFixedPeriodsList();
        renderAllViews();
        showToast('🔓 Period unfrozen.');
    });
}

function fpDeletePeriod(id) {
    ensureAdminAccess(function () {
        if (!confirm('Delete this fixed period record permanently?')) return;
        fixedPeriodsList = fixedPeriodsList.filter(f => f.id !== id);
        saveData();
        renderFixedPeriodsList();
        renderAllViews();
        showToast('Fixed period deleted.');
    });
}


// ==========================================
// MULTI-TEACHERS IN ONE PERIOD (periodGroups — group overlay)
// The core timetable keeps ONE primary lesson per class+period. Extra
// teachers for the same period live in periodGroupsList and are rendered
// as extra lines in the grid cells; their lessons are injected into
// teacherSchedule so each teacher's slip shows only their own subject.
// ==========================================
// A class record can be re-created with a NEW id (uploads, duplicates)
// while its saved groups still point at the old id. Matching therefore
// also accepts same name+section twins and the name+section snapshot
// stamped onto entries when they are saved.
function pgCanonicalClassId(classId) {
    const c = (classesList || []).find(x => x.id === classId);
    if (!c) return classId;
    const first = (classesList || []).find(x => x.name === c.name && (x.section || '') === (c.section || ''));
    return first ? first.id : classId;
}

function pgEntryMatchesClass(g, classId) {
    if (!g) return false;
    if (g.classId === classId) return true;
    if (pgCanonicalClassId(g.classId) === pgCanonicalClassId(classId)) return true;
    const cls = (classesList || []).find(c => c.id === classId);
    return !!(cls && g.className && g.className === cls.name && (g.section || '') === (cls.section || ''));
}

function getPeriodGroupEntries(classId, periodId) {
    const entries = (periodGroupsList || []).filter(g => g && pgEntryMatchesClass(g, classId) && Number(g.periodId) === Number(periodId));
    // Dedupe guard: an entry that exactly repeats the period's primary
    // teacher + subject already exists in the normal timetable, so it is
    // never shown as a multi-teacher entry anywhere.
    const lesson = (typeof scheduleResult !== 'undefined' && scheduleResult && scheduleResult.classSchedule && scheduleResult.classSchedule[classId]) ? scheduleResult.classSchedule[classId][periodId] : null;
    if (!lesson || !lesson.teacherId) return entries;
    const primarySubject = String(lesson.subjectName || '').trim().toLowerCase();
    return entries.filter(g => !(g.teacherId === lesson.teacherId && String(g.subjectName || '').trim().toLowerCase() === primarySubject));
}

function injectPeriodGroupsIntoTeacherSchedule() {
    if (typeof scheduleResult === 'undefined' || !scheduleResult || !scheduleResult.teacherSchedule) return;
    (periodGroupsList || []).forEach(g => {
        if (!g || !g.teacherId || !scheduleResult.teacherSchedule[g.teacherId]) return;
        const cell = scheduleResult.teacherSchedule[g.teacherId][g.periodId];
        if (!cell) return;
        const cls = (classesList || []).find(c => c.id === g.classId) || (classesList || []).find(c => pgEntryMatchesClass(g, c.id));
        const period = (appSettings && appSettings.periods || []).find(p => p.id === g.periodId);
        if (!cls || !period) return;
        const groupLesson = {
            classId: cls.id,
            className: cls.name,
            section: cls.section || '',
            roomNo: cls.roomNo || '',
            subjectName: g.subjectName,
            teacherId: g.teacherId,
            periodId: g.periodId,
            startTime: period.startTime,
            endTime: period.endTime,
            isGroupEntry: true,
            group: g.group || ''
        };
        if (cell.isFree) {
            // The teacher has no primary lesson in this period — the
            // managed entry is his lesson here.
            scheduleResult.teacherSchedule[g.teacherId][g.periodId] = groupLesson;
        } else if (!cell.isGroupEntry && cell.classId && pgEntryMatchesClass(g, cell.classId)) {
            // The teacher IS the primary of this same class+period (e.g.
            // a combined subject like "Bio / Computer"). Manage Multi
            // Teachers splits that subject, so his slip shows the single
            // managed subject for this period, not the combined primary
            // subject. (The first managed entry wins.)
            scheduleResult.teacherSchedule[g.teacherId][g.periodId] = groupLesson;
        }
        // A primary lesson of a DIFFERENT class is never touched.
    });
}

// Resolve overlay entries into scheduler constraints + hard errors
// (free-period conflicts, freeze conflicts, cross-class group clashes).
function getGroupConstraints() {
    const constraints = [];
    const errors = [];
    const seen = {};
    (periodGroupsList || []).forEach(g => {
        if (!g) return;
        const cls = (classesList || []).find(c => c.id === pgCanonicalClassId(g.classId));
        const teacher = (teachersList || []).find(t => t.id === g.teacherId);
        if (!cls || !teacher) return;
        if ((teacher.freePeriods || []).includes(g.periodId)) {
            errors.push(teacher.name + ': Period ' + g.periodId + ' is a FREE period for this teacher, but a group (' + g.subjectName + ' — ' + cls.name + ' ' + (cls.section || '') + ') is set there. Remove the group or change the free period.');
            return;
        }
        if (typeof fpComputedStatus === 'function' && typeof fixedPeriodsList !== 'undefined') {
            const fz = (fixedPeriodsList || []).find(f => f && fpComputedStatus(f) === 'active' && f.teacherId === g.teacherId && (f.periods || []).includes(g.periodId));
            if (fz && fz.classId === g.classId) return; // the frozen lesson already represents this teacher in this class+period
            if (fz) {
                errors.push(teacher.name + ': Period ' + g.periodId + ' is Frozen for another class, but a group (' + g.subjectName + ' — ' + cls.name + ' ' + (cls.section || '') + ') is also set there. Unfreeze or remove the group.');
                return;
            }
        }
        const key = g.teacherId + '|' + g.periodId;
        if (seen[key] && seen[key] !== pgCanonicalClassId(g.classId)) {
            errors.push(teacher.name + ': Period ' + g.periodId + ' has groups in two different classes. A teacher cannot be in two classes in the same period.');
            return;
        }
        seen[key] = pgCanonicalClassId(g.classId);
        constraints.push({
            teacherId: g.teacherId,
            periodId: g.periodId,
            lesson: {
                classId: cls.id,
                className: cls.name,
                section: cls.section || '',
                roomNo: cls.roomNo || '',
                subjectName: g.subjectName,
                teacherId: g.teacherId,
                isGroupEntry: true,
                group: g.group || ''
            }
        });
    });
    return { constraints, errors };
}

// Validate the rows of the Manage Groups modal before saving.
// Returns an error string, or null when everything is fine.
function pgValidateEntries(classId, periodId, rows) {
    const seen = {};
    for (const r of rows) {
        if (!r.subjectName || !String(r.subjectName).trim()) return 'Har group row me Subject likhna zaroori hai.';
        if (!r.teacherId) return 'Har group row me Teacher select karna zaroori hai.';
        const teacher = (teachersList || []).find(t => t.id === r.teacherId);
        if (!teacher) return 'Teacher nahi mila.';
        const dupKey = r.teacherId + '|' + String(r.subjectName).trim().toLowerCase();
        if (seen[dupKey]) return teacher.name + ' ke liye "' + r.subjectName + '" do dafa likha gaya hai.';
        seen[dupKey] = true;
        if ((teacher.freePeriods || []).includes(periodId)) return teacher.name + ' ka Period ' + periodId + ' FREE period hai — wahan group nahi lag sakta.';
        if (typeof scheduleResult !== 'undefined' && scheduleResult && scheduleResult.classSchedule) {
            for (const oc of (classesList || [])) {
                if (oc.id === classId) continue;
                const l = scheduleResult.classSchedule[oc.id] && scheduleResult.classSchedule[oc.id][periodId];
                if (l && l.teacherId === r.teacherId) return teacher.name + ' pehle hi ' + oc.name + ' - ' + (oc.section || '') + ' me Period ' + periodId + ' parha rahe hain — ek period me do classes nahi ho sakti.';
            }
        }
        const otherGroup = (periodGroupsList || []).find(g => g && g.teacherId === r.teacherId && Number(g.periodId) === Number(periodId) && !pgEntryMatchesClass(g, classId));
        if (otherGroup) {
            const oc = (classesList || []).find(c => c.id === otherGroup.classId);
            return teacher.name + ' pehle hi ' + (oc ? oc.name + ' - ' + (oc.section || '') : '') + ' ke group me Period ' + periodId + ' par hain.';
        }
        if (typeof fpComputedStatus === 'function' && typeof fixedPeriodsList !== 'undefined') {
            const fz = (fixedPeriodsList || []).find(f => f && fpComputedStatus(f) === 'active' && f.teacherId === r.teacherId && (f.periods || []).includes(periodId) && f.classId !== classId);
            if (fz) return teacher.name + ' Period ' + periodId + ' me kisi aur class ke liye Frozen hain.';
        }
    }
    return null;
}

function openMultiGroupModal(classId, periodId) {
    const cls = (classesList || []).find(c => c.id === classId);
    if (!cls) return;
    document.getElementById('mgClassId').value = classId;
    document.getElementById('mgPeriodId').value = periodId;
    document.getElementById('mgTitle').innerHTML = '<i class="fa-solid fa-users text-indigo-600"></i> Manage Multi-Teachers — ' + escapeHtml(cls.name) + ' - ' + escapeHtml(cls.section || '') + ' · Period ' + periodId;
    const dl = document.getElementById('mgSubjectList');
    if (dl) {
        const subs = new Set();
        (classesList || []).forEach(c => (c.subjects || []).forEach(s => { if (s.name) subs.add(s.name); }));
        (teachersList || []).forEach(t => (t.subjects || []).forEach(s => subs.add(s)));
        dl.innerHTML = [...subs].sort().map(s => `<option value="${escapeHtml(s)}">`).join('');
    }
    const box = document.getElementById('mgRows');
    box.innerHTML = '';
    const existing = getPeriodGroupEntries(classId, periodId);
    if (existing.length) existing.forEach(g => mgAddRow(g));
    else mgAddRow(null);
    const m = document.getElementById('multiGroupModal');
    if (m) m.classList.remove('hidden');
}

function closeMultiGroupModal() {
    const m = document.getElementById('multiGroupModal');
    if (m) m.classList.add('hidden');
}

function mgAddRow(g) {
    const box = document.getElementById('mgRows');
    if (!box) return;
    const row = document.createElement('div');
    row.className = 'mg-row flex items-center gap-2';
    const teacherOptions = '<option value="">-- Teacher --</option>' + [...teachersList]
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
        .map(t => `<option value="${t.id}" ${g && g.teacherId === t.id ? 'selected' : ''}>${escapeHtml(t.name)} (${escapeHtml(formatDesignation(t.designation))})</option>`).join('');
    row.innerHTML = `
        <input type="text" list="mgSubjectList" placeholder="Subject" value="${g ? escapeHtml(g.subjectName || '') : ''}" class="mg-subject flex-1 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold">
        <select class="mg-teacher flex-1 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold">${teacherOptions}</select>
        <input type="text" placeholder="Group A" value="${g ? escapeHtml(g.group || '') : ''}" class="mg-group w-24 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold">
        <button onclick="this.closest('.mg-row').remove()" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-2 rounded-lg text-xs" title="Remove row"><i class="fa-solid fa-trash-can"></i></button>`;
    box.appendChild(row);
}

function saveMultiGroups() {
    const classId = document.getElementById('mgClassId').value;
    const periodId = Number(document.getElementById('mgPeriodId').value);
    if (typeof getFreezeBlockingCell === 'function') {
        const fz = getFreezeBlockingCell(classId, periodId);
        if (fz) { alert('🔒 Ye period Fixed (Frozen) hai — group tabdeeli ke liye pehle View Fixed Periods se Unfreeze karen.'); return; }
    }
    const rows = [...document.querySelectorAll('.mg-row')].map(row => ({
        subjectName: row.querySelector('.mg-subject').value.trim(),
        teacherId: row.querySelector('.mg-teacher').value,
        group: row.querySelector('.mg-group').value.trim()
    })).filter(r => r.subjectName || r.teacherId);
    const err = pgValidateEntries(classId, periodId, rows);
    if (err) { alert(err); return; }
    periodGroupsList = (periodGroupsList || []).filter(g => !(pgEntryMatchesClass(g, classId) && Number(g.periodId) === periodId));
    const clsForGroups = (classesList || []).find(c => c.id === classId);
    rows.forEach((r, i) => {
        periodGroupsList.push({
            id: 'PG_' + Date.now() + '_' + i,
            classId: classId,
            className: clsForGroups ? clsForGroups.name : '',
            section: clsForGroups ? (clsForGroups.section || '') : '',
            periodId: periodId,
            subjectName: r.subjectName,
            teacherId: r.teacherId,
            group: r.group || ('Group ' + String.fromCharCode(65 + i)),
            createdAt: new Date().toISOString()
        });
    });
    rebuildSchedulesFromClassSchedule();
    closeMultiGroupModal();
    renderAllViews();
    renderDataDistributionView();
    showToast('👥 Multi-teacher groups saved for Period ' + periodId + '.');
}
