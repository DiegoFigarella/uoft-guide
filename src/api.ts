/* Client for the courses api in ../api. Everything the Courses tab knows about
   courses comes from here, so the shapes below are the api's response shapes. */

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export type CourseSummary = {
  code: string;
  name: string;
  department: string;
  level: number;
  credits: number;
  breadth: number | null;
};

/* A prerequisite tree node: a course code, a credit requirement, or a nested
   AND/OR group. Mirrors prereq_tree in the database. */
export type CreditRule = { credits: number | null; department: string | null };
export type PrereqGroup = { operator: 'AND' | 'OR'; items: PrereqItem[] };
export type PrereqItem = string | CreditRule | PrereqGroup;

export type Course = CourseSummary & {
  hours: string | null;
  description: string | null;
  exclusions: string[];
  prereq_tree: PrereqGroup | null;
};

export type GraphNode = CourseSummary & {
  depth: number;
  state: 'completed' | 'option' | 'pending';
  target: boolean;
};

export type Plan = {
  target: string;
  reached: boolean;
  eligible: boolean;
  credits: number;
  options: CourseSummary[];
  graph: { nodes: GraphNode[]; edges: { from: string; to: string }[] };
};

export function isGroup(item: PrereqItem): item is PrereqGroup {
  return typeof item !== 'string' && 'operator' in item;
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(BASE + path, { signal });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

export function searchCourses(query: string, signal?: AbortSignal) {
  return get<CourseSummary[]>(`/courses/search?q=${encodeURIComponent(query)}&limit=12`, signal);
}

export function getCourse(code: string, signal?: AbortSignal) {
  return get<Course>(`/courses/${encodeURIComponent(code)}`, signal);
}

export async function getPlan(target: string, completed: string[], signal?: AbortSignal) {
  const response = await fetch(`${BASE}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, completed }),
    signal,
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as Plan;
}
