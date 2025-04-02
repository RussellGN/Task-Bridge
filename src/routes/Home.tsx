import useHome from "@/hooks/route-hooks/useHome";
import DefaultTab from "@/components/screens/home/DefaultTab";

export default function Home() {
   const { user, loading, error } = useHome();

   return (
      <div>
         <DefaultTab loading={loading} error={error} user={user} />
      </div>
   );
}
