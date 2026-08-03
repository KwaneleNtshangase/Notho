import { supabase } from "@/lib/supabaseClient";
import { reportClientError } from "@/lib/errorReporting";

export function useProfileHandlers() {
  const handleProfileSignOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("notho-")) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      window.location.href = "/";
    }
  };

  const handleDownloadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const lsData: Record<string, string> = {};
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("notho-")) lsData[k] = localStorage.getItem(k) ?? "";
      }
    }
    let profileData: Record<string, unknown> = {};
    let progressData: Record<string, unknown> = {};
    if (user) {
      const [{ data: p }, { data: pr }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (p) profileData = p as Record<string, unknown>;
      if (pr) progressData = pr as Record<string, unknown>;
    }
    const exportPayload = {
      exportDate: new Date().toISOString(),
      exportNote: "Your Notho data export - requested under POPIA Section 23 (Right of Access)",
      account: { email: user?.email ?? "guest" },
      profile: profileData,
      progress: progressData,
      localStorageSnapshot: lsData,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notho-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Delete the signed-in user's account and all their data.
   *
   * Three things were wrong here, and together they made the red button do
   * nothing at all on iOS:
   *
   *   1. It POSTed to /api/admin/deleteUser, which does not exist. The route
   *      is /api/account/delete. Even a confirmed deletion 404'd.
   *   2. It sent no Authorization header. The real route identifies the user
   *      from their session token - deliberately, so nobody can delete someone
   *      else's account - so it would have returned 401 regardless.
   *   3. It called window.confirm() AFTER the app's own confirmation modal.
   *      Safari on iOS suppresses native dialogs in a lot of situations, and a
   *      suppressed confirm returns false, which took the silent early-return
   *      path. Pressing "Yes, Delete Everything" appeared to do nothing.
   *
   * The modal is the confirmation. One deliberate, well-worded confirmation
   * beats two, and the second one was the one that broke.
   */
  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No active session - please sign in again");

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ??
            `Account deletion failed (${res.status})`
        );
      }

      await handleProfileSignOut();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Account deletion failed";
      // Report it. A failed deletion is a POPIA obligation we did not meet, so
      // it must never be something we only find out about by being told.
      void reportClientError("account-delete-failed", new Error(msg));
      alert(
        `${msg}\n\nWe've logged this and we're on it. If it keeps happening, ` +
          `email support@notho.co.za and we'll delete your data manually.`
      );
    }
  };

  return {
    handleProfileSignOut,
    handleDownloadData,
    handleDeleteAccount,
  };
}
