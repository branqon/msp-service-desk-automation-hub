export type DiffSegment = {
  type: "equal" | "added" | "removed";
  value: string;
};

// When the reviewer preserves less than this fraction of the original, collapse
// the fragmented word-level output to a clean "old vs new" replacement view.
const REWRITE_THRESHOLD = 0.4;

function tokenize(text: string): string[] {
  return text.match(/\S+\s*|\s+/g) ?? [];
}

function normalize(token: string): string {
  return token.replace(/\s+$/, "");
}

function segmentsFromLCS(before: string[], after: string[]): DiffSegment[] {
  const rows = before.length;
  const cols = after.length;

  const table: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array(cols + 1).fill(0),
  );

  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      if (normalize(before[i]) === normalize(after[j])) {
        table[i][j] = table[i + 1][j + 1] + 1;
      } else {
        table[i][j] = Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }
  }

  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  const push = (type: DiffSegment["type"], value: string) => {
    const prev = segments[segments.length - 1];
    if (prev && prev.type === type) {
      prev.value += value;
    } else {
      segments.push({ type, value });
    }
  };

  while (i < rows && j < cols) {
    if (normalize(before[i]) === normalize(after[j])) {
      push("equal", after[j]);
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      push("removed", before[i]);
      i++;
    } else {
      push("added", after[j]);
      j++;
    }
  }

  while (i < rows) {
    push("removed", before[i]);
    i++;
  }

  while (j < cols) {
    push("added", after[j]);
    j++;
  }

  return segments;
}

function preservedRatio(segments: DiffSegment[], original: string, revised: string): number {
  const denom = Math.max(original.length, revised.length);
  if (denom === 0) return 1;

  let equal = 0;
  for (const segment of segments) {
    if (segment.type === "equal") {
      equal += segment.value.length;
    }
  }

  return equal / denom;
}

export function wordDiff(original: string, revised: string): DiffSegment[] {
  if (original === revised) {
    return original ? [{ type: "equal", value: original }] : [];
  }

  const before = tokenize(original);
  const after = tokenize(revised);
  const segments = segmentsFromLCS(before, after);

  if (preservedRatio(segments, original, revised) < REWRITE_THRESHOLD) {
    const fallback: DiffSegment[] = [];
    if (original) fallback.push({ type: "removed", value: original });
    if (revised) fallback.push({ type: "added", value: revised });
    return fallback;
  }

  return segments;
}

export function diffCounts(segments: DiffSegment[]): {
  added: number;
  removed: number;
} {
  let added = 0;
  let removed = 0;

  for (const segment of segments) {
    if (segment.type === "added" && segment.value.trim().length > 0) {
      added += segment.value.trim().split(/\s+/).length;
    } else if (segment.type === "removed" && segment.value.trim().length > 0) {
      removed += segment.value.trim().split(/\s+/).length;
    }
  }

  return { added, removed };
}
