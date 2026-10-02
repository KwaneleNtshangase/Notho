/** Plain-English fall-off for the Desk drawer. Not a marketing segment. */
export type FallOff = {
  where: string;
  move: string;
};

export function retentionMove(input: {
  lessonsDone: number;
  daysSinceSeen: number | null;
  lastCourse: string | null;
  lastLesson: string | null;
}): FallOff {
  const quiet = input.daysSinceSeen;
  const place = [input.lastCourse, input.lastLesson].filter(Boolean).join(" / ") || "no course recorded";

  if (input.lessonsDone < 1) {
    return {
      where: "Signed up and never finished a lesson.",
      move: "One next-lesson nudge after they have opened Learn. Do not email a digest.",
    };
  }
  if (quiet != null && quiet >= 30) {
    return {
      where: `Last seen ${quiet} days ago, after ${input.lessonsDone} lessons. Stopped around ${place}.`,
      move: "Past the win-back window. One resume ping at most, then stop. Do not keep the address on a broadcast list.",
    };
  }
  if (quiet != null && quiet >= 7) {
    return {
      where: `Quiet for ${quiet} days. Last course activity was ${place}.`,
      move: "Resume that course. No leaderboard, no advisor, no second push the same day.",
    };
  }
  return {
    where: `Still around. ${input.lessonsDone} lessons done. Last stop was ${place}.`,
    move: "Leave them. The next lesson is the retention move.",
  };
}
