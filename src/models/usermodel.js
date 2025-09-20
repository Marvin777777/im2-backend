import dbConn from "../config/db.js";
import { generateUUID } from "../helpers/generateUUID.js";

export const createUsersTable = async () => {
  try {
    const sql = `
        CREATE TABLE IF NOT EXISTS users(
            id VARCHAR(50) NOT NULL,
            firstname VARCHAR(100) NOT NULL,
            middlename VARCHAR(100) NOT NULL,
            lastname VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL
        )
    `;

    await dbConn.query(sql);
  } catch (error) {
    console.log(error);
  }
};

export const createUser = async (
  firstname,
  middlename,
  lastname,
  email,
  password
) => {
  try {
    const id = generateUUID();
    const user = await dbConn.query(
      `INSERT INTO users (id, firstname,middlename,lastname, email, password) VALUES (?,?,?,?,?,?)`,
      [id, firstname, middlename, lastname, email, password]
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
