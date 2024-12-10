import { getJanDataFolderPath, normalizeFilePath } from '@janhq/core/node'
import { retrieval } from './retrieval'
import path from 'path'
import { mcpTool } from './mcp'

export function toolRetrievalUpdateTextSplitter(
  chunkSize: number,
  chunkOverlap: number
) {
  retrieval.updateTextSplitter(chunkSize, chunkOverlap)
}
export async function toolRetrievalIngestNewDocument(
  file: string,
  model: string,
  engine: string,
  useTimeWeighted: boolean
) {
  const filePath = path.join(getJanDataFolderPath(), normalizeFilePath(file))
  const threadPath = path.dirname(filePath.replace('files', ''))
  retrieval.updateEmbeddingEngine(model, engine)
  return retrieval
    .ingestAgentKnowledge(filePath, `${threadPath}/memory`, useTimeWeighted)
    .catch((err) => {
      console.error(err)
    })
}

export async function toolRetrievalLoadThreadMemory(threadId: string) {
  return retrieval
    .loadRetrievalAgent(
      path.join(getJanDataFolderPath(), 'threads', threadId, 'memory')
    )
    .catch((err) => {
      console.error(err)
    })
}

export async function toolRetrievalQueryResult(
  query: string,
  useTimeWeighted: boolean = false
) {
  return retrieval.generateResult(query, useTimeWeighted).catch((err) => {
    console.error(err)
  })
}

export async function toolMCPQuery(data: any) {
  return mcpTool.process(data)
}

export async function configMCP(
  exaAPIKey: string,
  openaiAPIKey: string,
  toolUseEndpoint: string,
  model: string
) {
  return mcpTool.init(exaAPIKey, openaiAPIKey, toolUseEndpoint, model)
}
