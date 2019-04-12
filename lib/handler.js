"use strict";

//对象中保存chunks的key和回调队列的key
let callbacks = "", chunks = "";

function handler(chunk){

    //积攒
    this[chunks] += chunk.toString();

    // console.log("handler开始")
    // console.log(this[chunks]);

    //如果开头为CRLF(可能是前面处理遗留的)，那就把他从chunks中去掉
    if( /^\r\n/.test(this[chunks]) ){
        //console.log("debug1");
        //console.log(this[chunks])
        this[chunks] = this[chunks].substr(2);
    }
    
    //开头不为*、$、:、-时候，清空积攒的chunks；并退出
    if(/^[^\*\$:\-\+]/.test(this[chunks].charAt(0)) ){
        //console.log("debug2");
        this[chunks] = "";
    }

    //递归
    const action = ()=>{
        //console.log("debug3");
        //处理+
        if(/^\+\w+\r\n/.test(this[chunks])){
            //console.log("debug4");
            this[callbacks][0] && this[callbacks].shift()("+", this[chunks].match(/^\+\w+\r\n/)[0].replace("\r\n", "") );
            this[chunks] = this[chunks].replace(/^\+\w+\r\n/, "");
            action();
        }

        //处理-
        if (/^\-[^(\r\n)]+\r\n/.test(this[chunks])){
            //console.log("debug5");
            this[callbacks][0] && this[callbacks].shift()("-", this[chunks].match(/^\-[^(\r\n)]+\r\n/)[0].replace(/[\-(\r\n)]/g, "") );
            this[chunks] = this[chunks].replace(/^\-[^(\r\n)]+\r\n/, "");
            action();
        }

        //处理:
        if (/^:\d+\r\n/.test(this[chunks])){
            //console.log("debug6");
            this[callbacks][0] && this[callbacks].shift()(":", this[callbacks].match(/^:\d+\r\n/)[0].replace(/[\-\r\n]/, ""));
            this[chunks] = this[chunks].replace(/^:\d+\r\n/, "");
            action();
        }

        //处理$
        if(/^\$.+/.test(this[chunks])){
            //console.log("debug7");
            //空字符
            if(/^\$0\r\n\r\n/.test(this[chunks])){
                //console.log("debu7-1");
                this[callbacks][0] && this[callbacks].shift()("$", "");
                this[chunks] = this[chunks].replace(/^\$0\r\n\r\n/, "");
                action();
            }
            //null
            if(/^\$\-1\r\n/.test(this[chunks])){
                //console.log("debug7-2");
                this[callbacks][0] && this[callbacks].shift()("$", null);
                this[chunks] = this[chunks].replace(/^\$-1\r\n/, "");
                action();
            }
            //正常
            if(/^\$\d+\r\n[^(\r\n)]+\r\n/.test(this[chunks])){
                //console.log("debug7-3");
                this[callbacks][0] && this[callbacks].shift()("$", this[chunks].match(/^\$\d+\r\n[^\r\n]+\r\n/)[0].replace(/(\$\d+\r\n|\r\n)/, ""));
                this[chunks] = this[chunks].replace(/^\$\d+\r\n[^(\r\n)]+\r\n/, "");
                action();
            }
        }

        //处理*
        if (/^\*.+/.test(this[chunks])) {
            //console.log("debug8");
            //空阵列
            if (/^\*0\r\n/.test(this[chunks])) {
                // console.log("debug8-1")
                this[callbacks][0] && this[callbacks].shift()("*", []);
                this[chunks] = this[chunks].replace(/^\*0\r\n/, "");
                action();
            }
            //null
            if (/^\*\-1\r\n/.test(this[chunks])) {
                // console.log("debug8-2")
                this[callbacks][0] && this[callbacks].shift()("*", null);
                this[chunks] = this[chunks].replace(/^\*\-1\r\n/, "");
                action();
            }
            //正常
            if (/^\*[1-9]\d*\r\n.+/.test(this[chunks])) {

                //console.log("进入*处理逻辑=-=-=-=-=-=-===========================================")

                //克隆一下chunks，因为后面的运算会进行删减操作
                let str = this[chunks];
                //先获取阵列长度
                let len = Number( str.match(/^\*[1-9]\d*\r\n/)[0].replace(/[\*\r\n]/, "") );
                //用记载已验证单元个数，最终与len一致才合法
                let count = 0;
                //记载已验证的字符，用于最终在chunks中清空
                let leftStr = "";
                //用于存储解阵列里析出来的数据
                let arr = [];

                /*
                * 开始计算count，最后如果count === len则验证通过
                * 开始计算，根据上面计算:、$、-、+、的方式一样
                * 这里用递实现循环， 后期维护在考虑这里实现多维度阵列的解析
                */
                //去除头部的*\d+\r\n
                str = str.replace(/^\*[1-9]\d*\r\n/, "");
                const action2 = ()=>{

                    /*
                    * 这里每次处理都先判断一下count是否等于len， 是则退出action2递归，进行后续的代码执行
                    */

                    //处理+
                    if (/^\+\w+\r\n/.test(str)) {
                        if(count === len) return;
                        //console.log("debug*1")

                        let s = str.match(/^\+\w+\r\n/)[0]
                        arr.push(s.replace(/[\+\w\r\n]/g, ""));

                        count += 1;
                        leftStr += s;
                        str = str.replace(/^\+\w+\r\n/, "");

                        action2();
                    }

                    //处理-
                    if (/^\-\w+\r\n/.test(str)) {
                        if (count === len) return;
                        //console.log("debug*2")

                        let s = str.match(/^\-\w+\r\n/)[0];
                        arr.push(s.replace(/[\-\w+\r\n]/g, ""));

                        count += 1;
                        leftStr += s;
                        str = str.replace(/^\-\w+\r\n/, "");

                        action2();
                    }

                    //处理:
                    if (/^:\d+\r\n/.test(str)) {
                        if (count === len) return;
                        //console.log("debug*3")

                        let s = str.match(/^:\d+\r\n/)[0];
                        arr.push(s.replace(/[:\d+\r\n]/g, ""));

                        count += 1;
                        leftStr += s;
                        str = str.replace(/^:\d+\r\n/, "");

                        action2();
                    }

                    //处理$
                    if (/^\$.+/.test(str)) {
                        //console.log("*$")
                        //空字符
                        if (/^\$0\r\n\r\n/.test(str)) {
                            if (count === len) return;
                            //console.log("debug*4")

                            let s = str.match(/^\$0\r\n\r\n/)[0];
                            arr.push(s.replace(/[\$0\r\n\r\n]/g, ""));

                            count += 1;
                            leftStr += s;
                            str = str.replace(/^\$0\r\n\r\n/, "");

                            action2();
                        }
                        //null
                        if (/^\$\-1\r\n/.test(str)) {
                            if (count === len) return;
                            //console.log("debug*5")

                            let s = str.match(/^\$\-1\r\n/)[0];
                            arr.push(s.replace(/[\$\-1\r\n]/g, ""));

                            count += 1;
                            leftStr += s;
                            str = str.replace(/^\$\-1\r\n/, "");

                            action2();
                        }
                        //正常
                        if (/^\$\d+\r\n[^(\r\n)]+\r\n/.test(str)) {
                            if (count === len) return;
                            //console.log("debug*6")

                            let s = str.match(/^\$\d+\r\n[^(\r\n)]+\r\n/)[0];
                            arr.push(s.replace(/(^\$\d+\r\n)|(\r\n)/g, ""));

                            count += 1;
                            leftStr += s;
                            str = str.replace(/^\$\d+\r\n[^(\r\n)]+\r\n/, "");

                            action2();
                        }
                    }
                }
                action2();


                /*
                * 这里判断count === len则通过，并在chunks中删除已解析的字符，然后继续执行递归
                * 反之不予理会
                */
               //console.log("debug88")
               //console.log(count, len)
                if(count === len){
                    // console.log("debug99")
                    // console.log(arr)
                    this[callbacks][0] && this[callbacks].shift()("*", arr);
                    this[chunks] = this[chunks].replace(leftStr, "");
                    action();
                }
            }
        }
    }
    action();    
    // console.log("handler完毕")
}

module.exports = function(_callbacks, _chunks){
    callbacks = _callbacks;
    chunks = _chunks;
    return handler;
}


/*

!!! 可能存在的bug

1. 191行的replace有几率出现重复，也就是说可能出现替换多个一样的数据
2. 注意传往回调的结果在替换RESP字符时候的误替换问题


*/


/*
 调试验证记录

 基本测试通过，尤其是*阵列大体积数据处理部分。

 最后调试日期：
 2019/04/13 凌晨00:51
 2019/04/13 凌晨01:18

*/