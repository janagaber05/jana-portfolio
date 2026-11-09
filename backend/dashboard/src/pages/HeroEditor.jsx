import { useContentDraft } from '../hooks/useContentDraft';
import EditorActions from '../components/EditorActions';
import { Card, Field, ImageUpload, Input, ListEditor } from '../components/Form';

export default function HeroEditor() {
  const {
    draft, updateDraft, save, publish, preview, saving, publishing, hasUnpublishedChanges, ready,
  } = useContentDraft();
  if (!ready) return null;

  const hero = draft.hero;

  const setHero = (key, val) => {
    updateDraft((prev) => ({ ...prev, hero: { ...prev.hero, [key]: val } }));
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Hero section</h1>
        <p>Badge intro, role words, navigation, and portrait used on the ID card.</p>
      </header>

      <Card title="ID badge">
        <p className="muted">This is the hanging badge in the center of the first section.</p>
        <Field label="Name on badge"><Input value={hero.badgeName || 'JANA'} onChange={(v) => setHero('badgeName', v)} /></Field>
        <Field label="Title under name"><Input value={hero.badgeTitle || 'UX/UI Designer'} onChange={(v) => setHero('badgeTitle', v)} /></Field>
        <Field label="Tagline (bottom left)"><Input value={hero.badgeTagline || 'Designing apps people love'} onChange={(v) => setHero('badgeTagline', v)} /></Field>
        <ImageUpload
          label="Badge portrait"
          hint="Shown on the ID badge. Crop tight to the face if you can."
          value={hero.heroImage}
          onChange={(v) => setHero('heroImage', v)}
        />
      </Card>

      <Card title="Role words">
        <p className="muted">Four large words around the badge (top-left, top-right, bottom-left, bottom-right). Keep them short.</p>
        <ListEditor
          items={hero.roles?.length ? hero.roles.map((label) => ({ label })) : [
            { label: 'DESIGNER' },
            { label: 'RESEARCHER' },
            { label: 'PROTOTYPER' },
            { label: 'CREATOR' },
          ]}
          onChange={(v) => setHero('roles', v.map((item) => String(item.label || '').trim().toUpperCase()).filter(Boolean).slice(0, 4))}
          newItem={{ label: 'ROLE' }}
          maxItems={4}
          addLabel="Add role"
          itemLabel="Role"
          fields={[{ key: 'label', label: 'Word' }]}
        />
      </Card>

      <Card title="Navigation">
        <Field label="Email"><Input value={hero.email} onChange={(v) => setHero('email', v)} /></Field>
        <Field label="Nav button text"><Input value={hero.navCta || 'get in touch'} onChange={(v) => setHero('navCta', v)} /></Field>
        <Field label="Scroll cue"><Input value={hero.scrollCue || 'scroll'} onChange={(v) => setHero('scrollCue', v)} /></Field>
        <ImageUpload label="Logo" value={hero.logo} onChange={(v) => setHero('logo', v)} />
      </Card>

      <Card title="Navigation links">
        <ListEditor
          items={hero.navLinks}
          onChange={(v) => setHero('navLinks', v)}
          newItem={{ href: '#', label: 'Link' }}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'Href' },
          ]}
        />
      </Card>

      <Card title="Nav socials">
        <ListEditor
          items={hero.navSocials}
          onChange={(v) => setHero('navSocials', v)}
          newItem={{ href: 'https://', label: 'social' }}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'href', label: 'URL' },
          ]}
        />
      </Card>

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
