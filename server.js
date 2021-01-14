const express = require('express');

const logger = require('./logger');

const os = require('os'); //package for knowing the uptime of the server

const path = require('path');//for concatination of the dir name and the folder

//const ejs = require('ejs');
const jwt = require("jsonwebtoken");


const mysql = require('mysql');

const hash = require('bcrypt');

const port = process.env.PORT || 8000;// alternate port number

const app = express();//initiaise express app
const start = new Date(Date.now()); // starting time of server

app.use(express.static(path.join(__dirname,'folder'))); //

app.use(express.urlencoded({extended: true}));//query string utilisation

app.set("view engine", "ejs");

app.set('views', path.join(__dirname,'/folder'));//



/*app.get("/", (req, res) => {
    if (req.query.token) {
      let query = "SELECT * from TWEETS";
      con.query(query, (err, results) => {
        if (err) {
          res.send({
            status: 500,
            message: err.message,
          });
        } else {
          res.render("index", {
            token: req.query.token,
            tweets: results,
          });
        }
      });
    } else res.sendFile(path.join(__dirname, "./folder", "landing_page.html"));
  });*/
  
  app.get("/folder/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "./folder", "signup.html"));
  });
  


app.use(express.json());// server will take json input 
 const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password: '',
    database: 'twitter' 
});



con.connect((err)=> {
    if(err){

        logger.log(`Error: ${err}`);
    }
    else{
        console.log('Connected');
    }
});

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'/folder/landing_page.html'));
});

app.get('/loginRoute', (req,res) => {
    logger.log('Log In Page')
    res.sendFile(path.join(__dirname,'/folder/login.html'));
})

app.get('/signUpRoute', (req,res) => {
    logger.log('Sign Up');
    res.sendFile(path.join(__dirname,'/folder/signup.html'));
})


app.set('views',path.join(__dirname,'./views/index.ejs'))





app.post("/loginUser", (req,res) =>
{
    let username = req.body.username;
    let password = req.body.password;
    con.query(
        `SELECT * FROM auth WHERE username ='${username}'`,
    async (err, result) => {
      if (err) throw err;

      if (result.length == 0) {
        res.send({
          status: 500,
          message: "Email not found",
        });

    }
    else {
        let savedPassword = result[0].password;
        // console.log(result[0].Password);
        const isMatch = await hash.compare(password, savedPassword);
        if (!isMatch) {
          return res.send({
            status: 500,
            message: "Incorrect Password",
          });
        }
        if (isMatch) {
          //pass match: return jwt token else throw error
          const payload = {
            //defining payload
            user: {
              username: username,
            },
          };
          jwt.sign(
            //generates token
            payload, //email here
            "jwtsecret",
            {
              //extra options
            },
            (err, token) => {
              if (err) throw err;
              res.redirect("/?token=" + token);
            }
          );
        }
      }
    }
  );
});

    
app.post('/signupUser', (req,res) => {
    logger.log('Signing Up');

    try{
        console.log(req);
        if(req.body.username.length === 0 || req.body.password.length ===0)
        {
            console.log('Error');
            throw 'Invalid Fields'
        }

        console.log(req.body);
        let password = req.body.password;
        let saltRound = 10;
        var hashedPassword = hash.hashSync (password, saltRound);
       /* hashing.hash(password,saltRound, (error,hashed) =>
        {
            if(error){
                console.log(error);
            }
            else{
                hashedPassword =hashed;
            }
        })*/
        console.log(hashedPassword);
        const data ={
            username:req.body.username,
            password: hashedPassword
        }
        console.log(data);
        var query = 'INSERT INTO auth (username, password) VALUES ("'+data.username+'","'+data.password+'")';
     
      con.query(query, (err, results) => {
        if (err) {
          res.send({
            status: 500,
            message: err.message,
          });
        } else {
          const payload = {
            //defining payload
            user: {
              email : data.username,
            },
          };
          jwt.sign(
            //generates token
            payload, //email here
            "jwtsecret",
            {
              //extra options
            },
            (err, token) => {
                console.log(err.message);
              if (err) throw err;
              res.redirect("/?token=" + token);
            }
          );
        }
      });
    }
    catch(e) { //bcrypt end {
res.send({
status: 500,
message: "User already exists",
});
}
});


app.get('/health', (req,res) => {
    res.status(200).json({
        started: start,
        uptime: os.uptime(),
        message: `Server is running on port ${ port }`,
        logs: logger.logs
    });
})

app.listen(port , (err) => {
    if(err){
        logger.log(err);
    }
    else{
        logger.log(`Server Started on port ${port}`);
    }
})