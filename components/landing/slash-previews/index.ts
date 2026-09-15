import type { ComponentType } from "react";
import {
  type ChatResponseProps,
  FreeResponse,
  OverloadResponse,
  EffortResponse,
  LoadResponse,
  ReportResponse,
  OverdueResponse,
  InfoResponse,
  TaskResponse,
  ProjectResponse,
  TasksResponse,
  MembersResponse,
  HelpResponse,
} from "./chat-responses";

export const CHAT_RESPONSE_REGISTRY: Record<string, ComponentType<ChatResponseProps>> = {
  "/free": FreeResponse,
  "/overload": OverloadResponse,
  "/effort": EffortResponse,
  "/load": LoadResponse,
  "/report": ReportResponse,
  "/overdue": OverdueResponse,
  "/info": InfoResponse,
  "/task": TaskResponse,
  "/project": ProjectResponse,
  "/tasks": TasksResponse,
  "/members": MembersResponse,
  "/help": HelpResponse,
};

export * from "./chat-responses";
export * from "./form-bodies";
