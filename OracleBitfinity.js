import * as ethers from "ethers";
import {
    mockAggregatorAbi,
} from "./abis/abi.js";

const apiUrl = 'https://api.geckoterminal.com/api/v2/simple/networks/eth/token_price/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
class PriceOracle {
    harvester_private_key;
    constructor(_harvester_private_key) {
        this.harvester_private_key = _harvester_private_key;
    }

    async setPrice() {
        let response = await fetch(apiUrl);
        let price = await response.json();
        const priceBtc = price.data.attributes.token_prices["0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"];
        // console.log(priceBtc);
        // const priceDeci = await ethers.parseEther(priceBtc);
        const priceDeci = Math.round(parseFloat(priceBtc) * 1e8);
        // console.log(priceDeci.toString());
        const rpcUrl = "https://testnet.bitfinity.network";
        // const rpcUrl = "http://127.0.0.1:8545/";
        const contractAddress = "0x5FB4E66C918f155a42d4551e871AD3b70c52275d";
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(this.harvester_private_key, provider);
        const OracleContract = new ethers.Contract(contractAddress, mockAggregatorAbi, signer);
        // let currentPrice=await OracleContract.latestRoundData();
        // console.log("current price",currentPrice.answer);
        const gasCost = await OracleContract.setLatestAnswer.estimateGas(
            priceDeci
        );
        const txResponse = await OracleContract.setLatestAnswer(
            priceDeci,
            {
                gasLimit: gasCost
            }
        );
        const txReceipt = await txResponse.wait();
        console.log(
            `Actual gas spent of the current transaction: ${Number(
                txReceipt.gasUsed
            )}`
        );
        // currentPrice=await OracleContract.latestRoundData();
        // console.log("new price",currentPrice.answer);
    }
}
export { PriceOracle };