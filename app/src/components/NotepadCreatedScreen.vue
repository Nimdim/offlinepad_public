<template>
  <full-screen-box :top="true" :fullscreen="true">
    <div
      class="collection notepads-selector block-center"
      style="border: unset;"
    >
      <div class="row">
        <font-awesome-icon
          icon="check"
          style="width: 100px; height: 100px;"
        /><br>
        <span>
            Блокнот успешно создан
        </span><br>
        <span>
            Вы можете
        </span>
      </div>
      <div class="row">
        <a
          class="waves-effect waves-teal btn"
          style="width: 100%;"
          @click.prevent="$emit('open')"
        >
          Открыть блокнот
        </a>
        <span>
            или
        </span>
        <a
          class="waves-effect waves-teal btn"
          style="width: 100%;"
          @click.prevent="$emit('menu')"
        >
          Выйти в главное меню
        </a>
      </div>
    </div>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";

  export default {
    props: {
    },

    components: {
      FullScreenBox,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
