import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Column } from 'typeorm';

export class User {
  @IsString()
  mobileNumber: string;

  @IsString()
  language: string;

  @IsString()
  Botid: string;
  
  @Column({ type: 'text', nullable: true })
  chat_history: any;

  @Column({ type: 'text', nullable: true })
  chat_summary: string;
}
