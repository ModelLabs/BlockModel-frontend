<template >
  <div>
    <div class="blackhole-content">
      <div class="blackhole-edit">
        <span>Token:</span>
        <el-input
            class="blackhole-edit-input-token"
            v-model="blackholeData.token"
            size="mini"
            placeholder="Token Name"
            ></el-input>
      </div>

      <div class="blackhole-edit">
        <span>Burn:</span>
        <el-input
            class="blackhole-edit-input-burn"
            v-model="blackholeData.burn"
            size="mini"
            placeholder="burn"
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
  methods: {
    ...mapMutations(["STORAGE_GRAPH"]),
  },
  computed: {
    blackholeData() {
      return this.nodeData;
    },
  },
};
</script>
<style lang="scss" scoped>
.blackhole-content {
  .blackhole-edit {
    padding: 10px 15px;
    span {
      font-size: 14px;
      color:white;
      font-weight: 600;
    }
    /deep/ .el-input__inner {
      color:rgb(194, 194, 194);
    }
    .blackhole-edit-input-token {
      margin-left: 15px;
      width: 200px;
    }
    .blackhole-edit-input-burn {
      margin-left: 22px;
      width: 200px;
    }
  }
}
</style>