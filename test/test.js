const Redis = require("../redis");

let redis = new Redis("127.0.0.1", "6379");
redis.DEBUG = false;

!async function(){
    try{

        console.log(await redis.hvals("h1"));

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