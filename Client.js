/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var readline = require('readline');
var request = require('request');
var express = require('express');
var jade = require('jade');
var bodyParser = require('body-parser');
var $ = require('jquery');

var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');
//var userinfo = google.userinfo;
var user_Gmail = 'chazal.florian.blz@gmail.com';
var app = express();
app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.static(__dirname));

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '647482978801-5d8vlkntodl910g83eigboi41c8rgknr.apps.googleusercontent.com';
var CLIENT_SECRET = 'z1U__w3_kWa9QX6FyWJVZAdV';
var REDIRECT_URL = 'http://localhost:3000/oAuth/token';
var user_id = "";
var user_token = "";

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getAuthUrlToken(oauth2Client, callback) {
    // generate consent page url
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // will return a refresh token
        //Frame.Io needs both profile and email from userinfo
        scope:
            [
            'profile',
            'email'
            ] // can be a space-delimited string or an array of scopes
    });
    console.log('Visit the url: ', url);
    callback(url);
}

function getAccessToken(code){
        oauth2Client.getToken(code, function(err, tokens) {
            //console.log(code);
            console.log(tokens.access_token);
            // set tokens to the client
            // TODO: tokens should be set by OAuth2 client.
            oauth2Client.setCredentials(tokens);
            connectToFrame(tokens.access_token, user_Gmail);
        });
}

function connectToFrame(access_token, user_Gmail){
    request({
        method: "POST",
        url: 'https://api.frame.io/sessions/validate_token',
        headers: {
            'Content-Type': 'application/json'
        },
        body: "{  \"email\": \""+user_Gmail+"\",  \"access_token\": \""+access_token+"\"}"
        }, function (error, response, body) {
            console.log('Status:', response.statusCode);
            console.log('Headers:', JSON.stringify(response.headers));
            console.log('Response:', body);
            body = JSON.parse(body);
            user_id = body['x'];
            user_token = body['y'];
            getUserInfosFromFrame(user_id, user_token);
        })
}

function getUserInfosFromFrame(user_id, user_token){
    request({
        method: 'POST',
        url: 'https://api.frame.io/users/'+user_id+'/data',
        headers: {
            'Content-Type': 'application/json'
        },
        body: "{\"mid\": \""+user_id+"\", \"t\": \""+user_token+"\"}"
    }, function(req, res, body){
        console.log("Status:", res.statusCode);
        console.log("Headers:", JSON.stringify(res.headers));
        console.log("Response:", body);
    });
}

function createProject(){

}

function commentSubject(fileId, appUrl, user_id, user_token, projectId, comments){
    request({
        method: 'POST',
        url: 'https://api.frame.io/file_references/'+fileId+'/comments',
        headers: {
            'Content-Type': 'application/json'
        },
        body: "{" +
        "\"mid\": \""+user_id+"\"" +
        "\"t\": \""+user_token+"\"" +
        "\"aid\": \""+projectId+"\"" +
        "\"client\": \""+appUrl+"\"" +
        "\"comments\": "+comments +
        "}"
    }, function(req, res, body){
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers));
        console.log('Response:', body);
    })
}

function createFolder(){
    request({

    })
}

function addProject(){

}

function uploadFiles(){

}

function checkUser($mail, callback){
    request({
        method: 'POST',
        url: 'https://api.frame.io/users/check_elegible',
        headers: {
            'Content-Type': 'application/json'
            },
        body: "{  \"email\": \""+$mail+"\"}"
        }, function (error, response, body) {
        body = JSON.parse(body);
        callback(body['action_key']);
    })
}

app.get('/', function(req, res){
    var AuthUrl = "";
    getAuthUrlToken(oauth2Client, function(url) {
        AuthUrl = url;
    });
    res.sendFile(__dirname + "/templates/index.html");
});

app.post('/email', function(req, res){
    var email = req.body.email;
    res.writeHead(200, {"Content-Type": "text/html"});

    checkUser(email, function(status){
        try{
            if(status == "user-google"){
                res.write("<p>Google utilisateur</p>");
            }else if(status == 'user-non-google'){
                res.write("<p>non google utilisateur</p>");
            }else if (status == 'user-eligible'){
                res.write("<p>non inscrit</p>");
            }else{
                throw new Error("An error occured while submitting the Email")
            }
        }catch(e){
            console.log(e.name + ' ' + e.message);
        }
    });
});

app.get('/oauth/token', function(req, res, body){
    res.writeHead(200, {"Content-Type": "text/html"});
    //console.log(req.query['code']);
    getAccessToken(req.query['code']);
    res.write("<span>Vous allez etre redirigé d'ici quelques instants</span>");
    res.redirect('/app');
});


app.get('/app', function(req, res, body){
   res.writeHead(200, {'Content-Type': "text/html"});
    res.write("<div>" +
        "<p><a name=\"addProject\">Ajouter un projet</a></p>" +
        "<p><a name=\"commentSubject\"> commenter</a></p>" +
        "<p><a name=\"createFolder\"> créer un dossier</a></p>" +
        "<p><a name=\"createProject\">créer un projet</a></p>" +
        "<p><a name=\"uploadFiles\">uploader un ficheri</a></p>" +
        "</div>");
});

app.listen(3000);