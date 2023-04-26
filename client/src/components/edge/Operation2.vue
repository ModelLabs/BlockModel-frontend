<template>
    <div>
        <div class="edge-content">
          <el-checkbox v-model="operationData.checked" @change="handleActiveChange">Active</el-checkbox>

          <el-input 
            type="textarea" :rows="3" size="mini" placeholder="Condition" class="condition-edit" :disabled="disabledCondition" v-model="operationData.condition">
          </el-input>
          
          <el-collapse v-model="activeNames" class="el-collapse">
              <el-collapse-item
                  title="Policy"
                  name="1"
                  class="el-collapse-item"
                  >
                  <!-- TODO: 此处对于 Modules 的数据结构与上面 dynamicValidateForm 不同 -->
                  <el-form 
                      :model="dynamicValidateForm_Policy" 
                      ref="dynamicValidateForm_Policy" 
                      label-width="70px">

                      <el-form-item
                          class="form-item"
                          v-for="(tokenName, index) in dynamicValidateForm_Policy.tokenName"
                          :label="'Token' + index"
                          :key="tokenName.key"
                          :prop="'tokenName.' + index + '.value'"
                          :rules="{
                              required: true, message: 'Please input tokenName', trigger: 'blur'
                          }"
                          >
                          <el-input v-model="tokenName.value" class="pool-edit-input" size="small"></el-input>
                      </el-form-item>
                      
                      <el-form-item
                          class="form-item"
                          v-for="(policyName, index) in dynamicValidateForm_Policy.policyName"
                          :label="'Policy' + index"
                          :key="policyName.key"
                          :prop="'policyName.' + index + '.value'"
                          :rules="{
                              required: true, message: 'Please input policyName', trigger: 'blur'
                          }"
                          >
                          <el-input v-model="policyName.value" class="pool-edit-input" size="small"></el-input>
                      </el-form-item>

                      <el-form-item
                          class="form-item"
                          v-for="(policyFunction, index) in dynamicValidateForm_Policy.policyFunction"
                          :label="'Func' + index"
                          :key="policyFunction.key"
                          :prop="'policyFunction.' + index + '.value'"
                          
                          >
                          <!-- <el-input type="textarea" :rows="3" v-model="policyFunction.value" class="pool-edit-input"></el-input> -->
                          
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
                              <PolicyVisual :edgeID="nodeId" :policyData="dynamicValidateForm_Policy" :policyIndex="index"/>
                          </el-dialog>
                          <el-button @click.prevent="removeDomain_Policy(policyFunction)" class="del-button" size="mini">-</el-button>
                      </el-form-item>

                      <el-form-item class="form-item">
                          <el-button @click="addDomain_Policy" class="add-button" size="mini">+</el-button>
                          <el-button @click="submitForm_Policy('dynamicValidateForm_Policy')" class="submit-button" size="mini">Submit</el-button>
                      </el-form-item>
                  </el-form>
              </el-collapse-item>

          </el-collapse>

        </div>
    </div>
</template>

<script>
import { nodeMixin } from "../../mixin";
import { mapMutations, mapState } from "vuex";
import PolicyVisual from "../create/PolicyVisual.vue";

export default {
  mixins: [nodeMixin],
  props: ["nodeData","nodeId", "nodeCell"],
  components: {
    PolicyVisual,
  },
  data() {
    return {
      activeNames: ["1"],
      visualSettingVisible: false,
      disabledCondition: true,
      selectedPolicyIndex: 0,
      dynamicValidateForm_Policy: {
          tokenName:[],
          policyName: [],
          policyFunction: [],
      },
    };
  },
  methods: {
    ...mapMutations(["STORAGE_GRAPH"]),
    submitForm_Policy(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.nodeData.policy.tokenNames = this.dynamicValidateForm_Policy.tokenName;
          this.nodeData.policy.policyNames = this.dynamicValidateForm_Policy.policyName;
          this.nodeData.policy.policyFunctions = this.dynamicValidateForm_Policy.policyFunction;

        } else {
          //console.log('error submit!!');
          return false;
        }
      });
    },
 
    removeDomain_Policy(item) {
      var index = this.dynamicValidateForm_Policy.policyFunction.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm_Policy.policyFunction.splice(index, 1);
        this.dynamicValidateForm_Policy.policyName.splice(index, 1);
        this.dynamicValidateForm_Policy.tokenName.splice(index, 1)
      }
    },

    addDomain_Policy() {
      this.dynamicValidateForm_Policy.tokenName.push({
        value: '',
        key: Date.now() + 2
      });
      this.dynamicValidateForm_Policy.policyName.push({
        value: '',
        key: Date.now()
      });
      this.dynamicValidateForm_Policy.policyFunction.push({
        value: {type: "percentage", effect:"line", datapoints: new Array()},
        key: Date.now() + 1
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

    handleActiveChange(val) {
      if (val == false) {
        this.nodeCell.attr({
          line: {
            strokeDasharray: '5, 10',
          },
        })
        this.disabledCondition = false;
      } else {
        this.nodeCell.attr({
          line: {
            strokeDasharray: '0',
          },
        })
        this.disabledCondition = true;
      }
    }
  },
  computed: {
    ...mapState([
      "graph",
    ]),
    operationData() {
      return this.nodeData;
    },
  },
  mounted() {
    console.log("node data", this.nodeData);
    console.log("node id:", this.nodeId);
    console.log("ndoe cell:", this.nodeCell);
    console.log("condition content:", this.nodeData.condition);
    for (let i =0;i<this.nodeData.policy.tokenNames.length;i++){
      this.dynamicValidateForm_Policy.tokenName.push(this.nodeData.policy.tokenNames[i]);
      this.dynamicValidateForm_Policy.policyFunction.push(this.nodeData.policy.policyFunctions[i]);
      this.dynamicValidateForm_Policy.policyName.push(this.nodeData.policy.policyNames[i]);
    }
    if (this.nodeData.checked) {
      this.disabledCondition = true;
    } else {
      this.disabledCondition = false;
    }
  },

};
</script>

<style lang="scss" scoped>
  .edge-content {
    margin: 0;
    
    /deep/ .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color: rgba(99, 185, 243, 0.81);
      border-color: white;
    }

    /deep/ .el-checkbox__input.is-checked+.el-checkbox__label {
      color: black;
      //font-weight: 600;
    }
    
    /deep/ .el-checkbox {
      color: white;
      font-weight: 600;
      left: 15px;
    }

    .condition-edit{
      margin-top: 20px;
      margin-left: 15px;
    }

    .el-collapse {
      margin-top: 20px;
    }

    /deep/ .el-textarea {
      display: block;
    }

    /deep/ .el-textarea__inner {
      width: 250px;
      background-color: white;
    }

    /deep/ .el-select .el-input__inner {
      background-color:none;
    }
    /deep/ .el-collapse-item__header {
      background: none;
      margin-left: 20px;
      color: black;
      //font-weight: 600;
    }
    /deep/ .el-form-item__label {
      color: black;
      //font-weight: 600;
    }
    /deep/ .el-collapse-item__wrap {
      background: none;
    }
    /deep/ .el-input--small .el-input__inner {
      height: 28px;
      line-height: 28px;
      width: 200px;
      color:rgb(194, 194, 194)
    }
    
    .el-collapse {
      /deep/.el-from-item {
        margin-bottom: 0px;
      }
    }
    
    .del-button {
      margin-left: 5px;
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
    }
    .policy-visual-panel {
    // position: fixed;
    // bottom: 20px;
    // left: 20px;
      .visual-button {

        background-color: #fff !important;
        border: #858585 !important;
        color: #616060 !important;
        // position: fixed;
        // top: 380px;
        // width: 200px;
        // height: 40px;
        // left: 60px;
        box-shadow: 0 0 6px rgba(180, 180, 180, 0.8) !important;
        border-radius: 20px;
      }
    } 
  }

</style>