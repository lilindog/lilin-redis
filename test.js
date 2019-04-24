const Redis = require("./redis");

let redis = new Redis("127.0.0.1", "6379", "8612");

!async function(){
    try{

        // console.log(await redis.lset("test", 0, "lilin"));
        // await redis.set("key1", `
        // 123
        // 456
        // 789
        // `);
        let res = await redis.lrange("task3");
        console.log(res);
        console.log(res[0]);
        // console.log("getkey1返回为: " + await redis.get("key1"));


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