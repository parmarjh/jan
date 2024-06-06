import { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import { ResourceStatus } from '@janhq/core'
import { Progress } from '@janhq/joi'
import { useClickOutside } from '@janhq/joi'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useAtom, useAtomValue } from 'jotai'
import { MonitorIcon, XIcon, ChevronDown, ChevronUp } from 'lucide-react'

import { twMerge } from 'tailwind-merge'

import { toGibibytes } from '@/utils/converter'

import TableActiveModel from './TableActiveModel'

import { showSystemMonitorPanelAtom } from '@/helpers/atoms/App.atom'
import { hostAtom } from '@/helpers/atoms/AppConfig.atom'
import { reduceTransparentAtom } from '@/helpers/atoms/Setting.atom'
import {
  cpuUsageAtom,
  gpusAtom,
  ramUtilitizedAtom,
  totalRamAtom,
  usedRamAtom,
} from '@/helpers/atoms/SystemBar.atom'

const SystemMonitor: React.FC = () => {
  const host = useAtomValue(hostAtom)
  const [usedRam, setUsedRam] = useAtom(usedRamAtom)
  const [totalRam, setTotalRam] = useAtom(totalRamAtom)
  const [cpuUsage, setCpuUsage] = useAtom(cpuUsageAtom)
  const gpus = useAtomValue(gpusAtom)

  const [showFullScreen, setShowFullScreen] = useState(false)
  const ramUtilitized = useAtomValue(ramUtilitizedAtom)
  const [showSystemMonitorPanel, setShowSystemMonitorPanel] = useAtom(
    showSystemMonitorPanelAtom
  )
  const [control, setControl] = useState<HTMLDivElement | null>(null)
  const [elementExpand, setElementExpand] = useState<HTMLDivElement | null>(
    null
  )
  const reduceTransparent = useAtomValue(reduceTransparentAtom)
  const abortControllerRef = useRef<AbortController | null>(null)

  const register = useCallback(async () => {
    if (abortControllerRef.current) return
    abortControllerRef.current = new AbortController()
    await fetchEventSource(`${host}/events/resources`, {
      onmessage(ev) {
        if (!ev.data || ev.data === '') return
        try {
          const resourceEvent = JSON.parse(ev.data) as ResourceStatus
          setUsedRam(resourceEvent.mem.used)
          setTotalRam(resourceEvent.mem.total)
          setCpuUsage(resourceEvent.cpu.usage)
        } catch (err) {
          console.error(err)
        }
      },
      signal: abortControllerRef.current.signal,
    })
  }, [host, setTotalRam, setUsedRam, setCpuUsage])

  const unregister = useCallback(() => {
    if (!abortControllerRef.current) return
    abortControllerRef.current.abort()
    abortControllerRef.current = null
  }, [])

  useClickOutside(
    () => {
      setShowSystemMonitorPanel(false)
      setShowFullScreen(false)
    },
    null,
    [control, elementExpand]
  )

  useEffect(() => {
    register()
    return () => {
      unregister()
    }
  }, [register, unregister])

  return (
    <Fragment>
      <div
        ref={setControl}
        className={twMerge(
          'flex cursor-pointer items-center gap-x-1 rounded-l px-1 py-0.5 hover:bg-[hsla(var(--secondary-bg))]',
          showSystemMonitorPanel && 'bg-[hsla(var(--secondary-bg))]'
        )}
        onClick={() => {
          setShowSystemMonitorPanel(!showSystemMonitorPanel)
          setShowFullScreen(false)
        }}
      >
        <MonitorIcon size={12} className="text-[hsla(var(--text-primary))]" />
        <span className="font-medium">System Monitor</span>
      </div>
      {showSystemMonitorPanel && (
        <div
          ref={setElementExpand}
          className={twMerge(
            'fixed bottom-9 left-[49px] z-50 flex w-[calc(100%-48px-8px)] flex-shrink-0 flex-col rounded-lg rounded-b-none border-t border-[hsla(var(--app-border))] bg-[hsla(var(--app-bg))]',
            showFullScreen && 'h-[calc(100%-63px)]',
            reduceTransparent && 'w-[calc(100%-48px)] rounded-none'
          )}
        >
          <div className="flex h-8 flex-shrink-0 items-center justify-between border-b border-[hsla(var(--app-border))] px-4">
            <h6 className="font-medium text-[hsla(var(--text-primary))]">
              Running Models
            </h6>
            <div className="unset-drag flex cursor-pointer items-center gap-x-2">
              {showFullScreen ? (
                <ChevronDown
                  size={20}
                  className="text-[hsla(var(--text-secondary))]"
                  onClick={() => setShowFullScreen(!showFullScreen)}
                />
              ) : (
                <ChevronUp
                  size={20}
                  className="text-[hsla(var(--text-secondary))]"
                  onClick={() => setShowFullScreen(!showFullScreen)}
                />
              )}
              <XIcon
                size={16}
                className="text-[hsla(var(--text-secondary))]"
                onClick={() => {
                  setShowSystemMonitorPanel(false)
                  setShowFullScreen(false)
                }}
              />
            </div>
          </div>

          <div className="flex h-full gap-4">
            <TableActiveModel />

            <div className="w-1/2 border-l border-[hsla(var(--app-border))] p-4">
              <div className="mb-4 border-b border-[hsla(var(--app-border))] pb-4">
                <h6 className="font-bold">CPU</h6>
                <div className="flex items-center gap-x-4">
                  <Progress value={cpuUsage} className="w-full" size="small" />
                  <span className="flex-shrink-0 ">{cpuUsage}%</span>
                </div>
              </div>
              <div className="mb-4 border-b border-[hsla(var(--app-border))] pb-4">
                <div className="flex items-center justify-between gap-2">
                  <h6 className="font-bold">Memory</h6>
                  <span>
                    {toGibibytes(usedRam, { hideUnit: true })}/
                    {toGibibytes(totalRam, { hideUnit: true })} GB
                  </span>
                </div>
                <div className="flex items-center gap-x-4">
                  <Progress
                    value={Math.round((usedRam / totalRam) * 100)}
                    className="w-full"
                    size="small"
                  />
                  <span className="flex-shrink-0 ">{ramUtilitized}%</span>
                </div>
              </div>

              {gpus.length > 0 && (
                <div className="mb-4 border-b border-[hsla(var(--app-border))] pb-4 last:border-none">
                  {gpus.map((gpu, index) => (
                    <div key={index} className="mt-4 flex flex-col gap-x-2">
                      <div className="flex w-full items-start justify-between">
                        <span className="line-clamp-1 w-1/2 font-bold">
                          {gpu.name}
                        </span>
                        <div className="flex gap-x-2">
                          <div className="">
                            <span>
                              {gpu.memoryTotal - gpu.memoryFree}/
                              {gpu.memoryTotal}
                            </span>
                            <span> MB</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-x-4">
                        <Progress
                          value={gpu.utilization}
                          className="w-full"
                          size="small"
                        />
                        <span className="flex-shrink-0 ">
                          {gpu.utilization}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default SystemMonitor
