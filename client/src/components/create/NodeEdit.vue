<template >
  <div class="node-edit-container">
    <p class="container-title">
      <span>{{nodeText.substr(0, 10)}}</span>
      <span v-show="nodeText.length>10">…</span>
      <span> - {{nodeType}} Attribute Editing</span>
      <!-- Element Attribute Editing -->
      <span class="node-edit-close-icon"
        ><i class="el-icon-circle-close" @click="close()"></i
      ></span>
    </p>
    <Genesis v-if="nodeType == 'genesis'" :nodeData="nodeData"/>
    <Blackhole v-if="nodeType == 'blackhole'" :nodeData="nodeData"/>
    <Stakeholder v-if="nodeType == 'stakeholder'" :nodeData="nodeData" :nodeId="nodeId"/>
    <Pool v-if="nodeType == 'pool'" :nodeData="nodeData" :nodeId="nodeId"/>
    <Operation v-if="nodeType == 'Edge'" :nodeData="nodeData" :nodeId="nodeId" :nodeCell="nodeCell"/>
  </div>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import Genesis from "../V2-nodes/Genesis";
import Blackhole from "../V2-nodes/Blackhole";
import Stakeholder from "../V2-nodes/Stakeholder";
import Pool from "../V2-nodes/Pool";
import Operation from "../edge/Operation2";
export default {
  props: ["closeNodeEdit"],
  data() {
    return {
      nodeType: "",
      nodeData: null,
      nodeText:"",
      nodeId:"",
      nodeCell: null,
    };
  },
  methods: {
    close() {
      this.closeNodeEdit();
    },
    
  },
  components: {
    Genesis,
    Blackhole,
    Stakeholder,
    Pool,
    Operation,
  },
  computed: {
    ...mapState(["editNode"]),
  },
  watch: {
    editNode(val) {
      this.nodeType = val.getData().type;
      if (this.nodeType == "Edge") {
        // val.attrs.line.strokeDasharray = "5, 10";
        // console.log("edge",val.attrs.line)
        this.nodeData = val.getData().edgeData;
        if(val.labels.length) this.nodeText = val.labels[0].attrs.label.text;
        else this.nodeText = "Edge";
        this.nodeId = val.id;
        this.nodeCell = val;
      } else {
        this.nodeData = val.getData().nodeData;
        this.nodeText = val.store.data.attrs.text.text;
        this.nodeId = val.id;
      }
      
    },
  },
};
</script>
<style lang="scss" scoped>
.node-edit-container {
  //background-color:#bccaf5;
  margin: 0;
  position: fixed;
  //height: calc(100% - 180px);
  //width: 300px;
  //right: calc(100% - (100% - 250px) - 195px);
  overflow: scroll;
  //margin-top: 70px;
  border-radius: 30px;
  //border: 2.5px solid rgb(232, 231, 231);
  box-shadow: 0 0 1px rgba(219, 218, 218, 0.8);
  .container-title {
    margin: 2%;
    height: 32px;
    line-height: 32px;
    font-size: 13px;
    font-weight: 700;
    padding-left: 10px;
    color: black;
    .node-edit-close-icon {
      float: right;
      margin-right: 10px;
      font-size: 20px;
      cursor: pointer;
      &:hover {
        color: #a09e9e;
      }
    }
  }
}
</style>