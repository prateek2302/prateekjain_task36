require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET;
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const users = [];

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set to a random secret of at least 32 characters.");
}

app.use(express.json({ limit: "10kb" }));
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && frontendOrigin && origin !== frontendOrigin) {
    return res.status(403).json({ message: "This origin is not allowed to access the API." });
  }
  if (origin && (!frontendOrigin || origin === frontendOrigin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function validateCredentials(req, res, next) {
  const { username, password } = req.body || {};

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const normalizedUsername = username.trim();
  if (normalizedUsername.length < 3 || normalizedUsername.length > 24) {
    return res.status(400).json({ message: "Username must be between 3 and 24 characters." });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
    return res.status(400).json({ message: "Username can only use letters, numbers, and underscores." });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: "Password must be between 8 and 72 characters." });
  }

  req.credentials = { username: normalizedUsername, password };
  next();
}

function authenticateToken(req, res, next) {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization ? authorization.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "A valid bearer token is required." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid or has expired. Please log in again." });
  }
}

app.post("/register", validateCredentials, async (req, res, next) => {
  try {
    const { username, password } = req.credentials;
    const alreadyRegistered = users.some((user) => user.username.toLowerCase() === username.toLowerCase());

    if (alreadyRegistered) {
      return res.status(409).json({ message: "That username is already taken." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    users.push({ id: users.length + 1, username, passwordHash });

    return res.status(201).json({ message: "Account created. You can now log in." });
  } catch (error) {
    return next(error);
  }
});

app.post("/login", validateCredentials, async (req, res, next) => {
  try {
    const { username, password } = req.credentials;
    const user = users.find((entry) => entry.username.toLowerCase() === username.toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Incorrect username or password." });
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret, { expiresIn: "1h" });
    return res.json({
      token,
      expiresIn: 3600,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/protected", authenticateToken, (req, res) => {
  return res.json({
    message: `You're in, ${req.user.username}. This data is only available with a valid token.`,
    user: { id: req.user.sub, username: req.user.username },
    access: "authenticated"
  });
});

app.use((error, req, res, next) => {
  console.error("Request failed:", error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
});

app.listen(port, () => {
  console.log(`Authentication API listening on http://localhost:${port}`);
});
