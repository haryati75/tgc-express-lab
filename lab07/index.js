// include express, hbs and wax-on
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const axios = require('axios');

// 1. create the express app
let app = express();

// 1b. set the view engine
app.set('view engine', 'hbs');

// 1c. set up the wax on
wax.on(hbs.handlebars);

// This is where HBS will look for any file that we are extending from
wax.setLayoutPath('./views/layout');

// enable forms
// ULTRA-IMPORTANT in FORMS
app.use(express.urlencoded({
    extended: false
}))

const baseURL = 'https://petstore.swagger.io/v2';

// *************************************************************************
// 2. ROUTES
app.get('/pets', async function(req,res){
    let response = await axios.get(baseURL + '/pet/findByStatus', {
        params: {
            'status':'available'
        }
    });
    res.render('pets', {
        'allPets': response.data
    })
    // console.log(response.data)
})


// *************************************************************************
// 3. START SERVER
app.listen(3000, function() {
    console.log("Server has started")
})



