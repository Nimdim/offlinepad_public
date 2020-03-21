<template>
  <li class="collection-item">
    <span>
      <template v-if="data.edit_state">
        <p class="note-timestamp-controls">
          <span class="timestamp">
            <font-awesome-icon icon="calendar-alt" />&nbsp;
            <timestamp-picker
              :value="data.creation_time"
              @change="data.creation_time = $event"
            />
          </span>

          <a class="waves-effect waves-teal btn-small right"
            key="edit_submit"
            v-on:click.prevent.stop="submit">
            <font-awesome-icon icon="check" />
          </a>
          <a class="waves-effect waves-teal btn-small right red"
            key="edit_cancel"
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
        <p class="note-timestamp-controls">
          <span class="timestamp">
            <font-awesome-icon icon="calendar-alt" class="grey_icon" style="width: 16px; height: 16px;" />&nbsp;
            <span>{{data.creation_time | note_datetime}}</span>
          </span>
          <template v-if="delete_prompt">
            <a class="waves-effect waves-teal btn-small right"
              key="delete_cancel"
              @click.prevent.stop="delete_prompt = false">
              <font-awesome-icon icon="times-circle" />
            </a>
            <a class="waves-effect waves-teal btn-small right red"
            key="delete_submit"
              v-on:click.prevent.stop="$emit('delete', data.id)">
              <font-awesome-icon icon="trash" />
            </a>
          </template>
          <template v-else>
            <a class="waves-effect waves-teal btn-flat btn-small right"
              key="normal_delete"
              @click.prevent.stop="delete_prompt = true"
            >
              <font-awesome-icon icon="trash" class="grey_icon" />
            </a>
            <a class="waves-effect waves-teal btn-flat btn-small right"
              key="normal_edit"
              @click.prevent.stop="edit_item"
            >
              <font-awesome-icon icon="pen" class="grey_icon" />
            </a>
          </template>
        </p>
        <p>
          <span v-for="tag in data.tags" :key="tag.id" class="chip">{{get_tag_name(tag)}}</span>
        </p>
        <p v-for="(text_part, ix) in text_for_show(note)" :key="ix"
          class="multiline-text"
          v-html="text_part" />
      </template>
    </span>
  </li>
</template>

<script>

import _ from "lodash";
import moment from "moment";
import TagsList from './TagsList.vue'
import TimestampPicker from './TimestampPicker.vue'

let replace_links_with_hrefs = function(text, protocol) {
  let src = text, dst = "";
  while(src.length > 0) {
    let pos = src.indexOf(protocol + "://");
    if(pos == -1) {
      pos = src.length;
    }
    let end = src.indexOf(" ", pos);
    if(end == -1) {
      end = src.length;
    }
    let end2 = src.indexOf("\n", pos);
    if(end2 == -1) {
      end2 = src.length;
    }
    end = Math.min(end, end2);
    let start_part = src.slice(0, pos);
    let link_part = src.slice(pos, end);
    let end_part = src.slice(end);
    dst = dst + start_part;
    if(link_part.length > 0) {
      dst = dst + "<a href='" + link_part + "'>" + link_part + "</a>";
    }
    src = end_part;
  }
  return dst;
}

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
    if(this.data.edit_state) {
      this.enter_edit_state();
    }
  },

  watch: {
    "data.edit_state": function(value) {
      if(value) {
        this.enter_edit_state();
      }
    },
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
    text_for_show: function(note) {
      let text = replace_links_with_hrefs(note.text_highlighted, "https");
      text = replace_links_with_hrefs(text, "http");
      let parts = text.split('\n');
      return parts;
    },

    enter_edit_state: function() {
      let _this = this;
      this.$nextTick(function() {
        window.M.textareaAutoResize(_this.$refs.textarea);
      })
    },

    "submit": function() {
      this.data.tags = _.filter(this.data.tags, function(tag) {return tag != "0";})
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
  .note-timestamp-controls {
    margin-block-start: 0;
  };
</style>
