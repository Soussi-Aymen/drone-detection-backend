// drone-detection-backend/src/realtime/simulation.service.ts
import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common'; // Added Inject and forwardRef
import { RealtimeGateway } from './realtime.gateway';
import { IGeoPosition, IThreatTrack, IThreatUpdatePayload, THREAT_UPDATE_CHANNEL } from '../common/interfaces/threat-track.interface';

/**
 * Service responsible for simulating drone movement, calculating geospatial data,
 * and pushing real-time updates to the RealtimeGateway.
 */
@Injectable()
export class SimulationService implements OnModuleInit {
    // -------------------------------------------------------------------------
    // Configuration & State
    // -------------------------------------------------------------------------

    // Drone speed: 1 km/min = 1000m / 60s ≈ 16.67 m/s
    private readonly DRONE_SPEED_MPS = 16.67;
    // Update interval: 200ms (5 updates per second)
    private readonly UPDATE_INTERVAL_MS = 200;
    // Range limit: 5 km (5000 meters)
    private readonly MAX_DETECTION_RANGE_M = 5000;
    // Maximum distance a drone can be from the system to be 'detected'
    private readonly THREAT_SPAWN_RANGE_M = 4500;
    
    // Flag to control when the simulation starts generating tracks
    private isSimulationReady = false; 
    private readonly WARMUP_DELAY_MS = 20000; // 20 seconds delay

    // The system's (operator's) current position, updated by the frontend client.
    private currentSystemPosition: IGeoPosition;

    // Track state management
    private trackIdCounter = 1;
    private threatTrack: IThreatTrack | null = null;
    
    private simulationInterval: any | null = null; 

    constructor(
        // FIX: Use forwardRef to break the circular dependency with RealtimeGateway
        @Inject(forwardRef(() => RealtimeGateway))
        private readonly realtimeGateway: RealtimeGateway
    ) {
        // Initialize the system position from environment variables
        const defaultLat = parseFloat(process.env.SYSTEM_DEFAULT_LATITUDE || '52.5200');
        const defaultLng = parseFloat(process.env.SYSTEM_DEFAULT_LONGITUDE || '13.4050');
        this.currentSystemPosition = { lat: defaultLat, lng: defaultLng };
    }

    // -------------------------------------------------------------------------
    // Life Cycle & Control
    // -------------------------------------------------------------------------

    onModuleInit() {
        // Start the main update loop immediately
        this.startSimulation();
        
        // Wait 20 seconds before allowing a threat to be spawned
        console.log(`[SIM] Radar warm-up phase initiated. Threat spawning will begin in ${this.WARMUP_DELAY_MS / 1000} seconds.`);
        setTimeout(() => {
            this.isSimulationReady = true;
            console.log('[SIM] Radar warm-up complete. Threat spawning enabled.');
        }, this.WARMUP_DELAY_MS);
    }

    /**
     * Public method called by the RealtimeGateway when the client reports
     * a new operator/system location.
     * @param newPosition The latest latitude and longitude of the C-UAS system.
     */
    public updateSystemPosition(newPosition: IGeoPosition) {
        this.currentSystemPosition = newPosition;
    }

    private startSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }

        this.simulationInterval = setInterval(() => {
            this.updateThreatTrack();
            this.pushDataToGateway();
        }, this.UPDATE_INTERVAL_MS);
    }

    // -------------------------------------------------------------------------
    // Simulation Logic
    // -------------------------------------------------------------------------

    /**
     * Main simulation loop: creates a new drone if needed, and updates the existing one's position.
     */
    private updateThreatTrack() {
        // Only attempt to create a new threat if the warm-up is complete
        if (!this.threatTrack && this.isSimulationReady) {
            this.threatTrack = this.createNewThreat();
        }
        
        if (!this.threatTrack) {
            return;
        }

        // Calculate time delta since last update
        const now = Date.now();
        const deltaTime = (now - this.threatTrack.lastUpdateTime) / 1000; // time in seconds

        // Calculate distance traveled (Distance = Speed * Time)
        const distanceToTravel = this.DRONE_SPEED_MPS * deltaTime;

        // Move the drone along its current bearing
        const { lat, lng } = this.movePoint(
            this.threatTrack.position.lat,
            this.threatTrack.position.lng,
            this.threatTrack.bearing,
            distanceToTravel
        );

        this.threatTrack.position = { lat, lng };
        this.threatTrack.lastUpdateTime = now;

        // Recalculate range and check for expiration/out-of-range
        this.recalculateRelativeMetrics();

        if (this.threatTrack.distance > this.MAX_DETECTION_RANGE_M * 1.5 || this.threatTrack.confidence < 10) {
            // Drone is too far or confidence dropped, clear track and prepare for new one
            console.log(`Track ${this.threatTrack.trackId} expired or out of range. Cleaning up.`);
            this.threatTrack = null;
        }

        // Simple steering: every 10 seconds, change bearing slightly
        if (Math.random() < 0.02) { // 2% chance per update (0.02 * 5 updates/sec = 10% chance per second)
            this.threatTrack.bearing = (this.threatTrack.bearing + (Math.random() * 90 - 45) + 360) % 360;
        }
    }

    /**
     * Creates a new threat track at a random point near the system (within MAX_DETECTION_RANGE_M).
     */
    private createNewThreat(): IThreatTrack {
        const randomBearing = Math.random() * 360; // 0 to 360 degrees
        const randomDistance = Math.random() * this.THREAT_SPAWN_RANGE_M * 0.8 + 500; // 500m to 3600m
        const initialConfidence = Math.round(Math.random() * 20) + 80; // 80-100%

        const { lat, lng } = this.movePoint(
            this.currentSystemPosition.lat,
            this.currentSystemPosition.lng,
            randomBearing,
            randomDistance
        );

        console.log(`Spawning new drone track ${this.trackIdCounter} at ${Math.round(randomDistance)}m.`);

        return {
            trackId: this.trackIdCounter++,
            position: { lat, lng },
            bearing: (randomBearing + 180) % 360, // Drone moves *away* from the system initially
            distance: randomDistance,
            classification: 'Rotary-Wing',
            confidence: initialConfidence,
            lastUpdateTime: Date.now(),
        };
    }

    /**
     * Recalculates distance and bearing relative to the moving C-UAS system.
     */
    private recalculateRelativeMetrics() {
        if (!this.threatTrack) return;

        const distanceM = this.calculateDistance(
            this.currentSystemPosition.lat,
            this.currentSystemPosition.lng,
            this.threatTrack.position.lat,
            this.threatTrack.position.lng
        );

        const bearingDeg = this.calculateBearing(
            this.currentSystemPosition.lat,
            this.currentSystemPosition.lng,
            this.threatTrack.position.lat,
            this.threatTrack.position.lng
        );

        this.threatTrack.distance = distanceM;
        this.threatTrack.bearing = bearingDeg;

        // Simple confidence simulation: drops when far away
        if (distanceM > this.MAX_DETECTION_RANGE_M * 0.9) {
             this.threatTrack.confidence = Math.max(0, this.threatTrack.confidence - 1);
        } else if (this.threatTrack.confidence < 100) {
            this.threatTrack.confidence = Math.min(100, this.threatTrack.confidence + 1);
        }
    }

    // -------------------------------------------------------------------------
    // Geospatial Utilities (using simplified Haversine/Vincenty formulas)
    // -------------------------------------------------------------------------

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // in metres
        return distance;
    }

    private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const λ1 = lon1 * Math.PI / 180;
        const λ2 = lon2 * Math.PI / 180;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const bearingRad = Math.atan2(y, x);

        // Convert to degrees and normalize to 0-360
        const bearingDeg = (bearingRad * 180 / Math.PI + 360) % 360;
        return bearingDeg;
    }

    /**
     * Moves a point given a starting position, bearing, and distance (meters).
     */
    private movePoint(lat: number, lng: number, bearing: number, distanceM: number): IGeoPosition {
        const R = 6371e3; // Earth's radius in meters
        const angularDistance = distanceM / R;
        const bearingRad = bearing * Math.PI / 180;
        const latRad = lat * Math.PI / 180;
        const lonRad = lng * Math.PI / 180;

        const newLatRad = Math.asin(
            Math.sin(latRad) * Math.cos(angularDistance) +
            Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
        );

        let newLonRad = lonRad + Math.atan2(
            Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
            Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad)
        );

        // Normalize longitude
        newLonRad = (newLonRad + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

        return {
            lat: newLatRad * 180 / Math.PI,
            lng: newLonRad * 180 / Math.PI,
        };
    }

    // -------------------------------------------------------------------------
    // Data Push
    // -------------------------------------------------------------------------

    private pushDataToGateway() {
        if (!this.realtimeGateway.server) {
             console.error('WebSocket Server instance is not available yet.');
             return;
        }

        const payload: IThreatUpdatePayload = {
            systemPosition: this.currentSystemPosition,
            threatTrack: this.threatTrack,
        };
        // Use the defined channel constant THREAT_UPDATE_CHANNEL
        this.realtimeGateway.server.emit(THREAT_UPDATE_CHANNEL, payload);
    }
}