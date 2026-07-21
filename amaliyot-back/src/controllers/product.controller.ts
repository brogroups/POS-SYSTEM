// @ts-nocheck
import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { CategoryModel } from '../models/category.model';
import { IngredientModel } from '../models/ingredient.model';
import { RecipeModel } from '../models/recipe.model';

const KALYAN_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%231e293b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect width='24' height='24' fill='%23ffffff' rx='4'/><path d='M12 2v4M12 6a3 3 0 0 0-3 3v2M12 6a3 3 0 0 1 3 3v2M9 11h6M8 14h8M7 17a5 5 0 0 0 10 0l-1-3H8l-1 3z'/><path d='M12 11v6M15 9l4 2M19 11v3'/></svg>";

const WATER_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%231e293b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect width='24' height='24' fill='%23ffffff' rx='4'/><path d='M10 2h4v3h-4zM9 5h6v3l1 3v9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-9l1-3V5zM8 14h8M9 11h6'/></svg>";

const SNACK_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%231e293b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect width='24' height='24' fill='%23ffffff' rx='4'/><path d='M4 11a8 8 0 0 0 16 0H4zM12 19v2M8 21h8M8 8a2 2 0 0 1 2-2M12 7a2 2 0 0 1 2-2M15 9a2 2 0 0 1 2-2'/></svg>";

async function ensureSeedProducts() {
  const existingCount = await ProductModel.count({ where: { is_deleted: false } });
  if (existingCount > 0) return;

  const branchId = "000000000000000000000001";

  // Categories
  let catKalyan = await CategoryModel.findFirst({ where: { name: "Kalyanlar" } });
  if (!catKalyan) {
    catKalyan = await CategoryModel.create({ data: { name: "Kalyanlar", description: "Kalyan va tamaki turlari", branch_id: branchId } });
  }

  let catDrinks = await CategoryModel.findFirst({ where: { name: "Ichimliklar" } });
  if (!catDrinks) {
    catDrinks = await CategoryModel.create({ data: { name: "Ichimliklar", description: "Muzdek ichimliklar va suvlar", branch_id: branchId } });
  }

  let catSnacks = await CategoryModel.findFirst({ where: { name: "Sneklar" } });
  if (!catSnacks) {
    catSnacks = await CategoryModel.create({ data: { name: "Sneklar", description: "Semichka va sneklar", branch_id: branchId } });
  }

  let catTashqi = await CategoryModel.findFirst({ where: { name: "Tashqi" } });
  if (!catTashqi) {
    catTashqi = await CategoryModel.create({ data: { name: "Tashqi", description: "Tashqi va erkin narxdagi mahsulotlar", branch_id: branchId } });
  }

  // Ingredients (Omborxona Xom-ashyolari)
  let ingTobacco = await IngredientModel.findFirst({ where: { name: "Kalyan Tamakisi (Mix) (Ombor)" } });
  if (!ingTobacco) {
    ingTobacco = await IngredientModel.create({
      data: { name: "Kalyan Tamakisi (Mix) (Ombor)", category: "TOBACCO", quantity: 2000, base_unit: "g", display_unit: "kg", min_quantity: 200, branch_id: branchId }
    });
  }

  let ingDoubleApple = await IngredientModel.findFirst({ where: { name: "Double Apple Tamakisi (Ombor)" } });
  if (!ingDoubleApple) {
    ingDoubleApple = await IngredientModel.create({
      data: { name: "Double Apple Tamakisi (Ombor)", category: "TOBACCO", quantity: 1500, base_unit: "g", display_unit: "kg", min_quantity: 200, branch_id: branchId }
    });
  }

  let ingGrapeMint = await IngredientModel.findFirst({ where: { name: "Grape & Mint Tamakisi (Ombor)" } });
  if (!ingGrapeMint) {
    ingGrapeMint = await IngredientModel.create({
      data: { name: "Grape & Mint Tamakisi (Ombor)", category: "TOBACCO", quantity: 1500, base_unit: "g", display_unit: "kg", min_quantity: 200, branch_id: branchId }
    });
  }

  let ingWater = await IngredientModel.findFirst({ where: { name: "Mineral Suv 0.5L (Ombor Zaxirasi)" } });
  if (!ingWater) {
    ingWater = await IngredientModel.create({
      data: { name: "Mineral Suv 0.5L (Ombor Zaxirasi)", category: "BEVERAGE", quantity: 100, base_unit: "pcs", display_unit: "pcs", min_quantity: 10, branch_id: branchId }
    });
  }

  let ingCola = await IngredientModel.findFirst({ where: { name: "Coca-Cola 0.5L (Ombor Zaxirasi)" } });
  if (!ingCola) {
    ingCola = await IngredientModel.create({
      data: { name: "Coca-Cola 0.5L (Ombor Zaxirasi)", category: "BEVERAGE", quantity: 100, base_unit: "pcs", display_unit: "pcs", min_quantity: 10, branch_id: branchId }
    });
  }

  let ingSemichka = await IngredientModel.findFirst({ where: { name: "Qovurilgan Semichka (Ombor Xom-ashyo)" } });
  if (!ingSemichka) {
    ingSemichka = await IngredientModel.create({
      data: { name: "Qovurilgan Semichka (Ombor Xom-ashyo)", category: "FOOD", quantity: 5000, base_unit: "g", display_unit: "kg", min_quantity: 500, branch_id: branchId }
    });
  }

  // Products
  const productsToCreate = [
    { name: "Kalyan Classic (Double Apple)", price: 100000, category_id: catKalyan.id, image: KALYAN_SVG, description: "Ikki karra olma ta'mli klassik kalyan", is_available: true, branch_id: branchId },
    { name: "Kalyan Premium (Grape & Mint)", price: 120000, category_id: catKalyan.id, image: KALYAN_SVG, description: "Uzum va yalpizli premium kalyan", is_available: true, branch_id: branchId },
    { name: "Kalyan Special (Ice Berry)", price: 140000, category_id: catKalyan.id, image: KALYAN_SVG, description: "Muzli rezavor mevalar ta'mli maxsus kalyan", is_available: true, branch_id: branchId },
    { name: "Mineral Suv 0.5L (Gazsiz)", price: 5000, category_id: catDrinks.id, image: WATER_SVG, description: "Muzdek toza mineral suv", is_available: true, branch_id: branchId },
    { name: "Coca-Cola 0.5L", price: 10000, category_id: catDrinks.id, image: WATER_SVG, description: "Salqinlashtiruvchi Coca-Cola", is_available: true, branch_id: branchId },
    { name: "Qovurilgan Semichka (Qora)", price: 15000, category_id: catSnacks.id, image: SNACK_SVG, description: "Mazali qovurilgan qora semichka", is_available: true, branch_id: branchId }
  ];

  for (const p of productsToCreate) {
    const createdProduct = await ProductModel.create({ data: p });
    
    // Attach recipe
    if (p.name.includes("Kalyan") && ingTobacco) {
      await RecipeModel.create({
        data: {
          product_id: createdProduct.id,
          ingredients: [{ ingredient_id: ingTobacco.id, quantity: 20, unit: "g" }]
        }
      });
    } else if (p.name.includes("Mineral Suv") && ingWater) {
      await RecipeModel.create({
        data: {
          product_id: createdProduct.id,
          ingredients: [{ ingredient_id: ingWater.id, quantity: 1, unit: "pcs" }]
        }
      });
    } else if (p.name.includes("Coca-Cola") && ingCola) {
      await RecipeModel.create({
        data: {
          product_id: createdProduct.id,
          ingredients: [{ ingredient_id: ingCola.id, quantity: 1, unit: "pcs" }]
        }
      });
    } else if (p.name.includes("Semichka") && ingSemichka) {
      await RecipeModel.create({
        data: {
          product_id: createdProduct.id,
          ingredients: [{ ingredient_id: ingSemichka.id, quantity: 100, unit: "g" }]
        }
      });
    }
  }
}

export const ProductController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      await ensureSeedProducts();
      const where = { is_deleted: false };
      const data = await ProductModel.findMany({ where });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const where = { id, is_deleted: false };
      const data = await ProductModel.findFirst({ where });
      if (!data) {
        res.status(404).json({ error: 'Topilmadi' });
        return;
      }
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await ProductModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await ProductModel.update({
        where: { id },
        data: req.body
      });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      await ProductModel.update({
        where: { id },
        data: { is_deleted: true }
      });
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  }
};
