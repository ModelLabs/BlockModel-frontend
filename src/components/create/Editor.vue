<template>
  <div class="models">
    <div class="draw">
      <!-- 左侧控件 -->
      <div class="left-container">
        <div class="left" id="left"></div>

        <!-- Mint 按钮 -->
        <el-button
          type="text"
          class="mint-btn"
          @click="centerDialogVisible = true"
        >
          Mint
        </el-button>
        <el-dialog
          title="Mint New Model"
          :visible.sync="centerDialogVisible"
          width="30%"
          center
        >
          <MintForm :close="closeMintEdit" />
          <!-- <span slot="footer" class="dialog-footer">
            <el-button @click="centerDialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="centerDialogVisible = false">Confirm</el-button>
          </span> -->
        </el-dialog>
        <div class="rule-list">
          <RuleList />
        </div>
      </div>
      <div class="draw-main-box">
        <!-- 面板中心区域 -->
        <div class="editor-section">
          <div id="canvas-main" class="canvas-main"></div>
        </div>
      </div>
      <!-- 工具导航栏 -->
      <!-- <div class="tools-navbar">
        <div class="tools-navbar" id="tools-navbar">
          <ToolsNavbar />
        </div>
      </div> -->
      <!-- 右侧控件 -->
      <div class="right-default">
        <ToolsNavbar />
      </div>
      <transition name="el-fade-in-linear">
        <div class="right-container" v-bind:class="{ show: nodeEditShow }">
          <NodeEdit :closeNodeEdit="closeNodeEdit" />
        </div>
      </transition>
    </div>
    <!-- 数据可视化面板 -->
    <div class="data-visual-panel">
      <el-button class="visual-button" @click="openDataVisualization">
        Data  Visualization
      </el-button>
    </div>
    <el-dialog
      title="Modeling data visualization"
      :visible.sync="visualPanelVisible"
      :modal-append-to-body='false'
      class="data-dialog"
      width="1200px"
    >
    <VisualPanel />
    </el-dialog>
  </div>
</template>

<script>
import VisualPanel from "./VisualPanel";
import ModelUpload from "./ModelUpload";
import NodeEdit from "./NodeEdit";
import ToolsNavbar from "./RightToolsNavbar";
import MintForm from "../Template/MintForm";
import RuleList from "../create/RuleList";
import { Addon, Graph, Shape } from "@antv/x6";
import { Vertices } from '@antv/x6/es/registry/tool/vertices'
const { Stencil } = Addon;
const { Rect, Circle, Polygon,} = Shape;
// 导入链接桩配置
import { PortsConfig } from "../../graph/portsConfig";
import { mapState, mapMutations } from "vuex";
import { querymodel } from "../../api/index";
import { setStore } from "../../utils/storage";
import { connectMetamask } from "../../api/web3/contracts";
import { downloadFromIPFS } from "../../utils/ipfsUtil";
import { querymetadata } from "../../api/index";
import { decryptDataEOA, decryptDataNormal } from "../../utils/cryptoUtil";
import { log } from '@antv/g2plot/lib/utils';
import { round } from '@antv/x6/lib/geometry/util';

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
      visualPanelVisible: false,
      // uploadShow: false,
      centerDialogVisible: false,
    };
  },
  components: {
    VisualPanel,
    ModelUpload,
    NodeEdit,
    ToolsNavbar,
    MintForm,
    RuleList,
  },
  methods: {
    ...mapMutations([
      "STORAGE_GRAPH",
      "LOAD_GRAPH",
      "POSITIONING_GRAPH",
      "INIT_GRAPH",
      "CLOSE_UPLOAD_DIALOG",
      "SET_EDIT_CELLS",
      "MODIFY_HISTORY_SIMULATE_DATA",
      "MODIFY_CONFIGDATA",
      "SET_USER",
      "LOAD_RULE_LISTS",
      "CLEAR_HISTORY_SIMULATE_DATA",
      "UPDATE_HISTORY_DATA_FROM_INDEXDB",
      "SET_MARKER_ARRAY",
    ]),
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
        console.log("indexdb:", data);
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
    async openDataVisualization(){
      // 每次打开可视化面板的时候 传一份 indexDB 里的历史测算数据
      this.showHistoryDataOfIndexDB();
      // 每次打开可视化面板的时候 传一份 indexDB 里的 Property 检查结果
      await this.showMarkerOfIndexDB();
      this.visualPanelVisible = true;
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
                  targetMarker: {
                    name: "block",
                    width: 6,
                    height: 8,
                    // fill: "#ccc", // 使用自定义填充色
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
                edgeData: [],
                type: "Edge"
              },
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

        //collapsable: true,
        stencilGraphWidth: 200,
        stencilGraphHeight: 180,
        groups: [
          {
            name: "Components",
            collapsable:false
          },
        ],
      });

      document.getElementById("left").appendChild(this.stencil.container);
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
        width: 70,
        height: 60,
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
            tokens: [],
            modules: []
          },
          type: "pool"
        },
      });

      const genesis = new Circle({
        width: 35,
        height: 35,
        data: {
          nodeData: {
            token: "",
            maxsupply:0,
          },
          type: "genesis"
        },
        attrs: {
          circle: {
            fill: "#73d13d",
            strokeWidth: 0,
            stroke: "#409EFF",
          },
          text: { text: "*", fill: "#fff" },
        },
        ports: PortsConfig,
      });

      const stakeholder = new Circle({
        width: 60,
        height: 60,
        data: {
          nodeData: [],
          type: "stakeholder"
        },
        attrs: {
          circle: {
            fill: "rgb(255, 213, 145)",
            strokeWidth: 0,
            stroke: "#409EFF",
          },
          text: { text: "^_^", fill: "#fff" },
        },
        ports: PortsConfig,
      });

      const blackhole = new Circle({
        width: 35,
        height: 35,
        data: {
          nodeData: {
            token: "",
            burn:0,
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
      this.stencil.load(
        [pool.clone(), genesis.clone(), stakeholder.clone(), blackhole.clone()],
        "Components"
      );
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
      "graph",
      "uploadDialog",
      "editNode",
      "statusCode",
      "user",
      "historySimulateData",
      "getHistoryDataFromIndexDB",
      "markerArray"
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
.models {
  .draw {
    .left-container {
      width: 200px;
      height: 100%;
      .left {
        position: fixed;
        top: 120px;
        width: 200px;
        height: 220px;
        left: 60px;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        border-radius: 20px;
        text-align: center;

        /deep/ .x6-widget-stencil-content {
          background-color: rgba(194, 193, 247, 0.7);
        }
        /deep/ .x6-widget-stencil-group-title {
          background-color: rgba(174, 172, 240, 0);
          color: rgb(243, 244, 226);
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.2ch;
        }
        /deep/ .x6-widget-stencil-content {
          border-radius: inherit;
        }
        /deep/.x6-widget-stencil-title {
          border-radius: 20px;
          background-color: rgba(174, 172, 240, 0);
          
        }
        /deep/ .x6-widget-stencil {
          border-radius: 20px;
          background-color: rgba(174, 172, 240, 0.7);
        }
      }

      .mint-btn {
        background: -webkit-linear-gradient(left, rgba(149, 119, 204, 0.81), rgba(226, 160, 247, 0.73));
        border: #858585 !important;
        color: rgb(243, 244, 226);
        position: fixed;
        top: 450px;
        width: 200px;
        height: 40px;
        left: 60px;
        font-weight: 600;
        font-size: 15px;
        letter-spacing: 0.2ch;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        border-radius: 20px;
      }

      .rule-list {
        position: fixed;
        top: 520px;
        left: 60px;
        border-radius: 20px;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        height: calc(100% - 580px);
      }
    }

    .draw-main-box {
      position: fixed;
      left: 250px;
      width: calc(100% - 250px);
      height: 100%;

      .editor-section {
        display: flex;
        // overflow: scroll;
        margin-top: 40px;
        margin-left: 60px;
        left: 250px;
        width: calc(100% - 480px);
        height: calc(100% - 180px);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        border-radius: 30px;

        /deep/ .x6-graph-scroller {
          border-radius: 30px;
        }

        /deep/ .x6-graph-scroller-pannable {
          border-radius: 30px;
        }

        .canvas-main {
          flex: 1;
        }
      }
    }
    .right-default {
      /* position: fixed;
      height: calc(100% - 180px);
      width: 280px;
      top: 120px;
      right: 3%;
      background-color: #ffffff;
      overflow: scroll;
      border-radius: 30px;
      border: 1px solid rgb(232, 231, 231);
      box-shadow: 0 0 3px rgba(180, 180, 180, 0.8);  */

      .config-data-input {
        width: 200px;
        margin-left: 15px;
        margin-top: 20px;
      }
      .day-slider {
        margin-left: 15px;
        margin-bottom: 20px;
        width: 250px;
        /deep/ .el-slider__bar {
          background-color: rgb(94, 91, 91);
        }
        /deep/ .el-slider__button {
          border: 2px solid rgb(94, 91, 91);
          transition: 0s;
        }
      }
      .timer {
        float: left;

        // margin: 7px 0px 0px 15px;

        width: 20px;
      }
    }
    .right-container {
      width: 300px;
      position: fixed;
      top: 50px;
      right: 0px;
      height: 82.5%;
    }
  }
  .data-visual-panel {
    position: fixed;
    bottom: 20px;
    left: 20px;
    .visual-button {
      background: -webkit-linear-gradient(left, rgba(137, 225, 242, 0.61), rgba(101, 109, 216, 0.43));
      border: #858585 !important;
      color: rgb(243, 244, 226);
      //text-align: center;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.2ch;
      position: fixed;
      top: 380px;
      width: 200px;
      height: 40px;
      left: 60px;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
      border-radius: 20px;
      // z-index: -2;
    }
  }
  .data-dialog {
    position: relative;
    top: -130px;
  }
  .show {
    visibility: hidden;
  }
  .visual-dialog {
    font-size: 20px;
  }
  @keyframes shake {
    from {
      transform: rotate(0deg);
    }
    4% {
      transform: rotate(5deg);
    }
    12.5% {
      transform: rotate(-5deg);
    }
    21% {
      transform: rotate(5deg);
    }
    29% {
      transform: rotate(-5deg);
    }
    37.5% {
      transform: rotate(5deg);
    }
    46% {
      transform: rotate(-5deg);
    }
    50%,
    to {
      transform: rotate(0deg);
    }
  }
}
</style>