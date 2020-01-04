<template>
  <div id="add_tag_modal" class="modal">
    <div class="modal-content">
      <h4>
        <template v-if="form.action == 'add'">Новая метка</template>
        <template v-else>Редактирование метки</template>
      </h4>
      <label>Название:
        <input type="text" v-model="form.text">
      </label>
    </div>
    <div class="modal-footer">
      <a href="#!" class="modal-close waves-effect waves-green btn-flat" v-on:click="ok_button">
        <span v-if="form.action == 'add'">Создать</span>
        <span v-if="form.action == 'edit'">Сохранить</span>
      </a>
      <a href="#!" class="modal-close waves-effect waves-green btn-flat" v-on:click="cancel_button">Отмена</a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    form: Object,
  },
  watch: {
    "form.visible": function(value) {
      if(value) {
        // this["form.visible"] = false;
        var modalInstance = document.getElementById("add_tag_modal").M_Modal;
        if (modalInstance) {
          modalInstance.open();
        }
      }
    },
  },

  methods: {
    ok_button: function() {
      this.$emit("submit");
      // this.form.visible = false;
    },
    cancel_button: function() {
      this.$emit("cancel");
      // this.form.visible = false;
    },
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

