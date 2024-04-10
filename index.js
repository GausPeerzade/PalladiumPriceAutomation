import { Rebalancer } from "./Rebalancer.js";
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
  const riveraFactory = "0x30ef8344B72A2e75E03d4aC6D934C92A29177a7f"; //fusionx vault factory
  const rpcURL = "http://localhost:8545";
  // const timeOut = 28800000;
  const timeOut = 5000;
  let locked = false;

  //fetch secret
  let harvester_private_key;
  if (!process.env.HARVESTER_PRIVATE_KEY) {
    harvester_private_key = await getHarvestorKey("mainnet");
  } else {
    harvester_private_key = process.env.HARVESTER_PRIVATE_KEY;
  }

  const rebalancer = new Rebalancer(
    rpcURL,
    riveraFactory,
    harvester_private_key
  );
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, timeOut));
    if (!locked) {
      locked = true;
      console.log(`Entering if block, locked: ${locked}`);
      rebalancer.rebalanceAllVaults().then((nothing) => {
        locked = false;
        console.log(`Unlocking harvest, locked: ${locked}`);
        console.log("Done One Harvesting Cycle.");
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
