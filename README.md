# redis客户端

*最近更新内容*<br>

* ### 有更完善的resp解析；解析器用递归重写，支持无限层级RESP数组嵌套
* ### api同时支持Promise和回调函数
* ### redis返回错误直接返回给api调用者

## api

|api|参数|作用|resolved数据|备注|
|-|-|-|-|-|
|auth|pass|校验授权(需要密码是才用，否则报错)|null|不建议使用，因实例化该类时如果传递pass参数，会自动校验|
|expire|key,time|设置key多少时间后过期|1\|0|time参数为Number类型，以秒来计算|
|del|key|删除指定的key|1\|0||
|exists|key|检查指定的key是否存在| 1\|0 ||
|set|key, val|设置键值|null|-|
|get|key|获取指定键的值|val|-|
|mset|key1,val1,key2,val2,...|批量设置键|null|-|
|mget|key1, key2, ...|批量获取key|[val1, val2, ...]|-|
|hset|hash, field, val|设置hash字段|null|-|
|hget|hash, field|获取hash键的值|val|-|
|hmset|hash, field1, val1, ...|批量设置hash字段|null|-|
|hmget|hash, field1,...|批量获取hash字段|[val1,val2,...]|-|
|hkeys|hash|获取哈希表中所有的key|[key1, key2, ...]||
|hvals|hash|获取哈希表中所有的values|[val1, val2, ...]||
|hlen|hash|获取去哈希表中存储字段的数量|\<Number\>||
|lpush|list, val1,...|向列表头压入数据|null|-|
|rpush|list, val1,...|向列表压入数据|null|-|
|lpop|list|移除并获得列表头第一个元素|val|-|
|rpop|list|移除并获得列表最后一个元素|val|-|
|lrange|list, start, end|获取列表指定索引范围的数据|[val1,val2,...]|如果省略第2、3位参数，则默认返回列表全部元素|
|lrem|list,count, value|删除列表中的数据|\<Number\>|count > 0 时候，从左往右搜索，并删除count个与value匹配的元素; count<0时,从右往左搜索，删除count绝对值个与value匹配的元素；count = 0时候，删除所有与value匹配的元素|
|llen|list|获取列表长度|\<Number\>||
|lset|list, index, value|根据索引设置value(有点像数组的意思)|+ok|若设置失败，会触发reject|

*api在继续完善中。。。*

## 示例（callback）
```js
const Redis = require("redis");

let redis = new Redis("host", "port", "pass");

//回调函数都是错误优先
redis.lrange("listname", (err, data) => {
    if (err) {
        console.log("玛德，出错啦！");
        console.log(err);
        return;
    }
    console.log(data);
});
```

## 示例（Promise）
```javascript
const Redis = require("./redis");
let redis = new Redis("127.0.0.1", "port", "pass");//三个参数都为可选，pass参数不传按不检验授权处理
//只管调用方法就行，不用管理如node-redis里的ready事件，在这里都是内部自己维护与实现
redis.get("key")
.then(data=>{
    console.log(data);
})
.catch(err=>{
    console.log("发现异常");
    console.log(err);
});
```

## 示例（Async）
```javascript
const Redis = require("./redis");
let redis = new Redis("127.0.0.1", "port", "pass");//三个参数都为可选，pass参数不传按不检验授权处理
!async function(){
    try{
        console.log(await redis.set("a", "hello"));
        console.log(await redis.get("a"));

    }catch(err){
        console.log("发现异常");
        console.log(err);
    }
}();

```

## 大概逻辑
*懒得写，上草图, 大概就是这个逻辑*

![图片加载失败](./doc/img/img.jpg)

---