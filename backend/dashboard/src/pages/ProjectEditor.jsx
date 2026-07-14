import { Link, useNavigate, useParams } from 'react-router-dom';
import { useContentDraft } from '../hooks/useContentDraft';
import { Card, ColorInput, Field, Input, SaveBar, Textarea } from '../components/Form';
import { findProjectIndex } from '../utils/projectHelpers';
import { getProjectUrl } from '../utils/preview';

export default function ProjectEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { draft, updateDraft, save, saving, ready } = useContentDraft();

  if (!ready) return null;

  const fw = draft.featuredWork;
  const homeLimit = fw.homeLimit ?? 6;
  const homeSlugs = fw.homeProjectSlugs || [];
  const index = findProjectIndex(fw.projects, slug);
  const project = index >= 0 ? fw.projects[index] : null;

  if (!project) {
    return (
      <div className="page">
        <p>Project not found. <Link to="/work">Back to projects</Link></p>
      </div>
    );
  }

  const onHome = homeSlugs.includes(project.slug);
  const homeFull = homeSlugs.length >= homeLimit;
  const canToggleHome = onHome || !homeFull;

  const setField = (key, val) => {
    updateDraft((prev) => {
      const current = prev.featuredWork;
      const projectIndex = findProjectIndex(current.projects, slug);
      if (projectIndex < 0) return prev;

      const oldSlug = current.projects[projectIndex].slug;
      const projects = current.projects.map((p, i) => (
        i === projectIndex ? { ...p, [key]: val } : p
      ));
      let homeProjectSlugs = current.homeProjectSlugs || [];

      if (key === 'slug' && homeProjectSlugs.includes(oldSlug)) {
        homeProjectSlugs = homeProjectSlugs.map((s) => (s === oldSlug ? val : s));
      }

      return {
        ...prev,
        featuredWork: { ...current, projects, homeProjectSlugs },
      };
    });

    if (key === 'slug' && val !== slug) {
      navigate(`/work/project/${val}`, { replace: true });
    }
  };

  const toggleHomeProject = () => {
    updateDraft((prev) => {
      const current = [...(prev.featuredWork.homeProjectSlugs || [])];
      const idx = current.indexOf(project.slug);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else if (current.length < homeLimit) {
        current.push(project.slug);
      }
      return {
        ...prev,
        featuredWork: { ...prev.featuredWork, homeProjectSlugs: current },
      };
    });
  };

  const removeProject = () => {
    if (!window.confirm(`Remove "${project.title}"? This cannot be undone.`)) return;

    updateDraft((prev) => {
      const current = prev.featuredWork;
      const projects = current.projects.filter((p) => p.slug !== slug);
      const homeProjectSlugs = (current.homeProjectSlugs || []).filter((s) => s !== slug);
      const nextCaseStudies = { ...prev.caseStudies };
      delete nextCaseStudies[slug];

      return {
        ...prev,
        featuredWork: { ...current, projects, homeProjectSlugs },
        caseStudies: nextCaseStudies,
      };
    });

    navigate('/work');
  };

  return (
    <div className="page">
      <header className="page-header">
        <p className="eyebrow"><Link to="/work">← All projects</Link></p>
        <h1>{project.index} — {project.title}</h1>
        <p className="muted">
          Card fields for listings. Full page content is in the case study editor.
          {' '}
          <a href={getProjectUrl(project.slug)} target="_blank" rel="noreferrer">
            Open project page
          </a>
        </p>
      </header>

      <Card title="Visibility">
        <label className={`home-pick ${!canToggleHome ? 'home-pick-disabled' : ''}`}>
          <input
            type="checkbox"
            checked={onHome}
            disabled={!canToggleHome}
            onChange={toggleHomeProject}
          />
          <span>
            {onHome
              ? 'Shown on homepage scroll'
              : homeFull
                ? 'Homepage full — uncheck another project first'
                : 'Show on homepage scroll'}
          </span>
        </label>
        <p className="muted home-pick-hint">{homeSlugs.length} / {homeLimit} homepage slots used.</p>
      </Card>

      <Card title="Project card">
        <div className="form-grid">
          <Field label="Slug"><Input value={project.slug} onChange={(v) => setField('slug', v)} /></Field>
          <Field label="Index"><Input value={project.index} onChange={(v) => setField('index', v)} /></Field>
          <Field label="Title"><Input value={project.title} onChange={(v) => setField('title', v)} /></Field>
          <Field label="Tag"><Input value={project.tag} onChange={(v) => setField('tag', v)} /></Field>
          <Field label="Accent color"><ColorInput value={project.accent} onChange={(v) => setField('accent', v)} /></Field>
          <Field label="Year"><Input value={project.year} onChange={(v) => setField('year', v)} /></Field>
          <Field label="Role"><Input value={project.role} onChange={(v) => setField('role', v)} /></Field>
          <Field label="Client"><Input value={project.client} onChange={(v) => setField('client', v)} /></Field>
        </div>
        <Field label="Summary"><Textarea value={project.summary} onChange={(v) => setField('summary', v)} /></Field>
        <Field label="Challenge"><Textarea value={project.challenge} onChange={(v) => setField('challenge', v)} /></Field>
        <Field label="Outcome"><Textarea value={project.outcome} onChange={(v) => setField('outcome', v)} /></Field>
        <Field label="Tools (comma separated)">
          <Input
            value={(project.tools || []).join(', ')}
            onChange={(v) => setField('tools', v.split(',').map((t) => t.trim()).filter(Boolean))}
          />
        </Field>
      </Card>

      <div className="project-actions">
        <Link to={`/work/case-study/${project.slug}`} className="btn btn-secondary">
          Edit full case study →
        </Link>
        <button type="button" className="btn btn-ghost" onClick={removeProject}>
          Remove project
        </button>
      </div>

      <SaveBar onSave={save} saving={saving} />
    </div>
  );
}
