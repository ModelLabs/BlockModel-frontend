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

import Web3 from 'web3'
import axios from 'axios'

import './assets/AliIcon/iconfont'
import './assets/AliIcon/iconfont.css'

// set axios base url
axios.defaults.baseURL = 'http://54.67.58.4:3030'
Vue.prototype.axios = axios
Vue.prototype.Web3 = Web3;

Vue.use(ElementUI)
Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999
  }
})
Vue.config.productionTip = false

Vue.prototype.$indexedDB = indexedDB;
// historyDB：数据库 historyData：数据表 1：数据库版本
// 数据表：
// modelData: 存放模型的各历史版本数据
// --------------------------------------
// | version 版本| uid 对于modelData，暂时让 uid = version | graph 节点和边的数据| property 属性数据| env 环境数据|
// --------------------------------------
// 
// blackholeHistoryData: 存放 blackhole 组件的历史数据
// --------------------------------------
// | version 版本号 | uid 组件的 antv_id | label 组件的label字符串 | day 表示这是第几天的数据 | data 数据 |
// --------------------------------------
//
// genesisHistoryData: 存放 genesis 组件的历史数据
// --------------------------------------
// | version 版本号 | uid 组件的 antv_id | label 组件的label字符串 | day 表示这是第几天的数据 | data 数据 |
// --------------------------------------
//
// poolHistoryData: 存放 pool 组件的历史数据
// --------------------------------------
// | version 版本号 | uid 组件的 antv_id | label 组件的label字符串 | day 表示这是第几天的数据 | data 数据 |
// --------------------------------------
//
// stakeHistoryData: 存放 stake 组件的历史数据
// --------------------------------------
// | version 版本号 | uid 组件的 antv_id | label 组件的label字符串 | day 表示这是第几天的数据 | data 数据 |
// --------------------------------------
//
// edgeHistoryData: 存放 edge 的历史数据
// --------------------------------------
// | version 版本号 | uid 组件的 antv_id | day 表示这是第几天的数据 | data 数据 |
// --------------------------------------
//


// historySimulationData：存历史测算数据结果
// historyModelData：存历史模型配置属性值、测算天数配置、规则配置
// historyPropertyData：存历史规则配置及 marker 数据 ｜｜｜ 这部分先不做，因为规则检查还没有

indexedDB.openDB('historyDB', [
  'modelData', 'edgeHistoryData','historySimulationData','historyModelData',
  'blackholeHistoryData', 'genesisHistoryData', 'poolHistoryData', 'stakeholderHistoryData', 
  ], 1).then((res) => {
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
