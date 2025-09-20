import express from "express";
import cors from "cors";

import routes from "./routes/authroutes.js";
import { createUsersTable } from "./models/usermodel.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

const PORT = 5000;
app.listen(PORT, () => {
  createUsersTable();
  console.log(`Server is running on port http://localhost:${PORT}`);
});
