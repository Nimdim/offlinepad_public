<template>
  <full-screen-box :top="true" :fullscreen="true">
    <span :class="{'one-notepad-center': items.length == 0}">
      <span v-if="items.length > 0"
        class="notepads-selector"
        style="display: block; margin: 0 auto;"
      >
        Блокноты
      </span>
      <span v-else
        class="notepads-selector"
        style="display: block; margin: 0 auto; margin-bottom: 10px;"
      >
        У вас пока еще не создано ни одного блокнота. Создайте новый, при помощи формы ниже.
      </span>
      <ul
        class="collection notepads-selector"
      >
        <notepads-selector-item
          v-for="item in items" :key="item.id"
          :item="item"
          :active="active == item.id"
          @click="open_handler(item)"
        />
        <li class="collection-item"
          @click="$emit('start-creation-wizard')"
        >
          <span>
            <font-awesome-icon icon="plus"/>
          </span>
        </li>
      </ul>
    </span>
    <enter-password-screen v-if="show_enter_password_form"
      @submit="password_entered($event)"
      @cancel="password_canceled"
    />
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import NotepadsSelectorItem from "./NotepadsSelectorItem.vue";
  import EnterPasswordScreen from "./EnterPasswordScreen.vue";

  export default {
    props: {
      "items": Array,
    },
    
    components: {
      FullScreenBox,
      NotepadsSelectorItem,
      EnterPasswordScreen
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
        active: null,
        add_name: "",
        add_mode: "create",
        error: null,
        import_file_error: null,
        show_enter_password_form: false,
      };
      return data;
    },

    mounted: function() {
      this.add_select_instances = null;
      this.update_active();
    },

    watch: {
      "items": function() {
        this.update_active();
      },

      'add_name': function() {
        this.error = null;
      },

      'active': async function(value) {
        if(value == "add") {
          this.add_name = "";
          await this.$nextTick()
          this.$refs.add_name_input.focus();
          let elems = this.$refs.selects;
          this.add_select_instances = window.M.FormSelect.init(elems);
        } else {
          if(this.add_select_instances != null) {
            for(let k = 0; k < this.add_select_instances.length; k++) {
              let instance = this.add_select_instances[k];
              instance.destroy();
            }
            this.add_select_instances = null;
          }
        }
      },
    },

    methods: {
      password_entered: function(password) {
        let data = {
          id: this._selected_item.id,
          secret: password,
        };
        this.$emit("open", data);
        this.password_canceled();
      },

      password_canceled: function() {
        this._selected_item = null;
        this.show_enter_password_form = false;
      },

      open_handler: function(item) {
        if(item.encrypted) {
          this.show_enter_password_form = true;
          this._selected_item = item;
        } else {
          this.$emit('open', {id: item.id})
        }
      },

      update_active: function() {
        this.active = null;
        // if(this.items.length == 0) {
        //   this.active = "add";
        // }
        // if(this.items.length == 1) {
        //   this.active = this.items[0].id;
        // }
      },
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .collection.notepads-selector .collection-item {
    padding: 10px;
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
