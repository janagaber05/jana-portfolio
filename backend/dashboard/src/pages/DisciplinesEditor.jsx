import { useContentDraft } from '../hooks/useContentDraft';
import EditorActions from '../components/EditorActions';
import { Card, Field, Input } from '../components/Form';

function DisciplinePanel({ title, data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const setSkills = (val) => set('skills', val.split(',').map((s) => s.trim()).filter(Boolean));

  return (
    <Card title={title}>
      <Field label="Ghost number"><Input value={data.ghostNumber} onChange={(v) => set('ghostNumber', v)} /></Field>
      <Field label="Label"><Input value={data.label} onChange={(v) => set('label', v)} /></Field>
      <Field label="Title"><Input value={data.title} onChange={(v) => set('title', v)} /></Field>
      <Field label="Skills (comma separated)"><Input value={(data.skills || []).join(', ')} onChange={setSkills} /></Field>
      <Field label="Link text"><Input value={data.linkText} onChange={(v) => set('linkText', v)} /></Field>
      <Field label="Link href"><Input value={data.linkHref} onChange={(v) => set('linkHref', v)} /></Field>
    </Card>
  );
}

export default function DisciplinesEditor() {
  const {
    draft, updateDraft, save, publish, preview, saving, publishing, hasUnpublishedChanges, ready,
  } = useContentDraft();
  if (!ready) return null;

  const d = draft.disciplines;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Disciplines</h1>
        <p>UX/UI discipline panel — skills and link to your work.</p>
      </header>

      <DisciplinePanel
        title="UX / UI"
        data={d.ux}
        onChange={(v) => updateDraft((prev) => ({ ...prev, disciplines: { ...prev.disciplines, ux: v } }))}
      />

      <EditorActions
        draft={draft}
        onSaveDraft={save}
        onPublish={publish}
        onPreview={preview}
        saving={saving}
        publishing={publishing}
        hasChanges={hasUnpublishedChanges}
      />
    </div>
  );
}
