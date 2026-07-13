insert into site_content (id, data)
values (
  'main',
  $site_json${
  "meta": {
    "siteTitle": "Jana — Portfolio",
    "copyrightYear": "2026"
  },
  "settings": {
    "colors": {
      "cream": "#FCF4F0",
      "dark": "#1A1A1A",
      "burgundy": "#6D0101",
      "pink": "#FFD5FB"
    },
    "apiBaseUrl": "http://localhost:5001"
  },
  "hero": {
    "loadLabel": "Load Jana",
    "bgLineOne": "JANA.",
    "bgLineTwo": "DESIGNER.",
    "stripLineOne": "UX/UI Designer & Developer since 2024",
    "stripLineTwo": "DESIGN · RESEARCH · WIREFRAME · PROTOTYPE · DELIVER · ITERATE ·",
    "stripRepeat": 10,
    "nextLabel": "Up Next",
    "nextValue": "Featured Work",
    "lockBtnLocked": "back to scroll",
    "lockBtnUnlocked": "tap to lock",
    "scrollCue": "scroll",
    "email": "janagaber2910@gmail.com",
    "heroImage": "",
    "heroAnimated": "",
    "logo": "",
    "navLinks": [
      {
        "href": "#home",
        "label": "Home"
      },
      {
        "href": "#work",
        "label": "Work"
      },
      {
        "href": "#about",
        "label": "About"
      },
      {
        "href": "#disciplines",
        "label": "Disciplines"
      },
      {
        "href": "#contact",
        "label": "Contact"
      }
    ],
    "navSocials": [
      {
        "href": "https://instagram.com",
        "label": "instagram"
      },
      {
        "href": "https://linkedin.com",
        "label": "linkedin"
      }
    ]
  },
  "featuredWork": {
    "eyebrow": "Featured Work",
    "countLabel": "01 — 06",
    "cardCta": "View project",
    "projects": [
      {
        "id": "work-1",
        "slug": "e-commerce-redesign",
        "index": "01",
        "title": "E-Commerce Redesign",
        "tag": "UX / UI",
        "accent": "#6D0101",
        "year": "2025",
        "role": "Lead UX/UI Designer",
        "client": "Retail brand",
        "summary": "A full storefront redesign focused on clearer product discovery, faster checkout, and a visual system that scales across campaigns.",
        "challenge": "The existing shop buried categories, overloaded the homepage, and dropped users during checkout on mobile.",
        "outcome": "Streamlined navigation, a modular product grid, and a checkout flow that cut drop-off in early testing.",
        "tools": [
          "Figma",
          "Prototyping",
          "User testing"
        ]
      },
      {
        "id": "work-2",
        "slug": "wellness-app",
        "index": "02",
        "title": "Wellness App",
        "tag": "Product Design",
        "accent": "#FFD5FB",
        "year": "2025",
        "role": "Product Designer",
        "client": "Health startup",
        "summary": "A calm, habit-first mobile experience that helps users build routines without feeling overwhelmed.",
        "challenge": "Users wanted guidance but rejected rigid schedules and noisy notification patterns.",
        "outcome": "Flexible daily goals, gentle reminders, and a progress view that rewards consistency over streaks.",
        "tools": [
          "Figma",
          "Design systems",
          "Motion"
        ]
      },
      {
        "id": "work-3",
        "slug": "fashion-lookbook",
        "index": "03",
        "title": "Fashion Lookbook",
        "tag": "Web Design",
        "accent": "#6D0101",
        "year": "2024",
        "role": "Web Designer",
        "client": "Fashion label",
        "summary": "An editorial lookbook site that lets imagery lead while keeping collection browsing effortless.",
        "challenge": "The brand needed a digital presence that felt premium but loaded quickly on mobile networks.",
        "outcome": "Full-bleed editorial layouts, lazy-loaded galleries, and typography that mirrors the print campaign.",
        "tools": [
          "Figma",
          "Webflow",
          "Art direction"
        ]
      },
      {
        "id": "work-4",
        "slug": "portfolio-system",
        "index": "04",
        "title": "Portfolio System",
        "tag": "Development",
        "accent": "#FFD5FB",
        "year": "2026",
        "role": "Designer & Developer",
        "client": "Personal",
        "summary": "A custom portfolio built with intentional motion, scroll choreography, and a modular case-study structure.",
        "challenge": "Off-the-shelf templates felt generic and fought against the brand’s editorial, high-contrast aesthetic.",
        "outcome": "A bespoke site with pinned sections, project pages, and a design language that stays consistent end to end.",
        "tools": [
          "React",
          "GSAP",
          "CSS"
        ]
      },
      {
        "id": "work-5",
        "slug": "campaign-site",
        "index": "05",
        "title": "Campaign Site",
        "tag": "Art Direction",
        "accent": "#6D0101",
        "year": "2024",
        "role": "Art Director",
        "client": "Lifestyle brand",
        "summary": "A launch microsite with bold typography, scroll-driven storytelling, and assets built for social cutdowns.",
        "challenge": "The campaign had to work as a landing page, paid media destination, and press kit in one build.",
        "outcome": "A single responsive system with reusable hero modules and export-ready visual blocks.",
        "tools": [
          "Figma",
          "After Effects",
          "Web design"
        ]
      },
      {
        "id": "work-6",
        "slug": "mobile-banking",
        "index": "06",
        "title": "Mobile Banking",
        "tag": "UX Research",
        "accent": "#FFD5FB",
        "year": "2025",
        "role": "UX Researcher",
        "client": "Fintech",
        "summary": "Research and redesign of core banking flows to make transfers, bills, and balances feel immediate and trustworthy.",
        "challenge": "Users distrusted the app after failed payments and unclear error states during peak usage.",
        "outcome": "Clearer status feedback, simplified transfer steps, and a dashboard that surfaces what matters first.",
        "tools": [
          "Interviews",
          "Figma",
          "Usability testing"
        ]
      }
    ]
  },
  "about": {
    "label": "About Jana",
    "headline": "I design for the people who",
    "headlineHighlight": "actually use it.",
    "paragraph1": "I'm Jana — a UX and graphic designer who cares about how things feel as much as how they look. Every screen, flow, and visual starts with real people and the problems they need solved.",
    "paragraph2": "Based in Cairo, I bridge research, interface design, and brand craft to build digital experiences that are clear, intentional, and human at every touchpoint.",
    "stats": [
      {
        "value": "5+",
        "label": "Years"
      },
      {
        "value": "20+",
        "label": "Projects"
      },
      {
        "value": "Cairo",
        "label": "Based in"
      }
    ],
    "ctaPrimary": "Download CV →",
    "ctaPrimaryHref": "#",
    "ctaSecondary": "View my work ↗",
    "ctaSecondaryHref": "#work",
    "watermark": "JG",
    "badge": "✦ Available for work",
    "floatLabel": "Currently",
    "floatValue": "Open to work",
    "photo": ""
  },
  "disciplines": {
    "ux": {
      "ghostNumber": "01",
      "label": "Discipline 01",
      "title": "UX / UI",
      "skills": [
        "Research",
        "Wireframes",
        "Prototypes",
        "User testing",
        "Design systems"
      ],
      "linkText": "View UX work",
      "linkHref": "#work"
    },
    "graphic": {
      "ghostNumber": "02",
      "label": "Discipline 02",
      "title": "GRAPHIC",
      "skills": [
        "Branding",
        "Identity",
        "Typography",
        "Illustration",
        "Print"
      ],
      "linkText": "View graphic work",
      "linkHref": "#work"
    }
  },
  "process": {
    "eyebrow": "How I work",
    "titleDark": "My ",
    "titleAccent": "process.",
    "meta": "04 steps · hover to explore",
    "steps": {
      "discover": {
        "num": "01",
        "title": "Discover",
        "theme": "burgundy",
        "size": "hero",
        "description": "Understand users, business goals, and the full context before touching any design tool",
        "tags": [
          "Interviews",
          "Research",
          "Audit"
        ]
      },
      "define": {
        "num": "02",
        "title": "Define",
        "theme": "dark",
        "size": "medium",
        "description": "Synthesize insights into clear problem statements and design opportunities worth solving",
        "tags": [
          "Personas",
          "HMW",
          "Journey maps"
        ]
      },
      "design": {
        "num": "03",
        "title": "Design",
        "theme": "petal",
        "size": "small",
        "description": "Ideate and iterate in Figma until the solution feels right.",
        "tags": [
          "Wireframes",
          "Prototype"
        ]
      },
      "deliver": {
        "num": "04",
        "title": "Deliver",
        "theme": "burgundy",
        "size": "small",
        "description": "Ship, test with real users and refine until the product truly works.",
        "tags": [
          "Handoff",
          "Launch"
        ]
      }
    }
  },
  "contact": {
    "marqueeText": "LET'S BUILD · JANA · DESIGN · CAIRO · AVAILABLE · ",
    "marqueeRepeat": 12,
    "topLabel": "Get in touch",
    "availableBadge": "Available for work",
    "headlineLine1": "Let's build",
    "headlineLine2": "something",
    "headlineAccent": "worth using.",
    "location": "Cairo, Egypt · Remote friendly · Open to relocation",
    "email": "janagaber2910@gmail.com",
    "socials": [
      {
        "label": "LinkedIn",
        "href": "https://linkedin.com"
      },
      {
        "label": "Behance",
        "href": "https://behance.net"
      },
      {
        "label": "Dribbble",
        "href": "https://dribbble.com"
      },
      {
        "label": "Instagram",
        "href": "https://instagram.com"
      }
    ],
    "closingLine": "Designed with intention.",
    "copyright": "© 2026 Jana · All rights reserved",
    "footerLogo": ""
  },
  "caseStudies": {
    "wellness-app": {
      "abbreviation": "WA",
      "facts": {
        "role": "UX / UI Designer",
        "timeline": "6 weeks · 2025",
        "tools": "Figma, Maze, FigJam",
        "type": "Mobile App"
      },
      "overview": {
        "sectionNumber": "01",
        "title": "The problem and the solution.",
        "highlight": "problem",
        "problemLabel": "The problem",
        "problemTitle": "What was broken",
        "problemText": "The existing wellness app pushed rigid schedules and noisy notifications. Users opened it once, felt overwhelmed, and never returned — daily habits never had room to form.",
        "solutionLabel": "The solution",
        "solutionTitle": "What I designed",
        "solutionText": "A calm, habit-first mobile experience with flexible daily goals, gentle reminders, and a progress view that rewards consistency over streaks — designed to feel supportive, not demanding."
      },
      "myRole": {
        "sectionNumber": "02",
        "title": "What I specifically did.",
        "highlight": "specifically",
        "intro": "I led the end-to-end UX process on this project — from stakeholder interviews and competitive analysis through to high-fidelity UI and developer handoff.",
        "pills": [
          "User research",
          "Competitive analysis",
          "User personas",
          "Journey mapping",
          "Wireframing",
          "Prototyping",
          "UI Design",
          "Usability testing",
          "Developer handoff"
        ]
      },
      "research": {
        "sectionNumber": "03",
        "title": "What users actually told me.",
        "highlight": "actually",
        "insights": [
          {
            "number": "01",
            "title": "Rigidity repels",
            "text": "Users abandoned the app when missed days reset their progress. Streaks felt punishing rather than motivating — flexibility was non-negotiable."
          },
          {
            "number": "02",
            "title": "Noise erodes trust",
            "text": "Push notifications were the top uninstall trigger. People wanted fewer, better-timed nudges tied to goals they had actually set themselves."
          },
          {
            "number": "03",
            "title": "Progress must feel real",
            "text": "Participants needed visible proof that small actions counted. Abstract metrics meant nothing — tangible weekly summaries drove retention."
          }
        ],
        "persona": {
          "name": "Nour A.",
          "role": "Primary user persona",
          "goal": "Build sustainable wellness habits without guilt when life gets busy",
          "painPoint": "Apps that punish missed days and flood her with irrelevant alerts",
          "behaviour": "Checks in briefly each morning; abandons anything that takes more than 2 minutes",
          "quote": "\"I want something that meets me where I am — not where it thinks I should be.\""
        }
      },
      "quote": {
        "text": "\"I want something that meets me where I am — not where it thinks I should be.\"",
        "attribution": "Nour A. — User interview, February 2025"
      },
      "designProcess": {
        "sectionNumber": "04",
        "title": "From sketch to final screen.",
        "highlight": "sketch",
        "stages": [
          {
            "label": "Low fidelity wireframe",
            "variant": "low"
          },
          {
            "label": "Mid fidelity",
            "variant": "mid"
          },
          {
            "label": "High fidelity",
            "variant": "high"
          }
        ]
      },
      "finalDesign": {
        "sectionNumber": "05",
        "title": "The final screens.",
        "highlight": "final",
        "screens": [
          {
            "label": "Home screen",
            "variant": "home"
          },
          {
            "label": "Detail screen",
            "variant": "detail"
          },
          {
            "label": "Checkout screen",
            "variant": "checkout"
          }
        ]
      },
      "outcomes": {
        "sectionNumber": "06",
        "title": "The proof it worked.",
        "highlight": "proof",
        "metrics": [
          {
            "value": "89%",
            "label": "Task completion rate — up from 58% in baseline testing"
          },
          {
            "value": "4.7",
            "label": "Average user satisfaction score out of 5"
          },
          {
            "value": "-40%",
            "label": "Reduction in time on task across core flows"
          }
        ]
      }
    }
  }
}$site_json$::jsonb
)
on conflict (id) do update set data = excluded.data;
