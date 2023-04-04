import { create, all} from "mathjs";
const config = { };
const math = create(all, config);

export class Stakeholder {

    constructor(label, id, nodeData, indexDB) {
        this.tokenData = new Map();
        this.preprocessToken(nodeData.tokens.tokenNames, nodeData.tokens.tokenAmounts);

        // 本节点在某一天中流入和流出的 Token
        this.dailyTokenIn = new Map();
        this.dailyTokenOut = new Map();

        this.label = label;
        this.id = id;
        this.indexDB = indexDB;

        // 建立一个组件的 parser, 存储的是 {var : value}。
        // 目的是当有虚线连接这个组件的时候, 判断 condition 是否满足，可以使用 parser.evaluate() 比较方便快捷
        this.parser = math.parser();
        this.setupParser();

        this.curDay = 0;
        let obj = {version: 1, uid: this.id, label:this.label, day: this.curDay, data: this.tokenData};
        this.indexDB.addData("stakeholderHistoryData", obj);
        console.log("Stakeholder: ", this.label, ", tokenData:", this.tokenData);
    }

    preprocessToken(rawTokenNames, rawTokenAmounts) {
        for (let i = 0; i < rawTokenNames.length; i++) {
            this.tokenData.set(rawTokenNames[i].value, Number(rawTokenAmounts[i].value));
        }
    }

    setupParser() {
        // TODO 除了 tokenData 之外，还需要把哪些数据加入到 parser 中呢？（可能会在虚线 condition 中作为条件判断的）
        let _this = this;
        this.tokenData.forEach(function(value, key) {
            _this.parser.set(key, value);
        })
    }

    run(curDay) {
        this.curDay = curDay;
    }

    update() {
        let _this = this;
        // 将当天流入流出的 token 数据更新到 tokenData 中
        this.dailyTokenIn.forEach(function(value, key) {
            if (_this.tokenData.has(key)) {
                _this.tokenData.set(key, _this.tokenData.get(key) + value);
            }
            else {
                _this.tokenData.set(key, value);
            }
        })
        this.dailyTokenOut.forEach(function(value, key) {
            if (!_this.tokenData.has(key)) {
                console.error("Pool:", _this.label, " does not have token:", key);
            }
            else {
                _this.tokenData.set(key, _this.tokenData.get(key) - value);
            }
        })

        // TODO parser 和 tokenData 是冗余的，需要仔细考虑是否将二者合为一
        this.tokenData.forEach(function(value,key) {
            _this.parser.set(key, value);
        });
        
        this.dailyTokenIn = new Map();
        this.dailyTokenOut = new Map();

        let obj = {version: 1, uid: this.id, label:this.label, day: this.curDay, data: this.tokenData};
        this.indexDB.addData("stakeholderHistoryData", obj);

        console.log("Stakeholder:", this.label, ", tokenData:", this.tokenData);

    }

    DailyTokenIn(token, amount) {
        if (!this.dailyTokenIn.has(token)) {
            this.dailyTokenIn.set(token, amount);
        }
        else {
            this.dailyTokenIn.set(token, this.dailyTokenIn.get(token) + amount);
        }
    }
    
    DailyTokenOut(token, amount) {
        if (!this.tokenData.has(token)) {
            console.warn("Stakeholder:", this.label, " does not have token:", token);
            return ;
        }
        if (!this.dailyTokenOut.has(token)) {
            this.dailyTokenOut.set(token, amount);
        }
        else {
            this.dailyTokenOut.set(token, this.dailyTokenOut.get(token) + amount);
        }
    }

    dataUpdate(label, nodeData) {
        this.preprocessToken(nodeData.tokens.tokenNames, nodeData.tokens.tokenAmounts);
        this.label = label;

        console.log("Stakeholder: ", this.label, ", updated tokenData:", this.tokenData);
    }
}