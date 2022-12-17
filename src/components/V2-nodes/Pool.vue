<template >
  <div>
    <div class="pool-content">
      <el-collapse v-model="activeNames" class="el-collapse">
        <el-collapse-item
          title="Tokens"
          name="1"
          class="el-collapse-item"
        >
          <el-form 
            :model="dynamicValidateForm_Token" 
            ref="dynamicValidateForm_Token" 
            label-width="70px">

            <el-form-item
              class="form-item"
              v-for="(tokenName, index) in dynamicValidateForm_Token.tokenName"
              :label="'Token' + index"
              :key="tokenName.key"
              :prop="'tokenName.' + index + '.value'"
              :rules="{
                required: true, message: 'Please input tokenName', trigger: 'blur'
              }"
            >
              <el-input v-model="tokenName.value" class="pool-edit-input" size="mini"></el-input>
            </el-form-item>

            <el-form-item
              class="form-item"
              v-for="(tokenAmount, index) in dynamicValidateForm_Token.tokenAmount"
              :label="'Amount' + index"
              :key="tokenAmount.key"
              :prop="'tokenAmount.' + index + '.value'"
              :rules="{
                required: true, message: 'Please input tokenAmount', trigger: 'blur'
              }"
            >
              <el-input v-model="tokenAmount.value" class="pool-edit-input" size="mini"></el-input>
              <el-button @click.prevent="removeDomain_Token(tokenAmount)" class="del-button" size="mini">-</el-button>
            </el-form-item>

            <el-form-item class="form-item">
              <el-button @click="addDomain_Token" class="add-button" size="mini">+</el-button>
              <el-button @click="submitForm_Token('dynamicValidateForm_Token')" class="submit-button" size="mini">Submit</el-button>
            </el-form-item>
          </el-form>  

        </el-collapse-item>

        <el-collapse-item
          title="Modules"
          name="2"
          class="el-collapse-item"
        >
          <!-- TODO: 此处对于 Modules 的数据结构与上面 dynamicValidateForm 不同 -->
          <el-form 
            :model="dynamicValidateForm_Module" 
            ref="dynamicValidateForm_Module" 
            label-width="70px">

            <el-form-item
              class="form-item"
              v-for="(moduleName, index) in dynamicValidateForm_Module.moduleName"
              :label="'Module' + index"
              :key="moduleName.key"
              :prop="'moduleName.' + index + '.value'"
              :rules="{
                required: true, message: 'Please input moduleName', trigger: 'blur'
              }"
            >
              <el-input v-model="moduleName.value" class="pool-edit-input" size="mini"></el-input>
            </el-form-item>

            <el-form-item
              class="form-item"
              v-for="(moduleExpressions, index) in dynamicValidateForm_Module.moduleExpressions"
              :label="'Exp' + index"
              :key="moduleExpressions.key"
              :prop="'moduleExpressions.' + index + '.value'"
              :rules="{
                required: true, message: 'Please input moduleExpressions', trigger: 'blur'
              }"
            >
              <el-input type="textarea" :rows="3" v-model="moduleExpressions.value" class="pool-edit-input" size="mini"></el-input>
              <el-button @click.prevent="removeDomain_Module(moduleExpressions)" class="del-button" size="mini">-</el-button>
            </el-form-item>

            <el-form-item class="form-item">
              <el-button @click="addDomain_Module" class="add-button" size="mini">+</el-button>
              <el-button @click="submitForm_Module('dynamicValidateForm_Module')" class="submit-button" size="mini">Submit</el-button>
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
export default {
  mixins: [nodeMixin],
  props: ["nodeData", "nodeId"],
  data() {
    return {
      activeNames: ["1"],
      dynamicValidateForm_Token: {
          tokenName: [],
          tokenAmount: [],
      },
      dynamicValidateForm_Module: {
          moduleName: [],
          moduleExpressions: [
            // ["a=1"],
            // ["b=2"]
          ],
      }
    };
  },
  methods: {
    ...mapMutations(["STORAGE_GRAPH"]),
    submitForm_Token(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //console.log("form",this.dynamicValidateForm);
          //console.log("nodedata",this.nodeData);
          var map = new Map();
          for(let i=0;i<this.dynamicValidateForm_Token.tokenAmount.length;i++){
            map.set(this.dynamicValidateForm_Token.tokenName[i],this.dynamicValidateForm_Token.tokenAmount[i])
          }

          if (this.graph.model.collection.cells.length) {
              for(let i = 0;i<this.graph.model.collection.cells.length;i++){
                if(this.graph.model.collection.cells[i].id === this.nodeId) {
                  this.graph.model.collection.cells[i].getData().nodeData.tokens = [];
                  this.graph.model.collection.cells[i].getData().nodeData.tokens.push(map);
                }
              }
          }
        } else {
          //console.log('error submit!!');
          return false;
        }
      });
    },
    submitForm_Module(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //console.log("form",this.dynamicValidateForm);
          //console.log("nodedata",this.nodeData);
          var map = new Map();
          for(let i=0;i<this.dynamicValidateForm_Module.moduleExpressions.length;i++){
            map.set(this.dynamicValidateForm_Module.moduleName[i],this.dynamicValidateForm_Module.moduleExpressions[i])
          }
          if (this.graph.model.collection.cells.length) {
              for(let i = 0;i<this.graph.model.collection.cells.length;i++){
                if(this.graph.model.collection.cells[i].id === this.nodeId) {
                  this.graph.model.collection.cells[i].getData().nodeData.modules = [];
                  this.graph.model.collection.cells[i].getData().nodeData.modules.push(map);
                }
              }
          }
        } else {
          //console.log('error submit!!');
          return false;
        }
      });
    },
    removeDomain_Token(item) {
      var index = this.dynamicValidateForm_Token.tokenAmount.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm_Token.tokenAmount.splice(index, 1);
        this.dynamicValidateForm_Token.tokenName.splice(index, 1)
      }
    },
    removeDomain_Module(item) {
      var index = this.dynamicValidateForm_Module.moduleExpressions.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm_Module.moduleExpressions.splice(index, 1);
        this.dynamicValidateForm_Module.moduleName.splice(index, 1)
      }
    },
    addDomain_Token() {
      this.dynamicValidateForm_Token.tokenName.push({
        value: '',
        key: Date.now()
      });
      this.dynamicValidateForm_Token.tokenAmount.push({
        value: '',
        key: Date.now() + 1
      });
    },
    addDomain_Module() {
      this.dynamicValidateForm_Module.moduleName.push({
        value: '',
        key: Date.now()
      });
      this.dynamicValidateForm_Module.moduleExpressions.push({
        value: '',
        key: Date.now() + 1
      });
    }
  },
  computed: {
    ...mapState([
      "graph",
    ]),
  },

  mounted() {
    console.log("node data", this.nodeData);
    if (this.nodeData.tokens.length){
      for(var key of this.nodeData.tokens[0].keys()) {
        let tokenName = key.value;
        let tokenAmount = this.nodeData.tokens[0].get(key).value

        this.dynamicValidateForm_Token.tokenName.push({
          value: tokenName,
        });
        this.dynamicValidateForm_Token.tokenAmount.push({
          value: tokenAmount,
        });
      }
    }

    if (this.nodeData.modules.length){
      for(var key of this.nodeData.modules[0].keys()) {
        let moduleName = key.value;
        let moduleExpressions = this.nodeData.modules[0].get(key).value

        this.dynamicValidateForm_Module.moduleName.push({
          value: moduleName,
        });
        this.dynamicValidateForm_Module.moduleExpressions.push({
          value: moduleExpressions,
        });
      }
    }
    
  },

};
</script>
<style lang="scss" scoped>
.pool-content {
  /deep/ .el-collapse-item__header {
    background-color: #bccaf5;
    margin-left: 20px;
    color: white;
    font-weight: 600;
  }
  /deep/ .el-collapse-item__wrap {
    background-color: #bccaf5;
  }
  /deep/ .el-form-item__label {
    color:white;
    font-weight: 600;
  }
  /deep/ .el-input__inner{
    color:rgb(194, 194, 194)
  }

  .form-item {
    padding: 5px;
    margin-bottom: 0px;
    .pool-edit-input {
      margin-left: 5px;
      width: 150px;
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
      color:rgb(194, 194, 194)
    }
  }
}
</style>