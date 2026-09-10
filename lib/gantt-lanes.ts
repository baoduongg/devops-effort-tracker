interface Ranged {
  start: number;
  end: number;
}

/**
 * First-fit lane packing: each item joins the lowest-numbered lane whose
 * last-placed item doesn't overlap it. Items are packed in start-order so
 * packing is deterministic regardless of input order.
 */
export function assignLanes<T extends Ranged>(items: T[]): (T & { lane: number })[] {
  const sorted = [...items].sort((a, b) => a.start - b.start);
  const laneEnds: number[] = []; // laneEnds[i] = end day of the last item placed in lane i
  const result: (T & { lane: number })[] = [];

  for (const item of sorted) {
    let lane = laneEnds.findIndex((end) => end < item.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.end);
    } else {
      laneEnds[lane] = item.end;
    }
    result.push({ ...item, lane });
  }

  return result;
}

function demo() {
  // Two non-overlapping items share lane 0.
  const seq = assignLanes([{ start: 0, end: 2 }, { start: 3, end: 5 }]);
  console.assert(seq[0].lane === 0 && seq[1].lane === 0, "sequential items share lane 0");

  // Two overlapping items split into lane 0 and lane 1.
  const overlap = assignLanes([{ start: 0, end: 4 }, { start: 2, end: 6 }]);
  console.assert(overlap[0].lane === 0 && overlap[1].lane === 1, "overlapping items get different lanes");

  // Three-way overlap needs 3 lanes.
  const triple = assignLanes([
    { start: 0, end: 5 },
    { start: 1, end: 5 },
    { start: 2, end: 5 },
  ]);
  const lanes = new Set(triple.map((t) => t.lane));
  console.assert(lanes.size === 3, "three mutually-overlapping items get 3 distinct lanes");

  // Same-day-adjacent items (one's end equals the next's start) still share
  // day index 4, so with inclusive day-index ranges they must get separate lanes.
  const adjacent = assignLanes([{ start: 2, end: 4 }, { start: 4, end: 6 }]);
  console.assert(adjacent[0].lane !== adjacent[1].lane, "same-day-adjacent items (end==start) get different lanes");

  // A later item that only overlaps the first can reuse the second lane once it's free.
  const reuse = assignLanes([
    { start: 0, end: 2 },
    { start: 1, end: 3 },
    { start: 3, end: 5 },
  ]);
  console.assert(reuse[2].lane === 0, "a lane frees up once its occupant ends");
}

if (process.env.NODE_ENV === "test") demo();
