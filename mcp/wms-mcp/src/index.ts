#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { tools } from "./tools.js";

const server = new Server(
  { name: "wms-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.name,
    description: `[${t.safety}] ${t.description}`,
    inputSchema: t.jsonSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: rawArgs } = req.params;
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return { isError: true, content: [{ type: "text", text: `未知工具：${name}` }] };
  }
  const args = (rawArgs ?? {}) as Record<string, unknown>;

  // L3/L4 必须人工批准：未批准时只返回预演，不产生副作用
  if ((tool.safety === "L3" || tool.safety === "L4") && args.__approved !== true) {
    const label = tool.safety === "L3" ? "不可逆写" : "客户外发";
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          ok: false, requiresApproval: true, safety: tool.safety,
          message: `该操作为${label}，需人工批准后在参数中传入 __approved=true 并附 idempotencyKey`,
          preview: args,
        }, null, 2),
      }],
    };
  }
  // 写操作必须带幂等键
  if (tool.safety !== "L1" && !args.idempotencyKey) {
    return { isError: true, content: [{ type: "text", text: "缺少 idempotencyKey（写操作必须幂等）" }] };
  }

  try {
    const parsed = tool.schema.parse(args);
    const result = await tool.handler(parsed);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { isError: true, content: [{ type: "text", text: `执行失败：${(err as Error).message}` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
