# drone-detection-backend

🛰️ C-UAS Command & Control Server: drone-detection-backend

This repository contains the backend orchestration layer for the Counter-UAS (C-UAS) Human-Machine Interface (HMI) system. It manages data flow, simulates sensor inputs, and ensures real-time threat awareness for operators.

It is built on Node.js using the Nest.js framework and TypeScript.

🚀 Key Responsibilities

Threat Simulation: Generates and manages the physics and movement of simulated enemy drone tracks.

Operational Range: Models detection and estimation up to a maximum range of 5 kilometers (5 KM) from the detection system.

Real-Time Distribution: Utilizes WebSockets to push geolocated threat data to all connected HMI clients instantly.

HMI Reporting API: Provides REST endpoints for the frontend to report the system's position and confirm threat interactions.

Edge Readiness: Optimized for containerized deployment (Docker) on resource-constrained edge devices.

📦 Tech Stack

✨ Framework: Nest.js (Node.js)

💻 Language: TypeScript

📡 Real-time: WebSockets (Nest.js Gateway)

📦 Deployment: Docker

➡️ Data Flow Overview

The server acts as the critical bridge, abstracting complex sensor data into a single, unified threat track for the HMI.

Input: Simulation Service (Internal) $\rightarrow$ Calculates track data (ThreatTrack interface).

Output: WebSocket Gateway $\rightarrow$ Pushes JSON data streams to the drone-detection-frontend clients.

💡 Quick Start

To get the simulation engine and data streaming running:

Clone the repository:

git clone [REPO_URL]


Install dependencies:

npm install


Start the development server (auto-reloads):

npm run start:dev
