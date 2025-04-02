import useHome from "@/hooks/route-hooks/useHome";
import DefaultTab from "@/components/screens/home/DefaultTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderPlus, FolderTree, HomeIcon } from "lucide-react";
import NewProjectTab from "@/components/screens/home/NewProjectTab";
import AllProjectsTab from "@/components/screens/home/AllProjectsTab";

export default function Home() {
   const { user, loading, error } = useHome();

   const TABS = [
      { name: "Home", Icon: HomeIcon, component: <DefaultTab loading={loading} error={error} user={user} /> },
      { name: "New Project", Icon: FolderPlus, component: <NewProjectTab /> },
      { name: "All Projects", Icon: FolderTree, component: <AllProjectsTab /> },
   ];

   return (
      <div className="p-10 h-screen">
         <Tabs defaultValue={TABS[0].name} className="grid grid-cols-12 gap-4 items-start h-full">
            <TabsList className="col-span-2 flex flex-col gap-4">
               {TABS.map((tab) => (
                  <TabsTrigger key={tab.name} value={tab.name} className="border-foreground/20 gap-3 py-2">
                     {tab.name}
                     <tab.Icon />
                  </TabsTrigger>
               ))}
            </TabsList>

            {TABS.map((tab) => (
               <TabsContent
                  key={tab.name}
                  value={tab.name}
                  className="col-span-10 bg-foreground/5 rounded-md p-4 h-full"
               >
                  {tab.component}
               </TabsContent>
            ))}
         </Tabs>
      </div>
   );
}
