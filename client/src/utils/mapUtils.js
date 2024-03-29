// 给定 keys，初始化一个 map, value 全为 0
export function mapInit(keys) {
    let newMap = new Map();
    let key = keys.next();
    while (!key.done) {
        newMap.set(key.value, Number(0));
        key = keys.next();
    }
    return newMap;
}

export function mapCopy(src) {
    let ret = new Map();
    src.forEach(function(value, key) {
        ret.set(key, value);
    })

    return ret;
}
