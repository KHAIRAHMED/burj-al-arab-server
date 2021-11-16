// express
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// .env 
require('dotenv').config()

const port =process.env.PORT||4000;
// mongo db
const projectName = "Burj-Al-Arab";
const dbName = "Burj-Al-Arab";
const dbPass = "Burj-Al-Arab1234";
const { MongoClient } = require("mongodb");
const uri =`mongodb+srv://${process.env.DB_PROJECT_NAME}:${process.env.DB_PASS}@cluster0.wvvpm.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// jwt token
const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
const serviceAccount = require("./configs/burj-ar-firebase-adminsdk-9i544-cd24d9c179.json");

const app = express();
app.use(cors());
app.use(bodyParser.json());



// jwt token

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// server
client.connect((err) => {
  const collection = client.db("Burj-Al-Arab").collection("Booking");

  // C = Create Operation
  app.post("/addBooking", (req, res) => {
    const booking = req.body;
    collection.insertOne(booking).then((result) => {
      res.send(result.insertedId > 0);
    });
  });

  // R = Read Operation

  app.get("/getData", (req, res) => {
    const bearer = req.headers.authorization;
    const queryEmail = req.query.email;

    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin.auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if(queryEmail === tokenEmail){
            collection.find({ email: queryEmail })
            .toArray((err, doc) => {
              res.send(doc);
            });
          }
          else{
            res.status(401).send("Un-Authoriza User")
          }
        })
        .catch((error) => {
          res.status(401).send("Un-Authoriza User")
        });
    }
    else{
      res.status(401).send("Un-Authoriza User")
    }


  });
});

app.listen(port);
