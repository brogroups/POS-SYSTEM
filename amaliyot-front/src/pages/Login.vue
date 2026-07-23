<template>
  <div class="min-h-screen bg-[#14161e] flex flex-col items-center justify-center p-3 md:p-4 relative overflow-hidden select-none">
    <div class="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-500/20 rounded-full blur-[140px]"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-500/20 rounded-full blur-[140px]"></div>

    <div class="w-full max-w-[360px] md:max-w-[400px] bg-[#181b25] border border-[#2a2e3d] rounded-2xl shadow-2xl overflow-hidden relative z-10 glass">
      <!-- Header -->
      <div class="p-4 md:p-5 text-center border-b border-[#2a2e3d] bg-[#1e2230]/50">
        <div class="h-12 w-12 md:h-14 md:w-14 mx-auto bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-2.5 shadow-[0_0_20px_rgba(59,130,246,0.35)]">
          <Utensils class="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <h1 class="text-xl md:text-2xl font-black text-white mb-0.5 tracking-tight">Restoran POS</h1>
        <p class="text-[11px] md:text-xs text-muted-foreground font-medium">4 xonali PIN kodni kiriting</p>
      </div>

      <!-- Content -->
      <div class="p-4 md:p-6">
        <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex items-center justify-center gap-2 mb-4 animate-shake">
          <ShieldAlert class="h-4 w-4 text-red-500 shrink-0" />
          <p class="text-xs text-red-400 font-bold text-center">{{ error }}</p>
        </div>

        <!-- 4-Digit PIN Indicators -->
        <div class="flex justify-center items-center gap-3 md:gap-4 mb-6">
          <div
            v-for="i in 4"
            :key="i"
            :class="[
              'w-12 h-14 md:w-14 md:h-16 rounded-xl border-2 flex items-center justify-center font-bold transition-all duration-200 shadow-md',
              password.length >= i
                ? 'border-blue-500 bg-blue-600/25 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.45)] scale-105'
                : 'border-[#2a2e3d] bg-[#1e2230] text-[#3b4054]'
            ]"
          >
            <span v-if="password.length >= i" class="text-2xl md:text-3xl font-black animate-in fade-in zoom-in duration-150">●</span>
            <span v-else class="text-xs text-[#3b4054] font-normal">○</span>
          </div>
        </div>

        <!-- Touch / On-screen Keypad -->
        <div class="grid grid-cols-3 gap-2.5 md:gap-3 mb-5">
          <button
            v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="num"
            @click="handleKeyPress(num.toString())"
            class="h-12 md:h-14 bg-[#212638] hover:bg-[#2a2e3d] text-white text-xl md:text-2xl font-black rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            {{ num }}
          </button>
          <button
            @click="handleClear"
            class="h-12 md:h-14 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm md:text-base font-black rounded-xl transition-all border border-red-500/20 active:scale-95 uppercase shadow-sm cursor-pointer"
          >
            C
          </button>
          <button
            @click="handleKeyPress('0')"
            class="h-12 md:h-14 bg-[#212638] hover:bg-[#2a2e3d] text-white text-xl md:text-2xl font-black rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            0
          </button>
          <button
            @click="handleDelete"
            class="h-12 md:h-14 bg-[#212638] hover:bg-[#2a2e3d] text-white flex items-center justify-center rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            <Delete class="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <button
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="w-full bg-primary hover:bg-blue-600 text-white rounded-xl py-3 md:py-3.5 font-extrabold text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <span v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          <span v-else>Tizimga kirish</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Utensils, ShieldAlert, Delete } from "lucide-vue-next";
import { appContext } from "../store/appContext";

export default {
  name: "Login",
  components: {
    Utensils,
    ShieldAlert,
    Delete,
  },
  data() {
    return {
      password: "",
      error: "",
      isSubmitting: false,
    };
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    handleKeyDown(e) {
      if (e.key >= "0" && e.key <= "9") {
        this.handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        this.handleDelete();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
        this.handleClear();
      } else if (e.key === "Enter") {
        this.handleSubmit();
      }
    },
    handleKeyPress(num) {
      if (this.password.length < 4 && !this.isSubmitting) {
        this.password += num;
        this.error = "";
        if (this.password.length === 4) {
          setTimeout(() => {
            this.handleSubmit();
          }, 120);
        }
      }
    },
    handleClear() {
      this.password = "";
      this.error = "";
    },
    handleDelete() {
      this.password = this.password.slice(0, -1);
      this.error = "";
    },
    async handleSubmit() {
      if (this.isSubmitting) return;
      this.error = "";
      
      if (!this.password || this.password.length < 4) {
        this.error = "Iltimos, 4 xonali PIN kodni to'liq kiriting!";
        return;
      }

      this.isSubmitting = true;
      try {
        const result = await appContext.login(this.password);
        if (result.success) {
          if (!localStorage.getItem("shiftStartTime")) {
            localStorage.setItem("shiftStartTime", new Date().toISOString());
          }
          
          appContext.addNotification("Xush Kelibsiz!", "Tizimga muvaffaqiyatli kirdingiz!", "SUCCESS");
          
          if (result.role === "CHEF") {
            this.$router.push("/chef");
          } else {
            this.$router.push("/pos");
          }
        } else {
          this.error = "PIN kod noto'g'ri. Qayta urinib ko'ring.";
          this.password = "";
        }
      } catch (err) {
        console.error(err);
        this.error = "Tizimga kirishda xatolik yuz berdi.";
        this.password = "";
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>
