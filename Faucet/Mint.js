import * as ethers from "ethers";
import {
    wBTCAbi
} from "./abis/abi.js";

class Mint {
    harvester_private_key;
    constructor(_harvester_private_key) {
        this.harvester_private_key = _harvester_private_key;
    }

    async refillFaucet() {
        const rpcUrl = "https://node.botanixlabs.dev";
        // const rpcUrl = "http://127.0.0.1:8545/";
        const wbtcAddress = "0x321f90864fb21cdcddD0D67FE5e4Cbc812eC9e64";
        const faucetAddress = "0x4721ec6d9409648b7f03503b3db4eFe2dE1C57c3";
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(this.harvester_private_key, provider);
        const WBTC = new ethers.Contract(wbtcAddress, wBTCAbi, signer);
        const faucetBalance = await WBTC.balanceOf(faucetAddress);
        const oneWBTC = ethers.parseUnits("1", 18);
        const tenWBTC = ethers.parseUnits("10", 18);
        //faucet balance in wei
        // console.log(`Faucet balance: ${faucetBalance}`);
        
        if (faucetBalance < oneWBTC) {
            // console.log("Faucet balance low, refilling...");
            const tx = await WBTC.mint(faucetAddress, tenWBTC, {
                maxFeePerGas: 7,
                maxPriorityFeePerGas: 7
            });
            const receipt = await tx.wait();
            console.log("Refilled faucet with 10 WBTC");
            // const faucetBalance = await WBTC.balanceOf(faucetAddress);
            // console.log(`Faucet balance: ${faucetBalance}`);
            // //gas price
            // console.log(`Gas price: ${receipt.gasPrice}`);
            // // console.log(`Transaction hash: ${receipt.hash}`);
        } else {
            console.log("Faucet balance sufficient");
        }
    }
}
export { Mint };