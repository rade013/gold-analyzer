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
            "https://xaus.com/api/v1/intraday?symbol=xau&hours=24&fresh=" + Date.now()
        );

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        console.log("XAUS DATA:", data);

        if (!data.points || data.points.length < 50) {
            throw new Error(
                "API je vratio samo " +
                (data.points ? data.points.length : 0) +
                " podataka."
            );
        }

        const prices = data.points.map(point => Number(point.p));

        if (prices.some(isNaN)) {
            throw new Error("API je vratio neispravne cene.");
        }

        const currentPrice = prices[prices.length - 1];

        priceElement.textContent =
            "$" + currentPrice.toFixed(2);

        analyze(prices);

        updatedElement.textContent =
            new Date().toLocaleTimeString("sr-Latn-RS");

    } catch (error) {

        console.error("GOLD API ERROR:", error);

        messageElement.textContent =
            "Greška: " + error.message;
    }
}


function calculateEMA(prices, period) {

    const multiplier = 2 / (period + 1);

    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {

        ema =
            (prices[i] - ema) * multiplier + ema;
    }

    return ema;
}


function calculateRSI(prices, period = 14) {

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {

        const change = prices[i] - prices[i - 1];

        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }

    const averageGain = gains / period;
    const averageLoss = losses / period;

    if (averageLoss === 0) {
        return 100;
    }

    const rs = averageGain / averageLoss;

    return 100 - (100 / (1 + rs));
}


function analyze(prices) {

    const current = prices[prices.length - 1];

    const ema20 = calculateEMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);
    const rsi = calculateRSI(prices);

    const oldPrice =
        prices[Math.max(0, prices.length - 10)];

    const momentum =
        ((current - oldPrice) / oldPrice) * 100;

    let score = 50;


    if (ema20 > ema50) {
        score += 20;
    } else {
        score -= 20;
    }


    if (current > ema20) {
        score += 10;
    } else {
        score -= 10;
    }


    if (rsi > 55 && rsi < 70) {
        score += 15;
    }

    if (rsi < 45 && rsi > 30) {
        score -= 15;
    }


    if (momentum > 0) {
        score += 10;
    } else {
        score -= 10;
    }


    score =
        Math.max(0, Math.min(100, score));


    let trend;
    let signal;


    if (score >= 70) {

        trend = "🟢 BULLISH";
        signal = "🟢 BUY";

    } else if (score <= 30) {

        trend = "🔴 BEARISH";
        signal = "🔴 SELL";

    } else {

        trend = "🟡 NEUTRAL";
        signal = "⚪ NO TRADE";
    }


    trendElement.textContent = trend;
    signalElement.textContent = signal;
    scoreElement.textContent =
        score + " / 100";

    rsiElement.textContent =
        rsi.toFixed(1);

    ema20Element.textContent =
        "$" + ema20.toFixed(2);

    ema50Element.textContent =
        "$" + ema50.toFixed(2);

    momentumElement.textContent =
        (momentum >= 0 ? "+" : "") +
        momentum.toFixed(3) + "%";


    messageElement.textContent =
        signal === "🟢 BUY"
            ? "Tržište pokazuje bullish uslove."
            : signal === "🔴 SELL"
                ? "Tržište pokazuje bearish uslove."
                : "Uslovi nisu dovoljno jasni za ulazak.";
}


getGoldData();


setInterval(
    getGoldData,
    60000
);
