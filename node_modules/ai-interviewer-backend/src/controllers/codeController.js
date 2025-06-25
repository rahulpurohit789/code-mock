const axios = require('axios');
const config = require('../config');

/**
 * Generate skeleton code using AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateSkeletonCode = async (req, res) => {
  try {
    const { language, problemDescription, testCases } = req.body;
    
    // Validate input
    if (!language || !problemDescription) {
      return res.status(400).json({ 
        success: false,
        error: 'Language and problem description are required' 
      });
    }

    // Create prompt for AI to generate skeleton code
    const prompt = `Generate skeleton code for the following coding problem in ${language}:

Problem Description:
${problemDescription}

Test Cases:
${testCases ? testCases.map((tc, i) => `Test Case ${i + 1}: Input: ${tc.input}, Expected Output: ${tc.expectedOutput}`).join('\n') : 'No test cases provided'}

Requirements:
1. Create a function named 'solution' that takes appropriate parameters based on the problem
2. Use proper parameter names that match the problem context
3. Include proper type hints/annotations for the language
4. Add helpful comments explaining the approach
5. Include example usage with the first test case
6. Make sure the function signature matches what the test cases expect

Please provide only the code without any explanations.`;

    // Call AI service to generate skeleton code
    const aiResponse = await axios.post('http://localhost:3001/api/chat', {
      message: prompt,
      type: 'skeleton_generation'
    }, {
      withCredentials: true
    });

    if (!aiResponse.data || !aiResponse.data.response) {
      throw new Error('Failed to generate skeleton code from AI');
    }

    // Extract code from AI response
    const aiCode = aiResponse.data.response;
    
    // Clean up the response to extract just the code
    let skeletonCode = aiCode;
    
    // Remove markdown code blocks if present
    if (aiCode.includes('```')) {
      const codeBlockMatch = aiCode.match(/```(?:[a-z]*\n)?([\s\S]*?)```/);
      if (codeBlockMatch) {
        skeletonCode = codeBlockMatch[1].trim();
      }
    }

    res.json({
      success: true,
      data: {
        language: language,
        skeletonCode: skeletonCode
      }
    });

  } catch (error) {
    console.error('Skeleton code generation error:', error.response?.data || error.message);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate skeleton code',
      details: error.response?.data?.message || error.message || 'Unknown error occurred'
    });
  }
};

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
            // Extract function name from the code
            const pythonFuncMatch = code.match(/def\s+(\w+)\s*\(/);
            const pythonFuncName = pythonFuncMatch ? pythonFuncMatch[1] : 'solution';
            
            // Parse the test case input to extract parameters
            if (testCase.input) {
            const pythonParams = testCase.input.match(/\[(.*?)\],\s*(\d+)/);
            if (pythonParams) {
              const arrayParam = pythonParams[1];
              const targetParam = pythonParams[2];
                modifiedCode += `print(${pythonFuncName}([${arrayParam}], ${targetParam}))`;
              } else {
                // Handle single array or string parameters
                const arrayMatch = testCase.input.match(/\[(.*?)\]/);
                if (arrayMatch) {
                  const arrayParam = arrayMatch[1];
                  modifiedCode += `print(${pythonFuncName}([${arrayParam}]))`;
                } else {
                  modifiedCode += `print(${pythonFuncName}(${testCase.input}))`;
              }
              }
            } else {
              modifiedCode += `print(${pythonFuncName}())`;
            }
            break;
            
          case 'javascript':
            modifiedCode = `${code}\n\n// Test case input\n`;
            // Extract function name from the code
            const jsFuncMatch = code.match(/function\s+(\w+)\s*\(/);
            const jsFuncName = jsFuncMatch ? jsFuncMatch[1] : 'solution';
            
            // Parse the test case input to extract parameters
            if (testCase.input) {
            const jsParams = testCase.input.match(/\[(.*?)\],\s*(\d+)/);
            if (jsParams) {
              const arrayParam = jsParams[1];
              const targetParam = jsParams[2];
                modifiedCode += `console.log(${jsFuncName}([${arrayParam}], ${targetParam}));`;
              } else {
                // Handle single array or string parameters
                const arrayMatch = testCase.input.match(/\[(.*?)\]/);
                if (arrayMatch) {
                  const arrayParam = arrayMatch[1];
                  modifiedCode += `console.log(${jsFuncName}([${arrayParam}]));`;
                } else {
                  modifiedCode += `console.log(${jsFuncName}(${testCase.input}));`;
              }
              }
            } else {
              modifiedCode += `console.log(${jsFuncName}());`;
            }
            break;
            
          case 'java':
            if (!code.includes('class Solution')) {
              modifiedCode = code.replace(/class\s+\w+\s*{/, 'class Solution {');
            }
            // Extract function name from the code
            const javaFuncMatch = code.match(/public\s+\w+\s+(\w+)\s*\(/);
            const javaFuncName = javaFuncMatch ? javaFuncMatch[1] : 'solution';
            
            // Parse the test case input to extract parameters
            if (testCase.input) {
            const javaParams = testCase.input.match(/\[(.*?)\],\s*(\d+)/);
            if (javaParams) {
              const arrayParam = javaParams[1];
              const targetParam = javaParams[2];
              modifiedCode = modifiedCode.replace(
                /public\s+static\s+void\s+main\s*\([^)]*\)\s*{/,
                `public static void main(String[] args) {
                    Solution solution = new Solution();
                    int[] nums = {${arrayParam}};
                    int target = ${targetParam};
                    int[] result = solution.${javaFuncName}(nums, target);
                    System.out.println("[" + result[0] + "," + result[1] + "]");`
              );
            } else {
              // Handle string reversal case
              const stringParams = testCase.input.match(/\[(.*?)\]/);
              if (stringParams) {
                const chars = stringParams[1].split(',').map(c => c.trim().replace(/"/g, "'"));
                modifiedCode = modifiedCode.replace(
                  /public\s+static\s+void\s+main\s*\([^)]*\)\s*{/,
                  `public static void main(String[] args) {
                      Solution solution = new Solution();
                      char[] s = {${chars.join(', ')}};
                        solution.${javaFuncName}(s);
                      System.out.println(new String(s));`
                );
              } else {
                modifiedCode = modifiedCode.replace(
                  /public\s+static\s+void\s+main\s*\([^)]*\)\s*{/,
                  `public static void main(String[] args) {
                      Solution solution = new Solution();
                        System.out.println(solution.${javaFuncName}(${testCase.input}));`
                );
              }
              }
            } else {
              modifiedCode = modifiedCode.replace(
                /public\s+static\s+void\s+main\s*\([^)]*\)\s*{/,
                `public static void main(String[] args) {
                    Solution solution = new Solution();
                    System.out.println(solution.${javaFuncName}());`
              );
            }
            break;
            
          case 'cpp':
            modifiedCode = `${code}\n\n// Test case input\n`;
            // Extract function name from the code
            const cppFuncMatch = code.match(/\w+\s+(\w+)\s*\(/);
            const cppFuncName = cppFuncMatch ? cppFuncMatch[1] : 'solution';
            
            // Parse the test case input to extract parameters
            if (testCase.input) {
            const cppParams = testCase.input.match(/\[(.*?)\],\s*(\d+)/);
            if (cppParams) {
              const arrayParam = cppParams[1];
              const targetParam = cppParams[2];
              modifiedCode += `int main() {
                Solution solution;
                std::vector<int> nums = {${arrayParam}};
                int target = ${targetParam};
                std::vector<int> result = solution.${cppFuncName}(nums, target);
                std::cout << "[" << result[0] << "," << result[1] << "]" << std::endl;
                return 0;
            }`;
            } else {
              // Handle string reversal case
              const stringParams = testCase.input.match(/\[(.*?)\]/);
              if (stringParams) {
                const chars = stringParams[1].split(',').map(c => c.trim().replace(/"/g, "'"));
                modifiedCode += `int main() {
                Solution solution;
                std::vector<char> s = {${chars.join(', ')}};
                solution.${cppFuncName}(s);
                for (char c : s) std::cout << c;
                std::cout << std::endl;
                return 0;
            }`;
              } else {
                modifiedCode += `int main() {
                Solution solution;
                std::cout << solution.${cppFuncName}(${testCase.input}) << std::endl;
                return 0;
            }`;
              }
              }
            } else {
              modifiedCode += `int main() {
                Solution solution;
                std::cout << solution.${cppFuncName}() << std::endl;
                return 0;
            }`;
            }
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