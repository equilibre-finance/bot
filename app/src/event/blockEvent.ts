import {Client} from 'discord.js'
import {BlockEvent} from '../event'
import {Context, Telegraf} from 'telegraf'
import {Update} from 'telegraf/typings/core/types/typegram'
import {TwitterApi} from 'twitter-api-v2'
import {MINT_TOPIC, NOTIIFY_REWARD_AMOUNT, SWAP_TOPIC} from '../constants/topics'
import RpcClient from '../clients/client'
import {TrackDeposit} from './deposit'
import {TrackSwap} from './swap'
import {TrackBribe} from './bribe'

let blockEventListener: ReturnType<typeof BlockEvent.on> | null = null;
let isTrackEventsRunning = false;

export async function TrackEvents(
    botIndex: number,
    discordClient: Client<boolean>,
    telegramClient: Telegraf<Context<Update>>,
    twitterClient: TwitterApi,
    rpcClient: RpcClient,
): Promise<void> {

    console.log(`[Bot ${botIndex}] ### Polling Events ###`);
    let blockNumber: number | undefined = undefined; 
    const pollInterval = 60000;

    if (blockEventListener) {
        console.log(`[Bot ${botIndex}] Existing BlockEvent listener found. Removing...`);
        blockEventListener.off();
        blockEventListener = null;
    }


    try {

        if (isTrackEventsRunning) {
            return;
        }
        isTrackEventsRunning = true;

        blockEventListener = BlockEvent.on(
            rpcClient,
            async (event) => {
                try {
                    if (event.topics[0].toLowerCase() === MINT_TOPIC) {
                        await TrackDeposit(discordClient, telegramClient, twitterClient, rpcClient, event);
                    } else if (event.topics[0].toLowerCase() === SWAP_TOPIC) {
                        await TrackSwap(discordClient, telegramClient, twitterClient, rpcClient, event);
                    } else if (event.topics[0].toLowerCase() === NOTIIFY_REWARD_AMOUNT) {
                        await TrackBribe(discordClient, telegramClient, twitterClient, rpcClient, event);
                    }
                } catch (innerError) {

                    const blockNumberDecimal = parseInt(String(event.blockNumber), 16);                    
                    blockNumber = blockNumberDecimal;
                    console.error(`[Error] Not possible process event Address: ${event.address}. Blocknumber: '${blockNumberDecimal}'`); 

                    if (blockEventListener) {
                        console.log(`[Bot ${botIndex}] Existing BlockEvent listener found. Removing...`);
                        blockEventListener.off();
                        blockEventListener = null;
                    }

                    
                }
            },
            {
                startBlockNumber: blockNumber,
                addresses: [...global.PAIR_ADDRESSES, ...global.BRIBE_ADDRESSES],
                topics: [NOTIIFY_REWARD_AMOUNT, MINT_TOPIC, SWAP_TOPIC],
                pollInterval: pollInterval,
            },
        );
    } catch (e) {
        console.log(`[Error] An error occurred. Restarting application...`);
        setTimeout(() => TrackEvents(botIndex, discordClient, telegramClient, twitterClient, rpcClient), 10000);
    }
    finally {
        if (!isTrackEventsRunning) {
            isTrackEventsRunning = false;
        }
    }
}

