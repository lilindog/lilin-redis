/*
 * @Author: lilindog 
 * @Date: 2019-10-14 01:19:47 
 * @Last Modified by: lilindog
 * @Last Modified time: 2019-10-19 13:37:02
 */
"use strict";

const net = require("net");
const extend = require("./lib/extend")("_sock", "_callbacks");
const Parser = require("./lib/resp-parser");
const {EventEmitter: Emitter} = require("events");

function Redis(host, port, pass){
    Emitter.call(this);

    if(!(this instanceof Redis)){
        throw new Error("Redis不能被直接调用，请使用new调用");
    }

    this.DEBUG = true;
    this._sock = null;
    this._callbacks = [];//回调队列
    this._host = host || "127.0.0.1";
    this._port = port || "6379";
    this._pass = pass || "";
    this._authorized = false;
    this._callbacks2 = [];//执行链接时候的回调存放队列
    this._chunks = Buffer.from([]);
    this._isConnecting = false; //是否正在连接中

    //部署parser
    this._Parser = new Parser();
    this._Parser.DEBUG = false;
    this._Parser.on("data", data => {
        this._callbacks.pop()(data);
    });
    this._Parser.on("warn", info => {
        this.emit("warn", info);
    });
    this._Parser.on("error", err => {
        this.emit("error", err);
    });

    //执行初始化
    this._init();
}

Redis.prototype = new Emitter();
Redis.prototype.constructor = Redis;

Redis.prototype._init = function(){
    this._loading = true;
    this._sock && this._sock.destroy();
    // console.log("执行链接");
    this._sock = net.createConnection({ host: this._host, port: this._port});

    this._sock.on("data", chunk=>{
        this._Parser.parse(chunk);
    });

    this._sock.on("ready", ()=>{
        // console.log("sock做好准备");
        this._callbacks2.forEach(f=>{
            f();
        });
        this._callbacks2 = [];
    });

    this._sock.on("close", ()=>{
        this.DEBUG && console.log("lilin-redis底层socket关闭");
        this._authorized = false;
        this._isConnecting = false;
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
Object.keys(extend).forEach(key => {
    const func = extend[key];
    Redis.prototype[key] = async function (...args) {
        //最后一个参数是否是回调函数
        const hasCb = (typeof args[args.length - 1] === "function") ? true : false;
        /**
         * 传递了回调函数不用返回promise 
         */
        if (hasCb) {
            const cb = args.pop();
            /**
             * 连接断开时 
             */
            if (this._sock.destroyed) {
                if (!this._isConnecting) {
                    this._isConnecting = true;
                    this._init();
                }
                if (this._pass && !this._authorized) {
                    this.DEBUG && console.log("--> a1");
                    this._callbacks2.push(async () => {
                        try {   
                            let res = await extend.auth.call(this, this._pass);
                            if (~res.indexOf("ERR" || res.indexOf("OK") === -1)) {
                                throw res;
                            }
                            res = await func.apply(this, args);
                            cb(null, res);
                        } catch(err) {
                            cb(err);
                        }
                    });
                } else {
                    this.DEBUG && console.log("--> a2");
                    this._callbacks2.push(async () => {
                        try {
                            let res = await func.apply(this, args);
                            cb(null, res);
                        } catch(err) {
                            cb(err);
                        }
                    });
                }
            } 
            /**
             * 连接正常时 
             */
            else {
                if (this._pass && !this._authorized){
                    this.DEBUG && console.log("--> a3");
                    try {
                        let res = await extend.auth.call(this, this._pass);
                        if (~res.indexOf("ERR" || res.indexOf("OK") === -1)) {
                            throw res;
                        }
                        res = await func.apply(this, args);
                        cb(null, res);
                    } catch(err) {
                        cb(err);
                    }
                } else {
                    this.DEBUG && console.log("--> a4");
                    try {
                        let res = await func.apply(this, args);
                        cb(null, res);
                    } catch(err) {
                        cb(err);
                    }
                }
            }
        } 
        /**
         * 没有传递回调函数一律返回promise 
         */
        else {
            /**
             * 未连接并且不再进行连接中，那么直接把数组 
             */
            if (this._sock.destroyed) {
                if (!this._isConnecting) {
                    this._isConnecting = true;
                    this._init();
                }
                return new Promise((resolve, reject) => {
                    if (this._pass && !this._authorized) {
                        this.DEBUG && console.log("--> b1");
                        this._callbacks2.push(async () => {
                            try {
                                let res = await extend.auth.call(this, this._pass);
                                this.DEBUG && console.log(res);
                                if (~res.indexOf("ERR" || res.indexOf("OK") === -1)) {
                                    reject(res);
                                    return;
                                }
                                this._authorized = true;
                                res = await func.apply(this, args);
                                resolve(res);
                            } catch(err) {
                                reject(err);
                            }
                        });
                    } else {
                        this.DEBUG && console.log("--> b2");
                        this._callbacks2.push(async () => {
                            try {
                                let res = await func.apply(this, args);
                                resolve(res);
                            } catch(err) {
                                reject(err);
                            }
                        });
                    }
                });
            } 
            /**
             * 已连接状态下
             */
            else {
                if (this._pass && !this._authorized) {
                    this.DEBUG && console.log("--> b3");
                    return new Promise(async (resolve, reject) => {
                        let res = await extend.auth.call(this, this._pass);
                        if (~res.indexOf("ERR" || res.indexOf("OK") === -1)) {
                            reject(res);
                            return;
                        }
                        this._authorized = true;
                        res = await func.apply(this, args);
                        resolve(res);
                    });
                } else {
                    this.DEBUG && console.log("--> b4");
                    return new Promise(async (resolve, reject) => {
                        try {
                            let res = await func.apply(this, args);
                            resolve(res);
                        } catch(err) {
                            reject(err);
                        }
                    });
                }
            }
        }
    }
});

module.exports = Redis;