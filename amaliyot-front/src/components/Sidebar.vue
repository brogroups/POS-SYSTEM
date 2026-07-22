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
        <button
          v-for="item in navItems"
          :key="item.name"
          @click="handleNavigate(item.path)"
          :title="state.isSidebarCollapsed ? item.name : ''"
          :class="[
            'w-full flex items-center rounded-xl py-2.5 transition-all duration-200 cursor-pointer text-left',
            state.isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3 text-sm font-medium',
            $route.path === item.path
              ? 'bg-[#212638] text-primary shadow-sm border border-primary/30'
              : 'text-muted-foreground hover:bg-[#212638] hover:text-white'
          ]"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span v-if="!state.isSidebarCollapsed" class="truncate">{{ item.name }}</span>
        </button>
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

  <!-- Role Change Password Modal — Centered Fullscreen Overlay -->
  <teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-if="selectedRole"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
      >
        <div 
          class="bg-[#181b25] border border-[#2a2e3d] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden glass animate-in zoom-in-95 duration-200"
        >
          <div class="p-5 border-b border-[#2a2e3d] flex justify-between items-center bg-[#1e2230]/70">
            <div class="flex items-center gap-2.5">
              <div class="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                <Lock class="h-4 w-4" />
              </div>
              <div>
                <h3 class="font-bold text-white text-base leading-tight">Rolni Tasdiqlash</h3>
                <p class="text-[10px] text-muted-foreground">Tizim holatini almashtirish</p>
              </div>
            </div>
            <button @click="cancelRoleChange" class="text-[#94a3b8] hover:text-white p-1.5 bg-[#2a2e3d] rounded-xl cursor-pointer transition-colors">
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="p-6">
            <div class="text-center mb-5">
              <p class="text-xs text-muted-foreground mb-1">Quyidagi rolga o'tish uchun 4 xonali PIN kodni kiriting:</p>
              <span class="inline-block px-3.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-black tracking-wide">
                {{ formatRoleName(selectedRole) }}
              </span>
            </div>

            <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex items-center justify-center gap-2 mb-4 animate-shake">
              <ShieldAlert class="h-4 w-4 text-red-500 shrink-0" />
              <p class="text-xs text-red-400 font-medium text-center">{{ error }}</p>
            </div>

            <!-- 4-Digit PIN Indicators -->
            <div class="flex justify-center items-center gap-3.5 mb-5">
              <div
                v-for="i in 4"
                :key="i"
                :class="[
                  'w-12 h-13 rounded-2xl border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 shadow-md',
                  password.length >= i
                    ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-105'
                    : 'border-[#2a2e3d] bg-[#1e2230] text-[#3b4054]'
                ]"
              >
                <span v-if="password.length >= i" class="text-2xl font-black">●</span>
                <span v-else class="text-xs text-[#3b4054]">○</span>
              </div>
            </div>

            <!-- Touch Keypad Buttons -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              <button
                v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
                :key="num"
                @click="handleKeyPress(num.toString())"
                class="h-12 bg-[#212638] hover:bg-[#2a2e3d] text-white text-lg font-bold rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
              >
                {{ num }}
              </button>
              <button
                @click="password = ''; error = ''"
                class="h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all border border-red-500/20 active:scale-95 uppercase shadow-sm cursor-pointer"
              >
                C
              </button>
              <button
                @click="handleKeyPress('0')"
                class="h-12 bg-[#212638] hover:bg-[#2a2e3d] text-white text-lg font-bold rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
              >
                0
              </button>
              <button
                @click="password = password.slice(0, -1); error = ''"
                class="h-12 bg-[#212638] hover:bg-[#2a2e3d] text-white flex items-center justify-center rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
              >
                <Delete class="h-5 w-5" />
              </button>
            </div>

            <div class="space-y-2">
              <button 
                @click="handlePasswordSubmit" 
                class="w-full py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-[0.98] cursor-pointer"
              >
                O'tish
              </button>

              <button 
                @click="goToLoginPage" 
                class="w-full py-2.5 bg-[#1e2230] hover:bg-[#2a2e3d] text-[#94a3b8] hover:text-white rounded-xl text-xs font-medium border border-[#2a2e3d] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn class="h-3.5 w-3.5" /> Login sahifasiga o'tish
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
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
  PanelLeftOpen,
  Delete,
  ShieldAlert,
  LogIn
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
    PanelLeftOpen,
    Delete,
    ShieldAlert,
    LogIn
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
        { name: "Ombor", icon: "Store", path: "/inventory", roles: ["SUPERADMIN", "MANAGER", "CASHIER"] },
        { name: "Kunlik Rasxod", icon: "Receipt", path: "/expenses", roles: ["SUPERADMIN", "MANAGER"] },
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
      this.password = "";
      this.error = "";
      this.showRoles = false;
    },
    handleKeyPress(num) {
      if (this.password.length < 4) {
        this.password += num;
        this.error = "";
        if (this.password.length === 4) {
          setTimeout(() => {
            this.handlePasswordSubmit();
          }, 120);
        }
      }
    },
    handleModalKeyDown(e) {
      if (!this.selectedRole) return;
      if (e.key >= "0" && e.key <= "9") {
        this.handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        this.password = this.password.slice(0, -1);
        this.error = "";
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
        this.cancelRoleChange();
      } else if (e.key === "Enter") {
        this.handlePasswordSubmit();
      }
    },
    goToLoginPage() {
      this.selectedRole = null;
      this.password = "";
      this.error = "";
      appContext.logout();
      this.$router.push("/login");
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
        this.error = "Noto'g'ri PIN kod!";
        this.password = "";
      }
    },
    cancelRoleChange() {
      this.selectedRole = null;
      this.password = "";
      this.error = "";
    },
    handleLogout() {
      appContext.logout();
      this.$router.push("/login");
    },
    handleNavigate(path) {
      if (this.$route.path !== path) {
        this.$router.push(path).catch(() => {});
      }
      this.closeSidebar();
    },
    closeSidebar() {
      appContext.closeSidebar();
    },
    toggleCollapse() {
      appContext.toggleSidebarCollapsed();
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleModalKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleModalKeyDown);
  },
};
</script>
