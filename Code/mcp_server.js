export const SERVER_NAME = "system-info-webhooks";
export const SERVER_VERSION = "1.0.0";
export const API_BASE_URL = "http://localhost:5678/webhook";

const server = new Server({ name: SERVER_NAME, version: SERVER_VERSION }, { capabilities: { tools: {} } });
const toolDefinitionMap = new Map([
    ["getsystemresources", {
            name: "getsystemresources",
            description: `Retrieves detailed information about system resources including OS, kernel, CPU, memory, GPU, uptime, and hostname.`,
            inputSchema: { "type": "object", "properties": {} },
            method: "get",
            pathTemplate: "/54af5be9-dada-41ae-b82d-c4147f98a134",
            executionParameters: [],
            requestBodyContentType: undefined,
            securityRequirements: []
        }]
]);

const securitySchemes = {};
server.setRequestHandler(ListToolsRequestSchema, async () => {
    const toolsForClient = Array.from(toolDefinitionMap.values()).map(def => ({
        name: def.name,
        description: def.description,
        inputSchema: def.inputSchema
    }));
    return { tools: toolsForClient };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name: toolName, arguments: toolArgs } = request.params;
    const toolDefinition = toolDefinitionMap.get(toolName);
    if (!toolDefinition) {
        console.error(`Error: Unknown tool requested: ${toolName}`);
        return { content: [{ type: "text", text: `Error: Unknown tool requested: ${toolName}` }] };
    }
    return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
});

async function executeApiTool(toolName, definition, toolArgs, allSecuritySchemes) {
    let urlPath = definition.pathTemplate;
    const queryParams = {};
    const headers = { 'Accept': 'application/json' };
    let requestBodyData = undefined;
    const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;
    if (definition.requestBodyContentType && typeof validatedArgs['requestBody'] !== 'undefined') {
        requestBodyData = validatedArgs['requestBody'];
        headers['content-type'] = definition.requestBodyContentType;
    }
    // Prepare the axios request configuration
    const config = {
        method: definition.method.toUpperCase(),
        url: requestUrl,
        params: queryParams,
        headers: headers,
        ...(requestBodyData !== undefined && { data: requestBodyData }),
    };
    console.error(`Executing tool "${toolName}": ${config.method} ${config.url}`);
    const response = await axios(config);
    let responseText = response.data;
    const contentType = response.headers['content-type']?.toLowerCase() || '';
    
    return {
        content: [
            {
                type: "text",
                text: `API Response (Status: ${response.status}):\n${responseText}`
            }
        ],
    };
}
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`${SERVER_NAME} MCP Server (v${SERVER_VERSION}) running on stdio${API_BASE_URL ? `, proxying API at ${API_BASE_URL}` : ''}`);
}