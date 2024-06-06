import { Fragment } from 'react'

import React from 'react'

import Image from 'next/image'

import { Button } from '@janhq/joi'

import useModelHub from '@/hooks/useModelHub'

import { HfModelEntry } from '@/utils/huggingface'

import HubScreenModelCard from './HubScreenModelCard'

type Props = {
  onSeeAllClick: () => void
}

const HuggingFaceModelGroup: React.FC<Props> = ({ onSeeAllClick }) => {
  const { data } = useModelHub()
  if (!data) return null

  const models: HfModelEntry[] = (
    data.modelCategories.get('HuggingFace') ?? []
  ).slice(0, 4)
  if (models.length === 0) return null

  return (
    <Fragment>
      <div className="mt-12 flex items-center gap-2 first:mt-0">
        <Image
          width={24}
          height={24}
          src="/icons/ic_hugging_face.svg"
          alt="Hugging Face"
        />
        <h1 className="text-lg font-semibold">Hugging Face</h1>
        <Button
          theme="ghost"
          onClick={onSeeAllClick}
          className="ml-auto pr-0 text-sm text-[#2563EB]"
        >
          See All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-x-20 md:grid-cols-2">
        {models.map((model) => (
          <HubScreenModelCard key={model.id} {...model} />
        ))}
      </div>
    </Fragment>
  )
}

export default React.memo(HuggingFaceModelGroup)