<template>
  <li class="collection-item"
    :class="{'selected': data.edit_state}"
    @click="$emit('click')"
  >
    <span>
      <div>
        <font-awesome-icon icon="lock" v-show="data.encrypted" />
        <span class="">{{data.name}}</span>
      </div>
      <div v-if="active">
        <a class="waves-effect waves-light btn"
          @click="$emit('open')"
        >
          <!-- <font-awesome-icon icon="plus"/> -->
          Открыть
        </a>
        <a class="waves-effect waves-light btn"
          @click="$emit('save')"
        >
          <!-- <font-awesome-icon icon="plus"/> -->
          Сохранить
        </a>
        <a class="waves-effect waves-light btn"
          @click="$emit('remove')"
        >
          <!-- <font-awesome-icon icon="plus"/> -->
          Удалить
        </a>
      </div>
    </span>
  </li>
</template>

<script>

import _ from "lodash";
// import moment from "moment";
// import TagsList from './TagsList.vue'
// import TimestampPicker from './TimestampPicker.vue'


export default {
  components: {
    // TagsList,
    // TimestampPicker,
  },

  props: {
    item: Object,
    active: Boolean,
  },

  mounted: function() {
    // if(this.data.edit_state) {
    //   this.enter_edit_state();
    // }
  },

  watch: {
    // "data.edit_state": function(value) {
    //   if(value) {
    //     this.enter_edit_state();
    //   }
    // },
  },

  data: function() {
    let data = {
      data: _.cloneDeep(this.item),
      delete_prompt: false,
    };
    // if(data.data.edit_state == null) {
    //   data.data.edit_state = false;
    // }
    // this.$emit("edit_state_changed", data.data);
    return data;
  },

  methods: {
    // text_for_show: function(note) {
    //   let text = replace_links_with_hrefs(note.text_highlighted, "http");
    //   text = replace_links_with_hrefs(text, "https");
    //   let parts = text.split('\n');
    //   return parts;
    // },

    // enter_edit_state: function() {
    //   this.$nextTick(() => {
    //     this.$refs.textarea.focus();
    //     window.M.textareaAutoResize(this.$refs.textarea);
    //   });
    // },

    // edit_state_change: function(value) {
    //   this.data.edit_state = value;
    //   this.$emit("edit_state_changed", this.data);
    // },

    // "submit": function() {
    //   this.data.tags = _.filter(this.data.tags, function(tag) {return tag != "0";})
    //   this.edit_state_change(false);
    //   this.$emit('submit', this.data);
    // },

    // "get_tag_name": function(tag_id) {
    //   let tag = _.find(this.tags, function(item) {return item.id == tag_id});
    //   return tag.name;
    // },

    // "edit_item": function() {
    //   this.backup_text = this.data.text;
    //   this.backup_tags = _.cloneDeep(this.data.tags);
    //   this.backup_creation_time = this.data.creation_time;
    //   this.edit_state_change(true);
    // },

    // "cancel_edit": function() {
    //   if(this.data.id != "__new_item__") {
    //     this.data.text = this.backup_text;
    //     this.data.tags = this.backup_tags;
    //     this.data.creation_time = this.backup_creation_time;
    //     this.edit_state_change(false);
    //   }
    //   this.edit_state_change(false);
    //   this.$emit('cancel', this.data);
    // }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .note-timestamp-controls {
    margin-block-start: 0;
    margin-block-end: 0;
  }
</style>
