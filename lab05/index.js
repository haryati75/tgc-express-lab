const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

let app = express();

app.set('view engine', 'hbs');
app.use(express.static('public'));

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    if (arg1 == arg2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
})

app.get('/fruits', function(req, res) {
    let fruits = ['apples','bananas','oranges']
    res.render('fruits.hbs', {
        'fruits': fruits
    })
})

app.listen(3000, function() {
    console.log('Server has started')
})