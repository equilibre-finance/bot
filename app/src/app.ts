import { Telegraf } from 'telegraf'
import { goBot } from './bot'
import { PostTelegram } from './integrations/telegram'
import {DEV, LOG_CHANNEL, LOG_TOKEN} from './secrets'
console.log('DEV', DEV);
async function Initialize(): Promise<void> {
  try {
    if( ! DEV ) {
      RegisterShutdownEvents()
      await Notifier(false)
    }
    await goBot(DEV)
  } catch (error) {
    console.error(error)
  }
}

async function Notifier(isDown = true) {
  await PostTelegram(`Bot ${isDown ? 'Down' : 'Up'}\n`, new Telegraf(LOG_TOKEN), LOG_CHANNEL)
}

function RegisterShutdownEvents(): void {
  process.on('beforeExit', async (code) => {
    await Notifier().then(process.exit(code))
  })
}

Initialize()
