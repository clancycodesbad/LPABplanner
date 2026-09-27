// Add past semesters here chronologically (oldest at the top, newest at the bottom).
// The system will read this file backwards to find the most recent exam date.
// Each term's entries are also compared against each other to flag pairs of
// subjects that shared an exam slot as possible clashes in future semesters,
// so include every subject examined that term.

export const historicalExams = {
    'summer2025': [
        { id: '18', name: 'Conflict of Laws', exam: '3 Mar 2026, 9.00 am' },
        { id: '19', name: 'Family Law', exam: '4 Mar 2026, 1.45 pm' },
        { id: '21', name: 'Industrial Law', exam: '5 Mar 2026, 9.00 am' },
        { id: '25', name: 'Competition & Consumer Law', exam: '6 Mar 2026, 1.45 pm' },
        { id: '27', name: 'Health Law', exam: '9 Mar 2026, 9.00 am' }
    ],
    'winter2026': [
        { id: '01', name: 'Foundations of Law', exam: '8 Sep 2026, 9.00 am' },
        { id: '02', name: 'Criminal Law & Procedure', exam: '4 Sep 2026, 9.00 am' },
        { id: '03', name: 'Torts', exam: '9 Sep 2026, 9.00 am' },
        { id: '04', name: 'Contracts', exam: '7 Sep 2026, 1.45 pm' },
        { id: '05', name: 'Real Property', exam: '10 Sep 2026, 9.00 am' },
        { id: '06', name: 'Australian Constitutional Law', exam: '3 Sep 2026, 9.00 am' },
        { id: '07', name: 'Equity', exam: '7 Sep 2026, 9.00 am' },
        { id: '08', name: 'Commercial Transactions', exam: '4 Sep 2026, 1.45 pm' },
        { id: '09', name: 'Administrative Law', exam: '3 Sep 2026, 1.45 pm' },
        { id: '10', name: 'Law of Associations', exam: '9 Sep 2026, 1.45 pm' },
        { id: '11', name: 'Evidence', exam: '8 Sep 2026, 1.45 pm' },
        { id: '12', name: 'Taxation & Revenue Law', exam: '7 Sep 2026, 9.00 am' },
        { id: '13', name: 'Succession', exam: '3 Sep 2026, 1.45 pm' },
        { id: '14', name: 'Conveyancing', exam: '9 Sep 2026, 9.00 am' },
        { id: '15', name: 'Practice & Procedure', exam: '4 Sep 2026, 1.45 pm' },
        { id: '16', name: 'Insolvency', exam: '7 Sep 2026, 1.45 pm' },
        { id: '17', name: 'Legal Ethics', exam: '10 Sep 2026, 1.45 pm' },
        { id: '20', name: 'Planning & Environmental Law', exam: '4 Sep 2026, 9.00 am' },
        { id: '22', name: 'Intellectual Property', exam: '8 Sep 2026, 9.00 am' },
        { id: '23', name: 'Public International Law', exam: '8 Sep 2026, 1.45 pm' },
        { id: '24', name: 'Jurisprudence', exam: '9 Sep 2026, 1.45 pm' },
        { id: '26', name: 'Advanced Statutory Interpretation', exam: '10 Sep 2026, 9.00 am' }
    ]
};