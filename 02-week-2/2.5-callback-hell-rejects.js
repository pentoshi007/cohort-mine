function setTimoutPromisified(duration) {
    return new Promise(function (resolve) {
        setTimeout(resolve, duration);
    });
}

function callback() {
    console.log("1 second passed");
}

// setTimoutPromisified(1000).then(callback);

// ============================================
//callback hell
function callbackHell() {
    setTimeout(function () {
        console.log("1 second passed");
        setTimeout(function () {
            console.log("2 seconds passed");
        }, 1000);
    }, 1000);
}

// ============================================
//promise chaining

setTimoutPromisified(1000).then(function () {
    console.log("1 second passed");
    return setTimoutPromisified(1000);
}).then(function () {
    console.log("2 seconds passed");
    return setTimoutPromisified(1000);
}).then(function () {
    console.log("3 seconds passed");
});


// ============================================
//async/await

async function asyncAwait() {
    await setTimoutPromisified(1000);
    console.log("1 second (async/await) passed");
    await setTimoutPromisified(1000);
    console.log("2 seconds (async/await) passed");
    await setTimoutPromisified(1000);
    console.log("3 seconds (async/await) passed");
}

asyncAwait();