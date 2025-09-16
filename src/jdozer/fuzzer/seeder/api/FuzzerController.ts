/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { Controller, Post, Body, UseInterceptors, UploadedFile, Response, UseFilters, HttpException, HttpStatus } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Response as Res } from 'express';
import { SeederService } from '../SeederService';
import { FuzzerCreateDto } from './dto/FuzzerCreateDto';


@Controller('fuzzer')
export class FuzzerController {

  constructor(private readonly seederService: SeederService) { }

  @Post()
  @UseInterceptors(FileInterceptor('contract'))
  async create(@Body() fuzzerCreateDto: FuzzerCreateDto, @UploadedFile() file: Express.Multer.File, @Response() res: Res) {
    try {
      return res.json(await this.seederService.create(fuzzerCreateDto, file.buffer.toString()));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
