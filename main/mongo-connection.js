var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var mpswd = require('./mongopswd.js').pswd;
var muname = require('./mongopswd.js').uname;
const assert = require('assert');



var uri = "mongodb://" + muname +":" + mpswd + "@cluster0-shard-00-00-rya5t.gcp.mongodb.net:27017,cluster0-shard-00-01-rya5t.gcp.mongodb.net:27017,cluster0-shard-00-02-rya5t.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";

var _db;



//export the db instance for use in other files
module.exports = {

  //function to connect to the db
  connectToServer: function( callback ) {
    MongoClient.connect(uri, function(err, client) {
      const collection = client.db("SmartPlanner").collection("users");
      // perform actions on the collection object
      _db = client.db("SmartPlanner");
      return callback(err);
    });
       
  },


  //db getter
  getDb: function() {
    return _db;
  },
  
  getName: function(id, callback){
      var o_id = new mongo.ObjectID(id);
      var query = {_id: o_id};
      _db.collection("users").findOne(query, function(err, result) {
          console.log("result");
          console.log(result);
          if (err) throw err;
               callback(err, result.name);
       });
      
      
  },
  
  getOID: function(id){
        var o_id = new mongo.ObjectID(id);
        return o_id;  
  },
  
  //function to insert a record into the database
  insertRecord: function(collection, obj){
    _db.collection(collection).insertOne(obj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        _db.close();
    });
  },
  
  //function used to authenticate users upon log-in attempt
  authenticate: function(email, pswd, callback){
       var query = { email: email, password:pswd};
           _db.collection("users").findOne(query, function(err, result) {
                if (err) throw err;
                callback(err, result);
            });
  },
  
  //inserts the length they want to block websites before an event
  insertLength: function(uuid, len){
        var oidd = new mongo.ObjectID(uuid);
        var query = {_id: oidd};
        var update = {$set: {length: len} };
        _db.collection("users").update(query, update);
  },
  
  //inserts the length they want to block websites before an event
  getLength : function(uuid, callback){
       var oidd = new mongo.ObjectID(uuid);
       var query = {_id: oidd};
       var options = {projection: {length:1}};
      _db.collection("users").find(query, options).toArray(function(err, result){
          if (err) throw err;
          return result;
          
      });
  }
  
};
