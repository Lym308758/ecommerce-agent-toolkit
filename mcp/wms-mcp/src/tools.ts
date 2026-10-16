import { z } from "zod";
import { WmsClient } from "./client.js";

const client = new WmsClient();

export type ToolDef = {
  name: string; safety: "L1" | "L2" | "L3" | "L4"; description: string;
  jsonSchema: Record<string, unknown>; schema: z.ZodObject<any>;
  handler: (args: any) => Promise<unknown>;
};

export const tools: ToolDef[] = [
  {
    name: "get_stock",
    safety: "L1",
    description: "查询 SKU 可用/在途/锁定库存（事实源）",
    jsonSchema: {
      type: "object",
      properties: {
      sku: { type: "string", description: "商品编码" },
      warehouseCode: { type: "string", description: "仓库编码" }
      },
      required: ["sku"],
    },
    schema: z.object({
      sku: z.string().describe("商品编码"),
      warehouseCode: z.string().optional().describe("仓库编码")
    }),
    handler: async (args: any) => client.getStock(args),
  },
  {
    name: "list_warehouses",
    safety: "L1",
    description: "查询仓库列表与启用状态",
    jsonSchema: {
      type: "object",
      properties: {
      
      },
      required: [],
    },
    schema: z.object({
      
    }),
    handler: async (args: any) => client.listWarehouses(args),
  },
  {
    name: "create_outbound_order",
    safety: "L2",
    description: "创建销售出库单（可逆：未拣货可取消）",
    jsonSchema: {
      type: "object",
      properties: {
      orderId: { type: "string", description: "订单号" },
      items: { type: "array", description: "[{sku,quantity}]" },
      warehouseCode: { type: "string", description: "仓库编码" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["orderId", "items", "warehouseCode", "idempotencyKey"],
    },
    schema: z.object({
      orderId: z.string().describe("订单号"),
      items: z.array(z.any()).describe("[{sku,quantity}]"),
      warehouseCode: z.string().describe("仓库编码"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.createOutboundOrder(args),
  },
  {
    name: "create_inbound_order",
    safety: "L2",
    description: "创建入库单（采购/退货入库）",
    jsonSchema: {
      type: "object",
      properties: {
      sourceType: { type: "string", description: "purchase|return" },
      items: { type: "array", description: "[{sku,quantity}]" },
      warehouseCode: { type: "string", description: "仓库编码" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["sourceType", "items", "warehouseCode", "idempotencyKey"],
    },
    schema: z.object({
      sourceType: z.string().describe("purchase|return"),
      items: z.array(z.any()).describe("[{sku,quantity}]"),
      warehouseCode: z.string().describe("仓库编码"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.createInboundOrder(args),
  },
  {
    name: "adjust_stock",
    safety: "L2",
    description: "库存调整（盘盈盘亏，需原因码）",
    jsonSchema: {
      type: "object",
      properties: {
      sku: { type: "string", description: "商品编码" },
      delta: { type: "number", description: "调整量，可为负" },
      reasonCode: { type: "string", description: "原因码" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["sku", "delta", "reasonCode", "idempotencyKey"],
    },
    schema: z.object({
      sku: z.string().describe("商品编码"),
      delta: z.number().describe("调整量，可为负"),
      reasonCode: z.string().describe("原因码"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.adjustStock(args),
  },
  {
    name: "create_stocktake",
    safety: "L2",
    description: "创建盘点任务",
    jsonSchema: {
      type: "object",
      properties: {
      warehouseCode: { type: "string", description: "仓库编码" },
      skuList: { type: "array", description: "SKU 列表，空表示全仓" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["warehouseCode", "idempotencyKey"],
    },
    schema: z.object({
      warehouseCode: z.string().describe("仓库编码"),
      skuList: z.array(z.any()).optional().describe("SKU 列表，空表示全仓"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.createStocktake(args),
  },
];
