import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RoomList from "../views/RoomList.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/rooms",
      name: "rooms",
      component: RoomList,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("matrix_token");
  if (to.name !== "home" && !isAuthenticated) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
