import { z } from "zod";
import { ErpScmClient } from "./client.js";

const client = new ErpScmClient();

export type ToolDef = {
  name: string; safety: "L1" | "L2" | "L3" | "L4"; description: string;
  jsonSchema: Record<string, unknown>; schema: z.ZodObject<any>;
  handler: (args: any) => Promise<unknown>;
};

export const tools: ToolDef[] = [
  {
    name: "list_suppliers",
    safety: "L1",
    description: "查询供应商档案列表",
    jsonSchema: {
      type: "object",
      properties: {
      keyword: { type: "string", description: "名称或编码关键词" },
      page: { type: "number", description: "页码，默认 1" }
      },
      required: [],
    },
    schema: z.object({
      keyword: z.string().optional().describe("名称或编码关键词"),
      page: z.number().optional().describe("页码，默认 1")
    }),
    handler: async (args: any) => client.listSuppliers(args),
  },
  {
    name: "get_supplier",
    safety: "L1",
    description: "查询单个供应商详情与评分",
    jsonSchema: {
      type: "object",
      properties: {
      supplierId: { type: "string", description: "供应商 ID" }
      },
      required: ["supplierId"],
    },
    schema: z.object({
      supplierId: z.string().describe("供应商 ID")
    }),
    handler: async (args: any) => client.getSupplier(args),
  },
  {
    name: "list_purchase_orders",
    safety: "L1",
    description: "查询采购单列表（可按状态/供应商过滤）",
    jsonSchema: {
      type: "object",
      properties: {
      status: { type: "string", description: "draft|approved|shipping|received" },
      supplierId: { type: "string", description: "供应商 ID" }
      },
      required: [],
    },
    schema: z.object({
      status: z.string().optional().describe("draft|approved|shipping|received"),
      supplierId: z.string().optional().describe("供应商 ID")
    }),
    handler: async (args: any) => client.listPurchaseOrders(args),
  },
  {
    name: "get_purchase_order",
    safety: "L1",
    description: "查询采购单详情与行项目",
    jsonSchema: {
      type: "object",
      properties: {
      orderId: { type: "string", description: "采购单号" }
      },
      required: ["orderId"],
    },
    schema: z.object({
      orderId: z.string().describe("采购单号")
    }),
    handler: async (args: any) => client.getPurchaseOrder(args),
  },
  {
    name: "create_purchase_order",
    safety: "L2",
    description: "创建采购单（可逆，未审核前可作废）",
    jsonSchema: {
      type: "object",
      properties: {
      supplierId: { type: "string", description: "供应商 ID" },
      items: { type: "array", description: "[{sku,quantity,price}]" },
      warehouseCode: { type: "string", description: "收货仓库编码" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["supplierId", "items", "warehouseCode", "idempotencyKey"],
    },
    schema: z.object({
      supplierId: z.string().describe("供应商 ID"),
      items: z.array(z.any()).describe("[{sku,quantity,price}]"),
      warehouseCode: z.string().describe("收货仓库编码"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.createPurchaseOrder(args),
  },
  {
    name: "receive_purchase_order",
    safety: "L2",
    description: "采购到货入库确认（可逆：可红冲）",
    jsonSchema: {
      type: "object",
      properties: {
      orderId: { type: "string", description: "采购单号" },
      quantityBySku: { type: "object", description: "{sku: 实收数量}" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["orderId", "quantityBySku", "idempotencyKey"],
    },
    schema: z.object({
      orderId: z.string().describe("采购单号"),
      quantityBySku: z.record(z.any()).describe("{sku: 实收数量}"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.receivePurchaseOrder(args),
  },
];
