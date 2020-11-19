const express = require('express');
const logger = require('./logger');
const os = require('os');
const path = require('path');

const app = express();

const port = process.env.PORT || 8080;

const start = new Date(Date.now());

app.use(express.static(path.join(__dirname,'views')));

app.use(express.urlencoded({extended: true}));

app.set('views', path.join(__dirname,'/views/login'));

app.use(express.json());

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'/views/login/index.html'));
});

app.get('/loginRoute', (req,res) => {
    logger.log('Log In Page')
    res.sendFile(path.join(__dirname,'/views/loginPage/index.html'));
})

app.get('/signUpRoute', (req,res) => {
    logger.log('Sign Up');
    res.sendFile(path.join(__dirname,'/views/signup/index.html'));
})

app.post('/loginUser', (req,res) => {
    logger.log('Logging In');
    res.sendFile(path.join(__dirname,'/views/home/index.html'));
})

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
        logger.log(`Server started on port ${port}`);
    }
})