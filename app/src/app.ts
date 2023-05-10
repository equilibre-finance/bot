import {Telegraf} from 'telegraf'
import {goBot} from './bot'
import {PostTelegram} from './integrations/telegram'
import {DEV, LOG_CHANNEL, LOG_TOKEN} from './secrets'

console.log('DEV', DEV);
const telegram = new Telegraf(LOG_TOKEN)

async function Initialize(): Promise<void> {
    try {
        if (!DEV) {
            RegisterShutdownEvents()
            await Notifier(false)
        }
        await goBot(DEV)
    } catch (error: any) {
        console.error(error)
        await PostTelegram(error.toString(), telegram, LOG_CHANNEL)
    }
}

async function Notifier(isDown = true) {
    await PostTelegram(`Bot ${isDown ? 'Down' : 'Up'}\n`, telegram, LOG_CHANNEL)
}

function RegisterShutdownEvents(): void {
    process
        .on('beforeExit', async (code) => {
            console.log('Process beforeExit event with code: ', code);
            // await Notifier().then(process.exit(code))
        })
        .on('unhandledRejection', async function (reason: any, p) {
            console.error(reason, 'Unhandled Rejection at Promise', p);
            await PostTelegram(reason.toString(), telegram, LOG_CHANNEL)
        })
        .on('uncaughtException', async function (err) {
            console.error(err, 'Uncaught Exception thrown');
            await PostTelegram(err.toString(), telegram, LOG_CHANNEL)
        });

}

Initialize()
