import { Project, Settings } from "./interfaces";

export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type SettingsTabElementProps = { settings?: Settings; project?: Project };
