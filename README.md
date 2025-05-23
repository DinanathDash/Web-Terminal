# Code Terminal

A modern, aesthetically pleasing web-based code editor that allows you to run code in multiple programming languages right in your browser. This application features a clean UI with a Monaco Editor (the same editor used in VS Code) and a real-time terminal output display.

## Features

- **Multi-language Support**: Run code in JavaScript, Python, Java, C, C++, Ruby, Go, and Rust
- **Modern UI**: Clean, responsive interface with light and dark mode
- **Real-time Execution**: See your code output in real-time
- **Syntax Highlighting**: Code highlighting for all supported languages
- **Terminal Output**: Terminal-like interface for viewing code execution results

## Technologies Used

- **Frontend**: React, Material UI, Monaco Editor, Xterm.js
- **Backend**: Node.js, Express, Socket.io
- **Code Execution**: Native execution with proper sandboxing

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- For executing code in various languages, you'll need the respective language runtimes installed on your server:
  - Node.js for JavaScript
  - Python 3 for Python
  - JDK for Java
  - GCC/G++ for C/C++
  - Ruby interpreter for Ruby
  - Go compiler for Go
  - Rust compiler for Rust

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   node server/index.js
   ```

2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to http://localhost:5173

## Usage

1. Select a programming language from the dropdown menu
2. Write your code in the editor
3. Click the "Run" button to execute the code
4. View the output in the terminal window

## License

This project is open source and available under the MIT License.

## Acknowledgements

- Monaco Editor for the code editing experience
- Xterm.js for the terminal emulation
- Material UI for the modern interface components
