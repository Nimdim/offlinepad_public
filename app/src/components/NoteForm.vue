<template>
  <div id="add_note_modal" class="modal">
    <div class="modal-content">
      <h4>
        <template v-if="form.action == 'add'">Новая запись</template> 
        <template v-else>Редактирование записи</template>
      </h4>
      <p>
        <select multiple>
          <option value="" disabled selected>Выберите метки</option>
          <option value="1">Работа</option>
          <option value="2">Задачи</option>
          <option value="3">Саморазвитие</option>
          <option value="4">Мысли</option>
        </select>
      </p>
      <label>Текст:
        <textarea class="materialize-textarea" v-model="form.text"></textarea>
      </label>
    </div>
    <div class="modal-footer">
      <a href="#!" class="modal-close waves-effect waves-green btn-flat" v-on:click="ok_button">
        <template v-if="form.action == 'add'">Создать</template>
        <template v-if="form.action == 'edit'">Сохранить</template>
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
        var modalInstance = document.getElementById("add_note_modal").M_Modal;
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

