import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { IoAdapter } from "@nestjs/platform-socket.io";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const PORT = parseInt(process.env.PORT ?? "3001", 10);

  await app.listen(PORT);

  console.log(`📡 Backend Server is running on: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Gateway is attached to the same server (Socket.IO)`);
  console.log(`   ws://localhost:${PORT}`);
}

bootstrap();
