import { retentionMove } from "@/lib/outcomes/falloff";
import type { UserDetail } from "./lib";

export function fallOffFor(d: UserDetail) {
  const last = [...(d.courses ?? [])].sort((a, b) => (b.lastSeen || "").localeCompare(a.lastSeen || ""))[0];
  const lastEvent = d.recentEvents?.find((e) => e.props?.lessonId);
  return retentionMove({
    lessonsDone: d.progress?.lessonsDone ?? 0,
    daysSinceSeen: d.daysSinceSeen,
    lastCourse: last?.courseId ?? null,
    lastLesson: lastEvent?.props?.lessonId ? String(lastEvent.props.lessonId) : null,
  });
}
