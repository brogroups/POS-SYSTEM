<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Buyurtmalar</h2>
        <p class="text-muted-foreground mt-1">Barcha tushgan buyurtmalar tarixi</p>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm glass overflow-hidden">
      <div class="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div class="flex items-center gap-2 w-full sm:w-auto bg-background border border-border rounded-lg px-3 py-2">
          <Search class="h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="ID orqali qidirish..." 
            class="bg-transparent border-none outline-none text-sm w-full sm:w-64" 
          />
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-white bg-primary/20 px-3 py-2 rounded-lg border border-primary/30">
            <input 
              type="checkbox" 
              v-model="shiftOnly"
              class="w-4 h-4 rounded accent-primary cursor-pointer" 
            />
            Faqat Mening Smenam
          </label>
          <div class="flex items-center gap-2 relative">
            <Filter class="h-4 w-4 text-muted-foreground" />
            <button 
              @click="toggleFilterDropdown"
              class="bg-[#1e2230] border border-[#2a2e3d] hover:border-primary/50 text-white rounded-lg px-4 py-2 text-sm outline-none font-medium flex items-center justify-between gap-3 min-w-[150px] transition-colors relative cursor-pointer"
            >
              <span>
                {{ 
                  filter === "BARCHA" ? "Barchasi" :
                  filter === "ACCEPTED" ? "Yangi" :
                  filter === "PREPARING" ? "Tayyorlanmoqda" :
                  filter === "READY" ? "Tayyor" :
                  filter === "COMPLETED" ? "Yakunlangan" :
                  "Rad etilgan"
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
              <div v-if="isFilterDropdownOpen" class="absolute right-0 top-full mt-2 w-48 bg-[#181b25] border border-[#2a2e3d] rounded-xl shadow-2xl overflow-hidden z-40 p-1.5">
                <button
                  v-for="option in filterOptions"
                  :key="option.value"
                  @click="selectFilter(option.value)"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-secondary/40 transition-colors flex items-center justify-between cursor-pointer',
                    option.color,
                    filter === option.value ? 'bg-[#3b82f6]/10 text-primary border border-primary/20' : ''
                  ]"
                >
                  {{ option.label }}
                  <span v-if="filter === option.value" class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                </button>
              </div>
            </transition>
            <!-- Overlay to close dropdown -->
            <div v-if="isFilterDropdownOpen" class="fixed inset-0 z-30" @click="isFilterDropdownOpen = false"></div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="flex justify-center p-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-muted-foreground uppercase bg-secondary/50">
            <tr>
              <th class="px-6 py-4 font-medium">ID</th>
              <th class="px-6 py-4 font-medium">Sana/Vaqti</th>
              <th class="px-6 py-4 font-medium">Stol/Turi</th>
              <th class="px-6 py-4 font-medium">Jami Summa</th>
              <th class="px-6 py-4 font-medium">Status</th>
              <th class="px-6 py-4 font-medium text-right">Batafsil</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" class="border-b border-border hover:bg-secondary/20 transition-colors">
              <td class="px-6 py-4 font-bold text-blue-400">#{{ String(order.id).length > 8 ? String(order.id).slice(-4) : order.id }}</td>
              <td class="px-6 py-4 text-muted-foreground">{{ formatDateTime(order.createdAt || order.created_at) }}</td>
              <td class="px-6 py-4 font-medium">
                {{ formatTableName(order.tableId || order.table_id, order) }}
                <span class="block text-xs text-muted-foreground font-normal mt-0.5">{{ order.source === 'DINE_IN' ? 'Zalda' : order.source }}</span>
              </td>
              <td class="px-6 py-4 font-bold">{{ formatNumber(order.final_amount || order.totalAmount || 0) }} UZS</td>
              <td class="px-6 py-4" v-html="getStatusBadge(order.status)"></td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="selectedOrder = order"
                  class="text-blue-500 hover:text-blue-600 p-2 bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20 cursor-pointer"
                >
                  <Eye class="h-4 w-4" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colSpan="6" class="px-6 py-8 text-center text-muted-foreground">Buyurtmalar topilmadi.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Order Details -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <div class="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl relative flex flex-col max-h-[90vh]">
          <div class="p-5 border-b border-border flex justify-between items-center">
            <h3 class="text-xl font-bold text-white">Buyurtma #{{ selectedOrder.id }}</h3>
            <button @click="selectedOrder = null" class="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>
          
          <div class="p-5 flex-1 overflow-y-auto">
            <div v-if="selectedOrder.status === 'CANCELLED' && isPrivilegedRole" class="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p class="text-xs font-bold text-red-500 uppercase tracking-wider">Bekor qilish sababi:</p>
              <p class="text-sm font-semibold text-white mt-1.5">{{ selectedOrder.notes || "Sabab yozilmagan" }}</p>
            </div>
            <div class="flex justify-between mb-4 text-sm">
              <div>
                <p class="text-muted-foreground">Stol / Turi</p>
                <p class="font-semibold text-white">{{ formatTableName(selectedOrder.tableId || selectedOrder.table_id, selectedOrder) }}</p>
              </div>
              <div class="text-right">
                <p class="text-muted-foreground">Sana</p>
                <p class="font-semibold text-white">{{ formatDateTime(selectedOrder.createdAt || selectedOrder.created_at) }}</p>
              </div>
            </div>

            <h4 class="font-bold text-sm mb-3 uppercase text-muted-foreground">Taomlar ro'yxati:</h4>
            <div class="space-y-3">
              <div 
                v-for="(item, idx) in (selectedOrder.order_items || selectedOrder.items || [])" 
                :key="idx" 
                class="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div>
                  <p class="font-medium text-sm text-white">{{ item.product?.name || item.product_name || item.name || `Taom ID: ${item.product_id}` }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ formatNumber(item.price) }} UZS x {{ item.quantity }}</p>
                </div>
                <div class="font-bold text-white">
                  {{ formatNumber(item.subtotal || (item.price * item.quantity)) }} UZS
                </div>
              </div>
              <div v-if="(selectedOrder.order_items || selectedOrder.items || []).length === 0" class="text-muted-foreground text-sm italic">
                Taomlar topilmadi
              </div>
            </div>
          </div>

          <div class="p-5 border-t border-border bg-secondary/10 flex justify-between items-center rounded-b-xl">
            <span class="text-muted-foreground font-medium">Jami summa:</span>
            <span class="text-2xl font-bold text-primary">{{ formatNumber(selectedOrder.final_amount || selectedOrder.totalAmount || 0) }} UZS</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Search, Eye, Filter, X, ChevronDown } from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Orders",
  components: {
    Search,
    Eye,
    Filter,
    X,
    ChevronDown,
  },
  data() {
    return {
      state: appContext.state,
      orders: [],
      tables: [],
      loading: true,
      filter: "BARCHA",
      shiftOnly: false,
      selectedOrder: null,
      isFilterDropdownOpen: false,
      searchQuery: "",
      filterOptions: [
        { value: "BARCHA", label: "Barchasi", color: "text-white" },
        { value: "ACCEPTED", label: "Yangi", color: "text-blue-400" },
        { value: "PREPARING", label: "Tayyorlanmoqda", color: "text-amber-400" },
        { value: "READY", label: "Tayyor", color: "text-green-400" },
        { value: "COMPLETED", label: "Yakunlangan", color: "text-green-500" },
        { value: "CANCELLED", label: "Rad etilgan", color: "text-red-400" },
      ],
    };
  },
  computed: {
    isPrivilegedRole() {
      const r = this.state.role;
      return r === "SUPERADMIN" || r === "ADMIN" || r === "MANAGER";
    },
    shiftStartTime() {
      return localStorage.getItem("shiftStartTime");
    },
    filteredOrders() {
      const role = this.state.role;
      const currentUser = this.state.currentUser;
      const q = this.searchQuery.toLowerCase().trim();

      return this.orders.filter(o => {
        // Waiter role filters
        if (role === "WAITER" && currentUser?.id) {
          const isOwn = o.waiter_id === currentUser.id || o.waiterId === currentUser.id;
          const isUnassigned = o.waiter_id === null || o.waiter_id === undefined || o.waiterId === null || o.waiterId === undefined;
          if (!isOwn && !isUnassigned) return false;
        }

        // Search Filter
        if (q && !o.id.toString().includes(q)) {
          return false;
        }

        // Status filter
        const matchStatus = this.filter === "BARCHA" ? true : o.status === this.filter;
        
        // Shift filter
        let matchShift = true;
        if (this.shiftOnly && this.shiftStartTime) {
          matchShift = new Date(o.createdAt || o.created_at || Date.now()) >= new Date(this.shiftStartTime);
        }

        return matchStatus && matchShift;
      });
    },
  },
  mounted() {
    this.fetchOrders();
    window.addEventListener("sync-complete", this.fetchOrders);
  },
  beforeUnmount() {
    window.removeEventListener("sync-complete", this.fetchOrders);
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true;
        const [ordersRes, tablesRes] = await Promise.all([
          api.get("/orders"),
          api.get("/restaurant-tables").catch(() => ({ data: [] }))
        ]);
        this.orders = (ordersRes.data || []).sort((a, b) => b.id - a.id);
        this.tables = tablesRes.data || [];
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Buyurtmalarni yuklashda xatolik yuz berdi", "error");
      } finally {
        this.loading = false;
      }
    },
    toggleFilterDropdown() {
      this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
    },
    selectFilter(val) {
      this.filter = val;
      this.isFilterDropdownOpen = false;
    },
    formatTableName(tableId, order) {
      if (order && order.table_number) return `Stol #${order.table_number}`;
      
      const idStr = String(tableId || order?.table_id || order?.tableId || "");
      if (!idStr) return "-";

      if (idStr.length <= 3 && !isNaN(Number(idStr))) {
        return `Stol #${idStr}`;
      }

      const foundTable = (this.tables || []).find(t => String(t.id) === idStr || String(t._id) === idStr);
      if (foundTable) {
        return `Stol #${foundTable.table_number || foundTable.number || idStr.slice(-3)}`;
      }

      return `Stol #${idStr.slice(-3)}`;
    },
    formatNumber(num) {
      if (num === undefined || num === null) return "0";
      return Number(num).toLocaleString();
    },
    formatDateTime(dateString) {
      if (!dateString) return "";
      try {
        return new Date(dateString).toLocaleString("uz-UZ");
      } catch {
        return "";
      }
    },
    getStatusBadge(status) {
      switch (status) {
        case "YANGI":
        case "ACCEPTED":
        case "PENDING":
          return `<span class="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-xs font-medium border border-blue-500/20">Yangi</span>`;
        case "PREPARING":
          return `<span class="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-md text-xs font-medium border border-orange-500/20">Tayyorlanmoqda</span>`;
        case "TAYYOR":
        case "READY":
          return `<span class="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-medium border border-green-500/20">Tayyor</span>`;
        case "SERVED":
        case "COMPLETED":
        case "TOLANGAN":
          return `<span class="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-medium border border-green-500/20">Yakunlangan</span>`;
        case "CANCELLED":
          return `<span class="px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-xs font-medium border border-red-500/20">Rad etilgan</span>`;
        default:
          return `<span class="px-2 py-1 bg-secondary text-foreground rounded-md text-xs font-medium border border-border">${status}</span>`;
      }
    },
  },
};
</script>
