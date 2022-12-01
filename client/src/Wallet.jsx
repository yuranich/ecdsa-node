import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1"
import { keccak256 } from "ethereum-cryptography/keccak"
import { toHex } from "ethereum-cryptography/utils"

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function onChange2(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const pubKey = secp.getPublicKey(privateKey)
    const addr = toHex(keccak256(pubKey.slice(1)).slice(-20))
    setAddress(addr)
    if (addr) {
      const {
        data: { balance },
      } = await server.get(`balance/${addr}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }


  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>
      <label>
        Private Key
        <input placeholder="Type a private key, for example: 0x1" value={privateKey} onChange={onChange2}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
