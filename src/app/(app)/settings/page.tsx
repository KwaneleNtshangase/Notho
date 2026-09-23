"use client";

import { SettingsView } from "@/components/SettingsView";
import { useNotho } from "@/context/NothoContext";
import { useProfileHandlers } from "@/hooks/useProfileHandlers";

export default function SettingsPage() {
  const { userData, setDailyGoal, resetProgress, userSettings } = useNotho();
  const { handleProfileSignOut, handleDownloadData, handleDeleteAccount } = useProfileHandlers();

  return (
    <SettingsView
      userData={userData as any}
      setDailyGoal={setDailyGoal}
      resetProgress={() => {
        const confirmReset = window.confirm("Are you sure you want to reset all progress?");
        if (confirmReset) resetProgress();
      }}
      userSettings={userSettings}
      onSignOut={handleProfileSignOut}
      onDeleteAccount={handleDeleteAccount}
      onDownloadData={handleDownloadData}
    />
  );
}
