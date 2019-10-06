import Vue from 'vue'
import Router from 'vue-router'
import getUrl from '../utils/getUrl'
import HelloWorld from '../components/HelloWorld.vue'
import Upload from '../components/Upload.vue'
import Download from '../components/Download.vue'
import NotFound from '../components/NotFound.vue'
import Files from '../components/Files.vue'
import Expire from '../components/Expire.vue'

Vue.use(Router)
const subPath = getUrl.subPath

export default new Router({
  routes: [
    {
      path: '*',
      name: 'NotFound',
      component: NotFound,
    },
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld,
    },
    {
      path: subPath.upload,
      name: 'Upload',
      component: Upload,
    },
    {
      path: `${subPath.download}:id`,
      name: 'Download',
      component: Download,
      props: true,
    },
    {
      path: '/files',
      name: 'Files',
      component: Files,
      props: true,
    },
    {
      path: '/expire',
      name: 'Expire',
      component: Expire,
      prop: true,
    },
  ],
})
