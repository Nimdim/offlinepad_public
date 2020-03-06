<template>
  <div id="app" v-bind:class="{show_footer: tags.footer.show}">
    <ul id="dropdown1" class="dropdown-content">
      <li><a href="#!">Все</a></li>
      <!-- <li class="divider"></li>
      <li><a href="#!">Разбор</a></li>
      <li><a href="#!">Задачи</a></li> -->
    </ul>

    <ul id="dropdown_notepad" class="dropdown-content">
      <li v-for="menu_item in notepad_controls" v-bind:key="menu_item.id">
        <a href="#!" v-on:click="notepad_menu(menu_item.id)">{{menu_item.name}}</a>
      </li>
    </ul>

    <ul class="collection notes_extended_filter" v-if="(section == 'notes') && show_notes_filter" style="position: fixed; width: 100%; z-index: 2; max-width: unset; background: #29b6f6;" :style="{'top': (header_bottom) + 'px'}">
      <li>
        <p style="max-width: 800px; margin: 15px auto; padding: 0px 20px;">
          <span v-for="(tag, index) in notes_filter_tags" :key="tag.id" class="chip">
            <select class="browser-default" v-model="notes_filter_tags[index]">
              <option value="0" disabled selected>Выберите</option>
              <option v-for="global_tag in all_tags" :key="global_tag.id"
                :value="global_tag.id" :selected="tag == global_tag.id">
                {{global_tag.name}}
              </option>
            </select>
            <font-awesome-icon icon="trash"
              @click="delete_tag(index)"/>
          </span>
          <span class="chip"
            @click="add_tag">
            
            <font-awesome-icon icon="plus" />
          </span>
        </p>
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

    <nav class="light-blue lighten-1 header" role="navigation" ref="header">
      <div class="nav-wrapper container"><!-- <a href="#!" class="brand-logo">Органайзер</a> -->

        <a href="#" data-target="nav-mobile" class="sidenav-trigger">
          <font-awesome-icon class="nav-icon" icon="bars" />
        </a>

        <ul id="tags_filter">
          <li class="search_li">
            <div class="input-field">
              <input id="search" type="search" v-model="fast_search" required>
              <label class="label-icon" for="search">
                <font-awesome-icon class="nav-icon" icon="search" />
              </label>
              <font-awesome-icon icon="times" @click="fast_search = ''" />
            </div>
          </li>
        </ul>
        <font-awesome-icon v-if="sorting_order_asc"
          icon="sort-amount-up"
          class="nav-icon"
          @click="sorting_order_asc = !sorting_order_asc" />
        <font-awesome-icon v-else
          icon="sort-amount-down-alt"
          class="nav-icon"
          @click="sorting_order_asc = !sorting_order_asc" />

        <ul class="right hide-on-med-and-down desktop_menu">
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a>
              Записи
            </a>
          </li>
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a style="padding: 0px 5px;">
              <font-awesome-icon icon="caret-down" style="height: 64px;" class="right" v-on:click.stop="" />
            </a>
          </li>
          <li :class="{active: section == 'tags'}" v-on:click="change_section('tags')">
            <a href="#">Метки</a>
          </li>
        </ul>

        <a v-if="section == 'notes'"
          class="btn-floating btn-small waves-effect waves-light"
          :class="{'blue': (notes_filter_tags.length == 0), 'red': (notes_filter_tags.length > 0)}"
          @click="show_notes_filter = !show_notes_filter"
          style="z-index: 1001; position: fixed; transition: unset; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); left: 50%;"
          :style="{'top': (header_bottom) + 'px'}"
          >
          <font-awesome-icon v-if="!show_notes_filter"
            icon="angle-down" />
          <font-awesome-icon v-else
            icon="angle-up" />
        </a>

        <ul id="nav-mobile" class="sidenav" style="z-index: 1003;" ref="nav_mobile">
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a href="#">Записи</a>
            <ul>
              <li><a href="#!"><font-awesome-icon class="mobile-menu-icon" icon="th" />Все</a></li>
              <!-- <li><a href="#!"><font-awesome-icon class="mobile-menu-icon" icon="th" />Разбор</a></li>
              <li><a href="#!"><font-awesome-icon class="mobile-menu-icon" icon="th" />Задачи</a></li> -->
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
      :class="{hidden: add_button_hidden}"
      @click="show_add_tag_form"
      id="add_tag">
      <font-awesome-icon icon="plus" />
    </a>
    <a v-if="section == 'notes'"
      class="btn-floating btn-large waves-effect waves-light red add_btn"
      :class="{hidden: add_button_hidden}"
      @click="show_add_note_form" id="add_note"
      >
      <font-awesome-icon icon="plus" />
    </a>
    <transition name="fade">
      <warning-screen
        v-if="warningscreen_visible"
        @accept="warningscreen_visible=false" />
    </transition>
    <transition name="fade">
      <load-screen v-if="loadscreen_visible" />
    </transition>
  </div>
</template>

<script>

import _ from 'lodash'
import moment from 'moment'
moment.locale("ru");

import LoadScreen from './components/LoadScreen.vue'
import WarningScreen from './components/WarningScreen.vue'
import NoteItem from './components/NoteItem.vue'
import TagItem from './components/TagItem.vue'

import VariableStorage from "./js/variable_storage.js"
import Notepad from './js/notepad.js'

var notepad = new Notepad(VariableStorage);

export default {
  name: 'app',
  components: {
    "load-screen": LoadScreen,
    "warning-screen": WarningScreen,
    'note-item': NoteItem,
    'tag-item': TagItem,
  },

  data: function() {
    var data = {
      notepad_controls: [
        // {id: "create", name: "Создать"},
        // {id: "import", name: "Импорт"},
        // {id: "open", name: "Открыть"},
      ],
      loadscreen_visible: true,
      warningscreen_visible: true,
      notes_filter_tags: [],
      section: "notes",
      fast_search: "",
      sorting_order_asc: true,
      add_button_hidden: false,
      show_notes_filter: false,
      header_top: 0,
      header_bottom: 0,
      notes: {
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

    "section": function(section) {
      let filter;
      if(section == "tags") {
        filter = notepad.get_tags_filter();
        this.fast_search = filter.name;
        this.sorting_order_asc = filter.sorting_asc;
      } else if (section == "notes") {
        filter = notepad.get_notes_filter();
        this.fast_search = filter.text;
        this.sorting_order_asc = filter.sorting_asc;
      }
    },

    "notes_filter_tags": function(value) {
      notepad.set_notes_filter({
        "tags": value,
      });
    },
  
    "fast_search": function(value) {
      if(this.section == "tags") {
        notepad.set_tags_filter({
          "name": value,
        });
      } else if (this.section == "notes") {
        notepad.set_notes_filter({
          "text": value,
        })
      }
    },
  
    "sorting_order_asc": function(asc) {
      if(this.section == "tags") {
        notepad.set_tags_filter({
          "sorting_asc": asc,
        });
      } else if (this.section == "notes") {
        notepad.set_notes_filter({
          "sorting_asc": asc,
        })
      }
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
    this.scroll_init();
    window.M.AutoInit();

    notepad.on("reset_tags", function(tags) {
      debugger
      this.tags.items = this.wrap_tags(tags);
    }.bind(this));
    notepad.on("append_tags", function(tags) {
      this.tags.items.push.apply(this.tags.items, this.wrap_tags(tags));
    }.bind(this));
    notepad.on("all_tags", function(tags) {
      this.all_tags = tags;
    }.bind(this));

    notepad.on("reset_notes", function(notes) {
      debugger
      this.notes.items = this.wrap_notes(notes);
    }.bind(this));
    notepad.on("append_notes", function(notes) {
      this.notes.items.push.apply(this.notes.items, this.wrap_notes(notes));
    }.bind(this));

    notepad.on("reset_filter", function(filter) {
      this.notes_filter_tags = filter.notes.tags;
      if(this.section == "notes") {
        this.sorting_order_asc = filter.notes.sorting_asc;
        this.fast_search = filter.notes.text;
      } else if(this.section == "tags") {
        this.sorting_order_asc = filter.tags.sorting_asc;
        this.fast_search = filter.tags.name;
      } else {
        throw new Error("error");
      }
    }.bind(this));
    notepad.create();
    notepad._storage.create({
        type: "notepad",
        name: "Дневник",
    });
    let welcome_tag = notepad._storage.create({
        type: "tag",
        name: "добро пожаловать",
    });
    let lesson_tag = notepad._storage.create({
        type: "tag",
        name: "обучение",
    });
    let welcome_note = notepad._storage.create({
        type: "note",
        text: "Добро пожаловать, это первая запись вашего дневника.",
        created_at: + new Date(),
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: welcome_tag,
        note_id: welcome_note,
    });
    let lesson_note1 = notepad._storage.create({
        type: "note",
        text: "Наверху вы видите строку быстрого поиска по содержимому. При помощи нее вы можете отфильтровать элементы, которые содержат введенный текст.",
        created_at: + new Date(),
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: lesson_tag,
        note_id: lesson_note1,
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: welcome_tag,
        note_id: lesson_note1,
    });

    let lesson_note2 = notepad._storage.create({
        type: "note",
        text: "Правее находится кнопка сортировки. Для записей сортировка выполняется по дате создания, а для меток - по названию.",
        created_at: + new Date(),
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: lesson_tag,
        note_id: lesson_note2,
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: welcome_tag,
        note_id: lesson_note2,
    });

    let lesson_note3 = notepad._storage.create({
        type: "note",
        text: "Еще правее находятся кнопки переключения разделов: Записи и Метки. Если вы открыли сайт с мобильного телефона, то не увидите этих кнопок - они доступны в меню в левой части экрана, которое открывается при проведении пальцем слева направо.",
        created_at: + new Date(),
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: lesson_tag,
        note_id: lesson_note3,
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: welcome_tag,
        note_id: lesson_note3,
    });

    let lesson_note4 = notepad._storage.create({
        type: "note",
        text: "Для добавления новой записи или метки нажмите красную круглую кнопку в правом нижнем углу. Редактирование и удаление выполняется нажатием на соответствующие кнопки в самих записях или метках.",
        created_at: + new Date(),
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: lesson_tag,
        note_id: lesson_note4,
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: welcome_tag,
        note_id: lesson_note4,
    });

    let lesson_note5 = notepad._storage.create({
        type: "note",
        text: "Теперь вы знаете все необходимое. Не забывайте, что приложение все еще находится в разработке и при закрытии страницы все введенные данные не сохранятся.",
        created_at: + new Date(),
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: lesson_tag,
        note_id: lesson_note5,
    });
    notepad._storage.create({
        type: "tag_note",
        tag_id: welcome_tag,
        note_id: lesson_note5,
    });
    notepad._load_data();
    notepad._reset_state();

    setTimeout(
      function() {this.loadscreen_visible = false;}.bind(this),
      1000);
  },
  methods: {
    scroll_init: function() {
      var currenct_scrolltop = window.scrollY;
      var header_top = 0;
      var header = this.$refs.header;
      var old_header_height;
      var header_height = header.clientHeight;
      old_header_height = header_height;
      window.addEventListener("resize", function() {
        old_header_height = header_height;
        header_height = header.clientHeight;
        on_scroll();
      });
      let on_scroll = function() {
        var scroll = window.scrollY;
        var delta = scroll - currenct_scrolltop;
        header_top -= delta;
        if(header_top + old_header_height == 0) {
          header_top = - header_height;
        }
        if(header_top < -header_height) {
          header_top = -header_height;
          this.add_button_hidden = true;
        }
        if(header_top > 0) {
          header_top = 0;
          this.add_button_hidden = false;
        }
        header.style.top = header_top + "px";
        this.header_top = header_top;
        this.header_bottom = header_top + header_height;
        currenct_scrolltop = scroll;
      }.bind(this);
      window.document.addEventListener("scroll", on_scroll);
      on_scroll();
    },

    "add_tag": function() {
      this.notes_filter_tags.push(0);
    },
    
    "delete_tag": function(index) {
      this.notes_filter_tags.splice(index, 1);
    },

    wrap_tags: function(tags) {
      let k, item;
      for(k = 0; k < tags.length; k++) {
        item = tags[k];
        item.name_highlighted = item.name.replace(new RegExp(this.fast_search, "g"), "<b>" + this.fast_search + "</b>");
        item.checked = false;
        item.edit_state = false;
      }
      return tags;
    },

    wrap_notes: function(notes) {
      let k, item;
      for(k = 0; k < notes.length; k++) {
        item = notes[k];
        item.text_highlighted = item.text.replace(new RegExp(this.fast_search, "g"), "<b>" + this.fast_search + "</b>");
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
      let menu = window.M.Sidenav.getInstance(this.$refs.nav_mobile);
      menu.close();
      this.section = section;
    },

    filter_tags: function() {
      // console.log("filter_tags");
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
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
  opacity: 0;
}
</style>
