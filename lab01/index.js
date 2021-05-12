// import in the express package
const express = require('express');

// create a variable to store the express application
const app = express();

// define a new route
// a route is a URL on your server that the browser can access
app.get('/', function(req, res) {
    // req -> request (i.e, what the browser sends to the server)
    // res -> response (i.e, what your server will send back)
    res.send('<h1>Hello from TGC world</h1>')
})

// expose the server for the other browsers to connect to the 
// 3000 is the port number
app.listen(3000, function() {
    console.log("server started")
})
