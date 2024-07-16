import { Fragment, useCallback, useRef, useState } from 'react'

import Image from 'next/image'

import { Button, Select } from '@janhq/joi'
import { ChevronsLeftRight, Copy, ExternalLink } from 'lucide-react'

import DropdownModal from './DropdownModal'

type Props = {
  modelIdVariants: string[]
  modelId: string
  name: string
  onActionClick: () => void
}

const HeaderModal: React.FC<Props> = ({
  modelIdVariants,
  modelId,
  name,
  onActionClick,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<string>(modelId)
  const textRef = useRef<HTMLDivElement>(null)

  const options = modelIdVariants.map((variant) => ({
    name: variant,
    value: variant,
  }))

  const onCopyClicked = useCallback(() => {
    navigator.clipboard.writeText(textRef.current?.innerText ?? '')
  }, [])

  const title = name.charAt(0).toUpperCase() + name.slice(1)

  return (
    <div className="flex items-center">
      <span className="text-xl font-semibold leading-8">{title}</span>
      <DropdownModal
        className="z-[500] min-w-[320px] rounded-lg border bg-white p-3 shadow-dropDown"
        trigger={
          <div className="ml-auto mr-3 flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-4 py-2">
            <Image
              width={22.5}
              height={18}
              src="/icons/ic_cortex.svg"
              alt="Cortex icon"
            />
            <span className="text-[16.2px] font-bold leading-[9px]">
              Cortex
            </span>
            <ChevronsLeftRight size={16} color="#00000099" />
          </div>
        }
        content={
          <Fragment>
            <Select
              value={selectedVariant}
              className="z-[999] h-8 w-full gap-1 px-2"
              options={options}
              onValueChange={(value) => setSelectedVariant(value)}
            />
            <div className="mt-3 flex w-full items-center gap-1 font-medium text-[var(--text-primary)]">
              <div
                ref={textRef}
                className="line-clamp-1 flex-1 whitespace-nowrap rounded-md border bg-[#0000000F] p-2 leading-[16.71px]"
              >
                cortex run {selectedVariant}
              </div>
              <button
                onClick={onCopyClicked}
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-white"
              >
                <Copy size={18} />
              </button>
            </div>
            <a
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1 text-xs text-[#2563EB] no-underline"
              href="https://cortex.so/docs/quickstart"
              target="_blank_"
            >
              Cortex Quickstart Guide
              <ExternalLink size={12} />
            </a>
          </Fragment>
        }
      />
      <Button
        className="mr-6 px-4 py-2"
        onClick={onActionClick}
        variant="solid"
      >
        <span className="text-sm font-semibold">Set Up</span>
      </Button>
    </div>
  )
}
export default HeaderModal
