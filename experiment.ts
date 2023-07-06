import {  StargateClient } from "@cosmjs/stargate"

const rpc = "https://rpc.sentry-01.theta-testnet.polypore.xyz"

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())
}

runAll()