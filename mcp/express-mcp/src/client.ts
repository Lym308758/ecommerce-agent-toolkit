export type ToolResult = {
  ok: boolean; data?: unknown; mock?: boolean; warnings?: string[]; error?: string;
};

export class ExpressClient {
  private base = process.env.EXPRESS_API_BASE ?? "";
  private dryRun = process.env.DRY_RUN === "1" || !this.base;

  /** 下单取号获取电子面单（未揽收前可取消）（L2） */
  async createWaybill(args: { orderId: any, carrier: any, receiver: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"orderId": "<orderId>", "carrier": "<carrier>", "receiver": {}, "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/create-waybill`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.EXPRESS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$create_waybill 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 createWaybill，或设置 DRY_RUN=1");
  }

  /** 查询物流全链路轨迹（L1） */
  async getTracking(args: { waybillNo: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"waybillNo": "<waybillNo>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/get-tracking`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.EXPRESS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$get_tracking 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 getTracking，或设置 DRY_RUN=1");
  }

  /** 查询可用快递公司与编码（L1） */
  async listCarriers(args: Record<string, never>): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/list-carriers`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.EXPRESS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$list_carriers 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 listCarriers，或设置 DRY_RUN=1");
  }

  /** 取消电子面单（未揽收）（L2） */
  async cancelWaybill(args: { waybillNo: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"waybillNo": "<waybillNo>", "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/cancel-waybill`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.EXPRESS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$cancel_waybill 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 cancelWaybill，或设置 DRY_RUN=1");
  }
}
