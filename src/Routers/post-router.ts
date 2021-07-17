import express, { NextFunction, Request, Response } from "express";
import { Document, Collection, FindOptions } from "mongodb";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../utils/mongo-conn";

const postRouter = express.Router();
let postsCollection: Collection<Document> | null = null;
const documentProjection: Document = { _id: 0, title: 1, author: 1 };

const connect = async () => {
  // connect db
  const {
    collections: { posts },
  } = await connectToDatabase();
  postsCollection = posts;
};
// set ready connection
postRouter.use(async (req: Request, res: Response, next: NextFunction) => {
  await connect();
  next();
});
// get all posts
postRouter.get("/", async (req: Request, res: Response) => {
  try {
    // get all the posts
    const posts = await postsCollection?.find({}).limit(20).toArray();
    // send posts through the wire
    res.status(200).json({ posts });
  } catch (error) {
    res.status(404).send("404: posts not found");
  }
});
// create a post
postRouter.post("/", async (req: Request, res: Response) => {
  try {
    const newPost = await postsCollection?.insertOne(req.body);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(404).send("400: Bad request, couldn't insert doc ");
  }
});
// find a post
postRouter.get("/:postId", async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const options: FindOptions = {
    // sort matched docs in descending order by title
    sort: { title: -1 },
    projection: documentProjection,
  };
  const newPost = await postsCollection?.findOne({ _id: new ObjectId(postId) }, options);
  if (!newPost) {
    res.status(404).send("404: Post not found");
  } else {
    res.status(200).json(newPost);
  }
});
// update a post
postRouter.put("/:postId", async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const changes = { ...req.body };
  try {
    const updated = await postsCollection?.findOneAndUpdate(
      { _id: new ObjectId(postId) },
      { $set: changes },
      { returnDocument: "after", projection: documentProjection }
    );
    if (!updated) {
      throw new Error("Couldn't update post");
    } else {
      const { ok, value } = updated;
      res.status(200).json({ ok: Boolean(ok), updatedPost: value });
    }
  } catch (error) {
    res.status(400).send("400: Bad request");
  }
});
// delete a post
postRouter.delete("/:postId", async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const deleted = await postsCollection?.findOneAndDelete(
    { _id: new ObjectId(postId) },
    { projection: documentProjection }
  );
  if (!deleted) {
    res.status(404).send("404: post not found");
  } else {
    const { ok, value } = deleted;
    res.status(200).json({ ok: Boolean(ok), deletedPost: value });
  }
});

export { postRouter };
