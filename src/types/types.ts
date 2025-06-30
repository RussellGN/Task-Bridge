import { Project, AppPreferences } from "./interfaces";

export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type SettingsTabElementProps = { appPreferences?: AppPreferences; project?: Project };
