const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "648319550c385b79dbc26091172bdf631b52ea88": 100,
  b2899d79dc415c8eb6d8528908f290d927c3df67: 50,
  "7ad778edfd8aa664421f6c76e31079c737a9af2c": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // get a signature from the client side app
  // recover the public address from the signature

  const { sender, recipient, amount, signature } = req.body;

  const msgHash = keccak256(
    utf8ToBytes(JSON.stringify({ sender, amount, recipient }))
  );
  const publicKey = secp.recoverPublicKey(msgHash, signature[0], signature[1]);
  console.log(toHex(publicKey));

  const addr = toHex(keccak256(publicKey.slice(1)).slice(-20));
  console.log(addr);

  if (addr.toString() !== recipient.toString()) {
    res.status(400).send({ message: "Wrong signature!!!" });
    return;
  } else {
    console.log("Signature verified!!!");
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
