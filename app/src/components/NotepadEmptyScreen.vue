<template>
  <full-screen-box>
    <font-awesome-icon
      icon="box-open"
      style="width: 200px; height: 200px; color: gray;"
    />
    <template v-if="text">
      <p v-for="line in text.split('\n')" :key="line">
        {{line}}
      </p>
    </template>
    <template v-if="develop_mode">
      <p>
        <a href="#!" @click="$emit('test_create', 10)">Создать 10</a>
      </p>
      <p>
        <a href="#!" @click="$emit('test_create', 100)">Создать 100</a>
      </p>
      <p>
        <a href="#!" @click="$emit('test_create', 1000)">Создать 1000</a>
      </p>
      <p>
        <a href="#!" @click="$emit('test_create', 10000)">Создать 10000</a>
      </p>
    </template>
  </full-screen-box>
</template>

<script>
import FullScreenBox from "./FullScreenBox.vue";
export default {

    props: {
      develop_mode: {
        type: Boolean,
        default: false,
      },
      text: {
        type: String,
        default: null,
      }
    },

    components: {
        FullScreenBox,
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
