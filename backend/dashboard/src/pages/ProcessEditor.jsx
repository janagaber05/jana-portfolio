import { useContentDraft } from '../hooks/useContentDraft';
import EditorActions from '../components/EditorActions';
import { Card, Field, Input, Textarea } from '../components/Form';

const ICON_OPTIONS = ['discovery', 'blueprint', 'build', 'testing', 'deploy'];

function StepEditor({ index, step, onChange }) {
  const set = (key, val) => onChange({ ...step, [key]: val });

  return (
    <Card title={`Step ${step.num || index + 1} — ${step.title || 'Untitled'}`}>
      <div className="form-grid">
        <Field label="Number"><Input value={step.num} onChange={(v) => set('num', v)} /></Field>
        <Field label="Title"><Input value={step.title} onChange={(v) => set('title', v)} /></Field>
        <Field label={`Icon (${ICON_OPTIONS.join('|')})`}>
          <Input value={step.icon} onChange={(v) => set('icon', v)} />
        </Field>
      </div>
      <Field label="Description"><Textarea value={step.description} onChange={(v) => set('description', v)} /></Field>
    </Card>
  );
}

export default function ProcessEditor() {
  const {
    draft, updateDraft, save, publish, preview, saving, publishing, hasUnpublishedChanges, ready,
  } = useContentDraft();
  if (!ready) return null;

  const p = draft.process;
  const steps = Array.isArray(p.steps) ? p.steps : [];
  const set = (key, val) => updateDraft((prev) => ({ ...prev, process: { ...prev.process, [key]: val } }));

  const updateStep = (index, value) => {
    updateDraft((prev) => {
      const nextSteps = [...(prev.process.steps || [])];
      nextSteps[index] = value;
      return { ...prev, process: { ...prev.process, steps: nextSteps } };
    });
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Process section</h1>
        <p>Header copy and timeline process steps.</p>
      </header>

      <Card title="Header">
        <Field label="Eyebrow"><Input value={p.eyebrow} onChange={(v) => set('eyebrow', v)} /></Field>
        <Field label="Title"><Input value={p.title} onChange={(v) => set('title', v)} /></Field>
        <Field label="Subtitle"><Textarea value={p.subtitle} onChange={(v) => set('subtitle', v)} /></Field>
      </Card>

      {steps.map((step, index) => (
        <StepEditor
          key={step.num || index}
          index={index}
          step={step}
          onChange={(value) => updateStep(index, value)}
        />
      ))}

      <EditorActions
        draft={draft}
        onSaveDraft={save}
        onPublish={publish}
        onPreview={preview}
        saving={saving}
        publishing={publishing}
        hasChanges={hasUnpublishedChanges}
        previewPath="/#process"
      />
    </div>
  );
}
