<template>
  <v-app light
    @dragover.native="dragOver"
    @drop.native="doDrop"
    @dragstart.native="dragOver"
    @dragend.native="dragEnd"
    @paste.native="onPaste($event)">

    <v-toolbar >
      <v-toolbar-title v-text="titleStr"></v-toolbar-title>
      <v-toolbar-title v-text="addedItemStr"></v-toolbar-title>
      <v-spacer></v-spacer>

    </v-toolbar>
    <main>
      <v-content class="blue-grey lighten-2">
        <v-container fluid>
          <v-layout row wrap>
              <v-flex xs4 v-if="this.$config.USE_DB">
                <v-text-field large
                  label="Search Tag"
                  v-model="name"
                ></v-text-field>

              </v-flex>
              <v-flex xs2 v-if="this.$config.USE_DB">
                <v-btn large
                  primary
                  @click="submit"
                >
                Submit
                </v-btn>
              </v-flex>
          </v-layout>
          <v-layout row v-if="this.showDropHelp">
            <v-flex xs12>
              <v-card flat pb-5>
                Drag or Paste Images...  dls
              </v-card>
            </v-flex>
          </v-layout>
          <v-flex xs12>
            <span v-for="curDay in this.dayList" :key="curDay">
              <v-btn round color="primary"
                @click="getDay(curDay)">
                {{ curDay }}
              </v-btn>
            </span>
          </v-flex>



          <v-layout row v-for="curItem in this.pastedList" :key="this.curKey++">
            <v-flex xs12>
              <v-card flat pb-5 class="newItemBorder">
                <img :src="curItem"> 
              </v-card>
              <v-spacer></v-spacer>

            </v-flex>
          </v-layout>

<!-- 
          <v-layout row v-for="curItem in this.addedList" :key="curItem.rowID">
            <v-flex xs6>
              <v-card flat pb-5 class="newItemBorder">

                <component :itemPath="curItem.data.src" :key="curItem.componentID" v-bind:is="curItem.componentType">
                </component>
              <v-spacer></v-spacer>

              </v-card>
            </v-flex>
          </v-layout>
          -->

          <!-- from simple directory listing -->

          <!--
          <v-layout row v-for="curItem in this.itemList" :key="curKey++">
            <v-flex xs12>
              <v-card class="text-xs-left" flat pb-5>

                <component :itemPath="getItemPath(curItem.data)" :key="curKey++" v-bind:is="curItem.componentType">
                </component>

              </v-card>
            </v-flex>
          </v-layout>
          -->


          <!-- or from DB -->
                 <!-- :key="componentKey++" -->
          <v-layout pb-5 row v-for="curItem in this.itemDBList"
                    :key="curItem.id">           

            <v-flex xs12>
              <v-card class="text-xs-left" flat pb-5>

                <component :itemPath="curItem.data"
                  v-bind:is="curItem.componentType">
                </component>

                <v-btn color="indigo" dark @click="toggleEdit(curItem.id)"><v-icon dark left>mode_edit</v-icon></v-btn>

                <v-form v-if="showEditTags[curItem.id]" ref="form">
                  <v-layout pl-5 row>
                    <v-flex xs4>
                      <v-text-field
                      label="Enter new tags"
                      v-model="allTagEdits[curItem.id]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-btn @click="submitTags(curItem.id)">Add Tags</v-btn>
                    </v-flex>
                  </v-layout>
                </v-form>
                <v-btn  v-for="curTag in allTags[curItem.id]"
                  @click="chooseTag(curItem.id, curTag)"
                  :key="this.tagKey++"
                  >
                  <strong> {{ curTag }} </strong> 
                  <span class="showEditTag" v-if="showEditTags[curItem.id]"> X  </span>
                </v-btn>
                <div>
                  <v-btn
                    @click="postWP(curItem)"
                    v-if="$config.USE_WP">Post to WordPress</v-btn>
                </div>
                <div>
                  <img id="image" />
                  </div>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </main>
  </v-app>
</template>

<script>
import axios from 'axios';
import audioComponent from './Audio';
import videoComponent from './Video';
import imageComponent from './Image';
import mimeUtils from '../../common/mimeUtils';

import uuidv4 from 'uuid/v4';

export default {
  components: {
    audioComponent,
    videoComponent,
    imageComponent
  },

  data () {
    return {
      currentView: 'videoComponent',
      curKey: 1,
      tagKey: 1,
      componentKey: 1,
      showDropHelp: 1,

      // put this in some global config
      SERVER_HOST: 'localhost',
      SERVER_PORT: '8081',

      // search modes
      BY_DAY: 1,
      BY_KEYWORD: 2,

      titleStr: 'SnapperStore',
      curItemDir: '',
      addedItemStr: '',
      name: '',

      clickCount: 1,

      allTags: {},
      allTagEdits: {},
      showEditTags: {},

      itemList: [],
      itemDBList: [],
      pastedList: [],
      addedList: [],
      dayList: [],

      // for WordPress
      authToken: '',
      mediaID: 0,
      mediaName: 'unknown',
    }
  },


  mounted: function() {
    this.doAuth();
    console.dir(this.$config);
    this.getCollections();
  },

  methods: {
    submit() {
      // go query for the tag(s
      this.name = this.name.trim();
      this.getMediaWithDB(this.name, this.BY_KEYWORD);
    },

    doAuth() {
      const wpAuthPoint = `${this.$config.WP_HOST}/wp-json/simple-jwt-authentication/v1/token`;
      let postData = {
        'username': this.$config.WP_USER,
        'password': this.$config.WP_PASSWORD
      };

      let axiosConfig = {};

      axios.post(wpAuthPoint, postData, axiosConfig)
        .then(response => {
          console.dir(response.data);
          this.authToken = response.data.token;
        }).catch(function(error) {
          console.log('Error on Authentication');
        });
    },

    postWP(curItem) {
      console.dir(curItem);
      let myData = this.toDataURL(curItem.data);
      console.log(myData);
    },


    blobResponse(e) {
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(this.response);
      document.querySelector("#image").src = imageUrl;
    },

    loadAsBlob(url) {

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.onload = this.blobResponse;
      xhr.send();

    },

 getBase64FromImageUrl(url) {
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {

        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        doUpload(dataURL);


        // alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    };

    img.src = url;

    return img;
}
,
    toDataURL(url) {
      return fetch(url,  { mode: 'cors',
                          headers: {
                            'Access-Control-Allow-Origin': '*'
                          }

              })
          .then((response)=> {
            console.dir( response);

            return response.blob();
          })
          .then(blob=> {
            var urlCreator = window.URL || window.webkitURL;

var fileOfBlob = new File([blob], 'aFileName.png');
this.doWPUpload(fileOfBlob);


console.dir(fileOfBlob);
               var imageUrl = urlCreator.createObjectURL(blob);


   document.querySelector("#image").src = imageUrl;

            return URL.createObjectURL(blob);
          });
    },

    // pasted from screen / region capture
    onPaste(event) {
      let index = 0;
      let items = (event.clipboardData || event.originalEvent.clipboardData).items;
      // TODO:  do a check here to see if it is an image...
      let imageItem = items[0];
      let imageFile = imageItem.getAsFile();
      if (imageItem.kind === 'file') {
        let reader = new FileReader();
        let URLObj = window.URL || window.webkitURL;
        let source = URLObj.createObjectURL(imageFile);
        this.createImage(source);
        reader.onload = (event) => {
          let myImage = new Image();
          myImage.src = event.target.result;
          myImage.onload = () => {
            this.doUpload(myImage);
          }
        };
        reader.readAsDataURL(imageFile);
        this.doUpload(imageFile);
      }
    },

    doDroppedFiles: function(event) {
      let theFiles = Array.from(event.dataTransfer.files);
      let that = this;

      theFiles.map(curFile => {
        // get file type
        let curFileData = mimeUtils.getData(curFile);

        // am sure this should be reworked.. hacked it from being
        // image-only to image, audio, or video
        let reader = new FileReader();
        reader.onload = (inner) => {
          let droppedItem = this.getNewElementForType(curFileData.type);
          let newObj = {};
          newObj.componentType = mimeUtils.getItemType(curFileData.ext);
          newObj.data = droppedItem;
          newObj.id = uuidv4();
          newObj.rowID = 'added_row_' + newObj.id;
          newObj.componentID = 'added_compoent_' + newObj.id;

          droppedItem.onload = () => {
            this.showDropHelp = 0;
          }
          droppedItem.src = reader.result;
          this.addedList.push(newObj);
        }

        reader.readAsDataURL(curFile);

        console.dir(curFile);
        this.doUpload(curFile, curFileData.ext);
      })
    },

    getNewElementForType(theType) {

      switch (theType) {
        case "image":
          return new Image();
          break;

        case "audio":
          return new Audio();
          break;

        case "video":
          return document.createElement('video');
          break;

        default:
          return ''; // what to use for this...?
          break;
      }
    },

    dragEnd: function(args) {
      args.preventDefault();
    },

    dragOver: function(args) {
      args.preventDefault();
    },

    createImage: function(source) {
      let pastedImage = new Image();

      pastedImage.onload = function() {
        // if we want to do anything special here..
      }
      pastedImage.src = source;
      this.pastedList.unshift(pastedImage.src);
      this.showDropHelp = 0;
    },
  
    doDrop: function(event) {
      event.preventDefault();
      this.doDroppedFiles(event);
    },

    toggleEdit(id) {
      this.showEditTags[id] = !this.showEditTags[id];
    },

    submitTags(id) {

      // rewrite this.. the empty and null cases can cause problems
      // am also being careful not to send an empty tag
      let tAry = (this.allTagEdits[id]).split(/ +/);
      tAry = tAry.filter(val => val !== '');

      if (tAry.length === 0) { tAry = ['']; }
      if (this.allTags[id] === null) { this.allTags[id] = []; }

      const newTagsAr = [...this.allTags[id], ...tAry].sort();
      let newTags = [...new Set(newTagsAr)];
      newTags = newTags.filter(val => val !== '');
      this.$set(this.allTags, id, newTags);

      this.showEditTags[id] = false;
      this.allTagEdits[id] = '';
      this.syncTags(id);
    },

    chooseTag(id, tag) {
      // are we editing, or doing a search?
      if (this.showEditTags[id]) {
        const newTags = this.allTags[id].filter(val => val !== tag);
        this.$set(this.allTags, id, newTags);
        this.syncTags(id);
      } else {
        tag = tag.trim();
        this.getMediaWithDB(tag, this.BY_KEYWORD);
      }
    },

    syncTags(id) {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const tags = this.allTags[id];

              apiPath = `http://${this.SERVER_HOST}:${this.SERVER_PORT}/api/getDayWithDB`;


      let apiPath = `${this.$config.SERVER_API}/synctags`,              
        dbArgs = { id: id, tagquery: tags };
      console.dir(dbArgs);


      axios.post(apiPath, dbArgs, config)
        .then(response => {
          console.log(response);
        })
        .catch(err => {
          console.log(err);
        });
    },


    getCollections() {
      // call server for JSON data
      fetch(`http://${this.SERVER_HOST}:${this.SERVER_PORT}`)
        .then(response => response.json())
        .then(response => {
          this.dayList = response.reverse();

          // if we have something, let's show the first day we know about
          if (this.dayList.length > 0) {
            this.getDay(this.dayList[0]);
            this.showDropHelp = 0;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    getDaySimple(theDay) {
      fetch(`http://${this.SERVER_HOST}:${this.SERVER_PORT}/${theDay}`)
        .then(response => response.json())
        .then(response => {
          response.map(cur => {
            let newObj = {};
            newObj.data = cur;


            console.dir(cur);
            newObj.componentType = mimeUtils.getItemType(cur);
            newObj.itemRowID = `item_${itemID}`

            this.itemList.push(newObj);
          })

          console.dir(this.itemList);
        })
        .catch(err => {
          console.log(err);
        });
    },


    getMediaWithDB(theArg, theMode = this.BY_DAY) {
      const config = { headers: { 'Content-Type': 'application/json' } };

      console.log(' getMediaWithDB...   ');

      let apiPath;
      let dbArgs = {};
    
      if (theMode === this.BY_DAY) {
        apiPath = `http://${this.SERVER_HOST}:${this.SERVER_PORT}/api/getDayWithDB`;
        dbArgs = { dayDir: theArg };
        console.dir(dbArgs);
      } else {
        apiPath = `http://${this.SERVER_HOST}:${this.SERVER_PORT}/api/gettags`,              
        dbArgs = { tagquery: theArg };
      }

      this.itemDBList = [];
      axios.post(apiPath, dbArgs, config)
        .then(response => {
          
          const mediaInfo = response.data.mediaInfo;
          console.dir(mediaInfo);

          mediaInfo.map(cur => {
            let newObj = {};

            newObj.data = `http://${this.SERVER_HOST}:${this.SERVER_PORT}/uploads/${cur.dayDir}/${cur.fileName}`;
            newObj.componentType = mimeUtils.getItemType(cur.path);
            newObj.tags = cur.tags;
            newObj.id = cur._id;
            newObj.component_id = 'component_' + cur._id;

            this.$set(this.showEditTags, newObj.id, false);
            this.$set(this.allTagEdits, newObj.id, '');
            this.$set(this.allTags, newObj.id, cur.tags);
            this.itemDBList.push(newObj);
          })
        })
        .catch(err => {
          console.log(err);
        });
    },

    // use to switch between methods of access
    getDay(theDay) {
      this.curItemDir = theDay;
      this.addedItemStr = '';

      this.itemList = [];
      this.itemDBList = [];
      this.addedList = [];      
      this.pastedList = [];
      this.titleStr = `SnapperStore - for day: ${theDay}`;      

      console.dir(this.$config);
      if (this.$config.USE_DB == 1) {
        console.log('using db.,... it 1...');
        this.getMediaWithDB(theDay, this.BY_DAY);
      } else {
        this.getDaySimple(theDay);
      }
    },


    doWPUpload(theFile) {
      const wpPostPoint = `${this.$config.WP_HOST}/wp-json/wp/v2/media`;

      // dont bother..
      if (theFile === null) {
        return;
      }
      this.msg = 'Uploading...';

      this.mediaName = theFile.name;
      let mediaMIME = mimeUtils.getData(theFile);
  
      let axiosConfig = {
        headers: {
          'Authorization': 'Bearer ' + this.authToken,
          'cache-control': 'no-cache',
          'content-disposition': `attachment; filename=${this.mediaName}`,
          'content-type': theFile.type
        }
      }

      console.dir(axiosConfig);


      let postData = theFile;
      let mediaURL = '';

      axios.post(wpPostPoint, postData, axiosConfig)
        .then(response => {                    
          mediaURL = response.data.source_url;
          this.mediaID = response.data.id * 1;
          this.doWPPost(mediaURL, mediaMIME);
        }).catch(function(error) {
          console.log('Error osn post');
          console.log(error);
        });
    },
  
      async doWPPost(url, theMIME) {
        const wpPostPoint = `${this.$config.WP_HOST}/wp-json/wp/v2/posts`;
        const wpTagPoint = `${this.$config.WP_HOST}/wp-json/wp/v2/tags`;
        this.thePost = this.getMediaCode(url, theMIME);

        let postData = {
          'title': this.mediaName,
          'content': this.thePost,
          'status': 'publish'
        }

        let axiosConfig = {
          headers: {
            'Authorization': 'Bearer ' + this.authToken
          }
        }


        // oh hey lets make a tag while we're at it
        let tagData = {
          'description': 'newtag',
          'name': 'newtag',
          'slug': 'newtag2',
          'meta': {}
        }

        let tagFind = 'kijhf';


        // update to use await...
        try {
          const theFind = await axios.get(wpTagPoint + '/?slug=' + tagFind, '', axiosConfig);
          console.dir(theFind);

        } catch(error) {
          console.log('Error on post...');
        }


        
        

        // // update to use await...
        // try {
        //   const theTag = await axios.post(wpTagPoint, tagData, axiosConfig);
        //   console.dir(theTag);

        // } catch(error) {
        //   console.log('Error on post...');
        // }


        

        // update to use await...
        try {
          const thePost = await axios.post(wpPostPoint, postData, axiosConfig)

        } catch(error) {
          console.log('Error on post...');
        }

        // this will need updating too.. the post is not actually done at this point...
        this.msg = this.defaultMsg;
      },



    getItemPath(curItem) {
      let itemPath =  `http://${this.SERVER_HOST}:${this.SERVER_PORT}/uploads/${this.curItemDir}/${curItem}`;
      return itemPath; 
    },

    doUpload(uploadFile, extension = "png") {
      const testTags = ['here', 'bridge', 'car'];
      const tagData = JSON.stringify(testTags);

      const uploadData = new FormData();
      uploadData.append('thefile', uploadFile);
      uploadData.append('extension', extension);
      uploadData.append('tags', tagData);

      const config = {
        headers: { 'content-type': 'multipart/form-data' }
      }

      this.addedItemStr = `adding items for today...`;
      axios.post(`http://${this.SERVER_HOST}:${this.SERVER_PORT}/api/fileupload`, uploadData, config)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
}
</script>

<style lang="stylus">
@import './stylus/main'
img {
  ignoremax-width: 400px;
}

.showEditTag {
  width: 100px;
}

.newItemBorder img,
.newItemBorder audio,
.newItemBorder video {
  border: solid 4px green;
}
</style>