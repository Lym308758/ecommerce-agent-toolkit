export type ToolResult = {
  ok: boolean; data?: unknown; mock?: boolean; warnings?: string[]; error?: string;
};

export class PlatformImClient {
  private base = process.env.IM_API_BASE ?? "";
  private dryRun = process.env.DRY_RUN === "1" || !this.base;

  /** 查询会话列表（可按时段/未读过滤）（L1） */
  async listSessions(args: { since: any, unreadOnly: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"since": "<since>", "unreadOnly": "<unreadOnly>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/list-sessions`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.IM_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$list_sessions 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 listSessions，或设置 DRY_RUN=1");
  }

  /** 拉取指定会话的历史消息（L1） */
  async getSessionMessages(args: { sessionId: any, limit: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"sessionId": "<sessionId>", "limit": 0},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/get-session-messages`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.IM_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$get_session_messages 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 getSessionMessages，或设置 DRY_RUN=1");
  }

  /** 生成回复草稿（不发送，返回文本与依据引用）（L1） */
  async draftReply(args: { sessionId: any, intent: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"sessionId": "<sessionId>", "intent": "<intent>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/draft-reply`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.IM_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$draft_reply 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 draftReply，或设置 DRY_RUN=1");
  }

  /** 发送消息给买家（需 __approved=true，不可撤回）（L4） */
  async sendMessage(args: { sessionId: any, text: any, idempotencyKey: any }): Promise<ToolResult> {
    if (this.dryRun) {
      return {
        ok: true,
        mock: true,
        data: {"sessionId": "<sessionId>", "text": "<text>", "idempotencyKey": "<idempotencyKey>"},
        warnings: ["DRY_RUN 模式：返回预演数据，未产生真实副作用"],
      };
    }
    // TODO(real-api): 实现真实请求，参考 ——
    //   const res = await fetch(`${this.base}/send-message`, {
    //     method: "POST", headers: { "content-type": "application/json",
    //       authorization: `Bearer ${process.env.IM_API_BASE_TOKEN}` },
    //     body: JSON.stringify(args),
    //   });
    //   if (!res.ok) throw new Error(`$send_message 调用失败: ${res.status}`);
    //   return { ok: true, data: await res.json() };
    throw new Error("未接入真实接口，请在 src/client.ts 中实现 sendMessage，或设置 DRY_RUN=1");
  }
}
