<template>
  <full-screen-box :top="true" :fullscreen="true">
    <span>
      <ul
        class="collection notepads-selector"
      >
        <li class="collection-item"
       >
          <span>
            <form class="col s12">
              <div>
                <span
                  class="left text-selector"
                  :class="{'active': current_method=='passphrase'}"
                  @click="set_current_method('passphrase')"
                >
                  Фраза
                </span>
                <span
                  class="text-selector"
                  :class="{'active': current_method=='password', 'disabled': !available_methods['password']}"
                  @click="set_current_method('password')"
                >
                  Пароль
                </span>
                <span
                  class="right text-selector"
                  :class="{'active': current_method=='pin', 'disabled': !available_methods['pin']}"
                  @click="set_current_method('pin')"
                >
                  Онлайн-ПИН
                </span>
                <div
                  class="row" style="margin-bottom: 0px;"
                >
                  <div class="input-field col s12">
                    <input
                      ref="add_name_input"
                      :placeholder="secret_placeholder[current_method]"
                      type="text"
                      class="validate"
                      v-model="password"
                    >
                    <span v-if="error_text"
                      class="left red-text" style=""
                    >
                      {{error_text}}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <a class="waves-effect waves-light btn left"
                    @click="$emit('cancel')"
                  >
                    <!-- <font-awesome-icon icon=""/> -->
                    Отмена
                  </a>
                  <a class="waves-effect waves-light btn right"
                    @click="$emit('submit', {'method': current_method, 'value': password})"
                  >
                    <!-- <font-awesome-icon icon=""/> -->
                    Создать
                  </a>
                </div>
              </div>
            </form>
          </span>
        </li>
      </ul>
    </span>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
//   import NotepadsSelectorItem from "./NotepadsSelectorItem.vue";
//   import PartialFileReader from './../js/partial_file_reader.js'
//   import _ from "lodash";


  export default {
    props: {
      "items": Array,
    },
    
    components: {
      FullScreenBox,
    //   NotepadsSelectorItem,  
    },

    computed: {
      "error_text": function() {
        if(this.error == "empty") {
          return "Название не может быть пустым";
        }
        return null;
      },
    },

    data: function() {
      let data = {
        secret_placeholder: {
          "passphrase": "Защитная фраза",
          "password": "Пароль",
          "pin": "Пин",
        },
        password: "",
        current_method: "passphrase",
        available_methods: {
          passphrase: true,
          password: true,
          pin: false,
        },
      };
      return data;
    },

    mounted: function() {
      this.password = "";
    //   this.add_select_instances = null;
    //   this.update_active();
    },

    watch: {
    //   "items": function() {
    //     this.update_active();
    //   },

    //   'add_name': function() {
    //     this.error = null;
    //   },

    //   'active': async function(value) {
    //     if(value == "add") {
    //       this.add_name = "";
    //       await this.$nextTick()
    //       this.$refs.add_name_input.focus();
    //       let elems = this.$refs.selects;
    //       this.add_select_instances = window.M.FormSelect.init(elems);
    //     } else {
    //       if(this.add_select_instances != null) {
    //         for(let k = 0; k < this.add_select_instances.length; k++) {
    //           let instance = this.add_select_instances[k];
    //           instance.destroy();
    //         }
    //         this.add_select_instances = null;
    //       }
    //     }
    //   },
    },

    methods: {
      set_current_method: function(method) {
        if(this.available_methods[method]) {
          this.current_method = method;
        }
      },
    //   async validate () {
    //     let file = this.$refs.import_file.files[0];
    //     let validator = new Validator(file);
    //     let result = await validator.validate();
    //     this.import_file_schema = null;
    //     switch(result.error) {
    //       case "ok":
    //         this.import_file_schema = result.schema;
    //         this.import_file_error = null;
    //         break;
    //       case "unknown schema":
    //         this.import_file_error = "Неизвестный формат";
    //         break;
    //       case "wrong file":
    //         this.import_file_error = "Некорректный файл";
    //         break;
    //       default:
    //         this.import_file_error = "Неизвестная ошибка";
    //         break;
    //     }
    //   },

    //   password_entered: function(password) {
    //     let data = {
    //       id: this._selected_item.id,
    //       secret: password,
    //     };
    //     this.$emit("open", data);
    //     this.password_canceled();
    //   },

    //   password_canceled: function() {
    //     this._selected_item = null;
    //     this.show_enter_password_form = false;
    //   }

    //   open_handler: function(item) {
    //     if(item.encrypted) {
    //       this.show_enter_password_form = true;
    //       this._selected_item = item;
    //     } else {
    //       $emit('open', {id: item.id})
    //     }
    //   },

    //   update_active: function() {
    //     this.active = null;
    //     // if(this.items.length == 0) {
    //     //   this.active = "add";
    //     // }
    //     // if(this.items.length == 1) {
    //     //   this.active = this.items[0].id;
    //     // }
    //   },
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .collection.notepads-selector .collection-item {
    padding: 10px;
  }

  .text-selector.active {
    text-decoration: underline;
  }

  .text-selector.disabled {
    color: gray;
  }

  .new-notepad-mode {
    margin-left: 20px;
    margin-right: 20px;
    cursor: pointer;
  }

  .new-notepad-mode.active {
    text-decoration: underline;
    font-weight: bold;
  }

  .one-notepad-center {
      position: relative;
      display: inline-block;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
  }

</style>
