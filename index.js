var express = require("express");
var mysql = require("mysql");
var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

// mySQL DBMS
const connection = mysql.createConnection({
    // host:"localhost",
    // user:"denize",
    // password:"denize",
    // database:"quotes_db"
    
    host: "us-cdbr-iron-east-01.cleardb.net",
    username: "b473ff65a7ffb2",
    password: "",
    database: "heroku_1d8a9ad6b1fca3b"
});

// connection.connect();
connection.connect(function(err) {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
   console.log('connected as id ' + connection.threadId);
});

// routes
app.get("/", function(req, res) {
    res.render("home");
}); // home route

app.get("/results", function(req, res) {
    console.log(req.query);
    var param = req.query.search;
    console.log(param)
    var stmt = 'select * from l9_author, l9_quotes where'
    if(param.toLowerCase() == "male" || param.toLowerCase() == "female" || param.toLowerCase() == "f" || param.toLowerCase() == "m") {
        stmt += ' l9_author.sex=\'' + param.charAt(0).toLowerCase() + '\';';
    } else if(/\s/.test(param)) {
        stmt += ' l9_author.firstName=\'' + param.split(" ")[0] + '\' or l9_author.lastName=\'' + param.split(" ")[1] + '\';';
    } else {
        stmt += ' l9_quotes.quote like \'' + "%" + param  + "%" + '\' or l9_quotes.category=\'' + param + '\';';
    }
    connection.query(stmt, function(error, found){
        if(error) throw error;
        if(found) {
            console.log(found);
            console.log(stmt)
            let s = new Set();
            for(let i = 0; i < found.length; i++) {
                s.add(found[i].portrait);
            }
            res.render("results", {data: found, img : s});
        }
    })    
});

app.listen(process.env.PORT || 3000 || 3306, function() {
    console.log("Server is starting...");
});