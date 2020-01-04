<template>
  <div id="app" v-bind:class="{show_footer: tags.footer.show}">
    <ul id="dropdown1" class="dropdown-content">
      <li><a href="#!">Все</a></li>
      <li class="divider"></li>
      <li><a href="#!">Разбор</a></li>
      <li><a href="#!">Задачи</a></li>
    </ul>

    <ul class="collection tags" v-if="section == 'tags'">
      <tag-item v-for="tag in tags.items" :key="tag.id"
        :tag="tag"
        v-on:click="show_edit_tag_form"
        v-on:hide="hide_tag"
        v-on:show="show_tag"
        v-on:delete="remove_tag" />
    </ul>

    <ul class="collection records" v-if="section == 'notes'">
      <note-item v-for="note in notes.items" :key="note.id"
        :note="note"
        v-on:click="show_edit_note_form"
        v-on:hide="hide_note"
        v-on:show="show_note"
        v-on:delete="remove_note" />
    </ul>

    <div class="tags_footer" v-if="section == 'tags'">
      <p>
        Найдено {{tags.footer.found}} записей
        <a href="#!" class="modal-close waves-effect waves-green btn" v-on:click="filter_tags">Показать</a>
      </p>
    </div>

    <nav class="light-blue lighten-1 header" role="navigation">
      <div class="nav-wrapper container"><!-- <a href="#!" class="brand-logo">Органайзер</a> -->

        <a href="#" data-target="nav-mobile" class="sidenav-trigger">
          <i class="material-icons">menu</i>
        </a>

        <ul id="tags_filter" v-if="section == 'tags'">
          <li class="search_li">
            <div class="input-field">
              <input id="search" type="search" v-model="tags.search" required>
              <label class="label-icon" for="search"><i class="material-icons">search</i></label>
              <i class="material-icons" v-on:click="tags_search_clear">close</i>
            </div>
          </li>
        </ul>

        <ul id="notes_filter" class="left" v-if="section == 'notes'">
          <li><a href="#" class="modal-trigger" data-target="filter_records_modal"><i class="material-icons">filter_list</i></a></li>
          <li>
            <a href="#" id="sort_by_date">
              Дата
              <i class="material-icons right up active">arrow_upward</i>
              <i class="material-icons right down">arrow_downward</i>
            </a>
          </li>
        </ul>
  

        <ul class="right hide-on-med-and-down desktop_menu">
          <!-- <li><a class="dropdown-trigger" href="#!" data-target="dropdown1">Записи<i class="material-icons right">arrow_drop_down</i></a></li> -->
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a href="#">Записи</a>
          </li>
          <li :class="{active: section == 'tags'}" v-on:click="change_section('tags')">
            <a href="#">Метки</a>
          </li>
          <li :class="{active: section == 'notepads'}" v-on:click="change_section('notepads')">
            <a href="#">Блокноты</a>
          </li>
        </ul>

        <ul id="nav-mobile" class="sidenav">
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a href="#">Записи</a>
            <!-- <ul>
              <li><a href="#!"><i class="material-icons">dashboard</i>Все</a></li>
              <li class="divider"></li>
              <li><a href="#!"><i class="material-icons">dashboard</i>Разбор</a></li>
              <li><a href="#!"><i class="material-icons">dashboard</i>Задачи</a></li>
            </ul> -->
          </li>
          <li :class="{active: section == 'tags'}" v-on:click="change_section('tags')">
            <a href="#">Метки</a>
          </li>
          <li :class="{active: section == 'notepads'}" v-on:click="change_section('notepads')">
            <a href="#">Блокноты</a>
          </li>
        </ul>
      </div>
    </nav>
    <a class="btn-floating btn-large waves-effect waves-light red add_btn"
      v-on:click="show_add_tag_form" id="add_tag" v-if="section == 'tags'"
      :class="{hidden: tags.add_button_hidden}">
      <i class="material-icons">add</i>
    </a>
    <a class="btn-floating btn-large waves-effect waves-light red add_btn"
      v-on:click="show_add_note_form" id="add_note" v-if="section == 'notes'"
      :class="{hidden: notes.add_button_hidden}"
      >
      <i class="material-icons">add</i>
    </a>
    <tag-form :form="tags.form"
      v-on:submit="tag_form_ok" v-on:cancel="tag_form_cancel" />
    <note-form :form="notes.form"
      v-on:submit="note_form_ok" v-on:cancel="note_form_cancel" />
    <load-screen :visible="loadscreen_visible" />

    
    <div id="filter_records_modal" class="modal" v-if="section == 'notes'">
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
    </div>
  

  </div>
</template>

<script>

import _ from 'lodash'

import LoadScreen from './components/LoadScreen.vue'
import NoteItem from './components/NoteItem.vue'
import NoteForm from './components/NoteForm.vue'
import TagItem from './components/TagItem.vue'
import TagForm from './components/TagForm.vue'

export default {
  name: 'app',
  components: {
    "load-screen": LoadScreen,
    'note-item': NoteItem,
    'note-form': NoteForm,
    'tag-item': TagItem,
    'tag-form': TagForm,
  },

  data: function() {
    var data = {
      loadscreen_visible: true,
      section: "tags",
      notes: {
        add_button_hidden: false,
        form: {
          id: null,
          text: "",
          action: "",
          tags: [],
          visible: false,
        },
        order_by_timestamp: "asc",
        filter: {
          text: "",
          tags: "",
          timestamp_from: null,
          timestamp_to: null,
        },
        items: [],
      },
      tags: {
        add_button_hidden: false,
        form: {
          id: null,
          visible: false,
          text: "",
          action: "",
        },
        search: '',
        footer: {
          show: false,
          found: 66,
        },
        items: [],
      },
      notes_tags: {
        
      },
    };
    var k;
    for(k = 0; k < 20; k++) {
      data.tags.items.push(
        {
          "checked": false,
          "id": k,
          "name": "Задачи " + k,
          "count": Math.floor(Math.random() * 35 + 10),
          "hidden": false,
        }
      );
    }
    for(k = 0; k < 20; k++) {
      data.notes.items.push(
        {
          // "checked": false,
          "id": k,
          "creation_time": +new Date(),
          "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." + k,
          "hidden": false,
        }
      );
    }
    return data;
  },
  watch: {
    "tags.items": {
      "handler": function() {
        var selected = [];
        var k, item;
        for(k = 0; k < this.tags.items.length; k++) {
          item = this.tags.items[k];
          if(item.checked) {
            selected.push(item.id);
          }
        }
        this.tags.footer.show = selected.length > 0;
      },
      deep: true,
    },
  },
  computed: {
    filtered_tags: function() {
      if(this.tags.search == "") {
        return this.tags.items;
      }
      var result = [];
      var re = new RegExp(this.tags.search, "i");
      var k, item;
      for(k = 0; k< this.tags.items.length; k++) {
        item = this.tags.items[k];
        if(re.test(item.name)) {
          result.push(item);
        }
      }
      return result;
    },
  },
  mounted: function() {
    window.$('.sidenav').sidenav();
    window.M.Modal.init(document.body.querySelectorAll('.modal:not(.no-autoinit)'));
    // $('.parallax').parallax();
    this.loadscreen_visible = false;
  },
  methods: {
    change_section: function(section) {
      this.section = section;
    },

    show_edit_note_form: function(note_id) {
      var note = _.find(this.notes.items, {id: note_id});
      if(note != null) {
        this.notes.form.id = note_id;
        this.notes.form.text = note.text;
        this.notes.form.action = "edit";
        this.notes.form.visible = true;
      }
    },
    hide_note: function(note_id) {
      var note_index = _.findIndex(this.notes.items, {id: note_id});
      this.notes.items[note_index].hidden = true;
    },
    show_note: function(note_id) {
      var note_index = _.findIndex(this.notes.items, {id: note_id});
      this.notes.items[note_index].hidden = false;
    },
    remove_note : function(note_id) {
      var note_index = _.findIndex(this.notes.items, {id: note_id});
      this.notes.items.splice(note_index, 1);
    },


    remove_tag: function(tag_id) {
      var tag_index = _.findIndex(this.tags.items, {id: tag_id});
      this.tags.items.splice(tag_index, 1);
    },
    hide_tag: function(tag_id) {
      var tag_index = _.findIndex(this.tags.items, {id: tag_id});
      this.tags.items[tag_index].hidden = true;
    },
    show_tag: function(tag_id) {
      var tag_index = _.findIndex(this.tags.items, {id: tag_id});
      this.tags.items[tag_index].hidden = false;
    },
    filter_tags: function() {
      // console.log("filter_tags");
    },
    tags_search_clear: function() {
      this.tags.search = "";
    },
    show_edit_tag_form: function(id) {
      var tag = _.find(this.tags.items, {id: id});
      if(tag != null) {
        this.tags.form.id = id;
        this.tags.form.text = tag.name;
        this.tags.form.action = "edit";
        // this.tags.form.visible = false;
        this.tags.form.visible = true;
      }
    },
    show_add_tag_form: function() {
      this.tags.form.text = "";
      this.tags.form.action = "add";
      // this.tags.form.visible = false;
      this.tags.form.visible = true;
    },
    show_add_note_form: function() {
      this.notes.form.text = "";
      this.notes.form.action = "add";
      // this.show_tag_form();
      this.notes.form.visible = true;
    },
    tag_form_ok: function() {
      if(this.tags.form.action == "add") {
        var item = {
          check: false,
          id: +(new Date()),
          name: this.tags.form.text,
          count: 0,
          hidden: false,
        };
        this.tags.items.push(item);
      }
      if(this.tags.form.action == "edit") {
        var tag = _.find(this.tags.items, {id: this.tags.form.id});
        if(tag != null) {
          tag.name = this.tags.form.text;
        }
      }
      this.tags.form.visible = false;
    },
    tag_form_cancel: function() {
      this.tags.form.visible = false;
    },
    note_form_ok: function() {
      if(this.notes.form.action == "add") {
        var item = {
          id: +(new Date()),
          creation_time: +(new Date()),
          text: this.notes.form.text,
          count: 0,
          hidden: false,
        };
        this.notes.items.push(item);
      }
      if(this.notes.form.action == "edit") {
        var note = _.find(this.notes.items, {id: this.notes.form.id});
        if(note != null) {
          note.text = this.notes.form.text;
        }
      }
      this.notes.form.visible = false;
    },
    note_form_cancel: function() {
      this.notes.form.visible = false;
    },
  }

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
