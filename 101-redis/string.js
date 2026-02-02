const client = require("./client");

async function init() {
    await client.set("name:2", "aniket");
    const value = await client.get("name:2");
    await client.expire("name:2", 0);

    console.log(value);
}

init();
