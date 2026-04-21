export type OS = "Mac" | "Windows" | "Linux" | "unknown";

export function getOS(): OS {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const uaData = (navigator as any).userAgentData;
   if (uaData?.platform) {
      const p = uaData.platform.toLowerCase();
      if (p.includes("mac")) return "Mac";
      if (p.includes("win")) return "Windows";
      if (p.includes("linux")) return "Linux";
   }

   // fallbacks
   const platform = (navigator.platform || "").toLowerCase();
   const ua = (navigator.userAgent || "").toLowerCase();

   const source = `${platform} ${ua}`;

   if (source.includes("mac")) return "Mac";
   if (source.includes("win")) return "Windows";
   if (source.includes("linux")) return "Linux";

   return "unknown";
}
