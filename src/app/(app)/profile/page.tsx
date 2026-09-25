"use client";

import { ProfileView } from "@/components/ProfileView";
import { useNotho } from "@/context/NothoContext";
import { useProfileHandlers } from "@/hooks/useProfileHandlers";
import { CONTENT_DATA } from "@/data/content";

export default function ProfilePage() {
  const { userData, setRoute, dailyGoal, setDailyGoal, completedLessons, userSettings, isLessonCompleted, perfectLessons } = useNotho();
  const { handleProfileSignOut, handleDownloadData, handleDeleteAccount } = useProfileHandlers();

  const getCourseBadgeIds = () => {
    return CONTENT_DATA.courses.filter(c => {
      const allLessons = c.units.flatMap(u => u.lessons);
      return allLessons.length > 0 && allLessons.every(l => isLessonCompleted(c.id, l.id));
    }).map(c => c.id);
  };

  return (
    <ProfileView
      userData={userData as any}
      onSignOut={handleProfileSignOut}
      onDeleteAccount={handleDeleteAccount}
      onDownloadData={handleDownloadData}
      onGoToSettings={() => setRoute({ name: "settings" })}
      currentUser={null}
      dailyGoal={dailyGoal}
      setDailyGoal={setDailyGoal}
      courseBadgeIds={getCourseBadgeIds()}
      courses={CONTENT_DATA.courses}
      completedLessons={completedLessons}
      perfectLessons={perfectLessons}
      calcSaved={userSettings.settings.calcSaved as any}
      onClearCalcSaved={() => {
        localStorage.removeItem("notho-calc-saved");
        void userSettings.setCalcSaved(null as any);
      }}
    />
  );
}
