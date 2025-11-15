import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { IoAdapter } from "@nestjs/platform-socket.io";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend development
  app.enableCors({
    origin: "*", // Allow all origins for simplicity in development
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Use the IoAdapter to enable WebSocket support (using socket.io)
  // This is required for our real-time data push
  app.useWebSocketAdapter(new IoAdapter(app));

  // --- BEST PRACTICE: Read PORT from environment variables ---
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  // Fallback to 3001 if PORT is not set or invalid, using the value defined in .env

  await app.listen(PORT);
  console.log(`📡 Backend Server is running on: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Gateway is listening on: ws://localhost:${PORT}`);
}
bootstrap();
