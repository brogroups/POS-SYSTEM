import { reactive } from "vue";
import api from "../services/api";
import { io } from "socket.io-client";

export const ROLE_PASSWORDS = {
  SUPERADMIN: "9988",
  MANAGER: "2222",
  CASHIER: "3333",
  WAITER: "4444",
};

export const state = reactive({
  isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
  role: localStorage.getItem("userRole") || null,
  currentUser: (() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  alertData: {
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  },
  confirmData: {
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  },
  isOnline: true,
  syncing: false,
  isSidebarOpen: false,
  isSidebarCollapsed: (() => {
    const saved = localStorage.getItem("isSidebarCollapsed");
    if (saved !== null) return saved === "true";
    if (typeof window !== "undefined" && window.innerWidth <= 1100) return true;
    return false;
  })(),
  uiScale: (() => {
    const saved = localStorage.getItem("uiScale");
    if (saved) return parseFloat(saved);
    if (typeof window !== "undefined" && (window.innerWidth <= 1100 || window.innerHeight <= 768)) {
      return 0.85;
    }
    return 1.0;
  })(),
  notifications: [],
  offlineQueue: (() => {
    try {
      const q = localStorage.getItem("offline_requests_queue");
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  })(),
});

export const appContext = {
  state,
  
  addNotification(title, message, type = "INFO") {
    if (!state.notifications) state.notifications = [];
    const notif = {
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      title,
      message,
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      type
    };
    state.notifications.unshift(notif);
    if (state.notifications.length > 30) {
      state.notifications.pop();
    }
    this.playNotificationSound(type === "WARNING" ? "warning" : "success");
  },
  
  async login(password) {
    try {
      const { data: users } = await api.get("/users");
      const foundUser = users.find((u) => u.password === password);
      if (foundUser) {
        state.role = foundUser.role;
        state.currentUser = foundUser;
        state.isAuthenticated = true;
        this.saveState();
        return { success: true, role: foundUser.role };
      }
    } catch (err) {
      console.error("User login fetch error:", err);
    }

    const foundRole = Object.keys(ROLE_PASSWORDS).find(
      (r) => ROLE_PASSWORDS[r] === password
    );
    if (foundRole) {
      state.role = foundRole;
      state.currentUser = { id: 99999, first_name: foundRole, role: foundRole };
      state.isAuthenticated = true;
      this.saveState();
      return { success: true, role: foundRole };
    }
    return { success: false };
  },

  logout() {
    state.isAuthenticated = false;
    state.role = null;
    state.currentUser = null;
    this.clearState();
  },

  showAlert(title, message, type = "info") {
    // Suppress general database loading errors when we are already offline
    if (!state.isOnline && (message.includes("xatolik") || message.includes("yuklashda"))) {
      return;
    }
    // Route to toast notification so blocking "Tushunarli" modal popups never appear
    const notifType = type === "error" || type === "destructive" ? "DANGER" : type === "warning" ? "WARNING" : "SUCCESS";
    this.addNotification(title, message, notifType);
    this.playNotificationSound(type === "error" ? "error" : "success");
  },

  playNotificationSound(style = "success") {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playNote = (freq, time, duration, type = "triangle", vol = 0.4) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(vol, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };

      const now = ctx.currentTime;
      if (style === "error") {
        playNote(150, now, 0.25, "sawtooth", 0.3);
        playNote(120, now + 0.12, 0.3, "sawtooth", 0.3);
      } else if (style === "warning") {
        playNote(587.33, now, 0.15, "sine", 0.4);
        playNote(587.33, now + 0.12, 0.3, "sine", 0.4);
      } else {
        // Ascending arpeggio chime (Success)
        playNote(523.25, now, 0.5, "triangle", 0.3);
        playNote(659.25, now + 0.07, 0.5, "triangle", 0.3);
        playNote(783.99, now + 0.14, 0.5, "triangle", 0.3);
        playNote(1046.50, now + 0.21, 0.7, "triangle", 0.3);
      }
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  },

  closeAlert() {
    state.alertData.isOpen = false;
  },

  showConfirm(title, message, onConfirm) {
    state.confirmData = { isOpen: true, title, message, onConfirm };
  },

  closeConfirm() {
    state.confirmData.isOpen = false;
  },

  saveState() {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userRole", state.role);
    if (state.currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
      localStorage.setItem("token", state.currentUser.id);
    }
  },

  clearState() {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  },

  async ping() {
    try {
      await api.get("/health", {
        headers: { "X-Bypass-Cache": "true" },
        timeout: 4000,
      });
      if (!state.isOnline) {
        state.isOnline = true;
        this.syncOfflineQueue();
      }
    } catch (err) {
      if (!err.response) {
        state.isOnline = false;
      }
    }
  },

  async syncOfflineQueue() {
    if (state.syncing || state.offlineQueue.length === 0) return;
    state.syncing = true;
    
    try {
      const originalLength = state.offlineQueue.length;
      while (state.offlineQueue.length > 0) {
        const item = state.offlineQueue[0];
        try {
          await api({
            url: item.url,
            method: item.method,
            data: item.data,
            headers: {
              ...item.headers,
              "X-Bypass-Queue": "true",
              "X-Bypass-Cache": "true"
            }
          });
          state.offlineQueue.shift();
          localStorage.setItem("offline_requests_queue", JSON.stringify(state.offlineQueue));
        } catch (err) {
          if (!err.response) {
            state.isOnline = false;
            break;
          }
          console.error("Failed to sync offline item due to server rejection:", err);
          state.offlineQueue.shift();
          localStorage.setItem("offline_requests_queue", JSON.stringify(state.offlineQueue));
        }
      }

      if (state.offlineQueue.length === 0 && originalLength > 0) {
        this.showAlert("Aloqa tiklandi", "Barcha mahalliy yozilgan buyurtmalar bazaga yuklandi!", "success");
        window.dispatchEvent(new CustomEvent("sync-complete"));
      }
    } finally {
      state.syncing = false;
    }
  },

  startPingCheck() {
    setInterval(() => {
      this.ping();
    }, 8000);
    this.ping();
  },

  toggleSidebar() {
    state.isSidebarOpen = !state.isSidebarOpen;
  },

  closeSidebar() {
    state.isSidebarOpen = false;
  },

  toggleSidebarCollapsed() {
    state.isSidebarCollapsed = !state.isSidebarCollapsed;
    localStorage.setItem("isSidebarCollapsed", state.isSidebarCollapsed ? "true" : "false");
  },

  setUiScale(scale) {
    const numScale = parseFloat(scale) || 1.0;
    state.uiScale = numScale;
    localStorage.setItem("uiScale", numScale.toString());
  },

  hasPermission(permission) {
    const role = state.role || (state.currentUser && state.currentUser.role);
    if (!role) return false;
    if (role === 'SUPERADMIN') return true;

    const rolePermissions = {
      WAITER: [
        'open_table', 'freeze_table', 'unfreeze_table', 'create_session', 
        'edit_products', 'move_products', 'swap_products', 'print_receipt', 
        'create_expense', 'view_inventory', 'view_hookah_report'
      ],
      CHEF: ['view_inventory'],
      CASHIER: [
        'open_table', 'freeze_table', 'unfreeze_table', 'close_table', 
        'create_session', 'close_session', 'edit_products', 'move_products', 
        'swap_products', 'print_receipt', 'create_expense', 'view_inventory', 
        'view_hookah_report', 'receive_payment', 'apply_discount', 
        'open_shift', 'close_shift', 'manual_cash_deposit', 'manual_cash_withdrawal'
      ],
      MANAGER: [
        'open_table', 'freeze_table', 'unfreeze_table', 'close_table', 
        'create_session', 'close_session', 'edit_products', 'move_products', 
        'swap_products', 'print_receipt', 'create_expense', 'approve_expense', 
        'reject_expense', 'view_inventory', 'adjust_inventory', 'create_purchase', 
        'view_hookah_report', 'manage_hookah', 'receive_payment', 'apply_discount', 
        'process_refund', 'open_shift', 'close_shift', 'modify_reports', 
        'restore_deleted', 'view_audit_log', 'manage_users', 'manual_cash_deposit', 
        'manual_cash_withdrawal'
      ],
      ADMIN: [
        'open_table', 'freeze_table', 'unfreeze_table', 'close_table', 
        'create_session', 'close_session', 'edit_products', 'move_products', 
        'swap_products', 'print_receipt', 'create_expense', 'approve_expense', 
        'reject_expense', 'view_inventory', 'adjust_inventory', 'create_purchase', 
        'view_hookah_report', 'manage_hookah', 'receive_payment', 'apply_discount', 
        'process_refund', 'open_shift', 'close_shift', 'modify_reports', 
        'restore_deleted', 'view_audit_log', 'delete_history', 'manage_users', 
        'manual_cash_deposit', 'manual_cash_withdrawal'
      ]
    };

    const allowed = rolePermissions[role];
    return allowed ? allowed.includes(permission) : false;
  }
};

appContext.startPingCheck();

// Real-Time WebSockets setup
let socket = null;
if (typeof window !== "undefined") {
  const socketUrl = (import.meta.env.VITE_API_URL || "https://ohlala.techinfo.uz/api").replace("/api", "");
  socket = io(socketUrl, {
    autoConnect: true,
    reconnection: true
  });

  socket.on("connect", () => {
    console.log("⚡ Connected to real-time socket server!");
  });

  socket.on("order:updated", (data) => {
    window.dispatchEvent(new CustomEvent("socket-order-updated", { detail: data }));
  });

  socket.on("table:status_changed", (data) => {
    window.dispatchEvent(new CustomEvent("socket-table-changed", { detail: data }));
  });

  socket.on("inventory:warning", (data) => {
    appContext.showAlert("Ogohlantirish", data.message, "warning");
  });

  socket.on("kitchen:item_added", (data) => {
    window.dispatchEvent(new CustomEvent("socket-kitchen-item-added", { detail: data }));
  });

  socket.on("kitchen:item_cancelled", (data) => {
    window.dispatchEvent(new CustomEvent("socket-kitchen-item-cancelled", { detail: data }));
  });

  socket.on("kitchen:item_quantity_changed", (data) => {
    window.dispatchEvent(new CustomEvent("socket-kitchen-item-qty-changed", { detail: data }));
  });

  socket.on("kitchen:item_swapped", (data) => {
    window.dispatchEvent(new CustomEvent("socket-kitchen-item-swapped", { detail: data }));
  });

  socket.on("expense:created", (data) => {
    window.dispatchEvent(new CustomEvent("socket-expense-created", { detail: data }));
  });

  socket.on("cash:summary_updated", (data) => {
    window.dispatchEvent(new CustomEvent("socket-cash-updated", { detail: data }));
  });

  socket.on("cashier:reduction_requested", (data) => {
    appContext.playNotificationSound("warning");
    const tableInfo = data.table_number ? `Stol #${data.table_number}: ` : '';
    const notifMsg = `${tableInfo}${data.waiter_name || 'Ofitsiant'} '${data.product_name}' taomini (${data.old_qty} → ${data.new_qty}) kamaytirishni so'ramoqda. Sabab: ${data.reason || 'Keltirilmagan'}`;
    appContext.addNotification("Ofitsiant Minus So'rovi", notifMsg, "WARNING");

    const currentRole = state.role || (state.currentUser && state.currentUser.role);
    if (currentRole === "CASHIER" || currentRole === "MANAGER" || currentRole === "SUPERADMIN") {
      appContext.showAlert("⚠️ Ofitsiant Minus So'rovi", notifMsg, "warning");
    }
  });
}
