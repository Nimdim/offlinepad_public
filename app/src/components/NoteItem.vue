<template>
  <li class="collection-item">
    <span>
      <template v-if="data.edit_state">
        <p>
          <span class="timestamp">
            <font-awesome-icon icon="calendar-alt" />&nbsp;
            <timestamp-picker
              :value="data.creation_time"
              @change="data.creation_time = $event"
            />
          </span>

          <a class="waves-effect waves-teal btn-small right"
            v-on:click.prevent.stop="submit">
            <font-awesome-icon icon="check" />
          </a>
          <a class="waves-effect waves-teal btn-small right red"
            @click.prevent.stop="cancel_edit">
            <font-awesome-icon icon="times-circle" />
          </a>
        </p>
        <p>
          <tags-list
            :initial_tags="data.tags"
            :all_tags="tags"
            @change="data.tags = $event"
          />
        </p>
        <textarea ref="textarea" class="materialize-textarea" v-model="data.text"></textarea>
      </template>
      <template v-else>
        <p>
          <span class="timestamp">
            <font-awesome-icon icon="calendar-alt" class="grey_icon" style="width: 16px; height: 16px;" />&nbsp;
            <span>{{data.creation_time | note_datetime}}</span>
          </span>
          <template v-if="delete_prompt">
            <a class="waves-effect waves-teal btn-small right"
              @click.prevent.stop="delete_prompt = false">
              <font-awesome-icon icon="times-circle" />
            </a>
            <a class="waves-effect waves-teal btn-small right red"
              v-on:click.prevent.stop="$emit('delete', data.id)">
              <font-awesome-icon icon="trash" />
            </a>
          </template>
          <template v-else>
            <a class="waves-effect waves-teal btn-flat btn-small right"
              @click.prevent.stop="delete_prompt = true"
            >
              <font-awesome-icon icon="trash" class="grey_icon" />
            </a>
            <a class="waves-effect waves-teal btn-flat btn-small right"
              @click.prevent.stop="edit_item"
            >
              <font-awesome-icon icon="pen" class="grey_icon" />
            </a>
          </template>
        </p>
        <p>
          <span v-for="tag in data.tags" :key="tag.id" class="chip">{{get_tag_name(tag)}}</span>
        </p>
        <p class="multiline-text"><span v-html="note.text_highlighted"></span></p>
      </template>
    </span>
  </li>
</template>

<script>

import _ from "lodash";
import moment from "moment";
import TagsList from './TagsList.vue'
import TimestampPicker from './TimestampPicker.vue'

export default {
  components: {
    TagsList,
    TimestampPicker,
  },

  props: {
    note: Object,
    tags: Array,
  },

  mounted: function() {
    window.M.textareaAutoResize(this.$refs.textarea);
  },

  data: function() {
    let data = {
      data: _.cloneDeep(this.note),
      delete_prompt: false,
    };
    if(data.data.edit_state == null) {
      data.data.edit_state = false;
    }
    return data;
  },

  filters: {
    "note_datetime": function(stamp) {
      return moment(stamp).format("DD MMMM YYYY HH:mm");
    },
  },

  methods: {
    "submit": function() {
      this.data.tags = _.filter(this.data.tags, function(tag) {return tag != 0;})
      this.data.edit_state = false;
      this.$emit('submit', this.data);
    },

    "get_tag_name": function(tag_id) {
      let tag = _.find(this.tags, function(item) {return item.id == tag_id});
      return tag.name;
    },

    "edit_item": function() {
      this.backup_text = this.data.text;
      this.backup_tags = _.cloneDeep(this.data.tags);
      this.backup_creation_time = this.data.creation_time;
      this.data.edit_state = true;
    },

    "cancel_edit": function() {
      this.data.text = this.backup_text;
      this.data.tags = this.backup_tags;
      this.data.creation_time = this.backup_creation_time;
      this.data.edit_state = false;
      this.$emit('cancel', this.data);
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
