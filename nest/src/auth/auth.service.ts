import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { signToken } from '../common/utils/crypto.util';
import { DataService } from '../data/data.service';

@Injectable()
export class AuthService {
  constructor(private readonly dataService: DataService) {}

  login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    if (username !== 'johndoe' || password !== 'susiairtest') {
      throw new UnauthorizedException(
        'Invalid username or password. Please check your pilot credentials.',
      );
    }

    const pilot = this.dataService.getPilotProfile();
    const accessToken = signToken({
      sub: username,
      username: username,
    });

    return {
      accessToken,
      pilot: {
        username: pilot.username,
        name: pilot.name,
        totalFlightHours: pilot.totalFlightHours,
        avatarUrl: pilot.avatarUrl,
      },
    };
  }
}
