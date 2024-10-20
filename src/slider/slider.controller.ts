import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import {
  CreateSlideImageDto,
  UpdateSlideImageDto,
  CreateSingleImageDto,
  UpdateSingleImageDto,
  CreateSlideDto,
  UpdateSlideDto,
} from './dto/index';
import { SliderService } from './slider.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('slider')
@Controller('slider')
export class SliderController {
  constructor(private readonly sliderService: SliderService) {}

  // Single Image Endpoints
  @Post('single-images')
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  createSingleImage(@Body() createSingleImageDto: CreateSingleImageDto) {
    return this.sliderService.createSingleImage(createSingleImageDto);
  }

  @Get('single-images')
  @ApiResponse({ status: 200, description: 'Retrieved all images.' })
  findAllSingleImages() {
    return this.sliderService.findAllSingleImages();
  }

  @Get('single-images/:id')
  @ApiResponse({ status: 200, description: 'Retrieved the image.' })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  findOneSingleImage(@Param('id') id: string) {
    return this.sliderService.findOneSingleImage(+id);
  }

  @Put('single-images/:id')
  @ApiResponse({
    status: 200,
    description: 'The image has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  updateSingleImage(
    @Param('id') id: string,
    @Body() updateSingleImageDto: UpdateSingleImageDto,
  ) {
    return this.sliderService.updateSingleImage(+id, updateSingleImageDto);
  }

  @Delete('single-images/:id')
  @ApiResponse({
    status: 200,
    description: 'The image has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  removeSingleImage(@Param('id') id: string) {
    return this.sliderService.removeSingleImage(+id);
  }

  // Slide Endpoints
  @Post('slides')
  @ApiResponse({
    status: 201,
    description: 'The slide has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  createSlide(@Body() createSlideDto: CreateSlideDto) {
    return this.sliderService.createSlide(createSlideDto);
  }

  @Get('slides')
  @ApiResponse({ status: 200, description: 'Retrieved all slides.' })
  findAllSlides() {
    return this.sliderService.findAllSlides();
  }

  @Get('slides/:id')
  @ApiResponse({ status: 200, description: 'Retrieved the slide.' })
  @ApiResponse({ status: 404, description: 'Slide not found.' })
  findOneSlide(@Param('id') id: string) {
    return this.sliderService.findOneSlide(+id);
  }

  @Put('slides/:id')
  @ApiResponse({
    status: 200,
    description: 'The slide has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Slide not found.' })
  updateSlide(@Param('id') id: string, @Body() updateSlideDto: UpdateSlideDto) {
    return this.sliderService.updateSlide(+id, updateSlideDto);
  }

  @Delete('slides/:id')
  @ApiResponse({
    status: 200,
    description: 'The slide has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Slide not found.' })
  removeSlide(@Param('id') id: string) {
    return this.sliderService.removeSlide(+id);
  }

  // Slide Image Endpoints
  @Post('slide-images')
  @ApiResponse({
    status: 201,
    description: 'The slide image has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  createSlideImage(@Body() createSlideImageDto: CreateSlideImageDto) {
    return this.sliderService.createSlideImage(createSlideImageDto);
  }

  @Get('slide-images')
  @ApiResponse({ status: 200, description: 'Retrieved all slide images.' })
  findAllSlideImages() {
    return this.sliderService.findAllSlideImages();
  }

  @Get('slide-images/:id')
  @ApiResponse({ status: 200, description: 'Retrieved the slide image.' })
  @ApiResponse({ status: 404, description: 'Slide image not found.' })
  findOneSlideImage(@Param('id') id: string) {
    return this.sliderService.findOneSlideImage(+id);
  }

  @Put('slide-images/:id')
  @ApiResponse({
    status: 200,
    description: 'The slide image has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Slide image not found.' })
  updateSlideImage(
    @Param('id') id: string,
    @Body() updateSlideImageDto: UpdateSlideImageDto,
  ) {
    return this.sliderService.updateSlideImage(+id, updateSlideImageDto);
  }

  @Delete('slide-images/:id')
  @ApiResponse({
    status: 200,
    description: 'The slide image has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Slide image not found.' })
  removeSlideImage(@Param('id') id: string) {
    return this.sliderService.removeSlideImage(+id);
  }
}
