const express = require("express");
const app = express();
const cookie = require("cookie-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes   = require("./routes/auth.route")


app.use(
  cors({
    origin: "https://localhost:5173/",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth",authRoutes);


module.exports = app;