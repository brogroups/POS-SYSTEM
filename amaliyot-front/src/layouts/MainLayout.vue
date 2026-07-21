<template>
  <div class="flex flex-col md:flex-row h-screen overflow-hidden bg-[#0f121b] text-white">
    <!-- Backdrop overlay for mobile drawer -->
    <transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="state.isSidebarOpen" 
        @click="closeSidebar"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
      ></div>
    </transition>

    <!-- Mobile Top Header Bar -->
    <header class="flex items-center justify-between px-6 py-4 bg-[#181b25] border-b border-[#2a2e3d] md:hidden shrink-0 z-30">
      <div class="flex items-center gap-3">
        <button 
          @click="toggleSidebar" 
          class="p-2 -ml-2 text-[#94a3b8] hover:text-white bg-[#212638] rounded-xl border border-[#2a2e3d] cursor-pointer"
        >
          <Menu class="h-5 w-5" />
        </button>
        <span class="text-sm font-black tracking-wider text-white">RESTORAN POS</span>
      </div>
      <!-- Dummy spacer or mini status -->
      <div class="w-8"></div>
    </header>

    <!-- Sidebar Wrapper -->
    <div 
      :class="[
        'fixed md:static inset-y-0 left-0 z-50 transition-transform duration-300 transform md:transform-none md:flex',
        state.isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <Sidebar />
    </div>

    <!-- Main Content Panel -->
    <div class="flex flex-col flex-1 overflow-hidden relative">
      <main class="flex-1 overflow-y-auto p-4 md:p-6 relative z-10">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import { appContext } from "../store/appContext";
import { Menu } from "lucide-vue-next";

export default {
  name: "MainLayout",
  components: {
    Sidebar,
    Menu,
  },
  data() {
    return {
      state: appContext.state,
    };
  },
  watch: {
    // Auto-close sidebar on mobile when navigating pages
    $route() {
      appContext.closeSidebar();
    },
  },
  methods: {
    toggleSidebar() {
      appContext.toggleSidebar();
    },
    closeSidebar() {
      appContext.closeSidebar();
    },
  },
};
</script>
