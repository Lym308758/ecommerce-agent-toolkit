import { z } from "zod";
import { SourcingClient } from "./client.js";

const client = new SourcingClient();

export type ToolDef = {
  name: string; safety: "L1" | "L2" | "L3" | "L4"; description: string;
  jsonSchema: Record<string, unknown>; schema: z.ZodObject<any>;
  handler: (args: any) => Promise<unknown>;
};

export const tools: ToolDef[] = [
  {
    name: "search_supply_items",
    safety: "L1",
    description: "按关键词搜索货源商品",
    jsonSchema: {
      type: "object",
      properties: {
      keyword: { type: "string", description: "搜索词" },
      priceMin: { type: "number", description: "最低价" },
      priceMax: { type: "number", description: "最高价" }
      },
      required: ["keyword"],
    },
    schema: z.object({
      keyword: z.string().describe("搜索词"),
      priceMin: z.number().optional().describe("最低价"),
      priceMax: z.number().optional().describe("最高价")
    }),
    handler: async (args: any) => client.searchSupplyItems(args),
  },
  {
    name: "compare_item_prices",
    safety: "L1",
    description: "对同一关键词的多个货源做比价排序",
    jsonSchema: {
      type: "object",
      properties: {
      keyword: { type: "string", description: "搜索词" },
      limit: { type: "number", description: "返回条数，默认 20" }
      },
      required: ["keyword"],
    },
    schema: z.object({
      keyword: z.string().describe("搜索词"),
      limit: z.number().optional().describe("返回条数，默认 20")
    }),
    handler: async (args: any) => client.compareItemPrices(args),
  },
  {
    name: "get_supplier_profile",
    safety: "L1",
    description: "查询供应商画像：评分、复购率、所在地",
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
    handler: async (args: any) => client.getSupplierProfile(args),
  },
  {
    name: "watch_price",
    safety: "L1",
    description: "登记价格监控（返回当前价与历史区间）",
    jsonSchema: {
      type: "object",
      properties: {
      itemId: { type: "string", description: "货源商品 ID" },
      days: { type: "number", description: "回看天数，默认 30" }
      },
      required: ["itemId"],
    },
    schema: z.object({
      itemId: z.string().describe("货源商品 ID"),
      days: z.number().optional().describe("回看天数，默认 30")
    }),
    handler: async (args: any) => client.watchPrice(args),
  },
];
