<template >
  <el-collapse-transition>
    <div class="visual-panel">
      <p v-if="running">The calculation data of the current model is being generated, please wait.</p>
      <!-- <span class="help"
        ><i class="el-icon-question" @click="helpShow = !helpShow"></i>
      </span> -->

      <div class="charts-container">
        <el-empty v-if="!selectedData" class="empty-chart" description="Please Select Data to Show Visual Chart~!"></el-empty>
        <div v-else>
          <el-tabs v-model="editableTabsValue" type="card" closable @tab-remove="removeTab" @tab-click="tabClickFunc">
            <el-tab-pane
              v-for="(item, ) in editableTabs"
              :key="item.name"
              :label="item.title"
              :name="item.name"
            >
              <LinePie v-if="item.content === 'genesis'" :linePieData="genesisLinePieData"/>
              <LinePie v-if="item.content === 'blackhole'" :linePieData="blackholeLinePieData" :options="options"/>
              <LinePie v-if="item.content === 'pool'" :linePieData="poolLinePieData" :options="options"/>
              <LinePie v-if="item.content === 'stakeholder'" :linePieData="stakeholderLinePieData" :options="options"/>

            </el-tab-pane>
        </el-tabs>
        </div>
        <!-- <el-tabs v-model="activeName">

          <el-tab-pane label="Allocations" name="first">
            <PieChart :rawpiedata="pieData" :options="options"/>
          </el-tab-pane>

          <el-tab-pane label="Token Emission" name="second">
            <AreaChart :areadata="accumulation"/>
          </el-tab-pane>
          
          <el-tab-pane label="Free Money" name="third"> -->
            <!-- 调用作图组件，传入对应的数据包含折线图数据、x轴字段名、y、分类字段名 -->
            <!-- <LineChart :linedata="lineData" />
          </el-tab-pane>
        </el-tabs> -->

      </div>


      <!-- 历史数据选择 -->
      <div class="data-selected-container">

        <span class="select-title">Data Selection</span>

        <el-collapse v-model="activeNames" @change="handleChange" class="select-content">
          <el-collapse-item title="Simulation Id" name="1">
            <!-- <div class="select-id"> -->
              <!-- 使用从 IndexDB 中取到到历史测算数据 -->
              <el-table
                ref="multipleTable"
                :data="this.indexList"
                height="200px"
                tooltip-effect="dark"
                style="width: 100%"
                class="history-table"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="45"> </el-table-column>            
                <el-table-column prop="index" label="ID" width="80"></el-table-column>
                <el-table-column label="Operation" width="110">
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
            <!-- </div> -->
          </el-collapse-item>
          
          <el-collapse-item title="Simulation Data" name="2">
            <div class="select-data">
              <el-cascader
                :options="options"
                :props="props"
                v-model="selectData"
                @change="handleSelectedDataChange"
                placeholder="Select Data"
                clearable></el-cascader>
            </div>
          </el-collapse-item>
        </el-collapse>
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
import LinePie from "../Chart/LinePie";
import { mapState, mapMutations } from "vuex";
export default {
  data() {
    return {
      running:false,
      selectedData:false,
      // Select -  simulationId && Data 选择的折叠面板编号
      activeNames: ['1','2'],
      // Select Ids
      idArray:[],
      // Select simulationData 的 props
      props:{multiple:true},
      // Select simulationData 的 data
      options:[],
      selectData:[],
      // genesisOptionChildren:[
      //   {
      //     value:"Allocation",
      //     label:"Allocation",
      //     children:[
      //       {
      //         value:"Daily-Emission",
      //         label:"Daily-Emission",
      //       },
      //       {
      //         value:"Token-Accumulation",
      //         label:"Token-Accumulation",
      //       }
      //     ]
      //   },
      //   {
      //     value:"Amount",
      //     label:"Amount",
      //     children:[
      //       {
      //         value:"Tokens",
      //         label:"Tokens",
      //       },
      //       {
      //         value:"PPL",
      //         label:"PPL",
      //       }
      //     ]
      //   },
      // ],
      // poolOptionChildren:[
      //   {
      //     value:"Flow",
      //     label:"Flow",
      //   },
      //   {
      //     value:"Pool-Accumulation",
      //     label:"Pool-Accumulation"
      //   },
      // ],
      // stakeholderOptionChildren:[
      //   {
      //     value:"Holding",
      //     label:"Holding",
      //   },
      //   {
      //     value:"StakeAndFreeMoney",
      //     label:"StakeAndFreeMoney"
      //   },
      // ],
      genesisLinePieData:[],
      blackholeLinePieData:[],
      poolLinePieData:[],
      stakeholderLinePieData:[],
      linePieData:[],
      areadata:[],
      // 可视化图标分页配置：
      editableTabsValue: '',
      editableTabs: [],
      //tabIndex: 0,

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
      pieData:{
        holding:[],
        allocations:[]
      },
      //面积图数据 ｜ Accumulate 数据
      accumulation:[],
      // Vest 数据
      vestData:[],
      roles:0,
      airdropData:[],
      // Stake Reward Data
      stakeReward:[],
    };
  },
  components: {
    // LineChart,
    // PieChart,
    // AreaChart,
    Rules,
    LinePie,
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
    handleNavMenuSelect(key, keyPath) {
      console.log(key, keyPath);
    },
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
      this.pieData.holding = [];
      this.pieData.allocations = [];
      this.options[0].children = [];
      this.options[1].children = [];
      for (let i = 0; i < idArray.length; i++) {
        // stakeholder holding data
        let tmp0 = await this.$indexedDB.fullValueSearch("historyData","id",0);
        // label to id data
        let tmp1 = await this.$indexedDB.fullValueSearch("historyData","id",1);

        // TODO：这里的逻辑是按画布上有的 token 节点取的 label｜text
        //  如果画布上无，但是用户在右侧属性栏写了 最终是选不到的！！

        // prepare token / genesis to piechart select options
        if(tmp1[0].data[idArray[i]][0].size) {
          this.options[0].disabled = false;
            for(var key of tmp1[0].data[idArray[i]][0].keys()){
              let str = key;
              this.options[0].children.push({
                value:str,
                label:str
              })
            }
        }
        console.log("op",this.options)
        if(tmp0[0].data[idArray[i]].size) {
          // token allocation pie chart data
          let tokenList = [];
          let allocations = [];
          // prepare stakeholder to piechart select options
          this.options[1].disabled = false;
          for(var key of tmp0[0].data[idArray[i]].keys()){
            let str = idArray[i] + '-' + key;
            this.options[1].children.push({
              value:str,
              label:str
            })

            // prepare pie chart data - staker holding pie chart data
            let holding = [];

            for(var map of tmp0[0].data[idArray[i]].get(key)){
              holding.push({
                type:map[0],
                value:Number(map[1])
              })
              var tmp = [];
              
              if(tokenList.indexOf(map[0]) === -1){
                tokenList.push(map[0]);
                tmp.push({
                  type:str,
                  value:Number(map[1])
                })
                
                allocations.push(tmp)
              }
              else {
                allocations[tokenList.indexOf(map[0])].push({
                  type:str,
                  value:Number(map[1])
                })
              }
            }
            this.pieData.holding.push({
              holder:str,
              holding:holding
            })     
          }
          // token allocation pie chart data
          for(let i=0;i<tokenList.length;i++) {
            this.pieData.allocations.push({
              token:tokenList[i],
              allocations:allocations[i]
            })
          }
        }
      }
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
    removeTab(targetName) {
      let tabs = this.editableTabs;
      let activeName = this.editableTabsValue;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
        
      this.editableTabsValue = activeName;
      this.editableTabs = tabs.filter(tab => tab.name !== targetName);
    },
    tabClickFunc(){
      console.log("click",this.editableTabsValue);
    },
    handleChange(){},
    dailyEmission(simulationData,modelData,val,i){
      let daysMap = new Map();
      let dailyEmissionResult = [];
      console.log(simulationData)
      for(let j=0;j<simulationData.srcElement.result.length;j++){
        if(simulationData.srcElement.result[j].get("simulateId") === val[i][0][0]) {
          // 要找 src 是选中 genesis 的所有线
          for(let k=0;k<modelData.srcElement.result.length;k++){
            if(modelData.srcElement.result[k].get("simulateId") === val[i][0][0]){
              let graphData = modelData.srcElement.result[k].get("graph");
              for(let l=0;l<graphData.cells.length;l++){
                // 只取 source 是 genesis 的线 该线的 source 是选中的 genesis
                if(graphData.cells[l].shape === 'edge' && graphData.cells[l].source.cell === val[i][0][1]){
                  // 去找这个线的数据
                  let tmpEdge = simulationData.srcElement.result[j].get("data").get("edge");
                  if(tmpEdge.has(graphData.cells[l].id)){
                    let days = Array.from(tmpEdge.get(graphData.cells[l].id).keys());
                  // day -> token -> transferAmount
                    for(let m=0;m<days.length;m++){
                      let tokens = Array.from(simulationData.srcElement.result[j].get("data").get("edge").get(graphData.cells[l].id).get(days[m]).keys());
                      if(daysMap.has(days[m])){
                        let tokenMap = daysMap.get(days[m]);
                        for(let n=0;n<tokens.length;n++){
                          if(tokenMap.has(tokens[n])) tokenMap.set(tokens[n],tokenMap.get(tokens[n])+simulationData.srcElement.result[j].get("data").get("edge").get(graphData.cells[l].id).get(days[m]).get(tokens[n]));
                          else tokenMap.set(tokens[n],simulationData.srcElement.result[j].get("data").get("edge").get(graphData.cells[l].id).get(days[m]).get(tokens[n]));
                        }
                        daysMap.set(days[m],tokenMap);
                      }
                      else{
                        let tokenMap = new Map();
                        for(let n=0;n<tokens.length;n++){
                          if(tokenMap.has(tokens[n])) tokenMap.set(tokens[n],tokenMap.get(tokens[n])+simulationData.srcElement.result[j].get("data").get("edge").get(graphData.cells[l].id).get(days[m]).get(tokens[n]));
                          else tokenMap.set(tokens[n],simulationData.srcElement.result[j].get("data").get("edge").get(graphData.cells[l].id).get(days[m]).get(tokens[n]));
                        }
                        daysMap.set(days[m],tokenMap);
                      }
                    }
                  }
                }
              }
            } 
          }
        }
      }
      let allDays = Array.from(daysMap.keys());
      if(allDays.length) this.selectedData = true;
      for(let d=0;d<allDays.length;d++){
        let allTokens = Array.from(daysMap.get(allDays[d]).keys());
        for(let t=0;t<allTokens.length;t++){
          dailyEmissionResult.push({
            day:allDays[d].toString(),
            token:allTokens[t]+'-'+val[i][0][0],
            releaseAmount:daysMap.get(allDays[d]).get(allTokens[t])
          });
        }
      }
      return dailyEmissionResult;
    },
    tokenAccumulation(simulationData,modelData,val,i){
      let dayMap = new Map();
      let tokenAccumulationResult = [];
      for(let j=0;j<simulationData.srcElement.result.length;j++){
        if(simulationData.srcElement.result[j].get("simulateId") === val[i][0][0] && modelData.srcElement.result[j].get("simulateId") === val[i][0][0]) {
          // select id 相等， 拿 source 是 选中 genesis 的 edge id
          for(let k=0;k<modelData.srcElement.result[j].get("graph").cells.length;k++){
            if(modelData.srcElement.result[j].get("graph").cells[k].shape === 'edge' && modelData.srcElement.result[j].get("graph").cells[k].source.cell === val[i][0][1]){
                        
              let tmpData = simulationData.srcElement.result[j].get("data").get("edge").get(modelData.srcElement.result[j].get("graph").cells[k].id);
              let days = Array.from(tmpData.keys());
              if(days.length) this.selectedData = true;
                for(let l=0;l<days.length;l++){
                  // 拿到这一天的 token
                  let tokens = Array.from(tmpData.get(days[l]).keys());
                  // 有其他线已经存过这一天
                  if(dayMap.has(days[l])){
                    // 把这一天进行累加
                    let tokenMap = dayMap.get(days[l]);
                    for(let m=0;m<tokens.length;m++){
                      if(tokenMap.has(tokens[m]))
                      tokenMap.set(tokens[m],tokenMap.get(tokens[m])+tmpData.get(days[l]).get(tokens[m]));
                      else tokenMap.set(tokens[m],tmpData.get(days[l]).get(tokens[m]));
                    }
                    dayMap.set(days[l],tokenMap);
                  }
                  // 没有其他线存过这一天
                  else dayMap.set(days[l],tmpData.get(days[l]));
                }
            }
          }
        } 
      }
      let dayForAreaChart = Array.from(dayMap.keys());
                
      if(dayForAreaChart.length){
        let tmpForAreaChart = new Map();
        // 先取首日数据
        let tokensForAreaChart = Array.from(dayMap.get(dayForAreaChart[0]).keys());
        for(let token=0;token<tokensForAreaChart.length;token++){
          tokenAccumulationResult.push({
            day:dayForAreaChart[0].toString(),
            token:tokensForAreaChart[token],
            accumulateAmount:dayMap.get(dayForAreaChart[0]).get(tokensForAreaChart[token])
          })
          tmpForAreaChart.set(tokensForAreaChart[token],dayMap.get(dayForAreaChart[0]).get(tokensForAreaChart[token]));
        }

        for(let day=1;day<dayForAreaChart.length;day++){
          let tokensForAreaChart = Array.from(dayMap.get(dayForAreaChart[0]).keys());
          for(let token=0;token<tokensForAreaChart.length;token++){
              if(tmpForAreaChart.has(tokensForAreaChart[token])){
                tokenAccumulationResult.push({
                  day:dayForAreaChart[day].toString(),
                  token:tokensForAreaChart[token],
                  accumulateAmount:dayMap.get(dayForAreaChart[day]).get(tokensForAreaChart[token]) + tmpForAreaChart.get(tokensForAreaChart[token])
                })
                tmpForAreaChart.set(tokensForAreaChart[token],dayMap.get(dayForAreaChart[day]).get(tokensForAreaChart[token]) + tmpForAreaChart.get(tokensForAreaChart[token]));
              }
              else {
                tokenAccumulationResult.push({
                  day:dayForAreaChart[day].toString(),
                  token:tokensForAreaChart[token],
                  accumulateAmount:dayMap.get(dayForAreaChart[day]).get(tokensForAreaChart[token])
                })
                tmpForAreaChart.set(tokensForAreaChart[token],dayMap.get(dayForAreaChart[day]).get(tokensForAreaChart[token]));
              }
          }
        }
      }                 
      return tokenAccumulationResult;
    },
    getPoolOut(simulationData,modelData,val,i){
      let poolOutResult = [];
      let edgeID = [];
      let poolID = [];
      for(let j=0;j<simulationData.srcElement.result.length;j++){
        if(simulationData.srcElement.result[j].get("simulateId") === val[i][0][0] && modelData.srcElement.result[j].get("simulateId") === val[i][0][0]) {
          // select id 相等， 先存所有 pool 的 id
          for(let k=0;k<modelData.srcElement.result[j].get("graph").cells.length;k++){
            if(modelData.srcElement.result[j].get("graph").cells[k].shape === 'polygon' && modelData.srcElement.result[j].get("graph").cells[k].data.type === 'pool') poolID.push(modelData.srcElement.result[j].get("graph").cells[k].id);
            
            // 存 source 是 pool 的线 ID
            if(modelData.srcElement.result[j].get("graph").cells[k].shape === 'edge'){
              if(poolID.indexOf(modelData.srcElement.result[j].get("graph").cells[k].source.cell)!=-1) edgeID.push(modelData.srcElement.result[j].get("graph").cells[k].id);
            }
          }
        }
        // 按线的 Id 取线数据
        for(let l=0;l<edgeID.length;l++){
          let edgeData = simulationData.srcElement.result[j].get("data").get("edge").get(edgeID[l]);
          let days = Array.from(edgeData.keys());
          for(let d=0;d<days.length;d++){
            let tokens = Array.from(edgeData.get(days[d]).keys());
            for(let t=0;t<tokens.length;t++){
              poolOutResult.push({
                day:days[d].toString(),
                token:tokens[t]+'-'+val[i][0][0],
                releaseAmount:edgeData.get(days[d]).get(tokens[t])
              });
            }
          }
        }
      }
      return poolOutResult;
    },
    getPoolIn(simulationData,modelData,val,i){
      let poolInResult = [];
      let edgeID = [];
      let poolID = [];
      for(let j=0;j<simulationData.srcElement.result.length;j++){
        if(simulationData.srcElement.result[j].get("simulateId") === val[i][0][0] && modelData.srcElement.result[j].get("simulateId") === val[i][0][0]) {
          // select id 相等， 先存所有 pool 的 id
          for(let k=0;k<modelData.srcElement.result[j].get("graph").cells.length;k++){
            if(modelData.srcElement.result[j].get("graph").cells[k].shape === 'polygon' && modelData.srcElement.result[j].get("graph").cells[k].data.type === 'pool') poolID.push(modelData.srcElement.result[j].get("graph").cells[k].id);
            
            // 存 target 是 pool 的线 ID
            if(modelData.srcElement.result[j].get("graph").cells[k].shape === 'edge'){
              if(poolID.indexOf(modelData.srcElement.result[j].get("graph").cells[k].target.cell)!=-1) edgeID.push(modelData.srcElement.result[j].get("graph").cells[k].id);
            }
          }
        }
        // 按线的 Id 取线数据
        for(let l=0;l<edgeID.length;l++){
          let edgeData = simulationData.srcElement.result[j].get("data").get("edge").get(edgeID[l]);
          let days = Array.from(edgeData.keys());
          for(let d=0;d<days.length;d++){
            let tokens = Array.from(edgeData.get(days[d]).keys());
            for(let t=0;t<tokens.length;t++){
              poolInResult.push({
                day:days[d].toString(),
                token:tokens[t]+'-'+val[i][0][0],
                releaseAmount:edgeData.get(days[d]).get(tokens[t])
              });
            }
          }
        }
      }
      return poolInResult;
    },
    getBlackholeIn(simulationData,modelData,val,i){
      let blackholeInResult = [];
      let edgeID = [];
      let blackholeID = [];
      for(let j=0;j<simulationData.srcElement.result.length;j++){
        if(simulationData.srcElement.result[j].get("simulateId") === val[i][0][0] && modelData.srcElement.result[j].get("simulateId") === val[i][0][0]) {
          // select id 相等， 先存所有 blackhole 的 id
          for(let k=0;k<modelData.srcElement.result[j].get("graph").cells.length;k++){
            if(modelData.srcElement.result[j].get("graph").cells[k].shape === 'circle' && modelData.srcElement.result[j].get("graph").cells[k].data.type === 'blackhole') blackholeID.push(modelData.srcElement.result[j].get("graph").cells[k].id);
            
            // 存 target 是 pool 的线 ID
            if(modelData.srcElement.result[j].get("graph").cells[k].shape === 'edge'){
              if(blackholeID.indexOf(modelData.srcElement.result[j].get("graph").cells[k].target.cell)!=-1) edgeID.push(modelData.srcElement.result[j].get("graph").cells[k].id);
            }
          }
        }
        // 按线的 Id 取线数据
        for(let l=0;l<edgeID.length;l++){
          let edgeData = simulationData.srcElement.result[j].get("data").get("edge").get(edgeID[l]);
          let days = Array.from(edgeData.keys());
          for(let d=0;d<days.length;d++){
            let tokens = Array.from(edgeData.get(days[d]).keys());
            for(let t=0;t<tokens.length;t++){
              blackholeInResult.push({
                day:days[d].toString(),
                token:tokens[t]+'-'+val[i][0][0],
                releaseAmount:edgeData.get(days[d]).get(tokens[t])
              });
            }
          }
        }
      }
      return blackholeInResult;
    },
    async handleSelectedDataChange2(val){
      this.linePieData = [];
      this.areadata = [];
      this.editableTabs = [];
      let tmp = await this.$indexedDB.getAll("historySimulationData");
      let modelData = await this.$indexedDB.getAll("historyModelData");

      for(let i =0;i<val.length;i++){
        switch(val[i][1]) {
          // genesis
          case "Allocation":
            switch(val[i][2]){
              case "Daily-Emission":
                // 计算逻辑：从线取每日流出量
                // TODO：POOL、Stakeholder 初始持有量未加入第一天 !!!
                let dailyEmissionResult = this.dailyEmission(tmp,modelData,val,i);
                for(let der=0;der<dailyEmissionResult.length;der++){
                  this.linePieData.push(dailyEmissionResult[der]);
                }
                this.editableTabs.push({
                  title: "Daily-Emission",
                  name: "Daily-Emission",
                  content: "linePie"
                });
                break;
              case "Token-Accumulation":
                // 计算逻辑，每日释放累加 
                // TODO : POOL、Stakeholder 初始持有量加入第一天
                let tokenAccumulationResult =  this.tokenAccumulation(tmp,modelData,val,i);
                for(let tar=0;tar<tokenAccumulationResult.length;tar++){
                  this.areadata.push(tokenAccumulationResult[tar]);
                }
                this.editableTabs.push({
                  title: "Accumulaion",
                  name: "Accumulaion",
                  content: "areaChart"
                });
                break;
              default:
                break;
            }
            break;

          case "Amount":
            switch(val[i][2]){
              case "Tokens":
                // Release - burn - stake + unstake
                // Release 判断：1. mint: source 是 genesis  2. unstake：source 是 pool
                // freeze 判断：1. burn: target 是 blackhole  2. stake:target 是 pool
                let releaseMoneyMap = new Map();
                let freezeMoneyMap = new Map();
                let freeMoneyMap = new Map();

                let genesisEverydayRelease = this.dailyEmission(tmp,modelData,val,i);
                let blackholeInEveryday = this.getBlackholeIn(tmp,modelData,val,i);
                let poolInEveryday = this.getPoolIn(tmp,modelData,val,i);
                let poolOutEveryday = this.getPoolOut(tmp,modelData,val,i);

                for(let i =0;i<genesisEverydayRelease.length;i++){
                  if(releaseMoneyMap.has(genesisEverydayRelease[i].day)) {
                    let tokenMap = releaseMoneyMap.get(genesisEverydayRelease[i].day);
                    if (tokenMap.has(genesisEverydayRelease[i].token)){
                      tokenMap.set(genesisEverydayRelease[i].token,tokenMap.get(genesisEverydayRelease[i].token)+genesisEverydayRelease[i].releaseAmount);
                    }
                    else tokenMap.set(genesisEverydayRelease[i].token,genesisEverydayRelease[i].releaseAmount);

                    releaseMoneyMap.set(genesisEverydayRelease[i].day,tokenMap);
                  }
                  else{
                    let tokenMap = new Map();
                    tokenMap.set(genesisEverydayRelease[i].token,genesisEverydayRelease[i].releaseAmount);
                    releaseMoneyMap.set(genesisEverydayRelease[i].day,tokenMap);
                  }
                }
                for(let i =0;i<poolOutEveryday.length;i++){
                  if(releaseMoneyMap.has(poolOutEveryday[i].day)) {
                    let tokenMap = releaseMoneyMap.get(poolOutEveryday[i].day);
                    if (tokenMap.has(poolOutEveryday[i].token)){
                      tokenMap.set(poolOutEveryday[i].token,tokenMap.get(poolOutEveryday[i].token)+poolOutEveryday[i].releaseAmount);
                    }
                    else tokenMap.set(poolOutEveryday[i].token,poolOutEveryday[i].releaseAmount);

                    releaseMoneyMap.set(poolOutEveryday[i].day,tokenMap);
                  }
                  else{
                    let tokenMap = new Map();
                    tokenMap.set(poolOutEveryday[i].token,poolOutEveryday[i].releaseAmount);
                    releaseMoneyMap.set(poolOutEveryday[i].day,tokenMap);
                  }
                }
                for(let i =0;i<poolInEveryday.length;i++){
                  if(freezeMoneyMap.has(poolInEveryday[i].day)) {
                    let tokenMap = freezeMoneyMap.get(poolInEveryday[i].day);
                    if (tokenMap.has(poolInEveryday[i].token)){
                      tokenMap.set(poolInEveryday[i].token,tokenMap.get(poolInEveryday[i].token)+poolInEveryday[i].releaseAmount);
                    }
                    else tokenMap.set(poolInEveryday[i].token,poolInEveryday[i].releaseAmount);

                    freezeMoneyMap.set(poolInEveryday[i].day,tokenMap);
                  }
                  else{
                    let tokenMap = new Map();
                    tokenMap.set(poolInEveryday[i].token,poolInEveryday[i].releaseAmount);
                    freezeMoneyMap.set(poolInEveryday[i].day,tokenMap);
                  }
                }
                for(let i =0;i<blackholeInEveryday.length;i++){
                  if(freezeMoneyMap.has(blackholeInEveryday[i].day)) {
                    let tokenMap = freezeMoneyMap.get(blackholeInEveryday[i].day);
                    if (tokenMap.has(blackholeInEveryday[i].token)){
                      tokenMap.set(blackholeInEveryday[i].token,tokenMap.get(blackholeInEveryday[i].token)+blackholeInEveryday[i].releaseAmount);
                    }
                    else tokenMap.set(blackholeInEveryday[i].token,blackholeInEveryday[i].releaseAmount);

                    freezeMoneyMap.set(blackholeInEveryday[i].day,tokenMap);
                  }
                  else{
                    let tokenMap = new Map();
                    tokenMap.set(blackholeInEveryday[i].token,blackholeInEveryday[i].releaseAmount);
                    freezeMoneyMap.set(blackholeInEveryday[i].day,tokenMap);
                  }
                }
                
                // the first day
                let allReleaseDays = Array.from(releaseMoneyMap.keys());
                let cur = releaseMoneyMap.get(allReleaseDays[0])
                freeMoneyMap.set(allReleaseDays[0],cur);
                console.log("cur1",cur);
                
                for(let j=1;j<allReleaseDays.length;j++){
                  let curRelease = releaseMoneyMap.get(allReleaseDays[j]);
                  let curToken = Array.from(curRelease.keys());
                  for(let k=0;k<curToken.length;k++){
                    if(cur.has(curToken[k])) cur.set(curToken[k],cur.get(curToken[k])+curRelease.get(curToken[k]))
                    else cur.set(curToken[k],curRelease.get(curToken[k]))
                  }
                  freeMoneyMap.set(allReleaseDays[j],cur);
                  console.log("cur",cur);
                }
                // console.log("genesisEverydayRelease",genesisEverydayRelease);
                // console.log("poolOutEveryday",poolOutEveryday);
                // console.log("poolInEveryday",poolInEveryday);
                // console.log("blackholeInEveryday",blackholeInEveryday);
                // console.log("freezeMoneyMap",freezeMoneyMap);
                // console.log("freeMoneyMap",freeMoneyMap);
                break;
              case "PPL":
                // in - out
                break;
              default:
                break;
            }
            break;

          default:
            break;
          }
      }
      console.log("val",val);
    },
    /**
     * 分别选出要新增和删除的数据
     */
    getAdd(add,del){
      let news = [];
      for(let i=0;i<del.length;i++){
        if(add.indexOf(del[i]) === -1) news.push(del[i]);
      }
      return news;
    },
    getDel(add,del){
      let dels = [];
      for(let j=0;j<add.length;j++){
        if(del.indexOf(add[j]) === -1) dels.push(add[j]);
      }
      return dels;
    },
    /**
     * 这里根据用户选的数据生成可视化图表
     * TODO for循环嵌套太多了，需要优化
    */
    async handleSelectedDataChange(val){
      this.editableTabs = [];
      this.genesisLinePieData = [];
      this.blackholeLinePieData = [];
      this.poolLinePieData = [];
      this.stakeholderLinePieData = [];

      console.log(val);
      let genesisChartData = new Map();
      let blackholeChartData = new Map();
      let poolChartData = new Map();
      let stakeholderChartData = new Map();
      let getHistorySimulationData = await this.$indexedDB.getAll("historySimulationData");
      for(let i=0;i<getHistorySimulationData.srcElement.result.length;i++){
        for(let j=0;j<this.idArray.length;j++){
          if(getHistorySimulationData.srcElement.result[i].get("simulateId")===this.idArray[j]){
            for(let k=0;k<val.length;k++){
              if(getHistorySimulationData.srcElement.result[i].get("data").get("genesis").has(val[k][0])){
                let genesisData = getHistorySimulationData.srcElement.result[i].get("data").get("genesis").get(val[k][0]);
                for(let l=0;l<genesisData.length;l++){
                  if(genesisData[l].token === val[k][1]) {
                    if(genesisChartData.has(genesisData[l].token)){
                      let tmp = genesisChartData.get(genesisData[l].token);
                      if(tmp.has(genesisData[l].day)) tmp.set(genesisData[l].day,tmp.get(genesisData[l].day)+genesisData[l].remainAmount);
                      else tmp.set(genesisData[l].day,genesisData[l].remainAmount);
                      genesisChartData.set(genesisData[l].token,tmp);
                    }
                    else{
                      let tmp = new Map();
                      tmp.set(genesisData[l].day,genesisData[l].remainAmount);
                      genesisChartData.set(genesisData[l].token,tmp);
                    }
                  }
                }
              }
              if(getHistorySimulationData.srcElement.result[i].get("data").get("blackhole").has(val[k][0])){
                let blackholeData = getHistorySimulationData.srcElement.result[i].get("data").get("blackhole").get(val[k][0]);
                for(let l=0;l<blackholeData.length;l++){
                  if(blackholeData[l].token === val[k][1]) {
                    if(blackholeChartData.has(blackholeData[l].token)){
                      let tmp = blackholeChartData.get(blackholeData[l].token);
                      if(tmp.has(blackholeData[l].day)) tmp.set(blackholeData[l].day,tmp.get(blackholeData[l].day)+blackholeData[l].totalBurnAmount);
                      else tmp.set(blackholeData[l].day,blackholeData[l].totalBurnAmount);
                      blackholeChartData.set(blackholeData[l].token,tmp);
                    }
                    else{
                      let tmp = new Map();
                      tmp.set(blackholeData[l].day,blackholeData[l].totalBurnAmount);
                      blackholeChartData.set(blackholeData[l].token,tmp);
                    }
                  }
                }
              }
              if(getHistorySimulationData.srcElement.result[i].get("data").get("pool").has(val[k][0])){
                let poolData = getHistorySimulationData.srcElement.result[i].get("data").get("pool").get(val[k][0]);
                for(let l=0;l<poolData.length;l++){
                  if(poolData[l].token === val[k][1]) {
                    if(poolChartData.has(poolData[l].token)){
                      let tmp = poolChartData.get(poolData[l].token);
                      if(tmp.has(poolData[l].day)) tmp.set(poolData[l].day,tmp.get(poolData[l].day)+poolData[l].totalAmount);
                      else tmp.set(poolData[l].day,poolData[l].totalAmount);
                      poolChartData.set(poolData[l].token,tmp);
                    }
                    else{
                      let tmp = new Map();
                      tmp.set(poolData[l].day,poolData[l].totalAmount);
                      poolChartData.set(poolData[l].token,tmp);
                    }
                  }
                }
              }
              if(getHistorySimulationData.srcElement.result[i].get("data").get("stakeholder").has(val[k][0])){
                let stakeholderData = getHistorySimulationData.srcElement.result[i].get("data").get("stakeholder").get(val[k][0]);
                for(let l=0;l<stakeholderData.length;l++){
                  if(stakeholderData[l].token === val[k][1]) {
                    if(stakeholderChartData.has(stakeholderData[l].token)){
                      let tmp = stakeholderChartData.get(stakeholderData[l].token);
                      if(tmp.has(stakeholderData[l].day)) tmp.set(stakeholderData[l].day,tmp.get(stakeholderData[l].day)+stakeholderData[l].freeMoney);
                      else tmp.set(stakeholderData[l].day,stakeholderData[l].freeMoney);
                      stakeholderChartData.set(stakeholderData[l].token,tmp);
                    }
                    else{
                      let tmp = new Map();
                      tmp.set(stakeholderData[l].day,stakeholderData[l].freeMoney);
                      stakeholderChartData.set(stakeholderData[l].token,tmp);
                    }
                  }
                }
              }
            }
          }
        }
      }
      if(genesisChartData.size){
        let tokens = Array.from(genesisChartData.keys());
        for(let i=0;i<tokens.length;i++){
          let tokenMap = genesisChartData.get(tokens[i]);
          let days = Array.from(tokenMap.keys());
          for(let j=0;j<days.length;j++){
            this.genesisLinePieData.push({
              token:tokens[i],
              day:days[j].toString(),
              releaseAmount:tokenMap.get(days[j])
            })
          }
        }
        this.editableTabs.push({
          title: "genesis",
          name: "genesis",
          content: "genesis"
        });
        this.selectedData = true;
      }

      if(blackholeChartData.size){
        let tokens = Array.from(blackholeChartData.keys());
        for(let i=0;i<tokens.length;i++){
          let tokenMap = blackholeChartData.get(tokens[i]);
          let days = Array.from(tokenMap.keys());
          for(let j=0;j<days.length;j++){
            this.blackholeLinePieData.push({
              token:tokens[i],
              day:days[j].toString(),
              releaseAmount:tokenMap.get(days[j])
            })
          }
        }
        this.editableTabs.push({
          title: "blackhole",
          name: "blackhole",
          content: "blackhole"
        });
        this.selectedData = true;
      }

      if(poolChartData.size){
        let tokens = Array.from(poolChartData.keys());
        for(let i=0;i<tokens.length;i++){
          let tokenMap = poolChartData.get(tokens[i]);
          let days = Array.from(tokenMap.keys());
          for(let j=0;j<days.length;j++){
            this.poolLinePieData.push({
              token:tokens[i],
              day:days[j].toString(),
              releaseAmount:tokenMap.get(days[j])
            })
          }
        }
        this.editableTabs.push({
          title: "pool",
          name: "pool",
          content: "pool"
        });
        this.selectedData = true;
      }

      if(stakeholderChartData.size){
        let tokens = Array.from(stakeholderChartData.keys());
        for(let i=0;i<tokens.length;i++){
          let tokenMap = stakeholderChartData.get(tokens[i]);
          let days = Array.from(tokenMap.keys());
          for(let j=0;j<days.length;j++){
            this.stakeholderLinePieData.push({
              token:tokens[i],
              day:days[j].toString(),
              releaseAmount:tokenMap.get(days[j])
            })
          }
        }
        this.editableTabs.push({
          title: "stakeholder",
          name: "stakeholder",
          content: "stakeholder"
        });
        this.selectedData = true;
      }

      console.log("genesisLinePieData",JSON.stringify(this.genesisLinePieData))
    },
    /**
     * 这里根据用户选的 ID 创建可选数据
    */
    async handleSelectionChange(val) {
      this.selectData = [];
      this.selectedData = false;

      // 找 id
      let news = this.getAdd(this.idArray,val);
      let dels = this.getDel(this.idArray,val);
      for(let i=0;i<dels.length;i++){
        if(this.idArray.indexOf(dels[i]) != -1) {
          this.idArray.splice(this.idArray.indexOf(dels[i]),1);
        }
      }
      for(let j=0;j<news.length;j++){
        this.idArray.push(news[j].index);
      }

      this.options = [];
      let optMap = new Map();
      let optionsMap = new Map();

      // 根据 id 找历史测算数据
      let getHistorySimulationData = await this.$indexedDB.getAll("historySimulationData");
      if (getHistorySimulationData.srcElement.result.length && this.idArray.length) {
        for(let j=0;j<getHistorySimulationData.srcElement.result.length;j++){
          for(let k=0;k<this.idArray.length;k++){
            if(getHistorySimulationData.srcElement.result[j].get("simulateId")===this.idArray[k]){
              let genesisData = getHistorySimulationData.srcElement.result[j].get("data").get('genesis');
              let blackholeData = getHistorySimulationData.srcElement.result[j].get("data").get('blackhole');
              let poolData = getHistorySimulationData.srcElement.result[j].get("data").get('pool');
              let stakeholderData = getHistorySimulationData.srcElement.result[j].get("data").get('stakeholder');
              

              

              if(genesisData.size) {
                let keys = Array.from(genesisData.keys());
                for(let l=0;l<keys.length;l++){
                  let genesisTokens = [];
                  for(let m=0;m<genesisData.get(keys[l]).length-1;m++){
                    if(genesisTokens.indexOf(genesisData.get(keys[l])[m].token) === -1) genesisTokens.push(genesisData.get(keys[l])[m].token);
                  }
                  
                  let tmpChildren = [];
                  for(let n=0;n<genesisTokens.length;n++){
                    tmpChildren.push({label:genesisTokens[n],value:genesisTokens[n]});
                  }
                  // TODO 这里 label 拿到用户写的名字
                  this.options.push({
                    label:this.idArray[k]+ '-genesis-' + keys[l],
                    value:keys[l],
                    children:tmpChildren
                  })
                }
              }

              if(blackholeData.size) {
                let keys = Array.from(blackholeData.keys());
                for(let l=0;l<keys.length;l++){
                  let blackholeTokens = [];
                  for(let m=0;m<blackholeData.get(keys[l]).length;m++){
                    if(blackholeTokens.indexOf(blackholeData.get(keys[l])[m].token) === -1) blackholeTokens.push(blackholeData.get(keys[l])[m].token);
                  }
                  let tmpChildren = [];
                  for(let n=0;n<blackholeTokens.length;n++){
                    tmpChildren.push({label:blackholeTokens[n],value:blackholeTokens[n]});
                  }
                  // TODO 这里 label 拿到用户写的名字
                  this.options.push({
                    label:this.idArray[k]+ '-blackhole-' + keys[l],
                    value:keys[l],
                    children:tmpChildren
                  })
                }
              }

              if(poolData.size) {
                let keys = Array.from(poolData.keys());
                for(let l=0;l<keys.length;l++){
                  let poolTokens = [];
                  for(let m=0;m<poolData.get(keys[l]).length;m++){
                    if(poolTokens.indexOf(poolData.get(keys[l])[m].token) === -1) poolTokens.push(poolData.get(keys[l])[m].token);
                  }
                  let tmpChildren = [];
                  for(let n=0;n<poolTokens.length;n++){
                    tmpChildren.push({label:poolTokens[n],value:poolTokens[n]});
                  }
                  // TODO 这里 label 拿到用户写的名字
                  this.options.push({
                    label:this.idArray[k]+ '-pool-' + keys[l],
                    value:keys[l],
                    children:tmpChildren
                  })
                }
              }

              if(stakeholderData.size) {
                let keys = Array.from(stakeholderData.keys());
                for(let l=0;l<keys.length;l++){
                  let stakeholderTokens = [];
                  for(let m=0;m<stakeholderData.get(keys[l]).length;m++){
                    if(stakeholderTokens.indexOf(stakeholderData.get(keys[l])[m].token) === -1) stakeholderTokens.push(stakeholderData.get(keys[l])[m].token);
                  }
                  let tmpChildren = [];
                  for(let n=0;n<stakeholderTokens.length;n++){
                    tmpChildren.push({label:stakeholderTokens[n],value:stakeholderTokens[n]});
                  }
                  // TODO 这里 label 拿到用户写的名字
                  this.options.push({
                    label:this.idArray[k]+ '-stakeholder-' + keys[l],
                    value:keys[l],
                    children:tmpChildren
                  })
                }
              }
            }
          }
        }
      }
    },
    async handleSelectionChange2(val) {
      // 找 id
      let news = this.getAdd(this.idArray,val);
      let dels = this.getDel(this.idArray,val);
      for(let i=0;i<dels.length;i++){
        if(this.idArray.indexOf(dels[i]) != -1) {
          this.idArray.splice(this.idArray.indexOf(dels[i]),1);
        }
      }
      for(let j=0;j<news.length;j++){
        this.idArray.push(news[j].index);
      }

      this.options = [];

      // 根据 id 找历史测算数据
      let tmp = await this.$indexedDB.getAll("historySimulationData");
      
      if (tmp.srcElement.result.length && this.idArray.length) {
        
        for(let j=0;j<tmp.srcElement.result.length;j++){
          for(let k=0;k<this.idArray.length;k++){
            if(tmp.srcElement.result[j].get("simulateId")===this.idArray[k]){
              // 依次把每个节点拿出来存 options
              // 每个节点都有存，有 size 说明 用户画了那个节点
              // selectId,nodeId , 方便可视化时拿到 selectId
              let valueList = []; 
              if(tmp.srcElement.result[j].get("data").get("genesis").size){
                let genesisId = 1;
                // 先拿到 nodeId，存成选项的 value，后续方便取数据
                for(let l=0;l<Array.from(tmp.srcElement.result[j].get("data").get("genesis").keys()).length;l++){
                  valueList = [];
                  valueList.push(this.idArray[k]);
                  valueList.push(Array.from(tmp.srcElement.result[j].get("data").get("genesis").keys())[l]);
                  // let tmpGenesisOptionChildren = this.genesisOptionChildren;
                  // tmpGenesisOptionChildren[0].value =  tmpGenesisOptionChildren[0].value + genesisId;
                  // tmpGenesisOptionChildren[1].value =  tmpGenesisOptionChildren[1].value + genesisId;
                  // tmpGenesisOptionChildren[0].children.value =  tmpGenesisOptionChildren[0].children.value + genesisId;
                  // tmpGenesisOptionChildren[1].children.value =  tmpGenesisOptionChildren[1].children.value + genesisId;
                  this.options.push({
                    value:valueList,
                    label:this.idArray[k]+'-'+"genesis"+'-'+ genesisId,
                    children:this.genesisOptionChildren
                  });
                  genesisId++;
                }
              };
              if(tmp.srcElement.result[j].get("data").get("blackhole").size){
                let blackholeId = 1;
                for(let l=0;l<Array.from(tmp.srcElement.result[j].get("data").get("blackhole").keys()).length;l++){
                  this.options.push({
                    value:Array.from(tmp.srcElement.result[j].get("data").get("blackhole").keys())[l],
                    label:this.idArray[k]+'-'+"blackhole"+'-'+blackholeId
                  });
                  blackholeId++;
                }
              };
              if(tmp.srcElement.result[j].get("data").get("pool").size){
                let poolId = 1;
                for(let l=0;l<Array.from(tmp.srcElement.result[j].get("data").get("pool").keys()).length;l++){
                  this.options.push({
                    value:Array.from(tmp.srcElement.result[j].get("data").get("pool").keys())[l],
                    label:this.idArray[k]+'-'+"pool"+'-'+poolId,
                    children:this.poolOptionChildren
                  });
                  poolId++
                }
              };
              if(tmp.srcElement.result[j].get("data").get("stakeholder").size){
                let stakeholderId = 1;
                for(let l=0;l<Array.from(tmp.srcElement.result[j].get("data").get("stakeholder").keys()).length;l++){
                  this.options.push({
                    value:Array.from(tmp.srcElement.result[j].get("data").get("stakeholder").keys())[l],
                    label:this.idArray[k]+'-'+"stakeholder",
                    children:this.stakeholderOptionChildren
                  });
                  stakeholderId++;
                }
              };
            }
          }
        }
      }
      console.log("options",this.options);

      // 取 LineData 即 Free Money 数据
      //this.getFreeMoneyData(val);

      // 取 PieData 即 Allocations 数据
      //this.getAllocationData(idArray);

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
      "indexList",
      "simulating",
    ]),
  },
  watch:{
    simulating(o,n){
      if(n===false && o===true){
        this.running = true;
      }
      if(n===true && o===false){
        this.running = false;
      }

        console.log("11111new",o);
        console.log("11111old",n);
    }
  }
};
</script>
<style lang="scss">
.visual-panel {
  text-align: center;
  overflow: scroll;
  background-color: #f5f5f5;
  p {
    margin-top: 10px;
  }
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
    float: right;
    padding: 0px 10px 0px 10px;
    margin-right: 10px;
    margin-top: 10px;
    width: 75%;
    background-color: #fff;
    border: 1px solid rgb(228, 228, 228);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }
  .empty-chart {
    height: 600px;
    width: 100%;
  }
  .data-selected-container {
    float: left;
    margin-top: 10px;
    margin-left: 10px;
    width: 20%;
    height: 600px;
    overflow: scroll;
    .el-collapse-item__header {
      padding-left: 5%;
    }

    .select-title {
      display: block;
      margin: 10px auto;
      width: 60%;
      line-height: 30px;
      background-color: rgb(58, 58, 58);
      color: rgb(250, 250, 250);
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
    }
    .select-data{
      height: 200px;
      overflow: scroll;
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