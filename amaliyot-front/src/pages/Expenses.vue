<template>
  <div class="flex flex-col h-full gap-6 overflow-y-auto p-6 bg-[#0f1117] text-white">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181b25] border border-[#2a2e3d] p-6 rounded-2xl shadow-xl">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-3">
          <Receipt class="h-7 w-7 text-rose-500 shrink-0" />
          <span>Kunlik Rasxodlar & Operatsion Xarajatlar</span>
        </h1>
        <p class="text-xs text-[#94a3b8] mt-1">
          Kundalik taksi, muz, ko'mir, tozalash, kuryer va boshqa kassa rasxodlarini kiritish va tasdiqlash
        </p>
      </div>
      <button
        v-if="appContext.hasPermission('create_expense')"
        @click="openAddModal"
        class="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
      >
        <Plus class="h-4 w-4" /> Yangi Kunlik Rasxod
      </button>
    </div>

    <!-- STAT CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[#181b25] border border-[#2a2e3d] p-5 rounded-2xl shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-[#94a3b8]">Bugungi Rasxod</span>
          <div class="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
            <TrendingDown class="h-4 w-4" />
          </div>
        </div>
        <p class="text-2xl font-black text-white mt-2">-{{ formatMoney(todayTotal) }} so'm</p>
        <p class="text-[11px] text-[#94a3b8] mt-1">Bugun kiritilgan jami rasxodlar</p>
      </div>

      <div class="bg-[#181b25] border border-[#2a2e3d] p-5 rounded-2xl shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-[#94a3b8]">Tasdiqlangan Rasxodlar</span>
          <div class="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 class="h-4 w-4" />
          </div>
        </div>
        <p class="text-2xl font-black text-emerald-400 mt-2">{{ approvedCount }} ta</p>
        <p class="text-[11px] text-[#94a3b8] mt-1">Kassadan yechilgan operatsiyalar</p>
      </div>

      <div class="bg-[#181b25] border border-[#2a2e3d] p-5 rounded-2xl shadow-lg">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-[#94a3b8]">Kutilayotgan Rasxodlar</span>
          <div class="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock class="h-4 w-4" />
          </div>
        </div>
        <p class="text-2xl font-black text-amber-400 mt-2">{{ pendingCount }} ta</p>
        <p class="text-[11px] text-[#94a3b8] mt-1">Menejer tasdig'ini kutilayotganlar</p>
      </div>
    </div>

    <!-- FILTER & SEARCH BAR -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181b25] border border-[#2a2e3d] p-4 rounded-2xl">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in ['ALL', 'TODAY', 'ICE', 'CHARCOAL', 'TAXI', 'CLEANING', 'COURIER', 'MISC']"
          :key="cat"
          @click="selectedFilter = cat"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all',
            selectedFilter === cat
              ? 'bg-rose-600 text-white border-transparent shadow-md shadow-rose-600/30'
              : 'bg-[#1e2230] border-[#2a2e3d] text-[#94a3b8] hover:text-white'
          ]"
        >
          {{ getFilterLabel(cat) }}
        </button>
      </div>
      <div class="relative w-full sm:w-64">
        <Search class="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94a3b8]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rasxod qidirish..."
          class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-rose-500"
        />
      </div>
    </div>

    <!-- EXPENSES TABLE -->
    <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl overflow-hidden shadow-xl">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#1e2230] text-[#94a3b8] border-b border-[#2a2e3d] font-semibold">
          <tr>
            <th class="p-4">Rasxod Nomi / Izoh</th>
            <th class="p-4">Kategoriya</th>
            <th class="p-4">Sana</th>
            <th class="p-4">Summa</th>
            <th class="p-4">Holat</th>
            <th class="p-4 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2a2e3d]">
          <tr v-for="e in filteredExpenses" :key="e.id" class="hover:bg-[#1e2230]/50">
            <td class="p-4">
              <span class="font-bold text-white block">{{ e.title }}</span>
              <span class="text-[11px] text-[#94a3b8]">{{ e.description || 'Izohsiz' }}</span>
            </td>
            <td class="p-4">
              <span class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1e2230] border border-[#2a2e3d] text-rose-300">
                {{ getCategoryLabel(e.category) }}
              </span>
            </td>
            <td class="p-4 text-[#94a3b8]">{{ formatDate(e.expense_date || e.created_at) }}</td>
            <td class="p-4 font-black text-rose-400">-{{ formatMoney(e.amount) }} so'm</td>
            <td class="p-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-[10px] font-bold border',
                  e.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  e.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                ]"
              >
                {{ e.status === 'APPROVED' ? 'Tasdiqlangan' : e.status === 'REJECTED' ? 'Rad etilgan' : 'Kutilmoqda' }}
              </span>
            </td>
            <td class="p-4 text-right">
              <div class="flex justify-end items-center gap-2">
                <div v-if="e.status === 'PENDING' && appContext.hasPermission('approve_expense')" class="flex gap-1.5">
                  <button
                    @click="approveExpense(e.id)"
                    class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md"
                  >
                    Tasdiqlash
                  </button>
                  <button
                    @click="rejectExpense(e.id)"
                    class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md"
                  >
                    Rad etish
                  </button>
                </div>
                <button
                  @click="deleteExpense(e.id)"
                  class="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-colors"
                  title="O'chirish"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredExpenses.length === 0">
            <td colspan="6" class="p-8 text-center text-[#94a3b8]">
              Hech qanday rasxod topilmadi.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL: NEW EXPENSE -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Receipt class="h-5 w-5 text-rose-500" /> Yangi Kunlik Rasxod Kiritish
        </h3>
        <form @submit.prevent="saveExpense" class="space-y-4">
          <div>
            <label class="text-xs text-[#94a3b8] block mb-1">Rasxod Nomi</label>
            <input v-model="form.title" required type="text" placeholder="Masalan: Qalyon uchun muz sotib olindi" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Kategoriya</label>
              <select v-model="form.category" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500">
                <option value="ICE">ICE - Muz</option>
                <option value="CHARCOAL">CHARCOAL - Ko'mir</option>
                <option value="TAXI">TAXI - Taksi</option>
                <option value="CLEANING">CLEANING - Tozalash</option>
                <option value="WATER">WATER - Suv</option>
                <option value="LIGHTER_GAS">LIGHTER_GAS - Gaz / Gugurt</option>
                <option value="COURIER">COURIER - Kuryer</option>
                <option value="DECOR">DECOR - Bezash</option>
                <option value="MAINTENANCE">MAINTENANCE - Ta'mirlash</option>
                <option value="TIPS">TIPS - Choychaqa</option>
                <option value="MISC">MISC - Boshqa</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Summa (so'm)</label>
              <input v-model.number="form.amount" required type="number" step="any" min="1" placeholder="25000" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500 font-bold text-rose-400" />
            </div>
          </div>
          <div>
            <label class="text-xs text-[#94a3b8] block mb-1">Izoh (Qo'shimcha tafsilotlar)</label>
            <textarea v-model="form.description" rows="2" placeholder="Masalan: 2 qop muz uchun to'landi" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-[#1e2230] text-[#94a3b8] hover:text-white rounded-xl text-xs font-semibold cursor-pointer">Bekor qilish</button>
            <button type="submit" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer">Saqlash & Kassadan Ayirish</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Search, Trash2, TrendingDown, CheckCircle2, Clock, Receipt } from 'lucide-vue-next';
import api from '../services/api';
import { appContext } from '../store/appContext';

const expenses = ref([]);
const showModal = ref(false);
const selectedFilter = ref('ALL');
const searchQuery = ref('');

const form = ref({
  title: '',
  category: 'ICE',
  amount: 25000,
  description: ''
});

const formatMoney = (val) => new Intl.NumberFormat('uz-UZ').format(val || 0);
const formatDate = (dt) => dt ? new Date(dt).toLocaleString('uz-UZ') : '-';

const getCategoryLabel = (cat) => {
  const map = {
    ICE: 'Muz', CHARCOAL: 'Ko\'mir', TAXI: 'Taksi', CLEANING: 'Tozalash',
    WATER: 'Suv', LIGHTER_GAS: 'Gaz/Zajigalka', COURIER: 'Kuryer',
    DECOR: 'Bezash', MAINTENANCE: 'Ta\'mirlash', TIPS: 'Choychaqa', MISC: 'Boshqa'
  };
  return map[cat] || cat;
};

const getFilterLabel = (cat) => {
  const map = {
    ALL: 'Barchasi', TODAY: 'Bugun', ICE: 'Muz', CHARCOAL: 'Ko\'mir',
    TAXI: 'Taksi', CLEANING: 'Tozalash', COURIER: 'Kuryer', MISC: 'Boshqa'
  };
  return map[cat] || cat;
};

const todayTotal = computed(() => {
  const todayStr = new Date().toDateString();
  return expenses.value
    .filter(e => new Date(e.expense_date || e.created_at).toDateString() === todayStr)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
});

const approvedCount = computed(() => expenses.value.filter(e => e.status === 'APPROVED').length);
const pendingCount = computed(() => expenses.value.filter(e => e.status === 'PENDING').length);

const filteredExpenses = computed(() => {
  const todayStr = new Date().toDateString();
  const q = searchQuery.value.toLowerCase().trim();

  return expenses.value.filter(e => {
    let matchFilter = true;
    if (selectedFilter.value === 'TODAY') {
      matchFilter = new Date(e.expense_date || e.created_at).toDateString() === todayStr;
    } else if (selectedFilter.value !== 'ALL') {
      matchFilter = e.category === selectedFilter.value;
    }

    const matchSearch = !q || 
      (e.title && e.title.toLowerCase().includes(q)) || 
      (e.description && e.description.toLowerCase().includes(q));

    return matchFilter && matchSearch;
  });
});

const fetchExpenses = async () => {
  try {
    const res = await api.get('/expenses');
    expenses.value = res.data;
  } catch (err) {
    console.error('Fetch expenses error:', err);
  }
};

const openAddModal = () => {
  form.value = { title: '', category: 'ICE', amount: 25000, description: '' };
  showModal.value = true;
};

const saveExpense = async () => {
  try {
    const branchId = appContext.state.currentUser?.branch_id || '000000000000000000000001';
    const payload = { ...form.value, branch_id: branchId };
    await api.post('/expenses', payload);
    appContext.showAlert('Muvaffaqiyatli', 'Kunlik rasxod saqlandi', 'success');
    showModal.value = false;
    fetchExpenses();
  } catch (err) {
    appContext.showAlert('Xatolik', 'Xarajatni saqlashda xatolik', 'error');
  }
};

const approveExpense = async (id) => {
  try {
    await api.post(`/expenses/${id}/approve`);
    appContext.showAlert('Muvaffaqiyatli', 'Xarajat tasdiqlandi', 'success');
    fetchExpenses();
  } catch (err) {
    appContext.showAlert('Xatolik', 'Tasdiqlashda xatolik', 'error');
  }
};

const rejectExpense = async (id) => {
  try {
    await api.post(`/expenses/${id}/reject`, { reason: 'Menejer rad etdi' });
    appContext.showAlert('Muvaffaqiyatli', 'Xarajat rad etildi', 'success');
    fetchExpenses();
  } catch (err) {
    appContext.showAlert('Xatolik', 'Rad etishda xatolik', 'error');
  }
};

const deleteExpense = (id) => {
  appContext.showConfirm('Rasxodni o\'chirish', 'Haqiqatan ham ushbu kunlik rasxodni o\'chirmoqchimisiz?', async () => {
    try {
      await api.delete(`/expenses/${id}`);
      appContext.showAlert('Muvaffaqiyatli', 'Rasxod o\'chirildi', 'success');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      appContext.showAlert('Xatolik', 'O\'chirishda xatolik yuz berdi', 'error');
    }
  });
};

onMounted(() => {
  fetchExpenses();
});
</script>
