// drone-detection-backend/src/common/interfaces/threat-track.interface.ts

/**
 * Interface for standard geospatial position data.
 */
export interface IGeoPosition {
    lat: number;
    lng: number;
}

/**
 * Interface representing a single detected threat track.
 */
export interface IThreatTrack {
    trackId: number;
    position: IGeoPosition;
    /** Current direction of movement in degrees (0-360) */
    bearing: number; 
    /** Distance from the system to the threat in meters */
    distance: number; 
    classification: string;
    confidence: number; // 0-100%
    lastUpdateTime: number; // Unix timestamp
}

/**
 * Payload sent from the backend simulation to the frontend client.
 */
export interface IThreatUpdatePayload {
    systemPosition: IGeoPosition;
    threatTrack: IThreatTrack | null;
}

/**
 * Interface for data sent from the frontend client to update the system position.
 */
export interface ISystemUpdatePayload extends IGeoPosition {}


// --- FIX: Add missing channel constants ---

/**
 * WebSocket channel name for outgoing threat data updates.
 */
export const THREAT_UPDATE_CHANNEL = 'threatUpdate';

/**
 * WebSocket channel name for incoming system position updates.
 */
export const SYSTEM_UPDATE_CHANNEL = 'systemUpdate';