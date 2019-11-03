const Redis = require("../index");
const fs = require("fs");

let redis = new Redis("127.0.0.1", "6379");
redis.DEBUG = false;

redis.on("warn", info => {
    fs.appendFileSync("warn.log", info);
});
redis.on("error", error => {
    fs.appendFileSync("error.log", error);
});

!async function(){
    try{

        // for (let i = 0; i < 20000; i++) {
            console.log(await redis.lpush("ttt", "a", "b", "c", "d"));
            
            console.log(new Date().toLocaleTimeString());
            let res = await redis.lrange("ttt", 0, - 1);
            console.log("长度：" + res.length);
            console.log(new Date().toLocaleTimeString());
            console.log(await redis.rpush("ttt", "a", "b", "c", "d", "e"));
            console.log(await redis.lrange("ttt", 0, 2000));
            redis.rpop("ttt", (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(data);
            });
        // }

        // function a (_a) {
        //     _a++;
        //     console.log(_a)
        //     if (_a >= 100000) return;
        //     a(_a);
        // }
        // a(0)

        // let _a = 0;
        // while (_a <= 100000) {
        //     _a ++;
        //     console.log(_a);
        // }

    }catch(err){
        console.log("!!!")
        console.log(err)
    }

    // redis.lrange("task", (err, data) => {
    //     if (err) {
    //         console.log("他妈的，错啦！");
    //         return;
    //     } 
    //     console.log("data：");
    //     console.log(data);
    // });

}();

// async function del(v){
//     let arr = await redis.lrange("test");
//     for(let i = 0; i < arr.length; i++)
//     {
//         if (arr[i] === v){
//             await redis.lset("test", i, "---");
//         }
//     }
//     await redis.lrem("test", 0, "---");
    
// }