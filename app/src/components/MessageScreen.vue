<template>
  <full-screen-box :top="true">
    <span v-for="line in title.split('\n')" :key="line">
        {{line}}<br>
    </span>
    <a
      class="waves-effect waves-teal btn"
      @click.prevent="$emit('close')"
    >
      Закрыть
    </a>

  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";

  export default {
    props: {
      title: {
        type: String,
        default: "Вы уверены",
      },
    },

    components: {
      FullScreenBox,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
