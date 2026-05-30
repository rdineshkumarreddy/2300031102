# Vehicle Maintenance Scheduler Microservice

An interview-quality, production-ready microservice built with **Node.js** and **Express**. It solves the **0/1 Knapsack Optimization Problem** using Dynamic Programming to determine the optimal allocation of vehicle maintenance tasks across multiple depots, maximizing total operational impact without exceeding available mechanic labor capacities.

---

## Key Highlights

1. **Optimal 0/1 Knapsack Solver via Dynamic Programming**
   - Solves capacity allocation in $O(N \cdot W)$ time and space complexity, backtracking to find the exact set of selected tasks.
   - **Decimal Inputs Support**: Dynamically scales float values (e.g., `MechanicHours` of `6.5` or `Duration` of `2.5`) to integers to ensure mathematical precision without rounding errors.
   - **Case-Insensitive Normalization**: Gracefully maps data inputs using field variations (`DepotID`/`depotId`/`Depot ID` or `TaskID`/`taskId`/`id`).

2. **Console-Free Custom Logger**
   - Strictly conforms to the constraint **"Do NOT use console.log anywhere"**.
   - Direct standard stream writer: Uses `process.stdout.write` and `process.stderr.write` to log formatted levels (`INFO`, `WARN`, `ERROR`, `DEBUG`) along with JSON metadata.
   - Write-through file logging: Synchronously appends records to `logs/app.log`.

3. **Resilient Network Middleware**
   - **Asynchronous Log Uploader**: Captures HTTP status, duration, and IP metadata. Asynchronously POSTs logs to the AffordMed logs server using the student's Bearer token in a fire-and-forget manner to keep API responses fast.
   - **Automatic Mock Fallback**: Fetches external depots and vehicles/tasks. If the server times out or is offline, it falls back to integrated mock arrays so the service continues running.

---

## Directory Structure

```text
vehicle_maintenance/
├── logs/
│   └── app.log                 # Generated application logs
├── src/
│   ├── algorithms/
│   │   └── knapsack.js         # 0/1 Dynamic Programming Knapsack Solver
│   ├── controllers/
│   │   └── scheduler.controller.js # Route controller logic
│   ├── middleware/
│   │   ├── error.middleware.js # Centralized Express error handler
│   │   ├── logging.middleware.js # Request logs interceptor and remote uploader
│   │   └── validation.middleware.js # Request payload validation
│   ├── routes/
│   │   └── scheduler.routes.js # Endpoint routing configuration
│   ├── services/
│   │   ├── depot.service.js    # Depots external fetcher & mock fallback
│   │   ├── scheduler.service.js # Business logic aggregator
│   │   └── vehicle.service.js  # Vehicles external fetcher & mock fallback
│   ├── tests/
│   │   └── knapsack.test.js    # Automated suite verifying edge cases
│   ├── app.js                  # Express App configuration
│   └── server.js               # Application entrypoint
├── .env                        # Configuration environment settings
├── package.json
└── README.md
```

---

## Configuration (`.env`)

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# External AffordMed APIs
DEPOTS_API_URL=http://20.244.56.144/evaluation-service/depots
VEHICLES_API_URL=http://20.244.56.144/evaluation-service/vehicles
LOG_SERVER_URL=http://20.244.56.144/evaluation-service/logs

# API Timeouts and Log Options
API_TIMEOUT=3000
SEND_LOGS_TO_SERVER=true

# Registered credentials
ROLL_NO=2300031102
ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Installation & Running

Ensure you have [Node.js](https://nodejs.org/) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Launches the server with `nodemon` auto-reload:
```bash
npm run dev
```

### 3. Run in Production Mode
```bash
npm start
```

### 4. Run Automated Tests
Runs unit tests validating standard knapsack, decimal capacities, negative filters, and empty arrays:
```bash
npm test
```

---

## API Endpoints

### 1. Health Status check
*   **Method**: `GET`
*   **URL**: `http://localhost:3000/health`
*   **Response**:
    ```json
    {
      "status": "UP",
      "timestamp": "2026-05-30T06:24:35.147Z"
    }
    ```

### 2. Get Optimization Schedule
Fetches external depots/tasks (falling back to mock data if offline) and performs optimization.
*   **Method**: `GET`
*   **URL**: `http://localhost:3000/api/schedule`
*   **Response**:
    ```json
    {
      "status": "success",
      "data": {
        "summary": {
          "totalDepots": 4,
          "totalAvailableMechanicHours": 45,
          "totalScheduledTasks": 10,
          "totalDurationAllocated": 45,
          "totalImpactAchieved": 325,
          "totalUnusedMechanicHours": 0
        },
        "depots": [
          {
            "depotId": "DEP-001",
            "mechanicHours": 8,
            "selectedTasks": [
              { "TaskID": "TASK-03", "Duration": 3, "Impact": 15 },
              { "TaskID": "TASK-04", "Duration": 5, "Impact": 40 }
            ],
            "totalDuration": 8,
            "totalImpact": 55,
            "unusedHours": 0
          }
          // ... other depots
        ]
      }
    }
    ```

### 3. Generate Custom Schedule (On-Demand)
Submit custom inputs for depots and tasks dynamically. Supports float decimals.
*   **Method**: `POST`
*   **URL**: `http://localhost:3000/api/schedule`
*   **Headers**: `Content-Type: application/json`
*   **Payload**:
    ```json
    {
      "depots": [
        { "DepotID": "DEP-CUSTOM-01", "MechanicHours": 6.5 }
      ],
      "tasks": [
        { "TaskID": "T-01", "Duration": 2.5, "Impact": 20 },
        { "TaskID": "T-02", "Duration": 4.0, "Impact": 35 },
        { "TaskID": "T-03", "Duration": 1.5, "Impact": 10 }
      ]
    }
    ```
*   **Response**:
    ```json
    {
      "status": "success",
      "data": {
        "summary": {
          "totalDepots": 1,
          "totalAvailableMechanicHours": 6.5,
          "totalScheduledTasks": 2,
          "totalDurationAllocated": 6.5,
          "totalImpactAchieved": 55,
          "totalUnusedMechanicHours": 0
        },
        "depots": [
          {
            "depotId": "DEP-CUSTOM-01",
            "mechanicHours": 6.5,
            "selectedTasks": [
              { "TaskID": "T-01", "Duration": 2.5, "Impact": 20 },
              { "TaskID": "T-02", "Duration": 4, "Impact": 35 }
            ],
            "totalDuration": 6.5,
            "totalImpact": 55,
            "unusedHours": 0
          }
        ]
      }
    }
    ```

---

## Postman Testing Instructions

1. **Import Requests**
   - Open Postman and create a new request or collection.
   - For checking status: Send a `GET` request to `http://localhost:3000/health`.
   - For executing scheduler: Send a `GET` request to `http://localhost:3000/api/schedule`.

2. **Custom Payload Testing**
   - Create a `POST` request to `http://localhost:3000/api/schedule`.
   - Go to the **Headers** tab and verify `Content-Type: application/json` is added.
   - Go to the **Body** tab, select **raw**, choose **JSON** format, and paste:
     ```json
     {
       "depots": [
         { "DepotID": "DEP-A", "MechanicHours": 10 },
         { "DepotID": "DEP-B", "MechanicHours": 5 }
       ],
       "tasks": [
         { "TaskID": "T1", "Duration": 3, "Impact": 30 },
         { "TaskID": "T2", "Duration": 4, "Impact": 20 },
         { "TaskID": "T3", "Duration": 5, "Impact": 40 },
         { "TaskID": "T4", "Duration": 2, "Impact": 15 }
       ]
     }
     ```
   - Click **Send** and analyze the optimized output.

3. **Screenshot Instructions**
   - Take a screenshot of the Postman response screen showing the `status: success` and the computed `summary` object.
   - Take a screenshot of the command terminal running `npm run dev` to showcase the custom logs written to stdout/stderr.
   - Verify that `logs/app.log` has been written and open it in your IDE to take a screenshot of the log records file.

---

## Deployment & Source Control

### Git Commands
```bash
git init
git add .
git commit -m "feat: implement resilient vehicle maintenance scheduler microservice"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Production Deployment (e.g. Render / Heroku)
1. Commit and push code to your GitHub repository.
2. Log into your dashboard (e.g., [Render](https://render.com/)).
3. Select **New Web Service** and connect your GitHub repository.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `npm start`.
6. Go to **Environment Variables** (or Config Vars) and set:
   - `PORT=80` (or leave default Render port)
   - `NODE_ENV=production`
   - `DEPOTS_API_URL`, `VEHICLES_API_URL`, `LOG_SERVER_URL`
   - `ACCESS_TOKEN` (Bearer token)
   - `ROLL_NO=2300031102`
   - `SEND_LOGS_TO_SERVER=true` (or `false` to disable uploader)
7. Deploy the service and test the live public URL.
