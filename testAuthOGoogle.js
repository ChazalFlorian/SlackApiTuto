var request = require('request');

var login = "chazal.florian@gmail.com";
var password = "razor1911";
var clientId= "";


var URL = "https://accounts.google.com/o/oauth2/v2/auth?scope=profile&client_id=647482978801-5d8vlkntodl910g83eigboi41c8rgknr.apps.googleusercontent.com&response_type=code&redirect_uri=https://localhost/validateUser:8080";