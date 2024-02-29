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

  let nodes: GetNodeRegistryBody = {nodes: []};

  _registry.get("/status", (req, res) => {res.send("live");});

  _registry.post("/registerNode", (req: Request<RegisterNodeBody>, res: Response) => {
    const { nodeId, pubKey } = req.body;
    nodes.nodes.push({ nodeId, pubKey });
    res.status(200).json({ message: "Node registered successfully" });
  });


  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.status(200).json(nodes);
  });


  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
