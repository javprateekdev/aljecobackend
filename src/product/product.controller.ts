import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  CreateProductDto,
  GetProductsDto
} from './dto';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  SearchablePaginatedDto,
  UserType,
} from '@Common';
import { ProductCategory } from '@prisma/client';
@ApiTags('Product')
@ApiBearerAuth()
// @Roles(UserType.Admin)
// @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
@Controller('product')
export class ProductController extends BaseController {
  constructor(private readonly productService: ProductService) {
    super();
  }

  // Protected POST endpoint
  @Post('category')
  async createProductCategory(@Body() data: CreateProductCategoryDto) {
    await this.productService.createProductCategory({
      fieldName: data.fieldName,
      fieldImage: data.fieldImage ?? '',
      categoryId: data.categoryId,
      genderName: data.genderName ?? '',
    });
    return { success: true };
  }

  // Protected GET endpoint
  @Get('category')
  async getAllCategory(@Query() query: SearchablePaginatedDto) {
    return await this.productService.getAll({
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }
  
  @Get('filters')
  async getFilters(@Query() query: GetProductsDto) {
    return await this.productService.getAllFilters();
  }

  // Protected GET endpoint
  @Get()
  async getAll(@Query() query: GetProductsDto) {
    return await this.productService.getAll({
      search: query.search,
      skip: query.skip,
      take: query.take,
      filters: {
        dressType: query.dressType ? query.dressType.split(',').map(Number) : undefined,
        length: query.lengths ? query.lengths.split(',').map(Number) : undefined,
        neckLine: query.neckLine ? query.neckLine.split(',').map(Number) : undefined,
        style: query.styles ? query.styles.split(',').map(Number) : undefined,
        sleeveLength: query.sleeveLength ? query.sleeveLength.split(',').map(Number) : undefined,
        season: query.season ? query.season.split(',').map(Number) : undefined,
        bodyFits: query.bodyFits ? query.bodyFits.split(',').map(Number) : undefined,
        colours: query.colours ? query.colours.split(',').map(Number) : undefined,
      },
    });
  }
  
  
  @Get(':id')
  async getProductById(@Param('id', ParseIntPipe) productId: number) {
    const product = await this.productService.getProductById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // Protected PATCH endpoint
  @Patch('category')
  async updateProductCategory(@Body() data: UpdateProductCategoryDto) {
    const updatedCategory = await this.productService.updateProductCategory({
      productCategoryId: data.productCategoryId,
      fieldName: data.fieldName,
      fieldImage: data.fieldImage,
      genderId: data.genderId,
      genderName: data.genderName,
    });
    return { success: true, data: updatedCategory };
  }

  // Protected DELETE endpoint
  @Delete('category/:id')
  async deleteProductCategory(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) productCategoryId: number,
  ) {
    await this.productService.deleteProductCategory(productCategoryId);
    return { success: true, message: 'Product category deleted successfully' };
  }

  // Protected POST endpoint
  @Post()
  async createProduct(@Body() data: CreateProductDto) {
    return this.productService.createProduct({
      productName: data.productName,
      productCategoryId: data.productCategoryId,
      brandName: data.brandName,
      productDescription: data.productDescription,
      tagName: data.tagName,
      sizeOptions: data.sizeOptions,
      productItems: data.productItems.map((item) => ({
        ...item,
        images: item.images?.map((imageUrl) => ({ url: imageUrl }))
      })),
    });
  }

}
