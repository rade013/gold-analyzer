const priceElement =
    document.getElementById("price");

const trendElement =
    document.getElementById("trend");

const signalElement =
    document.getElementById("signal");

const scoreElement =
    document.getElementById("score");

const rsiElement =
    document.getElementById("rsi");

const ema20Element =
    document.getElementById("ema20");

const ema50Element =
    document.getElementById("ema50");

const ema200Element =
    document.getElementById("ema200");

const macdElement =
    document.getElementById("macd");

const momentumElement =
    document.getElementById("momentum");

const structureElement =
    document.getElementById("structure");

const h1TrendElement =
    document.getElementById("h1Trend");

const h1RsiElement =
    document.getElementById("h1Rsi");

const h1MacdElement =
    document.getElementById("h1Macd");

const messageElement =
    document.getElementById("message");

const updatedElement =
    document.getElementById("updated");


async function getGoldData() {

    try {

        // ==========================================
        // M15 PODACI
        // ==========================================

        const m15Response = await fetch(
            "https://biquote.io/api/XAUUSD/ohlc?interval=15m&limit=1000&fresh=" +
            Date.now()
        );


        if (!m15Response.ok) {

            throw new Error(
                "M15 API HTTP " +
                m15Response.status
            );
        }


        const m15Data =
            await m15Response.json();


        const m15Bars =
            m15Data.bars;


        if (
            !m15Bars ||
            m15Bars.length < 50
        ) {

            throw new Error(
                "Nema dovoljno M15 podataka."
            );
        }


        // ==========================================
        // TRENUTNA CENA
        // ==========================================

        const liveBar =
            m15Bars[0];


        const currentPrice =
            Number(liveBar.close);


        if (!currentPrice) {

            throw new Error(
                "Trenutna cena nije dostupna."
            );
        }


        priceElement.textContent =
            "$" +
            currentPrice.toFixed(2);


        // ==========================================
        // ZATVORENE M15 SVEĆE
        // ==========================================

        const m15Closed =
            m15Bars
                .filter(
                    bar => !bar.isOpen
                )
                .reverse();


        const m15Prices =
            m15Closed.map(
                bar =>
                    Number(bar.close)
            );


        if (
            m15Prices.length < 50
        ) {

            throw new Error(
                "Nema dovoljno zatvorenih M15 sveća."
            );
        }


        // ==========================================
        // H1 PODACI
        // ==========================================

        const h1Response = await fetch(
            "https://biquote.io/api/XAUUSD/ohlc?interval=1h&limit=500&fresh=" +
            Date.now()
        );


        if (!h1Response.ok) {

            throw new Error(
                "H1 API HTTP " +
                h1Response.status
            );
        }


        const h1Data =
            await h1Response.json();


        const h1Bars =
            h1Data.bars;


        if (
            !h1Bars ||
            h1Bars.length < 50
        ) {

            throw new Error(
                "Nema dovoljno H1 podataka."
            );
        }


        // ==========================================
        // ZATVORENE H1 SVEĆE
        // ==========================================

        const h1Closed =
            h1Bars
                .filter(
                    bar => !bar.isOpen
                )
                .reverse();


        const h1Prices =
            h1Closed.map(
                bar =>
                    Number(bar.close)
            );


        if (
            h1Prices.length < 50
        ) {

            throw new Error(
                "Nema dovoljno zatvorenih H1 sveća."
            );
        }


        // ==========================================
        // M15 INDIKATORI
        // ==========================================

        const ema20 =
            calculateEMA(
                m15Prices,
                20
            );


        const ema50 =
            calculateEMA(
                m15Prices,
                50
            );


        // EMA200 samo ako imamo dovoljno podataka
        const ema200 =
            m15Prices.length >= 200
                ? calculateEMA(
                    m15Prices,
                    200
                )
                : null;


        const rsi =
            calculateRSI(
                m15Prices,
                14
            );


        const macd =
            calculateMACD(
                m15Prices
            );


        const oldPrice =
            m15Prices[
                Math.max(
                    0,
                    m15Prices.length - 5
                )
            ];


        const momentum =
            (
                (currentPrice - oldPrice) /
                oldPrice
            ) * 100;


        // ==========================================
        // H1 INDIKATORI
        // ==========================================

        const h1Ema50 =
            calculateEMA(
                h1Prices,
                50
            );


        const h1Ema200 =
            h1Prices.length >= 200
                ? calculateEMA(
                    h1Prices,
                    200
                )
                : null;


        const h1Rsi =
            calculateRSI(
                h1Prices,
                14
            );


        const h1Macd =
            calculateMACD(
                h1Prices
            );


        // ==========================================
        // MARKET STRUCTURE
        // ==========================================

        const recentBars =
            m15Closed.slice(-20);


        const recentHigh =
            Math.max(
                ...recentBars.map(
                    bar =>
                        Number(bar.high)
                )
            );


        const recentLow =
            Math.min(
                ...recentBars.map(
                    bar =>
                        Number(bar.low)
                )
            );


        let structure =
            "🟡 RANGE";


        const resistanceDistance =
            (
                (recentHigh - currentPrice) /
                currentPrice
            ) * 100;


        const supportDistance =
            (
                (currentPrice - recentLow) /
                currentPrice
            ) * 100;


        if (
            resistanceDistance < 0.15
        ) {

            structure =
                "🟠 NEAR RESISTANCE";

        } else if (
            supportDistance < 0.15
        ) {

            structure =
                "🔵 NEAR SUPPORT";
        }


        // ==========================================
        // M15 SCORE
        // ==========================================

        let m15Score =
            50;


        // EMA20 / EMA50

        if (
            ema20 > ema50
        ) {

            m15Score += 10;

        } else {

            m15Score -= 10;
        }


        // EMA50 / EMA200

        if (
            ema200 !== null
        ) {

            if (
                ema50 > ema200
            ) {

                m15Score += 15;

            } else {

                m15Score -= 15;
            }


            // Cena vs EMA200

            if (
                currentPrice > ema200
            ) {

                m15Score += 10;

            } else {

                m15Score -= 10;
            }
        }


        // RSI

        if (
            rsi > 50 &&
            rsi < 70
        ) {

            m15Score += 10;

        } else if (
            rsi < 50 &&
            rsi > 30
        ) {

            m15Score -= 10;
        }


        // MACD

        if (
            macd.histogram > 0
        ) {

            m15Score += 10;

        } else {

            m15Score -= 10;
        }


        // MOMENTUM

        if (
            momentum > 0
        ) {

            m15Score += 5;

        } else {

            m15Score -= 5;
        }


        // ==========================================
        // SCORE 0-100
        // ==========================================

        m15Score =
            Math.max(
                0,
                Math.min(
                    100,
                    m15Score
                )
            );


        // ==========================================
        // H1 TREND
        // ==========================================

        let h1Bullish =
            false;

        let h1Bearish =
            false;


        if (
            h1Ema200 !== null
        ) {

            if (
                h1Ema50 > h1Ema200 &&
                h1Macd.histogram > 0
            ) {

                h1Bullish =
                    true;

            } else if (
                h1Ema50 < h1Ema200 &&
                h1Macd.histogram < 0
            ) {

                h1Bearish =
                    true;
            }

        } else {

            // Ako nema dovoljno H1 istorije,
            // koristimo EMA50 + MACD.

            if (
                h1Macd.histogram > 0
            ) {

                h1Bullish =
                    true;

            } else if (
                h1Macd.histogram < 0
            ) {

                h1Bearish =
                    true;
            }
        }


        // ==========================================
        // FINAL SIGNAL
        // ==========================================

        let finalSignal =
            "⚪ NO TRADE";


        let confidence =
            50;


        // M15 BULLISH + H1 BULLISH

        if (
            m15Score >= 70 &&
            h1Bullish
        ) {

            finalSignal =
                "🟢 BUY";

            confidence =
                Math.min(
                    95,
                    m15Score + 10
                );
        }


        // M15 BEARISH + H1 BEARISH

        else if (
            m15Score <= 30 &&
            h1Bearish
        ) {

            finalSignal =
                "🔴 SELL";

            confidence =
                Math.min(
                    95,
                    (100 - m15Score) + 10
                );
        }


        // M15 BUY / H1 NIJE POTVRDIO

        else if (
            m15Score >= 70
        ) {

            finalSignal =
                "🟡 BUY — WAIT";

            confidence =
                m15Score;
        }


        // M15 SELL / H1 NIJE POTVRDIO

        else if (
            m15Score <= 30
        ) {

            finalSignal =
                "🟡 SELL — WAIT";

            confidence =
                100 - m15Score;
        }


        // ==========================================
        // RSI ZAŠTITA
        // ==========================================

        if (
            rsi < 30 &&
            (
                finalSignal ===
                "🔴 SELL" ||
                finalSignal ===
                "🟡 SELL — WAIT"
            )
        ) {

            finalSignal =
                "🟡 SELL — WAIT";

            messageElement.textContent =
                "Bearish trend, ali RSI je oversold.";
        }


        if (
            rsi > 70 &&
            (
                finalSignal ===
                "🟢 BUY" ||
                finalSignal ===
                "🟡 BUY — WAIT"
            )
        ) {

            finalSignal =
                "🟡 BUY — WAIT";

            messageElement.textContent =
                "Bullish trend, ali RSI je overbought.";
        }


        // ==========================================
        // TREND
        // ==========================================

        let trend =
            "🟡 NEUTRAL";


        if (
            ema200 !== null
        ) {

            if (
                ema20 > ema50 &&
                ema50 > ema200
            ) {

                trend =
                    "🟢 BULLISH";

            } else if (
                ema20 < ema50 &&
                ema50 < ema200
            ) {

                trend =
                    "🔴 BEARISH";
            }

        } else {

            if (
                ema20 > ema50
            ) {

                trend =
                    "🟢 BULLISH";

            } else if (
                ema20 < ema50
            ) {

                trend =
                    "🔴 BEARISH";
            }
        }


        // ==========================================
        // PRIKAZ
        // ==========================================

        trendElement.textContent =
            trend;


        signalElement.textContent =
            finalSignal;


        scoreElement.textContent =
            "Confidence: " +
            confidence +
            "%";


        rsiElement.textContent =
            rsi.toFixed(1);


        ema20Element.textContent =
            "$" +
            ema20.toFixed(2);


        ema50Element.textContent =
            "$" +
            ema50.toFixed(2);


        if (
            ema200 !== null
        ) {

            ema200Element.textContent =
                "$" +
                ema200.toFixed(2);

        } else {

            ema200Element.textContent =
                "N/A";
        }


        macdElement.textContent =
            macd.histogram >= 0
                ? "🟢 BULLISH"
                : "🔴 BEARISH";


        momentumElement.textContent =
            (
                momentum >= 0
                    ? "+"
                    : ""
            ) +
            momentum.toFixed(3) +
            "%";


        structureElement.textContent =
            structure;


        h1TrendElement.textContent =
            h1Bullish
                ? "🟢 BULLISH"
                : h1Bearish
                    ? "🔴 BEARISH"
                    : "🟡 NEUTRAL";


        h1RsiElement.textContent =
            h1Rsi.toFixed(1);


        h1MacdElement.textContent =
            h1Macd.histogram >= 0
                ? "🟢 BULLISH"
                : "🔴 BEARISH";


        // ==========================================
        // PORUKA
        // ==========================================

        if (
            rsi >= 30 &&
            rsi <= 70
        ) {

            if (
                finalSignal ===
                "🟢 BUY"
            ) {

                messageElement.textContent =
                    "M15 bullish + H1 potvrđuje smer.";

            } else if (
                finalSignal ===
                "🔴 SELL"
            ) {

                messageElement.textContent =
                    "M15 bearish + H1 potvrđuje smer.";

            } else if (
                finalSignal ===
                "🟡 BUY — WAIT"
            ) {

                messageElement.textContent =
                    "M15 bullish, ali H1 nije dovoljno jak.";

            } else if (
                finalSignal ===
                "🟡 SELL — WAIT"
            ) {

                messageElement.textContent =
                    "M15 bearish, ali H1 nije dovoljno jak.";

            } else {

                messageElement.textContent =
                    "Uslovi nisu dovoljno jaki za ulazak.";
            }
        }


        updatedElement.textContent =
            new Date().toLocaleTimeString(
                "sr-Latn-RS"
            );
    }


    catch (error) {

        console.error(
            "GOLD ANALYZER ERROR:",
            error
        );


        messageElement.textContent =
            "Greška: " +
            error.message;
    }
}



function calculateEMA(
    prices,
    period
) {

    const multiplier =
        2 /
        (period + 1);


    let ema =
        prices[0];


    for (
        let i = 1;
        i < prices.length;
        i++
    ) {

        ema =
            (
                prices[i] - ema
            ) *
            multiplier +
            ema;
    }


    return ema;
}



function calculateRSI(
    prices,
    period
) {

    let gains =
        0;

    let losses =
        0;


    for (
        let i =
            prices.length - period;

        i <
            prices.length;

        i++
    ) {

        const change =
            prices[i] -
            prices[i - 1];


        if (
            change > 0
        ) {

            gains +=
                change;

        } else {

            losses -=
                change;
        }
    }


    const averageGain =
        gains /
        period;


    const averageLoss =
        losses /
        period;


    if (
        averageLoss === 0
    ) {

        return 100;
    }


    const rs =
        averageGain /
        averageLoss;


    return 100 -
        (
            100 /
            (1 + rs)
        );
}



function calculateMACD(
    prices
) {

    const ema12 =
        calculateEMA(
            prices,
            12
        );


    const ema26 =
        calculateEMA(
            prices,
            26
        );


    const macdLine =
        ema12 -
        ema26;


    const macdHistory =
        [];


    for (
        let i = 26;
        i < prices.length;
        i++
    ) {

        const ema12Part =
            calculateEMA(
                prices.slice(
                    0,
                    i + 1
                ),
                12
            );


        const ema26Part =
            calculateEMA(
                prices.slice(
                    0,
                    i + 1
                ),
                26
            );


        macdHistory.push(
            ema12Part -
            ema26Part
        );
    }


    const signalLine =
        calculateEMA(
            macdHistory,
            9
        );


    return {

        line:
            macdLine,

        signal:
            signalLine,

        histogram:
            macdLine -
            signalLine
    };
}



getGoldData();


setInterval(
    getGoldData,
    60000
);
