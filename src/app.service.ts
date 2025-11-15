import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): { status: string } {
    return { status: 'Backend operational (C-UAS Server is online)' };
  }
}