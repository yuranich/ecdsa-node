import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1"
import { keccak256 } from "ethereum-cryptography/keccak"
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils"

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const msg = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
    }
    const messageHash = keccak256(utf8ToBytes(JSON.stringify(msg)))
    const sign = await secp.sign(messageHash, privateKey, { 'recovered': true })
    console.log(sign)

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        ...msg,
        'signature': [ toHex(sign[0]), sign[1] ]
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
