var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
 
var db = "hello"; //not getting modified bc of asynchronicity. fix this.

MongoClient.connect(url, function (err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  db = client.db(dbName);
  exportit(db);
 
});

function exportit(db){
    module.exports = {
    thedb: db
}
}