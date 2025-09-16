import { Module } from '@nestjs/common';
import { SeederModule } from './jdozer/fuzzer/seeder/SeederModule';

@Module({
  imports: [SeederModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
