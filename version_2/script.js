const experiences = [
  {
    title: "SDE Team Lead",
    company: "Moonfare",
    period: "Aug 2021 - Present",
    location: "Berlin, Germany",
    achievements: [
      "Lead the development and maintenance of the main operational platform, managing a team of 7-8 engineers to ensure smooth operation and continuous improvement",
      "Proactively resolved critical production issues and implemented monitoring solutions, reducing incident volume and improving operational visibility",
      "Optimized performance across key system components by refactoring legacy code and enhancing database efficiency through targeted SQL tuning",
      "Leveraged AI tools like Copilot to refactor legacy code and enhance test coverage, streamlining release management processes",
      "Delivered impactful product features that increase asset management capacity, automate manual workflows, and improve user conversion through data-driven UX enhancements",
      "Championed engineering best practices by introducing improvements in CI/CD pipelines, code quality processes, and infrastructure automation",
      "Mentored and supported the growth of engineers, leading onboarding initiatives, developing technical documentation, and fostering a culture of collaboration and continuous learning"
    ]
  },
  {
    title: "Full Stack Engineer",
    company: "Moonfare",
    period: "Feb 2020 - Aug 2021",
    location: "Berlin Area, Germany",
    achievements: [
      "Designed and developed multiple business-critical microservices using NestJS and AWS, supporting key platform features with a focus on scalability, modularity, and performance",
      "Optimized lead conversion, KYC, and investment flows using Domain-Driven Design (DDD) and refactoring legacy code, improving system reliability and maintainability",
      "Developed end-to-end tests using Python and Behave to enhance regression suite reliability and ensure consistent software quality"
    ]
  },
  {
    title: "Software Engineer",
    company: "PlusDental",
    period: "Jul 2018 - Jan 2020",
    location: "Berlin Area, Germany",
    achievements: [
      "Led migration from legacy MERN stack to Next.js, enhancing UI/UX scalability with Redux and styled-components",
      "Revamped mobile apps using React Native to improve performance and user experience",
      "Implemented internationalization (i18n) across multiple countries and languages, leveraging Google PageSpeed for performance improvements",
      "Integrated a third-party library to render interactive 3D teeth models and personalized care plans for customers",
      "Contributed to GraphQL design and implementation, optimizing data fetching and system efficiency"
    ]
  },
  {
    title: "Full Stack Engineer",
    company: "HeroBear",
    period: "Apr 2016 - Nov 2017",
    location: "Taiwan",
    achievements: [
      "Collaborated with designers to create intuitive and user-friendly UI/UX",
      "Developed full stack web applications using Node.js, Meteor, React, and MongoDB, deployed on AWS for scalability and performance",
      "Managed a team of contract designers and developers, ensuring high-quality deliverables and timely project completion",
      "Designed and implemented cross-platform mobile applications using React Native for Android and iOS"
    ]
  },
  {
    title: "QA/Release Engineer (Student/Intern)",
    company: "HERE, a Nokia company",
    period: "May 2015 - Mar 2017",
    location: "Berlin Area, Germany",
    achievements: [
      "Maintained and enhanced Ruby, Python, and Bash scripts for CI/CD automation in Jenkins, including nightly regression testing",
      "Supported software development and debugging in C++ on Samsung's Tizen OS",
      "Tracked and reported application issues, acting as liaison between project manager, developers, and Samsung engineering",
      "Managed software releases with detailed release reports including test results, release notes, and known issues"
    ]
  },
  {
    title: "Graduate Research Assistant",
    company: "National Taiwan University",
    period: "Feb 2013 - Jul 2013",
    location: "Taipei City, Taiwan",
    achievements: [
      "Processed and visualized experimental aerosol data using C++ and MATLAB",
      "Streamlined experimental processes to improve accuracy and efficiency",
      "Developed a C# tool to assist experiments and managed experimental materials and equipment"
    ]
  },
  {
    title: "Student Assistant Programmer",
    company: "MAA Engineering Consultants (Shanghai) Ltd.",
    period: "Apr 2011 - Apr 2012",
    location: "New Taipei City, Taiwan",
    achievements: [
      "Developed and implemented auto-check algorithm for Taipei Metro BIM model using C#",
      "Tested and visualized results with Revit Architecture"
    ]
  },
  {
    title: "Graduate Teaching Assistant",
    company: "National Taiwan University",
    period: "Jan 2011 - Aug 2011",
    location: "Taipei City, Taiwan",
    achievements: [
      "Instructed freshmen on structure design using SketchUp",
      "Assisted in preparing lectures, office hour consulting, and hands-on support with water jet machine model building"
    ]
  },
  {
    title: "Intern Assistant Engineer",
    company: "PanUnited",
    period: "Jun 2007 - Sep 2007",
    location: "Singapore",
    achievements: [
      "Participated in concrete and asphalt lab procedures",
      "Monitored construction sites and drew road maps for construction projects",
      "Handled office paperwork and assisted in field operations"
    ]
  }
];

const skills = [
  "JavaScript", "TypeScript", "Python", "React", "Nextjs", "ReactNative", "Nodejs", "Nestjs", "SQL", "PostgreSQL", "NoSQL", "MongoDB", "Express", "AWS", "Docker", "Git", "CI/CD", "GraphQL", "REST", "Testing", "Automation", "Refactoring", "Leadership", "Mentorship", "Agile"
];

const projects = [
  {
    title: "LetterOn",
    tag: "AI Mail Assistant",
    description: "An AI-powered app that digitizes and organizes physical mail in under a minute. It scans letters, extracts key details like sender, due dates, and actions using OCR and NLP, and automatically categorizes them. With filters for Starred, Notes, and Important Dates, LetterOn turns paper clutter into a clear, actionable digital inbox.",
    tags: ["AI", "OCR", "DocumentProcessing", "ComputerVision", "NLP", "React", "Nodejs", "TypeScript", "Python", "OpenAIAPI", "Multilingual", "Automation", "UXDesign", "Productivity"],
    codeLink: "https://github.com/NaN-NaN-NaN/LetterON-Google-AI-Sutdio",
    liveLink: "https://letteron-ai-studio-952320811039.us-west1.run.app/",
    image: "../img/LetterOn4.png"
  },
  {
    title: "easy-rag",
    tag: "RAG CLI",
    description: "A command-line tool for querying PDFs using Retrieval-Augmented Generation. It uses AWS Bedrock for embeddings, Chroma for storage, and Ollama for responses, with LLM-based fuzzy tests to validate answer accuracy and relevance.",
    tags: ["Python", "LangChain", "ChromaDB", "AI", "RAG"],
    codeLink: "https://github.com/NaN-NaN-NaN/easy-rag",
    liveLink: null,
    image: "../img/EasyRag1.png"
  },
  {
    title: "MyLingo (WIP)",
    tag: "Chrome Extension",
    description: "Chrome Extension (Manifest V3) that acts as a client-side AI-powered language tutor, letting users learn languages directly from any webpage. It combines highlight-to-translate, grammar hints, TTS listening, notes saving, and quiz generation, all powered by Chrome's built-in AI APIs (Prompt API, Summarizer API, Translator API).",
    tags: ["JavaScript", "React", "ChromeExtension", "AI", "PromptAPI", "TranslatorAPI", "SummarizerAPI", "TTS", "WebSpeechAPI"],
    codeLink: "https://github.com/NaN-NaN-NaN/MyLingo",
    liveLink: null,
    video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
  }
];

const education = [
  {
    degree: "Master of Science (M.S.), Geoinformation",
    school: "Technische Universitat Berlin",
    period: "2013 - 2018",
    location: "Berlin, Germany"
  },
  {
    degree: "M.S. CE, Computer-Aided Engineering Division",
    school: "National Taiwan University",
    period: "2010 - 2012",
    location: "Taipei, Taiwan"
  },
  {
    degree: "Summer Exchange Student Intern, Engineering",
    school: "Nanyang Technological University Singapore",
    period: "2007",
    location: "Singapore",
    activities: "Activities: Summer exchange student intern"
  },
  {
    degree: "B.S. Civil Engineering",
    school: "National Taiwan University",
    period: "2004 - 2008",
    location: "Taipei, Taiwan"
  },
  {
    degree: "Entrepreneurship & Climate Change Engineering",
    school: "EIT Climate KIC (Summer Program)",
    period: "2015",
    location: "UK / SE / DK"
  }
];

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;"
}[char]));

function animateOpacity(element, from, to, duration) {
  const started = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - started) / duration);
    element.style.opacity = String(from + (to - from) * progress);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setupHeroVideo() {
  const video = document.getElementById("heroVideo");
  let fadingOut = false;
  video.addEventListener("canplay", () => {
    video.play().catch(() => {});
    animateOpacity(video, Number(video.style.opacity) || 0, 1, 500);
  }, { once: true });
  video.addEventListener("timeupdate", () => {
    if (!fadingOut && video.duration && video.duration - video.currentTime <= 0.55) {
      fadingOut = true;
      animateOpacity(video, Number(video.style.opacity) || 1, 0, 500);
    }
  });
  video.addEventListener("ended", () => {
    video.style.opacity = "0";
    window.setTimeout(() => {
      fadingOut = false;
      video.currentTime = 0;
      video.play().catch(() => {});
      animateOpacity(video, 0, 1, 500);
    }, 100);
  });
}

function renderProjects() {
  document.querySelector('[data-render="projects"]').innerHTML = projects.map((project) => `
    <article class="project-card">
      <div class="project-media">
        ${project.video ? `<video src="${escapeHtml(project.video)}" muted autoplay loop playsinline preload="auto"></video>` : `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} screenshot">`}
      </div>
      <div class="project-body">
        <p class="label">${escapeHtml(project.tag)}</p>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="tags">${project.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="project-links">
          <a href="${escapeHtml(project.codeLink)}" target="_blank" rel="noopener noreferrer">Code ↗</a>
          ${project.liveLink ? `<a href="${escapeHtml(project.liveLink)}" target="_blank" rel="noopener noreferrer">Live ↗</a>` : ""}
        </div>
      </div>
    </article>
  `).join("");
}

function renderExperience() {
  document.querySelector('[data-render="experience"]').innerHTML = experiences.map((item) => `
    <article class="experience-card">
      <header>
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.company)}</p>
        </div>
        <div class="meta">${escapeHtml(item.period)}<br>${escapeHtml(item.location)}</div>
      </header>
      <ul>${item.achievements.map((achievement) => `<li>${escapeHtml(achievement)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function renderSkills() {
  document.querySelector('[data-render="skills"]').innerHTML = skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("");
}

function renderEducation() {
  document.querySelector('[data-render="education"]').innerHTML = education.map((item) => `
    <article class="education-card">
      <header>
        <div>
          <h3>${escapeHtml(item.degree)}</h3>
          <p>${escapeHtml(item.school)}</p>
        </div>
        <div class="meta">${escapeHtml(item.period)}<br>${escapeHtml(item.location)}</div>
      </header>
      ${item.activities ? `<p>${escapeHtml(item.activities)}</p>` : ""}
    </article>
  `).join("");
}

function setupRevealSections() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.16 });
  document.querySelectorAll(".reveal-section").forEach((element) => observer.observe(element));
}

function setupLetterReveal() {
  const element = document.querySelector("[data-letter-reveal]");
  const text = element.textContent;
  element.innerHTML = [...text].map((char) => `<span>${char === " " ? "&nbsp;" : escapeHtml(char)}</span>`).join("");
  const letters = Array.from(element.querySelectorAll("span"));
  function update() {
    const rect = element.getBoundingClientRect();
    const viewport = window.innerHeight;
    const progress = Math.min(1, Math.max(0, (viewport * 0.82 - rect.top) / (rect.height + viewport * 0.36)));
    const visibleCount = Math.floor(progress * letters.length);
    letters.forEach((letter, index) => {
      letter.classList.toggle("visible", index <= visibleCount);
    });
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

document.addEventListener("DOMContentLoaded", () => {
  setupHeroVideo();
  renderProjects();
  renderExperience();
  renderSkills();
  renderEducation();
  setupRevealSections();
  setupLetterReveal();
});
