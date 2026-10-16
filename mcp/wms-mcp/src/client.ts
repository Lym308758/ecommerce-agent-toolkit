export type ToolResult = {
  ok: boolean; data?: unknown; mock?: boolean; warnings?: string[]; error?: string;
};

export class WmsClient {
  private base = process.env.WMS_API_BASE ?? "";
  private dryRun = process.env.DRY_RUN === "1" || !this.base;

  /** 查询 SKU 可用/在途/锁定库存（事实源）（L1） */
  async getStock(args: { sku: any, warehouseCode: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"sku": "<sku>", "warehouseCode": "<warehouseCode>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/get-stock`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.WMS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$get_stock 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 getStock，或设置 DRY_RUN=1");
  }

  /** 查询仓库列表与启用状态（L1） */
  async listWarehouses(args: Record<string, never>): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/list-warehouses`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.WMS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$list_warehouses 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 listWarehouses，或设置 DRY_RUN=1");
  }

  /** 创建销售出库单（可逆：未拣货可取消）（L2） */
  async createOutboundOrder(args: { orderId: any, items: any, warehouseCode: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"orderId": "<orderId>", "items": [], "warehouseCode": "<warehouseCode>", "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/create-outbound-order`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.WMS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$create_outbound_order 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 createOutboundOrder，或设置 DRY_RUN=1");
  }

  /** 创建入库单（采购/退货入库）（L2） */
  async createInboundOrder(args: { sourceType: any, items: any, warehouseCode: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"sourceType": "<sourceType>", "items": [], "warehouseCode": "<warehouseCode>", "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/create-inbound-order`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.WMS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$create_inbound_order 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 createInboundOrder，或设置 DRY_RUN=1");
  }

  /** 库存调整（盘盈盘亏，需原因码）（L2） */
  async adjustStock(args: { sku: any, delta: any, reasonCode: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"sku": "<sku>", "delta": 0, "reasonCode": "<reasonCode>", "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/adjust-stock`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.WMS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$adjust_stock 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 adjustStock，或设置 DRY_RUN=1");
  }

  /** 创建盘点任务（L2） */
  async createStocktake(args: { warehouseCode: any, skuList: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"warehouseCode": "<warehouseCode>", "skuList": [], "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/create-stocktake`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.WMS_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$create_stocktake 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 createStocktake，或设置 DRY_RUN=1");
  }
}
