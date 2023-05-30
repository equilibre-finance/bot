import {Telegraf} from 'telegraf'
import {PostTelegram} from './integrations/telegram'
import {DEV, LOG_CHANNEL, LOG_TOKEN} from './secrets'
import {Bot} from './bot'
let bot:Bot;

console.log('DEV', DEV);
const telegram = new Telegraf(LOG_TOKEN)

async function initBot() {
    if( bot && bot.alarm ) {
        clearInterval(bot.alarm)
    }
    bot = new Bot()
    await bot.init(DEV)
}
async function Initialize(): Promise<void> {
    try {
        RegisterShutdownEvents()
        await initBot();
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
            process.exit(1);
            //await initBot()
        })
        .on('uncaughtException', async function (err) {
            console.error(err, 'Uncaught Exception thrown');
            await PostTelegram(err.toString(), telegram, LOG_CHANNEL)
        });

}

Initialize()
