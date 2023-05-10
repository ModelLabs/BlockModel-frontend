<template>
  <div class="container">
    <div class="tokenomics-content">
      <h3 class="select-title">Design Your Tokenomics</h3>
      <span>Token Symbol</span><el-input v-model="tokenSymbol" size="small"></el-input>
      <span>Token Supply</span><el-input v-model="tokenSupply" size="small"></el-input>
      <h4>Vesting Schedule</h4>
      <el-form 
        :model="dynamicValidateForm" 
        ref="dynamicValidateForm" 
        label-width="100px">

        <el-form-item
          class="form-item"
          v-for="(stakeholderobj, index) in dynamicValidateForm.stakeholders"
          :label="'Stakeholder' + index"
          :key="stakeholderobj.key"
        >
          <div>
            <span>Name</span><el-input v-model="stakeholderobj.name" class="stakeholder-edit-input" size="small"></el-input>
          </div>
          <div>
            <span>Allocation</span><el-input v-model="stakeholderobj.allocation" class="stakeholder-edit-input" size="small"></el-input>
          </div>
          <div>
            <span>Vesting Policy</span>
            <el-button class="visual-button" @click="openVisualSetting(index)">
              Visual Setting
            </el-button>
              
            <el-dialog
                title="Policy Visual Setting"
                :visible.sync="visualSettingVisible"
                :modal-append-to-body='true'
                :append-to-body='true'
                v-if="selectedPolicyIndex == index"
                >
                <PolicyVisual :policyData="stakeholderobj.vesting_policy"/>
            </el-dialog>
          </div>

            
            <el-button @click.prevent="removeDomain(index)" class="del-button" size="mini">-</el-button>
          </el-form-item>

          <!-- <el-form-item class="form-item">
            <el-button @click="addDomain" class="add-button" size="mini">+ Add Stakeholder</el-button>
          </el-form-item> -->

      </el-form> 

      <el-button @click="addDomain" class="add-button" size="mini">+ Add Stakeholder</el-button>

      <el-button 
        @click="submitForm()" 
        class="submit-button" 
        size="mini">Done
      </el-button>
    </div>

    <img src="../assets/AI-logo.png" @click="drawer = true"/>

    <el-drawer
      title="GPTHelper"
      :visible.sync="drawer"
      :with-header="true"
      :size="500"
      class="drawer-content">
      <Copilot/>
    </el-drawer>

    <el-dialog
        title="Visual Panel"
        :visible.sync="designResultVisible"
        :modal-append-to-body='true'
        :append-to-body='true'
        >
        <span>Token Final Allocation</span>
        <PieChart :piedata="pieChartData" />
        <span>Token Circulation</span>
        <AreaChart :areaData="areaChartData" />
        <span>Token Control</span>
        <LineChart :lineData="lineChartData"/>
        <span>Token Inflation</span>
        <LineChart :lineData="lineChartData2"/>
    </el-dialog>

  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";

import { percentageToNumber, checkSumObj, checkSumArray, getRandomInt, StandardNum} from "../utils/numberUtil";
import PolicyVisual from "../components/create/PolicyVisualForDesign.vue";
import Copilot from "../components/AI/Copilot.vue";
import PieChart from "../components/AI/PieChart.vue";
import AreaChart from "../components/AI/AreaChart.vue";
import LineChart from "../components/AI/LineChart.vue";

var d3 = require("d3-interpolate");

export default {
  data() {
    return {
      tokenSymbol: "",
      tokenSupply: "",

      dynamicValidateForm: {
        stakeholders:[
          
        ]
      },

      visualSettingVisible: false,
      selectedPolicyIndex: 0,

      drawer: false,

      designResultVisible: false,

      pieChartData: [],
      areaChartData: [],
      lineChartData: [],
      lineChartData2: [],
      stakeholderTokenAmountPerDay: {},

      tokenBasicInfo: {},
      tokenAllocationInfo: {},
      tokenVestingInfo: {},

      finalDay: 1001,
    };
  },
  components: {
    PolicyVisual,
    Copilot,
    PieChart,
    AreaChart,
    LineChart
  },
  methods: {
    submitForm() {
      this.designResultVisible = true;
      this.tokenBasicInfo.initial_supply = Number(this.tokenSupply);
      this.tokenBasicInfo.symbol = this.tokenSymbol;

      for (let i = 0; i < this.dynamicValidateForm.stakeholders.length; i++) {
        this.tokenAllocationInfo[this.dynamicValidateForm.stakeholders[i].name] = this.dynamicValidateForm.stakeholders[i].allocation;
        this.tokenVestingInfo[this.dynamicValidateForm.stakeholders[i].name] = this.dynamicValidateForm.stakeholders[i].vesting_policy;
      }

      console.log("token basic info:", this.tokenBasicInfo);
      console.log("token allocation info:", this.tokenAllocationInfo);
      console.log("token vesting policy:", this.tokenVestingInfo);
      this.packDataForVisualization(this.tokenBasicInfo, this.tokenAllocationInfo, this.tokenVestingInfo);
      this.calculateAllocation();
      this.calculateIR(365);
    },
    removeDomain(index) {
      if (index !== -1) {
        this.dynamicValidateForm.stakeholders.splice(index, 1);
      }
    },
    addDomain() {
      this.dynamicValidateForm.stakeholders.push({
        name: "",
        allocation: "",
        vesting_policy: {
          type: "percentage",
          effect: "point",
          datapoints: new Array(),
        },
        key: Date.now()
      });
    },
    openVisualSetting(index){
      // 每次打开可视化面板的时候 传一份 indexDB 里的历史测算数据
      // this.showHistoryDataOfIndexDB();
      // // 每次打开可视化面板的时候 传一份 indexDB 里的 Property 检查结果
      // await this.showMarkerOfIndexDB();
      this.visualSettingVisible = true;
      this.selectedPolicyIndex = index;
    },
    packDataForVisualization(tokenBasicInfo, tokenAllocationInfo, tokenVestingInfo) {
      // initial_suppply 有可能是字符串或者科学记数法，先用 Number()进行规范
      tokenBasicInfo.initial_supply = Number(tokenBasicInfo.initial_supply);
      this.pieChartData = [];
      this.areaChartData = [];
      this.stakeholderTokenAmountPerDay = {};

      for (let i in tokenAllocationInfo) {
        this.pieChartData.push({type: i, value: tokenBasicInfo.initial_supply * percentageToNumber(tokenAllocationInfo[i])});
      }
      // 根据 vesting schedule 进行计算和插值
      // let maxDay = 2000;
      for (let stakeholder in tokenVestingInfo) {
        this.stakeholderTokenAmountPerDay[stakeholder] = new Array();
        let stakeholderSupply = tokenBasicInfo.initial_supply * percentageToNumber(tokenAllocationInfo[stakeholder]);
        let accumulatedReleaseAmount = 0;
        console.log("stakeholder:", stakeholder, " - ", stakeholderSupply);

        if (tokenVestingInfo[stakeholder].effect == "point") {
          let lastDay = 0;
          let lastAmount = 0;
          for (let j = 0; j < tokenVestingInfo[stakeholder].datapoints.length; j++) {
            let curDay = Number(tokenVestingInfo[stakeholder].datapoints[j].x);
            let curAmount = accumulatedReleaseAmount + stakeholderSupply * Number(tokenVestingInfo[stakeholder].datapoints[j].y) / 100;
            accumulatedReleaseAmount += stakeholderSupply  * Number(tokenVestingInfo[stakeholder].datapoints[j].y) / 100;
            for (let day = lastDay; day < curDay; day++) {
              this.areaChartData.push({"stakeholder": stakeholder, "day": String(day), "releaseAmount": lastAmount});
              this.stakeholderTokenAmountPerDay[stakeholder].push(lastAmount);
            }
            lastDay = curDay;
            lastAmount = curAmount;
          }
          for (let day = lastDay; day < this.finalDay; day++) {
            this.areaChartData.push({"stakeholder": stakeholder, "day": String(day), "releaseAmount": lastAmount});
            this.stakeholderTokenAmountPerDay[stakeholder].push(lastAmount);
          }
          
        } else {
          let points = tokenVestingInfo[stakeholder].datapoints;
          // 把用户设置的点位按照 x 轴从小到大排列；
          points.sort(function(a,b) {return Number(a.x) - Number(b.x)});

          let piecewiseFunctions = new Array();
          // // 排列后的点位，可以组成分段函数的表达式，目前此处用四元组表达分段函数：[x0, x1, y0, y1], (x0, y0) 和 (x1, y1) 是每一段的两个端点
          for (let j = 0; j < points.length; j++) {
              if (j == 0) {
                  continue;
              } else {
                  piecewiseFunctions.push([Number(points[j - 1].x), Number(points[j].x), Number(points[j - 1].y), Number(points[j].y)]);
              }
          }

          let releaseAmount = 0;
          for (let day = 0; day < this.finalDay; day++) {
            let retIdx = -1;
            for (let func = 0; func < piecewiseFunctions.length; func++){
                if (day >= piecewiseFunctions[func][0] && day <= piecewiseFunctions[func][1]) {
                    retIdx = func;
                    break;
                }
            }
            // 不在分段函数范围内时，不需要计算后续逻辑
            if (retIdx == -1) {
                this.areaChartData.push({"stakeholder": stakeholder, "day": String(day), "releaseAmount": releaseAmount});
                this.stakeholderTokenAmountPerDay[stakeholder].push(releaseAmount);
                continue;
            }
            // 计算当前天，在当前所处的分段上的具体值是多少
            let tmpAmount = Math.round((day - piecewiseFunctions[retIdx][0]) / (piecewiseFunctions[retIdx][1] - piecewiseFunctions[retIdx][0]) * (piecewiseFunctions[retIdx][3] - piecewiseFunctions[retIdx][2]) + piecewiseFunctions[retIdx][2]);
            if ( tokenVestingInfo[stakeholder].type == "percentage") {
                tmpAmount = Math.round(tmpAmount *  stakeholderSupply/ 100);
            }
            releaseAmount += tmpAmount;

            this.areaChartData.push({"stakeholder": stakeholder, "day": String(day), "releaseAmount": releaseAmount});
            this.stakeholderTokenAmountPerDay[stakeholder].push(releaseAmount);
          }
        }
      }
      this.areaChartData.sort(this.objectArrayCompare("day"));
      // console.log("line:",this.LineChartData);
      // console.log("pie:", this.PieChartData);
      console.log("total amount per day:", this.stakeholderTokenAmountPerDay);
    },

    // 对 Object 数组进行排序时的比较函数
    // 参数 p: 具体要对 Object 哪个字段进行比较
    objectArrayCompare(p){ 
      return function(m,n){
          var a = Number(m[p]);
          var b = Number(n[p]);
          return a - b; //升序
      }
    },

    // 计算控盘比
    calculateAllocation() {
      this.lineChartData = [];
      for (let day = 0 ; day < this.finalDay; day++) {
        let curDayTotal = 0;
        for (let stakeholder in this.stakeholderTokenAmountPerDay) {
          curDayTotal += this.stakeholderTokenAmountPerDay[stakeholder][day];
        }
        for (let stakeholder in this.stakeholderTokenAmountPerDay) {
          let percentage = StandardNum(this.stakeholderTokenAmountPerDay[stakeholder][day] / curDayTotal);
          this.lineChartData.push({"stakeholder": stakeholder, "day": String(day), "releaseAmount": percentage});
        }
      }
    },

    // 计算通胀率
    calculateIR(step) {
      this.lineChartData2 = [];
      for(let day = step; day < this.finalDay; day++) { 
        // 计算上一个 step 的 token 流通总量
        let lastStepAmount = 0;
        for (let stakeholder in this.stakeholderTokenAmountPerDay) {
          lastStepAmount += this.stakeholderTokenAmountPerDay[stakeholder][day - step]
        }

        // 计算当前 step 的 token 流通总量
        let curStepAmount = 0;
        for (let stakeholder in this.stakeholderTokenAmountPerDay) {
          curStepAmount += this.stakeholderTokenAmountPerDay[stakeholder][day]
        }

        if (lastStepAmount <= 0) {
          this.lineChartData2.push({"stakehodler": "inflate_rate", "day": String(day), "releaseAmount": NaN});
        }
        else {
          this.lineChartData2.push({"stakehodler": "inflate_rate", "day": String(day), "releaseAmount": StandardNum((curStepAmount - lastStepAmount) / lastStepAmount)});
        }
      }
      console.log("line chart data2:", this.lineChartData2);
    }
    
  },

  computed: {
    ...mapState(["user", "userEmail"]),
  },

  mounted(){
    
  }
}
</script>

<style scoped lang="scss">
.container {
  overflow: visible;
  margin-top: 50px;
  .tokenomics-content {
    width: 1000px;
    margin: auto;
    height: auto;
    h3 {
      margin-bottom: 10px;
    }
    .form-item {
      padding: 5px;
      margin-bottom: 0px;

      span {
        display:-moz-inline-box; 
        display:inline-block; 
        width:100px;
      }

      /deep/ .el-form-item__label {
        color: white;
      }

      .stakeholder-edit-input {
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
        width: 150px;
        color:rgb(194, 194, 194);
      }
      .submit-button {
        margin-left: 15px;
        width: 100px;
        color:rgb(194, 194, 194)
      }
      .visual-button {

        background-color: #fff !important;
        border: #858585 !important;
        color: #616060 !important;

        box-shadow: 0 0 6px rgba(180, 180, 180, 0.8) !important;
        border-radius: 20px;
      }
    }

    .drawer-button {
      width: 200px;
      margin: auto;
      height: auto;
    }
  }
  .drawer-content {
    margin-top: 100px;
    overflow: scroll;
  }
  
}

img{
  position: fixed;
  width: 55px;
  height: 55px;
  right: 100px;
  bottom: 100px;
  border-radius: 55px;
  border: 2px solid #fff;
}
</style>