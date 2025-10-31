const fs = require('fs');
const contents = fs.readFileSync('./a.txt', 'utf8');
console.log(contents);
//above code is synchronous, it will block the main thread until the file is read
//so we need to use asynchronous code to avoid blocking the main thread
const asyncContents = fs.readFile('./a.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
    } else {
        console.log(data);
    }
});
console.log(asyncContents); //this will be printed before the file is read because it is asynchronous
//above code is asynchronous, it will not block the main thread until the file is read
//so we can use asynchronous code to avoid blocking the main thread
//but we need to use a callback function to get the data

// ============================================
// PROMISIFIED VERSIONS
// ============================================

// 1. Promisified setTimeout
function promiseTimeout(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Waited for ${ms}ms`);
        }, ms);
    });
}

// 2. Promisified fetch (fetch is already Promise-based, but here's a wrapper)
function promiseFetch(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Fetch error:', error);
            throw error;
        });
}

// 3. Promisified fs.readFile
function promiseReadFile(filePath, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Using promiseTimeout
console.log('\n--- Using promiseTimeout ---');
promiseTimeout(2000)
    .then(result => console.log(result))
    .catch(error => console.error(error));

// Example 2: Using promiseReadFile
console.log('\n--- Using promiseReadFile ---');
promiseReadFile('./a.txt')
    .then(data => console.log('File contents:', data))
    .catch(error => console.error('Error reading file:', error));

// Example 3: Chaining multiple promises
console.log('\n--- Chaining promises ---');
promiseTimeout(1000)
    .then(() => {
        console.log('After 1 second, reading file...');
        return promiseReadFile('./a.txt');
    })
    .then(data => {
        console.log('File read:', data);
        return promiseTimeout(1000);
    })
    .then(() => console.log('Done!'))
    .catch(error => console.error('Error:', error));

// ============================================
//when async call arrives, it is added to the event loop(web api, macrotask queue, microtask queue), then after completion, it is added to the callback queue, if stack is empty then it is added to the stack and executed.
