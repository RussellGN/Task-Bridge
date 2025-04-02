import useHome from "@/hooks/route-hooks/useHome";
import DefaultTab from "@/components/screens/home/DefaultTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
   const { user, loading, error } = useHome();
   const TABS = [{ name: "Default", Component: <DefaultTab loading={loading} error={error} user={user} /> }];

   return (
      <div>
         <Tabs defaultValue={TABS[0].name} className="w-[400px]">
            <TabsList>
               {TABS.map((tab) => (
                  <TabsTrigger key={tab.name} value={tab.name}>
                     {tab.name}
                  </TabsTrigger>
               ))}
            </TabsList>

            <div>
               {TABS.map((tab) => (
                  <TabsContent key={tab.name} value={tab.name}>
                     {tab.Component}
                  </TabsContent>
               ))}
            </div>
         </Tabs>

         <DefaultTab loading={loading} error={error} user={user} />
      </div>
   );
}
