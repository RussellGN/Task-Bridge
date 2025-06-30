import useAppPreferences from "../useAppPreferences";
import useProjectSettings from "../useProjectSettings";

export default function useSettings() {
   const { project, projectLoading, updateProjectSettings } = useProjectSettings();
   const { appPreferences, appPreferencesloading, updateAppPreferences } = useAppPreferences();

   return {
      project,
      appPreferences,
      loading: appPreferencesloading || projectLoading,
      handleSubmit: project ? updateProjectSettings : updateAppPreferences,
   };
}
