<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Mijozlar</h2>
        <p class="text-muted-foreground mt-1">Sodiq mijozlar ro'yxati va ularning hozirgi holati</p>
      </div>
      <button
        @click="handleOpenModal()"
        class="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
      >
        <Plus class="h-5 w-5" />
        Mijoz Qo'shish
      </button>
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm glass overflow-hidden">
      <div class="p-4 border-b border-border flex items-center gap-2 bg-background/50">
        <Search class="h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          v-model="search"
          placeholder="Ism yoki telefon orqali qidirish..." 
          class="bg-transparent border-none outline-none text-sm w-full" 
        />
      </div>
      
      <div v-if="loading" class="flex justify-center p-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-muted-foreground uppercase bg-secondary/50">
            <tr>
              <th class="px-6 py-4 font-medium">Mijoz</th>
              <th class="px-6 py-4 font-medium">Telefon</th>
              <th class="px-6 py-4 font-medium">Hozirgi Stoli</th>
              <th class="px-6 py-4 font-medium">Bonus Ballari</th>
              <th class="px-6 py-4 font-medium text-right">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer.id" class="border-b border-border hover:bg-secondary/20 transition-colors">
              <td class="px-6 py-4 font-medium flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users class="h-4 w-4" />
                </div>
                {{ customer.full_name || customer.name }}
              </td>
              <td class="px-6 py-4 text-muted-foreground">{{ customer.phone || 'Kiritilmagan' }}</td>
              
              <td class="px-6 py-4">
                <div :class="[
                  'flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md w-max border',
                  getCustomerTable(customer.id) !== 'Bo\'sh' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-secondary text-muted-foreground border-border'
                ]">
                  <MonitorSmartphone class="h-4 w-4" />
                  {{ getCustomerTable(customer.id) }}
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center gap-1.5 text-yellow-500 font-bold bg-yellow-500/10 px-2.5 py-1 rounded-md w-max border border-yellow-500/20">
                  <Star class="h-4 w-4 fill-yellow-500" />
                  {{ customer.bonus_balance || customer.points || 0 }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="handleOpenModal(customer)" class="text-blue-500 hover:text-blue-600 p-2 cursor-pointer">
                  <Edit class="h-4 w-4" />
                </button>
                <button @click="handleDelete(customer.id)" class="text-red-500 hover:text-red-600 p-2 ml-2 cursor-pointer">
                  <Trash2 class="h-4 w-4" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredCustomers.length === 0">
              <td colSpan="5" class="px-6 py-8 text-center text-muted-foreground">Mijozlar topilmadi.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Dialog -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden">
          <div class="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
            <h3 class="text-lg font-semibold">{{ editingCustomer ? "Mijozni tahrirlash" : "Yangi mijoz qo'shish" }}</h3>
            <button @click="isModalOpen = false" class="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors hover:bg-secondary cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>
          <form @submit.prevent="handleSave" class="p-5 space-y-5">
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">To'liq ism</label>
              <input required v-model="name" type="text" placeholder="Ismni kiriting" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Telefon raqami</label>
              <input v-model="phone" type="text" placeholder="+998 90 123 45 67" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Bonus ballari (Points)</label>
              <input v-model.number="points" type="number" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" />
            </div>
            <div class="pt-2 flex justify-end gap-3">
              <button type="button" @click="isModalOpen = false" class="px-5 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium cursor-pointer">Bekor qilish</button>
              <button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium shadow-md cursor-pointer">Saqlash</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Plus, Edit, Trash2, X, Search, Users, Star, MonitorSmartphone } from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Customers",
  components: {
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    Users,
    Star,
    MonitorSmartphone,
  },
  data() {
    return {
      customers: [],
      activeOrders: [],
      isModalOpen: false,
      editingCustomer: null,
      loading: true,
      search: "",
      name: "",
      phone: "",
      points: 0,
    };
  },
  computed: {
    filteredCustomers() {
      const q = this.search.toLowerCase().trim();
      if (!q) return this.customers;
      return this.customers.filter(c => 
        (c.full_name || c.name || "").toLowerCase().includes(q) || 
        (c.phone && c.phone.includes(q))
      );
    },
  },
  mounted() {
    this.fetchCustomers();
  },
  methods: {
    async fetchCustomers() {
      try {
        this.loading = true;
        const [customersRes, ordersRes] = await Promise.all([
          api.get("/customers"),
          api.get("/orders"),
        ]);
        this.customers = customersRes.data;
        this.activeOrders = ordersRes.data.filter(o => 
          o.status === "PENDING" || 
          o.status === "ACCEPTED" || 
          o.status === "PREPARING" || 
          o.status === "READY"
        );
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Mijozlarni yuklashda xatolik yuz berdi", "error");
      } finally {
        this.loading = false;
      }
    },
    handleOpenModal(customer = null) {
      if (customer) {
        this.editingCustomer = customer;
        this.name = customer.full_name || customer.name;
        this.phone = customer.phone || "";
        this.points = customer.bonus_balance || customer.points || 0;
      } else {
        this.editingCustomer = null;
        this.name = "";
        this.phone = "";
        this.points = 0;
      }
      this.isModalOpen = true;
    },
    async handleSave() {
      try {
        const payload = { 
          branch_id: 1, 
          full_name: this.name, 
          phone: this.phone, 
          bonus_balance: Number(this.points) 
        };
        if (this.editingCustomer) {
          await api.put(`/customers/${this.editingCustomer.id}`, payload);
          appContext.showAlert("Muvaffaqiyatli", "Mijoz ma'lumotlari yangilandi");
        } else {
          await api.post("/customers", payload);
          appContext.showAlert("Muvaffaqiyatli", "Yangi mijoz qo'shildi");
        }
        this.isModalOpen = false;
        this.fetchCustomers();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Saqlashda xatolik yuz berdi", "error");
      }
    },
    handleDelete(id) {
      appContext.showConfirm("Mijozni o'chirish", "Haqiqatan ham o'chirmoqchimisiz?", async () => {
        try {
          await api.delete(`/customers/${id}`);
          this.fetchCustomers();
          appContext.showAlert("Muvaffaqiyatli", "Mijoz o'chirildi");
        } catch (err) {
          console.error(err);
          appContext.showAlert("Xatolik", "O'chirishda xatolik yuz berdi", "error");
        }
      });
    },
    getCustomerTable(customerId) {
      const order = this.activeOrders.find(o => o.customerId === customerId || o.customer_id === customerId);
      if (order && (order.tableId || order.table_id)) {
        return `Stol ${order.tableId || order.table_id}`;
      }
      return "Bo'sh";
    },
  },
};
</script>
