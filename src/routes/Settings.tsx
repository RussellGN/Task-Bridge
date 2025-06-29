import BackBtn from "@/components/general/BackBtn";
import { SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SETTINGS_TABS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import useSettings from "@/hooks/route-hooks/useSettings";
import SpinnerIcon from "@/components/general/SpinnerIcon";

export default function Settings() {
   const { project, settings, loading, patchSettings } = useSettings();

   return (
      <div>
         <div className="mb-4 flex items-center justify-between gap-2">
            <BackBtn />

            <div className="flex items-center gap-2">
               Settings <SettingsIcon className="mt-0.5" /> {project?.name}
            </div>

            <div className="lucide"></div>
         </div>

         <Tabs className="flex h-full grid-cols-12 flex-col gap-4 md:grid md:items-start">
            <TabsList className="col-span-2 flex gap-4 md:flex-col">
               {SETTINGS_TABS.map((tab) => (
                  <TabsTrigger
                     key={tab.value}
                     value={tab.value}
                     className="border-foreground/20 gap-2 lg:gap-3 lg:py-2"
                  >
                     {tab.label}
                     <tab.Icon />
                  </TabsTrigger>
               ))}
            </TabsList>

            {SETTINGS_TABS.map((tab) => (
               <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="bg-foreground/5 col-span-10 max-h-[80vh] grow overflow-y-auto rounded-md p-4"
               >
                  <form onSubmit={patchSettings}>
                     <tab.component settings={settings} />
                     <div className="mt-4 text-right">
                        <Button disabled={loading} type="submit" variant="PRIMARY">
                           {loading ? (
                              <>
                                 Saving... <SpinnerIcon />
                              </>
                           ) : (
                              "Save"
                           )}
                        </Button>
                     </div>
                  </form>
               </TabsContent>
            ))}
         </Tabs>
      </div>
   );
}
