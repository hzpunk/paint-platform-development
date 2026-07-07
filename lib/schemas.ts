import { z } from "zod";

const ProductSpecsSchema = z.object({
  composition: z.string().optional(),
  consumption: z.number().nonnegative().optional(),
  dryingTime: z.string().optional(),
  coverage: z.string().optional(),
  layers: z.string().optional(),
  storage: z.string().optional(),
});

const PackagingItemSchema = z.object({
  volume: z.number().positive("Объём должен быть положительным числом"),
  price: z.number().nonnegative("Цена должна быть неотрицательной"),
  sku: z.string().min(1, "Артикул не может быть пустым"),
});

const PackagingSchema = z.union([
  PackagingItemSchema,
  z.array(PackagingItemSchema),
]);

const ColorItemSchema = z.object({
  hex: z.string().regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, "Неверный цвет"),
  stock: z
    .number()
    .int()
    .nonnegative("Остаток цвета должен быть неотрицательным числом")
    .optional(),
  name: z.string().optional(),
});

const ColorSchema = z.array(
  z.union([
    z.string().regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    ColorItemSchema,
  ]),
);

export const ProductSchema = z.object({
  name: z.string().min(3, "Название должно содержать не менее 3 символов"),
  slug: z.string().min(3, "Слаг должен содержать не менее 3 символов"),
  description: z.string().optional(),
  price: z.number().positive("Цена должна быть положительным числом"),
  commission: z
    .number()
    .nonnegative("Комиссия должна быть неотрицательным числом")
    .optional(),
  stock: z
    .number()
    .int()
    .nonnegative("Остаток должен быть целым неотрицательным числом"),
  images: z
    .array(z.string().min(1, "Путь к изображению не может быть пустым"))
    .optional(),
  categoryId: z.string().uuid("Неверный ID категории").nullable().optional(),
  brandId: z.string().uuid("Неверный ID бренда").nullable().optional(),
  type: z.string().optional(),
  surfaces: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  colorable: z.boolean().optional(),
  shortSpec: z.string().optional(),
  specs: ProductSpecsSchema.optional(),
  application: z.string().optional(),
  packaging: PackagingSchema.optional(),
  colors: ColorSchema.optional(),
});
