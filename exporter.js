// Exporter Module for Govt. High School Walton Lahore
// Handles Excel (.xlsx) and PDF/Print for Master, Teacher-wise, Class-wise, Summary, Incharges, and Staff Circular

// Patch 31, Task 1: Designation always renders UPPERCASE (global rule).
// Uses the app's formatDesignation when available; falls back locally.
function exporterFormatDesignation(value) {
    if (typeof formatDesignation === 'function') return formatDesignation(value);
    return String(value == null ? '' : value).toUpperCase();
}

function formatClassSectionName(className, section) {
    if (!className) return section || '';
    if (!section) return className;
    className = String(className).trim();
    section = String(section).trim();
    if (className.toLowerCase().endsWith(section.toLowerCase()) || 
        className.toLowerCase().endsWith(`- ${section.toLowerCase()}`) ||
        className.toLowerCase().includes(`(${section.toLowerCase()})`)) {
        return className;
    }
    return `${className} - ${section}`;
}

class TimetableExporter {
    constructor(settings, teachers, classes, scheduleData) {
        this.settings = settings;
        this.teachers = teachers;
        this.classes = classes;
        this.scheduleData = scheduleData;
        this.teacherMap = {};
        teachers.forEach(t => this.teacherMap[t.id] = t);
        this.classMap = {};
        classes.forEach(c => this.classMap[c.id] = c);
    }

    getDateFormatted() {
        const now = new Date();
        const day = now.getDate();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear();
        return `${day} ${month} ${year}`;
    }

    getInchargeStatus(teacherId) {
        const inchargeClass = this.classes.find(c => c.inchargeId === teacherId);
        if (inchargeClass) {
            return {
                isYes: true,
                statusText: `Yes (${inchargeClass.name} - ${inchargeClass.section})`,
                className: `${inchargeClass.name} - ${inchargeClass.section}`,
                classObj: inchargeClass
            };
        }
        return {
            isYes: false,
            statusText: "No",
            className: "",
            classObj: null
        };
    }

    // ==========================================
    // 1. MASTER TIMETABLE EXCEL
    // ==========================================
    exportMasterExcel() {
        if (typeof XLSX === 'undefined') {
            alert("The Excel library is loading, please wait a moment.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();

        const data = [
            [this.settings.schoolName.toUpperCase()],
            [this.settings.schoolNameUrdu],
            ["FULL TIMETABLE (8 PERIODS)"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            []
        ];

        const header = ["Class & Section", "Class Incharge", "Room No."];
        this.settings.periods.forEach(p => {
            header.push(`${p.name}\nTime: ${p.startTime} - ${p.endTime}`);
        });
        data.push(header);

        this.classes.forEach(c => {
            const incharge = this.teacherMap[c.inchargeId] ? this.teacherMap[c.inchargeId].name : "-";
            const row = [
                `${c.name} - ${c.section}`,
                incharge,
                c.roomNo || "-"
            ];

            this.settings.periods.forEach(p => {
                const lesson = this.scheduleData.classSchedule[c.id][p.id];
                if (lesson) {
                    const t = this.teacherMap[lesson.teacherId];
                    const tName = t ? t.name : "";
                    row.push(`${lesson.subjectName}\nTeacher: ${tName}\nRoom: ${c.roomNo || ''}`);
                } else {
                    row.push("FREE");
                }
            });
            data.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Full_Timetable");
        XLSX.writeFile(wb, `Govt_High_School_Walton_Full_Timetable_${dateStr.replace(/ /g, '_')}.xlsx`);
    }

    // ==========================================
    // 2. TEACHER-WISE TIMETABLE EXCEL
    // ==========================================
    exportTeacherWiseExcel(targetTeacherId = null) {
        if (typeof XLSX === 'undefined') {
            alert("The Excel library is loading.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();
        const teachersToExport = targetTeacherId 
            ? this.teachers.filter(t => t.id === targetTeacherId) 
            : this.teachers;

        const data = [
            [this.settings.schoolName.toUpperCase()],
            [this.settings.schoolNameUrdu],
            ["TEACHER-WISE TIME TABLE SLIPS (ALL STAFF)"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            []
        ];

        teachersToExport.forEach((t, idx) => {
            const inch = this.getInchargeStatus(t.id);
            data.push([`TEACHER #${idx + 1}: ${t.name}`, `Designation: ${exporterFormatDesignation(t.designation) || '-'}`, `Mobile: ${t.mobileNumber || '-'}`]);
            data.push([`Inchargeship: ${inch.statusText}`, `Subjects Taught: ${t.subjects.join(', ')}`, `Date: ${dateStr}`]);

            const pRow = ["Period No:"];
            const tRow = ["Time:"];
            const rRow = ["Room No:"];
            const cRow = ["Class / Subject:"];

            this.settings.periods.forEach(p => {
                const lesson = this.scheduleData.teacherSchedule[t.id][p.id];
                pRow.push(p.name);
                tRow.push(`${p.startTime} - ${p.endTime}`);

                if (lesson && !lesson.isFree) {
                    rRow.push(lesson.roomNo || "-");
                    const clsSec = formatClassSectionName(lesson.className, lesson.section);
                    cRow.push(`${clsSec}\n(${lesson.subjectName})`);
                } else if (lesson && lesson.isOfficialFree) {
                    rRow.push("Staff Room");
                    cRow.push("FREE PERIOD");
                } else {
                    rRow.push("Staff Room");
                    cRow.push("FREE / VACANT");
                }
            });

            data.push(pRow);
            data.push(tRow);
            data.push(rRow);
            data.push(cRow);
            data.push([]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Teacher_Timetables");
        const filename = targetTeacherId 
            ? `Teacher_${teachersToExport[0].name.replace(/ /g, '_')}_Timetable.xlsx`
            : `All_Teachers_Timetables_Govt_High_School_Walton.xlsx`;
        XLSX.writeFile(wb, filename);
    }

    // ==========================================
    // 3. CLASS-WISE TIMETABLE EXCEL
    // ==========================================
    exportClassWiseExcel(targetClassId = null) {
        if (typeof XLSX === 'undefined') {
            alert("The Excel library is loading.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();
        const classesToExport = targetClassId 
            ? this.classes.filter(c => c.id === targetClassId) 
            : this.classes;

        const data = [
            [this.settings.schoolName.toUpperCase()],
            [this.settings.schoolNameUrdu],
            ["CLASS-WISE TIME TABLE SHEETS"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            []
        ];

        classesToExport.forEach(c => {
            const incharge = this.teacherMap[c.inchargeId] ? this.teacherMap[c.inchargeId].name : "-";
            data.push([`CLASS: ${c.name} - Section ${c.section}`, `Incharge: ${incharge}`, `Room: ${c.roomNo || '-'}`]);

            const pRow = ["Period:"];
            const tRow = ["Time:"];
            const sRow = ["Subject & Teacher:"];

            this.settings.periods.forEach(p => {
                const lesson = this.scheduleData.classSchedule[c.id][p.id];
                pRow.push(p.name);
                tRow.push(`${p.startTime} - ${p.endTime}`);
                if (lesson) {
                    const t = this.teacherMap[lesson.teacherId];
                    sRow.push(`${lesson.subjectName}\n[${t ? t.name : ''}]`);
                } else {
                    sRow.push("FREE");
                }
            });

            data.push(pRow);
            data.push(tRow);
            data.push(sRow);
            data.push([]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Class_Timetables");
        XLSX.writeFile(wb, `All_Classes_Timetables_Govt_High_School_Walton.xlsx`);
    }

    // ==========================================
    // 4. TIMETABLE SUMMARY EXCEL
    // ==========================================
    exportSummaryExcel() {
        if (typeof XLSX === 'undefined') {
            alert("The Excel library is loading.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();

        const data = [
            [this.settings.schoolName.toUpperCase()],
            [this.settings.schoolNameUrdu],
            ["STAFF TIMETABLE SUMMARY (WORKLOAD & FREE PERIODS RECORD)"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            []
        ];

        const header = [
            "Sr. No.",
            "Teacher Name",
            "Designation",
            "Mobile Number",
            "Inchargeship Status",
            "Subjects Taught",
            "Daily Teaching",
            "Daily Free",
            "Weekly Teaching (6 Days)",
            "Weekly Free (6 Days)",
            "Monthly Teaching (26 Days)",
            "Monthly Free (26 Days)",
            "Free Period %"
        ];
        data.push(header);

        this.teachers.forEach((t, idx) => {
            const inch = this.getInchargeStatus(t.id);
            let dailyTeaching = 0;

            this.settings.periods.forEach(p => {
                const l = this.scheduleData.teacherSchedule[t.id][p.id];
                if (l && !l.isFree) dailyTeaching++;
            });

            const dailyFree = this.settings.periods.length - dailyTeaching;
            const weeklyTeaching = dailyTeaching * 6;
            const weeklyFree = dailyFree * 6;
            const monthlyTeaching = dailyTeaching * 26;
            const monthlyFree = dailyFree * 26;
            const freePct = ((dailyFree / this.settings.periods.length) * 100).toFixed(1) + "%";

            data.push([
                idx + 1,
                t.name,
                exporterFormatDesignation(t.designation) || "-",
                t.mobileNumber || "-",
                inch.statusText,
                t.subjects.join(", "),
                dailyTeaching,
                dailyFree,
                weeklyTeaching,
                weeklyFree,
                monthlyTeaching,
                monthlyFree,
                freePct
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Timetable_Summary");
        XLSX.writeFile(wb, `Govt_High_School_Walton_Timetable_Summary_${dateStr.replace(/ /g, '_')}.xlsx`);
    }

    // ==========================================
    // 5. CLASS INCHARGES & NON-INCHARGES EXCEL
    // ==========================================
    exportInchargesExcel() {
        if (typeof XLSX === 'undefined') {
            alert("The Excel library is loading.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();

        // Sheet 1: Class Incharges
        const inchData = [
            [this.settings.schoolName.toUpperCase()],
            ["LIST OF CLASS INCHARGES"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            [],
            ["Sr. No.", "Teacher Name", "Designation", "Mobile Number", "Class", "Section", "Room No."]
        ];

        let inchCount = 0;
        this.classes.forEach(c => {
            const t = this.teacherMap[c.inchargeId];
            if (t) {
                inchCount++;
                inchData.push([
                    inchCount,
                    t.name,
                    exporterFormatDesignation(t.designation) || "-",
                    t.mobileNumber || "-",
                    c.name,
                    c.section,
                    c.roomNo || "-"
                ]);
            }
        });

        const wsInch = XLSX.utils.aoa_to_sheet(inchData);
        XLSX.utils.book_append_sheet(wb, wsInch, "Class_Incharges");

        // Sheet 2: Non-Incharge Teachers
        const nonInchData = [
            [this.settings.schoolName.toUpperCase()],
            ["TEACHING STAFF (NON-INCHARGES) & ASSIGNED CLASSES"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            [],
            ["Sr. No.", "Teacher Name", "Designation", "Mobile Number", "Classes & Sections Taught", "Subjects Taught"]
        ];

        let nonCount = 0;
        this.teachers.forEach(t => {
            const inch = this.getInchargeStatus(t.id);
            if (!inch.isYes) {
                nonCount++;
                // Find all classes taught by this teacher
                const taughtClasses = [];
                this.classes.forEach(c => {
                    const hasSubject = c.subjects.some(s => s.teacherId === t.id);
                    if (hasSubject) {
                        taughtClasses.push(`${c.name}-${c.section}`);
                    }
                });

                nonInchData.push([
                    nonCount,
                    t.name,
                    exporterFormatDesignation(t.designation) || "-",
                    t.mobileNumber || "-",
                    taughtClasses.join(", ") || "General Duty",
                    t.subjects.join(", ")
                ]);
            }
        });

        const wsNon = XLSX.utils.aoa_to_sheet(nonInchData);
        XLSX.utils.book_append_sheet(wb, wsNon, "Non_Incharge_Staff");

        XLSX.writeFile(wb, `Govt_High_School_Walton_Class_Incharges_List_${dateStr.replace(/ /g, '_')}.xlsx`);
    }

    toRoman(num) {
        const lookup = [
            { value: 1000, str: "m" }, { value: 900, str: "cm" },
            { value: 500, str: "d" }, { value: 400, str: "cd" },
            { value: 100, str: "c" }, { value: 90, str: "xc" },
            { value: 50, str: "l" }, { value: 40, str: "xl" },
            { value: 10, str: "x" }, { value: 9, str: "ix" },
            { value: 5, str: "v" }, { value: 4, str: "iv" },
            { value: 1, str: "i" }
        ];
        let roman = "";
        for (const item of lookup) {
            while (num >= item.value) {
                roman += item.str;
                num -= item.value;
            }
        }
        return roman;
    }

    // ==========================================
    // 6. STAFF CIRCULAR EXCEL (38 STAFF - 2 COLUMNS STRICTLY WITH ROMAN NUMBERS)
    // ==========================================
    exportStaffCircularExcel(noticeLines = [], staffList = []) {
        if (typeof XLSX === 'undefined') return;

        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();

        const data = [
            [this.settings.schoolName.toUpperCase()],
            [this.settings.schoolNameUrdu],
            ["STAFF CIRCULAR"],
            [`Date: ${dateStr} | Day: ____________________`],
            [],
            ["CIRCULAR / INTIMATION TEXT:"],
            [noticeLines[0] || "1. ____________________________________________________________________________________"],
            [noticeLines[1] || "2. ____________________________________________________________________________________"],
            [noticeLines[2] || "3. ____________________________________________________________________________________"],
            [noticeLines[3] || "4. ____________________________________________________________________________________"],
            [],
            // Dual Column Headers
            ["Sr.", "SST Teachers (Left Side)", "Signature", "", "Sr.", "EST Teachers (Right Side)", "Signature"]
        ];

        const listToUse = (staffList && staffList.length > 0) ? staffList : (typeof DEFAULT_CIRCULAR_STAFF !== 'undefined' ? DEFAULT_CIRCULAR_STAFF : []);
        const sstList = [];
        const estList = [];

        listToUse.forEach(t => {
            const desig = (t.designation || '').toUpperCase();
            if (desig.includes('SST') || desig.includes('S.S.T') || desig.includes('HEADMASTER') || desig.includes('HM')) {
                sstList.push(t);
            } else {
                estList.push(t);
            }
        });

        const maxRows = Math.max(sstList.length, estList.length);
        for (let i = 0; i < maxRows; i++) {
            const sst = sstList[i];
            const est = estList[i];

            const row = [
                sst ? (i + 1) : "",
                sst ? (sst.combinedName || `${sst.name} (${exporterFormatDesignation(sst.designation) || 'SST'})`) : "",
                sst ? "____________________" : "",
                "", // Blank gap column
                est ? (i + 1) : "",
                est ? (est.combinedName || `${est.name} (${exporterFormatDesignation(est.designation) || 'EST'})`) : "",
                est ? "____________________" : ""
            ];
            data.push(row);
        }

        data.push([]);
        data.push([]);
        data.push(["", "", "", "", "", "Headmaster / Principal", ""]);
        data.push(["", "", "", "", "", this.settings.schoolName, ""]);

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [
            { wch: 6 },
            { wch: 38 },
            { wch: 22 },
            { wch: 4 },
            { wch: 6 },
            { wch: 38 },
            { wch: 22 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, "Staff_Circular");
        XLSX.writeFile(wb, `Staff_Circular_${dateStr.replace(/ /g, '_')}.xlsx`);
    }

    // ==========================================
    // 6B. STAFF & FREE PERIODS EXCEL
    // ==========================================
    exportTeachersExcel(teachersList = null) {
        if (typeof XLSX === 'undefined') return;
        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();
        const list = teachersList || this.teachers;

        const data = [
            [this.settings.schoolName.toUpperCase()],
            [this.settings.schoolNameUrdu],
            ["STAFF & FREE PERIODS DIRECTORY"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            [],
            ["Sr. No.", "Teacher Name", "Designation", "Mobile Number", "Class Inchargeship", "Subjects Taught", "Designated Free Periods"]
        ];

        list.forEach((t, idx) => {
            const inch = this.getInchargeStatus(t.id);
            const freeStr = (t.freePeriods && t.freePeriods.length > 0)
                ? t.freePeriods.map(p => `Period ${p}`).join(", ")
                : "None";
            data.push([
                idx + 1,
                t.name,
                exporterFormatDesignation(t.designation) || "-",
                t.mobileNumber || "-",
                inch.statusText,
                (t.subjects || []).join(", "),
                freeStr
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 8 }, { wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 30 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, ws, "Staff_Directory");
        XLSX.writeFile(wb, `Govt_High_School_Walton_Staff_Directory_${dateStr.replace(/ /g, '_')}.xlsx`);
    }

    // ==========================================
    // 6C. CLASSES & ROOM NUMBERS EXCEL
    // ==========================================
    exportClassesExcel(classesList = null) {
        if (typeof XLSX === 'undefined') return;
        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();
        const list = classesList || this.classes;

        const data = [
            [this.settings.schoolName.toUpperCase()],
            [this.settings.schoolNameUrdu],
            ["CLASSES, SECTIONS & ROOM NUMBERS"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            [],
            ["Sr. No.", "Class", "Section", "Room No.", "Class Incharge", "Assigned Subjects & Teachers"]
        ];

        list.forEach((c, idx) => {
            const inchTeacher = this.teacherMap[c.inchargeId];
            const inchargeName = inchTeacher ? `${inchTeacher.name} (${exporterFormatDesignation(inchTeacher.designation)})` : "-";
            const subs = (c.subjects || []).map(s => {
                const t = this.teacherMap[s.teacherId];
                return `${s.name}: ${t ? t.name : '-'}`;
            }).join("; ");

            data.push([
                idx + 1,
                c.name,
                c.section,
                c.roomNo || "-",
                inchargeName,
                subs
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 8 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 45 }];
        XLSX.utils.book_append_sheet(wb, ws, "Classes_and_Rooms");
        XLSX.writeFile(wb, `Govt_High_School_Walton_Classes_and_Rooms_${dateStr.replace(/ /g, '_')}.xlsx`);
    }

    // ==========================================
    // 7. BELL TIME EXCEL (STRICTLY 2 COLUMNS - NO RECESS ROW)
    // ==========================================
    exportBellTimeExcel() {
        if (typeof XLSX === 'undefined') {
            alert("The Excel library is loading, please wait a moment.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();

        const data = [
            [this.settings.schoolName.toUpperCase()],
            [this.settings.schoolNameUrdu],
            ["DAILY BELL TIMING SCHEDULE"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            [],
            ["Period No.", "Bell timing"]
        ];

        this.settings.periods.forEach(p => {
            data.push([
                p.name,
                `${p.startTime} - ${p.endTime}`
            ]);
        });

        data.push([]);
        data.push(["Incharge Time Table: _____________________", "Headmaster / Principal: _____________________"]);

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 25 }, { wch: 35 }];
        XLSX.utils.book_append_sheet(wb, ws, "Bell_Timings");
        XLSX.writeFile(wb, `Govt_High_School_Walton_Bell_Timings_${dateStr.replace(/ /g, '_')}.xlsx`);
    }

    // ==========================================
    // 8. STAFF STATEMENT EXCEL (LANDSCAPE RECORD)
    // ==========================================
    exportStaffStatementExcel(staffList = [], columnsList = []) {
        if (typeof XLSX === 'undefined') {
            alert("The Excel library is loading, please wait a moment.");
            return;
        }

        const wb = XLSX.utils.book_new();
        const dateStr = this.getDateFormatted();

        const data = [
            [this.settings.schoolName.toUpperCase() + " CANTT."],
            ["STAFF STATEMENT (SERVICE RECORD)"],
            [`Dated: ${dateStr} | Academic Session: ${this.settings.academicYear}`],
            []
        ];

        // Headers
        const headers = columnsList && columnsList.length > 0
            ? columnsList
            : [
                'Sr. No.', 'Personnel #', 'Teacher Name', "Father's Name", 'CNIC #', 'BPS No.',
                'Designation', 'Qualification', 'Date of Birth', 'Date of Entry into Govt. Service',
                'Date of present Scale/Grade', 'Date of Joining present place of posting',
                'Cadre', 'Regular or Contract', 'Date of retirement', 'Phone/ Cell #', 'Residential Address'
            ];
        data.push(headers);

        let sstCount = 0;
        let estCount = 0;
        let pstCount = 0;

        staffList.forEach((st, idx) => {
            const desig = (st['Designation'] || '').toUpperCase();
            if (desig.includes('SST') || desig.includes('S.S.T') || desig.includes('HEADMASTER') || desig.includes('PRINCIPAL')) {
                sstCount++;
            } else if (desig.includes('EST') || desig.includes('PET') || desig.includes('S.V')) {
                estCount++;
            } else if (desig.includes('PST')) {
                pstCount++;
            }

            const row = headers.map(h => {
                if (h === 'Sr. No.') return idx + 1;
                if (h === 'Teacher Name' && !st['Teacher Name']) {
                    const parts = (st['Name with Parentage'] || '').split(/\s+[SsDd][/\\][Oo]\s+/);
                    return parts[0].trim();
                }
                if (h === "Father's Name" && !st["Father's Name"]) {
                    const parts = (st['Name with Parentage'] || '').split(/\s+[SsDd][/\\][Oo]\s+/);
                    return parts[1] ? parts[1].trim() : '-';
                }
                return st[h] !== undefined ? st[h] : '';
            });
            data.push(row);
        });

        data.push([]);
        data.push(["STAFF SUMMARY:"]);
        data.push([`Total SSTs (including Gazetted): ${sstCount}`]);
        data.push([`Total ESTs / General Teachers: ${estCount}`]);
        data.push([`Total PSTs (Primary Teachers): ${pstCount}`]);
        data.push([`Total Staff Members: ${staffList.length}`]);

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Staff_Statement");
        XLSX.writeFile(wb, `Govt_High_School_Walton_Staff_Statement_${dateStr.replace(/ /g, '_')}.xlsx`);
    }

    printBellTimePDF() {
        this.printElement('printableBellTime', 'Daily_Bell_Timings', 'portrait');
    }

    // Dynamic Print helper with Orientation Support & Isolated Container
    printElement(elementId, title = "Timetable", orientation = "portrait") {
        const originalTitle = document.title;
        document.title = `${this.settings.schoolName} - ${title} - ${this.getDateFormatted()}`;

        document.body.classList.remove('print-portrait', 'print-landscape');
        document.body.classList.add(orientation === 'landscape' ? 'print-landscape' : 'print-portrait');

        const targetEl = document.getElementById(elementId);
        const printRoot = document.getElementById('isolatedPrintRoot');

        if (targetEl && printRoot) {
            const clone = targetEl.cloneNode(true);
            clone.querySelectorAll('button, input, select, textarea, .no-print, [data-action], .action-btn, .actions-column').forEach(el => el.remove());
            clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
            printRoot.innerHTML = '';
            printRoot.appendChild(clone);
            printRoot.classList.remove('hidden');
            document.body.classList.add('printing-isolated');
        }

        fetch('/print_start').catch(() => {});

        window.print();

        setTimeout(() => {
            fetch('/print_end').catch(() => {});
            document.body.classList.remove('print-portrait', 'print-landscape', 'printing-isolated');
            if (printRoot) {
                printRoot.innerHTML = '';
                printRoot.classList.add('hidden');
            }
            document.title = originalTitle;
        }, 500);
    }
}
