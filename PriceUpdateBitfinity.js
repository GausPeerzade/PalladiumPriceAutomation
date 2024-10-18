import { PriceOracle } from "./OracleBitfinity.js";
(function () {
    return moment().tz("Asia/Kolkata").format() + " ";
});
import moment from "moment";
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

import * as dotenv from "dotenv";
dotenv.config();
async function autoCompound() {
    // const timeOut = 5000;  
    const timeOut = 900000;

    //fetch secret
    let harvester_private_key;
    if (!process.env.HARVESTER_PRIVATE_KEY) {
        harvester_private_key = await getHarvestorKey("mainnet");
    } else {
        harvester_private_key = process.env.HARVESTER_PRIVATE_KEY;
    }

    const BtcOracle = new PriceOracle(harvester_private_key);
    let locked = false;
    while (true) {
        await new Promise((resolve) => setTimeout(resolve, timeOut));
        if (!locked) {
            locked = true;
            console.log(`Entering if block, locked: ${locked}`);
            BtcOracle.setPrice().then((nothing) => {
                locked = false;
                console.log(`Unlocking harvest, locked: ${locked}`);
                console.log("Price Updated");
            });
        }
    }
}

async function getHarvestorKey(net) {
    const secret_name = `privatekey_${net}`;

    const client = new SecretsManagerClient({
        region: "us-east-1",
    });

    let response;

    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }

    const secret = JSON.parse(response.SecretString);
    return secret[secret_name];
}

autoCompound();