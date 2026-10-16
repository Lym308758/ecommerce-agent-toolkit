export type ToolResult = {
  ok: boolean; data?: unknown; mock?: boolean; warnings?: string[]; error?: string;
};

export class FinanceClient {
  private base = process.env.FINANCE_API_BASE ?? "";
  private dryRun = process.env.DRY_RUN === "1" || !this.base;

  /** 推送凭证（可红冲，需差异来源单号）（L2） */
  async pushVoucher(args: { voucherType: any, entries: any, sourceRef: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"voucherType": "<voucherType>", "entries": [], "sourceRef": "<sourceRef>", "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/push-voucher`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.FINANCE_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$push_voucher 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 pushVoucher，或设置 DRY_RUN=1");
  }

  /** 查询凭证状态与红冲情况（L1） */
  async getVoucherStatus(args: { voucherNo: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"voucherNo": "<voucherNo>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/get-voucher-status`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.FINANCE_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$get_voucher_status 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 getVoucherStatus，或设置 DRY_RUN=1");
  }

  /** 查询科目列表（L1） */
  async listAccounts(args: { keyword: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"keyword": "<keyword>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/list-accounts`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.FINANCE_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$list_accounts 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 listAccounts，或设置 DRY_RUN=1");
  }
}
