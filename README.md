# 简单的redis模块

*自己学习使用，支持的命令在持续更新中。。。*

## api

*api均返回promise*

|api|参数|作用|resolved数据|备注|
|-|-|-|-|-|
|auth|pass|校验授权(需要密码是才用，否则报错)|null|不建议使用，因实例化该类时如果传递pass参数，会自动校验|
|set|key, val|设置键值|null|-|
|get|key|获取指定键的值|val|-|
|hset|key1,val1,key2,val2,...|批量设置键|null|-|
|hget|key1, key2, ...|批量获取key|[val1, val2, ...]|-|

*未完。。。*

```javascript
//简单示例
const Redis = require("./redis");

let redis = new Redis("127.0.0.1", "port", "pass");//三个参数都为可选，pass参数不传按不检验授权处理

//只管调用方法就行，不用管理如node-redis里的ready事件，在这里都是内部自己维护与实现
redis.get("key")
.then(data=>{
    console.log(data);
})
.catch(err=>{
    console.log(err);
});
```

## 大概逻辑
*懒得写，上草图*

![图片加载失败](./img.jpg)


## 简单测试

*如图：*

![图片加载失败](./GIF.gif)

---
## 相关参考资料
  * [RESP协议文档](https://redis.io/topics/protocol)