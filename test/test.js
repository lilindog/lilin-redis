const Redis = require("../index");
const fs = require("fs");

let redis = new Redis("127.0.0.1", "6379");
redis.DEBUG = true;

redis.on("warn", info => {
    fs.appendFileSync("warn.log", info);
});
redis.on("error", error => {
    fs.appendFileSync("error.log", error);
});

!async function(){
    try {
        console.log(await redis.hdel("t1", "f1"));
    } catch(err) {
        console.log(err);
    }
}();
