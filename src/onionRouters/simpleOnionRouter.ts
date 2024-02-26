import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT,REGISTRY_PORT } from "../config";
import {
  generateRsaKeyPair,
  exportPubKey,
  exportPrvKey,
  importPrvKey,
  rsaEncrypt,
  rsaDecrypt,
} from '../crypto';


export async function simpleOnionRouter(nodeId: number) {

  const { publicKey, privateKey } = await generateRsaKeyPair();
  const publicKeyBase64 = await exportPubKey(publicKey);
  const privateKeyBase64 = await exportPrvKey(privateKey);
  let nodePrivateKey = privateKey;

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

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

  const body = JSON.stringify({
    nodeId: nodeId,
    pubKey: publicKeyBase64,
  });

  fetch(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error registering node:', error));


  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
