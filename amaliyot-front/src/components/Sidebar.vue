<template>
  <div class="w-52 md:w-56 lg:w-60 xl:w-64 bg-[#181b25] flex flex-col h-full border-r border-[#2a2e3d] shrink-0 transition-all">
    <div class="h-20 flex items-center justify-between px-6 shrink-0 border-b border-[#2a2e3d]/50">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
          <Utensils class="h-6 w-6" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-white leading-tight">Restoran</h1>
          <p class="text-xs text-muted-foreground">Restoran Tizimi</p>
        </div>
      </div>
      <!-- Close button on mobile -->
      <button 
        @click="closeSidebar" 
        class="p-1.5 bg-[#212638] text-[#94a3b8] hover:text-white rounded-lg border border-[#2a2e3d] md:hidden cursor-pointer"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
    
    <div class="flex-1 overflow-y-auto py-4">
      <nav class="space-y-1 px-4">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          custom
          v-slot="{ isActive, href, navigate }"
        >
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[#212638] text-primary'
                : 'text-muted-foreground hover:bg-[#212638] hover:text-white'
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            {{ item.name }}
          </a>
        </router-link>
      </nav>
    </div>

    <div class="p-4 shrink-0 border-t border-[#2a2e3d]">
      <div class="relative">
        <button 
          @click="toggleShowRoles"
          class="w-full flex items-center justify-between p-3 rounded-xl bg-[#212638] hover:bg-[#2a2e3d] transition-colors text-left cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#181b25] shrink-0">
              <span class="font-bold text-sm">{{ role ? role.charAt(0) : 'U' }}</span>
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-bold text-white truncate">Foydalanuvchi</p>
              <p class="text-xs text-muted-foreground">{{ getRoleLabel() }}</p>
            </div>
          </div>
          <ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
        </button>

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform translate-y-2 opacity-0"
        >
          <div 
            v-if="showRoles"
            class="absolute bottom-full left-0 w-full mb-2 bg-[#212638] border border-[#2a2e3d] rounded-xl shadow-xl overflow-hidden z-40"
          >
            <div class="p-2 space-y-1">
              <p class="text-xs text-muted-foreground px-2 py-1 uppercase font-bold tracking-wider">Rolni o'zgartirish</p>
              <button 
                v-for="r in rolesList"
                :key="r"
                @click="handleRoleSelect(r)"
                :class="[
                  'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
                  role === r ? 'bg-primary/20 text-primary' : 'hover:bg-[#2a2e3d] text-white'
                ]"
              >
                {{ formatRoleName(r) }}
              </button>
            </div>
          </div>
        </transition>
      </div>
      
      <button 
        @click="handleLogout"
        class="w-full mt-2 flex items-center justify-center gap-2 p-3 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent rounded-xl cursor-pointer"
      >
        <LogOut class="h-4 w-4" />
        Chiqish
      </button>
    </div>
  </div>

  <!-- Role Change Password Modal -->
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div 
      v-if="selectedRole"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div 
        class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
      >
        <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]">
          <h3 class="font-bold text-white">Tasdiqlash</h3>
          <button @click="cancelRoleChange" class="text-muted-foreground hover:text-white p-1 bg-[#2a2e3d] rounded-lg cursor-pointer">
            <X class="h-4 w-4" />
          </button>
        </div>
        <form @submit.prevent="handlePasswordSubmit" class="p-6 space-y-5">
          <div class="text-center mb-2">
            <p class="text-sm text-muted-foreground mb-1">Quyidagi rolga o'tish uchun parolni kiriting:</p>
            <p class="font-bold text-lg text-primary">{{ selectedRole }}</p>
          </div>
          
          <p v-if="error" class="text-xs text-red-400 text-center font-medium bg-red-500/10 py-2 rounded-lg">{{ error }}</p>

          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-4 w-4 text-muted-foreground" />
            </div>
            <input 
              type="password" 
              ref="passwordInput"
              v-model="password"
              placeholder="Parolni kiriting" 
              class="w-full bg-[#1e2230] border border-[#2a2e3d] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <button type="submit" class="w-full py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity cursor-pointer">
            O'tish
          </button>
        </form>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  LayoutDashboard,
  Utensils,
  Store,
  Users,
  ShoppingCart,
  Receipt,
  Settings,
  MonitorSmartphone,
  LogOut,
  ChevronDown,
  Lock,
  X,
  ChefHat,
  Flame,
  ShoppingBag,
  FileText
} from "lucide-vue-next";
import { appContext, ROLE_PASSWORDS } from "../store/appContext";

export default {
  name: "Sidebar",
  components: {
    LayoutDashboard,
    Utensils,
    Store,
    Users,
    ShoppingCart,
    Receipt,
    Settings,
    MonitorSmartphone,
    LogOut,
    ChevronDown,
    Lock,
    X,
    ChefHat,
    Flame,
    ShoppingBag,
    FileText
  },
  data() {
    return {
      state: appContext.state,
      showRoles: false,
      selectedRole: null,
      password: "",
      error: "",
      rolesList: ["SUPERADMIN", "MANAGER", "CASHIER", "WAITER", "CHEF"],
      allNavItems: [
        { name: "Bosh sahifa", icon: "LayoutDashboard", path: "/", roles: ["SUPERADMIN", "MANAGER"] },
        { name: "Stollar", icon: "MonitorSmartphone", path: "/pos", roles: ["SUPERADMIN", "MANAGER", "CASHIER", "WAITER"] },
        { name: "Menyu", icon: "Utensils", path: "/products", roles: ["SUPERADMIN", "MANAGER"] },
        { name: "Ombor", icon: "Store", path: "/inventory", roles: ["SUPERADMIN", "MANAGER", "CASHIER", "WAITER"] },
        { name: "Kunlik Rasxod", icon: "Receipt", path: "/expenses", roles: ["SUPERADMIN", "MANAGER", "CASHIER", "WAITER"] },
        { name: "Buyurtmalar", icon: "ShoppingCart", path: "/orders", roles: ["SUPERADMIN", "MANAGER", "CASHIER"] },
        { name: "Hisobotlar", icon: "Receipt", path: "/payments", roles: ["SUPERADMIN", "MANAGER", "CASHIER"] },
        { name: "Xodimlar", icon: "Users", path: "/users", roles: ["SUPERADMIN"] },
        { name: "Sozlamalar", icon: "Settings", path: "/settings", roles: ["SUPERADMIN"] },
      ],
    };
  },
  computed: {
    role() {
      return this.state.role;
    },
    navItems() {
      return this.allNavItems.filter(item => item.roles.includes(this.role));
    },
  },
  methods: {
    formatRoleName(r) {
      const map = {
        SUPERADMIN: "Superadmin",
        MANAGER: "Menejer",
        CASHIER: "Kassir",
        WAITER: "Ofitsiant",
        CHEF: "Oshpaz"
      };
      return map[r] || r;
    },
    getRoleLabel() {
      switch (this.role) {
        case "SUPERADMIN":
          return "Superadmin";
        case "MANAGER":
          return "Menejer";
        case "CASHIER":
          return "Kassir";
        case "WAITER":
          return "Ofitsiant";
        case "CHEF":
          return "Oshpaz";
        default:
          return this.role;
      }
    },
    toggleShowRoles() {
      this.showRoles = !this.showRoles;
    },
    handleRoleSelect(r) {
      if (r === this.role) {
        this.showRoles = false;
        return;
      }
      this.selectedRole = r;
      this.showRoles = false;
      this.$nextTick(() => {
        if (this.$refs.passwordInput) {
          this.$refs.passwordInput.focus();
        }
      });
    },
    handlePasswordSubmit() {
      if (ROLE_PASSWORDS[this.selectedRole] === this.password) {
        appContext.state.role = this.selectedRole;
        
        // Update user state for simulated role
        appContext.state.currentUser = {
          id: 99999,
          first_name: this.selectedRole,
          role: this.selectedRole
        };
        appContext.saveState();

        const targetRole = this.selectedRole;
        this.selectedRole = null;
        this.password = "";
        this.error = "";

        if (targetRole === "CHEF") this.$router.push("/chef");
        else if (targetRole === "SUPERADMIN" || targetRole === "MANAGER") this.$router.push("/");
        else this.$router.push("/pos");
      } else {
        this.error = "Noto'g'ri parol!";
      }
    },
    cancelRoleChange() {
      this.selectedRole = null;
      this.password = "";
      this.error = "";
    },
    handleLogout() {
      appContext.showConfirm(
        "Tizimdan chiqish",
        "Haqiqatan ham tizimdan chiqishni xohlaysizmi?",
        () => {
          appContext.logout();
          this.$router.push("/login");
        }
      );
    },
    closeSidebar() {
      appContext.closeSidebar();
    },
  },
};
</script>
