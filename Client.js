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

var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');
//var userinfo = google.userinfo;
var user_Gmail = 'chazal.florian.blz@gmail.com';
var app = express();

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

function getAccessToken(oauth2Client, callback) {
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
    rl.question('Enter the code here:', function(code) {
        // request access token
        oauth2Client.getToken(code, function(err, tokens) {
            //console.log(code);
            console.log(tokens.access_token);
            // set tokens to the client
            // TODO: tokens should be set by OAuth2 client.
            oauth2Client.setCredentials(tokens);
            access_token = tokens.access_token;
            connectToFrame(tokens.access_token, user_Gmail);
            callback(url);
        });
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

}

function addProject(){

}

function uploadFiles(){

}

// retrieve an access token
//getAccessToken(oauth2Client, function(url) {
    // retrieve user profile
//    plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
//        if (err) {
//            console.log('An error occured', err);
//            return;
//        }
//        console.log(profile.displayName, ':', profile.tagline);
//    });
//});

app.get('/', function(req, res){
    var AuthUrl = getAccessToken(oauth2Client, function(url) {
        return AuthUrl;
    });
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("<span>Welcome Home!</span>");
    request({
        method: 'GET',
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {

        }
    }, function(req, res, body){
        console.log(res);
    })
});

app.get('/oauth/token', function(req, res, body){
    res.writeHead(200, {"Content-Type": "text/html"});
    console.log(req.query['code']);
    res.write("<span>Vous allez etre redirigé d'ici quelques instants</span>");
});

app.listen(3000);