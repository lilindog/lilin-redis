const Redis = require("../redis");

let redis = new Redis("127.0.0.1", "6379");

!async function(){
    // try{
    //     console.log(await redis.lpush("task", `12345`));
    //     console.log(await redis.lrange("task"));

    //     console.log(123);

    //     setTimeout(async () => {
    //         console.log(await redis.lpush("task", `12345`));
    //     }, 10000);

    // }catch(err){
    //     console.log("!!!")
    //     console.log(err)
    // }

    redis.lrange("task", (err, data) => {
        if (err) {
            console.log("他妈的，错啦！");
            return;
        } 
        console.log("data：");
        console.log(data);
    });

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