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
  }
};





/* MongoClient.connect(url, function (err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  db = client.db(dbName);
  callback(db);
  client.close();
});


module.exports = function(cb){
  if(typeof db != 'undefined' ){
    cb(db)
  }else{
    callback = cb
  }
} */