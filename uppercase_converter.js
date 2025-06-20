function uppercaseConverter(text) {
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charCode = char.charCodeAt(0);
        
        // Check if character is lowercase (ASCII 97-122)
        if (charCode >= 97 && charCode <= 122) {
            // Convert to uppercase by subtracting 32 (difference between 'a' and 'A')
            result += String.fromCharCode(charCode - 32);
        } else {
            // Keep non-lowercase characters unchanged
            result += char;
        }
    }
    
    return result;
}

// Test cases
console.log('Test 1:', uppercaseConverter("hello world!")); // Expected: "HELLO WORLD!"
console.log('Test 2:', uppercaseConverter("Algorithms & Data Structures")); // Expected: "ALGORITHMS & DATA STRUCTURES"
console.log('Test 3:', uppercaseConverter("12345!@#$%")); // Expected: "12345!@#$%"
console.log('Test 4:', uppercaseConverter("")); // Expected: ""
console.log('Test 5:', uppercaseConverter("HELLO WORLD")); // Expected: "HELLO WORLD"
console.log('Test 6:', uppercaseConverter("aBcDeFgHiJkLmNoPqRsTuVwXyZ")); // Expected: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" 