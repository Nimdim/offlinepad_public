<template>
  <div id="app" v-bind:class="{show_footer: tags.footer.show}">
    <ul id="dropdown1" class="dropdown-content">
      <li><a href="#!">Все</a></li>
      <li class="divider"></li>
      <li><a href="#!">Разбор</a></li>
      <li><a href="#!">Задачи</a></li>
    </ul>
  
    <ul id="dropdown_notepad" class="dropdown-content">
      <li v-for="menu_item in notepad_controls" v-bind:key="menu_item.id">
        <a href="#!" v-on:click="notepad_menu(menu_item.id)">{{menu_item.name}}</a>
      </li>
    </ul>

    <ul class="collection tags" v-if="section == 'tags'">
      <tag-item v-for="tag in tags.items" :key="tag.id"
        :tag="tag"
        @submit="submit_tag"
        @cancel="cancel_tag"
        @delete="remove_tag" />
    </ul>

    <ul class="collection records" v-if="section == 'notes'">
      <note-item v-for="note in notes.items" :key="note.id"
        :note="note"
        :tags="all_tags"
        @submit="submit_note"
        @cancel="cancel_note"
        @delete="remove_note"
        />
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

        <ul id="tags_filter">
          <li class="search_li">
            <div class="input-field">
              <input id="search" type="search" v-model="tags.search" required>
              <label class="label-icon" for="search"><i class="material-icons">search</i></label>
              <i class="material-icons" v-on:click="tags_search_clear">close</i>
            </div>
          </li>
        </ul>
        <i class="material-icons sort-icon">sort</i>

        <ul class="right hide-on-med-and-down desktop_menu">
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a>
              Записи
              <i class="material-icons right dropdown-trigger separate-dropdown" href="#!" data-target="dropdown1" v-on:click.stop="">arrow_drop_down</i>
            </a>
          </li>
          <!-- <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a href="#">Записи</a>
          </li> -->
          <li :class="{active: section == 'tags'}" v-on:click="change_section('tags')">
            <a href="#">Метки</a>
          </li>
          <li>
            <a href="#" class="dropdown-trigger" data-target="dropdown_notepad">
              Блокнот
              <i class="material-icons right" href="#!">arrow_drop_down</i>
            </a>
          </li>
        </ul>

        <ul id="nav-mobile" class="sidenav">
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a href="#">Записи</a>
            <ul>
              <li><a href="#!"><i class="material-icons">dashboard</i>Разбор</a></li>
              <li><a href="#!"><i class="material-icons">dashboard</i>Задачи</a></li>
            </ul>
          </li>
          <li :class="{active: section == 'tags'}" v-on:click="change_section('tags')">
            <a href="#">Метки</a>
          </li>
          <li class="divider"></li>
          <li v-for="menu_item in notepad_controls" v-on:click="notepad_menu(menu_item.id)" v-bind:key="menu_item.id">
            <a href="#">{{menu_item.name}}</a>
          </li>
        </ul>
      </div>
    </nav>
    <a v-if="section == 'tags'"
      class="btn-floating btn-large waves-effect waves-light red add_btn"
      :class="{hidden: tags.add_button_hidden}"
      @click="show_add_tag_form"
      id="add_tag">
      <i class="material-icons">add</i>
    </a>
    <a v-if="section == 'notes'"
      class="btn-floating btn-large waves-effect waves-light red add_btn"
      :class="{hidden: notes.add_button_hidden}"
      @click="show_add_note_form" id="add_note"
      >
      <i class="material-icons">add</i>
    </a>
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
import TagItem from './components/TagItem.vue'

import VariableStorage from "./js/variable_storage.js"
import Notepad from './js/notepad.js'

var notepad = new Notepad(VariableStorage);

export default {
  name: 'app',
  components: {
    "load-screen": LoadScreen,
    'note-item': NoteItem,
    'tag-item': TagItem,
  },

  data: function() {
    var data = {
      notepad_controls: [
        {id: "create", name: "Создать"},
        {id: "import", name: "Импорт"},
        {id: "open", name: "Открыть"},
      ],
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
      all_tags: [],
    };
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
    window.M.Dropdown.init(document.body.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'));

    // $('.parallax').parallax();
    this.loadscreen_visible = false;
    notepad.on("reset_tags", function(tags) {
      this.tags.items = this.wrap_tags(tags);
    }.bind(this));
    notepad.on("append_tags", function(tags) {
      this.tags.items.push.apply(this.tags.items, this.wrap_tags(tags));
    }.bind(this));
    notepad.on("all_tags", function(tags) {
      this.all_tags = tags;
    }.bind(this));

    notepad.on("reset_notes", function(notes) {
      this.notes.items = this.wrap_notes(notes);
    }.bind(this));
    notepad.on("append_notes", function(notes) {
      this.notes.items.push.apply(this.notes.items, this.wrap_notes(notes));
    }.bind(this));
    notepad.create();
  },
  methods: {
    wrap_tags: function(tags) {
      let k, item;
      for(k = 0; k < tags.length; k++) {
        item = tags[k];
        item.checked = false;
        item.edit_state = false;
      }
      return tags;
    },

    wrap_notes: function(notes) {
      let k, item;
      for(k = 0; k < notes.length; k++) {
        item = notes[k];
        item.checked = false;
        item.edit_state = false;
      }
      return notes;
    },

    submit_tag: function(data) {
      if(data.id == "__new_item__") {
        notepad.create_tag(data.name);
      } else {
        notepad.edit_tag(data.id, data.name);
        data.edit_state = false;
      }
    },
    cancel_tag: function(data) {
      if(data.id == "__new_item__") {
        this.tags.items.shift();
      } else {
        data.edit_state = false;
        data.name = data._old_name;
      }
    },
    remove_tag: function(tag_id) {
      notepad.delete_tag(tag_id);
    },

    submit_note: function(data) {
      if(data.id == "__new_item__") {
        notepad.create_note(data.text, + new Date(), data.tags);
      } else {
        notepad.edit_note(data.id, data.text, data.tags);
        data.edit_state = false;
      }
    },
    cancel_note: function(data) {
      if(data.id == "__new_item__") {
        this.notes.items.shift();
      } else {
        data.edit_state = false;
        data.text = data._old_text;
        data.tags = data._old_tags;
      }
    },
    remove_note: function(note_id) {
      notepad.delete_note(note_id);
    },

    notepad_menu: function(command) {
      console.log("command", command);
      switch(command) {
        case "create":
          notepad.create();
          break;
        case "import":
          notepad.import();
          break;
        case "open":
          notepad.open();
          break;
      }
    },
    change_section: function(section) {
      this.section = section;
    },

    filter_tags: function() {
      // console.log("filter_tags");
    },
    tags_search_clear: function() {
      this.tags.search = "";
    },
    show_add_tag_form: function() {
      this.tags.items.unshift({
        "id": "__new_item__",
        "edit_state": true,
        "name": "Новая метка",
        "count": 0,
      })
    },
    show_add_note_form: function() {
      this.notes.items.unshift({
        "id": "__new_item__",
        "tags": [],
        "checked": false,
        "edit_state": true,
        "text": "Новая запись",
        "creation_time": + new Date(),
      })
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
