// Built-in data for Govt. High School Walton Lahore.
// Fix #18 (2026-11-05): this seed IS the school's current verified
// data (32 teachers, incl. M. Shahzad and Muhammad Akmal, and the
// current timetable with 7th-A Period 7 = T.Q / Liaqat Ali Khan),
// so a brand-new device shows the correct data on first open even
// before cloud sync runs. Cloud sync then keeps every device
// up to date with later edits.

const DEFAULT_SETTINGS = {
    "schoolName": "Govt. High School Walton Lahore",
    "schoolNameUrdu": "گورنمنٹ ہائی اسکول والٹن لاہور",
    "academicYear": "2026 - 2027",
    "periodsPerDay": 8,
    "periods": [
        {
            "id": 1,
            "name": "Period 1",
            "startTime": "08:00 AM",
            "endTime": "08:40 AM"
        },
        {
            "id": 2,
            "name": "Period 2",
            "startTime": "08:40 AM",
            "endTime": "09:20 AM"
        },
        {
            "id": 3,
            "name": "Period 3",
            "startTime": "09:20 AM",
            "endTime": "10:00 AM"
        },
        {
            "id": 4,
            "name": "Period 4",
            "startTime": "10:00 AM",
            "endTime": "10:40 AM"
        },
        {
            "id": 5,
            "name": "Period 5",
            "startTime": "11:10 AM",
            "endTime": "11:50 AM"
        },
        {
            "id": 6,
            "name": "Period 6",
            "startTime": "11:50 AM",
            "endTime": "12:30 PM"
        },
        {
            "id": 7,
            "name": "Period 7",
            "startTime": "12:30 PM",
            "endTime": "01:05 PM"
        },
        {
            "id": 8,
            "name": "Period 8",
            "startTime": "01:05 PM",
            "endTime": "01:40 PM"
        }
    ],
    "breakAfterPeriod": 4,
    "breakTiming": "10:40 AM - 11:10 AM (Recess / تفریح)",
    "emisCode": "35210051"
};

const DEFAULT_TEACHERS = [
    {
        "id": "T18",
        "name": "Abdul Hannan",
        "designation": "EST",
        "mobileNumber": "0301-4567890",
        "subjects": [
            "Mathematics",
            "General Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            2
        ]
    },
    {
        "id": "T3",
        "name": "Abdul Rehman",
        "designation": "S.S.T(SC)",
        "mobileNumber": "0321-4770289",
        "subjects": [
            "Biology",
            "General Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            6
        ]
    },
    {
        "id": "T23",
        "name": "Adalat Ali",
        "designation": "EST",
        "mobileNumber": "0333-5012345",
        "subjects": [
            "Urdu",
            "History"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            7
        ]
    },
    {
        "id": "T12",
        "name": "Amjad Iqbal",
        "designation": "SST (Arts)",
        "mobileNumber": "0300-4321098",
        "subjects": [
            "Urdu",
            "Pak Studies"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            2
        ]
    },
    {
        "id": "T26",
        "name": "Aqib Mahmood",
        "designation": "PET",
        "mobileNumber": "0333-5345678",
        "subjects": [
            "Physical Education"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            8
        ]
    },
    {
        "id": "T25",
        "name": "Asim Majeed",
        "designation": "EST",
        "mobileNumber": "0321-5234567",
        "subjects": [
            "General Science",
            "Computer Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            2
        ]
    },
    {
        "id": "T31",
        "name": "Faurrakh Minhas",
        "designation": "EST",
        "mobileNumber": "0321-5890123",
        "subjects": [
            "English",
            "General Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            7
        ]
    },
    {
        "id": "T2",
        "name": "Ghulam Shabbir",
        "designation": "S.S.T(SC)",
        "mobileNumber": "0321-4045504",
        "subjects": [
            "Mathematics",
            "General Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            5
        ]
    },
    {
        "id": "T_1792177082557",
        "name": "Hafiz Masood Sadiq",
        "designation": "EST",
        "mobileNumber": "",
        "subjects": [
            "Mathematics",
            "General Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": []
    },
    {
        "id": "T17",
        "name": "Hassan Raza",
        "designation": "EST",
        "mobileNumber": "0333-4456789",
        "subjects": [
            "Social Studies",
            "History"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            8
        ]
    },
    {
        "id": "T22",
        "name": "Iftikhar Yaseen",
        "designation": "EST",
        "mobileNumber": "0321-4901234",
        "subjects": [
            "General Science",
            "Mathematics"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            1
        ]
    },
    {
        "id": "T27",
        "name": "Irfan Sandhu",
        "designation": "EST",
        "mobileNumber": "0302-5456789",
        "subjects": [
            "English",
            "Urdu"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            5
        ]
    },
    {
        "id": "T19",
        "name": "Liaqat Ali Khan",
        "designation": "S.V",
        "mobileNumber": "0322-4678901",
        "subjects": [
            "General Science",
            "Vocational"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            5
        ]
    },
    {
        "id": "T32",
        "name": "Muhammad Asif Javed",
        "designation": "EST",
        "mobileNumber": "0333-5901234",
        "subjects": [
            "Mathematics",
            "General Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            4
        ]
    },
    {
        "id": "T13",
        "name": "Muhammad Imran",
        "designation": "SST (Sci)",
        "mobileNumber": "0322-4567890",
        "subjects": [
            "Chemistry",
            "Biology"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            6
        ]
    },
    {
        "id": "T9",
        "name": "Muhammad Naeem",
        "designation": "SST (Sci)",
        "mobileNumber": "0321-4560123",
        "subjects": [
            "Mathematics",
            "General Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            5
        ]
    },
    {
        "id": "T4",
        "name": "Dr. Muhammad Siddique",
        "designation": "S.S.T(SC)",
        "mobileNumber": "0321-9457782",
        "subjects": [
            "Chemistry",
            "General Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            3
        ]
    },
    {
        "id": "T14",
        "name": "Mumtaz Ahmad",
        "designation": "SSt (Eng)",
        "mobileNumber": "0334-4567890",
        "subjects": [
            "English"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            1
        ]
    },
    {
        "id": "T5",
        "name": "Nadeem Ahmed",
        "designation": "SST (Arts)",
        "mobileNumber": "0322-8472504",
        "subjects": [
            "English",
            "Urdu"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            2
        ]
    },
    {
        "id": "T29",
        "name": "Nasir Ahmad",
        "designation": "EST",
        "mobileNumber": "0334-5678901",
        "subjects": [
            "General Science",
            "Mathematics"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            6
        ]
    },
    {
        "id": "T20",
        "name": "Nasrullah",
        "designation": "EST",
        "mobileNumber": "0334-4789012",
        "subjects": [
            "Urdu",
            "Islamiat"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            3
        ]
    },
    {
        "id": "T35",
        "name": "Naveed Anjum Butt",
        "designation": "EST",
        "mobileNumber": "0334-6234567",
        "subjects": [
            "General Science",
            "Mathematics"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            8
        ]
    },
    {
        "id": "T30",
        "name": "Rashid Ahmad",
        "designation": "EST",
        "mobileNumber": "0300-5789012",
        "subjects": [
            "Urdu",
            "Pak Studies"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            1
        ]
    },
    {
        "id": "T10",
        "name": "Saif Ullah Khalid",
        "designation": "SST I.T",
        "mobileNumber": "0333-4123456",
        "subjects": [
            "Computer Science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            4
        ]
    },
    {
        "id": "T37",
        "name": "Sana Shahzadi",
        "designation": "EST (A.T)",
        "mobileNumber": "0321-6456789",
        "subjects": [
            "Arabic",
            "Islamiat"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            6
        ]
    },
    {
        "id": "T34",
        "name": "Shahnaz Ashiq",
        "designation": "EST",
        "mobileNumber": "0322-6123456",
        "subjects": [
            "Social Studies",
            "Urdu"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            5
        ]
    },
    {
        "id": "T6",
        "name": "Shahzad Hassan Khosa",
        "designation": "SST(Sci)",
        "mobileNumber": "0300-4702958",
        "subjects": [
            "Physics",
            "Mathematics"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            7
        ]
    },
    {
        "id": "T_1792176882720",
        "name": "Dr. Tanvir Ahmad",
        "designation": "SST (Sci)",
        "mobileNumber": "",
        "subjects": [
            "Chemistry"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": []
    },
    {
        "id": "T_1792177019124",
        "name": "Touqeer Mehmood",
        "designation": "SST",
        "mobileNumber": "",
        "subjects": [
            "Urdu",
            "Pak Studies"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": []
    },
    {
        "id": "T33",
        "name": "Zulqurnain Haider",
        "designation": "EST",
        "mobileNumber": "0301-6012345",
        "subjects": [
            "Tarjuma Quran",
            "Islamiat"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": [
            2
        ]
    },
    {
        "id": "T_1793784748836",
        "name": "M. Shahzad",
        "designation": "PST",
        "mobileNumber": "",
        "subjects": [
            "Math"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": []
    },
    {
        "id": "T_1793786284416",
        "name": "Muhammad Akmal",
        "designation": "DY. H,M",
        "mobileNumber": "",
        "subjects": [
            "science"
        ],
        "maxPeriodsPerDay": 6,
        "freePeriods": []
    }
];

const DEFAULT_CLASSES = [
    {
        "id": "C1",
        "name": "10th",
        "section": "A",
        "roomNo": "202",
        "inchargeId": "T9",
        "inchargeName": "Muhammad Naeem",
        "subjects": [
            {
                "name": "Physics",
                "teacherId": "T9",
                "teacherName": "Muhammad Naeem"
            },
            {
                "name": "Math",
                "teacherId": "T9",
                "teacherName": "Muhammad Naeem"
            },
            {
                "name": "Computer",
                "teacherId": "T20",
                "teacherName": "Nasrullah"
            },
            {
                "name": "T.Q",
                "teacherId": "T18",
                "teacherName": "Abdul Hannan"
            },
            {
                "name": "English",
                "teacherId": "T14",
                "teacherName": "Mumtaz Ahmad"
            },
            {
                "name": "Chemistry",
                "teacherId": "T_1792176882720",
                "teacherName": "Dr. Tanvir Ahmad"
            },
            {
                "name": "Urdu",
                "teacherId": "T35",
                "teacherName": "Naveed Anjum Butt"
            },
            {
                "name": "Pak.St",
                "teacherId": "T9",
                "teacherName": "Muhammad Naeem"
            }
        ]
    },
    {
        "id": "C2",
        "name": "10th",
        "section": "B",
        "roomNo": "101",
        "inchargeId": "T5",
        "inchargeName": "Nadeem Ahmed",
        "subjects": [
            {
                "name": "Urdu",
                "teacherId": "T5",
                "teacherName": "Nadeem Ahmed"
            },
            {
                "name": "Bio / Computer",
                "teacherId": "T13",
                "teacherName": "Muhammad Imran",
                "split": [
                    {
                        "name": "Computer",
                        "teacherId": "T10",
                        "teacherName": "Saif Ullah Khalid"
                    }
                ]
            },
            {
                "name": "English",
                "teacherId": "T_1792177019124",
                "teacherName": "Touqeer Mehmood"
            },
            {
                "name": "Physics",
                "teacherId": "T_1792176882720",
                "teacherName": "Dr. Tanvir Ahmad"
            },
            {
                "name": "Chemistry",
                "teacherId": "T_1792176882720",
                "teacherName": "Dr. Tanvir Ahmad"
            },
            {
                "name": "Math",
                "teacherId": "T6",
                "teacherName": "Shahzad Hassan Khosa"
            },
            {
                "name": "Pak.St",
                "teacherId": "T5",
                "teacherName": "Nadeem Ahmed"
            },
            {
                "name": "T.Q",
                "teacherId": "T5",
                "teacherName": "Nadeem Ahmed"
            }
        ]
    },
    {
        "id": "C3",
        "name": "10th",
        "section": "C",
        "roomNo": "102",
        "inchargeId": "T3",
        "inchargeName": "Abdul Rehman",
        "subjects": [
            {
                "name": "T.Q",
                "teacherId": "T3",
                "teacherName": "Abdul Rehman"
            },
            {
                "name": "Chemistry",
                "teacherId": "T4",
                "teacherName": "Dr. Muhammad Siddique"
            },
            {
                "name": "English",
                "teacherId": "T14",
                "teacherName": "Mumtaz Ahmad"
            },
            {
                "name": "Computer",
                "teacherId": "T20",
                "teacherName": "Nasrullah"
            },
            {
                "name": "Physics",
                "teacherId": "T3",
                "teacherName": "Abdul Rehman"
            },
            {
                "name": "Math",
                "teacherId": "T3",
                "teacherName": "Abdul Rehman"
            },
            {
                "name": "Urdu",
                "teacherId": "T12",
                "teacherName": "Amjad Iqbal"
            },
            {
                "name": "Pak.St",
                "teacherId": "T3",
                "teacherName": "Abdul Rehman"
            }
        ]
    },
    {
        "id": "C4",
        "name": "10th",
        "section": "D",
        "roomNo": "103",
        "inchargeId": "T14",
        "inchargeName": "Mumtaz Ahmad",
        "subjects": [
            {
                "name": "English",
                "teacherId": "T14",
                "teacherName": "Mumtaz Ahmad"
            },
            {
                "name": "Phy.edu",
                "teacherId": "T26",
                "teacherName": "Aqib Mahmood"
            },
            {
                "name": "Urdu",
                "teacherId": "T31",
                "teacherName": "Faurrakh Minhas"
            },
            {
                "name": "G.Sc",
                "teacherId": "T4",
                "teacherName": "Dr. Muhammad Siddique"
            },
            {
                "name": "Islamiat / Computer / Poultry",
                "teacherId": "T_1792177019124",
                "teacherName": "Touqeer Mehmood",
                "split": [
                    {
                        "name": "Computer",
                        "teacherId": "T20",
                        "teacherName": "Nasrullah"
                    },
                    {
                        "name": "Poultry",
                        "teacherId": "T27",
                        "teacherName": "Irfan Sandhu"
                    }
                ]
            },
            {
                "name": "Math",
                "teacherId": "T27",
                "teacherName": "Irfan Sandhu"
            },
            {
                "name": "T.Q",
                "teacherId": "T29",
                "teacherName": "Nasir Ahmad"
            },
            {
                "name": "Pak.St",
                "teacherId": "T14",
                "teacherName": "Mumtaz Ahmad"
            }
        ]
    },
    {
        "id": "C5",
        "name": "9th",
        "section": "A",
        "roomNo": "201",
        "inchargeId": "T_1792176882720",
        "inchargeName": "Dr. Tanvir Ahmad",
        "subjects": [
            {
                "name": "Chemistry",
                "teacherId": "T_1792176882720",
                "teacherName": "Dr. Tanvir Ahmad"
            },
            {
                "name": "T.Q",
                "teacherId": "T_1792176882720",
                "teacherName": "Dr. Tanvir Ahmad"
            },
            {
                "name": "Math",
                "teacherId": "T9",
                "teacherName": "Muhammad Naeem"
            },
            {
                "name": "English",
                "teacherId": "T23",
                "teacherName": "Adalat Ali"
            },
            {
                "name": "Physics",
                "teacherId": "T9",
                "teacherName": "Muhammad Naeem"
            },
            {
                "name": "Urdu",
                "teacherId": "T5",
                "teacherName": "Nadeem Ahmed"
            },
            {
                "name": "Computer",
                "teacherId": "T10",
                "teacherName": "Saif Ullah Khalid"
            },
            {
                "name": "Islamiat",
                "teacherId": "T_1792176882720",
                "teacherName": "Dr. Tanvir Ahmad"
            }
        ]
    },
    {
        "id": "C6",
        "name": "9th",
        "section": "B",
        "roomNo": "203",
        "inchargeId": "T13",
        "inchargeName": "Muhammad Imran",
        "subjects": [
            {
                "name": "Chemistry",
                "teacherId": "T13",
                "teacherName": "Muhammad Imran"
            },
            {
                "name": "Physics",
                "teacherId": "T3",
                "teacherName": "Abdul Rehman"
            },
            {
                "name": "Bio / Computer",
                "teacherId": "T13",
                "teacherName": "Muhammad Imran",
                "split": [
                    {
                        "name": "Computer",
                        "teacherId": "T10",
                        "teacherName": "Saif Ullah Khalid"
                    }
                ]
            },
            {
                "name": "Math",
                "teacherId": "T25",
                "teacherName": "Asim Majeed"
            },
            {
                "name": "Islamiat",
                "teacherId": "T6",
                "teacherName": "Shahzad Hassan Khosa"
            },
            {
                "name": "Urdu",
                "teacherId": "T4",
                "teacherName": "Dr. Muhammad Siddique"
            },
            {
                "name": "English",
                "teacherId": "T23",
                "teacherName": "Adalat Ali"
            },
            {
                "name": "T.Q",
                "teacherId": "T13",
                "teacherName": "Muhammad Imran"
            }
        ]
    },
    {
        "id": "C7",
        "name": "9th",
        "section": "C",
        "roomNo": "304",
        "inchargeId": "T2",
        "inchargeName": "Ghulam Shabbir",
        "subjects": [
            {
                "name": "Math",
                "teacherId": "T2",
                "teacherName": "Ghulam Shabbir"
            },
            {
                "name": "Chemistry",
                "teacherId": "T2",
                "teacherName": "Ghulam Shabbir"
            },
            {
                "name": "Physics",
                "teacherId": "T2",
                "teacherName": "Ghulam Shabbir"
            },
            {
                "name": "English",
                "teacherId": "T14",
                "teacherName": "Mumtaz Ahmad"
            },
            {
                "name": "Urdu",
                "teacherId": "T5",
                "teacherName": "Nadeem Ahmed"
            },
            {
                "name": "Computer",
                "teacherId": "T10",
                "teacherName": "Saif Ullah Khalid"
            },
            {
                "name": "Islamiat",
                "teacherId": "T2",
                "teacherName": "Ghulam Shabbir"
            },
            {
                "name": "T.Q",
                "teacherId": "T2",
                "teacherName": "Ghulam Shabbir"
            }
        ]
    },
    {
        "id": "C8",
        "name": "9th",
        "section": "D",
        "roomNo": "104",
        "inchargeId": "T_1792177019124",
        "inchargeName": "Touqeer Mehmood",
        "subjects": [
            {
                "name": "Urdu",
                "teacherId": "T_1792177019124",
                "teacherName": "Touqeer Mehmood"
            },
            {
                "name": "English",
                "teacherId": "T_1792177019124",
                "teacherName": "Touqeer Mehmood"
            },
            {
                "name": "Islamiat",
                "teacherId": "T4",
                "teacherName": "Dr. Muhammad Siddique"
            },
            {
                "name": "Computer / Poultry",
                "teacherId": "T10",
                "teacherName": "Saif Ullah Khalid",
                "split": [
                    {
                        "name": "Poultry",
                        "teacherId": "T27",
                        "teacherName": "Irfan Sandhu"
                    }
                ]
            },
            {
                "name": "Phy.edu",
                "teacherId": "T31",
                "teacherName": "Faurrakh Minhas"
            },
            {
                "name": "T.Q",
                "teacherId": "T_1792177019124",
                "teacherName": "Touqeer Mehmood"
            },
            {
                "name": "G.Sc",
                "teacherId": "T6",
                "teacherName": "Shahzad Hassan Khosa"
            },
            {
                "name": "Math",
                "teacherId": "T25",
                "teacherName": "Asim Majeed"
            }
        ]
    },
    {
        "id": "C9",
        "name": "9th",
        "section": "E",
        "roomNo": "105",
        "inchargeId": "T25",
        "inchargeName": "Asim Majeed",
        "subjects": [
            {
                "name": "Math",
                "teacherId": "T25",
                "teacherName": "Asim Majeed"
            },
            {
                "name": "T.Q",
                "teacherId": "T25",
                "teacherName": "Asim Majeed"
            },
            {
                "name": "G.Sc",
                "teacherId": "T25",
                "teacherName": "Asim Majeed"
            },
            {
                "name": "Phy.edu",
                "teacherId": "T26",
                "teacherName": "Aqib Mahmood"
            },
            {
                "name": "Islamiat",
                "teacherId": "T29",
                "teacherName": "Nasir Ahmad"
            },
            {
                "name": "Urdu",
                "teacherId": "T12",
                "teacherName": "Amjad Iqbal"
            },
            {
                "name": "English",
                "teacherId": "T_1792177019124",
                "teacherName": "Touqeer Mehmood"
            },
            {
                "name": "Poultry",
                "teacherId": "T27",
                "teacherName": "Irfan Sandhu"
            }
        ]
    },
    {
        "id": "C10",
        "name": "9th",
        "section": "F",
        "roomNo": "204",
        "inchargeId": "T29",
        "inchargeName": "Nasir Ahmad",
        "subjects": [
            {
                "name": "Urdu",
                "teacherId": "T29",
                "teacherName": "Nasir Ahmad"
            },
            {
                "name": "Math",
                "teacherId": "T6",
                "teacherName": "Shahzad Hassan Khosa"
            },
            {
                "name": "Phy.edu",
                "teacherId": "T26",
                "teacherName": "Aqib Mahmood"
            },
            {
                "name": "T.Q",
                "teacherId": "T6",
                "teacherName": "Shahzad Hassan Khosa"
            },
            {
                "name": "English",
                "teacherId": "T32",
                "teacherName": "Muhammad Asif Javed"
            },
            {
                "name": "G.Sc / Islamiat",
                "teacherId": "T13",
                "teacherName": "Muhammad Imran",
                "split": [
                    {
                        "name": "Islamiat",
                        "teacherId": "T29",
                        "teacherName": "Nasir Ahmad"
                    }
                ]
            },
            {
                "name": "Poultry",
                "teacherId": "T4",
                "teacherName": "Dr. Muhammad Siddique"
            },
            {
                "name": "Islamiat",
                "teacherId": "T29",
                "teacherName": "Nasir Ahmad"
            }
        ]
    },
    {
        "id": "C11",
        "name": "8th",
        "section": "A",
        "roomNo": "205",
        "inchargeId": "T30",
        "inchargeName": "Rashid Ahmad",
        "subjects": [
            {
                "name": "English",
                "teacherId": "T30",
                "teacherName": "Rashid Ahmad"
            },
            {
                "name": "T.Q",
                "teacherId": "T30",
                "teacherName": "Rashid Ahmad"
            },
            {
                "name": "Islamiat",
                "teacherId": "T30",
                "teacherName": "Rashid Ahmad"
            },
            {
                "name": "Math",
                "teacherId": "T22",
                "teacherName": "Iftikhar Yaseen"
            },
            {
                "name": "Computer",
                "teacherId": "T34",
                "teacherName": "Shahnaz Ashiq"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T30",
                "teacherName": "Rashid Ahmad"
            },
            {
                "name": "Science",
                "teacherId": "T18",
                "teacherName": "Abdul Hannan"
            },
            {
                "name": "Urdu",
                "teacherId": "T30",
                "teacherName": "Rashid Ahmad"
            }
        ]
    },
    {
        "id": "C12",
        "name": "8th",
        "section": "B",
        "roomNo": "206",
        "inchargeId": "T33",
        "inchargeName": "Zulqurnain Haider",
        "subjects": [
            {
                "name": "English",
                "teacherId": "T33",
                "teacherName": "Zulqurnain Haider"
            },
            {
                "name": "Science",
                "teacherId": "T33",
                "teacherName": "Zulqurnain Haider"
            },
            {
                "name": "Islamiat",
                "teacherId": "T37",
                "teacherName": "Sana Shahzadi"
            },
            {
                "name": "Urdu",
                "teacherId": "T19",
                "teacherName": "Liaqat Ali Khan"
            },
            {
                "name": "Computer",
                "teacherId": "T33",
                "teacherName": "Zulqurnain Haider"
            },
            {
                "name": "Math",
                "teacherId": "T22",
                "teacherName": "Iftikhar Yaseen"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T33",
                "teacherName": "Zulqurnain Haider"
            },
            {
                "name": "T.Q",
                "teacherId": "T33",
                "teacherName": "Zulqurnain Haider"
            }
        ]
    },
    {
        "id": "C13",
        "name": "8th",
        "section": "C",
        "roomNo": "207",
        "inchargeId": "T17",
        "inchargeName": "Hassan Raza",
        "subjects": [
            {
                "name": "Science",
                "teacherId": "T17",
                "teacherName": "Hassan Raza"
            },
            {
                "name": "Math",
                "teacherId": "T17",
                "teacherName": "Hassan Raza"
            },
            {
                "name": "Computer",
                "teacherId": "T17",
                "teacherName": "Hassan Raza"
            },
            {
                "name": "Urdu",
                "teacherId": "T35",
                "teacherName": "Naveed Anjum Butt"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T17",
                "teacherName": "Hassan Raza"
            },
            {
                "name": "Islamiat",
                "teacherId": "T20",
                "teacherName": "Nasrullah"
            },
            {
                "name": "T.Q",
                "teacherId": "T20",
                "teacherName": "Nasrullah"
            },
            {
                "name": "English",
                "teacherId": "T17",
                "teacherName": "Hassan Raza"
            }
        ]
    },
    {
        "id": "C14",
        "name": "7th",
        "section": "A",
        "roomNo": "208",
        "inchargeId": "T31",
        "inchargeName": "Faurrakh Minhas",
        "subjects": [
            {
                "name": "English",
                "teacherId": "T31",
                "teacherName": "Faurrakh Minhas"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T31",
                "teacherName": "Faurrakh Minhas"
            },
            {
                "name": "Science",
                "teacherId": "T22",
                "teacherName": "Iftikhar Yaseen"
            },
            {
                "name": "Urdu",
                "teacherId": "T31",
                "teacherName": "Faurrakh Minhas"
            },
            {
                "name": "Islamiat",
                "teacherId": "T37",
                "teacherName": "Sana Shahzadi"
            },
            {
                "name": "Math",
                "teacherId": "T25",
                "teacherName": "Asim Majeed"
            },
            {
                "name": "T.Q",
                "teacherId": "T19",
                "teacherName": ""
            },
            {
                "name": "Computer",
                "teacherId": "T34",
                "teacherName": "Shahnaz Ashiq"
            }
        ]
    },
    {
        "id": "C15",
        "name": "7th",
        "section": "B",
        "roomNo": "209",
        "inchargeId": "T18",
        "inchargeName": "Abdul Hannan",
        "subjects": [
            {
                "name": "Science",
                "teacherId": "T18",
                "teacherName": "Abdul Hannan"
            },
            {
                "name": "Urdu",
                "teacherId": "T35",
                "teacherName": "Naveed Anjum Butt"
            },
            {
                "name": "Computer",
                "teacherId": "T34",
                "teacherName": "Shahnaz Ashiq"
            },
            {
                "name": "Islamiat",
                "teacherId": "T37",
                "teacherName": "Sana Shahzadi"
            },
            {
                "name": "Math",
                "teacherId": "T18",
                "teacherName": "Abdul Hannan"
            },
            {
                "name": "T.Q",
                "teacherId": "T18",
                "teacherName": "Abdul Hannan"
            },
            {
                "name": "English",
                "teacherId": "T32",
                "teacherName": "Muhammad Asif Javed"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T19",
                "teacherName": "Liaqat Ali Khan"
            }
        ]
    },
    {
        "id": "C16",
        "name": "7th",
        "section": "C",
        "roomNo": "305",
        "inchargeId": "T22",
        "inchargeName": "Iftikhar Yaseen",
        "subjects": [
            {
                "name": "Math",
                "teacherId": "T22",
                "teacherName": "Iftikhar Yaseen"
            },
            {
                "name": "Science",
                "teacherId": "T22",
                "teacherName": "Iftikhar Yaseen"
            },
            {
                "name": "Islamiat",
                "teacherId": "T35",
                "teacherName": "Naveed Anjum Butt"
            },
            {
                "name": "English",
                "teacherId": "T32",
                "teacherName": "Muhammad Asif Javed"
            },
            {
                "name": "T.Q",
                "teacherId": "T_1792177082557",
                "teacherName": "Hafiz Masood Sadiq"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T35",
                "teacherName": "Naveed Anjum Butt"
            },
            {
                "name": "Computer",
                "teacherId": "T34",
                "teacherName": "Shahnaz Ashiq"
            },
            {
                "name": "Urdu",
                "teacherId": "T22",
                "teacherName": "Iftikhar Yaseen"
            }
        ]
    },
    {
        "id": "C17",
        "name": "6th",
        "section": "A",
        "roomNo": "401",
        "inchargeId": "T23",
        "inchargeName": "Adalat Ali",
        "subjects": [
            {
                "name": "English",
                "teacherId": "T23",
                "teacherName": "Adalat Ali"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T23",
                "teacherName": "Adalat Ali"
            },
            {
                "name": "Math",
                "teacherId": "T_1792177082557",
                "teacherName": "Hafiz Masood Sadiq"
            },
            {
                "name": "Computer",
                "teacherId": "T34",
                "teacherName": "Shahnaz Ashiq"
            },
            {
                "name": "Urdu",
                "teacherId": "T19",
                "teacherName": "Liaqat Ali Khan"
            },
            {
                "name": "Islamiat",
                "teacherId": "T37",
                "teacherName": "Sana Shahzadi"
            },
            {
                "name": "Science",
                "teacherId": "T17",
                "teacherName": "Hassan Raza"
            },
            {
                "name": "T.Q",
                "teacherId": "T23",
                "teacherName": "Adalat Ali"
            }
        ]
    },
    {
        "id": "C18",
        "name": "6th",
        "section": "B",
        "roomNo": "402",
        "inchargeId": "T_1792177082557",
        "inchargeName": "Hafiz Masood Sadiq",
        "subjects": [
            {
                "name": "Science",
                "teacherId": "T_1792177082557",
                "teacherName": "Hafiz Masood Sadiq"
            },
            {
                "name": "T.Q",
                "teacherId": "T19",
                "teacherName": "Liaqat Ali Khan"
            },
            {
                "name": "English",
                "teacherId": "T32",
                "teacherName": "Muhammad Asif Javed"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T33",
                "teacherName": "Zulqurnain Haider"
            },
            {
                "name": "Urdu",
                "teacherId": "T30",
                "teacherName": "Rashid Ahmad"
            },
            {
                "name": "Computer",
                "teacherId": "T_1792177082557",
                "teacherName": "Hafiz Masood Sadiq"
            },
            {
                "name": "Islamiat",
                "teacherId": "T37",
                "teacherName": "Sana Shahzadi"
            },
            {
                "name": "Math",
                "teacherId": "T_1792177082557",
                "teacherName": "Hafiz Masood Sadiq"
            }
        ]
    },
    {
        "id": "C19",
        "name": "6th",
        "section": "C",
        "roomNo": "403",
        "inchargeId": "T27",
        "inchargeName": "Irfan Sandhu",
        "subjects": [
            {
                "name": "Math",
                "teacherId": "T27",
                "teacherName": "Irfan Sandhu"
            },
            {
                "name": "Computer",
                "teacherId": "T34",
                "teacherName": "Shahnaz Ashiq"
            },
            {
                "name": "Science",
                "teacherId": "T27",
                "teacherName": "Irfan Sandhu"
            },
            {
                "name": "Islamiat",
                "teacherId": "T_1792177082557",
                "teacherName": "Hafiz Masood Sadiq"
            },
            {
                "name": "Hist/Geo",
                "teacherId": "T23",
                "teacherName": "Adalat Ali"
            },
            {
                "name": "English",
                "teacherId": "T32",
                "teacherName": "Muhammad Asif Javed"
            },
            {
                "name": "T.Q",
                "teacherId": "T19",
                "teacherName": "Liaqat Ali Khan"
            },
            {
                "name": "Urdu",
                "teacherId": "T31",
                "teacherName": "Faurrakh Minhas"
            }
        ]
    }
];

const DEFAULT_STAFF_STATEMENT = [
    {
        "Sr. No.": "1",
        "Personnel #": "30063665",
        "Name with Parentage": "Iftikhar Ahmad S/o Allah Yar Khan",
        "CNIC #": "35202-2743576-1",
        "BPS No.": "20",
        "Designation": "Principal",
        "Qualification": "M.Sc  (Zoology)",
        "Date of Birth": "22-10-1965",
        "Date of Entry into Govt. Service": "10-04-1991",
        "Date of present Scale/Grade": "19-09-2023",
        "Date of Joining present place  of posting": "27-09-2023",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "21-10-2025",
        "Phone/ Cell #": "0300-4500949",
        "Residential Address": "Sial Street Icchra Lahore",
        "Teacher Name": "Iftikhar Ahmad",
        "Father's Name": "Allah Yar Khan"
    },
    {
        "Sr. No.": "2",
        "Personnel #": "30288786",
        "Name with Parentage": "Muhammad Akmal S/O Muhamamd Akram",
        "CNIC #": "35404-1567156-5",
        "BPS No.": "17",
        "Designation": "Dy. Headmaster",
        "Qualification": "BS.ed, M.ed",
        "Date of Birth": "18-04-1970",
        "Date of Entry into Govt. Service": "27-09-1997",
        "Date of present Scale/Grade": "01-05-2025",
        "Date of Joining present place  of posting": "01-05-2025",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "17-04-2030",
        "Phone/ Cell #": "0321-9410349",
        "Residential Address": "H#320-A, Hadi street Alhmad Colony Allama Iqbal Town, Lahore.",
        "Teacher Name": "Muhammad Akmal",
        "Father's Name": "Muhamamd Akram"
    },
    {
        "Sr. No.": "9",
        "Personnel #": "30100251",
        "Name with Parentage": "Sher Hussain S/O Sultan Muhammad",
        "CNIC #": "35201-1501950-1",
        "BPS No.": "16",
        "Designation": "SST (Arts)",
        "Qualification": "M.A (Pol Sci)            M.Phil (Education)",
        "Date of Birth": "10-08-1966",
        "Date of Entry into Govt. Service": "12-08-1990",
        "Date of present Scale/Grade": "09-01-2003",
        "Date of Joining present place  of posting": "09-01-2003",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "09-08-2026",
        "Phone/ Cell #": "0322-4131172",
        "Residential Address": "Gulistan Colony Ghaziabad Lahore",
        "Teacher Name": "Sher Hussain",
        "Father's Name": "Sultan Muhammad"
    },
    {
        "Sr. No.": "3",
        "Personnel #": "30065833",
        "Name with Parentage": "Muhammad Latif  S/O Shair Muhammad",
        "CNIC #": "35201-1577769-5",
        "BPS No.": "16",
        "Designation": "S.S.T(SC)",
        "Qualification": "M.A (Pol Science)",
        "Date of Birth": "07-07-1965",
        "Date of Entry into Govt. Service": "12.5.93",
        "Date of present Scale/Grade": "12.5.93",
        "Date of Joining present place  of posting": "01-09-2003",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "06-07-2025",
        "Phone/ Cell #": "0334-4029824",
        "Residential Address": "Aray wali gali Chungi Amer Sidhu Lahore",
        "Teacher Name": "Muhammad Latif",
        "Father's Name": "Shair Muhammad"
    },
    {
        "Sr. No.": "10",
        "Personnel #": "30067133",
        "Name with Parentage": "Qadeer Ahmad S/O Muhammad Ibrahim",
        "CNIC #": "35201-1278768-5",
        "BPS No.": "16",
        "Designation": "SST (Arts)",
        "Qualification": "M.A (Pol Sci)",
        "Date of Birth": "10-04-1967",
        "Date of Entry into Govt. Service": "07-09-1993",
        "Date of present Scale/Grade": "20-06-2023",
        "Date of Joining present place  of posting": "07-09-1993",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "09-04-2027",
        "Phone/ Cell #": "0322-8495319",
        "Residential Address": "Walton Lahore",
        "Teacher Name": "Qadeer Ahmad",
        "Father's Name": "Muhammad Ibrahim"
    },
    {
        "Sr. No.": "8",
        "Personnel #": "30350717",
        "Name with Parentage": "Shahzad Hassan Khosa S/O Ghulam Hussain",
        "CNIC #": "32102-0185098-9",
        "BPS No.": "16",
        "Designation": "SST(Sci)",
        "Qualification": "M.Sc History",
        "Date of Birth": "01-01-1972",
        "Date of Entry into Govt. Service": "13-02-1997",
        "Date of present Scale/Grade": "08-02-2011",
        "Date of Joining present place  of posting": "01-08-2012",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "31-12-2031",
        "Phone/ Cell #": "0333-6476181",
        "Residential Address": "E-229 Sheraz Villas PhaseII Cavalary Ground Lahore Cantt.",
        "Teacher Name": "Shahzad Hassan Khosa",
        "Father's Name": "Ghulam Hussain"
    },
    {
        "Sr. No.": "5",
        "Personnel #": "30962786",
        "Name with Parentage": "Abdul Rehman S/O Muhammad Aziz",
        "CNIC #": "35202-2414303-7",
        "BPS No.": "17",
        "Designation": "S.S.T(SC)",
        "Qualification": "MSc (Pak Studies) M.ed",
        "Date of Birth": "09/09/1976",
        "Date of Entry into Govt. Service": "01/09/2000",
        "Date of present Scale/Grade": "16-07-2017",
        "Date of Joining present place  of posting": "24/09/2024",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "08-09-2036",
        "Phone/ Cell #": "0323-4106621",
        "Residential Address": "E-236/1 Moza Charrar Dha Lahore Cantt",
        "Teacher Name": "Abdul Rehman",
        "Father's Name": "Muhammad Aziz"
    },
    {
        "Sr. No.": "14",
        "Personnel #": "30531204",
        "Name with Parentage": "Amjad Iqbal S/O Mohammad Khan",
        "CNIC #": "38401-4597142-9",
        "BPS No.": "16",
        "Designation": "SST (Arts)",
        "Qualification": "M.A Islamic studies and Education",
        "Date of Birth": "03-01-1975",
        "Date of Entry into Govt. Service": "22-09-2000",
        "Date of present Scale/Grade": "01-01-2008",
        "Date of Joining present place  of posting": "12-11-2019",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "02-01-2035",
        "Phone/ Cell #": "0345-5792036",
        "Residential Address": "Boola Bala Bhera Sargodha",
        "Teacher Name": "Amjad Iqbal",
        "Father's Name": "Mohammad Khan"
    },
    {
        "Sr. No.": "6",
        "Personnel #": "30142199",
        "Name with Parentage": "Muhammad Siddique S/O Maskeen Ali",
        "CNIC #": "35200-1847754-5",
        "BPS No.": "16",
        "Designation": "S.S.T(SC)",
        "Qualification": "Mphil (Sci  & Edu)",
        "Date of Birth": "21-07-1979",
        "Date of Entry into Govt. Service": "29-10-2004",
        "Date of present Scale/Grade": "29-10-2004",
        "Date of Joining present place  of posting": "23-09-2024",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "20-07-2039",
        "Phone/ Cell #": "0300-4105378",
        "Residential Address": "113E Pak Arab Society Lahore",
        "Teacher Name": "Muhammad Siddique",
        "Father's Name": "Maskeen Ali"
    },
    {
        "Sr. No.": "15",
        "Personnel #": "30145683",
        "Name with Parentage": "Muhammad Imran S/O Miraj Din",
        "CNIC #": "35201-1525387-5",
        "BPS No.": "16",
        "Designation": "SST (Sci)",
        "Qualification": "M.sc(Botany)",
        "Date of Birth": "01-01-1975",
        "Date of Entry into Govt. Service": "03-11-2004",
        "Date of present Scale/Grade": "19-10-2009",
        "Date of Joining present place  of posting": "01-07-2019",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "31-12-2034",
        "Phone/ Cell #": "0321-4541263",
        "Residential Address": "Walton Road",
        "Teacher Name": "Muhammad Imran",
        "Father's Name": "Miraj Din"
    },
    {
        "Sr. No.": "7",
        "Personnel #": "30143242",
        "Name with Parentage": "Nadeem Ahmed\nS/O Muhammad Latif",
        "CNIC #": "35201-1501655-9",
        "BPS No.": "16",
        "Designation": "SST (Arts)",
        "Qualification": "M.A (Pol Sci)",
        "Date of Birth": "6.6.73",
        "Date of Entry into Govt. Service": "10.11.04\nSSE",
        "Date of present Scale/Grade": "10.11.04",
        "Date of Joining present place  of posting": "10.11.04",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "05-06-133",
        "Phone/ Cell #": "0321-4506828",
        "Residential Address": "H No. E462 St 7\nMuhammad Pura\nChungai Ammer\nSidhu Lahore",
        "Teacher Name": "Nadeem Ahmed",
        "Father's Name": "Muhammad Latif"
    },
    {
        "Sr. No.": "11",
        "Personnel #": "30379335",
        "Name with Parentage": "Muhammad Naeem S/O Muhammad Asghar",
        "CNIC #": "35201-1463354-3",
        "BPS No.": "16",
        "Designation": "SST (Sci)",
        "Qualification": "M.Sc Physics",
        "Date of Birth": "11-12-1974",
        "Date of Entry into Govt. Service": "01-08-2005",
        "Date of present Scale/Grade": "19-10-2009",
        "Date of Joining present place  of posting": "09-01-2016",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "10-12-2034",
        "Phone/ Cell #": "0334-4169789",
        "Residential Address": "Main Bazar Boy Scout Walton",
        "Teacher Name": "Muhammad Naeem",
        "Father's Name": "Muhammad Asghar"
    },
    {
        "Sr. No.": "12",
        "Personnel #": "31324124",
        "Name with Parentage": "Saif Ullah Khalid S/O Muhammad Khalid Farooq",
        "CNIC #": "35202-3062080-7",
        "BPS No.": "16",
        "Designation": "SST I.T",
        "Qualification": "M.Phil Computer Science",
        "Date of Birth": "28/09/1982",
        "Date of Entry into Govt. Service": "15/08/2009",
        "Date of present Scale/Grade": "19/10/2009",
        "Date of Joining present place  of posting": "15/08/2017",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "27-09-2042",
        "Phone/ Cell #": "0322-4258161",
        "Residential Address": "House No. 12 Ittefaq Colony near Q-Block Model Town LHR",
        "Teacher Name": "Saif Ullah Khalid",
        "Father's Name": "Muhammad Khalid Farooq"
    },
    {
        "Sr. No.": "4",
        "Personnel #": "31349652",
        "Name with Parentage": "Ghulam Shabbir S/O Muhammad Saddique",
        "CNIC #": "35201-4009259-5",
        "BPS No.": "16",
        "Designation": "S.S.T(SC)",
        "Qualification": "Mphil (Math)",
        "Date of Birth": "18-03-1983",
        "Date of Entry into Govt. Service": "26-11-2009",
        "Date of present Scale/Grade": "26-12-2015",
        "Date of Joining present place  of posting": "23-09-2024",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "17-03-2043",
        "Phone/ Cell #": "0301-4052336",
        "Residential Address": "Ghazi Road General Hospital Lhr",
        "Teacher Name": "Ghulam Shabbir",
        "Father's Name": "Muhammad Saddique"
    },
    {
        "Sr. No.": "16",
        "Personnel #": "31544964",
        "Name with Parentage": "Mumtaz Ahmad S/O Muhammad Abdul",
        "CNIC #": "38401-6526184-9",
        "BPS No.": "16",
        "Designation": "SSt (Eng)",
        "Qualification": "M.A Eng M.ed",
        "Date of Birth": "01-05-1987",
        "Date of Entry into Govt. Service": "02-04-2012",
        "Date of present Scale/Grade": "02-04-2012",
        "Date of Joining present place  of posting": "09-10-2024",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "30-04-2047",
        "Phone/ Cell #": "0316-4386650",
        "Residential Address": "Walton Road",
        "Teacher Name": "Mumtaz Ahmad",
        "Father's Name": "Muhammad Abdul"
    },
    {
        "Sr. No.": "13",
        "Personnel #": "31659814",
        "Name with Parentage": "Javeed Iqbal S/O Abdul Islam",
        "CNIC #": "34601-1798967-1",
        "BPS No.": "16",
        "Designation": "SST (English)",
        "Qualification": "M.A English",
        "Date of Birth": "01-06-1984",
        "Date of Entry into Govt. Service": "04-01-2014",
        "Date of present Scale/Grade": "04-01-2014",
        "Date of Joining present place  of posting": "02-02-2019",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "31-05-2044",
        "Phone/ Cell #": "0342-6383772",
        "Residential Address": "House No. 315 B Gulberg III Lahore",
        "Teacher Name": "Javeed Iqbal",
        "Father's Name": "Abdul Islam"
    },
    {
        "Sr. No.": "23",
        "Personnel #": "30071252",
        "Name with Parentage": "Muhammad Manzoor S/O Muhammad Sharif",
        "CNIC #": "35201-1237741-3",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.A (Urdu) B.ed",
        "Date of Birth": "12.03.66",
        "Date of Entry into Govt. Service": "16-01-85",
        "Date of present Scale/Grade": "25-04-2011",
        "Date of Joining present place  of posting": "25-04-2011",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "11-03-126",
        "Phone/ Cell #": "0321-4181653",
        "Residential Address": "H # 24, Block A, Koh-e-Noor Schem Ferozpur Road Lhr",
        "Teacher Name": "Muhammad Manzoor",
        "Father's Name": "Muhammad Sharif"
    },
    {
        "Sr. No.": "21",
        "Personnel #": "30099543",
        "Name with Parentage": "Liaqat Ali Khan S/O Ibrar Ali Khan",
        "CNIC #": "35201-1463812-3",
        "BPS No.": "15",
        "Designation": "S.V",
        "Qualification": "B.A (B.ed)",
        "Date of Birth": "25.06.68",
        "Date of Entry into Govt. Service": "09-01-1990",
        "Date of present Scale/Grade": "09-01-1990",
        "Date of Joining present place  of posting": "05-05-2007",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "24-06-128",
        "Phone/ Cell #": "0322-4035488",
        "Residential Address": "H No.15, St No.4 Sitara Colony \nChungi Amaru Road Lhr",
        "Teacher Name": "Liaqat Ali Khan",
        "Father's Name": "Ibrar Ali Khan"
    },
    {
        "Sr. No.": "17",
        "Personnel #": "30065189",
        "Name with Parentage": "Abdul Ghafoor S/O Nawab Ali",
        "CNIC #": "35201-8231767-5",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.A Urdu",
        "Date of Birth": "26-01-67",
        "Date of Entry into Govt. Service": "05-05-1993",
        "Date of present Scale/Grade": "22-04-2011",
        "Date of Joining present place  of posting": "22-04-2014",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "25-01-127",
        "Phone/ Cell #": "0322-4600718",
        "Residential Address": "H No. 39/B, St No. 2, Model Colony Gulberg III, Lahore",
        "Teacher Name": "Abdul Ghafoor",
        "Father's Name": "Nawab Ali"
    },
    {
        "Sr. No.": "22",
        "Personnel #": "30104640",
        "Name with Parentage": "Nasrullah S/O Faqirullah",
        "CNIC #": "35201-7056624-9",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.Phill (Computer Science), M.Sc (I.T)",
        "Date of Birth": "10-04-1970",
        "Date of Entry into Govt. Service": "01-09-1993 PST",
        "Date of present Scale/Grade": "24-04-2011 EST",
        "Date of Joining present place  of posting": "14-09-2011",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "09-04-2030",
        "Phone/ Cell #": "0321-4232991",
        "Residential Address": "Peer Colony Walton Road Lahore.",
        "Teacher Name": "Nasrullah",
        "Father's Name": "Faqirullah"
    },
    {
        "Sr. No.": "18",
        "Personnel #": "30104189",
        "Name with Parentage": "Muhammad Nawaz Rehan S/O Abdul Ghani",
        "CNIC #": "35201-1198974-1",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.Sc (I.T)",
        "Date of Birth": "19-04-1967",
        "Date of Entry into Govt. Service": "30-01-1997",
        "Date of present Scale/Grade": "19-04-2011",
        "Date of Joining present place  of posting": "12-05-2014",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "18-04-2027",
        "Phone/ Cell #": "0323-4039408",
        "Residential Address": "E- 840/B Block D St. 1 Ali Park Lahore",
        "Teacher Name": "Muhammad Nawaz Rehan",
        "Father's Name": "Abdul Ghani"
    },
    {
        "Sr. No.": "25",
        "Personnel #": "30859749",
        "Name with Parentage": "Adalat Ali S/O Ghulam Haider",
        "CNIC #": "35201-1352329-3",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.A (Islamiat) B.ed",
        "Date of Birth": "20-06-78",
        "Date of Entry into Govt. Service": "10-01-2002",
        "Date of present Scale/Grade": "10-01-2002",
        "Date of Joining present place  of posting": "25-03-11",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "19-06-138",
        "Phone/ Cell #": "0323-8426278",
        "Residential Address": "Bostan Colony Qainchi LHR",
        "Teacher Name": "Adalat Ali",
        "Father's Name": "Ghulam Haider"
    },
    {
        "Sr. No.": "37",
        "Personnel #": "30859654",
        "Name with Parentage": "Naveed Anjum Butt S/O Naimat Ali",
        "CNIC #": "35201-4456624-9",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.A (Urdu) M.ed",
        "Date of Birth": "05-03-1977",
        "Date of Entry into Govt. Service": "11-10-2004",
        "Date of present Scale/Grade": "15-08-2009",
        "Date of Joining present place  of posting": "12-02-2020",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "04-03-2037",
        "Phone/ Cell #": "0334-4118033",
        "Residential Address": "Farooq Colony Walton",
        "Teacher Name": "Naveed Anjum Butt",
        "Father's Name": "Naimat Ali"
    },
    {
        "Sr. No.": "34",
        "Personnel #": "30856384",
        "Name with Parentage": "Muhammad Asif Javed S/o Allah Bakhash",
        "CNIC #": "35201-1500544-9",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.A Eng",
        "Date of Birth": "18-11-1982",
        "Date of Entry into Govt. Service": "09-01-2006",
        "Date of present Scale/Grade": "19-03-2021",
        "Date of Joining present place  of posting": "22-03-2021",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "17-11-2042",
        "Phone/ Cell #": "0321-4221739",
        "Residential Address": "Chungi Amar Sidhu Lahore",
        "Teacher Name": "Muhammad Asif Javed",
        "Father's Name": "Allah Bakhash"
    },
    {
        "Sr. No.": "32",
        "Personnel #": "30486689",
        "Name with Parentage": "Rashid Ahmad S/O Muhammad Siddique",
        "CNIC #": "35402-1985102-3",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.A (Isl)",
        "Date of Birth": "10-10-1974",
        "Date of Entry into Govt. Service": "09-08-2006",
        "Date of present Scale/Grade": "10-07-2019",
        "Date of Joining present place  of posting": "10-09-2019",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "09-10-2034",
        "Phone/ Cell #": "0345-4681935",
        "Residential Address": "857/T-3 St. No. 5 H-Block Ali Park Extension Bedian Road Lahore",
        "Teacher Name": "Rashid Ahmad",
        "Father's Name": "Muhammad Siddique"
    },
    {
        "Sr. No.": "31",
        "Personnel #": "30505138",
        "Name with Parentage": "Nasir Ahmad S/O Muhammad Suleman",
        "CNIC #": "35301-1856136-7",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.Phil (Education)",
        "Date of Birth": "10-06-1973",
        "Date of Entry into Govt. Service": "13-09-2006",
        "Date of present Scale/Grade": "13-09-2006",
        "Date of Joining present place  of posting": "07-02-2019",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "09-06-2033",
        "Phone/ Cell #": "0303-8901151",
        "Residential Address": "598-E Nadirabad II St. 06 Lahore Cantt.",
        "Teacher Name": "Nasir Ahmad",
        "Father's Name": "Muhammad Suleman"
    },
    {
        "Sr. No.": "30",
        "Personnel #": "30546574",
        "Name with Parentage": "Muhammad Nazir S/O Muhammad Nawaz",
        "CNIC #": "35201-1570561-3",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.A (Islamiat) B.ed",
        "Date of Birth": "11-10-1980",
        "Date of Entry into Govt. Service": "20-11-2006",
        "Date of present Scale/Grade": "20-11-2006",
        "Date of Joining present place  of posting": "28-12-2018",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "10-10-2040",
        "Phone/ Cell #": "0321-4154200",
        "Residential Address": "Umar Park St#04 Hakim Chowk Ashyana Road Lahore",
        "Teacher Name": "Muhammad Nazir",
        "Father's Name": "Muhammad Nawaz"
    },
    {
        "Sr. No.": "33",
        "Personnel #": "31332056",
        "Name with Parentage": "Faurrakh Minhas S/O Muzaffar Ali",
        "CNIC #": "33104-2109664-7",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.A (Hist)",
        "Date of Birth": "14-04-1975",
        "Date of Entry into Govt. Service": "15-08-2009",
        "Date of present Scale/Grade": "19-03-2021",
        "Date of Joining present place  of posting": "22-03-2021",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "13-04-2035",
        "Phone/ Cell #": "0333-4113750",
        "Residential Address": "Flat No. 13 B N Block Ext. Model Town Lahore",
        "Teacher Name": "Faurrakh Minhas",
        "Father's Name": "Muzaffar Ali"
    },
    {
        "Sr. No.": "28",
        "Personnel #": "31331335",
        "Name with Parentage": "Aqib Mahmood S/O Abdul Rauf",
        "CNIC #": "35201-6786091-9",
        "BPS No.": "15",
        "Designation": "PET",
        "Qualification": "M.A (Physical Education)",
        "Date of Birth": "21-02-1984",
        "Date of Entry into Govt. Service": "15-08-2009",
        "Date of present Scale/Grade": "15-08-2009",
        "Date of Joining present place  of posting": "16-09-2016",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "20-02-2044",
        "Phone/ Cell #": "0345-4033301",
        "Residential Address": "H# E 452 St. No. 1 Pir Colony Walton Lahore Cantt.",
        "Teacher Name": "Aqib Mahmood",
        "Father's Name": "Abdul Rauf"
    },
    {
        "Sr. No.": "24",
        "Personnel #": "31473413",
        "Name with Parentage": "Iftikhar Yaseen S/O Muhammad Sadiq",
        "CNIC #": "35201-9930969-9",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "B.Sc (Math Physics) B.ed",
        "Date of Birth": "01-01-1978",
        "Date of Entry into Govt. Service": "03-11-2010",
        "Date of present Scale/Grade": "03-11-2010",
        "Date of Joining present place  of posting": "24-03-2016",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "31-12-2037",
        "Phone/ Cell #": "0300-4466055",
        "Residential Address": "34-B Pak Arab Society Lahore",
        "Teacher Name": "Iftikhar Yaseen",
        "Father's Name": "Muhammad Sadiq"
    },
    {
        "Sr. No.": "20",
        "Personnel #": "31493720",
        "Name with Parentage": "Abdul Hannan S/O Muhmmad Sharif",
        "CNIC #": "31301-0589294-3",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.Sc             MIT",
        "Date of Birth": "15.06.82",
        "Date of Entry into Govt. Service": "02.02.2011",
        "Date of present Scale/Grade": "02.02.2011",
        "Date of Joining present place  of posting": "02.02.2011",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "14-06-142",
        "Phone/ Cell #": "0333-7477412",
        "Residential Address": "H # E54/7B, Qadri Colony, Walton Road Lahore.",
        "Teacher Name": "Abdul Hannan",
        "Father's Name": "Muhmmad Sharif"
    },
    {
        "Sr. No.": "26",
        "Personnel #": "31543046",
        "Name with Parentage": "Muhammad Iqbal S/O Abdul Jabbar",
        "CNIC #": "35102-2052568-5",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.Sc (Physcis)",
        "Date of Birth": "03-05-1989",
        "Date of Entry into Govt. Service": "04-02-2012",
        "Date of present Scale/Grade": "04-02-2012",
        "Date of Joining present place  of posting": "09-05-2016",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "02-05-2049",
        "Phone/ Cell #": "0302-4052833",
        "Residential Address": "House No.2 Milad Street Main Bazar Qainchi Ferozpur Road Lahore",
        "Teacher Name": "Muhammad Iqbal",
        "Father's Name": "Abdul Jabbar"
    },
    {
        "Sr. No.": "29",
        "Personnel #": "31545880",
        "Name with Parentage": "Irfan Sandhu S/O Niamat Masih",
        "CNIC #": "35102-2379143-3",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "B.Sc (Phy, Chem, Math)",
        "Date of Birth": "16-11-1990",
        "Date of Entry into Govt. Service": "04-03-2012",
        "Date of present Scale/Grade": "04-03-2012",
        "Date of Joining present place  of posting": "15-11-2050",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "15-11-2050",
        "Phone/ Cell #": "0323-7988905",
        "Residential Address": "H#44 ST#01 Triza Town Near Gaju Matta Lahore",
        "Teacher Name": "Irfan Sandhu",
        "Father's Name": "Niamat Masih"
    },
    {
        "Sr. No.": "35",
        "Personnel #": "31565788",
        "Name with Parentage": "Zulqurnain Haider S/O Moonas Ali",
        "CNIC #": "35202-0503132-9",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "MSc (Comp) M.ed",
        "Date of Birth": "25-01-1990",
        "Date of Entry into Govt. Service": "02-04-2012",
        "Date of present Scale/Grade": "04-01-2016",
        "Date of Joining present place  of posting": "25-04-2022",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "24-01-2050",
        "Phone/ Cell #": "0341-7012288",
        "Residential Address": "E 362 Pak Arab housing society ferozpur road Lahore",
        "Teacher Name": "Zulqurnain Haider",
        "Father's Name": "Moonas Ali"
    },
    {
        "Sr. No.": "27",
        "Personnel #": "31569673",
        "Name with Parentage": "Asim Majeed S/O Abdul Majeed",
        "CNIC #": "35202-6950323-7",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "M.Sc, M.Phil (Math)",
        "Date of Birth": "20-08-1988",
        "Date of Entry into Govt. Service": "23-08-2012",
        "Date of present Scale/Grade": "23-08-2012",
        "Date of Joining present place  of posting": "09-09-2016",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "19-08-2048",
        "Phone/ Cell #": "0300-4484921",
        "Residential Address": "H # 10 St# 10 Mohalla Tariq Abad behind General Hospital Lahore",
        "Teacher Name": "Asim Majeed",
        "Father's Name": "Abdul Majeed"
    },
    {
        "Sr. No.": "19",
        "Personnel #": "30808879",
        "Name with Parentage": "Hassan Raza S/O Muhammad sharif",
        "CNIC #": "36601-6929722-9",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "B.ed Mphil (Enviromental Science)",
        "Date of Birth": "20/12/1980",
        "Date of Entry into Govt. Service": "01/04/2014",
        "Date of present Scale/Grade": "01/01/2018",
        "Date of Joining present place  of posting": "27/04/2022",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "19-12-2040",
        "Phone/ Cell #": "0333-6286468",
        "Residential Address": "Walton Road Lahore.",
        "Teacher Name": "Hassan Raza",
        "Father's Name": "Muhammad sharif"
    },
    {
        "Sr. No.": "36",
        "Personnel #": "31695927",
        "Name with Parentage": "Shahnaz Ashiq D/o Ashiq Ali",
        "CNIC #": "35103-9966803-4",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "MIT M.ed",
        "Date of Birth": "07-10-1990",
        "Date of Entry into Govt. Service": "06-04-2015",
        "Date of present Scale/Grade": "06-04-2015",
        "Date of Joining present place  of posting": "15-12-2022",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "06-10-2050",
        "Phone/ Cell #": "0344-8483348",
        "Residential Address": "Gulberg Lahore",
        "Teacher Name": "Shahnaz Ashiq",
        "Father's Name": "Ashiq Ali"
    },
    {
        "Sr. No.": "39",
        "Personnel #": "31735261",
        "Name with Parentage": "Sana Shahzadi D/O M. Afzal ur Rehman",
        "CNIC #": "35201-9514307-0",
        "BPS No.": "15",
        "Designation": "EST (A.T)",
        "Qualification": "M.A (Arabic) B.ed",
        "Date of Birth": "18-07-1988",
        "Date of Entry into Govt. Service": "23-05-2015",
        "Date of present Scale/Grade": "01-05-2025",
        "Date of Joining present place  of posting": "02-05-2025",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "17-07-2048",
        "Phone/ Cell #": "0309-5695565",
        "Residential Address": "H#11A, Street#2, Shahtaj Colony Walton lhr",
        "Teacher Name": "Sana Shahzadi",
        "Father's Name": "M. Afzal ur Rehman"
    },
    {
        "Sr. No.": "38",
        "Personnel #": "31832887",
        "Name with Parentage": "Mustanir Hussain S/O M. Tariq Wasim",
        "CNIC #": "35202-0284303-5",
        "BPS No.": "15",
        "Designation": "EST",
        "Qualification": "Mphil (Islamic Studies)",
        "Date of Birth": "25-12-1994",
        "Date of Entry into Govt. Service": "01-08-2017",
        "Date of present Scale/Grade": "01-08-2017",
        "Date of Joining present place  of posting": "12-02-2020",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "24-12-2054",
        "Phone/ Cell #": "0334-4118033",
        "Residential Address": "Farooq Colony Walton",
        "Teacher Name": "Mustanir Hussain",
        "Father's Name": "M. Tariq Wasim"
    },
    {
        "Sr. No.": "42",
        "Personnel #": "30353885",
        "Name with Parentage": "Kausar Perveen D/O Shahzad Hussain",
        "CNIC #": "32102-3446865-2",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "Matric (P.T.C)",
        "Date of Birth": "01-04-1970",
        "Date of Entry into Govt. Service": "06-09-1990",
        "Date of present Scale/Grade": "06-09-1990",
        "Date of Joining present place  of posting": "09-03-2012",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "31-03-2030",
        "Phone/ Cell #": "0333-6476181",
        "Residential Address": "Sheraz Villas Cavlary Ground Lahore Cantt",
        "Teacher Name": "Kausar Perveen",
        "Father's Name": "Shahzad Hussain"
    },
    {
        "Sr. No.": "40",
        "Personnel #": "30030028",
        "Name with Parentage": "Muhammad Mubushar Latif S/O Muhammad Latif",
        "CNIC #": "33101-1685280-5",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "B.A (M.ed)",
        "Date of Birth": "25-04-1974",
        "Date of Entry into Govt. Service": "09-02-1995",
        "Date of present Scale/Grade": "09-02-1995",
        "Date of Joining present place  of posting": "08-02-2011",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "24-04-2034",
        "Phone/ Cell #": "0300-7206889",
        "Residential Address": "Bostan Colony Qanchi Amer Sidhu Lahore.",
        "Teacher Name": "Muhammad Mubushar Latif",
        "Father's Name": "Muhammad Latif"
    },
    {
        "Sr. No.": "41",
        "Personnel #": "31448396",
        "Name with Parentage": "Muhammad Asgher S/O Ghulam Hussain",
        "CNIC #": "35201-2611330-9",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.A Islamyat",
        "Date of Birth": "01-01-1982",
        "Date of Entry into Govt. Service": "12-07-2009",
        "Date of present Scale/Grade": "12-07-2009",
        "Date of Joining present place  of posting": "08-11-2011",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "31-12-2041",
        "Phone/ Cell #": "0303-4419353",
        "Residential Address": "Main Bazar Al- Nooor Town Walton",
        "Teacher Name": "Muhammad Asgher",
        "Father's Name": "Ghulam Hussain"
    },
    {
        "Sr. No.": "50",
        "Personnel #": "31696842",
        "Name with Parentage": "Muhammad Shahzad S/O Muhammad Yaqoob",
        "CNIC #": "35201-4057976-7",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.Sc (Math)",
        "Date of Birth": "05-06-1989",
        "Date of Entry into Govt. Service": "13-04-2015",
        "Date of present Scale/Grade": "13-04-2015",
        "Date of Joining present place  of posting": "13-02-2019",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "04-06-2049",
        "Phone/ Cell #": "0300-7780366",
        "Residential Address": "A-90 Pak Arab Housing Scheme Near Chungi Amar Sidhu Feroz Pur Road Lahore",
        "Teacher Name": "Muhammad Shahzad",
        "Father's Name": "Muhammad Yaqoob"
    },
    {
        "Sr. No.": "43",
        "Personnel #": "31689020",
        "Name with Parentage": "Waqas Afzal S/O Muhammad Afzal",
        "CNIC #": "34501-4805670-5",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.Sc Hydroligy",
        "Date of Birth": "20-03-1986",
        "Date of Entry into Govt. Service": "19-05-2015",
        "Date of present Scale/Grade": "19-05-2015",
        "Date of Joining present place  of posting": "19-05-2015",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "19-03-2046",
        "Phone/ Cell #": "0332-4958965",
        "Residential Address": "Peer Colony Walton Lahore",
        "Teacher Name": "Waqas Afzal",
        "Father's Name": "Muhammad Afzal"
    },
    {
        "Sr. No.": "44",
        "Personnel #": "31714029",
        "Name with Parentage": "Muhammad Shahid Iqbal S/O  Muhammad Rafique",
        "CNIC #": "35201-7360272-5",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.A Political Scince",
        "Date of Birth": "23-11-1987",
        "Date of Entry into Govt. Service": "20-05-2015",
        "Date of present Scale/Grade": "20-05-2015",
        "Date of Joining present place  of posting": "20-05-2015",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "22-11-2047",
        "Phone/ Cell #": "0321-4513343",
        "Residential Address": "Peer Colony Walton Lahore Cantt.",
        "Teacher Name": "Muhammad Shahid Iqbal",
        "Father's Name": "Muhammad Rafique"
    },
    {
        "Sr. No.": "53",
        "Personnel #": "31979910",
        "Name with Parentage": "Afshan Nazir D/O Nazir Ahmed Khan",
        "CNIC #": "35102-8600813-4",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.A(English)",
        "Date of Birth": "04-09-1985",
        "Date of Entry into Govt. Service": "08-01-2017",
        "Date of present Scale/Grade": "08-01-2017",
        "Date of Joining present place  of posting": "25-05-2021",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "03-09-2045",
        "Phone/ Cell #": "0306-4064312",
        "Residential Address": "Kot Lakhpat LHR",
        "Teacher Name": "Afshan Nazir",
        "Father's Name": "Nazir Ahmed Khan"
    },
    {
        "Sr. No.": "52",
        "Personnel #": "31979910",
        "Name with Parentage": "Mubashra Naz D/O Abdul Sattar",
        "CNIC #": "35102-8600813-4",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.A Mphil(Political Science)",
        "Date of Birth": "12-06-1988",
        "Date of Entry into Govt. Service": "08-01-2017",
        "Date of present Scale/Grade": "08-01-2017",
        "Date of Joining present place  of posting": "25-05-2021",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "11-06-2048",
        "Phone/ Cell #": "0306-4064312",
        "Residential Address": "Kot Lakhpat LHR",
        "Teacher Name": "Mubashra Naz",
        "Father's Name": "Abdul Sattar"
    },
    {
        "Sr. No.": "56",
        "Personnel #": "31941048",
        "Name with Parentage": "Abdullah Ahmed Qazi S/O Ajmal Waheed Qazi",
        "CNIC #": "34202-0924789-3",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.Phil (Math) B.Ed",
        "Date of Birth": "27-12-1991",
        "Date of Entry into Govt. Service": "20-07-2017",
        "Date of present Scale/Grade": "20-07-2017",
        "Date of Joining present place  of posting": "14-10-2024",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "26-12-2051",
        "Phone/ Cell #": "0331-4855098",
        "Residential Address": "18-II, B2, Township Lahore.",
        "Teacher Name": "Abdullah Ahmed Qazi",
        "Father's Name": "Ajmal Waheed Qazi"
    },
    {
        "Sr. No.": "55",
        "Personnel #": "31991846",
        "Name with Parentage": "Zeeshan Humayun Khan S/O Muhammad Humayun Khan",
        "CNIC #": "35201-6088532-9",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.A (Edu). M.B.(Economics)",
        "Date of Birth": "20-10-1984",
        "Date of Entry into Govt. Service": "01-01-2018",
        "Date of present Scale/Grade": "01-03-2018",
        "Date of Joining present place  of posting": "26-09-2024",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "19-10-2044",
        "Phone/ Cell #": "0309-6604206",
        "Residential Address": "H # 26-E, Super Town Walton Road Lahore",
        "Teacher Name": "Zeeshan Humayun Khan",
        "Father's Name": "Muhammad Humayun Khan"
    },
    {
        "Sr. No.": "45",
        "Personnel #": "32107464",
        "Name with Parentage": "Muhammad Iftikhar Ali S/O Ahmad Ali Nasir",
        "CNIC #": "35201-9711326-1",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "B.S (Chemistry)",
        "Date of Birth": "13-02-1991",
        "Date of Entry into Govt. Service": "03-01-2018",
        "Date of present Scale/Grade": "03-01-2018",
        "Date of Joining present place  of posting": "03-01-2018",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "12-02-2051",
        "Phone/ Cell #": "0324-9458869",
        "Residential Address": "House No. 414 St. no. 4 Nishat Colony Block G LHR Cantt.",
        "Teacher Name": "Muhammad Iftikhar Ali",
        "Father's Name": "Ahmad Ali Nasir"
    },
    {
        "Sr. No.": "46",
        "Personnel #": "32106966",
        "Name with Parentage": "Atif Iqbal S/O Zafar Iqbal",
        "CNIC #": "35201-4319732-9",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "B.S (Chemistry)",
        "Date of Birth": "02-03-1991",
        "Date of Entry into Govt. Service": "03-01-2018",
        "Date of present Scale/Grade": "03-01-2018",
        "Date of Joining present place  of posting": "03-01-2018",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "01-03-2051",
        "Phone/ Cell #": "0348-4614339",
        "Residential Address": "40 Quaraters R.A Bazar LHR Cantt.",
        "Teacher Name": "Atif Iqbal",
        "Father's Name": "Zafar Iqbal"
    },
    {
        "Sr. No.": "49",
        "Personnel #": "32107465",
        "Name with Parentage": "Muhammad Raees S/O Muhammad Saddique",
        "CNIC #": "35202-3393103-1",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "B.S (Chemistry)",
        "Date of Birth": "04-10-1992",
        "Date of Entry into Govt. Service": "03-01-2018",
        "Date of present Scale/Grade": "03-01-2018",
        "Date of Joining present place  of posting": "03-01-2018",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "03-10-2052",
        "Phone/ Cell #": "0312-4066163",
        "Residential Address": "H # 46 St # 8 Muhammadi Pind Pindi Rajputan Kot Lakhpat LHR",
        "Teacher Name": "Muhammad Raees",
        "Father's Name": "Muhammad Saddique"
    },
    {
        "Sr. No.": "48",
        "Personnel #": "32107453",
        "Name with Parentage": "Hafiz Kashif Sadeeq S/O Muhammad Sadeeq",
        "CNIC #": "35201-9788791-7",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.A English",
        "Date of Birth": "05-12-1992",
        "Date of Entry into Govt. Service": "03-01-2018",
        "Date of present Scale/Grade": "03-01-2018",
        "Date of Joining present place  of posting": "03-01-2018",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "04-12-2052",
        "Phone/ Cell #": "0324-8427250",
        "Residential Address": "Ker Khurd Bhata Chowk Lahore",
        "Teacher Name": "Hafiz Kashif Sadeeq",
        "Father's Name": "Muhammad Sadeeq"
    },
    {
        "Sr. No.": "47",
        "Personnel #": "32107466",
        "Name with Parentage": "Rana Haroon Haider S/O Shamaon Haider",
        "CNIC #": "35201-7652945-5",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "B.S English",
        "Date of Birth": "26-12-1993",
        "Date of Entry into Govt. Service": "03-01-2018",
        "Date of present Scale/Grade": "03-01-2018",
        "Date of Joining present place  of posting": "03-01-2018",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "25-12-2053",
        "Phone/ Cell #": "0323-4300930",
        "Residential Address": "Bandiawala Chungi Amar Sidhu LHR",
        "Teacher Name": "Rana Haroon Haider",
        "Father's Name": "Shamaon Haider"
    },
    {
        "Sr. No.": "54",
        "Personnel #": "31979910",
        "Name with Parentage": "Abdul Quddus S/O Muhammad Jamil",
        "CNIC #": "35201-2837219-3",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "MA ELTL, MPhil English",
        "Date of Birth": "20-11-1988",
        "Date of Entry into Govt. Service": "01-03-2018",
        "Date of present Scale/Grade": "01-03-2018",
        "Date of Joining present place  of posting": "25-07-2022",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "19-11-2048",
        "Phone/ Cell #": "0333-4037657",
        "Residential Address": "E 3/6 street 6 extension cavalry ground Lahore cantt",
        "Teacher Name": "Abdul Quddus",
        "Father's Name": "Muhammad Jamil"
    },
    {
        "Sr. No.": "51",
        "Personnel #": "32117473",
        "Name with Parentage": "Hina Rafique D/O Muhammad Rafique",
        "CNIC #": "35201-5896644-8",
        "BPS No.": "14",
        "Designation": "PST",
        "Qualification": "M.SC (Math) M.ed",
        "Date of Birth": "20-07-1991",
        "Date of Entry into Govt. Service": "16-01-2019",
        "Date of present Scale/Grade": "16-01-2019",
        "Date of Joining present place  of posting": "12-02-2020",
        "Cadre": "General",
        "Regular or Contract": "Regular",
        "Date of retirement": "19-07-2051",
        "Phone/ Cell #": "0324-4425065",
        "Residential Address": "Data Colony Qainchi",
        "Teacher Name": "Hina Rafique",
        "Father's Name": "Muhammad Rafique"
    }
];

const DEFAULT_STAFF_COLUMNS = [
    "Sr. No.",
    "Personnel #",
    "Teacher Name",
    "Father's Name",
    "CNIC #",
    "BPS No.",
    "Designation",
    "Qualification",
    "Date of Birth",
    "Date of Entry into Govt. Service",
    "Date of present Scale/Grade",
    "Date of Joining present place  of posting",
    "Cadre",
    "Regular or Contract",
    "Date of retirement",
    "Job Status",
    "Phone/ Cell #",
    "Residential Address"
];

const DEFAULT_SCHEDULE = {
    "success": true,
    "classSchedule": {
        "C1": {
            "1": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Physics",
                "teacherId": "T9",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Math",
                "teacherId": "T9",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Computer",
                "teacherId": "T20",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "T.Q",
                "teacherId": "T18",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Pak.St",
                "teacherId": "T9",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C2": {
            "1": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Bio / Computer",
                "teacherId": "T13",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Physics",
                "teacherId": "T_1792176882720",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Math",
                "teacherId": "T6",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Pak.St",
                "teacherId": "T5",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "T.Q",
                "teacherId": "T5",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C3": {
            "1": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "T.Q",
                "teacherId": "T3",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Chemistry",
                "teacherId": "T4",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Computer",
                "teacherId": "T20",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Physics",
                "teacherId": "T3",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Math",
                "teacherId": "T3",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Urdu",
                "teacherId": "T12",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Pak.St",
                "teacherId": "T3",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C4": {
            "1": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "G.Sc",
                "teacherId": "T4",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Islamiat / Computer / Poultry",
                "teacherId": "T_1792177019124",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Math",
                "teacherId": "T27",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "T.Q",
                "teacherId": "T29",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Pak.St",
                "teacherId": "T14",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C5": {
            "1": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "T.Q",
                "teacherId": "T_1792176882720",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Math",
                "teacherId": "T9",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Physics",
                "teacherId": "T9",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Computer",
                "teacherId": "T10",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Islamiat",
                "teacherId": "T_1792176882720",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C6": {
            "1": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Chemistry",
                "teacherId": "T13",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Physics",
                "teacherId": "T3",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Bio / Computer",
                "teacherId": "T13",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Islamiat",
                "teacherId": "T6",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Urdu",
                "teacherId": "T4",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "T.Q",
                "teacherId": "T13",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C7": {
            "1": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Math",
                "teacherId": "T2",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Chemistry",
                "teacherId": "T2",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Physics",
                "teacherId": "T2",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Computer",
                "teacherId": "T10",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Islamiat",
                "teacherId": "T2",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "T.Q",
                "teacherId": "T2",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C8": {
            "1": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Urdu",
                "teacherId": "T_1792177019124",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Islamiat",
                "teacherId": "T4",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Computer / Poultry",
                "teacherId": "T10",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Phy.edu",
                "teacherId": "T31",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "T.Q",
                "teacherId": "T_1792177019124",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "G.Sc",
                "teacherId": "T6",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C9": {
            "1": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "T.Q",
                "teacherId": "T25",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "G.Sc",
                "teacherId": "T25",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Islamiat",
                "teacherId": "T29",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Urdu",
                "teacherId": "T12",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Poultry",
                "teacherId": "T27",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C10": {
            "1": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Urdu",
                "teacherId": "T29",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Math",
                "teacherId": "T6",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "T.Q",
                "teacherId": "T6",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "G.Sc / Islamiat",
                "teacherId": "T13",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Poultry",
                "teacherId": "T4",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Islamiat",
                "teacherId": "T29",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C11": {
            "1": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "English",
                "teacherId": "T30",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "T.Q",
                "teacherId": "T30",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Islamiat",
                "teacherId": "T30",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Hist/Geo",
                "teacherId": "T30",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Science",
                "teacherId": "T18",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Urdu",
                "teacherId": "T30",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C12": {
            "1": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "English",
                "teacherId": "T33",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Science",
                "teacherId": "T33",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Urdu",
                "teacherId": "T19",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Computer",
                "teacherId": "T33",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Hist/Geo",
                "teacherId": "T33",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "T.Q",
                "teacherId": "T33",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C13": {
            "1": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Science",
                "teacherId": "T17",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Math",
                "teacherId": "T17",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Computer",
                "teacherId": "T17",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Hist/Geo",
                "teacherId": "T17",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Islamiat",
                "teacherId": "T20",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "T.Q",
                "teacherId": "T20",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "English",
                "teacherId": "T17",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C14": {
            "1": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "English",
                "teacherId": "T31",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Hist/Geo",
                "teacherId": "T31",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Science",
                "teacherId": "T22",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "T.Q",
                "teacherId": "T19",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C15": {
            "1": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Science",
                "teacherId": "T18",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Math",
                "teacherId": "T18",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "T.Q",
                "teacherId": "T18",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Hist/Geo",
                "teacherId": "T19",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C16": {
            "1": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Science",
                "teacherId": "T22",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Islamiat",
                "teacherId": "T35",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "T.Q",
                "teacherId": "T_1792177082557",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Hist/Geo",
                "teacherId": "T35",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Urdu",
                "teacherId": "T22",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C17": {
            "1": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Hist/Geo",
                "teacherId": "T23",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Math",
                "teacherId": "T_1792177082557",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Urdu",
                "teacherId": "T19",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Science",
                "teacherId": "T17",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "T.Q",
                "teacherId": "T23",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C18": {
            "1": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Science",
                "teacherId": "T_1792177082557",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "T.Q",
                "teacherId": "T19",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Hist/Geo",
                "teacherId": "T33",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Urdu",
                "teacherId": "T30",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Computer",
                "teacherId": "T_1792177082557",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Math",
                "teacherId": "T_1792177082557",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C19": {
            "1": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Math",
                "teacherId": "T27",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Science",
                "teacherId": "T27",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Islamiat",
                "teacherId": "T_1792177082557",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Hist/Geo",
                "teacherId": "T23",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "T.Q",
                "teacherId": "T19",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        }
    },
    "teacherSchedule": {
        "T18": {
            "1": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Science",
                "teacherId": "T18",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "T.Q",
                "teacherId": "T18",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Math",
                "teacherId": "T18",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "T.Q",
                "teacherId": "T18",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Science",
                "teacherId": "T18",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T3": {
            "1": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "T.Q",
                "teacherId": "T3",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Physics",
                "teacherId": "T3",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Physics",
                "teacherId": "T3",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Math",
                "teacherId": "T3",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Pak.St",
                "teacherId": "T3",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T23": {
            "1": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Hist/Geo",
                "teacherId": "T23",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Hist/Geo",
                "teacherId": "T23",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "T.Q",
                "teacherId": "T23",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T12": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Urdu",
                "teacherId": "T12",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Urdu",
                "teacherId": "T12",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T26": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T25": {
            "1": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "T.Q",
                "teacherId": "T25",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "G.Sc",
                "teacherId": "T25",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T31": {
            "1": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "English",
                "teacherId": "T31",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Hist/Geo",
                "teacherId": "T31",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Phy.edu",
                "teacherId": "T31",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T2": {
            "1": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Math",
                "teacherId": "T2",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Chemistry",
                "teacherId": "T2",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Physics",
                "teacherId": "T2",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Islamiat",
                "teacherId": "T2",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "T.Q",
                "teacherId": "T2",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T_1792177082557": {
            "1": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Science",
                "teacherId": "T_1792177082557",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Math",
                "teacherId": "T_1792177082557",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Islamiat",
                "teacherId": "T_1792177082557",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "T.Q",
                "teacherId": "T_1792177082557",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Computer",
                "teacherId": "T_1792177082557",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Math",
                "teacherId": "T_1792177082557",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T17": {
            "1": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Science",
                "teacherId": "T17",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Math",
                "teacherId": "T17",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Computer",
                "teacherId": "T17",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Hist/Geo",
                "teacherId": "T17",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Science",
                "teacherId": "T17",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "English",
                "teacherId": "T17",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T22": {
            "1": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Science",
                "teacherId": "T22",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Science",
                "teacherId": "T22",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Urdu",
                "teacherId": "T22",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T27": {
            "1": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Math",
                "teacherId": "T27",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Science",
                "teacherId": "T27",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Math",
                "teacherId": "T27",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Poultry",
                "teacherId": "T27",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T19": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "T.Q",
                "teacherId": "T19",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Urdu",
                "teacherId": "T19",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Urdu",
                "teacherId": "T19",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "T.Q",
                "teacherId": "T19",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Hist/Geo",
                "teacherId": "T19",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T32": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T13": {
            "1": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Chemistry",
                "teacherId": "T13",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Bio / Computer",
                "teacherId": "T13",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Bio / Computer",
                "teacherId": "T13",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "G.Sc / Islamiat",
                "teacherId": "T13",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "T.Q",
                "teacherId": "T13",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T9": {
            "1": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Physics",
                "teacherId": "T9",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Math",
                "teacherId": "T9",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Math",
                "teacherId": "T9",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Physics",
                "teacherId": "T9",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Pak.St",
                "teacherId": "T9",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T4": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Chemistry",
                "teacherId": "T4",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Islamiat",
                "teacherId": "T4",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "G.Sc",
                "teacherId": "T4",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Urdu",
                "teacherId": "T4",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Poultry",
                "teacherId": "T4",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T14": {
            "1": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Pak.St",
                "teacherId": "T14",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T5": {
            "1": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Pak.St",
                "teacherId": "T5",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "T.Q",
                "teacherId": "T5",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T29": {
            "1": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Urdu",
                "teacherId": "T29",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Islamiat",
                "teacherId": "T29",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "T.Q",
                "teacherId": "T29",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Islamiat",
                "teacherId": "T29",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T20": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Computer",
                "teacherId": "T20",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Computer",
                "teacherId": "T20",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Islamiat",
                "teacherId": "T20",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "T.Q",
                "teacherId": "T20",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T35": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Islamiat",
                "teacherId": "T35",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Hist/Geo",
                "teacherId": "T35",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": true,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T30": {
            "1": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "English",
                "teacherId": "T30",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "T.Q",
                "teacherId": "T30",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Islamiat",
                "teacherId": "T30",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Urdu",
                "teacherId": "T30",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Hist/Geo",
                "teacherId": "T30",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Urdu",
                "teacherId": "T30",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T10": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Computer / Poultry",
                "teacherId": "T10",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Computer",
                "teacherId": "T10",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Computer",
                "teacherId": "T10",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T37": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T34": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T6": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Math",
                "teacherId": "T6",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "T.Q",
                "teacherId": "T6",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Islamiat",
                "teacherId": "T6",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Math",
                "teacherId": "T6",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "G.Sc",
                "teacherId": "T6",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T_1792176882720": {
            "1": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "T.Q",
                "teacherId": "T_1792176882720",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Physics",
                "teacherId": "T_1792176882720",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Islamiat",
                "teacherId": "T_1792176882720",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T_1792177019124": {
            "1": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Urdu",
                "teacherId": "T_1792177019124",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Islamiat / Computer / Poultry",
                "teacherId": "T_1792177019124",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "T.Q",
                "teacherId": "T_1792177019124",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T33": {
            "1": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "English",
                "teacherId": "T33",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Science",
                "teacherId": "T33",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Hist/Geo",
                "teacherId": "T33",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Computer",
                "teacherId": "T33",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Hist/Geo",
                "teacherId": "T33",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "T.Q",
                "teacherId": "T33",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "T_1793784748836": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        },
        "T_1793786284416": {
            "1": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM",
                "roomNo": "Staff Room"
            },
            "2": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM",
                "roomNo": "Staff Room"
            },
            "3": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM",
                "roomNo": "Staff Room"
            },
            "4": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM",
                "roomNo": "Staff Room"
            },
            "5": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM",
                "roomNo": "Staff Room"
            },
            "6": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM",
                "roomNo": "Staff Room"
            },
            "7": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM",
                "roomNo": "Staff Room"
            },
            "8": {
                "isFree": true,
                "isOfficialFree": false,
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM",
                "roomNo": "Staff Room"
            }
        }
    },
    "masterSchedule": {
        "C1": {
            "1": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Physics",
                "teacherId": "T9",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Math",
                "teacherId": "T9",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Computer",
                "teacherId": "T20",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "T.Q",
                "teacherId": "T18",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C1",
                "className": "10th",
                "section": "A",
                "roomNo": "202",
                "subjectName": "Pak.St",
                "teacherId": "T9",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C2": {
            "1": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Bio / Computer",
                "teacherId": "T13",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Physics",
                "teacherId": "T_1792176882720",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Math",
                "teacherId": "T6",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "Pak.St",
                "teacherId": "T5",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C2",
                "className": "10th",
                "section": "B",
                "roomNo": "101",
                "subjectName": "T.Q",
                "teacherId": "T5",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C3": {
            "1": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "T.Q",
                "teacherId": "T3",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Chemistry",
                "teacherId": "T4",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Computer",
                "teacherId": "T20",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Physics",
                "teacherId": "T3",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Math",
                "teacherId": "T3",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Urdu",
                "teacherId": "T12",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C3",
                "className": "10th",
                "section": "C",
                "roomNo": "102",
                "subjectName": "Pak.St",
                "teacherId": "T3",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C4": {
            "1": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "G.Sc",
                "teacherId": "T4",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Islamiat / Computer / Poultry",
                "teacherId": "T_1792177019124",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Math",
                "teacherId": "T27",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "T.Q",
                "teacherId": "T29",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C4",
                "className": "10th",
                "section": "D",
                "roomNo": "103",
                "subjectName": "Pak.St",
                "teacherId": "T14",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C5": {
            "1": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Chemistry",
                "teacherId": "T_1792176882720",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "T.Q",
                "teacherId": "T_1792176882720",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Math",
                "teacherId": "T9",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Physics",
                "teacherId": "T9",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Computer",
                "teacherId": "T10",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C5",
                "className": "9th",
                "section": "A",
                "roomNo": "201",
                "subjectName": "Islamiat",
                "teacherId": "T_1792176882720",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C6": {
            "1": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Chemistry",
                "teacherId": "T13",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Physics",
                "teacherId": "T3",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Bio / Computer",
                "teacherId": "T13",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Islamiat",
                "teacherId": "T6",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "Urdu",
                "teacherId": "T4",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C6",
                "className": "9th",
                "section": "B",
                "roomNo": "203",
                "subjectName": "T.Q",
                "teacherId": "T13",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C7": {
            "1": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Math",
                "teacherId": "T2",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Chemistry",
                "teacherId": "T2",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Physics",
                "teacherId": "T2",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "English",
                "teacherId": "T14",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Urdu",
                "teacherId": "T5",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Computer",
                "teacherId": "T10",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "Islamiat",
                "teacherId": "T2",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C7",
                "className": "9th",
                "section": "C",
                "roomNo": "304",
                "subjectName": "T.Q",
                "teacherId": "T2",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C8": {
            "1": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Urdu",
                "teacherId": "T_1792177019124",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Islamiat",
                "teacherId": "T4",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Computer / Poultry",
                "teacherId": "T10",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Phy.edu",
                "teacherId": "T31",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "T.Q",
                "teacherId": "T_1792177019124",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "G.Sc",
                "teacherId": "T6",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C8",
                "className": "9th",
                "section": "D",
                "roomNo": "104",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C9": {
            "1": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "T.Q",
                "teacherId": "T25",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "G.Sc",
                "teacherId": "T25",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Islamiat",
                "teacherId": "T29",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Urdu",
                "teacherId": "T12",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "English",
                "teacherId": "T_1792177019124",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C9",
                "className": "9th",
                "section": "E",
                "roomNo": "105",
                "subjectName": "Poultry",
                "teacherId": "T27",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C10": {
            "1": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Urdu",
                "teacherId": "T29",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Math",
                "teacherId": "T6",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Phy.edu",
                "teacherId": "T26",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "T.Q",
                "teacherId": "T6",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "G.Sc / Islamiat",
                "teacherId": "T13",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Poultry",
                "teacherId": "T4",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C10",
                "className": "9th",
                "section": "F",
                "roomNo": "204",
                "subjectName": "Islamiat",
                "teacherId": "T29",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C11": {
            "1": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "English",
                "teacherId": "T30",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "T.Q",
                "teacherId": "T30",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Islamiat",
                "teacherId": "T30",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Hist/Geo",
                "teacherId": "T30",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Science",
                "teacherId": "T18",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C11",
                "className": "8th",
                "section": "A",
                "roomNo": "205",
                "subjectName": "Urdu",
                "teacherId": "T30",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C12": {
            "1": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "English",
                "teacherId": "T33",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Science",
                "teacherId": "T33",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Urdu",
                "teacherId": "T19",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Computer",
                "teacherId": "T33",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "Hist/Geo",
                "teacherId": "T33",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C12",
                "className": "8th",
                "section": "B",
                "roomNo": "206",
                "subjectName": "T.Q",
                "teacherId": "T33",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C13": {
            "1": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Science",
                "teacherId": "T17",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Math",
                "teacherId": "T17",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Computer",
                "teacherId": "T17",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Hist/Geo",
                "teacherId": "T17",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "Islamiat",
                "teacherId": "T20",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "T.Q",
                "teacherId": "T20",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C13",
                "className": "8th",
                "section": "C",
                "roomNo": "207",
                "subjectName": "English",
                "teacherId": "T17",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C14": {
            "1": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "English",
                "teacherId": "T31",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Hist/Geo",
                "teacherId": "T31",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Science",
                "teacherId": "T22",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Math",
                "teacherId": "T25",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "T.Q",
                "teacherId": "T19",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C14",
                "className": "7th",
                "section": "A",
                "roomNo": "208",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C15": {
            "1": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Science",
                "teacherId": "T18",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Urdu",
                "teacherId": "T35",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Math",
                "teacherId": "T18",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "T.Q",
                "teacherId": "T18",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C15",
                "className": "7th",
                "section": "B",
                "roomNo": "209",
                "subjectName": "Hist/Geo",
                "teacherId": "T19",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C16": {
            "1": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Math",
                "teacherId": "T22",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Science",
                "teacherId": "T22",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Islamiat",
                "teacherId": "T35",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "T.Q",
                "teacherId": "T_1792177082557",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Hist/Geo",
                "teacherId": "T35",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C16",
                "className": "7th",
                "section": "C",
                "roomNo": "305",
                "subjectName": "Urdu",
                "teacherId": "T22",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C17": {
            "1": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "English",
                "teacherId": "T23",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Hist/Geo",
                "teacherId": "T23",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Math",
                "teacherId": "T_1792177082557",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Urdu",
                "teacherId": "T19",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "Science",
                "teacherId": "T17",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C17",
                "className": "6th",
                "section": "A",
                "roomNo": "401",
                "subjectName": "T.Q",
                "teacherId": "T23",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C18": {
            "1": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Science",
                "teacherId": "T_1792177082557",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "T.Q",
                "teacherId": "T19",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Hist/Geo",
                "teacherId": "T33",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Urdu",
                "teacherId": "T30",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Computer",
                "teacherId": "T_1792177082557",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Islamiat",
                "teacherId": "T37",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C18",
                "className": "6th",
                "section": "B",
                "roomNo": "402",
                "subjectName": "Math",
                "teacherId": "T_1792177082557",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        },
        "C19": {
            "1": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Math",
                "teacherId": "T27",
                "periodId": 1,
                "startTime": "08:00 AM",
                "endTime": "08:40 AM"
            },
            "2": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Computer",
                "teacherId": "T34",
                "periodId": 2,
                "startTime": "08:40 AM",
                "endTime": "09:20 AM"
            },
            "3": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Science",
                "teacherId": "T27",
                "periodId": 3,
                "startTime": "09:20 AM",
                "endTime": "10:00 AM"
            },
            "4": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Islamiat",
                "teacherId": "T_1792177082557",
                "periodId": 4,
                "startTime": "10:00 AM",
                "endTime": "10:40 AM"
            },
            "5": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Hist/Geo",
                "teacherId": "T23",
                "periodId": 5,
                "startTime": "11:10 AM",
                "endTime": "11:50 AM"
            },
            "6": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "English",
                "teacherId": "T32",
                "periodId": 6,
                "startTime": "11:50 AM",
                "endTime": "12:30 PM"
            },
            "7": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "T.Q",
                "teacherId": "T19",
                "periodId": 7,
                "startTime": "12:30 PM",
                "endTime": "01:05 PM"
            },
            "8": {
                "classId": "C19",
                "className": "6th",
                "section": "C",
                "roomNo": "403",
                "subjectName": "Urdu",
                "teacherId": "T31",
                "periodId": 8,
                "startTime": "01:05 PM",
                "endTime": "01:40 PM"
            }
        }
    }
};

const DEFAULT_CIRCULAR_STAFF = [
    {
        "name": "Muhammad Akmal",
        "fullName": "Muhammad Akmal S/O Muhamamd Akram",
        "designation": "Dy. Headmaster",
        "combinedName": "Muhammad Akmal (Dy. Headmaster)"
    },
    {
        "name": "Muhammad Latif",
        "fullName": "Muhammad Latif  S/O Shair Muhammad",
        "designation": "S.S.T(SC)",
        "combinedName": "Muhammad Latif (S.S.T(SC))"
    },
    {
        "name": "Ghulam Shabbir",
        "fullName": "Ghulam Shabbir S/O Muhammad Saddique",
        "designation": "S.S.T(SC)",
        "combinedName": "Ghulam Shabbir (S.S.T(SC))"
    },
    {
        "name": "Abdul Rehman",
        "fullName": "Abdul Rehman S/O Muhammad Aziz",
        "designation": "S.S.T(SC)",
        "combinedName": "Abdul Rehman (S.S.T(SC))"
    },
    {
        "name": "Muhammad Siddique",
        "fullName": "Muhammad Siddique S/O Maskeen Ali",
        "designation": "S.S.T(SC)",
        "combinedName": "Muhammad Siddique (S.S.T(SC))"
    },
    {
        "name": "Nadeem Ahmed S/O Muhammad Latif",
        "fullName": "Nadeem Ahmed S/O Muhammad Latif",
        "designation": "SST (Arts)",
        "combinedName": "Nadeem Ahmed S/O Muhammad Latif (SST (Arts))"
    },
    {
        "name": "Shahzad Hassan Khosa",
        "fullName": "Shahzad Hassan Khosa S/O Ghulam Hussain",
        "designation": "SST(Sci)",
        "combinedName": "Shahzad Hassan Khosa (SST(Sci))"
    },
    {
        "name": "Sher Hussain",
        "fullName": "Sher Hussain S/O Sultan Muhammad",
        "designation": "SST (Arts)",
        "combinedName": "Sher Hussain (SST (Arts))"
    },
    {
        "name": "Qadeer Ahmad",
        "fullName": "Qadeer Ahmad S/O Muhammad Ibrahim",
        "designation": "SST (Arts)",
        "combinedName": "Qadeer Ahmad (SST (Arts))"
    },
    {
        "name": "Muhammad Naeem",
        "fullName": "Muhammad Naeem S/O Muhammad Asghar",
        "designation": "SST (Sci)",
        "combinedName": "Muhammad Naeem (SST (Sci))"
    },
    {
        "name": "Saif Ullah Khalid",
        "fullName": "Saif Ullah Khalid S/O Muhammad Khalid Farooq",
        "designation": "SST I.T",
        "combinedName": "Saif Ullah Khalid (SST I.T)"
    },
    {
        "name": "Javeed Iqbal",
        "fullName": "Javeed Iqbal S/O Abdul Islam",
        "designation": "SST (English)",
        "combinedName": "Javeed Iqbal (SST (English))"
    },
    {
        "name": "Amjad Iqbal",
        "fullName": "Amjad Iqbal S/O Mohammad Khan",
        "designation": "SST (Arts)",
        "combinedName": "Amjad Iqbal (SST (Arts))"
    },
    {
        "name": "Muhammad Imran",
        "fullName": "Muhammad Imran S/O Miraj Din",
        "designation": "SST (Sci)",
        "combinedName": "Muhammad Imran (SST (Sci))"
    },
    {
        "name": "Mumtaz Ahmad",
        "fullName": "Mumtaz Ahmad S/O Muhammad Abdul",
        "designation": "SSt (Eng)",
        "combinedName": "Mumtaz Ahmad (SSt (Eng))"
    },
    {
        "name": "Abdul Ghafoor",
        "fullName": "Abdul Ghafoor S/O Nawab Ali",
        "designation": "EST",
        "combinedName": "Abdul Ghafoor (EST)"
    },
    {
        "name": "Muhammad Nawaz Rehan",
        "fullName": "Muhammad Nawaz Rehan S/O Abdul Ghani",
        "designation": "EST",
        "combinedName": "Muhammad Nawaz Rehan (EST)"
    },
    {
        "name": "Hassan Raza",
        "fullName": "Hassan Raza S/O Muhammad sharif",
        "designation": "EST",
        "combinedName": "Hassan Raza (EST)"
    },
    {
        "name": "Abdul Hannan",
        "fullName": "Abdul Hannan S/O Muhmmad Sharif",
        "designation": "EST",
        "combinedName": "Abdul Hannan (EST)"
    },
    {
        "name": "Liaqat Ali Khan",
        "fullName": "Liaqat Ali Khan S/O Ibrar Ali Khan",
        "designation": "S.V",
        "combinedName": "Liaqat Ali Khan (S.V)"
    },
    {
        "name": "Nasrullah",
        "fullName": "Nasrullah S/O Faqirullah",
        "designation": "EST",
        "combinedName": "Nasrullah (EST)"
    },
    {
        "name": "Muhammad Manzoor",
        "fullName": "Muhammad Manzoor S/O Muhammad Sharif",
        "designation": "EST",
        "combinedName": "Muhammad Manzoor (EST)"
    },
    {
        "name": "Iftikhar Yaseen",
        "fullName": "Iftikhar Yaseen S/O Muhammad Sadiq",
        "designation": "EST",
        "combinedName": "Iftikhar Yaseen (EST)"
    },
    {
        "name": "Adalat Ali",
        "fullName": "Adalat Ali S/O Ghulam Haider",
        "designation": "EST",
        "combinedName": "Adalat Ali (EST)"
    },
    {
        "name": "Muhammad Iqbal",
        "fullName": "Muhammad Iqbal S/O Abdul Jabbar",
        "designation": "EST",
        "combinedName": "Muhammad Iqbal (EST)"
    },
    {
        "name": "Asim Majeed",
        "fullName": "Asim Majeed S/O Abdul Majeed",
        "designation": "EST",
        "combinedName": "Asim Majeed (EST)"
    },
    {
        "name": "Aqib Mahmood",
        "fullName": "Aqib Mahmood S/O Abdul Rauf",
        "designation": "PET",
        "combinedName": "Aqib Mahmood (PET)"
    },
    {
        "name": "Irfan Sandhu",
        "fullName": "Irfan Sandhu S/O Niamat Masih",
        "designation": "EST",
        "combinedName": "Irfan Sandhu (EST)"
    },
    {
        "name": "Muhammad Nazir",
        "fullName": "Muhammad Nazir S/O Muhammad Nawaz",
        "designation": "EST",
        "combinedName": "Muhammad Nazir (EST)"
    },
    {
        "name": "Nasir Ahmad",
        "fullName": "Nasir Ahmad S/O Muhammad Suleman",
        "designation": "EST",
        "combinedName": "Nasir Ahmad (EST)"
    },
    {
        "name": "Rashid Ahmad",
        "fullName": "Rashid Ahmad S/O Muhammad Siddique",
        "designation": "EST",
        "combinedName": "Rashid Ahmad (EST)"
    },
    {
        "name": "Faurrakh Minhas",
        "fullName": "Faurrakh Minhas S/O Muzaffar Ali",
        "designation": "EST",
        "combinedName": "Faurrakh Minhas (EST)"
    },
    {
        "name": "Muhammad Asif Javed",
        "fullName": "Muhammad Asif Javed S/o Allah Bakhash",
        "designation": "EST",
        "combinedName": "Muhammad Asif Javed (EST)"
    },
    {
        "name": "Zulqurnain Haider",
        "fullName": "Zulqurnain Haider S/O Moonas Ali",
        "designation": "EST",
        "combinedName": "Zulqurnain Haider (EST)"
    },
    {
        "name": "Shahnaz Ashiq",
        "fullName": "Shahnaz Ashiq D/o Ashiq Ali",
        "designation": "EST",
        "combinedName": "Shahnaz Ashiq (EST)"
    },
    {
        "name": "Naveed Anjum Butt",
        "fullName": "Naveed Anjum Butt S/O Naimat Ali",
        "designation": "EST",
        "combinedName": "Naveed Anjum Butt (EST)"
    },
    {
        "name": "Mustanir Hussain",
        "fullName": "Mustanir Hussain S/O M. Tariq Wasim",
        "designation": "EST",
        "combinedName": "Mustanir Hussain (EST)"
    },
    {
        "name": "Sana Shahzadi",
        "fullName": "Sana Shahzadi D/O M. Afzal ur Rehman",
        "designation": "EST (A.T)",
        "combinedName": "Sana Shahzadi (EST (A.T))"
    }
];
