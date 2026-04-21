import "./style.css";
import { getLatestReleaseAssets, getOS } from "./lib";

const downloadBtn = document.querySelector("#downloadBtn") as HTMLAnchorElement;
const downloads = document.querySelector("#downloads") as HTMLDivElement;
const assetsLoader = document.querySelector("#assets-loader") as HTMLDivElement;

const OS_ORDER = ["Windows", "Mac", "Linux", "Unknown"] as const;

document.addEventListener("DOMContentLoaded", async () => {
   const os = getOS();
   if (os !== "unknown") {
      downloadBtn.innerText = `Download For ${os}`;
      downloadBtn.href = `#downloads-${os.toLowerCase()}`;
   }

   const assets = await getLatestReleaseAssets();
   assetsLoader.remove();
   const groupedAssets = new Map<FriendlyAsset["os"], typeof assets>();

   assets.forEach((asset) => {
      const friendlyAsset = formatAssetName(asset.name);
      if (!groupedAssets.has(friendlyAsset.os)) {
         groupedAssets.set(friendlyAsset.os, []);
      }

      groupedAssets.get(friendlyAsset.os)?.push(asset);
   });

   OS_ORDER.forEach((osName) => {
      const osAssets = groupedAssets.get(osName);
      if (!osAssets?.length) return;

      const section = document.createElement("section");
      section.id = `downloads-${osName.toLowerCase()}`;
      section.className = "mb-6";

      const heading = document.createElement("h2");
      heading.innerText = osName;
      heading.className = "mb-2 text-xl font-bold";
      section.appendChild(heading);

      const list = document.createElement("div");
      list.className = "space-y-1";

      osAssets.forEach((asset) => {
         const assetEl = document.createElement("a");
         assetEl.href = asset.browser_download_url;
         assetEl.innerText = formatAssetName(asset.name).label;
         assetEl.className = "block py-2 text-lg text-PRIMARY";
         list.appendChild(assetEl);
      });

      section.appendChild(list);
      downloads.appendChild(section);
   });
});

type FriendlyAsset = {
   label: string;
   os: "Windows" | "Linux" | "Mac" | "Unknown";
   arch: "x64" | "arm64" | "x86" | "Unknown";
   type: string;
   version?: string;
};

export function formatAssetName(name: string): FriendlyAsset {
   const lower = name.toLowerCase();

   // --- OS detection ---
   let os: FriendlyAsset["os"] = "Unknown";
   if (/\.(exe|msi)$/.test(lower)) os = "Windows";
   else if (/\.(dmg|pkg)$/.test(lower)) os = "Mac";
   else if (/\.(appimage|deb|rpm|tar\.gz|tar\.xz)$/.test(lower)) os = "Linux";

   // --- Architecture detection ---
   let arch: FriendlyAsset["arch"] = "Unknown";
   if (/(x86_64|amd64|x64)/.test(lower)) arch = "x64";
   else if (/(aarch64|arm64)/.test(lower)) arch = "arm64";
   else if (/(x86|i386)/.test(lower)) arch = "x86";

   // --- Version extraction ---
   const versionMatch = name.match(/(\d+\.\d+\.\d+)/);
   const version = versionMatch?.[1];

   // --- File type (handle double extensions like .tar.gz) ---
   let type = "Archive";
   if (lower.endsWith(".tar.gz")) type = "tar.gz archive";
   else if (lower.endsWith(".tar.xz")) type = "tar.xz archive";
   else if (lower.endsWith(".appimage")) type = "AppImage";
   else if (lower.endsWith(".deb")) type = "Debian package";
   else if (lower.endsWith(".rpm")) type = "RPM package";
   else if (lower.endsWith(".exe")) type = "Installer (.exe)";
   else if (lower.endsWith(".msi")) type = "Installer (.msi)";
   else if (lower.endsWith(".dmg")) type = "Disk image (.dmg)";
   else if (lower.endsWith(".pkg")) type = "Installer (.pkg)";
   else if (lower.endsWith(".zip")) type = "ZIP archive";

   // --- Build human-friendly label ---
   const parts = [];

   if (os !== "Unknown") parts.push(os);
   if (arch !== "Unknown") parts.push(arch);
   parts.push(type);

   let label = parts.join(" • ");

   if (version) {
      label += ` (v${version})`;
   }

   return {
      label,
      os,
      arch,
      type,
      version,
   };
}
