import express, { Request, Response } from "express";
import { postRouter } from "./Routers";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.use("/posts", postRouter);

const port = process.env.SERVER_PORT;
if (!port) {
  throw new Error("No port available to bootstrap server");
}
app.listen(+port, () => {
  console.log(`Server running on at http://localhost:${port}`);
});
