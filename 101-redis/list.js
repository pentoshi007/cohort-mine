const client = require("./client");

async function init() {
    await client.lpush("messages", "hey");
    await client.lpush("messages", "ho");
    await client.rpush("messages", "hir");
    const value = await client.lpop("messages");
    console.log(value);
}

init();