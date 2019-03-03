# 简单的redis模块

*自己学习使用，目前仅支持get、set、hget、hset命令*

## 特点
> 实例化后，只管调用api（方法）就行，不用管理链接问题，内部会自动维护链接断开与重连。

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