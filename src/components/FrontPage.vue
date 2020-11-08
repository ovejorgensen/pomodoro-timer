<template>
  <TimerCard />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import TimerCard from "./components/TimerCard.vue";

@Options({
  components: {
    TimerCard
  }
})
export default class FrontPage extends Vue {}
</script>

<style scoped lang="scss">
div {
  color: #52796f;
}
</style>
