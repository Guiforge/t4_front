import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import Upload from '../components/Upload.vue'
import Download from '../components/Download.vue'
import NotFound from '../components/404.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '*',
      name: '404',
      component: NotFound,
    },
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld,
    },
    {
      path: '/upload',
      name: 'Upload',
      component: Upload,
    },
    {
      path: '/D/:id',
      name: 'Download',
      component: Download,
      props: true,
    },
  ],
})
