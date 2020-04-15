<template>
  <div
    class="col s12 m7 message_popup"
    :class="{'editing': update_step != 'initial'}"
  >
    <div class="card horizontal">
      <div class="card-stacked">
        <div class="card-content" v-if="update_step == 'initial'">
          <p>Доступно обновление: {{version}}</p>
          <p>
            <a class="waves-effect waves-teal btn-small"
              @click.prevent="app_goto_update">
              Обновить
            </a>
          </p>
        </div>
        <div class="card-content" v-else-if="update_step == 'confirm'">
          <p>После обновления страница</p>
          <p>будет перезагружена</p>
          <a class="waves-effect waves-teal btn-small"
            @click.prevent="update_cancel"
          >
            Отмена
          </a>
          <a class="waves-effect waves-teal btn-small red"
            @click.prevent="update_sw"
          >
            Продолжить
          </a>
        </div>
        <div class="card-content" v-else>
          <p>Обновление</p>
          <preloader />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Preloader from "./Preloader.vue"

  export default {
    props: ["version"],

    components: {
      Preloader,
    },

    data: function() {
      let data = {
        update_step: "initial",
      };
      return data;
    },

    methods: {
      update_cancel: function() {
        this.update_step = 'initial';
        this.$emit("focus", false);
      },

      app_goto_update: function() {
        this.update_step = 'confirm';
        this.$emit("focus", true);
      },

      update_sw: function() {
        this.update_step = "updating";
        this.$emit("update");
      },
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
