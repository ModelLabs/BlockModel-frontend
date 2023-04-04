<template>
    <div>
        <el-table
        :data="mintEdges"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="id"
          label="Node Id"
          width="260"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="label"
          label="Label"
          width="120">
        </el-table-column>

        <el-table-column
          prop="sourceType"
          label="SourceType"
          width="120">
        </el-table-column>
        <el-table-column
          prop="sourceLabel"
          label="SourceLabel"
          width="120">
        </el-table-column>
        
        <el-table-column
          prop="targetType"
          label="TargetType"
          width="120">
        </el-table-column>
        <el-table-column
          prop="targetLabel"
          label="TargetLabel"
          width="120">
        </el-table-column>
      </el-table>
    </div>
</template>

<script>
import { mapState, mapMutations  } from "vuex";
export default {
    data() {
        return {
            // 控制表格多选 （step1）
            multipleSelection: [],
        }
    },
    methods:{
      ...mapMutations(["SET_MINT_EDGES"]),

      // 这是控制 Step1 表格多选的方法
      handleSelectionChange(val) {
        this.multipleSelection = val;
        let selectedEdgesId = [];
        for(let i=0;i<this.multipleSelection.length;i++){
          selectedEdgesId.push(this.multipleSelection[i].id);
        }
        this.SET_MINT_EDGES(selectedEdgesId);  
      },
    },
    computed: {
      ...mapState([
        "mintEdgesId","mintEdges",
      ]),
    },
}
</script>