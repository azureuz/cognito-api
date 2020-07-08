var express = require('express');
var bodyParser = require('body-parser');
global.fetch = require('node-fetch');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const fs = require('fs');
const path = require('path');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

const poolData = {    
    UserPoolId : "us-east-2_ZFV3XwCNW",    
    ClientId : "1qnbbio87jsgfbfumusiig3drr" 
    }; //cognito credentials

const pool_region = 'us-east-2';
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

app.get('/', async function (req, res) { 
    res.send('<h1>Welcome to node app</h1><body>/register <br>    /login   <br>  /dashboard</body>');
  
  }); //home page default

app.get('/register', async function (req, res) { 
    res.render('register');
  
  });

app.get('/login', async function (req, res) { 
    res.render('login');
  
  });

app.get('/dashboard', async function (req, res) { 
    res.render('dashboard');
  
  });

app.post('/register',  async function (req, res) { 
    
    const userName = req.body.Username;
    const passWord = req.body.Password;
    
    const emailData = {
        Name : 'email',
        Value : userName
    };

    const emailIdentity = new AmazonCognitoIdentity.CognitoUserAttribute(emailData);

    userPool.signUp(userName, passWord, [emailData], null, (err,data)=> {
        if(err){
            return console.error(err);
        }
        res.send(data.user);
    } );

  }); //read post request and create identity for users. Pass into userpool for registration. 


app.post('/login', async function(req,res){
    const userName = req.body.Username;
    const passWord = req.body.Password;

    const loginCredentials ={
        Username : userName,
        Password : passWord
    };

    const authentication = new AmazonCognitoIdentity.AuthenticationDetails(loginCredentials);

    const userDetails = {
      Username :  userName,
      Pool : userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails);
    cognitoUser.authenticateUser(authentication, {
        onSuccess: data=>{
            console.log(data);
            res.redirect('/dashboard');
        },
        onFailure: err=>{
            console.error(err);
            res.redirect('/login');
        }
    });

}); //read request for credentials. Pass into userpool check if correct. On success redirect to /dashboard else redirect back to /login.

app.post('/getNginxLogs', async function(req,res){
    const logPath = path.resolve(__dirname, '..','..','..','..','var','log','nginx','access.log');
    const logFile = fs.readFileSync(logPath, 'utf8');
    console.log(logFile);
    res.send(logFile.toString().split(/\n/));

}); //resolve path to access.logs for nginx located at var/log/nginx. Use file system to read logs. Convert to readable format. Resolve. 


var port = 8000;
app.listen(port, function() {
    console.log('Listening on port ' + port);
    console.log('localhost/register to get started');
  });