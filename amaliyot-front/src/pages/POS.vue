<template>
  <div class="flex flex-col md:flex-row h-full gap-4 md:gap-5 relative">
    <!-- Left panel (Menu Grid OR Table Layout) -->
    <template v-if="selectedTable">
      <!-- --- MENU GRID VIEW --- -->
      <div class="flex-1 bg-[#181b25] border border-[#2a2e3d] rounded-2xl p-4 md:p-5 overflow-hidden flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between border-b border-[#2a2e3d] pb-3 shrink-0 gap-3">
          <div class="flex items-center gap-3">
            <button 
              @click="goBackToTables"
              class="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white bg-[#1e2230] border border-[#2a2e3d] px-3 py-2 rounded-lg transition-colors font-medium cursor-pointer"
            >
              <ArrowLeft class="h-3.5 w-3.5" /> Orqaga (Stollar)
            </button>
            <div>
              <h2 class="text-base font-bold text-white flex items-center gap-2">
                {{ selectedTable.room_name || "Asosiy zal" }} <span class="text-[#3b82f6]">/</span> {{ selectedTable.table_number ? `${selectedTable.table_number}-stol` : selectedTable.id }}
              </h2>
              <p class="text-[11px] text-[#94a3b8]">
                Sig'imi: {{ selectedTable.seats || 4 }} kishilik | Holati: {{ selectedTable.status === "OCCUPIED" ? "Band" : "Bo'sh" }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Compact View Toggle -->
            <button 
              @click="toggleCompactMode" 
              :class="[
                'px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                compactCardsMode ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' : 'bg-[#1e2230] text-[#94a3b8] border-[#2a2e3d] hover:text-white'
              ]"
              :title="compactCardsMode ? 'Katta kartalarga o\'tish' : 'Ixcham kartalarga o\'tish'"
            >
              <Maximize2 v-if="compactCardsMode" class="h-3.5 w-3.5" />
              <Minimize2 v-else class="h-3.5 w-3.5" />
              <span>{{ compactCardsMode ? 'Katta' : 'Ixcham' }}</span>
            </button>

            <!-- UI Scale Selector -->
            <div class="flex bg-[#1e2230] border border-[#2a2e3d] rounded-lg p-0.5 text-xs">
              <button 
                v-for="scaleVal in [0.75, 0.85, 0.95, 1.0]"
                :key="scaleVal"
                @click="changeScale(scaleVal)"
                :class="[
                  'px-1.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors',
                  (state.uiScale || 1.0) === scaleVal ? 'bg-blue-600 text-white' : 'text-[#94a3b8] hover:text-white'
                ]"
              >
                {{ Math.round(scaleVal * 100) }}%
              </button>
            </div>

            <!-- Search food input -->
            <div class="relative w-40 sm:w-48 md:w-56">
              <Search class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#94a3b8]" />
              <input 
                type="text" 
                placeholder="Taom qidirish..." 
                v-model="searchQuery"
                class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>
        </div>

        <!-- Menu categories tabs — premium pill buttons -->
        <div class="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
          <div class="flex gap-1.5 overflow-x-auto scrollbar-none">
            <button 
              @click="selectedCategory = 'ALL'"
              :class="[
                'px-3.5 py-1 text-xs font-bold rounded-full border transition-all duration-200 whitespace-nowrap cursor-pointer',
                selectedCategory === 'ALL' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30' 
                  : 'bg-[#1e2230] text-[#94a3b8] border-[#2a2e3d] hover:text-white hover:border-[#3b4054]'
              ]"
            >
              🍽️ Barchasi
            </button>
            <button 
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id"
              :class="[
                'px-3.5 py-1 text-xs font-bold rounded-full border transition-all duration-200 whitespace-nowrap cursor-pointer',
                selectedCategory === cat.id 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30' 
                  : 'bg-[#1e2230] text-[#94a3b8] border-[#2a2e3d] hover:text-white hover:border-[#3b4054]'
              ]"
            >
              {{ cat.name }}
            </button>
          </div>
          <button 
            @click="isCustomItemModalOpen = true"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer shadow-md shrink-0 active:scale-95 whitespace-nowrap"
          >
            <Plus class="h-3.5 w-3.5 text-purple-400" /> ⚡ Erkin Mahsulot
          </button>
        </div>

        <!-- Products grid — Responsive POS Cards -->
        <div class="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 md:gap-3 overflow-y-auto content-start pb-4 pr-1">
          <div 
            v-for="(p, idx) in filteredProducts"
            :key="p.id"
            :class="[
              'relative bg-[#1a1d28] border rounded-2xl overflow-hidden shadow-lg flex flex-col group cursor-pointer transition-all duration-300',
              hasCartItem(p.id) 
                ? 'border-blue-500/70 shadow-blue-500/20 shadow-xl' 
                : 'border-[#2a2e3d] hover:border-[#3b82f6]/50 hover:shadow-xl hover:shadow-blue-500/10'
            ]"
            @click="addToCart(p)"
          >
            <!-- IMAGE AREA -->
            <div :class="['relative w-full shrink-0 overflow-hidden bg-gradient-to-br transition-all', compactCardsMode ? 'h-16 md:h-20' : 'h-24 sm:h-28 md:h-32', getCategoryGradient(idx)]">
              <!-- Real image -->
              <img
                v-if="p.image"
                :src="p.image"
                :alt="p.name"
                class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                @error="imageLoadError"
              />
              <!-- Emoji fallback -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span :class="compactCardsMode ? 'text-3xl opacity-20 select-none' : 'text-4xl opacity-20 select-none'">{{ getCategoryEmoji(idx) }}</span>
              </div>
              <!-- Dark overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

              <!-- Cart badge -->
              <div v-if="hasCartItem(p.id)" class="absolute top-2 right-2 bg-blue-600 text-white font-black text-[11px] min-w-[26px] h-[26px] px-1.5 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/60 border-2 border-[#1a1d28] z-20">
                {{ getCartItemQty(p.id) }}
              </div>

              <!-- Category name badge -->
              <div v-if="getProductCategoryName(p)" class="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm text-[9px] font-bold text-white/90 z-10 border border-white/10">
                {{ getProductCategoryName(p) }}
              </div>

              <!-- Product label + price bottom details -->
              <div class="absolute bottom-0 left-0 right-0 px-3 py-2.5 z-10">
                <h4 class="text-sm font-bold text-white truncate leading-tight drop-shadow-lg">
                  {{ p.name }}
                </h4>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-base font-black text-white drop-shadow-lg">
                    {{ formatNumber(p.price) }}
                    <span class="text-xs font-medium text-white/70 ml-1">so'm</span>
                  </span>
                  
                  <!-- Add / Qty controls -->
                  <div 
                    v-if="hasCartItem(p.id)"
                    class="flex items-center gap-1 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl px-1 py-0.5"
                    @click.stop
                  >
                    <button 
                      @click="updateQty(p.id, -1)"
                      class="w-6 h-6 rounded-lg bg-red-500/30 hover:bg-red-500/60 text-red-300 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus class="h-3 w-3" />
                    </button>
                    <span class="text-sm font-black text-white w-5 text-center">{{ getCartItemQty(p.id) }}</span>
                    <button 
                      @click="addToCart(p)"
                      class="w-6 h-6 rounded-lg bg-blue-500/30 hover:bg-blue-500/60 text-blue-300 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus class="h-3 w-3" />
                    </button>
                  </div>
                  <div 
                    v-else
                    class="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-110 active:scale-95 transition-transform border border-white/20 cursor-pointer"
                    @click.stop="addToCart(p)"
                  >
                    <Plus class="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="filteredProducts.length === 0" class="col-span-full py-16 text-center text-[#94a3b8] text-sm flex flex-col items-center gap-3">
            <Utensils class="h-10 w-10 opacity-20" />
            Hech qanday mahsulot topilmadi.
          </div>
        </div>
      </div>
    </template>
    
    <template v-else>
      <!-- --- TABLES LAYOUT VIEW --- -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
          <div>
            <h1 class="text-2xl font-bold text-white">Xush kelibsiz!</h1>
            <p class="text-[#94a3b8] text-xs md:text-sm mt-1">Stolni tanlang yoki vaqtinchalik buyurtma yarating</p>
          </div>
          <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button 
              v-if="isPrivileged"
              @click="handleOpenTableModal()"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2.5 rounded-xl transition-colors text-xs md:text-sm font-bold shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus class="h-4 w-4" />
              Yangi Stol
            </button>
            <select class="flex-1 md:flex-none bg-[#1e2230] border border-[#2a2e3d] text-xs md:text-sm rounded-xl px-4 py-2.5 outline-none text-white cursor-pointer">
              <option>Barcha zallar</option>
            </select>
            <div class="flex bg-[#1e2230] border border-[#2a2e3d] rounded-xl p-1 shrink-0">
              <button 
                @click="viewMode = 'grid'"
                :class="['p-1.5 rounded-lg transition-colors cursor-pointer', viewMode === 'grid' ? 'bg-[#2a2e3d] text-white' : 'text-[#94a3b8] hover:text-white']"
              >
                <Grid class="h-4 w-4" />
              </button>
              <button 
                @click="viewMode = 'list'"
                :class="['p-1.5 rounded-lg transition-colors cursor-pointer', viewMode === 'list' ? 'bg-[#2a2e3d] text-white' : 'text-[#94a3b8] hover:text-white']"
              >
                <Menu class="h-4 w-4" />
              </button>
            </div>
            <button @click="isNotificationModalOpen = true" class="relative p-2.5 bg-[#1e2230] border border-[#2a2e3d] rounded-xl text-[#94a3b8] hover:text-white cursor-pointer shrink-0 transition-colors">
              <Bell class="h-4.5 w-4.5 text-blue-400" />
              <span v-if="unreadNotificationsCount > 0" class="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">{{ unreadNotificationsCount }}</span>
            </button>
          </div>
        </div>

        <!-- Stats Overview Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 shrink-0">
          <div class="bg-[#1e2230] border border-[#2a2e3d] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p class="text-xs text-[#94a3b8] font-medium">Barcha stollar</p>
              <p class="text-base font-bold text-white mt-1">{{ tables.length }} ta</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Grid class="w-4.5 h-4.5" />
            </div>
          </div>
          <div class="bg-[#1e2230] border border-[#2a2e3d] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p class="text-xs text-[#94a3b8] font-medium">Bo'sh stollar</p>
              <p class="text-base font-bold text-green-400 mt-1">{{ tables.filter(t => t.status === 'AVAILABLE').length }} ta</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
              <span class="w-2 h-2 rounded-full bg-[#34a853]"></span>
            </div>
          </div>
          <div class="bg-[#1e2230] border border-[#2a2e3d] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p class="text-xs text-[#94a3b8] font-medium">Band stollar</p>
              <p class="text-base font-bold text-red-400 mt-1">{{ tables.filter(t => t.status === 'OCCUPIED').length }} ta</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <span class="w-2 h-2 rounded-full bg-[#ea4335]"></span>
            </div>
          </div>
          <div class="bg-[#1e2230] border border-[#2a2e3d] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p class="text-xs text-[#94a3b8] font-medium">Bron qilingan</p>
              <p class="text-base font-bold text-yellow-400 mt-1">{{ tables.filter(t => t.status === 'RESERVED').length }} ta</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
              <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mb-4 overflow-x-auto">
          <button 
            v-for="tab in zallar"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 border whitespace-nowrap cursor-pointer',
              activeTab === tab 
                ? 'bg-white/10 backdrop-blur-sm text-white border-white/30 shadow-lg' 
                : 'bg-transparent text-white/60 border-white/10 hover:text-white hover:bg-white/5'
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Restaurant Floor Map - Premium Ambient Background -->
        <div class="flex-1 relative rounded-2xl overflow-hidden shadow-2xl" style="min-height: 420px">
          <!-- Background image layer -->
          <div class="absolute inset-0">
            <img 
              v-if="activeTab === 'Asosiy zal'"
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80" 
              alt="Asosiy zal"
              class="w-full h-full object-cover"
            />
            <img 
              v-else-if="activeTab === 'Terrasa'"
              src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1400&q=80" 
              alt="Terrasa"
              class="w-full h-full object-cover"
            />
            <img 
              v-else-if="activeTab === 'VIP zona' || activeTab === 'VIP zal'"
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=80" 
              alt="VIP zona"
              class="w-full h-full object-cover"
            />
            <img 
              v-else-if="activeTab === 'Kabina'"
              src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1400&q=80" 
              alt="Kabina"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-[#1a1d28] to-[#0d0f18]" />
            <!-- Gradient Overlay -->
            <div class="absolute inset-0" :class="(activeTab === 'VIP zona' || activeTab === 'VIP zal') ? 'bg-gradient-to-b from-[#1a0a00]/70 via-[#0d0600]/50 to-[#1a0a00]/85' : 'bg-gradient-to-b from-[#0d1117]/70 via-[#0d1117]/50 to-[#0d1117]/80'" />
          </div>

          <!-- Floor grid overlay -->
          <div 
            class="absolute inset-0 opacity-10 z-[1]"
            style="background-image: linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px); background-size: 60px 60px"
          />

          <!-- Room name tag -->
          <div class="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2">
            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span class="text-white font-bold text-sm">{{ activeTab }}</span>
            <span class="text-white/50 text-xs ml-1">{{ filteredTables.length }} ta stol</span>
          </div>

          <!-- Tables mapping container -->
          <div class="relative z-10 w-full h-full flex flex-col p-6 pt-14">
            <div v-if="loading" class="flex-1 flex justify-center items-center">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white/60"></div>
            </div>
            
            <div v-else-if="filteredTables.length === 0" class="flex-1 flex flex-col justify-center items-center space-y-4">
              <div class="text-white/60 text-lg bg-black/30 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10">
                Ushbu zalda hali stollar mavjud emas
              </div>
              <button v-if="isPrivileged" @click="handleOpenTableModal()" class="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
                + Yangi Stol Yaratish
              </button>
            </div>

            <!-- List View -->
            <div v-else-if="viewMode === 'list'" class="flex-1 overflow-y-auto w-full">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-white/60 uppercase bg-black/40 backdrop-blur-sm border-b border-white/10">
                  <tr>
                    <th class="px-6 py-4 font-medium">Stol</th>
                    <th class="px-6 py-4 font-medium">Sig'imi</th>
                    <th class="px-6 py-4 font-medium">Holati</th>
                    <th class="px-6 py-4 font-medium">Zal</th>
                    <th class="px-6 py-4 font-medium">Soatlik VIP Narxi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="t in filteredTables"
                    :key="t.id"
                    @click="selectedTable = t"
                    :class="[
                      'border-b border-white/10 cursor-pointer transition-colors',
                      selectedTable?.id === t.id ? 'bg-blue-500/20 text-white' : 'bg-black/20 hover:bg-black/40 text-white/80'
                    ]"
                  >
                    <td class="px-6 py-4 font-bold">{{ t.table_number ? `${t.table_number}-stol` : t.id }}</td>
                    <td class="px-6 py-4">{{ t.seats || 4 }} kishilik</td>
                    <td class="px-6 py-4 font-medium">
                      <span v-if="getTableSessionsCount(t.id) > 1" class="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-black shadow-sm">
                        🟣 Band ({{ getTableSessionsCount(t.id) }} ta seans)
                      </span>
                      <span v-else-if="t.status === 'AVAILABLE'" class="text-green-400 font-bold">Bo'sh</span>
                      <span v-else-if="t.status === 'OCCUPIED'" class="text-red-400 font-bold">Band</span>
                      <span v-else-if="t.status === 'RESERVED'" class="text-yellow-400 font-bold">Bron</span>
                    </td>
                    <td class="px-6 py-4 text-white/50">{{ t.room_name || "Asosiy zal" }}</td>
                    <td class="px-6 py-4">
                      {{ t.vip_price_per_hour && t.vip_price_per_hour > 0 ? `${formatNumber(t.vip_price_per_hour)} so'm` : "-" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Grid View -->
            <div v-else class="flex-1 flex flex-wrap gap-6 justify-center items-center content-center">
              <button 
                v-for="t in filteredTables"
                :key="t.id"
                @click="selectedTable = t"
                :class="[
                  'flex items-center justify-center p-2 rounded-xl transition-all relative cursor-pointer hover:scale-105 active:scale-95',
                  t.seats <= 2 ? 'w-24 h-24' :
                  t.seats <= 4 ? 'w-28 h-28' :
                  t.seats <= 6 ? 'w-32 h-28' :
                  t.seats <= 8 ? 'w-36 h-28' :
                  'w-44 h-28',
                  selectedTable?.id === t.id ? 'drop-shadow-[0_0_20px_rgba(59,130,246,0.9)]' : ''
                ]"
              >
                <TableIcon 
                  :seats="t.seats || 4" 
                  :tableNumber="t.table_number || t.id" 
                  :status="getTableDisplayStatus(t)" 
                  :isSelected="!!(selectedTable && selectedTable.id === t.id)" 
                />
                <span v-if="t.vip_price_per_hour > 0" class="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-blue-600/90 border border-blue-400 text-[8px] font-extrabold text-white z-20 shadow-md">
                  🏷️ {{ formatNumber(t.vip_price_per_hour) }} so'm/s
                </span>
                <span v-if="getTableSessionsCount(t) > 1" class="absolute bottom-0 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-purple-600/90 text-[8px] font-black tracking-wider text-white uppercase z-20 shadow-lg border border-purple-400 animate-pulse whitespace-nowrap">
                  ⚡ {{ getTableSessionsCount(t) }} SEANS
                </span>
                <span v-else-if="getTableDisplayStatus(t) === 'OCCUPIED'" class="absolute bottom-0 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-500/90 text-[8px] font-bold tracking-widest text-white uppercase z-20 shadow-lg">Band</span>
                <span v-else-if="getTableDisplayStatus(t) === 'RESERVED'" class="absolute bottom-0 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-yellow-500/90 text-[8px] font-bold tracking-widest text-white uppercase z-20 shadow-lg">Bron</span>
              </button>
            </div>

            <!-- Legend markers -->
            <div class="flex flex-wrap gap-5 pt-4 mt-2 border-t border-white/10 z-10 shrink-0">
              <div class="flex items-center gap-2 text-xs text-white/60"><span class="w-2.5 h-2.5 rounded-full bg-[#34a853]"></span> Bo'sh</div>
              <div class="flex items-center gap-2 text-xs text-white/60"><span class="w-2.5 h-2.5 rounded-full bg-[#ea4335]"></span> Band (1 seans)</div>
              <div class="flex items-center gap-2 text-xs font-bold text-purple-300"><span class="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span> 🟣 Ko'p seansli (2+ seanslar)</div>
              <div class="flex items-center gap-2 text-xs text-white/60"><span class="w-2.5 h-2.5 rounded-full bg-[#fbbc05]"></span> Bron</div>
              <div class="flex items-center gap-2 text-xs text-white/60"><span class="w-2.5 h-2.5 rounded-full bg-[#4285f4]"></span> Tanlangan</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Mobile Cart Backdrop -->
    <transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isMobileCartOpen" 
        @click="isMobileCartOpen = false"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
      ></div>
    </transition>

    <!-- Floating Mobile Cart Button -->
    <div 
      v-if="selectedTable"
      @click="isMobileCartOpen = true"
      class="fixed bottom-6 right-6 z-30 md:hidden flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 border border-white/20 cursor-pointer active:scale-95 transition-transform animate-bounce"
    >
      <span class="relative">
        <ShoppingCart class="h-6 w-6 text-white" />
        <!-- Cart count badge -->
        <span 
          v-if="cart.length > 0 || (selectedTable?.status === 'OCCUPIED' && currentOccupiedOrder)"
          class="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#181b25] shadow"
        >
          {{ cart.length || (currentOccupiedOrder?.order_items ? currentOccupiedOrder.order_items.length : 0) }}
        </span>
      </span>
    </div>

    <!-- Right Sidebar (Order Compilation & Operations) -->
    <div 
      :class="[
        'fixed md:static inset-y-0 right-0 z-50 w-full md:w-72 xl:w-[320px] bg-[#181b25] border-l border-[#2a2e3d] md:border md:rounded-2xl flex flex-col shadow-2xl md:shadow-lg overflow-hidden shrink-0 text-white transition-all duration-300 transform',
        isMobileCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Mobile Close Cart Header -->
      <div class="flex justify-between items-center p-4 bg-[#14161e] border-b border-[#2a2e3d] md:hidden">
        <span class="text-sm font-bold text-white uppercase tracking-wider">Stol Buyurtmasi</span>
        <button @click="isMobileCartOpen = false" class="p-1.5 bg-[#2a2e3d] text-[#94a3b8] hover:text-white rounded-lg cursor-pointer">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="p-5 border-b border-[#2a2e3d] shrink-0">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold">{{ selectedTable ? (selectedTable.table_number ? `Stol ${selectedTable.table_number}` : selectedTable.id) : '-' }}</h2>
            <span v-if="selectedTable" class="px-2 py-0.5 bg-[#2a2e3d] text-xs text-[#94a3b8] rounded-md border border-[#3b4054]">{{ selectedTable.seats || 4 }} kishilik</span>
          </div>
          <div v-if="selectedTable" class="flex items-center gap-1.5">
            <button v-if="isPrivileged" @click="handleOpenTableModal(selectedTable)" title="Stolni tahrirlash" class="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"><Edit class="h-4 w-4" /></button>
            <button v-if="isPrivileged" @click="handleDeleteTable(selectedTable.id)" title="Stolni o'chirish" class="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"><Trash2 class="h-4 w-4" /></button>
          </div>
        </div>
        
        <div v-if="selectedTable && !isTableOccupied(selectedTable)" class="mb-4">
          <label class="text-xs text-[#94a3b8] font-medium block mb-1">Mijoz (Ixtiyoriy):</label>
          <select 
            v-model="selectedCustomerId" 
            class="w-full bg-[#181b25] border border-[#2a2e3d] rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option :value="null">Umumiy (Mijozsiz)</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }} ({{ c.phone }})</option>
          </select>
        </div>

        <div class="flex gap-6 border-b border-[#2a2e3d] pb-0">
          <button class="pb-3 text-sm font-medium text-[#3b82f6] border-b-2 border-[#3b82f6]">Buyurtma</button>
        </div>
      </div>
      <!-- Session Navigator -->
      <div v-if="isTableOccupied(selectedTable)" class="bg-[#1e2230] border-b border-[#2a2e3d] p-3 shrink-0 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black text-blue-400 uppercase tracking-wider">Faol sessiyalar</span>
          <button 
            @click="handleCreateSession"
            class="text-[9px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded transition-colors cursor-pointer"
          >
            + Yangi Sessiya
          </button>
        </div>
        <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div 
            v-for="s in currentTableSessions" 
            :key="s.id"
            :class="[
              'px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5',
              currentOccupiedOrder?.id === s.id 
                ? 'bg-blue-600 border-transparent text-white shadow-md' 
                : 'bg-[#181b25] border-[#2a2e3d] text-[#94a3b8] hover:text-white'
            ]"
          >
            <button @click="selectedSessionId = s.id" class="inline-flex items-center gap-1.5 cursor-pointer">
              <Folder class="h-3 w-3 inline" /> {{ s.session_name || `Sessiya #${s.session_number}` }}
            </button>
            <button 
              @click.stop="handleDeleteSession(s)" 
              title="Ushbu sessiyani o'chirish / bekor qilish"
              class="text-red-400 hover:text-red-200 p-0.5 rounded hover:bg-red-500/20 cursor-pointer ml-1 border border-red-500/20"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- Active order list or draft cart list -->
      <div v-if="isTableOccupied(selectedTable) && !currentOccupiedOrder && cart.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed border-red-500/20 rounded-2xl m-5 bg-red-500/5">
        <ShieldAlert class="h-10 w-10 mb-3 text-red-500 opacity-60" />
        <p class="text-sm font-bold text-red-400">Ruxsat etilmagan stol</p>
        <p class="text-xs text-[#94a3b8] mt-2">Ushbu stolda hozircha faol sessiya yo'q yoki sizga ruxsat etilmagan.</p>
      </div>
      <div v-else-if="currentOccupiedOrder" class="flex-1 overflow-y-auto p-5 space-y-4 bg-red-500/5">
        <div class="flex items-center justify-between mb-2 pb-2 border-b border-red-500/20">
          <div class="flex items-center gap-2">
            <p class="text-sm font-bold text-red-400">FAOL BUYURTMA</p>
          </div>
          <span class="text-xs font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded">{{ getOrderDisplayId(currentOccupiedOrder) }}</span>
        </div>
        <div v-if="displayCartItems.length === 0" class="py-8 text-center text-xs text-[#94a3b8] italic">
          Ushbu buyurtmada hali taomlar ro'yxati mavjud emas
        </div>
        <div v-for="(item, idx) in displayCartItems" :key="item.productId || idx" class="flex gap-3 items-center">
          <div class="w-10 h-10 rounded-lg bg-[#1e2230] flex items-center justify-center border border-[#2a2e3d] overflow-hidden shrink-0">
            <img v-if="getProductImage(item.productId)" :src="getProductImage(item.productId)" class="w-full h-full object-cover" />
            <Utensils v-else class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <p :class="['text-sm font-semibold truncate text-white', item.qty === 0 ? 'line-through opacity-40' : '']">
              {{ item.name }}
            </p>
            <p class="text-xs text-[#94a3b8]">
              {{ formatNumber(item.price) }} x {{ item.qty }}
              <span v-if="item.qty > item.originalQty" class="text-[9px] bg-green-500/20 text-green-400 px-1 py-0.2 rounded font-bold ml-1">+ Yangi</span>
              <span v-else-if="item.qty > 0 && item.qty < item.originalQty" class="text-[9px] bg-orange-500/20 text-orange-400 px-1 py-0.2 rounded font-bold ml-1">- Kamaydi</span>
              <span v-else-if="item.qty === 0" class="text-[9px] bg-red-500/20 text-red-400 px-1 py-0.2 rounded font-bold ml-1">Bekor qilindi</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center bg-[#1e2230] rounded-lg p-0.5 border border-[#2a2e3d]">
              <button @click="updateQty(item.productId, -1)" class="p-1 text-[#94a3b8] hover:text-white cursor-pointer"><Minus class="h-2.5 w-2.5" /></button>
              <span class="w-5 text-center text-xs font-semibold text-white">{{ item.qty }}</span>
              <button @click="updateQty(item.productId, 1)" class="p-1 text-[#94a3b8] hover:text-white cursor-pointer"><Plus class="h-2.5 w-2.5" /></button>
            </div>
            <button @click="removeFromCart(item.productId)" class="p-1 text-red-400 hover:bg-red-500/10 rounded cursor-pointer"><Trash2 class="h-3.5 w-3.5" /></button>
          </div>
        </div>

        <!-- Live Timer Info Box (Only when timer is active) -->
        <div v-if="vipCalc && isTableOccupied(selectedTable)" class="mt-4 p-4 bg-[#1e2230] border border-[#2a2e3d] rounded-2xl space-y-3 shadow-md">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⏱️</span> {{ selectedTable?.room_name === 'Kabina' ? 'Kabina Hisoblagichi' : 'Soatlik Vaqt Hisoblagichi' }}
            </p>
            <span class="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Faol
            </span>
          </div>

          <div class="flex justify-between text-xs text-[#94a3b8]">
            <span>Boshlangan vaqti:</span>
            <span class="font-semibold text-white">{{ vipCalc.startTime }}</span>
          </div>
          <div class="flex justify-between text-xs text-[#94a3b8]">
            <span>O'tgan vaqt:</span>
            <span class="font-semibold text-white">{{ vipCalc.duration }}</span>
          </div>
          <div class="flex justify-between text-xs text-[#94a3b8]">
            <span>Soatlik tarif:</span>
            <span class="font-semibold text-white">{{ formatNumber(vipCalc.hourlyRate) }} so'm</span>
          </div>
          <div class="flex justify-between text-sm font-bold border-t border-[#2a2e3d] pt-2 text-amber-400">
            <span>{{ selectedTable?.room_name === 'Kabina' ? "Kabina to'lovi:" : "Soatlik vaqt to'lovi:" }}</span>
            <span>{{ formatNumber(vipCalc.vipFee) }} so'm</span>
          </div>
        </div>
      </div>
      <div v-else class="flex-1 overflow-y-auto p-5 space-y-4">
        <div v-for="item in cart" :key="item.productId" class="flex gap-3 items-center">
          <div class="w-12 h-12 rounded-lg bg-[#2a2e3d] overflow-hidden shrink-0 border border-[#3b4054]">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-xs text-[#94a3b8]">Yo'q</div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold truncate text-white">{{ item.name }}</h4>
            <p class="text-xs text-[#94a3b8] mt-0.5">{{ formatNumber(item.price) }} so'm</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center bg-[#1e2230] rounded-lg p-0.5 border border-[#2a2e3d]">
              <button @click="updateQty(item.productId, -1)" class="p-1 text-[#94a3b8] hover:text-white cursor-pointer"><Minus class="h-3 w-3" /></button>
              <span class="w-6 text-center text-sm font-medium">{{ item.qty }}</span>
              <button @click="addToCart(item)" class="p-1 text-[#94a3b8] hover:text-white cursor-pointer"><Plus class="h-3 w-3" /></button>
            </div>
            <button @click="removeFromCart(item.productId)" class="p-1.5 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors cursor-pointer"><Trash2 class="h-4 w-4" /></button>
          </div>
        </div>

        <button 
          v-if="cart.length > 0"
          @click="clearCurrentCart"
          class="w-full py-3 mt-4 text-sm font-medium text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-lg transition-colors border border-dashed border-[#3b82f6]/30 flex justify-center items-center gap-2 cursor-pointer"
        >
          Tozalash
        </button>
      </div>

      <!-- Checkout Actions / Footer -->
      <div class="p-5 bg-[#14161e] border-t border-[#2a2e3d] shrink-0">
        <div v-if="currentOccupiedOrder">
          <div v-if="vipCalc" class="mb-2 flex justify-between text-xs text-[#94a3b8] px-1">
            <span>Taomlar jami:</span>
            <span>{{ formatNumber(currentOccupiedOrder.total_amount) }} so'm</span>
          </div>
          <div class="flex justify-between items-center mb-4 bg-[#ea4335]/10 p-4 rounded-xl border border-[#ea4335]/20">
            <span class="font-bold text-red-400">Jami hisob:</span>
            <span class="text-xl font-bold text-white">{{ formatNumber(finalOccupiedAmount) }} so'm</span>
          </div>
          <div class="flex flex-col gap-2">
            <div v-if="hasEditChanges" class="space-y-2">
              <div class="mb-2">
                <label class="block text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mb-1">O'zgartirish sababi:</label>
                <input 
                  type="text" 
                  v-model="editReason"
                  placeholder="Masalan: Mijoz fikridan qaytdi"
                  class="w-full bg-[#1e2230] border border-[#2a2e3d] text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  @click="initEditModeCart"
                  class="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 transition-colors cursor-pointer"
                >
                  Bekor Qilish
                </button>
                <button 
                  @click="saveOrderEdits"
                  class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </div>
            <div v-else class="space-y-2">
              <button 
                @click="isCheckModalOpen = true"
                class="w-full py-3 bg-[#34a853] hover:bg-[#2e944b] text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-lg shadow-green-500/20 cursor-pointer"
              >
                <Receipt class="h-5 w-5" /> Stolni Yopish (To'lov)
              </button>

              <div class="grid grid-cols-2 gap-2">
                <button 
                  @click="openMergeTablesModal"
                  class="py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold border border-amber-500/20 transition-colors flex justify-center items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Link class="h-4 w-4" /> Birlashtirish
                  <span v-if="selectedMergeTableIds.length > 0" class="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    +{{ selectedMergeTableIds.length }}
                  </span>
                </button>
                <button 
                  @click="openTransferTableModal"
                  class="py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-xs font-bold border border-blue-500/20 transition-colors flex justify-center items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowLeft class="h-4 w-4 rotate-180 text-blue-400" /> Ko'chirish
                </button>
              </div>

              <!-- Prominent Timer Start / Stop Action Button -->
              <button 
                @click="isTimerActive ? stopVipTimer() : startVipTimer()"
                :class="[
                  'w-full py-2.5 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-2 cursor-pointer shadow-md border mb-2',
                  isTimerActive ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/40 animate-pulse' : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/40'
                ]"
              >
                <component :is="isTimerActive ? 'Square' : 'Play'" class="h-3.5 w-3.5 fill-current" />
                <span>{{ isTimerActive ? 'Vaqtni to\'xtatish' : 'Vaqtni boshlash' }}</span>
              </button>

              <div class="grid grid-cols-2 gap-2">
                <button 
                  @click="toggleTableFreeze"
                  class="py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-xs font-bold border border-blue-500/20 transition-colors flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert class="h-3.5 w-3.5" /> {{ selectedTable?.status === 'FROZEN' ? "Yechish" : "Muzlatish" }}
                </button>
                <button 
                  @click="handleCancelOrder"
                  class="py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-semibold transition-colors flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <AlertOctagon class="h-3.5 w-3.5" /> Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="selectedTable?.status === 'RESERVED'">
          <!-- Reservation card info -->
          <div class="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 mb-2 text-white">
            <div class="flex items-center gap-2 mb-2">
              <Calendar class="h-4 w-4 text-yellow-400" />
              <p class="text-sm font-bold text-yellow-400">Stol Bron Qilingan</p>
            </div>
            <div v-if="reservationData[selectedTable.id]" class="space-y-1 text-xs text-white">
              <div v-if="reservationData[selectedTable.id].name" class="flex justify-between">
                <span class="text-[#94a3b8]">Mijoz:</span>
                <span class="font-semibold text-white">{{ reservationData[selectedTable.id].name }}</span>
              </div>
              <div v-if="reservationData[selectedTable.id].phone" class="flex justify-between">
                <span class="text-[#94a3b8]">Telefon:</span>
                <span class="font-semibold text-white">{{ reservationData[selectedTable.id].phone }}</span>
              </div>
              <div v-if="reservationData[selectedTable.id].time" class="flex justify-between">
                <span class="text-[#94a3b8]">Kelish vaqti:</span>
                <span class="font-bold text-yellow-300">{{ reservationData[selectedTable.id].time }}</span>
              </div>
              <div v-if="reservationData[selectedTable.id].note" class="mt-2 p-2 rounded-lg bg-[#1e2230] text-[#94a3b8]">{{ reservationData[selectedTable.id].note }}</div>
            </div>
            <p v-else class="text-xs text-[#94a3b8] mt-1">Mijoz tashrif buyurishini kutmoqda</p>
          </div>
          <!-- Info box -->
          <div class="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
            <svg class="h-4 w-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p class="text-xs text-green-400 font-semibold">Bron vaqtida hech qanday pul olinmaydi. To'lov faqat mijoz kelgandan keyin olinadi.</p>
          </div>
          <button 
            @click="clientArrived"
            class="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users class="h-4 w-4" /> Mijoz keldi — Buyurtma
          </button>
          <button 
            @click="cancelReservation"
            class="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <X class="h-4 w-4" /> Mijoz kelmadi — Bekor qilish
          </button>
        </div>

        <div v-else>
          <div class="flex justify-between items-center mb-4 bg-[#1e2230] p-4 rounded-xl border border-[#2a2e3d]">
            <span class="font-bold text-[#94a3b8]">Jami:</span>
            <span class="text-xl font-bold text-white">{{ formatNumber(totalAmount) }} so'm</span>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-3">
            <button 
              @click="openReservationForm"
              class="py-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-xl font-medium transition-colors border border-yellow-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar class="h-4 w-4" /> Bron Qilish
            </button>
            <button @click="handleSendOrder" class="py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Session Modal -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isCreateSessionModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]">
          <h3 class="font-bold text-white">Yangi Sessiya Ochish</h3>
          <button @click="isCreateSessionModalOpen = false" class="text-[#94a3b8] hover:text-white p-1 bg-[#2a2e3d] rounded-lg cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>
        <form @submit.prevent="submitCreateSession" class="p-6 space-y-5">
          <div>
            <label class="block text-xs text-[#94a3b8] font-medium mb-1.5">Sessiya nomi</label>
            <input 
              type="text" 
              required 
              v-model="newSessionName" 
              placeholder="Masalan: Sessiya #2"
              class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div class="flex gap-3">
            <button type="button" @click="isCreateSessionModalOpen = false" class="flex-1 py-2.5 bg-[#1e2230] hover:bg-[#2a2e3d] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">Bekor qilish</button>
            <button type="submit" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg cursor-pointer">Ochish</button>
          </div>
        </form>
      </div>
    </div>
  </transition>

  <!-- Table Modal for POS -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isTableModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]">
          <h3 class="font-bold text-white">{{ editingTable ? "Stolni tahrirlash" : "Yangi stol qo'shish" }}</h3>
          <button @click="isTableModalOpen = false" class="text-muted-foreground hover:text-white p-1 bg-[#2a2e3d] rounded-lg cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>
        <form @submit.prevent="handleSaveTable" class="p-6 space-y-5">
          <div>
            <label class="block text-xs text-[#94a3b8] font-medium mb-1.5">Stol raqami (masalan: K1, C1, VIP1, 5)</label>
            <input 
              type="text" 
              required 
              v-model="tableNumber" 
              placeholder="Masalan: K1, C1, 5"
              class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div>
            <label class="block text-xs text-[#94a3b8] font-medium mb-1.5">Sig'imi (o'rindiqlar soni)</label>
            <input 
              type="number" 
              required 
              min="1"
              v-model="tableSeats" 
              class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div>
            <label class="block text-xs text-[#94a3b8] font-medium mb-1.5">Holati (Status)</label>
            <select 
              v-model="tableStatus" 
              class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
            >
              <option value="AVAILABLE">Bo'sh (AVAILABLE)</option>
              <option value="OCCUPIED">Band (OCCUPIED)</option>
              <option value="RESERVED">Bron qilingan (RESERVED)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-[#94a3b8] font-medium mb-1.5">Zal (Joylashuv)</label>
            <select 
              v-model="roomName" 
              class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
            >
              <option value="Asosiy zal">Asosiy zal</option>
              <option value="VIP zona">VIP zona</option>
              <option value="Kabina">Kabina</option>
              <option value="Terrasa">Terrasa</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-[#94a3b8] font-medium mb-1.5">Stol / Xona soatlik narxi (so'm)</label>
            <input 
              type="number" 
              min="0"
              v-model="vipPricePerHour" 
              placeholder="0 (bepul) yoki masalan: 50000"
              class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#3b82f6]"
            />
            <p class="text-[10px] text-[#94a3b8] mt-1">Default: 0 so'm (bepul). Agar soatlik puli bo'lsa kiriting.</p>
          </div>
          <button type="submit" class="w-full py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl font-medium transition-colors cursor-pointer">
            Saqlash
          </button>
        </form>
      </div>
    </div>
  </transition>

  <!-- Receipt / Check Modal -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isCheckModalOpen && currentOccupiedOrder" class="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <!-- Hidden printable receipt element for thermal printer window -->
      <div class="hidden" id="printable-receipt">
        <div>
          <div class="text-center space-y-1 mb-4">
            <h3 class="text-lg font-extrabold tracking-wider text-black">OHLALA RESTAURANT</h3>
            <p class="text-[10px] text-gray-500 font-sans">Toshkent, O'zbekiston | Tel: +998 90 123 45 67</p>
          </div>
          
          <div class="border-t border-b border-dashed border-gray-400 py-2 mb-4 space-y-1 text-[10px] text-gray-700">
            <div class="flex justify-between">
              <span>Chek ID: #{{ currentOccupiedOrder.id.slice(-8) }}</span>
              <span>Sana: {{ new Date().toLocaleDateString('uz-UZ') }}</span>
            </div>
            <div class="flex justify-between font-semibold">
              <span>Stol: {{ selectedTable.table_number ? `${selectedTable.table_number}-stol` : selectedTable.id }} ({{ selectedTable.room_name || "Asosiy zal" }})</span>
              <span>Vaqt: {{ new Date().toLocaleTimeString('uz-UZ') }}</span>
            </div>
          </div>

          <!-- Items list -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between font-bold border-b-2 border-gray-800 pb-1 text-black text-[11px]">
              <span class="w-1/2">Taom</span>
              <span class="w-1/6 text-center">Soni</span>
              <span class="w-1/3 text-right">Summa</span>
            </div>
            <div v-for="item in allCombinedItems" :key="item.id || item.product_id" class="flex justify-between text-[11px] py-1 border-b border-gray-100">
              <span class="w-1/2 truncate text-black font-medium">{{ getProductName(item.product_id) }}</span>
              <span class="w-1/6 text-center font-bold">x{{ item.quantity || item.qty || 1 }}</span>
              <span class="w-1/3 text-right font-bold">{{ formatNumber(item.subtotal || ((item.quantity || item.qty || 1) * (item.price || 0))) }} so'm</span>
            </div>
          </div>

          <!-- VIP calculations -->
          <div v-if="vipCalc" class="border-t border-dashed border-gray-400 pt-2 mb-3 space-y-1 text-[10px]">
            <div class="flex justify-between text-gray-600"><span>Kirgan vaqti:</span><span>{{ vipCalc.startTime }}</span></div>
            <div class="flex justify-between text-gray-600"><span>Davomiyligi:</span><span>{{ vipCalc.duration }}</span></div>
            <div class="flex justify-between font-bold text-black text-xs"><span>{{ selectedTable?.room_name === 'Kabina' ? "Kabina to'lovi:" : "Xona to'lovi:" }}</span><span>{{ formatNumber(vipCalc.vipFee) }} so'm</span></div>
          </div>

          <!-- Bonus breakdown on receipt -->
          <div v-if="bonusCalc.totalBonusDiscount > 0" class="border-t border-dashed border-emerald-400 bg-emerald-50 p-2.5 rounded-lg my-2 space-y-1 text-[10px] text-emerald-900">
            <div class="font-bold text-emerald-950 flex items-center gap-1">
              <span>🎁</span> 2+1 AKSIYA BONULARI:
            </div>
            <div v-for="b in bonusCalc.items" :key="b.product_id" class="flex justify-between">
              <span>{{ b.name }} ({{ b.qty }} ta → {{ b.freeCount }} ta bonus):</span>
              <span class="font-bold text-emerald-700">-{{ formatNumber(b.discountVal) }} so'm</span>
            </div>
          </div>

          <!-- Discount on receipt -->
          <div v-if="manualDiscountAmount > 0" class="border-t border-dashed border-blue-400 bg-blue-50 p-2.5 rounded-lg my-2 flex justify-between text-[10px] text-blue-900 font-bold">
            <span>🏷️ Chegirma / Skidka:</span>
            <span>-{{ formatNumber(manualDiscountAmount) }} so'm</span>
          </div>

          <!-- Ingredient / Tobacco breakdown on receipt -->
          <div v-if="orderRecipeBreakdown.length > 0" class="border-t border-dashed border-gray-400 pt-2 my-2 text-[10px] text-gray-700">
            <div class="font-bold text-black mb-1">📦 OMBORXONADAN AYRILADIGAN MASALLIQLAR (RETSEPT):</div>
            <div v-for="ing in orderRecipeBreakdown" :key="ing.name" class="flex justify-between py-0.5">
              <span>• {{ ing.name }}:</span>
              <span class="font-bold text-black">{{ ing.totalQuantity }} {{ ing.unit }}</span>
            </div>
          </div>

          <!-- Total bill -->
          <div class="border-t border-dashed border-gray-400 pt-3 space-y-1.5 text-black">
            <div class="flex justify-between text-[11px] text-gray-600">
              <span>Taomlar jami:</span>
              <span class="font-semibold">{{ formatNumber(itemsSubtotal) }} so'm</span>
            </div>
            <div v-if="serviceFeeAmount > 0" class="flex justify-between text-[11px] text-amber-800 font-bold">
              <span>Ofitsant xizmati ({{ checkoutServiceFeePercent }}%):</span>
              <span>+{{ formatNumber(serviceFeeAmount) }} so'm</span>
            </div>
            <div v-if="totalDiscountAmount > 0" class="flex justify-between text-[11px] text-emerald-700 font-bold">
              <span>Jami Chegirma (Bonus+Skidka):</span>
              <span>-{{ formatNumber(totalDiscountAmount) }} so'm</span>
            </div>
            <div class="flex justify-between text-base font-black border-t-2 border-gray-800 pt-2 text-black">
              <span>TO'LANADIGAN JAMI:</span>
              <span class="text-emerald-800 font-black text-lg">{{ formatNumber(finalOccupiedAmount) }} so'm</span>
            </div>
          </div>

          <!-- Payment type badge -->
          <div class="border-t border-dashed border-gray-400 pt-3 mt-4 text-[10px] text-center text-gray-600 font-sans">
            To'lov Usuli: <span class="font-extrabold text-black uppercase">100% NAQD PUL</span>
          </div>
        </div>
      </div>

      <!-- Main Clean Centered Modal Container -->
      <div class="bg-[#14161f] text-white w-full max-w-2xl xl:max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#2a2e3d] max-h-[92vh] my-auto">
        <!-- Top Header -->
        <div class="p-4 sm:p-5 border-b border-[#2a2e3d] flex flex-wrap justify-between items-center bg-[#14161f] shrink-0 gap-3">
          <div>
            <h3 class="text-lg font-black text-white flex items-center gap-2">
              <span>💳</span> Kassir To'lov Paneli
            </h3>
            <p class="text-xs text-[#94a3b8] mt-0.5 font-medium">
              Stol #{{ selectedTable.table_number || selectedTable.id }} ({{ selectedTable.room_name || "Asosiy zal" }}) bo'yicha hisob-kitob
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex bg-[#1e2230] p-1 rounded-xl border border-[#2a2e3d]">
              <button 
                @click="checkoutTab = 'PAYMENT'" 
                :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer', checkoutTab === 'PAYMENT' ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-[#94a3b8] hover:text-white']"
              >
                💳 To'lov Paneli
              </button>
              <button 
                @click="checkoutTab = 'RECEIPT'" 
                :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer', checkoutTab === 'RECEIPT' ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-[#94a3b8] hover:text-white']"
              >
                📄 Chek Ko'rinishi
              </button>
            </div>
            <button @click="isCheckModalOpen = false" class="text-[#94a3b8] hover:text-white p-2 bg-[#2a2e3d] hover:bg-[#34384a] rounded-xl transition-colors cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- TAB 1: PAYMENT CONTROL PANEL -->
        <div v-show="checkoutTab === 'PAYMENT'" class="flex-1 flex flex-col justify-between overflow-hidden bg-[#181b26]">
          <!-- Middle Scrollable Options Container -->
          <div class="flex-1 overflow-y-auto p-5 space-y-4">
            <!-- MERGE TABLES SECTION -->
            <div class="bg-[#1e2230] border border-[#2a2e3d] p-4 rounded-2xl space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Link class="h-4 w-4 text-amber-400" /> Stollarni Birlashtirish (Obedinit)
                </span>
                <span v-if="selectedMergeTableIds.length > 0" class="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  +{{ selectedMergeTableIds.length }} ta stol qo'shildi
                </span>
              </div>
              <p class="text-[11px] text-[#94a3b8]">
                Boshqa band stollar chekini ushbu shotga qo'shib, bitta qilib yopish:
              </p>

              <div v-if="otherOccupiedTables.length > 0" class="flex flex-wrap gap-2 pt-1">
                <button
                  v-for="t in otherOccupiedTables"
                  :key="t.id"
                  @click="toggleMergeTable(t.id)"
                  :class="[
                    'px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 shadow-sm',
                    selectedMergeTableIds.includes(String(t.id))
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 border-amber-400 text-white shadow-md shadow-amber-500/20'
                      : 'bg-[#14161f] border-[#2a2e3d] text-[#94a3b8] hover:text-white hover:border-[#3b4054]'
                  ]"
                >
                  <span>Stol #{{ t.table_number || t.id }} <span class="text-[10px] opacity-75">({{ t.room_name || 'Zal' }})</span></span>
                  <span class="text-xs font-extrabold text-amber-300">({{ formatNumber(getTableTotalSum(t.id)) }} so'm)</span>
                </button>
              </div>
              <div v-else class="text-[10px] text-[#94a3b8] italic">
                (Hozircha birlashtirish uchun boshqa band stollar yo'q)
              </div>
            </div>

            <!-- BONUS SECTION -->
            <div class="bg-[#1e2230] border border-[#2a2e3d] p-4 rounded-2xl space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <span>🎁</span> 2+1 Aksiya Bonusi
                </span>
                <input type="checkbox" v-model="enableBonus2Plus1" class="h-4 w-4 accent-emerald-500 cursor-pointer" />
              </div>
              <p class="text-[11px] text-[#94a3b8]">
                Har 2 ta bir xil mahsulot (masalan 2 ta Kalyan) buyurtma qilinganda 1 tasi avtomatik 100% TEKIN bonus qilinadi.
              </p>
              <div v-if="enableBonus2Plus1 && bonusCalc.totalBonusDiscount > 0" class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                <div v-for="b in bonusCalc.items" :key="b.product_id" class="flex justify-between text-emerald-300 font-medium">
                  <span>{{ b.name }} ({{ b.qty }} ta)</span>
                  <span class="font-bold text-emerald-400">+{{ b.freeCount }} ta Bonus (-{{ formatNumber(b.discountVal) }} so'm)</span>
                </div>
              </div>
              <div v-else-if="enableBonus2Plus1" class="text-[10px] text-[#94a3b8] italic">
                (Ushbu buyurtmada kamida 2 ta bir xil mahsulot bo'lganda bonus uriladi)
              </div>
            </div>

            <!-- OMBORXONA MASALLIQ/RETSEPT BREAKDOWN CARD -->
            <div v-if="orderRecipeBreakdown.length > 0" class="bg-[#1e2230] border border-[#2a2e3d] p-4 rounded-2xl space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Package class="h-4 w-4 text-amber-400" /> Omborxonadan Ayriladigan Masalliqlar (Retsept)
                </span>
                <span class="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {{ orderRecipeBreakdown.length }} xil masalliq
                </span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div v-for="ing in orderRecipeBreakdown" :key="ing.name" class="flex justify-between items-center text-xs p-2.5 bg-[#14161f] rounded-xl border border-[#2a2e3d]">
                  <span class="text-[#94a3b8] font-medium truncate">• {{ ing.name }}:</span>
                  <span class="font-bold text-white bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 text-amber-400 shrink-0 ml-1">
                    {{ ing.totalQuantity }} {{ ing.unit }}
                  </span>
                </div>
              </div>
            </div>

            <!-- WAITER SERVICE FEE SECTION -->
            <div class="bg-[#1e2230] border border-[#2a2e3d] p-4 rounded-2xl space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🤵</span> Ofitsant Xizmat Haqi (%)
                </span>
                <span v-if="serviceFeeAmount > 0" class="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  +{{ formatNumber(serviceFeeAmount) }} so'm
                </span>
              </div>
              <div class="grid grid-cols-5 gap-2">
                <button 
                  v-for="p in [0, 10, 15, 20, 25]" 
                  :key="p"
                  @click="setServiceFeePercent(p)"
                  :class="[
                    'py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer',
                    checkoutServiceFeePercent === p
                      ? 'bg-amber-600 border-transparent text-white shadow-md shadow-amber-500/20' 
                      : 'bg-[#14161f] border-[#2a2e3d] text-[#94a3b8] hover:text-white hover:border-[#3b4054]'
                  ]"
                >
                  {{ p }}%
                </button>
              </div>
            </div>

            <!-- DISCOUNT SECTION -->
            <div class="bg-[#1e2230] border border-[#2a2e3d] p-4 rounded-2xl space-y-3">
              <span class="text-xs font-bold text-blue-400 block">🏷️ Chegirma / Skidka Urish</span>
              <div class="grid grid-cols-6 gap-2">
                <button 
                  v-for="p in [0, 5, 10, 15, 20, 50]" 
                  :key="p"
                  @click="checkoutDiscountPercent = p; checkoutCustomDiscountSum = 0"
                  :class="[
                    'py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer',
                    checkoutDiscountPercent === p && checkoutCustomDiscountSum == 0
                      ? 'bg-blue-600 border-transparent text-white shadow-md shadow-blue-500/20' 
                      : 'bg-[#14161f] border-[#2a2e3d] text-[#94a3b8] hover:text-white hover:border-[#3b4054]'
                  ]"
                >
                  {{ p }}%
                </button>
              </div>
              <div>
                <label class="text-[10px] text-[#94a3b8] block mb-1">Boshqa skidka summasi (so'mda):</label>
                <input 
                  type="number" 
                  v-model.number="checkoutCustomDiscountSum"
                  @input="checkoutDiscountPercent = 0"
                  placeholder="Masalan: 20000"
                  class="w-full bg-[#14161f] border border-[#2a2e3d] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <!-- PAYMENT METHOD (Naqd pul) -->
            <div class="bg-[#1e2230] border border-[#2a2e3d] p-4 rounded-2xl space-y-2">
              <span class="text-xs font-bold text-[#94a3b8] uppercase block">To'lov Turi</span>
              <div class="py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-extrabold text-emerald-400 flex items-center justify-between shadow-xs">
                <span class="flex items-center gap-2 font-bold">💵 Naqd pul (so'mda)</span>
                <span class="text-[10px] bg-emerald-600 text-white px-3 py-1 rounded-lg font-black shadow-xs">100% NAQD</span>
              </div>
            </div>
          </div>

          <!-- FIXED BOTTOM ACTION FOOTER -->
          <div class="p-5 bg-[#14161f] border-t border-[#2a2e3d] space-y-3 shrink-0">
            <!-- SUMMARY CALCULATOR BOX -->
            <div class="bg-[#1a1d29] border border-emerald-500/30 p-3.5 rounded-2xl space-y-1.5 shadow-lg">
              <div class="flex justify-between text-xs text-[#94a3b8]">
                <span>Jami taomlar:</span>
                <span class="text-white font-semibold">{{ formatNumber(itemsSubtotal) }} so'm</span>
              </div>
              <div v-if="serviceFeeAmount > 0" class="flex justify-between text-xs text-amber-400 font-bold">
                <span>🤵 Ofitsant xizmati ({{ checkoutServiceFeePercent }}%):</span>
                <span>+{{ formatNumber(serviceFeeAmount) }} so'm</span>
              </div>
              <div v-if="bonusCalc.totalBonusDiscount > 0" class="flex justify-between text-xs text-emerald-400 font-bold">
                <span>🎁 2+1 Aksiya Bonusi:</span>
                <span>-{{ formatNumber(bonusCalc.totalBonusDiscount) }} so'm</span>
              </div>
              <div v-if="manualDiscountAmount > 0" class="flex justify-between text-xs text-blue-400 font-bold">
                <span>🏷️ Qo'shimcha Skidka:</span>
                <span>-{{ formatNumber(manualDiscountAmount) }} so'm</span>
              </div>
              <div v-if="vipCalc" class="flex justify-between text-xs text-amber-400 font-bold">
                <span>{{ selectedTable?.room_name === 'Kabina' ? "Kabina to'lovi:" : "VIP Xona to'lovi:" }}</span>
                <span>+{{ formatNumber(vipCalc.vipFee) }} so'm</span>
              </div>
              <div class="flex justify-between items-center text-sm font-black border-t border-[#2a2e3d] pt-2 text-white">
                <span class="text-xs uppercase tracking-wider text-[#94a3b8]">JAMI TO'LOV:</span>
                <span class="text-2xl text-emerald-400 font-black tracking-tight">{{ formatNumber(finalOccupiedAmount) }} so'm</span>
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="flex gap-3">
              <button @click="printReceipt" class="py-3.5 bg-[#1e2230] hover:bg-[#2a2e3d] border border-[#2a2e3d] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 px-5 transition-colors cursor-pointer shrink-0">
                <Printer class="h-4 w-4 text-blue-400" /> Chek
              </button>
              <button @click="handleCloseTablePayment" class="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-2xl text-base font-black transition-all shadow-xl shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-2.5">
                <CheckCircle2 class="h-5 w-5" /> To'lash va Stolni Yopish
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: RECEIPT PREVIEW -->
        <div v-show="checkoutTab === 'RECEIPT'" class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-[#0d0e15]">
          <div class="w-full max-w-sm bg-white text-black p-6 rounded-2xl shadow-2xl font-mono text-xs my-auto space-y-4 border border-gray-200">
            <div class="text-center space-y-1 mb-4">
              <h3 class="text-lg font-extrabold tracking-wider text-black">OHLALA RESTAURANT</h3>
              <p class="text-[10px] text-gray-500 font-sans">Toshkent, O'zbekiston | Tel: +998 90 123 45 67</p>
            </div>
            
            <div class="border-t border-b border-dashed border-gray-400 py-2 mb-4 space-y-1 text-[10px] text-gray-700">
              <div class="flex justify-between">
                <span>Chek ID: #{{ currentOccupiedOrder.id.slice(-8) }}</span>
                <span>Sana: {{ new Date().toLocaleDateString('uz-UZ') }}</span>
              </div>
              <div class="flex justify-between font-semibold">
                <span>Stol: {{ selectedTable.table_number ? `${selectedTable.table_number}-stol` : selectedTable.id }} ({{ selectedTable.room_name || "Asosiy zal" }})</span>
                <span>Vaqt: {{ new Date().toLocaleTimeString('uz-UZ') }}</span>
              </div>
            </div>

            <!-- Items list -->
            <div class="space-y-2 mb-4">
              <div class="flex justify-between font-bold border-b-2 border-gray-800 pb-1 text-black text-[11px]">
                <span class="w-1/2">Taom</span>
                <span class="w-1/6 text-center">Soni</span>
                <span class="w-1/3 text-right">Summa</span>
              </div>
              <div v-for="item in allCombinedItems" :key="item.id || item.product_id" class="flex justify-between text-[11px] py-1 border-b border-gray-100">
                <span class="w-1/2 truncate text-black font-medium">{{ getProductName(item.product_id) }}</span>
                <span class="w-1/6 text-center font-bold">x{{ item.quantity || item.qty || 1 }}</span>
                <span class="w-1/3 text-right font-bold">{{ formatNumber(item.subtotal || ((item.quantity || item.qty || 1) * (item.price || 0))) }} so'm</span>
              </div>
            </div>

            <!-- VIP calculations -->
            <div v-if="vipCalc" class="border-t border-dashed border-gray-400 pt-2 mb-3 space-y-1 text-[10px]">
              <div class="flex justify-between text-gray-600"><span>Kirgan vaqti:</span><span>{{ vipCalc.startTime }}</span></div>
              <div class="flex justify-between text-gray-600"><span>Davomiyligi:</span><span>{{ vipCalc.duration }}</span></div>
              <div class="flex justify-between font-bold text-black text-xs"><span>{{ selectedTable?.room_name === 'Kabina' ? "Kabina to'lovi:" : "Xona to'lovi:" }}</span><span>{{ formatNumber(vipCalc.vipFee) }} so'm</span></div>
            </div>

            <!-- Bonus breakdown on receipt -->
            <div v-if="bonusCalc.totalBonusDiscount > 0" class="border-t border-dashed border-emerald-400 bg-emerald-50 p-2.5 rounded-lg my-2 space-y-1 text-[10px] text-emerald-900">
              <div class="font-bold text-emerald-950 flex items-center gap-1">
                <span>🎁</span> 2+1 AKSIYA BONULARI:
              </div>
              <div v-for="b in bonusCalc.items" :key="b.product_id" class="flex justify-between">
                <span>{{ b.name }} ({{ b.qty }} ta → {{ b.freeCount }} ta bonus):</span>
                <span class="font-bold text-emerald-700">-{{ formatNumber(b.discountVal) }} so'm</span>
              </div>
            </div>

            <!-- Discount on receipt -->
            <div v-if="manualDiscountAmount > 0" class="border-t border-dashed border-blue-400 bg-blue-50 p-2.5 rounded-lg my-2 flex justify-between text-[10px] text-blue-900 font-bold">
              <span>🏷️ Chegirma / Skidka:</span>
              <span>-{{ formatNumber(manualDiscountAmount) }} so'm</span>
            </div>

            <!-- Ingredient / Tobacco breakdown on receipt -->
            <div v-if="orderRecipeBreakdown.length > 0" class="border-t border-dashed border-gray-400 pt-2 my-2 text-[10px] text-gray-700">
              <div class="font-bold text-black mb-1">📦 OMBORXONADAN AYRILADIGAN MASALLIQLAR (RETSEPT):</div>
              <div v-for="ing in orderRecipeBreakdown" :key="ing.name" class="flex justify-between py-0.5">
                <span>• {{ ing.name }}:</span>
                <span class="font-bold text-black">{{ ing.totalQuantity }} {{ ing.unit }}</span>
              </div>
            </div>

            <!-- Total bill -->
            <div class="border-t border-dashed border-gray-400 pt-3 space-y-1.5 text-black">
              <div class="flex justify-between text-[11px] text-gray-600">
                <span>Taomlar jami:</span>
                <span class="font-semibold">{{ formatNumber(itemsSubtotal) }} so'm</span>
              </div>
              <div v-if="serviceFeeAmount > 0" class="flex justify-between text-[11px] text-amber-800 font-bold">
                <span>Ofitsant xizmati ({{ checkoutServiceFeePercent }}%):</span>
                <span>+{{ formatNumber(serviceFeeAmount) }} so'm</span>
              </div>
              <div v-if="totalDiscountAmount > 0" class="flex justify-between text-[11px] text-emerald-700 font-bold">
                <span>Jami Chegirma (Bonus+Skidka):</span>
                <span>-{{ formatNumber(totalDiscountAmount) }} so'm</span>
              </div>
              <div class="flex justify-between text-base font-black border-t-2 border-gray-800 pt-2 text-black">
                <span>TO'LANADIGAN JAMI:</span>
                <span class="text-emerald-800 font-black text-lg">{{ formatNumber(finalOccupiedAmount) }} so'm</span>
              </div>
            </div>

            <!-- Payment type badge -->
            <div class="border-t border-dashed border-gray-400 pt-3 mt-4 text-[10px] text-center text-gray-600 font-sans">
              To'lov Usuli: <span class="font-extrabold text-black uppercase">100% NAQD PUL</span>
            </div>
          </div>
          <button @click="printReceipt" class="mt-4 py-2.5 px-6 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2">
            <Printer class="h-4 w-4" /> Chek Chop Etish
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Cancel Order Modal -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isCancelModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-md rounded-2xl shadow-xl">
        <div class="flex items-center justify-between p-4 border-b border-[#2a2e3d] bg-[#14161e]">
          <h3 class="text-lg font-bold text-white">Buyurtmani bekor qilish</h3>
          <button @click="isCancelModalOpen = false" class="text-[#94a3b8] hover:text-white cursor-pointer">
            <X class="h-5 w-5" />
          </button>
        </div>
        <form @submit.prevent="handleConfirmCancel" class="p-6 space-y-4">
          <div class="relative">
            <label class="block text-xs text-[#94a3b8] font-medium mb-1.5">Iltimos, bekor qilish sababini tanlang:</label>
            
            <button
              type="button"
              @click="isCancelDropdownOpen = !isCancelDropdownOpen"
              class="w-full bg-[#1e2230] hover:bg-[#252a3b] border border-[#2a2e3d] focus:border-[#3b82f6] rounded-xl px-4 py-3 text-sm text-white text-left flex items-center justify-between transition-all outline-none cursor-pointer"
            >
              <span>{{ cancelReason }}</span>
              <span :class="['transform transition-transform duration-200', isCancelDropdownOpen ? 'rotate-180' : 'rotate-0']">
                <svg class="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            <!-- Dropdown Options -->
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform translate-y-0 opacity-100"
              leave-to-class="transform -translate-y-2 opacity-0"
            >
              <div v-if="isCancelDropdownOpen" class="absolute z-20 w-full mt-2 bg-[#1e2230] border border-[#2a2e3d] rounded-xl shadow-2xl overflow-hidden">
                <button
                  v-for="(reason, idx) in cancellationReasons"
                  :key="idx"
                  type="button"
                  @click="selectCancelReason(reason)"
                  :class="[
                    'w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer',
                    cancelReason === reason ? 'bg-[#3b82f6] text-white' : 'text-[#cbd5e1] hover:bg-[#252a3b] hover:text-white'
                  ]"
                >
                  <span>{{ reason }}</span>
                  <svg v-if="cancelReason === reason" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </transition>
            <div v-if="isCancelDropdownOpen" class="fixed inset-0 z-10" @click="isCancelDropdownOpen = false"></div>
          </div>
          <div class="pt-2 flex justify-end gap-3">
            <button type="button" @click="isCancelModalOpen = false" class="px-5 py-2.5 rounded-xl border border-[#2a2e3d] hover:bg-[#1e2230] text-[#94a3b8] hover:text-white transition-colors text-sm font-semibold cursor-pointer">Orqaga</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-bold shadow-md shadow-red-600/20 cursor-pointer">Tasdiqlash</button>
          </div>
        </form>
      </div>
    </div>
  </transition>

  <!-- Bron Qilish Modal -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isReservationModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-white">
        <div class="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-b border-yellow-500/20 p-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-yellow-500/20">
              <Calendar class="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 class="font-bold text-white text-base">Stol Bron Qilish</h3>
              <p class="text-xs text-yellow-400/80">Stol #{{ selectedTable?.table_number }} — {{ selectedTable?.room_name }}</p>
            </div>
          </div>
          <button @click="isReservationModalOpen = false" class="p-2 rounded-lg hover:bg-[#2a2e3d] text-[#94a3b8] hover:text-white transition-colors cursor-pointer">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="mx-5 mt-5 bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-start gap-2">
          <svg class="h-5 w-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p class="text-xs text-green-300 font-medium leading-relaxed">Bron vaqtida <span class="font-black text-green-200">hech qanday pul olinmaydi.</span> To'lov faqat mijoz kelgandan keyin olinadi.</p>
        </div>

        <form @submit.prevent="submitReservation" class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-[#94a3b8] mb-1.5">Mijoz ismi</label>
              <input type="text" v-model="reservationName" placeholder="Masalan: Akbar Toshmatov" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4a5568] outline-none focus:border-yellow-500/50 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#94a3b8] mb-1.5">Telefon raqami</label>
              <input type="tel" v-model="reservationPhone" placeholder="+998 90 123 45 67" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4a5568] outline-none focus:border-yellow-500/50 transition-colors" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#94a3b8] mb-1.5">Kelish vaqti (taxminiy)</label>
            <input type="time" v-model="reservationTime" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-500/50 transition-colors" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#94a3b8] mb-1.5">Qo'shimcha izoh (ixtiyoriy)</label>
            <textarea v-model="reservationNote" placeholder="Masalan: 4 kishi, VIP xonada..." rows="2" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4a5568] outline-none focus:border-yellow-500/50 transition-colors resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-1">
            <button type="button" @click="isReservationModalOpen = false" class="flex-1 py-2.5 rounded-xl border border-[#2a2e3d] hover:bg-[#1e2230] text-[#94a3b8] hover:text-white transition-colors text-sm font-semibold cursor-pointer">Bekor</button>
            <button type="submit" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-[#111] font-bold transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer">
              <Calendar class="h-4 w-4" /> Bron Qilish (Pulsiz)
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>

  <!-- Notifications Modal -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isNotificationModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-white">
        <div class="p-5 border-b border-[#2a2e3d] flex items-center justify-between bg-[#1e2230]">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Bell class="h-5 w-5" />
            </div>
            <div>
              <h3 class="font-bold text-white text-base">Bildirishnomalar</h3>
              <p class="text-xs text-[#94a3b8]">Tizim ogohlantirishlari va zaxira ma'lumotlari</p>
            </div>
          </div>
          <button @click="isNotificationModalOpen = false" class="p-1.5 rounded-lg hover:bg-[#2a2e3d] text-[#94a3b8] hover:text-white transition-colors cursor-pointer">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="p-4 bg-[#14161e] border-b border-[#2a2e3d] flex justify-between items-center text-xs">
          <button @click="toggleSound" class="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
            <Volume2 v-if="soundEnabled" class="h-4 w-4" />
            <VolumeX v-else class="h-4 w-4" />
            <span>{{ soundEnabled ? 'Ovoz yoniq' : 'Ovoz o\'chirilgan' }}</span>
          </button>
          <button @click="markAllNotificationsAsRead" class="text-[#94a3b8] hover:text-white font-medium cursor-pointer">
            Barchasini o'qildi deb belgilash
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto p-4 space-y-3">
          <div 
            v-for="n in notificationsList" 
            :key="n.id"
            @click="markNotificationAsRead(n.id)"
            :class="[
              'p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start',
              readNotificationIds.includes(n.id) ? 'bg-[#1e2230]/40 border-[#2a2e3d] opacity-70' : 'bg-[#1e2230] border-blue-500/30 shadow-md'
            ]"
          >
            <div :class="['p-2 rounded-lg shrink-0 mt-0.5', n.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400']">
              <AlertTriangle v-if="n.type === 'WARNING'" class="h-4 w-4" />
              <Bell v-else class="h-4 w-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <h4 class="text-xs font-bold text-white">{{ n.title }}</h4>
                <span class="text-[10px] text-[#94a3b8]">{{ n.time }}</span>
              </div>
              <p class="text-xs text-[#94a3b8] mt-1">{{ n.message }}</p>
            </div>
          </div>

          <div v-if="notificationsList.length === 0" class="py-8 text-center text-[#94a3b8] text-xs">
            Yangi bildirishnomalar yo'q.
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Merge Tables Modal Root Level -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isMergeModalOpen" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-white">
        <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]">
          <div>
            <h3 class="font-bold text-white flex items-center gap-2 text-base">
              <Link class="h-5 w-5 text-amber-400" /> Stollarni Birlashtirish (Obedinit)
            </h3>
            <p class="text-xs text-[#94a3b8] mt-0.5">Ushbu {{ selectedTable ? formatTableTitle(selectedTable) : '' }} shotiga boshqa band stollarni birlashtirish</p>
          </div>
          <button @click="isMergeModalOpen = false" class="text-[#94a3b8] hover:text-white p-1.5 bg-[#2a2e3d] rounded-lg cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <p class="text-xs text-[#94a3b8]">
            Quyidagi band stollardan birini yoki bir nechtasini tanlang. Ularning barcha taomlari va summasi ushbu stolga avtomatik qo'shiladi va bitta hisoblanadi:
          </p>

          <div v-if="otherOccupiedTables.length > 0" class="space-y-2.5">
            <div 
              v-for="t in otherOccupiedTables" 
              :key="t.id"
              @click="toggleMergeTable(t.id)"
              :class="[
                'p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center',
                selectedMergeTableIds.includes(String(t.id))
                  ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-md'
                  : 'bg-[#1e2230] border-[#2a2e3d] text-[#94a3b8] hover:text-white hover:border-[#3b4054]'
              ]"
            >
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-xl bg-[#2a2e3d] flex items-center justify-center font-bold text-amber-400 border border-[#3b4054]">
                  {{ t.table_number || t.id }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white">Stol #{{ t.table_number || t.id }} ({{ t.room_name || 'Asosiy zal' }})</h4>
                  <p class="text-[10px] text-[#94a3b8]">{{ getTableItemsCount(t.id) }} ta taom buyurtma qilingan</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-amber-400">{{ formatNumber(getTableTotalSum(t.id)) }} so'm</span>
                <span v-if="selectedMergeTableIds.includes(String(t.id))" class="block text-[10px] text-emerald-400 font-bold">✓ Birlashtirildi</span>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-[#94a3b8] text-xs">
            Hozircha birlashtirish uchun boshqa band stollar mavjud emas.
          </div>
        </div>

        <div class="p-4 bg-[#14161e] border-t border-[#2a2e3d] flex justify-between items-center">
          <div class="text-xs">
            <span class="text-[#94a3b8]">Birlashgan stollar: </span>
            <span class="font-bold text-amber-400">{{ selectedMergeTableIds.length + 1 }} ta stol</span>
          </div>
          <button @click="isMergeModalOpen = false" class="py-2.5 px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg">
            Saqlash va Yopish
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Transfer Table Modal Root Level -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isTransferModalOpen" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-white">
        <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]">
          <div>
            <h3 class="font-bold text-white flex items-center gap-2 text-base">
              <span class="text-blue-400">🔀</span> Buyurtmani Boshqa Stolga Ko'chirish
            </h3>
            <p class="text-xs text-[#94a3b8] mt-0.5">Ushbu {{ selectedTable ? formatTableTitle(selectedTable) : '' }} dagi barcha buyurtmalarni ko'chirish</p>
          </div>
          <button @click="isTransferModalOpen = false" class="text-[#94a3b8] hover:text-white p-1.5 bg-[#2a2e3d] rounded-lg cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <p class="text-xs text-[#94a3b8]">
            Ko'chirish amalga oshirilganda: <b>Bo'sh stolga</b> asosiy stol bo'lib tushadi. <b>Band stolga</b> esa shot yopilmagani uchun <b>yangi SEANS (Sessiya)</b> bo'lib qo'shiladi.
          </p>

          <div v-if="availableTransferTables.length > 0" class="space-y-2.5">
            <div 
              v-for="t in availableTransferTables" 
              :key="t.id"
              @click="targetTransferTableId = t.id"
              :class="[
                'p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center',
                String(targetTransferTableId) === String(t.id)
                  ? 'bg-blue-500/20 border-blue-500 text-white font-bold shadow-md'
                  : 'bg-[#1e2230] border-[#2a2e3d] text-[#94a3b8] hover:text-white hover:border-[#3b4054]'
              ]"
            >
              <div class="flex items-center gap-3">
                <div :class="['h-9 w-9 rounded-xl flex items-center justify-center font-bold border', isTableOccupied(t) ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30']">
                  {{ t.table_number || t.id }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white">Stol #{{ t.table_number || t.id }} ({{ t.room_name || 'Asosiy zal' }})</h4>
                  <p v-if="!isTableOccupied(t)" class="text-[10px] text-green-400 font-semibold">
                    🟢 Bo'sh stol • Asosiy buyurtma bo'lib ko'chiriladi
                  </p>
                  <p v-else class="text-[10px] text-amber-400 font-semibold">
                    🔴 Shot yopilmagan (Band) • Yangi SEANS (Sessiya) bo'lib qo'shiladi
                  </p>
                </div>
              </div>
              <span v-if="String(targetTransferTableId) === String(t.id)" class="text-xs text-blue-400 font-bold">✓ Tanlandi</span>
            </div>
          </div>
          <div v-else class="py-8 text-center text-[#94a3b8] text-xs italic">
            Hozircha ko'chirish uchun bo'sh stollar mavjud emas.
          </div>
        </div>

        <div class="p-4 bg-[#14161e] border-t border-[#2a2e3d] flex justify-between items-center gap-3">
          <button @click="isTransferModalOpen = false" class="flex-1 py-2.5 bg-[#1e2230] hover:bg-[#2a2e3d] text-[#94a3b8] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
            Bekor qilish
          </button>
          <button 
            @click="handleTransferTable"
            :disabled="!targetTransferTableId"
            class="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Ko'chirishni Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Custom / Off-Menu Product Modal Root Level -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isCustomItemModalOpen" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-white">
        <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]">
          <div>
            <h3 class="font-bold text-white flex items-center gap-2 text-base">
              <span class="text-purple-400">⚡</span> Tashqi / Erkin Mahsulot Qo'shish
            </h3>
            <p class="text-xs text-[#94a3b8] mt-0.5">Menyuda yo'q narsalarning (sigaret, xizmat) nomi va narxini kiritish</p>
          </div>
          <button @click="isCustomItemModalOpen = false" class="text-[#94a3b8] hover:text-white p-1.5 bg-[#2a2e3d] rounded-lg cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddCustomProductToCart" class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-bold text-[#94a3b8] mb-1">Mahsulot / Xizmat Nomi *</label>
            <input 
              type="text" 
              v-model="customItemName" 
              placeholder="Masalan: Sigaret Rothmans / Winston / Qo'shimcha xizmat" 
              required
              class="w-full bg-[#1e2230] border border-[#2a2e3d] text-sm text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-[#94a3b8] mb-1">Narxi (so'mda) *</label>
              <input 
                type="number" 
                v-model="customItemPrice" 
                placeholder="35000" 
                required
                min="0"
                step="500"
                class="w-full bg-[#1e2230] border border-[#2a2e3d] text-sm text-white font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-[#94a3b8] mb-1">Soni (dona) *</label>
              <input 
                type="number" 
                v-model="customItemQty" 
                placeholder="1" 
                required
                min="1"
                class="w-full bg-[#1e2230] border border-[#2a2e3d] text-sm text-white font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
            ℹ️ Ushbu mahsulot stol buyurtmasi va chekiga erkin narx bilan qo'shiladi hamda barcha kassa hisobotlarida to'liq aks etadi.
          </div>

          <div class="pt-2 flex justify-between items-center gap-3">
            <button 
              type="button" 
              @click="isCustomItemModalOpen = false" 
              class="flex-1 py-2.5 bg-[#1e2230] hover:bg-[#2a2e3d] text-[#94a3b8] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button 
              type="submit" 
              class="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-500/20"
            >
              ➕ Buyurtmaga Qo'shish
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import { Bell, Grid, Menu, MoreHorizontal, Plus, Minus, Trash2, Users, AlertOctagon, Edit, X, ArrowLeft, Search, Utensils, Printer, Receipt, Calendar, ShieldAlert, ShoppingCart, Volume2, VolumeX, AlertTriangle, Folder, History, CheckCircle2, Tag, Percent, Link, Package, Play, Square, Pause, Minimize2, Maximize2 } from "lucide-vue-next";
import TableIcon from "../components/TableIcon.vue";
import { appContext } from "../store/appContext";
import api from "../services/api";

const KALYAN_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e2230' rx='16'/><path d='M50 12 v16 M40 28 h20 M50 28 v12 M38 40 h24 M42 40 l-8 20 a16 16 0 0 0 32 0 l-8-20 Z M50 60 v22 M40 82 h20' stroke='%233b82f6' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/><circle cx='50' cy='52' r='7' fill='%233b82f6' opacity='0.25'/><path d='M58 34 c12 0 20 8 20 18 v12' stroke='%2360a5fa' stroke-width='2.5' stroke-linecap='round' fill='none'/></svg>";

const WATER_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e2230' rx='16'/><path d='M42 14 h16 v10 h-16 z M40 24 h20 v12 l8 12 v32 a8 8 0 0 1-8 8 H40 a8 8 0 0 1-8-8 V48 l8-12 Z M36 56 h28' stroke='%2306b6d4' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/><path d='M40 66 c6 4 14 4 20 0' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round' fill='none'/></svg>";

const SNACK_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e2230' rx='16'/><path d='M20 45 a30 30 0 0 0 60 0 Z M35 75 h30 M50 75 v10' stroke='%23f59e0b' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/><path d='M35 32 c0-6 4-8 4-14 M50 32 c0-6 4-8 4-14 M65 32 c0-6 4-8 4-14' stroke='%23fbbf24' stroke-width='2.5' stroke-linecap='round' fill='none'/></svg>";

export default {
  name: "POS",
  components: {
    Bell,
    Grid,
    Menu,
    MoreHorizontal,
    Plus,
    Minus,
    Trash2,
    Users,
    AlertOctagon,
    Edit,
    X,
    ArrowLeft,
    Search,
    Utensils,
    Printer,
    Receipt,
    Calendar,
    ShieldAlert,
    TableIcon,
    ShoppingCart,
    Volume2,
    VolumeX,
    AlertTriangle,
    Folder,
    History,
    CheckCircle2,
    Tag,
    Percent,
    Link,
    Package,
    Play,
    Square,
    Pause,
    Minimize2,
    Maximize2
  },
  data() {
    return {
      state: appContext.state,
      isMobileCartOpen: false,
      compactCardsMode: localStorage.getItem("pos_compact_mode") === "true",
      activeTab: "Asosiy zal",
      tables: [],
      products: [],
      customers: [],
      activeOrders: [],
      ingredients: [],
      recipes: [],
      tableCarts: {},
      selectedTable: null,
      selectedCustomer: "",
      loading: true,

      // Notifications state
      isNotificationModalOpen: false,
      readNotificationIds: [],
      soundEnabled: true,

      // Modal Dialogs
      isTableModalOpen: false,
      editingTable: null,
      tableNumber: "",
      tableSeats: "",
      tableStatus: "AVAILABLE",
      roomName: "Asosiy zal",
      vipPricePerHour: 0,
      viewMode: "grid",
      selectedCategory: "ALL",
      searchQuery: "",
      isCheckModalOpen: false,
      isTransferModalOpen: false,
      targetTransferTableId: "",
      isCustomItemModalOpen: false,
      customItemName: "",
      customItemPrice: "",
      customItemQty: 1,
      selectedPaymentMethod: "CASH",
      checkoutDiscountPercent: 0,
      checkoutCustomDiscountSum: 0,
      checkoutServiceFeePercent: 25,
      enableBonus2Plus1: true,
      checkoutPaymentMethod: "CASH",
      selectedMergeTableIds: [],
      checkoutTab: "PAYMENT",
      isMergeModalOpen: false,
      isCreateSessionModalOpen: false,
      newSessionName: "",
      isCancelModalOpen: false,
      isCancelDropdownOpen: false,
      selectedSessionId: null,
      editModeCart: [],
      editReason: "",
      isTimelineOpen: false,
      timelineLoading: false,
      timelineData: [],

      // Reservations
      isReservationModalOpen: false,
      reservationName: "",
      reservationPhone: "",
      reservationTime: "",
      reservationNote: "",
      reservationData: {},
      
      // Timer state
      timeCounter: 0,
      timerInterval: null,
      timerStartMap: JSON.parse(localStorage.getItem("kitchen_vip_timer_map") || "{}"),
      accumulatedVipFees: JSON.parse(localStorage.getItem("kitchen_vip_accumulated_map") || "{}"),
      zallar: ["Asosiy zal", "VIP zona", "Kabina", "Terrasa"],
      cancellationReasons: [
        "Mijoz fikridan qaytdi (buyurtmani rad etdi)",
        "Taom tayyorlanishi juda uzoq cho'zildi",
        "Taom sifatsiz yoki noto'g'ri tayyorlandi",
        "Mijoz xato buyurtma berdi",
        "Stol noto'g'ri band qilindi (xodim xatosi)",
        "Mijoz to'lov qilmasdan ketib qoldi",
        "Boshqa sabab",
      ],
      categories: [],
    };
  },
  computed: {
    isPrivileged() {
      const r = this.state.role;
      return r === "SUPERADMIN" || r === "MANAGER";
    },
    notificationsList() {
      const list = [...(this.state.notifications || [])];
      (this.ingredients || []).forEach(ing => {
        if ((ing.quantity || 0) <= (ing.min_quantity || 100)) {
          list.push({
            id: `stock-${ing.id}`,
            title: `Zaxira Kamaydi: ${ing.name}`,
            message: `Omborda kam qoldi: ${this.formatNumber(ing.quantity || 0)} ${ing.base_unit || 'g'} (Minimal: ${ing.min_quantity || 100})`,
            time: 'Hozir',
            type: 'WARNING'
          });
        }
      });
      (this.activeOrders || []).forEach(o => {
        list.push({
          id: `order-${o.id}`,
          title: `Faol Buyurtma ${this.getOrderDisplayId(o)}`,
          message: `Stol ${o.table_id || o.tableId || '-'} — ${this.formatNumber(o.total_amount || 0)} so'm`,
          time: 'Faol',
          type: 'INFO'
        });
      });
      return list;
    },
    unreadNotificationsCount() {
      return this.notificationsList.filter(n => !this.readNotificationIds.includes(n.id)).length;
    },
    cart() {
      return this.selectedTable ? (this.tableCarts[this.selectedTable.id] || []) : [];
    },
    currentTableSessions() {
      if (!this.selectedTable) return [];
      const tId = String(this.selectedTable.id || this.selectedTable._id || "");
      const tNum = String(this.selectedTable.table_number || this.selectedTable.tableNumber || "");
      return (this.activeOrders || []).filter(o => {
        if (o.status === "COMPLETED" || o.status === "CANCELLED") return false;
        const oTableId = String(o.table_id || o.tableId || "");
        const oTableNum = String(o.table_number || o.tableNumber || "");
        const matchId = tId && (oTableId === tId || oTableNum === tId);
        const matchNum = tNum && (oTableId === tNum || oTableNum === tNum);
        return matchId || matchNum;
      });
    },
    currentOccupiedOrder() {
      if (!this.selectedTable) return null;
      const tId = String(this.selectedTable.id || this.selectedTable._id || "");
      const tNum = String(this.selectedTable.table_number || this.selectedTable.tableNumber || "");
      if (this.selectedSessionId) {
        const sId = String(this.selectedSessionId);
        const found = (this.activeOrders || []).find(o => String(o.id || o._id) === sId);
        if (found && found.status !== "COMPLETED" && found.status !== "CANCELLED") return found;
      }
      const sessions = this.currentTableSessions;
      return sessions.length > 0 ? sessions[0] : null;
    },
    hasEditChanges() {
      return this.editModeCart.some(item => item.qty !== item.originalQty);
    },
    isVipOrKabinaTable() {
      if (!this.selectedTable) return false;
      return this.selectedTable.room_name === "VIP zal" || 
             this.selectedTable.roomName === "VIP zal" || 
             this.selectedTable.room_name === "VIP zona" || 
             this.selectedTable.roomName === "VIP zona" || 
             this.selectedTable.room_name === "Kabina" || 
             this.selectedTable.roomName === "Kabina" || 
             Number(this.selectedTable.vip_price_per_hour || this.selectedTable.vip_price) > 0;
    },
    displayCartItems() {
      if (this.editModeCart && this.editModeCart.length > 0) {
        return this.editModeCart;
      }
      if (this.currentOccupiedOrder) {
        const rawItems = 
          this.currentOccupiedOrder.order_items || 
          this.currentOccupiedOrder.orderItems || 
          this.currentOccupiedOrder.items || 
          this.currentOccupiedOrder.order_details || 
          this.currentOccupiedOrder.orderDetails || 
          this.currentOccupiedOrder.details || 
          this.currentOccupiedOrder.products || 
          this.currentOccupiedOrder.cart_items || 
          this.currentOccupiedOrder.cart || [];

        if (rawItems && rawItems.length > 0) {
          return rawItems.map((item, idx) => {
            const pId = item.product_id !== undefined && item.product_id !== null 
              ? item.product_id 
              : (item.productId !== undefined && item.productId !== null ? item.productId : (item.id || item._id));
            const prod = (this.products || []).find(p => String(p.id) === String(pId) || String(p._id) === String(pId));
            const itemQty = Number(item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1));
            const itemPrice = Number(item.price !== undefined ? item.price : (item.unit_price !== undefined ? item.unit_price : (prod ? prod.price : 0)));
            const itemName = prod ? prod.name : (item.name || item.product_name || item.product?.name || "Taom");
            return {
              productId: pId || `item-${idx}`,
              name: itemName,
              price: itemPrice,
              qty: itemQty,
              originalQty: itemQty
            };
          });
        }
      }
      if (this.selectedTable) {
        const strId = String(this.selectedTable.id || this.selectedTable._id || "");
        const numStr = String(this.selectedTable.table_number || "");
        const tableCart = this.tableCarts[strId] || (numStr ? this.tableCarts[numStr] : null);
        if (tableCart && tableCart.length > 0) {
          return tableCart;
        }
      }
      if (this.cart && this.cart.length > 0) {
        return this.cart;
      }
      if (this.currentOccupiedOrder) {
        const orderAmount = Number(this.currentOccupiedOrder.total_amount || this.currentOccupiedOrder.final_amount || this.currentOccupiedOrder.totalAmount || 0);
        if (orderAmount > 0) {
          return [
            {
              productId: `order-fallback-${this.currentOccupiedOrder.id}`,
              name: `Faol Buyurtma Taomlari`,
              price: orderAmount,
              qty: 1,
              originalQty: 1
            }
          ];
        }
      }
      return [];
    },
    isTimerActive() {
      if (!this.currentOccupiedOrder) return false;
      const orderId = this.currentOccupiedOrder.id;
      const start = this.currentOccupiedOrder.timer_started_at || this.timerStartMap[orderId];
      return !!start;
    },
    vipCalc() {
      // Reference timeCounter so VIP timer ticks live in real-time every second
      const _ticker = this.timeCounter;
      if (!this.currentOccupiedOrder || !this.selectedTable) return null;
      
      const orderId = this.currentOccupiedOrder.id;
      const timerStart = this.currentOccupiedOrder.timer_started_at || this.timerStartMap[orderId];
      const hourlyRate = Number(this.selectedTable?.vip_price_per_hour || this.selectedTable?.vip_price || 0);
      const prevAccumulated = Number(this.accumulatedVipFees[orderId] || 0);

      if (!timerStart) {
        if (prevAccumulated > 0) {
          return {
            startTime: "To'xtatilgan",
            duration: "To'xtatilgan (Hisoblangan)",
            hourlyRate,
            vipFee: prevAccumulated,
            isStopped: true
          };
        }
        return null;
      }

      const startTime = new Date(timerStart);
      const now = new Date();
      const diffMs = now - startTime;
      
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const liveFee = Math.ceil((totalSeconds / 3600) * hourlyRate);
      const vipFee = liveFee + prevAccumulated;

      return {
        startTime: startTime.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        duration: `${hours} soat ${minutes} daqiqa ${seconds} soniya`,
        hourlyRate,
        vipFee,
        isStopped: false
      };
    },
    otherOccupiedTables() {
      if (!this.selectedTable) return [];
      const currentId = String(this.selectedTable.id);

      const activeTableIds = new Set(
        (this.activeOrders || [])
          .filter(o => o.status !== "COMPLETED" && o.status !== "CANCELLED")
          .map(o => String(o.table_id || o.tableId))
      );

      Object.keys(this.tableCarts || {}).forEach(tId => {
        if ((this.tableCarts[tId] || []).length > 0) {
          activeTableIds.add(String(tId));
        }
      });

      const list = (this.tables || []).filter(t => String(t.id) !== currentId);

      const occupiedOnly = list.filter(t => {
        const tId = String(t.id);
        return t.status === "OCCUPIED" || t.status === "FROZEN" || activeTableIds.has(tId);
      });

      return occupiedOnly.length > 0 ? occupiedOnly : list;
    },
    availableTransferTables() {
      if (!this.selectedTable) return [];
      const currentId = String(this.selectedTable.id);
      const currentNumStr = String(this.selectedTable.table_number || "");

      return (this.tables || []).filter(t => {
        const tId = String(t.id);
        const tNumStr = String(t.table_number || "");
        if (tId === currentId) return false;
        if (currentNumStr && tNumStr && tNumStr === currentNumStr) return false;
        return t.status !== "FROZEN";
      });
    },
    mergedOrders() {
      if (!this.selectedMergeTableIds || this.selectedMergeTableIds.length === 0) return [];
      return (this.activeOrders || []).filter(o =>
        this.selectedMergeTableIds.includes(String(o.table_id || o.tableId)) &&
        o.id !== this.currentOccupiedOrder?.id &&
        o.status !== "COMPLETED" && o.status !== "CANCELLED"
      );
    },
    mergedTableNumbers() {
      if (!this.selectedMergeTableIds || this.selectedMergeTableIds.length === 0) return [];
      return this.selectedMergeTableIds.map(tId => {
        const t = (this.tables || []).find(tbl => String(tbl.id) === String(tId));
        return t ? `Stol #${t.table_number}` : `Stol #${tId}`;
      });
    },
    allCombinedItems() {
      if (!this.currentOccupiedOrder) return [];
      const getItems = (o) => o.order_items || o.orderItems || o.items || o.order_details || [];
      const primaryItems = getItems(this.currentOccupiedOrder);
      const secondaryItems = [];
      (this.mergedOrders || []).forEach(o => {
        getItems(o).forEach(item => {
          secondaryItems.push(item);
        });
      });
      const combined = [...primaryItems, ...secondaryItems];
      if (combined.length === 0 && this.editModeCart && this.editModeCart.length > 0) {
        return this.editModeCart.map(c => ({
          product_id: c.productId,
          quantity: c.qty,
          price: c.price,
          subtotal: c.price * c.qty
        }));
      }
      return combined;
    },
    itemsSubtotal() {
      if (!this.currentOccupiedOrder) return 0;
      const items = this.allCombinedItems;
      if (items.length > 0) {
        return items.reduce((sum, item) => sum + Number(item.subtotal || ((item.quantity || 0) * (item.price || 0))), 0);
      }
      return Number(this.currentOccupiedOrder.total_amount || 0);
    },
    bonusCalc() {
      if (!this.currentOccupiedOrder || !this.enableBonus2Plus1) {
        return { totalBonusDiscount: 0, items: [] };
      }
      const itemsList = this.allCombinedItems;
      let totalBonusDiscount = 0;
      const items = [];
      itemsList.forEach(item => {
        const qty = item.quantity || item.qty || 0;
        const name = this.getProductName(item.product_id);
        const unitPrice = item.price || (qty > 0 ? (item.subtotal / qty) : 0);
        if (qty >= 2 && unitPrice > 0) {
          const freeCount = Math.floor(qty / 2);
          const discountVal = freeCount * unitPrice;
          totalBonusDiscount += discountVal;
          items.push({
            product_id: item.product_id,
            name,
            qty,
            freeCount,
            unitPrice,
            discountVal
          });
        }
      });
      return { totalBonusDiscount, items };
    },
    orderRecipeBreakdown() {
      if (!this.allCombinedItems || this.allCombinedItems.length === 0) return [];
      const itemsList = this.allCombinedItems;
      const breakdownMap = {};

      itemsList.forEach(item => {
        const productId = String(item.product_id || item.productId);
        const qtySold = Number(item.quantity || item.qty || 1);
        const prod = (this.products || []).find(p => String(p.id) === productId);
        const prodName = prod ? prod.name : (item.name || "Mahsulot");

        const recipe = (this.recipes || []).find(r => String(r.product_id || r.productId) === productId);

        if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
          recipe.ingredients.forEach(ri => {
            const ingId = String(ri.ingredient_id || ri.ingredientId);
            const ingObj = (this.ingredients || []).find(i => String(i.id) === ingId);
            const ingName = ri.ingredient_name || (ingObj ? ingObj.name : "Masalliq");
            const unit = ri.unit || (ingObj ? ingObj.base_unit : "g");
            const perItemQty = Number(ri.quantity || 0);
            const totalQty = perItemQty * qtySold;

            if (!breakdownMap[ingId]) {
              breakdownMap[ingId] = {
                name: ingName,
                totalQuantity: totalQty,
                unit: unit
              };
            } else {
              breakdownMap[ingId].totalQuantity += totalQty;
            }
          });
        } else {
          const ingObj = (this.ingredients || []).find(i => 
            String(i.id) === productId ||
            (i.name && prodName && i.name.toLowerCase().trim() === prodName.toLowerCase().trim())
          );

          if (ingObj) {
            const ingId = String(ingObj.id);
            const unit = ingObj.base_unit || "dona";
            if (!breakdownMap[ingId]) {
              breakdownMap[ingId] = {
                name: ingObj.name,
                totalQuantity: qtySold,
                unit: unit
              };
            } else {
              breakdownMap[ingId].totalQuantity += qtySold;
            }
          } else if (prodName.toLowerCase().includes("kalyan") || prodName.toLowerCase().includes("qalyon")) {
            const ingId = "EST_TOBACCO";
            const totalQty = 20 * qtySold;
            if (!breakdownMap[ingId]) {
              breakdownMap[ingId] = {
                name: "Qalyon Tamakisi (Kalyan Tobacco)",
                totalQuantity: totalQty,
                unit: "g"
              };
            } else {
              breakdownMap[ingId].totalQuantity += totalQty;
            }
          }
        }
      });

      return Object.values(breakdownMap);
    },
    serviceFeeAmount() {
      const baseAmount = Math.max(0, this.itemsSubtotal - (this.bonusCalc?.totalBonusDiscount || 0));
      if (this.checkoutServiceFeePercent > 0) {
        return Math.round(baseAmount * (this.checkoutServiceFeePercent / 100));
      }
      return 0;
    },
    manualDiscountAmount() {
      const baseAmount = Math.max(0, this.itemsSubtotal - (this.bonusCalc?.totalBonusDiscount || 0));
      if (this.checkoutDiscountPercent > 0) {
        return Math.round(baseAmount * (this.checkoutDiscountPercent / 100));
      }
      return Number(this.checkoutCustomDiscountSum || 0);
    },
    totalDiscountAmount() {
      return (this.bonusCalc?.totalBonusDiscount || 0) + (this.manualDiscountAmount || 0);
    },
    finalOccupiedAmount() {
      if (!this.currentOccupiedOrder) return 0;
      const vipFee = this.vipCalc ? (this.vipCalc.vipFee || 0) : 0;
      const finalVal = this.itemsSubtotal + vipFee + (this.serviceFeeAmount || 0) - this.totalDiscountAmount;
      return Math.max(0, finalVal);
    },
    totalAmount() {
      return this.cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    },
    filteredTables() {
      return this.tables.filter(t => (t.room_name || "Asosiy zal") === this.activeTab);
    },
    filteredProducts() {
      return this.products.filter(p => {
        const matchesCategory = this.selectedCategory === "ALL" || p.category_id === this.selectedCategory || p.categoryId === this.selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    },
  },
  watch: {
    isCheckModalOpen(val) {
      if (val) {
        this.checkoutServiceFeePercent = 25;
      }
    },
    currentOccupiedOrder: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal) {
          this.initEditModeCart();
        } else {
          this.editModeCart = [];
        }
      }
    },
    selectedTable(val) {
      if (!val) {
        this.isMobileCartOpen = false;
        this.editModeCart = [];
      } else {
        if (this.currentTableSessions && this.currentTableSessions.length > 0) {
          const hasSelected = this.currentTableSessions.some(s => s.id === this.selectedSessionId);
          if (!hasSelected) {
            this.selectedSessionId = this.currentTableSessions[0].id;
          }
        }
        this.initEditModeCart();
      }
    },
    selectedSessionId() {
      this.initEditModeCart();
    },
  },
  mounted() {
    this.fetchData();
    this.timerInterval = setInterval(() => {
      this.timeCounter++;
    }, 1000);
    window.addEventListener("sync-complete", this.fetchData);
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    window.removeEventListener("sync-complete", this.fetchData);
  },
  methods: {
    toggleCompactMode() {
      this.compactCardsMode = !this.compactCardsMode;
      localStorage.setItem("pos_compact_mode", this.compactCardsMode ? "true" : "false");
    },
    changeScale(s) {
      appContext.setUiScale(s);
    },
    formatTableTitle(table) {
      if (!table) return "";
      return table.table_number ? `${table.table_number}-stol (${table.room_name || 'Asosiy zal'})` : `Stol #${table.id}`;
    },
    openMergeTablesModal() {
      if (!this.selectedTable) return;
      this.isMergeModalOpen = true;
    },
    openTransferTableModal() {
      if (!this.selectedTable) {
        return appContext.showAlert("Ogohlantirish", "Iltimos, avval ko'chiriladigan stolni tanlang!", "warning");
      }
      this.targetTransferTableId = "";
      this.isTransferModalOpen = true;
    },
    async handleAddCustomProductToCart() {
      if (!this.selectedTable) {
        return appContext.showAlert("Ogohlantirish", "Iltimos, avval stolni tanlang!", "warning");
      }
      if (!this.customItemName || !this.customItemName.trim()) {
        return appContext.showAlert("Ogohlantirish", "Iltimos, mahsulot nomini kiriting!", "warning");
      }
      const priceNum = Number(this.customItemPrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        return appContext.showAlert("Ogohlantirish", "Iltimos, to'g'ri narx kiriting!", "warning");
      }

      const name = this.customItemName.trim();
      const qty = Math.max(1, Number(this.customItemQty || 1));

      let targetProduct = (this.products || []).find(p => p.name.toLowerCase() === name.toLowerCase());

      if (!targetProduct) {
        try {
          const defaultCat = this.categories[0]?.id;
          const { data } = await api.post("/products", {
            name,
            price: priceNum,
            category_id: defaultCat,
            is_active: true
          });
          targetProduct = data;
          this.products.push(targetProduct);
        } catch (err) {
          console.error("Error creating custom product:", err);
          targetProduct = {
            id: "custom_" + Date.now(),
            name,
            price: priceNum
          };
        }
      }

      for (let i = 0; i < qty; i++) {
        this.addToCart(targetProduct);
      }

      appContext.showAlert("Muvaffaqiyatli ⚡", `"${name}" (${priceNum.toLocaleString()} so'm) buyurtmaga qo'shildi!`);
      this.isCustomItemModalOpen = false;
      this.customItemName = "";
      this.customItemPrice = "";
      this.customItemQty = 1;
    },
    async handleTransferTable() {
      if (!this.selectedTable || !this.targetTransferTableId) {
        return appContext.showAlert("Ogohlantirish", "Iltimos, maqsad stolni tanlang!", "warning");
      }
      const fromTableId = String(this.selectedTable.id);
      const toTableId = String(this.targetTransferTableId);
      const fromName = this.selectedTable.table_number ? `${this.selectedTable.table_number}-stol` : this.selectedTable.id;
      const targetTable = this.tables.find(t => String(t.id) === toTableId);
      const toName = targetTable ? (targetTable.table_number ? `${targetTable.table_number}-stol (${targetTable.room_name || 'Zal'})` : targetTable.id) : toTableId;

      try {
        const { data } = await api.post("/orders/transfer-table", {
          fromTableId,
          toTableId,
          user_id: this.state.currentUser?.id,
          user_name: this.state.currentUser?.first_name || 'Xodim'
        });

        if (this.tableCarts[fromTableId] && this.tableCarts[fromTableId].length > 0) {
          this.tableCarts[toTableId] = [...(this.tableCarts[toTableId] || []), ...this.tableCarts[fromTableId]];
          delete this.tableCarts[fromTableId];
        }

        this.isTransferModalOpen = false;
        this.targetTransferTableId = "";

        const alertMsg = data?.isTargetOccupied
          ? `${fromName} dagi buyurtma ${toName} ga YANGI SEANS (Sessiya) bo'lib qo'shildi!`
          : `${fromName} dagi buyurtma ${toName} ga ko'chirildi!`;

        appContext.showAlert("Muvaffaqiyatli 🔀", alertMsg);
        await this.fetchData();
        if (targetTable) {
          this.selectedTable = targetTable;
        }
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", err.response?.data?.error || err.message || "Stolni ko'chirishda xatolik");
      }
    },
    getTableSessionsCount(tableParam) {
      if (!tableParam) return 0;
      let strId = "";
      let tableNumStr = "";

      if (typeof tableParam === "object") {
        strId = String(tableParam.id || tableParam._id || "");
        tableNumStr = String(tableParam.table_number || tableParam.tableNumber || "");
      } else {
        strId = String(tableParam);
        const tbl = (this.tables || []).find(x => String(x.id) === strId || String(x._id) === strId || String(x.table_number) === strId);
        if (tbl) {
          strId = String(tbl.id || tbl._id || strId);
          tableNumStr = String(tbl.table_number || "");
        } else {
          tableNumStr = strId;
        }
      }

      const orders = (this.activeOrders || []).filter(o => {
        if (o.status === "COMPLETED" || o.status === "CANCELLED") return false;
        const oTableId = String(o.table_id || o.tableId || "");
        const oTableNum = String(o.table_number || o.tableNumber || "");
        
        const matchId = strId && (oTableId === strId || oTableNum === strId);
        const matchNum = tableNumStr && (oTableId === tableNumStr || oTableNum === tableNumStr);

        return matchId || matchNum;
      });

      const hasCart = (this.tableCarts[strId] || []).length > 0 || (tableNumStr && (this.tableCarts[tableNumStr] || []).length > 0);
      let count = orders.length;
      if (count === 0 && hasCart) count = 1;

      return count;
    },
    setServiceFeePercent(p) {
      this.checkoutServiceFeePercent = p;
      localStorage.setItem("waiter_service_fee_percent", String(p));
    },
    isTableOccupied(t) {
      if (!t) return false;
      if (t.status === 'OCCUPIED' || t.status === 'FROZEN') return true;
      return this.getTableSessionsCount(t) > 0;
    },
    getTableDisplayStatus(t) {
      if (!t) return 'AVAILABLE';

      const sessionsCount = this.getTableSessionsCount(t);
      if (sessionsCount > 1) return 'MULTI_SESSION';
      if (sessionsCount === 1) return 'OCCUPIED';

      if (t.status === 'FROZEN') return 'FROZEN';
      if (t.status === 'RESERVED') return 'RESERVED';
      if (t.status === 'OCCUPIED') return 'OCCUPIED';

      return 'AVAILABLE';
    },
    getTableItemsCount(tableId) {
      const strId = String(tableId);
      const orders = (this.activeOrders || []).filter(o =>
        String(o.table_id || o.tableId) === strId &&
        o.status !== "COMPLETED" && o.status !== "CANCELLED"
      );
      const orderCount = orders.reduce((acc, o) => acc + (o.order_items || []).reduce((s, i) => s + (i.quantity || 0), 0), 0);
      const cartCount = (this.tableCarts[strId] || []).reduce((s, i) => s + (i.qty || 0), 0);
      return orderCount + cartCount;
    },
    initEditModeCart() {
      if (!this.currentOccupiedOrder) {
        this.editModeCart = [];
        return;
      }
      let items = this.currentOccupiedOrder.order_items || 
                  this.currentOccupiedOrder.orderItems || 
                  this.currentOccupiedOrder.items || 
                  this.currentOccupiedOrder.order_details || [];

      if ((!items || items.length === 0) && this.selectedTable) {
        const strId = String(this.selectedTable.id);
        const numStr = String(this.selectedTable.table_number || "");
        const draftCart = this.tableCarts[strId] || (numStr ? this.tableCarts[numStr] : null) || this.cart;
        if (draftCart && draftCart.length > 0) {
          items = draftCart.map(c => ({
            product_id: c.productId,
            name: c.name,
            price: c.price,
            quantity: c.qty
          }));
        }
      }

      this.editModeCart = items.map((item, idx) => {
        const pId = item.product_id !== undefined && item.product_id !== null 
          ? item.product_id 
          : (item.productId !== undefined && item.productId !== null ? item.productId : item.id);

        const prod = (this.products || []).find(p => String(p.id) === String(pId));
        const itemQty = Number(item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1));
        const itemPrice = Number(item.price !== undefined ? item.price : (prod ? prod.price : 0));
        const itemName = prod ? prod.name : (item.name || item.product_name || item.product?.name || "Taom");

        return {
          productId: pId || `item-${idx}`,
          name: itemName,
          price: itemPrice,
          qty: itemQty,
          originalQty: itemQty
        };
      });
      this.editReason = "";
    },
    async saveOrderEdits() {
      if (!this.currentOccupiedOrder) return;
      const changedItems = this.editModeCart.filter(item => item.qty !== item.originalQty);
      if (changedItems.length === 0) {
        return appContext.showAlert("Ogohlantirish", "Hech qanday o'zgarish qilinmagan!", "info");
      }
      const requiresReason = changedItems.some(item => item.qty < item.originalQty);
      if (requiresReason && !this.editReason.trim()) {
        return appContext.showAlert("Xatolik", "Iltimos, o'zgarish sababini kiriting!", "error");
      }

      const payloadItems = this.editModeCart.map(item => ({
        product_id: item.productId,
        quantity: item.qty,
        price: item.price,
        reason: this.editReason || "Buyurtma o'zgartirildi"
      }));

      try {
        await api.post(`/orders/${this.currentOccupiedOrder.id}/items/edit`, {
          items: payloadItems,
          user_role: this.state.role,
          user_name: this.state.currentUser?.first_name || 'Ofitsiant'
        });

        this.editModeCart = this.editModeCart
          .filter(item => item.qty > 0)
          .map(item => ({ ...item, originalQty: item.qty }));

        if (this.selectedTable) {
          const strId = String(this.selectedTable.id || this.selectedTable._id || "");
          const numStr = String(this.selectedTable.table_number || "");
          const savedCart = this.editModeCart.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            qty: i.qty
          }));
          this.tableCarts = {
            ...this.tableCarts,
            [strId]: savedCart,
            ...(numStr ? { [numStr]: savedCart } : {})
          };
        }

        appContext.showAlert("Muvaffaqiyatli", "Buyurtma saqlandi va yangilandi!");
        this.fetchData();
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.error || err.message || "Buyurtmani tahrirlashda xatolik yuz berdi";
        if (this.state.role === "WAITER" && requiresReason) {
          appContext.showAlert("🚨 Kassirga So'rov Yuborildi", errorMsg, "warning");
          this.fetchData();
        } else {
          appContext.showAlert("Xatolik", errorMsg, "error");
        }
      }
    },
    async toggleTableFreeze() {
      if (!this.selectedTable) return;
      const nextStatus = (this.selectedTable.status === "FROZEN" || this.selectedTable.is_frozen) ? "unfreeze" : "freeze";
      try {
        await api.post(`/restaurant-tables/${this.selectedTable.id}/${nextStatus}`, { reason: 'Hold mode / Mijoz vaqtincha ketdi' });
        appContext.showAlert("Muvaffaqiyatli", nextStatus === "freeze" ? "Stol muzlatildi! (Hold mode)" : "Stol muzdan yechildi!");
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Stol holatini o'zgartirishda xatolik yuz berdi", "error");
      }
    },
    handleCreateSession() {
      if (!this.selectedTable) return;
      const num = (this.currentTableSessions || []).length + 1;
      this.newSessionName = `Sessiya #${num}`;
      this.isCreateSessionModalOpen = true;
    },
    async submitCreateSession() {
      if (!this.selectedTable) return;
      const num = (this.currentTableSessions || []).length + 1;
      const sessionName = (this.newSessionName || "").trim() || `Sessiya #${num}`;
      try {
        const branchId = appContext.state.currentUser?.branch_id || '000000000000000000000001';
        const { data } = await api.post('/orders/sessions/open', {
          table_id: this.selectedTable.id,
          session_name: sessionName,
          branch_id: branchId
        });
        this.isCreateSessionModalOpen = false;
        appContext.showAlert("Muvaffaqiyatli", `Yangi sessiya ochildi: "${sessionName}"`);
        if (data && data.id) {
          this.selectedSessionId = data.id;
        }
        await this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Yangi sessiya ochishda xatolik yuz berdi", "error");
      }
    },
    async openTableTimeline() {
      if (!this.selectedTable) return;
      this.isTimelineOpen = true;
      this.timelineLoading = true;
      try {
        const { data } = await api.get(`/restaurant-tables/${this.selectedTable.id}/timeline`);
        this.timelineData = (data || []).sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Timeline yuklashda xatolik yuz berdi", "error");
      } finally {
        this.timelineLoading = false;
      }
    },
    formatDateTime(dateString) {
      if (!dateString) return "";
      try {
        return new Date(dateString).toLocaleString("uz-UZ");
      } catch {
        return dateString;
      }
    },
    formatNumber(num) {
      if (num === undefined || num === null) return "0";
      return Number(num).toLocaleString();
    },
    imageLoadError(e) {
      e.target.style.opacity = "0";
    },
    getProductName(prodId) {
      const p = this.products.find(prod => prod.id === prodId);
      return p ? p.name : "Noma'lum";
    },
    getProductImage(prodId) {
      const p = this.products.find(prod => prod.id === prodId);
      if (p && p.image && p.image.trim().length > 0) return p.image;
      const name = (p?.name || '').toLowerCase();
      if (name.includes('kalyan') || name.includes('qalyon') || name.includes('hookah') || name.includes('tamaki')) {
        return KALYAN_SVG;
      }
      if (name.includes('suv') || name.includes('water') || name.includes('cola') || name.includes('pepsi') || name.includes('ichimlik') || name.includes('fanta') || name.includes('sok')) {
        return WATER_SVG;
      }
      return SNACK_SVG;
    },
    getProductCategoryName(p) {
      const categoryId = p.category_id || p.categoryId;
      const cat = this.categories.find(c => c.id === categoryId);
      return cat ? cat.name : "";
    },
    getCategoryGradient(idx) {
      const gradients = [
        "from-orange-900/80 to-amber-800/60",
        "from-red-900/80 to-rose-800/60",
        "from-green-900/80 to-emerald-800/60",
        "from-blue-900/80 to-indigo-800/60",
        "from-purple-900/80 to-violet-800/60",
        "from-teal-900/80 to-cyan-800/60",
        "from-yellow-900/80 to-amber-700/60",
      ];
      return gradients[idx % gradients.length];
    },
    getCategoryEmoji(idx) {
      const foodEmojis = ["🍽️", "🥩", "🥗", "🍜", "🍢", "🥤", "🍖", "🍛", "🫕", "🥙"];
      return foodEmojis[idx % foodEmojis.length];
    },
    getOrderDisplayId(order) {
      if (!order) return "#1";
      if (order.session_number) return `#${order.session_number}`;
      const str = String(order.id || "");
      if (str.length > 6) {
        const num = (parseInt(str.slice(-6), 16) % 9000) + 1000;
        return `#${num}`;
      }
      return `#${str}`;
    },
    hasCartItem(prodId) {
      if (this.currentOccupiedOrder) {
        return (this.editModeCart || []).some(item => item.productId === prodId && item.qty > 0);
      }
      return this.cart.some(item => item.productId === prodId);
    },
    getCartItemQty(prodId) {
      if (this.currentOccupiedOrder) {
        const item = (this.editModeCart || []).find(item => item.productId === prodId);
        return item ? item.qty : 0;
      }
      const item = this.cart.find(item => item.productId === prodId);
      return item ? item.qty : 0;
    },
    goBackToTables() {
      this.selectedTable = null;
      this.updateCartForTable([]);
      this.isMobileCartOpen = false;
    },
    updateCartForTable(newCart) {
      if (!this.selectedTable) return;
      this.tableCarts = {
        ...this.tableCarts,
        [this.selectedTable.id]: newCart,
      };
    },
    clearCurrentCart() {
      if (this.currentOccupiedOrder && this.state.role === "WAITER") {
        return appContext.showAlert(
          "Ruxsat Etilmadi ⚠️",
          "Saqlangan buyurtmalarni o'chirish yoki bekor qilish huquqi faqat Kassir va Adminga berilgan!",
          "warning"
        );
      }
      this.updateCartForTable([]);
    },
    addToCart(product) {
      if (!this.selectedTable) {
        return appContext.showAlert("Xatolik", "Taom qo'shish uchun oldin stolni tanlang!", "error");
      }
      appContext.addNotification("Taom Qo'shildi", `${this.selectedTable ? (this.selectedTable.table_number + '-stol: ') : ''}${product.name} qo'shildi`, 'INFO');
      if (this.currentOccupiedOrder) {
        const existing = this.editModeCart.find(item => item.productId === product.id);
        if (existing) {
          existing.qty += 1;
        } else {
          this.editModeCart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            originalQty: 0
          });
        }
        return;
      }
      const existing = this.cart.find(c => c.productId === product.id);
      if (existing) {
        this.updateCartForTable(
          this.cart.map(c => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c))
        );
      } else {
        this.updateCartForTable([
          ...this.cart,
          { productId: product.id, name: product.name, price: product.price, image: product.image, qty: 1 },
        ]);
      }
    },
    updateQty(productId, delta) {
      if (this.currentOccupiedOrder && this.state.role === "WAITER" && delta < 0) {
        const target = this.editModeCart.find(item => item.productId === productId);
        if (target && target.qty <= target.originalQty) {
          appContext.showAlert(
            "Ofitsiant Cheklovi",
            "Ofitsiant tayyor buyurtmadagi taomni o'zi minus qila olmaydi! Kamaytirish uchun pastda sababni yozib 'Saqlash' tugmasini bosing, so'rov Kassirga yuboriladi.",
            "warning"
          );
        }
      }
      appContext.addNotification("Miqdor O'zgardi", `${this.selectedTable ? (this.selectedTable.table_number + '-stol: ') : ''}taom miqdori ${delta > 0 ? '+' : ''}${delta} ga o'zgardi`, 'INFO');
      if (this.currentOccupiedOrder) {
        this.editModeCart = this.editModeCart.map(item => {
          if (item.productId === productId) {
            const newQty = Math.max(0, item.qty + delta);
            return { ...item, qty: newQty };
          }
          return item;
        });
        return;
      }
      this.updateCartForTable(
        this.cart.map(c => {
          if (c.productId === productId) {
            const newQty = c.qty + delta;
            return newQty > 0 ? { ...c, qty: newQty } : c;
          }
          return c;
        })
      );
    },
    removeFromCart(productId) {
      if (this.currentOccupiedOrder && this.state.role === "WAITER") {
        const target = this.editModeCart.find(item => item.productId === productId);
        if (target && target.originalQty > 0) {
          appContext.showAlert(
            "Ofitsiant Cheklovi",
            "Ofitsiant tayyor buyurtmadagi taomni o'chirib yubora olmaydi! O'chirish/kamaytirish sababini yozib 'Saqlash' tugmasini bosing, so'rov Kassirga yuboriladi.",
            "warning"
          );
        }
      }
      appContext.addNotification("Taom Olib Tashlandi", `${this.selectedTable ? (this.selectedTable.table_number + '-stol: ') : ''}taom olib tashlandi`, 'WARNING');
      if (this.currentOccupiedOrder) {
        this.editModeCart = this.editModeCart.map(item => {
          if (item.productId === productId) {
            return { ...item, qty: 0 };
          }
          return item;
        });
        return;
      }
      this.updateCartForTable(this.cart.filter(c => c.productId !== productId));
    },
    markNotificationAsRead(id) {
      if (!this.readNotificationIds.includes(id)) {
        this.readNotificationIds.push(id);
      }
    },
    markAllNotificationsAsRead() {
      this.readNotificationIds = this.notificationsList.map(n => n.id);
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      appContext.showAlert('Ovoz', this.soundEnabled ? 'Bildirishnoma ovozi yoqildi' : 'Bildirishnoma ovozi o\'chirildi', 'info');
    },
    async fetchData() {
      try {
        if (this.tables.length === 0) {
          this.loading = true;
        }
        const [tablesRes, productsRes, customersRes, ordersRes, categoriesRes, ingredientsRes, recipesRes] = await Promise.all([
          api.get("/restaurant-tables").catch(() => ({ data: this.tables || [] })),
          api.get("/products").catch(() => ({ data: this.products || [] })),
          api.get("/customers").catch(() => ({ data: this.customers || [] })),
          api.get("/orders").catch(() => ({ data: [] })),
          api.get("/categories").catch(() => ({ data: this.categories || [] })),
          api.get("/ingredients").catch(() => ({ data: [] })),
          api.get("/recipes").catch(() => ({ data: [] }))
        ]);
        const rawTables = tablesRes.data || [];
        if (rawTables.length > 0) {
          this.tables = rawTables.map((t, idx) => {
            const num = (t.table_number !== undefined && t.table_number !== null && String(t.table_number).trim() !== '')
              ? t.table_number
              : (idx + 1);
            return {
              ...t,
              table_number: num
            };
          });
        }
        if (productsRes.data && productsRes.data.length > 0) this.products = productsRes.data;
        if (customersRes.data) this.customers = customersRes.data;
        if (categoriesRes.data && categoriesRes.data.length > 0) this.categories = categoriesRes.data;
        if (ingredientsRes.data) this.ingredients = ingredientsRes.data;
        if (recipesRes.data) this.recipes = recipesRes.data;

        let fetchedOrders = ordersRes.data || [];
        const role = this.state.role;
        const currentUser = this.state.currentUser;
        if (role === "WAITER" && currentUser?.id) {
          fetchedOrders = fetchedOrders.filter(
            o =>
              o.waiter_id === currentUser.id ||
              o.waiterId === currentUser.id ||
              o.waiter_id === null ||
              o.waiter_id === undefined ||
              o.waiterId === null ||
              o.waiterId === undefined
          );
        }
        
        const newActiveOrders = fetchedOrders.filter(
          o => o.status !== "COMPLETED" && o.status !== "CANCELLED"
        );

        if (this.activeOrders.length > 0) {
          const newlyReady = newActiveOrders.find(newOrder => {
            const oldOrder = this.activeOrders.find(o => o.id === newOrder.id);
            return oldOrder && oldOrder.status !== "READY" && newOrder.status === "READY";
          });
          if (newlyReady) {
            appContext.playNotificationSound("success");
            appContext.showAlert("Taom tayyor!", `Stol ${newlyReady.tableId || newlyReady.table_id || '-'} buyurtmasi tayyor bo'ldi!`, "success");
          }
        }
        this.activeOrders = newActiveOrders;
        this.initEditModeCart();
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async handleSendOrder() {
      if (!this.selectedTable) return appContext.showAlert("Xatolik", "Stol tanlanmagan!", "error");
      if (this.cart.length === 0) return appContext.showAlert("Xatolik", "Savatcha bo'sh!", "error");

      try {
        const currentUser = this.state.currentUser;
        if (this.currentOccupiedOrder) {
          for (const item of this.cart) {
            await api.post("/order-items", {
              order_id: this.currentOccupiedOrder.id,
              product_id: item.productId,
              quantity: item.qty,
              price: item.price,
              subtotal: item.price * item.qty,
              kitchen_status: "PENDING",
            });
          }
          const newTotal = Number(this.currentOccupiedOrder.total_amount) + this.totalAmount;
          await api.put(`/orders/${this.currentOccupiedOrder.id}`, {
            total_amount: newTotal,
            final_amount: newTotal,
          });
          appContext.showAlert("Muvaffaqiyatli", "Buyurtmaga yangi taomlar qo'shildi!");
        } else {
          const payload = {
            branch_id: currentUser?.branch_id || "000000000000000000000001",
            table_id: this.selectedTable.id,
            customer_id: this.selectedCustomer ? this.selectedCustomer : null,
            waiter_id: currentUser?.id && currentUser.id !== 99999 ? currentUser.id : null,
            source: "DINE_IN",
            order_type: "STANDARD",
            status: "ACCEPTED",
            total_amount: this.totalAmount,
            final_amount: this.totalAmount,
            order_items: {
              create: this.cart.map(c => ({
                product_id: c.productId,
                quantity: c.qty,
                price: c.price,
                subtotal: c.price * c.qty,
                kitchen_status: "PENDING",
              })),
            },
          };
          await api.post("/orders", payload);
          await api.put(`/restaurant-tables/${this.selectedTable.id}`, { status: "OCCUPIED" });
          appContext.showAlert("Muvaffaqiyatli", "Yangi buyurtma yaratildi va stol band qilindi!");
        }

        this.updateCartForTable([]);
        this.selectedCustomer = "";
        this.selectedTable = null;
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Buyurtmani saqlashda xatolik yuz berdi", "error");
      }
    },
    
    toggleMergeTable(tableId) {
      const strId = String(tableId);
      const idx = this.selectedMergeTableIds.indexOf(strId);
      if (idx > -1) {
        this.selectedMergeTableIds.splice(idx, 1);
      } else {
        this.selectedMergeTableIds.push(strId);
      }
    },
    getTableTotalSum(tableId) {
      const strId = String(tableId);
      const orders = (this.activeOrders || []).filter(o =>
        String(o.table_id || o.tableId) === strId &&
        o.status !== "COMPLETED" && o.status !== "CANCELLED"
      );
      const orderSum = orders.reduce((acc, o) => {
        const items = o.order_items || [];
        const itemsSum = items.reduce((s, i) => s + Number(i.subtotal || ((i.quantity || 0) * (i.price || 0)) || 0), 0);
        return acc + (itemsSum || Number(o.total_amount || 0));
      }, 0);

      const cartSum = (this.tableCarts[strId] || []).reduce((s, i) => s + ((i.qty || 0) * (i.price || 0)), 0);
      return orderSum + cartSum;
    },
    async handleCloseTablePayment() {
      if (!this.currentOccupiedOrder) return;
      try {
        const orderId = this.currentOccupiedOrder.id;
        const totalAmount = this.finalOccupiedAmount;
        const discountAmount = this.totalDiscountAmount || 0;
        const payMethod = this.checkoutPaymentMethod || "CASH";

        // Create main payment record
        await api.post("/payments", {
          order_id: orderId,
          amount: totalAmount,
          payment_method: payMethod,
          status: "COMPLETED",
          paid_at: new Date().toISOString()
        });

        // Update primary order status
        await api.put(`/orders/${orderId}`, {
          status: "COMPLETED",
          session_status: "PAID",
          closed_at: new Date().toISOString(),
          discount_amount: discountAmount,
          final_amount: totalAmount
        });

        // Pay and close any merged secondary orders
        if (this.mergedOrders && this.mergedOrders.length > 0) {
          for (const mOrder of this.mergedOrders) {
            await api.put(`/orders/${mOrder.id}`, {
              status: "COMPLETED",
              session_status: "PAID",
              closed_at: new Date().toISOString(),
              final_amount: 0,
              notes: `Birlashtirilgan shot: #${orderId.slice(-6)} bilan birga yopildi`
            });
          }
        }

        // Set primary table to AVAILABLE if no other active orders left
        if (this.selectedTable) {
          const remainingOrders = (this.activeOrders || []).filter(
            o => (String(o.table_id || o.tableId) === String(this.selectedTable.id)) &&
                 o.id !== orderId &&
                 o.status !== "COMPLETED" && o.status !== "CANCELLED"
          );
          if (remainingOrders.length === 0) {
            await api.put(`/restaurant-tables/${this.selectedTable.id}`, { status: "AVAILABLE" });
          }
        }

        // Set all merged secondary tables to AVAILABLE
        if (this.selectedMergeTableIds && this.selectedMergeTableIds.length > 0) {
          for (const mTableId of this.selectedMergeTableIds) {
            await api.put(`/restaurant-tables/${mTableId}`, { status: "AVAILABLE" });
          }
        }

        const mergedCount = this.selectedMergeTableIds.length;
        this.selectedMergeTableIds = [];
        this.isCheckModalOpen = false;

        appContext.playNotificationSound("success");
        const alertMsg = mergedCount > 0
          ? `Birlashgan ${mergedCount + 1} ta stol shoti muvaffaqiyatli yopildi! Summa: ${this.formatNumber(totalAmount)} so'm (${payMethod})`
          : `Buyurtma muvaffaqiyatli yopildi! Summa: ${this.formatNumber(totalAmount)} so'm (${payMethod})`;

        appContext.showAlert("To'lov Qabul Qilindi ✓", alertMsg, "success");
        this.selectedTable = null;
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Sessiyani yopishda xatolik yuz berdi!", "error");
      }
    },
    handleDeleteSession(session) {
      if (!session) return;
      this.selectedSessionId = session.id;

      const role = this.state.role;
      const isAllowed = role === "SUPERADMIN" || role === "ADMIN" || role === "CASHIER" || role === "MANAGER";
      if (!isAllowed) {
        return appContext.showAlert(
          "Ruxsat Etilmadi ⚠️",
          "Sessiyani bekor qilish yoki o'chirish huquqi faqat Kassir va Adminga berilgan!",
          "warning"
        );
      }

      const sessionAmount = Number(
        session.final_amount ||
        session.total_amount ||
        session.totalAmount ||
        0
      );

      const openCancelForm = () => {
        this.cancelReason = this.cancellationReasons[0];
        this.isCancelDropdownOpen = false;
        this.isCancelModalOpen = true;
      };

      if (sessionAmount > 0) {
        appContext.showConfirm(
          "⚠️ Ogohlantirish: To'lanmagan Summa Mavjud!",
          `'${session.session_name || 'Sessiya'}' da ${this.formatNumber(sessionAmount)} so'm to'lanmagan buyurtma summasi mavjud. Haqiqatdan ham ushbu sessiyani to'lovsiz bekor qilmoqchimisiz / o'chirmoqchimisiz?`,
          openCancelForm
        );
      } else {
        openCancelForm();
      }
    },
    handleCancelOrder() {
      if (!this.currentOccupiedOrder) return;

      const role = this.state.role;
      const isAllowed = role === "SUPERADMIN" || role === "ADMIN" || role === "CASHIER" || role === "MANAGER";
      if (!isAllowed) {
        return appContext.showAlert(
          "Ruxsat Etilmadi ⚠️",
          "Sessiyani bekor qilish yoki o'chirish huquqi faqat Kassir va Adminga berilgan!",
          "warning"
        );
      }

      const sessionAmount = Number(
        this.currentOccupiedOrder.final_amount ||
        this.currentOccupiedOrder.total_amount ||
        this.currentOccupiedOrder.totalAmount ||
        this.itemsSubtotal ||
        0
      );

      const openCancelForm = () => {
        this.cancelReason = this.cancellationReasons[0];
        this.isCancelDropdownOpen = false;
        this.isCancelModalOpen = true;
      };

      if (sessionAmount > 0) {
        appContext.showConfirm(
          "⚠️ Ogohlantirish: To'lanmagan Summa Mavjud!",
          `Ushbu sessiyada ${this.formatNumber(sessionAmount)} so'm to'lanmagan buyurtma summasi mavjud. Haqiqatdan ham ushbu sessiyani to'lovsiz bekor qilmoqchimisiz / o'chirmoqchimisiz?`,
          openCancelForm
        );
      } else {
        openCancelForm();
      }
    },
    selectCancelReason(reason) {
      this.cancelReason = reason;
      this.isCancelDropdownOpen = false;
    },
    async handleConfirmCancel() {
      const role = this.state.role;
      const isAllowed = role === "SUPERADMIN" || role === "ADMIN" || role === "CASHIER" || role === "MANAGER";
      if (!isAllowed) {
        return appContext.showAlert(
          "Ruxsat Etilmadi ⚠️",
          "Buyurtmani bekor qilish huquqi faqat Kassir va Adminga berilgan!",
          "warning"
        );
      }
      if (!this.cancelReason) return appContext.showAlert("Xatolik", "Iltimos, bekor qilish sababini tanlang!", "error");
      try {
        const targetOrder = this.currentOccupiedOrder;
        if (targetOrder && targetOrder.id) {
          await api.put(`/orders/${targetOrder.id}`, {
            status: "CANCELLED",
            session_status: "CANCELLED",
            notes: this.cancelReason,
          });
        }

        if (this.selectedTable) {
          const tableIdStr = String(this.selectedTable.id);
          const tableNumStr = String(this.selectedTable.table_number || "");

          const remainingOrders = (this.activeOrders || []).filter(o => {
            if (targetOrder && String(o.id) === String(targetOrder.id)) return false;
            if (o.status === "COMPLETED" || o.status === "CANCELLED") return false;
            const oTableId = String(o.table_id || o.tableId || "");
            const oTableNum = String(o.table_number || o.tableNumber || "");
            return oTableId === tableIdStr || oTableId === tableNumStr || oTableNum === tableNumStr;
          });

          if (remainingOrders.length === 0) {
            delete this.tableCarts[tableIdStr];
            if (tableNumStr) delete this.tableCarts[tableNumStr];
            await api.put(`/restaurant-tables/${this.selectedTable.id}`, { status: "AVAILABLE" });
          } else {
            this.selectedSessionId = remainingOrders[0].id;
          }
        }

        this.isCancelModalOpen = false;
        appContext.showAlert("Muvaffaqiyatli", "Sessiya bekor qilindi!");
        await this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Bekor qilishda xatolik yuz berdi", "error");
      }
    },
    openReservationForm() {
      this.reservationName = "";
      this.reservationPhone = "";
      this.reservationNote = "";
      const now = new Date();
      now.setMinutes(now.getMinutes() + 60);
      this.reservationTime = now.toTimeString().slice(0, 5);
      this.isReservationModalOpen = true;
    },
    async submitReservation() {
      try {
        await api.put(`/restaurant-tables/${this.selectedTable.id}`, { status: "RESERVED" });
        this.reservationData = {
          ...this.reservationData,
          [this.selectedTable.id]: {
            name: this.reservationName,
            phone: this.reservationPhone,
            time: this.reservationTime,
            note: this.reservationNote,
            createdAt: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
          },
        };
        this.isReservationModalOpen = false;
        appContext.showAlert("Bron Qilindi ✓", `Stol #${this.selectedTable.table_number} muvaffaqiyatli bron qilindi. Hech qanday pul olinmadi!`);
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Bron qilishda xatolik yuz berdi", "error");
      }
    },
    async clientArrived() {
      try {
        await api.put(`/restaurant-tables/${this.selectedTable.id}`, { status: "OCCUPIED" });
        appContext.showAlert("Muvaffaqiyatli", "Stol band qilindi! Endi buyurtma olishingiz mumkin.");
        this.fetchData();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Stol statusini o'zgartirishda xatolik");
      }
    },
    cancelReservation() {
      appContext.showConfirm("Bronni bekor qilish", "Mijoz kelmadi. Bron bekor qilinadi. Hech qanday pul olinmaydi.", async () => {
        try {
          await api.put(`/restaurant-tables/${this.selectedTable.id}`, { status: "AVAILABLE" });
          const nextRes = { ...this.reservationData };
          delete nextRes[this.selectedTable.id];
          this.reservationData = nextRes;
          appContext.showAlert("Bekor qilindi", "Bron bekor qilindi. Hech qanday pul olinmadi. Stol bo'shatildi.");
          this.fetchData();
        } catch (err) {
          console.error(err);
          appContext.showAlert("Xatolik", "Bron bekor qilishda xatolik");
        }
      });
    },
    printReceipt() {
      const printContent = document.getElementById("printable-receipt")?.innerHTML || "";
      const paperWidth = localStorage.getItem("printer_paper_width") || "80mm";
      const printWindow = window.open("", "", "height=700,width=450");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>OHLALA RESTAURANT - CHEK</title>
            <style>
              @page { margin: 0; size: ${paperWidth} auto; }
              body {
                font-family: 'Courier New', Courier, monospace;
                width: ${paperWidth};
                margin: 0 auto;
                padding: 10px;
                color: #000;
                font-size: 11px;
                line-height: 1.2;
                background: #fff;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .border-b { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
              .border-t { border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px; }
              .flex { display: flex; justify-content: space-between; }
              @media print {
                body { width: 100%; padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 600);
              };
            ` + `</` + `script>
          </body>
        </html>
      `);
      printWindow.document.close();
    },
    // --- Table Management from POS ---
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
        const nextNumber = this.tables.length > 0 ? Math.max(...this.tables.map((t, i) => Number(t.table_number || (i + 1)) || 0)) + 1 : 1;
        this.tableNumber = nextNumber ? String(nextNumber) : "1";
        this.tableSeats = 4;
        this.tableStatus = "AVAILABLE";
        this.roomName = this.activeTab || "Asosiy zal";
        this.vipPricePerHour = 0;
      }
      this.isTableModalOpen = true;
    },
    async handleSaveTable() {
      try {
        const payload = {
          branch_id: this.state.currentUser?.branch_id || "000000000000000000000001",
          table_number: String(this.tableNumber).trim(),
          seats: Number(this.tableSeats || 4),
          status: this.tableStatus || "AVAILABLE",
          room_name: this.roomName || "Asosiy zal",
          vip_price_per_hour: Number(this.vipPricePerHour || 0),
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
      appContext.showConfirm("Stolni o'chirish", "Haqiqatan ham ushbu stolni o'chirmoqchimisiz?", async () => {
        try {
          await api.delete(`/restaurant-tables/${id}`);
          this.selectedTable = null;
          this.fetchData();
          appContext.showAlert("Muvaffaqiyatli", "Stol o'chirildi");
        } catch (err) {
          console.error(err);
          appContext.showAlert("Xatolik", "O'chirishda xatolik yuz berdi", "error");
        }
      });
    },
    async startVipTimer() {
      if (!this.currentOccupiedOrder) return;
      const nowIso = new Date().toISOString();
      const orderId = this.currentOccupiedOrder.id;
      
      this.timerStartMap = {
        ...this.timerStartMap,
        [orderId]: nowIso
      };
      localStorage.setItem("kitchen_vip_timer_map", JSON.stringify(this.timerStartMap));
      
      try {
        await api.put(`/orders/${orderId}`, { timer_started_at: nowIso });
        this.currentOccupiedOrder.timer_started_at = nowIso;
      } catch (e) {}

      appContext.addNotification("Timer Boshlandi ⏱️", "Vaqt hisoblash boshlandi!", "INFO");
    },
    async stopVipTimer() {
      if (!this.currentOccupiedOrder) return;
      const orderId = this.currentOccupiedOrder.id;
      if (this.vipCalc && this.vipCalc.vipFee) {
        const finalFee = this.vipCalc.vipFee;
        this.accumulatedVipFees = {
          ...this.accumulatedVipFees,
          [orderId]: finalFee
        };
        localStorage.setItem("kitchen_vip_accumulated_map", JSON.stringify(this.accumulatedVipFees));
      }
      const newMap = { ...this.timerStartMap };
      delete newMap[orderId];
      this.timerStartMap = newMap;
      localStorage.setItem("kitchen_vip_timer_map", JSON.stringify(this.timerStartMap));
      
      try {
        await api.put(`/orders/${orderId}`, { timer_started_at: null });
        this.currentOccupiedOrder.timer_started_at = null;
      } catch (e) {}

      appContext.addNotification("Timer To'xtatildi ⏹️", "Vaqt hisobi to'xtatildi va hisoblangan summa saqlandi!", "WARNING");
    },
  },
};
</script>
