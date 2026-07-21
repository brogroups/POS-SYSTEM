<template>
  <div class="space-y-6 bg-[#0f1117] text-white p-6 rounded-2xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181b25] border border-[#2a2e3d] p-6 rounded-2xl shadow-xl">
      <div>
        <h2 class="text-2xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard class="h-7 w-7 text-blue-500 shrink-0" />
          <span>Bosh Sahifa & Tizim Xulosasi</span>
        </h2>
        <p class="text-xs text-[#94a3b8] mt-1">Restoran tushumlari, sotuvlar grafigi va operatsiyalar holati</p>
      </div>
      <div class="bg-[#1e2230] border border-[#2a2e3d] px-4 py-2 rounded-xl text-xs text-[#94a3b8] flex items-center gap-2 shadow-sm font-medium">
        <Calendar class="h-4 w-4 text-blue-400" />
        Oxirgi 7 kunlik ko'rsatkichlar
      </div>
    </div>

    <!-- === BUGUNGI TUSHIM — KATTA PREMIUM KARTA === -->
    <div 
      @click="openRevenueModal"
      class="cursor-pointer rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-[#181b25] p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/60 transition-all duration-300"
    >
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp class="h-4 w-4" /> Bugungi Tushim
          </p>
          <p class="text-3xl font-black text-white mt-1">
            {{ formatNumber(stats.todayTotalFromPayments || stats.todayRevenue || 0) }}
            <span class="text-base font-semibold text-white/50 ml-2">so'm</span>
          </p>
        </div>
        <div class="h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
          <DollarSign class="h-7 w-7 text-blue-400" />
        </div>
      </div>
      
      <!-- Naqd tushum ko'rsatkichi -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-black/30 border border-emerald-500/20 rounded-xl p-3 backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-[10px] font-bold text-emerald-400 uppercase">Naqd Tushum</span>
          </div>
          <p class="text-base font-black text-white">{{ formatNumber(stats.todayRevenue || stats.todayTotalFromPayments || 0) }}</p>
          <p class="text-[10px] text-white/40 mt-0.5">so'm</p>
        </div>
        <div class="bg-black/30 border border-blue-500/20 rounded-xl p-3 backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            <span class="text-[10px] font-bold text-blue-400 uppercase">Valyuta & To'lov</span>
          </div>
          <p class="text-base font-black text-white">100% Naqd</p>
          <p class="text-[10px] text-white/40 mt-0.5">so'mda</p>
        </div>
      </div>
      <p class="text-[11px] text-white/40 mt-3 text-right font-medium">Batafsil ko'rish uchun bosing ↗</p>
    </div>

    <!-- 3 TA KICHIK METRIKA KARTASI -->
    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-[#2a2e3d] bg-[#181b25] p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-colors">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-[#94a3b8]">Buyurtmalar</span>
          <div class="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShoppingBag class="h-5 w-5" />
          </div>
        </div>
        <div class="text-2xl font-black text-white">{{ stats.totalOrders }}</div>
        <div class="text-[11px] text-[#94a3b8] mt-1">Jami kiritilgan buyurtmalar</div>
      </div>

      <div class="rounded-2xl border border-[#2a2e3d] bg-[#181b25] p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-[#94a3b8]">Mijozlar</span>
          <div class="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users class="h-5 w-5" />
          </div>
        </div>
        <div class="text-2xl font-black text-white">{{ stats.totalCustomers }}</div>
        <div class="text-[11px] text-[#94a3b8] mt-1">Ro'yxatga olingan mijozlar</div>
      </div>

      <div class="rounded-2xl border border-[#2a2e3d] bg-[#181b25] p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-colors">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-[#94a3b8]">O'rtacha Chek</span>
          <div class="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CreditCard class="h-5 w-5" />
          </div>
        </div>
        <div class="text-2xl font-black text-white">{{ formatNumber(Math.round(stats.averageCheck || 0)) }}</div>
        <div class="text-[11px] text-[#94a3b8] mt-1">so'm / 1 buyurtma</div>
      </div>
    </div>

    <!-- QUICK MANAGEMENT SHORTCUTS -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <router-link to="/pos" class="bg-[#181b25] border border-[#2a2e3d] hover:border-blue-500/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer shadow-md">
        <div class="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
          <MonitorSmartphone class="h-6 w-6" />
        </div>
        <span class="text-xs font-bold text-white">Stollar & POS</span>
      </router-link>
      <router-link to="/products" class="bg-[#181b25] border border-[#2a2e3d] hover:border-purple-500/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer shadow-md">
        <div class="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
          <Utensils class="h-6 w-6" />
        </div>
        <span class="text-xs font-bold text-white">Menyu & Reseptlar</span>
      </router-link>
      <router-link to="/inventory" class="bg-[#181b25] border border-[#2a2e3d] hover:border-emerald-500/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer shadow-md">
        <div class="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
          <Package class="h-6 w-6" />
        </div>
        <span class="text-xs font-bold text-white">Ombor & Tamaki</span>
      </router-link>
      <router-link to="/expenses" class="bg-[#181b25] border border-[#2a2e3d] hover:border-rose-500/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all cursor-pointer shadow-md">
        <div class="p-3 bg-rose-500/10 text-rose-400 rounded-xl group-hover:scale-110 transition-transform">
          <Receipt class="h-6 w-6" />
        </div>
        <span class="text-xs font-bold text-white">Kunlik Rasxodlar</span>
      </router-link>
    </div>

    <!-- Chart and Popular Dishes -->
    <div class="grid gap-6 lg:grid-cols-7">
      <div class="lg:col-span-5 rounded-2xl border border-[#2a2e3d] bg-[#181b25] p-6 shadow-xl">
        <div class="mb-6 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 class="h-5 w-5 text-blue-400" /> Tushumlar Grafigi
            </h3>
            <p class="text-xs text-[#94a3b8] mt-0.5">Oxirgi 7 kundagi kunlik tushumlar (so'm)</p>
          </div>
        </div>
        <div class="h-[320px] w-full relative">
          <svg v-if="chartData.length > 0" class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="#3b82f6" stop-opacity="0.3"/>
                <stop offset="95%" stop-color="#3b82f6" stop-opacity="0"/>
              </linearGradient>
            </defs>
            
            <line x1="0" y1="50" x2="500" y2="50" stroke="#2a2e3d" opacity="0.4" stroke-width="0.5" />
            <line x1="0" y1="100" x2="500" y2="100" stroke="#2a2e3d" opacity="0.4" stroke-width="0.5" />
            <line x1="0" y1="150" x2="500" y2="150" stroke="#2a2e3d" opacity="0.4" stroke-width="0.5" />
            <line x1="0" y1="190" x2="500" y2="190" stroke="#2a2e3d" opacity="0.6" stroke-width="0.5" />

            <path :d="svgFilledPath" fill="url(#colorAmount)" />
            <path :d="svgLinePath" fill="none" stroke="#3b82f6" stroke-width="2.5" />

            <circle 
              v-for="(pt, idx) in chartPoints" 
              :key="idx" 
              :cx="pt.x" 
              :cy="pt.y" 
              r="4.5" 
              fill="#3b82f6" 
              stroke="#ffffff" 
              stroke-width="1.8" 
              class="cursor-pointer transition-all"
              @mouseover="showTooltip($event, pt)"
              @mouseleave="hideTooltip"
            />
          </svg>

          <div class="flex justify-between text-[10px] text-[#94a3b8] mt-2 px-1 font-semibold">
            <span v-for="(day, idx) in chartData" :key="idx">{{ day.name }}</span>
          </div>

          <div 
            v-if="hoveredPoint" 
            class="absolute bg-[#1e2230] border border-[#2a2e3d] p-3 rounded-xl shadow-xl pointer-events-none z-50 text-xs"
            :style="{ left: hoveredPoint.elX + 'px', top: hoveredPoint.elY - 60 + 'px' }"
          >
            <p class="text-[#94a3b8] mb-0.5">{{ hoveredPoint.name }}</p>
            <p class="font-bold text-blue-400">{{ formatNumber(hoveredPoint.amount) }} UZS</p>
          </div>
        </div>
      </div>

      <!-- Popular Dishes -->
      <div class="lg:col-span-2 rounded-2xl border border-[#2a2e3d] bg-[#181b25] p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-white mb-1">Top Sotilganlar</h3>
          <p class="text-xs text-[#94a3b8] mb-4">Eng ko'p buyurtma qilinganlar</p>
          <div class="space-y-4">
            <div v-for="(item, i) in popularDishes" :key="i" class="flex items-center justify-between p-2 rounded-xl bg-[#1e2230]/50 border border-[#2a2e3d]">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-xs text-blue-400">
                  {{ i + 1 }}
                </div>
                <div>
                  <p class="text-xs font-bold text-white">{{ item.name }}</p>
                  <p class="text-[10px] text-[#94a3b8]">{{ item.count }} marta sotilgan</p>
                </div>
              </div>
              <div class="font-bold text-xs text-rose-400">
                {{ item.price }} so'm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Revenue Modal -->
    <div 
      v-if="isRevenueModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-xl rounded-2xl shadow-2xl relative flex flex-col max-h-[80vh]">
        <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]">
          <div>
            <h3 class="text-lg font-bold text-white">Bugungi Tushum Tafsilotlari</h3>
            <p class="text-xs text-[#94a3b8] mt-0.5">Bugungi muvaffaqiyatli yakunlangan buyurtmalar</p>
          </div>
          <button @click="closeRevenueModal" class="p-2 bg-[#2a2e3d] rounded-xl text-[#94a3b8] hover:text-white cursor-pointer">
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <div class="p-5 flex-1 overflow-y-auto">
          <table class="w-full text-xs text-left">
            <thead class="text-[11px] text-[#94a3b8] uppercase bg-[#1e2230] border-b border-[#2a2e3d]">
              <tr>
                <th class="px-4 py-3 font-semibold">Buyurtma ID</th>
                <th class="px-4 py-3 font-semibold">Vaqti</th>
                <th class="px-4 py-3 font-semibold">Stol</th>
                <th class="px-4 py-3 font-semibold">Turi</th>
                <th class="px-4 py-3 font-semibold text-right">Summa</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#2a2e3d]">
              <tr v-for="o in todayOrdersList" :key="o.id" class="hover:bg-[#1e2230]/50 transition-colors">
                <td class="px-4 py-3 font-bold text-blue-400">#{{ String(o.id).length > 8 ? String(o.id).slice(-4) : o.id }}</td>
                <td class="px-4 py-3 text-[#94a3b8]">
                  {{ formatTime(o.createdAt || o.created_at) }}
                </td>
                <td class="px-4 py-3 font-semibold text-white">Stol {{ o.tableId || o.table_id || '-' }}</td>
                <td class="px-4 py-3 text-[#94a3b8]">{{ o.source === 'DINE_IN' ? 'Zalda' : o.source }}</td>
                <td class="px-4 py-3 font-black text-right text-emerald-400">
                  {{ formatNumber(o.final_amount || o.totalAmount || o.total_amount) }} so'm
                </td>
              </tr>
              <tr v-if="todayOrdersList.length === 0">
                <td colSpan="5" class="px-4 py-8 text-center text-[#94a3b8] italic">Bugun hali buyurtmalar yopilmadi.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-5 border-t border-[#2a2e3d] bg-[#14161e] rounded-b-2xl space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <p class="text-[10px] font-bold text-emerald-400 uppercase mb-1">Naqd</p>
              <p class="text-sm font-black text-white">{{ formatNumber(stats.todayCashPayments || 0) }}</p>
              <p class="text-[10px] text-white/40">so'm</p>
            </div>
            <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <p class="text-[10px] font-bold text-blue-400 uppercase mb-1">Karta</p>
              <p class="text-sm font-black text-white">{{ formatNumber(stats.todayCardPayments || 0) }}</p>
              <p class="text-[10px] text-white/40">so'm</p>
            </div>
            <div class="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
              <p class="text-[10px] font-bold text-purple-400 uppercase mb-1">O'tkazma</p>
              <p class="text-sm font-black text-white">{{ formatNumber(stats.todayTransferPayments || 0) }}</p>
              <p class="text-[10px] text-white/40">so'm</p>
            </div>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-[#2a2e3d]">
            <span class="text-[#94a3b8] font-semibold text-xs">Bugungi jami tushum:</span>
            <span class="text-lg font-black text-blue-400">{{ formatNumber(stats.todayTotalFromPayments || stats.todayRevenue || 0) }} so'm</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, ShoppingBag, 
  CreditCard, Calendar, X, MonitorSmartphone, Utensils, 
  Package, Receipt, BarChart3
} from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Dashboard",
  components: {
    LayoutDashboard,
    TrendingUp,
    Users,
    DollarSign,
    ShoppingBag,
    CreditCard,
    Calendar,
    X,
    MonitorSmartphone,
    Utensils,
    Package,
    Receipt,
    BarChart3
  },
  data() {
    return {
      stats: {
        totalRevenue: 0,
        todayRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        cardPayments: 0,
        cashPayments: 0,
        transferPayments: 0,
        todayCardPayments: 0,
        todayCashPayments: 0,
        todayTransferPayments: 0,
        todayTotalFromPayments: 0,
        averageCheck: 0,
        completedOrdersCount: 0,
        paymentsCount: 0,
      },
      chartData: [],
      loading: true,
      isRevenueModalOpen: false,
      todayOrdersList: [],
      hoveredPoint: null,
      popularDishes: [
        { name: "Mineral Suv 0.5L", count: 125, price: "5,000" },
        { name: "Coca-Cola 0.5L", count: 98, price: "10,000" },
        { name: "Kalyan Classic (Double Apple)", count: 84, price: "100,000" },
        { name: "Kalyan Premium (Grape & Mint)", count: 62, price: "120,000" },
      ],
    };
  },
  computed: {
    maxChartAmount() {
      if (this.chartData.length === 0) return 1000;
      return Math.max(...this.chartData.map(d => d.amount), 1000);
    },
    chartPoints() {
      if (this.chartData.length === 0) return [];
      return this.chartData.map((d, index) => {
        const x = (index / (this.chartData.length - 1)) * 480 + 10;
        const y = 190 - (d.amount / this.maxChartAmount) * 150;
        return {
          x,
          y,
          name: d.name,
          amount: d.amount,
        };
      });
    },
    svgLinePath() {
      if (this.chartPoints.length === 0) return "";
      return "M " + this.chartPoints.map(p => `${p.x} ${p.y}`).join(" L ");
    },
    svgFilledPath() {
      if (this.chartPoints.length === 0) return "";
      const pts = this.chartPoints;
      return `M ${pts[0].x} 190 L ` + pts.map(p => `${p.x} ${p.y}`).join(" L ") + ` L ${pts[pts.length - 1].x} 190 Z`;
    },
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    formatNumber(num) {
      if (num === undefined || num === null) return "0";
      return Number(num).toLocaleString();
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
    openRevenueModal() {
      this.isRevenueModalOpen = true;
    },
    closeRevenueModal() {
      this.isRevenueModalOpen = false;
    },
    showTooltip(event, pt) {
      const rect = event.target.ownerSVGElement.getBoundingClientRect();
      const ptRect = event.target.getBoundingClientRect();
      const elX = ptRect.left - rect.left;
      const elY = ptRect.top - rect.top;
      
      this.hoveredPoint = {
        ...pt,
        elX,
        elY,
      };
    },
    hideTooltip() {
      this.hoveredPoint = null;
    },
    async fetchDashboardData() {
      try {
        this.loading = true;
        const [ordersRes, paymentsRes, customersRes, productsRes] = await Promise.all([
          api.get("/orders"),
          api.get("/payments"),
          api.get("/customers"),
          api.get("/products").catch(() => ({ data: [] })),
        ]);

        const orders = ordersRes.data || [];
        const customers = customersRes.data || [];
        const payments = paymentsRes.data || [];
        const products = productsRes.data || [];

        // Real Top Sold Dishes calculation
        const itemMap = {};
        orders.forEach(o => {
          const items = o.order_items || o.orderItems || [];
          items.forEach(it => {
            const pId = it.product_id || it.productId;
            const pObj = products.find(p => p.id === pId);
            const pName = it.product_name || (pObj ? pObj.name : "Taom");
            const pPrice = it.price || (pObj ? pObj.price : 0);
            const qty = Number(it.quantity || it.qty || 1);
            if (!itemMap[pName]) {
              itemMap[pName] = { name: pName, count: 0, price: pPrice };
            }
            itemMap[pName].count += qty;
          });
        });

        const computedTopDishes = Object.values(itemMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 4)
          .map(d => ({ ...d, price: this.formatNumber(d.price) }));

        if (computedTopDishes.length > 0) {
          this.popularDishes = computedTopDishes;
        }

        const completedOrders = orders.filter(o => o.status !== "CANCELLED");
        const totalRevenue = completedOrders.reduce(
          (acc, o) => acc + Number(o.final_amount || o.totalAmount || o.total_amount || 0),
          0
        );

        const today = new Date();
        const filteredTodayOrders = completedOrders.filter(o => {
          const oDate = new Date(o.createdAt || o.created_at || Date.now());
          return (
            oDate.getDate() === today.getDate() &&
            oDate.getMonth() === today.getMonth() &&
            oDate.getFullYear() === today.getFullYear()
          );
        });
        const todayRevenue = filteredTodayOrders.reduce(
          (acc, o) => acc + Number(o.final_amount || o.totalAmount || o.total_amount || 0),
          0
        );

        this.todayOrdersList = filteredTodayOrders;

        const totalOrders = orders.length;
        const totalCustomers = customers.length;

        const cardPayments = payments
          .filter(p => p.payment_method === "CARD")
          .reduce((acc, p) => acc + Number(p.amount), 0);
        const cashPayments = payments
          .filter(p => p.payment_method === "CASH")
          .reduce((acc, p) => acc + Number(p.amount), 0);
        const transferPayments = payments
          .filter(p => p.payment_method === "TRANSFER")
          .reduce((acc, p) => acc + Number(p.amount), 0);

        const todayPayments = payments.filter(p => {
          const pDate = new Date(p.paid_at || p.paidAt || p.created_at || Date.now());
          return (
            pDate.getDate() === today.getDate() &&
            pDate.getMonth() === today.getMonth() &&
            pDate.getFullYear() === today.getFullYear()
          );
        });
        const todayCardPayments = todayPayments
          .filter(p => p.payment_method === "CARD")
          .reduce((acc, p) => acc + Number(p.amount), 0);
        const todayCashPayments = todayPayments
          .filter(p => p.payment_method === "CASH")
          .reduce((acc, p) => acc + Number(p.amount), 0);
        const todayTransferPayments = todayPayments
          .filter(p => p.payment_method === "TRANSFER")
          .reduce((acc, p) => acc + Number(p.amount), 0);
        const todayTotalFromPayments = todayCardPayments + todayCashPayments + todayTransferPayments;

        const averageCheck = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        this.stats = {
          totalRevenue,
          todayRevenue,
          totalOrders,
          totalCustomers,
          cardPayments,
          cashPayments,
          transferPayments,
          todayCardPayments,
          todayCashPayments,
          todayTransferPayments,
          todayTotalFromPayments,
          averageCheck,
          completedOrdersCount: completedOrders.length,
          paymentsCount: payments.length,
        };

        // Chart Data (Last 7 Days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            date: d,
            name: d.toLocaleDateString("uz-UZ", { weekday: "short" }),
            amount: 0,
          };
        });

        completedOrders.forEach(o => {
          const oDate = new Date(o.createdAt || o.created_at || Date.now());
          const dayItem = last7Days.find(
            d => d.date.getDate() === oDate.getDate() && d.date.getMonth() === oDate.getMonth()
          );
          if (dayItem) {
            dayItem.amount += Number(o.final_amount || o.totalAmount || o.total_amount || 0);
          }
        });

        this.chartData = last7Days;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
