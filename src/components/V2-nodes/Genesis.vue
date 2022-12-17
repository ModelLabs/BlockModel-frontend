<template >
  <div>
    <div class="genesis-content">
      <div class="genesis-edit">
        <span>Token:</span>
        <el-input
            class="genesis-edit-input-id"
            v-model="genesisData.token"
            size="mini"
            placeholder=TokenID
            ></el-input>
      </div>

      <div class="genesis-edit">
        <span>Supply:</span>
        <el-input
            class="genesis-edit-input-supply"
            v-model="genesisData.maxsupply"
            size="mini"
            placeholder=MaxSupply
            ></el-input>
      </div>
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
      activeNames: ["1"],
    };
  },
  methods: {
    ...mapMutations(["STORAGE_GRAPH"]),
  },
  computed: {
    genesisData() {
      return this.nodeData;
    },
  },
};
</script>
<style lang="scss" scoped>
.genesis-content {
  .genesis-edit {
    padding: 10px 15px;
    span {
      font-size: 14px;
      color:white;
      font-weight: 600;
    }
    /deep/ .el-input__inner {
      color:rgb(194, 194, 194);
    }
    .genesis-edit-input-id {
      margin-left: 20px;
      width: 195px;
    }
    .genesis-edit-input-supply {
      margin-left: 15px;
      width: 195px;
    }
  }
}
</style>