require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Language versions for code execution
  languageVersions: {
    python: "3.10",
    javascript: "18.15.0",
    java: "15.0.2",
    cpp: "10.2.0"
  },

  // API endpoints
  pistonAPI: 'https://emkc.org/api/v2/piston/execute',

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
}; 