import {Telegraf} from 'telegraf'
import {goBot} from './bot'
import {PostTelegram} from './integrations/telegram'
import {DEV, LOG_CHANNEL, LOG_TOKEN} from './secrets'

console.log('DEV', DEV);
const telegram = new Telegraf(LOG_TOKEN)

async function Initialize(): Promise<void> {
    try {
        RegisterShutdownEvents()
        await goBot(DEV)
    } catch (error: any) {
        console.error('[Initialize]', error.toString())
        await PostTelegram(error.toString(), telegram, LOG_CHANNEL)
    }
}

function RegisterShutdownEvents(): void {
    process
        .on('unhandledRejection', async function (reason: any, p) {
            console.error('Unhandled Rejection at Promise', reason.toString());
            await PostTelegram(reason.toString(), telegram, LOG_CHANNEL)
            await new Promise(resolve => setTimeout(resolve, 10000));
            await goBot(DEV)
        })
        .on('uncaughtException', async function (err) {
            console.error(err, 'Uncaught Exception thrown');
            await PostTelegram(err.toString(), telegram, LOG_CHANNEL)
        });

}

Initialize()
