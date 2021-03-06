var express = require('express');
var mid = require('../middleware');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// get mongo connection
var connection = require('../mongo-connection.js');
var db = connection.thedb;

var router = express.Router();

var eventsString = "";

var d = new Date();

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
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        eventsString += `${start} - ${event.summary}`;
        eventsString += `\n`;
      });
	    sendResults();
    } else {
      console.log('No upcoming events found.');
    }
  });
  
}





//this runs when user clicks the search button in main
router.post('/getEvents', function(req, res, next) {
    
    const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
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
        callback(oAuth2Client, req.body.searchText, d);
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
    
    
    function listUpcomingEvents(auth, q, d){
        listEvents(auth, q, d, sendResults);
    }

    /**
     * Lists the next 10 events on the user's primary calendar.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    function listEvents(auth, q, d, callback) {
        eventsString = "";
      const calendar = google.calendar({version: 'v3', auth});
      var d = new Date();
      d.setMonth(d.getMonth()+1);
      calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        timeMax: (d).toISOString(),
        q:q,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
          events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            eventsString += `${start} - ${event.summary}`;
            eventsString += '\n';
          });
            callback();

        } else {
          eventsString = 'No upcoming events found.';
            callback();
        }
      });

    }
    
    function sendResults(){
        connection.connectToServer(function (err) {
            connection.getName(req.session.userId, function(err, resName){
                    if (err) throw err;
                    res.render('main', {events: eventsString, name: resName});
            });
        });
}

});





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
        var newsites = { $push: {sites: req.body.blockText} };
        db.collection("users").updateOne(query, newsites, function(err, result) {
            if (err) throw err;
            db.close();
            //displays the updated data
            res.redirect('/getData');
        });
        
    });

    //res.render('blockedSites', {events: eventsString});
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
        db.collection("users").updateOne(query, deleteQuery, function(err, result) {
            if (err) throw err;
            //console.log("1 document deleted");
            db.close();
            //displays the updated data
            res.redirect('/getData');
        });
    });

    
    //res.render('blockedSites', {events: eventsString});
});


router.post('/removeAll', function(req, res, next) {
    //retrieve mongo connection
    connection.connectToServer( function( err ) {
        var db = connection.getDb();

        //get the objectid for mongo to identify the correct record
        var oid = connection.getOID(req.session.userId);
        var query = {_id: oid};

        var deleteQuery = { $unset: {sites:1} };
        
        db.collection("users").update(query, deleteQuery, function(err, result) {
            if (err) throw err;
            db.close();
            res.redirect('/getData');
        });
    });

    //res.render('blockedSites', {events: eventsString});
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
router.get('/login', mid.loggedOut, function(req,res, next) {
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
            //get user's name and pass as "name" for use in main.pug
            connection.getName(req.session.userId, function(err, resName){
                if (err) throw err;
                res.render('main', {events: "", name: resName});
            });
           
          }
        });
      } else {
        res.render('login', {errors:'Email and password are required.'});
      }
    });
});

/** CONFIGURATION **/

const googleConfig = {
  clientId: '776197916186-pt74mjq6cet76sid6875tthfs0q6ngsl.apps.googleusercontent.com', // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
  clientSecret: '4EDA5b-6WyrdPvtpTjNubKO7', // e.g. _ASDFA%DFASDFASDFASD#FAD-
  redirect: 'http://localhost:3000/register', // this must match your google api settings
};

const defaultScope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
];

/*************/
/** HELPERS **/
/*************/

function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}

function getGooglePlusApi(auth) {
  return google.plus({ version: 'v1', auth });
}

/**********/
/** MAIN **/
/**********/

function urlGoogle() {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
}

router.post('/googleLogin', function(req,res,next){
    var url = urlGoogle();
    console.log(url);
    res.redirect(url);
    //var code = '4/OgFdJKyY1lmTgydADoxYfUTL-9YXaRQeGNHu6n_t8JxCYb1lRl9WIaMAPVsRRRBM0MrlLAJmGiF3MrMOkIacKqE';
    //var result = getGoogleAccountFromCode(code);
    console.log(url);
});

/**
 * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
 */
function getGoogleAccountFromCode(code) {
  const auth = createConnection();

  const data = auth.getToken(code);
  const tokens = data.tokens;
  auth.setCredentials(tokens);
  const plus = getGooglePlusApi(auth);
  const me = plus.people.get({ userId: 'me' });
  const userGoogleId = me.data.id;
  const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
  return {
    id: userGoogleId,
    email: userGoogleEmail,
    tokens: tokens,
  };
}


//Get /register
router.get('/register', mid.loggedOut, function(req,res,next){
  return res.render('register', {title: 'Sign Up'});
});


//Post /register
router.post('/register', function(req,res,next){
    //connect to mongo db - the function argument is the callback
    connection.connectToServer( function( err ) {
        var db = connection.getDb();
        if (err) throw err;
        if (req.body.email &&
        req.body.name &&
        req.body.password &&
        req.body.confirmPassword) {

          // confirm that user typed same password twice
          if (req.body.password !== req.body.confirmPassword) {
            res.render('register', {errors:'Passwords do not match.'});
          }

          // check whether an email has been used to register an account
          db.collection("users").findOne({email:req.body.email.toString()}, function(err, result){
              if (err) throw err;
              if (result){
                  res.render('register', {errors: 'Email has been used.'});
              }
              else{
                  // create object with form input
                  
                  var userData = {
                        email: req.body.email.toLowerCase(),
                        name: req.body.name,
                        password: req.body.password,
                        sites: [],
                        length: new Date()
                  };

                  //insert document into mongo
                  connection.insertRecord("users", userData);
                  res.render('login');
              }
          });
        } else {
          res.render('register', {errors:'All fields required.'});
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
  
  
  /* connection.connectToServer(function (err) {
            connection.getLength(req.session.userId, function(err, resName){
                    if (err) throw err;
                    res.render('blockedSites', {hiddens: resName});
            });
        });   */
   
  
});


//called from extension only
router.get('/exmongo', function(req,res,next){
    res.send("hi");
   
});





router.post('/tologin', function(req, res, next){
    //var myurl = urlGoogle(function(myurl){
           
    //       res.render('login', {url : myurl});
        
    //});

    res.render('login');
   
});



/**
 * Part 1: Create a Google URL and send to the client to log in the user.
 */
/*
function urlGoogle(callback) {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  callback(url);
}
*/



router.get('/main', mid.requiresLogin, function(req, res, next){
    connection.connectToServer(function (err) {
            connection.getName(req.session.userId, function(err, resName){
                    if (err) throw err;
                    res.render('main', {events: eventsString, name: resName});
            });
        });  
});
router.post('/main', function(req, res, next){
    res.render('main');   
});

router.post('/about', function(req, res, next){
    res.render('about');   
});

router.get('/about', function(req, res, next){
    res.render('about');   
});

router.post('/test', function(req, res, next){
    res.render('test');
});

router.post('/focus', function(req, res, next){
    res.render('focus');
});

router.post('/getdata', function(req, res, next){
  /*   connection.connectToServer(function (err) {
            connection.getLength(req.session.userId, function(err, resName){
                    if (err) throw err;
                    res.render('blockedSites', {hiddens: resName});
            });
        });   */
   
});

//get the amount of time they want to block sites for
router.post('/getLength', function(req, res, next){
    var glen = (req.body.getlength);
    if (glen == "a week" ){
        var g = new Date();
        d.setDate(g.getDate()+7); //d is a global variable used in listEvents
    }
    else if (glen == "two weeks"){
        var g = new Date();
        d.setDate(g.getDate()+14);
    }
    else if (glen == "three weeks"){
        var g = new Date();
        d.setDate(g.getDate()+21);
    }
    else if (glen == "four weeks"){
        var g = new Date();
        d.setDate(g.getDate()+28);
    }
    else if (glen == "forever"){
        var g = new Date();
        d.setDate(g.getDate()+365);
    }
   
    
    connection.connectToServer(function (err) {
            connection.getName(req.session.userId, function(err, resName){
                    if (err) throw err;
                    connection.insertLength(req.session.userId, d);
                    res.render('blockedSites');
            });
     
        });
   
});


module.exports = router;

