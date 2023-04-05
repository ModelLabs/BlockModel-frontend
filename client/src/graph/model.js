import { Pool } from "./pool";
import { Edge } from "./edge";
import { Genesis } from "./genesis";
import { Stakeholder } from "./stakeholder";
import { Blackhole } from "./blackhole";
import { Sleep } from "./../utils/sleep";

//#region
// var isPaused = false;
// self.addEventListener('message', function (e) {
//     // console.log("thread message:", e);
//     var data = e.data;
//     switch (data) {
//       case 'pause':
//         console.log("---------------worker paused");
//         isPaused = true;
//         break;
//       default:
//         // self.postMessage('Unknown command: ' + data.msg);
//     };
//   }, false);
//#endregion

export class Model {

    constructor(graph, configData, indexDB) {
        this.graph = graph;
        // endDay: 模型的测算终止时间
        this.endDay = Number(configData.simulationDays);
        // slot: 模型测算的停顿窗口，每隔这一段时间模型测算过程会停顿 5s，方便操作者进行下一步的调整
        this.slot = Number(configData.simulationSlot);
        // globalVars: 模型的全局变量
        this.globalVars = configData.globalVars;
        // indexDB: 前端数据库 handler，可以在模型运行过程中把相关数据保存到 indexDB 中
        this.indexDB = indexDB;
        // status: 模型处于哪个状态中 0 - off, 1 - on, 2 - pause
        this.status = Number(1);
        // curDay: 模型测算的当前时间
        this.curDay = Number(0);
        // antvNodes 保存的是原始 antv 定义的节点对象
        
        // nodesInstance 保存所有节点对象数据 <key: tokenID, value: nodeClassInstance>
        this.nodesInstance = new Map();
        // edgeInstance 保存所有节点对象数据 <key: edgeID, value: edgeClassInstance>
        this.edgeInstance = new Map();
        // action 内包含 stakeLabelIDMap, unstakeLabelIDMap, vestLabelIDMap
        // this.action = new Action();

        // poolLabelIDMap <key: nodeLabel, value: nodeID>
        this.poolLabelIDMap = new Map();
        this.genesisLabelIDMap = new Map();
        this.stakeholderLabelIDMap = new Map();
        this.blackholeLabelIDMap = new Map();
        // EdgeMap <key: sourceID, value: <key: targetID, value: EdgeClassInstance> >
        this.edgeMap = new Map();
        this.edgeActive = new Map();
        this.edgeNonActive = new Map();
        // data: 测算模型测算过程中产生的数据
        this.data = [];

        this.initData();

        // TODO 是否应该把保存 modelData 的操作放在这里？
        let obj = {version: 1, uid: 1, graph: JSON.parse(localStorage.getItem("graph")), property: {}, env: {endDay: this.endDay, slot: this.slot}};
        this.indexDB.addData("modelData", obj);

        // TODO: 是否还需要 sheduler? 每天都把所有节点和边计算一遍，后续也许可以把 scheduler 开放给用户进行设定？
        // this.scheduler = new Scheduler(this.edgeMap);
        
        //#region
        // this.data: [
        //     {
        //         type: "Token2",
        //         data: [
        //             {
        //                 type: "Team",
        //                 data: [
        //                     { time: 0, value: 60 },
        //                     { time: 1, value: 80 },
        //                     { time: 2, value: 90 },
        //                     { time: 3, value: 80 },
        //                     { time: 4, value: 90 },
        //                     { time: 5, value: 110 },
        //                     { time: 6, value: 120 },
        //                     { time: 7, value: 140 },
        //                 ]
        //             },
        //             {
        //                 type: "Community",
        //                 data: [
        //                     { time: 0, value: 50 },
        //                     { time: 1, value: 90 },
        //                     { time: 2, value: 40 },
        //                     { time: 3, value: 80 },
        //                     { time: 4, value: 30 },
        //                     { time: 5, value: 110 },
        //                     { time: 6, value: 170 },
        //                     { time: 7, value: 180 },
        //                 ]
        //             }

        //         ]
        //     },
        //     {
        //         type: "Token1",
        //         data: [
        //             {
        //                 type: "Team",
        //                 data: [
        //                     { time: 0, value: 90 },
        //                     { time: 1, value: 100 },
        //                     { time: 2, value: 90 },
        //                     { time: 3, value: 100 },
        //                     { time: 4, value: 90 },
        //                     { time: 5, value: 110 },
        //                     { time: 6, value: 90 },
        //                     { time: 7, value: 120 },
        //                 ]
        //             },
        //             {
        //                 type: "Community",
        //                 data: [
        //                     { time: 0, value: 70 },
        //                     { time: 1, value: 110 },
        //                     { time: 2, value: 80 },
        //                     { time: 3, value: 190 },
        //                     { time: 4, value: 90 },
        //                     { time: 5, value: 100 },
        //                     { time: 6, value: 70 },
        //                     { time: 7, value: 150 },
        //                 ]
        //             }


        //         ]
        //     }
        // ]
        //#endregion
        
    }

    initData() {
        this.getNodes();
        this.getEdges();

    }

    // 获取当前画布上的所有节点，保存节点原始 antv 数据和用户配置属性参数
    getNodes() {

        // 获取所有节点的 antv 相关数据，同时建立起不同节点类型的 label(用户设置的节点名字) -> id 的映射表
        // 边的数据在 this.graph.model 里的 edges 中
        // 节点的数据在 this.graph.model 里的 nodes 中
        // 要 xxx 数据就通过 this.graph.model.getXxxx() 取，取到的数据结构可能跟控制台展示的 this.graph.model 里的不同

        // nodes:画布上各节点（的数据）
        // this.antvNodes ：画布上各节点 id 到节点（数据）的映射
        // this.pool/genesis/stakeholder/blackholeLabelIDMap 相应节点 label 到 id 的映射
        let nodes = this.graph.model.getNodes();
        nodes.forEach(element => {
            // 这里的 element 是每个节点（含数据）
            // 映射表的 key 是节点 id，value 就是这个节点（含数据）
            
            let nodeData = element.getData().nodeData;
            if (element.getData().type == "pool") {
                this.nodesInstance.set(element.id, new Pool(element.label, element.id, nodeData, this.globalVars,this.indexDB));
            } 
            else if (element.getData().type == "genesis") {
                this.nodesInstance.set(element.id, new Genesis(element.label, element.id, nodeData, this.indexDB));
            }
            else if (element.getData().type == "stakeholder") {
                this.nodesInstance.set(element.id, new Stakeholder(element.label, element.id, nodeData, this.indexDB));
            }
            else if (element.getData().type == "blackhole") {
                this.nodesInstance.set(element.id, new Blackhole(element.label, element.id, nodeData, this.indexDB));
            }
            this.data.push({type: element.label + "-" + element.id, data: []});
            
            // // 进行节点 label 到 id 的映射
            // switch(element.getData().type) {
            //     case "pool":
            //         this.poolLabelIDMap.set(element.label, element.id);
            //         break;
            //     case "genesis":
            //         this.genesisLabelIDMap.set(element.label, element.id);
            //         break;
            //     case "stakeholder":
            //         this.stakeholderLabelIDMap.set(element.label, element.id);
            //         break;
            //     case "blackhole":
            //         this.blackholeLabelIDMap.set(element.label, element.id);
            //         break;
            //     default:
            //         break;
            // }
        });

        // // 初始化 Pool 节点对象并加入到 nodesInstance 中
        // for (let item of this.poolLabelIDMap) {
        //     // 这里的每个 item 是个列表，第一位是节点 label，第二位是节点 id
        //     // antvNode 是通过节点 id 取到节点（含数据）
        //     // nodeData 是在节点里通过 getData() 拿到我们加到节点里的 data，后面的.nodeData.tokenData 是我们定义的多层数据结构 （PS：真的挺多层的！！！！）
        //     let antvNode = this.antvNodes.get(item[1]);
        //     let nodeData = antvNode.getData().nodeData;
        //     // this.nodesInstance 的 key 是节点 id，值就是用户在右侧属性面板填的数据
        //     this.nodesInstance.set(item[1], new Pool(item[0], nodeData));
        //     // this.data 的 type 是节点 label，数据暂时存一个空列表
        //     this.data.push({type: item[0], data: []});
        // }

        // // 初始化 Genesis 节点对象并加入到 nodesInstance 中
        // for (let item of this.genesisLabelIDMap) {
        //     // 同上，首先 antvNode 是通过节点 id 取到节点（含数据）
        //     // 然后 nodeData 是取我们加到节点里的 data
        //     let antvNode = this.antvNodes.get(item[1]);
        //     let nodeData = antvNode.getData().nodeData;

        //     // this.nodesInstance 的 key 是节点 id，值就是用户在右侧属性面板填的数据
        //     this.nodesInstance.set(item[1], new Genesis(item[0], nodeData));
        //     // this.data 的 type 是节点 label，数据暂时存一个空列表
        //     this.data.push({type: item[0], data: []});
        // }

        // // 初始化 Stakeholder 节点对象并加入到 nodesInstance 中
        // for (let item of this.stakeholderLabelIDMap) {
        //     // 同上，首先 antvNode 是通过节点 id 取到节点（含数据）
        //     // 然后 nodeData 是取我们加到节点里的 data
        //     let antvNode = this.antvNodes.get(item[1]);
        //     let nodeData = antvNode.getData().nodeData;
            
        //     // this.nodesInstance 的 key 是节点 id，值就是用户在右侧属性面板填的数据
        //     // this.data 的 type 是节点 label，数据暂时存一个空列表
        //     this.nodesInstance.set(item[1], new Stakeholder(item[0], nodeData));
        //     this.data.push({type: item[0], data: []});
        // }

        // // 初始化 Blackhole 节点对象并加入到 nodesInstance 中
        // for (let item of this.blackholeLabelIDMap) {
        //     // 同上，
        //     // antvNode 是通过节点 id 取到节点（含数据）
        //     // nodeData 是在节点里通过 getData() 拿到我们加到节点里的 data
        //     let antvNode = this.antvNodes.get(item[1]);
        //     let nodeData = antvNode.getData().nodeData;
        //     // this.nodesInstance 的 key 是节点 id，值就是用户在右侧属性面板填的数据
        //     // this.data 的 type 是节点 label，数据暂时存一个空列表
        //     this.nodesInstance.set(item[1], new Blackhole(item[0], nodeData));
        //     this.data.push({type: item[0], data: []});
        // }

        console.log("nodeInstance:", this.nodesInstance);
    }

    // 获取当前画布上的所有边，保存边上用户配置的属性参数
    getEdges() {
        let edges = this.graph.getEdges()
        edges.forEach(element => {
            let src = element.getSourceNode().id;
            let dst = element.getTargetNode().id;

            let edgeData = element.getData().edgeData;
            let label = undefined;
            if (element.labels.length > 0) {
                label = element.labels[0].attrs.label.text;
            }
            let edge = new Edge(label, element.id, this.nodesInstance.get(src), this.nodesInstance.get(dst), edgeData, this.indexDB);
            if (this.edgeMap.get(src) == undefined) {
                this.edgeMap.set(src, new Map());
            }
            this.edgeMap.get(src).set(dst, edge);

            if (edgeData.checked) {
                this.edgeActive.set(element.id, edge);
            } 
            else {
                this.edgeNonActive.set(element.id, edge);
            }

            this.edgeInstance.set(element.id, edge);
        })
        console.log("edgemap:", this.edgeMap);
        console.log("edge instances:", this.edgeInstance);
        console.log("active edge:", this.edgeActive);
        console.log("Non active edge:", this.edgeNonActive);
    }

    async start() {
        while (this.curDay < this.endDay) {
            this.curDay++;
            console.log("day:", this.curDay);
            // step 存的是前序节点、当前节点 id 及是否结束的 bool 值
            // let step = this.scheduler.schedule();
            let _this=this;

            this.nodesInstance.forEach(function(value, _) {
                // value 是每个节点实例
                value.run(_this.curDay);
            });

            this.edgeActive.forEach(function (value, _) {
                value.run(_this.curDay);
            });

            this.edgeNonActive.forEach(function (value, _) {
                value.run(_this.curDay);
            });

            this.nodesInstance.forEach(function(value, _) {
                // value 是每个节点实例
                value.update();
            });

            this.edgeActive.forEach(function (value, _) {
                value.update();
            });

            this.edgeNonActive.forEach(function (value, _) {
                value.update();
            });

            // this.updateDailyData();

            if (this.slot > 0 && this.curDay % this.slot == 0 && this.curDay < this.endDay) {
                await Sleep(5000);
            }

            // 如果模型处于 Off / Pause 状态，直接跳出函数
            if (this.status == 0 || this.status == 2) {
                return;
            }

            if (this.curDay + 1 > this.endDay) {
                break;
            }
            // this.curDay++;

            // if (step.endFlag == true) {
            //     // 更新所有节点
            //     this.nodesInstance.forEach(function(value, key) {
            //         // value 是每个节点每天跑出来的数据
            //         value.update();
            //     })
            //     // 为数据可视化做准备，更新测算过程中每日的动态数据 
            //     this.updateDailyData();

                
            //     // 每隔一段周期都暂停 5s
            //     if (this.slot > 0 && this.curDay % this.slot == 0 && this.curDay < this.endDay) {
            //         await Sleep(5000);
            //     }
            //     // this.curDay++;
            //     // 如果模型处于 Off / Pause 状态，直接跳出函数
            //     if (this.status == 0 || this.status == 2) {
            //         return;
            //     }
            //     this.curDay++;
            //     continue;
            // }

            // // 当前节点不存在，报错
            // if (this.nodesInstance.get(step.curNode) == undefined) {
            //     // log 报错提示: 不存在该节点
            //     console.log("error:: cur node does not exist!", step);
            //     break ;
            // }

            

            // 前序节点存在 / 不存在
            // 执行当前节点的 run 方法
            // if (step.preNode == null) {
            //     this.nodesInstance.get(step.curNode).run(null, this.curDay);
            // }
            // else {
            //     this.nodesInstance.get(step.curNode).run(this.nodesInstance.get(step.preNode), this.curDay);
            // }

        }

        // 为数据可视化做准备，更新一次测算总体的数据，如 unstakeHistory, vestHistory 等
        // this.updateOverallData();

        // curDay <= endDay 的时候 curDay 都 ++ ，最后就会导致 curDay 比 endDay 多 1，此处减去
        // this.curDay--;
        // log 提示: 测算运行完毕
        return;
    }

    // 为数据可视化做准备，更新测算过程中每日的动态数据 
    updateDailyData() {
        for (let i = 0; i < this.data.length; i++) {
            
            // 更新 token 节点相关的 data
            if (this.tokenLabelIDMap.has(this.data[i].type)) {
                // type 拿到的是节点的 label（text）
                // 通过它 在 tokenLabelIDMap 里拿这个节点的 id
                // 然后通过 id 在 tmpInstance 里拿到节点右侧属性栏里面的值、每日跑出来的值 写入 tmpInstance
                let tmpInstance = this.nodesInstance.get(this.tokenLabelIDMap.get(this.data[i].type));

                ////#region 
                // this.data 的数据结构如下所示
                // this.data:
                // [
                //     {
                //         type: "Token2",
                //         data: [
                //             {
                //                 type: "Team",
                //                 data: [
                //                     { time: 0, value: 60 },
                //                     { time: 1, value: 80 },
                //                     { time: 2, value: 90 },
                //                     { time: 3, value: 80 },
                //                     { time: 4, value: 90 },
                //                     { time: 5, value: 110 },
                //                     { time: 6, value: 120 },
                //                     { time: 7, value: 140 },
                //                 ]
                //             }, // 参与者 data 域
                //             {
                //                 type: "Community",
                //                 data: [
                //                     { time: 0, value: 50 },
                //                     { time: 1, value: 90 },
                //                     { time: 2, value: 40 },
                //                     { time: 3, value: 80 },
                //                     { time: 4, value: 30 },
                //                     { time: 5, value: 110 },
                //                     { time: 6, value: 170 },
                //                     { time: 7, value: 180 },
                //                 ]
                //             } // 参与者 data 域

                //         ]
                //     }, // 节点 data 域
                // ]
                ////#endregion

                // 对于每个节点，其节点的 data 域内会有不同的角色, 如 Team, Community 等; 但是节点 data 域是一个数组，由于将节点含有的角色数据插入 data 域数组的过程不是有序的所以不能直接根据下标就定位到某个角色，
                // 所以此处需要保存一个映射 roleIdxMap, key 为角色, value 为该角色在节点 data 域数组内的下标，方便后续操作指定节点的指定角色 data 域
                let roleIdxMap = new Map();
                
                // 根据节点 data 域中已包含的角色来初始化 roleIdxMap
                // 记录角色所处的位置
                for (let j = 0; j < this.data[i].data.length; j++) {
                    // this.data[i].data[j].type 拿到的是角色，如 community、Team and so on
                    roleIdxMap.set(this.data[i].data[j].type, j);
                }

                // TODO 目前对于 token 节点只支持将 freeMoney 数据可视化
                // tmpInstance 里是节点右侧属性栏里面的值、每日跑出来的值
                for (let item of tmpInstance.freeMoney) {
                    // 如果 roleIdxMap 中还没有包含某个角色（也意味着节点 data 域中还未包含某个角色），则在节点 data 域中为该角色插入记录，同时将 role -> idx 的映射关系保存起来
                    // item[0] 是角色名 item[1] 是角色那天对应的 freeMony
                    // 记录角色所处的位置
                    if (!roleIdxMap.has(item[0])) {
                        let len = this.data[i].data.push({type: item[0], data:[]});
                        roleIdxMap.set(item[0], len - 1);
                    }
                    // 往节点 data 域下的角色 data 域插入数据
                    this.data[i].data[roleIdxMap.get(item[0])].data.push({time: String(this.curDay), value: item[1]});
                }
            } 
            // 更新 stake 节点相关的 data，代码逻辑和实现与上面对 token 节点的处理相同
            else if (this.action.stakeLabelIDMap.has(this.data[i].type)) {
                // 根据类型拿到节点 id 再拿到每日跑出来的值
                let tmpInstance = this.nodesInstance.get(this.action.stakeLabelIDMap.get(this.data[i].type));
                let roleIdxMap = new Map();
                
                // 记录角色所处的位置
                for (let j = 0; j < this.data[i].data.length; j++) {
                    roleIdxMap.set(this.data[i].data[j].type, j);
                }

                // TODO 目前对于 stake 节点只支持将 rewardAllocated 数据可视化
                for (let item of tmpInstance.rewardAllocated) {
                    // 记录角色所处的位置
                    if (!roleIdxMap.has(item[0])) {
                        let len = this.data[i].data.push({type: item[0], data:[]});
                        roleIdxMap.set(item[0], len - 1);
                    }
                    // 每天都为角色插入当日数据
                    this.data[i].data[roleIdxMap.get(item[0])].data.push({time: String(this.curDay), value: item[1]});
                }
            } 
            
        }
    }

    // 为数据可视化功能服务，更新单次测算的总体数据，如 unstakeHistory, vestHistory 等
    updateOverallData() {
        for (let i = 0; i < this.data.length; i++) {
            // 更新 unstake 节点相关的 data，代码逻辑和实现与上面对 token 节点的处理大体相似，稍有不同
            if (this.action.unstakeLabelIDMap.has(this.data[i].type)) {
                // 根据节点标签（Text）在 unstakeLabelIDMap 中拿到 id
                // 然后根据 id 在 nodesInstance 中拿每日每个角色的 unstake 数据 存入 originalHistory
                // PS，unstake 的数据结构的独特的 别的节点没有unstakeHistory
                let originalHistory = this.nodesInstance.get(this.action.unstakeLabelIDMap.get(this.data[i].type)).unstakeHistory;
                let orderedHistory = new Map();

                // 由于 unstakeHistory 的插入顺序可能不是按天的顺序插入，所以需要重新按天排序
                let keys = new Array();
                for (let item of originalHistory) {
                    // item[0] 是有数据的 day，item[1] 是数据
                    keys.push(Number(item[0]));
                }
                keys.sort(function(a, b) {
                    return Number(a) - Number(b);
                });
                for(let i = 0; i < keys.length; i++) {
                    orderedHistory.set(Number(keys[i]), originalHistory.get(keys[i]));
                }

                let roleIdxMap = new Map();

                // 记录角色所处的位置
                for (let j = 0; j < this.data[i].data.length; j++) {
                    roleIdxMap.set(this.data[i].data[j].type, j);
                    // roleTimedataIdxMap.set(this.data[i].data[j].type, new Map());
                }

                for (let item of orderedHistory) {
                    // item: {key: 时间, value: {key:"Team", value: 100}}
                    // item[0] 是有数据的 day，item[1] 是数据
                    for (let item2 of item[1]) {
                        // item2: {key: "Team", value: 100}
                        // 记录角色所处的位置
                        if (!roleIdxMap.has(item2[0])) {
                            let len = this.data[i].data.push({type: item2[0], data:[]});
                            roleIdxMap.set(item2[0], len - 1);
                        }
                        // 每天都为角色插入当日数据
                        this.data[i].data[roleIdxMap.get(item2[0])].data.push({time: String(item[0]), value: item2[1]});
                    }
                }

            }
            // 更新 vest 节点相关的 data, 代码逻辑和实现与上面对 token 节点的处理大体相似，稍有不同
            else if (this.action.vestLabelIDMap.has(this.data[i].type)) {
                // 根据节点标签（Text）在 vestLabelIDMap 中拿到 id
                // 然后根据 id 在 nodesInstance 中拿每日每个角色的 vest 数据 存入 originalHistory
                // vest 的数据结构的独特的 别的节点没有 vestHistory
                let originalHistory = this.nodesInstance.get(this.action.vestLabelIDMap.get(this.data[i].type)).vestHistory;
                let orderedHistory = new Map();

                // 由于 vestHistory 的插入顺序不是按天的顺序插入，所以需要重新按天排序
                let keys = new Array();
                for (let item of originalHistory) {
                    keys.push(item[0]);
                }
                keys.sort(function(a, b) {
                    return a - b;
                });
                for(let i = 0; i < keys.length; i++) {
                    orderedHistory.set(keys[i], originalHistory.get(keys[i]));
                }

                let roleIdxMap = new Map();

                // 记录角色所处的位置
                for (let j = 0; j < this.data[i].data.length; j++) {
                    roleIdxMap.set(this.data[i].data[j].type, j);
                }

                for (let item of orderedHistory) {
                    // item: {key: 时间, value: {key:"Team", value: 100}}
                    // item[0] 是有数据的 day，item[1] 是数据
                    for (let item2 of item[1]) {
                        // item2: {key: "Team", value: 100}
                        // 记录角色所处的位置
                        if (!roleIdxMap.has(item2[0])) {
                            let len = this.data[i].data.push({type: item2[0], data:[]});
                            roleIdxMap.set(item2[0], len - 1);
                        }
                        // 每天都为角色插入当日数据
                        this.data[i].data[roleIdxMap.get(item2[0])].data.push({time: String(item[0]), value: item2[1]});
                    }
                    
                }
            }
        }
    }

    // 当模型从暂停状态重新启动测算时，用户可能对参数进行了修改，新的参数需要更新到模型中
    dataUpdate(graph, endDay, slot) {
        // 确保 endDay 大于当前
        if (endDay < this.curDay) {
            console.log("end day is illegal!");
            return;
        }

        this.endDay = Number(endDay);
        this.slot = Number(slot);

        // TODO [Done] 需要考虑已有节点和新加入的节点和删除的节点
        let nodeDeleted = new Set();
        this.nodesInstance.forEach(function(value, key) {
            nodeDeleted.add(key);
        })
        let nodes = graph.model.getNodes();
        nodes.forEach(element => {
            if (this.nodesInstance.has(element.id)) {
                this.nodesInstance.get(element.id).dataUpdate(element.label, element.getData().nodeData);
                nodeDeleted.delete(element.id);
            }
            else {
                if (element.getData().type == "pool") {
                    this.nodesInstance.set(element.id, new Pool(element.label, element.getData().nodeData));
                } 
                else if (element.getData().type == "genesis") {
                    this.nodesInstance.set(element.id, new Genesis(element.label, element.getData().nodeData));
                }
                else if (element.getData().type == "stakeholder") {
                    this.nodesInstance.set(element.id, new Stakeholder(element.label, element.getData().nodeData));
                }
                else if (element.getData().type == "blackhole") {
                    this.nodesInstance.set(element.id, new Blackhole(element.label, element.getData().nodeData));
                }
                this.data.push({type: element.label + "-" + element.id, data: []});
            }
        });
        nodeDeleted.forEach(value => {
            this.nodesInstance.delete(value);
        })

        // TODO [Done] 需要考虑已有边和新加入的边和删除的边
        let edgeDeleted = new Set();
        this.edgeInstance.forEach(function(value, key) {
            edgeDeleted.add(key);
        })
        let edges = this.graph.getEdges();
        edges.forEach(element => {
            let src = element.getSourceNode().id;
            let dst = element.getTargetNode().id;
            let label = undefined;
            if (element.labels.length > 0) {
                label = element.labels[0].attrs.label.text;
            }

            if (this.edgeInstance.has(element.id)) {
                this.edgeInstance.get(element.id).dataUpdate(label, this.nodesInstance.get(src), this.nodesInstance.get(dst), element.getData().edgeData);
                edgeDeleted.delete(element.id);
            }
            else {
                let edge = new Edge(label, this.nodesInstance.get(src), this.nodesInstance.get(dst), element.getData().edgeData);
                if (this.edgeMap.get(src) == undefined) {
                    this.edgeMap.set(src, new Map());
                }
                this.edgeMap.get(src).set(dst, edge);

                if (element.getData().edgeData.checked) {
                    this.edgeActive.push(edge);
                } 
                else {
                    this.edgeNonActive.push(edge);
                }
                this.edgeInstance.set(element.id, edge);
            }
        })
        edgeDeleted.forEach(value => {
            this.edgeInstance.delete(value);
            this.edgeActive.delete(value);
            this.edgeNonActive.delete(value);
        })


        console.log("updated nodeInstance:", this.nodesInstance);
        console.log("updated edgeInstance:", this.edgeInstance);
        console.log("updated curday:", this.curDay);
    }
}