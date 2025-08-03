import { useNavigate } from "react-router";

export default function useBackBtn(path?: string) {
   const navigate = useNavigate();
   const goBack = () => navigate(-1);
   const goToPath = () => navigate(path || "/");

   return {
      goBack,
      goToPath,
   };
}
