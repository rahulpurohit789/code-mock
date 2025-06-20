const fetch = require('fetch-cookie/node-fetch')(require('node-fetch'));

const BASE_URL = 'http://localhost:3001';

async function runInterview() {
  // Reset session
  await fetch(BASE_URL + '/api/reset', { method: 'POST' });

  // 1. Start interview (should trigger intro Q1)
  let res = await fetch(BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello' })
  });
  let data = await res.json();
  console.log('\n🤖', data.response, '\nPhase:', data.phase);

  // 2. Answer intro Q1 (should trigger intro Q2)
  res = await fetch(BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'I am John, studied CS, love Python and JavaScript, 3 years experience.' })
  });
  data = await res.json();
  console.log('\n🤖', data.response, '\nPhase:', data.phase);

  // 3. Answer intro Q2 (should trigger core topic Q1)
  res = await fetch(BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'I built an e-commerce site with React and Node.js.' })
  });
  data = await res.json();
  console.log('\n🤖', data.response, '\nPhase:', data.phase);

  // 4. Answer core topic Q1 (should trigger core topic Q2)
  res = await fetch(BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Processes are independent, threads share memory. Use threads for lightweight tasks.' })
  });
  data = await res.json();
  console.log('\n🤖', data.response, '\nPhase:', data.phase);

  // 5. Answer core topic Q2 (should trigger DSA problem)
  res = await fetch(BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'OOP pillars: Encapsulation, Abstraction, Inheritance, Polymorphism.' })
  });
  data = await res.json();
  console.log('\n🤖', data.response, '\nPhase:', data.phase);

  // 6. Respond to DSA problem (should trigger feedback/wrap-up)
  res = await fetch(BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'I would use a hash map to solve this problem efficiently.' })
  });
  data = await res.json();
  console.log('\n🤖', data.response, '\nPhase:', data.phase);

  // 7. Respond to feedback (should end interview)
  res = await fetch(BASE_URL + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Thank you!' })
  });
  data = await res.json();
  console.log('\n🤖', data.response, '\nPhase:', data.phase);
}

runInterview(); 