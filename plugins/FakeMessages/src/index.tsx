import { FluxDispatcher } from '@vendetta/metro/common'
import { findByProps } from '@vendetta/metro'
import { Forms } from '@vendetta/ui/components'
import { storage } from '@vendetta/plugin'

const { FormSection, FormInput, FormRow } = Forms

function spawnFakeMessage(channelId: string, authorId: string, content: string) {
    const userStore = findByProps('getCurrentUser', 'getUser')
    const user = userStore.getUser(authorId)

    const fakeMessage = {
        id: String(Date.now()),
        type: 0,
        channel_id: channelId,
        author: {
            id: authorId,
            username: user ? user.username : 'FakeUser',
            discriminator: user ? user.discriminator : '0001',
            avatar: user ? user.avatar : null,
            bot: user ? user.bot : false,
        },
        content,
        mentions: [],
        mention_roles: [],
        pinned: false,
        tts: false,
        attachments: [],
        embeds: [],
        timestamp: new Date().toISOString(),
        state: 'SENT',
    }

    FluxDispatcher.dispatch({
        type: 'MESSAGE_CREATE',
        channelId,
        message: fakeMessage,
    })
}

export default {
    onLoad() {},
    onUnload() {},
    settings: () => (
        <FormSection title='Fake Message'>
            <FormInput
                title='Channel ID'
                placeholder='enter channel id'
                value={storage.channelId ?? ''}
                onChange={v => (storage.channelId = v)}
            />
            <FormInput
                title='User ID'
                placeholder='enter user id'
                value={storage.userId ?? ''}
                onChange={v => (storage.userId = v)}
            />
            <FormInput
                title='Message'
                placeholder='enter fake message'
                value={storage.message ?? ''}
                onChange={v => (storage.message = v)}
            />
            <FormRow
                label='Send Fake Message'
                onPress={() => {
                    if (storage.channelId && storage.userId && storage.message) {
                        spawnFakeMessage(storage.channelId, storage.userId, storage.message)
                    }
                }}
            />
        </FormSection>
    ),
}