/*
**  app.js - Snapperstore - server side entry point
*/

const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const ssconfig = require("./config.json");
const mongoose = require('mongoose');
const cors = require('cors')

app.use(cors());

// let server = require('http').createServer(app);  

if (ssconfig.USING_DB) {         
  mongoose.connect(ssconfig.MONGO_DB_CONNECT, {
    useMongoClient: true,
  });  
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static('public'));

const router = require('./router');

app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Expose-Headers", "x-flashmessages");
  next();
});

app.use("/", router);
const apiRouter = require("./api");
app.use("/api", apiRouter);
app.listen(process.env.PORT || 8081)