import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './actions'
Vue.use(Vuex)
const state = {
    //全局画布
    graph: null,
    // 测算引擎
    model: null,
    editNode: null,
    simulating:false,
    //系统参数
    configData: {
        simulationDays: 0,
        simulationSlot: 0,
        disabled: true,
        globalVars: {
            var_key:[],
            var_value:[]
        },

    },
    //测算次数
    nonce: 0,
    //历史测算数据
    historySimulateData: [{
        data: [
            
        ]
    }],
    //INDEXDB + 历史测算数据
    getHistoryDataFromIndexDB:[],

    uploadDialog: false,
    //web3用户登陆相关
    web3Provider: null,
    user: null,
    userEmail: null,

    //后端响应状态码
    statusCode: {
        SUCCESSED: '500'
    },

    //详情页数据
    detailModelData: null,

    //rule列表
    ruleLists: [],

    editRule: null,
    ruleEditShow: { show: false, add: false, index: 0 },

    //Property Result
    propertyResult: null,

    // Chart Marker
    chartMarker:null,

    // All Marker Array
    markerArray: [],
    tmpMarkerArray: [],

    // 释放策略面板可见性
    visualPanelVisible: false,
    // mint 面板可见性
    mintPanelVisible: false,
    // 传递给 mint 弹窗的数据
    // step1 nodes data
    mintNodes:[],
    // step2 edges data
    mintEdges:[],
    // step3
    selectNodeData:[],
    selectVisualData:[],
    selectProperties:[],

    // V2 ：
    indexList:[],

    // mint data
    mintNodesId:[],
    mintEdgesId:[],
    mintModelData:[],
    mintVisualData:[],
    mintPropertyData:[],
}

export default new Vuex.Store({
    state,
    actions,
    mutations,
})