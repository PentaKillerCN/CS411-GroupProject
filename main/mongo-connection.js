var mongoose = require("mongoose");

// set up mongo
mongoose.Promise = global.Promise;
db = mongoose.connect("mongodb://localhost:27017/users");

var usersSchema = new mongoose.Schema({
 firstName: String,
 blockedSites: String
});

var User = mongoose.model("User", usersSchema);
//-------------

exports.db = db;
exports.user = User;