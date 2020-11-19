<template>
  <FrontPage />
  <p class="version">v1.0.0-alpha</p>
  <p class="author">
    <span style="font-size: 25px">©</span> Ove Jørgensen
    <a class="git-icon" target="_blank" href="https://www.github.com/ovejorgensen">
      <span class="iconify" data-icon="mdi-github" data-inline="false"></span>
    </a>
  </p>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import FrontPage from "./components/FrontPage.vue";

@Options({
  components: {
    FrontPage,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@200&display=swap");
.version {
  position: absolute;
  left: 10px;
  bottom: 0;
}
.author {
  position: absolute;
  right: 10px;
  bottom: 0;
  .git-icon{
    font-size: 30px;
    color: inherit;
    position: relative;
    bottom:-9px;
  }
}
body {
  margin: 0;
}
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Roboto Mono", monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #cad2c5;
  background-color: #2f3e46;
  height: 100vh;
  width: 100vw;
}
</style>
