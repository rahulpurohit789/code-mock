import React, { useEffect } from 'react';
import Editor from '@monaco-editor/react';

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' }
];

const DEFAULT_CODE = {
  python: `# Python Example
def greet(name):
    return f"Hello, {name}!"

# Test the function
print(greet("World"))`,

  javascript: `// JavaScript Example
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Test the function
console.log(greet("World"));`,

  java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println(greet("World"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,

  cpp: `// C++ Example
#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::cout << greet("World") << std::endl;
    return 0;
}`
};

function CodeEditor({ code, language, onCodeChange, isDarkMode }) {
  const handleEditorChange = (value) => {
    onCodeChange(value);
  };

  const getLanguageConfig = () => {
    switch (language) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      default:
        return 'python';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Code Editor
          </h2>
          <select
            value={language}
            onChange={(e) => {
              onCodeChange(DEFAULT_CODE[e.target.value]);
            }}
            className={`px-3 py-1 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } border`}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="python"
          language={getLanguageConfig()}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            readOnly: false,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            folding: true,
            bracketPairColorization: true,
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditor; 