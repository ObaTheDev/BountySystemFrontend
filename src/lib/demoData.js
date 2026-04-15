export const currentUser = {
    id: "STU-10293",
    name: "Oluwatobi",
    fullName: "Oluwatobi Olatunji",
    department: "Computer Science",
    level: "400L",
    email: "tobi.olatunji@university.edu.ng",
    phone: "+234 812 345 6789",
    joined: "September 2022"
};

export const dashboardStats = {
    weeklyEarnings: "₦12,500",
    pendingTasks: 2,
    totalEarned: "₦45,000",
    completedBounties: 15
};

export const availableTasks = [
    {
        id: 1,
        title: "Campus Survey Participation",
        department: "Student Affairs",
        description: "Complete a 10-minute survey about campus facilities",
        reward: "₦1,500"
    },
    {
        id: 2,
        title: "Library Book Sorting",
        department: "Main Library",
        description: "Assist with sorting books in the science section for 2 hours",
        reward: "₦5,000"
    },
    {
        id: 3,
        title: "IT Helpdesk Assistant",
        department: "ICT Center",
        description: "Help register new students on the university Wi-Fi network.",
        reward: "₦3,000"
    }
];

export const walletData = {
    balance: "₦12,500",
    transactions: [
        {
            id: "TRX-001",
            title: "Completed: Library Sorting",
            date: "04 Apr 2026",
            amount: "+₦5,000",
            type: "credit",
        },
        {
            id: "TRX-002",
            title: "Withdrawal to Bank",
            date: "01 Apr 2026",
            amount: "-₦10,000",
            type: "debit",
        }
    ]
};

export const currentDepartment = {
    id: "DEPT-5001",
    name: "Student Affairs",
    adminName: "Dr. Sarah Johnson",
    email: "student.affairs@university.edu.ng",
    budget: "₦150,000",
};

export const departmentStats = {
    activeBounties: 4,
    completedThisMonth: 12,
    totalSpent: "₦35,000",
    studentsEngaged: 8
};

export const departmentBounties = [
    {
        id: 101,
        title: "Campus Survey Participation",
        status: "Active",
        applicants: 15,
        budget: "₦1,500/student",
        datePosted: "01 Apr 2026"
    },
    {
        id: 102,
        title: "Event Ushering (Matriculation)",
        status: "Draft",
        applicants: 0,
        budget: "₦5,000/student",
        datePosted: "Pending"
    }
];

export const myBountiesData = [
    {
        id: 201,
        title: "Library Book Sorting",
        status: "In Progress",
        department: "Main Library",
        reward: "₦5,000",
        dateAccepted: "03 Apr 2026",
        dueDate: "06 Apr 2026"
    },
    {
        id: 202,
        title: "Hostel Network Testing",
        status: "Completed",
        department: "ICT Center",
        reward: "₦7,500",
        dateAccepted: "25 Mar 2026",
        dueDate: "28 Mar 2026"
    }
];

export const leaderboardData = [
    { rank: 1, name: "David O.", points: 450, bounties: 32 },
    { rank: 2, name: "Oluwatobi O.", points: 420, bounties: 28 },
    { rank: 3, name: "Sarah J.", points: 390, bounties: 25 },
    { rank: 4, name: "Michael T.", points: 310, bounties: 18 },
    { rank: 5, name: "Amaka N.", points: 280, bounties: 15 },
];

export const faqData = [
    {
        question: "How do I withdraw my earnings?",
        answer: "You can withdraw your earnings directly to your registered bank account by going to your Wallet and clicking 'Withdraw from Wallet'."
    },
    {
        question: "What happens if I miss a deadline?",
        answer: "Missing deadlines will reduce your reliability score. If you must miss a deadline, we recommend reaching out to the department contact to request an extension."
    },
    {
        question: "How are bounties approved?",
        answer: "Departments review submissions within 48 hours. Once approved, the funds are automatically released to your CampusGig wallet."
    }
];
