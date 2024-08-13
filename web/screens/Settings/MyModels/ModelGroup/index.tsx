import React, { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import {
  EngineStatus,
  LlmEngine,
  LocalEngine,
  Model,
  RemoteEngine,
  RemoteEngines,
} from '@janhq/core'

import { Button } from '@janhq/joi'
import { useAtom, useSetAtom } from 'jotai'
import {
  SettingsIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from 'lucide-react'

import useEngineQuery from '@/hooks/useEngineQuery'
import useGetModelsByEngine from '@/hooks/useGetModelsByEngine'

import {
  getLogoByLocalEngine,
  getLogoByRemoteEngine,
  getTitleByCategory,
} from '@/utils/model-engine'

import ModelItem from '../ModelItem'

import { showEngineListModelAtom } from '@/helpers/atoms/Model.atom'
import { setUpRemoteModelStageAtom } from '@/helpers/atoms/SetupRemoteModel.atom'

type Props = {
  engine: LlmEngine
  searchText: string
}

const ModelGroup: React.FC<Props> = ({ engine, searchText }) => {
  const [models, setModels] = useState<Model[]>([])
  const { getModelsByEngine } = useGetModelsByEngine()
  const setUpRemoteModelStage = useSetAtom(setUpRemoteModelStageAtom)
  const { data: engineData } = useEngineQuery()

  const [showEngineListModel, setShowEngineListModel] = useAtom(
    showEngineListModelAtom
  )

  const engineLogo: string | undefined = models.find(
    (entry) => entry?.metadata?.logo != null
  )?.metadata?.logo

  const apiKeyUrl: string | undefined = models.find(
    (entry) => entry?.metadata?.api_key_url != null
  )?.metadata?.api_key_url

  const onSettingClick = useCallback(() => {
    setUpRemoteModelStage('SETUP_API_KEY', engine as unknown as RemoteEngine, {
      logo: engineLogo,
      api_key_url: apiKeyUrl,
    })
  }, [apiKeyUrl, engine, engineLogo, setUpRemoteModelStage])

  const isEngineReady =
    engineData?.find((e) => e.name === engine)?.status === EngineStatus.Ready

  const getEngineStatusReady: LlmEngine[] | undefined = engineData
    ?.filter((e) => e.status === EngineStatus.Ready)
    .map((x) => x.name as LlmEngine)

  const showModel = showEngineListModel.includes(engine)

  const onClickChevron = useCallback(() => {
    if (showModel) {
      setShowEngineListModel((prev) => prev.filter((item) => item !== engine))
    } else {
      setShowEngineListModel((prev) => [...prev, engine])
    }
  }, [engine, setShowEngineListModel, showModel])

  useEffect(() => {
    const matchedModels = getModelsByEngine(engine, searchText)
    setModels(matchedModels)
    setShowEngineListModel((prev) => [
      ...prev,
      ...(getEngineStatusReady as LlmEngine[]),
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModelsByEngine, engine, searchText, setShowEngineListModel])

  const engineName = getTitleByCategory(engine)
  const localEngineLogo = getLogoByLocalEngine(engine as LocalEngine)
  const remoteEngineLogo = getLogoByRemoteEngine(engine as RemoteEngine)
  const isRemoteEngine = RemoteEngines.includes(engine as RemoteEngine)

  if (models.length === 0) return null

  return (
    <div className="w-full py-3">
      <div className="mb-2 flex justify-between pr-2">
        <div
          className="flex cursor-pointer items-center gap-2 pl-3"
          onClick={onClickChevron}
        >
          {!isRemoteEngine && localEngineLogo && (
            <Image
              className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
              width={48}
              height={48}
              src={localEngineLogo}
              alt="logo"
            />
          )}
          {remoteEngineLogo && (
            <Image
              className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
              width={48}
              height={48}
              src={remoteEngineLogo}
              alt="logo"
            />
          )}
          <h6 className="pr-3 font-medium text-[hsla(var(--text-secondary))]">
            {engineName}
          </h6>
        </div>
        <div className="flex items-center gap-x-0.5">
          {isRemoteEngine && (
            <Button theme="icon" onClick={onSettingClick} variant="outline">
              {isEngineReady ? (
                <SettingsIcon
                  size={14}
                  className="text-[hsla(var(--text-secondary))]"
                />
              ) : (
                <PlusIcon
                  size={14}
                  className="text-[hsla(var(--text-secondary))]"
                />
              )}
            </Button>
          )}
          {!showModel ? (
            <Button theme="icon" onClick={onClickChevron}>
              <ChevronDownIcon
                size={14}
                className="text-[hsla(var(--text-secondary))]"
              />
            </Button>
          ) : (
            <Button theme="icon" onClick={onClickChevron}>
              <ChevronUpIcon
                size={14}
                className="text-[hsla(var(--text-secondary))]"
              />
            </Button>
          )}
        </div>
      </div>
      <div>
        {models.map((model) => {
          if (!showModel) return null

          return <ModelItem model={model} key={model.id} />
        })}
      </div>
    </div>
  )
}

export default ModelGroup
