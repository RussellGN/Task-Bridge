import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";

type BackButtonProps = {
   className?: string;
   path?: string;
};

export default function BackBtn({ className, path }: BackButtonProps) {
   return (
      <Button asChild size="icon" variant="outline" className={className}>
         <Link to={path || ".."}>
            <ArrowLeft />
         </Link>
      </Button>
   );
}
