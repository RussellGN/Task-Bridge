export interface UserInterface {
   login: string;
   avatar_url: string;
   email: string | undefined;
}

export interface AuthorInterface {
   login: string;
   id: string;
   node_id: string;
   avatar_url: string;
   gravatar_id: string;
   url: string;
   html_url: string;
   followers_url: string;
   following_url: string;
   gists_url: string;
   starred_url: string;
   subscriptions_url: string;
   organizations_url: string;
   repos_url: string;
   events_url: string;
   received_events_url: string;
   type: string;
   site_admin: boolean;
   patch_url: string | undefined;
   email?: string | undefined;
}

// [
//    "avatar_url",
//    "events_url",
//    "followers_url",
//    "following_url",
//    "gists_url",
//    "gravatar_id",
//    "html_url",
//    "id",
//    "node_id",
//    "login",
//    "organizations_url",
//    "received_events_url",
//    "repos_url",
//    "site_admin",
//    "starred_url",
//    "subscriptions_url",
//    "type",
//    "url",
//    "bio",
//    "blog",
//    "company",
//    "email",
//    "followers",
//    "following",
//    "hireable",
//    "location",
//    "name",
//    "public_gists",
//    "public_repos",
//    "created_at",
//    "updated_at",
//    "collaborators",
//    "disk_usage",
//    "owned_private_repos",
//    "private_gists",
//    "total_private_repos",
//    "two_factor_authentication",
// ];
