// ============================================
//classes
// ============================================
//in js, classes are the blueprint for creating objects
class Rectangle {
    constructor(width, height, color) {
        this.width = width;
        this.height = height;
        this.color = color || 'blue';
    }
    area() {
        return this.width * this.height;
    }
    print() {
        console.log(`Rectangle: ${this.area()} ${this.color}`);
    }
}
const rect = new Rectangle(10, 20, 'red');
rect.print();

// ============================================
//map
const map = new Map();
map.set('name', 'John');
map.set('age', 30);
map.set('city', 'New York');
console.log(map.get('name'));
console.log(map.get('age'));
console.log(map.get('city'));

// ============================================
//set
const set = new Set();
set.add('John');
set.add('Jane');
set.add('Jim');
set.add('Jill');
console.log(set.size);
console.log(set.has('John'));
console.log(set.has('Jack'));
console.log(set.delete('John'));
console.log(set.size);
console.log(set.clear());
console.log(set.size);

// ============================================
//date
const date = new Date();
console.log(date);
console.log(date.toISOString());
console.log(date.getFullYear());
console.log(date.getMonth());
console.log(date.getDate());
console.log(date.getHours());
console.log(date.getMinutes());
console.log(date.getSeconds());
console.log(date.getMilliseconds());
console.log(date.getTime());
console.log(date.getTimezoneOffset());

// ============================================
//promises
// ============================================
//promises are the objects that represent the eventual completion (or failure) of an asynchronous operation and its resulting value.
//setTimeoutPromisified(3000).then(() => console.log('Done!')); --promise approach
//setTimeout(callback, 3000); --callback approach
