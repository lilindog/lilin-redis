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
            this[callbacks].push((data) => {
                if (data.toString().indexOf("-") === 1) {
                    reject({ message: "redis sock返回报错", info: data.toString() });
                }
                else {
                    resolve(data.toString());
                }
            });
        });
    });
}


module.exports = function(_sock, _callbacks){
    sock = _sock, callbacks = _callbacks;
    return {
        auth,
        set,
        get,
        hset,
        hget
    }
}