import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import store from "./store";

if (Notification.permission !== "denied") Notification.requestPermission();


createApp(App)
  .use(store)
  .mount("#app");
