# drone-detection-backend

🛰️ C-UAS Command & Control Server: drone-detection-backend

This repository contains the Counter-UAS (C-UAS) backend orchestration layer for the Human-Machine Interface (HMI) system. It manages data flow, simulates threat tracks, and ensures real-time operational awareness.

🚀 Key Responsibilities

Real-Time Threat Simulation: Generates and manages the physics and movement of simulated enemy drone tracks in real-time.

Operational Range Modeling: Models detection and estimation up to a maximum range of 5 kilometers (5 KM) from the detection system, as defined in the SimulationService.

Geospatial Calculations: Accurately calculates relative distance and bearing for tracks based on the moving C-UAS system position provided by the HMI.

Real-Time Distribution: Utilizes WebSockets (Socket.IO) to push geolocated threat data to all connected HMI clients instantly via the threatUpdate channel.

💻 Tech Stack

Framework: Nest.js (Node.js)

Language: TypeScript

Real-time: Socket.IO (WebSockets)

Tooling: npm

➡️ Data Flow Overview

The server acts as the critical bridge, abstracting complex sensor data into a single, unified threat track for the HMI.

HMI Input: Frontend client sends the C-UAS system's current location via the systemUpdate WebSocket channel (handled by RealtimeGateway).

Core Logic: The SimulationService uses this position to continuously update and calculate the relative metrics (distance, bearing) of the simulated ThreatTrack.

Real-Time Output: The RealtimeGateway broadcasts the full data payload to all connected clients via the threatUpdate channel at 5 Hz.

💡 Quick Start

To get the simulation engine and data streaming running:

Clone the Repository:

git clone https://github.com/Soussi-Aymen/drone-detection-backend.git


Install Dependencies:

npm install


Configure Environment: Create a .env file (see drone-detection-backend/.env for a template).

Start the Development Server (Auto-Reloads):

npm run start:dev


The server will be available on port 3001 and ready for HMI connections.