// ============================================
// Master CV HTML/CSS Template — Section 5.2
// ATS-clean, single-page A4 design
// AI-editable regions marked with HTML comments
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
    color: #1a1a1a;
    background: white;
  }

  .resume {
    width: 210mm;
    min-height: 297mm;
    max-height: 297mm;
    padding: 12mm 14mm;
    overflow: hidden;
  }

  /* Header */
  .header { text-align: center; margin-bottom: 6px; border-bottom: 1.5px solid #1a1a1a; padding-bottom: 6px; }
  .header h1 { font-size: 18px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 3px; }
  .header .contact { font-size: 9px; color: #333; }
  .header .contact a { color: #333; text-decoration: none; }

  /* Section */
  .section { margin-bottom: 5px; }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 2px;
    margin-bottom: 4px;
    color: #1a1a1a;
  }

  /* Summary */
  .summary { font-size: 9.5px; color: #333; }

  /* Skills */
  .skills-grid { font-size: 9.5px; }
  .skill-row { display: flex; margin-bottom: 1px; }
  .skill-label { font-weight: 600; min-width: 130px; color: #1a1a1a; }
  .skill-value { color: #333; }

  /* Experience / Projects */
  .entry { margin-bottom: 4px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 600; font-size: 10px; }
  .entry-meta { font-size: 9px; color: #555; font-style: italic; }
  .entry-subtitle { font-size: 9px; color: #555; font-style: italic; margin-bottom: 1px; }
  .entry ul { padding-left: 14px; font-size: 9.5px; color: #333; }
  .entry li { margin-bottom: 1px; }

  /* Education & Certs */
  .edu-line { font-size: 9.5px; }
  .edu-line strong { font-weight: 600; }

  /* Links */
  .project-links { font-size: 8.5px; color: #0066cc; }
  .project-links a { color: #0066cc; text-decoration: none; }
</style>
</head>
<body>
<div class="resume">

  <div class="header">
    <h1>SAIKAT MAJI</h1>
    <div class="contact">
      +91-8509233422 &nbsp;|&nbsp;
      <a href="mailto:Saikatmaji200@gmail.com">Saikatmaji200@gmail.com</a> &nbsp;|&nbsp;
      <a href="https://linkedin.com/in/saikat-maji-">linkedin.com/in/saikat-maji-</a> &nbsp;|&nbsp;
      <a href="https://github.com/GwSaikat">github.com/GwSaikat</a> &nbsp;|&nbsp;
      <a href="https://leetcode.com/u/Alpha7679">leetcode.com/u/Alpha7679</a>
    </div>
  </div>

  <!-- AI_EDITABLE_SUMMARY_START -->
  <div class="section">
    <div class="section-title">Summary</div>
    <p class="summary">
      Computer Science graduate and full-stack developer skilled in building production-style MERN
      applications, real-time systems, and AI-integrated features with LangChain and RAG. Proficient
      in React.js, Node.js/Express.js, REST API design, and core CS fundamentals (DSA, OOP, DBMS,
      System Design). Seeking a Software Engineer / Full-Stack Developer role.
    </p>
  </div>
  <!-- AI_EDITABLE_SUMMARY_END -->

  <!-- AI_EDITABLE_SKILLS_START -->
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      <div class="skill-row">
        <span class="skill-label">Languages:</span>
        <span class="skill-value">JavaScript (ES6+), TypeScript, C++, SQL, HTML, CSS</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Frontend/Backend:</span>
        <span class="skill-value">React.js, Next.js | Node.js, Express.js, REST APIs, WebSocket</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">AI/LLM:</span>
        <span class="skill-value">LangChain, RAG, AI Integration (OpenAI API)</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Databases &amp; Infra/Auth:</span>
        <span class="skill-value">MongoDB, Redis, Docker (Basics) | JWT, bcrypt, RBAC</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Dev Tools &amp; Deployment:</span>
        <span class="skill-value">Git, GitHub, Vercel, Netlify, Render</span>
      </div>
      <div class="skill-row">
        <span class="skill-label">Core CS:</span>
        <span class="skill-value">Data Structures &amp; Algorithms, OOP, DBMS, System Design, Operating Systems</span>
      </div>
    </div>
  </div>
  <!-- AI_EDITABLE_SKILLS_END -->

  <div class="section">
    <div class="section-title">Experience</div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">Freelance Full-Stack Developer</span>
        <span class="entry-meta">2025–Present | Self-Employed, Remote</span>
      </div>
      <ul>
        <li>Designed and deployed full-stack management systems for two clients (a gym and a diagnostic center), from initial requirements through production launch.</li>
        <li>Built responsive, role-based web apps that digitized scheduling, client records, and daily operations, replacing manual processes.</li>
        <li>Owned the full development lifecycle — requirements, architecture, development, testing, and deployment — while handling client communication directly.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">Virtual Internship — Thiranex (Full-Stack Development)</span>
      </div>
      <ul>
        <li>Built a Task Management Application enabling task creation, assignment, and status tracking.</li>
        <li>Developed an E-Commerce Web Application with product browsing, cart, and order management.</li>
        <li>Created a Blog Platform with Comments, including content publishing and threaded discussions.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">Software Engineering Job Simulation — Forage</span>
      </div>
      <ul>
        <li>Completed a virtual job simulation performing realistic software engineering tasks for a Y Combinator–style startup application.</li>
        <li>Implemented frontend improvements from user feedback and shipped new backend features.</li>
        <li>Analyzed product/feature releases to evaluate user impact and guide development decisions.</li>
      </ul>
    </div>
  </div>

  <!-- AI_EDITABLE_PROJECTS_START -->
  <div class="section">
    <div class="section-title">Projects</div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">FlowForge — Real-Time Critical Path Orchestration Engine</span>
        <span class="project-links"><a href="#">GitHub</a> | <a href="#">Live Demo</a></span>
      </div>
      <ul>
        <li>Engineered a real-time CPM engine modeling projects as dependency graphs, implementing topological sort, DFS cycle detection, and CPM forward/backward-pass algorithms from scratch.</li>
        <li>Integrated LangChain and OpenAI API for AI-driven features: automated standup-brief generator and semantic dependency detector for hidden task relationships.</li>
        <li>Built a real-time layer with Socket.io/WebSocket, Express.js, Redis broadcasting graph updates within milliseconds; deployed on Render/Vercel with MongoDB Atlas.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">TrackChat — Real-Time Chat &amp; Device Tracking App (In Progress)</span>
        <span class="entry-meta">MERN, Socket.io, WebSocket</span>
      </div>
      <ul>
        <li>Building a real-time chat app with live device-location tracking via Socket.io, WebSocket, and HTML5 Geolocation API, rendered on an interactive Leaflet.js map.</li>
        <li>Architecting an event-driven Node.js/Express.js backend with MongoDB for message persistence, read receipts, typing indicators, and group chat.</li>
        <li>Implementing JWT refresh-token rotation with a mobile-first React.js frontend.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">Banking System — Full-Stack Banking Application</span>
        <span class="project-links"><a href="#">GitHub</a> | <a href="#">Live Demo</a></span>
      </div>
      <ul>
        <li>Engineered a full-stack banking application (React.js frontend, RESTful Express.js/Node.js API) handling core banking operations such as accounts and transactions.</li>
        <li>Structured the codebase into independently deployable frontend/backend modules.</li>
        <li>Deployed a unified pipeline: backend on Render, frontend on Vercel.</li>
      </ul>
    </div>
  </div>
  <!-- AI_EDITABLE_PROJECTS_END -->

  <div class="section">
    <div class="section-title">Education</div>
    <p class="edu-line"><strong>JIS University, Kolkata, India</strong> — B.Tech Computer Science and Engineering — Aug 2022 – May 2026</p>
  </div>

  <div class="section">
    <div class="section-title">Certifications</div>
    <p class="edu-line">Cisco Certified Network Associate — Collaboration (CCNA-C), Simplilearn — Jul 2024</p>
    <p class="edu-line">Generative AI for Developers (Advanced), Google Skills — In Progress</p>
  </div>

</div>
</body>
</html>`;

// Master skills list for diff-checking (Section 5.4)
export const MASTER_SKILLS = [
  'javascript', 'typescript', 'c++', 'sql', 'html', 'css',
  'react', 'react.js', 'next.js', 'nextjs', 'node.js', 'nodejs',
  'express', 'express.js', 'rest api', 'rest apis', 'websocket',
  'langchain', 'rag', 'ai integration', 'openai api', 'openai',
  'mongodb', 'redis', 'docker', 'jwt', 'bcrypt', 'rbac',
  'git', 'github', 'vercel', 'netlify', 'render',
  'data structures', 'algorithms', 'dsa', 'oop', 'dbms',
  'system design', 'operating systems',
  'socket.io', 'mern', 'leaflet.js', 'geolocation',
  'es6', 'es6+',
];

// Plain text version of the resume for AI context
export const MASTER_RESUME_TEXT = `SAIKAT MAJI
+91-8509233422 | Saikatmaji200@gmail.com | linkedin.com/in/saikat-maji- | github.com/GwSaikat | leetcode.com/u/Alpha7679

SUMMARY:
Computer Science graduate and full-stack developer skilled in building production-style MERN applications, real-time systems, and AI-integrated features with LangChain and RAG. Proficient in React.js, Node.js/Express.js, REST API design, and core CS fundamentals (DSA, OOP, DBMS, System Design). Seeking a Software Engineer / Full-Stack Developer role.

TECHNICAL SKILLS:
Languages: JavaScript (ES6+), TypeScript, C++, SQL, HTML, CSS
Frontend/Backend: React.js, Next.js | Node.js, Express.js, REST APIs, WebSocket
AI/LLM: LangChain, RAG, AI Integration (OpenAI API)
Databases & Infra/Auth: MongoDB, Redis, Docker (Basics) | JWT, bcrypt, RBAC
Dev Tools & Deployment: Git, GitHub, Vercel, Netlify, Render
Core CS: Data Structures & Algorithms, OOP, DBMS, System Design, Operating Systems

EXPERIENCE:
Freelance Full-Stack Developer | 2025–Present | Self-Employed, Remote
- Designed and deployed full-stack management systems for two clients (a gym and a diagnostic center).
- Built responsive, role-based web apps that digitized scheduling, client records, and daily operations.
- Owned the full development lifecycle — requirements, architecture, development, testing, deployment.

Virtual Internship — Thiranex (Full-Stack Development)
- Built a Task Management Application enabling task creation, assignment, and status tracking.
- Developed an E-Commerce Web Application with product browsing, cart, and order management.
- Created a Blog Platform with Comments, including content publishing and threaded discussions.

Software Engineering Job Simulation — Forage
- Completed virtual job simulation for a Y Combinator–style startup application.
- Implemented frontend improvements and shipped new backend features.
- Analyzed product/feature releases to evaluate user impact.

PROJECTS:
FlowForge — Real-Time Critical Path Orchestration Engine
- Real-time CPM engine with topological sort, DFS cycle detection, CPM forward/backward-pass algorithms.
- LangChain + OpenAI API for AI-driven standup-brief generator and semantic dependency detector.
- Socket.io/WebSocket, Express.js, Redis real-time layer; deployed on Render/Vercel with MongoDB Atlas.

TrackChat — Real-Time Chat & Device Tracking App (In Progress) | MERN, Socket.io, WebSocket
- Real-time chat with live device-location tracking via Socket.io, WebSocket, HTML5 Geolocation, Leaflet.js.
- Event-driven Node.js/Express.js backend with MongoDB for message persistence, read receipts.
- JWT refresh-token rotation with mobile-first React.js frontend.

Banking System — Full-Stack Banking Application
- Full-stack banking app (React.js + RESTful Express.js/Node.js API) for accounts and transactions.
- Independently deployable frontend/backend modules. Backend on Render, frontend on Vercel.

EDUCATION:
JIS University, Kolkata, India — B.Tech Computer Science and Engineering — Aug 2022 – May 2026

CERTIFICATIONS:
Cisco Certified Network Associate — Collaboration (CCNA-C), Simplilearn — Jul 2024
Generative AI for Developers (Advanced), Google Skills — In Progress`;

export const MASTER_CV_LATEX = `
\\documentclass[a4paper,10pt]{article}

\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[hidelinks]{hyperref}
\\usepackage[left=0.55in, right=0.55in, top=0.28in, bottom=0.28in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}

\\pagestyle{empty}
\\setlength{\\parskip}{0pt}
\\setlength{\\parindent}{0pt}
\\renewcommand{\\baselinestretch}{0.96}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\vspace{1pt}\\hrule\\vspace{1pt}]
\\titlespacing*{\\section}{0pt}{4pt}{1pt}

\\setlist[itemize]{leftmargin=0.16in, itemsep=0pt, parsep=0pt, topsep=0pt, partopsep=0pt}

\\newcommand{\\heading}[4]{%
  \\noindent\\textbf{#1}\\hfill\\textbf{\\small #2}\\\\
  \\textit{\\small #3}\\hfill\\textit{\\small #4}\\\\[0pt]
}
\\newcommand{\\headingOne}[2]{%
  \\noindent\\textbf{#1}\\hfill\\small #2\\\\[0pt]
}
\\newcommand{\\headingBare}[1]{%
  \\noindent\\textbf{#1}\\\\[0pt]
}

\\begin{document}

% ---------- HEADER ----------
\\begin{center}
  {\\LARGE \\bfseries SAIKAT MAJI}\\\\[3pt]
  \\small
  +91-8509233422 ~$|$~
  \\href{mailto:Saikatmaji200@gmail.com}{Saikatmaji200@gmail.com} ~$|$~
  \\href{http://www.linkedin.com/in/saikat-maji-}{linkedin.com/in/saikat-maji-} ~$|$~
  \\href{https://github.com/GwSaikat}{github.com/GwSaikat} ~$|$~
  \\href{https://leetcode.com/u/Alpha7679/}{leetcode.com/Alpha7679}
\\end{center}
\\vspace{-7pt}

% ---------- SUMMARY ----------
\\section*{Summary}
% AI_EDITABLE_SUMMARY_START %
Computer Science graduate and full-stack developer skilled in building production-style MERN applications, real-time systems, and AI-integrated features with LangChain and RAG. Proficient in React.js, Node.js/Express.js, REST API design, and core CS fundamentals (DSA, OOP, DBMS, System Design). Seeking a \\textbf{MERN Stack Developer} / Software Engineer role.
% AI_EDITABLE_SUMMARY_END %

% ---------- TECHNICAL SKILLS ----------
\\section*{Technical Skills}
% AI_EDITABLE_SKILLS_START %
\\begin{itemize}
  \\item \\textbf{Languages:} JavaScript (ES6+), TypeScript, C++, SQL, HTML, CSS
  \\item \\textbf{Frontend / Backend:} React.js, Next.js ~$|$~ Node.js, Express.js, REST APIs, WebSocket
  \\item \\textbf{AI / LLM:} LangChain, RAG, AI Integration (OpenAI API)
  \\item \\textbf{Databases \\& Infra / Auth:} MongoDB, Redis, Docker (Basics) ~$|$~ JWT, bcrypt, RBAC
  \\item \\textbf{Dev Tools \\& Deployment:} Git, GitHub, Postman, CI/CD (Vercel/Render auto-deploy on push), Vercel, Netlify, Render
  \\item \\textbf{Core CS:} Data Structures \\& Algorithms, OOP, DBMS, System Design, Operating Systems
\\end{itemize}
% AI_EDITABLE_SKILLS_END %

% ---------- EXPERIENCE ----------
\\section*{Experience}

\\heading{Freelance Full-Stack Developer}{2025 -- Present}{Self-Employed}{Remote}
\\begin{itemize}
  \\item Designed and deployed full-stack management systems for two clients (a gym and a diagnostic center), from initial requirements through production launch.
  \\item Built responsive, role-based web apps that digitized scheduling, client records, and daily operations, replacing manual processes.
  \\item Owned the full development lifecycle -- requirements, architecture, development, testing, and deployment -- while handling client communication directly.
\\end{itemize}

\\headingBare{Virtual Internship -- Thiranex (Full-Stack Development)}
\\begin{itemize}
  \\item Built a Task Management Application enabling task creation, assignment, and status tracking for teams.
  \\item Developed an E-Commerce Web Application with product browsing, cart, and order management.
  \\item Created a Blog Platform with Comments, including content publishing and threaded discussions.
\\end{itemize}

\\headingBare{Software Engineering Job Simulation -- Forage}
\\begin{itemize}
  \\item Completed a virtual job simulation performing realistic software engineering tasks for a Y Combinator--style startup application.
  \\item Implemented frontend improvements from user feedback and shipped new backend features.
  \\item Analyzed product and feature releases to evaluate user impact and guide development decisions.
\\end{itemize}

% ---------- PROJECTS ----------
\\section*{Projects}

% AI_EDITABLE_PROJECTS_START %
\\headingOne{FlowForge -- Real-Time Critical Path Orchestration Engine}{\\href{https://github.com/Gwsaikat/FlowForge}{GitHub} ~$|$~ \\href{https://client-one-bay-37.vercel.app/}{Live Demo}}
\\begin{itemize}
  \\item Engineered a real-time CPM engine modeling projects as dependency graphs, implementing topological sort, DFS cycle detection, and CPM forward/backward-pass algorithms from scratch.
  \\item Integrated LangChain and the OpenAI API for AI-driven features, including an automated standup-brief generator and a semantic dependency detector for hidden task relationships.
  \\item Built a real-time layer with Socket.io/WebSocket, Express.js, and Redis broadcasting graph updates within milliseconds; deployed on Render/Vercel with MongoDB Atlas.
\\end{itemize}

\\headingOne{TrackChat -- Real-Time Chat \\& Device Tracking App (In Progress)}{MERN, Socket.io, WebSocket}
\\begin{itemize}
  \\item Building a real-time chat app with live device-location tracking via Socket.io, WebSocket, and the HTML5 Geolocation API, rendered on an interactive Leaflet.js map.
  \\item Architecting an event-driven Node.js/Express.js backend with MongoDB for message persistence, read receipts, typing indicators, and group chat.
  \\item Implementing JWT refresh-token rotation with a mobile-first React.js frontend using Context API and lazy loading.
\\end{itemize}

\\headingOne{Banking System -- Full-Stack Banking Application}{\\href{https://github.com/Gwsaikat/Banking-System}{GitHub} ~$|$~ \\href{https://banking-system-sepia.vercel.app}{Live Demo}}
\\begin{itemize}
  \\item Engineered a full-stack banking application with a React.js frontend and RESTful Express.js/Node.js API to handle core banking operations such as accounts and transactions.
  \\item Structured the codebase into independently deployable frontend and backend modules with isolated build pipelines.
  \\item Deployed a unified pipeline hosting the backend on Render and frontend on Vercel, enabling continuous delivery from a single repo.
\\end{itemize}
% AI_EDITABLE_PROJECTS_END %

% ---------- EDUCATION ----------
\\section*{Education}
\\heading{JIS University}{Aug 2022 -- May 2026}{Bachelor of Technology in Computer Science and Engineering}{Kolkata, India}

% ---------- CERTIFICATIONS ----------
\\section*{Certifications}
\\begin{itemize}
  \\item Cisco Certified Network Associate -- Collaboration (CCNA-C), Simplilearn -- Jul 2024
  \\item Generative AI for Developers (Advanced), Google Skills -- In Progress
\\end{itemize}

\\end{document}
`;
