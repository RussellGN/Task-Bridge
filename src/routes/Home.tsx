import useHome from "@/hooks/route-hooks/useHome";
import HomeTab from "@/components/screens/home/HomeTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderTree, HomeIcon } from "lucide-react";
import AllProjectsTab from "@/components/screens/home/AllProjectsTab";

export default function Home() {
   const { user, loading, error, activeTab, setActiveTab } = useHome();

   const TABS = [
      {
         value: "home",
         label: "Home",
         Icon: HomeIcon,
         component: <HomeTab loading={loading} error={error} user={user} />,
      },
      { value: "all", label: "All Projects", Icon: FolderTree, component: <AllProjectsTab /> },
   ];

   return (
      <Tabs value={activeTab} className="flex h-full grid-cols-12 flex-col gap-4 md:grid md:items-start">
         <TabsList className="col-span-2 flex gap-4 md:flex-col">
            {TABS.map((tab) => (
               <TabsTrigger
                  onClick={() => setActiveTab(tab.value)}
                  key={tab.value}
                  value={tab.value}
                  className="border-foreground/20 gap-2 lg:gap-3 lg:py-2"
               >
                  {tab.label}
                  <tab.Icon />
               </TabsTrigger>
            ))}
         </TabsList>

         {TABS.map((tab) => (
            <TabsContent
               key={tab.value}
               value={tab.value}
               className="bg-foreground/5 col-span-10 grow rounded-md p-4 md:h-full"
            >
               {tab.component}
            </TabsContent>
         ))}
      </Tabs>
   );
}
