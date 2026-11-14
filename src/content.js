// Edit this file to make the portfolio yours.
export const content = {
  name: 'Hasan Khair Adzman',
  roles: ['Graphic Designer', 'Full-Stack Engineer', 'Aerospace Engineer', 'AI / ML Researcher', 'Founder & CEO'],
  tagline:
    "Aerospace engineer turned computer scientist, based in Kuala Lumpur. I research graph neural networks and NLP, design visuals, and build products that solve people's problems. Let's be partners.",
  email: 'hasankhair77@gmail.com',

  about: [
    "I hold a Bachelor's in Aerospace Engineering and a Master's in Computer Science and Information Technology, both from the International Islamic University Malaysia (IIUM).",
    'As a Graduate Research Assistant at IIUM, I built a hybrid GNN + ISkyline framework for skyline query processing on large, incomplete graphs, and a framework for automated test-case generation for cross-platform mobile apps using NLP.',
    "Today I run Sanify Enterprise and MY Bijak Academy, building products and services for companies and individuals. I also bring 7+ years of hands-on sales, marketing and copywriting experience.",
  ],
  stats: [
    { value: '72%', label: 'Accuracy gain (GNN research)' },
    { value: '2', label: 'Publications' },
    { value: '2', label: 'Businesses founded' },
  ],

  experience: [
    {
      role: 'Chief Executive Officer & Founder',
      org: 'Sanify Enterprise',
      period: 'Sep 2026 – Present',
      location: 'Bandar Baru Bangi, Selangor',
      points: ["Build products and services that solve companies' and people's problems."],
    },
    {
      role: 'Entrepreneur & Founder',
      org: 'MY Bijak Academy',
      period: 'Jan 2026 – Present',
      location: 'Gombak, Selangor',
      points: ['Registered business (No. 003815213-P).'],
    },
    {
      role: 'Graduate Research Assistant',
      org: 'International Islamic University Malaysia',
      period: 'Jan 2026 – Jun 2026',
      location: 'Gombak, Selangor',
      points: [
        'Researched a framework for automated test-case generation using NLP for cross-platform mobile apps.',
        'Systematic literature review of 149 studies; identified 70 research gaps.',
      ],
    },
    {
      role: 'Graduate Research Assistant',
      org: 'International Islamic University Malaysia',
      period: 'Jan 2024 – Jun 2025',
      location: 'Gombak, Selangor',
      points: [
        'Developed a GNN + ISkyline algorithm for skyline query processing.',
        'Improved accuracy by 72%, F1-score by 71% and AUC-ROC by 49% over standalone ISkyline on CoIL 2000.',
        'Handled up to 90% attribute-level incompleteness on synthetic data and 20% on real-world data.',
      ],
    },
    {
      role: 'Intern (Aerospace Engineer)',
      org: 'UAV Lab, UniKL MIAT',
      period: 'Aug 2020 – Oct 2020',
      location: 'Sepang, Selangor',
      points: [
        'Ran CFD simulations on aerofoils in Ansys and wind-tunnel tests on wings and flows.',
        'Helped two lecturers and six students design and analyse a drone.',
      ],
    },
    {
      role: 'Sales Agent & Marketer',
      org: 'Akademi Latihan Dan Keusahawanan Sifu Linda',
      period: 'Jun 2019 – Present',
      location: 'Sungai Buloh, Selangor',
      points: ["Wrote copy and marketed the academy's training, courses and consultancy via WhatsApp and Facebook."],
    },
    {
      role: 'Sales Representative',
      org: 'RF3 World',
      period: 'Dec 2021 – Present',
      location: 'Putra Heights, Selangor',
      points: ["Sales, networking and marketing of RF3 World's products."],
    },
  ],
  otherExperience:
    'Also: Amway Agent, Ampang 160 Villa (housekeeper and Facebook page admin), WOK HEY Singapore (management trainee), KyoChon, KFC, GoGet.my, and student leadership roles at IIUM Student Union, PERINTIS, ENGINIUS and IIUM Taekwondo Club.',

  education: [
    { degree: "Master's Degree, Computer Science and Information Technology", school: 'International Islamic University Malaysia', period: '2023 – 2025' },
    { degree: "Bachelor's Degree, Aerospace Engineering", school: 'International Islamic University Malaysia', period: '2017 – 2021' },
    { degree: 'Foundation in Engineering and ICT', school: 'International Islamic University Malaysia', period: '2016 – 2017' },
    { degree: 'SPM (Science Stream)', school: 'Maahad Integrasi Tahfiz Sains dan Teknologi, Istana Bandar, Banting', period: '' },
  ],

  projects: [
    {
      title: 'GNN + ISkyline Skyline Query Processing',
      description:
        'Hybrid machine learning framework that pairs Graph Neural Networks with ISkyline for large, incomplete graphs. Evaluated on CoIL 2000, NBA Stats and MovieLens.',
      tags: ['Python', 'PyTorch', 'scikit-learn', 'GNN'],
      link: null,
      repo: null,
      color: '#7c5cff',
    },
    {
      title: 'NLP Test-Case Generation Framework',
      description:
        'Framework for automated test-case generation for cross-platform mobile apps using natural language processing, backed by a systematic literature review of 149 studies.',
      tags: ['NLP', 'Mobile Testing', 'Research'],
      link: 'https://drive.google.com/file/d/1GAxWgKnaAWsP74Y1JYifDiNfSD41Xd2i/view?usp=sharing',
      linkLabel: 'Manuscript ↗',
      repo: null,
      color: '#00d4ff',
    },
    {
      title: 'Publications',
      description:
        '"Enhancing Skyline Query Processing on Large and Incomplete Graphs with Graph Neural Networks: A Hybrid Machine Learning Approach" and "GNN-Based Skyline Query Processing for Large-Scale and Incomplete Graphs".',
      tags: ['Graph Neural Networks', 'Databases', 'Machine Learning'],
      link: null,
      repo: null,
      color: '#ff4d8d',
    },
    {
      title: 'UAV Aerofoil & Drone Analysis',
      description:
        'CFD simulations of aerofoils in Ansys, wind-tunnel testing of wings under laminar and turbulent flow, and drone design with the UniKL MIAT UAV Lab.',
      tags: ['Ansys CFD', 'Wind Tunnel', 'Aerospace'],
      link: null,
      repo: null,
      color: '#38f5a0',
    },
  ],

  skills: [
    'Artificial Intelligence', 'Machine Learning', 'Graph Neural Networks', 'NLP', 'Generative AI',
    'Python', 'PyTorch', 'scikit-learn', 'pandas', 'NumPy', 'Jupyter', 'Matplotlib / Seaborn',
    'HTML', 'Ansys CFD', 'Graphic Design', 'Canva', 'Copywriting', 'Digital Marketing', 'Sales',
  ],
  certifications: [
    'Quote It Up! Your First Android App With API Calls',
    'Introduction to AI-powered Information Extraction Concepts',
    'Introduction to Generative AI',
    'Contemporary Skills to Master Human Resources Management',
    'Cybersecurity Masterclass Jobs And Skills',
  ],

  socials: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/hasan-khair-adzman' },
    { label: 'Email', url: 'mailto:hasankhair77@gmail.com' },
  ],
};
