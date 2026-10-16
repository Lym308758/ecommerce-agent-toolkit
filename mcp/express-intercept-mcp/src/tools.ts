import { z } from "zod";
import { InterceptClient } from "./client.js";

const client = new InterceptClient();

export type ToolDef = {
  name: string; safety: "L1" | "L2" | "L3" | "L4"; description: string;
  jsonSchema: Record<string, unknown>; schema: z.ZodObject<any>;
  handler: (args: any) => Promise<unknown>;
};

export const tools: ToolDef[] = [
  {
    name: "request_intercept",
    safety: "L3",
    description: "发起在途拦截退回（不可逆，需人工批准）",
    jsonSchema: {
      type: "object",
      properties: {
      waybillNo: { type: "string", description: "运单号" },
      reason: { type: "string", description: "拦截原因" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["waybillNo", "reason", "idempotencyKey"],
    },
    schema: z.object({
      waybillNo: z.string().describe("运单号"),
      reason: z.string().describe("拦截原因"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.requestIntercept(args),
  },
  {
    name: "get_intercept_status",
    safety: "L1",
    description: "查询拦截单状态",
    jsonSchema: {
      type: "object",
      properties: {
      interceptNo: { type: "string", description: "拦截单号" }
      },
      required: ["interceptNo"],
    },
    schema: z.object({
      interceptNo: z.string().describe("拦截单号")
    }),
    handler: async (args: any) => client.getInterceptStatus(args),
  },
  {
    name: "cancel_intercept",
    safety: "L3",
    description: "撤销拦截（包裹未退回前可撤销）",
    jsonSchema: {
      type: "object",
      properties: {
      interceptNo: { type: "string", description: "拦截单号" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["interceptNo", "idempotencyKey"],
    },
    schema: z.object({
      interceptNo: z.string().describe("拦截单号"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.cancelIntercept(args),
  },
];
