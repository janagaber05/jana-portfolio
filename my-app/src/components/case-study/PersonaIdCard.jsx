export default function PersonaIdCard({ persona }) {
  if (!persona) return null;

  return (
    <article className="cs-persona" data-magnetic>
      <header className="cs-persona-head">
        <span className="cs-persona-tag">Primary user</span>
        <span className="cs-persona-barcode" aria-hidden="true">||||| |||| |||||</span>
      </header>
      <div className="cs-persona-body">
        <h3 className="cs-persona-name">{persona.name || 'Persona'}</h3>
        {persona.role ? <p className="cs-persona-role">{persona.role}</p> : null}
        <dl className="cs-persona-grid">
          {persona.goal ? (
            <div>
              <dt>Goal</dt>
              <dd>{persona.goal}</dd>
            </div>
          ) : null}
          {persona.painPoint ? (
            <div>
              <dt>Pain point</dt>
              <dd>{persona.painPoint}</dd>
            </div>
          ) : null}
          {persona.behaviour ? (
            <div>
              <dt>Behaviour</dt>
              <dd>{persona.behaviour}</dd>
            </div>
          ) : null}
        </dl>
        {persona.quote ? <p className="cs-persona-quote">{persona.quote}</p> : null}
      </div>
    </article>
  );
}
