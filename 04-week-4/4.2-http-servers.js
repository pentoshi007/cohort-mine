//the way to reach a server is by using its domain name or ip address
const express = require('express');
const app = express();
//check point middleware
app.use((req, res, next) => {
    console.log('Request received (from middleware)');
    next();
});
//post request checkpoint middleware
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log('Post request received (from middleware)');
        next();
    } else {
        next();
    }
});

//check point route
app.get('/', (req, res) => {
    console.log('Get request received');
    res.send('Hello World');
}
);

//check point server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

//check point route
app.get('/', (req, res) => {
    console.log('Get request received');
    res.send('Hello World');
});

/*Server is running on port 3000
Request received (from middleware)
Get request received
Request received (from middleware)*/
//explain why two times Request received (from middleware) is printed