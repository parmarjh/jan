import { Model } from '@janhq/core/lib/types'

import { useAtom, useSetAtom } from 'jotai'

import { generateConversationId } from '@/utils/conversation'

import {
  userConversationsAtom,
  setActiveConvoIdAtom,
  addNewConversationStateAtom,
} from '@/helpers/atoms/Conversation.atom'

export const useCreateConversation = () => {
  const [userConversations, setUserConversations] = useAtom(
    userConversationsAtom
  )
  const setActiveConvoId = useSetAtom(setActiveConvoIdAtom)
  const addNewConvoState = useSetAtom(addNewConversationStateAtom)

  const requestCreateConvo = async (model: Model, bot?: Bot) => {
    const conversationName = model.name
    const mappedConvo: Conversation = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: generateConversationId(),
      modelId: model._id,
      name: conversationName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      botId: bot?._id ?? undefined,
    }

    addNewConvoState(mappedConvo._id, {
      hasMore: true,
      waitingForResponse: false,
    })
    setUserConversations([mappedConvo, ...userConversations])
    setActiveConvoId(mappedConvo._id)
  }

  return {
    requestCreateConvo,
  }
}
