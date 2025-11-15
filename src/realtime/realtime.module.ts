import { Module } from "@nestjs/common";
import { SimulationService } from "./simulation.service";
import { RealtimeGateway } from "./realtime.gateway";

@Module({
  imports: [],
  providers: [SimulationService, RealtimeGateway],
  // Export the providers so they can be used elsewhere (though not strictly necessary here)
  exports: [SimulationService, RealtimeGateway],
})
export class RealtimeModule {}
