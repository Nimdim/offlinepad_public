<template>
  <full-screen-box :top="false">
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
