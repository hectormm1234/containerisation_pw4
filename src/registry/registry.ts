import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  let getNodeRegistryBody: GetNodeRegistryBody = {nodes: []};

  _registry.get("/status", (req, res) => {res.send("live");});


  _registry.post("/registerNode", (req: Request<RegisterNodeBody>, res: Response) => {
    const { nodeId, pubKey } = req.body;
    getNodeRegistryBody.nodes.push({ nodeId, pubKey });
    res.status(200).json({ message: "Node registered OK" });
  });

  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.status(200).json(getNodeRegistryBody);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
