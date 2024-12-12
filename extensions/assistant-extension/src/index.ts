import {
  fs,
  Assistant,
  events,
  joinPath,
  AssistantExtension,
  AssistantEvent,
  ToolManager,
} from '@janhq/core'
import { RetrievalTool } from './tools/retrieval'
import { MCPTool } from './tools/mcp'

export default class JanAssistantExtension extends AssistantExtension {
  private static readonly _homeDir = 'file://assistants'

  mcpTool = new MCPTool()

  exaAPIKey: string = ''
  openaiAPIKey: string = ''
  toolUseEndpoint: string = ''
  model: string = ''

  async onLoad() {
    // Register the retrieval tool
    ToolManager.instance().register(new RetrievalTool())

    // making the assistant directory
    const assistantDirExist = await fs.existsSync(
      JanAssistantExtension._homeDir
    )
    this.registerSettings([
      {
        key: 'exa-apikey',
        title: 'MCP EXA API Key',
        description:
          'The API Key used to use the EXA API for the Model Context Protocol.',
        controllerType: 'input',
        controllerProps: {
          placeholder: 'Exa API Key',
          value: '',
        },
      },
      {
        key: 'chat-completions-endpoint',
        title: 'OpenAI Compatible Endpoint',
        description: 'The endpoint to use for making tool calls..',
        controllerType: 'input',
        controllerProps: {
          placeholder: 'https://api.openai.com/v1',
          value: 'https://api.openai.com/v1',
        },
      },
      {
        key: 'openai-api-key',
        title: 'OpenAI API Key',
        description: 'API keys for authentication.',
        controllerType: 'input',
        controllerProps: {
          placeholder: 'Insert API Key',
          value: '',
          type: 'password',
          inputActions: ['unobscure', 'copy'],
        },
      },
      {
        key: 'openai-model',
        title: 'Model',
        description: 'Model for chat completions.',
        controllerType: 'input',
        controllerProps: {
          placeholder: 'Model',
          value: 'gpt-4o-mini',
        },
      },
    ])
    if (
      localStorage.getItem(`${this.name}-version`) !== VERSION ||
      !assistantDirExist
    ) {
      if (!assistantDirExist) await fs.mkdir(JanAssistantExtension._homeDir)

      // Write assistant metadata
      await this.createJanAssistant()
      // Finished migration
      localStorage.setItem(`${this.name}-version`, VERSION)
      // Update the assistant list
      events.emit(AssistantEvent.OnAssistantsUpdate, {})
    }
    this.configure()
  }

  async onSettingUpdate<T>(key: string, value: T) {
    this.configure()
  }

  async configure() {
    this.exaAPIKey = await this.getSetting<string>('exa-apikey', '')
    this.openaiAPIKey = await this.getSetting<string>('openai-api-key', '')
    this.toolUseEndpoint = await this.getSetting<string>(
      'chat-completions-endpoint',
      ''
    )
    this.model = await this.getSetting<string>('openai-model', '')
    this.mcpTool.updateSettings(
      this.exaAPIKey,
      this.openaiAPIKey,
      this.toolUseEndpoint,
      this.model
    )
    if (!ToolManager.instance().get('model-context-protocol')) {
      ToolManager.instance().register(this.mcpTool)
    }
  }

  /**
   * Called when the extension is unloaded.
   */
  onUnload(): void {}

  async createAssistant(assistant: Assistant): Promise<void> {}

  async getAssistants(): Promise<Assistant[]> {
    return [this.defaultAssistant]
  }

  async deleteAssistant(assistant: Assistant): Promise<void> {
    if (assistant.id === 'jan') {
      return Promise.reject('Cannot delete Jan Assistant')
    }

    // remove the directory
    const assistantDir = await joinPath([
      JanAssistantExtension._homeDir,
      assistant.id,
    ])
    return fs.rm(assistantDir)
  }

  private async createJanAssistant(): Promise<void> {
    await this.createAssistant(this.defaultAssistant)
  }

  private defaultAssistant: Assistant = {
    avatar: '',
    thread_location: undefined,
    id: 'jan',
    object: 'assistant',
    created_at: Date.now(),
    name: 'Jan',
    description: 'A default assistant that can use all downloaded models',
    model: '*',
    instructions: '',
    tools: [
      {
        type: 'model-context-protocol',
        enabled: true,
        settings: {},
      },
      {
        type: 'retrieval',
        enabled: false,
        useTimeWeightedRetriever: false,
        settings: {
          top_k: 2,
          chunk_size: 1024,
          chunk_overlap: 64,
          retrieval_template: `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
CONTEXT: {CONTEXT}
----------------
QUESTION: {QUESTION}
----------------
Helpful Answer:`,
        },
      },
    ],
    file_ids: [],
    metadata: undefined,
  }
}
