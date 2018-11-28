// for use by client side
import Vue from 'vue'

const vueConfig = require('vue-config')
const configs = {
  ENV: 'Local Dev',
  CLIENT: 'http://localhost:8080',
  SERVER: 'http://localhost:8081',

  SERVER_API: 'http://localhost:8081/api',
  
  USE_DB: 1,
  USE_EMAIL: 0,
  USE_WP: 1,
  
  // point at your own WP server
  WP_HOST: 'http://wp.dls',
  
  // your login..
  WP_USER: 'daniel',
  
  // your password...
  WP_PASSWORD: 'root',
  USE_TMP: ''
}

Vue.use(vueConfig, configs)

// A param named `$config` will be injected in to every
// component, so in your component, you can get config easily
// const API = this.$config.API



