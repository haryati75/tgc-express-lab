const express = require('express');
const hbs = require('hbs');

// 1. setup express
let app = express();

// 2. setup the view engine
app.set('view engine', 'hbs');

// 2b. setup static files
app.use(express.static('public'));

// ROUTES HERE!
app.get('/', function(req,res) {
    res.render('index.hbs')
})

app.get('/hello/:name', function(req,res) {
    let name = req.params.name;
    let luckyNumber = Math.floor(Math.random() * 1000);
    res.render('greetings.hbs', {
        'yourName': name,
        'lucky': luckyNumber
    })
})

// 3. Run server  (Always the last code)
app.listen(3000, ()=>{
    console.log("Server started")
})

