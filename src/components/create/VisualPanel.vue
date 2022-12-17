<template >
  <el-collapse-transition>
    <div class="visual-panel">
      <span class="help"
        ><i class="el-icon-question" @click="helpShow = !helpShow"></i>
      </span>

      <div class="charts-container">
        <el-tabs v-model="activeName">

          <el-tab-pane label="Allocations" name="first">
            <PieChart :piedata="pieData" />
          </el-tab-pane>

          <el-tab-pane label="Token Emission" name="second">
            <AreaChart :areadata="accumulation"/>
          </el-tab-pane>
          
          <el-tab-pane label="Free Money" name="third">
            <!-- 调用作图组件，传入对应的数据包含折线图数据、x轴字段名、y、分类字段名 -->
            <LineChart :linedata="lineData" />
          </el-tab-pane>
        </el-tabs>

      </div>
      <!-- 历史数据选择 -->
      <div class="data-selected-container">
        <span class="select-title">Data Selection</span>
        <div class="select-table">
          <!-- 使用从 IndexDB 中取到到历史测算数据 -->
          <el-table
            ref="multipleTable"
            :data="this.getHistoryDataFromIndexDB"
            height="450"
            tooltip-effect="dark"
            style="width: 100%"
            class="history-table"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="45"> </el-table-column>            
            <el-table-column prop="type" label="ID" width="80">
            </el-table-column>
            <el-table-column fixed="right" label="Operation" width="110">
              <template slot-scope="scope">
                <!-- 查看数据相关的规则列表 -->
                <el-tooltip
                  class="tooltip"
                  content="Show Properties"
                  placement="bottom"
                  effect="light"
                >
                  <el-button
                  @click.native.prevent="showRulesFromIndexDB(scope.$index)"
                  type="text"
                  size="small"
                  >
                    <i
                      class="el-icon-notebook-2"
                      style="font-size: 18px; color: gray"
                    ></i>
                  </el-button>
                </el-tooltip>

                <!-- 回退到指定历史版本的模型 -->
                <el-tooltip
                  class="tooltip"
                  content="Open This Model"
                  placement="bottom"
                  effect="light"
                >
                  <el-button
                  @click.native.prevent="turnBackToModel(scope.row.type)"
                  type="text"
                  size="small"
                  >
                    <i
                      class="el-icon-s-operation"
                      style="font-size: 18px; color: gray"
                    ></i>
                  </el-button>
                </el-tooltip>

                <!-- 删除数据 -->
                <el-tooltip
                  class="tooltip"
                  content="Delete Data"
                  placement="bottom"
                  effect="light"
                >
                  <el-button
                  @click.native.prevent="deleteFromIndexDB(scope.$index)"
                  type="text"
                  size="small"
                  >
                    <i
                      class="el-icon-remove-outline"
                      style="font-size: 18px; color: gray"
                    ></i>
                  </el-button>
                </el-tooltip>

                
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="help-container" :class="{ helpShow: helpShow }">
        <span>
          <i class="el-icon-warning" style="color: red"></i>For different types of nodes selected in visual panel, visual data has different meanings: 
          <div>Token: data shows the token amount of a participant holds that he can use immediately</div>
          <div>Stake: data shows the accumulated reward amount of a participant in this staking pool</div>
          <div>Unstake: data shows the daily unstaked token amount from corresponding staking pool</div>
          <div>Vest: data shows the daily vested token amount for a participant, following the vest policy</div>
          </span>
      </div>

      <el-dialog
        title="Properties"
        :visible.sync="rulesVisible"
        :modal-append-to-body='true'
        :append-to-body='true'
        class="data-dialog"
        width="550px"
      >
        <Rules :showRules="currentRules"/>
      </el-dialog>

    </div>
  </el-collapse-transition>
</template>
<script>
import Rules from "./Rules";
import PieChart from "../Chart/PieChart";
import AreaChart from "../Chart/AreaChart";
import LineChart from "../Chart/LineChart";
import { mapState, mapMutations } from "vuex";
export default {
  data() {
    return {
      helpShow: true,
      //被选中的历史数据项
      multipleSelection: null,
      //折线图数据
      lineData: [],
      //历史测算数据
      historyData: [],
      //是否展示数据 id 对应的规则列表
      rulesVisible:false,
      //传递当前选择数据 id 对应的规则列表
      currentRules:[],
      activeName: 'first',
      //饼图数据 ｜ Allocations 数据
      pieData:[],
      //面积图数据 ｜ Accumulate 数据
      accumulation:[],
      areaData:[],
      // Vest 数据
      vestData:[],
      roles:0,
      airdropData:[],
      // Stake Reward Data
      stakeReward:[],
    };
  },
  components: {
    LineChart,
    PieChart,
    AreaChart,
    Rules,
  },
  methods: {
    ...mapMutations([
      "LOAD_HISTORY_SIMULATE_DATA",
      "MODIFY_HISTORY_SIMULATE_DATA",
      "UPDATE_HISTORY_DATA_FROM_INDEXDB",
      "SET_TMP_MARKER_ARRAY",
      "MODIFY_GRAPH",
      "CLEAR_GRAPH",
      "SET_MARKER_ARRAY"
    ]),

    /**
       从 indexdb 中取数据
     */
    async getDataFromIndexDB(DBname,key,index){
      return await this.$indexedDB.fullValueSearch(DBname,key,index);
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
       展示与指定数据有关的 Properties
     */ 
    async showRulesFromIndexDB(index){
      //打开展示面板
      this.rulesVisible=true;

      // TODO (rebase hackathon)
      // 取存入的所有规则 传递给展示面板组件
      // let tmp = await this.getDataFromIndexDB("historyData","id",2);
      // if (tmp.length){
      //   for(let i = 0; i<tmp[0].data.length; i++) {
      //     if (tmp[0].data[i].type === index) this.currentRules = tmp[0].data[i].rules;
      //   }
      // }

      this.currentRules = ["GST.user.claimed <= GST.blackhole.burned"];
    },

    /**
       前端右下角弹出成功切换模型的提示
     */ 
    openSucessNotification(){
      this.$notify({
        title: 'Success',
        message: 'Changed to selected Model.',
        type: 'success',
        position: 'bottom-right'
      });
    },

    /**
       切换模型
     */
    async turnBackToModel(index) {
      let tmp = await this.getDataFromIndexDB("historyData","id",3);
      if (tmp.length){
        for(let i = 0; i<tmp[0].data.length; i++) {         
          if (tmp[0].data[i].type === index) {
            this.CLEAR_GRAPH();
            this.MODIFY_GRAPH(tmp[0].data[i].graph.cells);
            this.openSucessNotification();
          }
        }
      }
    },

    async updateMarkerOfIndexDB(){
      let tmp = await this.$indexedDB.fullValueSearch("historyData","id",1);
      if(tmp.length) this.SET_MARKER_ARRAY(tmp[0].data);
    },

    /**
      * 从可视化面板删除数据
      * KEY：0 Data：History Simulation Data
      * KEY：1 Data：History Simulation Data Marker
      * KEY：2 Data：History Properties
      * KEY：3 Data：History Graph
      * KEY：4 Data：Vest Data
      */
    async deleteFromIndexDB(index) {
      // 取存入的所有历史测算数据
      let tmpData = await this.getDataFromIndexDB("historyData","id",0);
      let tmpMarker = await this.getDataFromIndexDB("historyData","id",1);
      let tmpProperty = await this.getDataFromIndexDB("historyData","id",2);
      let tmpGraph = await this.getDataFromIndexDB("historyData","id",3);
      let tmpVest = await this.getDataFromIndexDB("historyData","id",4);

      // 删除用户选中数据
      if(tmpData.length) tmpData[0].data.splice(index,1);
      if(tmpMarker.length) tmpMarker[0].data.splice(index,1);
      if(tmpProperty.length) tmpProperty[0].data.splice(index,1);
      if(tmpGraph.length) tmpGraph[0].data.splice(index,1);
      if(tmpVest.length) tmpVest[0].data.splice(index,1);

      if(tmpData[0].data.length){
        // 如果从 indexDB 中删掉一条数据后还有数据
        // 更新本地历史测算数据
        this.UPDATE_HISTORY_DATA_FROM_INDEXDB(tmpData[0].data);
        
        // 更新 indexDB 数据
        if(tmpData.length) this.saveDataToIndexDB("historyData",0,tmpData[0].data);
        if(tmpMarker.length) this.saveDataToIndexDB("historyData",1,tmpMarker[0].data);
        if(tmpProperty.length) this.saveDataToIndexDB("historyData",2,tmpProperty[0].data);
        if(tmpGraph.length) this.saveDataToIndexDB("historyData",3,tmpGraph[0].data);
        if(tmpVest.length) this.saveDataToIndexDB("historyData",4,tmpVest[0].data);
        // 更新 markerArry
        await this.updateMarkerOfIndexDB();
      }
      else{
        // 否则 清空本地数据
        let tmpArray = []
        this.UPDATE_HISTORY_DATA_FROM_INDEXDB(tmpArray);
        this.deleteDataFromIndexDB("historyData",0);
        this.deleteDataFromIndexDB("historyData",1);
        this.deleteDataFromIndexDB("historyData",2);
        this.deleteDataFromIndexDB("historyData",3);
        this.deleteDataFromIndexDB("historyData",4);
        // 更新 markerArry
        this.SET_MARKER_ARRAY([]);
      }
      
    },

    /**
      * Free Money | LineChart 数据
    */
    getFreeMoneyData(val){
      // 取 lineData 即 Free Money 数据
      this.lineData = [];

      // TODO (rebase hackathon)
      this.lineData.push({
        category: "user",
        data: [{
          type: "GST" ,
          data: [{
              type: "claimed",
              data: [...Array.from({ length: 100 }, (elm, i) => ({
                    time: String(i + 1),
                    value: (100 * (i+1) + 100 * (i+1) * (i+1)) / 2
                })), ...Array.from({ length: 100 }, (elm, i) => ({
                    time: String(100 + i + 1),
                    value: (1000 * (i+1) + 1000 * (i+1) * (i+1)) / 2 + 10000 * (i+1) + 505000
                })), ... Array.from({ length: 100 }, (elm, i) => ({
                    time: String(200 + i + 1),
                    value: (10000 * (i+1) + 10000 * (i+1) * (i+1)) / 2 + 100000 * (i+1) + (i+1) * 10000 - (100 * (i+1) + 100 * (i+1) * (i+1)) / 2 + 6555000
                })),... Array.from({ length: 100 }, (elm, i) => ({
                    time: String(300 + i + 1),
                    value: (10000 * (i+1) + 10000 * (i+1) * (i+1)) / 2 + 1000000 * (i+1) + (i+1) * 100000 - (1000 * (i+1) + 1000 * (i+1) * (i+1)) / 2 + 67550000
                })),,... Array.from({ length: 600 }, (elm, i) => ({
                    time: String(400 + i + 1),
                    value: 2000000 * (i+1) + 223000000
                })),]
          }]
        }],
      });

      this.lineData.push({
        category: "blackhole",
        data: [{
            type: "GST",
            data: [{
              type: "burned",
              data: [...Array.from({ length: 100 }, (elm, i) => ({
                    time: String(101 + i),
                    value: (10000 * (i+1) + 10000 * (i+1) * (i+1)) / 2 
                })), ...Array.from({ length: 100 }, (elm, i) => ({
                    time: String(201 + i),
                    value: (10000 * (i+1) + 10000 * (i+1) * (i+1)) / 2 + (100000 * (i+1) + 100000 * (i+1) * (i+1)) / 2 + 50500000
                })), ... Array.from({ length: 100 }, (elm, i) => ({
                    time: String(301 + i),
                    value: (100000 * (i+1) + 100000 * (i+1) * (i+1)) / 2 + 606000000
                })),... Array.from({ length: 600 }, (elm, i) => ({
                    time: String(401 + i),
                    value: 1111000000
                })),]
            }]
        }]
      });


      // this.multipleSelection = val;

      // for (let i = 0; i < this.multipleSelection.length; i++) {
      //   this.lineData.push({
      //     category: this.multipleSelection[i].type,
      //     data: this.multipleSelection[i].data,
      //   });
      // }

      // // 取到所有选中的 type
      // let tmpAR = [];
      // for (let j = 0; j<val.length; j++){
      //   for (let k = 0; k<this.markerArray.length; k++){
      //     if(this.markerArray[k].type === val[j].type){
      //       for (let h = 0; h<this.markerArray[k].data.length; h++){
      //         tmpAR.push(this.markerArray[k].data[h]);
      //       }
      //     }
      //   }
      // }
      // this.SET_TMP_MARKER_ARRAY(tmpAR);

      // TODO (rebase hackathon)
      let tmpAR = [];
      let template = {};
      template.type = 'region';
      template.style = {};
      template.style.fill = 'red';
      template.style.stroke = 'red';
      template.style.fillOpacity = 0.5;
      template.style.lineOpacity = 0.5;
      template.style.opacity = 1;
      template.start = ["845",'min'];
      template.end = ["999",'max'];

      tmpAR.push(JSON.parse(JSON.stringify(template)));
      this.SET_TMP_MARKER_ARRAY(tmpAR);
    },

    /**
      * Allocation | PieChart 数据
    */
    async getAllocationData(idArray){
      // 从数据库按编号取每个编号里每个 token 中的 Allocation 数据
      this.pieData = [];
      // for (let j = 0; j < idArray.length; j++) {
      //   let tmp = await this.$indexedDB.fullValueSearch("historyData","id",3);
      //   for (let k = 0; k < tmp[0].data.length; k++) {
      //     if (tmp[0].data[k].type === idArray[j]) {
      //       for (let l = 0; l < tmp[0].data[k].graph.cells.length; l++) {
      //         if (tmp[0].data[k].graph.cells[l].shape === "circle") {
                
      //           for (let n=0;n<tmp[0].data[k].graph.cells[l].data.nodeData.tokenData.allocations.length;n++) {
      //             this.pieData.push({
      //               type:idArray[j] + '-' + tmp[0].data[k].graph.cells[l].attrs.text.text + '-' + tmp[0].data[k].graph.cells[l].data.nodeData.tokenData.allocations[n].name,
      //               value:tmp[0].data[k].graph.cells[l].data.nodeData.tokenData.allocations[n].prop,
      //             });
      //           }
      //         }
      //       }
      //     }
      //   } 
      // }

      // TODO (rebase hackathon)
      this.pieData.push({
        type: "User",
        value: 100,
      });
    },

    /**
      * 取每日释放面积图需要的所有数据
    */
   getDataInNeed(idArray){
      this.getVestData(idArray);
      this.getStakeRewardData(idArray);
    },

    /**
      * Stake Reward 数据
    */
    async getStakeRewardData(idArray){
      this.stakeReward = []

      // 从数据库按编号取每个编号 Release 数据
      // 遍历选中的编号
      for (let j = 0; j < idArray.length; j++) {
        // 从数据库取出整体 Vest 数据
        let tmp = await this.$indexedDB.fullValueSearch("historyData","id",4);

        for (let k = 0; k < tmp[0].data.length; k++) {
          // 遍历取出选中编号的 Stake Reward 数据
          if (tmp[0].data[k].type === idArray[j]) {
            this.stakeReward.push({
              selectId:idArray[j],
              stakeReward:tmp[0].data[k].stakeData
            })
          }
        }
      }
    },

    /**
      * Vest 数据
    */
    async getVestData(idArray) {
      this.vestData = [];

      // 从数据库按编号取每个编号 Release 数据

      // 遍历选中的编号
      for (let j = 0; j < idArray.length; j++) {
        // 从数据库取出整体 Vest 数据
        let tmp = await this.$indexedDB.fullValueSearch("historyData","id",4);

        for (let k = 0; k < tmp[0].data.length; k++) {
          let tmpVestData = [];
          // 遍历取出选中编号的 Vest 数据
          if (tmp[0].data[k].type === idArray[j]) {
            // 生成有 Vest 数据的日期列表
            let dateList = []
            for(var key of tmp[0].data[k].vestData.keys()) {
              dateList.push(key);
            }
            
            // 把每天每个参与方的数据存入 map
            for (let d = 0; d<dateList.length;d++){
              let valueMap = tmp[0].data[k].vestData.get(dateList[d])
              tmpVestData.push({
                date:dateList[d],
                role:"Team",
                value:valueMap.get("Team"),
              });
              tmpVestData.push({
                date:dateList[d],
                role:"Investor",
                value:valueMap.get("Investor"),
              });
              tmpVestData.push({
                date:dateList[d],
                role:"Advisor",
                value:valueMap.get("Advisor"),
              });
              tmpVestData.push({
                date:dateList[d],
                role:"Foundation",
                value:valueMap.get("Foundation"),
              });
              tmpVestData.push({
                date:dateList[d],
                role:"Community",
                value:valueMap.get("Community"),
              });
            }

            this.vestData.push({
              simulationDays: tmp[0].data[k].simulationDays,
              name:tmp[0].data[k].name,
              vestData:tmpVestData,
            })
          }
        }
      }

      // TODO：这里应该统计总共有几个参与方
      // 把数量存一下，计算每个参与方积累财富的时候使用
      // 由于现版本还没有改好 这里先写死数量5
      let rolesAmount = 5;
      this.roles = rolesAmount;

      // 取一下 Community 的 airdrop 数据
      // NOTE：以后叫啥还不一定呢 需要同步修改
      // IndexDB，id = 3，找到所有 token 的社区空投数据
      this.getAirdropAmount(idArray);
    },
    async getAirdropAmount(idArray){
      this.airdropData = [];
      // 遍历选中的编号
      for (let j = 0; j < idArray.length; j++) {
        // 从数据库取出所有 token 的社区空投数据
        let tmp = await this.$indexedDB.fullValueSearch("historyData","id",3);

        for (let k = 0; k < tmp[0].data.length; k++) {

          // 遍历取出选中编号的 Graph 数据
          if (tmp[0].data[k].type === idArray[j]) {
            for(let l = 0; l < tmp[0].data[k].graph.cells.length; l++) {
              if(tmp[0].data[k].graph.cells[l].data.type === 'Token'){
                // = totalSupply * Community Allocation /100 * Airdrop /100
                let communityAirdropAmount = 
                  tmp[0].data[k].graph.cells[l].data.nodeData.tokenData.totalSupply * 
                  tmp[0].data[k].graph.cells[l].data.nodeData.tokenData.allocations[4].prop /100 * 
                  tmp[0].data[k].graph.cells[l].data.nodeData.tokenData.community.allocations[0].prop / 100;
                this.airdropData.push({
                  name:tmp[0].data[k].graph.cells[l].attrs.text.text,
                  amount:communityAirdropAmount
                })
              }             
            }
          }
        }
      }
  
      this.getInitialData(idArray);
    },
    /**
     * 计算初始释放 Token ｜ Community - Airdrop
     * TODO：未加质押奖励 ！！！
    */
    getInitialData(idArray){
      // 初始化参与方的 Accumulate Amount
      // Advance: 考虑到以后要自定义参与方姓名和数量，这里不能写死
      // 参与方数量有先后，可用列表位置代表
      // 有几个参与方就 push 几个 0
      // 有空投的（community）可以直接 push 空投数量
      // 根据目前的结构，各参与方顺序为：Team，Investors，Advisor，Foundation，Community
      let accumulateAmount = [];
      let accumulateData = [];
      for (let i=0; i<this.airdropData.length; i++) {
        if (this.airdropData[i].amount) {
          for (let j=0;j<this.roles-1;j++){
            accumulateAmount.push(0);
          }
          accumulateAmount.push(this.airdropData[i].amount);
        }
        else {
          for (let j=0;j<this.roles;j++){
            accumulateAmount.push(0);
          }
          accumulateAmount.push(this.airdropData[i].amount);
        }
        accumulateData.push({
          name:this.airdropData[i].name,
          accumulate:accumulateAmount
        })
      }
      
      this.calculateAccumulateData(accumulateData,idArray);
    },
    /**
     * Vest 数据拼凑成 Accumulate 数据 = 初始释放 Token ｜ Community - Airdrop + Vest
     * TODO：未加质押奖励 ！！！
    */
    calculateAccumulateData(accumulateData,idArray){
      // 收到的参数是一个列表，列表里面是对象 表示每个各个参与方最开始的空投金额
      // 目前的设计，只有 community 在有空投时非 0 其他参与方都是0

      this.accumulation = [];
      // accumulateData && this.vestData 都是 array
      // 同一位置的 token 名称是对应的
      for(let i=0;i<accumulateData.length;i++){
        let initiaAmount = accumulateData[i].accumulate;
        for(let j=0;j<this.vestData.length;j++){
          for(let k=0;k<this.vestData[j].vestData.length;k++){
              if(this.vestData[j].vestData[k].role === "Team") {
                initiaAmount[0] = initiaAmount[0]+this.vestData[j].vestData[k].value;
                this.accumulation.push({
                  date:this.vestData[j].vestData[k].date,
                  role:this.vestData[j].vestData[k].role,
                  value:initiaAmount[0]
                });
                //console.log("date|role|value",this.vestData[j].vestData[k].date,this.vestData[j].vestData[k].role,initiaAmount[0]);
              }
              else if(this.vestData[j].vestData[k].role === "Investor") {
                initiaAmount[1] = initiaAmount[1]+this.vestData[j].vestData[k].value;
                this.accumulation.push({
                  date:this.vestData[j].vestData[k].date,
                  role:this.vestData[j].vestData[k].role,
                  value:initiaAmount[1]
                });
                //console.log("date|role|value",this.vestData[j].vestData[k].date,this.vestData[j].vestData[k].role,initiaAmount[1]);
              }
              else if(this.vestData[j].vestData[k].role === "Advisor") {
                initiaAmount[2] = initiaAmount[2]+this.vestData[j].vestData[k].value;
                this.accumulation.push({
                  date:this.vestData[j].vestData[k].date,
                  role:this.vestData[j].vestData[k].role,
                  value:initiaAmount[2]
                });
                //console.log("date|role|value",this.vestData[j].vestData[k].date,this.vestData[j].vestData[k].role,initiaAmount[2]);
              }
              else if(this.vestData[j].vestData[k].role === "Foundation") {
                initiaAmount[3] = initiaAmount[3]+this.vestData[j].vestData[k].value;
                this.accumulation.push({
                  date:this.vestData[j].vestData[k].date,
                  role:this.vestData[j].vestData[k].role,
                  value:initiaAmount[3]
                });
                //console.log("date|role|value",this.vestData[j].vestData[k].date,this.vestData[j].vestData[k].role,initiaAmount[3]);
              }
              else{
                initiaAmount[4] = initiaAmount[4]+this.vestData[j].vestData[k].value;
                this.accumulation.push({
                  date:this.vestData[j].vestData[k].date,
                  role:this.vestData[j].vestData[k].role,
                  value:initiaAmount[4]
                });
                //console.log("date|role|value",this.vestData[j].vestData[k].date,this.vestData[j].vestData[k].role,initiaAmount[4]);
              }
          }
        }
        // Vest 天数可能小于总天数，剩余天数也需要数据
        // 先拿到 vest 最后一天的 date，然后 跟计算的总天数对比，如少于，则补足
        let theLastVestDate = this.accumulation[this.accumulation.length-1].date;
        let totalSimulationDays = this.vestData[i].simulationDays;
        if(totalSimulationDays>theLastVestDate){
          for(let day=theLastVestDate+1;day<=totalSimulationDays;day++){
            this.accumulation.push({
              date:day,
              role:"Team",
              value:initiaAmount[0]
            });
            this.accumulation.push({
              date:day,
              role:"Investor",
              value:initiaAmount[1]
            });
            this.accumulation.push({
              date:day,
              role:"Advisor",
              value:initiaAmount[2]
            });
            this.accumulation.push({
              date:day,
              role:"Foundation",
              value:initiaAmount[3]
            });
            this.accumulation.push({
              date:day,
              role:"Community",
              value:initiaAmount[4]
            });
          }
        }
      }

      let tmpStakeReward = 0
      for (let id = 0; id < idArray.length; id++) {
        for(let sr = 0; sr < this.stakeReward.length; sr++) {
          if(this.stakeReward[sr].selectId === idArray[id]){
            for (let s=0; s<this.stakeReward[sr].stakeReward.length; s++){
              tmpStakeReward = tmpStakeReward + this.stakeReward[sr].stakeReward[s];
              this.accumulation.push({
                date:s+1,
                role:"Staking Reward",
                value:tmpStakeReward,
              })
            }
          }
        }
      }
    },
    /**
     * TODO
     * 根据测算得到的数据修改该方法
     * 将被选中的数据根据类别type进行标注，并push到折线图数据中
     */
    handleSelectionChange(val) {
      // 先取选中的编号
      let idArray = [];
      for (let i = 0; i < val.length; i++) {
        idArray.push(val[i].type);
      }

      // 取 LineData 即 Free Money 数据
      this.getFreeMoneyData(val);

      // 取 PieData 即 Allocations 数据
      this.getAllocationData(idArray);

      // 取 AreaData 即 Token Emission 数据
      // Process: 
      // 先把 vestHistory 存 indexDB ： getVestData
      // 算社区首日空投数量 ： getAirdropAmount
      // 算每个参与方首日空投数量，目前仅社区有空投 : getInitialData
      // 拼接每个参与方每日 Release 数据 : calculateAccumulateData

      // this.getDataInNeed(idArray);
    },
  },
  computed: {
    ...mapState([
      "historySimulateData",
      "propertyResult",
      "getHistoryDataFromIndexDB",
      "markerArray",
    ]),
  },
};
</script>
<style lang="scss">
.visual-panel {
  text-align: center;
  overflow: scroll;
  background-color: #f5f5f5;
  .help {
    position: absolute;
    top: 20px;
    left: 230px;
    font-size: 20px;
    cursor: pointer;
  }
  .help-container {
    float: left;
    padding: 0px 20px 0px 20px;
    margin-left: 15px;
    margin-bottom: 5px;
    width: 94%;
    height: 40px;
    background-color: rgba(255, 255, 255, 0);
    text-align: left;
    span {
      padding-left: 10px;
      .el-icon-warning {
        font-size: 20px;
      }
    }
    div {
      padding-left: 30px;
      font-size: 10px;
    }
  }
  .charts-container {
    float: left;
    padding: 0px 20px 0px 20px;
    margin-left: 15px;
    margin-top: 10px;
    width: 68%;
    height: 60%;

    background-color: #fff;
    border: 1px solid rgb(228, 228, 228);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }
  .data-selected-container {
    float: left;
    margin-top: 30px;
    margin-left: 30px;
    width: 22%;
    height: 70%;

    .select-title {
      display: block;
      margin: 0px auto;

      width: 180px;
      height: 30px;
      line-height: 30px;
      background-color: rgb(58, 58, 58);
      color: rgb(250, 250, 250);
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
    }
    .select-table {
      margin-top: 20px;

      height: 500px;
    }
    .history-table {
      border-radius: 10px;
    }
  }
  .helpShow {
    display: none;
  }
}
</style>