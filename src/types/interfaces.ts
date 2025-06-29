import { LucideIcon } from "lucide-react";
import Repository from "./Repository";
import { SettingsTabElementProps, TaskPriority } from "./types";
import { FC } from "react";

export interface User {
   login: string;
   avatar_url: string;
   email: string | undefined;
   url?: string | undefined;
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
   repo_name: string;
   team: string;
}

export interface Project {
   id: string;
   name: string;
   locally_created: boolean;
   creation_timestamp: number;
   team: Author[];
   pending_invites: Author[];
   repo: Repository;
   repo_id: string;
   tasks: Task[] | null;
   draft_tasks: DraftTask[] | null;
}

export interface Issue {
   id: number;
   node_id: string;
   url: string;
   repository_url: string;
   labels_url: string;
   comments_url: string;
   events_url: string;
   html_url: string;
   number: number;
   state: "open" | "closed";
   state_reason: string | undefined;
   title: string;
   body: string | undefined;
   body_text: string | undefined;
   body_html: string | undefined;
   user: Author;
   labels: string[];
   assignee: Author | undefined;
   assignees: Author[];
   author_association: string;
   milestone: string | undefined;
   locked: boolean;
   active_lock_reason: string | undefined;
   comments: number;
   pull_request: string | undefined;
   closed_at: string;
   closed_by: Author | undefined;
   created_at: string;
   updated_at: string;
}

export interface Commit {
   sha: string;
   url: string;
   node_id: string;
   html_url: string;
   comments_url: string;
   author?: Author | null;
   committer?: Author | null;
   parents: unknown;
   stats?: unknown;
   files?: unknown;
   commit: {
      message: string;
      comment_count: number;
      url: string;
      author: {
         name: string;
         email: string;
         date?: string | null;
      };
      committer: {
         name: string;
         email: string;
         date?: string | null;
      };
      tree: {
         sha: string;
         url: string;
      };
      verification?: {
         verified: boolean;
         reason: string;
         signature: string | null;
         payload: string | null;
         verified_at?: string | null;
      } | null;
   };
}

export interface Task {
   priority: TaskPriority;
   inner_issue: Issue;
   is_backlog?: boolean | null;
   is_under_review?: boolean | null;
   commits?: Commit[] | null;
}

export interface DraftTask {
   id: string;
   title: string;
   body: string | null;
   assignee: Author | null;
   priority: TaskPriority | null;
}

export interface NewTaskPayload {
   title: string;
   body: string | null;
   assignee_login: string;
   priority: TaskPriority;
   project_id: string;
}

export interface NewDraftTaskPayload {
   title: string;
   body: string | null;
   assignee_login: string | null;
   priority: TaskPriority | null;
   project_id: string;
}

export interface DraftTaskAssignmentResponse {
   task: Task;
   old_draft_id: string;
}

export interface ActivitySyncResponse {
   commits: Commit[];
   task_id: string;
}

export interface Setting {
   title: string;
   description: string;
   children: React.ReactNode;
}

export interface Settings {
   project_sync_interval?: number;
}

export interface SettingsTab {
   value: string;
   label: string;
   Icon: LucideIcon;
   component: FC<SettingsTabElementProps>;
}
