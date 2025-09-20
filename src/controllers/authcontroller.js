import { generateToken } from "../helpers/generatetoken.js";
import { createUser, ifEmailExists } from "../models/usermodel.js";
import bcrypt from "bcryptjs";

export const login = async (req, res) => {
  const { email, password } = req.body;
  let errors = [];

  if (!email) errors.push({ field: "email", message: "Email is required" });
  if (!password)
    errors.push({ field: "password", message: "Password is required" });

  if (errors.length > 0) return res.status(400).json(errors);

  const isUserExist = await ifEmailExists(email);

  if (!isUserExist)
    return res.status(400).json({ message: "Email not registered" });

  const isPasswordCorrect = await bcrypt.compare(
    password,
    isUserExist.password
  );
  console.log(isPasswordCorrect);
  if (!isPasswordCorrect)
    return res.status(400).json({ message: "Incorrect password" });

  const token = await generateToken(isUserExist);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({ user: isUserExist });
};

export const register = async (req, res) => {
  const { firstname, middlename, lastname, email, password } = req.body;
  let errors = [];

  if (!firstname)
    errors.push({ field: "firstname", message: "First name is required" });
  if (!lastname)
    errors.push({ field: "lastname", message: "Last name is required" });

  if (!middlename)
    errors.push({ field: "middlename", message: "Middle name is required" });

  if (!email) errors.push({ field: "email", message: "Email is required" });
  if (!password)
    errors.push({ field: "password", message: "Password is required" });

  if (errors.length > 0) return res.status(400).json(errors);

  console.log(req.body);

  const isEmailExist = await ifEmailExists(email);

  if (isEmailExist)
    return res.status(400).json({ message: "Email already registered" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    await createUser(firstname, middlename, lastname, email, hashedPassword);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    message: "User has been created successfully.",
  });
};

export const changepassword = async (req, res) => {};

export const logout = async (req, res) => {};
