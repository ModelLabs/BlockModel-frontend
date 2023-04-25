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
            <span>Name</span><el-input v-model="stakeholderobj.stakeholder" class="stakeholder-edit-input" size="small"></el-input>
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

        <!-- <el-form-item
          class="form-item"
          v-for="(tokenAmount, index) in dynamicValidateForm.tokenAmount"
          :label="'Amount' + index"
          :key="tokenAmount.key"
          :prop="'tokenAmount.' + index + '.value'"
          :rules="{
            required: true, message: 'Please input tokenAmount', trigger: 'blur'
          }"
        >
          <el-input v-model="tokenAmount.value" class="stakeholder-edit-input" size="small"></el-input>
          <el-button @click.prevent="removeDomain(tokenAmount)" class="del-button" size="mini">-</el-button>
        </el-form-item> -->

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

  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";

import { percentageToNumber, checkSumObj, checkSumArray, getRandomInt} from "../utils/numberUtil";
import PolicyVisual from "../components/create/PolicyVisualForDesign.vue";
import InnerDesign from "../components/AI/Copilot.vue";

var d3 = require("d3-interpolate");
//import { log } from '@antv/g2plot/lib/utils';
// import { Configuration, OpenAIApi } from "openai";
const schedule = require('node-schedule');
// we can store callTime into indexeddb
var callTime = 5;
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
    };
  },
  components: {
    PolicyVisual,
    InnerDesign,
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
            console.log("yes");
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
        stakeholder: "",
        allocation: "",
        vesting_policy: {
          type: "percentage",
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
  overflow: scroll;
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