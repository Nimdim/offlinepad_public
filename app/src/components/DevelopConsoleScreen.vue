<template>
  <full-screen-box :fullscreen="true">
    <p v-for="message in messages" :key="message">
    {{message}}
    </p>
  </full-screen-box>
</template>

<script>
import FullScreenBox from "./FullScreenBox.vue";
export default {
  components: {
    FullScreenBox,
  },

  data: function() {
    let data = {
      messages: [],
      timers: {},
    };
    return data;
  },

  mounted: function() {
    this.messages.push("console started");
  },

  methods: {
    log: function(msg) {
      this.messages.push(msg);
    },

    time: function(id) {
      this.timers[id] = + new Date();
    },

    timeEnd: function(id) {
      let start_time = this.timers[id];
      if(start_time != null) {
        let current_time = + new Date();
        this.messages.push(id + ": " + (current_time - start_time).toString() + "ms");
        delete this.timers[id];
      } else {
        this.messages.push("timeer '" + id + "' not found");
      }
    },
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
