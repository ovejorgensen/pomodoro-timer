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
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@200&display=swap');

body {
  margin: 0;
  // width: 100vw;
  // height: 100vh;
}
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Roboto Mono', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #cad2c5;
  background-color: #2f3e46;
  height: 100vh;
  width: 100vw;
}
</style>
