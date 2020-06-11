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
              <div class="row">
                <span>{{title}}</span>
              </div>
              <div class="row">
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
                  v-if="current_method != 'pin'"
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
                v-if="current_method != 'pin'"
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
                    Подтвердить
                  </a>
                </div>
              </div>
              <pin-pad
                v-else
                style="margin: 20px auto;"
                :numbers_count="4"
                @submit="$emit('submit', {'method': 'pin', 'value': $event})"
                @cancel="$emit('cancel')"
              />
            </form>
          </span>
        </li>
      </ul>
    </span>
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
    },

    data: function() {
      let data = {
        current_method: this.auth_method,
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
    },

    methods: {
      set_current_method: function(method) {
        if(this.available_methods[method]) {
          this.current_method = method;
        }
      },
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
  }

  .text-selector:hover,
  .text-selector.active {
    color: darkorange;
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
