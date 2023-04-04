export class Simulate {
    constructor(graph, endDay, slot) {
        this.graph = graph;
        // endDay: 模型的测算终止时间
        // this.endDay = Number(endDay);
        // // slot: 模型测算的停顿窗口，每隔这一段时间模型测算过程会停顿 5s，方便操作者进行下一步的调整
        // this.slot = Number(slot);
        // // status: 模型处于哪个状态中 0 - off, 1 - on, 2 - pause
        // this.status = Number(1);
        // // curDay: 模型测算的当前时间
        // this.curDay = Number(1);

        // antvNodes 保存的是原始 antv 定义的节点对象
        // TODO antvNodes 是否仅仅在初始化的时候用到？
        this.antvNodes = new Map();

        // key:token id | value:token supply
        this.tokenSupply = new Map();

        // key:token label | value:token id
        this.tokenMap = new Map();

        // key:stakeholder label | value:token id
        this.stakeholderMap = new Map();

        // key:token id | value:[{key:stakeholder id,value:allocation amount}]
        this.tokenAllocations = new Map();

        this.pieChartData = [];

        // // nodesInstance 保存所有节点对象数据 <key: tokenID, value: nodeClassInstance>
        // this.nodesInstance = new Map();
        // // action 内包含 stakeLabelIDMap, unstakeLabelIDMap, vestLabelIDMap
        // this.action = new Action();
        // // tokenLabelIDMap <key: nodeLabel, value: nodeID>
        // this.tokenLabelIDMap = new Map();
        // // EdgeMap <key: sourceID, value: <key: targetID, value: EdgeClassInstance> >
        // this.edgeMap = new Map();
        // // data: 测算模型测算过程中产生的数据
        // this.data = [];

        this.initData();

        // this.scheduler = new Scheduler(graph, this.antvNodes);
    
        
    }

    initData() {
        // Just for Test
        this.printFunc();


        this.getNodes();
        //this.getEdges();
        //this.producePieChartData();
    }

    // 获取当前画布上的所有节点，保存节点原始 antv 数据和用户配置属性参数
    getNodes() {

        // 获取所有节点的 antv 相关数据，同时建立起不同节点类型的 label(用户设置的节点名字) -> id 的映射表
        // 边的数据在 this.graph.model 里的 edges 中
        // 节点的数据在 this.graph.model 里的 nodes 中
        // 要 xxx 数据就通过 this.graph.model.getXxxx() 取，取到的数据结构可能跟控制台展示的 this.graph.model 里的不同

        // nodes:画布上各节点（的数据）
        // this.antvNodes ：画布上各节点 id 到节点（数据）的映射
        // this.token/stake/unstake/vestLabelIDMap 相应节点 label 到 id 的映射
        let nodes = this.graph.model.getNodes();
        nodes.forEach(element => {
            // 这里的 element 是每个节点（含数据）
            // 映射表的 key 是节点 id，value 就是这个节点（含数据）
            this.antvNodes.set(element.id, element.getData());
            
            // 进行节点 label 到 id 的映射
            // token 单独映射，stake、unstake、vest 放到 action 里
            switch(element.getData().type) {
                case "genesis":
                    this.tokenSupply.set(element.id, element.getData().nodeData.maxsupply);
                    this.tokenMap.set(element.getLabel(), element.id)
                    break;
                case "stakeholder":
                    this.stakeholderMap.set(element.getLabel(), element.id);
                    var tmp = new Map();
                    
                    if (element.getData().nodeData.length){
                        if (element.getData().nodeData[0].size){
                            
                            for(var key of element.getData().nodeData[0].keys()){
                                tmp.set(key.value,element.getData().nodeData[0].get(key).value);
                                // console.log("key",key);
                                // console.log("{}",this.tokenAllocations[element.getLabel()]);
                                //if(this.tokenAllocations.has(key.value)){}
                                //else this.tokenAllocations.set(key.value,element.getData().nodeData[0].get(key).value)
                            }
                        }
                    }
                    this.tokenAllocations.set(element.getLabel(),tmp);
                    break;
                default:
                    break;
            }
        });  
    }

    // 获取当前画布上的所有边，保存边上用户配置的属性参数
    getEdges() {
        // let edges = this.graph.getEdges()
        // edges.forEach(element => {
        //     let src = element.getSourceNode().id;
        //     let dst = element.getTargetNode().id;

        //     let edgeData = element.getData().edgeData;
        //     console.log("edges", edgeData);

        //     let edge = new Edge(src, dst, edgeData.distribution);
        //     if (this.edgeMap.get(src) == undefined) {
        //         this.edgeMap.set(src, new Map());
        //     }
        //     this.edgeMap.get(src).set(dst, edge);
        // })
    }

    printFunc(){
        console.log("antnodes:", this.antvNodes);
        console.log("tokenSupply:", this.tokenSupply);
        console.log("tokenMap:", this.tokenMap);
        console.log("stakeholderMap:", this.stakeholderMap);
        console.log("tokenAllocation:", this.tokenAllocations);
    }

    // producePieChartData(){
    //     if(this.tokenAllocations.size){
    //         //console.log("in")
    //         for(var item of this.tokenAllocations){
    //             let role = item[0];
    //             if(item[1].size){
    //                 for(var allocation of item[1]){
    //                     let token = allocation[0];
    //                     let amount = allocation[1];
    //                     let tmp = new Map();
    //                     tmp.set(token,amount);
    //                     this.pieChartData.push({
    //                         type:role,
    //                         value:tmp
    //                     })
    //                 }
    //             }
                
    //         }
    //     }
    // }
}