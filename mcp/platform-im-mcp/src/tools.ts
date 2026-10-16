import { z } from "zod";
import { PlatformImClient } from "./client.js";

const client = new PlatformImClient();

export type ToolDef = {
  name: string; safety: "L1" | "L2" | "L3" | "L4"; description: string;
  jsonSchema: Record<string, unknown>; schema: z.ZodObject<any>;
  handler: (args: any) => Promise<unknown>;
};

export const tools: ToolDef[] = [
  {
    name: "list_sessions",
    safety: "L1",
    description: "查询会话列表（可按时段/未读过滤）",
    jsonSchema: {
      type: "object",
      properties: {
      since: { type: "string", description: "起始时间" },
      unreadOnly: { type: "boolean", description: "仅未读" }
      },
      required: [],
    },
    schema: z.object({
      since: z.string().optional().describe("起始时间"),
      unreadOnly: z.boolean().optional().describe("仅未读")
    }),
    handler: async (args: any) => client.listSessions(args),
  },
  {
    name: "get_session_messages",
    safety: "L1",
    description: "拉取指定会话的历史消息",
    jsonSchema: {
      type: "object",
      properties: {
      sessionId: { type: "string", description: "会话 ID" },
      limit: { type: "number", description: "条数，默认 50" }
      },
      required: ["sessionId"],
    },
    schema: z.object({
      sessionId: z.string().describe("会话 ID"),
      limit: z.number().optional().describe("条数，默认 50")
    }),
    handler: async (args: any) => client.getSessionMessages(args),
  },
  {
    name: "draft_reply",
    safety: "L1",
    description: "生成回复草稿（不发送，返回文本与依据引用）",
    jsonSchema: {
      type: "object",
      properties: {
      sessionId: { type: "string", description: "会话 ID" },
      intent: { type: "string", description: "回答意图或要点" }
      },
      required: ["sessionId", "intent"],
    },
    schema: z.object({
      sessionId: z.string().describe("会话 ID"),
      intent: z.string().describe("回答意图或要点")
    }),
    handler: async (args: any) => client.draftReply(args),
  },
  {
    name: "send_message",
    safety: "L4",
    description: "发送消息给买家（需 __approved=true，不可撤回）",
    jsonSchema: {
      type: "object",
      properties: {
      sessionId: { type: "string", description: "会话 ID" },
      text: { type: "string", description: "消息正文" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["sessionId", "text", "idempotencyKey"],
    },
    schema: z.object({
      sessionId: z.string().describe("会话 ID"),
      text: z.string().describe("消息正文"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.sendMessage(args),
  },
];
