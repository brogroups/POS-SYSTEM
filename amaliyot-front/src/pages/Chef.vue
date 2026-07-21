<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ChefHat class="text-primary h-8 w-8" />
          Oshxona Paneli
        </h2>
        <p class="text-muted-foreground mt-1">Oshxonaga tushgan barcha buyurtmalar va tarix</p>
      </div>
      
      <!-- Tabs -->
      <div class="flex bg-secondary/50 p-1 rounded-xl border border-border shrink-0">
        <button 
          @click="setActiveTab('ACTIVE')"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
            activeTab === 'ACTIVE' ? 'bg-background shadow text-primary border border-border' : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          <CookingPot class="h-4 w-4" />
          Faol buyurtmalar
        </button>
        <button 
          @click="setActiveTab('HISTORY')"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
            activeTab === 'HISTORY' ? 'bg-background shadow text-primary border border-border' : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          <History class="h-4 w-4" />
          Tarix
        </button>
      </div>
    </div>

    <div v-if="loading && displayOrders.length === 0" class="flex justify-center p-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="displayOrders.length === 0" class="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card rounded-xl border border-border shadow-sm">
      <ChefHat v-if="activeTab === 'ACTIVE'" class="h-16 w-16 mb-4 opacity-50" />
      <History v-else class="h-16 w-16 mb-4 opacity-50" />
      <p class="text-lg">{{ activeTab === 'ACTIVE' ? "Hozircha faol buyurtmalar yo'q" : "Tarix bo'sh" }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="order in displayOrders" 
        :key="order.id" 
        :class="[
          'bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col',
          activeTab === 'HISTORY' ? 'opacity-80' : ''
        ]"
      >
        <div 
          :class="[
            'p-4 border-b border-border flex justify-between items-center',
            activeTab === 'ACTIVE' ? (order.status === 'ACCEPTED' ? 'bg-blue-500/10' : 'bg-orange-500/10') : 'bg-secondary/30'
          ]"
        >
          <div>
            <h3 class="font-bold text-lg">Stol {{ order.tableId || order.table_id || '-' }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <p class="text-xs text-muted-foreground">ID: #{{ order.id }}</p>
              <div v-if="activeTab === 'HISTORY'" v-html="getStatusBadge(order.status)"></div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Clock class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">{{ formatTime(order.createdAt || order.created_at) }}</span>
          </div>
        </div>
        
        <div class="p-4 flex-1 overflow-y-auto max-h-[300px]">
          <h4 class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Buyurtma qilingan taomlar:</h4>
          <ul class="space-y-3">
            <template v-if="order.order_items && order.order_items.length > 0">
              <li 
                v-for="(item, idx) in order.order_items" 
                :key="idx" 
                class="flex justify-between items-center p-2 rounded-lg bg-secondary/30 border border-border"
              >
                <span class="font-medium text-sm">{{ item.product?.name || item.name || `Taom ID: ${item.product_id}` }}</span>
                <span class="bg-background px-2 py-1 rounded-md text-xs font-bold border border-border whitespace-nowrap">{{ item.quantity }} x</span>
              </li>
            </template>
            <template v-else-if="order.items && order.items.length > 0">
              <li 
                v-for="(item, idx) in order.items" 
                :key="idx" 
                class="flex justify-between items-center p-2 rounded-lg bg-secondary/30 border border-border"
              >
                <span class="font-medium text-sm">{{ item.product_name || item.name || `Taom ID: ${item.product_id}` }}</span>
                <span class="bg-background px-2 py-1 rounded-md text-xs font-bold border border-border whitespace-nowrap">{{ item.quantity }} x</span>
              </li>
            </template>
            <li v-else class="text-sm text-muted-foreground italic">Taomlar ro'yxati yo'q</li>
          </ul>
        </div>

        <div v-if="activeTab === 'ACTIVE'" class="p-4 border-t border-border bg-secondary/10 flex gap-3">
          <button 
            v-if="order.status === 'ACCEPTED'"
            @click="updateOrderStatus(order.id, 'PREPARING')"
            class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            Tayyorlashni boshlash
          </button>
          <button 
            v-if="order.status === 'PREPARING'"
            @click="updateOrderStatus(order.id, 'READY')"
            class="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 cursor-pointer"
          >
            <CheckCircle2 class="h-5 w-5" />
            Tayyor bo'ldi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CheckCircle2, Clock, ChefHat, History, CookingPot } from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Chef",
  components: {
    CheckCircle2,
    Clock,
    ChefHat,
    History,
    CookingPot,
  },
  data() {
    return {
      allOrders: [],
      loading: true,
      activeTab: "ACTIVE",
      intervalId: null,
    };
  },
  computed: {
    activeOrders() {
      return this.allOrders.filter(
        (o) => o.status === "ACCEPTED" || o.status === "PREPARING"
      );
    },
    historyOrders() {
      return this.allOrders.filter(
        (o) => o.status !== "ACCEPTED" && o.status !== "PREPARING"
      );
    },
    displayOrders() {
      return this.activeTab === "ACTIVE" ? this.activeOrders : this.historyOrders;
    },
  },
  mounted() {
    this.fetchOrders();
    this.intervalId = setInterval(() => {
      this.fetchOrders();
    }, 5000);
    window.addEventListener("sync-complete", this.fetchOrders);
    window.addEventListener("socket-order-updated", this.fetchOrders);
    window.addEventListener("socket-kitchen-item-added", this.onKitchenUpdate);
    window.addEventListener("socket-kitchen-item-cancelled", this.onKitchenUpdate);
    window.addEventListener("socket-kitchen-item-qty-changed", this.onKitchenUpdate);
    window.addEventListener("socket-kitchen-item-swapped", this.onKitchenUpdate);
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    window.removeEventListener("sync-complete", this.fetchOrders);
    window.removeEventListener("socket-order-updated", this.fetchOrders);
    window.removeEventListener("socket-kitchen-item-added", this.onKitchenUpdate);
    window.removeEventListener("socket-kitchen-item-cancelled", this.onKitchenUpdate);
    window.removeEventListener("socket-kitchen-item-qty-changed", this.onKitchenUpdate);
    window.removeEventListener("socket-kitchen-item-swapped", this.onKitchenUpdate);
  },
  methods: {
    onKitchenUpdate(event) {
      appContext.playNotificationSound("warning");
      const detail = event.detail || {};
      if (detail.product_name) {
        appContext.showAlert("Oshxona Ogohlantirishi", `Buyurtma o'zgartirildi: ${detail.product_name}`, "warning");
      }
      this.fetchOrders();
    },
    async fetchOrders() {
      try {
        const { data } = await api.get("/orders");
        const oldActiveIds = this.allOrders
          .filter(o => o.status === "ACCEPTED" || o.status === "PREPARING")
          .map(o => o.id);
        const newActiveOrders = data.filter(
          o => (o.status === "ACCEPTED" || o.status === "PREPARING") && !oldActiveIds.includes(o.id)
        );
        
        // Play attention-grabbing notification sound if a new order lands
        if (this.allOrders.length > 0 && newActiveOrders.length > 0) {
          appContext.playNotificationSound("warning");
        }
        
        this.allOrders = data;
      } catch (err) {
        console.error(err);
        appContext.showAlert(
          "Xatolik",
          "Buyurtmalarni yuklashda xatolik yuz berdi",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },
    async updateOrderStatus(orderId, newStatus) {
      try {
        await api.put(`/orders/${orderId}`, { status: newStatus });
        appContext.showAlert(
          "Muvaffaqiyatli",
          `Buyurtma statusi yangilandi: ${newStatus}`
        );
        this.fetchOrders();
      } catch (err) {
        console.error(err);
        appContext.showAlert(
          "Xatolik",
          "Statusni yangilashda xatolik yuz berdi",
          "error"
        );
      }
    },
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    formatTime(dateString) {
      if (!dateString) return "";
      try {
        return new Date(dateString).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    },
    getStatusBadge(status) {
      switch (status) {
        case "PENDING":
          return `<span class="px-2 py-1 bg-gray-500/10 text-gray-500 rounded-md text-xs font-bold border border-gray-500/20">Kutilmoqda</span>`;
        case "READY":
          return `<span class="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-bold border border-green-500/20">Tayyor</span>`;
        case "SERVED":
          return `<span class="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-xs font-bold border border-blue-500/20">Yetkazilgan</span>`;
        case "COMPLETED":
          return `<span class="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-md text-xs font-bold border border-purple-500/20">Yakunlangan</span>`;
        case "CANCELLED":
          return `<span class="px-2 py-1 bg-red-500/10 text-red-500 rounded-md text-xs font-bold border border-red-500/20">Rad etilgan</span>`;
        default:
          return `<span class="px-2 py-1 bg-secondary text-foreground rounded-md text-xs font-bold border border-border">${status}</span>`;
      }
    },
  },
};
</script>
