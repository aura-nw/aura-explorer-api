import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AccountRedelegation {
    @Expose()
    @ApiProperty()
    validator_src_name: string;
  
    @Expose()
    @ApiProperty()
    validator_src_address: string;
  
    @Expose()
    @ApiProperty()
    validator_dst_name: string;
  
    @Expose()
    @ApiProperty()
    validator_dst_address: string;
  
    @Expose()
    @ApiProperty()
    amount: string;
  
    @Expose()
    @ApiProperty()
    completion_time: string;
  }