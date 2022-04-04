const express = require('express');
const cookieparser = require('cookie-parser');
//const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { mkdir, access, constants } = require('fs');
const api = require('./middleware/api.js');
const auth = require('./middleware/auth.js');

const app = express();
const port = Number(process.env.STAMP_EXPRESS_PORT) || 3000;
const staticDir = String(process.env.STAMP_EXPRESS_STATIC_DIR) || 'build';
const uploadDir = String(process.env.STAMP_EXPRESS_UPLOAD_DIR) || 'files';
const appDirs = [staticDir, uploadDir];

for (let i = 0; i < appDirs.length; i++) {
  access(appDirs[i], constants.F_OK, (err) => {
    if (err) {
      mkdir(appDirs[i], (err)  => {
        if (err) throw err;
      });
    }
  });
}
//app.use('/api', cors());
app.use(express.static(path.join(__dirname, staticDir)));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieparser());

auth.init(app);

app.get('/api/refresh/token', auth.refreshTokenApi);
app.get('/api/logout', auth.logoutApi);
app.get('/api/token', auth.refreshTokenApi);
app.get('/api/contacts', api.getContactsApi);
app.get('/api/contacts/search/by-name', api.searchContactsByNameApi);
app.get('/api/download/:file', api.downloadFileApi);
app.get('/api/attachment/delete/:id', api.deleteAttachmentByIdApi);
app.get('/api/contact/delete/:id', api.deleteContactByIdApi);
app.get('/api/user/:user', api.getUserByNameApi);
app.get('/api/get/language', api.getAppLanguageApi);
app.get('/api/:box', api.getItemsApi);
app.get('/api/:box/:id', api.getItemByIdApi);
app.get('/api/attachment/:box/:id', api.getAttachmentByIdApi);
app.get('/*', api.getReactIndex);
app.post('/api/verify/token', auth.verifyTokenApi);
app.post('/api/login', auth.loginApi);
app.post('/api/signup', api.signupApi);
app.post('/api/contacts/new', api.addContactApi);
app.post('/api/user/update/email', api.updateUserEmailApi);
app.post('/api/user/update/info', api.updateUserInfoApi);
app.post('/api/user/update/password', api.updateUserPasswordApi);
app.post('/api/contact/update', api.updateContactByIdApi);
app.post('/api/:box/new', api.addItemApi);
app.post('/api/:box/upload/:id', api.uploadFileApi);
app.post('/api/:box/update/:id', api.updateItemByIdApi);
app.post('/api/:box/status/:id', api.updateStatusApi);

app.listen(port, () => {
  console.log(`Express is running on port ${port}`)
});
