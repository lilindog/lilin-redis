"use strict";

//对象中保存chunks的key和回调队列的key
let callbacks = "", chunks = "";

function handler(){

    //积攒
    this[chunks] += chunk.toString();

    //如果开头为CRLF(可能是前面处理遗留的)，那就把他从chunks中去掉
    if( (this[chunks].charAt(0) + this[chunks].charAt(1)) === "\r\n" ){
         this[chunks] = this[chunks].substr(2);
    }
    
    //开头不为*、$、:、-时候，清空积攒的chunks；并退出
    if(/^[\*\$:\-\+]/.test(this[chunks].charAt(0)) ){
        this[chunks] = "";
    }

    //递归
    function action(){

        //处理+
        if(/^\+\d+\r\n/.test(this[chunks])){
            this[callbacks][0] && this[callbacks].shift("+", this[chunks].match(/^\+\d+\r\n/)[0].replace("\r\n", "") );
            this[chunks] = this[chunks].replace(/^\+\d\r\n/, "");
            action();
        }

        //处理-
        if (/^\-\w+\r\n/.test(this[chunks])){
            this[callbacks][0] && this[callbacks].shift()("-", this[chunks].match(/^\-\w+\r\n/)[0].replace(/[\-\r\n]/, "") );
            this[chunks] = this[chunks].replace(/^\-\w+\r\n/, "");
            action();
        }

        //处理:
        if (/^:\d+\r\n/.test(this[chunks])){
            this[callbacks][0] && this[callbacks].shift()(":", this[callbacks].match(/^:\d+\r\n/)[0].replace(/[\-\r\n]/, ""));
            this[chunks] = this[chunks].replace(/^:\d+\r\n/, "");
            action();
        }

        //处理$
        if(/^\$.+/.test(this[chunks])){
            //空字符
            if(/^\$0\r\n\r\n/.test(this[chunks])){
                this[callbacks][0] && this[callbacks].shift()("$", "");
                this[chunks] = this[chunks].replace(/^\$0\r\n\r\n/, "");
                action();
            }
            //null
            if(/^$\-1\r\n/.test(this[chunks])){
                this[callbacks][0] && this[callbacks].shift()("$", null);
                this[chunks] = this[chunks].replace(/^\$-1\r\n/, "");
                action();
            }
            //正常
            if(/^$\d+\r\n\.+\r\n/.test(this[chunks])){
                this[callbacks][0] && this[callbacks].shift()("$", this[chunks].match(/^$\d+\r\n\.+\r\n/)[0].replace(/(\$\d+\r\n|\r\n)/, ""));
                this[chunks] = this[chunks].replace(/^$\d+\r\n\.+\r\n/, "");
                action();
            }
        }

        //处理*
        if (/^\*.+/.test(this[chunks])) {
            //空阵列
            if (/^\*0\r\n/.tets(this[chunks])) {
                this[callbacks][0] && this[callbacks].shift()("*", []);
                this[chunks] = this[chunks].replace(/^\*0\r\n/, "");
                action();
            }
            //null
            if (/^\*-1\r\n/.test(this[chunks])) {
                this[callbacks][0] && this[callbacks].shift()("*", null);
                this[chunks] = this[chunks].replace(/^\*-1\r\n/, "");
                action();
            }
            //正常
            if (/^\*[1-9]\d*\r\n.+/.test(this[chunks])) {
                //继续写这里？？？
            }
        }

    }
    acton();    
    
}

module.exports = function(_callbacks, _chunks){
    callbacks = _callbacks;
    chunks = _chunks;
    return handler;
}