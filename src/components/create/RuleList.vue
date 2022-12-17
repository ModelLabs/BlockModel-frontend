<template >
  <div class="container">
    <p class="rule-title">Property</p>
    <div class="rule-lists">
      <span class="add-icon" v-if="ruleLists.length == 0"
        ><i class="el-icon-circle-plus-outline" @click="addItem()"></i
      ></span>

      <div class="rule-item" v-for="(item, index) in ruleLists" :key="item.id">
        <span class="status-valid-symbol" v-if="item.status"></span>
        <span class="status-invalid-symbol" v-else></span>

        <span class="rule-content" @click="editItem(item, index)">{{
          item.label.substr(0, 12)
        }}</span>
        <span class="item-refresh-icon">
          <i 
            class="el-icon-refresh" 
            @click="refreshItemStatus(index)"
            v-if="ruleLists[index].status"
          >
          </i>
        </span>
        <span class="item-remove-icon"
          ><i class="el-icon-remove-outline" @click="removeItem(index)"></i
        ></span>
        <span class="item-add-icon" v-if="index == ruleLists.length - 1"
          ><i class="el-icon-circle-plus-outline" @click="addItem()"></i
        ></span>
      </div>
    </div>

    <div class="rule-edit"></div>
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import { setStore, getStore } from "../../utils/storage";
export default {
  data() {
    return {
      checked: [],
      current: null,
      show: false,
    };
  },
  methods: {
    ...mapMutations(["SET_EDIT_RULE"]),
    removeItem(index) {
      this.ruleLists.splice(index, 1);
      setStore("rule_lists", this.ruleLists);
    },
    refreshItemStatus(index){
      this.ruleLists[index].status = false;
      setStore("rule_lists", this.ruleLists);
    },
    addItem() {
      this.ruleEditShow.show = true;
      this.ruleEditShow.add = true;
    },
    editItem(item, index) {
      this.ruleEditShow.show = true;
      this.ruleEditShow.add = false;
      this.ruleEditShow.index = index;
      this.SET_EDIT_RULE(item);
    },
  },
  computed: {
    ...mapState(["ruleLists", "ruleEditShow", "editRule"]),
  },
};
</script>
<style lang="scss" scoped>
.container {
  height: 100%;
  width: 200px;
  background-color: rgba(147, 194, 241, 0.55);
  border-radius: 20px;

  .rule-title {
    padding-top: 10px;
    font-size: 16px;
    font-weight: 600;
    color: rgb(243, 244, 226);
    letter-spacing: 0.2ch;
    text-align: center;
  }
  .rule-lists {
    margin-top: 10px;
    padding: 0px 0px 5px 15px;
    height: 250px;
    overflow: scroll;
    color: rgb(243, 244, 226);
    font-size: 16px;
    font-weight: 600;

    .add-icon {
      position: absolute;
      right: 20px;
      top: 11px;
      cursor: pointer;
    }
    .rule-item {
      width: 170px;
      border-radius: 10px;
      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      .rule-content {
        display: inline-block;
        padding: 5px;
        width: 100px;
        cursor: pointer;
      }
      .item-refresh-icon {
        cursor: pointer;
      }
      .item-remove-icon {
        margin-left: 3px;
        cursor: pointer;
      }
      .item-add-icon {
        margin-left: 3px;
        cursor: pointer;
      }
      .status-invalid-symbol {
        display: inline-block;
        width: 5px;
        height: 5px;
        background-color: red;
        border-radius: 100%;
      }
      .status-valid-symbol {
        display: inline-block;
        width: 5px;
        height: 5px;
        background-color: green;
        border-radius: 100%;
      }
    }
  }
  .operation {
    position: absolute;
    bottom: 10px;
    left: 40px;
    .operate-button {
      padding: 0px 20px;
      font-size: 20px;
    }
  }
}
</style>