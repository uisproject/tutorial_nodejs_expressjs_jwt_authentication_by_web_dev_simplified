require("dotenv").config();

const express = require("express");
const server = express();

const jwt = require("jsonwebtoken");

server.use(express.json());

const posts = [
  {
    username: "Louis",
    title: "Hello World",
  },
  {
    username: "Jim",
    title: "Nice day ain't it?",
  },
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(req.headers);
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

server.get("/posts", authenticateToken, (req, res) => {
  res.json(req.user.name);
});

server.post("/login", (req, res) => {
  // auth user

  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET); // to make jwt
  res.status(200).json({ accessToken });
});

server.listen(5000, () => console.log("Listen to port 5000"));
