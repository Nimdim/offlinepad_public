<template>
  <div id="app">
    <popup
      ref="notes_popup"
      :items="notes_filters"
    />
    <popup
      ref="notepad_popup"
      :items="active_notepad_controls"
      @click="notepad_menu"
    />

    <div style="width: 100%; height: 100%; position: fixed; left: 0px; top: 0px;" v-if="!notepad_working">
      <span class="center_span">
        <font-awesome-icon icon="box-open" style="width: 200px; height: 200px; color: gray;" />
      </span>
    </div>

    <div style="width: 100%; height: 100%; position: fixed; left: 0px; top: 0px;" v-if="notepad_delete_mode">
      <span class="center_span">
        <p>при заркытии блокнота все данные будут потеряны</p>
        <a class="waves-effect waves-teal btn-small red"
          v-on:click.prevent.stop="notepad_delete">
          закрыть
        </a>
        <a class="waves-effect waves-teal btn-small "
          @click.prevent.stop="notepad_delete_mode = false">
          отмена
        </a>        
      </span>
    </div>

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
            @click="add_tag_to_filter">
            
            <font-awesome-icon icon="plus" />
          </span>
        </p>
      </li>
    </ul>

    <ul class="collection tags" v-if="section == 'tags' && notepad_working && !notepad_delete_mode">
      <tag-item v-for="tag in tags.items" :key="tag.id"
        :tag="tag"
        @submit="submit_tag"
        @cancel="cancel_tag"
        @delete="remove_tag" />
    </ul>

    <ul class="collection records" v-if="section == 'notes' && notepad_working && !notepad_delete_mode">
      <note-item v-for="note in notes.items" :key="note.id"
        :note="note"
        :tags="all_tags"
        @submit="submit_note"
        @cancel="cancel_note"
        @delete="remove_note"
        />
    </ul>

    <!-- <div class="tags_footer" v-if="section == 'tags'">
      <p>
        Найдено {{tags.footer.found}} записей
        <a href="#!" class="modal-close waves-effect waves-green btn" v-on:click="filter_tags">Показать</a>
      </p>
    </div> -->

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
            <a
              style="padding: 0px 5px;"
              @click.stop="show_notes_popup($event)"
            >
              <font-awesome-icon
                icon="caret-down"
                style="height: 64px;"
                class="right"
              />
            </a>
          </li>
          <li :class="{active: section == 'tags'}" v-on:click="change_section('tags')">
            <a href="#">Метки</a>
          </li>
          <li>
            <a 
              @click.stop="show_notepad_popup($event)"
            >
              Блокнот
              <font-awesome-icon
                icon="caret-down"
                style="height: 64px; margin-left: 5px;"
                class="right"
              />
            </a>
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
          <li v-for="menu_item in active_notepad_controls" :key="menu_item.id"
            @click="notepad_menu_mob(menu_item.id)"
          >
            <a href="#">{{menu_item.name}}</a>
          </li>
        </ul>
      </div>
    </nav>

    <a v-if="section == 'tags' && notepad_working && !notepad_delete_mode"
      class="btn-floating btn-large waves-effect waves-light red add_btn"
      :class="{hidden: add_button_hidden}"
      @click="add_tag"
      id="add_tag">
      <font-awesome-icon icon="plus" />
    </a>
    <a v-if="section == 'notes' && notepad_working && !notepad_delete_mode"
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

import moment from 'moment'
moment.locale("ru");

import LoadScreen from './components/LoadScreen.vue'
import WarningScreen from './components/WarningScreen.vue'
import NoteItem from './components/NoteItem.vue'
import TagItem from './components/TagItem.vue'
import Popup from './components/Popup.vue'

// import VariableStorage from "./js/variable_storage.js"
import LocalStorage from "./js/local_storage.js"
import Notepad from './js/notepad.js'

var notepad = new Notepad(new LocalStorage());

export default {
  name: 'app',
  components: {
    LoadScreen,
    WarningScreen,
    NoteItem,
    TagItem,
    Popup,
  },

  data: function() {
    var data = {
      notes_filters: [
        {
          "id": "all",
          "name": "Все",
        },
      ],
      notepad_controls: [
        {id: "create", name: "Создать"},
        {id: "open", name: "Открыть"},
        {id: "save", name: "Сохранить"},
        {id: "close", name: "Закрыть"},
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
      notepad_working: false,
      notepad_delete_mode: false,
      notes: {
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
        search: '',
        items: [],
      },
      all_tags: [],
    };
    return data;
  },
  watch: {
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
    "active_notepad_controls": function() {
      if(this.notepad_working) {
        return this.notepad_controls.slice(3, 4);
      } else {
        return this.notepad_controls.slice(0, 1);
      }
    },
  },

  mounted: function() {
    this.scroll_init();
    window.M.AutoInit();

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

    notepad.on("working", function(working) {
      this.notepad_working = working;
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

    notepad.sync();

    setTimeout(
      function() {this.loadscreen_visible = false;}.bind(this),
      1000);
  },
  methods: {
    notepad_delete: function() {
      notepad.close();
      this.notepad_delete_mode = false;
    },

    create_notepad_data: function() {
      notepad._storage.create({
          type: "notepad",
          name: "Дневник",
      });
      let welcome_tag = notepad.create_tag("добро пожаловать");
      let lesson_tag = notepad.create_tag("обучение");

      notepad.create_note(
          "Теперь вы знаете все необходимое. Не забывайте, что приложение все еще находится в разработке и при закрытии страницы все введенные данные не сохранятся.",
          + new Date(),
          [welcome_tag, lesson_tag]
      );
      notepad.create_note(
          "Для добавления новой записи или метки нажмите красную круглую кнопку в правом нижнем углу. Редактирование и удаление выполняется нажатием на соответствующие кнопки в самих записях или метках.",
          + new Date() + 1,
          [welcome_tag, lesson_tag]
      );
      notepad.create_note(
          "Еще правее находятся кнопки переключения разделов: Записи и Метки. Если вы открыли сайт с мобильного телефона, то не увидите этих кнопок - они доступны в меню в левой части экрана, которое открывается при проведении пальцем слева направо.",
          + new Date() + 2,
          [welcome_tag, lesson_tag]
      );
      notepad.create_note(
          "Правее находится кнопка сортировки. Для записей сортировка выполняется по дате создания, а для меток - по названию.",
          + new Date() + 3,
          [welcome_tag, lesson_tag]
      );
      notepad.create_note(
          "Наверху вы видите строку быстрого поиска по содержимому. При помощи нее вы можете отфильтровать элементы, которые содержат введенный текст.",
          + new Date() + 4,
          [welcome_tag, lesson_tag]
      );
      notepad.create_note(
          "Добро пожаловать, это первая запись вашего дневника.",
          + new Date() + 5,
          [welcome_tag]
      );
    },

    show_notes_popup: function(e) {
      let el = e.currentTarget;
      let rect = el.getBoundingClientRect();
      this.$refs.notes_popup.toggle(rect.right, this.header_bottom);
    },

    show_notepad_popup: function(e) {
      let el = e.currentTarget;
      let rect = el.getBoundingClientRect();
      this.$refs.notepad_popup.toggle(rect.right, this.header_bottom);
    },

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

    "add_tag_to_filter": function() {
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
        item.edit_state = false;
      }
      return tags;
    },

    wrap_notes: function(notes) {
      let k, item;
      for(k = 0; k < notes.length; k++) {
        item = notes[k];
        item.text_highlighted = item.text.replace(new RegExp(this.fast_search, "g"), "<b>" + this.fast_search + "</b>");
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

    notepad_menu_mob: function(command) {
      this.close_nav();
      this.notepad_menu(command);
    },

    notepad_menu: function(command) {
      switch(command) {
        case "create":
          notepad.create();
          this.create_notepad_data();
          break;
        case "open":
          notepad.open();
          break;
        case "save":
          notepad.save();
          break;
        case "close":
          this.notepad_delete_mode = true;
          break;
      }
    },

    change_section: function(section) {
      this.close_nav();
      this.section = section;
    },

    close_nav: function() {
      let menu = window.M.Sidenav.getInstance(this.$refs.nav_mobile);
      menu.close();
    },

    filter_tags: function() {
      // console.log("filter_tags");
    },
    add_tag: function() {
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
