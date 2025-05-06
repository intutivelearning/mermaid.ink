import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MermaidDiagramDto {
  @ApiProperty({
    description: 'The Mermaid diagram code to render',
    example: 'graph TD\n  A[Christmas] -->|Get money| B(Go shopping)'
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Theme to apply to the diagram',
    enum: ['default', 'dark', 'forest', 'neutral'],
    default: 'default',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['default', 'dark', 'forest', 'neutral'], { message: 'Theme must be one of: default, dark, forest, neutral' })
  theme?: string;

  @ApiProperty({
    description: 'Background color for the diagram',
    example: 'white',
    default: 'white',
    required: false
  })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiProperty({
    description: 'Width of the rendered PNG image in pixels',
    example: 800,
    required: false
  })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({
    description: 'Height of the rendered PNG image in pixels',
    example: 600,
    required: false
  })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({
    description: 'Scale factor (only valid if width or height is set, 1-3)',
    example: 2,
    required: false,
    minimum: 1,
    maximum: 3,
  })
  @IsOptional()
  @IsNumber()
  scale?: number;

  @ApiProperty({
    description: 'Output image type (jpeg, png, webp)',
    enum: ['jpeg', 'png', 'webp'],
    default: 'png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['jpeg', 'png', 'webp'], { message: 'Type must be one of: jpeg, png, webp' })
  type?: string;

  @ApiProperty({
    description: 'Alternative background color (hex or named, e.g. FF0000 or !red)',
    required: false,
  })
  @IsOptional()
  @IsString()
  bgColor?: string;
}