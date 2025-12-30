type add = (a: number, b: number) => number;
interface ICalculator {
  // Changed interface name to ICalculator to avoid duplicate identifier error with class Calculator
  version: string; // Removed optional '?' because constructor parameter is optional but interface property should be required for proper implementation
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  divide: (a: number, b: number) => number; // Arrow function syntax is valid in interfaces and can be implemented as a method in classes
}
class Calculator implements ICalculator {
  // version?: string;//no need if we are defining the version in the constructor using full name "version: string"
  constructor(public version: string = "1.0.0") {} // Removed optional '?' and added default value to satisfy interface requirement
  add(a: number, b: number): number {
    return a + b;
  }
  subtract(a: number, b: number): number {
    return a - b;
  }
  multiply(a: number, b: number): number {
    return a * b;
  }
  divide(a: number, b: number): number {
    return a / b;
  }
}
const calculator = new Calculator("1.0.0");
console.log(calculator.add(1, 2));
console.log(calculator.subtract(1, 2));
console.log(calculator.multiply(1, 2));
console.log(calculator.divide(1, 2));
console.log(calculator.version);

// ============================================================================
// ABSTRACT CLASSES
// ============================================================================
// Abstract classes are blueprints that CANNOT be instantiated directly.
// They can have both abstract methods (must be implemented) and concrete methods (shared implementation).

abstract class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  abstract greet(): string; // Abstract method - MUST be implemented by child class

  hello() {
    // Concrete method - shared implementation, optional to override
    console.log("hi there");
  }
}

class Employee extends User {
  name: string;
  constructor(name: string) {
    super(name);
    this.name = name;
  }

  greet() {
    // Must implement abstract method
    return "hi " + this.name;
  }
}

const employee = new Employee("John");
console.log(employee.greet()); // "hi John"
employee.hello(); // "hi there"

// const user = new User("Test"); // ❌ Error: Cannot create an instance of an abstract class

// ============================================================================
// 🎯 INTERVIEW QUESTION: Type vs Interface vs Abstract Class
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TYPE vs INTERFACE vs ABSTRACT CLASS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Feature              │ Type           │ Interface       │ Abstract Class   │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Purpose              │ Define shape   │ Define contract │ Blueprint +      │
│                      │ of data        │ for objects     │ shared code      │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Instantiable?        │ No (type only) │ No (type only)  │ No (must extend) │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Runtime existence?   │ ❌ No          │ ❌ No           │ ✅ Yes (JS class)│
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Can have             │ ❌ No          │ ❌ No           │ ✅ Yes           │
│ implementation?      │                │                 │                  │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Extend/Implement     │ & intersection │ extends         │ extends          │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Declaration merging? │ ❌ No          │ ✅ Yes          │ ❌ No            │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Union types?         │ ✅ Yes         │ ❌ No           │ ❌ No            │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Computed properties? │ ✅ Yes         │ ❌ No           │ ❌ No            │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Constructor?         │ ❌ No          │ ❌ No           │ ✅ Yes           │
├──────────────────────┼────────────────┼─────────────────┼──────────────────┤
│ Access modifiers?    │ ❌ No          │ ❌ No           │ ✅ Yes           │
│ (public/private)     │                │                 │                  │
└──────────────────────┴────────────────┴─────────────────┴──────────────────┘

📝 WHEN TO USE WHAT:

1. TYPE - Use when:
   ├── Creating union types: type Status = "loading" | "success" | "error"
   ├── Creating intersection types: type Admin = User & { role: "admin" }
   ├── Defining function signatures: type Callback = (data: string) => void
   ├── Tuple types: type Coordinate = [number, number]
   └── Utility types: type Partial<T>, type Pick<T, K>

2. INTERFACE - Use when:
   ├── Defining object shapes (especially for classes to implement)
   ├── Working with OOP patterns
   ├── Need declaration merging (extending existing types)
   ├── Defining contracts/APIs
   └── Better error messages (more readable)

3. ABSTRACT CLASS - Use when:
   ├── Need shared implementation (concrete methods)
   ├── Need constructor logic
   ├── Need access modifiers (public, private, protected)
   ├── Creating a base class hierarchy
   └── Need runtime type checking (instanceof)

💡 KEY DIFFERENCES EXPLAINED:

// TYPE - Compile-time only, more flexible
type UserType = {
  name: string;
  age: number;
};
type Status = "active" | "inactive"; // Union - only type can do this!
type Combined = UserType & { role: string }; // Intersection

// INTERFACE - Compile-time only, better for OOP
interface IUser {
  name: string;
  age: number;
}
interface IUser {
  email: string; // Declaration merging - adds to existing IUser!
}
// Now IUser has: name, age, email

// ABSTRACT CLASS - Exists at runtime, has implementation
abstract class BaseUser {
  constructor(public name: string) {} // Has constructor!
  
  abstract validate(): boolean; // Must implement
  
  getInfo(): string { // Shared implementation
    return `User: ${this.name}`;
  }
}

🚀 QUICK DECISION TREE:

Need union/intersection types? → TYPE
Need declaration merging? → INTERFACE
Need shared implementation? → ABSTRACT CLASS
Defining object shape? → INTERFACE (or TYPE - both work)
Creating class hierarchy? → ABSTRACT CLASS
Defining function type? → TYPE
Need constructor? → ABSTRACT CLASS
Need runtime instanceof check? → ABSTRACT CLASS

*/

// ============================================================================
// PRACTICAL EXAMPLES
// ============================================================================

// 1. TYPE - Union types (interface can't do this)
type PaymentStatus = "pending" | "completed" | "failed";
type PaymentMethod = "card" | "upi" | "netbanking";

// 2. INTERFACE - Declaration merging
interface Window {
  myCustomProperty: string;
}
// Now the global Window interface has myCustomProperty!

// 3. ABSTRACT CLASS - Shared implementation
abstract class PaymentProcessor {
  abstract processPayment(amount: number): boolean;

  // Shared method - all subclasses get this for free
  formatAmount(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  // Shared validation logic
  validateAmount(amount: number): boolean {
    return amount > 0;
  }
}

class UPIPayment extends PaymentProcessor {
  processPayment(amount: number): boolean {
    if (!this.validateAmount(amount)) return false;
    console.log(`Processing UPI payment of ${this.formatAmount(amount)}`);
    return true;
  }
}

class CardPayment extends PaymentProcessor {
  processPayment(amount: number): boolean {
    if (!this.validateAmount(amount)) return false;
    console.log(`Processing Card payment of ${this.formatAmount(amount)}`);
    return true;
  }
}

// Both UPIPayment and CardPayment share formatAmount() and validateAmount()
// but have their own processPayment() implementation
