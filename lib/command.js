"use strict"
/*
* 构建RESP协议标准的命令的一个类
* 传入数据构建命令并返回
*/
function Command(){}

Command.prototype.auth = function(pass)
{
    let str = `*2\r\n$4\r\nauth\r\n$${Buffer.from(pass).length}\r\n${pass}\r\n`;
    return str;
}

Command.prototype.expire = function(key, time){
    return `*3\r\n$6\r\nexpire\r\n$${key.length}\r\n${key}\r\n$${String(time).length}\r\n${time}\r\n`;
}

Command.prototype.set = function(key, value)
{
    let str = `*3\r\n$3\r\nset\r\n`;
    str += `$${key.length}\r\n${key}\r\n`;
    str += `$${Buffer.from(value).length}\r\n${value}\r\n`;
    return str;
}

Command.prototype.mset = function(...args){
    let str = `*`;
    str += (args.length + 1) + "\r\n$4\r\nmset\r\n";
    for(let i of args){
        str += `$${Buffer.from(String(i)).length}\r\n${i}\r\n`;
    }
    return str;
}

Command.prototype.get = function (key)
{
    let str = `*2\r\n$3\r\nget\r\n$${Buffer.from(key).length}\r\n${key}\r\n`;
    return str;
}

Command.prototype.mget = function(...args){
    let str = `*`;
    str += String(args.length + 1) + "\r\n$4\r\nmget\r\n";
    for(let i of args){
        str += `$${Buffer.from(String(i)).length}\r\n${i}\r\n`;
    }
    return str;
}

Command.prototype.hset = function(hash, field, value)
{   
    return `*4\r\n$4\r\nhset\r\n$${hash.length}\r\n${hash}\r\n$${field.length}\r\n${field}\r\n$${Buffer.from(value).length}\r\n${value}\r\n`;
}

Command.prototype.hmset = function(...args){
    let str = `*${args.length+1}\r\n$5\r\nhmset\r\n`;
    for(let i of args){
        str += `$${Buffer.from(String(i)).length}\r\n${i}\r\n`;
    }
    return str;
}

Command.prototype.hget = function (hash, field) 
{
    return `*3\r\n$4\r\nhget\r\n$${hash.length}\r\n${hash}\r\n$${field.length}\r\n${field}\r\n`;
}

Command.prototype.hmget = function(...args){
    let str = `*`;
    str += (args.length + 1) + "\r\n$5\r\nhmget\r\n";
    for (let i of args) {
        str += `$${Buffer.from(String(i)).length}\r\n${i}\r\n`;
    }
    return str;
}

module.exports = new Command();