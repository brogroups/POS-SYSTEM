<template>
  <div class="min-h-screen bg-[#14161e] flex flex-col md:flex-row items-center justify-center p-4 relative overflow-hidden gap-8 select-none">
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]"></div>

    <div class="w-full max-w-sm bg-[#181b25] border border-[#2a2e3d] rounded-2xl shadow-2xl overflow-hidden relative z-10 glass">
      <div class="p-6 text-center border-b border-[#2a2e3d] bg-[#1e2230]/50">
        <div class="h-14 w-14 mx-auto bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <Utensils class="h-7 w-7" />
        </div>
        <h1 class="text-xl font-bold text-white mb-0.5">Restoran POS</h1>
        <p class="text-xs text-muted-foreground">Tizimga kirish uchun 4 xonali PIN kodni kiriting</p>
      </div>

      <div class="p-6">
        <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex items-center justify-center gap-2 mb-4 animate-shake">
          <ShieldAlert class="h-4 w-4 text-red-500 shrink-0" />
          <p class="text-xs text-red-400 font-medium text-center">{{ error }}</p>
        </div>

        <!-- 4-Digit PIN Indicators -->
        <div class="flex justify-center items-center gap-3.5 mb-6">
          <div
            v-for="i in 4"
            :key="i"
            :class="[
              'w-13 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-200 shadow-md',
              password.length >= i
                ? 'border-blue-500 bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-105'
                : 'border-[#2a2e3d] bg-[#1e2230] text-[#3b4054]'
            ]"
          >
            <span v-if="password.length >= i" class="text-2xl font-black animate-in fade-in zoom-in duration-150">●</span>
            <span v-else class="text-xs text-[#3b4054] font-normal">○</span>
          </div>
        </div>

        <!-- Touch / On-screen Keypad -->
        <div class="grid grid-cols-3 gap-2.5 mb-5">
          <button
            v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="num"
            @click="handleKeyPress(num.toString())"
            class="h-13 bg-[#212638] hover:bg-[#2a2e3d] text-white text-xl font-bold rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            {{ num }}
          </button>
          <button
            @click="handleClear"
            class="h-13 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all border border-red-500/20 active:scale-95 uppercase shadow-sm cursor-pointer"
          >
            C
          </button>
          <button
            @click="handleKeyPress('0')"
            class="h-13 bg-[#212638] hover:bg-[#2a2e3d] text-white text-xl font-bold rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            0
          </button>
          <button
            @click="handleDelete"
            class="h-13 bg-[#212638] hover:bg-[#2a2e3d] text-white flex items-center justify-center rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            <Delete class="h-5 w-5" />
          </button>
        </div>

        <button
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="w-full bg-primary hover:bg-blue-600 text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98] cursor-pointer disabled:opacity-50"
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
          
          appContext.showAlert(
            "Xush kelibsiz!",
            "Tizimga muvaffaqiyatli kirdingiz. Ish kuningiz serdaromad bo'lsin!",
            "success"
          );
          
          if (result.role === "CHEF") {
            this.$router.push("/chef");
          } else if (result.role === "SUPERADMIN" || result.role === "MANAGER") {
            this.$router.push("/");
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
