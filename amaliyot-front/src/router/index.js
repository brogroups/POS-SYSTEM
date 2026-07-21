import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import MainLayout from "../layouts/MainLayout.vue";
import Products from "../pages/Products.vue";
import POS from "../pages/POS.vue";
import Orders from "../pages/Orders.vue";
import Payments from "../pages/Payments.vue";
import Users from "../pages/Users.vue";
import Branches from "../pages/Branches.vue";
import Settings from "../pages/Settings.vue";
import Login from "../pages/Login.vue";
import Inventory from "../pages/Inventory.vue";
import Expenses from "../pages/Expenses.vue";
import { appContext } from "../store/appContext";

const routes = [
  { path: "/login", component: Login },
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: Dashboard },
      { path: "products", component: Products },
      { path: "pos", component: POS },
      { path: "orders", component: Orders },
      { path: "payments", component: Payments },
      { path: "users", component: Users },
      { path: "branches", component: Branches },
      { path: "settings", component: Settings },
      { path: "customers", redirect: "/pos" },
      { path: "chef", redirect: "/pos" },
      { path: "hookah", redirect: "/pos" },
      { path: "inventory", component: Inventory },
      { path: "purchases", redirect: "/pos" },
      { path: "expenses", component: Expenses },
      { path: "audit-log", redirect: "/pos" },
      {
        path: ":pathMatch(.*)*",
        component: {
          template: `
            <div class="flex flex-col items-center justify-center h-full">
              <h1 class="text-4xl font-bold text-destructive mb-2">404</h1>
              <p class="text-muted-foreground">Sahifa topilmadi</p>
            </div>
          `,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = appContext.state.isAuthenticated;
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
