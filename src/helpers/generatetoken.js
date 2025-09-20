import jwt from "jsonwebtoken";

export async function generateToken(user) {
  return jwt.sign({ user }, "secret-key", { expiresIn: "1h" });
}
