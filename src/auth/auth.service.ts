import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly apiKey: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('API_KEY');
  }

  /**
   * Generate JWT token if API Key is valid
   * @param apiKey - API Key to validate
   * @returns JWT token
   */
  async generateToken(apiKey: string): Promise<{ access_token: string }> {
    if (apiKey !== this.apiKey) {
      this.logger.warn('Invalid API Key attempt');
      throw new UnauthorizedException('Invalid API Key');
    }

    const payload = {
      sub: 'api-user',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
    };

    const access_token = this.jwtService.sign(payload);

    this.logger.log('JWT token generated successfully');

    return { access_token };
  }

  /**
   * Validate JWT payload
   * @param payload - JWT payload
   * @returns User information
   */
  async validateUser(payload: any) {
    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
