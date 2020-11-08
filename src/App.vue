<template>
  <FrontPage />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import FrontPage from "./components/FrontPage.vue";

@Options({
  components: {
    FrontPage
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
body {
  margin: 0;
  width: 100vw;
  height: 100vh;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #2f3e46;
  height: 100vh;
  width: 100vw;
}
</style>
