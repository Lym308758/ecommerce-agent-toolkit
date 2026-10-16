export type ToolResult = {
  ok: boolean; data?: unknown; mock?: boolean; warnings?: string[]; error?: string;
};

export class InterceptClient {
  private base = process.env.EXPRESS_API_BASE ?? "";
  private dryRun = process.env.DRY_RUN === "1" || !this.base;

  /** 发起在途拦截退回（不可逆，需人工批准）（L3） */
  async requestIntercept(args: { waybillNo: any, reason: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"waybillNo": "<waybillNo>", "reason": "<reason>", "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/request-intercept`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.EXPRESS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$request_intercept 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 requestIntercept，或设置 DRY_RUN=1");
  }

  /** 查询拦截单状态（L1） */
  async getInterceptStatus(args: { interceptNo: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"interceptNo": "<interceptNo>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/get-intercept-status`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.EXPRESS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$get_intercept_status 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 getInterceptStatus，或设置 DRY_RUN=1");
  }

  /** 撤销拦截（包裹未退回前可撤销）（L3） */
  async cancelIntercept(args: { interceptNo: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"interceptNo": "<interceptNo>", "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/cancel-intercept`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.EXPRESS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$cancel_intercept 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 cancelIntercept，或设置 DRY_RUN=1");
  }
}
