<template >
  <div>
    <div class="blackhole-content">
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
          <el-input v-model="tokenName.value" class="blackhole-edit-input" size="small"></el-input>
        </el-form-item>

        <el-form-item
          class="form-item"
          v-for="(tokenAmount, index) in dynamicValidateForm.tokenAmount"
          :label="'Amount' + index"
          :key="tokenAmount.key"
          :prop="'tokenAmount.' + index + '.value'"
          :rules="{
            required: true, message: 'Please input token amount', trigger: 'blur'
          }"
        >
          <el-input v-model="tokenAmount.value" class="blackhole-edit-input" size="small"></el-input>
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
import { nodeMixin } from "../../mixin";
import { mapMutations } from "vuex";
export default {
  mixins: [nodeMixin],
  props: ["nodeData"],
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
            this.nodeData.tokens.tokenNames = this.dynamicValidateForm.tokenName;
            this.nodeData.tokens.tokenAmounts = this.dynamicValidateForm.tokenAmount;
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
    for (let i =0;i<this.nodeData.tokens.tokenNames.length;i++){
      this.dynamicValidateForm.tokenName.push(this.nodeData.tokens.tokenNames[i]);
      this.dynamicValidateForm.tokenAmount.push(this.nodeData.tokens.tokenAmounts[i]);
    }
  },
  // computed: {
  //   blackholeData() {
  //     return this.nodeData;
  //   },
  // },
};
</script>
<style lang="scss" scoped>
.blackhole-content {
  .form-item {
    padding: 5px;
    margin-bottom: 0px;

    /deep/ .el-form-item__label {
      color: black;
      //font-weight: 600;
    }

    .blackhole-edit-input {
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