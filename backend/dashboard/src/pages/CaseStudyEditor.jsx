import { useParams, Link } from 'react-router-dom';
import { useCms } from '../context/ContentContext';
import { Card, Field, ImageUpload, Input, ListEditor, SaveBar, Textarea } from '../components/Form';

const BENTO_MAX_SCREENS = 4;

const DEFAULT_BENTO_SCREENS = [
  { label: 'Screen 1', imageUrl: '' },
  { label: 'Screen 2', imageUrl: '' },
  { label: 'Screen 3', imageUrl: '' },
  { label: 'Screen 4', imageUrl: '' },
];

const SCREEN_FIELDS = [
  { key: 'label', label: 'Name' },
  { key: 'imageUrl', label: 'Image', type: 'image', hint: 'Choose from your device.' },
];

function ensureCaseStudy(content, slug) {
  const existing = content.caseStudies?.[slug];
  if (existing) return existing;
  const project = content.featuredWork.projects.find((p) => p.slug === slug);
  return {
    heroImage: '',
    abbreviation: project?.title?.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() || 'PRJ',
    facts: { role: project?.role || '', timeline: `6 weeks · ${project?.year || ''}`, tools: (project?.tools || []).join(', '), type: project?.tag || '' },
    overview: { sectionNumber: '01', title: 'The problem and the solution.', highlight: 'problem', problemLabel: 'The problem', problemTitle: 'What was broken', problemText: project?.challenge || '', solutionLabel: 'The solution', solutionTitle: 'What I designed', solutionText: project?.outcome || '' },
    myRole: { sectionNumber: '02', title: 'What I specifically did.', highlight: 'specifically', intro: '', pills: [] },
    research: { sectionNumber: '03', title: 'What users actually told me.', highlight: 'actually', insights: [], persona: { name: '', role: '', goal: '', painPoint: '', behaviour: '', quote: '' } },
    quote: { text: '', attribution: '' },
    heroScreens: [...DEFAULT_BENTO_SCREENS],
    designProcess: { sectionNumber: '04', title: 'From sketch to final screen.', highlight: 'sketch', stages: [{ label: 'Low fidelity wireframe', variant: 'low', imageUrl: '' }, { label: 'Mid fidelity', variant: 'mid', imageUrl: '' }, { label: 'High fidelity', variant: 'high', imageUrl: '' }] },
    finalDesign: { sectionNumber: '05', title: 'The final screens.', highlight: 'final', screens: [{ label: 'Home screen', variant: 'home', imageUrl: '' }, { label: 'Detail screen', variant: 'detail', imageUrl: '' }, { label: 'Checkout screen', variant: 'checkout', imageUrl: '' }] },
    outcomes: { sectionNumber: '06', title: 'The proof it worked.', highlight: 'proof', metrics: [] },
  };
}

export default function CaseStudyEditor() {
  const { slug } = useParams();
  const { content, update, saveAll, saving } = useCms();
  if (!content) return null;

  const project = content.featuredWork.projects.find((p) => p.slug === slug);
  const cs = content.caseStudies?.[slug] || ensureCaseStudy(content, slug);

  const setCs = (next) => {
    update((prev) => ({
      ...prev,
      caseStudies: { ...prev.caseStudies, [slug]: next },
    }));
  };

  const set = (path, val) => {
    const next = JSON.parse(JSON.stringify(cs));
    const keys = path.split('.');
    let ref = next;
    for (let i = 0; i < keys.length - 1; i += 1) ref = ref[keys[i]];
    ref[keys[keys.length - 1]] = val;
    setCs(next);
  };

  const save = () => {
    const next = JSON.parse(JSON.stringify(content));
    if (!next.caseStudies[slug]) next.caseStudies[slug] = cs;
    return saveAll(next);
  };

  if (!project) {
    return (
      <div className="page">
        <p>Project not found. <Link to="/work">Back to work</Link></p>
      </div>
    );
  }

  const bentoScreens = (cs.heroScreens?.length ? cs.heroScreens : DEFAULT_BENTO_SCREENS)
    .slice(0, BENTO_MAX_SCREENS);

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow"><Link to={`/work/project/${slug}`}>← {project.title}</Link></p>
        <h1>Case study — {project.title}</h1>
        <p className="muted">Pick every image from your device. No links needed — just tap, choose, and save.</p>
      </header>

      <Card title="Page hero image">
        <ImageUpload
          label="Hero image"
          hint="Large image at the top of the project page, above the bento grid."
          value={cs.heroImage || ''}
          onChange={(v) => set('heroImage', v)}
        />
      </Card>

      <Card title="Bento grid screens">
        <p className="muted">Exactly 4 screens in the grid under the hero. Pick one image per slot.</p>
        <ListEditor
          items={bentoScreens}
          onChange={(v) => set('heroScreens', v.slice(0, BENTO_MAX_SCREENS))}
          newItem={{ label: `Screen ${bentoScreens.length + 1}`, imageUrl: '' }}
          maxItems={BENTO_MAX_SCREENS}
          fields={SCREEN_FIELDS}
        />
      </Card>

      <Card title="Hero facts">
        <Field label="Watermark abbreviation"><Input value={cs.abbreviation} onChange={(v) => set('abbreviation', v)} /></Field>
        <Field label="Role"><Input value={cs.facts.role} onChange={(v) => set('facts.role', v)} /></Field>
        <Field label="Timeline"><Input value={cs.facts.timeline} onChange={(v) => set('facts.timeline', v)} /></Field>
        <Field label="Tools"><Input value={cs.facts.tools} onChange={(v) => set('facts.tools', v)} /></Field>
        <Field label="Type"><Input value={cs.facts.type} onChange={(v) => set('facts.type', v)} /></Field>
      </Card>

      <Card title="01 — Overview">
        <Field label="Title"><Input value={cs.overview.title} onChange={(v) => set('overview.title', v)} /></Field>
        <Field label="Highlight word"><Input value={cs.overview.highlight} onChange={(v) => set('overview.highlight', v)} /></Field>
        <Field label="Problem text"><Textarea value={cs.overview.problemText} onChange={(v) => set('overview.problemText', v)} rows={4} /></Field>
        <Field label="Solution text"><Textarea value={cs.overview.solutionText} onChange={(v) => set('overview.solutionText', v)} rows={4} /></Field>
      </Card>

      <Card title="02 — My role">
        <Field label="Title"><Input value={cs.myRole.title} onChange={(v) => set('myRole.title', v)} /></Field>
        <Field label="Intro"><Textarea value={cs.myRole.intro} onChange={(v) => set('myRole.intro', v)} rows={4} /></Field>
        <Field label="Pills (comma separated)">
          <Input value={(cs.myRole.pills || []).join(', ')} onChange={(v) => set('myRole.pills', v.split(',').map((s) => s.trim()).filter(Boolean))} />
        </Field>
      </Card>

      <Card title="03 — Research insights">
        <ListEditor
          items={cs.research.insights}
          onChange={(v) => set('research.insights', v)}
          newItem={{ number: '01', title: 'Insight', text: '' }}
          fields={[
            { key: 'number', label: 'Number' },
            { key: 'title', label: 'Title' },
            { key: 'text', label: 'Text', type: 'textarea' },
          ]}
        />
        <h4 className="sub-title">Persona</h4>
        <Field label="Name"><Input value={cs.research.persona.name} onChange={(v) => set('research.persona.name', v)} /></Field>
        <Field label="Role"><Input value={cs.research.persona.role} onChange={(v) => set('research.persona.role', v)} /></Field>
        <Field label="Goal"><Textarea value={cs.research.persona.goal} onChange={(v) => set('research.persona.goal', v)} /></Field>
        <Field label="Pain point"><Textarea value={cs.research.persona.painPoint} onChange={(v) => set('research.persona.painPoint', v)} /></Field>
        <Field label="Behaviour"><Textarea value={cs.research.persona.behaviour} onChange={(v) => set('research.persona.behaviour', v)} /></Field>
        <Field label="Quote"><Textarea value={cs.research.persona.quote} onChange={(v) => set('research.persona.quote', v)} /></Field>
      </Card>

      <Card title="Quote section">
        <Field label="Quote"><Textarea value={cs.quote.text} onChange={(v) => set('quote.text', v)} rows={3} /></Field>
        <Field label="Attribution"><Input value={cs.quote.attribution} onChange={(v) => set('quote.attribution', v)} /></Field>
      </Card>

      <Card title="04 — Wireframes (design process)">
        <p className="muted">One image per wireframe stage.</p>
        <ListEditor
          items={cs.designProcess.stages}
          onChange={(v) => set('designProcess.stages', v)}
          newItem={{ label: 'Wireframe stage', variant: 'low', imageUrl: '' }}
          fields={SCREEN_FIELDS}
        />
      </Card>

      <Card title="05 — Final screens">
        <p className="muted">Final UI screens shown in the case study section.</p>
        <ListEditor
          items={cs.finalDesign.screens}
          onChange={(v) => set('finalDesign.screens', v)}
          newItem={{ label: 'Final screen', variant: 'home', imageUrl: '' }}
          fields={SCREEN_FIELDS}
        />
      </Card>

      <Card title="06 — Outcomes">
        <ListEditor
          items={cs.outcomes.metrics}
          onChange={(v) => set('outcomes.metrics', v)}
          newItem={{ value: '0%', label: 'Metric description' }}
          fields={[
            { key: 'value', label: 'Value' },
            { key: 'label', label: 'Label', type: 'textarea' },
          ]}
        />
      </Card>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}
