/**
    # JDozerFuzzer - Microservicio de Discovery
    # Copyright (C) 2024 Cristián Saéz V.
    # Licencia: GNU AGPLv3 (ver LICENSE)
 */

import { Controller, Post, Body, UseInterceptors, UploadedFile, Response, UseFilters, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Response as Res } from 'express';
import { SeederService } from '../SeederService';
import { FuzzerCreateDto } from './dto/FuzzerCreateDto';
import { SeederException } from '../SeederException';


@Controller('fuzzer')
export class FuzzerController {

  private readonly log = new Logger(FuzzerController.name);

  constructor(private readonly seederService: SeederService) { }

  @Post()
  @UseInterceptors(FileInterceptor('contract'))
  async create(@Body() fuzzerCreateDto: FuzzerCreateDto, @UploadedFile() file: Express.Multer.File, @Response() res: Res) {
    try {
      return res.json(await this.seederService.create(fuzzerCreateDto, file.buffer.toString()));
    } catch (error) {
      if (error instanceof SeederException) {
        this.log.error('Exception: ', error.message);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        this.log.error('Exception: ', error.message);
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

}
