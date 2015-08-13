var express = require('express');
httpProxy = require('http-proxy');
var fs = require('fs');
var bodyParser = require('body-parser');



var app = express();
var proxy = httpProxy.createProxyServer({});
var rules = [];

app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//fonction sauver et lire la base de donnée de règles

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

// Lancer l'ap

// lire la base

getRules();

app.get('/proxy/admin', function (req,res){
  getRules();
  res.render('admin', { rules : rules });
});

app.post('/proxy/admin', function (req,res){
  rules.push({host : req.body.host, path : req.body.path, target : req.body.target, removePath : req.body.removePath?true:false, mono : req.body.mono?true:false});
  saveRules();
  res.redirect("/proxy/admin");
});

app.get('/proxy/admin/:id/delete', function (req,res){
  rules.splice(req.params.id, 1);
  saveRules();
  res.redirect("/proxy/admin");
});

app.all('/*', function (req, res) {

  url = req.originalUrl;

  rules.forEach(function(e, i, a){

    if (req.header('host') == e.host){

      if ( (url == "/" && e.path == "/") || (url.indexOf(e.path) > -1 && e.path!="/")) {

        var newPath;
        newPath = url;

        if(e.removePath==true && url!="/") {
          newPath = url.replace(e.path,'');
          console.log('rewriting Path');
        }

        //if(e.mono==true) newPath = '';

        proxy.web(req, res, { target: 'http://' + e.target + newPath, ignorePath:true});

        console.log('redirect to ', 'http://'+e.target+newPath)

      }

    }

  });


  console.log("url :", url,"/ host : ", req.header('host'));

});

var server = app.listen(80, function () {
console.log("proxy ON");
});


//second server for tests

var app2 = express();

app2.get('/*', function (req, res) {
  res.send("Bonjour. Vous êtes sur le posrt 3000, et vous essayez d'accesr au Path : " + req.originalUrl);
});


var server2 = app2.listen(3000, function () {
});
