<template >
  <div>
    <!-- graph container -->
    <Editor />

    <div class="rule-edit" v-if="ruleEditShow.show"><RuleEdit /></div>

    <el-dialog
      title="Data Visualization Dashboard"
      :visible.sync="visualPanelVisible"
      :modal-append-to-body='false'
      class="data-dialog"
      width="1200px"
      @close="VISUAL_PANEL_VISIBLE(false)"
    >
      <VisualPanel />
    </el-dialog>

    <el-dialog
      title="Mint New Model"
      :visible.sync="mintPanelVisible"
      width="55%"
      center
    >
    <MintForm />
      <!-- <MintForm :close="closeMintEdit" 
        :mintNodes="mintNodes" :mintEdges="mintEdges" 
        :selectNodeData="selectNodeData" :selectVisualData="selectVisualData" 
        :selectProperties="selectProperties"
      /> -->
    </el-dialog>

  </div>
</template>
<script>
import Editor from "../components/create/Editor";
import RuleEdit from "../components/create/RuleEdit";
import VisualPanel from "../components/create/VisualPanel";
import MintForm from "../components/Template/MintForm"
import { mapMutations, mapState } from "vuex";
export default {
  data(){
    return {
      modelName:"test",
    }
  },
  components: {
    Editor,
    RuleEdit,
    VisualPanel,
    MintForm,
    
  },
  mounted(){
    if(this.$route.query.model != undefined){
      this.axios.get(`/api/model/${this.$route.query.model}`).then(
        result => {
          let tmp = result.data[0]._modeldata;
          if (tmp != 0) {
            let modelData = JSON.parse(tmp);

            //const submitModelConfigData = modelData.model.configData;
            //后续需要对内容进行校验
            const submitModelGraph = modelData.model.graph;

            //清空画布
            this.CLEAR_GRAPH();
            this.MODIFY_GRAPH(submitModelGraph.cells);
            this.CLOSE_UPLOAD_DIALOG();
          } else {
            console.log("空内容");
          }
        },
        error => {
          console.error("error",error)
        }
    )
    }
  },
  methods: {
    ...mapMutations([
      "VISUAL_PANEL_VISIBLE", //修改可视化面板可见性
      "MINT_PANEL_VISIBLE", //修改 Mint 面板可见性
      "CLEAR_GRAPH",
      "MODIFY_GRAPH",
      "CLOSE_UPLOAD_DIALOG",
    ]),
    closeMintEdit() {
      this.MINT_PANEL_VISIBLE(false);
    },
  },
  computed: {
    ...mapState([
      "ruleEditShow","visualPanelVisible","mintPanelVisible",
      "mintNodes","mintEdges","selectNodeData","selectVisualData","selectProperties",
    ]),
    visualPanelVisible:{
      get(){
        return this.$store.state.visualPanelVisible;
      },
      set(val){
        this.VISUAL_PANEL_VISIBLE(val);
      }
    },
    mintPanelVisible:{
      get(){
        return this.$store.state.mintPanelVisible;
      },
      set(val){
        this.MINT_PANEL_VISIBLE(val);
      }
    }
  },
};
</script>
<style lang="scss" scoped>
.rule-edit {
  position: absolute;
  top: 20%;
  left: 40%;
}
</style>