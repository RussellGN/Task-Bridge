import { ArrowLeft } from "lucide-react";
import MenuBarItem from "./MenuBarItem";
import useBackBtn from "@/hooks/component-hooks/useBackBtn";

export default function MenuBarBackBtn() {
   const { goBack } = useBackBtn();

   return (
      <MenuBarItem asChild onClick={goBack} className="cursor-pointer py-0.5 text-sm text-white hover:bg-black">
         <ArrowLeft className="lucide-exempt mt-0.5 size-3.5" />
      </MenuBarItem>
   );
}
