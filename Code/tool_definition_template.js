export function generateToolDefinitionMap(
    tools: McpToolDefinition[],
    securitySchemes?: OpenAPIV3.ComponentsObject['securitySchemes']
  ): string {
    if (tools.length === 0) return '';
  
    return tools
      .map((tool) => {
        // Safely stringify complex objects
        let schemaString;
        try {
          schemaString = JSON.stringify(tool.inputSchema);
        } catch (e) {
          schemaString = '{}';
          console.warn(`Failed to stringify schema for tool ${tool.name}: ${e}`);
        }
  
        let execParamsString;
        try {
          execParamsString = JSON.stringify(tool.executionParameters);
        } catch (e) {
          execParamsString = '[]';
          console.warn(`Failed to stringify execution parameters for tool ${tool.name}: ${e}`);
        }
  
        let securityReqsString;
        try {
          securityReqsString = JSON.stringify(tool.securityRequirements);
        } catch (e) {
          securityReqsString = '[]';
          console.warn(`Failed to stringify security requirements for tool ${tool.name}: ${e}`);
        }
  
        // Sanitize description for template literal
        const escapedDescription = sanitizeForTemplate(tool.description);
  
        // Build the tool definition entry
        return `
    ["${tool.name}", {
      name: "${tool.name}",
      description: \`${escapedDescription}\`,
      inputSchema: ${schemaString},
      method: "${tool.method}",
      pathTemplate: "${tool.pathTemplate}",
      executionParameters: ${execParamsString},
      requestBodyContentType: ${tool.requestBodyContentType ? `"${tool.requestBodyContentType}"` : 'undefined'},
      securityRequirements: ${securityReqsString}
    }],`;
      })
      .join('');
  }
  