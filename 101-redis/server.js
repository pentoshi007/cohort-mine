const express = require("express");
const app = express();
const axios = require("axios");
const client = require("./client");

app.get("/", async (req, res) => {
    const cachedData = await client.get("posts");
    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts");
    await client.set("posts", JSON.stringify(data));
    // await client.set("posts", JSON.stringify(data), "EX", 60);
    client.expire("posts", 60);
    return res.json(data);
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
