import { IndexedTx, StargateClient } from "@cosmjs/stargate"
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
    
}
runAll()