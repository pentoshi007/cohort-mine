// Headers in Express.js
// - Headers are key-value pairs sent with HTTP requests and responses
// - They contain metadata about the request/response (content-type, authorization, user-agent, etc.)
// - Access request headers using: req.headers["header-name"] or req.headers.headerName
// - Header names are case-insensitive and automatically converted to lowercase
// - Common headers: "content-type", "authorization", "user-agent", "accept"
// - Custom headers often prefixed with "x-" (e.g., "x-user-id", "x-api-key")
// - Use headers for authentication, rate limiting, API versioning, etc.

//fetch api
// - Fetch API is a modern way to make HTTP requests in the browser
//all those background requests are made using the fetch api
async function getRecentPosts(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

const posts = await getRecentPosts('https://api.example.com/data');
console.log(posts);

//axios
// - Axios is a modern way to make HTTP requests in the browser
// - It is a promise-based API
// - It is more powerful than the fetch API
// - It is more easy to use than the fetch API
const axios = require('axios');
const response = await axios.get('https://api.example.com/data');
console.log(response.data);