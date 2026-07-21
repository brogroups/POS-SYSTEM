import { IngredientModel } from '../models/ingredient.model';
import { RecipeModel } from '../models/recipe.model';
import { StockMovementModel } from '../models/stock-movement.model';
import { PurchaseModel } from '../models/purchase.model';
import { emitToAll } from '../config/socket';

export const UNIT_CONVERSIONS: Record<string, { base: string; factor: number }> = {
  kg: { base: 'g', factor: 1000 },
  g: { base: 'g', factor: 1 },
  gramm: { base: 'g', factor: 1 },
  l: { base: 'ml', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  pcs: { base: 'pcs', factor: 1 },
  dona: { base: 'pcs', factor: 1 },
  box: { base: 'pcs', factor: 24 },
  pack: { base: 'pcs', factor: 20 },
  bottle: { base: 'pcs', factor: 1 },
  charcoal: { base: 'pcs', factor: 1 }
};

export const InventoryService = {
  convertToBaseUnit(quantity: number, unit: string): number {
    const normUnit = (unit || 'pcs').toLowerCase().trim();
    const conv = UNIT_CONVERSIONS[normUnit] || { base: normUnit, factor: 1 };
    return quantity * conv.factor;
  },

  convertToDisplayUnit(quantity: number, unit: string): number {
    const normUnit = (unit || 'pcs').toLowerCase().trim();
    const conv = UNIT_CONVERSIONS[normUnit] || { base: normUnit, factor: 1 };
    return quantity / conv.factor;
  },

  async deductRecipeForOrder(order: any, userId?: string): Promise<void> {
    try {
      const branchId = order.branch_id;
      const orderItems = order.order_items || [];

      for (const item of orderItems) {
        const productId = item.product_id ? String(item.product_id) : null;
        const quantitySold = item.quantity || 1;
        if (!productId) continue;

        // 1. Search for recipe by product_id
        let recipe = await RecipeModel.findFirst({ where: { product_id: productId } });
        if (!recipe) {
          recipe = await RecipeModel.findFirst({ where: { product_id: item.product_id } });
        }

        if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
          for (const recipeItem of recipe.ingredients) {
            const ingredientId = recipeItem.ingredient_id;
            const recipeUnit = recipeItem.unit || 'g';
            const itemBaseQty = this.convertToBaseUnit(recipeItem.quantity, recipeUnit);
            const consumeQty = itemBaseQty * quantitySold;

            const ingredient = await IngredientModel.findFirst({ where: { id: ingredientId } });
            if (!ingredient) continue;

            const newQty = Math.max(0, ingredient.quantity - consumeQty);

            await IngredientModel.update({
              where: { id: ingredientId },
              data: { quantity: newQty }
            });

            await StockMovementModel.create({
              data: {
                branch_id: branchId,
                ingredient_id: ingredientId,
                user_id: userId,
                type: 'OUT',
                quantity: consumeQty,
                note: `Buyurtma #${order.id} yopildi (${quantitySold}x taom)`
              }
            });

            if (newQty <= (ingredient.min_quantity || 0)) {
              emitToAll('inventory:warning', {
                ingredient_id: ingredientId,
                name: ingredient.name,
                quantity: newQty,
                min_quantity: ingredient.min_quantity,
                message: `Ogohlantirish: ${ingredient.name} zaxirasi kam qoldi! (${newQty} ${ingredient.base_unit})`
              });
            }
          }
        } else {
          // 2. Fallback: Direct ingredient deduction (for drinks, snacks, or products without recipe)
          let directIngredient = await IngredientModel.findFirst({ where: { product_id: productId } });
          if (!directIngredient && item.product && item.product.name) {
            directIngredient = await IngredientModel.findFirst({
              where: { name: { $regex: new RegExp(item.product.name.trim(), 'i') } }
            });
          }
          if (!directIngredient) {
            directIngredient = await IngredientModel.findFirst({ where: { id: productId } });
          }

          if (directIngredient) {
            const consumeQty = quantitySold;
            const newQty = Math.max(0, directIngredient.quantity - consumeQty);

            await IngredientModel.update({
              where: { id: directIngredient.id },
              data: { quantity: newQty }
            });

            await StockMovementModel.create({
              data: {
                branch_id: branchId,
                ingredient_id: directIngredient.id,
                user_id: userId,
                type: 'OUT',
                quantity: consumeQty,
                note: `Buyurtma #${order.id} yopildi (${quantitySold}x to'g'ridan-to'g'ri mahsulot)`
              }
            });

            if (newQty <= (directIngredient.min_quantity || 0)) {
              emitToAll('inventory:warning', {
                ingredient_id: directIngredient.id,
                name: directIngredient.name,
                quantity: newQty,
                min_quantity: directIngredient.min_quantity,
                message: `Ogohlantirish: ${directIngredient.name} zaxirasi kam qoldi! (${newQty} ${directIngredient.base_unit})`
              });
            }
          }
        }
      }
      
      emitToAll('inventory:updated', { branch_id: branchId });
    } catch (error) {
      console.error('Failed to deduct recipe ingredients for order:', error);
    }
  },

  async addStockFromPurchase(purchaseData: any, userId: string): Promise<any> {
    const { supplier_name, invoice_number, total_cost, payment_status, branch_id, items } = purchaseData;

    // Create Purchase Record
    const purchase = await PurchaseModel.create({
      data: {
        supplier_name,
        invoice_number,
        total_cost,
        payment_status,
        received_by: userId,
        branch_id,
        purchase_date: new Date(),
        items
      }
    });

    // Update Ingredients Quantity
    for (const item of items) {
      const ingredient = await IngredientModel.findFirst({ where: { id: item.ingredient_id } });
      if (!ingredient) continue;

      const baseQtyAdded = this.convertToBaseUnit(item.quantity, item.unit);
      const newQty = ingredient.quantity + baseQtyAdded;

      await IngredientModel.update({
        where: { id: item.ingredient_id },
        data: { quantity: newQty }
      });

      // Log Stock Movement
      await StockMovementModel.create({
        data: {
          branch_id,
          ingredient_id: item.ingredient_id,
          user_id: userId,
          type: 'IN',
          quantity: baseQtyAdded,
          note: `Xarid (Invoice #${invoice_number})`
        }
      });
    }

    emitToAll('inventory:updated', { branch_id });
    return purchase;
  }
};
