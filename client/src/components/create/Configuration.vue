<template>
    <div class="figure-container">
          <h4>Env Configuration</h4>
          <div class="days">
            <span class="config-data-input">Simulation Days</span>
            <el-slider
              v-model="configData.simulationDays"
              class="day-slider"
              :min="1"
              :max="20000"
              :step="1"
              input-size="mini"
              :change="modifyConfigData()"
              show-input>
            </el-slider>
          </div>
          <div class="slot">
            <span class="config-data-input">Simulation Step</span>
            <el-slider
              v-model="configData.simulationSlot"
              class="day-slider"
              :min="1"
              :max="20000"
              :step="1"
              show-input
              input-size="mini"
              :change="modifyConfigData()"
            ></el-slider>
          </div>

          <div class="global-vars-setting">
            <el-form 
              :model="dynamicValidateForm" 
              ref="dynamicValidateForm" 
              label-width="70px">

              <el-form-item
                class="form-item"
                v-for="(var_key, index) in dynamicValidateForm.var_key"
                :label="'key' + index"
                :key="var_key.key"
                :prop="'var_key.' + index + '.value'"
                :rules="{
                  required: true, message: 'Please input var key', trigger: 'blur'
                }"
              >
                <el-input v-model="var_key.value" class="globalVar-edit-input" size="small"></el-input>
              </el-form-item>

              <el-form-item
                class="form-item"
                v-for="(var_value, index) in dynamicValidateForm.var_value"
                :label="'value' + index"
                :key="var_value.key"
                :prop="'var_value.' + index + '.value'"
                :rules="{
                  required: true, message: 'Please input var value', trigger: 'blur'
                }"
              >
                <el-input v-model="var_value.value" class="globalVar-edit-input" size="small"></el-input>
                <el-button @click.prevent="removeDomain(var_value)" class="del-button" size="mini">-</el-button>
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
import { mapState, mapMutations } from "vuex";
import { setStore } from "../../utils/storage";

export default {
  data() {
    return {
        dynamicValidateForm: {
        var_key: [],
        var_value: [],
      },
    };
  },
  methods:{
    /**
    * 修改全局配置信息
    */
    modifyConfigData() {
      setStore("config_data", this.configData);
    },
    /**
    Date && Slot 配置表单方法
    */
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
            this.configData.globalVars.var_key = this.dynamicValidateForm.var_key;
            this.configData.globalVars.var_value  = this.dynamicValidateForm.var_value;
        } 
        else return false;
      })
    },
    removeDomain(item) {
      var index = this.dynamicValidateForm.var_value.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.var_value.splice(index, 1);
        this.dynamicValidateForm.var_key.splice(index, 1)
      }
    },
    addDomain() {
      this.dynamicValidateForm.var_key.push({
        value: '',
        key: Date.now()
      });
      this.dynamicValidateForm.var_value.push({
        value: '',
        key: Date.now() + 1
      });
    },
  },
  computed: {
    ...mapState([
      "configData",
    ]),
  },
}
</script>

<style lang="scss" scoped>
    .figure-container {
        height: 100%;
        margin: 0;
        h4 {
          letter-spacing: 0.2ch;
          margin-left: 10px;
        }
        .config-data-input {
          margin-left: 10px;
          width: 200px;
          margin-top: 15px;
          letter-spacing: 0.1ch;
          font-weight: 500;
        }

        .day-slider {
          margin-left: 20px;
          margin-bottom: 20px;
          width: 250px;
          // 这个是滑动条滑过的颜色
          /deep/ .el-slider__bar {
            background: linear-gradient(to left, #49e4f5, #d849f5);
          }
          // 这个是滑动条未滑过的颜色
          /deep/ .el-slider__runway {
            background-color: #ffffff;
          }
          // 这个是滑动条按钮颜色
          /deep/ .el-slider__button {
            border: 2px solid rgb(2, 157, 247);
            transition: 0s;
          }
          /deep/ .el-input-number__decrease, /deep/ .el-input-number__increase {
            // 这个是天数 - ｜ + 按钮 bg color
            background-color: #fff;
            // 这个是天数 - ｜ + 按钮 text color
            color: #111;
          }

          // 这个是天数数值样式
          /deep/ .el-input__inner {
            color: black;
            font-weight: 400;
            background-color:white;
            border: 0px solid rgb(2, 157, 247);
          }
        }

        .global-vars-setting {
          .form-item {
            padding: 5px;
            margin-bottom: 0px;

            /deep/ .el-form-item__label {
              color: black;
            }

            .globalVar-edit-input {
              margin-left: 5px;
              width: 120px;
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

      }
</style>