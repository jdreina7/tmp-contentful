import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateTokenDto {
  @ApiProperty({
    description: 'API Key for authentication',
    example: 'apply-digital-secret-key-2024',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
