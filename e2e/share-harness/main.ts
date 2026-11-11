import { shareTextNow, startDuoShare } from "@/lib/shareHandoff";

type ShareCall = { active: boolean; data: ShareData };

const calls: ShareCall[] = [];
const win = window as Window & {
  __shareCalls: ShareCall[];
  __opened: number;
  __pending: Promise<unknown>;
  __ready: boolean;
};

win.__shareCalls = calls;
win.__opened = 0;

const realOpen = window.open.bind(window);
window.open = ((...args: Parameters<typeof window.open>) => {
  win.__opened += 1;
  return realOpen(...args);
}) as typeof window.open;

navigator.share = (data: ShareData) => {
  calls.push({ active: navigator.userActivation?.isActive ?? false, data });
  return Promise.resolve();
};

document.getElementById("now")!.addEventListener("click", () => {
  win.__pending = shareTextNow({
    text: "Hello from Notho",
    title: "Notho",
    shareType: "lesson",
  });
});

document.getElementById("ios")!.addEventListener("click", () => {
  win.__pending = startDuoShare({
    text: "3 days straight",
    fileName: "notho-streak.png",
    shareType: "streak",
    createBlob: async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("canvas");
      return blob;
    },
  });
});

win.__ready = true;
