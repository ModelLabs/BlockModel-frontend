<template>
    <div class="bottom-container">
        <div class="btn">
            <div class="left-btn">
                <el-tooltip class="item" effect="light" content="Zoom In" placement="top">
                    <el-button class="btn-general small-btn small-btn-left" @click="ZOOM_GRAPH('down')" icon="el-icon-zoom-out"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="Zoom Out" placement="top">
                    <el-button class="btn-general small-btn small-btn-left" @click="ZOOM_GRAPH('up')" icon="el-icon-zoom-in"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="Undo" placement="top">
                    <el-button class="btn-general small-btn small-btn-left" @click="UNDO_GRAPH()" icon="el-icon-back"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="Redo" placement="top">
                    <el-button class="btn-general small-btn small-btn-left" @click="REDO_GRAPH()" icon="el-icon-right"></el-button>
                </el-tooltip>
            </div>

            <div class="middle-btn">
                <el-tooltip class="item" effect="light" content="Visualization" placement="top">
                    <el-button class="view-btn btn-general medium-btn" @click="openDataVisualization()" icon="el-icon-view"></el-button>
                </el-tooltip>
                 <el-tooltip class="item" effect="light" content="Start Simulation" placement="top">
                    <el-button class="start-btn btn-general">
                        <i v-if="start" @click="startSimulation()" class="el-icon-video-play"></i>
                        <i v-else class="el-icon-loading"></i>
                    </el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="Pause Simulation" placement="top">
                    <el-button class="start-btn btn-general" @click="pauseSimulation()" icon="el-icon-video-pause"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="End Simulation" placement="top">
                    <el-button class="restart-btn btn-general medium-btn" @click="endSimulation()" icon="el-icon-refresh"></el-button>
                </el-tooltip>
            </div>

            <div class="right-btn">
                <el-tooltip class="item" effect="light" content="Center Positioning" placement="top">
                    <el-button class="btn-general small-btn small-btn-left" @click="POSITIONING_GRAPH()" icon="el-icon-full-screen"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="Delete" placement="top">
                    <el-button class="btn-general small-btn small-btn-right" @click="REMOVE_CELLS()" icon="el-icon-delete"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="Save Graph To PNG" placement="top">
                    <el-button class="btn-general small-btn small-btn-right" @click="saveGraphToPNG()" icon="el-icon-camera"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="light" content="Other Useful Functions are Coming Soon" placement="top">
                    <el-button class="btn-general small-btn small-btn-right" icon="el-icon-more"></el-button>
                </el-tooltip>

            <!-- <el-button class="btn-general small-btn small-btn-right" icon="el-icon-time"></el-button> -->
            <!-- <el-button class="btn-general small-btn small-btn-right" @click="openMintWindow()" icon="el-icon-box"></el-button> -->
            </div>
      </div>

      <div class="cur-day">Current Day:<span v-text="getModelTime()"></span></div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { setStore } from "../../utils/storage";
import { Model } from "../../graph/model";
import { Sleep } from "../../utils/sleep";
export default {
    data() {
        return {
            curDay:0,
            start:true,
            loading:false,
        };
    },
    methods: {
        ...mapMutations([
            "POSITIONING_GRAPH", // 画布节点居中定位
            "ZOOM_GRAPH", //画布放大缩小
            "UNDO_GRAPH", // 撤回
            "REDO_GRAPH", // 重做
            "REMOVE_CELLS", // 垃圾箱 （待定 可能删除）
            "CLEAR_INDEX_LIST", // 更新 indexList 中的测算 Id 用到的方法
            "ADD_INDEX", // 更新 indexList 中的测算 Id 用到的方法
            "VISUAL_PANEL_VISIBLE", //修改可视化面板可见性
            "MINT_PANEL_VISIBLE", //修改 Mint 面板可见性
            // 测算方法：
            "SET_MODEL",
            "APPEND_HISTORY_SIMULATE_DATA",
            "SET_HISTORY_SIMULATE_DATA",

            "CLEAR_MINT_NODES",
            "CLEAR_MINT_EDGES",
            "CLEAR_SELECT_NODES_DATA",
            "CLEAR_SELECT_VISUAL_DATA",
            "CLEAR_SELECT_PROPERTY_DATA",
            "ADD_MINT_NODES",
            "ADD_MINT_EDGES",
            "ADD_SELECT_NODES_DATA",
            "ADD_SELECT_VISUAL_DATA",
            "ADD_SELECT_PROPERTY_DATA",
            "CHANGE_SIMULATING",
        ]),
        /**
        下载当前模型为json文件
        */
        downloadGraph() {
        //获取时间戳
        var timestamp = new Date().valueOf();
        //将全局配置信息和画布数据封装成对象
        let modelData = {
            model: { configData: this.configData, graph: this.graph },
        };
        const filename = "Model" + timestamp + ".json";
        const data = JSON.stringify(modelData, undefined, 4);
        let blob = new Blob([data], { type: "text/json" }),
            a = document.createElement("a");
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        // 标签 data- 嵌入自定义属性  屏蔽后也可正常下载
        a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
        // 添加鼠标事件
        let event = new MouseEvent("click", {});
        // 向一个指定的事件目标派发一个事件
        a.dispatchEvent(event);
        },
        /**
         从 indexdb 中取数据
        */
        async getDataFromIndexDB(DBname,key,index){
            return await this.$indexedDB.fullValueSearch(DBname,key,index);
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
         打开可视化面板
        */
        async openDataVisualization(){
            this.VISUAL_PANEL_VISIBLE(true);
            //this.visualPanelVisible = true;
            // for v2: 每次打开的时候传入 id 列表
            // 更新 测算 ID 以供 可视化面板选择
            await this.prepareIdList();
        },
        /**
         更新 indexdb 中的历史测算数据
        */
        async updateHistorySimulateDataInIndexDB(){
            // 从每个节点的数据表中取数据
            let tmpGenesis = await this.$indexedDB.getAll("genesisHistoryData");
            let tmpBalckhole = await this.$indexedDB.getAll("blackholeHistoryData");
            let tmpPool = await this.$indexedDB.getAll("poolHistoryData");
            let tmpStakeholder = await this.$indexedDB.getAll("stakeholderHistoryData");
            let tmpEdge = await this.$indexedDB.getAll("edgeHistoryData");
            
            // 拼成目标数据结构
            let genesis = new Map();
            let blackhole = new Map();
            let pool = new Map();
            let stakeholder = new Map();
            let edge = new Map();
            let tmpData = [];

            // genesis
            for(let i=0;i<tmpGenesis.srcElement.result.length;i++){
                if(genesis.has(tmpGenesis.srcElement.result[i].label + "|" + tmpGenesis.srcElement.result[i].uid.substring(0,4)))
                tmpData = genesis.get(tmpGenesis.srcElement.result[i].label + "|" + tmpGenesis.srcElement.result[i].uid.substring(0,4));           
                else tmpData = [];
                for(let k = 0;k<Array.from(tmpGenesis.srcElement.result[i].data.keys()).length;k++){
                tmpData.push({
                    day:tmpGenesis.srcElement.result[i].day.toString(),
                    token:Array.from(tmpGenesis.srcElement.result[i].data.keys())[k],
                    remainAmount:Array.from(tmpGenesis.srcElement.result[i].data.values())[k]
                });
                }
                genesis.set(tmpGenesis.srcElement.result[i].label + "|" + tmpGenesis.srcElement.result[i].uid.substring(0,4),tmpData); 
            }
            // blackhole
            for(let i=0;i<tmpBalckhole.srcElement.result.length;i++){
                if(blackhole.has(tmpBalckhole.srcElement.result[i].label + "|" + tmpBalckhole.srcElement.result[i].uid.substring(0,4)))
                tmpData = blackhole.get(tmpBalckhole.srcElement.result[i].label + "|" + tmpBalckhole.srcElement.result[i].uid.substring(0,4));           
                else tmpData = []

                tmpData.push({
                    day:tmpBalckhole.srcElement.result[i].day,
                    token:Array.from(tmpBalckhole.srcElement.result[i].data.keys())[0],
                    totalBurnAmount:Array.from(tmpBalckhole.srcElement.result[i].data.values())[0]
                });
                blackhole.set(tmpBalckhole.srcElement.result[i].label + "|" + tmpBalckhole.srcElement.result[i].uid.substring(0,4),tmpData); 
            }
            // pool
            for(let i=0;i<tmpPool.srcElement.result.length;i++){
                if(pool.has(tmpPool.srcElement.result[i].label + "|" + tmpPool.srcElement.result[i].uid.substring(0,4)))
                tmpData = pool.get(tmpPool.srcElement.result[i].label + "|" + tmpPool.srcElement.result[i].uid.substring(0,4));           
                else tmpData = []

                let keys = Array.from(tmpPool.srcElement.result[i].data.tokenData.keys());
                for(let j=0;j<keys.length;j++){
                tmpData.push({
                    day:tmpPool.srcElement.result[i].day,
                    token:keys[j],
                    totalAmount:tmpPool.srcElement.result[i].data.tokenData.get(keys[j])
                });
                pool.set(tmpPool.srcElement.result[i].label + "|" + tmpPool.srcElement.result[i].uid.substring(0,4),tmpData); 
                }
                
            }
            // stakeholder
            for(let i=0;i<tmpStakeholder.srcElement.result.length;i++){
                if(stakeholder.has(tmpStakeholder.srcElement.result[i].label + "|" + tmpStakeholder.srcElement.result[i].uid.substring(0,4)))
                tmpData = stakeholder.get(tmpStakeholder.srcElement.result[i].label + "|" + tmpStakeholder.srcElement.result[i].uid.substring(0,4));           
                else tmpData = []

                let keys = Array.from(tmpStakeholder.srcElement.result[i].data.keys());
                for(let j=0;j<keys.length;j++){
                tmpData.push({
                    day:tmpStakeholder.srcElement.result[i].day,
                    token:keys[j],
                    freeMoney:tmpStakeholder.srcElement.result[i].data.get(keys[j])
                });
                stakeholder.set(tmpStakeholder.srcElement.result[i].label + "|" + tmpStakeholder.srcElement.result[i].uid.substring(0,4),tmpData); 
                }
            }
            //edge
            for(let i=0;i<tmpEdge.srcElement.result.length;i++){
                // 先判断有没有这个 id
                if(edge.has(tmpEdge.srcElement.result[i].id)){
                let tmpEdgeData = edge.get(tmpEdge.srcElement.result[i].id);
                // console.log("tmpEdgeData",tmpEdgeData);
                // 再判断有没有这一天
                if(tmpEdgeData.has(tmpEdge.srcElement.result[i].day)){
                    let tmpMap = tmpEdgeData.get(tmpEdge.srcElement.result[i].day);
                    // console.log("tmpMap",tmpMap);
                    // 如果这天这个token存过了，累加
                    if(tmpMap.has(tmpEdge.srcElement.result[i].token))
                    tmpMap.set(tmpEdge.srcElement.result[i].token,tmpMap.get(tmpEdge.srcElement.result[i].token) + tmpEdge.srcElement.result[i].transferAmount);
                    // 否则直接存
                    else tmpMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);
                    tmpEdgeData.set(tmpEdge.srcElement.result[i].day,tmpMap);
                    edge.set(tmpEdge.srcElement.result[i].id,tmpEdgeData);
                }
                else {
                    let tmpMap = new Map();
                    tmpMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);
                    tmpEdgeData.set(tmpEdge.srcElement.result[i].day,tmpMap);
                    edge.set(tmpEdge.srcElement.result[i].id,tmpEdgeData);
                }
                }
                else {
                let emptyTokenMap = new Map();
                let emptyDayMap = new Map();
                emptyTokenMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);
                emptyDayMap.set(tmpEdge.srcElement.result[i].day,emptyTokenMap);
                edge.set(tmpEdge.srcElement.result[i].id,emptyDayMap);
                }
                //console.log("tmpEdge1",tmpEdge.srcElement.result[i])
                //for(let j=0;j<tmpEdge.srcElement.result[i].length;j++){
                //console.log("tmpEdge2",tmpEdge.srcElement.result[i][j].day)
                // if(edge.has(tmpEdge.srcElement.result[i].day)){
                //   let tmpMap = edge.get(tmpEdge.srcElement.result[i].day);
                //   //console.log("tmpMap",tmpMap)
                //   if(tmpMap.has(tmpEdge.srcElement.result[i].token))
                //     tmpMap.set(tmpEdge.srcElement.result[i].token,tmpMap.get(tmpEdge.srcElement.result[i].token) + tmpEdge.srcElement.result[i].transferAmount);
                //   else tmpMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);

                //   edge.set(tmpEdge.srcElement.result[i].day,tmpMap);
                // }
                // else {
                //   let tmpMap = new Map();
                //   tmpMap.set(tmpEdge.srcElement.result[i].token,tmpEdge.srcElement.result[i].transferAmount);
                //   edge.set(tmpEdge.srcElement.result[i].day,tmpMap);
                // }
            }

            console.log("data-reorg finish");
            let tmpObj = new Map();
            let obj = new Map();
            let id = 0;
            tmpObj.set("genesis",genesis);
            tmpObj.set("pool",pool);
            tmpObj.set("blackhole",blackhole);
            tmpObj.set("stakeholder",stakeholder);
            tmpObj.set("edge",edge);

            let tmp = await this.$indexedDB.getAll("historySimulationData");
            //if (tmp.srcElement.result.length) id = tmp.srcElement.result.length;
            if (tmp.srcElement.result.length) id = tmp.srcElement.result[tmp.srcElement.result.length-1].get("simulateId") + 1;

            obj.set("simulateId",id);
            obj.set("data",tmpObj);
            await this.$indexedDB.addData("historySimulationData", obj);

            await this.prepareIdList();
        },
        /**
         更新 indexdb 中的历史模型数据
        */
        async updateHistoryModelData(){
            // 取数据
            let tmpModelData = await this.$indexedDB.getAll("modelData");
            let tmp = await this.$indexedDB.getAll("historyModelData");

            let obj = new Map();
            let id = 0;
            //if (tmp.srcElement.result.length) id = tmp.srcElement.result.length;
            if (tmp.srcElement.result.length) id = tmp.srcElement.result[tmp.srcElement.result.length-1].get("simulateId") + 1;
            
            for(let i=0;i<tmpModelData.srcElement.result.length;i++){
                obj.set("simulateId",id);
                obj.set("graph",tmpModelData.srcElement.result[i].graph);
            }
            await this.$indexedDB.addData("historyModelData", obj);
        },
        /**
         * 获取模型测算进行中的时间
         */
        getModelTime() {
            if (this.model == null) return 0;
            return this.model.curDay;
        },
        /** 
         开始测算
        */
        async startSimulation() {
            // 测算开始，开启 loading 图标
            this.start = false;
            this.CHANGE_SIMULATING(true);
            await Sleep(1);
            // 正常测算结束后，restart前重置model实例
            if(this.model != null){
                // 将当前模型置为 null
                if(this.model.status == 1){
                this.SET_MODEL(null);
                }
                // 重置 indexDB 数据库
                this.$indexedDB.clearDB('blackholeHistoryData');
                this.$indexedDB.clearDB('genesisHistoryData');
                this.$indexedDB.clearDB('stakeholderHistoryData');
                this.$indexedDB.clearDB('poolHistoryData');
                this.$indexedDB.clearDB('edgeHistoryData');
                this.$indexedDB.clearDB('modelData');
            }
            
            // 取当前所有 Property
            let currentRuleList = []
            if (this.ruleLists.length) {
                for(let r=0;r<this.ruleLists.length;r++){
                // Set RuleList Status === False
                this.ruleLists[r].status = false;

                // Get all rule content
                currentRuleList.push(this.ruleLists[r].content)
                }
                setStore("rule_lists", this.ruleLists);
            }

            // 模型初次测算时
            if (this.model == null) {
                console.log(
                "starting simulation...",
                this.configData.simulationDays,
                "days",
                " with control slot:",
                this.configData.simulationSlot,
                "days"
                );
                var model = new Model(
                    this.graph,
                    this.configData,
                    this.$indexedDB,
                );

                this.SET_MODEL(model);

                this.APPEND_HISTORY_SIMULATE_DATA({
                type: this.currentIndex,
                data: this.model.data,
                });

            } else {
                // TODO [Done] 模型已经存在时，其相关参数需要根据画布上的最新状态来更新
                this.model.dataUpdate(
                    this.graph,
                    this.configData.simulationDays,
                    this.configData.simulationSlot
                );
            }
            // 设置 model 的状态为 1 - 正在测算中
            this.model.status = 1;
            await this.model.start();

            // 测算终止（正常终止 / 暂停终止）时更新测算历史数据
            this.SET_HISTORY_SIMULATE_DATA(this.nocne, this.model.data);

            if (this.model.status != 2) {
                // 当模型处于非 Pause 状态时
                console.log("the simulation is ended");

                // 存历史测算数据到总的表
                await this.updateHistorySimulateDataInIndexDB();

                // 存历史模型到总的表
                await this.updateHistoryModelData();

                // this.CHANGE_SIMULATING(false);
            }

            //  测算终止（正常终止 / 暂停终止），关闭 loading 图标
            this.start = true;
            this.CHANGE_SIMULATING(false);
        },
        /** 
        暂停测算
        */
        pauseSimulation() {
        // TODO 处于暂停状态中，画布上的某些不可改的参数应该置为灰色或不可选(不可新建、删除节点；不可更改的参数如)

        // 测算暂停，关闭 loading 图标
        this.start = true;

        console.log("pausing simulation...");
        if (this.model == null) {
            console.log("there's no model running!");
        } else {
            // 修改模型的状态为 2 - 暂停
            this.model.status = 2;
            console.log(
                "The model is paused. ",
                "You can only adjust params on existing model. ",
                "If you need to adjust the architecture of model, please END current simulation first."
            );
        }
        },
        /**
        结束当前测算
        */
        endSimulation() {
            // 测算暂停，关闭 loading 图标
            this.start = true;
            console.log("ending simulation...");
            // 修改模型的状态为 0 - 停止
            this.model.status = 0;
            // 将当前模型置为 null
            this.SET_MODEL(null);
            // 重置 indexDB 数据库
            this.$indexedDB.clearDB('blackholeHistoryData');
            this.$indexedDB.clearDB('genesisHistoryData');
            this.$indexedDB.clearDB('stakeholderHistoryData');
            this.$indexedDB.clearDB('poolHistoryData');
            this.$indexedDB.clearDB('edgeHistoryData');
            this.$indexedDB.clearDB('modelData');
            console.log("the simulation is ended");
            // 当前测算结束后，将记录历史数据次数的 nonce 值增加 1
            //this.SET_NONCE(this.nonce + 1);
        },
        //ADD_MINT_NODES,ADD_MINT_EDGES,ADD_SELECT_NODES_DATA,ADD_SELECT_VISUAL_DATA,ADD_SELECT_PROPERTY_DATA,
        async openMintWindow(){
            this.MINT_PANEL_VISIBLE(true);
            //this.centerDialogVisible = true;
            // 清空存放数据的数组
            this.CLEAR_MINT_NODES();
            this.CLEAR_MINT_EDGES();
            this.CLEAR_SELECT_NODES_DATA();
            this.CLEAR_SELECT_VISUAL_DATA();
            this.CLEAR_SELECT_PROPERTY_DATA();
            // this.mintNodes = [];
            // this.mintEdges = [];
            // this.selectNodeData = [];
            // this.selectVisualData = [];
            // this.selectProperties = [];
            let children1 = [];
            let children2 = [];
      
            let nodes = this.graph.model.getNodes();
            nodes.forEach(element => {
                // 准备 step1 的 nodes data
                //this.mintNodes.push({
                this.ADD_MINT_NODES({
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
                        //this.selectNodeData.push({
                        this.ADD_SELECT_NODES_DATA({
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

                        //this.selectNodeData.push({
                        this.ADD_SELECT_NODES_DATA({
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
                        for(let j=0;j<element.getData().nodeData.modules.moduleNames.length;j++){ 
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
                        this.ADD_SELECT_NODES_DATA({
                        //this.selectNodeData.push({
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
                        this.ADD_SELECT_NODES_DATA({
                        //this.selectNodeData.push({
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
                this.ADD_MINT_EDGES({
                //this.mintEdges.push({
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
                this.ADD_SELECT_NODES_DATA({
                //this.selectNodeData.push({
                    value:element.id,
                    label:edgeLabel,
                    children:children1
                })
                children1 = [];
            });
      
            // 准备 step3 的 Visual Data
            // 准备 indexList
            let tmp = await this.$indexedDB.getAll("historyModelData");
            //let tmp = await this.getDataFromIndexDB("historyModelData","id",0);
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
                this.ADD_SELECT_VISUAL_DATA({
                //this.selectVisualData.push({
                    value:m,
                    label:m,
                    children:children1
                })
                children1 = [];
            }
            for(let r=0;r<this.ruleLists.length;r++){
                this.ADD_SELECT_PROPERTY_DATA({
                //this.selectProperties.push({
                    value:this.ruleLists[r].id,
                    label:this.ruleLists[r].label + "-" + this.ruleLists[r].content
                })
            }
        },
    },
    computed: {
        ...mapState([
            "configData",
            "ruleLists",
            "graph",
            "model",
            "indexList",
        ]),
    },
}
</script>


<style lang="scss" scoped>
    .bottom-container {
        width: 100%;
        height: 70px;
        border-radius: 30px;
        margin-top: 5px;
        margin-bottom: 20px;
        display: flex;
        justify-content: center;

        .btn{
            display: flex;
            justify-content: space-around;
            .btn-general {
                color: #fff;
                border: 1px solid #fff;
                box-shadow:0 0 20px #fff;
                padding: 0;
            }
            .small-btn {
                width: 40px;
                height: 40px;
                border-radius: 40px;
                font-size: 25px;
            }
            .small-btn-left {
                background: -webkit-linear-gradient(right,rgba(103, 134, 236, 0.67), rgba(255, 255, 255, 0.5));
            }

            .small-btn-right {
                background: -webkit-linear-gradient(left,rgba(105, 156, 244, 0.67), rgba(255, 255, 255, 0.5));
            }

            .left-btn {
                margin-left: 220px;
                height: 70px;
                display: flex;
                justify-content: space-around;
                align-items: center;
            }

            .middle-btn {
                margin-right: 13px;
                margin-left: 13px;
                height: 70px;
                display: flex;
                justify-content: space-around;
                align-items: center;
                

                .start-btn {
                width: 60px;
                height: 60px;
                background: -webkit-linear-gradient(left,rgba(129, 207, 243, 0.66), rgba(168, 92, 219, 0.59));
                border: 1px solid #fff;
                box-shadow:0 0 20px #fff;
                border-radius: 20px;
                font-size: 45px;
                }
                .view-btn {
                background: -webkit-linear-gradient(right,rgba(131, 206, 241, 0.66), rgba(103, 134, 236, 0.67));
                }

                .restart-btn {
                background: -webkit-linear-gradient(right,rgba(104, 159, 253, 0.45), rgba(189, 103, 236, 0.59));
                }

                .medium-btn {
                width: 50px;
                height: 50px;
                border-radius: 50px;
                font-size: 30px;
                }
            }

            .right-btn {
                height: 70px;
                display: flex;
                justify-content: space-around;
                align-items: center;
            }
        }

        .cur-day {
            align-items: center;
            display: flex;
            padding-left: 100px;
        }
    }
</style>