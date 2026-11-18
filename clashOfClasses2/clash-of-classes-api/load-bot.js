// load-bot.js
const API_URL = 'http://localhost:3000';

// Real endpoints confirmed active on your server
const endpoints = [
  '/health',
  '/api/rooms',
  '/api/departments',
  '/api/teachers',
  '/api/timetable',
  '/api/courses',
  '/api/branch-years',
  '/api/absences',
  '/metrics'
];

async function sendRequest() {
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const url = `${API_URL}${endpoint}`;
  
  const start = performance.now();
  try {
    const response = await fetch(url);
    const duration = (performance.now() - start).toFixed(2);
    console.log(`[${new Date().toISOString()}] GET ${endpoint} -> Status: ${response.status} (${duration}ms)`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] GET ${endpoint} -> Failed: ${error.message}`);
  }
}

const CONCURRENCY = 3; // Number of simultaneous requests per batch
const INTERVAL_MS = 1000; // Time between batches in milliseconds

console.log(`🚀 Starting ClashOfClasses Request Bot targeting ${API_URL}...`);
console.log(`Press Ctrl+C to stop.\n`);

setInterval(() => {
  for (let i = 0; i < CONCURRENCY; i++) {
    sendRequest();
  }
}, INTERVAL_MS);