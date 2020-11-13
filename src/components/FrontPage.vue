<template>
  <div class="outer">
    <div class="tabs">
      <button @click="workStart()" class="btn col">Worky Timer</button>
      <button @click="shortBreak()" class="btn col">Short Breaky</button>
      <button @click="longBreak()" class="btn col">Long Breaky</button>
    </div>
    <div class="content">
      <TimerCard
        @reset-timer="resetTimer"
        :state="state"
        :startAt="25"
        :active="active"
      />
    </div>
    <div class="lower-btns">
      <button v-if="!active" class="btn col" @click="timerStart()">
        Start Timer
      </button>
      <button v-else class="btn col" @click="timerPause()">Pause Timer</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import TimerCard from "./TimerCard.vue";

@Options({
  components: {
    TimerCard
  }
})
export default class FrontPage extends Vue {
  active = false;
  state = 0;
  timerStart() {
    this.active = true;
  }
  timerPause() {
    this.active = false;
  }
  resetTimer() {
    this.active = false;
  }
  workStart() {
    this.state = 0;
    this.active = false;
  }
  shortBreak(){
    this.state = 1;
    this.active = false;
  }
  longBreak() {
    this.state = 2;
    this.active = false;
  }
}
</script>

<style scoped lang="scss">
.content {
  display: flex;
  flex-basis: 100%;
  justify-content: space-evenly;
}
.col {
  flex: 1;
}
.tabs {
  display: flex;
  flex-basis: 100%;
}
.tabs .col {
  margin: 20px;
}
.lower-btns {
  display: flex;
  justify-content: space-evenly;
}
.outer {
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-content: flex-start;
  flex-wrap: wrap;
  row-gap: 100px;
}
h3 {
  background-color: #354f52;
  border-radius: 2px;
}
.btn {
  width: 120px;
  text-align: center;
  font-family: "Roboto Mono", monospace;
  background-color: #354f52;
  border-radius: 5px;
  border: none;
  outline: none;
  color: white;
  padding: 15px 32px;
  text-decoration: none;
  font-size: 16px;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
.btn:hover {
  background-color: #52796f;
  box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24),
    0 17px 50px 0 rgba(0, 0, 0, 0.19);
}
.btn:active {
  transform: translateY(2px);
}
</style>
