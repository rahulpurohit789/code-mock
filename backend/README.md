# AI Interviewer Backend

The backend server for the AI Interviewer application, handling code execution and AI interactions.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.js           # Configuration settings
│   ├── controllers/
│   │   └── codeController.js  # Code execution controller
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handling
│   │   └── rateLimiter.js     # Rate limiting middleware
│   ├── routes/
│   │   └── codeRoutes.js      # API routes for code execution
│   └── index.js               # Main server file
├── package.json
└── README.md
```

## API Endpoints

### Code Execution

- **POST** `/api/code/execute`
  - Execute code using Piston API
  - Body:
    ```json
    {
      "code": "print('Hello, World!')",
      "language": "python"
    }
    ```
  - Response:
    ```json
    {
      "stdout": "Hello, World!\n",
      "stderr": "",
      "output": "Hello, World!\n",
      "error": null
    }
    ```

### Health Check

- **GET** `/health`
  - Check server status
  - Response:
    ```json
    {
      "status": "ok"
    }
    ```

## Supported Languages

- Python (3.10)
- JavaScript (18.15.0)
- Java (15.0.2)
- C++ (10.2.0)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PORT=5000
NODE_ENV=development
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Error Handling

The server includes global error handling for:
- Validation errors (400)
- Unauthorized access (401)
- Internal server errors (500)

## Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable in `config/index.js`

## Development

To add new features:
1. Create appropriate controller in `controllers/`
2. Add routes in `routes/`
3. Update configuration if needed in `config/`
4. Add any necessary middleware in `middleware/` 