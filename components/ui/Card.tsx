import { ReactNode } from 'react';

export default function Card({
  title,
  hint,
  actions,
  children,
  bodyClass = 'card-body',
  className = '',
}: {
  title?: string;
  hint?: string;
  actions?: ReactNode;
  children: ReactNode;
  bodyClass?: string;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {title ? (
        <header className="card-head">
          <h3>
            {title} {hint ? <span className="hint">{hint}</span> : null}
          </h3>
          {actions}
        </header>
      ) : null}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
