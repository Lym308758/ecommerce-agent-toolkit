import { z } from "zod";
import { FinanceClient } from "./client.js";

const client = new FinanceClient();

export type ToolDef = {
  name: string; safety: "L1" | "L2" | "L3" | "L4"; description: string;
  jsonSchema: Record<string, unknown>; schema: z.ZodObject<any>;
  handler: (args: any) => Promise<unknown>;
};

export const tools: ToolDef[] = [
  {
    name: "push_voucher",
    safety: "L2",
    description: "推送凭证（可红冲，需差异来源单号）",
    jsonSchema: {
      type: "object",
      properties: {
      voucherType: { type: "string", description: "凭证类型" },
      entries: { type: "array", description: "[{account, debit, credit, memo}]" },
      sourceRef: { type: "string", description: "差异来源单号" },
      idempotencyKey: { type: "string", description: "幂等键" }
      },
      required: ["voucherType", "entries", "sourceRef", "idempotencyKey"],
    },
    schema: z.object({
      voucherType: z.string().describe("凭证类型"),
      entries: z.array(z.any()).describe("[{account, debit, credit, memo}]"),
      sourceRef: z.string().describe("差异来源单号"),
      idempotencyKey: z.string().describe("幂等键")
    }),
    handler: async (args: any) => client.pushVoucher(args),
  },
  {
    name: "get_voucher_status",
    safety: "L1",
    description: "查询凭证状态与红冲情况",
    jsonSchema: {
      type: "object",
      properties: {
      voucherNo: { type: "string", description: "凭证号" }
      },
      required: ["voucherNo"],
    },
    schema: z.object({
      voucherNo: z.string().describe("凭证号")
    }),
    handler: async (args: any) => client.getVoucherStatus(args),
  },
  {
    name: "list_accounts",
    safety: "L1",
    description: "查询科目列表",
    jsonSchema: {
      type: "object",
      properties: {
      keyword: { type: "string", description: "科目关键词" }
      },
      required: [],
    },
    schema: z.object({
      keyword: z.string().optional().describe("科目关键词")
    }),
    handler: async (args: any) => client.listAccounts(args),
  },
];
