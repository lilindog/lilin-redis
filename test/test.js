const Redis = require("../redis");

let redis = new Redis("127.0.0.1", "6379");

!async function(){
    try{
        console.log(await redis.lpush("task", `12345`));
        console.log(await redis.lrange("task"));

        console.log(123);


    }catch(err){
        console.log("!!!")
        console.log(err)
    }

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