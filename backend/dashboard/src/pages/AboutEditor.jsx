import { useContentDraft } from '../hooks/useContentDraft';
import EditorActions from '../components/EditorActions';
import { Card, Field, ImageUpload, Input, ListEditor, PdfUpload, Textarea } from '../components/Form';

export default function AboutEditor() {
  const {
    draft, updateDraft, save, publish, preview, saving, publishing, hasUnpublishedChanges, ready,
  } = useContentDraft();
  if (!ready) return null;

  const about = draft.about;
  const contact = draft.contact || {};
  const set = (key, val) => updateDraft((prev) => ({ ...prev, about: { ...prev.about, [key]: val } }));
  const setContact = (key, val) => updateDraft((prev) => ({
    ...prev,
    contact: { ...prev.contact, [key]: val },
  }));

  return (
    <div className="page">
      <header className="page-header">
        <h1>About section</h1>
        <p>Headline, bio copy, stats, CTAs, CV download, and photo.</p>
      </header>

      <Card title="Headline">
        <Field label="Label"><Input value={about.label} onChange={(v) => set('label', v)} /></Field>
        <Field label="Headline"><Input value={about.headline} onChange={(v) => set('headline', v)} /></Field>
        <Field label="Highlighted phrase"><Input value={about.headlineHighlight} onChange={(v) => set('headlineHighlight', v)} /></Field>
      </Card>

      <Card title="Body copy">
        <Field label="Paragraph 1"><Textarea value={about.paragraph1} onChange={(v) => set('paragraph1', v)} rows={5} /></Field>
        <Field label="Paragraph 2"><Textarea value={about.paragraph2} onChange={(v) => set('paragraph2', v)} rows={5} /></Field>
      </Card>

      <Card title="Stats">
        <ListEditor
          items={about.stats}
          onChange={(v) => set('stats', v)}
          newItem={{ value: '0', label: 'Label' }}
          fields={[
            { key: 'value', label: 'Value' },
            { key: 'label', label: 'Label' },
          ]}
        />
      </Card>

      <Card title="Download CV">
        <p className="muted">This powers the red “Download CV” button in the About section.</p>
        <Field label="Show download button">
          <label className="home-pick">
            <input
              type="checkbox"
              checked={contact.showResume !== false}
              onChange={(e) => setContact('showResume', e.target.checked)}
            />
            <span>Enable CV download on About</span>
          </label>
        </Field>
        <Field label="Button label">
          <Input value={about.ctaPrimary || 'Download CV →'} onChange={(v) => set('ctaPrimary', v)} />
        </Field>
        <PdfUpload
          label="CV PDF"
          hint="Upload your CV as a PDF. Clicking Download CV on the About section will download this file."
          value={contact.resumeUrl || ''}
          onChange={(v) => {
            updateDraft((prev) => ({
              ...prev,
              contact: {
                ...prev.contact,
                resumeUrl: v,
                showResume: v ? true : prev.contact?.showResume,
              },
            }));
          }}
        />
      </Card>

      <Card title="CTAs & badges">
        <Field label="Secondary CTA text"><Input value={about.ctaSecondary} onChange={(v) => set('ctaSecondary', v)} /></Field>
        <Field label="Secondary CTA link"><Input value={about.ctaSecondaryHref} onChange={(v) => set('ctaSecondaryHref', v)} /></Field>
        <Field label="Watermark"><Input value={about.watermark} onChange={(v) => set('watermark', v)} /></Field>
        <Field label="Badge"><Input value={about.badge} onChange={(v) => set('badge', v)} /></Field>
        <Field label="Float card label"><Input value={about.floatLabel} onChange={(v) => set('floatLabel', v)} /></Field>
        <Field label="Float card value"><Input value={about.floatValue} onChange={(v) => set('floatValue', v)} /></Field>
        <ImageUpload label="About photo" value={about.photo} onChange={(v) => set('photo', v)} />
      </Card>

      <EditorActions
        draft={draft}
        onSaveDraft={save}
        onPublish={publish}
        onPreview={preview}
        saving={saving}
        publishing={publishing}
        hasChanges={hasUnpublishedChanges}
        previewPath="/#about"
      />
    </div>
  );
}
