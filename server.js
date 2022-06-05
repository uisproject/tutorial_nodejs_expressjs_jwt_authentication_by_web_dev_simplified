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

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
};

let refreshTokens = [];

server.get("/posts", authenticateToken, (req, res) => {
  res.json(req.user.name);
});

server.post("/login", (req, res) => {
  // auth user

  const username = req.body.username;
  const user = { name: username };

  //   const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET); // to make jwt
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.status(200).json({ accessToken, refreshToken });
});

server.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  console.log(req.body);
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

server.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

server.listen(6000, () => console.log("Listen to port 6000"));
