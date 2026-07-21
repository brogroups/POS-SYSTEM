<template>
  <div class="min-h-screen bg-[#14161e] flex flex-col md:flex-row items-center justify-center p-4 relative overflow-hidden gap-8">
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]"></div>

    <div class="w-full max-w-sm bg-[#181b25] border border-[#2a2e3d] rounded-2xl shadow-2xl overflow-hidden relative z-10 glass">
      <div class="p-8 text-center border-b border-[#2a2e3d] bg-[#1e2230]/50">
        <div class="h-16 w-16 mx-auto bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <Utensils class="h-8 w-8" />
        </div>
        <h1 class="text-2xl font-bold text-white mb-1">Restoran POS</h1>
        <p class="text-sm text-muted-foreground">Tizimga kirish uchun parolni kiriting</p>
      </div>

      <div class="p-8">
        <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-center gap-2 mb-6">
          <ShieldAlert class="h-4 w-4 text-red-500 shrink-0" />
          <p class="text-xs text-red-400 font-medium text-center">{{ error }}</p>
        </div>

        <div class="mb-8">
          <div class="w-full bg-[#1e2230] border-2 border-[#2a2e3d] rounded-xl h-16 flex items-center justify-center text-2xl tracking-[0.5em] font-bold text-white shadow-inner">
             <template v-if="password">{{ '•'.repeat(password.length) }}</template>
             <span v-else class="text-[#3b4054] tracking-normal text-sm font-normal">Parolni kiriting</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 mb-6">
          <button
            v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="num"
            @click="handleKeyPress(num.toString())"
            class="h-14 bg-[#212638] hover:bg-[#2a2e3d] text-white text-xl font-bold rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            {{ num }}
          </button>
          <button
            @click="handleClear"
            class="h-14 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-all border border-red-500/20 active:scale-95 uppercase shadow-sm cursor-pointer"
          >
            Tozalash
          </button>
          <button
            @click="handleKeyPress('0')"
            class="h-14 bg-[#212638] hover:bg-[#2a2e3d] text-white text-xl font-bold rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            0
          </button>
          <button
            @click="handleDelete"
            class="h-14 bg-[#212638] hover:bg-[#2a2e3d] text-white flex items-center justify-center rounded-xl transition-all border border-[#2a2e3d] active:scale-95 shadow-sm cursor-pointer"
          >
            <Delete class="h-6 w-6" />
          </button>
        </div>

        <button
          @click="handleSubmit"
          class="w-full bg-primary hover:bg-blue-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-[0.98] cursor-pointer"
        >
          Tizimga kirish
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
    };
  },
  methods: {
    handleKeyPress(num) {
      if (this.password.length < 20) {
        this.password += num;
        this.error = "";
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
      this.error = "";
      
      if (!this.password) {
        this.error = "Parolni kiriting!";
        return;
      }

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
        this.error = "Parol noto'g'ri. Qayta urinib ko'ring.";
        this.password = "";
      }
    },
  },
};
</script>
