<template>
  <full-screen-box :top="true">
    <preloader />
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import Preloader from "./Preloader.vue"

  export default {
    components: {
      FullScreenBox,
      Preloader,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
