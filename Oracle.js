import * as ethers from "ethers";
import {
    priceOracleAbi,
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
        console.log(priceBtc);
        const priceDeci = await ethers.parseEther(priceBtc);
        console.log(priceDeci.toString());
        const rpcUrl = "https://node.botanixlabs.dev";
        const contractAddress = "0x5BCC7cf55D3ce55cF97E05776F8155b595D40a78";
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(this.harvester_private_key, provider);
        const OracleContract = new ethers.Contract(contractAddress, priceOracleAbi, signer);
        const gasCost = await OracleContract.setPrice.estimateGas(
            priceDeci
        );
        const txResponse = await OracleContract.setPrice(
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
    }
}
