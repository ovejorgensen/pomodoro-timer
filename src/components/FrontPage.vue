<template>
  <div class="outer">
    <h1 class="title">Pomodoro Timer</h1>
    <div v-if="inSession">
      <h3>
        Currently in session hosted by: <br />
        {{ currentSessionHost }}
      </h3>
      <p>People in session: {{ peopleInSession }}</p>
      <h2 v-if="state == 0">Work Timer</h2>
      <h2 v-if="state == 1">Short Break</h2>
      <h2 v-if="state == 2">Long Break</h2>
    </div>
    <div v-if="hostingSession">
      <h3>Hey {{ username }}</h3>
      <h3>You are hosting a session!</h3>
      <p>People in session: {{ peopleInSession }}</p>
      <h2 v-if="state == 0">Work Timer</h2>
      <h2 v-if="state == 1">Short Break</h2>
      <h2 v-if="state == 2">Long Break</h2>
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
        @reset-timer="resetTimer"
        @time-remaining="timeRemaining"
        :sessionMenu="sessionMenu"
        :state="state"
        :inSession="inSession"
        :startAt="state == 0 ? 1 : state == 1 ? 1 : 15"
        :timerWatch="timerWatch"
        :receivedTime="receivedTime"
        :active="active"
      />
      <div class="joinMenu" v-if="sessionMenu == 1">
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
      <div class="createMenu" v-else-if="sessionMenu == 2">
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
        <p v-if="formMessageActive">{{ formMessage }}</p>
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
  receivedTime: string | undefined;
  showingPeople = false;
  people: [object] | undefined;
  username: string | undefined;
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
    this.sendWS(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time,
        active: this.active,
      })
    );
  }
  timerPause() {
    this.sessionMenu = 0;
    this.active = false;
    this.sendWS(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time,
        active: this.active,
      })
    );
  }
  resetTimer() {
    this.sessionMenu = 0;
    this.active = false;
  }
  workStart() {
    this.sessionMenu = 0;
    this.state = 0;
    this.active = false;

    this.sendWS(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time,
        active: this.active,
      })
    );
  }
  shortBreak() {
    this.sessionMenu = 0;
    this.state = 1;
    this.active = false;

    this.sendWS(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time,
        active: this.active,
      })
    );
  }
  longBreak() {
    this.sessionMenu = 0;
    this.state = 2;
    this.active = false;

    this.sendWS(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time,
        active: this.active,
      })
    );
  }
  timeRemaining(time) {
    this.time = time;
    this.sendWS(
      JSON.stringify({
        type: "sendHostInfo",
        state: this.state,
        time: this.time,
        active: this.active,
      })
    );
  }
  leaveSession() {
    this.inSession = false;
    this.sendWS(JSON.stringify({ type: "leaveSession" }));
  }
  endSession() {
    this.peopleInSession = 0;
    this.hostingSession = false;
    const message = {
      type: "endSession"
    };
    this.sendWS(JSON.stringify(message));
    this.ws = undefined;
  }
  sendWS(message){
    this.ws?.send(message);
  }
  startWebSocket(type: object | undefined) {
    this.ws = new WebSocket("ws://localhost:9898/");

    const self = this.ws;

    this.ws.onopen = () => {
      console.log("WebSocket Connection Established");
      if (type) self.send(JSON.stringify(type));
    };

    this.ws.onclose = () => {
      console.log("WebSocket Connection Closed");
      this.ws = undefined;
    };

    this.ws.onerror = () => {
      console.log("WebSocket Error");
      this.ws = undefined;
    };

    this.ws.onmessage = (e) => {
      console.log(`Received: ${e.data}`);
    };

    this.ws.onmessage = (e) => {

      const data = JSON.parse(e.data);
      const resType: string = data.type;

      if (resType == "usernames") {
        this.people = undefined;
        this.showingPeople = false;
        for (const el of data.names) {
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
        this.currentSessionHost = data.name;
        this.peopleInSession = data.numUsers;
        this.state = data.state;

        this.sessionMenu = 0;
        this.receivedTime = data.time;
        this.active = data.active;
      }

      else if (resType == "takenUsername") {
        this.sessionMenu = 2;
        this.formMessage = "This username is taken";
        this.formMessageActive = true;
      }

      else if (resType == "longName") {
        this.sessionMenu = 2;
        this.formMessage = "Max 10 characters";
        this.formMessageActive = true;
      }

      else if (resType == "successfulCreate") {
        this.hostingSession = true;
        this.formMessageActive = false;
        this.sessionMenu = 0;
        this.peopleInSession = 0;
      }

      else if (resType == "getUsersInfo") {
        this.peopleInSession = data.numUsers;
      }

      else if (resType == "endSession") {
        this.inSession = false;
        this.sendWS(JSON.stringify({ type: "leaveSession" }));
      }

      else if (resType == "getHostInfo") {
        this.sendWS(
          JSON.stringify({
            type: "sendHostInfo",
            state: this.state,
            time: this.time,
            active: this.active,
          })
        );
      }

      else if (resType == "hostStatus") {
        this.peopleInSession = data.numUsers;
        this.state = data.state;
        this.active = data.active;
        this.timerWatch = data.time;
      }

      else {
        console.log(`Received: ${e.data}`);
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
    } else {
      this.ws.send(JSON.stringify({ type: "fetchNames" }));
    }
  }
  createSession() {
    this.sessionMenu = 2;
  }
  formSubmit(name) {
    this.username = name;
    const createObj = {
      type: "create",
      name: name,
      state: this.state,
      active: this.active
    };
    if (!this.ws) {
      this.startWebSocket(createObj);
    } else {
      this.sendWS(JSON.stringify(createObj));
    }
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
