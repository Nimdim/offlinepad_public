<template>
  <full-screen-box :top="true">
    <font-awesome-icon icon="lock" />
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";

  export default {
    components: {
      FullScreenBox,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
