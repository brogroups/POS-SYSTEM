import { HookahModel } from '../models/hookah.model';
import { OrderModel } from '../models/order.model';
import { OrderItemModel } from '../models/order-item.model';
import { ProductModel } from '../models/product.model';
import { RecipeModel } from '../models/recipe.model';
import { IngredientModel } from '../models/ingredient.model';
import { logAuditAction } from '../config/audit-logger';
import { emitToAll } from '../config/socket';

export const HookahService = {
  /**
   * Get daily hookah report for a branch
   */
  async getDailyReport(branchId: string, date?: string): Promise<any> {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all hookahs for this branch
    const hookahs = await HookahModel.findMany({
      where: { branch_id: branchId, is_deleted: false }
    });

    // Get hookah product IDs
    const hookahProductIds = hookahs
      .filter((h: any) => h.product_id)
      .map((h: any) => h.product_id.toString());

    if (hookahProductIds.length === 0) {
      return {
        date: targetDate.toISOString().split('T')[0],
        total_hookahs: 0,
        by_category: {},
        total_tobacco_used_g: 0,
        remaining_tobacco_g: 0,
        most_popular_flavor: null,
        most_popular_hookah: null,
        avg_preparation_time: 0
      };
    }

    // Get completed orders for today that contain hookah products
    const todaysOrders = await OrderModel.findMany({
      where: {
        branch_id: branchId,
        status: 'COMPLETED',
        created_at: { $gte: startOfDay, $lte: endOfDay },
        is_deleted: false
      }
    });

    const orderIds = todaysOrders.map((o: any) => o.id);

    // Get order items for hookah products
    const hookahItems = await OrderItemModel.findMany({
      where: {
        order_id: { $in: orderIds },
        product_id: { $in: hookahProductIds }
      }
    });

    // Calculate totals
    let totalHookahs = 0;
    const byCategory: Record<string, number> = {};
    const hookahCounts: Record<string, number> = {};
    let totalTobaccoUsed = 0;

    for (const item of hookahItems) {
      const hookah = hookahs.find((h: any) =>
        h.product_id && h.product_id.toString() === item.product_id.toString()
      );
      if (!hookah) continue;

      const qty = item.quantity || 1;
      totalHookahs += qty;

      // By category
      const cat = hookah.category || 'Boshqa';
      byCategory[cat] = (byCategory[cat] || 0) + qty;

      // Count per hookah name
      hookahCounts[hookah.name] = (hookahCounts[hookah.name] || 0) + qty;

      // Tobacco used
      totalTobaccoUsed += (hookah.tobacco_weight || 0) * qty;
    }

    // Find most popular hookah
    let mostPopularHookah: string | null = null;
    let maxCount = 0;
    for (const [name, count] of Object.entries(hookahCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostPopularHookah = name;
      }
    }

    // Calculate remaining tobacco from ingredients
    // Get all tobacco-type ingredients
    const tobaccoIngredients = await IngredientModel.findMany({
      where: {
        branch_id: branchId,
        base_unit: 'g'
      }
    });

    const remainingTobacco = tobaccoIngredients.reduce(
      (sum: number, ing: any) => sum + (ing.quantity || 0), 0
    );

    // Find most popular flavor from recipe ingredients
    let mostPopularFlavor: string | null = null;
    // We'll find this from the most used hookah's recipe
    if (mostPopularHookah) {
      const popularHookah = hookahs.find((h: any) => h.name === mostPopularHookah);
      if (popularHookah?.product_id) {
        const recipe = await RecipeModel.findFirst({
          where: { product_id: popularHookah.product_id }
        });
        if (recipe?.ingredients?.length > 0) {
          const mainIngId = recipe.ingredients[0].ingredient_id;
          const mainIng = await IngredientModel.findFirst({ where: { id: mainIngId } });
          if (mainIng) {
            mostPopularFlavor = mainIng.name;
          }
        }
      }
    }

    // Average preparation time
    const avgPrepTime = hookahs.length > 0
      ? hookahs.reduce((sum: number, h: any) => sum + (h.preparation_time || 0), 0) / hookahs.length
      : 0;

    return {
      date: targetDate.toISOString().split('T')[0],
      total_hookahs: totalHookahs,
      by_category: byCategory,
      total_tobacco_used_g: totalTobaccoUsed,
      remaining_tobacco_g: remainingTobacco,
      most_popular_flavor: mostPopularFlavor,
      most_popular_hookah: mostPopularHookah,
      avg_preparation_time: Math.round(avgPrepTime)
    };
  },

  /**
   * Link a hookah to a sellable product
   */
  async linkToProduct(hookahId: string, productId: string, userId: string): Promise<any> {
    const hookah = await HookahModel.findFirst({ where: { id: hookahId } });
    if (!hookah) throw new Error('Qalyon topilmadi');

    const product = await ProductModel.findFirst({ where: { id: productId } });
    if (!product) throw new Error('Mahsulot topilmadi');

    const updated = await HookahModel.update({
      where: { id: hookahId },
      data: { product_id: productId }
    });

    await logAuditAction(userId, 'HOOKAH_LINKED_TO_PRODUCT', 'Hookah', hookahId, hookah, updated);
    emitToAll('hookah:updated', { hookah_id: hookahId });
    return updated;
  },

  /**
   * Get hookah with its linked product and recipe
   */
  async getWithRecipe(hookahId: string): Promise<any> {
    const hookah = await HookahModel.findFirst({ where: { id: hookahId } });
    if (!hookah) throw new Error('Qalyon topilmadi');

    let product = null;
    let recipe = null;

    if (hookah.product_id) {
      product = await ProductModel.findFirst({ where: { id: hookah.product_id } });
      recipe = await RecipeModel.findFirst({ where: { product_id: hookah.product_id } });

      // Populate ingredient names in recipe
      if (recipe?.ingredients) {
        const populatedIngredients = [];
        for (const ri of recipe.ingredients) {
          const ingredient = await IngredientModel.findFirst({ where: { id: ri.ingredient_id } });
          populatedIngredients.push({
            ...ri,
            ingredient_name: ingredient?.name || 'Noma\'lum'
          });
        }
        recipe = { ...recipe, ingredients: populatedIngredients };
      }
    }

    return { ...hookah, product, recipe };
  }
};
