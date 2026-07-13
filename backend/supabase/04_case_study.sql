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
