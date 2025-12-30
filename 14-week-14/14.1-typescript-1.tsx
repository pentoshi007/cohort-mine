// TypeScript is a superset of JavaScript that adds static typing to the language
// npm install -g typescript

// Basic type annotation
let name: string;
name = String("John");
console.log(name);

// Function with union type parameter
function greet(name: unknown): string {
  if (typeof name === "string") {
    return `Hello, ${name}!`;
  }
  if (typeof name === "number") {
    return `Hello, ${name}!`;
  }
  return "Hello, unknown!";
}

// Arrow function with type annotations
const greet2 = (name: string): string => `Hello, ${name}!`;

console.log(greet("John"));
console.log(greet(4));
console.log(greet(true));
console.log(greet2("John"));

// Function type alias
type fn = () => string;
const fun: fn = () => "Hello, world!";
console.log(fun());

function funinfun(fun: fn) {
  setTimeout(fun, 1000);
}
funinfun(fun);

// Interface definition
interface User {
  name: string;
  age: number;
  email: string;
  run: () => void;
}

const user: User = {
  name: "John",
  age: 30,
  email: "john@example.com",
  run: () => {
    console.log("running");
  },
};
console.log(user);

// Type alias (alternative to interface)
type User2 = {
  name: string;
  age: number;
  email: string;
  run: () => void;
};

const user2: User2 = {
  name: "John",
  age: 30,
  email: "john@example.com",
  run: () => {
    console.log("running");
  },
};
console.log(user2);

// Different ways to define object types

// Option 1: Inline type annotation (anonymous type)
const student1: {
  name: string;
  roll: number;
} = {
  name: "Aniket",
  roll: 5,
};

// Option 2: Using interface (separate declaration)
interface Student {
  name: string;
  roll: number;
}

const student2: Student = {
  name: "Aniket",
  roll: 5,
};

// Option 3: Using type alias (separate declaration)
const student4: Student = {
  name: "Aniket",
  roll: 5,
};

// Interface for Teacher
interface Teacher {
  name: string;
  age: number;
  email: string;
  teach: () => void;
}

// Intersection type combining Student and Teacher
type Student4 = Student & Teacher;

const student6: Student4 = {
  name: "Aniket",
  age: 30,
  email: "aniket@example.com",
  roll: 5,
  teach: () => {
    console.log("teaching");
  },
};
console.log(student6);
