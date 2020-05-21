<template>
  <full-screen-box :top="true">
    <template v-if="import_error">
      <p class="center">{{import_error}}</p>
      <a
        class="waves-effect waves-teal btn  "
        @click.prevent="$emit('close')"
      >
        Закрыть
      </a>
    </template>
    <template v-else>
      <progress-bar :progress="progress" />
      <a
        class="waves-effect waves-teal btn"
        @click.prevent="$emit('abort')"
      >
        Прервать
      </a>
    </template>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import ProgressBar from "./ProgressBar.vue"

  export default {
    props: {
      progress: {
        type: Number,
        default: 0,
      },
      import_error: {
        type: String,
        default: null,
      },
    },

    components: {
      FullScreenBox,
      ProgressBar,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
