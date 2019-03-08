"use strict";

const command = require("./command");
let 
sock = null, //<String> 
callbacks = null; //<Array>


//redis密码鉴权（相当于登录）
function auth(pass) {
    return new Promise((resolve, reject) => {
        if (this[sock].destroyed) {
            reject({ message: "sock已被销毁,请检查redis服务是否开启", info: "" });
            return;
        }
        this[sock].write(command.auth(pass), err => {
            if (err) {
                reject({ message: "sock底层发送命令失败", info: err });
                return;
            }
            this[callbacks].push((status, data) => {
                if (status.indexOf("-") < 0) {
                    resolve();
                }
                else {
                    reject({ message: "redis sock返回报错", info: status });
                }
            });

        });
    });
}

//设置键过期时间
//@params key <String>
//@params time <Number> 以秒为单位
//@return Promise
function expire(key, time){
    return  new Promise((resolve, reject)=>{
        console.log(command.expire(key, time))
        this[sock].write(command.expire(key, time), err=>{
            if(err){
                reject({message: "sock write出错", info: err});
                return;
            }
            this[callbacks].push((status, data)=>{
                if(status.indexOf("-") === -1){
                    resolve(data);
                }else{
                    reject({message: "redis sock返回报错", info: status});
                }
            });
        });
    });
}

//设置键值对
function set(key, value){
    return new Promise((resolve, reject) => {
        if (this[sock].destroyed) {
            reject({ message: "sock已被销毁,请检查redis服务是否开启", info: "" });
            return;
        }
        this[sock].write(command.set(key, value), err => {
            if (err) {
                reject({ message: "sock底层发送命令失败", info: err });
                return;
            }
            this[callbacks].push((status, data) => {
                if (status.indexOf("+") > -1) {
                    resolve();
                }
                else {
                    reject({ message: "redis sock返回报错", info: status });
                }
            });
        });
    });
}

//批量设置键值对
function mset(...args){
    return new Promise((resolve, reject)=>{
        args = Array.prototype.slice.call(args);
        //参数校验
        if( (args.length % 2) !== 0){
            reject({message: "mset参数数量必须为偶数", info: ""});
            return;
        }
        //键校验，只能为英文
        for(let i = 0; i < args.length; i++){
            if(i%2 == 0){
                if( !/^\w+$/ig.test(args[i]) ){
                    reject({message: "mset键只能为字母或数字", info: ""});
                    return;
                }
            }
        }
        this[sock].write(command.mset(...args), err=>{
            if(err){
                reject({ message: "sock底层write执行出错", info: err });
                return;
            }
            this[callbacks].push((status, data)=>{
                if(status.indexOf("+") > -1){
                    resolve(data);
                }else{
                    reject({ message: "redis sock返回报错", info: status });
                }
            });
        });

    });
}

//获取键值对
function get(key) {
    return new Promise((resolve, reject) => {
        if(this[sock].destroyed){
            reject({ message: "sock已被销毁,请检查redis服务是否开启", info: "" });
            return;
        }
        this[sock].write(command.get(key), err => {
            if (err) {
                reject({ message: "sock底层write执行出错", info: err });
                return;
            }
            this[callbacks].push((status, data) => {
                if (status.indexOf("-") === 0) {
                    reject({ message: "redis sock返回报错", info: status });
                }
                else {
                    resolve(data);
                }
            });
        });
    });
}

//批量获取键值对
function mget(...args){
    return new Promise((resolve, reject)=>{
        args = Array.prototype.slice.call(args);
        //键校验，只能为英文
        for(let i = 0; i < args.length; i++){
            if( !/^\w+$/ig.test(args[i]) ){
                reject({message: "mget键只能为字母或数字", info: ""});
                return;
            }
        }
        this[sock].write(command.mget(...args), err=>{
            if(err){
                reject({message: "sock write出错", info: err});
                return;
            }
            this[callbacks].push((status, data)=>{
                if(data.indexOf("-") === 0){
                    reject({message: "sock返回错误", info: status});
                }else{
                    resolve(data);
                }
            });
        });
    });
}

//设置哈希表字段
function hset(hash, field, value) {
    return new Promise((resolve, reject) => {
        if (this[sock].destroyed) {
            reject({ message: "sock已被销毁,请检查redis服务是否开启", info: "" });
            return;
        }
        this[sock].write(command.hset(hash, field, value), err => {
            if (err) {
                reject({ message: "sock底层发送命令失败", info: err });
                return;
            }
            this[callbacks].push((status, data) => {
                if (status.indexOf("-") === -1) {
                    resolve();
                }
                else {
                    reject({ message: "redis sock返回报错", info: status });
                }
            });
        });
    });
}

//批量设置哈希表字段
function hmset(...args){
    return new Promise((resolve, reject)=>{
        args = Array.prototype.slice.call(args);
        if( (args.length-1)%2 !== 0 ){
            reject({message: "hmset参数数量错误", info: ""});
            return;
        }
        for(let i = 1; i < args.length; i+=2){
            if( !/^\w+$/.test(args[i]) ){
                reject({ message: "hmset 参数里的Key只能为字母和数字", info: "" });
                return;
            }
        }
        this[sock].write(command.hmset(...args), err=>{
            if(err){
                reject({ message: "sock底层发送命令失败", info: err });
                return;
            }
            this[callbacks].push((status, data)=>{
                if(status.indexOf("+") === 0){
                    resolve();
                }else{
                    reject({ message: "redis sock返回报错", info: status });
                }
            });
        });
    });
}

//获取哈希表字段
function hget(hash, field, value) {
    return new Promise((resolve, reject) => {
        if (this[sock].destroyed) {
            reject({ message: "sock已被销毁,请检查redis服务是否开启", info: "" });
            return;
        }
        this[sock].write(command.hget(hash, field, value), err => {
            if (err) {
                reject({ message: "sock底层write执行失败", info: err });
                return;
            }
            this[callbacks].push((status, data) => {
                if (status.indexOf("-") === 0) {
                    reject({ message: "redis sock返回报错", info: status });
                }
                else {
                    resolve(data);
                }
            });
        });
    });
}

//批量获取哈希表里的值
function hmget(...args){
    return new Promise((resolve, reject)=>{
        for (let i = 1; i < args.length; i++){
            if (!/^\w+$/.test(args[i])){
                reject({ message: "hmget 参数里的Key只能为字母和数字", info: "" });
                return;
            }
        }
        this[sock].write(command.hmget(...args), err=>{
            if(err){
                reject({ message: "sock底层write执行失败,请检查redis是否开启", info: err });
                return;
            }
            this[callbacks].push((status, data)=>{
                if (status.indexOf("-") === -1){
                    resolve(data);
                } else {
                    reject({ message: "redis sock返回报错", info: status });
                }
            });
        });
    });
}

//压入数据到列表头部
function lpush(...args) {
    return new Promise((resolve, reject)=>{
        this[sock].write(command.lpush(...args), err=>{
            if(err){
                reject({ message: "sock底层write执行失败,请检查redis是否开启", info: err });
                return;
            }
            this[callbacks].push((status, data)=>{
                if(status.indexOf(":") === 0){
                    resolve();
                }else{
                    reject({message: "redis sock返回错误", info: status});
                }
            });
        });
    });
}

//压入数据到列表尾部
function rpush(...args) {
    return new Promise((resolve, reject) => {
        this[sock].write(command.rpush(...args), err => {
            if (err) {
                reject({ message: "sock底层write执行失败,请检查redis是否开启", info: err });
                return;
            }
            this[callbacks].push((status, data) => {
                if (status.indexOf(":") === 0) {
                    resolve();
                } else {
                    reject({ message: "redis sock返回错误", info: status });
                }
            });
        });
    });
}

//获取列表指定范围数据
function lrange(list, begin = 0, end = -1){
    return new Promise((resolve, reject)=>{
        if(!list || (typeof begin !== 'number') || (typeof end !== 'number') ){
            reject({message: "lrange传入参数不正确", info: ""});
            return;
        }
        this[sock].write(command.lrange(list, begin, end), err=>{
            if(err){
                reject({ message: "sock底层write执行失败,请检查redis是否开启", info: err });
                return;
            }
            this[callbacks].push((status, data)=>{
                if(status.indexOf("-") === 0){
                    reject({message: "redis sock返回错误", info: status});
                }else{
                    resolve(data);
                }
            });
        });
    });
}

//移除并返回列表的第一个元素
function lpop(list){
    return new Promise((resolve, reject)=>{
        if(!list){
            reject({message: "list传入参数缺失", info: ""});
            return;
        }
        if(!/^\w+$/i.test(list)){
            reject({ message: "list参数只能为字母或数字", info: "" }) ;
            return;
        }
        this[sock].write(command.lpop(list), err=>{
            if(err){
                reject({ message: "sock底层write执行失败,请检查redis是否开启", info: err });
                return;
            }
            this[callbacks].push((status, data) => {
                if (status.indexOf("-") === 0) {
                    reject({ message: "redis sock返回错误", info: status });
                } else {
                    resolve(data);
                }
            });
        });
    });
}

//移除并返回最后一个元素
function rpop(list) {
    return new Promise((resolve, reject) => {
        if (!list) {
            reject({ message: "list传入参数缺失", info: "" });
            return;
        }
        if (!/^\w+$/i.test(list)) {
            reject({ message: "list参数只能为字母或数字", info: "" });
            return;
        }
        this[sock].write(command.rpop(list), err => {
            if (err) {
                reject({ message: "sock底层write执行失败,请检查redis是否开启", info: err });
                return;
            }
            this[callbacks].push((status, data) => {
                if (status.indexOf("-") === 0) {
                    reject({ message: "redis sock返回错误", info: status });
                } else {
                    resolve(data);
                }
            });
        });
    });
}


module.exports = function(_sock, _callbacks){
    sock = _sock, callbacks = _callbacks;
    return {
        auth,
        expire,
        set,
        mset,
        get,
        mget,
        hset,
        hmset,
        hget,
        hmget,
        lpush,
        rpush,
        lrange,
        lpop,
        rpop
    }
}