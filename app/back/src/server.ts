import express, { Request, Response } from "express";
import route from "./routes/route";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const router = express.Router();
router.use("/", route);
app.use(router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
