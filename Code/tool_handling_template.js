export function generateCallToolHandler(): string {
    return `
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
    const { name: toolName, arguments: toolArgs } = request.params;
    const toolDefinition = toolDefinitionMap.get(toolName);
    if (!toolDefinition) {
      console.error(\`Error: Unknown tool requested: \${toolName}\`);
      return { content: [{ type: "text", text: \`Error: Unknown tool requested: \${toolName}\` }] };
    }
    return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
  });
  `;
  }