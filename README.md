# Super easy node.js proxy

##A little server proxying incoming request depending on requested host and part of path

This little proxy server can follow a set of rules to redirect your request to a different port or a different sub-folder.

It uses the very great node.js [http-proxy](https://github.com/nodejitsu/node-http-proxy) from Nodejitsu to do the real stuff. The rest is just a file to host the rules as JSON object, and a simple admin panel to manage the rules.

Basically there is two ways to organize redirections : by requested host and by requested path. 

For example, if you have two domain names pointing to your server, you can have them redirected to two different folders of an apache server, or to two different ports of the server.

The same goes for path. *mywebsite.com/* will go to the apache server on port 3000 but *mywebsite.com/node/* could go to the node server on port 8000.

All the admin is done in */proxy/admin*. There you will have the list of your routes, delete and add.

Also, the rules have a "Clean Path" option : if true, then the piece of path used to identify the redirection (*/node* for example) can be erased from the path of the redirect url. So *mysite.com/node/image/test.jpg* could route to *mysite.com:8000/image/test.jpg*

A first github project from Loup Topalian.
