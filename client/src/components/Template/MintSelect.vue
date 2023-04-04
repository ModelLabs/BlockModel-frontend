<template>
    <div>
        <el-cascader
          placeholder="Select Model Data"
          :options="modelDataForSelect"
          :props="props"
          @change="handleModelDataChange"
          clearable>
        </el-cascader>

        <el-cascader
          placeholder="Select Visual Data"
          :options="selectVisualData"
          :props="props"
          clearable
          class="multipleSelect"
          @change="handleVisualDataChange">
        </el-cascader>

        <el-cascader
          placeholder="Select Properties"
          :options="selectProperties"
          :props="props"
          clearable
          class="multipleSelect"
          @change="handlePropertyDataChange">
        </el-cascader>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
    data() {
        return {
            props:{multiple:true},
        }
    },
    methods:{
        handleModelDataChange(val){
            this.SET_SELECT_MODEL_DATA(val);
        },
        handleVisualDataChange(val){
            this.SET_SELECT_VISUAL_DATA(val);
        },
        handlePropertyDataChange(val){
            this.SET_SELECT_PROPERTY_DATA(val);
        },
        ...mapMutations([
            "SET_SELECT_MODEL_DATA",
            "SET_SELECT_VISUAL_DATA",
            "SET_SELECT_PROPERTY_DATA"
        ]),
    },
    computed: {
      ...mapState([
        "modelDataForSelect","selectVisualData","selectProperties"
      ]),
    },
}
</script>

<style lang="scss" scoped>
    .multipleSelect {
        margin-left:30px
    }
</style>