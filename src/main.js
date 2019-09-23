import Vue from 'vue'

import '@babel/polyfill'
import 'mutationobserver-shim'
import './plugins/buefy-vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

console.log('p', window.WebStreamsPolyfill)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
})
