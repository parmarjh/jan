import {
  AssistantTool,
  executeOnMain,
  InferenceTool,
  MessageRequest,
} from '@janhq/core'

export class MCPTool extends InferenceTool {
  name: string = 'model-context-protocol'
  exaAPIKey: string = ''
  openaiAPIKey: string = ''
  toolUseEndpoint: string = ''
  model: string = ''

  async updateSettings(
    exaAPIKey: string,
    openaiAPIKey: string,
    toolUseEndpoint: string,
    model: string
  ) {
    this.exaAPIKey = exaAPIKey
    this.openaiAPIKey = openaiAPIKey
    this.toolUseEndpoint = toolUseEndpoint
    this.model = model
    if (exaAPIKey && openaiAPIKey && toolUseEndpoint && model) {
      console.log('MCP Config', exaAPIKey, openaiAPIKey, toolUseEndpoint, model)
      await executeOnMain(
        NODE,
        'configMCP',
        exaAPIKey,
        openaiAPIKey,
        toolUseEndpoint,
        model
      )
    }
  }

  async process(
    data: MessageRequest,
    tool?: AssistantTool
  ): Promise<MessageRequest> {
    if (!data.model || !data.messages) {
      return Promise.resolve(data)
    }
    console.log('processing data')
    const processedData = await executeOnMain(NODE, 'toolMCPQuery', data)
    console.log('processedData', processedData)
    // 4. Reroute the result to inference engine
    return Promise.resolve(processedData)
  }
}
