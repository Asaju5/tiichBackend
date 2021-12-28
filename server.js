import express from "express";
import cors from "cors";
import { readdirSync } from "fs";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import uploader from "express-fileupload";
const morgan = require("morgan");
require("dotenv").config();

//express
const app = express();

const csrfProtection = csrf({ cookie: true });

//db
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB CONNECTED"))
  .catch((err) => console.log("DB CONNECTION ERR", err));

//middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(uploader());
app.use(morgan("dev"));

readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

//csrf
app.use(csrfProtection);
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
