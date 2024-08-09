const express = require('express');
const session = require('express-session');
const cookieparser = require('cookie-parser');
//const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { mkdir, access, constants } = require('fs');
const api = require('./middleware/api.js');
const login = require('./middleware/login.js');
const token = require('./middleware/token.js');
const getFile = require('./middleware/file-upload.js');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
const port = Number(process.env.STAMP_EXPRESS_PORT) || 3000;
const wssPort = Number(process.env.STAMP_WEBSOCKET_PORT) || 8080;
const staticDir = String(process.env.STAMP_EXPRESS_STATIC_DIR) || 'build';
const uploadDir = String(process.env.STAMP_EXPRESS_UPLOAD_DIR) || 'files';
const sessionSecret = String(process.env.STAMP_SESSION_SECRET) || 'zZq30P4LZNA0uV0';
const sessionOpts = {secret: sessionSecret, resave: false,
  saveUninitialized: true};
const appDirs = [staticDir, uploadDir];
const wss = new WebSocketServer({ port: wssPort });
let sockets = {inbox:[], outbox:[], directive:[]};

for (let i = 0; i < appDirs.length; i++) {
  access(appDirs[i], constants.F_OK, (err) => {
    if (err) {
      mkdir(appDirs[i], (err)  => {
        if (err) throw err;
      });
    }
  });
}

const server = app.listen(port, () => {
  console.log(`Express is running on port ${port}`)
});

process.on('SIGINT', () => {
  server.close(() => {console.log("Express closed");})
});

wss.on('connection', function connection(ws, req) {
  const doc = req.url.slice(1);
  if (doc === 'inbox') sockets.inbox.push(ws);
  if (doc === 'outbox') sockets.outbox.push(ws);
  if (doc === 'directive') sockets.directive.push(ws);
  ws.on('message', function message(data) {
    sockets[doc].forEach(function(socket) {
      if (socket !== ws && socket.readyState === WebSocket.OPEN) {
        socket.send(data.toString());
      }
    });
  });
  ws.on('close', function() {
    sockets[doc] = sockets[doc].filter(s => s !== ws);
  });
});

//app.use('/api', cors());
app.use(express.static(path.join(__dirname, staticDir)));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieparser());
app.use(session(sessionOpts));

login.init(app);

app.get('/api/page-reload', token.onPageReload);
app.get('/api/logout', login.logoutApi);
app.get('/api/contacts', token.authenticate, api.getContactsApi);
app.get('/api/get/language', api.getAppLanguageApi);
app.get('/api/get/codes/:doc', token.authenticate, api.getDocCodesApi);
app.get('/api/get/:doc', token.authenticate, api.getDirectivesApi);
app.get('/api/edit/directive/:id', token.authenticate, api.fetchDirectiveByIdApi);
app.get('/api/view/directive/:id', token.authenticate, api.getDirectiveByIdApi);
app.get('/api/get/:doc/nextid', token.authenticate, api.getNextDocIdApi);
app.get('/api/:doc', token.authenticate, api.getItemsApi);
app.get('/api/:box/nextid', token.authenticate, api.getNextRecordIdApi);
app.get('/api/edit/:box/:id', token.authenticate, api.fetchItemByIdApi);
app.get('/api/view/:box/:id', token.authenticate, api.getItemByIdApi);
app.get('/api/:doc/download/:file', token.authenticate, api.downloadFileApi);
app.get('/*', api.getReactIndex);
app.post('/api/login', login.loginApi);
app.post('/api/signup', api.signupApi);
app.post('/api/contacts/new', token.authenticate, api.addContactApi);
app.post('/api/reset/password', api.resetPasswordApi);
app.post('/api/directive/new', token.authenticate, api.addDirectiveApi);
app.post('/api/directive/upload', token.authenticate, getFile.uploadFileApi);
app.post('/api/:box/new', token.authenticate, api.addItemApi);
app.post('/api/:box/search-by-id', token.authenticate, api.searchRecordsByIdApi);
app.post('/api/:doc/upload', token.authenticate, getFile.uploadFileApi);
app.put('/api/user/update/info', token.authenticate, api.updateUserInfoApi);
app.put('/api/user/update/email', token.authenticate, api.updateUserEmailApi);
app.put('/api/user/update/password', token.authenticate, api.updateUserPasswordApi);
app.put('/api/user/update/settings', token.authenticate, api.updateUserSettingsApi);
app.put('/api/contact/update/:id', token.authenticate, api.updateContactByIdApi);
app.put('/api/directive/update/:id', token.authenticate, api.updateDirectiveByIdApi);
app.put('/api/:doc/status/:id', token.authenticate, api.updateStatusApi);
app.put('/api/:box/update/:id', token.authenticate, api.updateItemByIdApi);
app.delete('/api/:doc/attachment/delete/:id', token.authenticate, api.deleteAttachmentByNameApi);
app.delete('/api/contact/delete/:id', token.authenticate, api.deleteContactByIdApi);
