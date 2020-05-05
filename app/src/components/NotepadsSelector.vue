<template>
  <full-screen-box :top="true" :fullscreen="true">
    Блокноты
    <ul
      class="collection notepads-selector"
    >
      <notepads-selector-item
        v-for="item in items" :key="item.id"
        :item="item"
        :active="active == item.id"
        @click="active = item.id"
        @open="$emit('open', item.id)"
        @save="$emit('save', item.id)"
        @remove="$emit('remove', item.id)"
      />
      <li class="collection-item"
        @click="active = 'add'"
      >
        <span v-if="active == 'add'">
          <form class="col s12">
            <div class="row" style="margin-bottom: 0px;">
              <div class="input-field col s12">
                <input
                  ref="add_name_input"
                  placeholder="Название блокнота"
                  type="text"
                  class="validate"
                  v-model="add_name"
                >
              </div>
              <div class="input-field col s12">
                <select ref="selects">
                  <option value="1" selected>Не шифрованный</option>
                  <option value="2" disabled>Зашифрованный</option>
                </select>
                <label>Тип блокнота</label>
              </div>
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn"
                  @click="create_notepad"
                >
                  <font-awesome-icon icon="plus"/>
                  Создать блокнот
                </a>
              </div>
            </div>
          </form>
        </span>
        <span v-else>
          <font-awesome-icon icon="plus"/>
        </span>
      </li>
    </ul>

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

    data: function() {
      let data = {
        active: null,
        add_name: "test",
      };
      return data;
    },

    mounted: function() {
      this.add_select_instances = null;
    },

    watch: {
      'active': function(value) {
        if(value == "add") {
          this.add_name = "";
          this.$nextTick(() => {
            this.$refs.add_name_input.focus();
            let elems = this.$refs.selects;
            this.add_select_instances = window.M.FormSelect.init(elems);
          });
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
      create_notepad: function() {
        if(this.add_name != "") {
          this.$emit('create', this.add_name);
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
</style>
