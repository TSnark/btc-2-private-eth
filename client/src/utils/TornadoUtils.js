import crypto from "crypto";
import { bigInt as _bigInt } from "snarkjs";
import { babyJub, pedersenHash as _pedersenHash } from "circomlib";

const bigInt = _bigInt;

/** Generate random number of specified byte length */
const rbigint = (nbytes) => _bigInt.leBuff2int(crypto.randomBytes(nbytes));

/** Compute pedersen hash */
const pedersenHash = (data) => babyJub.unpackPoint(_pedersenHash.hash(data))[0];

/** BigNumber to hex string of specified length */
function toHex(number, length = 32) {
  const str =
    number instanceof Buffer
      ? number.toString("hex")
      : bigInt(number).toString(16);
  return "0x" + str.padStart(length * 2, "0");
}

/**
 * Create deposit object from secret and nullifier
 */
function createDeposit({ nullifier, secret }) {
  const deposit = { nullifier, secret };
  deposit.preimage = Buffer.concat([
    deposit.nullifier.leInt2Buff(31),
    deposit.secret.leInt2Buff(31),
  ]);
  deposit.commitment = pedersenHash(deposit.preimage);
  deposit.nullifierHash = pedersenHash(deposit.nullifier.leInt2Buff(31));
  return deposit;
}

export async function deposit(web3, ethToRetrieve) {
  let netId = await web3.eth.net.getId();
  const decimalEth = ethToRetrieve / 1e18;
  const deposit = createDeposit({
    nullifier: rbigint(31),
    secret: rbigint(31),
  });
  const note = toHex(deposit.preimage, 62);
  const noteString = `tornado-eth-${decimalEth}-${netId}-${note}`;

  return { note: noteString, commitment: toHex(deposit.commitment) };
}
