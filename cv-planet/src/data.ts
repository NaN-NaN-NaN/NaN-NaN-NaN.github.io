export type CVLink = {
  label: string;
  href: string;
  icon: "github" | "mail" | "phone" | "map-pin" | "file-text" | "external-link";
};

export type CVRole = {
  company: string;
  role: string;
  period: string;
  location: string;
  points: string[];
};

export type CVSection = {
  id: string;
  index: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  signTitle: string;
  signLines: string[];
  signal: string;
  landmark: string;
  landmarkCity: string;
  period?: string;
  location?: string;
  lead: string;
  points: string[];
  entries?: CVRole[];
  tags: string[];
  color: string;
  links?: CVLink[];
};

export const profile = {
  name: "Nan Fang-Ying",
  role: "Engineering Leader",
  location: "Zürich, Switzerland",
  address: "Hofackerstr 25, 8032 Zürich",
  email: "nanfangying1@gmail.com",
  phone: "+41 76 796 5606",
  github: "https://github.com/NaN-NaN-NaN",
  visa: "Swiss Permit B",
  languages: ["English · Professional", "Chinese · Native", "German · Basic"],
};

export const sections: CVSection[] = [
  {
    id: "personal",
    index: "01",
    navLabel: "Personal",
    eyebrow: "PERSONAL + LANGUAGES",
    title: "Personal & Languages",
    signTitle: "NAN FANG-YING",
    signLines: ["ZÜRICH · SWISS PERMIT B", "EN · ZH · DE"],
    signal: "PERMIT B",
    landmark: "Taipei 101",
    landmarkCity: "Taipei",
    lead: "Engineering Leader based in Zürich, Switzerland, with professional English, native Chinese and basic German.",
    points: [
      "Address: Hofackerstr 25, 8032 Zürich",
      "Email: nanfangying1@gmail.com",
      "Phone: +41 76 796 5606",
      "Swiss VISA: Permit B",
      "English - Professional proficiency",
      "Chinese - Native",
      "German - Basic",
    ],
    tags: ["Zürich", "Swiss Permit B", "English", "Chinese", "German"],
    color: "#46e6ff",
    links: [
      { label: "Email", href: `mailto:${profile.email}`, icon: "mail" },
      { label: "Call", href: `tel:${profile.phone.replace(/\s/g, "")}`, icon: "phone" },
      { label: "GitHub", href: profile.github, icon: "github" },
      { label: "PDF CV", href: "./CV_NanFangYing.pdf", icon: "file-text" },
    ],
  },
  {
    id: "summary",
    index: "02",
    navLabel: "Summary",
    eyebrow: "SUMMARY",
    title: "Engineering Leader",
    signTitle: "SUMMARY",
    signLines: ["9+ YEARS · PRODUCT SYSTEMS", "FINTECH · HEALTHTECH · AI"],
    signal: "9+ YEARS",
    landmark: "Eiffel Tower",
    landmarkCity: "Paris",
    lead:
      "Engineering Leader with 9+ years of hands-on experience building scalable platforms and leading high-performing teams in FinTech and HealthTech.",
    points: [
      "Drove multi-million euro AUM growth through mission-critical product delivery.",
      "Improved lead-to-user conversion by 10-15%.",
      "Bridges technical execution with business priorities and product outcomes.",
      "Delivers secure, high-performance and fully compliant systems.",
      "Applies AI-enhanced workflows to improve engineering velocity and code quality.",
    ],
    tags: ["Engineering Leadership", "Product Engineering", "FinTech", "HealthTech", "Applied AI"],
    color: "#56f5d0",
  },
  {
    id: "credentials",
    index: "03",
    navLabel: "Credentials",
    eyebrow: "CERTIFICATION + EDUCATION",
    title: "Credentials",
    signTitle: "CREDENTIALS",
    signLines: ["AWS CERTIFIED", "TWO MASTER'S DEGREES"],
    signal: "AWS SAA",
    landmark: "Empire State Building",
    landmarkCity: "New York",
    lead: "Cloud architecture certification backed by graduate education in geo information and computer-aided engineering.",
    points: [
      "AWS Certified Solutions Architect - Associate",
      "Technische Universität Berlin - M.S. Geo Information, 2013-2018, Germany",
      "National Taiwan University - M.S. Computer Aided Engineering, 2010-2012, Taiwan",
    ],
    tags: ["AWS Certified", "Cloud Architecture", "TU Berlin", "NTU", "M.S."],
    color: "#ffcc56",
  },
  {
    id: "experience",
    index: "04",
    navLabel: "Experience",
    eyebrow: "PROFESSIONAL EXPERIENCE",
    title: "Professional Experience",
    signTitle: "EXPERIENCE",
    signLines: ["AHEAD · MOONFARE · PLUS", "HEROBEAR · NOKIA HERE"],
    signal: "5 ROLES",
    landmark: "Brandenburg Gate",
    landmarkCity: "Berlin",
    lead: "A career spanning health data, FinTech platforms, international product delivery, mobile applications and release engineering.",
    points: [],
    entries: [
      {
        company: "Ahead Health",
        role: "Senior Product Engineer",
        period: "Feb 2026 - Apr 2026",
        location: "Zürich",
        points: [
          "Optimized Blood and MRI report data pipelines using BAML on GCP.",
          "Planned and implemented a Membership system MVP with Supabase rapid prototyping.",
        ],
      },
      {
        company: "Moonfare",
        role: "Engineering Manager / Staff Engineer",
        period: "Feb 2020 - Sep 2025",
        location: "Berlin",
        points: [
          "Led 8+ engineers across full-stack domains and aligned technical roadmaps with business stakeholders.",
          "Improved lead-to-user conversion by 10-15%, drove multi-million euro AUM growth and saved 200+ hours annually.",
          "Improved React render time by 20% and reduced critical API latency by 15-20%.",
          "Designed 5+ event-driven microservices using DDD, AWS Lambda and SQS.",
          "Established CI/CD, testing strategies and AI-enhanced engineering workflows.",
        ],
      },
      {
        company: "PlusDental",
        role: "Software Engineer",
        period: "Jul 2018 - Jan 2020",
        location: "Berlin",
        points: [
          "Migrated the platform from MERN to Next.js and GraphQL and rebuilt the React Native app.",
          "Implemented i18n across 5 countries reaching 20K+ users.",
          "Improved PageSpeed from 50 to 80+ and TTT to under 800ms.",
        ],
      },
      {
        company: "HeroBear",
        role: "Lead Full-Stack Software Engineer",
        period: "Apr 2016 - Nov 2017",
        location: "Berlin",
        points: ["Led end-to-end app development with Node.js, React Native and MongoDB."],
      },
      {
        company: "Nokia, HERE",
        role: "QA / Release Engineer (Intern)",
        period: "May 2015 - Mar 2017",
        location: "Berlin",
        points: ["Supported E2E tests, release and development for a map project with Samsung."],
      },
    ],
    tags: ["Leadership", "Product Engineering", "Full-Stack", "FinTech", "HealthTech", "Release"],
    color: "#ff4fd8",
  },
  {
    id: "projects",
    index: "05",
    navLabel: "Projects",
    eyebrow: "PROJECTS",
    title: "AI Projects",
    signTitle: "PROJECTS",
    signLines: ["LETTERON · RAGEASY", "OCR · RAG · LLMS"],
    signal: "2 BUILDS",
    landmark: "Atomium",
    landmarkCity: "Brussels",
    lead: "Focused AI products that transform documents into structured, searchable information.",
    points: [
      "LetterOn - AI OCR app for physical letter extraction and classification using FastAPI and LLMs.",
      "RagEasy - RAG agent for natural-language queries over local PDFs using Python, LangChain and ChromaDB.",
    ],
    tags: ["FastAPI", "LLMs", "OCR", "RAG", "LangChain", "ChromaDB", "Python"],
    color: "#ff7657",
    links: [
      {
        label: "LetterOn",
        href: "https://github.com/NaN-NaN-NaN/LetterON-Google-AI-Sutdio",
        icon: "github",
      },
      { label: "RagEasy", href: "https://github.com/NaN-NaN-NaN/easy-rag", icon: "github" },
    ],
  },
  {
    id: "skills",
    index: "06",
    navLabel: "Skills",
    eyebrow: "SKILLS",
    title: "Skills",
    signTitle: "SKILLS",
    signLines: ["FULL-STACK · CLOUD · DATA", "LEADERSHIP · AGENTIC AI"],
    signal: "TOOLKIT",
    landmark: "Matterhorn",
    landmarkCity: "Zermatt",
    lead: "A hands-on toolkit for product engineering, platform architecture, technical leadership and applied AI.",
    points: [
      "Languages: TypeScript, JavaScript, SQL, Python and C++.",
      "Frameworks and Tools: React, Next.js, Node.js, NestJS, FastAPI and GraphQL.",
      "Infrastructure: AWS, GCP, GitHub Actions, CI/CD and Terraform.",
      "Databases: PostgreSQL, MySQL, MongoDB, DynamoDB and Redis.",
      "Management: Tech Roadmap, Agile, Mentoring, Security and Prioritisation.",
      "AI: Agentic Workflows, Skills, RAG, Prompt Engineering and Harness Engineering.",
    ],
    tags: ["TypeScript", "React", "Node.js", "AWS", "GCP", "Databases", "Agentic AI"],
    color: "#9f7cff",
  },
];
