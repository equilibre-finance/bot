import {DISCORD_ACCESS_TOKEN, DISCORD_ENABLED, TELEGRAM_ENABLED, TWITTER_ENABLED} from './secrets'
import {DiscordClient} from './clients/discordClient'
import {Client} from 'discord.js'
import RpcClient from './clients/client'
import {TwitterApi} from 'twitter-api-v2'
import {Context, Telegraf} from 'telegraf'
import {Update} from 'telegraf/typings/core/types/typegram'
import {defaultActivity} from './integrations/discord'
import {TwitterClient} from './clients/twitterClient'
import {TelegramClient} from './clients/telegramClient'
import {GetPrices} from './integrations/coingecko'
import {TrackEvents} from './event/blockEvent'
import {alchemyProvider} from './clients/ethersClient'
import {GetVeloData} from './integrations/velo'
import {GetTokensData} from './constants/tokenIds'
let botIndex = 0;
export class Bot{
    discordClient: Client<boolean> = DiscordClient
    twitterClient: TwitterApi = TwitterClient
    telegramClient: Telegraf<Context<Update>> = TelegramClient
    rpcClient = new RpcClient(alchemyProvider)
    alarm: NodeJS.Timeout | undefined
    async init(dev: boolean) {
        botIndex++;
        console.log(`[${botIndex}] bot init...`)
        await this.SetUpDiscord()
        await this.SetUpTwitter()
        await this.SetUpTelegram()

        global.ENS = {}
        if (!global.TOKEN_PRICES)
            global.TOKEN_PRICES = {}
        global.TOKEN_IMAGES = {}
        global.VELO_DATA = []
        global.PAIR_ADDRESSES = []
        global.BRIBE_ADDRESSES = []
    
            this.reload()

        this.alarm = setInterval(async () => {
            console.log(`[${botIndex}] Updating data...`)
            this.reload()
        }, 20 * 60 * 1000);

        await TrackEvents(botIndex, this.discordClient, this.telegramClient, this.twitterClient, this.rpcClient)

    }

    async reload() {
        console.log(`[${botIndex}] bot reload...`)
        await this.retryAsync(GetTokensData, 5, 3000);
        await this.retryAsync(GetPrices, 5, 3000);
        await this.retryAsync(GetVeloData, 5, 3000);
    }


    
    
    async SetUpDiscord() {
        if (DISCORD_ENABLED) {
            this.discordClient = DiscordClient
            this.discordClient.on('ready', async (client: any) => {
                console.debug(`[${botIndex}] Discord ${client.user?.tag}!`)
            })
            await this.discordClient.login(DISCORD_ACCESS_TOKEN)
            await defaultActivity(this.discordClient)
        }
    }
    
    async SetUpTwitter() {
        if (TWITTER_ENABLED) {
            this.twitterClient = TwitterClient
            this.twitterClient.readWrite
        }
    }
    
    async SetUpTelegram() {
        if (TELEGRAM_ENABLED) {
            this.telegramClient = TelegramClient
        }
    }

    async retryAsync(fn: any, maxRetries: any, retryDelay: any) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                console.error(`Error occurred. Attempt ${i + 1} of ${maxRetries}. Retrying in ${retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        throw new Error(`Failed after ${maxRetries} retries.`);
    }
    
}