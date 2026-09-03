import type { GraphNode } from './api';

/* Prerequisite graph, laid out by depth: every course sits one row below the
   deepest prerequisite chain that leads to it, which is the layout the original
   CSC111 project drew in Plotly. Two things are added because a static Plotly
   scatter did not need them: nodes in a row are ordered above their own
   prerequisites, so the edges do not turn into a fan, and rows are a grid, so
   node edges line up exactly across rows rather than nearly. */

const NODE_W = 98;
const NODE_H = 34;
const COL = NODE_W + 22;
const ROW = 92;
const PAD = 20;

type Placed = GraphNode & { x: number; y: number };

function place(
  nodes: GraphNode[],
  edges: { from: string; to: string }[],
): { placed: Placed[]; width: number; height: number } {
  const prereqs = new Map<string, string[]>();
  for (const { from, to } of edges) {
    prereqs.set(to, [...(prereqs.get(to) ?? []), from]);
  }

  const rows = new Map<number, GraphNode[]>();
  for (const node of nodes) {
    rows.set(node.depth, [...(rows.get(node.depth) ?? []), node]);
  }

  const column = new Map<string, number>();
  const placed: Placed[] = [];
  let widest = 0;

  /* Rows are filled shallowest first, so by the time a row is ordered every
     one of its prerequisites already has a column to average. */
  for (const depth of [...rows.keys()].sort((a, b) => a - b)) {
    const row = rows.get(depth)!;

    const pull = (node: GraphNode) => {
      const columns = (prereqs.get(node.code) ?? [])
        .map((code) => column.get(code))
        .filter((value): value is number => value !== undefined);
      // No placed prerequisite to sit under: leftmost, in code order.
      if (columns.length === 0) return 0;
      return columns.reduce((sum, value) => sum + value, 0) / columns.length;
    };

    if (depth > 0) row.sort((a, b) => pull(a) - pull(b) || a.code.localeCompare(b.code));

    // Each course wants the column its prerequisites average out to, so the
    // edges run mostly straight down. Ties and overlaps shift right.
    let next = 0;
    row.forEach((node) => {
      const wanted = depth === 0 ? next : Math.round(pull(node));
      const i = Math.max(wanted, next);
      next = i + 1;
      column.set(node.code, i);
      placed.push({ ...node, x: PAD + i * COL, y: PAD + depth * ROW });
      widest = Math.max(widest, i + 1);
    });
  }

  return {
    placed,
    width: PAD * 2 + Math.max(1, widest) * COL - (COL - NODE_W),
    height: PAD * 2 + rows.size * ROW - (ROW - NODE_H),
  };
}

export default function PrereqGraph({
  nodes,
  edges,
  selected,
  onSelect,
}: {
  nodes: GraphNode[];
  edges: { from: string; to: string }[];
  selected: string | null;
  onSelect: (code: string) => void;
}) {
  const { placed, width, height } = place(nodes, edges);
  const at = new Map(placed.map((node) => [node.code, node]));

  return (
    <div className="graph-scroll">
      <svg
        className="graph"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Your path: ${nodes.length} courses, ${edges.length} prerequisite links. The same courses are listed as chips above.`}
      >
        <g>
          {edges.map(({ from, to }) => {
            const a = at.get(from);
            const b = at.get(to);
            if (!a || !b) return null;
            const touches = selected === from || selected === to;
            const x1 = a.x + NODE_W / 2;
            const y1 = a.y + NODE_H;
            const x2 = b.x + NODE_W / 2;
            const y2 = b.y;
            // Leave each node vertically before bending, so a line never
            // appears to graze the box it started from.
            const bend = Math.min(40, (y2 - y1) / 2);
            return (
              <path
                key={`${from}-${to}`}
                d={`M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`}
                className={`graph-edge${touches ? ' is-lit' : ''}`}
              />
            );
          })}
        </g>

        {placed.map((node) => (
          <g
            key={node.code}
            className={`graph-node is-${node.state}${node.target ? ' is-target' : ''}${
              selected === node.code ? ' is-selected' : ''
            }`}
            transform={`translate(${node.x} ${node.y})`}
            tabIndex={0}
            role="button"
            aria-label={`${node.code} ${node.name}, ${node.state}${node.target ? ', target' : ''}`}
            onClick={() => onSelect(node.code)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(node.code);
              }
            }}
          >
            <rect width={NODE_W} height={NODE_H} />
            <text x={NODE_W / 2} y={NODE_H / 2 + 5}>
              {node.code}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
