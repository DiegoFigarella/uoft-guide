import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './courses.css';
import PrereqGraph from './PrereqGraph';
import {
  getCourse,
  getPlan,
  isGroup,
  searchCourses,
  type Course,
  type CourseSummary,
  type Plan,
  type PrereqGroup,
  type PrereqItem,
} from './api';

/* The courses tab. Walks a student from the courses they have finished to a
   target course, one choice at a time: the api answers what is takeable now,
   this decides how it reads. State survives a reload because retyping a
   transcript is the one thing nobody will do twice. */

const STORE = 'uoft-guide-courses';

type Saved = { completed: string[]; target: string | null };

function load(): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? '') as Saved;
    if (Array.isArray(saved.completed)) return saved;
  } catch {
    /* nothing saved, or saved by an older version */
  }
  return { completed: [], target: null };
}

function useDebounced<T>(value: T, delay = 200): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

/* One search box. Results are a listbox under the input, so keyboard users get
   the same picking mechanism as the mouse. */
function CourseSearch({
  id,
  label,
  hint,
  onPick,
}: {
  id: string;
  label: string;
  hint: string;
  onPick: (course: CourseSummary) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CourseSummary[]>([]);
  const [failed, setFailed] = useState(false);
  const settled = useDebounced(query.trim());

  useEffect(() => {
    if (settled.length < 2) {
      setResults([]);
      return;
    }
    const abort = new AbortController();
    searchCourses(settled, abort.signal)
      .then((found) => {
        setResults(found);
        setFailed(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setFailed(true);
      });
    return () => abort.abort();
  }, [settled]);

  function pick(course: CourseSummary) {
    onPick(course);
    setQuery('');
    setResults([]);
  }

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="field-control">
        <input
          id={id}
          className="input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Code or title, e.g. CSC207 or software design"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && results.length > 0) pick(results[0]);
          }}
          aria-describedby={`${id}-hint`}
        />

        {results.length > 0 && (
          <ul className="results" role="listbox" aria-label={`${label} results`}>
            {results.map((course) => (
              <li key={course.code}>
                <button className="result" type="button" onClick={() => pick(course)}>
                  <span className="result-code">{course.code}</span>
                  <span className="result-name">{course.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="field-hint" id={`${id}-hint`}>
        {failed ? 'Search is unavailable right now.' : hint}
      </div>
    </div>
  );
}

/* The prerequisite tree, indented the way the original desktop app printed it:
   nested ALL of / ONE of groups, with the courses already done ticked off. */
function PrereqTree({
  group,
  completed,
  depth = 0,
}: {
  group: PrereqGroup;
  completed: Set<string>;
  depth?: number;
}) {
  return (
    <ul className={`prereq${depth === 0 ? ' prereq-root' : ''}`}>
      <li className="prereq-op">{group.operator === 'AND' ? 'All of' : 'One of'}</li>
      {group.items.map((item: PrereqItem, i) => {
        if (typeof item === 'string') {
          const done = completed.has(item);
          return (
            <li key={`${item}-${i}`} className={`prereq-course${done ? ' is-done' : ''}`}>
              <span aria-hidden="true" className="prereq-mark">
                {done ? '✓' : '·'}
              </span>
              {item}
              {done && <span className="prereq-done"> done</span>}
            </li>
          );
        }
        if (isGroup(item)) {
          return (
            <li key={`group-${i}`}>
              <PrereqTree group={item} completed={completed} depth={depth + 1} />
            </li>
          );
        }
        return (
          <li key={`credits-${i}`} className="prereq-course">
            <span aria-hidden="true" className="prereq-mark">
              ·
            </span>
            {item.credits} credits{item.department ? ` in ${item.department}` : ''}
          </li>
        );
      })}
    </ul>
  );
}

function Detail({
  course,
  completed,
  isOption,
  onTake,
}: {
  course: Course;
  completed: Set<string>;
  isOption: boolean;
  onTake: (code: string) => void;
}) {
  const done = completed.has(course.code);

  return (
    <div className="detail">
      <div className="detail-head">
        <div className="detail-code">{course.code}</div>
        <div className="detail-name">{course.name}</div>
      </div>

      <dl className="facts">
        <div className="fact">
          <dt>Credits</dt>
          <dd>{course.credits.toFixed(1)}</dd>
        </div>
        <div className="fact">
          <dt>Hours</dt>
          <dd>{course.hours ?? '—'}</dd>
        </div>
        <div className="fact">
          <dt>Breadth</dt>
          <dd>{course.breadth ?? '—'}</dd>
        </div>
      </dl>

      {course.description && <p className="detail-desc">{course.description}</p>}

      <div className="detail-block">
        <div className="detail-label">Prerequisites</div>
        {course.prereq_tree ? (
          <PrereqTree group={course.prereq_tree} completed={completed} />
        ) : (
          <div className="detail-none">None</div>
        )}
      </div>

      {course.exclusions.length > 0 && (
        <div className="detail-block">
          <div className="detail-label">Exclusions</div>
          <div className="detail-none">{course.exclusions.join(', ')}</div>
        </div>
      )}

      {done ? (
        <div className="detail-none">Already in your completed courses.</div>
      ) : (
        <button className="take" type="button" onClick={() => onTake(course.code)}>
          {isOption ? 'Take this next' : 'Mark as completed'}
        </button>
      )}
    </div>
  );
}

export default function Courses() {
  const initial = useMemo(load, []);
  const [completed, setCompleted] = useState<string[]>(initial.completed);
  const [target, setTarget] = useState<string | null>(initial.target);
  const [selected, setSelected] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);

  const completedSet = useMemo(() => new Set(completed), [completed]);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify({ completed, target }));
  }, [completed, target]);

  useEffect(() => {
    if (!target) {
      setPlan(null);
      return;
    }
    const abort = new AbortController();
    setBusy(true);
    getPlan(target, completed, abort.signal)
      .then((next) => {
        setPlan(next);
        setError(null);
      })
      .catch((issue) => {
        if (issue.name !== 'AbortError') setError('Could not reach the courses service.');
      })
      .finally(() => setBusy(false));
    return () => abort.abort();
  }, [target, completed]);

  useEffect(() => {
    if (!selected) {
      setCourse(null);
      return;
    }
    const abort = new AbortController();
    getCourse(selected, abort.signal)
      .then(setCourse)
      .catch((issue) => {
        if (issue.name !== 'AbortError') setCourse(null);
      });
    return () => abort.abort();
  }, [selected]);

  const add = useCallback((code: string) => {
    setCompleted((current) => {
      if (current.includes(code)) return current;
      history.current.push(code);
      return [...current, code];
    });
  }, []);

  function remove(code: string) {
    setCompleted((current) => current.filter((item) => item !== code));
    history.current = history.current.filter((item) => item !== code);
  }

  function undo() {
    const last = history.current.pop();
    if (last) remove(last);
  }

  function reset() {
    history.current = [];
    setCompleted([]);
    setTarget(null);
    setSelected(null);
  }

  const options = plan?.options ?? [];
  const optionCodes = useMemo(() => new Set(options.map((option) => option.code)), [options]);

  /* Department headings inside the options list: the first option of each
     department carries the heading, as in the original app. */
  const departments = new Set<string>();

  return (
    <>
      <div className="section">
        <div className="section-label">Your courses</div>
        <div className="courses-setup">
          <div className="setup-col">
            <CourseSearch
              id="completed-search"
              label="Courses you have completed"
              hint="Add every course you already have credit for."
              onPick={(picked) => add(picked.code)}
            />
            {completed.length > 0 ? (
              <ul className="chips" aria-label="Completed courses">
                {completed.map((code) => (
                  <li key={code}>
                    <span className="chip">
                      <button
                        className="chip-code"
                        type="button"
                        onClick={() => setSelected(code)}
                        aria-label={`Show ${code}`}
                      >
                        {code}
                      </button>
                      <button
                        className="chip-remove"
                        type="button"
                        onClick={() => remove(code)}
                        aria-label={`Remove ${code}`}
                      >
                        &times;
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="detail-none">Nothing added yet.</div>
            )}
          </div>

          <div className="setup-col">
            <CourseSearch
              id="target-search"
              label="Course you are working towards"
              hint="Pick one course to plan a route to."
              onPick={(picked) => {
                setTarget(picked.code);
                setSelected(picked.code);
              }}
            />
            {target ? (
              <div className="target">
                <div className="target-code">{target}</div>
                <div className="target-meta">
                  {plan?.reached
                    ? 'Done'
                    : plan?.eligible
                      ? 'You can take it now'
                      : `${options.length} course${options.length === 1 ? '' : 's'} to choose from`}
                  {' · '}
                  {(plan?.credits ?? 0).toFixed(1)} credits completed
                </div>
                <div className="target-actions">
                  <button className="ghost" type="button" onClick={undo} disabled={history.current.length === 0}>
                    Undo last
                  </button>
                  <button className="ghost" type="button" onClick={reset}>
                    Start over
                  </button>
                </div>
              </div>
            ) : (
              <div className="detail-none">No target yet.</div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="section">
          <div className="section-label">Courses service</div>
          <p className="detail-desc" role="alert">
            {error} Start it with <code>uvicorn main:app</code> in the <code>api</code> folder, or
            point <code>VITE_API_URL</code> at where it runs.
          </p>
        </div>
      )}

      {target && !error && (
        <div className="section">
          <div className="section-label">
            {plan?.reached ? 'Target reached' : plan?.eligible ? 'Ready to take' : 'Choose your next course'}
          </div>

          <div className="courses-plan">
            <div className="options" aria-live="polite">
              {busy && !plan && <div className="detail-none">Working out your options…</div>}

              {plan?.reached && (
                <p className="detail-desc">
                  {target} is in your completed courses. Pick a new target to keep going.
                </p>
              )}

              {plan && !plan.reached && options.length === 0 && (
                <p className="detail-desc">
                  Nothing left to choose. The prerequisites that remain are credit requirements, or
                  courses from another campus that this dataset does not carry.
                </p>
              )}

              {options.map((option) => {
                const heading = !departments.has(option.department) && option.code !== target;
                if (heading) departments.add(option.department);
                return (
                  <div key={option.code}>
                    {heading && <div className="options-dept">{option.department}</div>}
                    <button
                      type="button"
                      className={`option${option.code === target ? ' is-target' : ''}${
                        selected === option.code ? ' is-selected' : ''
                      }`}
                      onClick={() => setSelected(option.code)}
                      aria-pressed={selected === option.code}
                    >
                      <span className="option-code">{option.code}</span>
                      <span className="option-name">{option.name}</span>
                      {option.code === target && <span className="option-tag">Target</span>}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="detail-panel">
              {course ? (
                <Detail
                  course={course}
                  completed={completedSet}
                  isOption={optionCodes.has(course.code)}
                  onTake={(code) => add(code)}
                />
              ) : (
                <div className="detail-none">Pick a course to read about it.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {plan && plan.graph.nodes.length > 0 && !error && (
        <div className="section">
          <div className="section-label">Your path</div>
          <ul className="legend">
            <li>
              <span className="swatch is-completed" aria-hidden="true" />
              Completed
            </li>
            <li>
              <span className="swatch is-goal" aria-hidden="true" />
              Your target
            </li>
          </ul>
          <PrereqGraph
            nodes={plan.graph.nodes}
            edges={plan.graph.edges}
            selected={selected}
            onSelect={setSelected}
          />
          <div className="field-hint">
            Only the courses you picked, chained by prerequisite. Each row sits one step further
            along than the one above it.
          </div>
        </div>
      )}
    </>
  );
}
