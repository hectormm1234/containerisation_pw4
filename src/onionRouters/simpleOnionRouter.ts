import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT,REGISTRY_PORT } from "../config";
import {
  generateRsaKeyPair,
  exportPubKey,
  exportPrvKey
} from '../crypto';

let lastReceivedEncryptedMessage: string | null = null;
let lastReceivedDecryptedMessage: string | null = null;
let lastMessageDestination: number | null = null;


export async function simpleOnionRouter(nodeId: number) {

  let { publicKey, privateKey } = await generateRsaKeyPair();
  let publicKeyBase64 = await exportPubKey(publicKey);
  let privateKeyBase64 = await exportPrvKey(privateKey);
  let nodePrivateKey = privateKey;


  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  onionRouter.get("/status", (req, res) => {res.send("live");});

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });
  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });
  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });
  onionRouter.get("/getPrivateKey", (req, res) => {
    res.json({ result: nodePrivateKey });
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  const body = JSON.stringify({
    nodeId: nodeId,
    pubKey: publicKeyBase64,
  });

  await fetch(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  return server;
}
