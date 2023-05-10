// [COINGECKO ID, SYMBOL, DECIMALS, CONGECKO-LOGO]
import axios from 'axios'
import {urls} from '../constants/urls'
import {TokensInfoData, VeloData} from '../types/velo'
export let TOKENS: { [key: string]: (string | number)[] } = {};
export const GetTokensData = async () => {
    const tokenData: TokensInfoData = (await axios.get(urls.tokenUrl)).data as TokensInfoData
    global.TOKEN_DATA = tokenData.tokens
    for (const i in global.TOKEN_DATA) {
        const token = global.TOKEN_DATA[i]
        const tokenName = token.name.toLowerCase()
        TOKENS[tokenName] =
            [
                tokenName,
                token.symbol,
                token.decimals,
                token.logoURI
            ]
        // console.log(i, tokenName, token.symbol, token.decimals);
    }

    const symbols = GetSymbols()
    console.log(`Symbols: (${symbols.length}) ${symbols.join(', ')}`)
    return TOKENS;
}

export const GetSymbols = () => {
    const symbols: string[] = []
    for (const i in global.TOKEN_DATA) {
        const token = global.TOKEN_DATA[i]
        const symbol = token.symbol.toLowerCase()
        symbols.push(symbol)
    }
    return symbols;
}
