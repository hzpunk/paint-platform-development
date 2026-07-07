import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * Получить список продуктов для клиентской части
 * Поддерживает фильтрацию, сортировку и пагинацию
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Параметры фильтрации
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const onlyInStock = searchParams.get('inStock') === 'true';
    const isHit = searchParams.get('hit') === 'true';

    const skip = (page - 1) * limit;

    // Формируем условия WHERE
    const where: any = {};

    // Фильтр по списку ID
    const ids = searchParams.getAll('id');
    if (ids.length > 0) {
      where.OR = [
        { id: { in: ids } },
        { slug: { in: ids } },
      ];
    }

    // Только товары в наличии
    if (onlyInStock) {
      where.stock = { gt: 0 };
    }

    // Фильтр по категории
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Фильтр по бренду
    if (brand) {
      where.brand = {
        slug: brand
      };
    }

    // Поиск по названию и описанию
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр по хитам
    if (isHit) {
      where.badges = {
        has: 'Хит'
      };
    }

    // Формируем сортировку
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = order;
    } else if (sortBy === 'name') {
      orderBy.name = order;
    } else if (sortBy === 'rating') {
      orderBy.rating = order;
    } else {
      orderBy.createdAt = order;
    }

    // Выполняем запросы параллельно
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении продуктов' },
      { status: 500 }
    );
  }
}
