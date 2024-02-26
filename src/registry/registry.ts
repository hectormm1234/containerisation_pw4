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

  let nodes: Node[] = [];

  _registry.get("/status", (req, res) => {res.send("live");});

  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;
    const nodeExists = nodes.some(node => node.nodeId === nodeId);
    if (!nodeExists) {
      nodes.push({ nodeId, pubKey });
      res.status(200).send({ message: "Node registered successfully" });
    } else {
      res.status(400).send({ message: "Node already registered" });
    }
  });

  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    const response: GetNodeRegistryBody = {
      nodes: nodes
    };
    res.status(200).json(response);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
