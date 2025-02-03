import * as ethers from "ethers";
import {
    mockAggregatorAbi,
} from "./abis/abi.js";

class PriceOracle {
    harvester_private_key;
    constructor(_harvester_private_key) {
        this.harvester_private_key = _harvester_private_key;
    }

    async setPrice() {
        const ethProvider = new ethers.JsonRpcProvider("https://arbitrum.llamarpc.com");
        // Connect to Chainlink BTC/USD Price Feed on Arbitrum
        const chainlinkBtcUsd = new ethers.Contract(
            "0x6ce185860a4963106506C203335A2910413708e9",
            mockAggregatorAbi,
            ethProvider
        );

        const [, answer] = await chainlinkBtcUsd.latestRoundData();
        const priceDeci = answer;
        // console.log(priceDeci.toString());

        // const rpcUrl = "https://rpc.ankr.com/botanix_testnet";
        const rpcUrl = "https://node.botanixlabs.dev";
        // const rpcUrl = "http://127.0.0.1:8545/";
        const contractAddress = "0xc014933c805825D335e23Ef12eB92d2471D41DA7";
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(this.harvester_private_key, provider);
        const OracleContract = new ethers.Contract(contractAddress, mockAggregatorAbi, signer);
        const txResponse = await OracleContract.setLatestAnswer(
            priceDeci
            ,
            {
                maxFeePerGas:100,
                maxPriorityFeePerGas:100,
            }
        );
        const txReceipt = await txResponse.wait();
        // console.log(
        //     `Gas price used: ${Number(
        //         txReceipt.gasPrice
        //     )}`
        // );
        // // console.log(
        // //     `Actual gas spent of the current transaction: ${Number(
        // //         txReceipt.gasUsed
        // //     )}`
        // // );
    }
}
export { PriceOracle };