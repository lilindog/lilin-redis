"use strict";

/*
* 目前仅仅支持get\set\hget\hset 这几个命令（不支持设置过期时间）
* 扩展redis命令请到extend文件下，并同时更新command文件下相对的命令构建方法
* created by lilin on 2019/3/2
* ??接下来，最好把命extend文件里方法下的socket是否链的判断逻辑放到该文件的扩展逻辑里边
*/ 


const net = require("net")
const extend = require("./lib/extend")("_sock", "_callbacks");
const handler = require("./lib/handler")("_callbacks", "_chunks");


function Redis(host, port, pass){
    if(!(this instanceof Redis)){
        throw new Error("Redis不能被直接调用，请使用new调用");
    }

    this._sock = null;
    this._callbacks = [];//回调队列
    this._host = host || "127.0.0.1";
    this._port = port || "6379";
    this._pass = pass || "";
    this._authorized = false;
    this._callbacks2 = [];//执行链接时候的回调存放队列
    this._chunks = "";

    //执行初始化
    this._init();
}
Redis.prototype._handler = handler;
let ii = 0;
Redis.prototype._init = function(){
    this._loading = true;
    this._sock && this._sock.destroy();
    // console.log("执行链接");
    this._sock = net.createConnection({ port: this._port, host: this._host });

    this._sock.on("data", chunk=>{
        this._handler(chunk);
    });

    this._sock.on("ready", ()=>{
        // console.log("sock做好准备");
        this._callbacks2.forEach(f=>{
            f();
        });
        this._callbacks2 = [];
    });

    this._sock.on("close", ()=>{
        console.log("sock关闭");
        this._authorized = false;
        console.log(this._sock.destroyed);
    });

    this._sock.on("error", err=>{
        this._destroyCallbacks(`sock发生错误[${err.toString()}]`);
        this._sock.destroy();
    });

    //将队列里的回调全部传入错误参数执行，触发其内部的promise为reject， 最终也达到了销毁队列的目的
    this._destroyCallbacks = function(text = "未指定错误"){
        this._callbacks = this._callbacks2.concat(this._callbacks2);
        this._callbacks2 = [];
        this._callbacks.forEach(f=>{
            f("-", `底层sock错误：${text}`);
        });
        this._callbacks = [];
    }

}
// for(let x in extend){
//     Redis.prototype[x] = extend[x];
// }
/*
* ---扩展api---
*
* 这里不直接对原型扩展来自extend里边的方法。
* 而是，以extend里的方法名为key来对原型定义全新的方法；当调用这个全新的方法时候，其作用：
* 1.自动校验连接并在需要的时候进行自动重连（使用者只管调用方法，不用管连接是否断开）
* 2.自动进行redis权限校验（实例化该类的时候传入pass参数此项才会生效）
* 3.自动队列维护(分为连个队列)：
*                           1.连接建立队列（用于在链接建立之前缓存方法，等连接建立之后执行）：
*                             连接在实例化后意外断开状态下，当再次调用方法的时候（可能存在高频率调用），将方法按调用顺序压入在一个队列里边（this.callbacks2 暂时称之为链接建立队列），
*                             当该队列压入第一个元素会执行重连，重连成功后会依次执行该队列里边缓存的方法，并清空该队列。
*
*                           2.数据响应队列（用于在redis数据回应的时候依次执行里边的方法）：
*                             这个队列里的方法来自调用方法时压入的接受数据的回调，当redis数据响应的时候，会依次执行该队列里的回调。
*
*/
for(let x in extend){

    //在原型上定义extend里对应名字的全新方法
    Redis.prototype[x] = function(...args){            

        //如果当前链接已经断开
        if(this._sock.destroyed)
        {   
            // console.log("断开重连。。。")
            //执行重链
            this._init();

            return new Promise((resolve, reject)=>{
                //当需要授权,并没有授权时候
                if(this._pass && !this._authorized)
                {   
                    //压入带授权逻辑的闭包到链接建立队列
                    this._callbacks2.push(()=>
                    {   
                        //执行授权
                        extend.auth.call(this, this._pass)
                        .then(()=>
                        {   
                            //修改授权状态为成功
                            this._authorized = true;
                            //执行真正的方法
                            extend[x].apply(this, args)
                            .then((data)=>
                            {
                                resolve(data);
                            })
                            .catch(err=>
                            {
                                reject(err);
                            });
                        })
                        .catch(err=>
                        {
                            reject(err);
                        });
                        
                    });
                }
                //如果不需要授权或者说已经授权
                else
                {   
                    //那么直接压入执行真正方法的闭包到链接建立队列
                    this._callbacks2.push(()=>
                    {   
                        extend[x].apply(this, args)
                        .then((data)=>{
                            resolve(data);
                        })
                        .catch(err=>{
                            reject(err);
                        });
                    });
                }
            });

        }
        //如果sock链接没有断开
        else
        {   
            //当需要授权,并没有授权时候
            if (this._pass && !this._authorized)
            {   
                return new Promise((resolve, reject)=>
                {
                    //开始执行授权
                    extend.auth.call(this, this._pass)
                    .then(()=>
                    {
                        //授权成功修改授权状态为true
                        this._authorized = true;
                        //并执行真正的方法
                        extend[x].apply(this, args)
                            .then(data =>
                            {
                                resolve(data);
                            })
                            .catch(err =>
                            {
                                reject(err);
                            });
                    })
                    .catch(err=>
                    {
                        reject(err);
                    });
                });
            }
            //如果不需要授权或者说已经授权，那么直接执行真正的方法
            else
            {
                return extend[x].apply(this, args);
            }
        }
    }

}


module.exports = Redis;