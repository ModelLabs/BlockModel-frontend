/**
 * KEY：0 Data：History Simulation Data
 * KEY：1 Data：History Simulation Data Marker
 * KEY：2 Data：History Property
 * KEY：3 Data：History Graph
 */

// 引入elementUi的Message组件
//import { Message } from "element-ui";

/*
 * 打开数据库
 * @param {object} dbName 数据库的名字
 * @param {string} storeName 仓库名称/表名称
 * @param {string} version 数据库的版本
 * @return {object} 该函数会返回一个数据库实例
 */
function openDB(dbName, storeName, version = 1) {
    return new Promise((resolve, reject) => {
        //  兼容浏览器
        let indexedDB =
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB,
            db;

        // 打开数据库，若没有则会创建
        const request = indexedDB.open(dbName, version);

        // 数据库打开成功回调
        request.onsuccess = function (result) {
            // 数据库对象
            db = result.target.result;
            resolve(db);
        };

        // 数据库打开失败的回调
        request.onerror = function (result) {
            reject(result);
        };

        // 数据库有更新时候的回调
        request.onupgradeneeded = function (result) {
            // 数据库创建或升级的时候会触发
            // 数据库对象
            db = result.target.result;
            // 创建存储库/也就是数据表
            let objectStore = db.createObjectStore(storeName, {
                // 这是主键
                // 主键使用的是数据表里的id值
                keyPath: "id",
                // 实现自增
                // autoIncrement: false

                // 如果有keyPath属性
                // 定义autoIncrement属性无效
                // 当没有keyPath属性时
                // 定义autIncrement属性有效
                // 且值必须为true
                // 否则报错
            });

            // 创建索引/属性，在后面查询数据的时候可以根据索引/属性查
            // 不能缺少的索引
            objectStore.createIndex("id", "id", { unique: false });
            /* objectStore.createIndex("name", "name", { unique: false });
            objectStore.createIndex("age", "age", { unique: false }); */
        };
    });
}

/*
 * 新增数据
 * @param {string} storeName 仓库名称/表名称
 * @param {string} data 数据
 */
function addData(storeName, data) {
    return new Promise((resolve, reject) => {
        let request = window.$db
            // 事务对象 指定表格名称和操作模式（"只读"或"读写"）
            .transaction([storeName], "readwrite")
            // 仓库对象
            .objectStore(storeName)
            .add(data);

        request.onsuccess = function (result) {
            /* Message({
                message: '添加成功',
                type: 'success'
            }); */
            resolve(result);
        };

        request.onerror = function (result) {
            /* Message({
                message: '添加失败',
                type: 'error'
            }); */
            reject(result);
        };
    });
}

/*
 * 通过getAll读取数据
 * @param {string} storeName 仓库名称/表名称
 */
function getAll(storeName) {
    return new Promise((resolve, reject) => {
        let request = window.$db
            // 事务
            .transaction(storeName, "readwrite")
            // 仓库对象
            .objectStore(storeName)
            // 指针对象
            .getAll();

        // 游标开启成功，逐行读数据
        request.onsuccess = function (result) {
            /* Message({
                message: '获取成功',
                type: 'success'
            }); */
            resolve(result);
        };

        request.onerror = function (result) {
            /* Message({
                message: '获取失败',
                type: 'error'
            }); */
            reject(result);
        };
    });
}

/*
 * 通过游标读取数据
 * @param {string} storeName 仓库名称/表名称
 */
function cursorGetData(storeName) {
    return new Promise((resolve, reject) => {
        let list = [],
            request = window.$db
                // 事务
                .transaction(storeName, "readwrite")
                // 仓库对象
                .objectStore(storeName)
                // 指针对象
                .openCursor();

        // 游标开启成功，逐行读数据
        request.onsuccess = function (result) {
            let cursor = result.target.result;
            if (cursor) {
                // 必须要检查
                list.push(cursor.value);
                // 遍历了存储对象中的所有内容
                cursor.continue();
            } else {
                /* Message({
                    message: '获取成功',
                    type: 'success'
                }); */
                resolve(list);
            }
        };

        request.onerror = function (result) {
            /* Message({
                message: '获取失败',
                type: 'error'
            }); */
            reject(result);
        };
    });
}

/*
 * 通过索引和游标查询记录/全值搜索
 * @param {string} storeName 仓库名称/表名称
 * @param {string} indexName 索引名/属性名
 * @param {string} indexValue 索引值/属性值
 */
function fullValueSearch(storeName, indexName, indexValue) {
    return new Promise((resolve, reject) => {
        let list = [],
            // 仓库对象
            request = window.$db
                .transaction(storeName, "readwrite")
                .objectStore(storeName)
                // 索引对象
                .index(indexName)
                // 指针对象
                .openCursor(IDBKeyRange.only(indexValue));

        request.onsuccess = function (result) {
            let cursor = result.target.result;
            if (cursor) {
                // 必须要检查
                list.push(cursor.value);
                // 遍历了存储对象中的所有内容
                cursor.continue();
            } else {
                /* Message({
                    message: '搜索成功',
                    type: 'success'
                }); */
                resolve(list);
            }
        };

        request.onerror = function (result) {
            /* Message({
                message: '搜索失败',
                type: 'error'
            }); */
            reject(result);
        };

        
    });
}

/*
 * 通过getAll实现模糊查找/查询/搜索/分页
 * @param {string} storeName 仓库名称/表名称
 * @param {string} searchName 搜索的字段/属性
 * @param {string} searchValue 搜索的值
 * @param {string} page 当前页数
 * @param {string} pageSize 每页大小
 */
function vagueLookup(storeName, searchName, searchValue, page, pageSize) {
    return new Promise((resolve, reject) => {
        let list = [],
            total = 0,
            len = 0,
            request = window.$db
                // 事务
                .transaction(storeName, "readwrite")
                // 仓库对象
                .objectStore(storeName)
                // 指针对象
                .getAll();

        request.onsuccess = function (result) {
            let res = result.target.result;
            /* Message({
                message: '查询成功',
                type: 'success'
            }); */
            // 倒序b-a
            res = res.sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate));
            // 总数
            total = res.length;

            // 搜索
            if (searchValue != '') {
                res.forEach(item => { if (item[searchName].indexOf(searchValue) !== -1) list.push(item); });
            } else {
                // 正常请求数据
                list = res;
            }

            // 每页大小
            // 如果大小大于数组长度
            // 就使用数组长度
            len = list.length > pageSize ? pageSize : list.length;
            // 第几页
            page = page == 1 ? 0 : (page - 1) * pageSize;

            resolve({
                total,
                list: list.splice(page, len)
            });
        };

        request.onerror = function (result) {
            /* Message({
                message: '查询失败',
                type: 'error'
            }); */
            reject(result);
        };
    });
}

/*
 * 更新数据
 * @param {string} storeName 仓库名称/表名称
 * @param {object} data 数据
 */
function updateDB(storeName, data) {
    return new Promise((resolve, reject) => {
        let request = window.$db
            // 事务对象
            .transaction([storeName], "readwrite")
            // 仓库对象
            .objectStore(storeName)
            .put(data);

        request.onsuccess = function (result) {
            /* Message({
                message: '更新成功',
                type: 'success'
            }); */
            resolve(result);
        };

        request.onerror = function (result) {
            /* Message({
                message: '更新失败',
                type: 'error'
            }); */
            reject(result);
        };
    });
}

/*
 * 通过主键删除数据
 * @param {string} storeName 仓库名称/表名称
 * @param {object} id 主键值
 */
function deleteDB(storeName, id) {
    return new Promise((resolve, reject) => {
        let request = window.$db
            .transaction([storeName], "readwrite")
            .objectStore(storeName)
            .delete(id);

        request.onsuccess = function (result) {
            /* Message({
                message: '删除成功',
                type: 'success'
            }); */
            resolve(result);
        };

        request.onerror = function (result) {
            /* Message({
                message: '删除失败',
                type: 'error'
            }); */
            reject(result);
        };
    });
}

let indexedDB = {
    deleteDB,
    updateDB,
    vagueLookup,
    fullValueSearch,
    cursorGetData,
    getAll,
    addData,
    openDB,
};

export default indexedDB;
