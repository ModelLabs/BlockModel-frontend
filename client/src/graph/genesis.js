import { max, create, all} from "mathjs";
const config = { };
const math = create(all, config);

export class Genesis {

    constructor(label, id, nodeData, indexDB) {
        this.tokenData = new Map();
        this.preprocessToken(nodeData.tokens.tokenNames, nodeData.tokens.tokenAmounts);
        // 本节点已经产出的 Token 数量
        // TODO 是否需要把这个变量也加入到 parser 里呢？
        this.generated = 0;

        // 本节点在某一天中流入和流出的 Token
        // this.dailyTokenIn = new Map();
        // TODO 是否需要把这个变量也加入到 parser 里呢？
        this.dailyTokenOut = new Map();

        this.label = label;
        this.id = id;
        this.indexDB = indexDB;

        // 建立一个组件的 parser, 存储的是 {var : value}。
        // 目的是当有虚线连接这个组件的时候, 判断 condition 是否满足，可以使用 parser.evaluate() 比较方便快捷
        this.parser = math.parser();
        this.setupParser();
        console.log("Genesis:", this.label, ", token:", this.tokenData);

        this.curDay = 0;
        let obj = {version: 1, uid: this.id, label: this.label,day: this.curDay, data: this.tokenData};
        this.indexDB.addData("genesisHistoryData", obj);
    }

    preprocessToken(rawTokenNames, rawTokenAmounts) {
        for (let i = 0; i < rawTokenNames.length; i++) {
            if (rawTokenAmounts[i].value == "~") rawTokenAmounts[i].value = Number.MAX_SAFE_INTEGER;
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
        let _this=this;
        // 将每日流入流出的 token 数据更新到相关变量上
        this.dailyTokenOut.forEach(function(value, key) {
            if (!_this.tokenData.has(key)) {
                console.error("Genesis:", _this.label, " can not generate token:", key);
            }
            else {
                if (_this.tokenData.get(key) - value < 0) console.warn("Genesis:", _this.label, " token:", key, " has exceeded its max supply");
                _this.tokenData.set(key, max(_this.tokenData.get(key) - value, 0 ));
            }
        })

        // TODO parser 和 tokenData 是冗余的，需要仔细考虑是否将二者合为一
        this.tokenData.forEach(function(value,key) {
            _this.parser.set(key, value);
        });

        this.dailyTokenOut = new Map();

        let obj = {version: 1, uid: this.id, label: this.label,day: this.curDay, data: this.tokenData};
        this.indexDB.addData("genesisHistoryData", obj);
        console.log("Genesis:", this.label, ", tokenData:", this.tokenData);
    }

    DailyTokenIn(token, amount) {
        console.error("Genesis:", this.label, " is not capable to receive any tokens!");
    }
    
    DailyTokenOut(token, amount) {
        if (!this.dailyTokenOut.has(token)) {
            this.dailyTokenOut.set(token, amount);
        }
        else {
            this.dailyTokenOut.set(token, this.dailyTokenOut.get(token) + amount);
        }
    }

    dataUpdate(label, nodeData) {
        this.preprocessToken(nodeData.token, nodeData.maxsupply);
        this.label = label;

        console.log("Genesis:", this.label, ", updated token:", this.tokenData);
    }
}