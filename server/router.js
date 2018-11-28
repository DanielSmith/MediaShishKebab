/*
**  router.js
*/

const uuid = require("node-uuid");
const express = require('express');
const app = express.Router();
const utils = require("./utils.js");
module.exports = app;

app.use(express.static('uploads'));

app.get('/:day', function(req, res, next) {
  console.dir(req.params);
  const theFiles = utils.getImages(req.params.day);
  

  console.log('the simple case...');
  return res.json(theFiles);
});

// list all days
app.get('/', function(req, res) {
  const theDirs = utils.getDirs();

  // const theFiles = utils.getImages();
  console.log(JSON.stringify(theDirs));
  return res.json(theDirs);
})