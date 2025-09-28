/*
  # JavaScript Learning App Database Schema

  1. Tables
    - user_profiles - Extended user information beyond auth
    - lessons - Learning content and exercises  
    - practice_exercises - Coding practice problems
    - user_progress - Track user completion and progress
    - achievements - Gamification badges and rewards
    - user_achievements - Link users to their earned achievements

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Ensure users can only access their own data
*/

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  learning_goal TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  streak_count INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  example_code TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  order_index INTEGER NOT NULL,
  estimated_time INTEGER NOT NULL DEFAULT 10,
  category TEXT DEFAULT 'fundamentals',
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice exercises table
CREATE TABLE IF NOT EXISTS practice_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  starter_code TEXT DEFAULT '',
  solution_code TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  hints JSONB DEFAULT '[]',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent INTEGER DEFAULT 0, -- in minutes
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Achievements system
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  badge_color TEXT DEFAULT '#3B82F6',
  criteria JSONB NOT NULL, -- Flexible criteria definition
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements (earned badges)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Learning session tracking
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE,
  total_time INTEGER DEFAULT 0, -- in minutes
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles: users can only see and edit their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Lessons: all authenticated users can read published lessons
CREATE POLICY "Authenticated users can view published lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (is_published = TRUE);

-- Practice exercises: all authenticated users can read exercises
CREATE POLICY "Authenticated users can view practice exercises"
  ON practice_exercises FOR SELECT
  TO authenticated
  USING (TRUE);

-- User progress: users can only see and modify their own progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Achievements: all authenticated users can view achievements
CREATE POLICY "Authenticated users can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- User achievements: users can only see their own achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Learning sessions: users can only access their own sessions
CREATE POLICY "Users can view own learning sessions"
  ON learning_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions"
  ON learning_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning sessions"
  ON learning_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample lessons
INSERT INTO lessons (title, description, content, example_code, difficulty, order_index, estimated_time, category) VALUES
('Variables and Data Types', 'Learn about JavaScript variables, let, const, and basic data types', 
'In JavaScript, variables are containers for storing data values. You can create variables using three keywords: var, let, and const.

**let** - Creates a block-scoped variable that can be reassigned
**const** - Creates a block-scoped variable that cannot be reassigned  
**var** - Creates a function-scoped variable (older syntax, not recommended)

JavaScript has several primitive data types:
- **String**: Text data enclosed in quotes
- **Number**: Integers and floating-point numbers
- **Boolean**: true or false values
- **Undefined**: Variable declared but not assigned a value
- **Null**: Intentional absence of value

Variables are dynamically typed, meaning you don''t need to specify the data type when declaring them.',
'// Variable declarations
let message = "Hello, JavaScript!";
const pi = 3.14159;
let isLearning = true;
let score; // undefined

// You can change let variables
message = "Learning is fun!";

// But you cannot change const variables
// pi = 3.14; // This would cause an error

console.log(message);
console.log(typeof pi); // "number"
console.log(typeof isLearning); // "boolean"',
'beginner', 1, 10, 'fundamentals'),

('Introduction to Functions', 'Understand how to create and use functions in JavaScript',
'Functions are reusable blocks of code that perform specific tasks. They help you organize your code and avoid repetition.

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
- Access variables from their surrounding scope',
'// Function declaration
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
console.log(square(7));',
'beginner', 2, 15, 'fundamentals'),

('Arrays and Objects', 'Work with arrays and objects to store and organize data',
'Arrays and objects are essential data structures in JavaScript for storing collections of data.

**Arrays** are ordered lists of values:
- Elements are accessed by index (starting from 0)
- Can store different data types
- Have many useful methods like push, pop, map, filter

**Objects** are collections of key-value pairs:
- Properties are accessed by key name
- Keys are strings (or Symbols)
- Values can be any data type, including functions
- Great for representing real-world entities',
'// Arrays
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
    return "Hi, I''m " + this.name;
  }
};

console.log(person.name); // "John"
console.log(person["age"]); // 30
console.log(person.greet()); // "Hi, I''m John"

// Add new property
person.city = "New York";',
'beginner', 3, 20, 'fundamentals');

-- Insert sample practice exercises
INSERT INTO practice_exercises (lesson_id, title, prompt, starter_code, solution_code, expected_output, hints, difficulty) VALUES
((SELECT id FROM lessons WHERE title = 'Variables and Data Types'), 
 'Variables Practice', 
 'Create a variable called "name" with your name, and a variable called "age" with your age. Then create a message that combines both variables and log it to the console.',
 '// Create variables here
let name = "";
let age = 0;

// Create and log your message here',
 'let name = "Alice";
let age = 25;
let message = "My name is " + name + " and I am " + age + " years old.";
console.log(message);',
 'My name is Alice and I am 25 years old.',
 '["Use let or const to declare variables", "Use + or template literals to combine strings", "Don''t forget to use console.log() to display the result"]',
 'easy');

-- Insert sample achievements
INSERT INTO achievements (name, description, icon_name, badge_color, criteria) VALUES
('First Steps', 'Complete your first lesson', 'trophy', '#10B981', '{"type": "lessons_completed", "count": 1}'),
('Getting Started', 'Complete 5 lessons', 'star', '#3B82F6', '{"type": "lessons_completed", "count": 5}'),
('Dedicated Learner', 'Maintain a 7-day learning streak', 'fire', '#EF4444', '{"type": "streak_days", "count": 7}'),
('Practice Makes Perfect', 'Complete 10 coding exercises', 'code', '#8B5CF6', '{"type": "exercises_completed", "count": 10}');