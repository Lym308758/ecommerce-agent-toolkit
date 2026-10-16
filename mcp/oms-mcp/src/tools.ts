import { z } from "zod";
import { OmsClient } from "./client.js";

const client = new OmsClient();

export type ToolDef = {
  name: string; safety: "L1" | "L2" | "L3" | "L4"; description: string;
  jsonSchema: Record<string, unknown>; schema: z.ZodObject<any>;
  handler: (args: any) => Promise<unknown>;
};

export const tools: ToolDef[] = [
  {
    name: "list_orders",
    safety: "L1",
    description: "查询订单列表（平台/状态/时间范围）",
    jsonSchema: {
      type: "object",
      properties: {
      platform: { type: "string", description: "douyin|taobao|jd|pdd" },
      status: { type: "string", description: "订单状态" },
      since: { type: "string", description: "起始时间 ISO8601" }
      },
      required: [],
    },
    schema: z.object({
      platform: z.string().optional().describe("douyin|taobao|jd|pdd"),
      status: z.string().optional().describe("订单状态"),
      since: z.string().optional().describe("起始时间 ISO8601")
    }),
    handler: async (args: any) => client.listOrders(args),
  },
  {
    name: "get_order",
    safety: "L1",
    description: "查询订单详情、买家留言与履约进度",
    jsonSchema: {
      type: "object",
      properties: {
      orderId: { type: "string", description: "订单号" }
      },
      required: ["orderId"],
    },
    schema: z.object({
      orderId: z.string().describe("订单号")
    }),
    handler: async (args: any) => client.getOrder(args),
  },
  {
    name: "split_order",
    safety: "L2",
    description: "拆分订单（可逆：可合并回去）",
    jsonSchema: {
      type: "object",
      properties: {
      orderId: { type: "string", description: "订单号" },
      splitBy: { type: "string", description: "sku|warehouse" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["orderId", "splitBy", "idempotencyKey"],
    },
    schema: z.object({
      orderId: z.string().describe("订单号"),
      splitBy: z.string().describe("sku|warehouse"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.splitOrder(args),
  },
  {
    name: "merge_orders",
    safety: "L2",
    description: "合并订单（同一买家同地址，可逆）",
    jsonSchema: {
      type: "object",
      properties: {
      orderIds: { type: "array", description: "订单号数组" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["orderIds", "idempotencyKey"],
    },
    schema: z.object({
      orderIds: z.array(z.any()).describe("订单号数组"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.mergeOrders(args),
  },
  {
    name: "review_order",
    safety: "L3",
    description: "审单通过并下发仓库（不可逆，需人工批准）",
    jsonSchema: {
      type: "object",
      properties: {
      orderId: { type: "string", description: "订单号" },
      approved: { type: "boolean", description: "是否批准" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["orderId", "approved", "idempotencyKey"],
    },
    schema: z.object({
      orderId: z.string().describe("订单号"),
      approved: z.boolean().describe("是否批准"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.reviewOrder(args),
  },
  {
    name: "update_order_status",
    safety: "L2",
    description: "更新订单状态（可逆的状态流转）",
    jsonSchema: {
      type: "object",
      properties: {
      orderId: { type: "string", description: "订单号" },
      status: { type: "string", description: "目标状态" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["orderId", "status", "idempotencyKey"],
    },
    schema: z.object({
      orderId: z.string().describe("订单号"),
      status: z.string().describe("目标状态"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.updateOrderStatus(args),
  },
];
