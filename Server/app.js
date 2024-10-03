import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./Routes/auth.route.js";
import userRouter from "./Routes/user.route.js";
import adminRouter from "./Routes/admin.route.js";
import checkoutRouter from "./Routes/checkout.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { stripeWebHook } from "./Controllers/checkout.controller.js";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// separate this route here to not use express.json()
app.post(
  "/api/checkout/s-webhook",
  express.raw({ type: "application/json" }),
  stripeWebHook
);

app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => res.send("<h1>Hello Server!</h1>"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/checkout", checkoutRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error!";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

mongoose
  .connect(process.env.CONNECTION_DB_STRING)
  .then(() => console.log("Server is connected to mongo!"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}...`);
});
