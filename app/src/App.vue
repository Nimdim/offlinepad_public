<template>
  <div id="app" class="theme--background-color">
    <popup
      ref="notes_popup"
      :items="note_filters"
      @submit="edit_note_filter($event.id, $event.data)"
      @delete="delete_note_filter($event)"
    />
    <popup
      ref="notepad_popup"
      :items="active_notepad_controls"
      @click="notepad_menu"
    />

    <input type="file" ref="upload" style="display:none;" @change="do_upload" />

    <notepad-empty-screen v-if="!notepad_working"
      @create="notepad_menu('create')"
      @open="notepad_menu('open')"
    />
    <notepad-delete-screen  v-if="notepad_delete_mode"
      @submit="notepad_delete"
      @cancel="notepad_delete_mode = false"
    />

    <ul v-if="(section == 'notes') && show_notes_filter"
      class="notes_extended_filter"
      style="position: fixed; width: 100%; margin: 0; z-index: 2; max-width: unset;"
      :style="{'top': (header_bottom) + 'px'}"
    >
      <li>
        <p style="max-width: 800px; margin: 15px auto; padding: 0px 20px;">
          <tags-list
            :initial_tags="notes_filter_tags"
            :all_tags="all_tags"
            @change="notes_filter_tags = $event"
          />
        </p>
        <p style="max-width: 800px; margin: 15px auto; padding: 0px 20px; color: white;">
          Записей: {{notes.count}}
          <a v-if="!add_note_filter_show"
            class="waves-effect waves-teal btn-small right tag_delete_btn"
            @click.prevent="note_filter_add_gui_show">
            Сохранить как
          </a>
        </p>
        <p style="max-width: 800px; margin: 15px auto; padding: 0px 20px;" v-if="add_note_filter_show">
          <input
            ref="new_note_filter_name"
            placeholder="Введите название раздела"
            type="text"
            class="validate filter_name text-input--standart-style"
            :class="{'error': new_note_filter.error}"
            style="width: calc(100% - 108px); padding-left: 5px;"
            v-model="new_note_filter.name"
            @keyup="new_note_filter.error = null"
          />
          <a class="waves-effect waves-teal btn-small btn-flat right tag_delete_btn"
            style="color: white; position: relative; top: -3px;"
            v-on:click.prevent="cancel_note_filter">
            <font-awesome-icon icon="times-circle" />
          </a>
          <a class="waves-effect waves-teal btn-small right tag_delete_btn"
            style="margin-right: 12px; position: relative; top: -3px;"
            v-on:click.prevent="add_note_filter">
            <font-awesome-icon icon="save" />
          </a>
        </p>
        <span v-if="new_note_filter.error"
          style="margin: 0px;
            color: red;
            font-size: 12px;
            position: relative;
            top: -17px;
            float: left;
            left: 19px;"
        >
          {{new_note_filter.error_text}}
        </span>
      </li>
    </ul>

    <ul v-if="section == 'tags' && notepad_working && !notepad_delete_mode"
      class="collection tags"
    >
      <tag-item v-for="tag in tags.items" :key="tag.id"
        ref="tag_items"
        :tag="tag"
        @submit="submit_tag"
        @cancel="cancel_tag"
        @delete="remove_tag"
        @edit_state_changed="blockerscreen_visible = $event"
      />
    </ul>

    <ul v-if="section == 'notes' && notepad_working && !notepad_delete_mode"
      class="collection records"
    >
      <note-item v-for="note in notes.items" :key="note.id"
        ref="note_items"
        :note="note"
        :tags="all_tags"
        @submit="submit_note"
        @cancel="cancel_note"
        @delete="remove_note"
        @edit_state_changed="blockerscreen_visible = $event"
      />
    </ul>

    <!-- <div class="tags_footer" v-if="section == 'tags'">
      <p>
        Найдено {{tags.footer.found}} записей
        <a href="#!" class="modal-close waves-effect waves-green btn" v-on:click="filter_tags">Показать</a>
      </p>
    </div> -->

    <nav class="header" role="navigation" ref="header">
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

        <ul id="nav-mobile" class="sidenav" style="z-index: 1003;" ref="nav_mobile">
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a href="#">Записи</a>
            <ul>
              <note-filter-item v-for="note_filter in note_filters" :key="note_filter.id"
                :note_filter="note_filter"
                @click="note_filter_click(note_filter.tags)"
                @delete="delete_note_filter(note_filter.id)"
                @submit="edit_note_filter(note_filter.id, $event)"
              />
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
          <li class="divider"></li>
          <li @click="toggle_theme">
            <a href="#" v-if="current_theme == 'light'">
              Цветовое оформление: светлое
            </a>
            <a href="#" v-else>
              Цветовое оформление: темное
            </a>
          </li>
        </ul>

        <a v-if="section == 'notes'"
          class="btn-floating btn-small waves-effect waves-light toggle-extended-filter-btn"
          :class="{'active': (notes_filter_tags.length > 0)}"
          @click="show_notes_filter = !show_notes_filter"
          style="z-index: 1001; position: fixed; transition: unset; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); left: 50%;"
          :style="{'top': (header_bottom) + 'px'}"
          >
          <font-awesome-icon v-if="!show_notes_filter"
            icon="angle-down" />
          <font-awesome-icon v-else
            icon="angle-up" />
        </a>

      </div>
    </nav>

    <transition name="fade">
      <div v-if="update_available"
        class="col s12 m7 message_popup"
        :class="{'editing': update_step != 'initial'}"
      >
        <div class="card horizontal">
          <div class="card-stacked">
            <div class="card-content" v-if="update_step == 'initial'">
              <p>Доступно обновление: {{update_available}}</p>
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
                @click.prevent="update_cancel">
                Отмена
              </a>
              <a class="waves-effect waves-teal btn-small red"
                @click.prevent="update_sw">
                Продолжить
              </a>
            </div>
            <div class="card-content" v-else>
              <p>Обновление</p>
              <span>
                <div class="preloader-wrapper big active">
                  <div class="spinner-layer spinner-blue-only">
                    <div class="circle-clipper left">
                    <div class="circle"></div>
                    </div><div class="gap-patch">
                    <div class="circle"></div>
                    </div><div class="circle-clipper right">
                      <div class="circle"></div>
                    </div>
                  </div>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="update_done != null"
        class="col s12 m7 message_popup"
      >
        <div class="card attention horizontal">
          <div class="card-stacked">
            <div class="card-content">
              <p>
                Обновление выполнено
                <font-awesome-icon
                  class="grey_icon"
                  icon="times"
                  style="margin-left: 10px;"
                  @click.prevent="update_done = null" />
              </p>
              <p>Текущая версия: {{update_done}}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <a v-if="section == 'tags' && notepad_working && !notepad_delete_mode"
      class="btn-floating btn-large waves-effect waves-light red add_btn"
      @click="add_tag"
      id="add_tag">
      <font-awesome-icon icon="plus" />
    </a>
    <a v-if="section == 'notes' && notepad_working && !notepad_delete_mode"
      class="btn-floating btn-large waves-effect waves-light red add_btn"
      @click="add_note" id="add_note"
      >
      <font-awesome-icon icon="plus" />
    </a>
    <transition name="fade">
      <warning-screen
        v-if="warningscreen_visible"
        @accept="warning_accept" />
    </transition>
    <transition name="fade">
      <blocker-screen v-if="blockerscreen_visible"/>
    </transition>
    <features-not-available-screen v-if="features_unawailable" />
    <transition name="fade">
      <load-screen v-if="loadscreen_visible" />
    </transition>
  </div>
</template>

<script>

import moment from 'moment'
import _ from 'lodash'
moment.locale("ru");

import LoadScreen from './components/LoadScreen.vue'
import WarningScreen from './components/WarningScreen.vue'
import NotepadDeleteScreen from './components/NotepadDeleteScreen.vue'
import FeaturesNotAvailableScreen from './components/FeaturesNotAvailableScreen.vue'
import NotepadEmptyScreen from './components/NotepadEmptyScreen.vue'
import BlockerScreen from './components/BlockerScreen.vue'
import NoteItem from './components/NoteItem.vue'
import NoteFilterItem from './components/NoteFilterItem.vue'
import TagItem from './components/TagItem.vue'
import TagsList from './components/TagsList.vue'
import Popup from './components/Popup.vue'

import sanitize_html from 'sanitize-html'

sanitize_html.defaults.allowedTags = [];
 
import LocalStorage from "./js/local_storage.js"
import Notepad from './js/notepad.js'
import sw_api from './js/service_worker.js'
import cookie_api from 'js-cookie'
import PartialFileReader from './js/partial_file_reader.js'

let escapeRegExp = function(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

var notepad = new Notepad(new LocalStorage());

let NOTEPAD_CONTROLS = [
  {id: "create", name: "Создать"},
  {id: "open", name: "Открыть"},
  {id: "save", name: "Сохранить"},
  {id: "close", name: "Закрыть"},
];

export default {
  name: 'app',
  components: {
    LoadScreen,
    WarningScreen,
    NotepadDeleteScreen,
    NotepadEmptyScreen,
    FeaturesNotAvailableScreen,
    BlockerScreen,
    NoteItem,
    NoteFilterItem,
    TagItem,
    TagsList,
    Popup,
  },

  data: function() {
    var data = {
      current_theme: "light",
      features_unawailable: false, // TODO показать скрин с недоступными функциями

      note_index_in_viewspot: 0,
      note_index_add: null,
      tag_index_in_viewspot: 0,
      tag_index_add: null,

      update_available: false,
      update_step: "initial",
      update_done: null,
      note_filters: [],

      new_note_filter: {
        name: "",
        error: null,
      },

      section: "notes",

      add_note_filter_show: false,
      blockerscreen_visible: false,
      loadscreen_visible: true,
      warningscreen_visible: true,

      notes_filter_tags: [],
      fast_search: "",
      sorting_order_asc: true,

      header_hidden: false,

      show_notes_filter: false,

      header_top: 0,
      header_bottom: 0,
      notepad_working: false,
      notepad_delete_mode: false,
      notes: {
        count: 0,
        items: [],
      },
      tags: {
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
      let copy = _.cloneDeep(value);
      copy = _.filter(copy, (item) => item != "0");
      notepad.set_notes_filter({
        "tags": copy,
      });
    },
  
    "fast_search": function(value) {
      value = escapeRegExp(value);
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
        return NOTEPAD_CONTROLS.slice(2, 4);
      } else {
        return NOTEPAD_CONTROLS.slice(0, 2);
      }
    },
    "add_button_hidden": function() {
      return this.header_hidden || this.blockerscreen_visible;
    },
  },

  mounted: function() {
    this.load_theme();
    this.warning_init();
    let promise;
    if(sw_api.is_available()) {
      promise = this.service_worker_init().then((init_data) => {
        if(init_data.updated != null) {
          this.update_done = init_data.updated;
        }
        this.app_init();
      });
    } else {
      this.features_unawailable = true;
      promise = Promise.resolve();
    }
    promise.then(
      () => {
        setTimeout(() => {this.loadscreen_visible = false;}, 1000);
      }
    );
  },
  methods: {

    load_theme: function() {
      let theme = localStorage.getItem("internal_cfg_theme");
      if(theme == null) {
        theme = "light";
      }
      this.set_theme(theme);
      this.current_theme = theme;
    },

    set_theme: function(theme) {
      let theme_element = window.document.getElementById("theme-css");
      if(theme == "light") {
        theme_element.href = "css/light-theme.css";
        this.current_theme = "light";
      } else {
        theme_element.href = "css/dark-theme.css";
        this.current_theme = "dark";
      }
      localStorage.setItem("internal_cfg_theme", this.current_theme)
    },

    toggle_theme: function() {
      if(this.current_theme == "light") {
        this.set_theme("dark");
      } else {
        this.set_theme("light");
      }
    },

    update_cancel: function() {
      this.update_step = 'initial';
      this.blockerscreen_visible = false;
    },

    app_goto_update: function() {
      this.update_step = 'confirm';
      this.blockerscreen_visible = true;
    },

    warning_init: function() {
      let accept = cookie_api.get("alpha_warn_accept");
      if(accept == "1") {
        this.warningscreen_visible = false;
      }
    },

    warning_accept: function() {
      this.warningscreen_visible = false;
      cookie_api.set("alpha_warn_accept", "1");
    },

    service_worker_init: function() {
      sw_api.on(
        "update_available",
        (id) => {
          this.update_available = id;
        }
      );
      return sw_api.init();
    },

    app_init: function() {
      this.scroll_init();
      window.M.AutoInit();
      this.notepad_init();
    },

    notepad_init: function() {
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
      notepad.on("reset_notes_count", function(notes_count) {
        this.notes.count = notes_count;
      }.bind(this));
      notepad.on("append_notes", function(notes) {
        this.notes.items.push.apply(this.notes.items, this.wrap_notes(notes));
      }.bind(this));

      notepad.on("reset_note_filters", function(items) {
        this.note_filters = items;
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
    },

    update_sw: function() {
      this.update_step = "updating";
      sw_api.activate_new_worker();
    },

    notepad_delete: function() {
      notepad.close();
      this.notepad_delete_mode = false;
    },

    note_filter_add_gui_show: function() {
      this.add_note_filter_show = true;
      this.$nextTick(function() {
        this.$refs.new_note_filter_name.focus();
      });
    },

    note_filter_click: function(tags) {
      this.notes_filter_tags = _.cloneDeep(tags);
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
        //
        var delta = scroll - currenct_scrolltop;
        header_top -= delta;
        if(header_top + old_header_height == 0) {
          header_top = - header_height;
        }
        if(header_top < -header_height) {
          header_top = -header_height;
          this.header_hidden = true;
        }
        if(header_top > 0) {
          header_top = 0;
          this.header_hidden = false;
        }
        header.style.top = header_top + "px";
        this.header_top = header_top;
        this.header_bottom = header_top + header_height;
        currenct_scrolltop = scroll;
        //
        let scroll_with_header = scroll + this.header_bottom - header_height - 1;
        this.process_note_items_scroll(scroll_with_header);
        this.process_tag_items_scroll(scroll_with_header);
      }.bind(this);
      window.document.addEventListener("scroll", on_scroll);
      on_scroll();
    },

    process_note_items_scroll: function(scroll_top) {
      if(this.$refs.note_items != null) {
        this.note_index_in_viewspot = this.find_item_in_viewspot(
          scroll_top, this.$refs.note_items);
      }
    },

    process_tag_items_scroll: function(scroll_top) {
      if(this.$refs.tag_items != null) {
        this.tag_index_in_viewspot = this.find_item_in_viewspot(
          scroll_top, this.$refs.tag_items);
      }
    },

    find_item_in_viewspot: function(scroll_top, items) {
      let current_item_index = 0;
      for(let k = 0; k < items.length; k++) {
        let item = items[k];
        if(scroll_top < item.$el.offsetTop) {
          current_item_index = k;
          break;
        }
      }
      return current_item_index;
    },

    wrap_tags: function(tags) {
      let k, item;
      for(k = 0; k < tags.length; k++) {
        item = tags[k];
        let text = sanitize_html(item.name);
        item.name_highlighted = text.replace(new RegExp(this.fast_search, "g"), "<b>" + this.fast_search + "</b>");
        item.error_existing_name = false;
      }
      return tags;
    },

    upload: function() {
      this.$refs.upload.click();
    },

    do_upload: function() {
      let files = this.$refs.upload.files;
      let file = files[0];

      let reader = new PartialFileReader(
        file, function(import_data) {notepad.import(import_data)}
      );
      reader.start();      
    },

    wrap_notes: function(notes) {
      let k, item;
      for(k = 0; k < notes.length; k++) {
        item = notes[k];
        let text = sanitize_html(item.text);
        if(this.fast_search.length > 0) {
          text = text.replace(new RegExp(this.fast_search, "g"), "<b>" + this.fast_search + "</b>");
        }
        item.text_highlighted = text;
      }
      return notes;
    },

    submit_tag: function(data) {
      this.tag_index_add = null;
      if(data.id == "__new_item__") {
        if(notepad.is_tag_with_name_exists(data.name)) {
          data.edit_state = true;
          data.error_existing_name = true;
        } else {
          notepad.create_tag(data.name);
        }
      } else {
        if(notepad.is_tag_with_name_exists(data.name, data.id)) {
          data.edit_state = true;
          data.error_existing_name = true;
        } else {
          notepad.edit_tag(data.id, data.name);
        }
      }
    },

    cancel_tag: function() {
      if(this.tag_index_add != null) {
        this.tags.items.splice(this.tag_index_add, 1);
        this.tag_index_add = null;
      }
    },

    remove_tag: function(tag_id) {
      notepad.delete_tag(tag_id);
    },

    submit_note: function(data) {
      this.note_index_add = null;
      if(data.id == "__new_item__") {
        notepad.create_note(data.text, data.creation_time, data.tags);
      } else {
        notepad.edit_note(data.id, data.text, data.creation_time, data.tags);
      }
    },
    cancel_note: function() {
      if(this.note_index_add != null) {
        this.notes.items.splice(this.note_index_add, 1);
        this.note_index_add = null;
      }
    },
    remove_note: function(note_id) {
      notepad.delete_note(note_id);
    },

    notepad_menu_mob: function(command) {
      this.close_nav();
      this.notepad_menu(command);
    },

    long_str: function() {
      let str = Array(20000000).join("z");
      return str;
    },

    notepad_menu: function(command) {
      switch(command) {
        case "create":
          notepad.create();
          this.create_notepad_data();
          break;
        case "open":
          this.upload();
          break;
        case "save": {
          let stamp = moment(+ new Date()).format("YYYY-MM-DD HH:mm:ss");
          let filename = "data_" + stamp + ".txt";
          let data = JSON.stringify(notepad.export());
          // this.download(filename, data);

          sw_api.new_download(filename, data).then(function(info) {
            let download_id = info[0];
            // let port = info[1];
            // console.log(download_id);
            // console.log(port);
            location.href="/download?id=" + download_id;
            // setTimeout(
            //   function() {
            //     // port.postMessage("123");
            //     // port.postMessage("123");
            //     // port.postMessage("123");
            //     // port.postMessage("123");
            //     // port.postMessage("123");
            //     // port.postMessage("end");
            //   },
            //   1000
            // )
          });

          // const fileStream = streamSaver.createWriteStream('filename.txt'
          // // ,
          // // {
          // //   size: 22, // (optional) Will show progress
          // //   writableStrategy: undefined, // (optional)
          // //   readableStrategy: undefined  // (optional)
          // // }
          // )

          // new Response(this.long_str()).body
          //   .pipeTo(fileStream)
          //   // .then(success, error)
          // // let writer = fileStream.getWriter();
          // // writer.write(this.long_str()).then(function(){
          // //   writer.write(this.long_str()).then(function() {
          // //     // writer.close();
          // //     // fileStream.close();
          // //   });
          // // }.bind(this))
          break;
        }
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
      let new_tag = {
        "id": "__new_item__",
        "edit_state": true,
        "error_existing_name": false,
        "name": "",
        "count": 0,
      };
      this.tag_index_add = this.tag_index_in_viewspot;
      this.tags.items.splice(this.tag_index_add, 0, new_tag);
    },
    
    add_note: function() {
      let new_note = {
        "id": "__new_item__",
        "tags": _.cloneDeep(this.notes_filter_tags),
        "checked": false,
        "edit_state": true,
        "text": "",
        "creation_time": + new Date(),
      };
      this.note_index_add = this.note_index_in_viewspot;
      this.notes.items.splice(this.note_index_add, 0, new_note);
    },

    add_note_filter: function() {
      let name = this.new_note_filter.name;
      let is_exists = notepad.is_note_filter_with_name_exists(name);
      if(is_exists) {
        this.new_note_filter.error = true;
        this.new_note_filter.error_text = "Раздел с таким названием уже существует";
        this.$refs.new_note_filter_name.focus();
      } else if(name == "") {
        this.new_note_filter.error = true;
        this.new_note_filter.error_text = "Введите название раздела";
        this.$refs.new_note_filter_name.focus();
      } else {
        notepad.create_note_filter(name, this.notes_filter_tags);
        this.cancel_note_filter();
      }
    },

    cancel_note_filter: function() {
      this.new_note_filter.name = "";
      this.new_note_filter.error = null;
      this.add_note_filter_show = false;
    },

    delete_note_filter: function(id) {
      notepad.delete_note_filter(id);
    },

    edit_note_filter: function(id, data) {
      let new_name = data.name;
      if(new_name == "") {
        data.edit_state = true;
        data.error = "empty";
      } else if(notepad.is_note_filter_with_name_exists(data.name, data.id)) {
        data.edit_state = true;
        data.error = "existing";
      } else {
        notepad.edit_note_filter(id, new_name);
      }
    }
  }

}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
  opacity: 0;
}
</style>
