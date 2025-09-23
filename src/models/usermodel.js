import dbConn from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateUUID } from "../helpers/generateUUID.js";

export const createUsersTable = async () => {
  try {
    const sql = `
        CREATE TABLE IF NOT EXISTS users(
            id VARCHAR(50) NOT NULL,
            username VARCHAR(100) NOT NULL,
            firstname VARCHAR(100) NOT NULL,
            middlename VARCHAR(100) NOT NULL,
            lastname VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            onboarding BOOLEAN DEFAULT TRUE,
            password VARCHAR(100) NOT NULL
        )
    `;

    await dbConn.query(sql);
  } catch (error) {
    console.log(error);
  }
};

export const createUser = async (email, password) => {
  try {
    const id = generateUUID();
    const user = await dbConn.query(
      `INSERT INTO users (id,email, password) VALUES (?,?,?)`,
      [id, email, password]
    );

    return user;
  } catch (error) {
    console.log(error);
  }
};

export const ifEmailExists = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await dbConn.query(`SELECT * FROM users WHERE email = ?`, [
    normalizedEmail,
  ]);

  return user[0];
};

export const updatePassword = async (new_password, user_id) => {
  const hashedpassword = await bcrypt.hash(new_password, 10);

  const user = await dbConn.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedpassword, user_id]
  );

  return user;
};

export const updateprofile = async (user_id, updates) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && value !== null) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new Error("No fields to update.");
  }

  values.push(user_id);

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  const result = await dbConn.query(sql, values);

  return result;
};

export const getUserById = async (user_id) => {
  try {
    const [user] = await dbConn.query(`SELECT * FROM users WHERE id = ?`, [
      user_id,
    ]);

    if (!user) return null;

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};
