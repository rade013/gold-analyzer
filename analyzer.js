const priceElement = document.getElementById("price");
const trendElement = document.getElementById("trend");
const signalElement = document.getElementById("signal");
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");

async function getGoldPrice() {

    try {

        const response = await fetch(
            "https://api.xaus.com/v1/spot"
        );

        const data = await response.json();

        const price = data.price;

        priceElement.textContent =
            "$" + Number(price).toFixed(2);

        analyzeGold(price);

    } catch (error) {

        priceElement.textContent =
            "Greška";

        messageElement.textContent =
            "Ne mogu da preuzmem cenu zlata.";

        console.error(error);
    }
}


function analyzeGold(price) {

    /*
       ZA SADA SAMO TESTIRAMO
       DA LI DOBIJAMO CENU.
    */

    let score = 50;

    let trend = "NEUTRAL";

    let signal = "NO TRADE";

    if (score >= 70) {

        trend = "BULLISH";
        signal = "BUY";

    } else if (score <= 30) {

        trend = "BEARISH";
        signal = "SELL";
    }

    trendElement.textContent = trend;
    signalElement.textContent = signal;
    scoreElement.textContent = score + " / 100";

    messageElement.textContent =
        "Gold Analyzer radi...";
}


getGoldPrice();


setInterval(
    getGoldPrice,
    60000
);
