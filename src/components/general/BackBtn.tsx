import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import useBackBtn from "@/hooks/component-hooks/useBackBtn";

type BackButtonProps = {
   className?: string;
   path?: string;
};

export default function BackBtn({ className, path }: BackButtonProps) {
   const { goBack, goToPath } = useBackBtn(path);

   return (
      <Button onClick={path ? goToPath : goBack} size="icon" variant="outline" className={className}>
         <ArrowLeft />
      </Button>
   );
}
