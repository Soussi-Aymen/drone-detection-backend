// drone-detection-backend/src/realtime/realtime.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SimulationService } from "./simulation.service";
import {
  ISystemUpdatePayload,
  SYSTEM_UPDATE_CHANNEL,
  THREAT_UPDATE_CHANNEL,
} from "../common/interfaces/threat-track.interface";
import { Logger, Inject, forwardRef } from "@nestjs/common";

/**
 * The RealtimeGateway handles incoming WebSocket connections and messages
 * (like system position updates from the client) and broadcasts outgoing
 * simulation data.
 */
@WebSocketGateway(3001, {
  cors: {
    origin: "*", // Allow all origins for the frontend to connect
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server; // Public so SimulationService can inject and use it

  private readonly logger: Logger = new Logger(RealtimeGateway.name);

  constructor(
    // FIX: Use forwardRef to break the circular dependency with SimulationService
    @Inject(forwardRef(() => SimulationService))
    private readonly simulationService: SimulationService,
  ) {}

  // -------------------------------------------------------------------------
  // WebSocket Lifecycle Hooks
  // -------------------------------------------------------------------------

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway Initialized.");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    // Send a message to the new client confirming the real-time channel
    client.emit(THREAT_UPDATE_CHANNEL, {
      message: "Connected to real-time threat feed.",
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // -------------------------------------------------------------------------
  // Message Handlers
  // -------------------------------------------------------------------------

  /**
   * Handles incoming messages from the frontend client reporting the C-UAS system's current position.
   * This data is passed to the SimulationService to update relative calculations.
   */
  @SubscribeMessage(SYSTEM_UPDATE_CHANNEL)
  handleSystemUpdate(@MessageBody() payload: ISystemUpdatePayload) {
    this.simulationService.updateSystemPosition(payload);
    return { event: "ack", data: { status: "Received" } };
  }
}
