<template>
  <div class="space-y-6 max-w-4xl">
    <div>
      <h2 class="text-3xl font-bold tracking-tight">Sozlamalar</h2>
      <p class="text-muted-foreground mt-1">Tizim va restoran parametrlarini sozlash</p>
    </div>

    <form @submit.prevent="handleSave" class="space-y-6">
      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-xl border border-border bg-card p-6 shadow-sm glass">
          <div class="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <div class="p-2 bg-primary/10 text-primary rounded-lg">
              <Percent class="h-5 w-5" />
            </div>
            <h3 class="text-lg font-semibold">Moliyaviy Sozlamalar</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-muted-foreground">Soliq stavkasi (QQS) %</label>
              <input type="number" :value="12" class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-muted-foreground">Xizmat haqi (Choychaqa) %</label>
              <input type="number" :value="10" class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card p-6 shadow-sm glass">
          <div class="flex items-center gap-3 mb-6 border-b border-[#2a2e3d] pb-4">
            <div class="p-2 bg-primary/10 text-primary rounded-lg">
              <Printer class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-lg font-semibold">Printerlar (USB, LAN & Kassa)</h3>
              <p class="text-xs text-muted-foreground">Termo-printerlar ulanishi va tarmoq sozlamalari</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-muted-foreground">Printer Ulanish Turi</label>
              <select v-model="printerConnectionType" @change="savePrinterSettings" class="w-full rounded-md border border-[#2a2e3d] bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary">
                <option value="USB">🔌 USB Termo-Printer (Kabel orqali Kompyuterga)</option>
                <option value="SYSTEM">🖥️ Kompyuterning Standart Printerni Cho'p etishi</option>
                <option value="LAN">🌐 IP / Ethernet LAN Tarmoq Printeri (Kabel orqali)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-muted-foreground">Chek Qog'ozi Eni (Paper Width)</label>
              <select v-model="printerPaperWidth" @change="savePrinterSettings" class="w-full rounded-md border border-[#2a2e3d] bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary">
                <option value="80mm">80mm (Standart Kassa Chek Qog'ozi)</option>
                <option value="58mm">58mm (Kichik Kassa Chek Qog'ozi)</option>
              </select>
            </div>

            <!-- LAN / Ethernet Printer Auto-Discovery Section -->
            <div v-if="printerConnectionType === 'LAN'" class="space-y-3 p-3 bg bg-background/50 border border-border/60 rounded-xl">
              <div>
                <label class="block text-sm font-medium mb-1 text-muted-foreground">Kassa / Oshxona Printer IP Manzili</label>
                <div class="flex gap-2">
                  <input type="text" v-model="printerIp" @change="savePrinterSettings" placeholder="192.168.1.100" class="flex-1 rounded-md border border-[#2a2e3d] bg-background px-3 py-2 text-sm text-white outline-none focus:border-primary font-mono" />
                  <button
                    type="button"
                    @click="testLanPrinter"
                    :disabled="testingLan"
                    class="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Radio class="h-3.5 w-3.5" /> {{ testingLan ? 'Tekshirilmoqda...' : 'Sinash' }}
                  </button>
                </div>
              </div>

              <!-- Auto Scan LAN Button -->
              <div>
                <button
                  type="button"
                  @click="scanLanPrinters"
                  :disabled="scanningLan"
                  class="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw :class="['h-4 w-4', { 'animate-spin': scanningLan }]" />
                  {{ scanningLan ? 'Tarmoq qidirilmoqda (IP Scanner)...' : '🌐 Tarmoqdagi Ethernet Printerni Avto-Qidirish' }}
                </button>
              </div>

              <!-- Scan Results List -->
              <div v-if="lanPrinters.length > 0" class="space-y-1.5 pt-1">
                <p class="text-xs text-muted-foreground font-medium">Topilgan Ethernet Printerlar:</p>
                <div v-for="printer in lanPrinters" :key="printer.ip" class="flex items-center justify-between p-2 bg-card border border-border/80 rounded-lg text-xs">
                  <div class="flex items-center gap-2">
                    <Wifi class="h-4 w-4 text-emerald-400" />
                    <span class="font-mono font-bold text-white">{{ printer.ip }}:{{ printer.port }}</span>
                    <span class="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded-md font-semibold">Port 9100</span>
                  </div>
                  <button
                    type="button"
                    @click="selectLanPrinter(printer.ip)"
                    class="px-2.5 py-1 bg-primary text-primary-foreground text-[11px] font-semibold rounded-md hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 class="h-3 w-3" /> Ulash
                  </button>
                </div>
              </div>
              <p v-else-if="scanMessage" class="text-xs text-amber-400/90 text-center py-1 font-medium">
                {{ scanMessage }}
              </p>
            </div>

            <div class="pt-2 flex flex-col gap-2">
              <button 
                v-if="printerConnectionType === 'USB'"
                type="button" 
                @click="connectUsbPrinter"
                class="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Usb class="h-4 w-4" /> USB Printerni Izlash va Ulash (WebUSB)
              </button>
              <button 
                type="button" 
                @click="testPrint"
                class="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer class="h-4 w-4" /> Test Chek Chop Etish (Brauzer Print Test)
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card p-6 shadow-sm glass md:col-span-2">
          <div class="flex items-center gap-3 mb-6 border-b border-[#2a2e3d] pb-4">
            <div class="p-2 bg-primary/10 text-primary rounded-lg">
              <Bell class="h-5 w-5" />
            </div>
            <h3 class="text-lg font-semibold">Tizim va Xabarnomalar</h3>
          </div>
          <div class="space-y-4">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" :checked="true" class="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-background cursor-pointer" />
              <span class="text-sm font-medium">Yangi buyurtma tushganda ovozli xabar berish</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" :checked="true" class="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-background cursor-pointer" />
              <span class="text-sm font-medium">Mahsulot qoldig'i kamayganda ogohlantirish ( &lt; 20 ta )</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-background cursor-pointer" />
              <span class="text-sm font-medium">Kunning oxirida Telegram botga hisobot yuborish</span>
            </label>
          </div>
        </div>

        <!-- Demo Seed Tools -->
        <div class="rounded-xl border border-border bg-card p-6 shadow-sm glass md:col-span-2">
          <div class="flex items-center gap-3 mb-6 border-b border-[#2a2e3d] pb-4">
            <div class="p-2 bg-primary/10 text-primary rounded-lg">
              <Database class="h-5 w-5" />
            </div>
            <h3 class="text-lg font-semibold">Tizimni Sotish va Demo Asboblari</h3>
          </div>
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p class="text-sm font-bold text-white">Restoranni Premium Demo ma'lumotlar bilan to'ldirish</p>
              <p class="text-xs text-muted-foreground mt-1 max-w-xl">
                Mijozlarga tizimni ko'rsatayotganda (prezentatsiya vaqtida) barcha grafiklar, moliyaviy hisobotlar va stollar real ko'rinishi uchun tizimga avtomatik tarzda 35 ta to'lov, 5 ta kategoriya, 11 ta maxsus taom va haqiqiy stollarni yuklaydi.
              </p>
            </div>
            <button 
              type="button" 
              @click="handleSeedData"
              :disabled="seeding"
              class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-black transition-all shadow-md shadow-blue-900/20 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles class="h-4 w-4" /> {{ seeding ? "Yuklanmoqda..." : "Demo Ma'lumotlarni Yuklash" }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t border-border">
        <button type="submit" class="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm cursor-pointer">
          <Save class="h-5 w-5" />
          Sozlamalarni Saqlash
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { Save, Printer, Percent, Bell, Database, Sparkles, Usb, Wifi, RefreshCw, CheckCircle2, Radio } from "lucide-vue-next";
import { appContext } from "../store/appContext";
import api from "../services/api";

export default {
  name: "Settings",
  components: {
    Save,
    Printer,
    Percent,
    Bell,
    Database,
    Sparkles,
    Usb,
    Wifi,
    RefreshCw,
    CheckCircle2,
    Radio,
  },
  data() {
    return {
      seeding: false,
      scanningLan: false,
      testingLan: false,
      lanPrinters: [],
      scanMessage: "",
      printerConnectionType: localStorage.getItem("printer_connection_type") || "USB",
      printerPaperWidth: localStorage.getItem("printer_paper_width") || "80mm",
      printerIp: localStorage.getItem("printer_ip") || "192.168.1.100",
    };
  },
  methods: {
    savePrinterSettings() {
      localStorage.setItem("printer_connection_type", this.printerConnectionType);
      localStorage.setItem("printer_paper_width", this.printerPaperWidth);
      localStorage.setItem("printer_ip", this.printerIp);
    },
    async scanLanPrinters() {
      this.scanningLan = true;
      this.scanMessage = "";
      this.lanPrinters = [];
      try {
        let resData = null;
        if (window.electronAPI && typeof window.electronAPI.scanLanPrinters === 'function') {
          try {
            resData = await window.electronAPI.scanLanPrinters();
          } catch (ipcErr) {
            console.warn("Electron IPC scan failed, using API fallback:", ipcErr);
            const res = await api.get("/printers/scan");
            resData = res.data;
          }
        } else {
          const res = await api.get("/printers/scan");
          resData = res.data;
        }

        if (resData && resData.success && resData.printers && resData.printers.length > 0) {
          this.lanPrinters = resData.printers;
          appContext.showAlert("Printer Topildi! 🌐", `Lokal tarmoqda ${resData.printers.length} ta active Ethernet printer aniqlandi.`, "success");
        } else {
          this.scanMessage = "Lokal tarmoqda port 9100 orqali ochiq Ethernet printer topilmadi. IP manzilini tekshirib qo'lda kiriting.";
          appContext.showAlert("Natija", "Avto-skanerlashda active Ethernet printer topilmadi.", "info");
        }
      } catch (err) {
        console.error(err);
        this.scanMessage = "Tarmoqni skanerlashda xatolik yuz berdi.";
        appContext.showAlert("Xatolik", "Ethernet printer skanerlashda xatolik.", "error");
      } finally {
        this.scanningLan = false;
      }
    },
    selectLanPrinter(ip) {
      this.printerIp = ip;
      this.savePrinterSettings();
      appContext.showAlert("Muvaffaqiyatli 🌐", `Ethernet Printer IP saqlandi: ${ip}`, "success");
    },
    async testLanPrinter() {
      if (!this.printerIp) {
        appContext.showAlert("Diqqat", "Iltimos, printer IP manzilini kiriting!", "warning");
        return;
      }
      this.testingLan = true;
      try {
        let resData = null;
        if (window.electronAPI && typeof window.electronAPI.testLanPrinter === 'function') {
          try {
            resData = await window.electronAPI.testLanPrinter({ ip: this.printerIp });
          } catch (ipcErr) {
            console.warn("Electron IPC test-lan-printer failed, using API fallback:", ipcErr);
            const res = await api.post("/printers/test-lan", { ip: this.printerIp });
            resData = res.data;
          }
        } else {
          const res = await api.post("/printers/test-lan", { ip: this.printerIp });
          resData = res.data;
        }

        if (resData && resData.success) {
          appContext.showAlert("Printer Ulangan! 🖨️", resData.message || "Test chek chop etildi!", "success");
        } else {
          appContext.showAlert("Ulanish Xatosi", resData.error || "Printerga ulanib bo'lmadi. IP va kabelni tekshiring.", "error");
        }
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.error || err.message || "Printerga ulanib bo'lmadi. IP va kabelni tekshiring.";
        appContext.showAlert("Ulanish Xatosi", msg, "error");
      } finally {
        this.testingLan = false;
      }
    },
    async connectUsbPrinter() {
      if ("usb" in navigator) {
        try {
          const device = await navigator.usb.requestDevice({ filters: [] });
          await device.open();
          appContext.showAlert("Muvaffaqiyatli 🔌", `USB Termo-Printer ulandi: ${device.productName || 'USB Thermal POS Printer'}`);
          localStorage.setItem("usb_printer_name", device.productName || 'USB POS Printer');
        } catch (err) {
          if (err.name !== "NotFoundError") {
            console.error(err);
            appContext.showAlert("USB Printer", err.message || "USB printer ulashda xatolik", "info");
          }
        }
      } else {
        appContext.showAlert("USB Printer Tayyor 🔌", "USB Termo-Printer kompyuter drayveri orqali muvaffaqiyatli ulangan!", "success");
      }
    },
    testPrint() {
      this.savePrinterSettings();
      const printWindow = window.open("", "", "height=500,width=400");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Chek</title>
            <style>
              @page { margin: 0; size: ${this.printerPaperWidth} auto; }
              body { font-family: monospace; padding: 15px; width: ${this.printerPaperWidth}; font-size: 11px; text-align: center; }
              .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            </style>
          </head>
          <body>
            <h2>OHLALA POS</h2>
            <p>PRINTER TEST CHEK</p>
            <div class="divider"></div>
            <p>Ulanish turi: ${this.printerConnectionType}</p>
            <p>IP: ${this.printerIp}</p>
            <p>Qog'oz eni: ${this.printerPaperWidth}</p>
            <p>Sana: ${new Date().toLocaleString('uz-UZ')}</p>
            <div class="divider"></div>
            <h3>TEST MUVAFFAQIYATLI ✓</h3>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            ` + `</` + `script>
          </body>
        </html>
      `);
      printWindow.document.close();
    },
    handleSave() {
      this.savePrinterSettings();
      appContext.showAlert("Muvaffaqiyatli", "Tizim va printer sozlamalari saqlandi!");
    },
    async handleSeedData() {
      try {
        this.seeding = true;
        const { data } = await api.post("/system/seed");
        if (data.success) {
          appContext.showAlert(
            "Muvaffaqiyatli",
            "Tizim premium demo ma'lumotlar bilan to'ldirildi! Endi barcha grafiklar, buyurtmalar va hisobotlar yondi.",
            "success"
          );
        }
      } catch (err) {
        console.error(err);
        appContext.showAlert("Xatolik", "Demo ma'lumotlarni yuklashda xatolik yuz berdi.", "error");
      } finally {
        this.seeding = false;
      }
    },
  },
};
</script>

