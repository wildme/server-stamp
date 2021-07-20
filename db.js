const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', err => { console.error(err.message) });
db.once('open', () => console.log('Connection established'));

