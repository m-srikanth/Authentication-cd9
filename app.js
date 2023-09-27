const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "userData.db");

const initiatingDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("It's Running...");
    });
  } catch (e) {
    console.log(`Error is ${e.message}`);
    process.exit(1);
  }
};
initiatingDB();

//API-1
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const userCheckQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(userCheckQuery);
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const updateQuery = `INSERT INTO user (username, name, password, gender, location) VALUES ('${username}', '${name}', '${hashedPassword}', '${gender}', '${location}');`;
      await db.run(updateQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
//API-2
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const userCheckQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(userCheckQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const checkPassword = await bcrypt.compare(password, dbUser.password);
    if (checkPassword === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
//API-3
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const userCheckQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(userCheckQuery);
  const checkPassword = await bcrypt.compare(oldPassword, dbUser.password);
  if (checkPassword !== true) {
    response.status(400);
    response.send("Invalid current password");
  } else {
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const updatingNewPassword = `UPDATE user SET password = '${hashedNewPassword}';`;
      await db.run(updatingNewPassword);
      response.status(200);
      response.send("Password updated");
    }
  }
});
module.exports = app;
