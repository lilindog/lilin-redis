"use strict";

//根据socket data事件返回数据处理redis返回数据
let callbacks = null, chunks = "";

function handler(chunk){
    //模拟*复合数据
    // chunk = `*5\r\n+ok\r\n-err\r\n$5\r\nlilin\r\n$-1\r\n:8\r\n`;

    //累积chunk,并把CRLF换为&，方便后续处理
    this[chunks] += chunk.toString().replace(/\r\n/g, "&");
    
    //检测并处理chunks
    // console.log("----------------------字符串：")
    // console.log(this[chunks])

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
            //无数据
            if(this[chunks].charAt(1) === "-"){
                this[callbacks][0] && this[callbacks].shift()("$-1", "");
                this[chunks] = this[chunks].replace(/^\$\-1&/, "");
                _();
            }
            //有数据
            else{
                let arr = this[chunks].split("&"), num = arr[0].replace("$", ""), str = arr[1];
                //检验数据长度合法才处理，否则等待数据继续积累
                if (str && str.length === Number(num)) {
                    this[callbacks][0] && this[callbacks].shift()("$" + num, str);
                    this[chunks] = this[chunks].replace(new RegExp("^\\" + arr[0] + "&" + arr[1] + "&"), "");
                    // console.log("$处理过的：");
                    // console.log(this[chunks]);
                    _();
                }
            }
        }

        //处理* (所有规则中较为复杂的)
        if(this[chunks].charAt(0) === "*"){
            if( /^\*\d+/.test(this[chunks]) ){
                let 
                len = this[chunks].match(/^\*[^&]+/)[0].replace("*", ""),
                leftStr = this[chunks].replace(new RegExp("^\\*"+len+"&"), "");
                //以下的逻辑检查位数是否足
                let
                _count = 0,//计数，用作与len对比的依据
                _overStr = "*"+len+"&",//用作后面this[chunks].replace(_overStr)
                _arr = leftStr.split("&"),//当前chunks分割的数组
                arr = [];//结果数组，用于成功时传递给回调

                /*
                * 处理阵列里边不同的类型【-，+，：，$】
                * !! 这里暂时不处理二维阵列，虽然官网说了有了能返回多维阵列，但实际测试不会。
                */
                for(let i = 0; i < Number(len); i++){
                    if(/^\+\w+$/.test(_arr[i])){//+
                        // console.log("+")
                        _count++;
                        arr.push(true);
                        _overStr += _arr[i]+"&";
                        continue;
                    }
                    if (/^\-\w+$/.test(_arr[i])) {//-
                        // console.log("-")
                        _count++;
                        arr.push(false);
                        _overStr += _arr[i] + "&";
                        continue;
                    }
                    if (/^:\w+$/.test(_arr[i])) {//:
                        // console.log(":")
                        _count++;
                        arr.push(_arr[i].replace(":", ""));
                        _overStr += _arr[i] + "&";
                        continue;
                    }
                    if (/^\$.+$/.test(_arr[i])) {//$
                        // console.log("$")
                        if( /^\$\-1/.test(_arr[i]) ){//为空时
                            _count++;
                            arr.push("");
                            _overStr += _arr[i] + "&";
                        }else{//不为空时
                            _overStr += _arr[i] + "&" + _arr[i + 1] + "&";
                            _count++;
                            arr.push(_arr[i+1]);
                            _arr.splice(i+1, 1);//删除，配合循环
                        }
                        continue;
                    }
                }
                //检测count与len匹配就触发队列回调
                if (_count === Number(len)) {
                    this[callbacks][0] && this[callbacks].shift()("*" + len, arr);
                    this[chunks] = this[chunks].replace(_overStr, "");
                    // console.log("*处理过的：");
                    // console.log(this[chunks]);
                    _();
                }
            }
            if( /^\*-1/.test(this[chunks]) ){
                this[callbacks][0] && this[callbacks].shift()("*-1", "");
                this[chunks] = this[chunks].replace("*-1&", "");
            }
            if( /^\*0/.test(this[chunks]) ){
                this[callbacks][0] && this[callbacks].shift()("*0", []);
                this[chunks] = this[chunks].replace("*0&", "");
            }
        }

    }
    _();
}

module.exports = (_callbacks, _chunks)=>{
    callbacks = _callbacks, chunks = _chunks;
    return handler;
}
