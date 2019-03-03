"use strict";

//根据socket data事件返回数据处理redis返回数据
let callbacks = null, chunks = "";

function _(chunk){
    //累积chunks
    this[chunks] += chunk;
    //拆分（以\r\n为间隔）当前累积的chunks为数组
    let arr = this[chunks].toString().split("\r\n");
    //[第一步] //去除多余不合理的空格
    for (let i = 0; i < arr.length; i++){
        //当前是空格时才进入删除空格逻辑
        if (arr[i] === "") {
            //前一个里边没有“+”、“-”才对当前空格进行删除
            if (!/^\+.{0,}/ig.test(arr[i - 1]) && !/^\-.{0,}/ig.test(arr[i - 1])) {
                arr.splice(i, 1);
            }
        }
    }
    //[第二步] 对“$-1”后一位填充空格, 因redis返回“$-1”时，后面没有数据，就不会用“\r\n”隔离，会干扰后面判断数组奇偶数
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === "$-1") {
            //紧跟的后一位不为‘’时才进行压入
            if (arr[i + 1] !== '') {
                arr.splice(i + 1, 0, '');
            }
        }
    }
    //[第三步] 如果当前炒粉的数组长度为偶数，则进行处理，触发队列里队头的回调函数
    if (arr.length % 2 === 0) {
        //清空积攒的chunks
        this[chunks] = "";
        //数组偶数位为数据，奇数位为redis返回状态码
        //按照返回数据的数量，依次执行队列头的回调函数
        for (let i = 0; i < arr.length; i += 2) {
            //执行队头的回调，传入redis返回状态码（如：+ok\-Err\$99）和返回数据
            this[callbacks].shift()(arr[i], arr[i + 1]);
        }
    }
}

module.exports = (_callbacks, _chunks)=>{
    callbacks = _callbacks, chunks = _chunks;
    return _;
}
