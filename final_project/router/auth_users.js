const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const registeredUsers = express.Router();

let users = [];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });

  if (usersWithSameName.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  if (validUsers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
registeredUsers.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { data: password },
      "access",
      { expiresIn: 60 * 60 });

    req.session.authorization = { accessToken, username }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid login. Check username and password" });
  }
});

// Add a book review
registeredUsers.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const review = req.body.review;

  let book = books[isbn];

  if (book) {
    book.reviews[username] = review;
    res.status(200).json({message: `The review has been added/modified for user ${username}`});
  } else {
    return res.status(404).json({ message: `Unable to find book having ISBN=${isbn}` });
  }
});

// Remove a book review
registeredUsers.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  let book = books[isbn];

  if (book) {
    delete book.reviews[username];
    res.status(200).json({message: `The review has been removed for user ${username}`});
  } else {
    return res.status(404).json({ message: `Unable to find book having ISBN=${isbn}` });
  }
});

module.exports.authenticated = registeredUsers;
module.exports.isValid = isValid;
module.exports.users = users;
