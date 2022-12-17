<template >
  <div>
    <div class="stakeholder-content">
      <el-form 
        :model="dynamicValidateForm" 
        ref="dynamicValidateForm" 
        label-width="70px">

        <el-form-item
          class="form-item"
          v-for="(tokenName, index) in dynamicValidateForm.tokenName"
          :label="'Token' + index"
          :key="tokenName.key"
          :prop="'tokenName.' + index + '.value'"
          :rules="{
            required: true, message: 'Please input tokenName', trigger: 'blur'
          }"
        >
          <el-input v-model="tokenName.value" class="stakeholder-edit-input" size="small"></el-input>
        </el-form-item>

        <el-form-item
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
import { nodeMixin } from "../../mixin/";
import { mapMutations, mapState } from "vuex";
export default {
  mixins: [nodeMixin],
  props: ["nodeData","nodeId"],
  data() {
    return {
      dynamicValidateForm: {
          tokenName: [],
          tokenAmount: [],
        }
    };
  },
  methods: {
    ...mapMutations(["STORAGE_GRAPH"]),
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
        //组装 stakerholder 的 nodeData 数据
            var map = new Map();
            for(let i=0;i<this.dynamicValidateForm.tokenAmount.length;i++){
              map.set(this.dynamicValidateForm.tokenName[i],this.dynamicValidateForm.tokenAmount[i])
            }
            // 拿到 stakerholder 节点
            if (this.graph.model.collection.cells.length) {
              for(let i = 0;i<this.graph.model.collection.cells.length;i++){
                if(this.graph.model.collection.cells[i].id === this.nodeId) {
                  this.graph.model.collection.cells[i].getData().nodeData = [];
                  this.graph.model.collection.cells[i].getData().nodeData.push(map);
                }
              }
            }
        } 
        else return false;
      })
    },
    removeDomain(item) {
      var index = this.dynamicValidateForm.tokenAmount.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.tokenAmount.splice(index, 1);
        this.dynamicValidateForm.tokenName.splice(index, 1)
      }
    },
    addDomain() {
      this.dynamicValidateForm.tokenName.push({
        value: '',
        key: Date.now()
      });
      this.dynamicValidateForm.tokenAmount.push({
        value: '',
        key: Date.now() + 1
      });
    }
  },
  mounted() {
    console.log(this.nodeData)
    if (this.nodeData.length){
      for(var key of this.nodeData[0].keys()) {
        let tokenName = key.value;
        let tokenAmount = this.nodeData[0].get(key).value

        this.dynamicValidateForm.tokenName.push({
          value: tokenName,
        });
        this.dynamicValidateForm.tokenAmount.push({
          value: tokenAmount,
        });
      }
    }
  },

  computed: {
    ...mapState([
      "graph",
    ]),
  },
};
</script>
<style lang="scss" scoped>
.stakeholder-content {
  .form-item {
    padding: 5px;
    margin-bottom: 0px;

    /deep/ .el-form-item__label {
      color: white;
      font-weight: 600;
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
  }
  
}
</style>