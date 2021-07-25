const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


const api = require('./middleware/api.js');
require('./db.js');

const app = express();
app.use('/api', cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const port =  process.env.PORT || 3001;

app.get('/api/inbox', api.getInboxApi);

app.listen(port, () => console.log(
  `Express is running at http://localhost:${port}`));
