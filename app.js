const express = require('express');
const cookieparser = require('cookie-parser');
//const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { mkdir, access, constants } = require('fs');
const api = require('./middleware/api.js');
const login = require('./middleware/login.js');
const token = require('./middleware/token.js');
const getFile = require('./middleware/file-upload.js');
const { WebSocket, WebSocketServer } = require('ws');

const app = express();
const port = Number(process.env.STAMP_EXPRESS_PORT) || 3000;
const staticDir = String(process.env.STAMP_EXPRESS_STATIC_DIR) || 'build';
const uploadDir = String(process.env.STAMP_EXPRESS_UPLOAD_DIR) || 'files';
const appDirs = [staticDir, uploadDir];
const wss = new WebSocketServer({ port: 8080 });

for (let i = 0; i < appDirs.length; i++) {
  access(appDirs[i], constants.F_OK, (err) => {
    if (err) {
      mkdir(appDirs[i], (err)  => {
        if (err) throw err;
      });
    }
  });
}

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

//app.use('/api', cors());
app.use(express.static(path.join(__dirname, staticDir)));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieparser());

login.init(app);

app.get('/api/page-reload', token.onPageReload);
app.get('/api/logout', login.logoutApi);
app.get('/api/contacts', token.authenticate, api.getContactsApi);
app.get('/api/contacts/search/by-name', token.authenticate, api.searchContactsApi);
app.get('/api/download/:file', token.authenticate, api.downloadFileApi);
app.get('/api/get/language', api.getAppLanguageApi);
app.get('/api/:box', token.authenticate, api.getItemsApi);
app.get('/api/edit/:box/:id', token.authenticate, api.fetchItemByIdApi);
app.get('/api/view/:box/:id', token.authenticate, api.getItemByIdApi);
app.get('/*', api.getReactIndex);
app.post('/api/login', login.loginApi);
app.post('/api/signup', api.signupApi);
app.post('/api/contacts/new', token.authenticate, api.addContactApi);
app.post('/api/reset/password', api.resetPasswordApi);
app.post('/api/user/update/settings', token.authenticate, api.updateUserSettingsApi);
app.post('/api/user/update/info', token.authenticate, api.updateUserInfoApi);
app.post('/api/user/update/email', token.authenticate, api.updateUserEmailApi);
app.post('/api/user/update/password', token.authenticate, api.updateUserPasswordApi);
app.post('/api/:box/new', token.authenticate, api.addItemApi);
app.post('/api/:box/upload', token.authenticate, getFile.uploadFileApi);
app.put('/api/contact/update/:id', token.authenticate, api.updateContactByIdApi);
app.put('/api/:box/status/:id', token.authenticate, api.updateStatusApi);
app.put('/api/:box/update/:id', token.authenticate, api.updateItemByIdApi);
app.delete('/api/attachment/delete/:id', token.authenticate, api.deleteAttachmentByNameApi);
app.delete('/api/contact/delete/:id', token.authenticate, api.deleteContactByIdApi);

app.listen(port, () => {
  console.log(`Express is running on port ${port}`)
});
