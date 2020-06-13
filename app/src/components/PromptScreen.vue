<template>
  <full-screen-box :top="true">
    <div class="row">
      <span>
          {{title}}
      </span>
    </div>
    <div class="row">
      <a
        class="waves-effect waves-teal btn"
        @click.prevent="$emit('submit')"
      >
        <font-awesome-icon icon="check" />
      </a>

      <a
        class="waves-effect waves-teal btn red"
        @click.prevent="$emit('cancel')"
      >
        <font-awesome-icon icon="times-circle" />
      </a>
    </div>
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
