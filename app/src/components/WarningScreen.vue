<template>
  <div id="warningscreen">
    <span class="center_span">
      <p>
        Предупреждение
      </p>
      <p>
        WEB-приложение находится на стадии Альфа-тестирования
      </p>
      <p>
        После закрытия страницы введенные вами данные не сохранятся
      </p>
      <p>
       <button
          class="btn waves-effect waves-light"
          type="submit"
          name="action"
          @click="$emit('accept')">
          Хорошо
          <i class="material-icons right">check</i>
        </button>
      </p>
    </span>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    visible: Boolean
  },
  watch: {
    "visible": function(value) {
      setTimeout(function() {
        if(value) {
          window.$("warningscreen").fadeIn();
        } else {
          window.$("#warningscreen").fadeOut();
        }
      }, 0);
    }
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
