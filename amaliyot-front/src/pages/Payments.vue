<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-white">To'lovlar Tarixi</h2>
        <p class="text-xs text-muted-foreground mt-1">Barcha kirim qilingan mablag'lar va to'lov tahlillari</p>
      </div>
      <button 
        @click="handleExportCSV"
        class="flex items-center gap-2 bg-[#107c41] hover:bg-[#0e6c38] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-green-950/20 cursor-pointer"
      >
        <FileSpreadsheet class="h-4 w-4" /> Excel (CSV) Eksport
      </button>
    </div>

    <!-- Main Table and Toolbar -->
    <div class="rounded-2xl border border-border bg-card shadow-sm glass overflow-hidden">
      <div class="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 justify-between bg-secondary/15">
        <div class="flex items-center gap-2 w-full sm:w-auto bg-background border border-border rounded-xl px-4 py-2.5">
          <Search class="h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Buyurtma ID raqami..." 
            class="bg-transparent border-none outline-none text-xs w-full sm:w-64 text-white" 
          />
        </div>
        
        <div class="flex items-center gap-2 w-full sm:w-auto relative">
          <Filter class="h-4 w-4 text-muted-foreground" />
          <button 
            @click="toggleDropdown"
            class="bg-[#1e2230] border border-[#2a2e3d] hover:border-primary/50 text-white rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-3 min-w-[160px] transition-colors relative cursor-pointer"
          >
            <span>
              {{ 
                methodFilter === "ALL" ? "Barcha to'lovlar" :
                methodFilter === "CASH" ? "Faqat Naqd pul" :
                methodFilter === "CARD" ? "Faqat Karta" :
                "Faqat O'tkazma" 
              }}
            </span>
            <ChevronDown class="h-4 w-4 text-[#94a3b8]" />
          </button>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div v-if="isDropdownOpen" class="absolute right-0 top-full mt-2 w-48 bg-[#181b25] border border-[#2a2e3d] rounded-xl shadow-2xl overflow-hidden z-40 p-1.5">
              <button
                v-for="option in methodOptions"
                :key="option.value"
                @click="selectMethod(option.value)"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-secondary/40 transition-colors flex items-center justify-between cursor-pointer',
                  option.color,
                  methodFilter === option.value ? 'bg-[#3b82f6]/10 text-primary border border-primary/20' : ''
                ]"
              >
                {{ option.label }}
                <span v-if="methodFilter === option.value" class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              </button>
            </div>
          </transition>
          <div v-if="isDropdownOpen" class="fixed inset-0 z-30" @click="isDropdownOpen = false"></div>
        </div>
      </div>
      
      <div v-if="loading" class="flex justify-center p-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-[#94a3b8] uppercase bg-secondary/40 border-b border-border">
            <tr>
              <th class="px-6 py-4 font-semibold">To'lov ID</th>
              <th class="px-6 py-4 font-semibold">Buyurtma</th>
              <th class="px-6 py-4 font-semibold">Summa</th>
              <th class="px-6 py-4 font-semibold">Turi</th>
              <th class="px-6 py-4 font-semibold">Vaqti</th>
              <th class="px-6 py-4 font-semibold text-right">Batafsil / Chek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, idx) in filteredPayments" :key="payment.id" class="border-b border-border/40 hover:bg-secondary/15 transition-colors">
              <td class="px-6 py-4 font-bold text-primary">#{{ getShortId(payment.id, idx + 1) }}</td>
              <td class="px-6 py-4 text-white font-medium">{{ getShortOrderCode(payment.order_id || payment.orderId, idx + 1) }}</td>
              <td class="px-6 py-4 font-black text-green-400">+{{ formatNumber(payment.amount) }} UZS</td>
              <td class="px-6 py-4">
                <span v-if="getPaymentMethod(payment) === 'CARD'" class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md w-max border border-blue-500/20">
                  <CreditCard class="h-3.5 w-3.5" /> Karta orqali
                </span>
                <span v-else-if="getPaymentMethod(payment) === 'TRANSFER'" class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-md w-max border border-purple-500/20">
                  <Landmark class="h-3.5 w-3.5" /> O'tkazma
                </span>
                <span v-else class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-green-500/10 text-green-400 rounded-md w-max border border-green-500/20">
                  <Banknote class="h-3.5 w-3.5" /> Naqd pul
                </span>
              </td>
              <td class="px-6 py-4 text-[#94a3b8] font-medium">
                <div class="flex items-center gap-2">
                  <Calendar class="h-3.5 w-3.5 text-muted-foreground" />
                  {{ formatDateTime(payment.paid_at || payment.createdAt || payment.created_at) }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="openPaymentDetailsModal(payment, idx + 1)"
                  title="To'lov cheki va zakaz qilingan taomlarni ko'rish"
                  class="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Eye class="h-4 w-4 text-blue-400" /> Batafsil
                </button>
              </td>
            </tr>
            <tr v-if="filteredPayments.length === 0">
              <td colSpan="6" class="px-6 py-12 text-center text-muted-foreground italic">Qidiruvga mos to'lovlar topilmadi.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Payment Details / Receipt Modal -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="isDetailsModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-white">
        <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]">
          <div>
            <h3 class="font-bold text-white flex items-center gap-2 text-base">
              <Eye class="h-5 w-5 text-blue-400" /> To'lov Cheki va Buyurtma Tafsiloti
            </h3>
            <p class="text-xs text-[#94a3b8] mt-0.5">To'lov #{{ getShortId(selectedPaymentDetails?.id, selectedPaymentIndex) }} • Buyurtma {{ getShortOrderCode(selectedPaymentDetails?.order_id || selectedPaymentDetails?.orderId, selectedPaymentIndex) }}</p>
          </div>
          <button @click="isDetailsModalOpen = false" class="text-[#94a3b8] hover:text-white p-1.5 bg-[#2a2e3d] rounded-lg cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div v-if="detailsLoading" class="p-12 text-center flex flex-col items-center gap-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p class="text-xs text-[#94a3b8]">Buyurtma taomlari va chek ma'lumotlari yuklanmoqda...</p>
        </div>
        <div v-else-if="selectedPaymentDetails" class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <!-- Summary info grid -->
          <div class="grid grid-cols-2 gap-3 bg-[#14161e] p-3.5 rounded-xl border border-[#2a2e3d]">
            <div>
              <p class="text-[10px] text-[#94a3b8] font-bold uppercase">Yopilgan Stol</p>
              <p class="text-sm font-black text-white mt-0.5">
                Stol #{{ selectedPaymentDetails.orderData?.table_number || selectedPaymentDetails.orderData?.table_id || 'Zal' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] text-[#94a3b8] font-bold uppercase">To'lov Usuli</p>
              <p class="text-sm font-black text-green-400 mt-0.5">
                {{ getPaymentMethod(selectedPaymentDetails) === 'CARD' ? '💳 Karta orqali' : getPaymentMethod(selectedPaymentDetails) === 'TRANSFER' ? '🏦 O\'tkazma' : '💵 Naqd pul' }}
              </p>
            </div>
            <div>
              <p class="text-[10px] text-[#94a3b8] font-bold uppercase">To'lov Vaqti</p>
              <p class="text-xs font-semibold text-white mt-0.5">
                {{ formatDateTime(selectedPaymentDetails.paid_at || selectedPaymentDetails.createdAt) }}
              </p>
            </div>
            <div>
              <p class="text-[10px] text-[#94a3b8] font-bold uppercase">Kassa Jami Summa</p>
              <p class="text-sm font-black text-emerald-400 mt-0.5">
                +{{ formatNumber(selectedPaymentDetails.amount) }} UZS
              </p>
            </div>
          </div>

          <!-- Items list -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Zakaz Qilingan Taomlar & Xizmatlar</span>
              <span class="text-[10px] text-[#94a3b8] font-normal">
                {{ (selectedPaymentDetails.orderData?.items || selectedPaymentDetails.orderData?.order_items || []).length }} turdagi taom
              </span>
            </h4>

            <div class="bg-[#14161e] border border-[#2a2e3d] rounded-xl overflow-hidden">
              <table class="w-full text-xs text-left">
                <thead class="bg-[#1e2230] text-[#94a3b8] uppercase font-bold text-[10px] border-b border-[#2a2e3d]">
                  <tr>
                    <th class="px-3 py-2.5">Taom Nomi</th>
                    <th class="px-3 py-2.5 text-center">Soni</th>
                    <th class="px-3 py-2.5 text-right">Narxi</th>
                    <th class="px-3 py-2.5 text-right">Jami</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#2a2e3d]">
                  <tr 
                    v-for="(item, idx) in (selectedPaymentDetails.orderData?.items || selectedPaymentDetails.orderData?.order_items || selectedPaymentDetails.items || [])"
                    :key="idx"
                    class="hover:bg-white/5"
                  >
                    <td class="px-3 py-2.5 font-bold text-white">{{ item.product_name || item.name || 'Taom' }}</td>
                    <td class="px-3 py-2.5 text-center font-bold text-blue-400">x{{ item.quantity || item.qty || 1 }}</td>
                    <td class="px-3 py-2.5 text-right text-[#94a3b8]">{{ formatNumber(item.price) }}</td>
                    <td class="px-3 py-2.5 text-right font-bold text-emerald-400">{{ formatNumber((item.price || 0) * (item.quantity || item.qty || 1)) }} UZS</td>
                  </tr>
                  <tr v-if="!(selectedPaymentDetails.orderData?.items || selectedPaymentDetails.orderData?.order_items || []).length">
                    <td colSpan="4" class="px-3 py-6 text-center text-[#94a3b8] italic">
                      Ushbu yopilgan buyurtma taomlari haqida ma'lumot saqlangan.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Total Footer -->
          <div class="flex justify-between items-center p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span class="text-xs font-bold text-white">YOPILGAN SHOT JAMI:</span>
            <span class="text-base font-black text-emerald-400">{{ formatNumber(selectedPaymentDetails.amount) }} UZS</span>
          </div>
        </div>

        <div class="p-4 bg-[#14161e] border-t border-[#2a2e3d] flex justify-between items-center gap-3">
          <button @click="isDetailsModalOpen = false" class="py-2.5 px-5 bg-[#1e2230] hover:bg-[#2a2e3d] text-[#94a3b8] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
            Yopish
          </button>
          <button 
            @click="printPaymentReceipt"
            class="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Printer class="h-4 w-4" /> 🖨️ Chekni Chop Etish
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { Search, CreditCard, Banknote, Calendar, Landmark, FileSpreadsheet, Filter, ChevronDown, Eye, X, Printer } from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Payments",
  components: {
    Search,
    CreditCard,
    Banknote,
    Calendar,
    Landmark,
    FileSpreadsheet,
    Filter,
    ChevronDown,
    Eye,
    X,
    Printer,
  },
  data() {
    return {
      payments: [],
      loading: true,
      searchQuery: "",
      methodFilter: "ALL",
      isDropdownOpen: false,
      isDetailsModalOpen: false,
      selectedPaymentDetails: null,
      detailsLoading: false,
      selectedPaymentIndex: 1,
      methodOptions: [
        { value: "ALL", label: "Barcha to'lovlar", color: "text-white" },
        { value: "CASH", label: "Naqd pul (CASH)", color: "text-green-400" },
        { value: "CARD", label: "Karta (CARD)", color: "text-blue-400" },
        { value: "TRANSFER", label: "O'tkazma (TRANSFER)", color: "text-purple-400" },
      ],
    };
  },
  computed: {
    filteredPayments() {
      const q = this.searchQuery.toLowerCase().trim();
      return this.payments.filter(p => {
        const orderStr = String(p.order_id || p.orderId || "").toLowerCase();
        const matchesSearch = q ? orderStr.includes(q) : true;
        
        const method = this.getPaymentMethod(p);
        const matchesMethod = this.methodFilter === "ALL" ? true : method === this.methodFilter;
        
        return matchesSearch && matchesMethod;
      });
    },
    totals() {
      return this.filteredPayments.reduce(
        (acc, p) => {
          const amt = Number(p.amount || 0);
          const method = this.getPaymentMethod(p);
          acc.total += amt;
          if (method === "CASH") acc.cash += amt;
          else if (method === "CARD") acc.card += amt;
          else if (method === "TRANSFER") acc.transfer += amt;
          return acc;
        },
        { total: 0, cash: 0, card: 0, transfer: 0 }
      );
    },
  },
  mounted() {
    this.fetchPayments();
  },
  methods: {
    async openPaymentDetailsModal(payment, index) {
      this.selectedPaymentIndex = index;
      this.selectedPaymentDetails = payment;
      this.isDetailsModalOpen = true;
      this.detailsLoading = true;

      try {
        const orderId = payment.order_id || payment.orderId || payment.order?.id;
        if (orderId) {
          const { data } = await api.get(`/orders/${orderId}/details`);
          this.selectedPaymentDetails = {
            ...payment,
            orderData: data
          };
        }
      } catch (err) {
        console.error("Error loading payment details:", err);
      } finally {
        this.detailsLoading = false;
      }
    },
    printPaymentReceipt() {
      if (!this.selectedPaymentDetails) return;
      const p = this.selectedPaymentDetails;
      const order = p.orderData || p.order || {};
      const items = order.items || order.order_items || p.items || [];
      const paperWidth = localStorage.getItem("printer_paper_width") || "80mm";

      const printWindow = window.open("", "", "height=700,width=450");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Restoran Cheki - #${this.getShortId(p.id, this.selectedPaymentIndex)}</title>
            <style>
              @page { margin: 0; size: ${paperWidth} auto; }
              body { font-family: 'Courier New', Courier, monospace; width: ${paperWidth}; margin: 0 auto; padding: 10px; font-size: 11px; color: #000; }
              .text-center { text-align: center; }
              .flex { display: flex; justify-content: space-between; }
              .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
              .font-bold { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="text-center font-bold">OHLALA RESTAURANT</div>
            <div class="text-center">TO'LOV CHEKI (DUBILIKAT)</div>
            <div class="divider"></div>
            <div class="flex"><span>Chek ID:</span><span>#${this.getShortId(p.id, this.selectedPaymentIndex)}</span></div>
            <div class="flex"><span>Buyurtma:</span><span>${this.getShortOrderCode(p.order_id || p.orderId, this.selectedPaymentIndex)}</span></div>
            <div class="flex"><span>Stol:</span><span>${order.table_number ? 'Stol #' + order.table_number : (order.table_id || 'Zal')}</span></div>
            <div class="flex"><span>Vaqt:</span><span>${this.formatDateTime(p.paid_at || p.createdAt)}</span></div>
            <div class="flex"><span>To'lov usuli:</span><span>${this.getPaymentMethod(p)}</span></div>
            <div class="divider"></div>
            <div class="font-bold">TAOM VA XIZMATLAR:</div>
            ${items.map(item => `
              <div class="flex" style="margin-top: 3px;">
                <span>${item.product_name || item.name || 'Taom'} x${item.quantity || item.qty || 1}</span>
                <span>${this.formatNumber((item.price || 0) * (item.quantity || item.qty || 1))} so'm</span>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="flex font-bold" style="font-size: 13px;">
              <span>JAMI TO'LANDI:</span>
              <span>${this.formatNumber(p.amount)} UZS</span>
            </div>
            <div class="divider"></div>
            <div class="text-center" style="margin-top: 10px;">Xaridingiz uchun rahmat!</div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            ` + `</` + `script>
          </body>
        </html>
      `);
      printWindow.document.close();
    },
    async fetchPayments() {
      try {
        this.loading = true;
        const { data } = await api.get("/payments");
        this.payments = data.sort((a, b) => b.id - a.id);
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "To'lovlarni yuklashda xatolik yuz berdi", "error");
      } finally {
        this.loading = false;
      }
    },
    getPaymentMethod(p) {
      return (p.payment_method || p.paymentMethod || p.method || "").toUpperCase();
    },
    getShortId(id, idx) {
      if (!id) return `${idx}`;
      const str = String(id);
      return str.length >= 10 ? `${idx}` : str;
    },
    getShortOrderCode(orderId, idx) {
      if (!orderId) return `ORD-${idx}`;
      const str = String(orderId);
      return str.length >= 10 ? `ORD-${idx}` : `ORD-${str}`;
    },
    formatNumber(num) {
      if (num === undefined || num === null) return "0";
      return Number(num).toLocaleString();
    },
    formatDateTime(dateString) {
      if (!dateString) return "";
      try {
        return new Date(dateString).toLocaleString("uz-UZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    },
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectMethod(val) {
      this.methodFilter = val;
      this.isDropdownOpen = false;
    },
    handleExportCSV() {
      if (this.filteredPayments.length === 0) {
        appContext.showAlert("Ogohlantirish", "Eksport qilish uchun hech qanday ma'lumot yo'q!", "info");
        return;
      }
      
      const headers = ["To'lov ID", "Buyurtma ID", "Summa (UZS)", "To'lov Usuli", "Sana/Vaqt"];
      const csvRows = [
        headers.join(","),
        ...this.filteredPayments.map((p, index) => {
          const method = this.getPaymentMethod(p);
          const methodLabel = method === "CARD" ? "Karta" :
                              method === "TRANSFER" ? "O'tkazma" : "Naqd";
          const date = new Date(p.paid_at || p.createdAt || p.created_at || Date.now())
            .toLocaleString("uz-UZ")
            .replace(/,/g, "");
          return [
            `#${this.getShortId(p.id, index + 1)}`,
            `${this.getShortOrderCode(p.order_id || p.orderId, index + 1)}`,
            p.amount,
            methodLabel,
            date
          ].join(",");
        })
      ];
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hisobot_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>
