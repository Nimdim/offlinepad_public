<template>
  <full-screen-box :top="true" :fullscreen="true">
    <div style="width: 100%; height: 60px;">
      Developer console
      <a class="btn-flat waves-effect waves-light right"
        @click="$emit('close')"
      >
        <font-awesome-icon icon="times" />
      </a>
    </div>
    <div style="width: 100%; height: calc(100% - 60px);">
      <p v-for="message in messages" :key="message">
        {{message}}
      </p>
    </div>
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

    error: function() {
      this.messages.push("error: " + arguments.toString());
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
