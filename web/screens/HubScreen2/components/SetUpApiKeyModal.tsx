import { Fragment, useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { Button, Modal } from '@janhq/joi'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowUpRight } from 'lucide-react'

import { toaster } from '@/containers/Toast'

import useCortex from '@/hooks/useCortex'

import useCortexConfig from '@/hooks/useCortexConfig'

import { getTitleByCategory } from '@/utils/model-engine'

import { getCortexConfigAtom } from '@/helpers/atoms/CortexConfig.atom'
import { setUpRemoteModelStageAtom } from '@/helpers/atoms/SetupRemoteModel.atom'

const SetUpApiKeyModal: React.FC = () => {
  const { registerEngineConfig } = useCortex()
  const { getConfig } = useCortexConfig()
  const cortexConfig = useAtomValue(getCortexConfigAtom)

  const [{ stage, remoteEngine, metadata }, setUpRemoteModelStage] = useAtom(
    setUpRemoteModelStageAtom
  )
  const [apiKey, setApiKey] = useState<string>('')

  useEffect(() => {
    if (!remoteEngine) return
    // @ts-expect-error remoteEngine is not null
    setApiKey(cortexConfig[remoteEngine ?? '']?.apiKey ?? '')
  }, [remoteEngine, cortexConfig])

  const onSaveClicked = useCallback(async () => {
    if (!remoteEngine) {
      alert('Does not have engine')
      return
    }
    try {
      // TODO: apply use mutation
      await registerEngineConfig(remoteEngine, {
        key: 'apiKey',
        value: apiKey,
        name: remoteEngine,
      })
      setUpRemoteModelStage('NONE', undefined)
      getConfig().catch(console.error)
      toaster({
        title: 'Success!',
        description: `Key added successfully`,
        type: 'success',
      })
    } catch (error) {
      alert(error)
    }
  }, [
    getConfig,
    registerEngineConfig,
    setUpRemoteModelStage,
    apiKey,
    remoteEngine,
  ])

  const onDismiss = useCallback(() => {
    setUpRemoteModelStage('NONE', undefined)
  }, [setUpRemoteModelStage])

  if (remoteEngine == null) return null
  const owner: string = getTitleByCategory(remoteEngine)
  const logoUrl: string = (metadata?.owner_logo ?? '') as string
  const apiKeyUrl: string = (metadata?.api_key_url ?? '') as string

  return (
    <Modal
      onOpenChange={onDismiss}
      open={stage === 'SETUP_API_KEY'}
      content={
        <Fragment>
          <div className="my-4 flex items-center gap-2 text-black">
            {logoUrl && (
              <Image width={24} height={24} src={logoUrl} alt="Model owner" />
            )}
            <h1 className="text-lg font-semibold leading-7">{owner}</h1>
          </div>

          <div className="mb-3 text-sm font-medium leading-4">API Key</div>

          <input
            className="text-[hsla(var(--text-secondary)] w-full rounded-md border p-2 leading-[16.94px]"
            placeholder="Input API Key"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />

          <span className="mt-3 flex items-center justify-start gap-1 text-xs font-medium leading-3 text-blue-600">
            <a
              href={apiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex no-underline"
            >
              Get your API key from {owner} <ArrowUpRight size={12} />
            </a>
          </span>

          <span className="my-4 flex items-center gap-1 text-xs text-blue-500"></span>
          <div className="flex items-center justify-end gap-3">
            <Button onClick={onDismiss}>Cancel</Button>
            <Button onClick={onSaveClicked}>Save</Button>
          </div>
        </Fragment>
      }
    />
  )
}

export default SetUpApiKeyModal