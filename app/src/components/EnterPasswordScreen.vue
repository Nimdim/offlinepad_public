<template>
  <full-screen-box :top="true" :fullscreen="true">
    <ul
      class="collection notepads-selector block-center"
      style="border: unset;"
    >
      <li class="collection-item"
      >
        <span>
          <form class="col s12">
            <div class="row" style="margin-bottom: 0px;">
              <div class="input-field col s12">
                <span>{{title}}</span>
              </div>
            </div>
            <div class="row" style="margin-bottom: 0px;">
              <div class="input-field col s12">
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
              </div>
            </div>

            <div
              v-if="current_method != 'pin'"
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <input
                  ref="add_name_input"
                  :placeholder="secret_placeholder[current_method]"
                  :type="input_type"
                  class="validate"
                  v-model="password"
                  show-password
                >
                <a class="waves-effect waves-light btn left"
                  style="width: 100%"
                  @click="toggle_password"
                >
                  <font-awesome-icon icon="eye"
                  />
                </a>

                <span v-if="error_text"
                  class="left red-text" style=""
                >
                  {{error_text}}
                </span>
              </div>
            </div>

            <div
              v-if="current_method != 'pin'"
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn left red"
                  @click="$emit('cancel')"
                >
                  <font-awesome-icon icon="times-circle"/>
                </a>
                <a class="waves-effect waves-light btn right"
                  @click="$emit('submit', {'method': current_method, 'value': password})"
                >
                  <font-awesome-icon icon="check"/>
                </a>
              </div>
            </div>
            <pin-pad
              v-else
              ref="pin_pad"
              style="margin: 20px auto;"
              :numbers_count="4"
              @submit="$emit('submit', {'method': 'pin', 'value': $event})"
              @cancel="$emit('cancel')"
            />
          </form>
        </span>
      </li>
    </ul>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import PinPad from "./PinPad.vue";

  export default {
    props: {
      "title": String,
      "items": Array,
      "available_methods": Object,
      "auth_method": {
        type: String,
        default: "passphrase",
      }
    },
    
    components: {
      FullScreenBox,
      PinPad,
    },

    computed: {
      "error_text": function() {
        if(this.error == "empty") {
          return "Название не может быть пустым";
        }
        return null;
      },

      "input_type": function() {
        if(this.show_password) {
          return "text";
        } else {
          return "password";
        }
      }
    },

    data: function() {
      let current_method = this.auth_method;
      if(this.available_methods[this.auth_method] !== true) {
        let METHODS = ["pin", "password", "passphrase"];
        for(let k = 0; k < METHODS.length; k++) {
          let method = METHODS[k];
          if(this.available_methods[method]) {
            current_method = method;
            break;
          }
        }
      }
      let data = {
        current_method: current_method,
        show_password: false,
        secret_placeholder: {
          "passphrase": "Защитная фраза",
          "password": "Пароль",
          "pin": "Пин",
        },
        password: "",
      };
      return data;
    },

    mounted: function() {
      this.password = "";
    },

    watch: {
      current_method: {
        handler: async function(value) {
          this.password = "";
          this.show_password = false;
          if(value == "passphrase" || value == "password") {
            await this.$nextTick();
            this.$refs.add_name_input.focus();
          }
        },
        immediate: true,
      },
    },

    methods: {
      set_current_method: function(method) {
        if(this.available_methods[method]) {
          this.current_method = method;
        }
      },

      reset: function() {
        this.$refs.pin_pad.clear();
      },

      toggle_password: function() {
        this.show_password = !this.show_password;
      }
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .collection.notepads-selector .collection-item {
    padding: 10px;
  }

  .text-selector {
    cursor: pointer;
    display: inline-block;
    width: 90px;
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
