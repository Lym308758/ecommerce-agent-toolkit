import { z } from "zod";
import { ExpressClient } from "./client.js";

const client = new ExpressClient();

export type ToolDef = {
  name: string; safety: "L1" | "L2" | "L3" | "L4"; description: string;
  jsonSchema: Record<string, unknown>; schema: z.ZodObject<any>;
  handler: (args: any) => Promise<unknown>;
};

export const tools: ToolDef[] = [
  {
    name: "create_waybill",
    safety: "L2",
    description: "下单取号获取电子面单（未揽收前可取消）",
    jsonSchema: {
      type: "object",
      properties: {
      orderId: { type: "string", description: "订单号" },
      carrier: { type: "string", description: "快递公司编码" },
      receiver: { type: "object", description: "{name,phone,address}" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["orderId", "carrier", "receiver", "idempotencyKey"],
    },
    schema: z.object({
      orderId: z.string().describe("订单号"),
      carrier: z.string().describe("快递公司编码"),
      receiver: z.record(z.any()).describe("{name,phone,address}"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.createWaybill(args),
  },
  {
    name: "get_tracking",
    safety: "L1",
    description: "查询物流全链路轨迹",
    jsonSchema: {
      type: "object",
      properties: {
      waybillNo: { type: "string", description: "运单号" }
      },
      required: ["waybillNo"],
    },
    schema: z.object({
      waybillNo: z.string().describe("运单号")
    }),
    handler: async (args: any) => client.getTracking(args),
  },
  {
    name: "list_carriers",
    safety: "L1",
    description: "查询可用快递公司与编码",
    jsonSchema: {
      type: "object",
      properties: {
      
      },
      required: [],
    },
    schema: z.object({
      
    }),
    handler: async (args: any) => client.listCarriers(args),
  },
  {
    name: "cancel_waybill",
    safety: "L2",
    description: "取消电子面单（未揽收）",
    jsonSchema: {
      type: "object",
      properties: {
      waybillNo: { type: "string", description: "运单号" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["waybillNo", "idempotencyKey"],
    },
    schema: z.object({
      waybillNo: z.string().describe("运单号"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.cancelWaybill(args),
  },
];
