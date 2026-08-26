const priceElement=document.getElementById("price");
const trendElement=document.getElementById("trend");
const signalElement=document.getElementById("signal");
const scoreElement=document.getElementById("score");
const messageElement=document.getElementById("message");

async function getGoldPrice(){
  try{
    const r=await fetch("https://xaus.com/api/v1/spot?compact=1");
    if(!r.ok) throw new Error("HTTP "+r.status);

    const data=await r.json();
    const price=data.spot_usd_oz;

    priceElement.textContent="$"+Number(price).toFixed(2);
    trendElement.textContent="NEUTRAL";
    signalElement.textContent="NO TRADE";
    scoreElement.textContent="50 / 100";
    messageElement.textContent="API povezan ✔";

  }catch(err){
    priceElement.textContent="Greška";
    messageElement.textContent=err.message;
    console.error(err);
  }
}

getGoldPrice();
