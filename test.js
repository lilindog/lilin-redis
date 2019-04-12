const Redis = require("./redis");
const fs = require("fs");


let redis = new Redis("127.0.0.1", "6379", "8612");


// let str = fs.readFileSync("./data.text");

!async function(){
    try{

        //await redis.lpush("task", str, str, str, str);
        // console.log(await redis.lrange("task", 0, -1));
        // console.log("test输出的数据： " + await redis.lrange("task"));
        await redis.lrange("task")



    }catch(err){
        console.log("test数据出错：");
        console.log(err);
    }

}();