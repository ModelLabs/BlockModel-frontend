import Vue from 'vue'
import App from './App.vue'
// indexedDB数据库
import indexedDB from '../src/indexDB/indexDB.js';

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

import store from './store'
import router from './router'

import './assets/AliIcon/iconfont'
import './assets/AliIcon/iconfont.css'
Vue.use(ElementUI)
Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999
  }
})
Vue.config.productionTip = false

Vue.prototype.$indexedDB = indexedDB;
// historyDB：数据库 historyData：数据表 1：数据库版本
indexedDB.openDB('historyDB', 'historyData', 1).then((res) => {
  // 两种方式实现无处访问db实例
  // 封装文件夹时使用
  window.$db = res;
  // 页面单独请求使用
  Vue.prototype.$db = res;
});

new Vue({

  render: h => h(App),
  store,
  router
}).$mount('#app')
