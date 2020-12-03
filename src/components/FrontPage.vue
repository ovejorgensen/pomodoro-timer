<template>
  <div class="outer">
    <h1 class="title">Pomodoro Timer</h1>
    <h3 v-if="inSession">
      Currently in session hosted by: <br />
      {{ currentSessionHost }}
    </h3>
    <div v-if="hostingSession">
      <h3>You are hosting a session!</h3>
      <p>People in session: {{ peopleInSession }}</p>
    </div>
    <div v-if="!inSession" class="tabs">
      <button
        @click="workStart()"
        class="btn col"
        v-bind:style="
          state == 0 ? 'border-bottom: 6px solid #52796f' : 'border: none'
        "
      >
        Work Timer
      </button>
      <button
        @click="shortBreak()"
        class="btn col"
        v-bind:style="
          state == 1 ? 'border-bottom: 6px solid #52796f' : 'border: none'
        "
      >
        Short Break
      </button>
      <button
        @click="longBreak()"
        class="btn col"
        v-bind:style="
          state == 2 ? 'border-bottom: 6px solid #52796f' : 'border: none'
        "
      >
        Long Break
      </button>
    </div>
    <div class="content">
      <TimerCard
        v-if="sessionMenu == 0"
        @reset-timer="resetTimer"
        @time-remaining="timeRemaining"
        :state="state"
        :startAt="25"
        :timerWatch="timerWatch"
        :active="active"
      />
      <div class="joinMenu" v-else-if="sessionMenu == 1">
        <h2>Join Session</h2>
        <div v-if="showingPeople">
          <p
            v-for="person in people"
            class="person"
            :key="person.id"
            @click="personClick(person.name)"
          >
            {{ person.name }}
          </p>
        </div>
      </div>
      <div class="createMenu" v-else>
        <h2>Create Session</h2>
        <form>
          <label for="fname">Enter a username:</label><br />
          <input type="text" id="name" v-model="name" placeholder="Name.." />
          <input
            type="submit"
            @click.prevent="formSubmit(name)"
            value="Create"
          />
        </form>
        <p v-if="formMessageActive">{{formMessage}}</p>
      </div>
    </div>
    <div v-if="!(inSession || hostingSession)" class="lower-btns">
      <button v-if="!active" class="btn col" @click="timerStart()">
        Start Timer
      </button>
      <button v-else class="btn col" @click="timerPause()">Pause Timer</button>
      <button class="btn session" @click="joinSession()">Join Session</button>
      <button class="btn session" @click="createSession()">
        Create Session
      </button>
    </div>
    <div v-else-if="hostingSession" class="lower-btns">
      <button v-if="!active" class="btn col" @click="timerStart()">
        Start Timer
      </button>
      <button v-else class="btn col" @click="timerPause()">Pause Timer</button>
      <button class="btn col" @click="endSession()">
        End Session
      </button>
    </div>
    <div v-else class="lower-btns">
      <button class="btn col" @click="leaveSession()">
        Leave Session
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "vue-property-decorator";
import TimerCard from "./TimerCard.vue";

@Options({
  components: {
    TimerCard,
  },
})
export default class FrontPage extends Vue {
  active = false;
  timerWatch = "25:00";
  sessionMenu = 0;
  state = 0;
  time: number | undefined;
  showingPeople = false;
  people: [object] | undefined;
  inSession = false;
  hostingSession = false;
  peopleInSession = 0;
  formMessage: string | undefined;
  formMessageActive = false;
  currentSessionHost: string | undefined = "none";

  ws: WebSocket | undefined;

  mounted() {
    this.startWebSocket(undefined);
  }

  timerStart() {
    this.sessionMenu = 0;
    this.active = true;
  }
  timerPause() {
    this.sessionMenu = 0;
    this.active = false;
  }
  resetTimer() {
    this.sessionMenu = 0;
    this.active = false;
  }
  workStart() {
    this.sessionMenu = 0;
    this.state = 0;
    this.active = false;
    
    this.ws?.send(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time
      })
    );
  }
  shortBreak() {
    this.sessionMenu = 0;
    this.state = 1;
    this.active = false;

    this.ws?.send(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time
      })
    );
  }
  longBreak() {
    this.sessionMenu = 0;
    this.state = 2;
    this.active = false;

    this.ws?.send(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time
      })
    );
  }
  timeRemaining(time){
    this.time = time;
    this.ws?.send(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time
      })
    );
  }
  leaveSession() {
    this.inSession = false;
  }
  endSession() {
    this.hostingSession = false;
    const message = {
      type: "endSession"
    }
    this.ws?.send(JSON.stringify(message));
  }
  startWebSocket(type: object | undefined) {
    this.ws = new WebSocket("ws://localhost:9898/");
    const self = this.ws;
    this.ws.onopen = () => {
      console.log("WebSocket Connection Established");
      if (type) self.send(JSON.stringify(type));
    };
    this.ws.onmessage = e => {
      console.log(`Received: ${e.data}`);
    };
    this.ws.onmessage = e => {
      const resType: string = JSON.parse(e.data).type;
      if (resType == "usernames") {
        this.people = undefined;
        this.showingPeople = false;
        for (const el of JSON.parse(e.data).names) {
          const current = {
            id: Math.random(),
            name: el,
          };
          if (!this.people) this.people = [current];
          else this.people.push(current);
        }
        this.showingPeople = true;
      } 

      else if (resType == "confirmJoin") {
        this.inSession = true;
        this.sessionMenu = 0;
        this.currentSessionHost = JSON.parse(e.data).name;

        this.state = JSON.parse(e.data).state;
        console.log(`Changed to state ${this.state}`);
      } 
      
      else if (resType == "takenUsername") {
        this.sessionMenu = 2;
        this.formMessage = "This username is taken";
        this.formMessageActive = true;
      } 
      
      else if (resType == "successfulCreate") {
        this.sessionMenu = 0;
        this.hostingSession = true;
        this.formMessageActive = false;
      } 

      else if (resType == "getHostInfo") {
        this.ws?.send(JSON.stringify(
          {
            type: "sendHostInfo",
            state: this.state,
            time: this.time
          }
        ));
      }

      else if (resType == "hostStatus") {
        this.state = JSON.parse(e.data).state;
        console.log(`Changed to state ${this.state}`);
        this.timerWatch = JSON.parse(e.data).time;
        console.log(`Changed to time ${this.timerWatch}`);
      }
      
      else {
        console.log(`hey, received:${e.data}`);
      }
    };
  }
  personClick(name) {
    const joinObj = {
      type: "join",
      name: name
    };
    if (!this.ws) this.startWebSocket(joinObj);
    else this.ws.send(JSON.stringify(joinObj));
  }
  joinSession() {
    this.sessionMenu = 1;
    if (!this.ws) {
      this.startWebSocket({ type: "fetchNames" });
    } else this.ws.send(JSON.stringify({ type: "fetchNames" }));
  }
  createSession() {
    this.sessionMenu = 2;
  }
  formSubmit(name) {
    const createObj = {
      type: "create",
      name: name,
      state: this.state,
    };
    if (!this.ws) this.startWebSocket(createObj);
    else this.ws?.send(JSON.stringify(createObj));
  }
}
</script>

<style scoped lang="scss">
input[type="text"],
select {
  width: 50%;
  padding: 12px 20px;
  margin: 8px 10px;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
}
input[type="submit"] {
  width: 20%;
  background-color: #52796f;
  color: inherit;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #2f3e46;
  }
}
.joinMenu,
.createMenu {
  width: 400px;
  height: 300px;
  background-color: #354f52;
  border-radius: 20px;
}
.joinMenu {
  overflow-y: auto;
  .person {
    background-color: #52796f;
    &:hover {
      background-color: #354f52;
      cursor: pointer;
    }
  }
}
/* Works on Chrome/Edge/Safari */
.joinMenu::-webkit-scrollbar {
  width: 12px;
}
.joinMenu::-webkit-scrollbar-track {
  background: #52796f;
}
.joinMenu::-webkit-scrollbar-thumb {
  background-color: #354f52;
  border-radius: 20px;
  border: 3px solid #52796f;
}
.title {
  display: inline;
  letter-spacing: 3px;
}
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
  .col {
    margin: 20px;
  }
}
.current-tab {
  border-bottom: 4px solid #52796f;
}
.lower-btns {
  display: flex;
  justify-content: space-evenly;
  .btn {
    margin: 20px;
    display: flex;
    justify-content: center;
  }
}
.outer {
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-content: flex-start;
  flex-wrap: wrap;
  row-gap: 100px;
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
  cursor: pointer;
}
.btn:active {
  transform: translateY(2px);
}
</style>
