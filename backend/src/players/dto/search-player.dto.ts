import { IsNotEmpty, IsString } from 'class-validator';

export class SearchPlayerDto {
  @IsString()
  @IsNotEmpty()
  gameName!: string;

  @IsString()
  @IsNotEmpty()
  tagLine!: string;
}
