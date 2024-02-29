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

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  let nodes: GetNodeRegistryBody = {nodes: []};

  _registry.get("/status", (req, res) => {res.send("live");});

  // Check for duplicate nodeId before adding a new node
  _registry.post("/registerNode", (req: Request<RegisterNodeBody>, res: Response) => {
    const { nodeId, pubKey } = req.body;

    // Find if the node already exists based on nodeId
    const nodeExists = nodes.nodes.some(node => node.nodeId === nodeId);
    
    // If the node already exists, respond with an error; otherwise, add the new node
    if (nodeExists) {
      res.status(400).json({ message: "Node already registered" });
    } else {
      nodes.nodes.push({ nodeId, pubKey });
      res.status(200).json({ message: "Node registered successfully" });
    }
  });

  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.status(200).json(nodes);
  });

  return server;
}
