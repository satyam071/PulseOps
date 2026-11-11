const express = require("express");
const app = express();
const cookie = require("cookie-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes   = require("./routes/auth.route")
const userRoutes =require("./routes/user.route")
const repoRoutes = require("./routes/repos.route")


app.use(
  cors({
    origin: "https://localhost:5173/",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth",authRoutes);
app.use("/api",userRoutes);
app.use("/api",repoRoutes);


module.exports = app;