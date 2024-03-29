<template>
  <div class="card" v-bind:class="{ hideTimerCard: hideCard }">
    <h1>{{ timing }}</h1>
  </div>
  <svg 
    style="position:absolute" 
    width="400" 
    height="300" 
    v-bind:class="{ hideTimerCard: hideCard }"
  >
    <path
      id="loader-path"
      class="loader"
      d="M20,2 h358 a20,20 0 0 1 20,20 v256 a20,20 0 0 1 -20,20 h-356 a20,20 0 0 1 -20,-20 v-256 a20,20 0 0 1 20,-20 z"
      fill="none"
      stroke="black"
      stroke-width="3"
    />
  </svg>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { Prop, Watch, Emit } from "vue-property-decorator";

export default class TimerCard extends Vue {
  @Prop(Number) readonly startAt!: number;
  @Prop({ default: 0 }) state!: number;
  @Prop({ default: false }) active!: boolean;
  @Prop({ default: false }) inSession!: boolean;
  @Prop({ default: false }) sessionMenu!: number;
  @Prop({ default: false }) timerWatch!: string;
  @Prop({ default: undefined }) receivedTime!: string | undefined;
  
  minutes = 25;
  seconds = 0;
  timing = "";
  started = false;
  hideCard = false;
  interval: number | undefined;

  mounted() {
    // const path: SVGPathElement | null = document.querySelector("path");
    // if(path != null) {
    //   const len = path.getTotalLength();
    //   console.log(len);
    //   path.style.setProperty('--total-length', len.toString());
    // }
    if (this.receivedTime !== undefined){
      this.timing = this.receivedTime;
      this.minutes = +this.receivedTime.split(":")[0];
      this.seconds = +this.receivedTime.split(":")[1];
    } 
    // else if (this.timerWatch !== undefined || this.timerWatch == false) {
    //   this.timing = this.timerWatch;
    //   this.minutes = +this.timerWatch.split(":")[0];
    //   this.seconds = +this.timerWatch.split(":")[1];
    // } 
    else {
      this.timing = this.startAt.toString().padStart(2, "0") + ":00";
      this.minutes = this.startAt;
    }
  }

  @Emit("resetTimer")
  reset() {
    return false;
  }

  @Emit("timeRemaining")
  timeRemaining() {
    return this.timing;
  }

  @Watch("timerWatch")
  changeTime(val: string) {
    if (typeof(val) !== "boolean"){
      this.timing = val;
      this.minutes = +val.split(":")[0];
      this.seconds = +val.split(":")[1];
       if (this.seconds == 0 && this.minutes == 0) {
        this.stopTimer();
      }
    }
  }

  @Watch("receivedTime")
  receiver(val: string) {
    this.timing = val;
  }

  @Watch("sessionMenu")
  hideSessionMenu(val: number) {
    this.hideCard = val === 0 ? false : true;
  }

  @Watch("inSession")
  session(val: boolean) {
    if (!val) {
      this.onPropertyChanged(this.active);
    }
  }

  @Watch("state")
  stateChange(val: number) {
    switch (val) {
      case 0: {
        this.timing = "25:00";
        this.minutes = 25;
        break;
      }
      case 1: {
        this.timing = "05:00";
        this.minutes = 5;
        break;
      }
      case 2: {
        this.timing = "15:00";
        this.minutes = 15;
        break;
      }
    }
    const path: SVGPathElement | null = document.querySelector("path");
    if (path) path.style.display = "none";
    this.seconds = 0;
  }

  @Watch("active")
  onPropertyChanged(val: boolean) {
    const path: SVGPathElement | null = document.querySelector("path");
    if (!path) return;
    if (val) {
      this.started = true;
      if (!this.inSession){
        this.timerMain();
        this.interval = setInterval(this.timerMain, 1000);
      }
      path.style.display = "block";
      path.style.animationPlayState = "running";
    } else {
      if (!this.inSession){
        clearInterval(this.interval);
      }
      path.style.animationPlayState = "paused";
    }
  }

  timerMain() {
    const mins: string = this.minutes.toString().padStart(2, "0");
    const seconds: string = this.seconds.toString().padStart(2, "0");

    this.timing = `${mins}:${seconds}`;
    document.title = this.timing;

    this.timeRemaining();

    if (this.seconds > 0) this.seconds--;
    else if (this.seconds == 0 && this.minutes >= 1) {
      this.minutes--;
      this.seconds = 59;
    } else if (this.seconds == 0 && this.minutes == 0) {
      clearInterval(this.interval);
      this.stopTimer();
    }
  }

  stopTimer() {
    const path: SVGPathElement | null = document.querySelector("path");
    if (path) path.style.display = "none";
    this.reset();
    switch (this.state) {
      case 0: {
        this.timing = document.title = "Time for a break!";
        this.notifyMe("WOOOOHOOO TIME FOR A BREAK!");
        break;
      }
      case 1: {
        this.timing = document.title = "Get back to work!";
        this.notifyMe("Okay mister, you know what's up. Back to work");
        break;
      }
      case 2: {
        this.timing = document.title = "Get back to work!";
        this.notifyMe("Wow that was a long break! Time to get back to work");
        break;
      }
    }
  }

  notifyMe(message: string) {
    if (Notification.permission === "granted") {
      new Notification(message);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(message);
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>

.hideTimerCard {
  display: none !important;
}

.card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 400px;
  height: 300px;
  background-color: #354f52;
  border-radius: 20px;
  letter-spacing: 5px;
}
.loader {
  display: none;
  stroke: #84a98c;
  stroke-dasharray: 135.3681518554687;
  stroke-dashoffset: 1353.6815185546875;
  -webkit-animation: dash 16s linear forwards; /* Chrome, Safari, Opera */
  animation: dash 16s linear infinite;
}
@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
