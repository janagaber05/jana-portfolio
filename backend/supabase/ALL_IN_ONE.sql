create table if not exists site_content (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists projects (
  id text primary key,
  slug text unique not null,
  index_label text,
  title text,
  tag text,
  accent text,
  year text,
  role text,
  client text,
  summary text,
  challenge text,
  outcome text,
  tools text[],
  sort_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists case_studies (
  project_slug text primary key references projects(slug) on delete cascade,
  abbreviation text,
  facts jsonb,
  overview jsonb,
  my_role jsonb,
  research jsonb,
  quote jsonb,
  design_process jsonb,
  final_design jsonb,
  outcomes jsonb,
  updated_at timestamptz default now()
);

create index if not exists projects_slug_idx on projects(slug);
create index if not exists projects_sort_order_idx on projects(sort_order);

alter table site_content enable row level security;
alter table projects enable row level security;
alter table case_studies enable row level security;

drop policy if exists site_content_public_read on site_content;
drop policy if exists site_content_auth_write on site_content;
drop policy if exists projects_public_read on projects;
drop policy if exists projects_auth_write on projects;
drop policy if exists case_studies_public_read on case_studies;
drop policy if exists case_studies_auth_write on case_studies;

create policy site_content_public_read on site_content for select using (true);
create policy site_content_auth_write on site_content for all to authenticated using (true) with check (true);

create policy projects_public_read on projects for select using (true);
create policy projects_auth_write on projects for all to authenticated using (true) with check (true);

create policy case_studies_public_read on case_studies for select using (true);
create policy case_studies_auth_write on case_studies for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;

drop policy if exists portfolio_media_public_read on storage.objects;
drop policy if exists portfolio_media_auth_write on storage.objects;

create policy portfolio_media_public_read on storage.objects
  for select using (bucket_id = 'portfolio-media');

create policy portfolio_media_auth_write on storage.objects
  for all to authenticated
  using (bucket_id = 'portfolio-media')
  with check (bucket_id = 'portfolio-media');

insert into projects (id, slug, index_label, title, tag, accent, year, role, client, summary, challenge, outcome, tools, sort_order)
values
  ('work-1', 'e-commerce-redesign', '01', 'E-Commerce Redesign', 'UX / UI', '#6D0101', '2025', 'Lead UX/UI Designer', 'Retail brand', 'A full storefront redesign focused on clearer product discovery, faster checkout, and a visual system that scales across campaigns.', 'The existing shop buried categories, overloaded the homepage, and dropped users during checkout on mobile.', 'Streamlined navigation, a modular product grid, and a checkout flow that cut drop-off in early testing.', array['Figma', 'Prototyping', 'User testing'], 1),
  ('work-2', 'wellness-app', '02', 'Wellness App', 'Product Design', '#FFD5FB', '2025', 'Product Designer', 'Health startup', 'A calm, habit-first mobile experience that helps users build routines without feeling overwhelmed.', 'Users wanted guidance but rejected rigid schedules and noisy notification patterns.', 'Flexible daily goals, gentle reminders, and a progress view that rewards consistency over streaks.', array['Figma', 'Design systems', 'Motion'], 2),
  ('work-3', 'fashion-lookbook', '03', 'Fashion Lookbook', 'Web Design', '#6D0101', '2024', 'Web Designer', 'Fashion label', 'An editorial lookbook site that lets imagery lead while keeping collection browsing effortless.', 'The brand needed a digital presence that felt premium but loaded quickly on mobile networks.', 'Full-bleed editorial layouts, lazy-loaded galleries, and typography that mirrors the print campaign.', array['Figma', 'Webflow', 'Art direction'], 3),
  ('work-4', 'portfolio-system', '04', 'Portfolio System', 'Development', '#FFD5FB', '2026', 'Designer & Developer', 'Personal', 'A custom portfolio built with intentional motion, scroll choreography, and a modular case-study structure.', 'Off-the-shelf templates felt generic and fought against the brand''s editorial, high-contrast aesthetic.', 'A bespoke site with pinned sections, project pages, and a design language that stays consistent end to end.', array['React', 'GSAP', 'CSS'], 4),
  ('work-5', 'campaign-site', '05', 'Campaign Site', 'Art Direction', '#6D0101', '2024', 'Art Director', 'Lifestyle brand', 'A launch microsite with bold typography, scroll-driven storytelling, and assets built for social cutdowns.', 'The campaign had to work as a landing page, paid media destination, and press kit in one build.', 'A single responsive system with reusable hero modules and export-ready visual blocks.', array['Figma', 'After Effects', 'Web design'], 5),
  ('work-6', 'mobile-banking', '06', 'Mobile Banking', 'UX Research', '#FFD5FB', '2025', 'UX Researcher', 'Fintech', 'Research and redesign of core banking flows to make transfers, bills, and balances feel immediate and trustworthy.', 'Users distrusted the app after failed payments and unclear error states during peak usage.', 'Clearer status feedback, simplified transfer steps, and a dashboard that surfaces what matters first.', array['Interviews', 'Figma', 'Usability testing'], 6)
on conflict (id) do update set
  slug = excluded.slug,
  index_label = excluded.index_label,
  title = excluded.title,
  tag = excluded.tag,
  accent = excluded.accent,
  year = excluded.year,
  role = excluded.role,
  client = excluded.client,
  summary = excluded.summary,
  challenge = excluded.challenge,
  outcome = excluded.outcome,
  tools = excluded.tools,
  sort_order = excluded.sort_order;

insert into case_studies (project_slug, abbreviation, facts, overview, my_role, research, quote, design_process, final_design, outcomes)
values (
  'wellness-app',
  'WA',
  $facts${"role":"UX / UI Designer","timeline":"6 weeks · 2025","tools":"Figma, Maze, FigJam","type":"Mobile App"}$facts$::jsonb,
  $overview${"sectionNumber":"01","title":"The problem and the solution.","highlight":"problem","problemLabel":"The problem","problemTitle":"What was broken","problemText":"The existing wellness app pushed rigid schedules and noisy notifications. Users opened it once, felt overwhelmed, and never returned — daily habits never had room to form.","solutionLabel":"The solution","solutionTitle":"What I designed","solutionText":"A calm, habit-first mobile experience with flexible daily goals, gentle reminders, and a progress view that rewards consistency over streaks — designed to feel supportive, not demanding."}$overview$::jsonb,
  $myrole${"sectionNumber":"02","title":"What I specifically did.","highlight":"specifically","intro":"I led the end-to-end UX process on this project — from stakeholder interviews and competitive analysis through to high-fidelity UI and developer handoff.","pills":["User research","Competitive analysis","User personas","Journey mapping","Wireframing","Prototyping","UI Design","Usability testing","Developer handoff"]}$myrole$::jsonb,
  $research${"sectionNumber":"03","title":"What users actually told me.","highlight":"actually","insights":[{"number":"01","title":"Rigidity repels","text":"Users abandoned the app when missed days reset their progress. Streaks felt punishing rather than motivating — flexibility was non-negotiable."},{"number":"02","title":"Noise erodes trust","text":"Push notifications were the top uninstall trigger. People wanted fewer, better-timed nudges tied to goals they had actually set themselves."},{"number":"03","title":"Progress must feel real","text":"Participants needed visible proof that small actions counted. Abstract metrics meant nothing — tangible weekly summaries drove retention."}],"persona":{"name":"Nour A.","role":"Primary user persona","goal":"Build sustainable wellness habits without guilt when life gets busy","painPoint":"Apps that punish missed days and flood her with irrelevant alerts","behaviour":"Checks in briefly each morning; abandons anything that takes more than 2 minutes","quote":"\"I want something that meets me where I am — not where it thinks I should be.\""}}$research$::jsonb,
  $quote${"text":"\"I want something that meets me where I am — not where it thinks I should be.\"","attribution":"Nour A. — User interview, February 2025"}$quote$::jsonb,
  $process${"sectionNumber":"04","title":"From sketch to final screen.","highlight":"sketch","stages":[{"label":"Low fidelity wireframe","variant":"low"},{"label":"Mid fidelity","variant":"mid"},{"label":"High fidelity","variant":"high"}]}$process$::jsonb,
  $final${"sectionNumber":"05","title":"The final screens.","highlight":"final","screens":[{"label":"Home screen","variant":"home"},{"label":"Detail screen","variant":"detail"},{"label":"Checkout screen","variant":"checkout"}]}$final$::jsonb,
  $outcomes${"sectionNumber":"06","title":"The proof it worked.","highlight":"proof","metrics":[{"value":"89%","label":"Task completion rate — up from 58% in baseline testing"},{"value":"4.7","label":"Average user satisfaction score out of 5"},{"value":"-40%","label":"Reduction in time on task across core flows"}]}$outcomes$::jsonb
)
on conflict (project_slug) do update set
  abbreviation = excluded.abbreviation,
  facts = excluded.facts,
  overview = excluded.overview,
  my_role = excluded.my_role,
  research = excluded.research,
  quote = excluded.quote,
  design_process = excluded.design_process,
  final_design = excluded.final_design,
  outcomes = excluded.outcomes;

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

create or replace function get_site_content()
returns jsonb
language sql
stable
as $$
  select data from site_content where id = 'main';
$$;

grant execute on function get_site_content() to anon, authenticated;

create table if not exists analytics_page_views (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  session_id uuid not null,
  path text not null default '/',
  created_at timestamptz not null default now()
);

create table if not exists analytics_presence (
  session_id uuid primary key,
  visitor_id uuid not null,
  path text not null default '/',
  last_seen timestamptz not null default now()
);

create index if not exists analytics_page_views_created_at_idx
  on analytics_page_views (created_at desc);

create index if not exists analytics_page_views_visitor_id_idx
  on analytics_page_views (visitor_id);

create index if not exists analytics_presence_last_seen_idx
  on analytics_presence (last_seen desc);

alter table analytics_page_views enable row level security;
alter table analytics_presence enable row level security;

drop policy if exists analytics_page_views_insert on analytics_page_views;
drop policy if exists analytics_page_views_select on analytics_page_views;
drop policy if exists analytics_presence_insert on analytics_presence;
drop policy if exists analytics_presence_update on analytics_presence;
drop policy if exists analytics_presence_select on analytics_presence;

create policy analytics_page_views_insert on analytics_page_views
  for insert to anon, authenticated
  with check (true);

create policy analytics_page_views_select on analytics_page_views
  for select to authenticated
  using (true);

create policy analytics_presence_insert on analytics_presence
  for insert to anon, authenticated
  with check (true);

create policy analytics_presence_update on analytics_presence
  for update to anon, authenticated
  using (true)
  with check (true);

create policy analytics_presence_select on analytics_presence
  for select to authenticated
  using (true);

create or replace function get_site_analytics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;

  delete from analytics_presence
  where last_seen < now_ts - interval '1 day';

  return json_build_object(
    'live', (
      select count(*)::int
      from analytics_presence
      where last_seen > now_ts - interval '2 minutes'
    ),
    'yesterday', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= date_trunc('day', now_ts - interval '1 day')
        and created_at < date_trunc('day', now_ts)
    ),
    'last_7_days', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= now_ts - interval '7 days'
    ),
    'last_30_days', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= now_ts - interval '30 days'
    ),
    'last_6_months', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= now_ts - interval '6 months'
    ),
    'last_year', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= now_ts - interval '1 year'
    )
  );
end;
$$;

grant execute on function get_site_analytics() to authenticated;


-- ===========================================================================
-- 10_security_hardening (appended — overrides earlier open write policies)
-- ===========================================================================

-- Security hardening: admin-only CMS writes, constrained public inserts, safer RPCs.
-- Idempotent. Run after 01–09. Does not weaken existing public reads of published content.

-- ---------------------------------------------------------------------------
-- Admins registry (no API policies → inaccessible via PostgREST)
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- Intentionally no policies: only security definer functions can read this table.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Make yourself admin (run once in SQL editor, replace email):
-- insert into public.admins (user_id)
-- select id from auth.users where email = '<MY_EMAIL>';

-- ---------------------------------------------------------------------------
-- site_content / projects / case_studies
-- ---------------------------------------------------------------------------
drop policy if exists site_content_public_read on public.site_content;
drop policy if exists site_content_auth_write on public.site_content;
drop policy if exists site_content_admin_select on public.site_content;
drop policy if exists site_content_admin_insert on public.site_content;
drop policy if exists site_content_admin_update on public.site_content;
drop policy if exists site_content_admin_delete on public.site_content;

-- Public site only sees published content
create policy site_content_public_read on public.site_content
  for select to anon
  using (id = 'main');

create policy site_content_admin_select on public.site_content
  for select to authenticated
  using (public.is_admin());

create policy site_content_admin_insert on public.site_content
  for insert to authenticated
  with check (public.is_admin());

create policy site_content_admin_update on public.site_content
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy site_content_admin_delete on public.site_content
  for delete to authenticated
  using (public.is_admin());

drop policy if exists projects_public_read on public.projects;
drop policy if exists projects_auth_write on public.projects;
drop policy if exists projects_admin_insert on public.projects;
drop policy if exists projects_admin_update on public.projects;
drop policy if exists projects_admin_delete on public.projects;

create policy projects_public_read on public.projects
  for select using (true);

create policy projects_admin_insert on public.projects
  for insert to authenticated
  with check (public.is_admin());

create policy projects_admin_update on public.projects
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy projects_admin_delete on public.projects
  for delete to authenticated
  using (public.is_admin());

drop policy if exists case_studies_public_read on public.case_studies;
drop policy if exists case_studies_auth_write on public.case_studies;
drop policy if exists case_studies_admin_insert on public.case_studies;
drop policy if exists case_studies_admin_update on public.case_studies;
drop policy if exists case_studies_admin_delete on public.case_studies;

create policy case_studies_public_read on public.case_studies
  for select using (true);

create policy case_studies_admin_insert on public.case_studies
  for insert to authenticated
  with check (public.is_admin());

create policy case_studies_admin_update on public.case_studies
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy case_studies_admin_delete on public.case_studies
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: portfolio-media
-- ---------------------------------------------------------------------------
update storage.buckets
set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ]
where id = 'portfolio-media';

drop policy if exists portfolio_media_public_read on storage.objects;
drop policy if exists portfolio_media_auth_write on storage.objects;
drop policy if exists portfolio_media_admin_insert on storage.objects;
drop policy if exists portfolio_media_admin_update on storage.objects;
drop policy if exists portfolio_media_admin_delete on storage.objects;

create policy portfolio_media_public_read on storage.objects
  for select
  using (bucket_id = 'portfolio-media');

create policy portfolio_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy portfolio_media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin())
  with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy portfolio_media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- CMS revisions / activity / contact
-- ---------------------------------------------------------------------------
drop policy if exists site_content_revisions_select on public.site_content_revisions;
drop policy if exists site_content_revisions_insert on public.site_content_revisions;
drop policy if exists cms_activity_log_select on public.cms_activity_log;
drop policy if exists cms_activity_log_insert on public.cms_activity_log;
drop policy if exists contact_submissions_insert on public.contact_submissions;
drop policy if exists contact_submissions_select on public.contact_submissions;
drop policy if exists contact_submissions_update on public.contact_submissions;

create policy site_content_revisions_select on public.site_content_revisions
  for select to authenticated
  using (public.is_admin());

create policy site_content_revisions_insert on public.site_content_revisions
  for insert to authenticated
  with check (public.is_admin() and created_by = auth.uid());

create policy cms_activity_log_select on public.cms_activity_log
  for select to authenticated
  using (public.is_admin());

create policy cms_activity_log_insert on public.cms_activity_log
  for insert to authenticated
  with check (public.is_admin() and created_by = auth.uid());

-- Contact: public insert with validation; admin read/update only
alter table public.contact_submissions
  drop constraint if exists contact_submissions_name_len;
alter table public.contact_submissions
  drop constraint if exists contact_submissions_email_len;
alter table public.contact_submissions
  drop constraint if exists contact_submissions_email_format;
alter table public.contact_submissions
  drop constraint if exists contact_submissions_message_len;

alter table public.contact_submissions
  add constraint contact_submissions_name_len
    check (char_length(btrim(name)) >= 1 and char_length(name) <= 100);
alter table public.contact_submissions
  add constraint contact_submissions_email_len
    check (char_length(email) <= 200);
alter table public.contact_submissions
  add constraint contact_submissions_email_format
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
alter table public.contact_submissions
  add constraint contact_submissions_message_len
    check (char_length(btrim(message)) >= 1 and char_length(message) <= 5000);

create policy contact_submissions_insert on public.contact_submissions
  for insert to anon, authenticated
  with check (
    char_length(btrim(name)) >= 1 and char_length(name) <= 100
    and char_length(email) <= 200
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(btrim(message)) >= 1 and char_length(message) <= 5000
    and read_at is null
  );

create policy contact_submissions_select on public.contact_submissions
  for select to authenticated
  using (public.is_admin());

create policy contact_submissions_update on public.contact_submissions
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ~5 contact messages per email per hour
create or replace function public.enforce_contact_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*)::int into recent_count
  from public.contact_submissions
  where lower(email) = lower(new.email)
    and created_at > now() - interval '1 hour';

  if recent_count >= 5 then
    raise exception 'rate limit exceeded';
  end if;

  new.name := left(btrim(new.name), 100);
  new.email := left(lower(btrim(new.email)), 200);
  new.message := left(btrim(new.message), 5000);
  new.read_at := null;
  return new;
end;
$$;

drop trigger if exists contact_submissions_rate_limit on public.contact_submissions;
create trigger contact_submissions_rate_limit
  before insert on public.contact_submissions
  for each row execute function public.enforce_contact_rate_limit();

-- ---------------------------------------------------------------------------
-- Analytics constraints + tighter policies
-- ---------------------------------------------------------------------------
alter table public.analytics_page_views
  drop constraint if exists analytics_page_views_path_len;
alter table public.analytics_page_views
  drop constraint if exists analytics_page_views_path_format;

alter table public.analytics_page_views
  add constraint analytics_page_views_path_len
    check (char_length(path) <= 300);
alter table public.analytics_page_views
  add constraint analytics_page_views_path_format
    check (path like '/%');

alter table public.analytics_presence
  drop constraint if exists analytics_presence_path_len;
alter table public.analytics_presence
  drop constraint if exists analytics_presence_path_format;

alter table public.analytics_presence
  add constraint analytics_presence_path_len
    check (char_length(path) <= 300);
alter table public.analytics_presence
  add constraint analytics_presence_path_format
    check (path like '/%');

drop policy if exists analytics_page_views_insert on public.analytics_page_views;
drop policy if exists analytics_page_views_select on public.analytics_page_views;
drop policy if exists analytics_presence_insert on public.analytics_presence;
drop policy if exists analytics_presence_update on public.analytics_presence;
drop policy if exists analytics_presence_select on public.analytics_presence;

create policy analytics_page_views_insert on public.analytics_page_views
  for insert to anon, authenticated
  with check (
    path like '/%'
    and char_length(path) <= 300
  );

create policy analytics_page_views_select on public.analytics_page_views
  for select to authenticated
  using (public.is_admin());

create policy analytics_presence_insert on public.analytics_presence
  for insert to anon, authenticated
  with check (
    path like '/%'
    and char_length(path) <= 300
  );

-- Upsert updates the row matching session_id (PK). Session IDs are UUIDs;
-- without SELECT, guessing another session is impractical. Still constrain payload.
create policy analytics_presence_update on public.analytics_presence
  for update to anon, authenticated
  using (true)
  with check (
    path like '/%'
    and char_length(path) <= 300
    and last_seen <= now() + interval '2 minutes'
  );

create policy analytics_presence_select on public.analytics_presence
  for select to authenticated
  using (public.is_admin());

-- ~1 page view insert per session every 2 seconds
create or replace function public.enforce_analytics_view_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.analytics_page_views
    where session_id = new.session_id
      and created_at > now() - interval '2 seconds'
  ) then
    raise exception 'rate limit exceeded';
  end if;

  new.path := left(new.path, 300);
  if left(new.path, 1) <> '/' then
    new.path := '/' || new.path;
  end if;
  return new;
end;
$$;

drop trigger if exists analytics_page_views_rate_limit on public.analytics_page_views;
create trigger analytics_page_views_rate_limit
  before insert on public.analytics_page_views
  for each row execute function public.enforce_analytics_view_rate_limit();

create or replace function public.sanitize_analytics_presence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.path := left(coalesce(new.path, '/'), 300);
  if left(new.path, 1) <> '/' then
    new.path := '/' || new.path;
  end if;
  if new.last_seen is null or new.last_seen > now() + interval '2 minutes' then
    new.last_seen := now();
  end if;
  return new;
end;
$$;

drop trigger if exists analytics_presence_rate_limit on public.analytics_presence;
drop trigger if exists analytics_presence_sanitize on public.analytics_presence;
create trigger analytics_presence_sanitize
  before insert or update on public.analytics_presence
  for each row execute function public.sanitize_analytics_presence();

-- ---------------------------------------------------------------------------
-- Security definer RPCs
-- ---------------------------------------------------------------------------
create or replace function public.get_site_content()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return (select data from public.site_content where id = 'main');
end;
$$;

revoke all on function public.get_site_content() from public;
grant execute on function public.get_site_content() to anon, authenticated;

create or replace function public.get_site_analytics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  delete from public.analytics_presence
  where last_seen < now_ts - interval '1 day';

  return json_build_object(
    'live', (
      select count(*)::int
      from public.analytics_presence
      where last_seen > now_ts - interval '2 minutes'
    ),
    'yesterday', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= date_trunc('day', now_ts - interval '1 day')
        and created_at < date_trunc('day', now_ts)
    ),
    'last_7_days', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= now_ts - interval '7 days'
    ),
    'last_30_days', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= now_ts - interval '30 days'
    ),
    'last_6_months', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= now_ts - interval '6 months'
    ),
    'last_year', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= now_ts - interval '1 year'
    ),
    'top_pages', coalesce((
      select json_agg(row_to_json(t))
      from (
        select path, count(*)::int as views
        from public.analytics_page_views
        where created_at >= now_ts - interval '30 days'
        group by path
        order by views desc
        limit 10
      ) t
    ), '[]'::json)
  );
end;
$$;

revoke all on function public.get_site_analytics() from public, anon;
grant execute on function public.get_site_analytics() to authenticated;
