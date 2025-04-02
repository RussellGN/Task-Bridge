import Signin from "@/routes/Signin";
import { random_global_auth_keyword } from "./utils";
import Home from "@/routes/Home";
import NotFound from "@/routes/NotFound";

export const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}&prompt=select_account&state=${random_global_auth_keyword()}&redirect_uri=${import.meta.env.VITE_PROCEED_TO_AUTH_URI}`;

export const STORE_PATH = "store.json";

export const ROUTES = [
   { path: "/", component: Signin },
   { path: "/home", component: Home },
   { path: "*", component: NotFound },
];
