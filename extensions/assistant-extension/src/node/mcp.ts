import { Connection } from '@unroute/sdk'
import * as exa from '@unroute/mcp-exa'
import { OpenAI } from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'

export class MCPTool {
  openai: OpenAI | undefined
  connection: Connection | undefined

  exaAPIKey: string = ''
  openaiAPIKey: string = ''
  toolUseEndpoint: string = ''
  model: string = ''

  async init(
    exaAPIKey: string,
    openaiAPIKey: string,
    toolUseEndpoint: string,
    model: string
  ) {
    this.openai = new OpenAI({
      apiKey: openaiAPIKey,
    })
    this.exaAPIKey = exaAPIKey
    this.openaiAPIKey = openaiAPIKey
    this.toolUseEndpoint = toolUseEndpoint
    this.model = model

    this.connection = await Connection.connect({
      exa: {
        server: exa.createServer({
          apiKey: this.exaAPIKey,
        }),
      },
    })
  }

  process = async (data: any) => {
    if (!this.connection || !this.openai) {
      return data
    }
    // Create a handler

    const handler = new (await import('@unroute/sdk/openai.js')).OpenAIHandler(
      this.connection
    )
    const messages = data.messages as ChatCompletionMessageParam[]

    let isDone = false

    while (!isDone) {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: await handler.listTools(),
      })
      // Handle tool calls
      const toolMessages = await handler.call(response)

      messages.push(response.choices[0].message)
      messages.push(...toolMessages)
      isDone = toolMessages.length === 0
      console.log('messages', messages)
    }

    // Print the final conversation
    console.log('\nFinal conversation:')

    messages.forEach((msg) => {
      console.log(`\n${msg.role.toUpperCase()}:`)
      console.log(msg.content)
      if (msg.role === 'assistant' && msg.tool_calls) {
        console.log(msg.tool_calls)
      }
    })
    data.messages = messages
    return data
  }
}

export const mcpTool = new MCPTool()
