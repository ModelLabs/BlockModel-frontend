<template>
    <div>
        <el-table
        :data="mintNodes"
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
          width="280"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="type"
          label="Type"
          width="280"
          :filters="[
            { text: 'Genesis', value: 'genesis' }, 
            { text: 'Blackhole', value: 'blackhole' },
            { text: 'Stakeholder', value: 'stakeholder' },
            { text: 'Pool', value: 'pool' },
          ]"
          :filter-method="filterHandler">
        </el-table-column>
        <el-table-column
          prop="label"
          label="Label"
          width="280"
          show-overflow-tooltip>
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
      ...mapMutations(["SET_MINT_NODES","SET_MINT_EDGES"]),

      // step1 filter
      filterHandler(value, row, column) {
        const property = column['property'];
        return row[property] === value;
      },

      // 这是控制 Step1 表格多选的方法
      handleSelectionChange(val) {
        this.multipleSelection = val;
        let selectedNodesId = [];
        for(let i=0;i<this.multipleSelection.length;i++){
          selectedNodesId.push(this.multipleSelection[i].id);
        }
        this.SET_MINT_NODES(selectedNodesId);   
      },
    },
    computed: {
      ...mapState([
        "mintNodesId",
        "mintNodes",
      ]),
    },
}
</script>