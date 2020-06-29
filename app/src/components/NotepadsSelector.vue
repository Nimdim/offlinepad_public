<template>
  <full-screen-box :top="true" :fullscreen="true">
    <span>
      <span v-if="items.length > 0"
        class="notepads-selector"
        style="display: block; margin: 0 auto; margin-top: 10px;"
        @click="$emit('test_remote')"
      >
        Блокноты
      </span>
      <span v-else
        class="notepads-selector"
        style="display: block; margin: 0 auto; margin-bottom: 10px;"
      >
        У вас пока еще не создано ни одного блокнота. Создайте новый.
      </span>
      <ul
        class="collection notepads-selector"
        style="margin-top: 10px; margin-bottom: 20px;"
      >
        <notepads-selector-item
          v-for="item in items" :key="item.id"
          :item="item"
          @click="open_handler(item)"
        />
        <li class="collection-item"
          @click="$emit('start-creation-wizard')"
        >
          <span>
            <font-awesome-icon icon="plus"/>
            <!-- создать блокнот -->
          </span>
        </li>
      </ul>
    </span>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import NotepadsSelectorItem from "./NotepadsSelectorItem.vue";

  export default {
    props: {
      "items": Array,
    },
    
    components: {
      FullScreenBox,
      NotepadsSelectorItem,
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
      };
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
