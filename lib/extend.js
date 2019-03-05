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
function expire(key, time){
    return  new Promise((resolve, reject)=>{
        this[sock].write(command.expire(key, time), err=>{
            console.log(11111);
            if(err){
                console.log(22222)
                reject({message: "sock write出错", info: err});
                return;
            }
            this[callbacks].push((status, data)=>{
                
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
            reject("mset参数数量必须为偶数");
            return;
        }
        //键校验，只能为英文
        for(let i = 0; i < args.length; i++){
            if(i%2 == 0){
                if( !/^\w+$/ig.test(args[i]) ){
                    reject("mset键只能为字母或数字");
                    return;
                }
            }
        }
        this[sock].write(command.mset(args), err=>{
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
                reject("mget键只能为字母或数字");
                return;
            }
        }
        this[sock].write(command.mget(args), err=>{
            console.log(err);
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
            this[callbacks].push((data) => {
                if (data.toString().indexOf("-") === -1) {
                    resolve();
                }
                else {
                    reject({ message: "redis sock返回报错", info: data.toString() });
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
                reject({ message: "sock底层write执行失败,请检查redis是否开启", info: err });
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
        hget
    }
}