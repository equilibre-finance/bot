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
let startBlockNumber: number | undefined

export class Bot {
    discordClient: Client<boolean> = DiscordClient
    twitterClient: TwitterApi = TwitterClient
    telegramClient: Telegraf<Context<Update>> = TelegramClient
    rpcClient = new RpcClient(alchemyProvider)
    alarm: NodeJS.Timeout | undefined
    isTimerRunning: boolean = false;
    queue: Promise<void> = Promise.resolve();

    async init(dev: boolean) {
        startBlockNumber = Number(process.env.LAST_BLOCK)
        botIndex++;
        console.log(`[Info] bot init...`);
        await this.SetUpDiscord();
        await this.SetUpTwitter();
        await this.SetUpTelegram();
    
        global.ENS = {};
        if (!global.TOKEN_PRICES)
            global.TOKEN_PRICES = {};
        global.TOKEN_IMAGES = {};
        global.VELO_DATA = [];
        global.PAIR_ADDRESSES = [];
        global.BRIBE_ADDRESSES = [];
    
        await this.reload();
    
        if (this.alarm) {
            clearInterval(this.alarm);
            this.alarm = undefined;
        }
    
        // Call TrackEvents once before the interval
        if (!this.isTimerRunning) {
            this.isTimerRunning = true;
    
            try {
                await TrackEvents(
                    botIndex,
                    this.discordClient,
                    this.telegramClient,
                    this.twitterClient,
                    this.rpcClient,
                    
                );
                console.log(`[Info] Finished tracking events.`);
            } catch (error) {
                console.error(`[Info] An error occurred while tracking events: ${error}`);
            } finally {
                this.isTimerRunning = false;
            }
    
            this.alarm = setInterval(async () => {
                if (!this.isTimerRunning) {
                    this.isTimerRunning = true;
                    console.log(`[Info] Updating data...`);
                    this.reload();
    
                    try {
                        await TrackEvents(
                            botIndex,
                            this.discordClient,
                            this.telegramClient,
                            this.twitterClient,
                            this.rpcClient,
                            
                        );
                        console.log(`[Info] Finished tracking events.`);
                    } catch (error) {
                        console.error(`[Info] An error occurred while tracking events: ${error}`);
                    } finally {
                        this.isTimerRunning = false;
                    }
                }
            }, 20 * 60 * 1000);
        } else {
            console.log(`[Info] Timer is already running. Skipping...`);
        }
    }
    
    

    async reload() {
        console.log(`[Info] Reloading data...`)
        await GetTokensData();
        await GetPrices();
        await GetVeloData();
    }
        
    async SetUpDiscord() {
        if (DISCORD_ENABLED) {
            this.discordClient = DiscordClient
            this.discordClient.on('ready', async (client: any) => {
                console.debug(`[Info] Discord ${client.user?.tag}!`)
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
                console.error('[Error] Attempt ${i + 1} of ${maxRetries}. Retrying in ${retryDelay / 1000} seconds...');
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        throw new Error('[Error] Failed after ${maxRetries} retries.');
    }
    
}