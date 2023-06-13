import {Telegraf} from 'telegraf'
import {PostTelegram} from './integrations/telegram'
import {DEV, LOG_CHANNEL, LOG_TOKEN, TELEGRAM_ENABLED} from './secrets'
import {Bot} from './bot'

let bot: Bot;
let maxRetries = 3; 

const telegram = new Telegraf(LOG_TOKEN)

async function initBot() {
    if( bot && bot.alarm ) {
        clearInterval(bot.alarm)
    }
    bot = new Bot()
    await bot.init(DEV)
}

async function Initialize(retryCount = 0): Promise<void> {
    try {
        RegisterShutdownEvents()
        await initBot();
    } catch (error: any) {

        console.error('[Initialize]', error.toString())

        if (TELEGRAM_ENABLED)
            await PostTelegram(error.toString(), telegram, LOG_CHANNEL)

        if (retryCount < maxRetries) {

            if (TELEGRAM_ENABLED)
                await PostTelegram(`Retry attempt ${retryCount + 1}...`, telegram, LOG_CHANNEL)
                
            console.log(`Retry attempt ${retryCount + 1}...`)
            setTimeout(() => Initialize(retryCount + 1), 5000); // Wait for 5 seconds before retry
        } else {

            if (TELEGRAM_ENABLED)
                await PostTelegram('Max retries exceeded. Bot shutting down.', telegram, LOG_CHANNEL)

            console.error('Max retries exceeded. Bot shutting down.')
        }
    }
}

function RegisterShutdownEvents(): void {
    process
        .on('unhandledRejection', async function (reason: any, p) {
            console.error('Unhandled Rejection at Promise', reason.toString());

            if(TELEGRAM_ENABLED)
                await PostTelegram(reason.toString(), telegram, LOG_CHANNEL)

            await new Promise(resolve => setTimeout(resolve, 10000));
            process.exit(1);
            //await initBot()
        })
        .on('uncaughtException', async function (err) {
            console.error(err, 'Uncaught Exception thrown');

            if(TELEGRAM_ENABLED)
                await PostTelegram(err.toString(), telegram, LOG_CHANNEL)
        });
}

Initialize()
