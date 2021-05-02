const fs = require("fs");
const jwt = require("jsonwebtoken");

const squareRoot = (req, res) => {
  //TO DO
  return res.status(200).json("squareRoot");;
};

const cubicRoot = (req, res) => {
  //TO DO
  return res.status(200).json("cubicRoot");;
};

const paramRoot = (req, res) => {
  //TO DO
  return res.status(200).json("paramRoot");;
};



module.exports = {
  squareRoot,
  cubicRoot,
  paramRoot
};
