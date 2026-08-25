import { useState } from 'react';

/** @paper-design/shaders-react@0.0.80 */
import { MeshGradient } from '@paper-design/shaders-react';

import './styles.css';
import { CATEGORIES, type Item } from './content';

function Button({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className="nav-item" aria-pressed={active} onClick={onClick}>
      <div className={`button-${label}`}>{label}</div>
    </button>
  );
}

/* Bare URLs and emails are written as plain text in content.ts, so turn them
   into anchors here rather than duplicating markup for every entry. The email
   branch has to come first, otherwise only the domain part of an address
   matches. TLDs are an explicit list (and case-sensitive) so prose like
   "Prof. Nicolas" cannot look like a host. */
const LINK =
  /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?:[a-z0-9-]+\.)+(?:com|org|net|edu|ca|ai|io|dev|at|fyi|cn|tw|hk|jp|sg|ae|il|xyz|ch|nl|es|uk|cy|de|fi|is|cern|site|jobs|domains)(?:\/[\w\-./?#=&%]*[\w\-/?#=&%])?)/g;

function linkify(text: string) {
  return text.split(LINK).map((part, i) =>
    i % 2 === 0 ? (
      part
    ) : (
      <a
        key={i}
        href={part.includes('@') ? `mailto:${part}` : `https://${part}`}
        target="_blank"
        rel="noreferrer"
      >
        {part}
      </a>
    ),
  );
}

/* Split into two columns once a list is long enough to be worth splitting. */
function columns(items: Item[]): Item[][] {
  if (items.length <= 3) return [items];
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}

export default function () {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);
  const category = CATEGORIES.find((c) => c.id === activeId)!;

  return (
    <div className="page">
      <MeshGradient
        speed={1}
        scale={1}
        distortion={0.8}
        swirl={0.1}
        frame={41671.99999996429}
        colors={['#2d4249', '#0b0a30', '#023c58', '#1c1e45']}
        className="backdrop"
      />

      {/* Fixed shell: title and nav never scroll. The scroll area's own top
          edge is the rule, so content is clipped at it. */}
      <header className="header">
        <h1 className="page-title">UofT CS Guide</h1>

        <nav className="nav">
          {CATEGORIES.map((c) => (
            <Button
              key={c.id}
              label={c.label}
              active={c.id === activeId}
              onClick={() => setActiveId(c.id)}
            />
          ))}
        </nav>
      </header>

      <main className="content">
          {category.sections.length === 0 ? (
            <p className="empty">Nothing here yet.</p>
          ) : (
            category.sections.map((section) => (
              <div className="section" key={section.label}>
                <div className="section-label">{section.label}</div>
                <div className="cols">
                  {columns(section.items).map((col, i) => (
                    <div className="col" key={i}>
                      {col.map((item) => (
                        <div className="item" key={item.title}>
                          <div className="item-title">{item.title}</div>
                          {item.desc && <div className="item-desc">{linkify(item.desc)}</div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
      </main>
    </div>
  );
}
