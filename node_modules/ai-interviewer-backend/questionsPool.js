// Pool of 50 DSA Problems for Code Mock Interview System
const dsaProblemsPool = [
    // ARRAYS (10 problems)
    {
      "title": "Two Sum",
      "difficulty": "easy",
      "story": "You are working on a financial application that needs to find pairs of transactions.",
      "problem": "Given an array of integers and a target sum, find two numbers in the array that add up to the target sum.",
      "requirements": [
        "Return the indices of the two numbers that add up to the target",
        "Assume there is exactly one solution",
        "You may not use the same element twice"
      ],
      "parameterNames": ["nums", "target"],
      "testCases": [
        { "inputs": ["[2, 7, 11, 15]", "9"], "output": "[0, 1]", "explanation": "nums[0] + nums[1] = 2 + 7 = 9" },
        { "inputs": ["[3, 2, 4]", "6"], "output": "[1, 2]", "explanation": "nums[1] + nums[2] = 2 + 4 = 6" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[1, 5, 8, 10, 13]", "18"], "output": "[2, 4]" },
        { "inputs": ["[0, 4, 3, 0]", "0"], "output": "[0, 3]" }
      ],
      "skeletonCode": {
        "python": "def findTwoSum(nums, target):\n    # Your code here\n    pass",
        "javascript": "function findTwoSum(nums, target) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int[] findTwoSum(int[] nums, int target) {\n        // Your code here\n        return new int[2];\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> findTwoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};"
      }
    },
    {
      "title": "Best Time to Buy and Sell Stock",
      "difficulty": "easy",
      "story": "You are analyzing stock prices to find the maximum profit from a single buy-sell transaction.",
      "problem": "Given an array of stock prices, find the maximum profit you can achieve by buying and selling once.",
      "requirements": [
        "You must buy before you sell",
        "Return the maximum profit possible",
        "If no profit is possible, return 0"
      ],
      "parameterNames": ["prices"],
      "testCases": [
        { "inputs": ["[7, 1, 5, 3, 6, 4]"], "output": "5", "explanation": "Buy at 1, sell at 6" },
        { "inputs": ["[7, 6, 4, 3, 1]"], "output": "0", "explanation": "No profit possible" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[1, 2, 3, 4, 5]"], "output": "4" },
        { "inputs": ["[2, 4, 1]"], "output": "2" }
      ],
      "skeletonCode": {
        "python": "def maxProfit(prices):\n    # Your code here\n    pass",
        "javascript": "function maxProfit(prices) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int maxProfit(int[] prices) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Your code here\n        return 0;\n    }\n};"
      }
    },
    {
      "title": "Maximum Subarray",
      "difficulty": "medium",
      "story": "You are analyzing sensor data to find the segment with maximum sum reading.",
      "problem": "Find the contiguous subarray with the largest sum and return its sum.",
      "requirements": [
        "The subarray must be contiguous",
        "Return the maximum sum",
        "Handle negative numbers appropriately"
      ],
      "parameterNames": ["nums"],
      "testCases": [
        { "inputs": ["[-2, 1, -3, 4, -1, 2, 1, -5, 4]"], "output": "6", "explanation": "Subarray [4, -1, 2, 1] has sum 6" },
        { "inputs": ["[1]"], "output": "1", "explanation": "Single element" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[5, 4, -1, 7, 8]"], "output": "23" },
        { "inputs": ["[-1, -2, -3]"], "output": "-1" }
      ],
      "skeletonCode": {
        "python": "def maxSubArray(nums):\n    # Your code here\n    pass",
        "javascript": "function maxSubArray(nums) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};"
      }
    },
    {
      "title": "Contains Duplicate",
      "difficulty": "easy",
      "story": "You are building a system to detect duplicate entries in a dataset.",
      "problem": "Given an array of integers, return true if any value appears at least twice.",
      "requirements": [
        "Return true if duplicates exist",
        "Return false if all elements are distinct",
        "Optimize for time complexity"
      ],
      "parameterNames": ["nums"],
      "testCases": [
        { "inputs": ["[1, 2, 3, 1]"], "output": "true", "explanation": "1 appears twice" },
        { "inputs": ["[1, 2, 3, 4]"], "output": "false", "explanation": "All elements are distinct" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]"], "output": "true" },
        { "inputs": ["[]"], "output": "false" }
      ],
      "skeletonCode": {
        "python": "def containsDuplicate(nums):\n    # Your code here\n    pass",
        "javascript": "function containsDuplicate(nums) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Your code here\n        return false;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Your code here\n        return false;\n    }\n};"
      }
    },
    {
      "title": "Product of Array Except Self",
      "difficulty": "medium",
      "story": "You are calculating profit margins where each product's margin depends on all other products.",
      "problem": "Given an array, return an array where each element is the product of all other elements except itself.",
      "requirements": [
        "Do not use division operation",
        "Solve in O(n) time",
        "The output array doesn't count as extra space"
      ],
      "parameterNames": ["nums"],
      "testCases": [
        { "inputs": ["[1, 2, 3, 4]"], "output": "[24, 12, 8, 6]", "explanation": "For index 0: 2*3*4=24" },
        { "inputs": ["[-1, 1, 0, -3, 3]"], "output": "[0, 0, 9, 0, 0]", "explanation": "Zero makes most products zero" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[2, 3, 4, 5]"], "output": "[60, 40, 30, 24]" },
        { "inputs": ["[1, 0]"], "output": "[0, 1]" }
      ],
      "skeletonCode": {
        "python": "def productExceptSelf(nums):\n    # Your code here\n    pass",
        "javascript": "function productExceptSelf(nums) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Your code here\n        return new int[nums.length];\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        // Your code here\n        return {};\n    }\n};"
      }
    },
    {
      "title": "Find Minimum in Rotated Sorted Array",
      "difficulty": "medium",
      "story": "You are working with a sorted array that was rotated, and need to find the minimum element.",
      "problem": "Find the minimum element in a rotated sorted array with unique elements.",
      "requirements": [
        "The array was originally sorted in ascending order",
        "The array has been rotated between 1 and n times",
        "All elements are unique"
      ],
      "parameterNames": ["nums"],
      "testCases": [
        { "inputs": ["[3, 4, 5, 1, 2]"], "output": "1", "explanation": "Original array was [1,2,3,4,5] rotated 3 times" },
        { "inputs": ["[4, 5, 6, 7, 0, 1, 2]"], "output": "0", "explanation": "Minimum is 0" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[11, 13, 15, 17]"], "output": "11" },
        { "inputs": ["[2, 1]"], "output": "1" }
      ],
      "skeletonCode": {
        "python": "def findMin(nums):\n    # Your code here\n    pass",
        "javascript": "function findMin(nums) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int findMin(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};"
      }
    },
    {
      "title": "3Sum",
      "difficulty": "medium",
      "story": "You are analyzing data points to find triplets that sum to zero for balance calculations.",
      "problem": "Find all unique triplets in the array that sum to zero.",
      "requirements": [
        "Return all unique triplets [a, b, c] where a + b + c = 0",
        "The solution set must not contain duplicate triplets",
        "Order of triplets and elements within triplets doesn't matter"
      ],
      "parameterNames": ["nums"],
      "testCases": [
        { "inputs": ["[-1, 0, 1, 2, -1, -4]"], "output": "[[-1, -1, 2], [-1, 0, 1]]", "explanation": "Two unique triplets sum to 0" },
        { "inputs": ["[0, 1, 1]"], "output": "[]", "explanation": "No triplets sum to 0" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[0, 0, 0]"], "output": "[[0, 0, 0]]" },
        { "inputs": ["[-2, 0, 1, 1, 2]"], "output": "[[-2, 0, 2], [-2, 1, 1]]" }
      ],
      "skeletonCode": {
        "python": "def threeSum(nums):\n    # Your code here\n    pass",
        "javascript": "function threeSum(nums) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\nimport java.util.List;\nimport java.util.ArrayList;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Your code here\n        return {};\n    }\n};"
      }
    },
    {
      "title": "Container With Most Water",
      "difficulty": "medium",
      "story": "You are designing a water container system with vertical lines as walls.",
      "problem": "Find two lines that together with the x-axis form a container that holds the most water.",
      "requirements": [
        "Return the maximum area of water that can be contained",
        "You cannot slant the container",
        "Use the two-pointer technique for efficiency"
      ],
      "parameterNames": ["height"],
      "testCases": [
        { "inputs": ["[1, 8, 6, 2, 5, 4, 8, 3, 7]"], "output": "49", "explanation": "Lines at index 1 and 8 with height 8 and 7" },
        { "inputs": ["[1, 1]"], "output": "1", "explanation": "Only one possible container" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[1, 2, 1]"], "output": "2" },
        { "inputs": ["[1, 2, 4, 3]"], "output": "4" }
      ],
      "skeletonCode": {
        "python": "def maxArea(height):\n    # Your code here\n    pass",
        "javascript": "function maxArea(height) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int maxArea(int[] height) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Your code here\n        return 0;\n    }\n};"
      }
    },
    {
      "title": "Search in Rotated Sorted Array",
      "difficulty": "medium",
      "story": "You are searching through a database that was sorted but then rotated due to system maintenance.",
      "problem": "Search for a target value in a rotated sorted array. Return its index or -1 if not found.",
      "requirements": [
        "The array was originally sorted in ascending order",
        "The array has been rotated at some pivot",
        "All values are unique"
      ],
      "parameterNames": ["nums", "target"],
      "testCases": [
        { "inputs": ["[4, 5, 6, 7, 0, 1, 2]", "0"], "output": "4", "explanation": "Target 0 is at index 4" },
        { "inputs": ["[4, 5, 6, 7, 0, 1, 2]", "3"], "output": "-1", "explanation": "Target 3 is not in array" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[1]", "0"], "output": "-1" },
        { "inputs": ["[1, 3]", "3"], "output": "1" }
      ],
      "skeletonCode": {
        "python": "def search(nums, target):\n    # Your code here\n    pass",
        "javascript": "function search(nums, target) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int search(int[] nums, int target) {\n        // Your code here\n        return -1;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Your code here\n        return -1;\n    }\n};"
      }
    },
    {
      "title": "Maximum Product Subarray",
      "difficulty": "medium",
      "story": "You are analyzing product performance data to find the segment with maximum product value.",
      "problem": "Find the contiguous subarray with the largest product and return the product.",
      "requirements": [
        "The subarray must be contiguous",
        "Handle both positive and negative numbers",
        "Consider that negative × negative = positive"
      ],
      "parameterNames": ["nums"],
      "testCases": [
        { "inputs": ["[2, 3, -2, 4]"], "output": "6", "explanation": "Subarray [2, 3] has product 6" },
        { "inputs": ["[-2, 0, -1]"], "output": "0", "explanation": "0 is the maximum product" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[-2, 3, -4]"], "output": "24" },
        { "inputs": ["[0, 2]"], "output": "2" }
      ],
      "skeletonCode": {
        "python": "def maxProduct(nums):\n    # Your code here\n    pass",
        "javascript": "function maxProduct(nums) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int maxProduct(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};"
      }
    },
  
    // TWO POINTERS (5 problems)
    {
      "title": "Valid Palindrome",
      "difficulty": "easy",
      "story": "You are building a text validation system that checks if phrases read the same forwards and backwards.",
      "problem": "Check if a string is a palindrome, considering only alphanumeric characters and ignoring case.",
      "requirements": [
        "Only consider alphanumeric characters",
        "Ignore case differences",
        "Return true if it's a palindrome, false otherwise"
      ],
      "parameterNames": ["s"],
      "testCases": [
        { "inputs": ["\"A man, a plan, a canal: Panama\""], "output": "true", "explanation": "Reads 'amanaplanacanalpanama' forwards and backwards" },
        { "inputs": ["\"race a car\""], "output": "false", "explanation": "Reads 'raceacar' which is not a palindrome" }
      ],
      "hiddenTestCases": [
        { "inputs": ["\" \""], "output": "true" },
        { "inputs": ["\"a.\""], "output": "true" }
      ],
      "skeletonCode": {
        "python": "def isPalindrome(s):\n    # Your code here\n    pass",
        "javascript": "function isPalindrome(s) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public boolean isPalindrome(String s) {\n        // Your code here\n        return false;\n    }\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Your code here\n        return false;\n    }\n};"
      }
    },
    {
      "title": "Two Sum II - Input Array Is Sorted",
      "difficulty": "easy",
      "story": "You have a sorted array of numbers and need to find two numbers that add up to a specific target.",
      "problem": "Find two numbers in a sorted array that add up to a target. Return their 1-indexed positions.",
      "requirements": [
        "The array is sorted in ascending order",
        "There is exactly one solution",
        "Return 1-indexed positions, not 0-indexed"
      ],
      "parameterNames": ["numbers", "target"],
      "testCases": [
        { "inputs": ["[2, 7, 11, 15]", "9"], "output": "[1, 2]", "explanation": "numbers[0] + numbers[1] = 2 + 7 = 9" },
        { "inputs": ["[2, 3, 4]", "6"], "output": "[1, 3]", "explanation": "numbers[0] + numbers[2] = 2 + 4 = 6" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[-1, 0]", "-1"], "output": "[1, 2]" },
        { "inputs": ["[1, 2, 3, 4, 4, 9, 56, 90]", "8"], "output": "[4, 5]" }
      ],
      "skeletonCode": {
        "python": "def twoSum(numbers, target):\n    # Your code here\n    pass",
        "javascript": "function twoSum(numbers, target) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        // Your code here\n        return new int[2];\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        // Your code here\n        return {};\n    }\n};"
      }
    },
    {
      "title": "Remove Duplicates from Sorted Array",
      "difficulty": "easy",
      "story": "You are cleaning up a sorted dataset by removing duplicate entries in-place.",
      "problem": "Remove duplicates from a sorted array in-place and return the number of unique elements.",
      "requirements": [
        "Modify the array in-place",
        "Return the number of unique elements",
        "The relative order of elements should be kept the same"
      ],
      "parameterNames": ["nums"],
      "testCases": [
        { "inputs": ["[1, 1, 2]"], "output": "2", "explanation": "First 2 elements become [1, 2]" },
        { "inputs": ["[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]"], "output": "5", "explanation": "First 5 elements become [0, 1, 2, 3, 4]" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[1, 2, 3]"], "output": "3" },
        { "inputs": ["[1, 1, 1, 1]"], "output": "1" }
      ],
      "skeletonCode": {
        "python": "def removeDuplicates(nums):\n    # Your code here\n    pass",
        "javascript": "function removeDuplicates(nums) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int removeDuplicates(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int removeDuplicates(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};"
      }
    },
    {
      "title": "Move Zeros",
      "difficulty": "easy",
      "story": "You are organizing data where zeros represent missing values that should be moved to the end.",
      "problem": "Move all zeros in an array to the end while maintaining the relative order of non-zero elements.",
      "requirements": [
        "Modify the array in-place",
        "Maintain relative order of non-zero elements",
        "All zeros should be at the end"
      ],
      "parameterNames": ["nums"],
      "testCases": [
        { "inputs": ["[0, 1, 0, 3, 12]"], "output": "[1, 3, 12, 0, 0]", "explanation": "Non-zeros moved to front, zeros to end" },
        { "inputs": ["[0]"], "output": "[0]", "explanation": "Single zero remains" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[1, 2, 3]"], "output": "[1, 2, 3]" },
        { "inputs": ["[0, 0, 1]"], "output": "[1, 0, 0]" }
      ],
      "skeletonCode": {
        "python": "def moveZeroes(nums):\n    # Your code here\n    pass",
        "javascript": "function moveZeroes(nums) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public void moveZeroes(int[] nums) {\n        // Your code here\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {\n        // Your code here\n    }\n};"
      }
    },
    {
      "title": "Trapping Rain Water",
      "difficulty": "hard",
      "story": "You are calculating how much rainwater can be trapped between buildings of different heights.",
      "problem": "Calculate how much water can be trapped after raining given the height of bars.",
      "requirements": [
        "Water can only be trapped between higher bars",
        "Return the total volume of trapped water",
        "Consider that water flows to lower areas"
      ],
      "parameterNames": ["height"],
      "testCases": [
        { "inputs": ["[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]"], "output": "6", "explanation": "6 units of water can be trapped" },
        { "inputs": ["[4, 2, 0, 3, 2, 5]"], "output": "9", "explanation": "9 units of water can be trapped" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[3, 0, 2, 0, 4]"], "output": "7" },
        { "inputs": ["[1, 2, 3]"], "output": "0" }
      ],
      "skeletonCode": {
        "python": "def trap(height):\n    # Your code here\n    pass",
        "javascript": "function trap(height) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int trap(int[] height) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Your code here\n        return 0;\n    }\n};"
      }
    },
  
    // STRINGS (8 problems)
    {
      "title": "Valid Anagram",
      "difficulty": "easy",
      "story": "You are building a word game that needs to check if two words are anagrams of each other.",
      "problem": "Determine if two strings are anagrams (contain the same characters with the same frequency).",
      "requirements": [
        "Return true if the strings are anagrams",
        "Consider character frequency, not just presence",
        "Case sensitive comparison"
      ],
      "parameterNames": ["s", "t"],
      "testCases": [
        { "inputs": ["\"anagram\"", "\"nagaram\""], "output": "true", "explanation": "Both contain same characters with same frequency" },
        { "inputs": ["\"rat\"", "\"car\""], "output": "false", "explanation": "Different characters" }
      ],
      "hiddenTestCases": [
        { "inputs": ["\"listen\"", "\"silent\""], "output": "true" },
        { "inputs": ["\"hello\"", "\"bello\""], "output": "false" }
      ],
      "skeletonCode": {
        "python": "def isAnagram(s, t):\n    # Your code here\n    pass",
        "javascript": "function isAnagram(s, t) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public boolean isAnagram(String s, String t) {\n        // Your code here\n        return false;\n    }\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        // Your code here\n        return false;\n    }\n};"
      }
    },
    {
      "title": "Group Anagrams",
      "difficulty": "medium",
      "story": "You are organizing a dictionary where words that are anagrams should be grouped together.",
      "problem": "Group strings that are anagrams of each other together.",
      "requirements": [
        "Return a list of groups where each group contains anagrams",
        "The order of groups and words within groups doesn't matter",
        "Handle empty strings appropriately"
      ],
      "parameterNames": ["strs"],
      "testCases": [
        { "inputs": ["[\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"]"], "output": "[[\"bat\"], [\"nat\", \"tan\"], [\"ate\", \"eat\", \"tea\"]]", "explanation": "Words grouped by anagram pattern" },
        { "inputs": ["[\"\"]"], "output": "[[\"\"]]", "explanation": "Single empty string" }
      ],
      "hiddenTestCases": [
        { "inputs": ["[\"a\"]"], "output": "[[\"a\"]]" },
        { "inputs": ["[\"ab\", \"ba\", \"abc\", \"bca\"]"], "output": "[[\"ab\", \"ba\"], [\"abc\", \"bca\"]]" }
      ],
      "skeletonCode": {
        "python": "def groupAnagrams(strs):\n    # Your code here\n    pass",
        "javascript": "function groupAnagrams(strs) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\nimport java.util.List;\nimport java.util.ArrayList;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        // Your code here\n        return {};\n    }\n};"
      }
    },
    {
      "title": "Longest Substring Without Repeating Characters",
      "difficulty": "medium",
      "story": "You are analyzing text patterns to find the longest sequence without repeated characters.",
      "problem": "Find the length of the longest substring without repeating characters.",
      "requirements": [
        "Return the length of the longest valid substring",
        "A substring is a contiguous sequence of characters",
        "No character should repeat within the substring"
      ],
      "parameterNames": ["s"],
      "testCases": [
        { "inputs": ["\"abcabcbb\""], "output": "3", "explanation": "Longest substring is 'abc' with length 3" },
        { "inputs": ["\"bbbbb\""], "output": "1", "explanation": "Longest substring is 'b' with length 1" }
      ],
      "hiddenTestCases": [
        { "inputs": ["\"pwwkew\""], "output": "3" },
        { "inputs": ["\"\""], "output": "0" }
      ],
      "skeletonCode": {
        "python": "def lengthOfLongestSubstring(s):\n    # Your code here\n    pass",
        "javascript": "function lengthOfLongestSubstring(s) {\n    // Your code here\n}",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        return 0;\n    }\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        return 0;\n    }\n};"
      }
    }
  ];

module.exports = { dsaProblemsPool };