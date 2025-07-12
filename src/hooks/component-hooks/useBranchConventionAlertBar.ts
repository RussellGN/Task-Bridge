import useAppPreferences from "../useAppPreferences";

export default function useBranchConventionAlertBar() {
   const { appPreferences, appPreferencesloading, updateAppPreferencesManually } = useAppPreferences();

   function dontShowAgain() {
      if (!appPreferences) return;
      updateAppPreferencesManually({ ...appPreferences, show_branch_convention_alert: "no" });
   }

   return {
      loading: appPreferencesloading,
      shouldShow: appPreferences?.show_branch_convention_alert !== "no",
      dontShowAgain,
   };
}
