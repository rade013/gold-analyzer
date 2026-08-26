const priceElement = document.getElementById("price");
const trendElement = document.getElementById("trend");
const signalElement = document.getElementById("signal");
const scoreElement = document.getElementById("score");
const rsiElement = document.getElementById("rsi");
const ema20Element = document.getElementById("ema20");
const ema50Element = document.getElementById("ema50");
const momentumElement = document.getElementById("momentum");
const messageElement = document.getElementById("message");
const updatedElement = document.getElementById("updated");


async function getGoldData() {

    try {

        const response = await fetch(
            "https://biquote.io/api/XAUUSD/ohlc?interval=1h&limit=200&fresh=" +
            Date.now()
        );

        if (!response.ok) {

            throw new Error(
                "API HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        const bars =
            data.bars;


        if (!bars || bars.length < 50) {

            throw new Error(
                "Nema dovoljno podataka."
            );
        }


        // TRENUTNA CENA
        // Prva sveća je najnovija.
        // Ako je otvorena, njen close
        // predstavlja trenutnu cenu.

        const currentBar =
            bars[0];


        const currentPrice =
            Number(currentBar.close);


        if (!currentPrice) {

            throw new Error(
                "Trenutna cena nije dostupna."
            );
        }


        // ZATVORENE SVEĆE ZA ANALIZU

        const closedBars =
            bars
                .filter(
                    bar => !bar.isOpen
                )
                .reverse();


        const prices =
            closedBars.map(
                bar => Number(bar.close)
            );


        if (prices.length < 50) {

            throw new Error(
                "Nema dovoljno zatvorenih sveća."
            );
        }


        // PRIKAZ CENE

        priceElement.textContent =
            "$" +
            currentPrice.toFixed(2);


        // ANALIZA

        analyze(
            prices,
            currentPrice
        );


        updatedElement.textContent =
            new Date().toLocaleTimeString(
                "sr-Latn-RS"
            );


    } catch (error) {

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
        2 / (period + 1);


    let ema =
        prices[0];


    for (
        let i = 1;
        i < prices.length;
        i++
    ) {

        ema =
            (prices[i] - ema) *
            multiplier +
            ema;
    }


    return ema;
}



function calculateRSI(
    prices,
    period = 14
) {

    let gains = 0;
    let losses = 0;


    for (
        let i = prices.length - period;
        i < prices.length;
        i++
    ) {

        const change =
            prices[i] -
            prices[i - 1];


        if (change > 0) {

            gains += change;

        } else {

            losses -= change;
        }
    }


    const averageGain =
        gains / period;


    const averageLoss =
        losses / period;


    if (averageLoss === 0) {

        return 100;
    }


    const rs =
        averageGain /
        averageLoss;


    return 100 -
        (100 / (1 + rs));
}



function analyze(
    prices,
    currentPrice
) {

    const ema20 =
        calculateEMA(
            prices,
            20
        );


    const ema50 =
        calculateEMA(
            prices,
            50
        );


    const rsi =
        calculateRSI(
            prices
        );


    const oldPrice =
        prices[
            prices.length - 10
        ];


    const momentum =
        (
            (currentPrice - oldPrice) /
            oldPrice
        ) * 100;


    let score = 50;


    // EMA TREND

    if (
        ema20 > ema50
    ) {

        score += 20;

    } else {

        score -= 20;
    }


    // CENA VS EMA20

    if (
        currentPrice > ema20
    ) {

        score += 10;

    } else {

        score -= 10;
    }


    // RSI

    if (
        rsi > 55 &&
        rsi < 70
    ) {

        score += 15;
    }


    if (
        rsi < 45 &&
        rsi > 30
    ) {

        score -= 15;
    }


    // MOMENTUM

    if (
        momentum > 0
    ) {

        score += 10;

    } else {

        score -= 10;
    }


    // OGRANIČENJE

    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );


    let trend;
    let signal;


    if (
        score >= 70
    ) {

        trend =
            "🟢 BULLISH";

        signal =
            "🟢 BUY";

    } else if (
        score <= 30
    ) {

        trend =
            "🔴 BEARISH";

        signal =
            "🔴 SELL";

    } else {

        trend =
            "🟡 NEUTRAL";

        signal =
            "⚪ NO TRADE";
    }


    trendElement.textContent =
        trend;


    signalElement.textContent =
        signal;


    scoreElement.textContent =
        score +
        " / 100";


    rsiElement.textContent =
        rsi.toFixed(1);


    ema20Element.textContent =
        "$" +
        ema20.toFixed(2);


    ema50Element.textContent =
        "$" +
        ema50.toFixed(2);


    momentumElement.textContent =
        (
            momentum >= 0
                ? "+"
                : ""
        ) +
        momentum.toFixed(3) +
        "%";


    if (
        signal === "🟢 BUY"
    ) {

        messageElement.textContent =
            "Tržište pokazuje bullish uslove.";

    } else if (
        signal === "🔴 SELL"
    ) {

        messageElement.textContent =
            "Tržište pokazuje bearish uslove.";

    } else {

        messageElement.textContent =
            "Uslovi nisu dovoljno jasni za ulazak.";
    }
}



getGoldData();


setInterval(
    getGoldData,
    60000
);
