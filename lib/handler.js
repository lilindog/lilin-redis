"use strict";

//根据socket data事件返回数据处理redis返回数据
let callbacks = null, chunks = "";

function _(chunk){

    this[chunks] += chunk.toString();
    
    console.log(this[chunks].split("\r\n"));
    this[chunks] = "";


    //假数据触发方法resolved
    this[callbacks].shift()("+ok", "测试");
}

module.exports = (_callbacks, _chunks)=>{
    callbacks = _callbacks, chunks = _chunks;
    return _;
}
