import Signin from "@/routes/Signin";
import { random_global_auth_keyword } from "./utils";
import Home from "@/routes/Home";
import NotFound from "@/routes/NotFound";
import ProjectDashboard from "@/routes/ProjectDashboard";
import { TaskPriority } from "@/types/types";
import { ExternalToast } from "sonner";
import Settings from "@/routes/Settings";
import { Eye, RotateCcw, Users } from "lucide-react";
import SyncSettings from "@/components/screens/settings/SyncSettings";
import { SettingsTab } from "@/types/interfaces";
import TeamManagementSettings from "@/components/screens/settings/TeamManagementSettings";
import NameAndVisibilitySettings from "@/components/screens/settings/NameAndVisibilitySettings";

export const GITHUB_INSTALL_URL = `https://github.com/apps/Task-Bridge/installations/new?prompt=select_account&state=${random_global_auth_keyword()}`;

export const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}&prompt=select_account&state=${random_global_auth_keyword()}`;

export const STORE_PATH = "store.json";

export const ROUTES = [
   { path: "/", component: Signin },
   { path: "/home", component: Home },
   { path: "/settings", component: Settings },
   { path: "/settings/:projectId", component: Settings },
   { path: "/project-dashboard/:projectId", component: ProjectDashboard },
   { path: "*", component: NotFound },
];

export const TEAM_LOGINS_SEPERATOR = "-;;-";

export const TASK_PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];

export const MINIMUM_ALLOWABLE_FETCH_INTERVAL_IN_MS = 7500; // 7.5 seconds (8 times per minute)

export const MAX_ERR_LENGTH = 200;

export const DEFAULT_NONE_SELECT_VALUE = "none";

export const DEFAULT_TOAST_OPTIONS: ExternalToast = {
   duration: 10000,
   dismissible: true,
};

export const PROJECT_DASHBOARD_SYNC_INTERVAL_MILLI_SECONDS = 1000 * 60 * 10; // 10 minutes

const BASE_SETTINGS_TABS: SettingsTab[] = [
   {
      value: "github-syncing",
      label: "GitHub Syncing",
      Icon: RotateCcw,
      component: SyncSettings,
   },
];

export const SETTINGS_TABS: SettingsTab[] = [...BASE_SETTINGS_TABS];

export const PROJECT_SETTINGS_TABS: SettingsTab[] = [
   ...BASE_SETTINGS_TABS,
   {
      value: "team-management",
      label: "Team Management",
      Icon: Users,
      component: TeamManagementSettings,
   },
   {
      value: "name-visibility",
      label: "Name & Visibility",
      Icon: Eye,
      component: NameAndVisibilitySettings,
   },
   // deleting project.
];
