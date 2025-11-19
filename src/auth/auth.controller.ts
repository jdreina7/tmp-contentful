import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GenerateTokenDto } from './dto/generate-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate JWT token',
    description:
      'Generate a JWT token by providing a valid API Key. This token is required to access private endpoints (reports).',
  })
  @ApiResponse({
    status: 200,
    description: 'Token generated successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcGktdXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYzOTU4NzYwMCwiZXhwIjoxNjM5NTkxMjAwfQ.abc123...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid API Key',
  })
  async generateToken(@Body() generateTokenDto: GenerateTokenDto) {
    return this.authService.generateToken(generateTokenDto.apiKey);
  }
}
