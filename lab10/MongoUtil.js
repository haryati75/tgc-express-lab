const MongoClient = require('mongodb').MongoClient;

// global variable
let _db;

// creates a connection to a mongo database
async function connect(url, dbname) {
    let client = await MongoClient.connect(url, {
        useUnifiedTopology: true
    })
    // selects which database to use
    _db = client.db(dbname);
    console.log("database connected");
}

function getDB() {
    return _db;
}

// export out (i.e share) connect and getDB functions
module.exports = {
    connect, getDB
}