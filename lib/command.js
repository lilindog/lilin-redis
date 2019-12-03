/*
 * @Author: lilindog 
 * @Date: 2019-10-14 01:37:08 
 * @Last Modified by: lilindog
 * @Last Modified time: 2019-12-02 22:36:42
 */
"use strict"

function Command(){}

Command.prototype.auth = function(pass)
{
    let str = `*2\r\n$4\r\nauth\r\n$${Buffer.from(pass).length}\r\n${pass}\r\n`;
    return str;
}

Command.prototype.expire = function(key, time){
    return `*3\r\n$6\r\nexpire\r\n$${key.length}\r\n${key}\r\n$${String(time).length}\r\n${time}\r\n`;
}

Command.prototype.del = function(key){
    return `*2\r\n$3\r\ndel\r\n$${Buffer.from(key).length}\r\n${key}\r\n`;
}

Command.prototype.exists = function (key){
    return `*2\r\n$6\r\nexists\r\n$${Buffer.from(key).length}\r\n${key}\r\n`;
}

Command.prototype.set = function(key, value)
{
    let str = `*3\r\n$3\r\nset\r\n`;
    str += `$${key.length}\r\n${key}\r\n`;
    str += `$${Buffer.from(value).length}\r\n${value}\r\n`;
    return str;
}

Command.prototype.setex = function (key, time, value) {
    //这里的时间参数（RESP协议）传递，我以为是“:”声明，经测试报错；改为“$”声明正常。也就是说时间参数在RESP解释中，这里也是字符串。
    const str = `*4\r\n$5\r\nsetex\r\n$${Buffer.from(key).length}\r\n${key}\r\n$${String(time).length}\r\n${time}\r\n$${Buffer.from(value).length}\r\n${value}\r\n`;
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

Command.prototype.hdel = function (hash, field) {
    return `*3\r\n$4\r\nhdel\r\n$${Buffer.from(hash).length}\r\n${hash}\r\n$${Buffer.from(field).length}\r\n${field}\r\n`;
}

Command.prototype.hmget = function(...args){
    let str = `*`;
    str += (args.length + 1) + "\r\n$5\r\nhmget\r\n";
    for (let i of args) {
        str += `$${Buffer.from(String(i)).length}\r\n${i}\r\n`;
    }
    return str;
}

Command.prototype.hkeys = function(key){
    return `*2\r\n$5\r\nhkeys\r\n$${Buffer.from(key).length}\r\n${key}\r\n`;
}

Command.prototype.hvals = function (key){
    return `*2\r\n$5\r\nhvals\r\n$${Buffer.from(key).length}\r\n${key}\r\n`;
}

Command.prototype.hlen = function (key) {
    return `*2\r\n$4\r\nhlen\r\n$${Buffer.from(key).length}\r\n${key}\r\n`;
}

Command.prototype.lpush = function(...args){
    let str = `*${args.length+1}\r\n$5\r\nlpush\r\n`;
    for(let i of args){
        str += `$${Buffer.from(i).length}\r\n${i}\r\n`;
    }
    return str;
}

Command.prototype.rpush = function (...args){
    let str = `*${args.length + 1}\r\n$5\r\nrpush\r\n`;
    for (let i of args) {
        str += `$${Buffer.from(i).length}\r\n${i}\r\n`;
    }
    return str;
}

Command.prototype.lrange = function (list, begin, end) {
    let str = `*4\r\n$6\r\nlrange\r\n$${Buffer.from(list).length}\r\n${list}\r\n$${String(begin).length}\r\n${begin}\r\n$${String(end).length}\r\n${end}\r\n`;
    return str;
}

Command.prototype.lpop = function (list) {
    let str = `*2\r\n$4\r\nlpop\r\n$${Buffer.from(list).length}\r\n${list}\r\n`;
    return str;
}

Command.prototype.rpop = function (list) {
    let str = `*2\r\n$4\r\nrpop\r\n$${Buffer.from(list).length}\r\n${list}\r\n`;
    return str;
}

Command.prototype.lrem = function (key, count, value){
    return `*4\r\n$4\r\nlrem\r\n$${Buffer.from(key).length}\r\n${key}\r\n$${String(count).length}\r\n${count}\r\n$${Buffer.from(String(value)).length}\r\n${value}\r\n`;
}

Command.prototype.llen = function(key){
    return `*2\r\n$4\r\nllen\r\n$${Buffer.from(key).length}\r\n${key}\r\n`;
}

Command.prototype.lset = function (key, index, value){
    return `*4\r\n$4\r\nlset\r\n$${Buffer.from(String(key)).length}\r\n${key}\r\n$${Buffer.from(String(index)).length}\r\n${index}\r\n$${Buffer.from(String(value)).length}\r\n${value}\r\n`;
}

module.exports = new Command();