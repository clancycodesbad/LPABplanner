// data/stats/winter2026.js
// Source: LPAB Diploma in Law — September (Winter) 2026 Examinations Statistics
// Subjects absent from this file were not examined that term.
//
// Fields per subject:
//   sat          — total candidates who sat
//   fail         — % who failed              (< 50 marks)
//   pass         — % who passed              (50–64)
//   credit       — % who achieved Credit     (65–74)
//   distinction  — % who achieved Distinction (75–84)
//   hd           — % who achieved High Distinction (85+)
//
// All percentages are as published; they may not sum to exactly 100
// due to rounding in the source document. The source gives no
// cohort-level percentages, only the total who sat.

export const winter2026Stats = {
    term:              'winter2026',
    label:             'Winter 2026',
    gradingScheme:     'v2',
    totalSat:          1961,
    subjects: {
        '01': { sat: 151, fail: 33.8, pass: 38.4, credit: 20.5, distinction: 6.6,  hd: 0.7 },
        '02': { sat: 146, fail: 11.0, pass: 34.9, credit: 39.0, distinction: 11.6, hd: 3.4 },
        '03': { sat: 115, fail: 7.8,  pass: 57.4, credit: 33.0, distinction: 1.7,  hd: 0.0 },
        '04': { sat: 124, fail: 20.2, pass: 62.1, credit: 16.9, distinction: 0.8,  hd: 0.0 },
        '05': { sat: 164, fail: 1.2,  pass: 17.1, credit: 57.3, distinction: 24.4, hd: 0.0 },
        '06': { sat: 229, fail: 10.5, pass: 41.0, credit: 34.5, distinction: 14.0, hd: 0.0 },
        '07': { sat: 144, fail: 37.5, pass: 50.0, credit: 9.7,  distinction: 2.8,  hd: 0.0 },
        '08': { sat: 66,  fail: 4.5,  pass: 59.1, credit: 31.8, distinction: 4.5,  hd: 0.0 },
        '09': { sat: 123, fail: 8.9,  pass: 38.2, credit: 40.7, distinction: 10.6, hd: 1.6 },
        '10': { sat: 92,  fail: 13.0, pass: 47.8, credit: 31.5, distinction: 6.5,  hd: 1.1 },
        '11': { sat: 83,  fail: 9.6,  pass: 59.0, credit: 26.5, distinction: 4.8,  hd: 0.0 },
        '12': { sat: 50,  fail: 21.6, pass: 64.7, credit: 9.8,  distinction: 3.9,  hd: 0.0 },
        '13': { sat: 36,  fail: 5.6,  pass: 33.3, credit: 38.9, distinction: 22.2, hd: 0.0 },
        '14': { sat: 48,  fail: 10.4, pass: 33.3, credit: 47.9, distinction: 8.3,  hd: 0.0 },
        '15': { sat: 90,  fail: 4.4,  pass: 38.9, credit: 34.4, distinction: 18.9, hd: 3.3 },
        '16': { sat: 38,  fail: 5.3,  pass: 26.3, credit: 39.5, distinction: 28.9, hd: 0.0 },
        '17': { sat: 121, fail: 16.5, pass: 46.3, credit: 35.5, distinction: 1.7,  hd: 0.0 },
        '20': { sat: 9,   fail: 0.0,  pass: 0.0,  credit: 88.9, distinction: 11.1, hd: 0.0 },
        '22': { sat: 33,  fail: 0.0,  pass: 24.2, credit: 48.5, distinction: 27.3, hd: 0.0 },
        '23': { sat: 21,  fail: 0.0,  pass: 9.5,  credit: 38.1, distinction: 52.4, hd: 0.0 },
        '24': { sat: 55,  fail: 0.0,  pass: 32.7, credit: 45.5, distinction: 21.8, hd: 0.0 },
        '26': { sat: 22,  fail: 0.0,  pass: 31.8, credit: 54.5, distinction: 13.6, hd: 0.0 },
    }
};
