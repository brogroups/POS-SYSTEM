<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Filiallar</h2>
        <p class="text-muted-foreground mt-1">Barcha restoran tarmoqlari va filiallarni boshqarish</p>
      </div>
      <button
        @click="handleOpenModal()"
        class="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
      >
        <Plus class="h-5 w-5" />
        Filial Qo'shish
      </button>
    </div>

    <div v-if="loading" class="flex justify-center p-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="branch in branches" 
        :key="branch.id"
        class="rounded-xl border border-border bg-card p-6 shadow-sm glass relative group"
      >
        <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="handleOpenModal(branch)" class="p-2 bg-secondary/50 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer">
            <Edit class="h-4 w-4" />
          </button>
          <button @click="handleDelete(branch.id)" class="p-2 bg-secondary/50 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer">
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
        
        <div class="flex items-center gap-4 mb-4">
          <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Store class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-lg font-semibold">{{ branch.name }}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">FAOL</span>
          </div>
        </div>

        <div class="space-y-3 mt-4 pt-4 border-t border-border/50 text-sm">
          <div class="flex items-start gap-3 text-muted-foreground">
            <MapPin class="h-4 w-4 mt-0.5 shrink-0" />
            <span>{{ branch.address || 'Kiritilmagan' }}</span>
          </div>
          <div class="flex items-center gap-3 text-muted-foreground">
            <Phone class="h-4 w-4 shrink-0" />
            <span>{{ branch.phone || 'Kiritilmagan' }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="branches.length === 0" class="col-span-full p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
        Filiallar topilmadi
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
            <h3 class="text-lg font-semibold">{{ editingBranch ? "Filialni tahrirlash" : "Yangi filial qo'shish" }}</h3>
            <button @click="isModalOpen = false" class="text-muted-foreground hover:text-foreground cursor-pointer">
              <X class="h-5 w-5" />
            </button>
          </div>
          <form @submit.prevent="handleSave" class="p-5 space-y-5">
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Filial nomi</label>
              <input required v-model="name" type="text" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Manzili</label>
              <input v-model="address" type="text" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5 text-muted-foreground">Telefon raqami</label>
              <input v-model="phone" type="text" class="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" />
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
import { Plus, Edit, Trash2, X, Store, MapPin, Phone } from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Branches",
  components: {
    Plus,
    Edit,
    Trash2,
    X,
    Store,
    MapPin,
    Phone,
  },
  data() {
    return {
      branches: [],
      isModalOpen: false,
      editingBranch: null,
      loading: true,
      name: "",
      address: "",
      phone: "",
    };
  },
  mounted() {
    this.fetchBranches();
  },
  methods: {
    async fetchBranches() {
      try {
        this.loading = true;
        const { data } = await api.get("/branches");
        this.branches = data;
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Filialarni yuklashda xatolik yuz berdi", "error");
      } finally {
        this.loading = false;
      }
    },
    handleOpenModal(branch = null) {
      if (branch) {
        this.editingBranch = branch;
        this.name = branch.name;
        this.address = branch.address || "";
        this.phone = branch.phone || "";
      } else {
        this.editingBranch = null;
        this.name = "";
        this.address = "";
        this.phone = "";
      }
      this.isModalOpen = true;
    },
    async handleSave() {
      try {
        const payload = { name: this.name, address: this.address, phone: this.phone };
        if (this.editingBranch) {
          await api.put(`/branches/${this.editingBranch.id}`, payload);
          appContext.showAlert("Muvaffaqiyatli", "Filial ma'lumotlari yangilandi");
        } else {
          await api.post("/branches", payload);
          appContext.showAlert("Muvaffaqiyatli", "Yangi filial qo'shildi");
        }
        this.isModalOpen = false;
        this.fetchBranches();
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Saqlashda xatolik yuz berdi", "error");
      }
    },
    handleDelete(id) {
      appContext.showConfirm("Filialni o'chirish", "Haqiqatan ham o'chirmoqchimisiz?", async () => {
        try {
          await api.delete(`/branches/${id}`);
          this.fetchBranches();
          appContext.showAlert("Muvaffaqiyatli", "Filial o'chirildi");
        } catch (err) {
          console.error(err);
          appContext.showAlert("Xatolik", "O'chirishda xatolik yuz berdi", "error");
        }
      });
    },
  },
};
</script>
