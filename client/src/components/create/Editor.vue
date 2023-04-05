<template>
  <div class="container">

    <div class="model">
      <div class="left" v-if="nodeEditShow">
        <div class="date"><Configuration /></div>
        <div class="property"><RuleList /></div>
        <!-- <div class="style"></div> -->
      </div>
      <transition name="el-fade-in-linear">
          <div class="right-container" v-bind:class="{ show: nodeEditShow }">
            <NodeEdit :closeNodeEdit="closeNodeEdit" />
          </div>
        </transition>

      <div class="draw">
        <div id="canvas-main"></div>
      </div>
      <div class="right">
        <div class="components" ref='components'></div>
      </div>
    </div>
    <div class="bottom-container"><ToolsNavbar /></div>
  </div>
</template>

<script>
import VisualPanel from "./VisualPanel";
import ModelUpload from "./ModelUpload";
import NodeEdit from "./NodeEdit";
import ToolsNavbar from "./ToolsNavbar";
import Configuration from "./Configuration";
import MintForm from "../Template/MintForm";
import RuleList from "../create/RuleList";
import { Addon, Graph, Shape } from "@antv/x6";
// 导入链接桩配置
import { PortsConfig } from "../../graph/portsConfig";
import { mapState, mapMutations } from "vuex";
import { setStore } from "../../utils/storage";
import { connectMetamask } from "../../api/contracts";
import { downloadFromIPFS } from "../../utils/ipfsUtil";
import { querymetadata } from "../../api/index";
import { decryptDataEOA, decryptDataNormal } from "../../utils/cryptoUtil";

const { Stencil } = Addon;
const { Circle, Polygon,} = Shape;
// // eslint-disable-next-line
// const RedVertices = Vertices.define<Vertices.Options>({
//   name: 'red-vertices',
//   attrs: {
//     fill: 'red',
//   },
// })

// Graph.registerEdgeTool('red-vertices', RedVertices, true)

export default {
  data() {
    return {
      loaded: false,
      nodeEditShow: true,
      //visualPanelVisible: false,
      vsVisible: false,
      centerDialogVisible: false,
      // 传递给 mint 弹窗的数据
      // step1 nodes data
      mintNodes:[],
      // step2 edges data
      mintEdges:[],
      // step3
      selectNodeData:[],
      selectVisualData:[],
      selectProperties:[],
      dynamicValidateForm: {
        var_key: [],
        var_value: [],
      },
    };
  },
  components: {
    VisualPanel,
    ModelUpload,
    NodeEdit,
    ToolsNavbar,
    MintForm,
    RuleList,
    Configuration,
  },
  methods: {
    ...mapMutations([
      "STORAGE_GRAPH",
      "LOAD_GRAPH",
      "POSITIONING_GRAPH",
      "INIT_GRAPH",
      "ZOOM_GRAPH",
      "UNDO_GRAPH",
      "REDO_GRAPH",
      "CLOSE_UPLOAD_DIALOG",
      "SET_EDIT_CELLS",
      "MODIFY_HISTORY_SIMULATE_DATA",
      "MODIFY_CONFIGDATA",
      "SET_USER",
      "LOAD_RULE_LISTS",
      "CLEAR_HISTORY_SIMULATE_DATA",
      "UPDATE_HISTORY_DATA_FROM_INDEXDB",
      "SET_MARKER_ARRAY",
      "ADD_INDEX",
      "CLEAR_INDEX_LIST",
      "REMOVE_CELLS",
    ]),
    /**
    修改全局配置信息
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
            // //组装 stakerholder 的 nodeData 数据
            // var map = new Map();
            // for(let i=0;i<this.dynamicValidateForm.tokenAmount.length;i++){
            //   map.set(this.dynamicValidateForm.tokenName[i],this.dynamicValidateForm.tokenAmount[i])
            // }
            // // 拿到 stakerholder 节点
            // if (this.graph.model.collection.cells.length) {
            //   for(let i = 0;i<this.graph.model.collection.cells.length;i++){
            //     if(this.graph.model.collection.cells[i].id === this.nodeId){
            //       this.graph.model.collection.cells[i].getData().nodeData = [];
            //       this.graph.model.collection.cells[i].getData().nodeData.push(map);
            //       console.log(this.graph.model.collection.cells[i].getData().nodeData)
            //     }
            //   }
            // }

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
    /**
    Property 配置方法
     */
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

   // open mint window
    async openMintWindow(){
      this.centerDialogVisible = true;
      // 清空存放数据的数组
      this.mintNodes = [];
      this.mintEdges = [];
      this.selectNodeData = [];
      this.selectVisualData = [];
      this.selectProperties = [];
      let children1 = [];
      let children2 = [];
      
      let nodes = this.graph.model.getNodes();
      nodes.forEach(element => {
        // 准备 step1 的 nodes data
        this.mintNodes.push({
          id:element.id,
          type:element.getData().type,
          label:element.getLabel()
        })

        // 准备 step3 的 select model-nodes（nodes && edges） data
        switch(element.getData().type) {
          case "genesis":
            children1.push({
              value:"Supply",
              label:"Supply" + ":" + element.getData().nodeData.maxsupply
            })
            this.selectNodeData.push({
              value:element.id,
              label:"Genesis" + "-" + element.getLabel(),
              children:children1
            })
            children1 = [];
            break;

          case "blackhole":
            children1.push({
              value:"Token",
              label:"Token" + ":" + element.getData().nodeData.token
            });
            children1.push({
              value:"Burn",
              label:"Burn" + ":" + element.getData().nodeData.burn
            })

            this.selectNodeData.push({
              value:element.id,
              label:"Blackhole" + "-" + element.getLabel(),
              children:children1
            })
            children1 = [];
            break;

          case "pool":
            for(let i=0;i<element.getData().nodeData.tokens.tokenNames.length;i++){
              children2.push({
                value:i,
                label:"TokenName" + ":" + element.getData().nodeData.tokens.tokenNames[i].value
                  + ";" + "TokenAmount" + ":" + element.getData().nodeData.tokens.tokenAmounts[i].value
              });
            }
            children1.push({
              value:"Tokens",
              label:"Tokens",
              children:children2
            });
            children2 = [];

            for(let j=0;j<element.getData().nodeData.tokens.tokenNames.length;j++){
              children2.push({
                value:j,
                label:"ModeleName" + ":" + element.getData().nodeData.modules.moduleNames[j].value
                  + ";" + "ModuleExp" + ":" + element.getData().nodeData.modules.moduleExpressions[j].value
              });
            }
            children1.push({
              value:"Modules",
              label:"Modules",
              children:children2
            });
            children2 = [];
            
            this.selectNodeData.push({
              value:element.id,
              label:"Pool" + "-" + element.getLabel(),
              children:children1
            })
            children1 = [];
            break;

          case "stakeholder":
            for(let i=0;i<element.getData().nodeData.tokens.tokenNames.length;i++){
              children2.push({
                value:i,
                label:"TokenName" + ":" + element.getData().nodeData.tokens.tokenNames[i].value
                  + ";" + "TokenAmount" + ":" + element.getData().nodeData.tokens.tokenAmounts[i].value
              });
            }
            children1.push({
              value:"Hold",
              label:"Tokens",
              children:children2
            });
            children2 = [];

            
            this.selectNodeData.push({
              value:element.id,
              label:"Stakeholder" + "-" + element.getLabel(),
              children:children1
            })
            children1 = [];
            break;

          default:
            break;
          }
      });
      
      let edges = this.graph.model.getEdges();
      edges.forEach(element => {
        // source && target 取到的是节点 id，需要转成节点类型-标签
        // NOTE：目前没有 target 的线是连不出来的 画布上暂时没有 如以后有 这里或前序需要添加检查
        // 准备 step2 的 edges data
        let lineLabels = "";
        if(element.getLabels().length){
          for(let i=0;i<element.getLabels().length;i++){
            if(i===0) lineLabels = element.getLabels()[i].attrs.label.text;
            else lineLabels = lineLabels + "-" + element.getLabels()[i].attrs.label.text;
          }
        }
        else lineLabels = "-";

        // get source's && target type and label
        let sourceType = "-";
        let sourceLabel = "-";
        let targetType = "-";
        let targetLabel = "-";
        let nodes = this.graph.model.getNodes();
        nodes.forEach(node => {
          if (node.id === element.getSource().cell) {
            sourceType = node.getData().type;
            sourceLabel = node.getLabel();
          }
          if (node.id === element.getTarget().cell) {
            targetType = node.getData().type;
            targetLabel = node.getLabel();
          }
        });
        this.mintEdges.push({
          id:element.id,
          label:lineLabels,
          sourceType:sourceType,
          sourceLabel:sourceLabel,
          targetType:targetType,
          targetLabel:targetLabel
        })
      
        // 准备 step3 的 select model-edges（nodes && edges） data
        for(let k=0;k<element.getData().edgeData.policy.tokenNames.length;k++){
          children2.push({
            value:k,
            label:"TokenName:" + element.getData().edgeData.policy.tokenNames[k].value
              + ";" + "PolicyName:" + element.getData().edgeData.policy.policyNames[k].value
              + ";" + "PolicyFunction:" + JSON.stringify(element.getData().edgeData.policy.policyFunctions[k].value)
            });
        }
        children1.push({
          value:"Policy",
          label:"Policies",
          children:children2
        });
        children2 = [];

        children1.push({
          value:"Active",
          label:"Active:" + element.getData().edgeData.checked,
        });

        let edgeLabel = "Edge"
        if (element.getLabels().length) {
          for(let l=0;l<element.getLabels().length;l++){
            edgeLabel = edgeLabel + "-" + element.getLabels()[l].attrs.label.text;
          }
        }    
        this.selectNodeData.push({
          value:element.id,
          label:edgeLabel,
          children:children1
        })
        children1 = [];
      });
      
      // 准备 step3 的 Visual Data
      // 准备 indexList
      let tmp = await this.getDataFromIndexDB("historyData","id",0);
      if(tmp.length) {
        for(let i=0;i<tmp[0].data.length;i++){
          this.ADD_INDEX(i);
        }
      }

      for(let m=0;m<this.indexList.length;m++){
        children1.push({
          value:"Allocation Pie Chart",
          label:"Allocation Pie Chart"
        });
        children1.push({
          value:"Emission Line Chart",
          label:"Emission Line Chart"
        });
        children1.push({
          value:"Free Money Line Chart",
          label:"Free Money Line Chart"
        });
        this.selectVisualData.push({
          value:m,
          label:m,
          children:children1
        })
        children1 = [];
      }

      for(let r=0;r<this.ruleLists.length;r++){
        this.selectProperties.push({
          value:this.ruleLists[r].id,
          label:this.ruleLists[r].label + "-" + this.ruleLists[r].content
        })
      }
    },
    
    async showHistoryDataOfIndexDB(){
      if(!this.getHistoryDataFromIndexDB.length){
        // 页面刷新后 不点开始测算 这个列表肯定是空的
        // 尝试加载 indexDB 数据
        let tmp = await this.$indexedDB.fullValueSearch("historyData","id",0);

        // TODO (rebase hackathon)
        let data = [];
        data.push({
          simulationDays:"1000",
          name:"GST",
          type:0,
          // vestData:tmpVestData,
          // stakeData:tmpStakeData,
          
        });
        this.UPDATE_HISTORY_DATA_FROM_INDEXDB(data);


        // if(tmp.length) this.UPDATE_HISTORY_DATA_FROM_INDEXDB(tmp[0].data);
      }
      // 如果列表非空 肯定是页面刷新后做过测算了 这个列表数据跟 indexDB同步 直接用即可
    },
    async showMarkerOfIndexDB(){
      if(!this.markerArray.length){
        // 页面刷新后 这个列表肯定是空的
        // 尝试加载 indexDB 数据
        let tmp = await this.$indexedDB.fullValueSearch("historyData","id",1);
        if(tmp.length) this.SET_MARKER_ARRAY(tmp[0].data);
      }
      // 如果列表非空 需要后续补充处理 现在非空不管即可
      // TODO：
      // 现在 Marker 保存的是最新的检查结果 一个规则一条 不跟特定历史测算数据绑定
      // 会全部叠加在折线图上 越多规则满足颜色越深
      // 后续需要单独处理特定数据的绑定逻辑
      // 这个方法 RightToolsNavbar 也有
    },
    /**
       更新 indexList 中的测算 Id
     */
    async prepareIdList(){
      let tmp = await this.$indexedDB.getAll("historySimulationData");
      if(tmp.srcElement.result.length) {
        this.CLEAR_INDEX_LIST();
        for(let i=0;i<tmp.srcElement.result.length;i++){
          this.ADD_INDEX(tmp.srcElement.result[i].get("simulateId"));
        }
      }
    },
    /**
       从 indexdb 中取数据
     */
    async getDataFromIndexDB(DBname,key,index){
      return await this.$indexedDB.fullValueSearch(DBname,key,index);
    },
    async openDataVisualization(){
      // 注释掉 v1:
      // 每次打开可视化面板的时候 传一份 indexDB 里的历史测算数据
      //this.showHistoryDataOfIndexDB();
      // 每次打开可视化面板的时候 传一份 indexDB 里的 Property 检查结果
      //await this.showMarkerOfIndexDB();

      //this.visualPanelVisible = true;
      // for v2: 每次打开的时候传入 id 列表
      // 更新 测算 ID 以供 可视化面板选择
      await this.prepareIdList();
    },
    // 画布初始化
    initGrapg() {
      let cur_graph = new Graph({
        container: document.getElementById("canvas-main"),
        selecting: true,
        autoResize: document.getElementById("canvas-main"),
        history: true,
        background: {
          color: "#fff",
        },
        grid: {
          size: 30,
          visible: true,
        },
        snapline: {
          enabled: true,
          sharp: true,
        },
        scroller: {
          enabled: true,
          pageVisible: false,
          pageBreak: false,
          pannable: true,
          modifiers: ["shift"],
        },
        mousewheel: {
          enabled: true,
          zoomAtMousePosition: true,
          modifiers: ["ctrl", "meta"],
          minScale: 0.5,
          maxScale: 3,
        },
        connecting: {
          router: {
            name: "manhattan",
            args: {
              padding: 1,
            },
          },
          connector: {
            name: "rounded",
            args: {
              radius: 8,
            },
          },
          anchor: "center",
          connectionPoint: "anchor",
          allowBlank: false,
          snap: {
            radius: 20,
          },
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: "#b3b3b3",
                  strokeWidth: 2,
                  strokeDasharray:'0',
                  targetMarker: {
                    name: "block",
                    width: 6,
                    height: 8,
                    stroke: "#b3b3b3", // 使用自定义边框色
                  },
                },
              },
              labels: [
                // label1
                // {
                //   markup: [
                //     {
                //       tagName: 'rect',
                //       selector: 'labelBody',
                //     },
                //     {
                //       tagName: 'text',
                //       selector: 'labelText',
                //     },
                //   ],
                //   attrs: {
                //     labelText: {
                //       text: 'Operation',
                //       fill: '#ffa940',
                //       textAnchor: 'middle',
                //       textVerticalAnchor: 'middle',
                //     },
                //     labelBody: {
                //       ref: 'labelText',
                //       refX: -8,
                //       refY: -5,
                //       refWidth: '100%',
                //       refHeight: '100%',
                //       refWidth2: 16,
                //       refHeight2: 10,
                //       stroke: '#ffa940',
                //       fill: '#fff',
                //       strokeWidth: 2,
                //       rx: 5,
                //       ry: 5,
                //     },
                //   },
                //   position: {
                //     distance: -100,
                //     offset: 0,
                //     args: {
                //       keepGradient: true,
                //       ensureLegibility: true,
                //     },
                //   },
                // },
              ],
              data: {
                edgeData: {
                  checked: true,
                  condition: "",
                  policy: {
                    tokenNames:[],
                    policyNames: [],
                    policyFunctions: [],
                  }
                },
                type: "Edge"
              }
              // tools: [
              //   {
              //     name: 'button',
              //     args: {
              //       markup: [
              //         {
              //           tagName: 'rect',
              //           selector: 'button',
              //           attrs: {
              //             width: 120,
              //             height: 30,
              //             x: -60,
              //             y: -15,
              //             stroke: '#fe854f',
              //             'stroke-width': 2,
              //             fill: 'white',
              //             cursor: 'pointer',
              //           },
              //         },
              //         {
              //           tagName: 'text',
              //           textContent: 'Operation',
              //           selector: 'icon',
              //           attrs: {
              //             fill: '#fe854f',
              //             'font-size': 10,
              //             'text-anchor': 'middle',
              //             'pointer-events': 'none',
              //             y: '0.3em',
              //           },
              //         },
              //       ],
              //       distance: -40,
              //       onClick() {
              //         alert('fmbb');
              //       },
              //     },
              //   },
              // ],
            });
          },
          validateConnection({ targetMagnet }) {
            return !!targetMagnet;
          },
        },
        highlighting: {
          magnetAdsorbed: {
            name: "stroke",
            args: {
              attrs: {
                fill: "#5F95FF",
                stroke: "#5F95FF",
              },
            },
          },
        },
        resizing: {
          enabled: true,
        },
        selecting: {
          enabled: true,
          rubberband: true,
          showNodeSelectionBox: true,
        },
        interacting: {
          edgeLabelMovable: true,
          keyboard: true,
          clipboard: true,
        },
      });

      this.INIT_GRAPH(cur_graph);
      window.onresize = () => {
        var graphWidth = window.innerWidth - 500;
        var graphHeight = window.innerHeight - 180;
        setTimeout(() => {
          cur_graph.resizeScroller(graphWidth,graphHeight)
        })
      }
    },

    // 初始化画布侧边栏
    initStencil() {
      this.stencil = new Stencil({
        title: "",
        target: this.graph,
        stencilGraphWidth: 100,
        stencilGraphHeight: 400,
        groups: [
          {
            name: "pool",
            collapsable:false
          },
          {
            name: "genesis",
            collapsable:false
          },
          {
            name: "stakeholder",
            collapsable:false
          },
          {
            name: "blackhole",
            collapsable:false
          },
        ],
      });

      this.$refs.components.appendChild(this.stencil.container);
      //document.getElementById("left").appendChild(this.stencil.container);
      // const stake = new Rect({
      //   width: 70,
      //   height: 40,
      //   data: {
      //     //业务数据
      //     nodeData: {
      //       stakeData: {
      //         rewardPolicyFrom: "",
      //         stakeAmount: [
      //           { name: "Team", prop: 0, class: "team-slider" },
      //           { name: "Investor", prop: 0, class: "investor-slider" },
      //           { name: "Advisor", prop: 0, class: "advisor-slider" },
      //           { name: "Foundation", prop: 0, class: "foundation-slider" },
      //           { name: "Community", prop: 0, class: "community-slider" },
      //         ],
      //       },
      //     },
      //     type: "Stake",
      //   },
      //   attrs: {
      //     rect: {
      //       fill: "rgb(156,192,2327)",
      //       stroke: "#E6A23C",
      //       strokeWidth: 0,
      //     },
      //     body: {
      //       rx: 15,
      //       ry: 15,
      //     },
      //     text: { text: "Stake", fill: "#fff" },
      //   },
      //   ports: PortsConfig,
      // });

      // const unStake = new Rect({
      //   width: 70,
      //   height: 40,
      //   data: {
      //     //业务数据
      //     nodeData: {
      //       unstakeData: {
      //         coolDownTime: 0,
      //         unstakeAmount: [
      //           { name: "Team", prop: 0, class: "team-slider" },
      //           { name: "Investor", prop: 0, class: "investor-slider" },
      //           { name: "Advisor", prop: 0, class: "advisor-slider" },
      //           { name: "Foundation", prop: 0, class: "foundation-slider" },
      //           { name: "Community", prop: 0, class: "community-slider" },
      //         ],
      //       },
      //     },
      //     type: "Unstake",
      //   },
      //   attrs: {
      //     rect: { fill: "rgb(164,205,231)", stroke: "#67C23A", strokeWidth: 0 },
      //     text: { text: "Unstake", fill: "#fff" },
      //     body: {
      //       rx: 15,
      //       ry: 15,
      //     },
      //   },
      //   ports: PortsConfig,
      // });
      // // 这边如果调整 name 新拖出来的图形 属性栏会相应修改 画布上原有的不变
      // const token = new Circle({
      //   width: 60,
      //   height: 60,
      //   data: {
      //     //业务数据
      //     nodeData: {
      //       tokenData: {
      //         totalSupply: 0,
      //         allocations: [
      //           { name: "Team", prop: 0, class: "team-slider" },
      //           { name: "Investor", prop: 0, class: "investor-slider" },
      //           { name: "Advisor", prop: 0, class: "advisor-slider" },
      //           { name: "Foundation", prop: 0, class: "foundation-slider" },
      //           { name: "Community", prop: 0, class: "community-slider" },
      //         ],
      //         community: {
      //           allocations: [
      //             { name: "Airdrop", prop: 0, class: "airdrop-turntable" },
      //             { name: "Staking", prop: 0, class: "staking-turntable" },
      //           ],
      //           stakingLifetime: 0,
      //           stakingRewardRefresh: 0,
      //           stakingRewardDecreaseFactor: 0,
      //         },
      //       },
      //     },
      //     type: "Token",
      //   },
      //   attrs: {
      //     circle: {
      //       fill: "rgb(183,192,228)",
      //       strokeWidth: 0,
      //       stroke: "#409EFF",
      //     },
      //     text: { text: "Token", fill: "#fff" },
      //   },
      //   ports: PortsConfig,
      // });

      // const vest = new Rect({
      //   width: 70,
      //   height: 40,
      //   data: {
      //     //业务数据
      //     nodeData: {
      //       vestData: {
      //         vestAmount: [
      //           {
      //             name: "Team",
      //             prop: 0,
      //             class: "team-slider",
      //             lockUpTime: 0,
      //             releasePeriod: 0,
      //             cliff: 0,
      //           },
      //           {
      //             name: "Investor",
      //             prop: 0,
      //             class: "investor-slider",
      //             lockUpTime: 0,
      //             releasePeriod: 0,
      //             cliff: 0,
      //           },
      //           {
      //             name: "Advisor",
      //             prop: 0,
      //             class: "advisor-slider",
      //             lockUpTime: 0,
      //             releasePeriod: 0,
      //             cliff: 0,
      //           },
      //           {
      //             name: "Foundation",
      //             prop: 0,
      //             class: "foundation-slider",
      //             lockUpTime: 0,
      //             releasePeriod: 0,
      //             cliff: 0,
      //           },
      //           {
      //             name: "Community",
      //             prop: 0,
      //             class: "community-slider",
      //             lockUpTime: 0,
      //             releasePeriod: 0,
      //             cliff: 0,
      //           },
      //         ],
      //       },
      //     },
      //     type: "Vest",
      //   },
      //   attrs: {
      //     body: {
      //       rx: 15,
      //       ry: 15,
      //     },
      //     rect: {
      //       fill: "rgb(205,149,187)",
      //       stroke: "#F56C6C",
      //       // stroke: {
      //       //   type: "linearGradient",
      //       //   stops: [
      //       //     { offset: "0%", color: "#ccc" },
      //       //     { offset: "50%", color: "#73d13d" },
      //       //     { offset: "100%", color: "#ccc" },
      //       //   ],
      //       // },
      //       strokeWidth: 0,
      //     },
      //     text: { text: "Vest", fill: "#fff" },
      //   },
      //   ports: PortsConfig,
      // });

      const pool = new Polygon({
        width: 60,
        height: 50,
        // label: 'LP pool',
        // 使用 points 属性指定多边形的顶点数组
        points: [
          [0, 10],
          [10, 0],
          [20, 10],
        ],
        attrs: {
          body: {
            fill: '#9254de',
            stroke: '#9254de',
            strokeWidth: 0,
          },
          text: { text: "Pool", fill: "#fff" },
          // label: {
          //     refX: 0.5,
          //     refY: '100%',
          //     refY2: -15,
          //     textAnchor: 'middle',
          //     textVerticalAnchor: 'bottom',
          //   }
        },
        ports: {
          groups: {
              top: {
                  position: "top",
                  attrs: {
                      circle: {
                          r: 4,
                          magnet: true,
                          stroke: "#5F95FF",
                          strokeWidth: 1,
                          fill: "#fff",
                          style: {
                              visibility: "hidden",
                          },
                      },
                  },
              },
              right: {
                  position: "right",
                  attrs: {
                      circle: {
                          r: 4,
                          magnet: true,
                          stroke: "#5F95FF",
                          strokeWidth: 1,
                          fill: "#fff",
                          style: {
                              visibility: "hidden",
                          },
                      },
                  },
              },
              bottom: {
                  position: "bottom",
                  attrs: {
                      circle: {
                          r: 4,
                          magnet: true,
                          stroke: "#5F95FF",
                          strokeWidth: 1,
                          fill: "#fff",
                          style: {
                              visibility: "hidden",
                          },
                      },
                  },
              },
              left: {
                  position: "left",
                  attrs: {
                      circle: {
                          r: 4,
                          magnet: true,
                          stroke: "#5F95FF",
                          strokeWidth: 1,
                          fill: "#fff",
                          style: {
                              visibility: "hidden",
                          },
                      },
                  },
              },
          },
          items: [
              {
                  group: "top",
              },
              {
                  group: "right",
                  args: {
                    dx: -14,
                  },
              },
              {
                  id: "bottom1",
                  group: "bottom",
              },
              {
                  id:"bottom2",
                  group: "bottom",
              },
              {
                  group: "left",
                  args: {
                    dx: 14,
                  },
              },
          ],
        },
        data: {
          nodeData: {
            tokens: {
              tokenNames: [],
              tokenAmounts: []
            },
            modules: {
              globalVars: "",
              moduleNames: [],
              moduleExpressions: []
            }
          },
          type: "pool"
        },
      });

      const genesis = new Circle({
        width: 60,
        height: 60,
        data: {
          nodeData: {
            tokens: {
              tokenNames: [],
              tokenAmounts: []
            }
          },
          type: "genesis"
        },
        attrs: {
          circle: {
            fill: "#73d13d",
            strokeWidth: 0,
            stroke: "#409EFF",
          },
          text: { text: "T", fill: "#fff" },
        },
        ports: PortsConfig,
      });

      const stakeholder = new Circle({
        width: 60,
        height: 60,
        data: {
          nodeData: {
            tokens: {
              tokenNames: [],
              tokenAmounts: []
            }
          },
          type: "stakeholder"
        },
        attrs: {
          circle: {
            fill: "rgb(255, 213, 145)",
            strokeWidth: 0,
            stroke: "#409EFF",
          },
          text: { text: "PPL", fill: "#fff" },
        },
        ports: PortsConfig,
      });

      const blackhole = new Circle({
        width: 60,
        height: 60,
        data: {
          nodeData: {
            tokens: {
              tokenNames: [],
              tokenAmounts: []
            }
          },
          type: "blackhole"
        },
        attrs: {
          circle: {
            fill: "red",
            strokeWidth: 0,
            stroke: "#409EFF",
          },
          text: { text: "x", fill: "#fff" },
        },
        ports: PortsConfig,
      });

      // token.clone(), vest.clone(), stake.clone(), pool.clone(), unStake.clone()
      // this.stencil.load(
      //   [pool.clone(), genesis.clone(), stakeholder.clone(), blackhole.clone()],
      //   "Components"
      // );
      this.stencil.load([pool.clone()],"pool");
      this.stencil.load([genesis.clone()],"genesis");
      this.stencil.load([stakeholder.clone()],"stakeholder");
      this.stencil.load([blackhole.clone()],"blackhole");
    },
    //初始化快捷键
    initShortcutkey() {
      //快捷事件
      this.graph.bindKey(["meta+c", "ctrl+c"], () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.copy(cells);
        }
        return false;
      });
      this.graph.bindKey(["meta+x", "ctrl+x"], () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.cut(cells);
        }
        return false;
      });
      this.graph.bindKey(["meta+v", "ctrl+v"], () => {
        if (!this.graph.isClipboardEmpty()) {
          const cells = this.graph.paste({ offset: 32 });
          this.graph.cleanSelection();
          this.graph.select(cells);
        }
        return false;
      });
      //undo redo
      this.graph.bindKey(["meta+z", "ctrl+z"], () => {
        if (this.graph.history.canUndo()) {
          this.graph.history.undo();
        }
        return false;
      });
      this.graph.bindKey(["meta+shift+z", "ctrl+shift+z"], () => {
        if (this.graph.history.canRedo()) {
          this.graph.history.redo();
        }
        return false;
      });

      // select all
      this.graph.bindKey(["meta+a", "ctrl+a"], () => {
        const nodes = this.graph.getNodes();
        if (nodes) {
          this.graph.select(nodes);
        }
      });

      // zoom
      this.graph.bindKey(["ctrl+1", "meta+1"], () => {
        const zoom = this.graph.zoom();
        if (zoom < 1.5) {
          this.graph.zoom(0.1);
        }
      });
      this.graph.bindKey(["ctrl+2", "meta+2"], () => {
        const zoom = this.graph.zoom();
        if (zoom > 0.5) {
          this.graph.zoom(-0.1);
        }
      });
    },
    initWatchEvent() {
      this.graph.on("node:click",({ e, x, y, cell, view }) => {
        console.log("e",this.graph.getSelectedCells());
      })
      // 节点编辑
      this.graph.on("cell:contextmenu", ({ e, x, y, cell, view }) => {
        // TODO (Xufei) 需要重新设计 Token 不能被编辑的逻辑 Token.type == 2 的不能被编辑？
        // if (
        //   cell.getData().type == "Token" &&
        //   this.graph.getPredecessors(cell).length != 0
        // ) {
        //   this.$message({
        //     showClose: true,
        //     message: "The current node cannot be edited!",
        //     type: "warning",
        //   });
        //   return;
        // }
        this.nodeEditShow = false;
        this.SET_EDIT_CELLS(cell);
      });
      // 注册监听事件，当新增节点或边调用，实时存储
      this.graph.on("node:added", ({ cell, options }) => {
        this.STORAGE_GRAPH();
      });

      this.graph.on("cell:added", ({ cell, options }) => {
        this.STORAGE_GRAPH();
      });
      this.graph.on("cell:changed", ({ cell, options }) => {
        this.STORAGE_GRAPH();
      });
      this.graph.on("cell:removed", ({ cell, options }) => {
        this.STORAGE_GRAPH();
      });
      // 控制连接桩显示/隐藏
      const showPorts = (ports, show) => {
        for (let i = 0, len = ports.length; i < len; i = i + 1) {
          ports[i].style.visibility = show ? "visible" : "hidden";
        }
      };
      this.graph.on("node:mouseenter", () => {
        const container = document.getElementById("canvas-main");
        const ports = container.querySelectorAll(".x6-port-body");
        showPorts(ports, true);
      });
      this.graph.on("node:mouseleave", () => {
        const container = document.getElementById("canvas-main");
        const ports = container.querySelectorAll(".x6-port-body");
        showPorts(ports, false);
      });
      this.graph.on("cell:dblclick", ({ cell, e }) => {
          // const name = "node-editor";
          const name = cell.isEdge() ? "edge-editor" : "node-editor";
          if (cell.isNode()) {
            cell.removeTool(name);
            cell.addTools([
              {
                name,
                args: {
                  event: e,
                },
              },
            ]);
          } else {
            //cell.getLabels()[0].attrs.labelText.text='Mint';
            // var labels = cell.getLabels();
            // labels[0].attrs.labelText.text='Mint';
            // cell.setLables(labels);
            //alert(JSON.stringify(cell.getLabels()[0].attrs.labelText.text));
          }
      });
      this.graph.on("edge:dblclick", ({ edge, e }) => {
        // var labels = edge.getLabels()[0];
        // labels.attrs.labelText.text='Transfer';
        // // alert(JSON.stringify(labels));
        // edge.removeLabelAt(0);
        // edge.setLabelAt(0,labels);
        edge.addTools({
          name: "edge-editor",
          args: {
            event: e,
            labelAddable: false
          },
        });
      });
    },
    // 节点编辑面板
    closeNodeEdit() {
      this.nodeEditShow = true;
    },
    closeMintEdit() {
      this.centerDialogVisible = false;
    },
    loadGraphFromBack() {
      if (this.$route.query.nftId == null) {
        //导入已有节点信息
        this.LOAD_GRAPH();
        //进行一次聚焦
        this.POSITIONING_GRAPH();
        return;
      }

      connectMetamask(this.web3Provider).then((response) => {
        if (response.status) {
          this.SET_USER(response.account[0]);

          querymetadata(this.$route.query.nftId).then((metadata) => {
            if (metadata.message_code == this.statusCode.SUCCESSED) {
              console.log("SUCCESS query metadata from database: ", metadata.data.enckey);

              decryptDataEOA(metadata.data.enckey, this.user).then((decryptKey) => {
                console.log("decrypted key:", decryptKey);
                console.log("privURL:",metadata.data.privUrl);
                downloadFromIPFS(metadata.data.privUrl).then((secretData) => {
                  console.log("private data:", secretData);
                  let decrypted = decryptDataNormal(secretData, decryptKey);
                  let subSecretData = decrypted.split(",,,");

                  let params = subSecretData[1];
                  let result = subSecretData[2];

                  setStore("graph", subSecretData[0]);
                  params = JSON.parse(params);
                  this.MODIFY_CONFIGDATA([
                    params.configData.simulationDays,
                    params.configData.simulationSlot,
                  ]);
                  this.MODIFY_HISTORY_SIMULATE_DATA(JSON.parse(result));
                   
                  //导入已有节点信息
                  this.LOAD_GRAPH();
                  //进行一次聚焦
                  this.POSITIONING_GRAPH();
                });
              });

            } else {
              console.error("FAIL sync mint data to database");
            }
          });
        } else {
          this.$notify.error({
            title: "Error",
            message: "Identity verification failed!",
            position: "bottom-right",
          });
          this.$router.push({
            path: "/create",
          });
        }
      });
    },
  },
  mounted() {
    // 初始化面板
    this.initGrapg();
    // 初始化面板相关快捷键
    this.initShortcutkey();
    // 初始化左侧控件
    this.initStencil();

    //判断是否是由详情页跳转过来的
    this.loadGraphFromBack();
    //初始化相关监听事件
    this.initWatchEvent();
    this.LOAD_RULE_LISTS();
  },
  computed: {
    ...mapState([
      "configData",
      "graph",
      "uploadDialog",
      "editNode",
      "statusCode",
      "user",
      "historySimulateData",
      "getHistoryDataFromIndexDB",
      "markerArray",
      "indexList",
      "ruleLists",
      "ruleEditShow",
      "mintNodesId",
      "mintEdgesId",
    ]),
  },
  watch: {
    // uploadDialog(val) {
    //   this.uploadShow = val;
    // },
    // uploadShow(val) {
    //   if (!val) {
    //     this.CLOSE_UPLOAD_DIALOG();
    //   }
    // },
  },
};
</script>

<style lang="scss" scoped>

  .container {
    display: flex;
    flex-direction: column;
    height: 880px;
    margin: 20px;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 30px;
    width: 98%;
  }
  .model {
    display: flex;
    justify-content: space-evenly;
    flex-direction: row;
    align-items: center;
    border-radius: 30px;
    width: 100%;
    height: 90%;
    .left{
      width: 280px;
      height: 95%;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 30px;
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;

      .date {
        height: 45%;
        width: 280px;
        overflow: scroll;
        padding: 0;
      }
      .property {
        height: 45%;
        width: 280px;
        overflow: scroll;
        padding: 0;
      }
    }
    .right-container {
        padding: 0;
        width: 280px;
        height: 95%;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 30px;
        margin-left: 20px;
      }
    .draw {
      height: 95%;
      border-radius: 30px;
      display: flex;
      background-color: white; 
      overflow: scroll;
      align-items: stretch;
      justify-content: space-between;
      flex-grow: 1;
      margin-left: 20px;
      margin-right: 20px;
      /deep/ .x6-graph-scroller-pannable {
        flex:auto;
      }
      /deep/ .x6-graph-scroller {
        flex:auto;
      }
      #canvas-main {
        flex:auto;
      }
    }
    .right {
      width: 60px;
      height: 95%;
      margin-right: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      

      /deep/ .x6-widget-stencil-content {
          height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /deep/ .x6-widget-stencil-group-title {
          width: 0px;
          height: 0px;
        }
        /deep/ .x6-widget-stencil-content {
          border-radius: inherit;
          display: flex;
          top: auto;
          left:auto;
          right: auto;
          bottom: auto;
        }
        /deep/.x6-widget-stencil-title {
          border-radius: 20px;
          width: 0px;
          height: 0px;
        }
        /deep/ .x6-widget-stencil {
          border-radius: 20px;
          
          position: fixed;
          top: auto;
          left:auto;
          right: auto;
          bottom: auto;
        }
        /deep/ .x6-graph {
          display: flex;
        }

        /deep/ .x6-graph-svg {
          text-align: center;
          position: fixed;
          top: auto;
          left:auto;
          right: auto;
          bottom: auto;
        }

        .components{
          height: 53%;
        }
        .del{
          text-align: center;
          height: 5%;
          .el-icon-delete-solid{
            font-size: 25px;
            color: rgb(191, 153, 223);
          }
        }
    }
  }
  // 根据之前的设计 视窗阈值大概 990px 以下是高度变矮的调整代码
  // 经测试 小于 530 样式失效
  @media (min-height:530px)  and (max-height:550px){
    .container {
      height:440px;
    }
  }
  @media (min-height:550px)  and (max-height:570px){
    .container {
      height:460px;
    }
  }
  @media (min-height:570px)  and (max-height:590px){
    .container {
      height:480px;
    }
  }
  @media (min-height:590px)  and (max-height:610px){
    .container {
      height:500px;
    }
  }
  @media (min-height:610px)  and (max-height:630px){
    .container {
      height:520px;
    }
  }
  @media (min-height:630px)  and (max-height:650px){
    .container {
      height:540px;
    }
  }
  @media (min-height:650px)  and (max-height:670px){
    .container {
      height:560px;
    }
  }
  @media (min-height:670px)  and (max-height:690px){
    .container {
      height:580px;
    }
  }
  @media (min-height:690px)  and (max-height:710px){
    .container {
      height:600px;
    }
  }
  @media (min-height:710px)  and (max-height:730px){
    .container {
      height:620px;
    }
  }
  @media (min-height:730px)  and (max-height:750px){
    .container {
      height:640px;
    }
  }
  @media (min-height:750px)  and (max-height:770px){
    .container {
      height:660px;
    }
  }
  @media (min-height:770px)  and (max-height:790px){
    .container {
      height:680px;
    }
  }
  @media (min-height:790px)  and (max-height:810px){
    .container {
      height:700px;
    }
  }
  @media (min-height:810px)  and (max-height:830px){
    .container {
      height:720px;
    }
  }
  @media (min-height:830px)  and (max-height:850px){
    .container {
      height:740px;
    }
  }
  @media (min-height:850px)  and (max-height:870px){
    .container {
      height:760px;
    }
  }
  @media (min-height:870px)  and (max-height:890px){
    .container {
      height:780px;
    }
  }
  @media (min-height:890px)  and (max-height:910px){
    .container {
      height:800px;
    }
  }
  @media (min-height:910px)  and (max-height:930px){
    .container {
      height:820px;
    }
  }
  @media (min-height:930px)  and (max-height:950px){
    .container {
      height:840px;
    }
  }
  @media (min-height:950px)  and (max-height:970px){
    .container {
      height:860px;
    }
  }
  @media (min-height:970px)  and (max-height:990px){
    .container {
      height:880px;
    }
  }

  // 根据之前的设计 视窗阈值大概 990px 以下是高度变高的调整代码
  @media (min-height:990px)  and (max-height:1010px){
    .container {
      height:900px;
    }
  }
  @media (min-height:1010px)  and (max-height:1030px){
    .container {
      height:920px;
    }
  }
  @media (min-height:1030px)  and (max-height:1050px){
    .container {
      height:940px;
    }
  }
  @media (min-height:1050px)  and (max-height:1070px){
    .container {
      height:960px;
    }
  }
  @media (min-height:1070px)  and (max-height:1090px){
    .container {
      height:980px;
    }
  }
  @media (min-height:1090px)  and (max-height:1110px){
    .container {
      height:1000px;
    }
  }
  @media (min-height:1110px)  and (max-height:1130px){
    .container {
      height:1020px;
    }
  }
  @media (min-height:1130px)  and (max-height:1150px){
    .container {
      height:1040px;
    }
  }
  @media (min-height:1150px)  and (max-height:1170px){
    .container {
      height:1060px;
    }
  }
  @media (min-height:1170px)  and (max-height:1190px){
    .container {
      height:1080px;
    }
  }
  @media (min-height:1190px)  and (max-height:1210px){
    .container {
      height:1100px;
    }
  }
  @media (min-height:1210px)  and (max-height:1230px){
    .container {
      height:1120px;
    }
  }
  @media (min-height:1230px)  and (max-height:1250px){
    .container {
      height:1140px;
    }
  }
  @media (min-height:1250px)  and (max-height:1270px){
    .container {
      height:1160px;
    }
  }
  @media (min-height:1270px)  and (max-height:1290px){
    .container {
      height:1180px;
    }
  }
  @media (min-height:1270px)  and (max-height:1290px){
    .container {
      height:1200px;
    }
  }
  @media (min-height:1290px)  and (max-height:1310px){
    .container {
      height:1220px;
    }
  }
  @media (min-height:1310px)  and (max-height:1330px){
    .container {
      height:1240px;
    }
  }
  @media (min-height:1330px)  and (max-height:1350px){
    .container {
      height:1260px;
    }
  }
  @media (min-height:1350px)  and (max-height:1370px){
    .container {
      height:1280px;
    }
  }
  @media (min-height:1370px)  and (max-height:1390px){
    .container {
      height:1300px;
    }
  }
  @media (min-height:1390px){
    .container {
      height:1320px;
    }
  }
</style>