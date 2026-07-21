<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Xodimlar</h2>
        <p class="text-muted-foreground mt-1">Tizim foydalanuvchilari va rollarni boshqarish</p>
      </div>
      <button
        v-if="isPrivileged"
        @click="handleOpenModal()"
        class="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
      >
        <Plus class="h-5 w-5" />
        Xodim Qo'shish
      </button>
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm glass overflow-hidden">
      <div class="p-4 border-b border-border flex items-center gap-2">
        <Search class="h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Ism yoki raqam orqali qidirish..." 
          class="bg-transparent border-none outline-none text-sm w-full text-white" 
        />
      </div>
      
      <div v-if="loading" class="flex justify-center p-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-muted-foreground uppercase bg-secondary/50">
            <tr>
              <th class="px-6 py-4 font-medium">F.I.SH.</th>
              <th class="px-6 py-4 font-medium">Telefon</th>
              <th class="px-6 py-4 font-medium">Roli</th>
              <th class="px-6 py-4 font-medium text-right">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="border-b border-border hover:bg-secondary/20 transition-colors">
              <td class="px-6 py-4 font-medium">{{ user.first_name || user.name }}</td>
              <td class="px-6 py-4 text-muted-foreground">{{ user.phone || 'Kiritilmagan' }}</td>
              <td class="px-6 py-4">
                <span v-if="user.role === 'ADMIN'" class="flex items-center gap-1 text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded-md w-max border border-red-500/20">
                  <ShieldAlert class="h-3 w-3" /> Admin
                </span>
                <span v-else-if="user.role === 'MANAGER'" class="flex items-center gap-1 text-xs px-2 py-1 bg-purple-500/10 text-purple-500 rounded-md w-max border border-purple-500/20">
                  <ShieldCheck class="h-3 w-3" /> Menejer
                </span>
                <span v-else-if="user.role === 'CASHIER'" class="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md w-max border border-blue-500/20">
                  <User class="h-3 w-3" /> Kassir
                </span>
                <span v-else class="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-md w-max border border-green-500/20">
                  <User class="h-3 w-3" /> Ofitsiant
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <template v-if="canManageUser(user)">
                  <button @click="handleOpenModal(user)" class="text-blue-500 hover:text-blue-600 p-2 cursor-pointer">
                    <Edit class="h-4 w-4" />
                  </button>
                  <button @click="handleDelete(user.id)" class="text-red-500 hover:text-red-600 p-2 ml-2 cursor-pointer">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </template>
                <span v-else class="text-xs text-muted-foreground italic px-2">Ruxsat yo'q</span>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colSpan="4" class="px-6 py-8 text-center text-muted-foreground">Xodimlar topilmadi.</td>
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
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-card w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
            <h3 class="text-lg font-semibold text-white">{{ editingUser ? "Xodimni tahrirlash" : "Yangi xodim qo'shish" }}</h3>
            <button @click="isModalOpen = false" class="text-muted-foreground hover:text-foreground cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>
          <form @submit.prevent="handleSave" class="p-5 space-y-5">
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">To'liq ism</label>
              <input required v-model="name" type="text" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Telefon raqami</label>
              <input required v-model="phone" type="text" placeholder="+998 90 123 45 67" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Xodim roli</label>
              <select v-model="role" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white">
                <option v-for="r in selectableRoles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Parol (Tizimga kirish)</label>
              <input 
                :required="!editingUser" 
                v-model="password" 
                type="password" 
                :placeholder="editingUser ? 'O\'zgartirmaslik uchun bo\'sh qoldiring' : 'Kamida 4 ta raqam yoki belgi'" 
                class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-white" 
              />
            </div>
            <div class="pt-2 flex justify-end gap-3">
              <button type="button" @click="isModalOpen = false" class="px-5 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium cursor-pointer">Bekor</button>
              <button type="submit" class="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium shadow-md cursor-pointer">Saqlash</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Plus, Edit, Trash2, X, Search, ShieldAlert, User, ShieldCheck } from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Users",
  components: {
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    ShieldAlert,
    User,
    ShieldCheck,
  },
  data() {
    return {
      state: appContext.state,
      users: [],
      isModalOpen: false,
      editingUser: null,
      loading: true,
      searchQuery: "",
      name: "",
      role: "WAITER",
      phone: "",
      password: "",
    };
  },
  computed: {
    currentRole() {
      return this.state.role;
    },
    isPrivileged() {
      const r = this.currentRole;
      return r === "SUPERADMIN" || r === "ADMIN" || r === "MANAGER";
    },
    selectableRoles() {
      const r = this.currentRole;
      if (r === "SUPERADMIN" || r === "ADMIN") {
        return [
          { value: "ADMIN", label: "Administrator" },
          { value: "MANAGER", label: "Menejer" },
          { value: "CASHIER", label: "Kassir" },
          { value: "WAITER", label: "Ofitsiant" },
          { value: "CHEF", label: "Oshpaz" },
        ];
      } else if (r === "MANAGER") {
        return [
          { value: "WAITER", label: "Ofitsiant" },
          { value: "CHEF", label: "Oshpaz" },
        ];
      } else {
        return [
          { value: "WAITER", label: "Ofitsiant" },
        ];
      }
    },
    filteredUsers() {
      const q = this.searchQuery.toLowerCase().trim();
      if (!q) return this.users;
      return this.users.filter(u => 
        (u.first_name || u.name || "").toLowerCase().includes(q) || 
        (u.phone && u.phone.includes(q))
      );
    },
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true;
        const { data } = await api.get("/users");
        this.users = data;
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Xodimlarni yuklashda xatolik yuz berdi", "error");
      } finally {
        this.loading = false;
      }
    },
    canManageUser(userToManage) {
      const r = this.currentRole;
      if (r === "SUPERADMIN" || r === "ADMIN") return true;
      if (r === "MANAGER" && (userToManage.role === "WAITER" || userToManage.role === "CHEF")) return true;
      return false;
    },
    handleOpenModal(user = null) {
      if (user) {
        this.editingUser = user;
        this.name = user.first_name || user.name;
        this.role = user.role;
        this.phone = user.phone || "";
        this.password = "";
      } else {
        this.editingUser = null;
        this.name = "";
        this.role = this.selectableRoles[0]?.value || "WAITER";
        this.phone = "";
        this.password = "";
      }
      this.isModalOpen = true;
    },
    async handleSave() {
      const cleanPhone = this.phone.replace(/\s+/g, "");
      if (!/^\+998\d{9}$/.test(cleanPhone)) {
        appContext.showAlert("Xatolik", "Telefon raqami noto'g'ri formatda. Misol: +998 90 123 45 67", "error");
        return;
      }

      try {
        const payload = { branch_id: 1, first_name: this.name, role: this.role, phone: cleanPhone };
        if (this.password) {
          payload.password = this.password;
        }
        
        if (this.editingUser) {
          await api.put(`/users/${this.editingUser.id}`, payload);
          appContext.showAlert("Muvaffaqiyatli", "Xodim ma'lumotlari yangilandi");
        } else {
          if (!this.password) {
            appContext.showAlert("Xatolik", "Yangi xodim uchun parol kiritish majburiy", "error");
            return;
          }
          await api.post("/users", payload); 
          appContext.showAlert("Muvaffaqiyatli", "Yangi xodim qo'shildi");
        }
        this.isModalOpen = false;
        this.fetchUsers();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Saqlashda xatolik yuz berdi", "error");
      }
    },
    handleDelete(id) {
      appContext.showConfirm("Xodimni o'chirish", "Haqiqatan ham o'chirmoqchimisiz?", async () => {
        try {
          await api.delete(`/users/${id}`);
          this.fetchUsers();
          appContext.showAlert("Muvaffaqiyatli", "Xodim o'chirildi");
        } catch (err) {
          console.error(err);
          appContext.showAlert("Xatolik", "O'chirishda xatolik yuz berdi", "error");
        }
      });
    },
  },
};
</script>
