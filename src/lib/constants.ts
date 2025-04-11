import Signin from "@/routes/Signin";
import { random_global_auth_keyword } from "./utils";
import Home from "@/routes/Home";
import NotFound from "@/routes/NotFound";
import ProjectDashboard from "@/routes/ProjectDashboard";

export const GITHUB_AUTH_URL = `https://github.com/apps/Task-Bridge/installations/new?prompt=select_account&state=${random_global_auth_keyword()}`;

export const STORE_PATH = "store.json";

export const ROUTES = [
   { path: "/", component: Signin },
   { path: "/home", component: Home },
   { path: "/project-dashboard/:projectId", component: ProjectDashboard },
   { path: "*", component: NotFound },
];

export const TEAM_LOGINS_SEPERATOR = "-;;-";
