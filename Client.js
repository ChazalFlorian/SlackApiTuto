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
var jsdom = require('jsdom');

var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');
//var userinfo = google.userinfo;
var user_Gmail = 'chazal.florian@gmail.com';
var app = express();
//not sure about this
app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.static(__dirname));
jsdom.env("http://localhost:3000/*", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }

    var $ = require("jquery")(window);
});
app.set('view engine', 'jade');

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = '647482978801-5d8vlkntodl910g83eigboi41c8rgknr.apps.googleusercontent.com';
var CLIENT_SECRET = 'z1U__w3_kWa9QX6FyWJVZAdV';
var REDIRECT_URL = 'http://localhost:3000/oAuth/token';
var user_id = "";
var user_token = "";
var frameURL= "http://frame.io/?p=HxRKBtbH";
var userData = [];

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
    callback(url);
}

function getAccessToken(code){
        oauth2Client.getToken(code, function(err, tokens) {
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
            //console.log('Status:', response.statusCode);
            //console.log('Headers:', JSON.stringify(response.headers));
            //console.log('Response:', body);
            body = JSON.parse(body);
            user_id = body['x'];
            user_token = body['y'];
            getUserInfosFromFrame(user_id, user_token);
        })
}

function connectToFrameWithoutGoogle(){
    request({
        method: 'POST',
        url: 'https://api.frame.io/login',
        headers: {
        'Content-Type': 'application/json'
    },
    body: "{  \"a\": \"cedric.delport@woowyourlife.com\",  \"b\": \"mononoke01\"}"
}, function (error, response, body) {
        //console.log('Status:', response.statusCode);
        //console.log('Headers:', JSON.stringify(response.headers));
        //console.log('Response:', body);
        body = JSON.parse(body);
        user_id = body['x'];
        user_token = body['y'];
        getUserInfosFromFrame(user_id, user_token);
    });
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
        //console.log("Status:", res.statusCode);
        //console.log("Headers:", JSON.stringify(res.headers));
        //console.log("Response:", body);
        userData = JSON.parse(body)['user'];
        //console.log(userData);
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
        //console.log('Status:', res.statusCode);
        //console.log('Headers:', JSON.stringify(res.headers));
        console.log('Response:', body);
    })
}

function createFolder(){
    request({

    })
}

function addCollaborator(projectId, collabMail, collabId){
    if(collabId !== 'undefined'){
        var body = "{\"t\": \""+user_token+"\", \"mid\": \""+user_id+"\", \"pid\": \""+projectId+"\", \"emails\": \""+collabMail+"\", \"cids\": \""+collabId+"\", \"client\": \""+frameURL+"\"}";
    }else{
        var body = "{\"t\": \""+user_token+"\", \"mid\": \""+user_id+"\", \"pid\": \""+projectId+"\", \"emails\": \""+collabMail+"\", \"client\": \""+frameURL+"\"}"
    }
    request({
        method: 'POST',
        url: 'https://api.frame.io/projects/share',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    },function(err, response, body){
        console.log('Status:', response.statusCode);
        console.log('Headers:', JSON.stringify(response.headers));
        console.log('Response:', body);
    })
}

function addProject(projectName){

}

function addTeam(teamName, callback){
    localResponse = "";
    console.log(teamName);
    console.log(user_id);
    console.log(user_token);
    request({
        method: 'POST',
        url: 'https://api.frame.io/users/'+user_id+'/teams/create',
        headers: {
            'Content-Type': 'application/json'
        },
        body: "{\"name\": \""+teamName+"\", \"mid\": \""+user_id+"\", \"t\": \""+user_token+"\"}"
    }, function(error, response, body){
        localResponse = response;
        console.log('Status:', response.statusCode);
        console.log('Headers:', JSON.stringify(response.headers));
        console.log('Response:', body);
    });
    if(localResponse.statusCode == "200"){
        callback(true);
    }else{
        callback(false);
    }
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
    res.render('index', {message: "Welcome Home"});
    //res.sendFile(__dirname + "/views/index.html");
});

app.get('/frame', function(req, res){
    if(req.query.length != 0){
        connectToFrameWithoutGoogle(req.params.email, req.params.password);
        res.redirect('/app');
    }else{
        res.render('login');
    }
});

app.post('/email', function(req, res){
    var email = req.body.email;
    var AuthUrl = "";

    checkUser(email, function(status){
        try{
            if(status == "user-google"){
                res.write("<p>Google utilisateur</p>");
                getAuthUrlToken(oauth2Client, function(url) {
                    AuthUrl = url;
                });
                res.redirect(AuthUrl);
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
    //res.writeHead(200, {"Content-Type": "text/html"});
    //console.log(req.query['code']);
    getAccessToken(req.query['code']);
    //res.write("<span>Vous allez etre redirigé d'ici quelques instants</span>");
    res.redirect('/app');
});


app.get('/app', function(req, res, body){
   res.render('app', {userData: userData});
});

app.get('/app/team/add', function(req, res, body){
    addTeam('test', function(status){
        console.log(status);
        //if(status === true){
       //     res.write("<div>Team Crée!</div>");
       //     res.send();
       // }else{
       //     res.write("<div>Something went Wrong</div>");
       //     res.send();
       // }
    });
});

function getProjectByName(query){
    var projectByName = new Array;
    //console.log(userData['teams']);
    //console.log(userData['teams'][0]['projects'][0]);
    for (var valX in userData['teams']){
        for (var valY in userData['teams'][valX]['projects']){
            if(userData['teams'][valX]['projects'][valY]['name'] == query){
                projectByName.push(userData['teams'][valX]['projects'][valY]);
            }
        }
    }
    console.log(projectByName);
    return projectByName;
}

function getAllProject(){
    var projects = new Array;

}

function getProjectById(query){
    var projectById = new Array;
    for (var valX in userData['teams']){
        for (var valY in userData['teams'][valX]['projects']){
            if(userData['teams'][valX]['projects'][valY]['id'] == query){
                projectById.push(userData['teams'][valX]['projects'][valY]);
            }
        }
    }
    //console.log(projectById);
    return projectById;
}

function getFoldersByProjectId(id, folderId, callback){
    request({
        method: 'POST',
        url: 'https://api.frame.io/folders/'+folderId,
        headers: {
        'Content-Type': 'application/json'
    },
    body: "{\"mid\": \""+user_id+"\", \"t\": \""+user_token+"\", \"aid\": \""+id+"\"}"
}, function (error, response, body) {
        //console.log('Status:', response.statusCode);
        //console.log('Headers:', JSON.stringify(response.headers));
        //console.log('Response:', body);
        callback(JSON.parse(body));
    });
}

app.get('/app/project/:id', function(req, res, body){
    var id = req.params.id;
    var project = getProjectById(id);
    getFoldersByProjectId(id, project[0]['root_folder_key'], function(folders){
        console.log(folders['folder']);
        res.render('project', {project: project[0], folders: folders['folder']});
    });
});

app.get('/app/add/collaborator', function(req, res, body){
    var exampleProjectName = "Demo Project";
    var exampleProjectId = "HxRKBtbH";
    var nameResult = getProjectByName(exampleProjectName);
    var idResult = getProjectById(exampleProjectId);
    res.write("Result by Name: "+nameResult[0]);
    res.write("<br>");
    res.write("Result by Id: "+idResult[0]);
    res.send();
});

getAuthUrlToken(oauth2Client, function(AuthUrl){
    console.log(AuthUrl);
});

app.listen(3000);