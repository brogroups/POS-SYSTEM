<template>
  <div class="flex flex-col h-full gap-6 overflow-y-auto p-6 bg-[#0f1117] text-white">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181b25] border border-[#2a2e3d] p-6 rounded-2xl">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-3">
          <span>🛒</span> Xaridlar & Yetkazib Beruvchilar
        </h1>
        <p class="text-xs text-[#94a3b8] mt-1">
          Yetkazib beruvchilar inshootlari, faktura xaridlari va avtomatik zaxira to'ldirish
        </p>
      </div>
      <button
        v-if="appContext.hasPermission('create_purchase')"
        @click="showModal = true"
        class="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
      >
        <Plus class="h-4 w-4" /> Yangi Xarid Qilish
      </button>
    </div>

    <!-- PURCHASES LIST -->
    <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl overflow-hidden shadow-xl">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#1e2230] text-[#94a3b8] border-b border-[#2a2e3d] font-semibold">
          <tr>
            <th class="p-4">Faktura №</th>
            <th class="p-4">Yetkazib Beruvchi</th>
            <th class="p-4">Sana</th>
            <th class="p-4">Umumiy Summa</th>
            <th class="p-4">To'lov Holati</th>
            <th class="p-4 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2a2e3d]">
          <tr v-for="p in purchases" :key="p.id" class="hover:bg-[#1e2230]/50">
            <td class="p-4 font-bold text-white">#{{ p.invoice_number }}</td>
            <td class="p-4 text-white font-semibold">{{ p.supplier_name }}</td>
            <td class="p-4 text-[#94a3b8]">{{ formatDate(p.purchase_date) }}</td>
            <td class="p-4 font-black text-emerald-400">{{ formatMoney(p.total_cost) }} so'm</td>
            <td class="p-4">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md text-[10px] font-bold border',
                  p.payment_status === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                ]"
              >
                {{ p.payment_status === 'PAID' ? 'To\'langan' : 'Kutilmoqda' }}
              </span>
            </td>
            <td class="p-4 text-right">
              <button
                v-if="p.payment_status === 'PENDING' && appContext.hasPermission('create_purchase')"
                @click="markPaid(p.id)"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md"
              >
                To'lash
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL: NEW PURCHASE -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#181b25] border border-[#2a2e3d] rounded-2xl p-6 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <h3 class="text-lg font-bold text-white mb-4">Yangi Xarid Hujjatini Kiritish</h3>
        <form @submit.prevent="savePurchase" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Yetkazib Beruvchi</label>
              <input v-model="form.supplier_name" required type="text" placeholder="Masalan: Afzal Tobacco LLC" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Faktura Raqami</label>
              <input v-model="form.invoice_number" required type="text" placeholder="INV-2026-001" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">To'lov Holati</label>
              <select v-model="form.payment_status" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
                <option value="PAID">To'langan (Naqd/Kassa)</option>
                <option value="PENDING">Nasiya / Kutilmoqda</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-[#94a3b8] block mb-1">Umumiy Summa (so'm)</label>
              <input :value="computedTotalCost" readonly type="text" class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold outline-none" />
            </div>
          </div>

          <!-- Items Table -->
          <div class="border border-[#2a2e3d] rounded-xl p-3 bg-[#1e2230]/50 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-xs font-bold text-white">Xarid Qilingan Masalliqlar</span>
              <button type="button" @click="addItem" class="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer">
                <Plus class="h-3.5 w-3.5" /> Masalliq qo'shish
              </button>
            </div>

            <div v-for="(item, idx) in form.items" :key="idx" class="grid grid-cols-12 gap-2 items-center">
              <div class="col-span-4">
                <select v-model="item.ingredient_id" required class="w-full bg-[#181b25] border border-[#2a2e3d] rounded-lg px-2 py-1.5 text-xs text-white outline-none">
                  <option disabled value="">Masalliqni tanlang</option>
                  <option v-for="ing in ingredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
                </select>
              </div>
              <div class="col-span-3">
                <input v-model.number="item.quantity" required type="number" step="any" placeholder="Miqdor" class="w-full bg-[#181b25] border border-[#2a2e3d] rounded-lg px-2 py-1.5 text-xs text-white outline-none" />
              </div>
              <div class="col-span-2">
                <select v-model="item.unit" class="w-full bg-[#181b25] border border-[#2a2e3d] rounded-lg px-1 py-1.5 text-xs text-white outline-none">
                  <option value="dona">dona (pcs)</option>
                  <option value="kg">kg (kilo)</option>
                  <option value="g">g (gramm)</option>
                  <option value="l">l (litr)</option>
                  <option value="ml">ml</option>
                </select>
              </div>
              <div class="col-span-2">
                <input v-model.number="item.price_per_unit" required type="number" placeholder="Birlik narxi" class="w-full bg-[#181b25] border border-[#2a2e3d] rounded-lg px-2 py-1.5 text-xs text-white outline-none" />
              </div>
              <div class="col-span-1 text-right">
                <button type="button" @click="removeItem(idx)" class="text-rose-400 hover:text-rose-300">×</button>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-[#1e2230] text-[#94a3b8] hover:text-white rounded-xl text-xs font-semibold cursor-pointer">Bekor qilish</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 cursor-pointer">Saqlash & Omborga Kiritish</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';
import api from '../services/api';
import { appContext } from '../store/appContext';

const purchases = ref([]);
const ingredients = ref([]);
const showModal = ref(false);

const form = ref({
  supplier_name: '',
  invoice_number: '',
  payment_status: 'PAID',
  items: [
    { ingredient_id: '', quantity: 5, unit: 'kg', price_per_unit: 180000 }
  ]
});

const formatMoney = (val) => new Intl.NumberFormat('uz-UZ').format(val || 0);
const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('uz-UZ') : '-';

const computedTotalCost = computed(() => {
  return form.value.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price_per_unit || 0)), 0);
});

const addItem = () => {
  form.value.items.push({ ingredient_id: '', quantity: 1, unit: 'kg', price_per_unit: 0 });
};

const removeItem = (idx) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(idx, 1);
  }
};

const fetchPurchases = async () => {
  try {
    const res = await api.get('/purchases');
    purchases.value = res.data;
  } catch (err) {
    console.error('Fetch purchases error:', err);
  }
};

const fetchIngredients = async () => {
  try {
    const res = await api.get('/ingredients');
    ingredients.value = res.data;
  } catch (err) {
    console.error('Fetch ingredients error:', err);
  }
};

const savePurchase = async () => {
  try {
    const branchId = appContext.state.currentUser?.branch_id || '000000000000000000000001';
    const payload = {
      ...form.value,
      branch_id: branchId,
      total_cost: computedTotalCost.value
    };

    await api.post('/purchases', payload);
    appContext.showAlert('Muvaffaqiyatli', 'Xarid kiritildi va ombor zaxirasi oshirildi', 'success');
    showModal.value = false;
    fetchPurchases();
  } catch (err) {
    appContext.showAlert('Xatolik', 'Xaridni saqlashda xatolik', 'error');
  }
};

const markPaid = async (id) => {
  try {
    await api.post(`/purchases/${id}/pay`);
    appContext.showAlert('Muvaffaqiyatli', 'Xarid to\'landi deb belgilandi', 'success');
    fetchPurchases();
  } catch (err) {
    appContext.showAlert('Xatolik', 'Xatolik yuz berdi', 'error');
  }
};

onMounted(() => {
  fetchPurchases();
  fetchIngredients();
});
</script>
