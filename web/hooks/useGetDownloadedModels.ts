import { useEffect } from 'react'
import { atom } from 'jotai'

import { useAtom } from 'jotai'

const downloadedModelAtom = atom<AssistantModel[]>([])
import { PluginType } from '@janhq/core'
import { pluginManager } from '@plugin/PluginManager'
import { ModelPlugin } from '@janhq/core/lib/plugins'
import { Model } from '@janhq/core/lib/types'

export function useGetDownloadedModels() {
  const [downloadedModels, setDownloadedModels] = useAtom(downloadedModelAtom)

  useEffect(() => {
    getDownloadedModels().then((downloadedModels) => {
      setDownloadedModels(downloadedModels)
    })
  }, [setDownloadedModels])

  return { downloadedModels, setDownloadedModels }
}

export async function getDownloadedModels(): Promise<Model[]> {
  const models =
    ((await pluginManager
      .get<ModelPlugin>(PluginType.Model)
      ?.getDownloadedModels()) as Model[]) ?? []
  return models
}
