const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username || req.query.username;
  const password = req.body.password || req.query.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (isValid(username)) {
    return res.status(409).json({message: "User already exists"});
  }

  users.push({ username, password });
  return res.status(201).json({message: "User successfully registered. You can now login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const results = Object.fromEntries(
    Object.entries(books).filter(([, book]) => book.author.toLowerCase() === author)
  );

  if (Object.keys(results).length === 0) {
    return res.status(404).json({message: "No books found for this author"});
  }

  return res.status(200).json(results);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const results = Object.fromEntries(
    Object.entries(books).filter(([, book]) => book.title.toLowerCase() === title)
  );

  if (Object.keys(results).length === 0) {
    return res.status(404).json({message: "No books found for this title"});
  }

  return res.status(200).json(results);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  return res.status(200).json(book.reviews);
});

const baseURL = "http://localhost:5000";

const getAllBooksWithAxios = async () => {
  const response = await axios.get(`${baseURL}/`);
  return response.data;
};

const getBookByISBNWithAxios = (isbn) => {
  return axios.get(`${baseURL}/isbn/${isbn}`).then((response) => response.data);
};

const getBooksByAuthorWithAxios = async (author) => {
  const response = await axios.get(`${baseURL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitleWithAxios = async (title) => {
  const response = await axios.get(`${baseURL}/title/${encodeURIComponent(title)}`);
  return response.data;
};

module.exports.general = public_users;
module.exports.getAllBooksWithAxios = getAllBooksWithAxios;
module.exports.getBookByISBNWithAxios = getBookByISBNWithAxios;
module.exports.getBooksByAuthorWithAxios = getBooksByAuthorWithAxios;
module.exports.getBooksByTitleWithAxios = getBooksByTitleWithAxios;
