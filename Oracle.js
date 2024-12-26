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
        const priceDeci = Math.round(parseFloat(priceBtc) * 1e8);
        // console.log(priceDeci.toString());
        const rpcUrl = "https://node.botanixlabs.dev";
        // const rpcUrl = "http://127.0.0.1:8545/";
        const contractAddress = "0xc014933c805825D335e23Ef12eB92d2471D41DA7";
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(this.harvester_private_key, provider);
        const OracleContract = new ethers.Contract(contractAddress, mockAggregatorAbi, signer);
        const txResponse = await OracleContract.setLatestAnswer(
            priceDeci,
            {
                maxFeePerGas:10,
                maxPriorityFeePerGas:10,
            }
        );
        const txReceipt = await txResponse.wait();
        // console.log(
        //     `Gas price used: ${Number(
        //         txReceipt.gasPrice
        //     )}`
        // );
        // console.log(
        //     `Actual gas spent of the current transaction: ${Number(
        //         txReceipt.gasUsed
        //     )}`
        // );
    }
}
export { PriceOracle };