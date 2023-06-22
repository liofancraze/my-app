import { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import { transferFlow } from "./cadence/transactions/transfer_flow.tx";
import axios from "axios";

fcl.config({
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Endpoint set to Testnet
  "accessNode.api": "https://rest-testnet.onflow.org",
});

function App() {
  const [user, setUser] = useState({ loggedIn: null });
  useEffect(() => fcl.currentUser.subscribe(setUser), []);

  const sendTxn = async () => {
    let voucher = await fcl.serialize([
      fcl.transaction`
      ${transferFlow}
      `,
      fcl.args([
        fcl.arg("1.0", fcl.t.UFix64), // amount
        fcl.arg("0x31667ab314cabec0", fcl.t.Address), // to
      ]),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(9999),
    ]);

    console.log("-----------voucherString", voucher);
    voucher = JSON.parse(voucher);
    console.log("-----------voucherObject", voucher);

    let response = await axios.post(
      "http://localhost:8000/relayVoucher",
      voucher
    );

    console.log("------------response", response);
  };

  return (
    <div className="App">
      {user.loggedIn ? (
        <>
          <p>Connected to {user.addr}</p>

          <button onClick={() => fcl.unauthenticate()}>
            Disconnect your wallet
          </button>
          <button onClick={sendTxn}>Send Txn</button>
        </>
      ) : (
        <button onClick={fcl.authenticate}>Connect your wallet</button>
      )}
    </div>
  );
}

export default App;
