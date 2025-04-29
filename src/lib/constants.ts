import Signin from "@/routes/Signin";
import { random_global_auth_keyword } from "./utils";
import Home from "@/routes/Home";
import NotFound from "@/routes/NotFound";
import ProjectDashboard from "@/routes/ProjectDashboard";
import { TaskPriority } from "@/types/types";

export const GITHUB_INSTALL_URL = `https://github.com/apps/Task-Bridge/installations/new?prompt=select_account&state=${random_global_auth_keyword()}`;

export const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}&prompt=select_account&state=${random_global_auth_keyword()}`;

export const STORE_PATH = "store.json";

export const ROUTES = [
   { path: "/", component: Signin },
   { path: "/home", component: Home },
   { path: "/project-dashboard/:projectId", component: ProjectDashboard },
   { path: "*", component: NotFound },
];

export const TEAM_LOGINS_SEPERATOR = "-;;-";

export const TASK_PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];

export const MINIMUM_ALLOWABLE_FETCH_INTERVAL_IN_MS = 7500; // 7.5 seconds (8 times per minute)
