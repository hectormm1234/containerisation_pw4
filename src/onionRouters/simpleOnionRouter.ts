import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT,REGISTRY_PORT } from "../config";
import {
  generateRsaKeyPair,
  exportPubKey,
  exportPrvKey
} from '../crypto';
import {Node} from "../registry/registry";


export async function simpleOnionRouter(nodeId: number) {

  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  /*
  const { publicKey, privateKey } = await generateRsaKeyPair();
  const publicKeyBase64 = await exportPubKey(publicKey);
  const privateKeyBase64 = await exportPrvKey(privateKey);*/

  let rsaKeyPair = await generateRsaKeyPair();
  let pubKey = await exportPubKey(rsaKeyPair.publicKey);
  let privateKey = rsaKeyPair.privateKey;

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

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
  onionRouter.get("/getPrivateKey", async (req, res) => {
    res.status(200).json({result: await exportPrvKey(privateKey)});
  });
 
  await fetch(`http://localhost:${REGISTRY_PORT}/registerNode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nodeId: nodeId,
      pubKey: pubKey,
    })
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(`Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
  });

  return server;
}
