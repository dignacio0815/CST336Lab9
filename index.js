// references: https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
var express = require("express");
var mysql = require("mysql");
var app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// mySQL DBMS
// database config
var db_config = {
    host: "us-cdbr-iron-east-01.cleardb.net",
    user: "b473ff65a7ffb2",
    password: "1449f782",
    database: "heroku_1d8a9ad6b1fca3b"
}
    // host:"localhost",
    // user:"denize",
    // password:"denize",
    // database:"quotes_db"

function handleDisconnect() {
    console.log("In handleDisconnect");
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.
  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
    //   setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

// connection.connect(function(err) {
//   if (err) {
//     console.error('Error connecting to MySQL: ' + err.stack);
    
//     return;
//   }
//   console.log('connected as id ' + connection.threadId);
// });

// routes
app.get("/", function(req, res) {
    res.render("home");
}); // home route

app.get("/results", function(req, res) {
    console.log(req.query);
    var param = req.query.search;
    console.log(param);
    var stmt = 'select * from l9_author, l9_quotes where';
    if(param.toLowerCase() == "male" || param.toLowerCase() == "female" || param.toLowerCase() == "f" || param.toLowerCase() == "m") {
        stmt += ' l9_author.sex=\'' + param.charAt(0).toLowerCase() + '\';';
    } else if(/\s/.test(param)) {
        stmt += ' l9_author.firstName=\'' + param.split(" ")[0] + '\' or l9_author.lastName=\'' + param.split(" ")[1] + '\';';
    } else {
        stmt += ' l9_quotes.quote like \'' + "%" + param  + "%" + '\' or l9_quotes.category=\'' + param + '\' or l9_author.firstName=\'' + param + '\' or l9_author.lastName=\'' + param + '\';';
    }
    connection.query(stmt, function(error, found){
        if(error) throw error;
        if(found) {
            console.log(found);
            console.log(stmt);
            let s = new Set();
            for(let i = 0; i < found.length; i++) {
                s.add(found[i].portrait);
            }
            console.log(found.length)
            console.log('\n\n\n\n')
            
            found.forEach(function(a){
                console.log(a.authorId)
            })
            
            res.render("results", {data: found, img : s});
        }
    })    
});

app.get("/results/:aid", function(req, res) {
   console.log(req.params.aid);
   var stmt = "SELECT * FROM l9_author WHERE l9_author.authorId=\'" + req.params.aid + "\';";
   connection.query(stmt, function(error, found) {
       if(error) throw error;
       if(found) {
           console.log(found);
           res.render("authorInfo", {author:found});
       }
   });
});

app.listen(process.env.PORT || 3000 || 3306, function() {
    console.log("Server is starting...");
});