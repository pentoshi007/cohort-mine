const express = require('express');
const app = express();
app.use(express.json());
let requestCounter = 0;
let numberOfRide1Requests = {};

setInterval(() => {
    numberOfRide1Requests = {};
}, 1000);

app.use((req, res, next) => {
    const userId = req.headers["user-id"];
    numberOfRide1Requests[userId] = (numberOfRide1Requests[userId] || 0) + 1;
    if (numberOfRide1Requests[userId] > 1) {
        return res.status(429).json({ error: 'You have made too many requests to ride1' });
    }
    next();
});
function isOldEnough(req, res, next) {
    const age = parseInt(req.query.age);
    if (isNaN(age) || age < 18) {
        return res.status(401).json({ error: 'You are not old enough to ride the ride1' });
    }
    next();
}

// app.use(isOldEnough);
app.use((req, res, next) => {
    requestCounter++;
    console.log(`Total requests: ${requestCounter}`);
    next();
});
app.get('/', (req, res) => {
    throw new Error("This is a test error");
});
app.get('/ride1', isOldEnough, (req, res) => {
    res.json({
        message: "you have successfully ridden the ride1"
    })
});
app.use((err, _req, res, _next) => {
    res.status(500).json({ error: err.message });
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
})