var express = require('express');
 
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// get mongo connection
var connection = require('../mongo-connection.js');
var db = connection.thedb;

var router = express.Router();

var eventsString = "";




router.get('/', function(req, res, next) {
    res.render('index');
});


/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, callback) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        eventsString += `${start} - ${event.summary}`;
        eventsString += `\n`;
        //console.log(`${start} - ${event.summary}`);
      });
	    sendResults();
    } else {
      console.log('No upcoming events found.');
    }
  });
  
}





//this runs when user clicks the search button in main
router.post('/', function(req, res, next) {
   
    
    
    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';
    
    
    
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Calendar API.
      authorize(JSON.parse(content), listUpcomingEvents);
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, req.body.searchText);
        //console.log(req.body.searchText);
      });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getAccessToken(oAuth2Client, callback) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error retrieving access token', err);
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
          });
        });
      });
    }


/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, callback, q) {
	eventsString = "";
  const calendar = google.calendar({version: 'v3', auth});
  console.log("test1");
  console.log(q);
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
	q:q,
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        eventsString += `${start} - ${event.summary}`;
        eventsString += '\n';
        //console.log(`${start} - ${event.summary}`);
      });
	    sendResults();

    } else {
      eventsString = 'No upcoming events found.';
	    sendResults();
    }
  });

}

function listUpcomingEvents(auth, q){
	listEvents(auth, sendResults, q);

}

});

function sendResults(){
	//console.log("now")
	res.render('main', { events: eventsString });
}



router.post('/add', function(req, res, next) {
    res.render('blockedSites');
});



router.post('/update', function(req, res, next) {
    res.render('blockedSites');
});



//this function is run when the user adds a new site to their blocking list
router.post('/updateAdd', function(req, res, next) {

    //retrieve mongo connection
    connection.connectToServer( function( err ) {
        var db = connection.getDb();

        //update the user's mongo document with the new site
        var oid = connection.getOID(req.session.userId);
        
        
        var query = {_id: oid};
        var newsites = { $push: {sites: req.body.blockText} }; //change this to some sort of append. just sites + req.body.blockText?
        console.log(req.body.blockText);
        db.collection("users").updateOne(query, newsites, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
        });
        
    });

    res.render('blockedSites', {events: eventsString});
});



//this function is run when the user deletes a site from their blocking list
router.post('/updateDelete', function(req, res, next) {
    //retrieve mongo connection
    connection.connectToServer( function( err ) {
        var db = connection.getDb();

        //get the objectid for mongo to identify the correct record
        var oid = connection.getOID(req.session.userId);
        var query = {_id: oid};
        
        var deleteQuery = { $pull: {sites: req.body.unblockText} };
        db.collection("users").updateOne(query, deleteQuery, function(err, res) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
    });

    res.render('blockedSites', {events: eventsString});
});


router.post('/removeAll', function(req, res, next) {
    //retrieve mongo connection
    connection.connectToServer( function( err ) {
        var db = connection.getDb();

        db.collection("users").drop(function(err, delOK) {
            if (err) throw err;
            if (delOK) console.log("Collection deleted");
            db.close();
        });
    });

    res.render('blockedSites', {events: eventsString});
});




//user session functions-------------------------

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});


//Get /login
router.get('/login', function(req,res, next) {
  return res.render('login', {title: 'Log In'});
});



// POST /login
router.post('/login', function(req, res, next) {
    connection.connectToServer( function( err ) {
        if (err) throw err;
      if (req.body.email && req.body.password) {
        connection.authenticate(req.body.email.toLowerCase(), req.body.password, function (error, user) {
          if (error || !user) {
            console.log(error);
            console.log(user);
            res.render('login', {errors:'Wrong email or password.'});
          }  else {
            req.session.userId = user._id;
            res.render('main');
          }
        });
      } else {
        res.render('login', {errors:'Email and password are required.'});
      }
    });
});


//Post /googlelogin
router.post('/googlelogin', function(req,res,next){
    res.render('googlelogin');
});

//Get /register
router.get('/register', function(req,res,next){
  return res.render('register', {title: 'Sign Up'});
});


//Post /register
router.post('/register', function(req,res,next){
    //connect to mongo db - the function argument is the callback
    connection.connectToServer( function( err ) {
        if (err) throw err;
        if (req.body.email &&
        req.body.name &&
        req.body.password &&
        req.body.confirmPassword) {

          // confirm that user typed same password twice
          if (req.body.password !== req.body.confirmPassword) {
            var err = new Error('Passwords do not match.');
            err.status = 400;
            return next(err);
          }

          // create object with form input
          var userData = {
            email: req.body.email.toLowerCase(),
            name: req.body.name,
            password: req.body.password,
            sites: []
          };
          
          //insert document into mongo
          connection.insertRecord("users", userData);
          res.render('main');
            

      
        } else {
          var err = new Error('All fields required.');
          err.status = 400;
          return next(err);
        }
      });

});


//--------------------------------------------------



//Get /getdata -- this function returns the list of blocked sites for the user
router.get('/getData', function(req, res, next){
  var result = [];

  connection.connectToServer(function(err){
    var db = connection.getDb();
    var oid = connection.getOID(req.session.userId);    
    var query = {_id: oid};
     
    var cursor = db.collection("users").find(query);
    cursor.forEach(function(doc, err){
      if (err) throw err;
      result.push(doc.sites);
    }, function(){
      db.close();
      res.render('blockedSites', {items:result});
    });
  });
});





router.post('/tologin', function(req, res, next){
    res.render('login');
    //res.render('test');    
   
});

router.get('/main', function(req, res, next){
    res.render('main');   
});
router.post('/main', function(req, res, next){
    res.render('main');   
});

router.post('/test', function(req, res, next){
    res.render('test');
});


module.exports = router;

