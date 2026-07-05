import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(3, "Название должно содержать не менее 3 символов"),
  slug: z.string().min(3, "Слаг должен содержать не менее 3 символов"),
  description: z.string().optional(),
  price: z.number().positive("Цена должна быть положительным числом"),
  stock: z.number().int().nonnegative("Остаток должен быть целым неотрицательным числом"),
  images: z.array(z.string().min(1, "Путь к изображению не может быть пустым")).optional(),
  categoryId: z.string().uuid("Неверный ID категории"),
  brandId: z.string().uuid("Неверный ID бренда"),
  type: z.string().optional(),
  surfaces: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  colorable: z.boolean().optional(),
  shortSpec: z.string().optional(),
  specs: z.any().optional(), // TODO: более строгая валидация для specs
  application: z.string().optional(),
  packaging: z.any().optional(), // TODO: более строгая валидация для packaging
  colors: z.any().optional(), // TODO: более строгая валидация для colors
});
