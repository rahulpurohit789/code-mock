export const challenges = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
    starterCode: {
      python: `def twoSum(nums, target):
    # Write your code here
    pass

# Example usage:
nums = [2, 7, 11, 15]
target = 9
print(twoSum(nums, target))`,
      javascript: `function twoSum(nums, target) {
    // Write your code here
}

// Example usage:
const nums = [2, 7, 11, 15];
const target = 9;
console.log(twoSum(nums, target));`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.twoSum(nums, target);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`,
      cpp: `#include <vector>
#include <iostream>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};

int main() {
    Solution solution;
    std::vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    std::vector<int> result = solution.twoSum(nums, target);
    std::cout << "[" << result[0] << "," << result[1] << "]" << std::endl;
    return 0;
}`
    },
    testCases: [
      {
        input: '[2,7,11,15], 9',
        expectedOutput: '[0,1]'
      },
      {
        input: '[3,2,4], 6',
        expectedOutput: '[1,2]'
      },
      {
        input: '[3,3], 6',
        expectedOutput: '[0,1]'
      }
    ]
  },
  {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    description: `Write a function that reverses a string. The input string is given as an array of characters s.
You must do this by modifying the input array in-place with O(1) extra memory.

Example 1:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

Example 2:
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]`,
    starterCode: {
      python: `def reverseString(s):
    # Write your code here
    pass

# Example usage:
s = ["h","e","l","l","o"]
reverseString(s)
print(s)`,
      javascript: `function reverseString(s) {
    // Write your code here
}

// Example usage:
const s = ["h","e","l","l","o"];
reverseString(s);
console.log(s);`,
      java: `class Solution {
    public void reverseString(char[] s) {
        // Write your code here
    }

    public static void main(String[] args) {
        Solution solution = new Solution();
        char[] s = {'h','e','l','l','o'};
        solution.reverseString(s);
        System.out.println(new String(s));
    }
}`,
      cpp: `#include <vector>
#include <iostream>
#include <string>

class Solution {
public:
    void reverseString(std::vector<char>& s) {
        // Write your code here
    }
};

int main() {
    Solution solution;
    std::vector<char> s = {'h','e','l','l','o'};
    solution.reverseString(s);
    for (char c : s) std::cout << c;
    std::cout << std::endl;
    return 0;
}`
    },
    testCases: [
      {
        input: '["h","e","l","l","o"]',
        expectedOutput: '["o","l","l","e","h"]'
      },
      {
        input: '["H","a","n","n","a","h"]',
        expectedOutput: '["h","a","n","n","a","H"]'
      }
    ]
  }
];

export const getChallenge = (id) => {
  return challenges.find(challenge => challenge.id === id);
}; 