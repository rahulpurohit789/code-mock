const { dsaProblemsPool } = require('./backend/questionsPool');

console.log('✅ QuestionsPool Test');
console.log('Total problems:', dsaProblemsPool.length);
console.log('First problem:', dsaProblemsPool[0].title);
console.log('First problem has skeleton code:', !!dsaProblemsPool[0].skeletonCode);
console.log('First problem skeleton code languages:', Object.keys(dsaProblemsPool[0].skeletonCode));

// Test random selection
const randomProblem = dsaProblemsPool[Math.floor(Math.random() * dsaProblemsPool.length)];
console.log('\n🎲 Random problem selected:', randomProblem.title);
console.log('Has skeleton code:', !!randomProblem.skeletonCode);
console.log('Python skeleton:', randomProblem.skeletonCode.python.substring(0, 50) + '...');

console.log('\n✅ QuestionsPool is working correctly!'); 