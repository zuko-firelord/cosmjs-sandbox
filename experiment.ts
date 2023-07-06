import { IndexedTx, StargateClient } from "@cosmjs/stargate"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { Tx } from "cosmjs-types/cosmos/tx/v1beta1/tx"

const rpc = "https://rpc.sentry-01.theta-testnet.polypore.xyz"

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

}
runAll()