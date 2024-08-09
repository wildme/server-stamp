# server-stamp
Server-side part of Stamp: Node.js, Express.js, MongoDB

## shell variables

export STAMP_EXPRESS_PORT=3000  
export STAMP_WEBSOCKET_PORT=3080 ***# default 8080***  
export STAMP_EXPRESS_STATIC_DIR='build'  
export STAMP_EXPRESS_UPLOAD_DIR='files'  
export STAMP_MONGODB='mongodb://<MONGODB_ADDRESS>:27017/stamp'  
export STAMP_LANG='en-En' ***# BCP 47***  
export STAMP_MAX_FILESIZE=5000000 ***# in bytes. 5MB***  
export STAMP_SESSION_AGE=2592000000 ***# 30 days***  
export STAMP_SESSION_SECRET=<VERY_LONG_STRING>  
export STAMP_JWT_ACCESS_SECRET=<VERY_LONG_STRING_1>  
export STAMP_JWT_REFRESH_SECRET=<VERY_LONG_STRING_2>  
export STAMP_JWT_COOKIE_AGE=28800000 ***# in milliseconds. 8 hours***  
export STAMP_JWT_ACCESS_EXP=600  ***# in seconds. 10 min***  
export STAMP_JWT_REFRESH_EXP=28800 ***# in seconds. 8 hours***  
export NODE_OPTIONS=--tls-min-v1.0 ***# (optional)***  
export NODE_ENV=production   
export STAMP_EXPRESS_SMTP_HOST=<SMTP_ADDRESS>  
export STAMP_EXPRESS_SMTP_PORT=<SMTP_PORT>  
export STAMP_EXPRESS_SMTP_SECURE=0  
export STAMP_EXPRESS_SMTP_REJECT_UNAUTH=0  
export STAMP_EXPRESS_SMTP_FROM=<EMAIL_ADRESS>  
export STAMP_EXPRESS_SMTP_USER=<USERNAME>    
export STAMP_EXPRESS_SMTP_PASS=<PASSWORD>    
