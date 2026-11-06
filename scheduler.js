// Zero-Clash Timetable Scheduler Engine (Daily 8-Period Model with Room Tracking)
// Guarantees zero teacher clashes, honors free periods, and tracks room numbers.

class TimetableScheduler {
    constructor(settings, teachers, classes) {
        this.settings = settings;
        this.teachers = teachers;
        this.classes = classes;
        this.periods = settings.periods; // 8 Periods
    }

    validate() {
        const errors = [];

        // Check if any teacher is assigned more than available teaching periods
        const teacherAssignedCount = {};
        this.teachers.forEach(t => {
            teacherAssignedCount[t.id] = { name: t.name, count: 0, freeCount: (t.freePeriods || []).length };
        });

        this.classes.forEach(c => {
            if (c.subjects.length > this.periods.length) {
                errors.push(`Class ${c.name}-${c.section} has ${c.subjects.length} subjects, which is more than the 8 periods available per day.`);
            }
            c.subjects.forEach((s, sIdx) => {
                const effTeacherId = (this.teacherOverrides && Object.prototype.hasOwnProperty.call(this.teacherOverrides, c.id + '|' + sIdx)) ? this.teacherOverrides[c.id + '|' + sIdx] : s.teacherId;
                if (effTeacherId && teacherAssignedCount[effTeacherId]) {
                    // Auto Adjust bands: only count lessons the teacher is
                    // allowed to teach at this class level.
                    const tObj = this.teachers.find(t => t.id === effTeacherId);
                    if (this.bandFilter) {
                        if (tObj && !this.bandFilter(tObj, c, s.name)) return;
                    }
                    // Workload filter: a lesson in a subject the teacher
                    // is not assigned in Teachers & Workload never counts.
                    if (this.workloadFilter) {
                        if (tObj && !this.workloadFilter(tObj, s.name)) return;
                    }
                    teacherAssignedCount[effTeacherId].count++;
                }
            });
        });

        // Auto Adjust per-teacher period limits: a teacher never needs more
        // available periods than the limit set for them in Auto Adjust.
        if (this.teacherQuotas || this.relaxQuotas) {
            this.teachers.forEach(t => {
                if (!teacherAssignedCount[t.id]) return;
                const info = teacherAssignedCount[t.id];
                // Relaxed pass (Patch 27, decision A1): quotas are only a
                // preference, so cap at the physical maximum instead.
                const cap = this.relaxQuotas
                    ? (this.periods.length - info.freeCount)
                    : (this.teacherQuotas ? this.teacherQuotas[t.id] : undefined);
                if (cap !== undefined) {
                    info.count = Math.min(info.count, cap);
                }
            });
        }

        this.teachers.forEach(t => {
            const info = teacherAssignedCount[t.id];
            const maxAllowed = this.periods.length - info.freeCount;
            if (info.count > maxAllowed) {
                errors.push(`Teacher ${t.name} has been assigned ${info.count} periods, while only ${maxAllowed} periods are available after excluding free periods.`);
            }
        });

        return { valid: errors.length === 0, errors };
    }

    generate(maxAttempts = 100) {
        const teacherMap = {};
        const teacherFreeSet = {};
        this.teachers.forEach(t => {
            teacherMap[t.id] = t;
            teacherFreeSet[t.id] = new Set(t.freePeriods || []);
        });

        // Normal Generate path (greedy trySolve): unchanged behaviour.
        if (!this.useBacktracking) {
            const validation = this.validate();
            if (!validation.valid) {
                return { success: false, errors: validation.errors };
            }
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                const result = this.trySolve(teacherFreeSet, teacherMap);
                if (result.success) {
                    return {
                        success: true,
                        masterSchedule: result.masterSchedule,
                        classSchedule: result.classSchedule,
                        teacherSchedule: result.teacherSchedule,
                        droppedLessons: this.lastDroppedLessons || [],
                        quotaDroppedLessons: this.lastQuotaDropped || [],
                        workloadDroppedLessons: this.lastWorkloadDropped || [],
                        attempts: attempt
                    };
                }
            }
            return {
                success: false,
                errors: ["The system could not find a clash-free solution with the given free periods and teacher schedules. Please reduce one of the teachers' free periods."]
            };
        }

        // Backtracking path (Auto Adjust / Auto Shuffling). Patch 27
        // (decision A1): "Periods to Generate" quotas are a PREFERENCE —
        // solve with the quotas first; if a second solve without them
        // fills MORE class periods, the fuller timetable wins and the
        // teachers whose limit was exceeded are reported.
        const totalAttempts = Math.min(maxAttempts, 8);
        const placedCount = (cs) => {
            let n = 0;
            Object.values(cs || {}).forEach(row => Object.values(row || {}).forEach(l => { if (l) n++; }));
            return n;
        };
        const runPass = (relax) => {
            this.relaxQuotas = !!relax;
            const validation = this.validate();
            if (!validation.valid) return { failErrors: validation.errors };
            for (let attempt = 1; attempt <= totalAttempts; attempt++) {
                const result = this.solveBacktracking(teacherFreeSet, teacherMap);
                if (result.success) {
                    return {
                        success: true,
                        masterSchedule: result.masterSchedule,
                        classSchedule: result.classSchedule,
                        teacherSchedule: result.teacherSchedule,
                        droppedLessons: [...(this.lastDroppedLessons || [])],
                        quotaDroppedLessons: [...(this.lastQuotaDropped || [])],
                        workloadDroppedLessons: [...(this.lastWorkloadDropped || [])],
                        overCapacityLessons: [...(this.lastOverCapacity || [])],
                        inchargeNotes: [...(this.lastInchargeNotes || [])],
                        attempts: attempt
                    };
                }
            }
            return null;
        };
        const hasQuotas = !!(this.teacherQuotas && Object.values(this.teacherQuotas).some(v => v !== undefined && v !== null));
        const pass1 = runPass(false);
        let chosen = (pass1 && pass1.success) ? pass1 : null;
        let usedRelaxed = false;
        const quotaExceeded = [];
        if (hasQuotas && !this.hardQuotas) {
            const pass2 = runPass(true);
            if (pass2 && pass2.success && (!chosen || placedCount(pass2.classSchedule) > placedCount(chosen.classSchedule))) {
                chosen = pass2;
                usedRelaxed = true;
                this.teachers.forEach(t => {
                    const q = this.teacherQuotas[t.id];
                    if (q === undefined || q === null) return;
                    const row = (pass2.teacherSchedule || {})[t.id] || {};
                    let n = 0;
                    Object.values(row).forEach(l => { if (l) n++; });
                    if (n > q) quotaExceeded.push({ teacherName: t.name, quota: q, placed: n });
                });
                chosen.quotaDroppedLessons = [];
            }
        }
        this.relaxQuotas = false;
        if (chosen) {
            chosen.quotaExceeded = quotaExceeded;
            chosen.usedRelaxedPass = usedRelaxed;
            return chosen;
        }
        if (pass1 && pass1.failErrors) return { success: false, errors: pass1.failErrors };
        return {
            success: false,
            errors: ["The system could not find a clash-free solution with the given free periods and teacher schedules. Please reduce one of the teachers' free periods."]
        };
    }


    // Backtracking solver (Patch 21): systematic search, most-constrained
    // lesson first. Used by Auto Adjust only — the band rules make the
    // timetable too tight for the random greedy trySolve (which fails even
    // on the bundled default dataset). Honours designated free periods,
    // frozen lessons (pre-placed), multi-teacher group occupancy and the
    // band filter, and records band-dropped lessons like trySolve does.
    solveBacktracking(teacherFreeSet, teacherMap) {
        const classSchedule = {};
        const teacherSchedule = {};
        const masterSchedule = {};
        this.classes.forEach(c => {
            classSchedule[c.id] = {};
            masterSchedule[c.id] = {};
            this.periods.forEach(p => {
                classSchedule[c.id][p.id] = null;
                masterSchedule[c.id][p.id] = null;
            });
        });
        this.teachers.forEach(t => {
            teacherSchedule[t.id] = {};
            this.periods.forEach(p => { teacherSchedule[t.id][p.id] = null; });
        });

        const lessons = [];
        this.lastDroppedLessons = [];
        this.lastWorkloadDropped = [];
        this.lastOverCapacity = [];
        this.lastInchargeNotes = [];
        this.classes.forEach(c => {
            c.subjects.forEach((s, sIdx) => {
                const effTeacherId = (this.teacherOverrides && Object.prototype.hasOwnProperty.call(this.teacherOverrides, c.id + '|' + sIdx)) ? this.teacherOverrides[c.id + '|' + sIdx] : s.teacherId;
                if (effTeacherId && teacherMap[effTeacherId]) {
                    if (this.bandFilter && !this.bandFilter(teacherMap[effTeacherId], c, s.name)) {
                        this.lastDroppedLessons.push({ className: c.name, section: c.section || '', subjectName: s.name, teacherName: teacherMap[effTeacherId].name });
                        return;
                    }
                    // Workload alignment (Patch 27, Task 1.2 / decision B1):
                    // Periods Detail stays the class plan, but a lesson is
                    // dropped when the teacher does not have that subject
                    // in Teachers & Workload.
                    if (this.workloadFilter && !this.workloadFilter(teacherMap[effTeacherId], s.name)) {
                        this.lastWorkloadDropped.push({ className: c.name, section: c.section || '', subjectName: s.name, teacherName: teacherMap[effTeacherId].name });
                        return;
                    }
                    lessons.push({
                        classId: c.id,
                        className: c.name,
                        section: c.section || '',
                        roomNo: c.roomNo || `Room ${c.name}`,
                        inchargeId: c.inchargeId,
                        subjectName: s.name,
                        teacherId: effTeacherId,
                        tier: this.lessonTier ? this.lessonTier(teacherMap[effTeacherId], c, s.name) : 0
                    });
                }
            });
        });

        // Auto Adjust per-teacher period limits (Patch 22): keep only the
        // set number of lessons per teacher. Frozen lessons are always kept
        // (and counted) first; lessons beyond the limit are reported.
        this.lastQuotaDropped = [];
        if (this.teacherQuotas || this.relaxQuotas) {
            const frozenKeys = new Set((Array.isArray(this.fixedConstraints) ? this.fixedConstraints : []).map(fc => fc.classId + '|' + fc.teacherId + '|' + fc.subjectName));
            const isFrozenLesson = (l) => frozenKeys.has(l.classId + '|' + l.teacherId + '|' + l.subjectName);
            // Priority order (Patch 27, Task 1.3): frozen lessons first,
            // then lower tier first (SST before EST/PST-exception in
            // 9th/10th), so when a limit cuts lessons the lower-priority
            // ones are cut first. Sort is stable within a tier.
            const ordered = [...lessons.filter(isFrozenLesson), ...lessons.filter(l => !isFrozenLesson(l)).sort((a, b) => (a.tier || 0) - (b.tier || 0))];
            const keptCount = {};
            const kept = [];
            for (const l of ordered) {
                keptCount[l.teacherId] = keptCount[l.teacherId] || 0;
                if (isFrozenLesson(l)) { kept.push(l); keptCount[l.teacherId]++; continue; }
                // Effective cap: the set quota — or, in the relaxed pass,
                // the physical maximum (periods minus designated free).
                const freeN = teacherFreeSet[l.teacherId] ? teacherFreeSet[l.teacherId].size : 0;
                const cap = this.relaxQuotas ? (this.periods.length - freeN) : (this.teacherQuotas ? this.teacherQuotas[l.teacherId] : undefined);
                if (cap === undefined) { kept.push(l); continue; }
                if (keptCount[l.teacherId] < cap) { kept.push(l); keptCount[l.teacherId]++; }
                else if (this.relaxQuotas) this.lastOverCapacity.push({ className: l.className, section: l.section, subjectName: l.subjectName, teacherName: teacherMap[l.teacherId] ? teacherMap[l.teacherId].name : '' });
                else this.lastQuotaDropped.push({ className: l.className, section: l.section, subjectName: l.subjectName, teacherName: teacherMap[l.teacherId] ? teacherMap[l.teacherId].name : '' });
            }
            lessons.length = 0;
            kept.forEach(l => lessons.push(l));
        }

        // Frozen lessons: pre-place exactly like trySolve.
        if (Array.isArray(this.fixedConstraints) && this.fixedConstraints.length) {
            for (const fc of this.fixedConstraints) {
                const fIdx = lessons.findIndex(l => l.classId === fc.classId && l.teacherId === fc.teacherId && l.subjectName === fc.subjectName);
                let fBase = null;
                if (fIdx >= 0) {
                    fBase = lessons[fIdx];
                } else if (fc.subjectName === '') {
                    // Patch 37: blank-subject freeze — no pool lesson
                    // exists (the teacher teaches no/further subject to
                    // this class), so create the fixed lesson directly
                    // with the same shape pool lessons carry.
                    const fcCls = this.classes.find(c => c.id === fc.classId);
                    if (!fcCls || !teacherSchedule[fc.teacherId]) continue;
                    fBase = {
                        classId: fcCls.id,
                        className: fcCls.name,
                        section: fcCls.section || '',
                        roomNo: fcCls.roomNo || `Room ${fcCls.name}`,
                        inchargeId: fcCls.inchargeId,
                        subjectName: '',
                        teacherId: fc.teacherId,
                        tier: 0
                    };
                } else {
                    continue;
                }
                const fPeriod = this.periods.find(p => p.id === fc.periodId);
                if (!fPeriod) continue;
                if (classSchedule[fc.classId][fc.periodId] !== null) return { success: false };
                if (teacherSchedule[fc.teacherId][fc.periodId] !== null) return { success: false };
                if (teacherFreeSet[fc.teacherId] && teacherFreeSet[fc.teacherId].has(fc.periodId)) return { success: false };
                const fLesson = { ...fBase, periodId: fc.periodId, startTime: fPeriod.startTime, endTime: fPeriod.endTime };
                classSchedule[fc.classId][fc.periodId] = fLesson;
                teacherSchedule[fc.teacherId][fc.periodId] = fLesson;
                masterSchedule[fc.classId][fc.periodId] = fLesson;
                if (fIdx >= 0) lessons.splice(fIdx, 1);
            }
        }

        // Multi-teacher groups: occupy the group teachers' periods.
        if (Array.isArray(this.groupConstraints) && this.groupConstraints.length) {
            for (const gc of this.groupConstraints) {
                if (!teacherSchedule[gc.teacherId]) continue;
                const existing = teacherSchedule[gc.teacherId][gc.periodId];
                if (existing !== null) {
                    if (existing.isGroupEntry && existing.classId === gc.lesson.classId) continue;
                    return { success: false };
                }
                const gPeriod = this.periods.find(p => p.id === gc.periodId);
                teacherSchedule[gc.teacherId][gc.periodId] = { ...gc.lesson, periodId: gc.periodId, startTime: gPeriod ? gPeriod.startTime : '', endTime: gPeriod ? gPeriod.endTime : '' };
            }
        }

        // Class Incharge Period 1 rule (Patch 27, Task 1.1): each class's
        // 1st period is pre-placed with its Class Incharge teaching one of
        // their own subjects in that class, exactly like a frozen lesson —
        // it never moves afterwards (Auto Shuffling included). A skip is
        // recorded and reported, never forced: Period 1 frozen with
        // another teacher, incharge busy/free at Period 1, or the
        // incharge teaches no subject in this class.
        if (this.inchargeFirstPeriod && this.periods.length) {
            const p1Obj = this.periods[0];
            const p1 = p1Obj.id;
            for (const c of this.classes) {
                if (!c.inchargeId) continue;
                const note = (reason) => this.lastInchargeNotes.push({ className: c.name, section: c.section || '', reason });
                if (classSchedule[c.id][p1] !== null) {
                    if (classSchedule[c.id][p1].teacherId !== c.inchargeId) note('Period 1 is already fixed (frozen) with another teacher');
                    continue;
                }
                const candIdxs = [];
                lessons.forEach((l, i) => { if (l.classId === c.id && l.teacherId === c.inchargeId) candIdxs.push(i); });
                if (!candIdxs.length) { note('the Class Incharge teaches no subject in this class'); continue; }
                if (teacherSchedule[c.inchargeId] && teacherSchedule[c.inchargeId][p1] !== null) { note('the Class Incharge is busy in Period 1 in another class'); continue; }
                if (teacherFreeSet[c.inchargeId] && teacherFreeSet[c.inchargeId].has(p1)) { note('the Class Incharge has Period 1 marked free'); continue; }
                const pick = candIdxs[Math.floor(Math.random() * candIdxs.length)];
                const lesson = lessons[pick];
                const full = { ...lesson, periodId: p1, startTime: p1Obj.startTime, endTime: p1Obj.endTime };
                classSchedule[c.id][p1] = full;
                teacherSchedule[lesson.teacherId][p1] = full;
                masterSchedule[c.id][p1] = full;
                lessons.splice(pick, 1);
            }
        }

        const periodIds = this.periods.map(p => p.id);
        const periodById = {};
        this.periods.forEach(p => { periodById[p.id] = p; });
        const NODE_BUDGET = 60000;
        let nodes = 0;
        const placed = new Array(lessons.length).fill(false);

        const legalPeriods = (lesson) => {
            const out = [];
            for (const pid of periodIds) {
                if (classSchedule[lesson.classId][pid] !== null) continue;
                if (teacherSchedule[lesson.teacherId][pid] !== null) continue;
                if (teacherFreeSet[lesson.teacherId] && teacherFreeSet[lesson.teacherId].has(pid)) continue;
                out.push(pid);
            }
            return out;
        };

        const dfs = () => {
            if (++nodes > NODE_BUDGET) return false;
            let bestIdx = -1, bestOpts = null, bestScore = Infinity;
            for (let i = 0; i < lessons.length; i++) {
                if (placed[i]) continue;
                const opts = legalPeriods(lessons[i]);
                if (opts.length === 0) return false;
                // Priority (Patch 27, Task 1.3): fewest legal periods
                // first, with a tier bonus so higher-priority lessons
                // (SST in 9th/10th) are placed before lower-priority
                // ones competing for the same periods.
                const score = opts.length + (lessons[i].tier || 0) * 1.5;
                if (score < bestScore) {
                    bestScore = score; bestIdx = i; bestOpts = opts;
                    if (opts.length === 1 && !(lessons[i].tier || 0)) break;
                }
            }
            if (bestIdx < 0) return true;
            const lesson = lessons[bestIdx];
            // Least-constraining period first (Patch 23): try the period
            // that blocks the fewest other unplaced lessons (same teacher
            // or same class) — pure random order thrashed on tight data.
            const blockedCount = (pid) => {
                let n = 0;
                for (let i = 0; i < lessons.length; i++) {
                    if (placed[i]) continue;
                    const o = lessons[i];
                    if (o.teacherId !== lesson.teacherId && o.classId !== lesson.classId) continue;
                    if (classSchedule[o.classId][pid] !== null) continue;
                    if (teacherSchedule[o.teacherId][pid] !== null) continue;
                    if (teacherFreeSet[o.teacherId] && teacherFreeSet[o.teacherId].has(pid)) continue;
                    n++;
                }
                return n;
            };
            bestOpts = bestOpts
                .map(pid => ({ pid, score: blockedCount(pid) + Math.random() * 0.5 }))
                .sort((a, b) => a.score - b.score)
                .map(x => x.pid);
            placed[bestIdx] = true;
            for (const pid of bestOpts) {
                const p = periodById[pid];
                const full = { ...lesson, periodId: pid, startTime: p.startTime, endTime: p.endTime };
                classSchedule[lesson.classId][pid] = full;
                teacherSchedule[lesson.teacherId][pid] = full;
                masterSchedule[lesson.classId][pid] = full;
                if (dfs()) return true;
                classSchedule[lesson.classId][pid] = null;
                teacherSchedule[lesson.teacherId][pid] = null;
                masterSchedule[lesson.classId][pid] = null;
                if (nodes > NODE_BUDGET) { placed[bestIdx] = false; return false; }
            }
            placed[bestIdx] = false;
            return false;
        };

        if (!dfs()) return { success: false };
        return { success: true, masterSchedule, classSchedule, teacherSchedule };
    }

    trySolve(teacherFreeSet, teacherMap) {
        // classSchedule[classId][periodId] = lesson
        // teacherSchedule[teacherId][periodId] = lesson
        // masterSchedule[classId][periodId] = lesson
        const classSchedule = {};
        const teacherSchedule = {};
        const masterSchedule = {};

        this.classes.forEach(c => {
            classSchedule[c.id] = {};
            masterSchedule[c.id] = {};
            this.periods.forEach(p => {
                classSchedule[c.id][p.id] = null;
                masterSchedule[c.id][p.id] = null;
            });
        });

        this.teachers.forEach(t => {
            teacherSchedule[t.id] = {};
            this.periods.forEach(p => {
                teacherSchedule[t.id][p.id] = null;
            });
        });

        // Collect all lessons to assign
        // Each lesson belongs to a class and has a subject & teacher
        const lessons = [];
        this.lastDroppedLessons = [];
        this.lastWorkloadDropped = [];
        this.classes.forEach(c => {
            c.subjects.forEach(s => {
                if (s.teacherId && teacherMap[s.teacherId]) {
                    // Auto Adjust bands (Task 7): a lesson whose teacher's
                    // category may not teach this class level is left out of
                    // the pool and reported, never forced in.
                    if (this.bandFilter && !this.bandFilter(teacherMap[s.teacherId], c, s.name)) {
                        this.lastDroppedLessons.push({ className: c.name, section: c.section || '', subjectName: s.name, teacherName: teacherMap[s.teacherId].name });
                        return;
                    }
                    if (this.workloadFilter && !this.workloadFilter(teacherMap[s.teacherId], s.name)) {
                        this.lastWorkloadDropped.push({ className: c.name, section: c.section || '', subjectName: s.name, teacherName: teacherMap[s.teacherId].name });
                        return;
                    }
                    lessons.push({
                        classId: c.id,
                        className: c.name,
                        section: c.section || '',
                        roomNo: c.roomNo || `Room ${c.name}`,
                        inchargeId: c.inchargeId,
                        subjectName: s.name,
                        teacherId: s.teacherId
                    });
                }
            });
        });

        // Fix/Freeze: pre-place frozen lessons so generation can never move,
        // remove or reassign them; remove them from the random pool.
        if (Array.isArray(this.fixedConstraints) && this.fixedConstraints.length) {
            for (const fc of this.fixedConstraints) {
                const fIdx = lessons.findIndex(l => l.classId === fc.classId && l.teacherId === fc.teacherId && l.subjectName === fc.subjectName);
                let fBase = null;
                if (fIdx >= 0) {
                    fBase = lessons[fIdx];
                } else if (fc.subjectName === '') {
                    // Patch 37: blank-subject freeze — no pool lesson
                    // exists (the teacher teaches no/further subject to
                    // this class), so create the fixed lesson directly
                    // with the same shape pool lessons carry.
                    const fcCls = this.classes.find(c => c.id === fc.classId);
                    if (!fcCls || !teacherSchedule[fc.teacherId]) continue;
                    fBase = {
                        classId: fcCls.id,
                        className: fcCls.name,
                        section: fcCls.section || '',
                        roomNo: fcCls.roomNo || `Room ${fcCls.name}`,
                        inchargeId: fcCls.inchargeId,
                        subjectName: '',
                        teacherId: fc.teacherId
                    };
                } else {
                    continue;
                }
                const fPeriod = this.periods.find(p => p.id === fc.periodId);
                if (!fPeriod) continue;
                if (classSchedule[fc.classId][fc.periodId] !== null) return { success: false };
                if (teacherSchedule[fc.teacherId][fc.periodId] !== null) return { success: false };
                if (teacherFreeSet[fc.teacherId] && teacherFreeSet[fc.teacherId].has(fc.periodId)) return { success: false };
                const fLesson = { ...fBase, periodId: fc.periodId, startTime: fPeriod.startTime, endTime: fPeriod.endTime };
                classSchedule[fc.classId][fc.periodId] = fLesson;
                teacherSchedule[fc.teacherId][fc.periodId] = fLesson;
                masterSchedule[fc.classId][fc.periodId] = fLesson;
                if (fIdx >= 0) lessons.splice(fIdx, 1);
            }
        }

        // Multi-teacher groups: each group lesson occupies its teacher's
        // schedule for that period, so the solver can never double-book that
        // teacher in the same period, and the teacher's slip (built from
        // teacherSchedule) shows the group period.
        if (Array.isArray(this.groupConstraints) && this.groupConstraints.length) {
            for (const gc of this.groupConstraints) {
                if (!teacherSchedule[gc.teacherId]) continue;
                const existing = teacherSchedule[gc.teacherId][gc.periodId];
                if (existing !== null) {
                    // Same teacher + period already holds a group lesson for
                    // the SAME class (two groups, one teacher) — keep the first.
                    if (existing.isGroupEntry && existing.classId === gc.lesson.classId) continue;
                    return { success: false };
                }
                const gPeriod = this.periods.find(p => p.id === gc.periodId);
                teacherSchedule[gc.teacherId][gc.periodId] = { ...gc.lesson, periodId: gc.periodId, startTime: gPeriod ? gPeriod.startTime : '', endTime: gPeriod ? gPeriod.endTime : '' };
            }
        }

        // Heuristic sort: Lessons with teachers who have the most assignments or most free periods first
        const teacherDemand = {};
        lessons.forEach(l => {
            teacherDemand[l.teacherId] = (teacherDemand[l.teacherId] || 0) + 1;
        });

        lessons.sort((a, b) => {
            const freeA = (teacherFreeSet[a.teacherId] || new Set()).size;
            const freeB = (teacherFreeSet[b.teacherId] || new Set()).size;
            return (teacherDemand[b.teacherId] + freeB * 2) - (teacherDemand[a.teacherId] + freeA * 2);
        });

        // Group lessons by class
        const lessonsByClass = {};
        lessons.forEach(l => {
            if (!lessonsByClass[l.classId]) lessonsByClass[l.classId] = [];
            lessonsByClass[l.classId].push(l);
        });

        // Shuffle class processing order
        const shuffledClasses = [...this.classes].sort(() => Math.random() - 0.5);

        for (const cls of shuffledClasses) {
            const classLessons = [...(lessonsByClass[cls.id] || [])].sort(() => Math.random() - 0.5);

            for (const lesson of classLessons) {
                // Find valid periods (1 to 8)
                const validPeriods = [];

                for (const period of this.periods) {
                    const pid = period.id;

                    // Constraint 1: Class slot must be empty
                    if (classSchedule[cls.id][pid] !== null) continue;

                    // Constraint 2: Teacher must not be teaching in another class in this period (ZERO CLASH)
                    if (teacherSchedule[lesson.teacherId][pid] !== null) continue;

                    // Constraint 3: Teacher must not have designated this period as Free
                    if (teacherFreeSet[lesson.teacherId].has(pid)) continue;

                    validPeriods.push({
                        pid,
                        startTime: period.startTime,
                        endTime: period.endTime
                    });
                }

                if (validPeriods.length === 0) {
                    return { success: false }; // Backtrack/retry
                }

                // Pick a period (randomized among valid)
                const chosen = validPeriods[Math.floor(Math.random() * validPeriods.length)];

                const assignedLesson = {
                    ...lesson,
                    periodId: chosen.pid,
                    startTime: chosen.startTime,
                    endTime: chosen.endTime
                };

                classSchedule[cls.id][chosen.pid] = assignedLesson;
                teacherSchedule[lesson.teacherId][chosen.pid] = assignedLesson;
                masterSchedule[cls.id][chosen.pid] = assignedLesson;
            }
        }

        // Fill remaining empty slots in teacherSchedule with Free period information
        this.teachers.forEach(t => {
            this.periods.forEach(p => {
                if (teacherSchedule[t.id][p.id] === null) {
                    const isDesignatedFree = teacherFreeSet[t.id].has(p.id);
                    teacherSchedule[t.id][p.id] = {
                        isFree: true,
                        isOfficialFree: isDesignatedFree,
                        periodId: p.id,
                        startTime: p.startTime,
                        endTime: p.endTime,
                        roomNo: "Staff Room"
                    };
                }
            });
        });

        return {
            success: true,
            masterSchedule,
            classSchedule,
            teacherSchedule
        };
    }
}
