const Redis = require("./redis");
const fs = require("fs");


let redis = new Redis("127.0.0.1", "6379", "8612");


// let str = fs.readFileSync("./data.text");

!async function(){
    
    try{
        console.log(await redis.get("aa") === "黎林");
        // console.log(await redis.lrange("task"));
        console.log(await redis.get("name"));
        console.log(await redis.get("age"));

        

    }catch(err){
        console.log("test数据出错：");
        console.log(err);
    }


}();
