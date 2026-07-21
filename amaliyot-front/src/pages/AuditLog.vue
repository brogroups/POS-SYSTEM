<template>
  <div class="flex flex-col h-full gap-6 overflow-y-auto p-6 bg-[#0f1117] text-white">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181b25] border border-[#2a2e3d] p-6 rounded-2xl">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-3">
          <span>🛡️</span> Tizim Harakatlari Jurnali (Audit Log)
        </h1>
        <p class="text-xs text-[#94a3b8] mt-1">
          O'zgarmas audit tarixi: o'chirishlar, tahrirlashlar, narx o'zgarishlari va to'lovlar
        </p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="selectedCategory" class="bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none">
          <option value="ALL">Barcha Kategoriyalar</option>
          <option value="ORDER">ORDER (Buyurtmalar)</option>
          <option value="TABLE">TABLE (Stollar)</option>
          <option value="PAYMENT">PAYMENT (To'lovlar)</option>
          <option value="EXPENSE">EXPENSE (Xarajatlar)</option>
          <option value="INVENTORY">INVENTORY (Ombor)</option>
          <option value="HOOKAH">HOOKAH (Qalyon)</option>
          <option value="SHIFT">SHIFT (Smenalar)</option>
          <option value="USER">USER (Foydalanuvchilar)</option>
        </select>
        <div class="relative w-64">
          <Search class="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94a3b8]" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Log qidirish..."
            class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- LOGS TABLE -->
    <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl overflow-hidden shadow-xl">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#1e2230] text-[#94a3b8] border-b border-[#2a2e3d] font-semibold">
          <tr>
            <th class="p-4">Vaqt</th>
            <th class="p-4">Amal (Action)</th>
            <th class="p-4">Kategoriya</th>
            <th class="p-4">Qurilma</th>
            <th class="p-4">Foydalanuvchi</th>
            <th class="p-4 text-right">Tafsilotlar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2a2e3d]">
          <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-[#1e2230]/50">
            <td class="p-4 text-[#94a3b8] whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
            <td class="p-4 font-bold text-white">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {{ log.action }}
              </span>
            </td>
            <td class="p-4">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e2230] text-[#94a3b8]">
                {{ log.category || 'SYSTEM' }}
              </span>
            </td>
            <td class="p-4 text-[#94a3b8]">{{ log.device || 'POS' }}</td>
            <td class="p-4 font-semibold text-emerald-400">{{ log.user?.first_name || log.user_id || 'Tizim' }}</td>
            <td class="p-4 text-right">
              <button
                @click="viewLogDetails(log)"
                class="px-2.5 py-1 bg-[#1e2230] border border-[#2a2e3d] hover:border-blue-500 text-blue-400 rounded-lg text-xs font-medium cursor-pointer"
              >
                Ko'rish
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL: LOG DETAILS -->
    <div v-if="selectedLog" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div class="flex justify-between items-center mb-4 border-b border-[#2a2e3d] pb-3">
          <h3 class="text-base font-bold text-white">Audit Log Tafsilotlari</h3>
          <button @click="selectedLog = null" class="text-rose-400 hover:text-rose-300 font-bold text-lg cursor-pointer">×</button>
        </div>
        <div class="space-y-3 text-xs">
          <div>
            <span class="text-[#94a3b8]">Amal:</span>
            <span class="font-bold text-white ml-2">{{ selectedLog.action }}</span>
          </div>
          <div>
            <span class="text-[#94a3b8]">Jadval / Obyekt:</span>
            <span class="font-bold text-blue-400 ml-2">{{ selectedLog.table_name }} (#{{ selectedLog.record_id }})</span>
          </div>
          <div>
            <span class="text-[#94a3b8]">Vaqt:</span>
            <span class="text-white ml-2">{{ formatDate(selectedLog.created_at) }}</span>
          </div>
          <div v-if="selectedLog.old_data">
            <span class="text-[#94a3b8] block mb-1">Eski Qiymat:</span>
            <pre class="bg-[#1e2230] border border-[#2a2e3d] p-3 rounded-xl text-rose-300 overflow-x-auto max-h-36 font-mono text-[11px]">{{ selectedLog.old_data }}</pre>
          </div>
          <div v-if="selectedLog.new_data">
            <span class="text-[#94a3b8] block mb-1">Yangi Qiymat:</span>
            <pre class="bg-[#1e2230] border border-[#2a2e3d] p-3 rounded-xl text-emerald-300 overflow-x-auto max-h-36 font-mono text-[11px]">{{ selectedLog.new_data }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search } from 'lucide-vue-next';
import api from '../services/api';

const logs = ref([]);
const selectedCategory = ref('ALL');
const searchQuery = ref('');
const selectedLog = ref(null);

const formatDate = (dt) => dt ? new Date(dt).toLocaleString('uz-UZ') : '-';

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchCat = selectedCategory.value === 'ALL' || log.category === selectedCategory.value;
    const matchSearch = !searchQuery.value ||
      (log.action && log.action.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (log.table_name && log.table_name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    return matchCat && matchSearch;
  });
});

const fetchLogs = async () => {
  try {
    const res = await api.get('/audit-logs');
    logs.value = res.data;
  } catch (err) {
    console.error('Fetch audit logs error:', err);
  }
};

const viewLogDetails = (log) => {
  selectedLog.value = log;
};

onMounted(() => {
  fetchLogs();
});
</script>
