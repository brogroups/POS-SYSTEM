<template>
  <div 
    :class="[
      'bg-[#181b25] flex flex-col h-full border-r border-[#2a2e3d] shrink-0 transition-all duration-300 relative',
      state.isSidebarCollapsed ? 'w-16' : 'w-52 md:w-56 lg:w-60 xl:w-64'
    ]"
  >
    <!-- Header bar -->
    <div 
      :class="[
        'h-16 flex items-center justify-between shrink-0 border-b border-[#2a2e3d]/50 transition-all',
        state.isSidebarCollapsed ? 'px-3 justify-center' : 'px-4 md:px-6'
      ]"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="h-9 w-9 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
          <Utensils class="h-5 w-5" />
        </div>
        <div v-if="!state.isSidebarCollapsed" class="overflow-hidden">
          <h1 class="text-base font-bold text-white leading-tight truncate">Restoran</h1>
          <p class="text-[10px] text-muted-foreground truncate">POS Tizimi</p>
        </div>
      </div>
      
      <!-- Right actions: Collapse button on desktop, close button on mobile -->
      <div class="flex items-center gap-1">
        <button 
          @click="toggleCollapse"
          class="hidden md:flex p-1.5 bg-[#212638] text-[#94a3b8] hover:text-white rounded-lg border border-[#2a2e3d] cursor-pointer transition-colors"
          :title="state.isSidebarCollapsed ? 'Menyuni kengaytirish' : 'Menyuni ixchamlash'"
        >
          <PanelLeftOpen v-if="state.isSidebarCollapsed" class="h-4 w-4" />
          <PanelLeftClose v-else class="h-4 w-4" />
        </button>
        <button 
          @click="closeSidebar" 
          class="p-1.5 bg-[#212638] text-[#94a3b8] hover:text-white rounded-lg border border-[#2a2e3d] md:hidden cursor-pointer"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
    
    <!-- Nav Links -->
    <div class="flex-1 overflow-y-auto py-3">
      <nav :class="['space-y-1', state.isSidebarCollapsed ? 'px-2' : 'px-3']">
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
            :title="state.isSidebarCollapsed ? item.name : ''"
            :class="[
              'flex items-center rounded-xl py-2.5 transition-all duration-200 cursor-pointer',
              state.isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3 text-sm font-medium',
              isActive
                ? 'bg-[#212638] text-primary shadow-sm border border-primary/30'
                : 'text-muted-foreground hover:bg-[#212638] hover:text-white'
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span v-if="!state.isSidebarCollapsed" class="truncate">{{ item.name }}</span>
          </a>
        </router-link>
      </nav>
    </div>

    <!-- Bottom User Section -->
    <div :class="['shrink-0 border-t border-[#2a2e3d] transition-all', state.isSidebarCollapsed ? 'p-2' : 'p-3']">
      <div v-if="!state.isSidebarCollapsed" class="relative">
        <button 
          @click="toggleShowRoles"
          class="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#212638] hover:bg-[#2a2e3d] transition-colors text-left cursor-pointer border border-[#2a2e3d]"
        >
          <div class="flex items-center gap-2.5 overflow-hidden">
            <div class="h-7 w-7 rounded-full bg-white flex items-center justify-center text-[#181b25] font-bold text-xs shrink-0">
              {{ role ? role.charAt(0) : 'U' }}
            </div>
            <div class="overflow-hidden">
              <p class="text-xs font-bold text-white truncate">Foydalanuvchi</p>
              <p class="text-[10px] text-muted-foreground truncate">{{ getRoleLabel() }}</p>
            </div>
          </div>
          <ChevronDown class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
              <p class="text-[10px] text-muted-foreground px-2 py-1 uppercase font-bold tracking-wider">Rolni o'zgartirish</p>
              <button 
                v-for="r in rolesList"
                :key="r"
                @click="handleRoleSelect(r)"
                :class="[
                  'w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer',
                  role === r ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-[#2a2e3d] text-white'
                ]"
              >
                {{ formatRoleName(r) }}
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Collapsed user button -->
      <div v-else class="flex flex-col items-center gap-2">
        <button 
          @click="toggleShowRoles"
          class="h-9 w-9 rounded-xl bg-[#212638] border border-[#2a2e3d] flex items-center justify-center text-white font-bold text-xs hover:bg-[#2a2e3d] transition-colors cursor-pointer"
          :title="getRoleLabel() + ' (Rolni o\'zgartirish)'"
        >
          {{ role ? role.charAt(0) : 'U' }}
        </button>
      </div>
      
      <button 
        @click="handleLogout"
        :class="[
          'w-full mt-2 flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-transparent rounded-xl cursor-pointer',
          state.isSidebarCollapsed ? 'p-2' : 'p-2.5'
        ]"
        :title="state.isSidebarCollapsed ? 'Chiqish' : ''"
      >
        <LogOut class="h-4 w-4 shrink-0" />
        <span v-if="!state.isSidebarCollapsed">Chiqish</span>
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
  FileText,
  PanelLeftClose,
  PanelLeftOpen
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
    FileText,
    PanelLeftClose,
    PanelLeftOpen
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
    toggleCollapse() {
      appContext.toggleSidebarCollapsed();
    },
  },
};
</script>
