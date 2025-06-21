const axios = require('axios');
const config = require('../config');

/**
 * Execute code using Piston API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.executeCode = async (req, res) => {
  try {
    const { code, language, testCases } = req.body;
    
    // Validate input
    if (!code || !language) {
      return res.status(400).json({ 
        success: false,
        error: 'Code and language are required' 
      });
    }

    // Get language version
    const version = config.languageVersions[language.toLowerCase()] || "latest";
    
    // Process each test case
    const testResults = [];
    if (testCases && testCases.length > 0) {
      for (const testCase of testCases) {
        // Modify code for current test case
        let modifiedCode = code;
        
        switch (language.toLowerCase()) {
          case 'python':
            modifiedCode = `${code}\n\n# Test case input\n`;
            modifiedCode += `print(solution(${testCase.input}))`;
            break;
            
          case 'javascript':
            modifiedCode = `${code}\n\n// Test case input\n`;
            modifiedCode += `console.log(solution(${testCase.input}));`;
            break;
            
          case 'java':
            if (!code.includes('class Solution')) {
              modifiedCode = code.replace(/class\s+\w+\s*{/, 'class Solution {');
            }
            modifiedCode = modifiedCode.replace(
              /public\s+static\s+void\s+main\s*\([^)]*\)\s*{/,
              `public static void main(String[] args) {
                  Solution solution = new Solution();
                  System.out.println(solution.solution(${testCase.input}));`
            );
            break;
            
          case 'cpp':
            modifiedCode = `${code}\n\n// Test case input\n`;
            modifiedCode += `int main() {
                Solution solution;
                std::cout << solution.solution(${testCase.input}) << std::endl;
                return 0;
            }`;
            break;
        }

        // Execute the code for current test case
        const response = await axios.post(config.pistonAPI, {
          language: language.toLowerCase(),
          version: version,
          files: [{
            content: modifiedCode
          }]
        });

        if (!response.data) {
          throw new Error('Invalid response from code execution service');
        }

        const actualOutput = response.data.run?.stdout?.trim() || '';
        
        // Normalize outputs
        const normalizeOutput = (str) => {
          return str
            .replace(/[\s\n]+/g, '') // Remove all whitespace and newlines
            .replace(/\[/g, '[')     // Ensure consistent bracket formatting
            .replace(/\]/g, ']')
            .replace(/,/g, ', ');    // Add space after commas
        };
        
        const normalizedActual = normalizeOutput(actualOutput);
        const normalizedExpected = normalizeOutput(testCase.expectedOutput);
        
        testResults.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: actualOutput,
          passed: normalizedActual === normalizedExpected,
          error: response.data.run?.stderr || null
        });
      }
    }

    // Format the final response
    const result = {
      success: true,
      data: {
        language: language,
        version: version,
        testResults: testResults
      }
    };

    res.json(result);

  } catch (error) {
    console.error('Code execution error:', error.response?.data || error.message);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to execute code',
      details: error.response?.data?.message || error.message || 'Unknown error occurred'
    });
  }
}; 