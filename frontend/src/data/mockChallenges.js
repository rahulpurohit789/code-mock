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
      python: `def solution(nums, target):
    """
    Find two numbers in the array that add up to the target.
    
    Args:
        nums: List of integers
        target: Target sum to find
        
    Returns:
        List of two indices whose values sum to target
    """
    # Your code here
    pass

# Example usage:
nums = [2, 7, 11, 15]
target = 9
print(solution(nums, target))`,
      javascript: `function solution(nums, target) {
    /**
     * Find two numbers in the array that add up to the target.
     * 
     * @param {number[]} nums - Array of integers
     * @param {number} target - Target sum to find
     * @return {number[]} Array of two indices whose values sum to target
     */
    // Your code here
}

// Example usage:
const nums = [2, 7, 11, 15];
const target = 9;
console.log(solution(nums, target));`,
      java: `class Solution {
    /**
     * Find two numbers in the array that add up to the target.
     * 
     * @param nums Array of integers
     * @param target Target sum to find
     * @return Array of two indices whose values sum to target
     */
    public int[] solution(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solution.solution(nums, target);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`,
      cpp: `#include <vector>
#include <iostream>

class Solution {
public:
    /**
     * Find two numbers in the array that add up to the target.
     * 
     * @param nums Vector of integers
     * @param target Target sum to find
     * @return Vector of two indices whose values sum to target
     */
    std::vector<int> solution(std::vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};

int main() {
    Solution solution;
    std::vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    std::vector<int> result = solution.solution(nums, target);
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
      python: `def solution(s):
    """
    Reverse the string in-place.
    
    Args:
        s: List of characters to reverse
        
    Returns:
        None (modifies the input list in-place)
    """
    # Your code here
    pass

# Example usage:
s = ["h","e","l","l","o"]
solution(s)
print(s)`,
      javascript: `function solution(s) {
    /**
     * Reverse the string in-place.
     * 
     * @param {character[]} s - Array of characters to reverse
     * @return {void} Modifies the input array in-place
     */
    // Your code here
}

// Example usage:
const s = ["h","e","l","l","o"];
solution(s);
console.log(s);`,
      java: `class Solution {
    /**
     * Reverse the string in-place.
     * 
     * @param s Array of characters to reverse
     */
    public void solution(char[] s) {
        // Your code here
    }

    public static void main(String[] args) {
        Solution solution = new Solution();
        char[] s = {'h','e','l','l','o'};
        solution.solution(s);
        System.out.println(new String(s));
    }
}`,
      cpp: `#include <vector>
#include <iostream>
#include <string>

class Solution {
public:
    /**
     * Reverse the string in-place.
     * 
     * @param s Vector of characters to reverse
     */
    void solution(std::vector<char>& s) {
        // Your code here
    }
};

int main() {
    Solution solution;
    std::vector<char> s = {'h','e','l','l','o'};
    solution.solution(s);
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