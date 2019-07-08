import Vue from 'vue'
import '@babel/polyfill'
import 'mutationobserver-shim'
import VueSocketIO from 'vue-socket.io'
import './plugins/buefy-vue'
import App from './App.vue'
import router from './router'

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: 'http://localhost:8090',
    vuex: {
      // store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_',
    },
    // options: { path: '/my-app/' }, // Optional options
  }),
)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
})
