import { useContentDraft } from '../hooks/useContentDraft';
import EditorActions from '../components/EditorActions';
import { Card, Field, ImageUpload, Input, ListEditor, PdfUpload, Textarea } from '../components/Form';

export default function ContactEditor() {
  const {
    draft,
    updateDraft,
    save,
    publish,
    preview,
    saving,
    publishing,
    hasUnpublishedChanges,
    ready,
  } = useContentDraft();
  if (!ready) return null;

  const c = draft.contact;
  const set = (key, val) => updateDraft((prev) => ({ ...prev, contact: { ...prev.contact, [key]: val } }));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Contact & footer</h1>
        <p>Marquee, headline, email, socials, contact form, and footer copy.</p>
      </header>

      <Card title="Contact form">
        <label className="home-pick">
          <input
            type="checkbox"
            checked={c.formEnabled !== false}
            onChange={(e) => set('formEnabled', e.target.checked)}
          />
          <span>Show contact form on site</span>
        </label>
        <Field label="Submit button label"><Input value={c.formSubmitLabel || 'Send message'} onChange={(v) => set('formSubmitLabel', v)} /></Field>
        <Field label="Success message"><Input value={c.formSuccess || 'Thanks — your message was sent.'} onChange={(v) => set('formSuccess', v)} /></Field>
        <p className="muted">Messages appear in the CMS Inbox.</p>
      </Card>

      <Card title="Marquee">
        <Field label="Marquee text"><Input value={c.marqueeText} onChange={(v) => set('marqueeText', v)} /></Field>
        <Field label="Marquee repeat"><Input type="number" value={c.marqueeRepeat} onChange={(v) => set('marqueeRepeat', Number(v))} /></Field>
      </Card>

      <Card title="Main content">
        <Field label="Top label"><Input value={c.topLabel} onChange={(v) => set('topLabel', v)} /></Field>
        <Field label="Available badge"><Input value={c.availableBadge} onChange={(v) => set('availableBadge', v)} /></Field>
        <Field label="Headline line 1"><Input value={c.headlineLine1} onChange={(v) => set('headlineLine1', v)} /></Field>
        <Field label="Headline line 2"><Input value={c.headlineLine2} onChange={(v) => set('headlineLine2', v)} /></Field>
        <Field label="Headline accent"><Input value={c.headlineAccent} onChange={(v) => set('headlineAccent', v)} /></Field>
        <Field label="Location"><Input value={c.location} onChange={(v) => set('location', v)} /></Field>
        <Field label="Email"><Input value={c.email} onChange={(v) => set('email', v)} /></Field>
      </Card>

      <Card title="Resume / CV">
        <p className="muted">Upload your CV as a PDF. Visitors can download it from this contact section.</p>
        <Field label="Show download button">
          <label className="home-pick">
            <input
              type="checkbox"
              checked={Boolean(c.showResume)}
              onChange={(e) => set('showResume', e.target.checked)}
            />
            <span>Display download button on the site</span>
          </label>
        </Field>
        <Field label="Button label">
          <Input value={c.resumeLabel || 'Download CV'} onChange={(v) => set('resumeLabel', v)} />
        </Field>
        <PdfUpload
          value={c.resumeUrl || ''}
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

      <Card title="Social links">
        <ListEditor
          items={c.socials}
          onChange={(v) => set('socials', v)}
          newItem={{ label: 'Social', href: 'https://' }}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'URL' },
          ]}
        />
      </Card>

      <Card title="Footer">
        <Field label="Tagline"><Input value={c.footerTagline || ''} onChange={(v) => set('footerTagline', v)} /></Field>
        <Field label="Closing line"><Input value={c.closingLine} onChange={(v) => set('closingLine', v)} /></Field>
        <Field label="Footer note"><Input value={c.footerNote || ''} onChange={(v) => set('footerNote', v)} /></Field>
        <Field label="Copyright"><Input value={c.copyright} onChange={(v) => set('copyright', v)} /></Field>
        <ImageUpload label="Footer logo" value={c.footerLogo} onChange={(v) => set('footerLogo', v)} />
        <ListEditor
          items={c.footerNav || []}
          onChange={(v) => set('footerNav', v)}
          newItem={{ label: 'Link', href: '#section' }}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'Href' },
          ]}
        />
        <Field label="Footer services (comma separated)">
          <Input
            value={(c.footerServices || []).join(', ')}
            onChange={(v) => set('footerServices', v.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </Field>
      </Card>

      <EditorActions
        draft={draft}
        onSaveDraft={save}
        onPublish={publish}
        onPreview={preview}
        saving={saving}
        publishing={publishing}
        hasChanges={hasUnpublishedChanges}
        previewPath="/#contact"
      />
    </div>
  );
}
