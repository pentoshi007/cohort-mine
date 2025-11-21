// Arrow functions provide a shorter syntax for writing functions
// Introduced in ES6 (2015)

// 1. Basic Syntax Comparison
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const addArrow = (a, b) => {
    return a + b;
};

// Shorter arrow function (implicit return)
const addShort = (a, b) => a + b;

console.log(add(2, 3));        // 5
console.log(addArrow(2, 3));   // 5
console.log(addShort(2, 3));   // 5

// 2. Single Parameter (parentheses optional)
const square = x => x * x;
const greet = name => `Hello, ${name}!`;

console.log(square(5));        // 25
console.log(greet('Alice'));   // Hello, Alice!

// 3. No Parameters (parentheses required)
const getRandom = () => Math.random();
console.log(getRandom());      // Random number

// 4. Multiple Lines (need curly braces and explicit return)
const calculateArea = (length, width) => {
    const area = length * width;
    console.log(`Calculating area...`);
    return area;
};

console.log(calculateArea(5, 3)); // 15

// 5. THE 'this' KEYWORD - Key Difference!
// Arrow functions DO NOT have their own 'this'
// They inherit 'this' from the surrounding scope (lexical this)

// Traditional function - 'this' depends on how it's called
const person1 = {
    name: 'John',
    sayHello: function () {
        console.log(`Hello, I'm ${this.name}`);
    }
};
person1.sayHello(); // Hello, I'm John

// Arrow function - 'this' is inherited from outer scope
const person2 = {
    name: 'Jane',
    sayHello: () => {
        console.log(`Hello, I'm ${this.name}`); // 'this' is NOT person2!
    }
};
person2.sayHello(); // Hello, I'm undefined (or window.name in browser)

// 6. Practical Example: setTimeout
const counter = {
    count: 0,

    // Traditional function - 'this' gets lost
    startTraditional: function () {
        setTimeout(function () {
            this.count++; // 'this' is NOT counter here!
            console.log('Traditional:', this.count); // NaN or undefined
        }, 1000);
    },

    // Arrow function - 'this' is preserved
    startArrow: function () {
        setTimeout(() => {
            this.count++; // 'this' IS counter here!
            console.log('Arrow:', this.count); // Works correctly
        }, 1000);
    }
};

// counter.startTraditional(); // Doesn't work as expected
// counter.startArrow();        // Works correctly

// 7. Window Object and 'this'
// In browser, global 'this' refers to window object
// In Node.js, global 'this' refers to global object

// Arrow function at global level
const globalArrow = () => {
    console.log(this); // In browser: window, In Node.js: {} or global
};

// Traditional function at global level
function globalTraditional() {
    console.log(this); // In browser: window, In Node.js: global
}

// 8. When NOT to use Arrow Functions
// a) Object methods (when you need 'this' to refer to the object)
const dog = {
    name: 'Buddy',
    bark: () => {
        console.log(`${this.name} says woof!`); // Won't work!
    }
};

// b) Event handlers (when you need 'this' to refer to the element)
// button.addEventListener('click', () => {
//     this.classList.toggle('active'); // Won't work!
// });

// c) Constructors (arrow functions can't be used as constructors)
// const Person = (name) => {
//     this.name = name; // Error: Arrow functions cannot be used as constructors
// };

// 9. Array Methods with Arrow Functions (Very Common!)
const numbers = [1, 2, 3, 4, 5];

// map - transform each element
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter - keep elements that pass a test
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4]

// reduce - accumulate values
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// 10. Returning Objects (need parentheses)
const createPerson = (name, age) => ({ name: name, age: age });
// OR with shorthand
const createPersonShort = (name, age) => ({ name, age });

console.log(createPerson('Alice', 25)); // { name: 'Alice', age: 25 }

// Summary:
// ✅ Use arrow functions for: callbacks, array methods, short functions
// ❌ Avoid arrow functions for: object methods, event handlers, constructors
// 🔑 Key difference: Arrow functions don't have their own 'this'

// 11. More map() examples
const prices = [10, 20, 30, 40];
const withTax = prices.map(price => price * 1.1); // Add 10% tax
console.log(withTax); // [11, 22, 33, 44]

const names = ['alice', 'bob', 'charlie'];
const capitalized = names.map(name => name.charAt(0).toUpperCase() + name.slice(1));
console.log(capitalized); // ['Alice', 'Bob', 'Charlie']

const users = [
    { name: 'John', age: 25 },
    { name: 'Jane', age: 30 }
];
const userNames = users.map(user => user.name);
console.log(userNames); // ['John', 'Jane']

// 12. More filter() examples
const ages = [12, 18, 25, 16, 30, 14];
const adults = ages.filter(age => age >= 18);
console.log(adults); // [18, 25, 30]

const words = ['apple', 'banana', 'kiwi', 'strawberry'];
const longWords = words.filter(word => word.length > 5);
console.log(longWords); // ['banana', 'strawberry']

const products = [
    { name: 'Laptop', price: 1000, inStock: true },
    { name: 'Phone', price: 500, inStock: false },
    { name: 'Tablet', price: 300, inStock: true }
];
const available = products.filter(product => product.inStock);
console.log(available); // [{ name: 'Laptop', ... }, { name: 'Tablet', ... }]

// 13. Chaining map() and filter()
const nums = [1, 2, 3, 4, 5, 6];
const result = nums
    .filter(n => n % 2 === 0)  // Get evens: [2, 4, 6]
    .map(n => n * n);           // Square them: [4, 16, 36]
console.log(result); // [4, 16, 36]
