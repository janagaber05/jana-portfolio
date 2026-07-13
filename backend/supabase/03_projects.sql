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
