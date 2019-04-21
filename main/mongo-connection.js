var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
 
var _db;


//export the db instance for use in other files
module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( "mongodb://localhost:27017/myproject", function( err, db ) {
      _db = db;
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  },
  
  insertRecord: function(collection, obj){
    _db.collection(collection).insertOne(obj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        _db.close();
    });
  },
  
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
