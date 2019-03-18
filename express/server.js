'use strict';

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;


const ident = ["olivierdpn","Saisies73"];
var cors = require('cors')



const CONNECTION_URL = "mongodb+srv://"+ident[0]+":"+ident[1]+"@cluster0-zaqom.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Movies";

const router = Express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>C est en ligne!</h1>');
  res.end();
});
router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

var app = Express();
app.use(cors())
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use('/.netlify/functions/server', router);  // path must route to lambda

var database, collection;

 MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("Movie");
      });



app.get("/movies/populate", (request, response) => {
  collection.find({}).toArray((error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});

app.get("/movies", (request, response) => {
  collection.findOne({"metascore" : {"$gt" : 70}}, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});

app.get("/movies/search", (request, response) => {
  var limite = request.query.limit;
  if(limite==null)limite=5;
  else{limite =Number(request.query.limit)}
  var metascore = request.query.metascore;
  if(metascore==null)metascore=0;
  else{metascore = Number(request.query.metascore)}
  collection.find({"metascore": {"$gt":metascore} }).sort({metascore:-1}).limit(limite).toArray((error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});

app.get("/movies/:id", (request, response) => {
  collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});

app.post("/movies/:id", (request, response) => {
  req=request.body;
  collection.updateOne({id:request.params.id},{$set:{date:req.date,review:req.review}},(error, result) => {           
      if(error) {
          return response.status(500).send(error);
      }           
      response.send(result)          
  });
});

module.exports = app;
module.exports.handler = serverless(app);




