import useAppPreferences from "../useAppPreferences";
import useProjectSettings from "../useProjectSettings";

export default function useSettings() {
   const { project, projectLoading } = useProjectSettings();
   const { appPreferences, appPreferencesloading, updateAppPreferences } = useAppPreferences();

   return { project, appPreferences, loading: appPreferencesloading || projectLoading, updateAppPreferences };
}
