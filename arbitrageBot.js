const bittrex = require('node.bittrex.api');
bittrex.options({
    'apikey': 'APIKEY',
    'apisecret': 'APISECRET',
    'verbose': false,
    'cleartext': false,
});

class ArbPrices {
    constructor(name) {
        this._name = name;
        this._prices = [];
        this._markets = [`BTC-${name}`, `ETH-${name}`, `BTC-ETH`];
        this._arbConst = 0.0;
    }

    get name() {
        return this._name;
    }
    
    get prices() {
        return this._prices;
    }

    get markets() {
        return this._markets;
    }

    get arbCont() {
        return this._arbConst;
    }

    set arbConst(coeff) {
        this._arbConst = coeff;
    }
}

// coinStruct contains a coin name along with pricing of the different 
// market pairs
const isArbitragePossible = (coinStruct) => {
    // BTC to coin conversion: buy the ask
    getBidOrAsk(coinStruct, 0);
};

// All encompoassing where tradeNum is the trade number starting from 0
const getBidOrAsk = (coinStruct, tradeNum) => {
    bittrex.getticker({market: coinStruct.markets[tradeNum]}, function(data, err) {
        if (err) {
            return console.error(err);
        }

        if (data.success === true) {
            if (tradeNum === 0) {
                let ask = data.result.Ask;
                coinStruct.prices.push(ask);
                getBidOrAsk(coinStruct, 1);
            } else if (tradeNum === 1) {
                let bid = data.result.Bid;
                coinStruct.prices.push(bid);
                getBidOrAsk(coinStruct, 2);

            } else {
                let bid = data.result.Bid;
                coinStruct.prices.push(bid);
                // calculate arbitrage
                // 0.25% fee lost per order (Bittrex)
                let arbitrageConst = 1.0 / (coinStruct.prices[0]*0.9975) * (coinStruct.prices[1]*0.9975) * (coinStruct.prices[2]*0.9975);
                coinStruct.arbConst = arbitrageConst;

                let profitPercent = (arbitrageConst*100.0) - 100.0;
                // Sort out the ones that might be worth attempting
                if (profitPercent > 0) {
                    console.log(`Checking---${coinStruct.name}---`)
                    console.log(`${coinStruct.markets[0]} ask: ${coinStruct.prices[0]}`);
                    console.log(`${coinStruct.markets[1]} bid: ${coinStruct.prices[1]}`);
                    console.log(`${coinStruct.markets[2]} bid: ${coinStruct.prices[2]}`);
                    //console.log(`arbitrageConst: ${arbitrageConst}`);
                    //console.log(`Profit: ***${profitPercent}\%***`);
                    // Arbitrage trade
                    simulateArbitrage(coinStruct);
                } else {
                    //console.log('Losing Trade');
                }
            }
        } else {
            console.error(`Failed to get current bid/ask: ${coinStruct._markets[tradeNum]}`);
        }
    })
};

const arbitrageTrade = (coinStruct) => {
    bittrex.getbalance({ currency : 'BTC' }, function( data, err ) {
        if (err) {
            
        }
        console.log( data );
      });

};

const simulateArbitrage = (coinStruct) => {
    let acct = 1.0;
    console.log(`Starting with ${acct} BTC`);
    console.log(`Arbitrage on ${coinStruct.name}`);
    let bToC = (acct / coinStruct.prices[0]) * 0.9975;
    console.log(`Bought ${bToC} ${coinStruct.name} coins`);
    let cToE = (bToC * coinStruct.prices[1]) * 0.9975;
    console.log(`Bought ${cToE} ETH`);
    let eToB = (cToE * coinStruct.prices[2]) * 0.9975;
    console.log(`BTC after arbitrage: ${eToB}`);
}

const getBalanceBTC = () => {
    bittrex.getbalance({ currency: 'BTC' }, function( data, err ) {
        if (err) {
            return console.error(err);
        }
        startingBTC = data.result.Balance;
        console.log(`Starting BTC Balance: ${startingBTC}`);
    });
};

// TODO: Use api to pull all the possible arbitrage tokens
const bToE = 'BTC-ETH';
var startingBTC = 0.0;
const tokens = ['QTUM', 'OMG', 'NEO', 'XRP', 'CVC', 'PAY', 'LTC', 'MCO', 'BCC', 'DASH', 'SNT', 'STRAT', 'ZEC', 'BAT', 'XMR', 'GNT', 'SNGLS', 'DGB', 'DGD', 'LUN', 'ETC', 'FUN', 'MTL', 'XEM', 'BTS', 'ADX', 'BNT', 'STORJ', 'TKN', 'WAVES', 'FCT' ]

var priceStruct = [];

// initialize structure
getBalanceBTC();
console.log('-----Initializing structures-----');
for (let i = 0; i < tokens.length; i++) {
    priceStruct.push(new ArbPrices(tokens[i]));
}

for (let i = 0; i < tokens.length; i++) {
    //console.log(`Checking: ${tokens[i]}`);
    isArbitragePossible(priceStruct[i]);
}


