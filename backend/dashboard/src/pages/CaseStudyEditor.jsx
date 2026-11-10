import { useParams, Link } from 'react-router-dom';
import { useContentDraft } from '../hooks/useContentDraft';
import EditorActions from '../components/EditorActions';
import {
  Card,
  Field,
  FramedImageUpload,
  ImageUpload,
  Input,
  ListEditor,
  SectionVisibilityToggle,
  Textarea,
  VideoUpload,
} from '../components/Form';
import { DEFAULT_SECTION_VISIBILITY, mergeSectionVisibility } from '../utils/caseStudyImage';

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
    label: 'Name (caption on site)',
  },
  {
    key: 'imageUrl',
    label: 'Image',
    type: 'framed-image',
    hint: 'Upload the full image, then choose the visible part. Visitors tap to see the full image.',
    aspect: 9 / 19.5,
  },
];

const PROCESS_FIELDS = [
  ...SCREEN_FIELDS,
  {
    key: 'description',
    label: 'Short description (optional)',
    type: 'textarea',
  },
];

const PERSONA_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'goal', label: 'Goal', type: 'textarea' },
  { key: 'painPoint', label: 'Pain point', type: 'textarea' },
  { key: 'behaviour', label: 'Behaviour', type: 'textarea' },
  { key: 'quote', label: 'Quote', type: 'textarea' },
];

const EMPTY_PERSONA = {
  name: '',
  role: '',
  goal: '',
  painPoint: '',
  behaviour: '',
  quote: '',
};

function normalizeEditorPersonas(research = {}) {
  if (Array.isArray(research.personas) && research.personas.length) {
    return research.personas;
  }
  if (research.persona && Object.values(research.persona).some(Boolean)) {
    return [research.persona];
  }
  return [{ ...EMPTY_PERSONA }];
}

function SectionCard({ title, visible, onVisibleChange, children, hint }) {
  return (
    <section className="card">
      <div className="card-header-row">
        <h3 className="card-title">{title}</h3>
        <SectionVisibilityToggle checked={visible} onChange={onVisibleChange} />
      </div>
      {hint ? <p className="muted">{hint}</p> : null}
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
    facts: {
      role: project?.role || '',
      timeline: `6 weeks · ${project?.year || ''}`,
      tools: (project?.tools || []).join(', '),
      type: project?.tag || '',
    },
    overview: {
      sectionNumber: '01',
      title: 'The problem and the solution.',
      highlight: 'problem',
      problemLabel: 'The problem',
      problemTitle: 'What was broken',
      problemText: project?.challenge || '',
      solutionLabel: 'The solution',
      solutionTitle: 'What I designed',
      solutionText: project?.outcome || '',
    },
    myRole: {
      sectionNumber: '02',
      title: 'What I specifically did.',
      highlight: 'specifically',
      intro: '',
      pills: [],
    },
    research: {
      sectionNumber: '03',
      title: 'What users actually told me.',
      highlight: 'actually',
      insights: [],
      personas: [{ ...EMPTY_PERSONA }],
    },
    quote: { text: '', attribution: '' },
    walkthrough: { ...DEFAULT_WALKTHROUGH },
    heroScreens: [],
    designProcess: {
      sectionNumber: '05',
      title: 'From sketch to final screen.',
      highlight: 'sketch',
      stages: [
        { label: 'Low fidelity wireframe', variant: 'low', imageUrl: '' },
        { label: 'Mid fidelity', variant: 'mid', imageUrl: '' },
        { label: 'High fidelity', variant: 'high', imageUrl: '' },
      ],
    },
    finalDesign: {
      sectionNumber: '06',
      title: 'The final screens.',
      highlight: 'final',
      screens: [
        { label: 'Home screen', variant: 'home', imageUrl: '' },
        { label: 'Detail screen', variant: 'detail', imageUrl: '' },
        { label: 'Checkout screen', variant: 'checkout', imageUrl: '' },
      ],
    },
    outcomes: {
      sectionNumber: '07',
      title: 'The proof it worked.',
      highlight: 'proof',
      metrics: [],
    },
    beforeAfter: { before: '', after: '', caption: '' },
    reflection: { title: "What I'd do differently", text: '' },
    strips: {
      top: (project?.tools || []).join(' · ') || 'DESIGN · RESEARCH · PROTOTYPE · DELIVER',
      bottom: 'UX · UI · RESEARCH · PROTOTYPE · MOTION',
    },
    coverImage: '',
    coverDisplayCrop: null,
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY },
  };

  if (!existing) return blank;

  const researchRest = { ...(existing.research || {}) };
  delete researchRest.persona;
  const personas = normalizeEditorPersonas(existing.research);

  return {
    ...blank,
    ...existing,
    coverImage: existing.coverImage || existing.heroImage || '',
    coverDisplayCrop: existing.coverDisplayCrop || null,
    beforeAfter: { ...blank.beforeAfter, ...(existing.beforeAfter || {}) },
    reflection: { ...blank.reflection, ...(existing.reflection || {}) },
    strips: { ...blank.strips, ...(existing.strips || {}) },
    overview: { ...blank.overview, ...(existing.overview || {}) },
    myRole: { ...blank.myRole, ...(existing.myRole || {}) },
    outcomes: { ...blank.outcomes, ...(existing.outcomes || {}) },
    designProcess: { ...blank.designProcess, ...(existing.designProcess || {}) },
    finalDesign: { ...blank.finalDesign, ...(existing.finalDesign || {}) },
    walkthrough: { ...DEFAULT_WALKTHROUGH, ...(existing.walkthrough || {}) },
    research: {
      ...blank.research,
      ...researchRest,
      personas,
    },
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
    for (let i = 0; i < keys.length - 1; i += 1) {
      if (ref[keys[i]] == null || typeof ref[keys[i]] !== 'object') {
        ref[keys[i]] = {};
      }
      ref = ref[keys[i]];
    }
    ref[keys[keys.length - 1]] = val;
    if (path === 'research.personas' && next.research) {
      delete next.research.persona;
    }
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

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow"><Link to={`/work/project/${slug}`}>← {project.title}</Link></p>
        <h1>Case study — {project.title}</h1>
        <p className="muted">
          Fields follow the live exhibit order. Use &ldquo;Show on site&rdquo; to hide empty sections.
          Project title / summary / accent live on the project page.
        </p>
      </header>

      <Card title="Hero — cover phone + facts">
        <p className="muted">
          Cover image sits in the phone frame next to the title. Ticket facts show under the hero.
        </p>
        <FramedImageUpload
          label="Cover image"
          hint="Upload full image, then set the visible area for the phone frame."
          imageUrl={cs.coverImage || ''}
          fullImageUrl={cs.coverImage || ''}
          displayCrop={cs.coverDisplayCrop}
          aspect={9 / 19.5}
          onChange={(data) => {
            const next = structuredClone(cs);
            next.coverImage = data.fullImageUrl || data.imageUrl || '';
            next.heroImage = next.coverImage;
            next.coverDisplayCrop = data.displayCrop || null;
            setCs(next);
          }}
        />
        <Field label="Watermark abbreviation">
          <Input value={cs.abbreviation} onChange={(v) => set('abbreviation', v)} />
        </Field>
        <Field label="Role"><Input value={cs.facts.role} onChange={(v) => set('facts.role', v)} /></Field>
        <Field label="Timeline"><Input value={cs.facts.timeline} onChange={(v) => set('facts.timeline', v)} /></Field>
        <Field label="Tools"><Input value={cs.facts.tools} onChange={(v) => set('facts.tools', v)} /></Field>
        <Field label="Type"><Input value={cs.facts.type} onChange={(v) => set('facts.type', v)} /></Field>
      </Card>

      <SectionCard
        title="Final screens gallery"
        visible={vis.finalDesign !== false}
        onVisibleChange={(v) => setVisibility('finalDesign', v)}
        hint="Pinned horizontal gallery near the top of the case study (after results). This is what visitors scroll sideways."
      >
        <ListEditor
          items={cs.finalDesign.screens}
          onChange={(v) => set('finalDesign.screens', v)}
          newItem={{ label: 'Final screen', variant: 'home', imageUrl: '' }}
          fields={SCREEN_FIELDS}
        />
      </SectionCard>

      <Card title="Marquee strips">
        <p className="muted">
          Two scrolling ribbons between the gallery and the story. Separate words with · or commas.
        </p>
        <Field label="Top strip (burgundy)">
          <Input
            value={cs.strips?.top || ''}
            onChange={(v) => set('strips.top', v)}
            placeholder="FIGMA · RESEARCH · PROTOTYPE · DELIVER"
          />
        </Field>
        <Field label="Bottom strip (pink)">
          <Input
            value={cs.strips?.bottom || ''}
            onChange={(v) => set('strips.bottom', v)}
            placeholder="UX · UI · RESEARCH · PROTOTYPE · MOTION"
          />
        </Field>
      </Card>

      <SectionCard
        title="01 — Overview (problem / solution)"
        visible={vis.overview !== false}
        onVisibleChange={(v) => setVisibility('overview', v)}
      >
        <Field label="Section title"><Input value={cs.overview.title} onChange={(v) => set('overview.title', v)} /></Field>
        <Field label="Highlight word"><Input value={cs.overview.highlight} onChange={(v) => set('overview.highlight', v)} /></Field>
        <Field label="Problem card label"><Input value={cs.overview.problemLabel || ''} onChange={(v) => set('overview.problemLabel', v)} /></Field>
        <Field label="Problem card title"><Input value={cs.overview.problemTitle || ''} onChange={(v) => set('overview.problemTitle', v)} /></Field>
        <Field label="Problem text"><Textarea value={cs.overview.problemText} onChange={(v) => set('overview.problemText', v)} rows={4} /></Field>
        <Field label="Solution card label"><Input value={cs.overview.solutionLabel || ''} onChange={(v) => set('overview.solutionLabel', v)} /></Field>
        <Field label="Solution card title"><Input value={cs.overview.solutionTitle || ''} onChange={(v) => set('overview.solutionTitle', v)} /></Field>
        <Field label="Solution text"><Textarea value={cs.overview.solutionText} onChange={(v) => set('overview.solutionText', v)} rows={4} /></Field>
      </SectionCard>

      <SectionCard
        title="02 — My role"
        visible={vis.myRole !== false}
        onVisibleChange={(v) => setVisibility('myRole', v)}
      >
        <Field label="Section title"><Input value={cs.myRole.title} onChange={(v) => set('myRole.title', v)} /></Field>
        <Field label="Highlight word"><Input value={cs.myRole.highlight || ''} onChange={(v) => set('myRole.highlight', v)} /></Field>
        <Field label="Intro"><Textarea value={cs.myRole.intro} onChange={(v) => set('myRole.intro', v)} rows={4} /></Field>
        <Field label="Pills (comma separated)">
          <Input
            value={(cs.myRole.pills || []).join(', ')}
            onChange={(v) => set('myRole.pills', v.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="03 — Research"
        visible={vis.research !== false}
        onVisibleChange={(v) => setVisibility('research', v)}
      >
        <Field label="Section title"><Input value={cs.research.title || ''} onChange={(v) => set('research.title', v)} /></Field>
        <Field label="Highlight word"><Input value={cs.research.highlight || ''} onChange={(v) => set('research.highlight', v)} /></Field>
        <h4 className="sub-title">Insights</h4>
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
        <h4 className="sub-title">Personas</h4>
        <ListEditor
          items={cs.research.personas}
          onChange={(v) => set('research.personas', v)}
          newItem={{ ...EMPTY_PERSONA }}
          fields={PERSONA_FIELDS}
          addLabel="Add persona"
          itemLabel="Persona"
        />
      </SectionCard>

      <SectionCard
        title="Quote"
        visible={vis.quote !== false}
        onVisibleChange={(v) => setVisibility('quote', v)}
      >
        <Field label="Quote"><Textarea value={cs.quote.text} onChange={(v) => set('quote.text', v)} rows={3} /></Field>
        <Field label="Attribution"><Input value={cs.quote.attribution} onChange={(v) => set('quote.attribution', v)} /></Field>
      </SectionCard>

      <SectionCard
        title="Before / After"
        visible={vis.beforeAfter !== false}
        onVisibleChange={(v) => setVisibility('beforeAfter', v)}
        hint="Optional comparison slider. Both images required to show on the site."
      >
        <Field label="Before image">
          <ImageUpload
            aspect={9 / 16}
            outputWidth={1400}
            value={cs.beforeAfter?.before || ''}
            onChange={(v) => set('beforeAfter.before', v)}
          />
        </Field>
        <Field label="After image">
          <ImageUpload
            aspect={9 / 16}
            outputWidth={1400}
            value={cs.beforeAfter?.after || ''}
            onChange={(v) => set('beforeAfter.after', v)}
          />
        </Field>
        <Field label="Caption">
          <Input value={cs.beforeAfter?.caption || ''} onChange={(v) => set('beforeAfter.caption', v)} />
        </Field>
      </SectionCard>

      <SectionCard
        title="05 — Design process"
        visible={vis.designProcess !== false}
        onVisibleChange={(v) => setVisibility('designProcess', v)}
        hint="Pinned morphing wireframe stages."
      >
        <ListEditor
          items={cs.designProcess.stages}
          onChange={(v) => set('designProcess.stages', v)}
          newItem={{ label: 'Wireframe stage', variant: 'low', imageUrl: '', description: '' }}
          fields={PROCESS_FIELDS}
        />
      </SectionCard>

      <SectionCard
        title="04 — Walkthrough video"
        visible={vis.walkthrough !== false}
        onVisibleChange={(v) => setVisibility('walkthrough', v)}
      >
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
        title="07 — Outcomes"
        visible={vis.outcomes !== false}
        onVisibleChange={(v) => setVisibility('outcomes', v)}
        hint="Also feeds the dark “results at a glance” strip under the hero. Keep Value short (89%, 4.7)."
      >
        <Field label="Section title"><Input value={cs.outcomes.title || ''} onChange={(v) => set('outcomes.title', v)} /></Field>
        <Field label="Highlight word"><Input value={cs.outcomes.highlight || ''} onChange={(v) => set('outcomes.highlight', v)} /></Field>
        <ListEditor
          items={cs.outcomes.metrics}
          onChange={(v) => set('outcomes.metrics', v)}
          newItem={{ value: '0%', label: 'Metric description' }}
          fields={[
            { key: 'value', label: 'Value (short, e.g. 89%)' },
            { key: 'label', label: 'Label / explanation', type: 'textarea' },
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Reflection"
        visible={vis.reflection !== false}
        onVisibleChange={(v) => setVisibility('reflection', v)}
      >
        <Field label="Title">
          <Input value={cs.reflection?.title || ''} onChange={(v) => set('reflection.title', v)} />
        </Field>
        <Field label="Text">
          <Textarea value={cs.reflection?.text || ''} onChange={(v) => set('reflection.text', v)} rows={4} />
        </Field>
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
