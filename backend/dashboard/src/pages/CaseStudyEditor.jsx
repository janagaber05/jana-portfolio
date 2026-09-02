import { useParams, Link } from 'react-router-dom';
import { useContentDraft } from '../hooks/useContentDraft';
import EditorActions from '../components/EditorActions';
import {
  Card,
  Field,
  ImageUpload,
  Input,
  ListEditor,
  SectionVisibilityToggle,
  Textarea,
  VideoUpload,
} from '../components/Form';
import { DEFAULT_SECTION_VISIBILITY, mergeSectionVisibility } from '../utils/caseStudyImage';

const DEFAULT_BENTO_SCREENS = [
  { label: 'Screen 1', imageUrl: '' },
  { label: 'Screen 2', imageUrl: '' },
  { label: 'Screen 3', imageUrl: '' },
  { label: 'Screen 4', imageUrl: '' },
];

const DEFAULT_WALKTHROUGH = {
  sectionNumber: '04',
  title: 'Project walkthrough.',
  highlight: 'walkthrough',
  videoUrl: '',
  posterUrl: '',
  caption: '',
};

const SCREEN_FIELDS = [
  {
    key: 'label',
    label: 'Name',
  },
  {
    key: 'imageUrl',
    label: 'Image',
    type: 'framed-image',
    hint: 'Upload the full image, then choose the visible part. Visitors tap to see the full image.',
    aspect: 3 / 4,
  },
];

function SectionCard({ title, visible, onVisibleChange, children }) {
  return (
    <section className="card">
      <div className="card-header-row">
        <h3 className="card-title">{title}</h3>
        <SectionVisibilityToggle checked={visible} onChange={onVisibleChange} />
      </div>
      {children}
    </section>
  );
}

function ensureCaseStudy(content, slug) {
  const existing = content.caseStudies?.[slug];
  const project = content.featuredWork.projects.find((p) => p.slug === slug);
  const blank = {
    heroImage: '',
    abbreviation: project?.title?.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() || 'PRJ',
    facts: { role: project?.role || '', timeline: `6 weeks · ${project?.year || ''}`, tools: (project?.tools || []).join(', '), type: project?.tag || '' },
    overview: { sectionNumber: '01', title: 'The problem and the solution.', highlight: 'problem', problemLabel: 'The problem', problemTitle: 'What was broken', problemText: project?.challenge || '', solutionLabel: 'The solution', solutionTitle: 'What I designed', solutionText: project?.outcome || '' },
    myRole: { sectionNumber: '02', title: 'What I specifically did.', highlight: 'specifically', intro: '', pills: [] },
    research: { sectionNumber: '03', title: 'What users actually told me.', highlight: 'actually', insights: [], persona: { name: '', role: '', goal: '', painPoint: '', behaviour: '', quote: '' } },
    quote: { text: '', attribution: '' },
    walkthrough: { ...DEFAULT_WALKTHROUGH },
    heroScreens: [...DEFAULT_BENTO_SCREENS],
    designProcess: { sectionNumber: '05', title: 'From sketch to final screen.', highlight: 'sketch', stages: [{ label: 'Low fidelity wireframe', variant: 'low', imageUrl: '' }, { label: 'Mid fidelity', variant: 'mid', imageUrl: '' }, { label: 'High fidelity', variant: 'high', imageUrl: '' }] },
    finalDesign: { sectionNumber: '06', title: 'The final screens.', highlight: 'final', screens: [{ label: 'Home screen', variant: 'home', imageUrl: '' }, { label: 'Detail screen', variant: 'detail', imageUrl: '' }, { label: 'Checkout screen', variant: 'checkout', imageUrl: '' }] },
    outcomes: { sectionNumber: '07', title: 'The proof it worked.', highlight: 'proof', metrics: [] },
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
  };

  if (!existing) return blank;

  return {
    ...blank,
    ...existing,
    walkthrough: { ...DEFAULT_WALKTHROUGH, ...(existing.walkthrough || {}) },
    sectionVisibility: mergeSectionVisibility(existing.sectionVisibility),
  };
}

export default function CaseStudyEditor() {
  const { slug } = useParams();
  const {
    draft, updateDraft, save, publish, preview, saving, publishing, hasUnpublishedChanges, ready,
  } = useContentDraft();
  if (!ready) return null;

  const project = draft.featuredWork.projects.find((p) => p.slug === slug);
  const cs = ensureCaseStudy(draft, slug);

  const setCs = (next) => {
    updateDraft((prev) => ({
      ...prev,
      caseStudies: { ...prev.caseStudies, [slug]: next },
    }));
  };

  const set = (path, val) => {
    const next = structuredClone(cs);
    const keys = path.split('.');
    let ref = next;
    for (let i = 0; i < keys.length - 1; i += 1) ref = ref[keys[i]];
    ref[keys[keys.length - 1]] = val;
    setCs(next);
  };

  if (!project) {
    return (
      <div className="page">
        <p>Project not found. <Link to="/work">Back to work</Link></p>
      </div>
    );
  }

  const setVisibility = (key, val) => {
    set('sectionVisibility', { ...cs.sectionVisibility, [key]: val });
  };

  const vis = cs.sectionVisibility;
  const bentoScreens = cs.heroScreens?.length ? cs.heroScreens : DEFAULT_BENTO_SCREENS;

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow"><Link to={`/work/project/${slug}`}>← {project.title}</Link></p>
        <h1>Case study — {project.title}</h1>
        <p className="muted">Turn sections on or off with &ldquo;Show on site&rdquo;. Upload full images, then choose the visible part — visitors tap to see the full image.</p>
      </header>

      <SectionCard
        title="Page hero image"
        visible={vis.heroImage}
        onVisibleChange={(v) => setVisibility('heroImage', v)}
      >
        <ImageUpload
          label="Hero image"
          hint="Full-width banner at the top of the project page (21:9). Crop it before upload so it fills the screen cleanly."
          aspect={21 / 9}
          outputWidth={2400}
          value={cs.heroImage || ''}
          onChange={(v) => set('heroImage', v)}
        />
      </SectionCard>

      <SectionCard
        title="Overview screens"
        visible={vis.heroScreens}
        onVisibleChange={(v) => setVisibility('heroScreens', v)}
      >
        <p className="muted">Screens under the hero. Upload the full image, pick what shows in the grid, and visitors tap to see the full file.</p>
        <ListEditor
          items={bentoScreens}
          onChange={(v) => set('heroScreens', v)}
          newItem={{ label: `Screen ${bentoScreens.length + 1}`, imageUrl: '' }}
          fields={SCREEN_FIELDS}
        />
      </SectionCard>

      <Card title="Hero facts">
        <Field label="Watermark abbreviation"><Input value={cs.abbreviation} onChange={(v) => set('abbreviation', v)} /></Field>
        <Field label="Role"><Input value={cs.facts.role} onChange={(v) => set('facts.role', v)} /></Field>
        <Field label="Timeline"><Input value={cs.facts.timeline} onChange={(v) => set('facts.timeline', v)} /></Field>
        <Field label="Tools"><Input value={cs.facts.tools} onChange={(v) => set('facts.tools', v)} /></Field>
        <Field label="Type"><Input value={cs.facts.type} onChange={(v) => set('facts.type', v)} /></Field>
      </Card>

      <SectionCard
        title="01 — Overview"
        visible={vis.overview}
        onVisibleChange={(v) => setVisibility('overview', v)}
      >
        <Field label="Title"><Input value={cs.overview.title} onChange={(v) => set('overview.title', v)} /></Field>
        <Field label="Highlight word"><Input value={cs.overview.highlight} onChange={(v) => set('overview.highlight', v)} /></Field>
        <Field label="Problem text"><Textarea value={cs.overview.problemText} onChange={(v) => set('overview.problemText', v)} rows={4} /></Field>
        <Field label="Solution text"><Textarea value={cs.overview.solutionText} onChange={(v) => set('overview.solutionText', v)} rows={4} /></Field>
      </SectionCard>

      <SectionCard
        title="02 — My role"
        visible={vis.myRole}
        onVisibleChange={(v) => setVisibility('myRole', v)}
      >
        <Field label="Title"><Input value={cs.myRole.title} onChange={(v) => set('myRole.title', v)} /></Field>
        <Field label="Intro"><Textarea value={cs.myRole.intro} onChange={(v) => set('myRole.intro', v)} rows={4} /></Field>
        <Field label="Pills (comma separated)">
          <Input value={(cs.myRole.pills || []).join(', ')} onChange={(v) => set('myRole.pills', v.split(',').map((s) => s.trim()).filter(Boolean))} />
        </Field>
      </SectionCard>

      <SectionCard
        title="03 — Research insights"
        visible={vis.research}
        onVisibleChange={(v) => setVisibility('research', v)}
      >
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
      </SectionCard>

      <SectionCard
        title="Quote section"
        visible={vis.quote}
        onVisibleChange={(v) => setVisibility('quote', v)}
      >
        <Field label="Quote"><Textarea value={cs.quote.text} onChange={(v) => set('quote.text', v)} rows={3} /></Field>
        <Field label="Attribution"><Input value={cs.quote.attribution} onChange={(v) => set('quote.attribution', v)} /></Field>
      </SectionCard>

      <SectionCard
        title="04 — Project walkthrough video"
        visible={vis.walkthrough}
        onVisibleChange={(v) => setVisibility('walkthrough', v)}
      >
        <p className="muted">
          Add a product walkthrough video. Upload an MP4/WebM, or paste a YouTube / Vimeo link.
          Turn off &ldquo;Show on site&rdquo; to hide this section even when a video is set.
        </p>
        <Field label="Section title">
          <Input value={cs.walkthrough?.title || ''} onChange={(v) => set('walkthrough.title', v)} />
        </Field>
        <Field label="Highlight word">
          <Input value={cs.walkthrough?.highlight || ''} onChange={(v) => set('walkthrough.highlight', v)} />
        </Field>
        <VideoUpload
          label="Walkthrough video"
          value={cs.walkthrough?.videoUrl || ''}
          onChange={(v) => set('walkthrough.videoUrl', v)}
        />
        <ImageUpload
          label="Poster image (optional)"
          hint="Shown before the video plays. Crop to 16:9 to match the player."
          aspect={16 / 9}
          outputWidth={1600}
          value={cs.walkthrough?.posterUrl || ''}
          onChange={(v) => set('walkthrough.posterUrl', v)}
        />
        <Field label="Caption (optional)">
          <Input value={cs.walkthrough?.caption || ''} onChange={(v) => set('walkthrough.caption', v)} />
        </Field>
      </SectionCard>

      <SectionCard
        title="05 — Wireframes (design process)"
        visible={vis.designProcess}
        onVisibleChange={(v) => setVisibility('designProcess', v)}
      >
        <p className="muted">Upload full images and choose the visible area. Visitors tap to see the full file.</p>
        <ListEditor
          items={cs.designProcess.stages}
          onChange={(v) => set('designProcess.stages', v)}
          newItem={{ label: 'Wireframe stage', variant: 'low', imageUrl: '' }}
          fields={SCREEN_FIELDS}
        />
      </SectionCard>

      <SectionCard
        title="06 — Final screens"
        visible={vis.finalDesign}
        onVisibleChange={(v) => setVisibility('finalDesign', v)}
      >
        <p className="muted">Upload full images and choose the visible area. Visitors tap to see the full file.</p>
        <ListEditor
          items={cs.finalDesign.screens}
          onChange={(v) => set('finalDesign.screens', v)}
          newItem={{ label: 'Final screen', variant: 'home', imageUrl: '' }}
          fields={SCREEN_FIELDS}
        />
      </SectionCard>

      <SectionCard
        title="07 — Outcomes"
        visible={vis.outcomes}
        onVisibleChange={(v) => setVisibility('outcomes', v)}
      >
        <ListEditor
          items={cs.outcomes.metrics}
          onChange={(v) => set('outcomes.metrics', v)}
          newItem={{ value: '0%', label: 'Metric description' }}
          fields={[
            { key: 'value', label: 'Value' },
            { key: 'label', label: 'Label', type: 'textarea' },
          ]}
        />
      </SectionCard>

      <EditorActions
        draft={draft}
        onSaveDraft={save}
        onPublish={publish}
        onPreview={preview}
        saving={saving}
        publishing={publishing}
        hasChanges={hasUnpublishedChanges}
        previewPath={`/work/${slug}`}
      />
    </div>
  );
}
