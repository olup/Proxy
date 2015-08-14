// Load modules

var express = require('express');
var = httpProxy = require('http-proxy');
var fs = require('fs');
var bodyParser = require('body-parser');

// set up general var

var app = express();
var proxy = httpProxy.createProxyServer({});
var rules = [];

// Set up Jade

app.set('view engine', 'jade');

// Prepare Post request decode

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Two functions to load and save the "rules" object in a file

var getRules = function(){

  fs.readFile('rules.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    rules = JSON.parse(data);
  });

}

var saveRules = function(){

  fs.writeFile('rules.txt', JSON.stringify(rules), function (err) {
    if (err) return console.log(err);
    console.log('base saved');
  });

}

// Main part
//----------


// load the proxy rules

getRules();

// Routing
// -------

// First, all the admin-related logic

// Show the rules

app.get('/proxy/admin', function (req,res){
  getRules();
  res.render('admin', { rules : rules });
});

// Add a rule

app.post('/proxy/admin', function (req,res){
  rules.push({host : req.body.host, path : req.body.path, target : req.body.target, removePath : req.body.removePath?true:false, mono : req.body.mono?true:false});
  saveRules();
  res.redirect("/proxy/admin");
});

// Delete a rule

app.get('/proxy/admin/:id/delete', function (req,res){
  rules.splice(req.params.id, 1);
  saveRules();
  res.redirect("/proxy/admin");
});

// The proxy itself : apply to all other request

app.all('/*', function (req, res) {

  host = req.header('host'); // Get the host from the request
  url = req.originalUrl; // Get the path from the request

  rules.forEach(function(e, i, a){ // For every rule

    if (host == e.host){ // Check if required host match one rule

      if ( (url == "/" && e.path == "/") || (url.indexOf(e.path) > -1 && e.path!="/")) { // Check if the path fits the rule or if we require the root

        var newPath = url;

        // If option Clean url is on, then erase the path of the rule to the path to redirect
        if(e.removePath==true && url!="/") {

          newPath = url.replace(e.path,'');
          console.log('rewriting Path');

        }

        // If option Mono is on, then the redirect path is empty
        if(e.mono==true) newPath = '';

        // Do the redirection
        proxy.web(req, res, { target: 'http://' + e.target + newPath, ignorePath:true});

        console.log('redirect to ', 'http://'+e.target+newPath)

      }

    }

  });


  console.log("url :", url,"/ host : ", req.header('host'));

});

// Lauch Server on port 80 to route natural http:// request
//---------------------------------------------------------

var server = app.listen(80, function () {
console.log("proxy ON");
});


// Second server for tests

var app2 = express();

app2.get('/*', function (req, res) {
  res.send("Bonjour. Vous êtes sur le posrt 3000, et vous essayez d'accesr au Path : " + req.originalUrl);
});

var server2 = app2.listen(3000, function () {
});
