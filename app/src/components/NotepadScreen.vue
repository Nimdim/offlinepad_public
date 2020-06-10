<template>
  <full-screen-box>
    <a v-if="encrypted"
      class="waves-effect waves-teal btn"
      @click.prevent="$emit('set_pin')"
    >
      Задать пин
    </a>
    <a v-if="encrypted"
      class="waves-effect waves-teal btn"
      @click.prevent="$emit('delete_pin')"
    >
      Удалить пин
    </a>

    <a v-if="encrypted"
      class="waves-effect waves-teal btn"
      @click.prevent="$emit('set_password')"
    >
      Задать пароль
    </a>
    <a v-if="encrypted"
      class="waves-effect waves-teal btn"
      @click.prevent="$emit('delete_password')"
    >
      Удалить пароль
    </a>

    <a v-if="encrypted"
      class="waves-effect waves-teal btn"
      @click.prevent="$emit('export_encrypted')"
    >
      Зашифрованный бекап
    </a>
    <a
      class="waves-effect waves-teal btn"
      @click.prevent="$emit('export_unencrypted')"
    >
      Незашифрованный бекап
    </a>
    <a
      class="waves-effect waves-teal btn"
      @click.prevent="$emit('delete')"
    >
      Удалить
    </a>

  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";

  export default {
    props: {
      encrypted: {
        type: Boolean,
        default: false,
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
