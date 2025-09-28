import { FluxDispatcher } from '@vendetta/metro/common'
import { findByProps } from '@vendetta/metro'
import { Forms } from '@vendetta/ui/components'
import { storage } from '@vendetta/plugin'

const { FormSection, FormInput, FormRow } = Forms
const userStore = findByProps('getCurrentUser', 'getUser')

function spawnFakeMessage(channelId, authorId, content, id) {
    const user = userStore.getUser(authorId)
    const fakeMessage = {
        id: id || String(Date.now()),
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
        fake: true,
    }
    FluxDispatcher.dispatch({
        type: 'MESSAGE_CREATE',
        channelId,
        message: fakeMessage,
    })
}

function persistSavedMessages(saved) {
    storage.savedMessages = saved
    storage._lastUpdate = Date.now()
}

function saveMessage(channelId, userId, content) {
    const saved = storage.savedMessages || []
    const id = String(Date.now())
    saved.push({ id, channelId, userId, content })
    persistSavedMessages(saved)
}

function loadSavedMessages() {
    const saved = storage.savedMessages || []
    saved.forEach(msg => {
        spawnFakeMessage(msg.channelId, msg.userId, msg.content, msg.id)
    })
}

export default {
    onLoad() {
        setTimeout(loadSavedMessages, 1000)
    },
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
            <FormInput
                title='Delay (seconds)'
                placeholder='enter delay in seconds'
                value={storage.delay ?? ''}
                onChange={v => (storage.delay = v)}
            />
            <FormRow
                label='Send Fake Message'
                onPress={() => {
                    const { channelId, userId, message, delay } = storage
                    if (channelId && userId && message) {
                        const ms = parseInt(delay || '0') * 1000
                        setTimeout(() => {
                            spawnFakeMessage(channelId, userId, message)
                            saveMessage(channelId, userId, message)
                        }, ms)
                    }
                }}
            />
        </FormSection>
    ),
}
