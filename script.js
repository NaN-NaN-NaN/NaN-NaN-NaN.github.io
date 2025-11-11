// Experience Data
  const experiences = [
    {
      title: "SDE Team Lead",
      company: "Moonfare",
      period: "Aug 2021 - Present",
      location: "Berlin, Germany",
      achievements: [
        "Lead the development and maintenance of the main operational platform, managing a team of 7–8 engineers to ensure smooth operation and continuous improvement",
        "Proactively resolved critical production issues and implemented monitoring solutions, reducing incident volume and improving operational visibility",
        "Optimized performance across key system components by refactoring legacy code and enhancing database efficiency through targeted SQL tuning",
        "Leveraged AI tools like Copilot to refactor legacy code and enhance test coverage, streamlining release management processes",
        "Delivered impactful product features that increase asset management capacity, automate manual workflows, and improve user conversion through data-driven UX enhancements",
        "Championed engineering best practices by introducing improvements in CI/CD pipelines, code quality processes, and infrastructure automation",
        "Mentored and supported the growth of engineers, leading onboarding initiatives, developing technical documentation, and fostering a culture of collaboration and continuous learning"
      ],
    },
    {
      title: "Full Stack Engineer (Typescript)",
      company: "Moonfare",
      period: "Feb 2020 - Aug 2021",
      location: "Berlin Area, Germany",
      achievements: [
        "Designed and developed multiple business-critical microservices using NestJS and AWS, supporting key platform features with a focus on scalability, modularity, and performance",
        "Optimized lead conversion, KYC, and investment flows using Domain-Driven Design (DDD) and refactoring legacy code, improving system reliability and maintainability",
        "Developed end-to-end tests using Python and Behave to enhance regression suite reliability and ensure consistent software quality"
      ],
    },
    {
      title: "Software Engineer (JavaScript)",
      company: "PlusDental",
      period: "Jul 2018 - Jan 2020",
      location: "Berlin Area, Germany",
      achievements: [
        "Led migration from legacy MERN stack to Next.js, enhancing UI/UX scalability with Redux and styled-components",
        "Revamped mobile apps using React Native to improve performance and user experience",
        "Implemented internationalization (i18n) across multiple countries and languages, leveraging Google PageSpeed for performance improvements",
        "Integrated a third-party library to render interactive 3D teeth models and personalized care plans for customers",
        "Contributed to GraphQL design and implementation, optimizing data fetching and system efficiency"
      ],
    },
    {
      title: "Full Stack Engineer (NodeJS/MeteorJS/ReactNative)",
      company: "HeroBear",
      period: "Apr 2016 - Nov 2017",
      location: "Taiwan",
      achievements: [
        "Collaborated with designers to create intuitive and user-friendly UI/UX",
        "Developed full stack web applications using Node.js, Meteor, React, and MongoDB, deployed on AWS for scalability and performance",
        "Managed a team of contract designers and developers, ensuring high-quality deliverables and timely project completion",
        "Designed and implemented cross-platform mobile applications using React Native for Android and iOS"
      ],
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
      ],
    },
    {
      title: "Ruby on Rails Project Trainee",
      company: "Pilot Bootcamp",
      period: "Feb 2015",
      location: "Mitte, Berlin, Germany",
      achievements: [
        "Implemented commercial parking space loaning website with Ruby on Rails",
        "Integrated tests and deployed the application online"
      ],
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
      ],
    },
    {
      title: "Student Assistant Programmer",
      company: "MAA Engineering Consultants (Shanghai) Ltd.",
      period: "Apr 2011 - Apr 2012",
      location: "New Taipei City, Taiwan",
      achievements: [
        "Developed and implemented auto-check algorithm for Taipei Metro BIM model using C#",
        "Tested and visualized results with Revit Architecture"
      ],
    },
    {
      title: "Graduate Teaching Assistant",
      company: "National Taiwan University",
      period: "Jan 2011 - Aug 2011",
      location: "Taipei City, Taiwan",
      achievements: [
        "Instructed freshmen on structure design using SketchUp",
        "Assisted in preparing lectures, office hour consulting, and hands-on support with water jet machine model building"
      ],
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
      ],
    },
  ];
  

// Skills Data
const skills = [
  "JavaScript",
  "TypeScript",
  "React.js",
  "Node.js",
  "Laravel",
  "PHP",
  "AWS",
  "SQS",
  "Lambda",
  "Step Functions",
  "EventBridge",
  "Docker",
  "Git",
  "REST APIs",
  "GraphQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "Jest",
  "CI/CD",
  "Agile",
]

// Projects Data
const projects = [
  {
    title: "Pacman",
    description:
      "A recreation of the classic Pacman game with vanilla JavaScript, implementing various path-finding algorithms for ghost movement.",
    tags: ["JavaScript", "Canvas API", "Path-finding Algorithms"],
    codeLink: "https://github.com/maskeynihal/pacman",
    liveLink: "https://maskeynihal.github.io/pacman/",
  },
  {
    title: "Flappy Bird",
    description: "A clone of the popular Flappy Bird game built with vanilla JavaScript and HTML5 Canvas.",
    tags: ["JavaScript", "Canvas API", "Game Development"],
    codeLink: "https://github.com/maskeynihal/flappy-bird",
    liveLink: "https://maskeynihal.github.io/flappy-bird/",
  },
  {
    title: "Pursue - Job Handling with AWS",
    description:
      "A JavaScript package for handling job processing using AWS services like SQS, Lambda, and Step Functions.",
    tags: ["Node.js", "AWS", "SQS", "Lambda", "npm package"],
    codeLink: "https://github.com/maskeynihal/pursue",
    liveLink: null,
  },
  {
    title: "Mailer",
    description: "A JavaScript package to prepare and send emails using AWS SES, with templating support.",
    tags: ["Node.js", "AWS", "SES", "Email Templates", "npm package"],
    codeLink: "https://github.com/maskeynihal/mailer",
    liveLink: null,
  },
]

// Render Experience Timeline
function renderExperience() {
  const timeline = document.querySelector(".timeline")

  experiences.forEach((exp) => {
    const item = document.createElement("div")
    item.className = "timeline-item"

    const achievementsList = exp.achievements.map((achievement) => `<li>${achievement}</li>`).join("")

    item.innerHTML = `
            <div class="experience-card">
                <div class="experience-header">
                    <div>
                        <h3 class="experience-title">${exp.title}</h3>
                        <p class="experience-company">${exp.company}</p>
                    </div>
                    <div class="experience-meta">
                        <span class="experience-badge">${exp.period}</span>
                        <span class="experience-location">${exp.location}</span>
                    </div>
                </div>
                <ul class="experience-achievements">
                    ${achievementsList}
                </ul>
            </div>
        `

    timeline.appendChild(item)
  })
}

// Render Skills
function renderSkills() {
  const skillsGrid = document.querySelector(".skills-grid")

  skills.forEach((skill) => {
    const card = document.createElement("div")
    card.className = "skill-card"
    card.innerHTML = `<div class="skill-name">${skill}</div>`
    skillsGrid.appendChild(card)
  })
}

// Render Projects
function renderProjects() {
  const projectsGrid = document.querySelector(".projects-grid")

  projects.forEach((project) => {
    const card = document.createElement("div")
    card.className = "project-card"

    const tags = project.tags
      .slice(0, 3)
      .map((tag) => `<span class="project-tag">${tag}</span>`)
      .join("")

    const liveButton = project.liveLink
      ? `
            <a href="${project.liveLink}" target="_blank" rel="noopener noreferrer" class="project-link">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Live
            </a>
        `
      : ""

    card.innerHTML = `
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">${tags}</div>
            <div class="project-links">
                <a href="${project.codeLink}" target="_blank" rel="noopener noreferrer" class="project-link">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Code
                </a>
                ${liveButton}
            </div>
        `

    projectsGrid.appendChild(card)
  })
}

// Header Scroll Effect
function handleScroll() {
  const header = document.getElementById("header")
  if (window.scrollY > 10) {
    header.classList.add("scrolled")
  } else {
    header.classList.remove("scrolled")
  }

  // Update active navigation
  updateActiveNav()
}

// Update Active Navigation
function updateActiveNav() {
  const sections = ["home", "about", "experience", "projects", "education", "blog", "contact"]
  let currentSection = "home"

  sections.forEach((section) => {
    const element = document.getElementById(section)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 150 && rect.bottom >= 150) {
        currentSection = section
      }
    }
  })

  // Update desktop nav
  document.querySelectorAll(".nav-item").forEach((item) => {
    const section = item.getAttribute("data-section")
    if (section === currentSection) {
      item.classList.add("active")
    } else {
      item.classList.remove("active")
    }
  })

  // Update mobile nav
  document.querySelectorAll(".mobile-nav-item").forEach((item) => {
    const section = item.getAttribute("data-section")
    if (section === currentSection) {
      item.classList.add("active")
    } else {
      item.classList.remove("active")
    }
  })
}

// Mobile Menu Toggle
function setupMobileMenu() {
  const toggle = document.getElementById("mobileMenuToggle")
  const mobileNav = document.getElementById("mobileNav")

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active")
    mobileNav.classList.toggle("active")
  })

  // Close mobile menu when clicking a link
  document.querySelectorAll(".mobile-nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      toggle.classList.remove("active")
      mobileNav.classList.remove("active")
    })
  })
}

// Smooth Scroll
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        const offset = 80
        const targetPosition = target.offsetTop - offset
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderExperience()
  renderSkills()
  renderProjects()
  setupMobileMenu()
  setupSmoothScroll()

  window.addEventListener("scroll", handleScroll)
  handleScroll() // Initial call
})
