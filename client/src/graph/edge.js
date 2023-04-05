// import { create, all} from "mathjs";
// const config = { };
// const math = create(all, config);

export class Edge {

    constructor(label, id, src, dst, edgeData, indexDB) {
        this.checked = edgeData.checked;
    
        this.policyToken = new Map();
        this.policyPoints = new Map();
        this.policyType = new Map();
        this.policyPiecewiseFunctions = new Map();
        this.conditions = new Array();
        this.preprocessPolicy(edgeData.policy);
        this.preprocessCondition(edgeData.condition);

        this.src = src;
        this.dst = dst;
        this.label = label;
        this.id = id;
        this.indexDB = indexDB;
        this.obj = [];
        this.curDayTransferAmount = 0;

        console.log("Operation: ", this.label, ", condition:", this.conditions);
        console.log("Operation: ", this.label, ", policy-token:", this.policyToken);
        console.log("Operation: ", this.label, ", policyPoints:", this.policyPoints);
        console.log("Operation: ", this.label, ", picewise functions:", this.policyPiecewiseFunctions);
        console.log("Operation: ", this.label, ", src:", this.src);
        console.log("Operation: ", this.label, ", dst:", this.dst);
    }

    preprocessPolicy(rawPolicy) {
        for (let i = 0; i < rawPolicy.tokenNames.length; i++) {
            this.policyToken.set(rawPolicy.policyNames[i].value, rawPolicy.tokenNames[i].value);
            this.policyType.set(rawPolicy.policyNames[i].value, rawPolicy.policyFunctions[i].value.type);

            let points = rawPolicy.policyFunctions[i].value.datapoints;
            let piecewiseFunctions = new Array();
            
            // 把用户设置的点位按照 x 轴从小到大排列；
            points.sort(function(a,b) {return Number(a.x) - Number(b.x)});
            this.policyPoints.set(rawPolicy.policyNames[i].value, points);
            // // 排列后的点位，可以组成分段函数的表达式，目前此处用四元组表达分段函数：[x0, x1, y0, y1] (x0, y0) 和 (x1, y1) 是每一段的两个端点
            for (let j = 0; j < points.length; j++) {
                if (j == 0) {
                    continue;
                } else {
                    piecewiseFunctions.push([Number(points[j - 1].x), Number(points[j].x), Number(points[j - 1].y), Number(points[j].y)]);
                }
            }
            this.policyPiecewiseFunctions.set(rawPolicy.policyNames[i].value, piecewiseFunctions);
            
        }
    }

    preprocessCondition(rawCondition) {
        rawCondition = rawCondition.trim();
        if (rawCondition == "") return;
        let vars = rawCondition.split(";");
        vars.pop();
        for (let i = 0; i < vars.length; i++) {
            this.conditions.push(vars[i].trim());
        }
    }

    run(curDay) {
        this.curDay = curDay;
        this.curDayTransferAmount = 0;

        // 当 Operation 是 Non-active 的
        if(!this.checked) {
            for (let i = 0; i < this.conditions.length; i++) {
                if (this.src.parser.evaluate(this.conditions[i]) == false) {
                    console.log("condition: ", this.conditions[i], " is not satisfied! SKIP");
                    return;
                }
                
            }
        }
        // 当Operation是 Active 的 or Non-active的所有条件都满足时
        // 需要把每个策略都执行一次
        for (let item of this.policyToken) {
            let policy = item[0];
            let token = item[1];
            if ( !this.src.tokenData.has(token) ) {
                console.warn("Operation:", this.label, " is failed since source node has no enough token to transfer");
                continue;
            }
            // 计算当前处于分段函数policy的哪个分段上
            let piecewiseIndex = this.locatePiecewise(curDay, policy);
            // 不在分段函数范围内时，不需要计算后续逻辑
            if (piecewiseIndex == -1) {
                console.log("transfer Amount: 0");
                continue;
            }
            
            // 计算当前天，在当前所处的分段上的具体值是多少
            let transferAmount = Math.round((curDay - this.policyPiecewiseFunctions.get(policy)[piecewiseIndex][0]) / (this.policyPiecewiseFunctions.get(policy)[piecewiseIndex][1] - this.policyPiecewiseFunctions.get(policy)[piecewiseIndex][0]) * (this.policyPiecewiseFunctions.get(policy)[piecewiseIndex][3] - this.policyPiecewiseFunctions.get(policy)[piecewiseIndex][2]) + this.policyPiecewiseFunctions.get(policy)[piecewiseIndex][2]);
            // TODO transferAmount 取决于绝对值or比例，如果用户设定的是比例的话，需要额外计算一下
            if (this.policyType.get(policy) == "percentage") {
                transferAmount = Math.round(transferAmount * this.src.tokenData.get(token) / 100);
            }

            if (this.src.tokenData.get(token) < transferAmount) {
                console.warn("Operation:", this.label, " is failed since source node has not enough token to transfer");
            }
            else {
                console.log("transfer Amount:", transferAmount);
                this.src.DailyTokenOut(token, transferAmount);
                this.dst.DailyTokenIn(token, transferAmount);
                this.curDayTransferAmount = transferAmount;
            }
            this.indexDB.addData("edgeHistoryData",{id:this.id,day:this.curDay,token:token,transferAmount:this.curDayTransferAmount});
        }
    }

    

    update() {
        // edge 暂时没有设计需要保存的历史数据
    }

    // 找到 curDay 处于 policy 分段函数中的哪一段
    locatePiecewise(curDay, policy) {
        let retIdx = -1;
        for (let func = 0; func < this.policyPiecewiseFunctions.get(policy).length; func++){
            if (curDay >= this.policyPiecewiseFunctions.get(policy)[func][0] && curDay <= this.policyPiecewiseFunctions.get(policy)[func][1]) {
                retIdx = func;
                break;
            }
        }
        return retIdx;
    }

    dataUpdate(label, src, dst, edgeData) {
        this.checked = edgeData.checked;
        this.label = label;
        this.preprocessPolicy(edgeData.policy);

        this.src = src;
        this.dst = dst;

        console.log("Operation: ", this.label, ", updated policy-token:", this.policyToken);
        console.log("Operation: ", this.label, ", updated policyPoints:", this.policyPoints);
        console.log("Operation: ", this.label, ", updated picewise functions:", this.policyPiecewiseFunctions);
        console.log("Operation: ", this.label, ", updated src:", this.src);
        console.log("Operation: ", this.label, ", updated dst:", this.dst);
    }
}