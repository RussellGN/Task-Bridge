import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";

type BackButtonProps = {
   className?: string;
   path?: string;
};

export default function BackBtn({ className }: BackButtonProps) {
   const navigate = useNavigate();
   const goBack = () => navigate(-1);

   return (
      <Button onClick={goBack} size="icon" variant="outline" className={className}>
         <ArrowLeft />
      </Button>
   );
}
