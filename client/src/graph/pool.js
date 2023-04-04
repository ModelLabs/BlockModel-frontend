import { create, all } from "mathjs";
import { mapCopy } from "../utils/mapUtils";
const config = { };
const math = create(all, config);

export class Pool {

    constructor(label, id, nodeData, modelGlobalVars, indexDB) {
        // tokenData: {tokenName : tokenAmount}
        this.tokenData = new Map();
        this.preprocessToken(nodeData.tokens.tokenNames, nodeData.tokens.tokenAmounts);

        // moduleGlobalVars: {"a":0, "b": 1}
        this.moduleGlobalVars = new Map();
        // moduleData: {moduleName : moduleExpressions["a=a+1", "b=b+2",...]}
        this.moduleData = new Map();
        // 每个 module 保存一份独立的 parser, 以实现相对隔离的计算环境 scope
        // moduleParser: {moduleName : Parser}
        this.moduleParser = new Map();
        // TmpParser 作为每天 module 表达式计算结果的临时存储，当天运行 update 的时候会覆盖 moduleParser
        // 也是每个 module 独立保存一份
        // moduleTmpParser: {moduleName : Parser}
        this.moduleTmpParser = new Map();
        this.preprocessModule("init", nodeData.modules.moduleNames, nodeData.modules.moduleExpressions, nodeData.modules.globalVars, modelGlobalVars);

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
        let obj = {version: 1, uid: this.id, label: this.label, day: this.curDay, data: {tokenData: this.tokenData, moduleGlobalVars: this.moduleGlobalVars }};
        this.indexDB.addData("poolHistoryData", obj);


        console.log("Pool: ", this.label, ", tokenData:", this.tokenData);
        console.log("Pool: ", this.label, ", moduleGlobalVars:", this.moduleGlobalVars);
        console.log("Pool: ", this.label, ", moduleData:", this.moduleData);
        console.log("Pool: ", this.label, ", init module parser:", this.moduleParser);

    }

    // 预处理用户输入的 Token 信息
    // 1. 取出 name 和 amount 存放
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
    
    // 预处理用户输入的 Module 模块
    // 1. 处理所有 Module 的全局变量
    // 2. 为每个 Module 构建独立的 Parser，并把 token 数据和全局变量数据都预先存到 parser 中
    // 3. 取出 Module 中的多个表达式（以分号隔开）并拆成单个表达式保存；
    preprocessModule(type, rawModuleNames, rawModules, rawGlobalVars, modelGlobalVars) {
        // 1.
        let vars = rawGlobalVars.split(";");
        if (vars.length > 0) {
            vars.pop();
            for (let i = 0; i < vars.length; i++){
                let words = vars[i].split("=");
                this.moduleGlobalVars.set(words[0].trim(), Number(words[1].trim()));
            }
        }
        //2. 把 model 层面的全局变量也设置进来
        for(let i = 0; i < modelGlobalVars.var_key.length; i++) {
            this.moduleGlobalVars.set(modelGlobalVars.var_key[i].value, Number(modelGlobalVars.var_value[i].value));
        }

        // 2.
        let parser = math.parser();
        this.tokenData.forEach(function (value, key) {
            parser.set(key, Number(value));
        })
        this.moduleGlobalVars.forEach(function(value, key) {
            parser.set(key, value);
        })
        
        // 3.
        for (let i = 0; i < rawModules.length; i++) {
            // nodeData 里存的 Module 数据是以 map {key: timestamp, value: "xxx"} 的格式存的
            let rawModule = rawModules[i].value;
            let exps = rawModule.split(";");
            exps.pop();
            for (let j = 0; j < exps.length; j++) {
                exps[j] = exps[j].trim();
            }
            this.moduleData.set(rawModuleNames[i].value, exps);
            // 如果调用此函数是在更新已存在的 module，那么需要考虑将原 module 中的局部变量也要延续保存下来
            if (type == "update" && this.moduleParser.has(rawModuleNames[i].value)) {
                let oldParserScope = this.moduleParser.get(rawModuleNames[i].value).getAll();
                for (let scope of Object.entries(oldParserScope)) {
                    console.log("parser all:", parser.getAll());
                    console.log("scope[0]:", scope[0]);
                    if (! scope[0] in parser.getAll()) {
                        console.log("not in");
                        parser.set(scope[0], scope[1]);
                    }
                }
            }
            this.moduleParser.set(rawModuleNames[i].value, parser);
        }

    }

    run(curDay) {
        this.curDay = curDay;
        // 运行每个 module 中的每个表达式，但运算结果先保存到 moduleTmpParser 中
        let _this = this;
        this.moduleData.forEach(function (value, key) {
            let tmpParser = _this.copyParser(_this.moduleParser.get(key));
            for (let i = 0; i < value.length; i++) {
                tmpParser.evaluate(value[i]);
            }
            _this.moduleTmpParser.set(key, tmpParser);
        })

        // console.log("run module parser:", mapCopy(this.moduleParser));
        // console.log("run module tmp parser:", mapCopy(this.moduleTmpParser));
    }

    // TODO: update 的步骤有些繁琐，可以优化
    update() {
        let _this = this;
        // 将 moduleTmpParser 中最新的运算结果更新到 tokenData + GlobalVars 中去
        let originTokenData = mapCopy(this.tokenData);
        let originGlobalVars = mapCopy(this.moduleGlobalVars);
        this.moduleTmpParser.forEach(function(value, key) {
            value.scope.forEach(function(value, key) {
                if (_this.tokenData.has(key)) {
                    _this.tokenData.set(key, _this.tokenData.get(key) + value - originTokenData.get(key));
                }
                if (_this.moduleGlobalVars.has(key)) {
                    _this.moduleGlobalVars.set(key, _this.moduleGlobalVars.get(key) + value - originGlobalVars.get(key));
                }
            })
        })

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
        this.dailyTokenIn = new Map();
        this.dailyTokenOut = new Map();
        

        // 将 tokenData + globalVars 更新到 moduleTmpParser，并覆盖回 moduleParser，最后重置 moduleTmpParser
        this.moduleTmpParser.forEach(function(value, key) {
            let tmpParser = value;
            _this.tokenData.forEach(function(value, key) {
                tmpParser.set(key, value);
            })
            _this.moduleGlobalVars.forEach(function(value, key) {
                tmpParser.set(key, value);
            })
            _this.moduleParser.set(key, tmpParser);
        });

        // TODO parser 和 tokenData 是冗余的，需要仔细考虑是否将二者合为一
        this.tokenData.forEach(function(value,key) {
            _this.parser.set(key, value);
        });

        this.moduleTmpParser = new Map();

        let obj = {version: 1, uid: this.id, label: this.label, day: this.curDay, data: {tokenData: this.tokenData, moduleGlobalVars: this.moduleGlobalVars }};
        this.indexDB.addData("poolHistoryData", obj);

        console.log("Pool: ", this.label, " updated module parser:", mapCopy(this.moduleParser));
        console.log("Pool: ", this.label, " updated token data:", mapCopy(this.tokenData));
        console.log("Pool: ", this.label, " updated global vars:", mapCopy(this.moduleGlobalVars));

    }

    // 拷贝 Parser 的作用域 scope 
    copyParser(srcParser) {
        let retParser = math.parser();
        let parserScope = srcParser.getAll();
        let entries = Object.entries(parserScope);
        for (let entry of entries) {
            retParser.set(entry[0], entry[1]);
        }

        return retParser;
    }

    // 新增当天流入本节点的 token 数据
    DailyTokenIn(token, amount) {
        if (!this.dailyTokenIn.has(token)) {
            this.dailyTokenIn.set(token, amount);
        }
        else {
            this.dailyTokenIn.set(token, this.dailyTokenIn.get(token) + amount);
        }
    }
    
    // 新增当天流出本节点的 token 数据
    DailyTokenOut(token, amount) {
        if (!this.tokenData.has(token)) {
            console.warn("Pool:", this.label, " does not have token:", token);
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
        this.label = label;
        this.preprocessToken(nodeData.tokens.tokenNames, nodeData.tokens.tokenAmounts);
        // TODO [Done] parser怎么更新？
        this.preprocessModule("update", nodeData.modules.moduleNames, nodeData.modules.moduleExpressions, nodeData.modules.globalVars);

        console.log("Pool: ", this.label, ", updated tokenData:", this.tokenData);
        console.log("Pool: ", this.label, ", updated moduleGlobalVars:", this.moduleGlobalVars);
        console.log("Pool: ", this.label, ", updated moduleData:", this.moduleData);
        console.log("Pool: ", this.label, ", updated module parser:", this.moduleParser);
    }
}