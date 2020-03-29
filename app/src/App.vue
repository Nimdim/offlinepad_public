<template>
  <div id="app">
    <popup
      ref="notes_popup"
      :items="note_filters"
      @delete="delete_note_filter($event)"
    />
    <popup
      ref="notepad_popup"
      :items="active_notepad_controls"
      @click="notepad_menu"
    />

    <input type="file" ref="upload" style="display:none;" @change="do_upload" />

    <notepad-empty-screen v-if="!notepad_working" />
    <notepad-delete-screen  v-if="notepad_delete_mode"
      @submit="notepad_delete"
      @cancel="notepad_delete_mode = false"
    />

    <ul v-if="(section == 'notes') && show_notes_filter"
      class="collection notes_extended_filter"
      style="position: fixed; width: 100%; z-index: 2; max-width: unset; background: #29b6f6;"
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
            class="validate filter_name"
            :class="{'error': new_note_filter.error}"
            style="width: calc(100% - 108px); padding-left: 5px; height: 2em;"
            v-model="new_note_filter.name"
            @keyup="new_note_filter.error = null"
          />
          <a class="waves-effect waves-teal btn-small btn-flat right tag_delete_btn"
            style="color: white;"
            v-on:click.prevent="cancel_note_filter">
            <font-awesome-icon icon="times-circle" />
          </a>
          <a class="waves-effect waves-teal btn-small right tag_delete_btn"
            style="margin-right: 12px;"
            v-on:click.prevent="add_note_filter">
            <font-awesome-icon icon="save" />
          </a>
        </p>
      </li>
    </ul>

    <ul v-if="section == 'tags' && notepad_working && !notepad_delete_mode"
      class="collection tags"
    >
      <tag-item v-for="tag in tags.items" :key="tag.id"
        :tag="tag"
        @submit="submit_tag"
        @cancel="cancel_tag"
        @delete="remove_tag" />
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

        <ul id="nav-mobile" class="sidenav" style="z-index: 1003;" ref="nav_mobile">
          <li :class="{active: section == 'notes'}" v-on:click="change_section('notes')">
            <a href="#">Записи</a>
            <ul>
              <note-filter-item v-for="note_filter in note_filters" :key="note_filter.id"
                :note_filter="note_filter"
                @click="note_filter_click(note_filter.tags)"
                @delete="delete_note_filter(note_filter.id)"
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
      @click="add_note" id="add_note"
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
import _ from 'lodash'
moment.locale("ru");

import LoadScreen from './components/LoadScreen.vue'
import WarningScreen from './components/WarningScreen.vue'
import NotepadDeleteScreen from './components/NotepadDeleteScreen.vue'
import NotepadEmptyScreen from './components/NotepadEmptyScreen.vue'
import NoteItem from './components/NoteItem.vue'
import NoteFilterItem from './components/NoteFilterItem.vue'
import TagItem from './components/TagItem.vue'
import TagsList from './components/TagsList.vue'
import Popup from './components/Popup.vue'

import sanitize_html from 'sanitize-html'

sanitize_html.defaults.allowedTags = [];
 
import LocalStorage from "./js/local_storage.js"
import Notepad from './js/notepad.js'
import PartialFileReader from './js/partial_file_reader.js'

let sw_communicate = function(data) {
  let promise = new Promise(function(resolve) {
    let messageChannel = new MessageChannel();
    let replyHandler = function(event) {
      resolve([event.data, messageChannel.port1]);
    };
    // messageChannel.port1.addEventListener('message', replyHandler);
    messageChannel.port1.onmessage = replyHandler;
    navigator.serviceWorker.controller.postMessage(data, [messageChannel.port2]);
  });
  return promise;
};

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
    NoteItem,
    NoteFilterItem,
    TagItem,
    TagsList,
    Popup,
  },

  data: function() {
    var data = {
      note_filters: [],

      new_note_filter: {
        name: "",
        error: null,
      },

      section: "notes",

      add_note_filter_show: false,
      loadscreen_visible: true,
      warningscreen_visible: true,

      notes_filter_tags: [],
      fast_search: "",
      sorting_order_asc: true,

      add_button_hidden: false,

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

    setTimeout(
      function() {this.loadscreen_visible = false;}.bind(this),
      1000);
  },
  methods: {
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
        if(this.$refs.note_items != null) {
          let current_item_index = -1;
          for(let k = 0; k < this.$refs.note_items.length; k++) {
            let note_item = this.$refs.note_items[k];
            if(currenct_scrolltop - header_height < note_item.$el.offsetTop) {
              current_item_index = k;
              break;
            }
          }
          current_item_index;
        }
        //
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
      // window.document.getElementById("app").addEventListener("scroll", on_scroll);
      on_scroll();
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

    download: function(filename, text) {
      var element = window.document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      window.document.body.appendChild(element);

      element.click();

      window.document.body.removeChild(element);
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
    cancel_tag: function(data) {
      if(data.id == "__new_item__") {
        this.tags.items.shift();
      }
    },
    remove_tag: function(tag_id) {
      notepad.delete_tag(tag_id);
    },

    submit_note: function(data) {
      if(data.id == "__new_item__") {
        notepad.create_note(data.text, data.creation_time, data.tags);
      } else {
        notepad.edit_note(data.id, data.text, data.creation_time, data.tags);
      }
    },
    cancel_note: function(data) {
      if(data.id == "__new_item__") {
        this.notes.items.shift();
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
          // let stamp = moment(+ new Date()).format("YYYY-MM-DD HH:mm:ss");
          // let filename = "data_" + stamp + ".txt";
          // let data = JSON.stringify(notepad.export());
          // this.download(filename, data);

          // let wnd = window.open("/download", "_blank");
          sw_communicate({command: "new_download"}).then(function(info) {
            // debugger
            let download_id = info[0];
            let port = info[1];
            console.log(download_id);
            console.log(port);
            // wnd.location = "/download?id=" + download_id;
            location.href="/download?id=" + download_id;
            // fetch("/download?id=" + download_id);
            // setTimeout(
            //   function() {
            //     port.postMessage("123");
            //     // port.postMessage("123");
            //     // port.postMessage("123");
            //     // port.postMessage("123");
            //     // port.postMessage("123");
            //     // port.postMessage("end");
            //   },
            //   1000
            // )
            // port.
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
      this.tags.items.unshift({
        "id": "__new_item__",
        "edit_state": true,
        "error_existing_name": false,
        "name": "",
        "count": 0,
      })
    },
    
    add_note: function() {
      this.notes.items.unshift({
        "id": "__new_item__",
        "tags": _.cloneDeep(this.notes_filter_tags),
        "checked": false,
        "edit_state": true,
        "text": "",
        "creation_time": + new Date(),
      })
    },

    add_note_filter: function() {
      if(this.new_note_filter.name == "") {
        this.new_note_filter.error = true;
        this.$refs.new_note_filter_name.focus();
      } else {
        notepad.create_note_filter(this.new_note_filter.name, this.notes_filter_tags);
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
    }
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
