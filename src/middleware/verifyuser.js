import jwt from "jsonwebtoken";

export const verifyTheUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(400).json({ message: "token invalid" });

  jwt.verify(token, "secret-key", (error, decoded) => {
    if (error) return res.status(400).json(error);

   
    req.user = decoded.user;
    next();
  });
};
