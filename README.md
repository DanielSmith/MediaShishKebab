# Snapperstore

## Sample image, audio, and video upload client &amp; server


## Overview

This is an end-to-end example of how to upload images via paste or file drag/drop.  It also handles drag/drop of small audio(mp3) and video(mp4) files.  It's simply some scaffolding that uses these components:

* Vue.js, Vuetify
* Node.js, Express, Multer
* (optional) MongoDB support via mLab for search with tags 
* (optional) email support via SendGrid

It is not intended to be a production level example of validation, error handling, etc.  This is simply a quick example that I did for a friend.  It is mostly extracted from my <a href="https://github.com/DanielSmith/ThereThenThat-Server">ThereThenThat project</a>.

This uses Vue.js Dynamic Components.  This is a good alternative to having a lot of v-if/else within a template.

## Features

* display groups of images, audio(mp3), and video(mp4) by day uploaded
* drag one or more image, audio, or video files at a time to upload
* paste images from screen capture
* image preview as soon as dropped/pasted
* audio or video preview as soon as dropped
* auto-upload
* extensive tags (direct and multiple tag search) with (needs DB)
* can run with or without MongoDB
* email admin when new media uploades (needs SendGrid)

## Build Setup

After cloning the repository, you will see this directory structure:
```
snapperstore
├── snapstore-client
│   ├── public
│   └── src
└── snapstore-server
```
You may want to open up two shells - one for server, one for client.

### Server Side
``` bash
cd snapstore-server

```

The configuration for the server is kept in config.json:

```
{
  "USING_DB": 1,
  "USING_EMAIL": 0,
  "SENDGRID_API_KEY": "your sendgrid api key",
  "SS_ADMIN_EMAIL": "youradmin@yourdomain.com",
  "SS_ADMIN_FROM": "whoSentIt@example.com",
  "MONGO_DB_HOST": "mongo host",
  "MONGO_DB_CONNECT": "mongodb://localhost/snapperstore",
  "SERVER_ADDRESS": "http://localhost:3100",
  "CLIENT_ADDRESS": "http://localhost:8080"
}
```
The default is to refer to a local MongoDB, and not to use email.  More on this later in this document.

```
# install dependencies
npm install

# Node process will run at port 8081
npm run server
```

### Client Side

```
cd snapstore-client
```

The configuration for the client is kept in src/config.js:

```
const configs = {
  ENV: 'Local Dev',
  CLIENT: 'http://localhost:8080',
  SERVER: 'http://localhost:3100',
  USE_DB: 1,
  USE_EMAIL: 0
}

```
The `USE_DB` and `USE_EMAIL` should match what you have set up for the server side.


```
# install dependencies
npm install

# serve at localhost:8080
npm run dev
```

### Getting Started

*For an extensive writeup on how to deploy this on Digital Ocean, mLab, and SendGrid, see my Medium article TK*

Once the client and server sides are running, you will see a mostly empty page at http://localhost:8080/

Drag an image from your filesystem on to the page.  You should see an image preview of the file.  It should also automatically upload the file to the server side.

This should also work for audio(mp3) or small video(mp4) files.

If you refresh the browser, you will notice that there is now a button with today's date.  Snapperstore creates a new server side directory for each day (to avoid having to sift through more than a days worth of media at once)

Try a screen region capture, followed by a paste.

Refresh the page before trying to add tags to a new item.  (bug to be fixed)

### Tags

Using tags requires a database connection (local MongoDB, remote mLab, etc)

Tags can be used in two ways:

1. direct search by clicking on a tag (find all items with same tag)
2. search of one or more tags (AND, not OR) from top of page text input

**Editing Tags**

Clicking on the pencil button for any item will allow you to add and remove tags.

### Notes on DB and Email

SnapperStore will run without a DB.  It will store media items on the server, and you can browse them by day.

The default setup assumes you are running a local instance of MongoDB.  If you dont wish to set that up, an alternative is to use mLab.com.  That will let you point to a free sandbox MongoDB instance.

SnapperStore also has an example of calling email from Node.js.  To enable this, set up an account at https://sendgrid.com  Once you have that going, set `USE_EMAIL` to 1 on the client side (src/config.js) and `USING_EMAIL` to 1 on the server side (config.json).  Yes, these should be named the same for both sides (will update).  The example is pretty basic: Change the config file to utilize `SS_ADMIN_EMAIL` (who to send the email to) and `SS_ADMIN_FROM` (who it should appear to come from)

### End Note

This started as a sample end to end project for Vue, Node, handling media and tags, and attaching a couple of external services.  It is not meant to be a production quality example.  The tag editing will make its way into my ThereThenThat project.
