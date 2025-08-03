import { ArrowLeft } from "lucide-react";
import MenuBarItem from "./MenuBarItem";
import useBackBtn from "@/hooks/component-hooks/useBackBtn";

export default function MenuBarBackBtn() {
   const { goBack } = useBackBtn();

   return (
      <MenuBarItem
         asChild
         onClick={goBack}
         className="hover:border-foreground/30 cursor-pointer rounded-sm border border-transparent py-0.5 text-sm text-white"
      >
         <ArrowLeft className="lucide-exempt mt-0.5 size-3.5" />
      </MenuBarItem>
   );
}
