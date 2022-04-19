# server-stamp
Server-side part of Stamp: Node.js, Express.js, MongoDB

## Used shell variables

export STAMP_EXPRESS_PORT=3000  
export STAMP_EXPRESS_STATIC_DIR='build'  
export STAMP_EXPRESS_UPLOAD_DIR='files'  
export STAMP_MONGODB='mongodb://127.0.0.1:27017/test'  
export STAMP_LANG='en-En' ***# BCP 47***  
export STAMP_MAX_FILESIZE=5000000 ***# in bytes. 5MB***  
export STAMP_JWT_ACCESS_SECRET='access_secret_string'  
export STAMP_JWT_REFRESH_SECRET='refresh_secret_string'  
export STAMP_JWT_COOKIE_AGE=28800000 ***# in milliseconds. 8 hours***  
export STAMP_JWT_ACCESS_EXP=600  ***# in seconds. 10 min***  
export STAMP_JWT_REFRESH_EXP=28800 ***# in seconds. 8 hours***  
export NODE_OPTIONS=--tls-min-v1.0 ***# (optional)***  
export STAMP_EXPRESS_SMTP_HOST=<hostname>  
export STAMP_EXPRESS_SMTP_PORT=587  
export STAMP_EXPRESS_SMTP_SECURE=0  
export STAMP_EXPRESS_SMTP_REJECT_UNAUTH=0  
export STAMP_EXPRESS_SMTP_FROM=email  
export STAMP_EXPRESS_SMTP_USER=username  
export STAMP_EXPRESS_SMTP_PASS=password  
