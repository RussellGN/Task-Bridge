import "./style.css";
import { getOS } from "./lib";

const downloadBtn = document.querySelector("#downloadBtn") as HTMLAnchorElement;

document.addEventListener("DOMContentLoaded", () => {
   const os = getOS();
   if (os !== "unknown") {
      downloadBtn.innerText = `Download For ${os}`;
      // downloadBtn.href = `#dowload-${os}`;
   }
});
