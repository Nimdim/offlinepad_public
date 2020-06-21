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

    <notepad-empty-screen v-if="empty_msg"
      :develop_mode="develop_mode"
      :text="empty_msg"
      @test_create="test_create($event)"
    />

    <ul v-if="(section == 'notes') && show_notes_filter"
      class="notes_extended_filter"
      style="position: fixed; width: 100%; margin: 0; z-index: 2; max-width: unset;"
      :style="{'top': (header_bottom) + 'px'}"
    >
      <li>
        <p style="max-width: 800px; margin: 15px auto; padding: 0px 20px;">
          <span v-if="notes_filter_tags.length != 0">
            Фильтр по тегам:<br>
          </span>
          <span v-else>
            Для добавления тега в фильтр нажмите на кнопку
          </span>
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
            Создать раздел
          </a>
        </p>
        <p style="max-width: 800px; margin: 15px auto; padding: 0px 20px;" v-if="add_note_filter_show">
          <input
            ref="new_note_filter_name"
            placeholder="Название раздела"
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

    <ul v-if="section == 'tags' && notepad_working"
      class="collection tags"
    >
      <tag-item v-for="tag in tags.items" :key="tag.id"
        ref="tag_items"
        :tag="tag"
        @submit="submit_tag"
        @cancel="cancel_tag"
        @delete="remove_tag"
        @edit_state_changed="tag_edit_state_changed($event)"
      />
    </ul>

    <ul v-if="section == 'notes' && notepad_working"
      class="collection records"
    >
      <note-item v-for="note in notes.items" :key="note.id"
        ref="note_items"
        :note="note"
        :tags="all_tags"
        @submit="submit_note"
        @cancel="cancel_note"
        @delete="remove_note"
        @edit_state_changed="note_edit_state_changed($event)"
      />
      <li v-if="notes_preloading">
        <preloader />
      </li>
    </ul>

    <notepad-screen v-if="section == 'notepad' && notepad_working"
      :encrypted="encrypted"
      @export_encrypted="export_encrypted"
      @export_unencrypted="export_unencrypted_handler"
      @delete="notepad_delete_handler"
      @set_password="set_password_for_notepad"
      @delete_password="delete_password_for_notepad"
      @set_pin="set_pin_for_notepad"
      @delete_pin="delete_pin_for_notepad"
    />

    <processing-screen v-if="processing" style="z-index: 1;" />

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
          <li :class="{active: section == 'notepad'}" v-on:click="change_section('notepad')">
            <a>
              Блокнот
            </a>
          </li>
          <li :class="{active: section == 'notepad'}" v-on:click="change_section('notepad')">
            <a 
              style="padding: 0px 5px;"
              @click.stop="show_notepad_popup($event)"
            >
              <font-awesome-icon
                icon="caret-down"
                style="height: 64px;"
                class="right"
              />
            </a>
          </li>
        </ul>

        <div
          id="nav-mobile"
          class="sidenav"
          style="z-index: 1003;"
          ref="nav_mobile"
        >
          <ul style="height: calc(100% - 70px); overflow-y: auto;"
          >
            <!-- <li>
              <div style="height: 48px; margin-left: 28px; margin-right: 28px;">
                <font-awesome-icon
                  class="mobile-menu-icon left"
                  icon="home"
                  style="margin-top: 10px; width: 24px !important; height: 24px !important;"
                  @click="notepad_goto_home"
                />
                <span class="right" style="margin-right: 30px;">{{info.notepad_name}}</span>
              </div>
            </li> -->


            <li
              @click="section = 'notepad'"
              :class="{'active': section =='notepad'}"
            >
              <a href="#!"
                style="padding-right: 8px;"
              >
                <font-awesome-icon class="mobile-menu-icon" icon="book" />
                <span>
                  {{info.notepad_name}}
                </span>
                <div style="float: right; height: 48px;">
                  <font-awesome-icon
                    class="mobile-menu-icon left"
                    icon="home"
                    style="margin-top: 10px; width: 24px !important; height: 24px !important;"
                    @click.stop="notepad_goto_home"
                  />
                </div>
              </a>
            </li>
            <li class="divider"></li>
            <note-filter-item
              v-for="note_filter in note_filters" :key="note_filter.id"
              :note_filter="note_filter"
              :class="{'active': (selected_note_filter == note_filter.id) && (section =='notes')}"
              @click="note_filter_click(note_filter.id, note_filter.tags)"
              @delete="delete_note_filter(note_filter.id)"
              @submit="edit_note_filter(note_filter.id, $event)"
            />
            <li class="divider"></li>
            <li :class="{active: section == 'tags'}" v-on:click="change_section('tags')">
              <a href="#">
                <font-awesome-icon class="mobile-menu-icon" icon="tags" />
                <span>Теги</span>
              </a>
            </li>
          </ul>

          <div style="position: absolute;
                      bottom: 60px;
                      width: 100%;
                      box-shadow: 0 -2px 0 0 rgb(0, 0, 0, 0.2);"
          >
            <a
              href="https://offlinepad.com"
              target="_blank"
              class="btn-floating left social-button"
              style="padding-left: 4px;"
            >
              <span>www</span>
            </a>
            <a
              href="https://vk.com/offlinepad"
              target="_blank"
              class="btn-floating left social-button"
              style="padding-left: 12px;">
              <font-awesome-icon v-if="!show_notes_filter" :icon="{'prefix': 'fab', 'iconName': 'vk'}" />
            </a>
            <a class="btn-flat btn-floating"
              style="position: absolute;
                    top: 10px;
                    padding-left: 13px;
                    right: 8px"
              @click="toggle_theme"
            >
              <font-awesome-icon icon="sun" v-if="current_theme == 'light'" key="light_theme" />
              <font-awesome-icon icon="moon" v-else key="dark_theme" />
            </a>

            <span class="right" style="margin-right: 56px; margin-top: 2px; color: gray;">
              {{app_version}}
            </span>
          </div>
        </div>

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

    <develop-console-screen v-show="develop_console"
      ref="console"
      @close="develop_console = false"
    />

    <a v-if="develop_mode"
      class="btn-floating btn-large waves-effect waves-light red add_btn social-button"
      style="left: 16px;"
      @click="develop_console = !develop_console"
    >
      <font-awesome-icon icon="terminal" />
    </a>

    <a v-if="section == 'tags' && notepad_working && !add_button_hidden"
      class="btn-floating btn-large waves-effect waves-light red add_btn social-button"
      @click="add_tag"
      id="add_tag">
      <font-awesome-icon icon="edit" />
    </a>
    <a v-if="section == 'notes' && notepad_working && !add_button_hidden"
      class="btn-floating btn-large waves-effect waves-light red add_btn social-button"
      @click="add_note"
      >
      <font-awesome-icon icon="edit" />
    </a>
    <a v-if="section == 'notes' && notes_scroll_up_show"
      class="btn-floating btn-large waves-effect waves-light red add_btn social-button"
      style="right: 80px;"
      @click="scroll_to_top"
      >
      <font-awesome-icon icon="arrow-up" />
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
      <notepads-selector v-if="!notepad_working"
        :items="notepads"
        @start-creation-wizard="notepad_wizard_show = true"
        @open="notepad_open($event)"
      />
    </transition>

    <transition name="fade">
      <notepad-creation-wizard v-if="notepad_wizard_show"
        :items="notepads"
        @finish="wizard_finished"
        @cancel="notepad_wizard_show = false"
      />
    </transition>

    <transition name="fade">
      <import-screen v-if="importing"
        :progress="import_progress"
        :import_error="import_error"
        @close="importing = false"
        @abort="importer.abort()"
      />
    </transition>

    <transition name="fade">
      <update-popup v-if="update_available"
        style="z-index: 2002"
        :version="update_available"
        @focus="blockerscreen_visible = $event"
        @update="update_service_worker"
      />
    </transition>

    <transition name="fade">
      <update-done-popup v-if="update_done"
        style="z-index: 2002"
        :version="app_version"
        @close="update_done = false"
      />
    </transition>

    <transition name="fade">
      <prompt-screen v-if="prompt"
        :title="prompt"
        style="z-index: 2002"
        @submit="prompt_callback"
        @cancel="prompt_cancel"
      />
    </transition>

    <transition name="fade">
      <enter-password-screen v-if="enter_password"
        ref="enter_password_screen"
        :title="enter_password"
        :available_methods="enter_password_available"
        :auth_method="current_auth_method"
        style="z-index: 2002"
        @submit="enter_password_callback"
        @cancel="enter_password_cancel"
      />
    </transition>

    <transition name="fade">
      <new-password-screen v-if="create_password"
        style="z-index: 2002"
        @submit="create_password_callback"
        @cancel="create_password_cancel"
      />
    </transition>

    <transition name="fade">
      <pin-screen v-if="create_pin"
        style="z-index: 2002"
        :numbers_count="4"
        @submit="create_pin_callback"
        @cancel="create_pin_cancel"
      />
    </transition>

    <transition name="fade">
      <message-screen v-if="message"
        :title="message"
        style="z-index: 2002"
        @close="message = null"
      />
    </transition>

    <transition name="fade">
      <load-screen v-if="loadscreen_visible" />
    </transition>
  </div>
</template>

<script>

import platform from 'platform'

import moment from 'moment'
import _ from 'lodash'
moment.locale("ru");

import LoadScreen from './components/LoadScreen.vue'
import EnterPasswordScreen from './components/EnterPasswordScreen.vue'
import ProcessingScreen from './components/ProcessingScreen.vue'
import WarningScreen from './components/WarningScreen.vue'
import FeaturesNotAvailableScreen from './components/FeaturesNotAvailableScreen.vue'
import NotepadEmptyScreen from './components/NotepadEmptyScreen.vue'
import BlockerScreen from './components/BlockerScreen.vue'
import DevelopConsoleScreen from './components/DevelopConsoleScreen.vue'
import MessageScreen from './components/MessageScreen.vue'
import NewPasswordScreen from './components/NewPasswordScreen.vue'
import NotepadsSelector from './components/NotepadsSelector.vue'
import NotepadCreationWizard from './components/NotepadCreationWizard.vue'
import NotepadScreen from './components/NotepadScreen.vue'
import PinScreen from './components/PinScreen.vue'
import PromptScreen from './components/PromptScreen.vue'
import ImportScreen from './components/ImportScreen.vue'
import NoteItem from './components/NoteItem.vue'
import NoteFilterItem from './components/NoteFilterItem.vue'
import TagItem from './components/TagItem.vue'
import TagsList from './components/TagsList.vue'
import Popup from './components/Popup.vue'
import Preloader from './components/Preloader.vue'
import UpdatePopup from './components/UpdatePopup.vue'
import UpdateDonePopup from './components/UpdateDonePopup.vue'

import sanitize_html from 'sanitize-html'

sanitize_html.defaults.allowedTags = [];
 
import NotepadsList from './js/notepads_list.js'
import sw_api from './js/service_worker.js'
import cookie_api from 'js-cookie'
import ScrollUpController from './js/scroll_up_controller.js'
import { BetaDataImporter, AlphaDataImporter } from './js/data_importer.js'
import cryptobox from './js/cryptobox'

let import_error_to_str = function(code) {
  let result;
  switch(code) {
    case "abort":
      result = "Прервано";
      break;
    case "data schema error":
      result = "Неверный формат данных";
      break;
    default:
      throw new Error("неизвестный код");
  }
  return result;
}

let escapeRegExp = function(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

let notepad = null;
let notepads_list = new NotepadsList();

let text_highlight = function(text) {
  return "<b class='highlight'>" + text + "</b>";
};

let sleep = function(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export default {
  name: 'app',
  components: {
    EnterPasswordScreen,
    LoadScreen,
    ProcessingScreen,
    WarningScreen,
    MessageScreen,
    NotepadEmptyScreen,
    FeaturesNotAvailableScreen,
    BlockerScreen,
    DevelopConsoleScreen,
    ImportScreen,
    NewPasswordScreen,
    NotepadsSelector,
    NotepadCreationWizard,
    NotepadScreen,
    PromptScreen,
    PinScreen,
    NoteItem,
    NoteFilterItem,
    TagItem,
    TagsList,
    Popup,
    Preloader,
    UpdatePopup,
    UpdateDonePopup,
  },

  data: function() {
    var data = {
      current_auth_method: undefined,

      create_pin: false,
      create_pin_callback: null,

      create_password: false,
      create_password_callback: null,

      enter_password: null,
      enter_password_available: null,
      enter_password_callback: null,

      message: null,
      prompt: null,
      prompt_callback: null,

      startup: true,
      develop_mode: false,
      develop_console: false,
      empty_msg: null,
      selected_note_filter: "internal_all",

      notes_scroll_up_show: false,
      notes_preloading: false,

      current_theme: "light",
      features_unawailable: false,

      note_index_in_viewspot: 0,
      note_index_add: null,
      note_being_edited: null,
      tag_index_in_viewspot: 0,
      tag_index_add: null,
      tag_being_edited: null,

      update_available: false,
      update_done: null,
      app_version: "",
      note_filters: [],
      info: {},

      new_note_filter: {
        name: "",
        error: null,
      },

      section: null,

      add_note_filter_show: false,
      blockerscreen_visible: false,
      loadscreen_visible: true,
      processing: false,
      warningscreen_visible: true,
      notepads: [],

      importing: false,
      import_progress: 0,
      import_error: null,

      notes_filter_tags: [],
      fast_search: "",
      sorting_order_asc: true,

      header_hidden: false,

      show_notes_filter: false,

      header_top: 0,
      header_bottom: 0,
      notepad_working: false,
      notepad_wizard_show: false,
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
      this.processing = true;
      if(section == "tags") {
        filter = notepad.get_tags_filter();
        this.fast_search = filter.name;
        this.sorting_order_asc = filter.sorting_asc;
        // TODO костыль для того чтобы при переключении на раздел показывались нужные записи
        this.notes_filter_tags = ['n'];
        notepad._reset_tags();
      } else if (section == "notes") {
        filter = notepad.get_notes_filter();
        this.fast_search = filter.text;
        this.sorting_order_asc = filter.sorting_asc;
        notepad._reset_notes();
      } else if(section == "notepad") {
        // TODO костыль для того чтобы при переключении на раздел показывались нужные записи
        this.notes_filter_tags = ['n'];
        this.close_nav();
        this.processing = false;
      }
      this.process_empty_screen();
    },

    "notes_filter_tags": async function(value) {
      this.scroll_to_top();
      this.process_empty_screen();
      if(!this.startup) {
        this.processing = true;
        await sleep(0);
        let copy = _.cloneDeep(value);
        copy = _.filter(copy, (item) => item != "0");
        // TODO костыль
        if(notepad == null) return;
        await notepad.set_notes_filter({
          "tags": copy,
        });
      }
    },
  
    "fast_search": function(value) {
      this._process_developer_commands(value);
      this.process_empty_screen();
      if(!this.startup) {
        value = escapeRegExp(value);
        if(this.section == "tags") {
          this.processing = true;
          notepad.set_tags_filter({
            "name": value,
          });
        } else if (this.section == "notes") {
          this.processing = true;
          notepad.set_notes_filter({
            "text": value,
          })
        }
      }
    },
  
    "sorting_order_asc": function(asc) {
      if(!this.startup) {
        if(this.section == "tags") {
          this.processing = true;
          notepad.set_tags_filter({
            "sorting_asc": asc,
          });
        } else if (this.section == "notes") {
          this.processing = true;
          notepad.set_notes_filter({
            "sorting_asc": asc,
          })
        }
      }
    },

    "notes.items": function() {
      this.process_empty_screen();
    },
    "tags.items": function() {
      this.process_empty_screen();
    },
  },

  computed: {
    item_being_edited: function() {
      let item = null;
      if(this.note_being_edited != null) {
        for(let k = 0; k < this.$refs.note_items.length; k++) {
          item = this.$refs.note_items[k];
          if(item.data.id == this.note_being_edited) {
            break;
          }
        }
      } else if(this.tag_being_edited != null) {
        for(let k = 0; k < this.$refs.tag_items.length; k++) {
          item = this.$refs.tag_items[k];
          if(item.data.id == this.tag_being_edited) {
            break;
          }
        }
      }
      return item;
    },

    active_notepad_controls: function() {
      let items = [
        {id: "goto_home", name: "На главую"},
        {id: "toggle_theme", name: "Переключить тему"},
      ];
      return items;
    },

    add_button_hidden: function() {
      return this.header_hidden || this.blockerscreen_visible;
    },
  },

  mounted: async function() {
    if(platform.os.family == "Android") {
      window.console = this.$refs.console;
    }

    this.notes_scroll_up_controller = new ScrollUpController();
    this.notes_scroll_up_controller.on("show", (value) => this.notes_scroll_up_show = value);

    this._init_develop_mode();
    this.load_theme();
    this.warning_init();
    if(sw_api.is_available()) {
      let init_data = await this.service_worker_init();
      this.app_version = init_data.version;
      if(init_data.updated) {
        this.update_done = true;
      }
      this.scroll_init();
      window.M.AutoInit();
      await this.notepads_init();
    } else {
      this.features_unawailable = true;
    }

    this.startup = false;
    this.loadscreen_visible = false;
    window.addEventListener("beforeunload", this.before_unload_handler);
  },

  beforeDestroy: function() {
    window.removeEventListener("beforeunload", this.before_unload_handler);
  },

  methods: {
    notepad_delete_handler: async function() {
      let notepad_id = notepad._state.info.id;      
      let accept = await this.show_prompt('Вы уверены, что хотите удалить блокнот?');
      if(accept) {

        if(this.encrypted) {
          let secret = this.authenticate(notepad_id);
          await sleep(0.25);
          this.prompt_cancel();
          await secret;

          this.loadscreen_visible = true;
          await sleep(0.25);
          this.enter_password_cancel();
        } else {
          this.loadscreen_visible = true;
          await sleep(0.25);
          this.prompt_cancel();
        }

        await this.delete_notepad();
        this.loadscreen_visible = false;
      }
    },

    before_unload_handler: function(event) {
      if(this.skip_page_leave_check) {
        return;
      }
      if(this.blockerscreen_visible) {
        event.returnValue = "Если вы покинете страницу будут потеряны данные"
      }
    },
    
    prompt_create_pin: async function() {
      let promise = new Promise((resolve) => {
        this.create_pin_callback = (pin) => {
          resolve(pin);
        };
      });
      this.create_pin = true;
      return await promise;
    },

    create_pin_cancel: function() {
      this.create_pin = false;
    },

    create_password_cancel: function() {
      this.create_password = false;
    },

    prompt_create_password: async function() {
      let promise = new Promise((resolve) => {
        this.create_password_callback = (password) => {
          resolve(password);
        };
      });
      this.create_password = true;
      return await promise;
    },

    enter_password_cancel: function() {
      this.enter_password = null;
    },

    set_password_for_notepad: async function() {
      let notepad_id = notepad._state.info.id;
      let secret = await this.authenticate(notepad_id);
      if(secret == null) {
        return;
      }

      let new_password = this.prompt_create_password();
      await sleep(0.25);
      this.enter_password_cancel();
      new_password = await new_password;

      this.loadscreen_visible = true;
      await sleep(0.25);
      this.create_password_cancel();

      let result = await notepads_list.set_password_secret(
        notepad._state.info.id, new_password, secret
      );
      if(!result) {
        this.message = "Не удалось задать пароль";
      } else {
        this.message = "Пароль установлен";
      }
      await sleep(0.25);
      this.loadscreen_visible = false;
    },

    delete_password_for_notepad: async function() {
      let notepad_id = notepad._state.info.id;
      await this.authenticate(notepad_id);

      this.loadscreen_visible = true;
      await sleep(0.25);
      this.enter_password_cancel();
      await notepads_list.delete_password_secret(notepad_id);

      this.message = this.translate_message("password deleted");
      await sleep(0.25);
      this.loadscreen_visible = false;
    },

    set_pin_for_notepad: async function() {
      let notepad_id = notepad._state.info.id;
      let secret = await this.authenticate(notepad_id);
      if(secret == null) {
        return;
      }

      let pin = this.prompt_create_pin();
      await sleep(0.25);
      this.enter_password_cancel();
      pin = await pin;

      this.loadscreen_visible = true;
      await sleep(0.25);
      this.create_pin_cancel();

      let result = await notepads_list.set_pin_secret(
        notepad._state.info.id, pin, notepad._storage._options.secret
      );

      if(!result) {
        this.message = "Не удалось задать пин";
      } else {
        this.message = "Пин установлен";
      }
      await sleep(0.25);
      this.loadscreen_visible = false;
    },

    delete_pin_for_notepad: async function() {
      let notepad_id = notepad._state.info.id;
      await this.authenticate(notepad_id);

      this.loadscreen_visible = true;
      await sleep(0.25);
      this.enter_password_cancel();
      let result = await notepads_list.delete_pin_secret(notepad_id);
      if(result.error == "ok") {
        this.message = this.translate_message("pin deleted");
      } else {
        this.message = this.translate_message(result.error);
      }
      await sleep(0.25);
      this.loadscreen_visible = false;
    },

    show_prompt: function(title, callback) {
      if(callback != null) {
        this.prompt_callback = callback;
        this.prompt = title;
      } else {
        let promise = new Promise((resolve) => {
          this.prompt_callback = () => {
            resolve(true);
          };
          this.prompt = title;
        });
        return promise;
      }
    },

    prompt_cancel: function() {
      this.prompt = null;
    },

    is_notes_filter_active: function() {
      return this.fast_search != "" || this.notes_filter_tags.length > 0;
    },

    process_empty_screen: function() {
      if(this.section == "notes") {
        if(this.notes.items.length == 0) {
          if(this.is_notes_filter_active()) {
            this.empty_msg = "Для указанного фильтра\nне найдено ни одной записи";
          } else {
            this.empty_msg = "У вас еще нет записей\nСоздайте новую";
          }
        } else {
          this.empty_msg = null;
        }
      }
      if(this.section == "tags") {
        if(this.tags.items.length == 0) {
          if(this.fast_search != "") {
            this.empty_msg = "Для указанного фильтра\nне найдено ни одного тега";
          } else {
            this.empty_msg = "У вас еще нет тегов\nСоздайте новый";
          }
        } else {
          this.empty_msg = null;
        }
      }
    },

    notepad_goto_home: async function() {
      this.loadscreen_visible = true;
      await sleep(0.5);
      // TODO костыль
      this.notes_filter_tags.splice(0, this.notes_filter_tags.length);
      this.close_nav();
      this.section = null;
      await notepad.close();
      this.notepad_unregister(notepad);
      notepad = null;
      this.notepad_working = false;
      await sleep(0.5);
      this.loadscreen_visible = false;
    },

    scroll_to_top: function() {
      this.notes_scroll_up_controller.scroll_top();
      window.scrollTo(0, 0);
    },

    _process_developer_commands: function(command) {
      if(command == "develop=on") {
        this._enable_develop();
      }
      if(command == "develop=off") {
        this._disable_develop();
      }
    },

    _init_develop_mode: function() {
      let value = cookie_api.get("develop_mode");
      if(value == "1") {
        this.develop_mode = true;
      }
    },

    _enable_develop: function() {
      this.develop_mode = true;
      cookie_api.set("develop_mode", "1");
    },

    _disable_develop: function() {
      this.develop_mode = false;
      cookie_api.set("develop_mode", "0");
    },

    note_edit_state_changed: function(event) {
      this.blockerscreen_visible = event.edit_state;
      if(event.edit_state) {
        this.note_being_edited = event.id;
      } else {
        this.note_being_edited = null;
      }
    },

    tag_edit_state_changed: function(event) {
      this.blockerscreen_visible = event.edit_state;
      if(event.edit_state) {
        this.tag_being_edited = event.id;
      } else {
        this.tag_being_edited = null;
      }
    },

    load_theme: function() {
      let theme = localStorage.getItem("internal_cfg_theme");
      if(theme == null) {
        theme = "light";
      }
      this.set_theme(theme);
      this.current_theme = theme;
    },

    set_theme: function(theme) {
      let mobile_tab_color = window.document.getElementById("mobile_tab_color");
      let theme_element = window.document.getElementById("theme-css");
      if(theme == "light") {
        theme_element.href = "css/light-theme.css";
        this.current_theme = "light";
        mobile_tab_color.content = "white";
      } else {
        theme_element.href = "css/dark-theme.css";
        this.current_theme = "dark";
        mobile_tab_color.content = "rgb(43, 60, 70)";
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

    notepad_reset_tags: function(tags) {
      this.processing = false;
      this.tags.items = this.wrap_tags(tags);
    },

    notepad_append_tags: function(tags) {
      this.tags.items.push.apply(this.tags.items, this.wrap_tags(tags));
    },
    
    notepad_all_tags: function(tags) {
      this.all_tags = tags;
    },
    
    notepad_reset_notes: function(notes) {
      this.processing = false;
      this.notes.items = this.wrap_notes(notes);
    },
    
    notepad_reset_notes_count: function(notes_count) {
      this.notes.count = notes_count;
    },

    notepad_append_notes: function(notes) {
      this.notes.items.push.apply(this.notes.items, this.wrap_notes(notes));
      this.notes_preloading = false;
    },
    
    notepad_reset_note_filters: function(items) {
      this.note_filters = items;
    },
    
    notepad_reset_filter: function(filter) {
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
    },
    
    notepad_reset_info: function(info) {
      this.info = info;
    },

    notepad_register: function(instance) {
      instance.on("reset_tags", this.notepad_reset_tags);
      instance.on("append_tags", this.notepad_append_tags);
      instance.on("all_tags", this.notepad_all_tags);
      instance.on("reset_notes", this.notepad_reset_notes);
      instance.on("reset_notes_count", this.notepad_reset_notes_count);
      instance.on("append_notes", this.notepad_append_notes);
      instance.on("reset_note_filters", this.notepad_reset_note_filters);
      instance.on("reset_filter", this.notepad_reset_filter);
      instance.on("reset_info", this.notepad_reset_info);
    },
    notepad_unregister: function(instance) {
      instance.off("reset_tags", this.notepad_reset_tags);
      instance.off("append_tags", this.notepad_append_tags);
      instance.off("all_tags", this.notepad_all_tags);
      instance.off("reset_notes", this.notepad_reset_notes);
      instance.off("reset_notes_count", this.notepad_reset_notes_count);
      instance.off("append_notes", this.notepad_append_notes);
      instance.off("reset_note_filters", this.notepad_reset_note_filters);
      instance.off("reset_filter", this.notepad_reset_filter);
      instance.off("reset_info", this.notepad_reset_info);
    },

    notepads_init: async function() {
      await notepads_list.init();
      this.notepads = _.cloneDeep(notepads_list.notepads);
    },

    translate_message: function(message) {
      let text = message;
      let result;
      if(_.isObject(text)) {
        text = text.msg;
      }
      switch(text) {
        case "wrong secret":
          result = "Неправильный ключ";
          break;
        case "wrong pin":
          result = "Неверный пин\nОсталось попыток: " + message.attempts;
          break;
        case "attempts exceeded":
          result = "Попытки входа исчерпаны\nПин заблокирован";
          break;
        case "server error":
          result = "Ошибка сервера";
          break;
        case "password deleted":
          result = "Пароль удален";
          break;
        case "pin deleted":
          result = "Пин удален";
          break;
        case "pin not set up":
          result = "Пин не настроен";
          break;
        default:
          throw new Error("not implemented '" + text + "'");
      }
      return result;
    },

    authenticate: async function(notepad_id) {
      let title = "Введите пароль";
      
      let password_secret = await notepads_list.get_password_secret(notepad_id);
      let pin_secret = await notepads_list._get_pin_secret(notepad_id);
      this.current_auth_method = await notepads_list.get_current_auth_method(notepad_id);
      let available_items = {
        passphrase: true,
        password: password_secret != null,
        pin: pin_secret != null,
      };
      this.enter_password_available = available_items;

      this.enter_password = title;
      let promise = new Promise((resolve) => {
        this.enter_password_callback = async (info) => {

          let secret = await notepads_list.process_secret(info, notepad_id);
          if(!_.isArray(secret)) {
            this.message = this.translate_message(secret);
            await sleep(0.25);
            this.$refs.enter_password_screen.reset();
            return;
          }

          if(!await this.check_notepad_secret(secret, notepad_id)) {
            this.message = this.translate_message("wrong secret");
            return;
          }

          await notepads_list.set_current_auth_method(info.method, notepad_id);
          resolve(secret);
        };     
      });

      return await promise;
    },

    check_notepad_secret: async function(secret, notepad_id) {
      let info = await notepads_list.read_notepad_info_by_id(notepad_id);
      let secret_check;
      secret_check = cryptobox.decrypt(info.secret_check, secret);
      return "secret check" == secret_check;
    },

    notepad_open: async function(arg) {
      if(arg.encrypted) {
        let secret  = await this.authenticate(arg.id);
        if(secret == null) {
          return;
        }
        arg.secret = secret;
      }

      let id = arg.id;
      let options;
      this.encrypted = false;
      if(arg.secret == null) {
        options = {
          encrypted: false,
        };
      } else {
        options = {
          encrypted: true,
          secret: arg.secret,
        };
      }

      this.loadscreen_visible = true;
      await sleep(0.25);
      if(arg.secret) {
        this.enter_password_cancel();
      }

      notepad = await notepads_list.open(id, options);
      if(_.isString(notepad)) {
        this.message = this.translate_message(notepad);
      } else {
        this.encrypted = notepad._state.info.encrypted;
        this.notepad_register(notepad);
        notepad._reset_info();
        this.notepad_working = true;
        await notepad._reset_note_filters();
        this.section = "notes";
      }
      await sleep(0.25);
      this.loadscreen_visible = false;
    },

    update_service_worker: function() {
      this.skip_page_leave_check = true;
      sw_api.activate_new_worker();
    },

    note_filter_add_gui_show: function() {
      this.add_note_filter_show = true;
      this.$nextTick(function() {
        this.$refs.new_note_filter_name.focus();
      });
    },

    note_filter_click: async function(id, tags) {
      this.selected_note_filter = id;
      this.change_section('notes');
      await this.$nextTick();
      this.notes_filter_tags = _.cloneDeep(tags);
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
        if((delta > 0) && (scroll > 0)) {
          this.header_hidden = true;
        } else {
          this.header_hidden = false;
        }
        header_top -= delta;
        if(header_top + old_header_height == 0) {
          header_top = - header_height;
        }
        if(header_top < -header_height) {
          header_top = -header_height;
          // this.header_hidden = true;
        }
        if(header_top > 0) {
          header_top = 0;
          // this.header_hidden = false;
        }
        header.style.top = header_top + "px";
        this.header_top = header_top;
        this.header_bottom = header_top + header_height;
        currenct_scrolltop = scroll;
        //
        let scroll_with_header = scroll + this.header_bottom - header_height - 1;
        let item_being_edited = this.item_being_edited;
        if(item_being_edited != null) {
          let scroll_top_bound = item_being_edited.$el.offsetTop;
          let scroll_bottom_bound = item_being_edited.$el.offsetTop + item_being_edited.$el.offsetHeight;
          if(scroll_with_header > scroll_bottom_bound) {
            this.return_scroll_to_editable_element();
          }
          if(window.scrollY + window.innerHeight - this.header_bottom < scroll_top_bound) {
            this.return_scroll_to_editable_element();
          }
        }
        //
        this.process_note_items_scroll(scroll_with_header);
        this.process_tag_items_scroll(scroll_with_header);
        //
        this.process_notes_preload();
        this.notes_scroll_up_controller.process(scroll);
      }.bind(this);
      window.document.addEventListener("scroll", on_scroll);
      on_scroll();
    },

    return_scroll_to_editable_element: _.debounce(function() {
      if(this.item_being_edited != null) {
        this.item_being_edited.$el.scrollIntoView();
      }
    }, 100),

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

    process_notes_preload: function() {
      if(notepad != null) {
        if(this.note_index_in_viewspot > this.notes.items.length - 20) {
          if(this.notes.items.length < this.notes.count) {
            if(!this.notes_preloading) {
              this.notes_preloading = true;
              notepad.load_next_notes();
            }
          }
        }
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
        item.name_highlighted = text.replace(new RegExp(this.fast_search, "g"), text_highlight(this.fast_search));
      }
      return tags;
    },

    wrap_notes: function(notes) {
      let k, item;
      for(k = 0; k < notes.length; k++) {
        item = notes[k];
        let text = sanitize_html(item.text);
        if(this.fast_search.length > 0) {
          text = text.replace(new RegExp(this.fast_search, "g"), 
          text_highlight(this.fast_search));
        }
        item.text_highlighted = text;
      }
      return notes;
    },

    submit_tag: async function(data) {
      if(data.name == "") {
        data.error = "empty"
        data.edit_state = true;
        this.tag_edit_state_changed(data);
        return;
      }
      if(data.id == "__new_item__") {
        let is_exists = await notepad.is_tag_with_name_exists(data.name);
        if(is_exists) {
          data.edit_state = true;
          data.error = "existing";
        } else {
          this.tag_index_add = null;
          await notepad.create_tag(data.name);
        }
      } else {
        let is_exists = await notepad.is_tag_with_name_exists(data.name, data.id);
        if(is_exists) {
          data.edit_state = true;
          data.error = "existing";
        } else {
          await notepad.edit_tag(data.id, data.name);
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
      if(data.text == "") {
        data.error = "empty"
        data.edit_state = true;
        this.note_edit_state_changed(data);
        return;
      }
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

    long_str: function() {
      let str = Array(20000000).join("z");
      return str;
    },

    test_create: async function(number) {
      let tags = [];
      for(let k = 0; k < 10; k++) {
        tags.push({
          "name": "метка " + (k + 1),
        });
      }
      let tag_ids = await notepad._storage.create_items_in_store(
        "tags", tags
      );

      let notes = [];
      for(let k = 0; k < number; k++) {
        if(k % 100 == 0) {
          notes = [];
        }
        notes.push({
          "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." + k,
          "created_at": 1589737323802 + k,
        });
        if(k % 100 == 99) {
          let note_ids = await notepad._storage.create_items_in_store(
            "notes", notes
          );
          let note_tags = [];
          for(let i = 0; i < note_ids.length; i++) {
            let note_id = note_ids[i];
            let tags_for_note = (k + i) % 5;
            for(let j = 0; j < tags_for_note; j++) {
              let tag_id = tag_ids[j];
              note_tags.push({
                "note_id": note_id,
                "tag_id": tag_id,
              });
            }
          }
          await notepad._storage.create_items_in_store(
            "tag_notes", note_tags
          );
          window.console.log("created " + (k + 1));
        }
      }
      this.notepad_working = true;
      notepad.invalidate_cache();
      await notepad._reset_note_filters();
      await notepad._reset_notes();
    },

    delete_notepad: async function() {
      let notepad_id = notepad._state.info.id;      
      this.section = null;
      await notepad.close();
      this.notepad_unregister(notepad);
      notepad = null;
      this.notepad_working = false;
      await this.delete_notepad_by_id(notepad_id);
      // await sleep(0.5);
      // this.loadscreen_visible = false;
    },

    delete_notepad_by_id: async function(notepad_id) {
      await notepads_list.delete(notepad_id);
      this.notepads = _.cloneDeep(notepads_list.notepads);
    },

    export_unencrypted_handler: async function() {
      if(this.encrypted) {
        let accept = await this.show_prompt(
          'Вы уверены, что сохранить незашифрованную резерную копию?');
        if(!accept) {
          return;
        }

        let notepad_id = notepad._state.info.id;
        let secret = this.authenticate(notepad_id);
        await sleep(0.25);
        this.prompt_cancel();
        await secret;
        
        this.loadscreen_visible = true;
        await sleep(0.25);
        this.enter_password_cancel();
      } else {
        this.loadscreen_visible = true;
      }
      
      await this.export_unencrypted();
      this.loadscreen_visible = false;
    },

    export_unencrypted: async function() {
      await this.export_notepad(false);
    },

    export_encrypted: async function() {
      await this.export_notepad(true);
    },

    export_notepad: async function(disable_decryption) {
      let stamp = moment(+ new Date()).format("YYYY-MM-DD HH:mm:ss");
      let filename = notepad._state.info.notepad_name + " " + stamp + ".txt";
      let data = await notepad.export(disable_decryption);
      let data_serialized = "";
      for(let k = 0; k < data.length; k++) {
        let item = data[k];
        data_serialized += JSON.stringify(item);
      }
      
      // this.download(filename, data);

      let promise = sw_api.new_download(
        filename, data_serialized
      ).then(function(info) {
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
      await promise;

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

    },

    wizard_finished: function(info) {
      if(info.file == null) {
        this.notepad_create(info);
      } else {
        info.name = info.notepad_name;
        this.notepad_import(info);
      }
      this.notepad_wizard_show = false;
    },

    notepad_create: async function(arg) {
      let name = arg.notepad_name;
      let options = {
        encrypted: arg.encrypted,
      };
      if(arg.encrypted) {
        let secret = await notepads_list.process_secret(arg.secret);
        options.secret = secret;
      }
      this.loadscreen_visible = true;
      await sleep(0.5);
      await notepads_list.create(name, options);
      this.notepads = _.cloneDeep(notepads_list.notepads);
      await sleep(0.5);
      this.loadscreen_visible = false;
    },

    notepad_import: async function(arg) {
      if(arg.secret) {
        let secret = await notepads_list.process_secret(arg.secret);
        arg.secret = secret;
      }
      this.import_error = null;
      this.importing = true;
      await sleep(0.5);
      if(arg.schema == "beta" || arg.schema == "alpha") {
        arg.notepads_list = notepads_list;
        let importer;
        if(arg.schema == "beta") {
          importer = new BetaDataImporter(arg);
        }
        if(arg.schema == "alpha") {
          importer = new AlphaDataImporter(arg);
        }
        this.importer = importer;

        let updater = setInterval(
          () => {
            this.import_progress = importer.import_progress;
          },
          100
        );
        let import_result = await importer.execute();
        clearTimeout(updater);
        if(import_result.error == null) {
          await sleep(0.25);
          this.importing = false;
        } else {
          this.import_error = import_error_to_str(import_result.error);
        }
      }
      this.import_progress = 0;
      this.notepads = _.cloneDeep(notepads_list.notepads);
    },

    notepad_menu: async function(command) {
      switch(command) {
        case "toggle_theme":
          this.toggle_theme();
          break;
        case "goto_home":
          this.notepad_goto_home();
          break;
        default:
          throw new Error("неизвестная команда " + command);
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
        "text_highlighted": "",
        "creation_time": + new Date(),
      };
      this.note_index_add = this.note_index_in_viewspot;
      this.note_being_edited = this.note_index_in_viewspot;
      this.notes.items.splice(this.note_index_add, 0, new_note);
    },

    add_note_filter: async function() {
      let name = this.new_note_filter.name;
      let is_exists = await notepad.is_note_filter_with_name_exists(name);
      if(is_exists) {
        this.new_note_filter.error = true;
        this.new_note_filter.error_text = "Раздел с таким названием уже существует";
        this.$refs.new_note_filter_name.focus();
      } else if(name == "") {
        this.new_note_filter.error = true;
        this.new_note_filter.error_text = "Название раздела не может быть пустым";
        this.$refs.new_note_filter_name.focus();
      } else {
        await notepad.create_note_filter(name, this.notes_filter_tags);
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

    edit_note_filter: async function(id, data) {
      let new_name = data.name;
      let is_exists = await notepad.is_note_filter_with_name_exists(data.name, data.id);
      if(new_name == "") {
        data.edit_state = true;
        data.error = "empty";
      } else if(is_exists) {
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
  transition: opacity .25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
  opacity: 0;
}
</style>
