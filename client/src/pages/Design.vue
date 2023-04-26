<template>
  <div class="container">
    <div class="tokenomics-content">
      <h3 class="select-title">Design Your Tokenomics</h3>
      <span>Token Symbol</span><el-input v-model="tokenSymbol" size="small"></el-input>
      <span>Token Supply</span><el-input v-model="tokenSupply" size="small"></el-input>
      <span>Vesting Schedule</span>
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

        <el-form-item class="form-item">
          <el-button @click="addDomain" class="add-button" size="mini">+</el-button>
          <el-button 
            @click="submitForm('dynamicValidateForm')" 
            class="submit-button" 
            size="mini">Done</el-button>
        </el-form-item>

      </el-form>   
      <el-button @click="drawer = true" type="primary" style="margin-left: 16px;" class="drawer-button">
        GPT Helper
      </el-button>
    </div>
   
    <el-drawer
      title="GPTHelper"
      :visible.sync="drawer"
      :with-header="true"
      :size="500"
      class="drawer-content">
      <InnerDesign/>
    </el-drawer>

    <el-dialog
        title="Visual Panel"
        :visible.sync="designResultVisible"
        :modal-append-to-body='true'
        :append-to-body='true'
        >
        <PieChart :piedata="pieData"/>
    </el-dialog>

  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";

import { percentageToNumber, checkSumObj, checkSumArray, getRandomInt} from "../utils/numberUtil";
import PolicyVisual from "../components/create/PolicyVisualForDesign.vue";
import InnerDesign from "../components/AI/Copilot.vue";
import PieChart from "../components/AI/PieChart.vue";

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

      pieData: null,

      tokenBasicInfo: {},
      tokenAllocationInfo: {},
      tokenVestingInfo: null,
    };
  },
  components: {
    PolicyVisual,
    InnerDesign,
    PieChart,
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
            console.log("yes");
            this.designResultVisible = true;
            console.log("form:", this.dynamicValidateForm);
            this.tokenBasicInfo.initial_supply = Number(this.tokenSupply);
            this.tokenBasicInfo.symbol = this.tokenSymbol;
            console.log("token basic info:", this.tokenBasicInfo);

            for (let i = 0; i < this.dynamicValidateForm.stakeholders.length; i++) {
              this.tokenAllocationInfo[this.dynamicValidateForm.stakeholders[i].name] = this.dynamicValidateForm.stakeholders[i].allocation;
            }
            console.log("token allocation info:", this.tokenAllocationInfo);
        } 
        else return false;
      })
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
      this.PieChartData = [];
      for (var i in tokenAllocationInfo) {
        this.PieChartData.push({type: i, value: tokenBasicInfo.initial_supply * percentageToNumber(tokenAllocationInfo[i])});
      }
      // 根据 vesting schedule 进行计算和插值
      // let maxDay = 2000;
      for (let i = 0; i < tokenVestingInfo.length; i++) {
        let stakeholder = tokenVestingInfo[i].target;
        let stakeholderSupply = tokenBasicInfo.initial_supply * percentageToNumber(tokenAllocationInfo[stakeholder]);
        let accumulatedReleaseAmount = 0;
        let piecewiseDayArray = new Array();
        let piecewiseAmountArray = new Array();
        let tmpArray = new Array();

        // 记录 vesting schedule 中分段的节点
        piecewiseDayArray.push(0);
        piecewiseAmountArray.push(0);
        for (let j = 0; j < tokenVestingInfo[i].percentage.length; j++) {
          let day = Number(tokenVestingInfo[i].cliff) + j * Number(tokenVestingInfo[i].frequency);
          let amount = accumulatedReleaseAmount + stakeholderSupply * percentageToNumber(tokenVestingInfo[i].percentage[j]);
          // tmpArray.push({"stakeholder": stakeholder, "day": day, "releaseAmount": amount});
          accumulatedReleaseAmount += stakeholderSupply  * percentageToNumber(tokenVestingInfo[i].percentage[j]);
          piecewiseDayArray.push(day);
          piecewiseAmountArray.push(amount);
        }
        piecewiseDayArray.push(2000);
        piecewiseAmountArray.push(piecewiseAmountArray[piecewiseAmountArray.length - 1]);

        // 在每个分段中进行线性插值
        for (let j = 1; j < piecewiseAmountArray.length; j++) {
          let piecewiseDayInterpolater = d3.piecewise(d3.interpolateRound, [piecewiseAmountArray[j - 1],piecewiseAmountArray[j]]);
          let piecewiseAmount = d3.quantize(piecewiseDayInterpolater, piecewiseDayArray[j] - piecewiseDayArray[j - 1]);
          tmpArray = tmpArray.concat(piecewiseAmount);
        }
        for (let j = 0; j < tmpArray.length; j++) {
          this.LineChartData.push({"stakeholder": stakeholder, "day": j, "releaseAmount": tmpArray[j]});
        }
        
      }
      this.LineChartData.sort(this.objectArrayCompare("day"));
      
      // console.log("line:",this.LineChartData);
      // console.log("pie:", this.PieChartData);
    },
  },

  computed: {
    ...mapState(["user", "userEmail"]),
  },

  mounted(){
    // this.retrieveAPIkey();
    // let tmpBasicInfo = {
    //   "symbol": "DEX",
    //   "initial_supply": 1000000000,
    //   "inflation": {
    //     "base_rate": 0.05,
    //     "min_rate": 0.02,
    //     "max_rate": 0.1
    //   }
    // };
    // let tmpLineChartData = [
    //   {
    //     "target": "team",
    //     "cliff": 365,
    //     "frequency": 90,
    //     "percentage": ["25%", "25%", "25%", "20%"]
    //   },
    //   {
    //     "target": "advisor",
    //     "cliff": 1825,
    //     "frequency": 365,
    //     "percentage": ["100%"]
    //   },
    //   {
    //     "target": "foundation",
    //     "cliff": 0,
    //     "frequency": 180,
    //     "percentage": ["25%", "25%", "25%", "25%"]
    //   },
    //   {
    //     "target": "investor",
    //     "cliff": 0,
    //     "frequency": 180,
    //     "percentage": ["25%", "25%", "25%", "25%"]
    //   },
    //   {
    //     "target": "airdrop",
    //     "cliff": 0,
    //     "frequency": 0,
    //     "percentage": ["100%"]
    //   },
    //   {
    //     "target": "liquidity_mining",
    //     "cliff": 30,
    //     "frequency": 180,
    //     "percentage": ["25%", "25%", "25%", "20%"]
    //   }
    // ];
    // let tmpPieChartData = {
    //   "team": "15%",
    //   "advisor": "5%",
    //   "foundation": "15%",
    //   "investor": "25%",
    //   "airdrop": "10%",
    //   "liquidity_mining": "30%"
    // };
    // this.packDataForVisualization(tmpBasicInfo,tmpPieChartData, tmpLineChartData);
    // this.msglist.push(
    //   {
    //     content: 'My design for ' + tmpBasicInfo.symbol + ' is as follows: ',
    //     user: false,
    //     drawChart: true,
    //     piedata: JSON.parse(JSON.stringify(this.PieChartData)),
    //     linedata: JSON.parse(JSON.stringify(this.LineChartData)),
    //   }
    // );
    // this.msglist.push(
    //   {
    //     // id: 1,
    //     content: "good",
    //     user: true,
    //     drawChart: false,
    //     piedata: null,
    //     linedata: null,
    //   }
    // );
    // this.msglist.push(
    //   {
    //     // id: 1,
    //     content: "thank you",
    //     user: false,
    //     drawChart: false,
    //     piedata: null,
    //     linedata: null,
    //   }
    // );
    // console.log(checkSumObj(tmpPieChartData));
    // for (var i in tmpLineChartData) {
    //   console.log(checkSumArray(tmpLineChartData[i].percentage));
    // }
  }
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  overflow: visible;
  .tokenomics-content {
    width: 1000px;
    margin: auto;
    height: auto;
    .form-item {
      padding: 5px;
      margin-bottom: 0px;

      span {
        display:-moz-inline-box; 
        display:inline-block; 
        width:100px;
      }

      /deep/ .el-form-item__label {
        color: black;
        //font-weight: 600;
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
        width: 60px;
        color:rgb(194, 194, 194)
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
.select-title {
  text-align: left;
  margin-bottom: 0px;
}
</style>