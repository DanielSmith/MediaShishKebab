/*
**  utils.js
*/

const uuid = require("node-uuid");
const datefns = require('date-fns');
const fs = require('fs');
const { join } = require('path')
const sgMail = require('@sendgrid/mail');
const ssconfig = require("./config.json");


const ROOT_PUBLIC_DIR = './public';
const ROOT_UPLOAD_DIR = './public/uploads';


function checkDir(whichDir = '') {  

  const dir = `${ROOT_UPLOAD_DIR}/${whichDir}`;

  // in case we need the top level...
  if (!fs.existsSync(ROOT_PUBLIC_DIR)) {
      fs.mkdirSync(ROOT_PUBLIC_DIR);
  }
  if (!fs.existsSync(ROOT_UPLOAD_DIR)) {
      fs.mkdirSync(ROOT_UPLOAD_DIR);
  }
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
  }
}


function todayDir() {
  return  datefns.format(new Date(), 'YYYY-MM-DD');
}


function getDirs() {  

  checkDir();
  // a little long winded, just for clarity
  const entries = fs.readdirSync(ROOT_UPLOAD_DIR)
  let dirEntries = [];

  entries.map(file => {
    if (fs.lstatSync(`${ROOT_UPLOAD_DIR}/${file}`).isDirectory() && file[0] !== '.') {
      dirEntries.push(file);
    }
  });

  return dirEntries;
}

function getImages(dir = '') {
  let imageDir;
  let entries = [];
  let entryInfoObj = {};

  // if we dont have a directory specified, try today... 
  if (dir === '') {
    dir = todayDir();
  }

  // sanitize path .. seriously..
  // who knows what they they sent over? ;)
  dir = dir.replace(/[^a-zA-Z0-9-]/g, '');
  imageDir = `${ROOT_UPLOAD_DIR}/${dir}`;
 
  if (fs.existsSync(imageDir)) {
    entries = fs.readdirSync(imageDir);
  }

  entryInfoObj.dir = dir;
  entryInfoObj.entries = entries;

  return entryInfoObj;
}


function sendAdminEmail(mediaObject) {

  // expand on this.. all manner of checks that should be done
  // also, mediaObject is meant to be filled up with whatever details
  // you wish to send...
  if (ssconfig.USING_EMAIL === undefined || ssconfig.USING_EMAIL == 0) {
      return;
  }

  sgMail.setApiKey(ssconfig.SENDGRID_API_KEY);
  const subject = `New file uploaded: ${mediaObject.originalname}`;
  const toAddress = ssconfig.SS_ADMIN_EMAIL;
  const fromAddress = ssconfig.SS_ADMIN_FROM;
  
  const htmlEmail = `

    <p>
    Hello ${toAddress}
    </p>
    New File Upload: ${mediaObject.originalname}<br>
    <br>
    `;  
    
  const textEmail = `
    
    New File Upload: ${mediaObject.originalname}<br>

  `;

  const msg = {
    to: toAddress,
    from: fromAddress,
    subject: subject,
    text: textEmail,
    html: htmlEmail
  };
  sgMail.send(msg);
}


function createUploadFilename(ext) {
  const ts = datefns.getTime(new Date());
  const unique = uuid.v4();

  return `${ts}-${unique}${ext}`;  
}


// these belong in the commmon/mimeUtils.js module...
// need to resolve importing from vue and node sides...

let mimeUtils = {
  
  // since there is no server side DB,
  // we use the filename extension to map
  // to a type (image, audio, or video),
  // so that we know how to render
  mimeTable: {

    // images
    "image/jpeg": {
      type: "image",
      ext: "jpg"
    },

    "image/png": {
      type: "image",
      ext: "png"
    },

    "image/bmp": {
      type: "image",
      ext: "bmp"
    },

    "image/gif": {
      type: "image",
      ext: "gif"
    },
    
    // audio
    "audio/x-wav": {
      type: "audio",
      ext: "wav"
    },
    
    "audio/mpeg": {
      type: "audio",
      ext: "mp3"
    },
    
    // video
    "video/mp4": {
      type: "video",
      ext: "mp4"
    },

    "video/x-m4v": {
      type: "video",
      ext: "m4v"
    },

    "video/ogg": {
      type: "video",
      ext: "ogv"
    },
  }    
}


function getExt(theFile) {
  if (mimeUtils.mimeTable[theFile.mimetype]) {
    return mimeUtils.mimeTable[theFile.mimetype].ext;
  }
}


module.exports = {
  todayDir,
  checkDir,
  getDirs,
  getImages,
  createUploadFilename,
  getExt,
  sendAdminEmail
};
