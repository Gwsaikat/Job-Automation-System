// ============================================
// Master CV HTML/CSS & LaTeX Template — Section 5.2
// ATS-clean, single-page design matching Saikat_Maji_Resume.tex
// AI-editable regions marked with comments
// ============================================

export const MASTER_CV_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Saikat Maji - Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 10px;
    line-height: 1.35;
    color: #192a44;
    background: white;
  }

  .resume {
    width: 210mm;
    min-height: 297mm;
    max-height: 297mm;
    padding: 10mm 14mm;
    overflow: hidden;
  }

  /* Header */
  .header { text-align: center; margin-bottom: 6px; border-bottom: 1.5px solid #192a44; padding-bottom: 6px; }
  .header h1 { font-size: 18px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #192a44; margin-bottom: 3px; }
  .header .subtitle { font-size: 10.5px; font-weight: 500; color: #192a44; margin-bottom: 3px; }
  .header .contact { font-size: 9px; color: #143c6e; }
  .header .contact a { color: #143c6e; text-decoration: none; }

  /* Section */
  .section { margin-bottom: 5px; }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #192a44;
    padding-bottom: 2px;
    margin-bottom: 4px;
    color: #192a44;
  }

  /* Summary */
  .summary { font-size: 9.5px; color: #222; }

  /* Skills */
  .skills-grid { font-size: 9.5px; }
  .skill-row { display: flex; margin-bottom: 1.5px; }
  .skill-label { font-weight: 700; min-width: 130px; color: #192a44; }
  .skill-value { color: #222; }

  /* Experience / Projects */
  .entry { margin-bottom: 4px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 700; font-size: 10px; color: #192a44; }
  .entry-meta { font-size: 9px; color: #555; font-style: italic; }
  .entry-subtitle { font-size: 9px; color: #143c6e; font-style: italic; margin-bottom: 1px; }
  .entry ul { padding-left: 14px; font-size: 9.5px; color: #222; }
  .entry li { margin-bottom: 1px; }

  /* Education & Certs */
  .edu-line { font-size: 9.5px; color: #222; }
  .edu-line strong { font-weight: 700; color: #192a44; }

  /* Links */
  .project-links { font-size: 8.5px; color: #143c6e; }
  .project-links a { color: #143c6e; text-decoration: none; font-weight: 500; }
  
  /* Hidden ATS Layer */
  .ats-keywords-hidden { display: none; visibility: hidden; opacity: 0; font-size: 0px; height: 0px; }
</style>
</head>
<body>
<div class="resume">

  <div class="header">
    <h1>SAIKAT MAJI</h1>
    <div class="subtitle">Full-Stack Software Engineer — MERN Stack</div>
    <div class="contact">
      +91-8509233422 &nbsp;|&nbsp;
      <a href="mailto:saikatmaji200@gmail.com">saikatmaji200@gmail.com</a> &nbsp;|&nbsp; Kolkata, India<br>
      <a href="https://frontend-snowy-eight-57.vercel.app">frontend-snowy-eight-57.vercel.app</a> &nbsp;|&nbsp;
      <a href="https://github.com/GwSaikat">github.com/GwSaikat</a> &nbsp;|&nbsp;
      <a href="https://www.linkedin.com/in/saikat-maji-sde">linkedin.com/in/saikat-maji-sde</a>
    </div>
  </div>

  <!-- AI_EDITABLE_SUMMARY_START -->
  <div class="section">
    <div class="section-title">Summary</div>
    <p class="summary">
      Computer Science graduate and full-stack MERN developer with freelance experience shipping production web apps end-to-end. Skilled in real-time systems, REST APIs, and LLM-integrated features (LangChain, RAG). Seeking a Software Engineer / MERN Stack Developer role at a startup.
    </p>
  </div>
  <!-- AI_EDITABLE_SUMMARY_END -->

  <!-- AI_EDITABLE_SKILLS_START -->
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      <div class="skill-row">
        <span class="skill-label">Languages:</span>
        <span class="skill-value">JavaScript (ES6+), TypeScript, C++, SQL, HTML5, CSS3</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Frontend:</span>
        <span class="skill-value">React.js, Next.js</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Backend:</span>
        <span class="skill-value">Node.js, Express.js, REST API Design, WebSocket</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">AI / LLM:</span>
        <span class="skill-value">LangChain, Retrieval-Augmented Generation (RAG), LLM APIs</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Databases:</span>
        <span class="skill-value">MongoDB, Redis, MySQL</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Auth &amp; Security:</span>
        <span class="skill-value">JWT, bcrypt, Role-Based Access Control (RBAC)</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Testing:</span>
        <span class="skill-value">Vitest, Jest</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">DevOps &amp; Tools:</span>
        <span class="skill-value">Git, GitHub, Docker, CI/CD (Vercel, Render), Postman</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Core CS:</span>
        <span class="skill-value">Data Structures &amp; Algorithms, OOP, DBMS, Operating Systems, System Design</span>
      </div>
    </div>
  </div>
  <!-- AI_EDITABLE_SKILLS_END -->

  <div class="section">
    <div class="section-title">Experience</div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">Freelance Full-Stack Developer</span>
        <span class="entry-meta">2025 – Present | Self-Employed, Remote</span>
      </div>
      <ul>
        <li>Built and deployed full-stack management systems for 2 clients (a gym and a diagnostic center), from requirements to production launch.</li>
        <li>Replaced manual scheduling and record-keeping with role-based web apps for non-technical staff.</li>
        <li>Owned the entire lifecycle solo — architecture, development, testing, deployment, and client communication.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">Additional Experience</span>
      </div>
      <ul>
        <li><strong>Thiranex (Virtual Internship):</strong> Built 3 full-stack apps — a task manager, an e-commerce store, and a blog platform with threaded comments.</li>
        <li><strong>Forage (Startup Simulation):</strong> Shipped frontend fixes and new backend features from real user feedback for a simulated product team.</li>
      </ul>
    </div>
  </div>

  <!-- AI_EDITABLE_PROJECTS_START -->
  <div class="section">
    <div class="section-title">Projects</div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">FlowForge — Real-Time Critical Path Orchestration Engine</span>
        <span class="project-links"><a href="https://github.com/GwSaikat/FlowForge" target="_blank">GitHub</a> | <a href="https://client-one-bay-37.vercel.app/" target="_blank">Live Demo</a></span>
      </div>
      <ul>
        <li>Engineered a real-time CPM engine from scratch — Kahn's topological sort, DFS cycle detection, and forward/backward-pass scheduling — to auto-calculate the critical path on any task graph.</li>
        <li>Integrated LangChain and an LLM API for AI features: an automated standup-brief generator and a semantic dependency detector.</li>
        <li>Built a real-time sync layer (Socket.io, Redis) broadcasting graph updates within milliseconds; deployed on Vercel/Render with MongoDB Atlas.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">Banking System — Full-Stack Banking Application</span>
        <span class="project-links"><a href="https://github.com/GwSaikat/Banking-System" target="_blank">GitHub</a> | <a href="https://banking-system-sepia.vercel.app" target="_blank">Live Demo</a></span>
      </div>
      <ul>
        <li>Built a full-stack banking app (React.js frontend, Express.js/Node.js REST API) for accounts and transactions.</li>
        <li>Split the codebase into independently deployable frontend/backend modules with isolated build pipelines.</li>
        <li>Deployed a unified CI/CD pipeline — Render (backend), Vercel (frontend) — from a single repo.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">CropAI — AI-Powered Crop Disease Detection Platform</span>
        <span class="project-links"><a href="https://github.com/GwSaikat/CropAI" target="_blank">GitHub</a> | <a href="https://cropai-app.vercel.app" target="_blank">Live Demo</a></span>
      </div>
      <ul>
        <li>Built a platform that detects crop diseases from leaf photos via an in-browser TensorFlow.js model, paired with an LLM API for treatment recommendations.</li>
        <li>Designed a federated-learning-style architecture to aggregate model updates across users without centralizing raw data.</li>
        <li>Added Supabase (PostgreSQL) auth, Socket.io real-time updates, and Leaflet-based disease mapping.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">TrackChat — Real-Time Chat &amp; Device-Tracking App (In Progress)</span>
        <span class="entry-meta">MERN, Socket.io, WebSocket</span>
      </div>
      <ul>
        <li>Building a real-time chat app with live device tracking (Geolocation API, Leaflet) and JWT refresh-token auth on Node.js/Express.</li>
      </ul>
    </div>
  </div>
  <!-- AI_EDITABLE_PROJECTS_END -->

  <div class="section">
    <div class="section-title">Education &amp; Certifications</div>
    <p class="edu-line"><strong>JIS University, Kolkata</strong> — B.Tech in Computer Science and Engineering — Aug 2022 – May 2026</p>
    <p class="edu-line">Cisco CCNA — Collaboration, Simplilearn (2024) &nbsp;|&nbsp; Generative AI for Developers (Advanced), Google Skills — In Progress</p>
  </div>

  <!-- AI_EDITABLE_ATS_KEYWORDS_START -->
  <div class="ats-keywords-hidden"></div>
  <!-- AI_EDITABLE_ATS_KEYWORDS_END -->

</div>
</body>
</html>`;

// Master skills list for diff-checking (Section 5.4)
export const MASTER_SKILLS = [
  'javascript', 'typescript', 'c++', 'sql', 'html', 'html5', 'css', 'css3',
  'react', 'react.js', 'next.js', 'nextjs', 'node.js', 'nodejs',
  'express', 'express.js', 'rest api', 'rest apis', 'websocket',
  'langchain', 'rag', 'ai integration', 'openai api', 'openai', 'llm', 'llm apis',
  'mongodb', 'redis', 'mysql', 'supabase', 'postgresql', 'docker', 'jwt', 'bcrypt', 'rbac',
  'vitest', 'jest', 'git', 'github', 'vercel', 'netlify', 'render', 'postman',
  'data structures', 'algorithms', 'dsa', 'oop', 'dbms',
  'system design', 'operating systems',
  'socket.io', 'mern', 'leaflet.js', 'geolocation', 'tensorflow.js',
  'es6', 'es6+',
];

// Plain text version of the resume for AI context
export const MASTER_RESUME_TEXT = `SAIKAT MAJI
Full-Stack Software Engineer --- MERN Stack
+91-8509233422 | saikatmaji200@gmail.com | Kolkata, India
frontend-snowy-eight-57.vercel.app | github.com/GwSaikat | linkedin.com/in/saikat-maji-sde

SUMMARY:
Computer Science graduate and full-stack MERN developer with freelance experience shipping production web apps end-to-end. Skilled in real-time systems, REST APIs, and LLM-integrated features (LangChain, RAG). Seeking a Software Engineer / MERN Stack Developer role at a startup.

TECHNICAL SKILLS:
Languages: JavaScript (ES6+), TypeScript, C++, SQL, HTML5, CSS3
Frontend: React.js, Next.js
Backend: Node.js, Express.js, REST API Design, WebSocket
AI / LLM: LangChain, Retrieval-Augmented Generation (RAG), LLM APIs
Databases: MongoDB, Redis, MySQL
Auth & Security: JWT, bcrypt, Role-Based Access Control (RBAC)
Testing: Vitest, Jest
DevOps & Tools: Git, GitHub, Docker, CI/CD (Vercel, Render), Postman
Core CS: Data Structures & Algorithms, OOP, DBMS, Operating Systems, System Design

EXPERIENCE:
Freelance Full-Stack Developer | 2025 -- Present | Self-Employed, Remote
- Built and deployed full-stack management systems for 2 clients (a gym and a diagnostic center), from requirements to production launch.
- Replaced manual scheduling and record-keeping with role-based web apps for non-technical staff.
- Owned the entire lifecycle solo --- architecture, development, testing, deployment, and client communication.

Additional Experience:
- Thiranex (Virtual Internship): Built 3 full-stack apps --- a task manager, an e-commerce store, and a blog platform with threaded comments.
- Forage (Startup Simulation): Shipped frontend fixes and new backend features from real user feedback for a simulated product team.

PROJECTS:
FlowForge --- Real-Time Critical Path Orchestration Engine (GitHub | Live Demo)
- Engineered a real-time CPM engine from scratch --- Kahn's topological sort, DFS cycle detection, and forward/backward-pass scheduling --- to auto-calculate the critical path on any task graph.
- Integrated LangChain and an LLM API for AI features: an automated standup-brief generator and a semantic dependency detector.
- Built a real-time sync layer (Socket.io, Redis) broadcasting graph updates within milliseconds; deployed on Vercel/Render with MongoDB Atlas.

Banking System --- Full-Stack Banking Application (GitHub | Live Demo)
- Built a full-stack banking app (React.js frontend, Express.js/Node.js REST API) for accounts and transactions.
- Split the codebase into independently deployable frontend/backend modules with isolated build pipelines.
- Deployed a unified CI/CD pipeline --- Render (backend), Vercel (frontend) --- from a single repo.

CropAI --- AI-Powered Crop Disease Detection Platform (GitHub | Live Demo)
- Built a platform that detects crop diseases from leaf photos via an in-browser TensorFlow.js model, paired with an LLM API for treatment recommendations.
- Designed a federated-learning-style architecture to aggregate model updates across users without centralizing raw data.
- Added Supabase (PostgreSQL) auth, Socket.io real-time updates, and Leaflet-based disease mapping.

TrackChat --- Real-Time Chat & Device-Tracking App (In Progress) | MERN, Socket.io, WebSocket
- Building a real-time chat app with live device tracking (Geolocation API, Leaflet) and JWT refresh-token auth on Node.js/Express.

EDUCATION & CERTIFICATIONS:
JIS University, Kolkata --- B.Tech in Computer Science and Engineering (Aug 2022 -- May 2026)
Cisco CCNA --- Collaboration, Simplilearn (2024) | Generative AI for Developers (Advanced), Google Skills --- In Progress`;

export const MASTER_CV_LATEX = `
\\documentclass[10pt,a4paper]{article}

\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[top=0.22in,bottom=0.22in,left=0.55in,right=0.55in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}

\\definecolor{headcol}{RGB}{25,42,68}
\\definecolor{linkcol}{RGB}{20,60,110}

\\hypersetup{
    colorlinks=true,
    linkcolor=linkcol,
    urlcolor=linkcol,
    pdftitle={Saikat Maji - Resume - Software Engineer / MERN Stack Developer},
    pdfauthor={Saikat Maji}
}

\\titleformat{\\section}
  {\\normalfont\\Large\\bfseries\\color{headcol}}
  {}{0em}{}
  [{\\vspace{1pt}\\color{headcol}\\titlerule[0.8pt]}]
\\titlespacing*{\\section}{0pt}{6pt}{3pt}

\\setlist[itemize]{leftmargin=15pt, itemsep=0.6pt, topsep=0.6pt, parsep=0pt, partopsep=0pt}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{1pt}

\\newcommand{\\heading}[2]{\\noindent\\textbf{#1}\\hfill\\textit{\\small #2}\\par}
\\newcommand{\\subheading}[1]{\\noindent\\textit{\\small #1}\\par\\vspace{2pt}}

\\begin{document}
\\raggedright

% ================= HEADER =================
\\begin{center}
    {\\huge\\bfseries SAIKAT MAJI}\\\\[2pt]
    {\\normalsize Full-Stack Software Engineer --- MERN Stack}\\\\[3pt]
    \\small
    +91-8509233422 \\textbar\\ \\href{mailto:saikatmaji200@gmail.com}{saikatmaji200@gmail.com} \\textbar\\ Kolkata, India\\\\[1pt]
    \\href{https://frontend-snowy-eight-57.vercel.app}{frontend-snowy-eight-57.vercel.app} \\textbar\\ 
    \\href{https://github.com/GwSaikat}{github.com/GwSaikat} \\textbar\\ 
    \\href{https://www.linkedin.com/in/saikat-maji-sde}{linkedin.com/in/saikat-maji-sde}
\\end{center}

% ================= SUMMARY =================
\\section*{Summary}
% AI_EDITABLE_SUMMARY_START %
Computer Science graduate and full-stack MERN developer with freelance experience shipping production web apps end-to-end. Skilled in real-time systems, REST APIs, and LLM-integrated features (LangChain, RAG). Seeking a Software Engineer / MERN Stack Developer role at a startup.
% AI_EDITABLE_SUMMARY_END %

% ================= SKILLS =================
\\section*{Technical Skills}
% AI_EDITABLE_SKILLS_START %
\\begin{itemize}
    \\item \\textbf{Languages:} JavaScript (ES6+), TypeScript, C++, SQL, HTML5, CSS3
    \\item \\textbf{Frontend:} React.js, Next.js
    \\item \\textbf{Backend:} Node.js, Express.js, REST API Design, WebSocket
    \\item \\textbf{AI / LLM:} LangChain, Retrieval-Augmented Generation (RAG), LLM APIs
    \\item \\textbf{Databases:} MongoDB, Redis, MySQL
    \\item \\textbf{Auth \\& Security:} JWT, bcrypt, Role-Based Access Control (RBAC)
    \\item \\textbf{Testing:} Vitest, Jest
    \\item \\textbf{DevOps \\& Tools:} Git, GitHub, Docker, CI/CD (Vercel, Render), Postman
    \\item \\textbf{Core CS:} Data Structures \\& Algorithms, OOP, DBMS, Operating Systems, System Design
\\end{itemize}
% AI_EDITABLE_SKILLS_END %

% ================= EXPERIENCE =================
\\section*{Experience}

\\heading{Freelance Full-Stack Developer}{2025 -- Present}
\\subheading{Self-Employed, Remote}
\\begin{itemize}
    \\item Built and deployed full-stack management systems for 2 clients (a gym and a diagnostic center), from requirements to production launch.
    \\item Replaced manual scheduling and record-keeping with role-based web apps for non-technical staff.
    \\item Owned the entire lifecycle solo --- architecture, development, testing, deployment, and client communication.
\\end{itemize}

\\heading{Additional Experience}{}
\\begin{itemize}
    \\item \\textbf{Thiranex} (Virtual Internship): built 3 full-stack apps --- a task manager, an e-commerce store, and a blog platform with threaded comments.
    \\item \\textbf{Forage} (Startup Simulation): shipped frontend fixes and new backend features from real user feedback for a simulated product team.
\\end{itemize}

% ================= PROJECTS =================
\\section*{Projects}

% AI_EDITABLE_PROJECTS_START %
\\heading{FlowForge --- Real-Time Critical Path Orchestration Engine}{}
\\subheading{\\href{https://github.com/GwSaikat/FlowForge}{GitHub} \\textbar\\ \\href{https://client-one-bay-37.vercel.app/}{Live Demo}}
\\begin{itemize}
    \\item Engineered a real-time CPM engine from scratch --- Kahn's topological sort, DFS cycle detection, and forward/backward-pass scheduling --- to auto-calculate the critical path on any task graph.
    \\item Integrated LangChain and an LLM API for AI features: an automated standup-brief generator and a semantic dependency detector.
    \\item Built a real-time sync layer (Socket.io, Redis) broadcasting graph updates within milliseconds; deployed on Vercel/Render with MongoDB Atlas.
\\end{itemize}

\\heading{Banking System --- Full-Stack Banking Application}{}
\\subheading{\\href{https://github.com/GwSaikat/Banking-System}{GitHub} \\textbar\\ \\href{https://banking-system-sepia.vercel.app}{Live Demo}}
\\begin{itemize}
    \\item Built a full-stack banking app (React.js frontend, Express.js/Node.js REST API) for accounts and transactions.
    \\item Split the codebase into independently deployable frontend/backend modules with isolated build pipelines.
    \\item Deployed a unified CI/CD pipeline --- Render (backend), Vercel (frontend) --- from a single repo.
\\end{itemize}

\\heading{CropAI --- AI-Powered Crop Disease Detection Platform}{}
\\subheading{\\href{https://github.com/GwSaikat/CropAI}{GitHub} \\textbar\\ \\href{https://cropai-app.vercel.app}{Live Demo}}
\\begin{itemize}
    \\item Built a platform that detects crop diseases from leaf photos via an in-browser TensorFlow.js model, paired with an LLM API for treatment recommendations.
    \\item Designed a federated-learning-style architecture to aggregate model updates across users without centralizing raw data.
    \\item Added Supabase (PostgreSQL) auth, Socket.io real-time updates, and Leaflet-based disease mapping.
\\end{itemize}

\\heading{TrackChat --- Real-Time Chat \\& Device-Tracking App (In Progress)}{}
\\subheading{MERN, Socket.io, WebSocket}
\\begin{itemize}
    \\item Building a real-time chat app with live device tracking (Geolocation API, Leaflet) and JWT refresh-token auth on Node.js/Express.
\\end{itemize}
% AI_EDITABLE_PROJECTS_END %

% ================= EDUCATION & CERTIFICATIONS =================
\\enlargethispage{2\\baselineskip}
\\section*{Education \\& Certifications}
\\heading{JIS University, Kolkata --- B.Tech in Computer Science and Engineering}{Aug 2022 -- May 2026}
Cisco CCNA --- Collaboration, Simplilearn (2024) \\textbar\\ Generative AI for Developers (Advanced), Google Skills --- In Progress

% AI_EDITABLE_ATS_KEYWORDS_START %
% AI_EDITABLE_ATS_KEYWORDS_END %

\\end{document}
`;
