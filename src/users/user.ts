import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  _user.post("/message", (req: Request, res: Response) => {
    const body: SendMessageBody = req.body;
    if (userId === body.destinationUserId) { 
      lastReceivedMessage = body.message;
      res.status(200).json({ message: "Message received successfully" });
    } else {
      res.status(400).json({ message: "Incorrect user ID" });
    }
  });

  _user.get("/status", (req, res) => {res.send("live");});
  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: lastReceivedMessage });
  });
  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: lastSentMessage });
  });
  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
