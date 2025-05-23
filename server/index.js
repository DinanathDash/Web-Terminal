import { exec } from 'child_process';
import { promisify } from 'util';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

// Standard library definitions
const stdlibs = {
  python: [
    'os', 'sys', 'time', 'datetime', 'math', 'random', 're', 'json', 'collections',
    'functools', 'itertools', 'io', 'subprocess', 'pathlib', 'glob', 'shutil',
    'pickle', 'threading', 'multiprocessing', 'argparse', 'logging', 'csv',
    'urllib', 'http', 'socket', 'email', 'unittest', 'hashlib', 'base64',
    'abc', 'array', 'ast', 'asyncio', 'bisect', 'calendar', 'cmd', 'code',
    'codecs', 'codeop', 'colorsys', 'configparser', 'contextlib', 'copy',
    'copyreg', 'ctypes', 'dataclasses', 'decimal', 'difflib', 'dis', 
    'enum', 'errno', 'filecmp', 'fnmatch', 'fractions', 'getopt', 'getpass',
    'gettext', 'grp', 'heapq', 'hmac', 'html', 'imaplib', 'imp', 'importlib',
    'inspect', 'ipaddress', 'keyword', 'linecache', 'locale', 'marshal',
    'mimetypes', 'numbers', 'operator', 'optparse', 'platform', 'pprint',
    'pwd', 'py_compile', 'pyclbr', 'queue', 'reprlib', 'secrets', 'selectors',
    'shelve', 'signal', 'smtplib', 'sqlite3', 'stat', 'statistics', 'string',
    'struct', 'symbol', 'sysconfig', 'tabnanny', 'tarfile', 'tempfile',
    'textwrap', 'token', 'tokenize', 'traceback', 'types', 'uuid', 'warnings',
    'weakref', 'webbrowser', 'winreg', 'xmlrpc', 'zipfile', 'zipimport',
    'numpy', 'pandas', 'matplotlib', 'sklearn', 'scipy'
  ],
  javascript: [
    'fs', 'path', 'os', 'util', 'events', 'http', 'https', 'url', 'querystring',
    'crypto', 'stream', 'zlib', 'readline', 'child_process', 'cluster',
    'dgram', 'dns', 'net', 'tls', 'assert', 'buffer', 'console', 'process',
    'timers', 'string_decoder', 'punycode', 'v8', 'vm', 'perf_hooks', 'async_hooks',
    'module', 'repl', 'constants', 'inspector', 'worker_threads', 'trace_events',
    'domain', 'diagnostics_channel'
  ],
  ruby: [
    'base64', 'benchmark', 'bigdecimal', 'csv', 'date', 'digest', 'fileutils',
    'json', 'logger', 'net/http', 'open-uri', 'optparse', 'pathname', 'pp',
    'prime', 'set', 'socket', 'stringio', 'time', 'timeout', 'uri', 'yaml',
    'zlib', 'openssl', 'erb', 'abbrev', 'cgi', 'delegate', 'e2mmap', 'English',
    'fiber', 'fiddle', 'forwardable', 'ipaddr', 'irb', 'matrix', 'monitor',
    'mutex_m', 'observer', 'ostruct', 'racc', 'rake', 'rdoc', 'readline',
    'resolv', 'rexml', 'rinda', 'ripper', 'securerandom', 'shellwords',
    'singleton', 'tempfile', 'thread', 'thwait', 'tracer', 'tsort', 'webrick',
    'win32ole'
  ],
  go: [
    'fmt', 'io', 'os', 'path', 'strings', 'time', 'math', 'sort', 'strconv',
    'bytes', 'errors', 'flag', 'log', 'regexp', 'sync', 'encoding', 'bufio',
    'net', 'net/http', 'context', 'reflect', 'runtime', 'container', 'crypto',
    'database', 'debug', 'compress', 'image', 'html', 'hash', 'testing',
    'unicode', 'unsafe', 'archive', 'builtin', 'plugin', 'syscall',
    'internal', 'go', 'vendor', 'mime', 'text'
  ],
  rust: [
    'std', 'core', 'alloc', 'std::collections', 'std::env', 'std::error',
    'std::fmt', 'std::fs', 'std::io', 'std::iter', 'std::net', 'std::ops',
    'std::path', 'std::process', 'std::str', 'std::string', 'std::sync',
    'std::thread', 'std::time', 'std::vec'
  ],
  java: [
    'java.lang', 'java.util', 'java.io', 'java.nio', 'java.net', 'java.math',
    'java.time', 'java.text', 'java.sql', 'java.awt', 'javax.swing', 'java.applet',
    'java.beans', 'java.rmi', 'javax.sound', 'javax.imageio', 'java.security',
    'javax.crypto', 'javax.xml'
  ],
  php: [
    'array', 'calendar', 'ctype', 'curl', 'date', 'dom', 'filter', 'ftp', 
    'hash', 'json', 'libxml', 'mbstring', 'mysqli', 'openssl', 'pcre', 'pdo',
    'posix', 'reflection', 'session', 'simplexml', 'sockets', 'sodium', 'spl',
    'sqlite3', 'standard', 'tokenizer', 'xml', 'zlib'
  ],
  shell: [
    'bash', 'sh', 'zsh', 'cd', 'pwd', 'ls', 'echo', 'cat', 'touch', 'mkdir',
    'mv', 'cp', 'rm', 'grep', 'sed', 'awk', 'find', 'chmod', 'chown', 'ps',
    'kill', 'ln', 'export', 'source', 'alias', 'dirname', 'basename'
  ],
  c: [],
  cpp: []
};

const execPromise = promisify(exec);

// Package manager utilities for different languages
const packageManagers = {
  python: {
    detect: (code) => {
      const importRegex = /^\s*(import|from)\s+([^\s.]+)(?:\s+import|\s*$)/gm;
      const matches = [...code.matchAll(importRegex)];
      const modules = matches.map(match => match[2].split(',')[0].trim());
      
      const specialPackages = [];
      
      if (code.includes('tensorflow') || code.includes('keras')) {
        specialPackages.push('tensorflow');
      }
      
      if (code.includes('torch.') || code.includes('import torch')) {
        specialPackages.push('torch');
        if (code.includes('torchvision')) {
          specialPackages.push('torchvision');
        }
      }
      
      const packages = [...new Set([
        ...modules.filter(mod => !stdlibs.python.includes(mod)),
        ...specialPackages
      ])];
      
      return packages;
    },
    install: async (packages, socket) => {
      if (!packages.length) return true;
      
      socket.emit('output', { output: `Installing Python packages: ${packages.join(', ')}\r\n` });
      try {
        const { stderr } = await execPromise(`pip install ${packages.join(' ')} --quiet`);
        if (stderr) {
          socket.emit('output', { output: `Warning during installation: ${stderr}\r\n` });
        }
        socket.emit('output', { output: `Packages installed successfully\r\n` });
        return true;
      } catch (error) {
        socket.emit('output', { 
          output: `Error installing packages: ${error.stderr || error.message}\r\n`, 
          error: true 
        });
        return false;
      }
    }
  },
  javascript: {
    detect: (code) => {
      const requireRegex = /(?:import|require)\s*\(?[\s{]*[^{]*?['"]([^'"./][^'"]*)['"]/g;
      const importRegex = /import\s+(?:[^{]*?\s+from\s+)?['"]([^'"./][^'"]*)['"]/g;
      
      const requireMatches = [...code.matchAll(requireRegex)];
      const importMatches = [...code.matchAll(importRegex)];
      
      const packages = [
        ...requireMatches.map(match => match[1]),
        ...importMatches.map(match => match[1])
      ].map(fullName => fullName.split('/')[0]);
      
      return [...new Set(packages)].filter(pkg => 
        !stdlibs.javascript.includes(pkg) && pkg.trim() !== ''
      );
    },
    install: async (packages, socket) => {
      if (!packages.length) return true;
      
      socket.emit('output', { output: `Installing npm packages: ${packages.join(' ')}\r\n` });
      try {
        const { stderr } = await execPromise(`npm install --no-save ${packages.join(' ')}`);
        if (stderr && !stderr.includes('added')) {
          socket.emit('output', { output: `Warning during installation: ${stderr}\r\n` });
        }
        socket.emit('output', { output: `Packages installed successfully\r\n` });
        return true;
      } catch (error) {
        socket.emit('output', { 
          output: `Error installing packages: ${error.stderr || error.message}\r\n`, 
          error: true 
        });
        return false;
      }
    }
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cors());
app.use(express.json());

// Store global preferences by client ID (persists between socket connections)
const clientPreferences = new Map();

// Temporary directory for code files
const TEMP_DIR = path.join(os.tmpdir(), 'web-terminal');

// Ensure the temporary directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Language configuration for execution
const languageConfig = {
  javascript: {
    extension: 'js',
    command: 'node',
    defaultCode: `// JavaScript Code Example
// This is a simple demonstration of basic JavaScript concepts

// Function to greet a person
function greet(name) {
    return \`Hello, \${name}! Welcome to Web Terminal!\`;
}

// Array demonstration
const numbers = [1, 2, 3, 4, 5];
console.log('Array operations:');
console.log('Original array:', numbers);
console.log('Mapped array:', numbers.map(n => n * 2));
console.log('Filtered array:', numbers.filter(n => n % 2 === 0));

// Object demonstration
const person = {
    name: 'John Doe',
    age: 30,
    greet() {
        console.log(greet(this.name));
    }
};

// Main execution
console.log('\\nDemonstrating JavaScript features:');
person.greet();
`
  },
  typescript: {
    extension: 'ts',
    command: 'npx ts-node',
    defaultCode: `// TypeScript Code Example
// Demonstrating TypeScript's type system and features

// Interface definition
interface Person {
    name: string;
    age: number;
    greet(): void;
}

// Class implementation
class Student implements Person {
    constructor(
        public name: string,
        public age: number,
        private studentId: string
    ) {}

    greet(): void {
        console.log(\`Hello, I'm \${this.name}, a student with ID \${this.studentId}\`);
    }

    // Generic method example
    static createIDCard<T extends Person>(person: T): string {
        return \`ID Card for \${person.name}, Age: \${person.age}\`;
    }
}

// Main execution
const student = new Student("Alice Smith", 20, "ST12345");
student.greet();
console.log(Student.createIDCard(student));
`
  },
  python: {
    extension: 'py',
    command: 'python3',
    defaultCode: `# Python Code Example
# Demonstrating Python features and concepts

from typing import List, Dict
import random

# Class definition with type hints
class Calculator:
    def __init__(self, name: str):
        self.name = name
        self.history: List[float] = []
    
    def add(self, x: float, y: float) -> float:
        result = x + y
        self.history.append(result)
        return result
    
    def get_history(self) -> List[float]:
        return self.history

# List comprehension example
numbers = [1, 2, 3, 4, 5]
squares = [n * n for n in numbers]

# Dictionary comprehension
number_dict = {str(n): n * 2 for n in numbers}

# Main execution
def main():
    print("Python Feature Demonstration:")
    
    # Using the Calculator class
    calc = Calculator("MyCalc")
    result = calc.add(10, 20)
    print(f"10 + 20 = {result}")
    
    # Working with lists
    print(f"\\nNumbers: {numbers}")
    print(f"Squares: {squares}")
    
    # Working with dictionaries
    print(f"\\nDictionary: {number_dict}")

if __name__ == "__main__":
    main()
`
  },
  java: {
    extension: 'java',
    command: 'java',
    compile: (filename) => `javac ${filename}`,
    run: (filename) => `java ${path.basename(filename, '.java')}`,
    defaultCode: `// Java Code Example
public class Main {
    // Inner class example
    static class Person {
        private String name;
        private int age;
        
        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }
        
        public void greet() {
            System.out.println("Hello, I'm " + name + "!");
        }
    }
    
    // Generic method example
    public static <T extends Comparable<T>> T findMax(T[] array) {
        if (array == null || array.length == 0) return null;
        
        T max = array[0];
        for (T item : array) {
            if (item.compareTo(max) > 0) {
                max = item;
            }
        }
        return max;
    }
    
    public static void main(String[] args) {
        System.out.println("Java Feature Demonstration:\\n");
        
        // Creating and using objects
        Person person = new Person("Alice", 25);
        person.greet();
        
        // Array and generic method usage
        Integer[] numbers = {1, 5, 3, 7, 2};
        Integer max = findMax(numbers);
        System.out.println("\\nMaximum number: " + max);
        
        // String array example
        String[] words = {"apple", "banana", "cherry"};
        String maxWord = findMax(words);
        System.out.println("Alphabetically last word: " + maxWord);
    }
}`,
    filename: 'Main.java'
  },
  c: {
    extension: 'c',
    compile: (filename) => {
      const outputPath = path.join(path.dirname(filename), 'compiled_c');
      return `gcc "${filename}" -o "${outputPath}"`;
    },
    run: (filename) => {
      const outputPath = path.join(path.dirname(filename), 'compiled_c');
      return `"${outputPath}"`;
    },
    defaultCode: `// C Code Example
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Structure definition
typedef struct {
    char name[50];
    int age;
} Person;

// Function prototypes
void greet(const Person* person);
int* create_array(int size);
void print_array(const int* arr, int size);

// Function to initialize a Person
void greet(const Person* person) {
    printf("Hello, I'm %s and I'm %d years old!\\n", 
           person->name, person->age);
}

// Dynamic memory allocation example
int* create_array(int size) {
    return (int*)malloc(size * sizeof(int));
}

// Array printing function
void print_array(const int* arr, int size) {
    printf("Array contents: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\\n");
}

int main() {
    printf("C Feature Demonstration:\\n\\n");
    
    // Working with structures
    Person person;
    strcpy(person.name, "John");
    person.age = 30;
    greet(&person);
    
    // Dynamic memory allocation
    int size = 5;
    int* numbers = create_array(size);
    
    // Initialize array
    for(int i = 0; i < size; i++) {
        numbers[i] = i + 1;
    }
    
    // Print array
    print_array(numbers, size);
    
    // Clean up
    free(numbers);
    return 0;
}`
  },
  cpp: {
    extension: 'cpp',
    compile: (filename) => {
      const outputPath = path.join(path.dirname(filename), 'compiled_cpp');
      return `g++ "${filename}" -o "${outputPath}"`;
    },
    run: (filename) => {
      const outputPath = path.join(path.dirname(filename), 'compiled_cpp');
      return `"${outputPath}"`;
    },
    defaultCode: `// C++ Code Example
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>

// Class definition with template
template<typename T>
class Container {
private:
    std::vector<T> elements;
    
public:
    void add(T element) {
        elements.push_back(element);
    }
    
    void print() const {
        std::cout << "Container contents: ";
        for(const auto& element : elements) {
            std::cout << element << " ";
        }
        std::cout << "\\n";
    }
    
    auto begin() { return elements.begin(); }
    auto end() { return elements.end(); }
};

// Modern C++ features demonstration
int main() {
    std::cout << "C++ Feature Demonstration:\\n\\n";
    
    // Smart pointer usage
    auto numbers = std::make_unique<Container<int>>();
    numbers->add(1);
    numbers->add(2);
    numbers->add(3);
    
    // Range-based for loop and auto
    std::cout << "Numbers: ";
    for(const auto& num : *numbers) {
        std::cout << num << " ";
    }
    std::cout << "\\n";
    
    // Lambda expression
    auto square = [](int x) { return x * x; };
    std::cout << "\\nSquare of 5: " << square(5) << "\\n";
    
    // String operations
    std::string text = "Hello, Modern C++!";
    std::cout << "\\nOriginal text: " << text << "\\n";
    
    // Algorithm usage
    std::transform(text.begin(), text.end(), text.begin(), ::toupper);
    std::cout << "Uppercase: " << text << "\\n";
    
    return 0;
}`
  },
  ruby: {
    extension: 'rb',
    command: 'ruby',
    defaultCode: `# Ruby Code Example
# Demonstrating Ruby's elegant syntax and features

# Class definition with modules
module Greetable
  def greet
    puts "Hello, I'm \#{@name}!"
  end
end

class Person
  include Greetable
  
  attr_accessor :name, :age
  
  def initialize(name, age)
    @name = name
    @age = age
  end
  
  # Block usage example
  def do_n_times(n)
    n.times { |i| yield i if block_given? }
  end
end

# Array operations
numbers = [1, 2, 3, 4, 5]
puts "Ruby Feature Demonstration:\\n"

# Using the Person class
person = Person.new("Ruby", 25)
person.greet

# Array manipulation
puts "\\nArray operations:"
puts "Original: \#{numbers}"
puts "Mapped: \#{numbers.map { |n| n * 2 }}"
puts "Filtered: \#{numbers.select { |n| n.even? }}"

# Block demonstration
puts "\\nBlock example:"
person.do_n_times(3) { |i| puts "Iteration \#{i + 1}" }

# Hash demonstration
info = {
  language: "Ruby",
  version: "3.0",
  is_fun: true
}

puts "\\nHash content:"
info.each { |key, value| puts "\#{key}: \#{value}" }`
  },
  go: {
    extension: 'go',
    command: 'go run',
    defaultCode: `// Go Code Example
package main

import (
	"fmt"
	"strings"
	"sync"
	"time"
)

// Structure definition
type Person struct {
	Name string
	Age  int
}

// Method for Person
func (p Person) Greet() string {
	return fmt.Sprintf("Hello, I'm %s!", p.Name)
}

// Goroutine example function
func processTask(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Task %d starting...\\n", id)
	time.Sleep(time.Millisecond * 500)
	fmt.Printf("Task %d completed\\n", id)
}

// Channel example function
func generateNumbers(ch chan<- int) {
	for i := 1; i <= 5; i++ {
		ch <- i
	}
	close(ch)
}

func main() {
	fmt.Println("Go Feature Demonstration:\\n")

	// Structure usage
	person := Person{Name: "Gopher", Age: 10}
	fmt.Println(person.Greet())

	// Slice operations
	numbers := []int{1, 2, 3, 4, 5}
	fmt.Printf("\\nNumbers: %v\\n", numbers)

	// Map usage
	languages := map[string]string{
		"go":     "Google",
		"rust":   "Mozilla",
		"python": "PSF",
	}

	fmt.Println("\\nLanguage creators:")
	for lang, creator := range languages {
		fmt.Printf("%s: %s\\n", strings.Title(lang), creator)
	}

	// Goroutines with WaitGroup
	fmt.Println("\\nDemonstrating Goroutines:")
	var wg sync.WaitGroup
	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go processTask(i, &wg)
	}
	wg.Wait()

	// Channels
	fmt.Println("\\nChannel demonstration:")
	ch := make(chan int)
	go generateNumbers(ch)
	for num := range ch {
		fmt.Printf("Received: %d\\n", num)
	}
}`
  },
  rust: {
    extension: 'rs',
    compile: (filename) => {
      const outputPath = path.join(path.dirname(filename), 'compiled_rust');
      return `rustc "${filename}" -o "${outputPath}"`;
    },
    run: (filename) => {
      const outputPath = path.join(path.dirname(filename), 'compiled_rust');
      return `"${outputPath}"`;
    },
    defaultCode: `// Rust Code Example
use std::collections::HashMap;
use std::thread;
use std::sync::mpsc;

// Structure definition
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

// Implementation block
impl Person {
    fn new(name: &str, age: u32) -> Person {
        Person {
            name: String::from(name),
            age,
        }
    }

    fn greet(&self) {
        println!("Hello, I'm {}!", self.name);
    }
}

// Generic function
fn find_max<T: Ord>(list: &[T]) -> Option<&T> {
    list.iter().max()
}

fn main() {
    println!("Rust Feature Demonstration:\\n");

    // Creating and using structs
    let person = Person::new("Ferris", 3);
    person.greet();

    // Vector operations
    let numbers = vec![1, 2, 3, 4, 5];
    println!("\\nNumbers: {:?}", numbers);

    // Using Option and matching
    match find_max(&numbers) {
        Some(max) => println!("Maximum: {}", max),
        None => println!("List is empty"),
    }

    // HashMap usage
    let mut languages = HashMap::new();
    languages.insert("Rust", 2010);
    languages.insert("Go", 2009);
    languages.insert("Python", 1991);

    println!("\\nLanguage release years:");
    for (lang, year) in &languages {
        println!("{}: {}", lang, year);
    }

    // Threading example
    println!("\\nThreading demonstration:");
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let messages = vec!["Hello", "from", "another", "thread!"];
        for msg in messages {
            tx.send(msg).unwrap();
            thread::sleep(std::time::Duration::from_millis(100));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }
}`
  }
};

// Execute code based on language
const executeCode = async (code, language, socket) => {
  const executionStartTime = Date.now();
  
  // Make sure language is valid, defaulting to JavaScript if needed
  const languageKey = (language && typeof language === 'string') ? language.toLowerCase() : 'javascript';
  console.log(`Server executing code with language: ${languageKey}`);
  
  const config = languageConfig[languageKey];
  if (!config) {
    console.warn(`Language ${language} is not supported, defaulting to JavaScript`);
    socket.emit('output', { output: `Language ${language} is not supported, using JavaScript instead.\r\n`, error: true });
    return executeCode(code, 'javascript', socket);
  }
  
  socket.emit('output', { 
    output: `[Web Terminal] Executing ${languageKey} code...\r\n` 
  });

  // Handle Python error handling
  if (language.toLowerCase() === 'python') {
    const fallbackCode = `
import sys
import traceback

def _handle_exception(e):
    exc_type, exc_value, exc_traceback = sys.exc_info()
    formatted_tb = ''.join(traceback.format_tb(exc_traceback))
    error_msg = f"{exc_type.__name__}: {str(exc_value)}\\n{formatted_tb}"
    print(f"\\x1b[1;31m{error_msg}\\x1b[0m", file=sys.stderr)
    sys.exit(1)

try:`;
    
    // Indent each line of user code for proper Python try-except block
    const indentedCode = code.split('\n')
      .map(line => line.length > 0 ? '    ' + line : line)
      .join('\n');
      
    code = `${fallbackCode}\n${indentedCode}\nexcept Exception as e:\n    _handle_exception(e)`;
  }

  const randomFileName = `${Math.random().toString(36).substring(2, 15)}.${config.extension}`;
  const filePath = path.join(TEMP_DIR, config.filename || randomFileName);

  try {
    fs.writeFileSync(filePath, code);
    socket.emit('output', { output: `Code file created successfully.\r\n` });
  } catch (err) {
    console.error('Error creating file:', err);
    socket.emit('output', { 
      output: `Error creating temporary file: ${err.message}\r\n`,
      error: true
    });
    socket.emit('execution-complete');
    return null;
  }

  if (config.compile) {
    socket.emit('output', { output: `Compiling ${language} code...\r\n` });
    
    exec(config.compile(filePath), (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        socket.emit('output', { 
          output: `Compilation error: ${compileStderr || compileError.message}\r\n`, 
          error: true 
        });
        return;
      }
      
      if (compileStderr) {
        socket.emit('output', { output: `Warnings: ${compileStderr}\r\n` });
      }
      
      socket.emit('output', { output: `Compilation successful. Running code...\r\n` });
      
      exec(config.run(filePath), { timeout: 10000 }, (runError, runStdout, runStderr) => {
        handleExecutionResult(socket, runError, runStdout, runStderr, filePath, language);
      });
    });
  } else {
    const executionCommand = `${config.command} ${filePath}`;
    socket.emit('output', { output: `Running ${language} code...\r\n` });
    
    exec(executionCommand, { timeout: 10000 }, (error, stdout, stderr) => {
      handleExecutionResult(socket, error, stdout, stderr, filePath, language);
    });
  }
};

// Helper function to handle execution results
const handleExecutionResult = (socket, error, stdout, stderr, filePath, language) => {
  if (error) {
    socket.emit('output', { 
      output: `Execution error: ${stderr || error.message}\r\n`, 
      error: true 
    });
  } else {
    socket.emit('output', { output: stdout });
    
    if (stderr) {
      socket.emit('output', { 
        output: `\r\nStandard Error: ${stderr}`, 
        error: true 
      });
    }
  }
  
  socket.emit('execution-complete');
  
  try {
    fs.unlinkSync(filePath);
    
    if (language.toLowerCase() === 'c') {
      fs.unlinkSync(path.join(path.dirname(filePath), 'compiled_c'));
    } else if (language.toLowerCase() === 'cpp') {
      fs.unlinkSync(path.join(path.dirname(filePath), 'compiled_cpp'));
    } else if (language.toLowerCase() === 'rust') {
      fs.unlinkSync(path.join(path.dirname(filePath), 'compiled_rust'));
    }
  } catch (err) {
    console.error('Error cleaning up files:', err);
  }
};

// Socket.IO setup with secure configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});  // Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`New client connected (ID: ${socket.id})`);
  
  socket.emit('server-info', { 
    message: 'Connected to Web Terminal server',
    version: '1.0.0',
    port: server.address()?.port || 3001,
    supportedLanguages: Object.keys(languageConfig)
  });
  
  const socketState = {
    activeProcess: null,
    executionLanguage: null,
    executionStartTime: null,
    reconnected: false,
    filePath: null,
    clientId: socket.handshake.query.clientId || socket.id,
    userPreferences: {
      autoInstallPackages: true,
      showPackageInfo: true,
      theme: 'auto',
      packageManager: 'auto'
    },
    executionHistory: [],
    installedPackages: {}
  };
  
  if (socketState.clientId && clientPreferences.has(socketState.clientId)) {
    socketState.userPreferences = {
      ...socketState.userPreferences,
      ...clientPreferences.get(socketState.clientId)
    };
  }

  // Get template for a file extension
  socket.on('get-template', (extension) => {
    let template;
    
    // Map file extensions to language config
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust'
    };

    const language = langMap[extension];
    if (language && languageConfig[language]) {
      template = languageConfig[language].defaultCode;
    }

    socket.emit('template', template);
  });

  // Execute code
  socket.on('execute', async ({ code, language, filePath, preferences = {} }) => {
    console.log(`Server received code execution request for language: ${language}`);
    // Store execution parameters for reference
    socketState.executionLanguage = language;
    socketState.filePath = filePath;
    socketState.executionStartTime = Date.now();
    
    try {
      await executeCode(code, language, socket);
    } catch (error) {
      console.error('Error during code execution:', error);
      socket.emit('output', {
        output: `\r\n\x1b[31mExecution error: ${error.message}\x1b[0m\r\n`,
        error: true
      });
      socket.emit('execution-complete');
    }
  });
});

// Start the server with improved error handling and cleanup
const PORT = process.env.PORT || 3001;
const MAX_PORT_ATTEMPTS = 10;

const startServer = (port, attempts = 0) => {
  if (attempts >= MAX_PORT_ATTEMPTS) {
    console.error(`Failed to start server after ${MAX_PORT_ATTEMPTS} attempts`);
    process.exit(1);
  }

  server.listen(port)
    .on('listening', () => {
      console.log(`Web Terminal server listening on port ${port}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        startServer(port + 1, attempts + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
};

// Cleanup on server shutdown
const cleanup = () => {
  try {
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  cleanup();
});

startServer(PORT);
