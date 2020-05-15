<template>
  <full-screen-box :top="true">
    <template v-if="import_error">
      <p>{{import_error}}</p>
      <a
        class="waves-effect waves-teal btn tag_delete_btn"
        @click.prevent="$emit('close')"
      >
        Закрыть
      </a>
    </template>
    <template v-else>
      <preloader />
      <progress-bar :progress="progress" />
      <a
        class="waves-effect waves-teal btn tag_delete_btn"
        @click.prevent="$emit('abort')"
      >
        Прервать
      </a>
    </template>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import Preloader from "./Preloader.vue"
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
      Preloader,
      ProgressBar,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
