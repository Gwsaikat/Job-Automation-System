// ============================================
// Candidate Profile — Single Source of Truth
// Auto-extracted from Saikat_Maji_Resume.tex
// All modules import from here, never hardcode
// ============================================

export interface CandidateProject {
  name: string;
  shortName: string;
  techStack: string[];
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  status: 'completed' | 'in-progress';
}

export interface CandidateExperience {
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export const CANDIDATE = {
  // ---- Identity ----
  name: 'Saikat Maji',
  email: 'saikatmaji200@gmail.com',
  phone: '+91-8509233422',
  linkedin: 'linkedin.com/in/saikat-maji-sde',
  github: 'github.com/GwSaikat',
  portfolio: 'frontend-snowy-eight-57.vercel.app',
  leetcode: 'leetcode.com/u/Alpha7679',

  // ---- Location & Authorization ----
  location: 'Kolkata, India',
  citizenship: 'Indian',
  workAuth: 'India only — no US/EU/UK work authorization',
  canWorkIn: ['India'],
  cannotWorkIn: ['US', 'EU', 'UK', 'Canada', 'Australia'] as string[],

  // ---- Education ----
  graduation: 'May 2026',
  graduationYear: 2026,
  degree: 'B.Tech Computer Science and Engineering',
  university: 'JIS University, Kolkata, India',
  enrollmentPeriod: 'Aug 2022 – May 2026',

  // ---- Technical Skills (structured) ----
  skills: {
    languages: ['JavaScript (ES6+)', 'TypeScript', 'C++', 'SQL', 'HTML5', 'CSS3'],
    frontend: ['React.js', 'Next.js'],
    backend: ['Node.js', 'Express.js', 'REST API Design', 'WebSocket'],
    ai: ['LangChain', 'Retrieval-Augmented Generation (RAG)', 'LLM APIs'],
    databases: ['MongoDB', 'Redis', 'MySQL'],
    infrastructure: ['JWT', 'bcrypt', 'Role-Based Access Control (RBAC)'],
    testing: ['Vitest', 'Jest'],
    devtools: ['Git', 'GitHub', 'Docker', 'CI/CD (Vercel, Render)', 'Postman'],
    coreCS: ['Data Structures & Algorithms', 'OOP', 'DBMS', 'Operating Systems', 'System Design'],
  },

  // ---- Projects ----
  projects: [
    {
      name: 'FlowForge — Real-Time Critical Path Orchestration Engine',
      shortName: 'FlowForge',
      techStack: ['LangChain', 'OpenAI API', 'Socket.io', 'WebSocket', 'Express.js', 'Redis', 'MongoDB', 'React.js', 'Vercel', 'Render'],
      description: 'Engineered a real-time CPM engine from scratch with Kahn\'s topological sort, DFS cycle detection, and CPM forward/backward-pass scheduling. Integrated LangChain/OpenAI for automated standup briefs and semantic dependency detection.',
      githubUrl: 'https://github.com/GwSaikat/FlowForge',
      liveUrl: 'https://client-one-bay-37.vercel.app/',
      status: 'completed',
    },
    {
      name: 'Banking System — Full-Stack Banking Application',
      shortName: 'Banking System',
      techStack: ['React.js', 'Express.js', 'Node.js', 'REST API', 'Vercel', 'Render'],
      description: 'Built a full-stack banking app with independently deployable frontend/backend modules and continuous delivery pipelines.',
      githubUrl: 'https://github.com/GwSaikat/Banking-System',
      liveUrl: 'https://banking-system-sepia.vercel.app',
      status: 'completed',
    },
    {
      name: 'CropAI — AI-Powered Crop Disease Detection Platform',
      shortName: 'CropAI',
      techStack: ['TensorFlow.js', 'LLM API', 'Supabase', 'PostgreSQL', 'Socket.io', 'Leaflet.js', 'React.js'],
      description: 'Built a crop disease detection platform with in-browser TensorFlow.js, LLM treatment recommendations, Supabase auth, and disease mapping.',
      githubUrl: 'https://github.com/GwSaikat/CropAI',
      liveUrl: 'https://cropai-app.vercel.app',
      status: 'completed',
    },
    {
      name: 'TrackChat — Real-Time Chat & Device-Tracking App',
      shortName: 'TrackChat',
      techStack: ['MERN', 'Socket.io', 'WebSocket', 'Leaflet.js', 'HTML5 Geolocation API', 'MongoDB', 'React.js', 'Node.js', 'Express.js', 'JWT'],
      description: 'Building a real-time chat app with live device location tracking, interactive maps, message persistence, read receipts, and JWT refresh token auth.',
      status: 'in-progress',
    },
  ] as CandidateProject[],

  // ---- Experience ----
  experience: [
    {
      title: 'Freelance Full-Stack Developer',
      company: 'Self-Employed',
      location: 'Remote',
      period: '2025 – Present',
      highlights: [
        'Designed and deployed full-stack management systems for two clients (gym and diagnostic center)',
        'Built responsive, role-based web apps digitizing scheduling, client records, daily operations',
        'Owned full development lifecycle — requirements, architecture, development, testing, deployment',
      ],
    },
    {
      title: 'Virtual Internship — Full-Stack Development',
      company: 'Thiranex',
      location: 'Remote',
      period: '2025',
      highlights: [
        'Built Task Management Application with task creation, assignment, status tracking',
        'Developed E-Commerce Web Application with product browsing, cart, order management',
        'Created Blog Platform with threaded comments and content publishing',
      ],
    },
    {
      title: 'Software Engineering Job Simulation',
      company: 'Forage',
      location: 'Remote',
      period: '2025',
      highlights: [
        'Completed virtual job simulation for Y Combinator–style startup',
        'Implemented frontend improvements from user feedback and new backend features',
        'Analyzed product releases to evaluate user impact and guide development',
      ],
    },
  ] as CandidateExperience[],

  // ---- Certifications ----
  certifications: [
    'Cisco Certified Network Associate — Collaboration (CCNA-C), Simplilearn — Jul 2024',
    'Generative AI for Developers (Advanced), Google Skills — In Progress',
  ],

  // ---- Role Preferences ----
  acceptRoleTitles: [
    'full stack developer', 'fullstack developer', 'full-stack developer', 'full stack', 'fullstack',
    'mern stack developer', 'mern developer', 'mern stack', 'mern',
    'backend developer', 'back-end developer', 'back end developer', 'backend engineer',
    'ai full stack developer', 'ai fullstack developer', 'ai engineer', 'ai developer',
    'software engineer', 'software developer', 'sde', 'sde 1', 'sde-1', 'sde i', 'associate software engineer',
    'graduate trainee', 'graduate engineer trainee', 'get', 'fresher', 'freshers', 'trainee', 'apprentice',
    'frontend developer', 'front-end developer', 'react developer', 'node developer', 'typescript developer',
  ],

  rejectRoleTitles: [
    'senior', 'sr.', 'sr', 'staff', 'architect', 'manager', 'lead', 'principal',
    'director', 'vp', 'head of', 'chief', 'mid-level', 'mid level', 'experienced',
  ],

  acceptExperienceLevels: [
    '0', 'fresher', 'freshers', 'graduate', 'campus', 'entry level', 'entry-level',
    'associate', 'new grad', 'new graduate', '0-1', '0-1 year', '0-1 yrs', '1 year',
    'junior', 'intern', 'trainee', 'apprentice',
  ],

  rejectExperienceLevels: [
    '2+', '3+', '4+', '5+', '7+', '10+', '2-3', '2-4', '3-5', '5-7', '5-10', '7-10',
    'senior', 'mid-senior', 'experienced',
  ],

  // ---- Visa/Auth Rejection Keywords ----
  visaRejectKeywords: [
    'us citizen only', 'u.s. citizen', 'us citizens only', 'united states citizen',
    'eu citizen', 'eu work permit', 'european work', 'right to work in the uk',
    'uk work permit', 'uk visa', 'clearance required', 'security clearance',
    'must be authorized to work in the united states',
    'must be authorized to work in the us',
    'visa sponsorship is not available', 'no visa sponsorship',
    'canadian citizen', 'australian citizen', 'work permit required',
    'must have existing right to work',
  ],
} as const;

// ---- Computed: Flat searchable skill keywords ----

function buildSkillKeywordSet(): Set<string> {
  const keywords = new Set<string>();
  const allSkills = Object.values(CANDIDATE.skills).flat();

  for (const skill of allSkills) {
    // Add the full skill name (lowercased)
    keywords.add(skill.toLowerCase());

    // Add individual words for fuzzy matching
    const words = skill.toLowerCase().replace(/[()]/g, '').split(/[\s/,|]+/);
    for (const word of words) {
      if (word.length > 2) keywords.add(word);
    }
  }

  // Add project tech stacks
  for (const project of CANDIDATE.projects) {
    for (const tech of project.techStack) {
      keywords.add(tech.toLowerCase());
    }
  }

  return keywords;
}

export const CANDIDATE_SKILL_KEYWORDS = buildSkillKeywordSet();

// ---- Helper: Get a concise skills summary for AI prompts ----

export function getSkillsSummary(): string {
  return `Core Stack: MERN (MongoDB, Express.js, React.js, Node.js), TypeScript, Next.js
AI/LLM: LangChain, RAG, OpenAI API integration
Real-time: Socket.io, WebSocket, Redis
Infra: Docker basics, JWT/bcrypt/RBAC auth, Git, CI/CD, Vercel/Render
CS Fundamentals: DSA, OOP, DBMS, System Design`;
}

// ---- Helper: Get project summaries for AI prompts ----

export function getProjectsSummary(): string {
  return CANDIDATE.projects
    .map(p => `${p.shortName}: ${p.description} [${p.techStack.slice(0, 5).join(', ')}]`)
    .join('\n');
}

// ---- Helper: Get experience summary for AI prompts ----

export function getExperienceSummary(): string {
  return CANDIDATE.experience
    .map(e => `${e.title} at ${e.company} (${e.period}): ${e.highlights[0]}`)
    .join('\n');
}
