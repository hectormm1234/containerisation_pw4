import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT,REGISTRY_PORT } from "../config";

import { generateKeyPairSync } from 'crypto';

function generateKeys() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  
  return { publicKey, privateKey };
}


export async function simpleOnionRouter(nodeId: number) {

  const { publicKey, privateKey } = generateKeys();
  const publicKeyBase64 = Buffer.from(publicKey).toString('base64');
  const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
  let nodePrivateKey: string | null = privateKeyBase64;

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
