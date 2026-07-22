<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Menyu</h2>
        <p class="text-muted-foreground mt-1">Barcha taomlar, ichimliklar va toifalarni boshqarish</p>
      </div>
      
      <div class="flex gap-2">
        <button
          @click="handleAddButtonClick"
          class="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
        >
          <Plus class="h-5 w-5" />
          {{ activeTab === 'products' ? "Mahsulot Qo'shish" : activeTab === 'categories' ? "Toifa Qo'shish" : "Stol Qo'shish" }}
        </button>
      </div>
    </div>

    <div class="flex gap-4 border-b border-border pb-0">
      <button 
        @click="activeTab = 'products'" 
        :class="['pb-3 text-sm font-medium transition-colors cursor-pointer', activeTab === 'products' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground']"
      >
        Mahsulotlar
      </button>
      <button 
        @click="activeTab = 'categories'" 
        :class="['pb-3 text-sm font-medium transition-colors cursor-pointer', activeTab === 'categories' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground']"
      >
        Toifalar (Kategoriyalar)
      </button>
      <button 
        @click="activeTab = 'tables'" 
        :class="['pb-3 text-sm font-medium transition-colors cursor-pointer', activeTab === 'tables' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground']"
      >
        Stollar
      </button>
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm glass overflow-hidden">
      <!-- Products Tab -->
      <template v-if="activeTab === 'products'">
        <div class="p-4 border-b border-border flex items-center gap-2">
          <Search class="h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            v-model="productSearch" 
            placeholder="Mahsulot qidirish..." 
            class="bg-transparent border-none outline-none text-sm w-full text-white" 
          />
        </div>
        
        <div v-if="loading" class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th class="px-6 py-4 font-medium">Mahsulot</th>
                <th class="px-6 py-4 font-medium">Toifasi</th>
                <th class="px-6 py-4 font-medium">Narxi</th>
                <th class="px-6 py-4 font-medium text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredProducts" :key="product.id" class="border-b border-border hover:bg-secondary/20 transition-colors">
                <td class="px-6 py-4 font-medium flex items-center gap-3">
                  <div class="h-10 w-10 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                    <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Yo'q</div>
                  </div>
                  {{ product.name }}
                </td>
                <td class="px-6 py-4 text-muted-foreground">
                  <span class="px-2 py-1 rounded-md bg-secondary border border-border text-xs">{{ getCategoryName(product) }}</span>
                </td>
                <td class="px-6 py-4 font-semibold text-primary">{{ formatNumber(product.price) }} so'm</td>
                <td class="px-6 py-4 text-right">
                  <button 
                    @click="handleOpenRecipeModal(product)" 
                    :class="[
                      'p-2 cursor-pointer transition-colors rounded-lg border mr-1',
                      hasRecipe(product.id)
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                    ]"
                    :title="hasRecipe(product.id) ? 'Resept biriktirilgan (Tahrirlash)' : 'Masalliqlar Sarfi (Resept Biriktirish)'"
                  >
                    <FlaskConical class="h-4 w-4" />
                  </button>
                  <button @click="handleOpenProductModal(product)" class="text-blue-500 hover:text-blue-600 p-2 cursor-pointer">
                    <Edit class="h-4 w-4" />
                  </button>
                  <button @click="handleDeleteProduct(product.id)" class="text-red-500 hover:text-red-600 p-2 ml-2 cursor-pointer">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colSpan="4" class="px-6 py-8 text-center text-muted-foreground">Mahsulotlar topilmadi.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Categories Tab -->
      <template v-if="activeTab === 'categories'">
        <div v-if="loading" class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th class="px-6 py-4 font-medium w-16">#ID</th>
                <th class="px-6 py-4 font-medium">Toifa nomi</th>
                <th class="px-6 py-4 font-medium text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cat, idx) in categories" :key="cat.id" class="border-b border-border hover:bg-secondary/20 transition-colors">
                <td class="px-6 py-4 font-bold text-blue-400">#{{ idx + 1 }}</td>
                <td class="px-6 py-4 font-medium flex items-center gap-2 text-white">
                  <Layers class="h-4 w-4 text-primary" /> {{ cat.name }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="handleOpenCatModal(cat)" class="text-blue-500 hover:text-blue-600 p-2 cursor-pointer">
                    <Edit class="h-4 w-4" />
                  </button>
                  <button @click="handleDeleteCat(cat.id)" class="text-red-500 hover:text-red-600 p-2 ml-2 cursor-pointer">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="categories.length === 0">
                <td colSpan="3" class="px-6 py-8 text-center text-muted-foreground">Toifalar topilmadi.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Tables Tab -->
      <template v-if="activeTab === 'tables'">
        <div v-if="loading" class="flex justify-center p-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th class="px-6 py-4 font-medium w-16">#ID</th>
                <th class="px-6 py-4 font-medium">Stol raqami</th>
                <th class="px-6 py-4 font-medium">Sig'imi</th>
                <th class="px-6 py-4 font-medium">Holati (Status)</th>
                <th class="px-6 py-4 font-medium">Joylashuvi (Zal)</th>
                <th class="px-6 py-4 font-medium">Soatlik VIP Narxi</th>
                <th class="px-6 py-4 font-medium text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(table, idx) in tables" :key="table.id" class="border-b border-border hover:bg-secondary/20 transition-colors">
                <td class="px-6 py-4 font-bold text-blue-400">#{{ idx + 1 }}</td>
                <td class="px-6 py-4 font-medium flex items-center gap-2 text-white">
                  <MonitorSmartphone class="h-4 w-4 text-primary" /> {{ formatTableTitle(table, idx) }}
                </td>
                <td class="px-6 py-4 text-white font-medium">
                  {{ table.seats || 4 }} kishilik
                </td>
                <td class="px-6 py-4">
                  <span v-if="table.status === 'AVAILABLE'" class="px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">Bo'sh</span>
                  <span v-else-if="table.status === 'OCCUPIED'" class="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/20">Band</span>
                  <span v-else-if="table.status === 'RESERVED'" class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/20">Bron qilingan</span>
                  <span v-else class="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-semibold border border-border">{{ table.status }}</span>
                </td>
                <td class="px-6 py-4 text-white font-medium">
                  {{ table.room_name || "Asosiy zal" }}
                </td>
                <td class="px-6 py-4 text-white font-medium">
                  {{ table.vip_price_per_hour && table.vip_price_per_hour > 0 ? `${formatNumber(table.vip_price_per_hour)} so'm` : "-" }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="handleOpenTableModal(table)" class="text-blue-500 hover:text-blue-600 p-2 cursor-pointer">
                    <Edit class="h-4 w-4" />
                  </button>
                  <button @click="handleDeleteTable(table.id)" class="text-red-500 hover:text-red-600 p-2 ml-2 cursor-pointer">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="tables.length === 0">
                <td colSpan="7" class="px-6 py-8 text-center text-muted-foreground">Stollar topilmadi.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- Product Modal -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isProductModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-card w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
            <h3 class="text-lg font-semibold text-white">{{ editingProduct ? "Tahrirlash" : "Yangi mahsulot" }}</h3>
            <button @click="isProductModalOpen = false" class="text-muted-foreground hover:text-foreground cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>
          <form @submit.prevent="handleSaveProduct" class="p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-muted-foreground">Mahsulot nomi</label>
              <input required v-model="name" type="text" placeholder="Masalan: Kalyan Premium (Grape & Mint)" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Toifasi</label>
              <select required v-model="categoryId" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white">
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Narxi (so'm)</label>
              <input required v-model="priceDisplay" type="text" placeholder="Masalan: 120 000" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white font-bold text-blue-400" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Rasm URL</label>
              <input v-model="image" type="text" placeholder="https://..." class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" />
            </div>

            <!-- Ombor Masalliq Sarfi (Retsept / Tamaki Dozasi) -->
            <div class="border-t border-border pt-3 mt-3">
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-amber-400">🧪 Ombor Masalliq Sarfi (Retsept)</label>
                <button type="button" @click="addProductRecipeItem" class="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer">
                  <Plus class="h-3.5 w-3.5" /> Masalliq qo'shish
                </button>
              </div>
              <p v-if="isTashqiCategory" class="text-xs text-emerald-400 font-medium mb-2.5 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                ⚡ "Tashqi" toifasi uchun omborxona masallig'i (retsept) shart emas! Hohlagan narxingiz bilan saqlashingiz mumkin.
              </p>
              <p v-else class="text-[11px] text-muted-foreground mb-2.5">
                Har 1 ta sotilganda ombordan necha gramm/dona ayrilishini belgilang (masalan: 1 ta Kalyan uchun 80g Tamaki).
              </p>

              <div v-for="(rItem, rIdx) in productRecipeItems" :key="rIdx" class="grid grid-cols-12 gap-2 items-center mb-2 bg-secondary/40 p-2.5 rounded-lg border border-border">
                <div class="col-span-6">
                  <select v-model="rItem.ingredient_id" class="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary font-medium">
                    <option disabled value="">🏭 Omborxona masallig'ini tanlang...</option>
                    <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">
                      📦 {{ ing.name }} (Omborda: {{ ing.quantity }} {{ ing.base_unit || 'g' }})
                    </option>
                  </select>
                </div>
                <div class="col-span-3">
                  <input type="number" min="0.1" step="any" v-model.number="rItem.quantity" placeholder="80" class="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary font-bold text-amber-300" />
                </div>
                <div class="col-span-2">
                  <select v-model="rItem.unit" class="w-full bg-background border border-border rounded-lg px-1.5 py-1.5 text-[11px] text-white outline-none">
                    <option value="g">g (gramm)</option>
                    <option value="kg">kg (kilo)</option>
                    <option value="ml">ml (militr)</option>
                    <option value="l">l (litr)</option>
                    <option value="pcs">dona (pcs)</option>
                  </select>
                </div>
                <div class="col-span-1 text-right">
                  <button type="button" @click="removeProductRecipeItem(rIdx)" class="text-red-400 hover:text-red-300 p-1 cursor-pointer">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div class="pt-2 flex justify-end gap-3">
              <button type="button" @click="isProductModalOpen = false" class="px-5 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium cursor-pointer">Bekor</button>
              <button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium shadow-md cursor-pointer">Saqlash</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Category Modal -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isCatModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-card w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
            <h3 class="text-lg font-semibold text-white">{{ editingCat ? "Toifani tahrirlash" : "Yangi toifa" }}</h3>
            <button @click="isCatModalOpen = false" class="text-muted-foreground hover:text-foreground cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>
          <form @submit.prevent="handleSaveCat" class="p-5 space-y-5">
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Toifa nomi</label>
              <input required v-model="catName" type="text" placeholder="Masalan: Issiq taomlar" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" />
            </div>
            <div class="pt-2 flex justify-end gap-3">
              <button type="button" @click="isCatModalOpen = false" class="px-5 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium cursor-pointer">Bekor</button>
              <button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium shadow-md cursor-pointer">Saqlash</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Table Modal -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isTableModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-card w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
            <h3 class="text-lg font-semibold text-white">{{ editingTable ? "Stolni tahrirlash" : "Yangi stol qo'shish" }}</h3>
            <button @click="isTableModalOpen = false" class="text-muted-foreground hover:text-foreground cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>
          <form @submit.prevent="handleSaveTable" class="p-5 space-y-5">
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Stol raqami (masalan: K1, C1, VIP1, 5)</label>
              <input required v-model="tableNumber" type="text" placeholder="Masalan: K1, C1, 5" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Sig'imi (o'rindiqlar soni)</label>
              <input required v-model.number="tableSeats" type="number" min="1" placeholder="Masalan: 4" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Holati (Status)</label>
              <select required v-model="tableStatus" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white">
                <option value="AVAILABLE">Bo'sh (AVAILABLE)</option>
                <option value="OCCUPIED">Band (OCCUPIED)</option>
                <option value="RESERVED">Bron qilingan (RESERVED)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Zal (Joylashuv)</label>
              <select v-model="roomName" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white">
                <option value="Asosiy zal">Asosiy zal</option>
                <option value="VIP zona">VIP zona</option>
                <option value="Kabina">Kabina</option>
                <option value="Terrasa">Terrasa</option>
              </select>
            </div>
            <div v-if="roomName === 'VIP zal' || roomName === 'Kabina'">
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Soatlik Xona / Kabina narxi (so'm)</label>
              <input type="number" min="0" v-model.number="vipPricePerHour" placeholder="Masalan: 50000" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" />
            </div>
            <div class="pt-2 flex justify-end gap-3">
              <button type="button" @click="isTableModalOpen = false" class="px-5 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium cursor-pointer">Bekor</button>
              <button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium shadow-md cursor-pointer">Saqlash</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Recipe Modal (Masalliqlar Sarfi / Resept) -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isRecipeModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-[#181b25] w-full max-w-lg rounded-2xl shadow-2xl border border-[#2a2e3d] overflow-hidden">
          <div class="flex items-center justify-between p-5 border-b border-[#2a2e3d] bg-[#1e2230]/50">
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <span>🧪</span> Masalliqlar Sarfi (Resept)
              </h3>
              <p class="text-xs text-[#94a3b8] mt-0.5 font-medium">
                <span class="text-blue-400 font-bold">{{ recipeProduct?.name }}</span> uchun ombor masallig'i va miqdorini belgilang
              </p>
            </div>
            <button @click="isRecipeModalOpen = false" class="text-[#94a3b8] hover:text-white cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div v-if="recipeItems.length === 0" class="p-4 bg-[#1e2230]/40 border border-dashed border-[#2a2e3d] rounded-xl text-center">
              <p class="text-xs text-[#94a3b8]">Hali hech qanday masalliq biriktirilmagan.</p>
              <p class="text-[11px] text-[#64748b] mt-1">Masalan: 1 dona kalyan uchun 20 gramm Tamaki, yoki 1 dona Cola uchun 1 dona Cola masallig'i.</p>
            </div>

            <div v-for="(item, idx) in recipeItems" :key="idx" class="grid grid-cols-12 gap-2 items-center bg-[#1e2230] p-3 rounded-xl border border-[#2a2e3d]">
              <div class="col-span-5">
                <label class="text-[10px] text-[#94a3b8] block mb-1 font-semibold">Ombor Masallig'i</label>
                <select v-model="item.ingredient_id" required class="w-full bg-[#181b25] border border-[#2a2e3d] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500">
                  <option disabled value="">Masalliqni tanlang</option>
                  <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">
                    {{ ing.name }} (zaxira: {{ formatIngredientQty(ing) }})
                  </option>
                </select>
              </div>
              <div class="col-span-4">
                <label class="text-[10px] text-[#94a3b8] block mb-1 font-semibold">Sarf Miqdori</label>
                <input v-model.number="item.quantity" required type="number" step="any" min="0.001" placeholder="Miqdor" class="w-full bg-[#181b25] border border-[#2a2e3d] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500" />
              </div>
              <div class="col-span-2">
                <label class="text-[10px] text-[#94a3b8] block mb-1 font-semibold">Birlik</label>
                <select v-model="item.unit" class="w-full bg-[#181b25] border border-[#2a2e3d] rounded-lg px-1 py-1.5 text-xs text-white outline-none focus:border-blue-500">
                  <option value="g">g (gramm)</option>
                  <option value="kg">kg</option>
                  <option value="pcs">dona (pcs)</option>
                  <option value="ml">ml</option>
                  <option value="l">litr (l)</option>
                </select>
              </div>
              <div class="col-span-1 text-right pt-4">
                <button type="button" @click="removeRecipeItem(idx)" class="text-rose-400 hover:text-rose-300 font-bold text-base p-1 cursor-pointer">✕</button>
              </div>
            </div>

            <button type="button" @click="addRecipeItem" class="w-full py-2 bg-[#1e2230] hover:bg-[#252b3d] border border-[#2a2e3d] text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <Plus class="h-4 w-4" /> Masalliq Qo'shish
            </button>

            <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 leading-relaxed">
              💡 <strong>Qanday ishlaydi:</strong> Har safar 1 ta <b>{{ recipeProduct?.name || 'mahsulot' }}</b> sotilganda, yuqoridagi masalliq omborxonadan avtomatik ayriladi!
            </div>

            <div class="pt-2 flex justify-end gap-3 border-t border-[#2a2e3d]">
              <button type="button" @click="isRecipeModalOpen = false" class="px-5 py-2.5 rounded-xl border border-[#2a2e3d] bg-[#1e2230] text-[#94a3b8] hover:text-white text-xs font-semibold cursor-pointer">Bekor qilish</button>
              <button type="button" @click="handleSaveRecipe" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer">Saqlash & Biriktirish</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Plus, Edit, Trash2, X, Search, Layers, MonitorSmartphone, FlaskConical } from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Products",
  components: {
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    Layers,
    MonitorSmartphone,
    FlaskConical,
  },
  data() {
    return {
      state: appContext.state,
      activeTab: "products",
      products: [],
      categories: [],
      tables: [],
      ingredients: [],
      recipes: [],
      loading: true,
      productSearch: "",
      
      // Product Fields
      isProductModalOpen: false,
      editingProduct: null,
      name: "",
      price: "",
      categoryId: "",
      image: "",

      // Recipe Fields
      isRecipeModalOpen: false,
      recipeProduct: null,
      recipeItems: [],
      productRecipeItems: [],

      // Category Fields
      isCatModalOpen: false,
      editingCat: null,
      catName: "",

      // Table Fields
      tableTab: "active",
      deletedTablesList: [],
      isTableModalOpen: false,
      editingTable: null,
      tableNumber: "",
      tableSeats: "",
      tableStatus: "AVAILABLE",
      roomName: "Asosiy zal",
      vipPricePerHour: 0,
    };
  },
  computed: {
    priceDisplay: {
      get() {
        return this.price;
      },
      set(val) {
        const clean = val.replace(/\D/g, "");
        if (!clean) {
          this.price = "";
        } else {
          this.price = Number(clean).toLocaleString("ru-RU").replace(/,/g, " ");
        }
      },
    },
    filteredProducts() {
      const q = this.productSearch.toLowerCase().trim();
      if (!q) return this.products;
      return this.products.filter(p => p.name.toLowerCase().includes(q));
    },
    isTashqiCategory() {
      const cat = (this.categories || []).find(c => String(c.id) === String(this.categoryId));
      return cat ? cat.name.toLowerCase().includes("tashqi") : false;
    },
  },
  watch: {
    roomName(val) {
      if (val !== "VIP zal" && val !== "Kabina") {
        this.vipPricePerHour = 0;
      }
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    formatNumber(num) {
      if (num === undefined || num === null) return "0";
      return Number(num).toLocaleString();
    },
    getCategoryName(product) {
      const cat = this.categories.find(c => c.id === product.category_id || c.id === product.categoryId);
      return cat ? cat.name : "Noma'lum";
    },
    formatIngredientQty(ing) {
      if (!ing) return "0";
      const q = ing.quantity || 0;
      if (ing.base_unit === "g" && (ing.display_unit === "kg" || q >= 1000)) {
        return `${(q / 1000).toFixed(2)} kg (${q} g)`;
      }
      if (ing.base_unit === "ml" && (ing.display_unit === "l" || q >= 1000)) {
        return `${(q / 1000).toFixed(2)} l (${q} ml)`;
      }
      return `${q} ${ing.display_unit || ing.base_unit || 'pcs'}`;
    },
    hasRecipe(productId) {
      const rec = this.recipes.find(r => r.product_id === productId || r.product_id?.toString() === productId?.toString());
      return rec && rec.ingredients && rec.ingredients.length > 0;
    },
    async fetchData() {
      try {
        this.loading = true;
        const [prodRes, catRes, tableRes, ingRes, recRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/restaurant-tables"),
          api.get("/ingredients"),
          api.get("/recipes"),
        ]);
        this.products = prodRes.data;
        this.categories = catRes.data || [];
        
        let hasTashqi = this.categories.some(c => c.name && c.name.toLowerCase().includes("tashqi"));
        if (!hasTashqi) {
          try {
            const newCatRes = await api.post("/categories", { name: "Tashqi", description: "Tashqi va erkin narxdagi mahsulotlar", branch_id: "000000000000000000000001" });
            this.categories.push(newCatRes.data);
          } catch (e) {}
        }
        const rawTables = tableRes.data || [];
        this.tables = rawTables.map((t, idx) => {
          const num = (t.table_number !== undefined && t.table_number !== null && String(t.table_number).trim() !== '')
            ? t.table_number
            : (idx + 1);
          return {
            ...t,
            table_number: num
          };
        });
        this.ingredients = ingRes.data || [];
        this.recipes = recRes.data || [];
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Ma'lumotlarni yuklashda xatolik yuz berdi", "error");
      } finally {
        this.loading = false;
      }
    },
    // --- Recipe Actions ---
    handleOpenRecipeModal(product) {
      this.recipeProduct = product;
      const existingRec = this.recipes.find(r => r.product_id === product.id || r.product_id?.toString() === product.id?.toString());
      if (existingRec && existingRec.ingredients && existingRec.ingredients.length > 0) {
        this.recipeItems = JSON.parse(JSON.stringify(existingRec.ingredients));
      } else {
        // Default suggestion based on category or product name
        const isTobacco = product.name.toLowerCase().includes("kalyan") || product.name.toLowerCase().includes("hookah");
        const defaultIng = this.ingredients.length > 0 ? this.ingredients[0].id : "";
        this.recipeItems = [
          { ingredient_id: defaultIng, quantity: isTobacco ? 20 : 1, unit: isTobacco ? "g" : "pcs" }
        ];
      }
      this.isRecipeModalOpen = true;
    },
    addRecipeItem() {
      const defaultIng = this.ingredients.length > 0 ? this.ingredients[0].id : "";
      this.recipeItems.push({ ingredient_id: defaultIng, quantity: 1, unit: "g" });
    },
    removeRecipeItem(idx) {
      this.recipeItems.splice(idx, 1);
    },
    async handleSaveRecipe() {
      try {
        if (!this.recipeProduct) return;
        const validItems = this.recipeItems.filter(i => i.ingredient_id && i.quantity > 0);
        const payload = {
          product_id: this.recipeProduct.id,
          ingredients: validItems
        };
        await api.post("/recipes", payload);
        appContext.showAlert("Muvaffaqiyatli", "Masalliqlar sarfi (resept) biriktirildi", "success");
        this.isRecipeModalOpen = false;
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Reseptni saqlashda xatolik", "error");
      }
    },
    handleAddButtonClick() {
      if (this.activeTab === "products") this.handleOpenProductModal();
      else if (this.activeTab === "categories") this.handleOpenCatModal();
      else this.handleOpenTableModal();
    },
    // --- Product Actions ---
    handleOpenProductModal(product = null) {
      if (this.categories.length === 0 && !product) {
        return appContext.showAlert("Diqqat", "Oldin toifa (kategoriya) qo'shishingiz kerak!", "error");
      }
      
      if (product) {
        this.editingProduct = product;
        this.name = product.name;
        this.price = product.price.toLocaleString("ru-RU").replace(/,/g, " ");
        this.categoryId = product.category_id || product.categoryId;
        this.image = product.image || "";

        const existingRec = this.recipes.find(r => String(r.product_id || r.productId) === String(product.id));
        if (existingRec && existingRec.ingredients && existingRec.ingredients.length > 0) {
          this.productRecipeItems = JSON.parse(JSON.stringify(existingRec.ingredients));
        } else {
          const isTobacco = product.name.toLowerCase().includes("kalyan") || product.name.toLowerCase().includes("qalyon");
          const defaultIng = this.ingredients.length > 0 ? this.ingredients[0].id : "";
          this.productRecipeItems = defaultIng ? [
            { ingredient_id: defaultIng, quantity: isTobacco ? 80 : 1, unit: isTobacco ? "g" : "pcs" }
          ] : [];
        }
      } else {
        this.editingProduct = null;
        this.name = "";
        this.price = "";
        this.image = "";
        if (this.categories.length > 0) this.categoryId = this.categories[0].id;

        if (this.isTashqiCategory) {
          this.productRecipeItems = [];
        } else {
          const defaultIng = this.ingredients.length > 0 ? this.ingredients[0].id : "";
          this.productRecipeItems = defaultIng ? [
            { ingredient_id: defaultIng, quantity: 80, unit: "g" }
          ] : [];
        }
      }
      this.isProductModalOpen = true;
    },
    addProductRecipeItem() {
      const defaultIng = this.ingredients.length > 0 ? this.ingredients[0].id : "";
      this.productRecipeItems.push({ ingredient_id: defaultIng, quantity: 80, unit: "g" });
    },
    removeProductRecipeItem(idx) {
      this.productRecipeItems.splice(idx, 1);
    },
    async handleSaveProduct() {
      if (!this.name || !this.name.trim()) {
        return appContext.showAlert("Ogohlantirish", "Iltimos, mahsulot nomini kiriting!", "warning");
      }
      const cleanPrice = String(this.price || "").replace(/\s/g, "");
      const numericPrice = Number(cleanPrice);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return appContext.showAlert("Ogohlantirish", "Iltimos, to'g'ri narx kiriting!", "warning");
      }
      try {
        const payload = { 
          branch_id: 1, 
          name: this.name.trim(), 
          price: numericPrice, 
          category_id: this.categoryId, 
          image: this.image 
        };
        let savedProd;
        if (this.editingProduct) {
          const res = await api.put(`/products/${this.editingProduct.id}`, payload);
          savedProd = res.data || this.editingProduct;
          appContext.showAlert("Muvaffaqiyatli", "Mahsulot va resept yangilandi");
        } else {
          const res = await api.post("/products", payload);
          savedProd = res.data;
          appContext.showAlert("Muvaffaqiyatli", "Yangi mahsulot va resept qo'shildi");
        }

        if (savedProd && savedProd.id && this.productRecipeItems) {
          const validItems = this.productRecipeItems.filter(i => i.ingredient_id && Number(i.quantity) > 0);
          if (validItems.length > 0) {
            await api.post("/recipes", {
              product_id: savedProd.id,
              ingredients: validItems
            });
          }
        }

        this.isProductModalOpen = false;
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Saqlashda xatolik yuz berdi", "error");
      }
    },
    handleDeleteProduct(id) {
      appContext.showConfirm("Mahsulotni o'chirish", "Haqiqatan ham o'chirmoqchimisiz?", async () => {
        try {
          await api.delete(`/products/${id}`);
          this.fetchData();
          appContext.showAlert("Muvaffaqiyatli", "Mahsulot o'chirildi");
        } catch (err) {
          console.error(err);
          appContext.showAlert("Xatolik", "O'chirishda xatolik yuz berdi", "error");
        }
      });
    },
    // --- Category Actions ---
    handleOpenCatModal(cat = null) {
      if (cat) {
        this.editingCat = cat;
        this.catName = cat.name;
      } else {
        this.editingCat = null;
        this.catName = "";
      }
      this.isCatModalOpen = true;
    },
    async handleSaveCat() {
      try {
        const payload = { branch_id: 1, name: this.catName };
        if (this.editingCat) {
          await api.put(`/categories/${this.editingCat.id}`, payload);
          appContext.showAlert("Muvaffaqiyatli", "Toifa yangilandi");
        } else {
          await api.post("/categories", payload);
          appContext.showAlert("Muvaffaqiyatli", "Yangi toifa qo'shildi");
        }
        this.isCatModalOpen = false;
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Saqlashda xatolik yuz berdi", "error");
      }
    },
    handleDeleteCat(id) {
      appContext.showConfirm(
        "Toifani o'chirish",
        "Haqiqatan ham o'chirmoqchimisiz? Agar unga ulangan mahsulotlar bo'lsa xatolik yuz berishi mumkin.",
        async () => {
          try {
            await api.delete(`/categories/${id}`);
            this.fetchData();
            appContext.showAlert("Muvaffaqiyatli", "Toifa o'chirildi");
          } catch (err) {
            console.error(err);
            appContext.showAlert("Xatolik", "Toifani o'chirishda xatolik. Unga ulangan mahsulotlar bor bo'lishi mumkin.", "error");
          }
        }
      );
    },
    formatTableTitle(table, idx) {
      if (!table) return "";
      const num = table.table_number || (idx !== undefined ? idx + 1 : table.id);
      const cleanStr = String(num).replace(/[-_]?stol$/i, "").trim();
      return cleanStr ? `${cleanStr}-stol` : `${idx !== undefined ? idx + 1 : 1}-stol`;
    },
    // --- Table Actions ---
    handleOpenTableModal(table = null) {
      if (table) {
        const idx = this.tables.indexOf(table);
        this.editingTable = table;
        this.tableNumber = table.table_number || (idx >= 0 ? idx + 1 : 1);
        this.tableSeats = table.seats || 4;
        this.tableStatus = table.status || "AVAILABLE";
        this.roomName = table.room_name || table.roomName || "Asosiy zal";
        this.vipPricePerHour = table.vip_price_per_hour || table.vipPricePerHour || 0;
      } else {
        this.editingTable = null;
        const nextNumber = this.tables.length > 0 
          ? Math.max(...this.tables.map((t, i) => Number(t.table_number || (i + 1)) || 0)) + 1 
          : 1;
        this.tableNumber = nextNumber ? String(nextNumber) : "1";
        this.tableSeats = 4;
        this.tableStatus = "AVAILABLE";
        this.roomName = "Asosiy zal";
        this.vipPricePerHour = 0;
      }
      this.isTableModalOpen = true;
    },
    async handleSaveTable() {
      try {
        const payload = { 
          branch_id: 1, 
          table_number: String(this.tableNumber).trim(), 
          seats: Number(this.tableSeats), 
          status: this.tableStatus,
          room_name: this.roomName,
          vip_price_per_hour: Number(this.vipPricePerHour)
        };
        if (this.editingTable) {
          await api.put(`/restaurant-tables/${this.editingTable.id}`, payload);
          appContext.showAlert("Muvaffaqiyatli", "Stol ma'lumotlari yangilandi");
        } else {
          await api.post("/restaurant-tables", payload);
          appContext.showAlert("Muvaffaqiyatli", "Yangi stol qo'shildi");
        }
        this.isTableModalOpen = false;
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Saqlashda xatolik yuz berdi", "error");
      }
    },
    handleDeleteTable(id) {
      const userRole = this.state?.role || (this.state?.currentUser && this.state.currentUser.role);
      const allowedRoles = ['SUPERADMIN', 'ADMIN', 'MANAGER'];
      if (userRole && !allowedRoles.includes(userRole)) {
        return appContext.showAlert("Ruxsat berilmadi", "Stollarni o'chirish faqat Admin yoki Manager uchun ruxsat etilgan!", "error");
      }

      const target = this.tables.find(t => t.id === id);
      if (target && target.status === 'OCCUPIED') {
        return appContext.showAlert("Diqqat", "Band (OCCUPIED) holatidagi stolni o'chirib bo'lmaydi! Avval stolni bo'shating.", "warning");
      }

      appContext.showConfirm("Stolni o'chirish", "Haqiqatan ham ushbu stolni o'chirmoqchimisiz? O'chirilganlar tarixiga saqlanadi.", async () => {
        try {
          if (target) {
            this.deletedTablesList.push({
              ...target,
              deleted_at: new Date().toLocaleString('uz-UZ'),
              deleted_by: this.state?.currentUser?.first_name || userRole || 'Foydalanuvchi'
            });
            localStorage.setItem('deleted_tables_history', JSON.stringify(this.deletedTablesList));
          }
          await api.delete(`/restaurant-tables/${id}`);
          this.fetchData();
          appContext.showAlert("Muvaffaqiyatli", "Stol o'chirildi va tarixga saqlandi");
        } catch (err) {
          console.error(err);
          appContext.showAlert("Xatolik", "Stolni o'chirishda xatolik yuz berdi", "error");
        }
      });
    },
    async handleRestoreTable(table) {
      try {
        await api.post('/restaurant-tables', {
          branch_id: table.branch_id || 1,
          table_number: table.table_number || 1,
          seats: table.seats || 4,
          status: 'AVAILABLE',
          room_name: table.room_name || 'Asosiy zal',
          vip_price_per_hour: table.vip_price_per_hour || 0
        });
        this.deletedTablesList = this.deletedTablesList.filter(t => t.id !== table.id);
        localStorage.setItem('deleted_tables_history', JSON.stringify(this.deletedTablesList));
        this.fetchData();
        appContext.showAlert("Muvaffaqiyatli", "Stol qayta tiklandi!");
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Stolni tiklashda xatolik", "error");
      }
    },
  },
};
</script>
