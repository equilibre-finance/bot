import { Telegraf } from 'telegraf'
import { goBot } from './bot'
import { PostTelegram } from './integrations/telegram'
import {DEV, LOG_CHANNEL, LOG_TOKEN} from './secrets'
console.log('DEV', DEV);
let telegram = new Telegraf(LOG_TOKEN)
async function Initialize(): Promise<void> {
  try {
    if( ! DEV ) {
      RegisterShutdownEvents()
      await Notifier(false)
    }
    await goBot(DEV)
  } catch (error) {
    console.error(error)
    await PostTelegram(error.toString(), telegram, LOG_CHANNEL)
  }
}

async function Notifier(isDown = true) {
  await PostTelegram(`Bot ${isDown ? 'Down' : 'Up'}\n`, telegram, LOG_CHANNEL)
}

function RegisterShutdownEvents(): void {
  process.on('beforeExit', async (code) => {
    await Notifier().then(process.exit(code))
  })
}

Initialize()
