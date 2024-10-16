//import { join } from 'path';
import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
//import { Product } from '@prisma/client';
import { adminConfigFactory } from '@Config';
import {
  StorageService,
  UtilsService,
  //   ValidatedUser,
  //   UserType,
  //   getAccessGuardCacheKey,
} from '@Common';
import { PrismaService } from '../prisma';
import { Prisma, ProductCategory, Category, Product } from '@prisma/client';
//import { Category } from '@prisma/client';
@Injectable()
export class ProductService {
  constructor(
    @Inject(adminConfigFactory.KEY)
    private readonly config: ConfigType<typeof adminConfigFactory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly storageService: StorageService,
  ) {}

  async getByProductCategoryId(
    productCategoryId: number,
  ): Promise<ProductCategory> {
    return await this.prisma.productCategory.findUniqueOrThrow({
      where: {
        productCategoryId: productCategoryId,
      },
    });
  }
  async createProductCategory(options: {
    fieldName: string;
    fieldImage?: string;
    categoryId: number;
    genderName: string;
  }): Promise<ProductCategory> {
    if (!options) {
      throw new Error('Options must be provided.');
    }

    const { fieldName, fieldImage, categoryId, genderName } = options;
    const newCategory = await this.prisma.productCategory.create({
      data: {
        fieldName,
        fieldImage,
        category: {
          connect: {
            categoryId: categoryId,
          },
        },
        productGender: {
          create: {
            genderName: genderName,
          },
        },
      },
      include: {
        category: true,
        productGender: true,
      },
    });
    return newCategory;
  }

  async getAll(options: {
    search?: string;
    skip?: number;
    take?: number;
    filters?: {
      dressType?: number[];
      length?: number[];
      neckLine?: number[];
      style?: number[];
      sleeveLength?: number[];
      season?: number[];
      bodyFits?: number[];
      colours?: number[];
    };
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Product[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { productDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const productItemFilters: Prisma.ProductItemWhereInput = {};

    console.log();
    console.log('product', productItemFilters);

    // Adjusting filter checks to handle arrays of IDs
    if (options?.filters?.dressType) {
      productItemFilters.dressId = { in: options.filters.dressType }; // Use 'in' for arrays
    }
    console.log('array', options?.filters?.dressType);
    if (options?.filters?.length) {
      productItemFilters.lengthId = { in: options.filters.length }; // Use 'in' for arrays
    }

    if (options?.filters?.neckLine) {
      productItemFilters.neckLineId = { in: options.filters.neckLine }; // Use 'in' for arrays
    }

    if (options?.filters?.style) {
      productItemFilters.styleId = { in: options.filters.style }; // Use 'in' for arrays
    }

    if (options?.filters?.sleeveLength) {
      productItemFilters.sleeveId = { in: options.filters.sleeveLength }; // Use 'in' for arrays
    }

    if (options?.filters?.season) {
      productItemFilters.seasonId = { in: options.filters.season }; // Use 'in' for arrays
    }

    if (options?.filters?.bodyFits) {
      productItemFilters.bodyId = { in: options.filters.bodyFits }; // Use 'in' for arrays
    }

    if (options?.filters?.colours) {
      productItemFilters.colourId = { in: options.filters.colours }; // Use 'in' for arrays
    }

    const totalItems = await this.prisma.product.count({
      where: {
        ...where,
        productItems: {
          some: productItemFilters,
        },
      },
    });

    const items = await this.prisma.product.findMany({
      where: {
        ...where,
        productItems: {
          some: productItemFilters,
        },
      },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        productItems: { include: { images: true } },
        productCategory: true,
      },
      orderBy: {
        productId: 'asc',
      },
    });

    return {
      count: totalItems,
      skip: pagination.skip,
      take: pagination.take,
      data: items,
    };
  }

  async updateProductCategory(options: {
    productCategoryId: number;
    fieldName?: string;
    fieldImage?: string;
    genderId?: number;
    genderName?: string;
  }): Promise<ProductCategory> {
    if (!options || !options.productCategoryId) {
      throw new Error('Category ID must be provided.');
    }
    const { productCategoryId, fieldName, fieldImage, genderId, genderName } =
      options;
    await this.getByProductCategoryId(productCategoryId);
    const updateData: { [key: string]: any } = {};

    if (fieldName !== undefined) {
      updateData.fieldName = fieldName;
    }

    if (fieldImage !== undefined) {
      updateData.fieldImage = fieldImage;
    }

    if (genderId && genderName) {
      await this.prisma.productGender.update({
        where: { genderId: genderId },
        data: { genderName: genderName },
      });
    }

    const updatedCategory = await this.prisma.productCategory.update({
      where: { productCategoryId: productCategoryId },
      data: updateData,
      include: {
        category: true,
        productGender: true,
      },
    });

    return updatedCategory;
  }
  async deleteProductCategory(
    productCategoryId: number,
  ): Promise<ProductCategory> {
    await this.getByProductCategoryId(productCategoryId);
    return await this.prisma.productCategory.delete({
      where: { productCategoryId: productCategoryId },
      include: {
        productGender: true,
        category: true,
      },
    });
  }

  async createProduct(option: {
    productName: string;
    productCategoryId?: number;
    brandName?: string;
    productDescription?: string;
    tagName?: string;
    sizeOptions?: {
      sizeName: string;
      sortOrder: number;
    }[];
    productItems: {
      originalPrice: number;
      salePrice?: number;
      productCode: number;
      images?: { url: string }[]; // Updated to handle multiple images
      colourId?: number;
      styleId?: number;
      necklineId?: number;
      sleeveId?: number;
      seasonId?: number;
      lengthId?: number;
      bodyId?: number;
      dressId?: number;
    }[];
  }) {
    const {
      productName,
      productCategoryId,
      brandName,
      productDescription,
      tagName,
      productItems,
      sizeOptions,
    } = option;

    try {
      const product = await this.prisma.product.create({
        data: {
          productName,
          productCategoryId,
          productDescription,
          brandName,
          tagName,
          sizeOptions: {
            create: sizeOptions?.map((size) => ({
              sizeName: size.sizeName,
              sortOrder: size.sortOrder,
            })),
          },
          productItems: {
            create: productItems.map((item) => ({
              originalPrice: item.originalPrice,
              salePrice: item.salePrice,
              productCode: item.productCode,
              colour: item.colourId
                ? { connect: { colourId: item.colourId } }
                : undefined,
              style: item.styleId
                ? { connect: { styleId: item.styleId } }
                : undefined,
              neckLine: item.necklineId
                ? { connect: { neckLineId: item.necklineId } }
                : undefined,
              sleeveLength: item.sleeveId
                ? { connect: { sleeveId: item.sleeveId } }
                : undefined,
              season: item.seasonId
                ? { connect: { seasonId: item.seasonId } }
                : undefined,
              length: item.lengthId
                ? { connect: { lengthId: item.lengthId } }
                : undefined,
              bodyFit: item.bodyId
                ? { connect: { bodyId: item.bodyId } }
                : undefined,
              dressType: item.dressId
                ? { connect: { dressId: item.dressId } }
                : undefined,
              images: {
                create: item.images?.map((image) => ({
                  url: image.url, // Creating images for each product item
                })),
              },
            })),
          },
        },
        include: {
          productItems: {
            include: {
              images: true,
            },
          },
          sizeOptions: true,
        },
      });

      return product;
    } catch (error) {
      console.error('Error creating product: ', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async getAllProducts(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Product[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.ProductCategoryWhereInput = {};

    if (search) {
      // const buildSearchFilter = (search: string): Prisma.ProductWhereInput[] => [
      //   {
      //     fieldName: {
      //       contains: search,
      //       mode: 'insensitive',
      //     },
      //   },
      // ];
      // const parts = search.split(' ');
      // if (parts.length !== 0) {
      //   where.AND = [];
      //   for (const part of parts) {
      //     if (part.trim()) {
      //       where.AND.push({
      //         OR: buildSearchFilter(part.trim()),
      //       });
      //     }
      //   }
      // }
    }
    const totalItems = await this.prisma.product.count({});
    const items = await this.prisma.product.findMany({
      include: {
        productCategory: true,
        productItems: {
          include: {
            neckLine: true,
            style: true,
            sleeveLength: true,
            season: true,
            length: true,
            bodyFit: true,
            dressType: true,
            images: true,
          },
        },
      },
      skip: pagination.skip,
      take: pagination.take,
    });

    return {
      count: totalItems,
      skip: pagination.skip,
      take: pagination.take,
      data: items,
    };
  }

  async getProductById(productId: number): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: { productId },
      include: {
        productCategory: true,
        productItems: {
          include: {
            neckLine: true,
            style: true,
            sleeveLength: true,
            season: true,
            length: true,
            bodyFit: true,
            dressType: true,
            images: true,
          },
        },
      },
    });
  }

  async getAllFilters() {
    const [
      colours,
      styles,
      neckLines,
      sleeveLengths,
      seasons,
      lengths,
      bodyFits,
      dressTypes,
    ] = await Promise.all([
      this.prisma.colour.findMany(),
      this.prisma.style.findMany(),
      this.prisma.neckLine.findMany(),
      this.prisma.sleeveLength.findMany(),
      this.prisma.season.findMany(),
      this.prisma.length.findMany(),
      this.prisma.bodyFit.findMany(),
      this.prisma.dressType.findMany(),
    ]);
    return {
      colours,
      styles,
      neckLines,
      sleeveLengths,
      seasons,
      lengths,
      bodyFits,
      dressTypes,
    };
  }
}
