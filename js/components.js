Vue.component("opl-tag-item", {

    props: ["tag"],

    template: '<li class="collection-item" v-on:click="$emit(\'click\', tag.id)">' +
        '<p v-if="tag.hidden !== true">' +
          '<label v-on:click.stop="">' +
            '<input type="checkbox" v-model="tag.checked"/>' +
            '<span>{{tag.name}}</span>' +
          '</label>' +
          '<span class="badge">{{tag.count}}</span>' +
          '<a class="waves-effect waves-teal btn right tag_delete_btn" v-on:click.prevent.stop="$emit(\'hide\', tag.id)">' +
            '<i class="material-icons">delete</i>' +
          '</a>' +
          '</p>' +
          '<p v-else>' +
          '<span class="badge visibility_hidden">{{tag.count}}</span>' +
          '<span class="visibility_hidden">stub</span>' +
          '<a class="waves-effect waves-teal btn tag_delete_btn right" v-on:click.prevent.stop="$emit(\'show\', tag.id)">' +
            '<i class="material-icons">Отмена</i>' +
          '</a>' +
          '<a class="waves-effect waves-teal btn tag_delete_btn right" style="margin-right: 10px;" v-on:click.prevent.stop="$emit(\'delete\', tag.id)">' +
            '<i class="material-icons">Удалить</i>' +
          '</a>' +
        '</p>' +
      '</li>',

});

Vue.component("opl-loadscreen", {

    props: ["visible"],

    watch: {
        "visible": function(value) {
            setTimeout(function() {
                if(value) {
                    $("#loadscreen").fadeIn();
                } else {
                    $("#loadscreen").fadeOut();
                }
            }, 0);
        }
    },

    template: '<div id="loadscreen"> ' +
        '<span class="center_span"> ' +
        '<div class="preloader-wrapper big active"> ' +
        '<div class="spinner-layer spinner-blue-only"> ' +
            '<div class="circle-clipper left"> ' +
            '<div class="circle"></div> ' +
            '</div><div class="gap-patch"> ' +
            '<div class="circle"></div> ' +
            '</div><div class="circle-clipper right"> ' +
            '<div class="circle"></div> ' +
            '</div> ' +
        '</div> ' +
        '</div> ' +
        '</span> ' +
    '</div> ',

});

Vue.component('opl-tag-form', {

    props: ["form"],

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

    template:
    '<div id="add_tag_modal" class="modal"> ' +
      '<div class="modal-content"> ' +
        '<h4> ' +
          '<template v-if="form.action == \'add\'">Новая метка</template> ' +
          '<template v-else>Редактирование метки</template> ' +
        '</h4> ' +
        '<label> ' +
          'Название: ' +
          '<input type="text" v-model="form.text"> ' +
        '</label> ' +
      '</div> ' +
      '<div class="modal-footer"> ' +
        '<a href="#!" class="modal-close waves-effect waves-green btn-flat" v-on:click="ok_button"> ' +
          '<span v-if="form.action == \'add\'">Создать</span> ' +
          '<span v-if="form.action == \'edit\'">Сохранить</span> ' +
        '</a> ' +
        '<a href="#!" class="modal-close waves-effect waves-green btn-flat" v-on:click="cancel_button">Отмена</a> ' +
      '</div> ' +
    '</div> '
});

Vue.component('opl-note-form', {

  props: ["form"],

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

  template:
  '<div id="add_note_modal" class="modal"> ' +
    '<div class="modal-content"> ' +
      '<h4>' +
        '<template v-if="form.action == \'add\'">Новая запись</template>' + 
        '<template v-else>Редактирование записи</template>' + 
      '</h4> ' +
      '<p> ' +
        '<select multiple> ' +
          '<option value="" disabled selected>Выберите метки</option> ' +
          '<option value="1">Работа</option> ' +
          '<option value="2">Задачи</option> ' +
          '<option value="3">Саморазвитие</option> ' +
          '<option value="4">Мысли</option> ' +
        '</select> ' +
      '</p> ' +
      '<label> ' +
        'Текст: ' +
        '<textarea class="materialize-textarea" v-model="form.text"></textarea> ' +
      '</label> ' +
    '</div> ' +
    '<div class="modal-footer"> ' +
      '<a href="#!" class="modal-close waves-effect waves-green btn-flat" v-on:click="ok_button">' +
        '<template v-if="form.action == \'add\'">Создать</template>' +
        '<template v-if="form.action == \'edit\'">Сохранить</template>' +
      '</a> ' +
      '<a href="#!" class="modal-close waves-effect waves-green btn-flat" v-on:click="cancel_button">Отмена</a> ' +
    '</div> ' +
  '</div> ',

});


Vue.component("opl-note-item", {

  props: ["note"],

  filters: {
    note_datetime: function(stamp) {
      return moment(stamp).format("DD MMMM YYYY hh:mm:ss");
    },
  },

  // template: '<li class="collection-item" v-on:click="$emit(\'click\', note.id)">' +
  //     '<p v-if="tag.hidden !== true">' +
  //     '<label v-on:click.stop="">' +
  //         '<input type="checkbox" v-model="tag.checked"/>' +
  //         '<span>{{tag.name}}</span>' +
  //     '</label>' +
  //     '<span class="badge">{{tag.count}}</span>' +
  //     '<a class="waves-effect waves-teal btn right tag_delete_btn" v-on:click.prevent.stop="$emit(\'hide\', tag.id)">' +
  //         '<i class="material-icons">delete</i>' +
  //     '</a>' +
  //     '</p>' +
  //     '<p v-else>' +
  //     '<span class="badge visibility_hidden">{{tag.count}}</span>' +
  //     '<span class="visiblilty_hidden">stub</span>' +
  //     '<a class="waves-effect waves-teal btn tag_delete_btn right" v-on:click.prevent.stop="$emit(\'show\', tag.id)">' +
  //         '<i class="material-icons">Отмена</i>' +
  //     '</a>' +
  //     '<a class="waves-effect waves-teal btn tag_delete_btn right" style="margin-right: 10px;" v-on:click.prevent.stop="$emit(\'delete\', tag.id)">' +
  //         '<i class="material-icons">Удалить</i>' +
  //     '</a>' +
  //     '</p>' +
  // '</li>',

  template: '<li class="collection-item" v-on:click="$emit(\'click\', note.id)"> ' +
              '<p> ' +
                '<span class="timestamp"> ' +
                  '<i class="material-icons">access_time</i> ' +
                  '<span>{{note.creation_time | note_datetime}}</span> ' +
                '</span> ' +
                '<a class="waves-effect waves-teal btn-floating right"> ' +
                  '<i class="material-icons">delete</i> ' +
                '</a> ' +
              '</p> ' +
              '<p> ' +
                '<div class="chip"> ' +
                  'Работа ' +
                '</div> ' +
                '<div class="chip"> ' +
                  'Задачи ' +
                '</div> ' +
              '</p> ' +
              '<p> ' +
                '{{note.text}}' +
              '</p> ' +
            '</li> ',


});



{/* <div id="filter_records_modal" class="modal">
<div class="modal-content">
  <h4>Фильтр</h4>
  <p>
    <select multiple>
      <option value="" disabled selected>Выберите метки</option>
      <option value="1">Работа</option>
      <option value="2">Задачи</option>
      <option value="3">Саморазвитие</option>
      <option value="4">Мысли</option>
    </select>
  </p>
  <p>
    <label>
      Дата от:
      <input type="text" class="datepicker">
    </label>
    <label>
      Дата до:
      <input type="text" class="datepicker">
    </label>
  </p>
</div>
<div class="modal-footer">
  <a href="#!" class="modal-close waves-effect waves-green btn-flat">Применить</a>
</div>
</div> */}
