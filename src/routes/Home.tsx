import useHome from "@/hooks/route-hooks/useHome";
import HomeTab from "@/components/screens/home/HomeTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderPlus, FolderTree, HomeIcon } from "lucide-react";
import NewProjectTab from "@/components/screens/home/NewProjectTab";
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
      { value: "new", label: "New Project", Icon: FolderPlus, component: <NewProjectTab /> },
      { value: "all", label: "All Projects", Icon: FolderTree, component: <AllProjectsTab /> },
   ];

   return (
      <div className="h-screen p-10">
         <Tabs value={activeTab} className="grid h-full grid-cols-12 items-start gap-4">
            <TabsList className="col-span-2 flex flex-col gap-4">
               {TABS.map((tab) => (
                  <TabsTrigger
                     onClick={() => setActiveTab(tab.value)}
                     key={tab.value}
                     value={tab.value}
                     className="border-foreground/20 gap-3 py-2"
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
                  className="bg-foreground/5 col-span-10 h-full rounded-md p-4"
               >
                  {tab.component}
               </TabsContent>
            ))}
         </Tabs>
      </div>
   );
}
