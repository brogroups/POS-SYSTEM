<template>
  <router-view />

  <!-- Offline / Syncing status badge -->
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-4 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-4 opacity-0"
  >
    <!-- Offline Warning -->
    <div
      v-if="!state.isOnline && !state.syncing"
      class="fixed top-4 right-4 z-[9999] flex items-center gap-3 bg-[#ef4444]/90 backdrop-blur-md border border-[#ef4444]/30 px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white select-none"
    >
      <div class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </div>
      <WifiOff class="h-5 w-5 text-white" />
      <div class="flex flex-col">
        <span class="text-xs font-bold leading-none text-white">Aloqa uzildi</span>
        <span class="text-[10px] text-white/80 mt-0.5">Lokal rejimda saqlanmoqda</span>
      </div>
    </div>

    <!-- Syncing Info -->
    <div
      v-else-if="state.syncing"
      class="fixed top-4 right-4 z-[9999] flex items-center gap-3 bg-[#10b981]/90 backdrop-blur-md border border-[#10b981]/30 px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white select-none"
    >
      <RefreshCw class="h-5 w-5 text-white animate-spin" />
      <div class="flex flex-col">
        <span class="text-xs font-bold leading-none text-white">Aloqa tiklandi</span>
        <span class="text-[10px] text-white/80 mt-0.5 text-center">Ma'lumotlar yuklanmoqda...</span>
      </div>
    </div>
  </transition>

  <!-- Global Alert Modal -->
  <div
    v-if="state.alertData.isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  >
    <div
      class="bg-card w-full max-w-sm rounded-xl shadow-xl border border-border p-6 animate-in fade-in zoom-in duration-200"
    >
      <h3
        :class="[
          'text-lg font-bold mb-2',
          state.alertData.type === 'error' ? 'text-destructive' : 'text-primary'
        ]"
      >
        {{ state.alertData.title }}
      </h3>
      <p class="text-muted-foreground mb-6">{{ state.alertData.message }}</p>
      <button
        @click="closeAlert"
        class="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer"
      >
        Tushunarli
      </button>
    </div>
  </div>

  <!-- Global Confirm Modal -->
  <div
    v-if="state.confirmData.isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  >
    <div
      class="bg-card w-full max-w-sm rounded-xl shadow-xl border border-border p-6 animate-in fade-in zoom-in duration-200"
    >
      <h3 class="text-lg font-bold mb-2 text-white">{{ state.confirmData.title }}</h3>
      <p class="text-muted-foreground mb-6">{{ state.confirmData.message }}</p>
      <div class="flex gap-3">
        <button
          @click="closeConfirm"
          class="flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          Bekor qilish
        </button>
        <button
          @click="handleConfirm"
          class="flex-1 bg-destructive text-destructive-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Tasdiqlash
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { appContext } from "./store/appContext";
import { WifiOff, RefreshCw } from "lucide-vue-next";

export default {
  name: "App",
  components: {
    WifiOff,
    RefreshCw,
  },
  data() {
    return {
      state: appContext.state,
    };
  },
  methods: {
    closeAlert() {
      appContext.closeAlert();
    },
    closeConfirm() {
      appContext.closeConfirm();
    },
    handleConfirm() {
      if (this.state.confirmData.onConfirm) {
        this.state.confirmData.onConfirm();
      }
      appContext.closeConfirm();
    },
  },
};
</script>
