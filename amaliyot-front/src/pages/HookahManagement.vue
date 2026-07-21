<template>
  <div class="flex flex-col h-full gap-6 overflow-y-auto p-6 bg-[#0f1117] text-white">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181b25] border border-[#2a2e3d] p-6 rounded-2xl">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-3">
          <span>💨</span> Qalyon Boshqaruvi
        </h1>
        <p class="text-xs text-[#94a3b8] mt-1">
          Qalyon turlari, masalliqlar (tamaki sarfi) va kunlik hisobotlar
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="activeTab = 'catalog'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
            activeTab === 'catalog'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-500/20'
              : 'bg-[#1e2230] border-[#2a2e3d] text-[#94a3b8] hover:text-white'
          ]"
        >
          📋 Katalog
        </button>
        <button
          @click="activeTab = 'report'"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
            activeTab === 'report'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-500/20'
              : 'bg-[#1e2230] border-[#2a2e3d] text-[#94a3b8] hover:text-white'
          ]"
        >
          📊 Kunlik Hisobot
        </button>
        <button
          v-if="appContext.hasPermission('manage_hookah')"
          @click="openAddModal"
          class="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus class="h-4 w-4" /> Yangi Qalyon
        </button>
      </div>
    </div>

    <!-- TAB 1: CATALOG -->
    <div v-if="activeTab === 'catalog'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="h in hookahs"
        :key="h.id"
        class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl p-5 hover:border-[#3b82f6]/50 transition-all shadow-lg flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-3">
            <div>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  h.category === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  h.category === 'Premium' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                ]"
              >
                {{ h.category }}
              </span>
              <h3 class="text-lg font-bold text-white mt-1.5">{{ h.name }}</h3>
            </div>
            <span class="text-lg font-black text-emerald-400">
              {{ formatMoney(h.selling_price) }} so'm
            </span>
          </div>

          <!-- Attributes Grid -->
          <div class="grid grid-cols-2 gap-2 text-xs bg-[#1e2230] p-3 rounded-xl border border-[#2a2e3d] mb-4">
            <div>
              <span class="text-[#94a3b8] block">Tamaki vazni:</span>
              <span class="font-bold text-white">{{ h.tobacco_weight }} g</span>
            </div>
            <div>
              <span class="text-[#94a3b8] block">Chashka turi:</span>
              <span class="font-bold text-white">{{ h.bowl_type }}</span>
            </div>
            <div>
              <span class="text-[#94a3b8] block">Isitish tizimi:</span>
              <span class="font-bold text-white">{{ h.heat_system }}</span>
            </div>
            <div>
              <span class="text-[#94a3b8] block">Tayyorlash vaqti:</span>
              <span class="font-bold text-white">{{ h.preparation_time }} daqiqa</span>
            </div>
          </div>

          <p v-if="h.notes" class="text-xs text-[#94a3b8] italic mb-3">
            "{{ h.notes }}"
          </p>
        </div>

        <div class="flex items-center justify-between border-t border-[#2a2e3d] pt-3 mt-2">
          <span
            :class="['text-xs font-semibold px-2 py-0.5 rounded-md', h.is_available !== false ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10']"
          >
            {{ h.is_available !== false ? '● Mavjud' : '○ Mavjud emas' }}
          </span>
          <div v-if="appContext.hasPermission('manage_hookah')" class="flex gap-2">
            <button
              @click="editHookah(h)"
              class="p-2 text-[#94a3b8] hover:text-white bg-[#1e2230] border border-[#2a2e3d] rounded-lg transition-colors cursor-pointer"
              title="Tahrirlash"
            >
              <Edit2 class="h-3.5 w-3.5" />
            </button>
            <button
              @click="deleteHookah(h.id)"
              class="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
              title="O'chirish"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: DAILY REPORT -->
    <div v-if="activeTab === 'report'" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[#181b25] border border-[#2a2e3d] p-5 rounded-2xl">
          <span class="text-xs text-[#94a3b8]">Jami Qalyonlar (Bugun)</span>
          <p class="text-3xl font-black text-blue-400 mt-1">{{ report.total_hookahs || 0 }} ta</p>
        </div>
        <div class="bg-[#181b25] border border-[#2a2e3d] p-5 rounded-2xl">
          <span class="text-xs text-[#94a3b8]">Ishlatilgan Tamaki</span>
          <p class="text-3xl font-black text-amber-400 mt-1">{{ report.total_tobacco_used_g || 0 }} g</p>
        </div>
        <div class="bg-[#181b25] border border-[#2a2e3d] p-5 rounded-2xl">
          <span class="text-xs text-[#94a3b8]">Qolgan Tamaki Zaxirasi</span>
          <p class="text-3xl font-black text-emerald-400 mt-1">{{ (report.remaining_tobacco_g || 0) / 1000 }} kg</p>
        </div>
        <div class="bg-[#181b25] border border-[#2a2e3d] p-5 rounded-2xl">
          <span class="text-xs text-[#94a3b8]">O'rtacha Tayyorlash Vaqti</span>
          <p class="text-3xl font-black text-purple-400 mt-1">{{ report.avg_preparation_time || 0 }} daqiqa</p>
        </div>
      </div>

      <!-- Highlights -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[#181b25] border border-[#2a2e3d] p-6 rounded-2xl">
          <h4 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>🔥</span> Eng Mashhur Qalyon
          </h4>
          <p class="text-xl font-extrabold text-blue-400">
            {{ report.most_popular_hookah || 'Ma\'lumot yo\'q' }}
          </p>
        </div>
        <div class="bg-[#181b25] border border-[#2a2e3d] p-6 rounded-2xl">
          <h4 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>🍏</span> Eng Mashhur Tamaki Ta'mi
          </h4>
          <p class="text-xl font-extrabold text-emerald-400">
            {{ report.most_popular_flavor || 'Ma\'lumot yo\'q' }}
          </p>
        </div>
      </div>
    </div>

    <!-- MODAL: ADD / EDIT HOOKAH -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="text-lg font-bold text-white mb-4">
          {{ isEdit ? 'Qalyonni Tahrirlash' : 'Yangi Qalyon Qo\'shish' }}
        </h3>
        <form @submit.prevent="saveHookah" class="space-y-4">
          <div>
            <label class="text-xs text-[#94a3b8] block mb-1">Qalyon Nomi</label>
            <input v-model="form.name" required type="text" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Kategoriya</label>
              <select v-model="form.category" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
                <option value="Classic">Classic</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Sotish Narxi (so'm)</label>
              <input v-model.number="form.selling_price" required type="number" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Tamaki Vazni (gramm)</label>
              <input v-model.number="form.tobacco_weight" required type="number" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Tayyorlash Vaqti (min)</label>
              <input v-model.number="form.preparation_time" required type="number" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Chashka Turi</label>
              <input v-model="form.bowl_type" required type="text" placeholder="Clay, Phunnel" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Isitish Tizimi</label>
              <input v-model="form.heat_system" required type="text" placeholder="Kaloud, Foil" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label class="text-xs text-[#94a3b8] block mb-1">Izoh</label>
            <textarea v-model="form.notes" rows="2" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"></textarea>
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
import { ref, onMounted } from 'vue';
import { Plus, Edit2, Trash2 } from 'lucide-vue-next';
import api from '../services/api';
import { appContext } from '../store/appContext';

const activeTab = ref('catalog');
const hookahs = ref([]);
const report = ref({});
const showModal = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const form = ref({
  name: '',
  category: 'Classic',
  tobacco_weight: 18,
  bowl_type: 'Clay',
  heat_system: 'Kaloud',
  selling_price: 120000,
  preparation_time: 15,
  notes: ''
});

const formatMoney = (val) => new Intl.NumberFormat('uz-UZ').format(val || 0);

const fetchHookahs = async () => {
  try {
    const res = await api.get('/hookahs');
    hookahs.value = res.data;
  } catch (err) {
    console.error('Fetch hookahs error:', err);
  }
};

const fetchDailyReport = async () => {
  try {
    const branchId = appContext.state.currentUser?.branch_id || '000000000000000000000001';
    const res = await api.get(`/hookahs/reports/daily?branch_id=${branchId}`);
    report.value = res.data;
  } catch (err) {
    console.error('Fetch report error:', err);
  }
};

const openAddModal = () => {
  isEdit.value = false;
  editId.value = null;
  form.value = {
    name: '', category: 'Classic', tobacco_weight: 18, bowl_type: 'Clay',
    heat_system: 'Kaloud', selling_price: 120000, preparation_time: 15, notes: ''
  };
  showModal.value = true;
};

const editHookah = (h) => {
  isEdit.value = true;
  editId.value = h.id;
  form.value = { ...h };
  showModal.value = true;
};

const saveHookah = async () => {
  try {
    const branchId = appContext.state.currentUser?.branch_id || '000000000000000000000001';
    const payload = { ...form.value, branch_id: branchId };

    if (isEdit.value) {
      await api.put(`/hookahs/${editId.value}`, payload);
      appContext.showAlert('Muvaffaqiyatli', 'Qalyon yangilandi', 'success');
    } else {
      await api.post('/hookahs', payload);
      appContext.showAlert('Muvaffaqiyatli', 'Yangi qalyon saqlandi', 'success');
    }
    showModal.value = false;
    fetchHookahs();
  } catch (err) {
    appContext.showAlert('Xatolik', 'Saqlashda xatolik yuz berdi', 'error');
  }
};

const deleteHookah = async (id) => {
  appContext.showConfirm('Tasdiqlash', 'Haqiqatdan ham ushbu qalyonni o\'chirmoqchimisiz?', async () => {
    try {
      await api.delete(`/hookahs/${id}`);
      appContext.showAlert('Muvaffaqiyatli', 'Qalyon o\'chirildi', 'success');
      fetchHookahs();
    } catch (err) {
      appContext.showAlert('Xatolik', 'O\'chirishda xatolik', 'error');
    }
  });
};

onMounted(() => {
  fetchHookahs();
  fetchDailyReport();
});
</script>
