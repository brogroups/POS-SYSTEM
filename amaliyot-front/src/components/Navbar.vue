<template>
  <header class="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
      <!-- Qidiruv maydoni -->
    </div>

    <div class="flex items-center gap-4">
      <button
        @click="toggleDark"
        class="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <Sun v-if="isDark" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
      </button>
      
      <button class="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative cursor-pointer">
        <Bell class="h-5 w-5" />
        <span class="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full"></span>
      </button>

      <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 shadow-lg">
        <User class="h-4 w-4" />
      </div>
    </div>
  </header>
</template>

<script>
import { Moon, Sun, Bell, User } from "lucide-vue-next";

export default {
  name: "Navbar",
  components: {
    Moon,
    Sun,
    Bell,
    User,
  },
  data() {
    return {
      isDark: document.documentElement.classList.contains("dark"),
    };
  },
  watch: {
    isDark(val) {
      if (val) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
  methods: {
    toggleDark() {
      this.isDark = !this.isDark;
    },
  },
};
</script>
