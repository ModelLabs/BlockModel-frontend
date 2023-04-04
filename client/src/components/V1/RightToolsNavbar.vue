<template >
  <div class="top-container">
    <!-- 工具栏 -->
    <div class="tool-bar">
      <h4>Tools</h4>
      <el-tooltip
        class="tooltip"
        content="Enlarge"
        placement="bottom"
        effect="light"
      >
        <i @click="ZOOM_GRAPH('up')" class="el-icon-zoom-in"></i>
      </el-tooltip>
      <el-tooltip
        class="tooltip"
        content="Lessen"
        placement="bottom"
        effect="light"
      >
        <i @click="ZOOM_GRAPH('down')" class="el-icon-zoom-out"></i>
      </el-tooltip>
      <el-tooltip
        class="tooltip"
        content="Focus canvas "
        placement="bottom"
        effect="light"
      >
        <i @click="POSITIONING_GRAPH()" class="el-icon-full-screen"></i>
      </el-tooltip>
      <el-tooltip
        class="tooltip"
        content="Undo operation"
        placement="bottom"
        effect="light"
      >
        <i @click="UNDO_GRAPH()" class="el-icon-back"></i>
      </el-tooltip>
      <el-tooltip
        class="tooltip"
        content="Redo operation"
        placement="bottom"
        effect="light"
      >
        <i @click="REDO_GRAPH()" class="el-icon-right"></i>
      </el-tooltip>
      <el-tooltip
        class="tooltip"
        content="Download model"
        placement="bottom"
        effect="light"
      >
        <i @click="saveGraphToPNG()" class="el-icon-camera-solid"></i>
      </el-tooltip>

      <el-tooltip
        class="tooltip"
        content="Remove cells "
        placement="bottom"
        effect="light"
      >
        <i @click="REMOVE_CELLS()" class="el-icon-delete"></i>
      </el-tooltip>
      <el-tooltip
        class="tooltip"
        content="Start simulation"
        placement="bottom"
        effect="light"
        v-loading="loading"
      >
        <i @click="startSimulation()" class="el-icon-video-play"></i>
      </el-tooltip>

      <el-tooltip
        class="tooltip"
        content="Pause simulation"
        placement="bottom"
        effect="light"
      >
        <i @click="pauseSimulation()" class="el-icon-video-pause"></i>
      </el-tooltip>
      <el-tooltip
        class="tooltip"
        content="End simulation"
        placement="bottom"
        effect="light"
      >
        <i @click="endSimulation()" class="el-icon-circle-close"></i>
      </el-tooltip>
      <!--
        for test:
      -->
      <el-tooltip
        class="tooltip"
        content="一次成功"
        placement="bottom"
        effect="light"
      >
        <i @click="test()" class="el-icon-magic-stick"></i>
      </el-tooltip>

      <!-- <el-tooltip
          class="tooltip"
          content="Upload existing models"
          placement="bottom"
          effect="light"
        >
          <i @click="uploadGraph()" class="el-icon-upload2"></i>
        </el-tooltip>
        <el-tooltip
          class="tooltip"
          content="Download model"
          placement="bottom"
          effect="light"
        >
          <i @click="downloadGraph()" class="el-icon-download"></i>
        </el-tooltip> -->
    </div>

    <el-divider></el-divider>

    <!-- 系统参数栏 -->
    <div class="config-data-box">
      <h4>Date Configuration</h4>
      <span class="config-data-input">Simulation Days</span>
      <el-slider
        v-model="configData.simulationDays"
        class="day-slider"
        :min="1"
        :max="20000"
        :step="1"
        show-input
        input-size="mini"
        :change="modifyConfigData()"
      ></el-slider>
      <span class="config-data-input">Simulation Slot</span>

      <el-slider
        v-model="configData.simulationSlot"
        class="day-slider"
        :min="1"
        :max="20000"
        :step="1"
        show-input
        input-size="mini"
        :change="modifyConfigData()"
      ></el-slider>
      <span class="config-data-input">Current Day: </span>
      <span v-text="getModelTime()"></span>

      <!-- <div class="config-data-input">Current Day
          <div v-text="getModelTime()"></div>
        </div> -->
    </div>
    <!-- 系统参数修改按钮 -->
    <!-- <div class="config-button">
        <div class="setting">
          <i
            class="el-icon-setting"
            @click="modifyDisabled = !modifyDisabled"
            v-if="modifyDisabled"
          ></i>
          <i
            class="el-icon-success"
            @click="modifyConfigData()"
            v-if="!modifyDisabled"
          ></i>
        </div>
      </div> -->
  
    <el-divider></el-divider>
    <!-- <div class="graph-style-setting">
      <h4>Graph Settings</h4>
      <div class="bg-style-line">
        <span>Background:</span>
        <el-color-picker
          v-model="backgroundColor"
          show-alpha
          :predefine="predefineColors">
        </el-color-picker>
      </div>
      <div class="bg-style-line">
        <span>Grid Color:</span>
        <el-color-picker
          v-model="gridColor"
          show-alpha
          :predefine="predefineColors"
          class="grid-color-picker">
        </el-color-picker>
        <p></p>
      </div>
      <div class="bg-style-line">
        <span>Grid Type:</span>
        <el-select v-model="typeValue" placeholder="Dot">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>

      <div class="grid-size">
        <span>Grid Size:</span>
        <el-slider 
          v-model="sizeValue"
          :min="1"
          :max="20"
          :step="1"
          class="grid-size-slider">
        </el-slider>
      </div>

      <div class="grid-thickness">
        <span>Thickness:</span>
        <el-slider 
          v-model="thicknessValue"
          :min="0.5"
          :max="10"
          :step="0.5"
          class="grid-thickness-slider">
        </el-slider>
      </div>

      
    </div> -->
    <div class="global-vars-setting">
      <el-form 
        :model="dynamicValidateForm" 
        ref="dynamicValidateForm" 
        label-width="70px">

        <el-form-item
          class="form-item"
          v-for="(var_key, index) in dynamicValidateForm.var_key"
          :label="'key' + index"
          :key="var_key.key"
          :prop="'var_key.' + index + '.value'"
          :rules="{
            required: true, message: 'Please input var key', trigger: 'blur'
          }"
        >
          <el-input v-model="var_key.value" class="globalVar-edit-input" size="small"></el-input>
        </el-form-item>

        <el-form-item
          class="form-item"
          v-for="(var_value, index) in dynamicValidateForm.var_value"
          :label="'value' + index"
          :key="var_value.key"
          :prop="'var_value.' + index + '.value'"
          :rules="{
            required: true, message: 'Please input var value', trigger: 'blur'
          }"
        >
          <el-input v-model="var_value.value" class="globalVar-edit-input" size="small"></el-input>
          <el-button @click.prevent="removeDomain(var_value)" class="del-button" size="mini">-</el-button>
        </el-form-item>

        <el-form-item class="form-item">
          <el-button @click="addDomain" class="add-button" size="mini">+</el-button>
          <el-button 
            @click="submitForm('dynamicValidateForm')" 
            class="submit-button" 
            size="mini">Submit</el-button>
        </el-form-item>

      </el-form>    
    </div>
  
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import { Model } from "../../graph/model";
import { DataUri } from "@antv/x6";
import { setStore } from "../../utils/storage";
import { PropertyVisitor } from "../../graph/propertyVisitor";

import { Sleep } from "../../utils/sleep";

import { Simulate } from "../../simulation/Simulate";
import { ConsoleErrorListener } from 'antlr4/error/ErrorListener';

const antlr4 = require("antlr4");
const InputStream = antlr4.InputStream;
const CommonTokenStream = antlr4.CommonTokenStream;
const GrammarParser = require("../../parser/PropertyParser").PropertyParser;
const GrammarLexer = require("../../parser/PropertyLexer").PropertyLexer;

export default {
  data() {
    return {
      dynamicValidateForm: {
        var_key: [],
        var_value: [],
      },
      loading: false,
      currentSimulationDays: null,
      currentSimulationSlot: null,
      modifyDisabled: true,
      dialogLogInVisible: false,
      //从 IndexDB 中取历史测算数据
      getHDFromIndexDB:[],
      // 记录当前 index
      currentIndex:0,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      gridColor:'rgba(255, 255, 255, 1)',
      predefineColors: [
        '#ffffff',
        '#000000',
      ],
      options: [{
          value: 'dot',
          label: 'Dot'
        }, 
        {
          value: 'fixedDot',
          label: 'Fixed Dot'
        }, 
        {
          value: 'mesh',
          label: 'Mesh'
        }, 
        {
          value: 'doubleMesh',
          label: 'Double Mesh'
        }],
      typeValue: "Dot",
      sizeValue: 1,
      thicknessValue: 1,
    };
  },
  components: {},
  methods: {
    ...mapMutations([
      "ZOOM_GRAPH",
      "POSITIONING_GRAPH",
      "UNDO_GRAPH",
      "REDO_GRAPH",
      "MODIFY_CONFIGDATA",
      "LOAD_CONFIGDATA",
      "SHOW_UPLOAD_DIALOG",
      "SET_MODEL",
      "REMOVE_CELLS",
      "APPEND_HISTORY_SIMULATE_DATA",
      "SET_HISTORY_SIMULATE_DATA",
      "SET_NONCE",
      "APPEND_PROPERTY_CHECK_RESULT",
      "SET_CHART_MARKER",
      "PUSH_MARKER_ARRAY",
      "CLEAR_HISTORY_SIMULATE_DATA",
      "UPDATE_HISTORY_DATA_FROM_INDEXDB",
      "SET_MARKER_ARRAY",
    ]),
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
            // //组装 stakerholder 的 nodeData 数据
            // var map = new Map();
            // for(let i=0;i<this.dynamicValidateForm.tokenAmount.length;i++){
            //   map.set(this.dynamicValidateForm.tokenName[i],this.dynamicValidateForm.tokenAmount[i])
            // }
            // // 拿到 stakerholder 节点
            // if (this.graph.model.collection.cells.length) {
            //   for(let i = 0;i<this.graph.model.collection.cells.length;i++){
            //     if(this.graph.model.collection.cells[i].id === this.nodeId){
            //       this.graph.model.collection.cells[i].getData().nodeData = [];
            //       this.graph.model.collection.cells[i].getData().nodeData.push(map);
            //       console.log(this.graph.model.collection.cells[i].getData().nodeData)
            //     }
            //   }
            // }

            this.configData.globalVars.var_key = this.dynamicValidateForm.var_key;
            this.configData.globalVars.var_value  = this.dynamicValidateForm.var_value;
        } 
        else return false;
      })
    },
    removeDomain(item) {
      var index = this.dynamicValidateForm.var_value.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.var_value.splice(index, 1);
        this.dynamicValidateForm.var_key.splice(index, 1)
      }
    },
    addDomain() {
      this.dynamicValidateForm.var_key.push({
        value: '',
        key: Date.now()
      });
      this.dynamicValidateForm.var_value.push({
        value: '',
        key: Date.now() + 1
      });
    },

    formatTooltip(val) {
      return val / 100;
    },
    /**
    修改全局配置信息
     */
    modifyConfigData() {
      setStore("config_data", this.configData);
    },

    /**
    下载当前模型为json文件
     */
    downloadGraph() {
      //获取时间戳
      var timestamp = new Date().valueOf();
      //将全局配置信息和画布数据封装成对象
      let modelData = {
        model: { configData: this.configData, graph: this.graph },
      };
      const filename = "Model" + timestamp + ".json";
      const data = JSON.stringify(modelData, undefined, 4);
      let blob = new Blob([data], { type: "text/json" }),
        a = document.createElement("a");
      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      // 标签 data- 嵌入自定义属性  屏蔽后也可正常下载
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      // 添加鼠标事件
      let event = new MouseEvent("click", {});
      // 向一个指定的事件目标派发一个事件
      a.dispatchEvent(event);
    },
    /**
    上传已有的模型，json文件
     */
    uploadGraph() {
      this.SHOW_UPLOAD_DIALOG();
    },

    /**
       从 indexdb 中取数据
     */
    
    async getDataFromIndexDB(DBname,key,index){
      // TODO: 先注释了，测试新的数据表
      //return await this.$indexedDB.fullValueSearch(DBname,key,index);

      return [];
    },

    /**
       往 indexdb 中清空数据
     */
    deleteDataFromIndexDB(DBname,id){
      this.$indexedDB.deleteDB(DBname,id);
    },

    /**
       往 indexdb 中存数据
     */
    saveDataToIndexDB(DBname,id,data){
      // 先清空数据
      this.deleteDataFromIndexDB(DBname,id);
      // 存数据
      let obj = { id, data };
      this.$indexedDB.addData(DBname, obj);
    },
    /**
       更新 indexdb 中的历史测算数据
       这一部分处理速度很慢
     */
    async updateHistorySimulateDataInIndexDB(){

      // 从每个节点的数据表中取数据
      let tmpGenesis = await this.$indexedDB.getAll("genesisHistoryData");
      let tmpBalckhole = await this.$indexedDB.getAll("blackholeHistoryData");
      let tmpPool = await this.$indexedDB.getAll("poolHistoryData");
      let tmpStakeholder = await this.$indexedDB.getAll("stakeholderHistoryData");
      let tmpEdge = await this.$indexedDB.getAll("edgeHistoryData");
      
      // 拼成目标数据结构
      let genesis = new Map();
      let blackhole = new Map();
      let pool = new Map();
      let stakeholder = new Map();
      let edge = new Map();
      let tmpData = [];

      // genesis
      for(let i=0;i<tmpGenesis.srcElement.result.length;i++){
        if(genesis.has(tmpGenesis.srcElement.result[i].label + "|" + tmpGenesis.srcElement.result[i].uid.substring(0,4)))
          tmpData = genesis.get(tmpGenesis.srcElement.result[i].label + "|" + tmpGenesis.srcElement.result[i].uid.substring(0,4));           
        else tmpData = [];
        for(let k = 0;k<Array.from(tmpGenesis.srcElement.result[i].data.keys()).length;k++){
          tmpData.push({
            day:tmpGenesis.srcElement.result[i].day.toString(),
            token:Array.from(tmpGenesis.srcElement.result[i].data.keys())[k],
            remainAmount:Array.from(tmpGenesis.srcElement.result[i].data.values())[k]
          });
        }
        genesis.set(tmpGenesis.srcElement.result[i].label + "|" + tmpGenesis.srcElement.result[i].uid.substring(0,4),tmpData); 
      }
      // blackhole
      for(let i=0;i<tmpBalckhole.srcElement.result.length;i++){
        if(blackhole.has(tmpBalckhole.srcElement.result[i].label + "|" + tmpBalckhole.srcElement.result[i].uid.substring(0,4)))
          tmpData = blackhole.get(tmpBalckhole.srcElement.result[i].label + "|" + tmpBalckhole.srcElement.result[i].uid.substring(0,4));           
        else tmpData = []

        tmpData.push({
            day:tmpBalckhole.srcElement.result[i].day,
            token:Array.from(tmpBalckhole.srcElement.result[i].data.keys())[0],
            totalBurnAmount:Array.from(tmpBalckhole.srcElement.result[i].data.values())[0]
          });
          blackhole.set(tmpBalckhole.srcElement.result[i].label + "|" + tmpBalckhole.srcElement.result[i].uid.substring(0,4),tmpData); 
      }
      // pool
      for(let i=0;i<tmpPool.srcElement.result.length;i++){
        if(pool.has(tmpPool.srcElement.result[i].label + "|" + tmpPool.srcElement.result[i].uid.substring(0,4)))
          tmpData = pool.get(tmpPool.srcElement.result[i].label + "|" + tmpPool.srcElement.result[i].uid.substring(0,4));           
        else tmpData = []

        let keys = Array.from(tmpPool.srcElement.result[i].data.tokenData.keys());
        for(let j=0;j<keys.length;j++){
          tmpData.push({
            day:tmpPool.srcElement.result[i].day,
            token:keys[j],
            totalAmount:tmpPool.srcElement.result[i].data.tokenData.get(keys[j])
          });
          pool.set(tmpPool.srcElement.result[i].label + "|" + tmpPool.srcElement.result[i].uid.substring(0,4),tmpData); 
        }
        
      }
      // stakeholder
      for(let i=0;i<tmpStakeholder.srcElement.result.length;i++){
        if(stakeholder.has(tmpStakeholder.srcElement.result[i].label + "|" + tmpStakeholder.srcElement.result[i].uid.substring(0,4)))
          tmpData = stakeholder.get(tmpStakeholder.srcElement.result[i].label + "|" + tmpStakeholder.srcElement.result[i].uid.substring(0,4));           
        else tmpData = []

        let keys = Array.from(tmpStakeholder.srcElement.result[i].data.keys());
        for(let j=0;j<keys.length;j++){
        tmpData.push({
            day:tmpStakeholder.srcElement.result[i].day,
            token:keys[j],
            freeMoney:tmpStakeholder.srcElement.result[i].data.get(keys[j])
          });
          stakeholder.set(tmpStakeholder.srcElement.result[i].label + "|" + tmpStakeholder.srcElement.result[i].uid.substring(0,4),tmpData); 
        }
      }
      //edge
      // console.log("tmpEdge",tmpEdge.srcElement.result);
      for(let i=0;i<tmpEdge.srcElement.result.length;i++){
        // 先判断有没有这个 id
        if(edge.has(tmpEdge.srcElement.result[i].id)){
          let tmpEdgeData = edge.get(tmpEdge.srcElement.result[i].id);
          // console.log("tmpEdgeData",tmpEdgeData);
          // 再判断有没有这一天
          if(tmpEdgeData.has(tmpEdge.srcElement.result[i].day)){
            let tmpMap = tmpEdgeData.get(tmpEdge.srcElement.result[i].day);
            // console.log("tmpMap",tmpMap);
            // 如果这天这个token存过了，累加
            if(tmpMap.has(tmpEdge.srcElement.result[i].token))
              tmpMap.set(tmpEdge.srcElement.result[i].token,tmpMap.get(tmpEdge.srcElement.result[i].token) + tmpEdge.srcElement.result[i].transferAmount);
            // 否则直接存
            else tmpMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);
            tmpEdgeData.set(tmpEdge.srcElement.result[i].day,tmpMap);
            edge.set(tmpEdge.srcElement.result[i].id,tmpEdgeData);
          }
          else {
            let tmpMap = new Map();
            tmpMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);
            tmpEdgeData.set(tmpEdge.srcElement.result[i].day,tmpMap);
            edge.set(tmpEdge.srcElement.result[i].id,tmpEdgeData);
          }
        }
        else {
          let emptyTokenMap = new Map();
          let emptyDayMap = new Map();
          emptyTokenMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);
          emptyDayMap.set(tmpEdge.srcElement.result[i].day,emptyTokenMap);
          edge.set(tmpEdge.srcElement.result[i].id,emptyDayMap);
        }
        //console.log("tmpEdge1",tmpEdge.srcElement.result[i])
        //for(let j=0;j<tmpEdge.srcElement.result[i].length;j++){
          //console.log("tmpEdge2",tmpEdge.srcElement.result[i][j].day)
          // if(edge.has(tmpEdge.srcElement.result[i].day)){
          //   let tmpMap = edge.get(tmpEdge.srcElement.result[i].day);
          //   //console.log("tmpMap",tmpMap)
          //   if(tmpMap.has(tmpEdge.srcElement.result[i].token))
          //     tmpMap.set(tmpEdge.srcElement.result[i].token,tmpMap.get(tmpEdge.srcElement.result[i].token) + tmpEdge.srcElement.result[i].transferAmount);
          //   else tmpMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);

          //   edge.set(tmpEdge.srcElement.result[i].day,tmpMap);
          // }
          // else {
          //   let tmpMap = new Map();
          //   tmpMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);
          //   edge.set(tmpEdge.srcElement.result[i].day,tmpMap);
          // }
      }

      console.log("data re-org finished");

      let tmpObj = new Map();
      let obj = new Map();
      let id = 0;
      tmpObj.set("genesis",genesis);
      tmpObj.set("pool",pool);
      tmpObj.set("blackhole",blackhole);
      tmpObj.set("stakeholder",stakeholder);
      tmpObj.set("edge",edge);

      let tmp = await this.$indexedDB.getAll("historySimulationData");
      if (tmp.srcElement.result.length) id = tmp.srcElement.result.length;

      obj.set("simulateId",id);
      obj.set("data",tmpObj);
      await this.$indexedDB.addData("historySimulationData", obj);
    },
    /**
       更新 indexdb 中的历史模型数据
     */
    async updateHistoryModelData(){
      // 取数据
      let tmpModelData = await this.$indexedDB.getAll("modelData");
      let tmp = await this.$indexedDB.getAll("historyModelData");

      let obj = new Map();
      let id = 0;
      if (tmp.srcElement.result.length) id = tmp.srcElement.result.length;

      for(let i=0;i<tmpModelData.srcElement.result.length;i++){
        obj.set("simulateId",id);
        obj.set("graph",tmpModelData.srcElement.result[i].graph);
      }
      await this.$indexedDB.addData("historyModelData", obj);
    },

    /**
       取全局 ID
     */
    async getCurrentIndex(){
      let tmp = await this.getDataFromIndexDB("historyData","id",0);
      if(tmp.length) this.currentIndex = tmp[0].data.length;
      else this.currentIndex = 0;
    },

    /**
       更新 indexdb 中的历史 Properties
     */
    async savePropertiesToIndexDB(rulesData){
      // 先取第三条数据如有
      let tmp = await this.getDataFromIndexDB("historyData","id",2);

      // 然后清空第三条数据
      this.deleteDataFromIndexDB("historyData",2);
      
      if(tmp.length) {
        tmp[0].data.push(rulesData);
        // 存入当前所有历史测算数据
        this.saveDataToIndexDB("historyData",2,tmp[0].data);
      }
      else {
        // 存入当前所有历史测算数据
        let data = [];
        data.push(rulesData);
        this.saveDataToIndexDB("historyData",2,data);
      }
    },

    /**
       更新 indexdb 中的历史 Graph
     */
    async saveGraphToIndexDB(graphData) {
      // 先取第四条数据如有
      let tmp = await this.getDataFromIndexDB("historyData","id",3);

      // 然后清空第四条数据
      this.deleteDataFromIndexDB("historyData",3);

      if(tmp.length) {
        tmp[0].data.push(graphData);
        // 存入当前所有历史测算数据
        this.saveDataToIndexDB("historyData",3,tmp[0].data);
      }
      else {
        // 存入当前所有模型数据
        let data = []
        data.push(graphData);
        this.saveDataToIndexDB("historyData",3,data);
      }
    },
    async saveToIndexDB() {
      // 存历史测算数据
      //this.indexedDB.addData('historySimulationData','abc');
      //let tmp = this.$indexedDB.getAll('historySimulationData');
      //console.log(this.$indexDB)
      // 存模型及配置、测算天数、规则数据
      // TODO：存规则及检查结果

      // let tokenId,vestId,stakeId,unstakeId;
      // let hasToken,hasVest,hasStake,hasUnstake;

      // 找到各个节点
      // let nodes = this.graph.model.getNodes();
      //   nodes.forEach(element => {
      //       switch(element.getData().type) {
      //           case "Token":
      //             tokenId = element.id;
      //             hasToken = true;
      //             break;
      //           case "Stake":
      //             stakeId = element.id;
      //             hasStake = true;
      //             break;
      //           case "Unstake":
      //             unstakeId = element.id;
      //             hasUnstake = true;
      //               break;
      //           case "Vest":
      //             vestId = element.id;
      //             hasVest = true;
      //             break;
      //           default:
      //               break;
      //       }
      //   });

      // let tokenName,tmpVestData,tmpStakeData;
      // // 取测算总天数
      // let simulationDays = this.configData.simulationDays;

      // // 根据 key 值 取 token name && Vest 数据 && stake reward 数据
      // if(hasToken) tokenName = this.model.nodesInstance.get(tokenId).symbol;
      // if(hasVest) tmpVestData = this.model.nodesInstance.get(vestId).vestHistory;
      // if(hasStake) tmpStakeData = this.model.nodesInstance.get(stakeId).rewardList;

      // // 先取第 5 条数据如有，然后清空第 5 条数据
      // let tmp = await this.getDataFromIndexDB("historyData","id",4);
      // this.deleteDataFromIndexDB("historyData",4);
      
      // if(tmp.length) {
      //   tmp[0].data.push({
      //     simulationDays:simulationDays,
      //     name:tokenName,
      //     type:this.currentIndex,
      //     vestData:tmpVestData,
      //     stakeData:tmpStakeData,
      //   });
      //   this.saveDataToIndexDB("historyData",4,tmp[0].data);
      // }
      // else {
      //   // 存入当前所有历史测算数据
      //   let data = [];
      //   data.push({
      //     simulationDays:simulationDays,
      //     name:tokenName,
      //     type:this.currentIndex,
      //     vestData:tmpVestData,
      //     stakeData:tmpStakeData,
      //   });
      //   this.saveDataToIndexDB("historyData",4,data);
      // }
    },
    /**
       更新 indexdb 中的 Holding Data [id:0]
     */
    async saveHoldingDataToIndexDB(holdingData) {
      // 先取第 1条 数据如有
      let tmp = await this.getDataFromIndexDB("historyData","id",0);

      // 然后清空第1条数据
      this.deleteDataFromIndexDB("historyData",0);

      if(tmp.length) {
        tmp[0].data.push(holdingData);
        this.saveDataToIndexDB("historyData",0,tmp[0].data);
      }
      else {
        let data = []
        data.push(holdingData)
        this.saveDataToIndexDB("historyData",0,data);
      }
    },
    /**
       更新 indexdb 中的 Label to Id Data [id:1]
     */
    async saveLabelToIdDataToIndexDB(LabelToIdData) {
      // 先取第 2 条 数据如有
      let tmp = await this.getDataFromIndexDB("historyData","id",1);

      // 然后清空第2条数据
      this.deleteDataFromIndexDB("historyData",1);

      if(tmp.length) {
        tmp[0].data.push(LabelToIdData);
        this.saveDataToIndexDB("historyData",1,tmp[0].data);
      }
      else {
        let data = []
        data.push(LabelToIdData)
        this.saveDataToIndexDB("historyData",1,data);
      }
    },
    /**
    开始测算
    */
    async testt(){

      // 取当前 Index
      await this.getCurrentIndex();

      // 模型初次测算
      if (this.model == null) {
        var simulate = new Simulate(
          this.graph,
          this.configData.simulationDays,
          this.configData.simulationSlot
        );
        // V2 版本，indexDB 第一条先放每个 stakerholder 持有的 token 数据（以后可以改）
        this.saveHoldingDataToIndexDB(simulate.tokenAllocations);

        // V2 版本，indexDB 第二条先放每个节点 标签到 id 到映射（以后可以改）
        let labelToId = [];
        // [0]:token [1]:stakeholder [2] [3]
        labelToId.push(simulate.tokenMap);
        labelToId.push(simulate.stakeholderMap);
        this.saveLabelToIdDataToIndexDB(labelToId);
      }
    },
    
    async startSimulation() {
      // 正常测算结束后，restart前重置model实例
      if(this.model != null){
        // 将当前模型置为 null
        if(this.model.status == 1){
          this.SET_MODEL(null);
        }
        // 重置 indexDB 数据库
        this.$indexedDB.clearDB('blackholeHistoryData');
        this.$indexedDB.clearDB('genesisHistoryData');
        this.$indexedDB.clearDB('stakeholderHistoryData');
        this.$indexedDB.clearDB('poolHistoryData');
        this.$indexedDB.clearDB('edgeHistoryData');
        this.$indexedDB.clearDB('modelData');
      }
      // 测算开始，开启 loading 图标
      this.loading = true;
      // 取当前 id
      await this.getCurrentIndex();
      console.log("this.currentIndex",this.currentIndex)

      // 取当前所有 Property
      let currentRuleList = []
      if (this.ruleLists.length) {
        for(let r=0;r<this.ruleLists.length;r++){
          // Set RuleList Status === False
          this.ruleLists[r].status = false;

          // Get all rule content
          currentRuleList.push(this.ruleLists[r].content)
        }
        setStore("rule_lists", this.ruleLists);
      }

      // 模型初次测算时
      if (this.model == null) {
        console.log(
          "starting simulation...",
          this.configData.simulationDays,
          "days",
          " with control slot:",
          this.configData.simulationSlot,
          "days"
        );
        var model = new Model(
          this.graph,
          this.configData,
          this.$indexedDB,
        );

        this.SET_MODEL(model);

        this.APPEND_HISTORY_SIMULATE_DATA({
          type: this.currentIndex,
          data: this.model.data,
        });

      } else {
        // TODO [Done] 模型已经存在时，其相关参数需要根据画布上的最新状态来更新
        this.model.dataUpdate(
          this.graph,
          this.configData.simulationDays,
          this.configData.simulationSlot
        );
      }
      // 设置 model 的状态为 1 - 正在测算中
      this.model.status = 1;
      await this.model.start();

      // 测算终止（正常终止 / 暂停终止）时更新测算历史数据
      this.SET_HISTORY_SIMULATE_DATA(this.nocne, this.model.data);

      if (this.model.status != 2) {
        // 当模型处于非 Pause 状态时
        console.log("the simulation is ended");

        // 存历史测算数据到总的表
        await this.updateHistorySimulateDataInIndexDB();

        // 存历史模型到总的表
        await this.updateHistoryModelData();


        // Save History Simulate Data to IndexDB
        //await this.updateHistorySimulateDataInIndexDB();

        //await this.checkProperty();

        // Save Properties to IndexDB
        //await this.savePropertiesToIndexDB({type:this.currentIndex,rules:currentRuleList});

        // Save Graph to IndexDB
        //let getGraphFromLocalStorage = JSON.parse(localStorage.getItem("graph"));
        //await this.saveGraphToIndexDB({type:this.currentIndex,graph:getGraphFromLocalStorage});
      }
      //this.saveToIndexDB()

      //  测算终止（正常终止 / 暂停终止），关闭 loading 图标
      this.loading = false;
    },

    /** 
    暂停测算
    */
    pauseSimulation() {
      // TODO 处于暂停状态中，画布上的某些不可改的参数应该置为灰色或不可选(不可新建、删除节点；不可更改的参数如)

      // 测算暂停，关闭 loading 图标
      this.loading = false;

      console.log("pausing simulation...");
      if (this.model == null) {
        console.log("there's no model running!");
      } else {
        // 修改模型的状态为 2 - 暂停
        this.model.status = 2;
        console.log(
          "The model is paused. ",
          "You can only adjust params on existing model. ",
          "If you need to adjust the architecture of model, please END current simulation first"
        );
      }
    },

    /**
    结束当前测算
    */
    endSimulation() {
      // 测算暂停，关闭 loading 图标
      this.loading = false;
      console.log("ending simulation...");
      // 修改模型的状态为 0 - 停止
      this.model.status = 0;
      // 将当前模型置为 null
      this.SET_MODEL(null);
      // 重置 indexDB 数据库
      this.$indexedDB.clearDB('blackholeHistoryData');
      this.$indexedDB.clearDB('genesisHistoryData');
      this.$indexedDB.clearDB('stakeholderHistoryData');
      this.$indexedDB.clearDB('poolHistoryData');
      this.$indexedDB.clearDB('edgeHistoryData');
      this.$indexedDB.clearDB('modelData');
      console.log("the simulation is ended");
      // 当前测算结束后，将记录历史数据次数的 nonce 值增加 1
      //this.SET_NONCE(this.nonce + 1);
    },

    /**
     * 下载模型图片
     */
    saveGraphToPNG() {
      this.graph.toPNG(
        (dataUri) => {
          // 下载
          DataUri.downloadDataUri(dataUri, "chart.png");
        },
        {
          padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          },
        }
      );
    },

    /**
     * 获取模型测算进行中的时间
     */
    getModelTime() {
      if (this.model == null) return 0;
      return this.model.curDay;
    },

    /**
     * 判断 Property 标识是否应转红
     */
    needToResetProperty(ruleListsContent,unq,qua) {
      /* 
        Property 不满足转红逻辑构思：
          目前 Property 语法是 After x days 。。。
          满足意味着 x 及 x 之后的 days 都应且仅能出现在 qualifyDays 列表中，
          x 之前的 days 都应且仅能出现在 unqualifyDays 列表中
          注意：上述两个检查缺一不可
      */

      // 拿到这个 x 
      let x = ruleListsContent.replace(/[^\d.]/g, "").split(".")[0];

      // 生成对比列表
      let compareToUnqualifyDays = [];
      let compareToQualifyDays = [];
      for (let i=1;i<x;i++){
        compareToUnqualifyDays.push(i);
      }
      for (let j=Number(x);j<=this.configData.simulationDays;j++){
        compareToQualifyDays.push(j);
      }

      // 对比
      if (
        JSON.stringify(unq.reverse())===JSON.stringify(compareToUnqualifyDays)
        &&
        JSON.stringify(qua.reverse())===JSON.stringify(compareToQualifyDays)
      ) return false;
      else return true;
    },

    /**
     * 检查 Property 列表中的所有 Property
     */
    async checkProperty() {
      //let changeStatus = [];
      if (this.ruleLists.length) {
        // 组装 Property 检验数据
        let tmp = new Map();
        for (let i = 0; i < this.ruleLists.length; i++) {
          // 循环对每一个 property 进行检验
          let qualifyDays = [];
          let unqualifyDays = [];
          let checkResult = [];

          const inputStream = new InputStream(this.ruleLists[i].content);
          const lexer = new GrammarLexer(inputStream);
          const tokenStream = new CommonTokenStream(lexer);
          const parser = new GrammarParser(tokenStream);
          parser.removeErrorListeners();
          parser.addErrorListener({
            syntaxError: (
              recognizer,
              offendingSymbol,
              line,
              column,
              msg,
              err
            ) => {
              console.error(
                `${offendingSymbol} line ${line}, col ${column}: ${msg}`
              );
              throw err;
            },
          });
          const tree = parser.check();
          let allDataOri = this.historySimulateData[this.historySimulateData.length - 1].data;
          let allData = JSON.parse(JSON.stringify(allDataOri));
          // 先用最后一天的数据调用
          let visitor = new PropertyVisitor(
            this.model.curDay,
            allData,
            this.graph.model.getNodes()
          );
          tree.accept(visitor);
          if (visitor.state >= 4) {
            this.ruleLists[i].status = true;
            qualifyDays.push(this.model.curDay);
          }
          else {
            unqualifyDays.push(this.model.curDay);
          }
          // 再倒序用最后一天之前的数据调用 调一次 pop 掉一天的数据
          for (let day=1 ; day<this.model.curDay; day++) {
            for (let node = 0 ; node < allData.length; node++) {
              for (let participant = 0 ; participant < allData[node].data.length; participant++) {
                  allData[node].data[participant].data.pop();                
              }
            }
            let visitor = new PropertyVisitor(
                    this.model.curDay-day,
                    allData,
                    this.graph.model.getNodes()
                  );
            tree.accept(visitor);
            if (visitor.state >= 4) {
              this.ruleLists[i].status = true;
              qualifyDays.push(this.model.curDay-day);
            }
            else {
              unqualifyDays.push(this.model.curDay-day);
            }
          }
          checkResult.push(qualifyDays);
          checkResult.push(unqualifyDays);

          tmp.set(i,checkResult);
          this.APPEND_PROPERTY_CHECK_RESULT(tmp);

          let reverseUnq = unqualifyDays.concat();
          let reverseQua = qualifyDays.concat();

          // 判断 Property 标识是否应转红，如是 转红
          if (
            this.needToResetProperty(this.ruleLists[i].content,reverseUnq,reverseQua)
          ) this.ruleLists[i].status = false;

          //console.log("CR",checkResult);
        }

        // 至此 得到每个Property的合格天数和不合格天数
        // 接下来把合格天数转换为 Marker 里的开始天数和结束天数
        this.getMarkerTimePeriod();
        // 生成 Marker Array 
        await this.setMarkerArray();
      }
      setStore("rule_lists", this.ruleLists);
      this.CLEAR_HISTORY_SIMULATE_DATA();
    },
    getMarkerTimePeriod() {
      // 存该函数运行结果
      let markDaysOfRules = [];

      // 遍历所有规则:
      for (var rule of this.propertyResult) {
        // 记录开始时间和结束时间
        let startDays = [];
        let endDays = [];

        // 放开始时间和结束时间数组
        let markDays = new Map();

        // 只考虑满足 Property 的时间
        let getQualifyDays = rule[1][0];

        if (getQualifyDays.length>0) {
          if(getQualifyDays.length===1){
            // 仅 1 天满足 Property
            startDays.push(getQualifyDays[0]);
            endDays.push(getQualifyDays[0]+1); 
          }
          else if (getQualifyDays.length===2) {
            // 共 2 天满足 Property 第一天是开始时间
            startDays.push(getQualifyDays[0]);
            if (getQualifyDays[0]-1 === getQualifyDays[1]) {
              // 如果第二天跟第一天相邻 第二天是结束时间
              endDays.push(getQualifyDays[1]);
            }
            else {
              // 否则第一天的后一天为结束时间
              endDays.push(getQualifyDays[0]+1);

              // 第二天及第二天后一天为新的开始 && 结束时间
              startDays.push(getQualifyDays[1]);
              endDays.push(getQualifyDays[1]+1);
            }
          }
          else{
            // 满足 Property 的时间 >2 天
            let compareDay = getQualifyDays[0]
            startDays.push(getQualifyDays[0]);

            for (let day=1;day<getQualifyDays.length-1;day++) {
              if(getQualifyDays[day]+1 === compareDay){
                // 如果是连续时间，更新对比日期
                compareDay = getQualifyDays[day];
              }
              else{
                // 如果不连续 完成一个循环 并开始新的循环
                endDays.push(getQualifyDays[day-1]);
                startDays.push(getQualifyDays[day]);
                compareDay = getQualifyDays[day];
              }
            }
            endDays.push(getQualifyDays[getQualifyDays.length-1]);
          }
          markDays.set("startDays",startDays);
          markDays.set("endDays",endDays);
          markDaysOfRules.push(markDays);
        }
        else {
          // 没有满足 Property 的时间 存 []
          markDays.set("startDays",startDays);
          markDays.set("endDays",endDays);
          markDaysOfRules.push(markDays);
        }
        this.SET_CHART_MARKER(markDaysOfRules);
      }
    },
    saveMarkerToIndexDB(MAData){
      // 先清空第二条数据
      this.$indexedDB.deleteDB("historyData",1);
          
      // 存入当前所有历史测算数据
      let id = 1;
      let data = MAData;
      let obj = { id, data };
      this.$indexedDB.addData("historyData", obj);
    },

    async showMarkerOfIndexDB(){
      let tmp = await this.$indexedDB.fullValueSearch("historyData","id",1);
      if(tmp.length) this.SET_MARKER_ARRAY(tmp[0].data);
      /* if(!this.markerArray.length){
        // 页面刷新后 这个列表肯定是空的
        // 尝试加载 indexDB 数据
        let tmp = await this.$indexedDB.fullValueSearch("historyData","id",1);
        if(tmp.length) this.SET_MARKER_ARRAY(tmp[0].data);
      } */

      // 如果列表非空 需要后续补充处理 现在非空不管即可
      // TODO：
      // 现在 Marker 保存的是最新的检查结果 一个规则一条 不跟特定历史测算数据绑定
      // 会全部叠加在折线图上 越多规则满足颜色越深
      // 后续需要单独处理特定数据的绑定逻辑
      // 这个方法 Editor 也有
    },

    async setMarkerArray() {
      let tmpArr = [];
      let template = {};
      template.type = 'region';
      template.style = {};
      template.style.fill = 'green';
      template.style.stroke = 'green';
      template.style.fillOpacity = 0.5;
      template.style.lineOpacity = 0.5;
      template.style.opacity = 1;

      for (let p=0; p<this.chartMarker.length;p++) {
        // 如果开始时间数组为空 跳过
        if (this.chartMarker[p].get("startDays").length === 0) {  
          /* template.start = ['0','min'];
          template.end = ['0','max'];
          let str = JSON.parse(JSON.stringify(template));
          tmpArr.push(str);  */  
          tmpArr.push({});    
        }
        else {
          for (let sd = 0; sd < this.chartMarker[p].get("startDays").length; sd++) {
            let sdtmp = this.chartMarker[p].get("startDays");
            let edtmp = this.chartMarker[p].get("endDays");
            let sdString = sdtmp[sd].toString();
            let edString = edtmp[sd].toString();

            template.start = [sdString,'min'];
            template.end = [edString,'max'];

            let str = JSON.parse(JSON.stringify(template));
            tmpArr.push(str);
          }
        }
      }
      // 先加载 indexDB 中的 marker 数据
      await this.showMarkerOfIndexDB();
      // 然后追加本次 marker 数据
      // 下面两个方法之前是直接传入 tmpArr
      this.PUSH_MARKER_ARRAY({
        type: this.currentIndex,
        data: tmpArr,
      });
      // 然后把 marker 数据整体打包放进 indexDB
      this.saveMarkerToIndexDB(this.markerArray);
    }
  },
  // mounted(){
  //   this.showToLocalStorage();
  // },
  computed: {
    ...mapState([
      "configData",
      "graph",
      "model",
      "nonce",
      "ruleLists",
      "historySimulateData",
      "propertyResult",
      "chartMarker",
      "markerArray",
    ]),
  },
  watch: {
    /**
    * 监听对应数据字段，当数据发生变化时重新渲染画布背景色
    */
    backgroundColor:{
      handler() {
        this.graph.drawBackground({
        color:this.backgroundColor
      });
      this.graph.updateBackground();
      }
    },
    /**
    * 监听对应数据字段，当数据发生变化时重新渲染网格背景色
    */
    gridColor:{
      handler() {
        this.graph.drawGrid({
          type:this.typeValue,
          args:{
            color:this.gridColor,
            thickness:this.thicknessValue
          }
        });
      }
    },
    /**
    * 监听对应数据字段，当数据发生变化时重新渲染网格图形样式
    */
    thicknessValue:{
      handler() {
        this.graph.drawGrid({
          type:this.typeValue,
          args:{
            color:this.gridColor,
            thickness:this.thicknessValue
          }
        });
      }
    },
    sizeValue:{
      handler() {
        this.graph.setGridSize(this.sizeValue);
      }
    },
    /**
    * 监听对应数据字段，当数据发生变化时重新渲染网格图形粒度
    */
    typeValue:{
      handler() {
        this.graph.drawGrid({
          type:this.typeValue,
          args:{
            color:this.gridColor,
            thickness:this.thicknessValue
          }
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.top-container {
  position: fixed;
  height: calc(100% - 180px);
  width: 300px;
  top: 120px;
  right: calc(100% - (100% - 250px) - 195px);
  background-color: rgba(147, 194, 241, 0.55);
  overflow: scroll;
  border-radius: 30px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  color: #ffffff;
  font-size: 18px;

  .tool-bar {
    text-align: center;
    h4 {
      margin-left: 10px;
      letter-spacing: 0.2ch;
      font-weight: 600;
    }
    i {
      margin: 10px;
      font-size: 18px;
      color:#ffffff;
      font-weight: bold;
      cursor: pointer;
      &:hover {
        color: rgb(2, 157, 247);
      }
    }
  }
  .el-divider {
    background-color: #ffffff;
    position: relative;
}
  .config-data-box {
    
    h4 {
      letter-spacing: 0.2ch;
      font-weight: 600;
      text-align: center;
    }
    .config-data-input {
      width: 200px;
      margin-left: 10px;
      margin-top: 20px;
      letter-spacing: 0.1ch;
      font-weight: 500;
    }
    .day-slider {
      margin-left: 15px;
      margin-bottom: 20px;
      width: 250px;
      // 这个是滑动条滑过的颜色
      /deep/ .el-slider__bar {
        background: linear-gradient(to left, #49e4f5, #d849f5);
      }
      // 这个是滑动条未滑过的颜色
      /deep/ .el-slider__runway {
        background-color: #ffffff;
      }
      // 这个是滑动条按钮颜色
      /deep/ .el-slider__button {
        border: 2px solid rgb(2, 157, 247);
        transition: 0s;
      }
      /deep/ .el-input-number__decrease, /deep/ .el-input-number__increase {
        // 这个是天数 - ｜ + 按钮 bg color
        background-color: #fff;
        // 这个是天数 - ｜ + 按钮 text color
        color: #111;
      }

      // 这个是天数数值样式
      /deep/ .el-input__inner {
        color: black;
        font-weight: 400;
        background-color:white;
        border: 0px solid rgb(2, 157, 247);
      }
    }
  }
  .graph-style-setting {
    .bg-style-line {
      margin-bottom: 10px;
    }
    h4 {
      letter-spacing: 0.2ch;
      font-weight: 600;
      text-align: center;
      margin-bottom: 5px;
      padding-top: 10px;
      padding-bottom: 15px;
    }
    span {
      width: 200px;
      margin-left: 10px;
      margin-top: 20px;
      letter-spacing: 0.1ch;
      font-weight: 500;
    }

    /deep/ .el-color-picker__trigger {
      width:100px;
      height: 25px;
      left: 15px;
      top: 5px;
    }

    /deep/ .el-select {
      width:163px;
      padding: 5px;
      left: 15px;
    }

    /deep/ .el-input__inner {
      height: 25px;
    }

    /deep/ .el-select .el-input .el-select__caret {
      color: black;
      padding: 8px;
    }

    .grid-size {
      margin-top: 15px;
      span {
        margin-top: 8px;
        float: left;
      }
      .grid-size-slider {
        //padding-bottom: 10px;
        margin-left: 120px;
          width: 160px;
          // 这个是滑动条滑过的颜色
          /deep/ .el-slider__bar {
            background: linear-gradient(to left, #49e4f5, #d849f5);
          }
          // 这个是滑动条未滑过的颜色
          /deep/ .el-slider__runway {
            background-color: #ffffff;
          }
          // 这个是滑动条按钮颜色
          /deep/ .el-slider__button {
            border: 2px solid rgb(2, 157, 247);
            transition: 0s;
          }
          /deep/ .el-input-number__decrease, /deep/ .el-input-number__increase {
            // 这个是天数 - ｜ + 按钮 bg color
            background-color: #fff;
            // 这个是天数 - ｜ + 按钮 text color
            color: #111;
          }

          // 这个是天数数值样式
          /deep/ .el-input__inner {
            color: rgb(90, 145, 249);
            font-weight: 600;
            background-color:white;
            border: 0px solid rgb(2, 157, 247);
          }
      }
    }

    .grid-thickness {
      margin-top: 15px;
      span {
        margin-top: 8px;
        float: left;
      }
      .grid-thickness-slider {
        //padding-bottom: 10px;
        margin-left: 120px;
          width: 160px;
          // 这个是滑动条滑过的颜色
          /deep/ .el-slider__bar {
            background: linear-gradient(to left, #49e4f5, #d849f5);
          }
          // 这个是滑动条未滑过的颜色
          /deep/ .el-slider__runway {
            background-color: #ffffff;
          }
          // 这个是滑动条按钮颜色
          /deep/ .el-slider__button {
            border: 2px solid rgb(2, 157, 247);
            transition: 0s;
          }
          /deep/ .el-input-number__decrease, /deep/ .el-input-number__increase {
            // 这个是天数 - ｜ + 按钮 bg color
            background-color: #fff;
            // 这个是天数 - ｜ + 按钮 text color
            color: #111;
          }

          // 这个是天数数值样式
          /deep/ .el-input__inner {
            color: rgb(90, 145, 249);
            font-weight: 600;
            background-color:white;
            border: 0px solid rgb(2, 157, 247);
          }
      }
    }
  }
  .global-vars-setting {
    .form-item {
      padding: 5px;
      margin-bottom: 0px;

      /deep/ .el-form-item__label {
        color: white;
        font-weight: 600;
      }

      .globalVar-edit-input {
        margin-left: 5px;
        width: 150px;
      }

      /deep/ .el-input--small .el-input__inner {
        height: 28px;
        line-height: 28px;
      }

      /deep/ .el-input__inner {
        color:rgb(194, 194, 194)
      }
      
      .del-button {
        margin-left: 15px;
        height: 28px;
        width: 35px;
        color:rgb(194, 194, 194)
      }

      .add-button {
        width: 60px;
        color:rgb(194, 194, 194)
      }
      .submit-button {
        margin-left: 15px;
        width: 100px;
        color:rgb(194, 194, 194)
      }
    }
  }
}
</style>