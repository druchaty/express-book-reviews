const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login." });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  let matchingBooks = Object.fromEntries(Object.entries(books)
    .filter(([isbn, book]) => book.author === author));

  res.send(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  let matchingBooks = Object.values(books)
    .filter((book) => book.title === title);

  if (matchingBooks.length > 1) {
    res.send(matchingBooks);
  } else if (matchingBooks.length === 1) {
    res.send(matchingBooks[0]);
  } else {
    res.status(404).json({ message: `Book having title '${title}' not found!` })
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  res.send(books[isbn].reviews);
});


const axios = require('axios').default;

const testEndpoint = (message, url) => {
  const req = axios.get(url);
  console.log(req);
  req.then(resp => {
    console.log("\n");
    console.log(`${message}: GET "${url}"`);
    console.log(resp.data);
  })
    .catch(err => {
      console.log("Error testing: " + url);
      console.log(err.toString());
    });
}

testEndpoint("Getting the list of books", "http://localhost:5000/");
testEndpoint("Getting the book details based on ISBN", "http://localhost:5000/isbn/1");
testEndpoint("Getting books for the author", "http://localhost:5000/author/Unknown");
testEndpoint("Getting book details based on title", "http://localhost:5000/title/Fairy tales");

module.exports.general = public_users;
