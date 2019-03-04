"use strict";

//根据socket data事件返回数据处理redis返回数据
let callbacks = null, chunks = "";

function handler(chunk){
    //累积chunk,并把CRLF换为&，方便后续处理
    this[chunks] += chunk.toString().replace(/\r\n/g, "&");
    
    //检测并处理chunks
    console.log("----------------------字符串：")
    console.log(this[chunks])

    //递归
    const _ = ()=>{

        //处理+
        if (this[chunks].charAt(0) === "+") {
            this[callbacks][0] && this[callbacks].shift()("+ok", "");
            this[chunks] = this[chunks].replace(/^\+[^&]+&/, "");
            // console.log("+处理过的：");
            // console.log(this[chunks]);
            _();
        }

        //处理-
        if (this[chunks].charAt(0) === "-") {
            let str = this[chunks].match(/^\-[^&]+/)[0];
            this[callbacks][0] && this[callbacks].shift()(str, "");
            this[chunks] = this[chunks].replace(/^\-[^&]+&/, "");
            // console.log("-处理过的：");
            // console.log(this[chunks]);
            _();
        }

        //处理:
        if (this[chunks].charAt(0) === ":") {
            let str = this[chunks].match(/^:[^&]+/)[0];
            this[callbacks][0] && this[callbacks].shift()(":", str.replace(":", "") );
            this[chunks] = this[chunks].replace(/^:[^&]+&/, "");
            // console.log(":处理过的：");
            // console.log(this[chunks]);
            _();
        }

        //处理$
        if(this[chunks].charAt(0) === "$"){
            let arr = this[chunks].split("&"), num = arr[0].replace("$", ""), str = arr[1];
            //检验数据长度合法才处理，否则等待数据继续积累
            if(str && str.length === Number(num) ){
                this[callbacks][0] && this[callbacks].shift()("$" + num, str);
                this[chunks] = this[chunks].replace(new RegExp("^\\"+arr[0]+"&"+arr[1]+"&"), "");
                // console.log(":处理过的：");
                // console.log(this[chunks]);
            }
        }

    }
    _();

    


    











    //假数据触发方法resolved
    // this[callbacks].shift()("+ok", "测试");
}

module.exports = (_callbacks, _chunks)=>{
    callbacks = _callbacks, chunks = _chunks;
    return handler;
}
