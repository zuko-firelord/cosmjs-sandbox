import { readFile } from "fs/promises"
import { fromHex } from "@cosmjs/encoding"
import { DirectSecp256k1Wallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate"

const rpc = "http://127.0.0.1:26657"

const getAliceSignerFromPriKey = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1Wallet.fromKey(
        fromHex((await readFile("./simd.alice.private.key")).toString()),
        "cosmos"
    )
}

const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())
    console.log(
        "Alice balances:",
        await client.getAllBalances("cosmos1t8rrl6g3dz0zc5njnck0ky8v363zfyx852vpex")
    )
    const faucet: string = "cosmos1fmuhll8a9e2fjjka9g3wp3th8zwfxn0qe3e4rt"

    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromPriKey()
    const alice = (await aliceSigner.getAccounts())[0].address
    console.log("Alice's address from signer", alice)
    const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
    console.log(
        "With signing client, chain id:",
        await signingClient.getChainId(),
        ", height:",
        await signingClient.getHeight()
    )

    console.log("Alice balance before:", await client.getAllBalances(alice))
    console.log("Faucet balance before:", await client.getAllBalances(faucet))
    const result = await signingClient.sendTokens(alice, faucet, [{ denom: "stake", amount: "100000" }], {
        amount: [{ denom: "stake", amount: "500" }],
        gas: "200000",
    })
    console.log("Transfer result:", result)
    console.log("Alice balance after:", await client.getAllBalances(alice))
    console.log("Faucet balance after:", await client.getAllBalances(faucet))
}

runAll()