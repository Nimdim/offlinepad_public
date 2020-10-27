<template>
  <full-screen-box :top="true" :fullscreen="true">
    <span>
      <ul
        class="collection notepads-selector"
        style="margin-top: 10px; margin-bottom: 20px;"
      >
        <li class="collection-item"
        >
          <span v-if="items.length > 0"
            class="unselectable"
            style="display: block; margin: 0 auto; margin-top: 15px; margin-bottom: 15px;"
            @click="$emit('test_remote')"
          >
            Блокноты{{persisted}}
            <a class="btn-flat btn-floating"
              style="position: absolute;
                    top: 23px;
                    right: 20px"
              @click="$emit('toggle_theme')"
            >
              <font-awesome-icon icon="sun" v-if="current_theme == 'light'" key="light_theme" />
              <font-awesome-icon icon="moon" v-else key="dark_theme" />
            </a>

          </span>
          <span v-else
            class="unselectable"
            style="display: block;
                   margin: 0 auto;
                   margin-top: 5px;
                   margin-bottom: 10px;
                   padding: 0 40px;"
          >
            У вас пока еще не создано ни одного блокнота. Создайте новый{{persisted}}
            <a class="btn-flat btn-floating"
              style="position: absolute;
                    top: 23px;
                    right: 20px"
              @click="$emit('toggle_theme')"
            >
              <font-awesome-icon icon="sun" v-if="current_theme == 'light'" key="light_theme" />
              <font-awesome-icon icon="moon" v-else key="dark_theme" />
            </a>
          </span>

          <a v-for="item in items"
            :key="item.id"
            class="waves-effect waves-teal btn notepads-selector-item"
            style="width: 100%; margin-bottom: 10px;"
            @click.prevent="open_handler(item)"
          >
            <font-awesome-icon
              v-if="item.encrypted"
              style="margin-right: 5px;"
              icon="lock"
            />
            <span class="">{{item.notepad_name}}</span>
          </a>
        </li>
        <li class="collection-item"
        >
          <a
            class="waves-effect waves-teal btn notepads-selector-item"
            style="width: 100%;"
            @click="$emit('start-creation-wizard')"
          >
            Создать блокнот
          </a>
        </li>
      </ul>
        <a
          href="https://offlinepad.com/chat/new"
          target="_blank"
          class="grey_icon"
          style="padding-left: 10px; line-height: 29px; text-decoration: underline;"
        >
          <span>Есть вопрос? Задайте в его чате</span>
        </a>
    </span>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  // import NotepadsSelectorItem from "./NotepadsSelectorItem.vue";

  export default {
    props: {
      "items": Array,
      "current_theme": {},
    },
    
    components: {
      FullScreenBox,
      // NotepadsSelectorItem,
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
        add_name: "",
        add_mode: "create",
        error: null,
        import_file_error: null,
        persisted: "",
      };
      window.navigator.storage.persisted().then(
        (persisted) => {
          if(persisted) {
            this.persisted = ".";
          } else {
            this.persisted = "";
          }
        }
      );
      return data;
    },

    mounted: function() {
    },

    watch: {
      'add_name': function() {
        this.error = null;
      },
    },

    methods: {
      open_handler: function(item) {
        this.$emit("open", item);
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
