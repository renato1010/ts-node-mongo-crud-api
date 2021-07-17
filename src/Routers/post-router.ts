import express, { NextFunction, Request, Response } from "express";
import { Document, Collection } from "mongodb";
import { connectToDatabase } from "../utils/mongo-conn";

const postRouter = express.Router();
let postsCollection: Collection<Document> | null = null;

const connect = async () => {
  // connect db
  const {
    collections: { posts },
  } = await connectToDatabase();
  postsCollection = posts;
};
postRouter.use(async (req: Request, res: Response, next: NextFunction) => {
  await connect();
  next();
});
postRouter.get("/", async (req: Request, res: Response) => {
  // get all the posts
  const posts = await postsCollection?.find({}).limit(20).toArray();
  // send posts through the wire
  res.status(200).json(posts);
});

postRouter.post("/", async (req: Request, res: Response) => {
  const newPost = await postsCollection?.insertOne(req.body);
  res.status(201).json(newPost);
});

export { postRouter };
