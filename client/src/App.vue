<template>
  <v-app dark>
    <v-toolbar app>
      <v-toolbar-title v-text="titleStr" class="headline"></v-toolbar-title>
      <v-toolbar-title v-text="addedItemStr"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <v-container fluid>
      </v-container>
    </v-content>
    <v-footer app></v-footer>
  </v-app>
</template>

<script>
import axios from 'axios';
import audioComponent from './components/Audio';
import videoComponent from './components/Video';
import imageComponent from './components/Image';
import mimeUtils from '../../common/mimeUtils';

import uuidv4 from 'uuid/v4';

export default {
  name: 'App',
  components: {
  },

  data () {
    return {
      titleStr: 'MediaShishKebab',
      addedItemStr: ''
    }
  },

  mounted: function() {
// this.doAuth();
    // console.dir(this.$config);
    this.getCollections();
  },


  methods: {
    getCollections() {

      console.dir(this.$config);

      // call server for JSON data
      fetch(`${this.$config.SERVER}`)
        .then(response => response.json())
        .then(response => {
          console.dir(response);

//       this.dayList = response.reverse();

    //       // if we have something, let's show the first day we know about
    //       if (this.dayList.length > 0) {
    //         this.getDay(this.dayList[0]);
    //         this.showDropHelp = 0;
    //       }
        })
        .catch(err => {
          console.log(err);
        });
    },

  }
}
</script>


<style lang="stylus">
@import './stylus/main'

</style>