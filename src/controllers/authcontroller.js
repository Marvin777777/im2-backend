import dbConn from "../config/db.js";
import { generateToken } from "../helpers/generatetoken.js";
import {
  createUser,
  getUserById,
  ifEmailExists,
  updatePassword,
  updateprofile,
} from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

  return res.status(200).json({ message: "Login success", user: isUserExist });
};

export const register = async (req, res) => {
  const { firstname, middlename, lastname, email, password } = req.body;
  let errors = [];

  // if (!firstname)
  //   errors.push({ field: "firstname", message: "First name is required" });
  // if (!lastname)
  //   errors.push({ field: "lastname", message: "Last name is required" });

  // if (!middlename)
  //   errors.push({ field: "middlename", message: "Middle name is required" });

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
    await createUser(email, hashedPassword);
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    message: "User has been created successfully.",
  });
};

export const changepassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  let errors = [];

  if (!old_password)
    errors.push({ path: "old_password", message: "Old password is required" });
  if (!new_password)
    errors.push({ path: "new_password", message: "New password is required" });

  if (errors.length > 0) return res.status(400).json(errors);

  try {
    const [user] = await dbConn.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    // const user = rows[0]; // ✅ fix: query returns array

    console.log(user);

    const isPasswordMatch = await bcrypt.compare(old_password, user.password);

    if (!isPasswordMatch)
      return res
        .status(400)
        .json({ path: "old_password", message: "Password do not match" });

    // 🔑 Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(new_password, salt);

    const update = await updatePassword(hashedNewPassword, req.user.id);

    if (update.affectedRows !== 1)
      return res.status(400).json({ message: "Failed to change password" });

    // 🔑 Get updated user
    const updatedUser = await getUserById(req.user.id);

    // 🔑 Create new JWT
    const token = jwt.sign({ user: updatedUser }, "secret-key", {
      expiresIn: "1h",
    });

    // 🔑 Send fresh token
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const onboarding = async (req, res) => {
  const userId = req.user.id; // comes from verifyTheUser middleware
  const { firstname, middlename, lastname, username } = req.body;

  let errors = [];
  if (!firstname)
    errors.push({ field: "firstname", message: "First name is required" });
  if (!lastname)
    errors.push({ field: "lastname", message: "Last name is required" });
  if (!username)
    errors.push({ field: "username", message: "Username is required" });

  if (errors.length > 0) return res.status(400).json(errors);

  try {
    const updates = {
      firstname,
      middlename,
      lastname,
      username,
      onboarding: 0,
    };

    await updateprofile(userId, updates);

    const updatedUser = await getUserById(userId);

    const token = jwt.sign({ user: updatedUser }, "secret-key", {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ message: "Onboarding completed successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to complete onboarding" });
  }
};

export const profilemanagement = async (req, res) => {
  const userId = req.user.id;
  const { firstname, middlename, lastname, email } = req.body;

  const updates = {
    ...(firstname && { firstname }),
    ...(middlename && { middlename }),
    ...(lastname && { lastname }),
    ...(email && { email }),
  };

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No fields provided for update." });
  }

  try {
    await updateprofile(userId, updates);

    // 🔑 Get updated user
    const updatedUser = await getUserById(userId);

    // 🔑 Sign new JWT with updated user data
    const token = jwt.sign({ user: updatedUser }, "secret-key", {
      expiresIn: "1h",
    });

    // 🔑 Send new cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in production with HTTPS
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");

  return res.json({ message: "logout success" });
};
