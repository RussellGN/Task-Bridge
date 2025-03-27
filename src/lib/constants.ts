import { random_global_auth_keyword } from "./utils";

export const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}&prompt=select_account&state=${random_global_auth_keyword()}`;
