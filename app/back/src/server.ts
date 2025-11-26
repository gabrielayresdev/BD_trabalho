import express, { Request, Response } from "express";
import route from "./routes/route";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const router = express.Router();
router.use("/", route);
app.use(router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
