const axios = require('axios');

async function fetchData() {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
}

fetchData();

async function axiosData() {
    const response = await axios.get('https://api.example.com/data');
    console.log(response.data);
}

axiosData();

async function fetchData2() {
    const response = await fetch('https://api.example.com/data',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer <token>'
            },
            body: JSON.stringify({
                name: 'John',
                age: 30
            })
        });
    const data = await response.json();
    console.log(data);
}

fetchData2();

async function axiosData2() {
    const response = await axios.post('https://api.example.com/data', {
        name: 'John',
        age: 30
    },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer <token>'
            }
        });
    console.log(response.data);
}