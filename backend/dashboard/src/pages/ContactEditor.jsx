import { useCms } from '../context/ContentContext';
import { Card, Field, ImageUpload, Input, ListEditor, SaveBar } from '../components/Form';

export default function ContactEditor() {
  const { content, update, saveAll, saving } = useCms();
  if (!content) return null;
  const c = content.contact;

  const save = () => saveAll(content);
  const set = (key, val) => update((prev) => ({ ...prev, contact: { ...prev.contact, [key]: val } }));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Contact & footer</h1>
        <p>Marquee, headline, email, socials, and footer copy.</p>
      </header>

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
        <Field label="Closing line"><Input value={c.closingLine} onChange={(v) => set('closingLine', v)} /></Field>
        <Field label="Copyright"><Input value={c.copyright} onChange={(v) => set('copyright', v)} /></Field>
        <ImageUpload label="Footer logo" value={c.footerLogo} onChange={(v) => set('footerLogo', v)} />
      </Card>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}
