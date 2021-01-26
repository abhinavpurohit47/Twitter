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
  
app.get('/deleteRoute', (req,res) => {
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

  app.get('/addTweetRoute', (req,res) => {
    logger.log('Adding Tweet ');
    res.render('index',{tweets:[]});
})


  app.post('/addTweet',(req,res) =>{
    console.log('Adding Tweet');

    try{
      if(req.body.content.length === 0 )
      {
        console.log('Error');
        throw 'Invalid'
      }
      console.log(req.body);
      var query = 'INSERT INTO tweets (username,content,likes) VALUES ("'+req.body.username+'","'+req.body.content+'","'+0+'")';
      con.query(query, (err, result) => {
          if(err){
              logger.log(err);
              res.end();
          }
          else{
              logger.log('Tweet added')
          }
      });
      res.render('index',{tweets:[]});
}
catch(e){
res.json({
  message: e.message
})
}
})




app.post("/tweetUpdate",(req,res,next) => {
  let postUpdate = { name:req.body.username, email:req.body.email }
  connection.query("Insert INTO tweets ")
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
                              var query1= `SELECT * FROM tweets`;
                              con.query(query1,(err1,result1)=>{
                                if(err1){
                                  console.log(err1);
                                  res.end();
                                }
                                else {
                                  res.render("index" , {tweets:result1,name:req.body.username});
                                }
                              })
                                 

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
                

app.post("/update", (req,res) => {
  try{
    if(req.body.username.length === 0 || req.body.password.length === 0){
        logger.log('Error');
        throw 'Invalid Fields'
    }
    
    
    logger.log(req.body);
    let password = req.body.password;
    let saltRound = 10;
    
    let newName = req.body.newName;
    let oldpass = req.body.password;

   
    let name = req.body.username;
    var hashedPswd = hash.hashSync(password,saltRound);
    
    let query = `UPDATE auth SET username = "${newName}", password = "${hashedPswd}" WHERE username = "${name}" AND password = "${oldpass}"`;
            con.query (query,(err, result) => {
                if(err){
                    logger.log(err);
                    res.end();
                }
                else{
                    
                    console.log("Updating");
                    res.sendFile(path.join(__dirname,'/folder/landing_page.html'))
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



        app.post("/deleteUser", (req,res) => {
          try{
            if(req.body.username.length === 0 || req.body.password.length === 0){
                logger.log('Error');
                throw 'Invalid Fields'
            }
            
            
            logger.log(req.body);
            
            
           
            let name = req.body.username;
            
            
            let query = `DELETE FROM auth WHERE username = '${name}'`;
                    con.query (query,(err, result) => {
                        if(err){
                            logger.log(err);
                            res.end();
                        }
                        else{
                            
                            console.log("Deleting");
                            res.sendFile(path.join(__dirname,'/folder/landing_page.html'))
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
        
        
        
 

  app.post('/deleteTweet', (req,res) => {
    
      try{
        if(req.body.content.length === 0){
          console.log('Error');
          throw 'Invalid Fields'
        }

        logger.log(req.body);
            
            console.log(req.body);
            
            let query =`DELETE FROM tweets WHERE content = '${content}'`;
            con.query (query,(err,result) => {
              if(err){
                console.log(err);
                res.end();
              }
              else{
                console.log("Deleting");

              }
            }
            )}
              catch(e){
                console.log(e);
                res.status(400).json ({
                  "message": e.message
                });

              }
            })
           
       
    


app.listen(port , (err) => {
    if(err){
        logger.log(err);
    }
    else{
        logger.log(`Server Started on port ${port}`);
    }

});