<template>
  <div class="flex flex-col h-full gap-6 overflow-y-auto p-6 bg-[#0f1117] text-white">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181b25] border border-[#2a2e3d] p-6 rounded-2xl">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-3">
          <Package class="h-7 w-7 text-blue-500 shrink-0" />
          <span>Ombor & Masalliqlar Zaxirasi</span>
        </h1>
        <p class="text-xs text-[#94a3b8] mt-1">
          Barcha masalliqlar, tamaki turlari, avtomatik birlik o'tkazish va harakatlar
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="activeTab = 'ingredients'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5',
            activeTab === 'ingredients'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-500/20'
              : 'bg-[#1e2230] border-[#2a2e3d] text-[#94a3b8] hover:text-white'
          ]"
        >
          <FlaskConical class="h-3.5 w-3.5" /> Masalliqlar
        </button>
        <button
          @click="activeTab = 'movements'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5',
            activeTab === 'movements'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-500/20'
              : 'bg-[#1e2230] border-[#2a2e3d] text-[#94a3b8] hover:text-white'
          ]"
        >
          <History class="h-3.5 w-3.5" /> Ombor Harakatlari
        </button>
        <button
          v-if="appContext.hasPermission('adjust_inventory')"
          @click="openAddModal"
          class="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus class="h-4 w-4" /> Masalliq Qo'shish
        </button>
      </div>
    </div>

    <!-- TAB 1: INGREDIENTS LIST -->
    <div v-if="activeTab === 'ingredients'" class="space-y-4">
      <div class="flex justify-between items-center bg-[#181b25] border border-[#2a2e3d] p-4 rounded-2xl">
        <div class="flex gap-2">
          <button
            v-for="cat in [
              { val: 'ALL', label: 'Barchasi' },
              { val: 'TOBACCO', label: 'Tamaki (Kalyan)' },
              { val: 'FOOD', label: 'Taomlar' },
              { val: 'BEVERAGE', label: 'Ichimliklar' },
              { val: 'SUPPLY', label: 'Asosiy' }
            ]"
            :key="cat.val"
            @click="selectedCategory = cat.val"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all',
              selectedCategory === cat.val
                ? 'bg-blue-600 text-white border-transparent'
                : 'bg-[#1e2230] border-[#2a2e3d] text-[#94a3b8] hover:text-white'
            ]"
          >
            {{ cat.label }}
          </button>
        </div>
        <div class="relative w-64">
          <Search class="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94a3b8]" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Masalliq qidirish..."
            class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl overflow-hidden shadow-xl">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#1e2230] text-[#94a3b8] border-b border-[#2a2e3d] font-semibold">
            <tr>
              <th class="p-4">Nomi</th>
              <th class="p-4">Kategoriya</th>
              <th class="p-4">Mavjud Miqdor</th>
              <th class="p-4">Birlik</th>
              <th class="p-4">Min. Miqdor</th>
              <th class="p-4">Holat</th>
              <th class="p-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#2a2e3d]">
            <tr v-for="ing in filteredIngredients" :key="ing.id" class="hover:bg-[#1e2230]/50">
              <td class="p-4 font-bold text-white flex items-center gap-2">
                <Box class="h-4 w-4 text-blue-400 shrink-0" />
                {{ ing.name }}
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1e2230] border border-[#2a2e3d] text-[#94a3b8]">
                  {{ getCategoryLabel(ing.category) }}
                </span>
              </td>
              <td class="p-4 font-black text-blue-400">
                {{ formatQty(ing) }}
              </td>
              <td class="p-4 text-[#94a3b8]">
                {{ ing.display_unit || ing.base_unit }} (baza: {{ ing.base_unit }})
              </td>
              <td class="p-4 text-[#94a3b8]">
                {{ ing.min_quantity || 0 }} {{ ing.base_unit }}
              </td>
              <td class="p-4">
                <span
                  v-if="ing.quantity <= (ing.min_quantity || 0)"
                  class="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max"
                >
                  <AlertTriangle class="h-3 w-3" /> Zaxira Oz!
                </span>
                <span
                  v-else
                  class="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-max block"
                >
                  Yetarli
                </span>
              </td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="editIngredient(ing)"
                    class="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg cursor-pointer transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 class="h-3.5 w-3.5" />
                  </button>
                  <button
                    @click="deleteIngredient(ing.id)"
                    class="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: MOVEMENTS -->
    <div v-if="activeTab === 'movements'" class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl p-6 shadow-xl">
      <h3 class="text-sm font-bold text-white mb-4">Ombor Kirim/Chiqim Tarixi</h3>
      <table class="w-full text-left text-xs">
        <thead class="bg-[#1e2230] text-[#94a3b8] border-b border-[#2a2e3d]">
          <tr>
            <th class="p-3">Sana</th>
            <th class="p-3">Turi</th>
            <th class="p-3">Masalliq</th>
            <th class="p-3">Miqdor</th>
            <th class="p-3">Izoh</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2a2e3d]">
          <tr v-for="m in movements" :key="m.id">
            <td class="p-3 text-[#94a3b8]">{{ formatDate(m.created_at) }}</td>
            <td class="p-3">
              <span
                :class="[
                  'px-2 py-0.5 rounded-md text-[10px] font-bold',
                  m.type === 'IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                ]"
              >
                {{ m.type }}
              </span>
            </td>
            <td class="p-3 font-semibold text-white">{{ m.ingredient?.name || m.ingredient_id }}</td>
            <td class="p-3 font-bold text-blue-400">{{ m.quantity }} g/pcs</td>
            <td class="p-3 text-[#94a3b8]">{{ m.note || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-lg font-bold text-white mb-4">
          {{ isEdit ? 'Masalliqni Tahrirlash' : 'Yangi Masalliq Qo\'shish' }}
        </h3>
        <form @submit.prevent="saveIngredient" class="space-y-4">
          <div>
            <label class="text-xs text-[#94a3b8] block mb-1">Masalliq Nomi</label>
            <input v-model="form.name" required type="text" placeholder="Masalan: Double Apple Tamakisi" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Kategoriya</label>
              <select v-model="form.category" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
                <option value="TOBACCO">TOBACCO (Tamaki)</option>
                <option value="FOOD">FOOD (Oziq-ovqat)</option>
                <option value="BEVERAGE">BEVERAGE (Ichimlik)</option>
                <option value="SUPPLY">SUPPLY (Xomashyo)</option>
                <option value="OTHER">OTHER (Boshqa)</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Dastlabki Miqdor</label>
              <input v-model.number="form.quantity" required type="number" step="any" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Baza Birligi (ombor)</label>
              <select v-model="form.base_unit" @change="onBaseUnitChange" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
                <option value="g">gramm (g)</option>
                <option value="ml">millilitr (ml)</option>
                <option value="pcs">dona (pcs)</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Ko'rinish Birligi (UI)</label>
              <select v-model="form.display_unit" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
                <option value="kg">kilogramm (kg)</option>
                <option value="g">gramm (g)</option>
                <option value="l">litr (l)</option>
                <option value="ml">millilitr (ml)</option>
                <option value="pcs">dona (pcs)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs text-[#94a3b8] block mb-1">Minimal Chegara (Ogohlantirish)</label>
            <input v-model.number="form.min_quantity" type="number" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-[#1e2230] text-[#94a3b8] hover:text-white rounded-xl text-xs font-semibold cursor-pointer">Bekor qilish</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 cursor-pointer">Saqlash</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package, FlaskConical, History, Box } from 'lucide-vue-next';
import api from '../services/api';
import { appContext } from '../store/appContext';

const activeTab = ref('ingredients');
const selectedCategory = ref('ALL');
const searchQuery = ref('');
const ingredients = ref([]);
const movements = ref([]);

const getCategoryLabel = (cat) => {
  const map = {
    ALL: 'Barchasi',
    TOBACCO: 'Tamaki (Kalyan)',
    FOOD: 'Taomlar',
    BEVERAGE: 'Ichimliklar',
    SUPPLY: 'Asosiy'
  };
  return map[cat] || cat || 'Boshqa';
};

const showModal = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const form = ref({
  name: '',
  category: 'TOBACCO',
  quantity: 5000,
  base_unit: 'g',
  display_unit: 'kg',
  min_quantity: 500
});

const onBaseUnitChange = () => {
  if (form.value.base_unit === 'g') {
    form.value.display_unit = 'kg';
  } else if (form.value.base_unit === 'ml') {
    form.value.display_unit = 'l';
  } else if (form.value.base_unit === 'pcs') {
    form.value.display_unit = 'pcs';
  }
};

watch(() => form.value.base_unit, (newBase) => {
  if (newBase === 'g') {
    form.value.display_unit = 'kg';
  } else if (newBase === 'ml') {
    form.value.display_unit = 'l';
  } else if (newBase === 'pcs') {
    form.value.display_unit = 'pcs';
  }
});

watch(() => form.value.category, (newCat) => {
  if (!isEdit.value) {
    if (newCat === 'TOBACCO' || newCat === 'FOOD') {
      form.value.base_unit = 'g';
      form.value.display_unit = 'kg';
    } else if (newCat === 'BEVERAGE' || newCat === 'SUPPLY') {
      form.value.base_unit = 'pcs';
      form.value.display_unit = 'pcs';
    }
  }
});

const formatDate = (dt) => dt ? new Date(dt).toLocaleString('uz-UZ') : '-';

const formatQty = (ing) => {
  const q = ing.quantity || 0;
  if (ing.base_unit === 'g' && ing.display_unit === 'kg') {
    return `${(q / 1000).toFixed(2)} kg (${q} g)`;
  }
  if (ing.base_unit === 'ml' && ing.display_unit === 'l') {
    return `${(q / 1000).toFixed(2)} l (${q} ml)`;
  }
  return `${q} ${ing.display_unit || ing.base_unit}`;
};

const filteredIngredients = computed(() => {
  return ingredients.value.filter(ing => {
    const matchCat = selectedCategory.value === 'ALL' || ing.category === selectedCategory.value;
    const matchSearch = !searchQuery.value || ing.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCat && matchSearch;
  });
});

const fetchIngredients = async () => {
  try {
    const res = await api.get('/ingredients');
    ingredients.value = res.data;
  } catch (err) {
    console.error('Fetch ingredients error:', err);
  }
};

const fetchMovements = async () => {
  try {
    const res = await api.get('/stock-movements');
    movements.value = res.data;
  } catch (err) {
    console.error('Fetch movements error:', err);
  }
};

const openAddModal = () => {
  isEdit.value = false;
  editId.value = null;
  form.value = { name: '', category: 'TOBACCO', quantity: 5000, base_unit: 'g', display_unit: 'kg', min_quantity: 500 };
  showModal.value = true;
};

const editIngredient = (ing) => {
  isEdit.value = true;
  editId.value = ing.id;
  form.value = { ...ing };
  showModal.value = true;
};

const saveIngredient = async () => {
  try {
    const branchId = appContext.state.currentUser?.branch_id || '000000000000000000000001';
    const payload = { ...form.value, branch_id: branchId };

    if (isEdit.value) {
      await api.put(`/ingredients/${editId.value}`, payload);
      appContext.showAlert('Muvaffaqiyatli', 'Masalliq yangilandi', 'success');
    } else {
      await api.post('/ingredients', payload);
      appContext.showAlert('Muvaffaqiyatli', 'Masalliq saqlandi', 'success');
    }
    showModal.value = false;
    fetchIngredients();
  } catch (err) {
    appContext.showAlert('Xatolik', 'Saqlashda xatolik', 'error');
  }
};

const deleteIngredient = (id) => {
  appContext.showConfirm('Masalliqni o\'chirish', 'Haqiqatan ham ushbu masalliqni o\'chirmoqchimisiz?', async () => {
    try {
      await api.delete(`/ingredients/${id}`);
      appContext.showAlert('Muvaffaqiyatli', 'Masalliq o\'chirildi', 'success');
      fetchIngredients();
    } catch (err) {
      console.error(err);
      appContext.showAlert('Xatolik', 'O\'chirishda xatolik yuz berdi', 'error');
    }
  });
};

onMounted(() => {
  fetchIngredients();
  fetchMovements();
});
</script>
