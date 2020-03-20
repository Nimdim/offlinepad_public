<template>
  <full-screen-box :top="true">
    <p>
      Предупреждение
    </p>
    <p>
      WEB-приложение находится на стадии Альфа-тестирования
    </p>
    <p>
      Теперь после закрытия вкладки ваши данные сохранятся. Тем не менее рекомендуем регулярно сохранять резерные копии
    </p>
    <p>
      <button
        class="btn waves-effect waves-light"
        type="submit"
        name="action"
        @click="$emit('accept')">
        Хорошо
        <font-awesome-icon icon="check" />
      </button>
    </p>
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
