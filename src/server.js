import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import routes from "./routes/authroutes.js";
import { createUsersTable } from "./models/usermodel.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(routes);

app.get("/", (req, res) => {
  console.log(req.cookies);
});

app.get("/verify-token", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ valid: false, message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, "secret-key");
    return res.json({ valid: true, user: decoded.user });
  } catch (err) {
    return res
      .status(401)
      .json({ valid: false, message: "Invalid or expired token" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  createUsersTable();
  console.log(`Server is running on port http://localhost:${PORT}`);
});
