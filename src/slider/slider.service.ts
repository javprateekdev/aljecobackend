import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/index';
import { CreateSingleImageDto } from './dto/create-single-image.dto';
import { UpdateSingleImageDto } from './dto/update-single-image.dto';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { CreateSlideImageDto } from './dto/create-slide-image.dto';
import { UpdateSlideImageDto } from './dto/update-slide-image.dto';

@Injectable()
export class SliderService {
  constructor(private readonly prisma: PrismaService) {}

  // Single Image Methods
  async createSingleImage(data: CreateSingleImageDto) {
    return this.prisma.sectionImage.create({ data });
  }

  async findAllSingleImages() {
    return this.prisma.sectionImage.findMany();
  }

  async findOneSingleImage(id: number) {
    return this.prisma.sectionImage.findUnique({ where: { id } });
  }

  async updateSingleImage(id: number, data: UpdateSingleImageDto) {
    return this.prisma.sectionImage.update({
      where: { id },
      data,
    });
  }

  async removeSingleImage(id: number) {
    return this.prisma.sectionImage.delete({ where: { id } });
  }

  // Slide Methods
  async createSlide(data: CreateSlideDto) {
    return this.prisma.slide.create({ data });
  }

  async findAllSlides() {
    return this.prisma.slide.findMany({ include: { images: true } });
  }

  async findOneSlide(id: number) {
    return this.prisma.slide.findUnique({
      where: { id },
      include: { images: true },
    });
  }

  async updateSlide(id: number, data: UpdateSlideDto) {
    return this.prisma.slide.update({
      where: { id },
      data,
    });
  }

  async removeSlide(id: number) {
    return this.prisma.slide.delete({ where: { id } });
  }

  // Slide Image Methods
  async createSlideImage(data: CreateSlideImageDto) {
    return this.prisma.slideImage.create({ data });
  }

  async findAllSlideImages() {
    return this.prisma.slideImage.findMany();
  }

  async findOneSlideImage(id: number) {
    return this.prisma.slideImage.findUnique({ where: { id } });
  }

  async updateSlideImage(id: number, data: UpdateSlideImageDto) {
    return this.prisma.slideImage.update({
      where: { id },
      data,
    });
  }

  async removeSlideImage(id: number) {
    return this.prisma.slideImage.delete({ where: { id } });
  }
}
