const express = require('express');

const logger = require('./logger');

const os = require('os'); //package for knowing the uptime of the server

const path = require('path');//for concatination of the dir name and the folder

//const ejs = require('ejs');




const mysql = require('mysql');

const hash = require('bcrypt');

const port = process.env.PORT || 8000;// alternate port number

const app = express();//initiaise express app

const start = new Date(Date.now()); // starting time of server

app.use(express.static(path.join(__dirname,'folder'))); //

app.use(express.urlencoded({extended: true}));//query string utilisation

app.set("view engine", "ejs");

app.set('views',path.join(__dirname,'./views'))




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

app.get('/updateUser', (req,res) => {
    logger.log('Updating');
    res.sendFile(path.join(__dirname,'/folder/update.html'));
})
  
app.get('/deleteUser', (req,res) => {
    logger.log('Deleting');
    res.sendFile(path.join(__dirname,'/folder/delete.html'));
})



app.post('/signUpuser', (req,res) => {


logger.log('Signing Up');
    try{
        if(req.body.username.length === 0 || req.body.password.length === 0){
            logger.log('Error');
            throw 'Invalid Fields'
        }
        logger.log(req.body);
        let password = req.body.password;
        let saltRound = 10;
        var hashedPassword = hash.hashSync(password, saltRound);
        logger.log(hashedPassword);
        const data = {
            username: req.body.username,
            password: hashedPassword
        }
        var query = 'INSERT INTO auth (username, password) VALUES ("'+data.username+'" , "'+data.password+'")';
                con.query(query, (err, result) => {
                    if(err){
                        logger.log(err);
                        res.end();
                    }
                    else{
                        logger.log('User added')
                    }
                });
                res.render('index',{tweets:[]});
    }
    catch(e){
        res.json({
            message: e
        })
    }
  })


  app.post('/Loginuser', (req,res) => {


    logger.log('Logging In');


        try{
            if(req.body.username.length === 0 || req.body.password.length === 0){
                logger.log('Error');
                throw 'Invalid Fields'
            }


            logger.log(req.body);
            let password = req.body.password;
            let saltRound = 10;
            let username = req.body.username;
            var query = `SELECT * FROM auth WHERE username ='${username}'`;
                    con.query (query,(err, result) => {
                        if(err){
                            logger.log(err);
                            res.end();
                        }
                        else{
                            let match = hash.compareSync(password,result[0].password)
                            if (match){
                                console.log("User Logged In");

                                res.render("index" , {tweets:[]});

                            }
                            else{
                                res.status(404).json({

                                    "message" : "user not found"
                                })
                            }
                        }
                    }
                    )}
                    catch(e){
                        console.log(e);
                        res.status(400).json({
                            "message" : e.message
                        });

                    }
                })

               /* app.put('/UpdateUser', (req,res) =>{
                    console.log("Updating the user");
                    try{
                        if(req.body.username.length === 0 || req.body.password.length === 0){
                            logger.log('Error');
                            throw 'Invalid Fields'
                        }
            
            
                        logger.log(req.body);
                        let password = req.body.password;
                        let saltRound = 10;
                        let username = req.body.username;
                        var query = `UPDATE * FROM auth WHERE (username, password) VALUES ("'+data.username+'" , "'+data.password+'")`;
                                con.query (query,(err, result) => {
                                    if(err){
                                        logger.log(err);
                                        res.end();
                                    }
                                }
                                )
                                catch(e){
                                    console.log(e);
                                    res.status(400).json({
                                        "message" : e.message
                                    });
            
                                }
                })
*/

app.post("/updateUser", (req, res) => {
    let name = req.body.userName;
    let newName = req.body.newName;
    let password = req.body.password;
    let newPassword = req.body.newPassword;
    let hashedPswd;
    con.query(`SELECT userName FROM auth WHERE userName ='${newName}'`, function (
      err,
      result
    ) {
      if (err) throw err;
      // console.log(result);
      if (result.length == 0) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
          if (err) {
            throw err;
          } else {
            bcrypt.hash(newPassword, salt, function (err, hash) {
              if (err) {
                throw err;
              } else {
                hashedPswd = hash;
                let oldpass = "";
                let getPass = `SELECT password FROM auth WHERE userName = '${name}'`;
                con.query(getPass, function (err, results) {
                  if (err) throw err;
                  if (results.length != 0) {
                    oldpass = results[0].password; 
  
                    bcrypt.compare(password, oldpass, function (err, isMatch) {
                      if (err) {
                        throw err;
                      } else if (!isMatch) {
                        res.render('update', { message: "Incorrect password." });
                      } else {
                        let sql = `UPDATE auth SET userName = "${newName}", password = "${hashedPswd}" WHERE userName = "${name}" AND password = "${oldpass}"`;
                        con.query(sql, function (error, results) {
                          if (error) {
                            throw error;
                          } else if (results.affectedRows != 0)
                          res.render('update', { message: "User Details Updated." });
                          else res.render('update', { message: "Incorrect Credentials." });
                        });
                      }
                    });
                  } else {
                    res.render('update', { message: "Incorrect Email." });
                  }
                });
              }
            });
          }
        });
      } else {
        res.render('user/updateUser', { message: "Email already taken." });
      }
    });
  });
  
  
  app.post("/deleteUser", function (req, res) {
    var userName = req.body.userName;
    var password = req.body.password;
    if (userName && password) {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          throw err;
        } else {
          let hash = "";
          //store the value of hashedPswd in hash
          let getPass = `SELECT password FROM userinfo WHERE userName = '${userName}'`;
          con.query(getPass, function (err, results) {
            if (err) throw err;
            if (results.length != 0) {
              hash = results[0].password; // stored
              //compare it with the entered password
              bcrypt.compare(password, hash, function (err, isMatch) {
                if (err) {
                  throw err;
                } else if (!isMatch) {
                  res.render('user/deleteUser', { message: "Incorrect Password." });
                } else {
                  let sql = `DELETE FROM userinfo WHERE userName = '${userName}' AND password = '${hash}';`;
                  con.query(sql, function (error, results) {
                    if (error) {
                      throw error;
                    }
                    // res.redirect("/");
                    res.render('user/deleteUser', { message: "User has been deleted." });
                    // res.end();
                  }); // end con.query(sql)
                }
              }); //end bcrypt.comapre()
            } else {
              res.render('user/deleteUser', { message: "Invalid details." });
            }
          }); // end con.query(getPass)
        }
      });
    }
  });
  






app.listen(port , (err) => {
    if(err){
        logger.log(err);
    }
    else{
        logger.log(`Server Started on port ${port}`);
    }

});