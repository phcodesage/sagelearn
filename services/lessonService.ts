// Mock lesson service - replace with actual API calls
export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  estimatedTime: number;
  content: string;
  example: string;
  nextLessonId?: string;
  language: 'javascript' | 'python' | 'php' | 'ruby';
}

export interface PracticeLesson {
  id: string;
  title: string;
  prompt: string;
  starterCode: string;
  expectedOutput: string;
  hints: string[];
  language: 'javascript' | 'python' | 'php' | 'ruby';
}

class LessonService {
  // TODO: Replace with actual Supabase queries
  private lessons: Lesson[] = [
    {
      id: 'js-intro',
      title: 'What is JavaScript?',
      description: 'JavaScript lets web pages move, react, and feel alive. It is not the same as Java.',
      difficulty: 'beginner',
      order: 0,
      estimatedTime: 8,
      content: `JavaScript is a language that makes websites interactive.

You see buttons that click, menus that open, and games in the browser—that's often JavaScript.

JavaScript runs in your web browser (like Chrome) and can also run on servers (with Node.js).

Java vs JavaScript?
- Different languages with different goals
- Java is like a big school bus (heavy, strong)
- JavaScript is like a scooter (light, quick)

We will learn tiny steps at a time.`,
      example: `// JavaScript in action
console.log("Hello from JavaScript!");`,
      nextLessonId: 'variables-basics',
      language: 'javascript'
    },
    {
      id: 'variables-basics',
      title: 'Variables and Data Types',
      description: 'A variable is like a little box with a name. You put a value in the box.',
      difficulty: 'beginner',
      order: 1,
      estimatedTime: 10,
      content: `Think of a variable as a box that holds a value.

In JavaScript we often use two words to make a box:
- let: a box you can change
- const: a box you don't change

Common values you can store:
- Text (called a string) like "Hello"
- Numbers like 7 or 3.14
- True/False (called boolean)

You give your box a name and put a value inside.`,
      example: `// Make some boxes (variables)
let message = "Hello";  // a text value
let age = 10;            // a number
const planet = "Earth"; // a box we won't change

// Use the values
console.log(message);
console.log(age);
console.log(planet);`,
      nextLessonId: 'functions-intro',
      language: 'javascript'
    },
    {
      id: 'functions-intro',
      title: 'Introduction to Functions',
      description: 'Understand how to create and use functions in JavaScript',
      difficulty: 'beginner',
      order: 2,
      estimatedTime: 15,
      content: `Functions are reusable blocks of code that perform specific tasks. They help you organize your code and avoid repetition.

**Function Declaration:**
The traditional way to create functions using the function keyword.

**Function Expression:**
Creating a function as a value and assigning it to a variable.

**Arrow Functions:**
A shorter syntax for writing functions, introduced in ES6.

Functions can:
- Take parameters (inputs)
- Return values (outputs)
- Be called multiple times
- Access variables from their surrounding scope`,
      example: `// Function declaration
function greet(name) {
  return "Hello, " + name + "!";
}

// Function expression  
const multiply = function(a, b) {
  return a * b;
};

// Arrow function
const add = (a, b) => {
  return a + b;
};

// Short arrow function for single expressions
const square = x => x * x;

// Using functions
console.log(greet("Alice"));
console.log(multiply(4, 5));
console.log(add(10, 15));
console.log(square(7));`,
      nextLessonId: 'arrays-objects',
      language: 'javascript'
    },
    {
      id: 'arrays-objects',
      title: 'Arrays and Objects',
      description: 'Work with arrays and objects to store and organize data',
      difficulty: 'beginner',
      order: 3,
      estimatedTime: 20,
      content: `Arrays and objects are essential data structures in JavaScript for storing collections of data.

**Arrays** are ordered lists of values:
- Elements are accessed by index (starting from 0)
- Can store different data types
- Have many useful methods like push, pop, map, filter

**Objects** are collections of key-value pairs:
- Properties are accessed by key name
- Keys are strings (or Symbols)
- Values can be any data type, including functions
- Great for representing real-world entities`,
      example: `// Arrays
let fruits = ["apple", "banana", "orange"];
let numbers = [1, 2, 3, 4, 5];
let mixed = ["hello", 42, true, null];

console.log(fruits[0]); // "apple"
fruits.push("grape"); // Add to end
fruits.pop(); // Remove from end

// Objects
let person = {
  name: "John",
  age: 30,
  isStudent: false,
  hobbies: ["reading", "coding"],
  greet: function() {
    return "Hi, I'm " + this.name;
  }
};

console.log(person.name); // "John"
console.log(person["age"]); // 30
console.log(person.greet()); // "Hi, I'm John"

// Add new property
person.city = "New York";`,
      nextLessonId: undefined,
      language: 'javascript'
    },
    // Python basics
    {
      id: 'py-variables-basics',
      title: 'Variables and Types',
      description: 'A variable is like a named box. Put a value in it and use it later.',
      difficulty: 'beginner',
      order: 1,
      estimatedTime: 10,
      content: `In Python, you make a variable by writing a name, an equals sign, and a value.

You can store:
- Text like "Hello"
- Numbers like 7 or 3.14
- True/False (True or False)

Then you can print it to see it.`,
      example: `# Make some boxes (variables)
name = "Alice"
age = 25

# Use the values
print(f"My name is {name} and I am {age} years old.")`,
      nextLessonId: undefined,
      language: 'python'
    },
    // PHP basics
    {
      id: 'php-variables-basics',
      title: 'Variables and Types',
      description: 'A variable is a named box. Put a value in it and use it later.',
      difficulty: 'beginner',
      order: 1,
      estimatedTime: 10,
      content: `In PHP, variable names start with a $ sign. Give the box a name and put a value in it.`,
      example: `<?php
$name = "Alice"; // text
$age = 25;           // number

echo "My name is $name and I am $age years old.";
?>`,
      nextLessonId: undefined,
      language: 'php'
    },
    // Ruby basics
    {
      id: 'rb-variables-basics',
      title: 'Variables and Types',
      description: 'A variable is like a box with a name. You store a value in it.',
      difficulty: 'beginner',
      order: 1,
      estimatedTime: 10,
      content: `In Ruby, you make a variable by writing a name and giving it a value.

You can store text, numbers, and true/false.`,
      example: `name = "Alice"
age = 25

puts "My name is #{name} and I am #{age} years old."`,
      nextLessonId: undefined,
      language: 'ruby'
    }
  ];

  private practiceExercises: PracticeLesson[] = [
    {
      id: 'variables-basics',
      title: 'Variables Practice',
      prompt: 'Make two variables: name and age. Then print exactly: My name is Alice and I am 25 years old.',
      starterCode: `// Create variables here
let name = "";
let age = 0;

// Print your message here
`,
      expectedOutput: 'My name is Alice and I am 25 years old.',
      hints: [
        'Use let or const to make variables',
        'Use console.log to print the message'
      ],
      language: 'javascript'
    },
    {
      id: 'py-variables-basics',
      title: 'Variables Practice',
      prompt: 'Make two variables: name and age. Then print exactly: My name is Alice and I am 25 years old.',
      starterCode: `# Create variables here
name = ""
age = 0

# Print your message here
`,
      expectedOutput: 'My name is Alice and I am 25 years old.',
      hints: [
        'Use print() to display the result',
        'Use f-strings or string concatenation'
      ],
      language: 'python'
    }
  ];

  async getAllLessons(): Promise<Lesson[]> {
    // TODO: Replace with Supabase query
    //   .from('lessons')
    //   .select('*')
    //   .order('order');
    
    return new Promise(resolve => {
      setTimeout(() => resolve(this.lessons), 100);
    });
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase
    //   .from('lessons')
    //   .select('*')
    //   .eq('id', id)
    //   .single();
    
    return new Promise(resolve => {
      setTimeout(() => {
        const lesson = this.lessons.find(l => l.id === id);
        resolve(lesson || null);
      }, 100);
    });
  }

  async getPracticeLesson(id: string): Promise<PracticeLesson | null> {
    // TODO: Replace with Supabase query
    return new Promise(resolve => {
      setTimeout(() => {
        const exercise = this.practiceExercises.find(e => e.id === id);
        resolve(exercise || null);
      }, 100);
    });
  }
}

export const lessonService = new LessonService();