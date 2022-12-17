<template>
    <div>
        <div class="edge-content">
          <el-checkbox v-model="checked">Active</el-checkbox>
          
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
                            
                            <el-button class="visual-button" @click="openVisualSetting">
                              Visual Setting
                            </el-button>
                            
                            <el-dialog
                                title="Policy Visual Setting"
                                :visible.sync="visualSettingVisible"
                                :destroy-on-close="true"
                                >
                               <PolicyVisual />
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
  props: ["nodeData","nodeId"],
  components: {
    PolicyVisual,
  },
  data() {
    return {
      checked:true,
      activeNames: ["1"],
      value: "",
      visualSettingVisible: false,
      options: [{
        value: "Active"
      }, {
        value: "Non-active"
      }],
      dynamicValidateForm_Policy: {
          policyName: [],
          policyFunction: [
            // ["a=1"],
            // ["b=2"]
          ],
      },
    };
  },
  methods: {
    ...mapMutations(["STORAGE_GRAPH", "SET_EDIT_EDGE"]),
    submitForm_Policy(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //console.log("form",this.dynamicValidateForm);
          //console.log("nodedata",this.nodeData);
          var map = new Map();
          for(let i=0;i<this.dynamicValidateForm_Policy.policyFunction.length;i++){
            map.set(this.dynamicValidateForm_Policy.policyName[i],this.dynamicValidateForm_Policy.policyFunction[i])
          }
          if (this.graph.model.collection.cells.length) {
              for(let i = 0;i<this.graph.model.collection.cells.length;i++){
                if(this.graph.model.collection.cells[i].id === this.nodeId) {
                  this.graph.model.collection.cells[i].getData().edgeData = [];
                  this.graph.model.collection.cells[i].getData().edgeData.push(map);
                }
              }
          }
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
        this.dynamicValidateForm_Policy.policyName.splice(index, 1)
      }
    },

    addDomain_Policy() {
      this.dynamicValidateForm_Policy.policyName.push({
        value: '',
        key: Date.now()
      });
      this.dynamicValidateForm_Policy.policyFunction.push({
        value: '',
        key: Date.now() + 1
      });
    },

    openVisualSetting(){
      // 每次打开可视化面板的时候 传一份 indexDB 里的历史测算数据
      // this.showHistoryDataOfIndexDB();
      // // 每次打开可视化面板的时候 传一份 indexDB 里的 Property 检查结果
      // await this.showMarkerOfIndexDB();
      this.visualSettingVisible = true;
    },
  },
  computed: {
    ...mapState([
      "graph",
    ]),
  },
  mounted() {
    console.log("node data", this.nodeData);
    if (this.nodeData.length){
      for(var key of this.nodeData[0].keys()) {
        let policyName = key.value;
        let policyFunction = this.nodeData[0].get(key).value

        this.dynamicValidateForm_Policy.policyName.push({
          value: policyName,
        });
        this.dynamicValidateForm_Policy.policyFunction.push({
          value: policyFunction,
        });
      }
    }
    
  },

};
</script>

<style lang="scss" scoped>
  .edge-content {
    
    /deep/ .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color: rgba(149, 119, 204, 0.81);
      border-color: white;
    }

    /deep/ .el-checkbox__input.is-checked+.el-checkbox__label {
      color: rgb(149, 119, 204);
      font-weight: 600;
    }
    
    /deep/ .el-checkbox {
      color: white;
      font-weight: 600;
      left: 15px;
    }

    .el-collapse {
      margin-top: 20px;
    }

    /deep/ .el-textarea__inner {
      width: 200px;
    }

    /deep/ .el-select .el-input__inner {
      background-color: #bccaf5;
    }
    /deep/ .el-collapse-item__header {
      background-color: #bccaf5;
      margin-left: 20px;
      color: white;
      font-weight: 600;
    }
    /deep/ .el-form-item__label {
      color: white;
      font-weight: 600;
    }
    /deep/ .el-collapse-item__wrap {
      background-color: #bccaf5;
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