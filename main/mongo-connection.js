var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var mpswd = require('./mongopswd.js').pswd;
var muname = require('./mongopswd.js').uname;
const assert = require('assert');
console.log("mpswd: " + mpswd);


//const uri = "mongodb+srv://joe:" + String(mpswd) + "@cluster0-rya5t.gcp.mongodb.net/test?retryWrites=true";
//const uri = "mongodb+srv://joe:mypassword@cluster0-rya5t.gcp.mongodb.net/test?retryWrites=true";
var uri = "mongodb://"+muname+ ":" + mpswd + "@cluster0-shard-00-00-rya5t.gcp.mongodb.net:27017,cluster0-shard-00-01-rya5t.gcp.mongodb.net:27017,cluster0-shard-00-02-rya5t.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";


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
    
      
      
      
    /*const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
      const collection = client.db("SmartPlanner").collection("users");
      _db = client.db("SmartPlanner");
      if (err) throw err;
      return callback(err);
    });*/
    
  },

   //MongoClient.connect( "mongodb://localhost:27017/SiteBlocker", function( err, db ) {
    //  _db = db;
    //  return callback( err );
    //} );
  //},

  //db getter
  getDb: function() {
    return _db;
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
       var query = { email: email, password:pswd}; //is password a keyword? problem?
       console.log(email);
       console.log(pswd);
           _db.collection("users").findOne(query, function(err, result) {
               console.log("result");
               console.log(result);
                if (err) throw err;
                    callback(err, result);
            });
    

  }
  
};
