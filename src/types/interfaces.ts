import Repository from "./Repository";

export interface User {
   login: string;
   avatar_url: string;
   email: string | undefined;
}

export interface Author {
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

export interface NewProjectPayload {
   name: string;
   repoName: string;
   team: string;
}

export interface Project {
   id: string;
   name: string;
   locallyCreated: boolean;
   creationTimestamp: number;
   team: Author[];
   pendingInvites: Author[];
   repo: Repository;
   repoId: string;
}
