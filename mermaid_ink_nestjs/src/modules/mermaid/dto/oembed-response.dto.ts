import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class OEmbedResponseDto {
  @ApiProperty({
    description: 'The type of the resource. Always "photo" for Mermaid diagrams',
    example: 'photo'
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['photo'])
  type: string;

  @ApiProperty({
    description: 'The oEmbed version number. Always "1.0"',
    example: '1.0'
  })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty({
    description: 'Width of the image in pixels',
    example: 800
  })
  @IsNumber()
  width: number;

  @ApiProperty({
    description: 'Height of the image in pixels',
    example: 600
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    description: 'URL to the rendered diagram',
    example: 'https://mermaid.ink/img/base64-encoded-diagram'
  })
  @IsUrl()
  url: string;
}