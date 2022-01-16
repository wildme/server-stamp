const express = require('express');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');

const api = require('./middleware/api.js');
require('./db.js');

const app = express();
const auth = require('./middleware/auth.js');
app.use('/api', cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieparser());
app.use(session({
  name: 'session-id',
  secret: '123-456-789',
  saveUninitialized: false,
  resave: false
}));

const port =  process.env.PORT || 3001;
auth.init(app);

app.get('/api/refresh/token', auth.refreshTokenApi);
app.get('/api/logout', auth.logoutApi);
app.get('/api/token', auth.refreshTokenApi);
app.get('/api/contacts', api.getContactsApi);
app.get('/api/contacts/search/by-name', api.searchContactsByNameApi);
app.get('/api/:box', api.getItemsApi);
app.get('/api/:box/:id', api.getItemByIdApi);
app.post('/api/verify/token', auth.verifyTokenApi);
app.post('/api/login', auth.loginApi);
app.post('/api/signup', api.signupApi);
app.post('/api/contacts/new', api.addContactApi);
app.post('/api/:box/new', api.addItemApi);
app.post('/api/:box/update/:id', api.updateItemByIdApi);

app.listen(port, () => console.log(
  `Express is running at http://localhost:${port}`));
