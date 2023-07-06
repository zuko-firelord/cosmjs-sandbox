import { readFile } from "fs/promises"
import { IndexedTx, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"

const rpc = "https://rpc.sentry-01.theta-testnet.polypore.xyz"

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    const mnemonic = "force rate police inherit soul father coral orphan guitar tongue limb fan report fine seek what luxury tone zebra panic two shock debate enemy"
    //const mnemonic = readFile("./testnet.alice.mnemonic.key").toString()
    console.log(mnemonic)
    return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: "cosmos",
    })
}


const runAll = async (): Promise<void> => {
    const client = await StargateClient.connect(rpc)
    console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())
    console.log(
          "Alice balances:",
          await client.getAllBalances("cosmos1r59m98n76d8ptrh03vwsqcfd4kmt97p3hx4tx3"), // <-- replace with your generated address
      )
       const faucetTx: IndexedTx = (await client.getTx(
            "7D0EBD7D3325FA2DCA65BC0EC787681044F355E1B9BF5BBA916889564498F578",
      ))!
      console.log("Faucet Tx:", faucetTx)
      const decodedTx: Tx = Tx.decode(faucetTx.tx)
      console.log("DecodedTx:", decodedTx)
      console.log("Decoded messages:", decodedTx.body!.messages)
      const sendMessage: MsgSend = MsgSend.decode(decodedTx.body!.messages[0].value)
      console.log("Sent message:", sendMessage)
      const faucet: string = sendMessage.fromAddress
      console.log("Faucet balances:", await client.getAllBalances(faucet))

          // Get the faucet address another way
    {
        const rawLog = JSON.parse(faucetTx.rawLog)
        console.log("Raw log:", JSON.stringify(rawLog, null, 4))
        const faucet: string = rawLog[0].events
            .find((eventEl: any) => eventEl.type === "coin_spent")
            .attributes.find((attribute: any) => attribute.key === "spender").value
        console.log("Faucet address from raw log:", faucet)
    }

    const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
    const alice = (await aliceSigner.getAccounts())[0].address
    console.log("Alice's address from signer", alice)
    const signingClient = await SigningStargateClient.connectWithSigner(rpc, aliceSigner)
    console.log(
        "With signing client, chain id:",
        await signingClient.getChainId(),
        ", height:",
        await signingClient.getHeight()
    )
    console.log("Gas fee:", decodedTx.authInfo!.fee!.amount)
    console.log("Gas limit:", decodedTx.authInfo!.fee!.gasLimit.toString(10))

    // Check the balance of Alice and the Faucet
    console.log("Alice balance before:", await client.getAllBalances(alice))
    console.log("Faucet balance before:", await client.getAllBalances(faucet))
    // Execute the sendTokens Tx and store the result
    const result = await signingClient.sendTokens(alice, faucet, [{ denom: "uatom", amount: "100000" }], {
        amount: [{ denom: "uatom", amount: "500" }],
        gas: "200000",
    })
    // Output the result of the Tx
    console.log("Transfer result:", result)
    console.log("Alice balance after:", await client.getAllBalances(alice))
    console.log("Faucet balance after:", await client.getAllBalances(faucet))

}
runAll()