import { useCms } from '../context/ContentContext';
import { Card, Field, Input, SaveBar, Textarea } from '../components/Form';

const STEP_KEYS = ['discover', 'define', 'design', 'deliver'];

function StepEditor({ stepKey, step, onChange }) {
  const set = (key, val) => onChange({ ...step, [key]: val });
  const setTags = (val) => set('tags', val.split(',').map((t) => t.trim()).filter(Boolean));

  return (
    <Card title={`Step — ${step.title || stepKey}`}>
      <div className="form-grid">
        <Field label="Number"><Input value={step.num} onChange={(v) => set('num', v)} /></Field>
        <Field label="Title"><Input value={step.title} onChange={(v) => set('title', v)} /></Field>
        <Field label="Theme (burgundy|dark|petal)"><Input value={step.theme} onChange={(v) => set('theme', v)} /></Field>
        <Field label="Size (hero|medium|small)"><Input value={step.size} onChange={(v) => set('size', v)} /></Field>
      </div>
      <Field label="Description"><Textarea value={step.description} onChange={(v) => set('description', v)} /></Field>
      <Field label="Tags (comma separated)"><Input value={(step.tags || []).join(', ')} onChange={setTags} /></Field>
    </Card>
  );
}

export default function ProcessEditor() {
  const { content, update, saveAll, saving } = useCms();
  if (!content) return null;
  const p = content.process;

  const save = () => saveAll(content);
  const set = (key, val) => update((prev) => ({ ...prev, process: { ...prev.process, [key]: val } }));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Process section</h1>
        <p>Header copy and four interactive process cards.</p>
      </header>

      <Card title="Header">
        <Field label="Eyebrow"><Input value={p.eyebrow} onChange={(v) => set('eyebrow', v)} /></Field>
        <Field label="Title (dark part)"><Input value={p.titleDark} onChange={(v) => set('titleDark', v)} /></Field>
        <Field label="Title (accent part)"><Input value={p.titleAccent} onChange={(v) => set('titleAccent', v)} /></Field>
        <Field label="Meta line"><Input value={p.meta} onChange={(v) => set('meta', v)} /></Field>
      </Card>

      {STEP_KEYS.map((key) => (
        <StepEditor
          key={key}
          stepKey={key}
          step={p.steps[key]}
          onChange={(v) => update((prev) => ({
            ...prev,
            process: { ...prev.process, steps: { ...prev.process.steps, [key]: v } },
          }))}
        />
      ))}

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}
