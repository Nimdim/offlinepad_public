<template>
  <li class="collection-item" :class="{'editing': data.edit_state}">
    <span>
      <p class="note-timestamp-controls">
        <span class="timestamp">
          <font-awesome-icon
            icon="calendar-alt"
            class="grey_icon"
            style="width: 16px; height: 16px;" />&nbsp;
          <timestamp-picker v-if="data.edit_state"
            :value="data.creation_time"
            @change="data.creation_time = $event"
          />
          <span v-else>
            {{data.creation_time | note_datetime}}
          </span>
        </span>
        <template v-if="data.edit_state">
          <a class="waves-effect waves-teal btn-small right"
            key="edit_submit"
            v-on:click.prevent="submit">
            <font-awesome-icon icon="check" />
          </a>
          <a class="waves-effect waves-teal btn-small right red"
            key="edit_cancel"
            @click.prevent="cancel_edit">
            <font-awesome-icon icon="times-circle" />
          </a>
        </template>
        <template v-else>
          <template v-if="delete_prompt">
            <a class="waves-effect waves-teal btn-small right"
              key="delete_cancel"
              @click.prevent="delete_prompt = false">
              <font-awesome-icon icon="times-circle" />
            </a>
            <a class="waves-effect waves-teal btn-small right red"
            key="delete_submit"
              v-on:click.prevent="$emit('delete', data.id)">
              <font-awesome-icon icon="trash" />
            </a>
          </template>
          <template v-else>
            <a class="waves-effect waves-teal btn-flat btn-small right"
              key="normal_delete"
              @click.prevent="delete_prompt = true"
            >
              <font-awesome-icon icon="trash" class="grey_icon" />
            </a>
            <a class="waves-effect waves-teal btn-flat btn-small right"
              key="normal_edit"
              @click.prevent="edit_item"
            >
              <font-awesome-icon icon="pen" class="grey_icon" />
            </a>
          </template>
        </template>
      </p>
      <p v-if="data.edit_state"
        style="margin-bottom: 0px;"
      >
        <tags-list 
          :initial_tags="data.tags"
          :all_tags="tags"
          @change="data.tags = $event"
        />
      </p>
      <p v-else
        style="margin-top: 0px; margin-bottom: 0px; line-height: 1.5em;">
        <span v-for="tag in data.tags" :key="tag.id"
          class="chip"
        >
          {{get_tag_name(tag)}}
        </span>
      </p>


      <textarea v-if="data.edit_state"
        ref="textarea"
        class="materialize-textarea"
        placeholder="Текст записи"
        v-model="data.text" />
      <template v-else>
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
      dst = dst + make_link_representation(link_part);
    }
    src = end_part;
  }
  return dst;
}

let make_link_representation = function(link) {
  let id = null;
  if((link.indexOf("https://www.youtube.com/watch") == 0)) {
    id = new URL(link).searchParams.get("v")
  }
  if(link.indexOf("https://youtu.be/") == 0) {
    id = link.replace("https://youtu.be/", "");
  }
  let result;
  if(id != null) {
    id = "https://i3.ytimg.com/vi/" + id + "/hqdefault.jpg";
    result = "<a class='width-eq-parent' target='_blank' href='" + link + "'><img class='width-eq-parent' style='max-width: 200px;' src='" + id + "' ></a>";
  } else {
    result = make_default_link(link);
  }
  return result;
};

let make_default_link = function(link) {
  return "<a href='" + link + "' target='_blank'>" + link + "</a>";
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
    this.$emit("edit_state_changed", data.data);
    return data;
  },

  filters: {
    "note_datetime": function(stamp) {
      return moment(stamp).format("DD MMMM YYYY HH:mm");
    },
  },

  methods: {
    text_for_show: function(note) {
      let text = replace_links_with_hrefs(note.text_highlighted, "http");
      text = replace_links_with_hrefs(text, "https");
      let parts = text.split('\n');
      return parts;
    },

    enter_edit_state: function() {
      this.$nextTick(() => {
        this.$refs.textarea.focus();
        window.M.textareaAutoResize(this.$refs.textarea);
      });
    },

    edit_state_change: function(value) {
      this.data.edit_state = value;
      this.$emit("edit_state_changed", this.data);
    },

    "submit": function() {
      this.data.tags = _.filter(this.data.tags, function(tag) {return tag != "0";})
      this.edit_state_change(false);
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
      this.edit_state_change(true);
    },

    "cancel_edit": function() {
      if(this.data.id != "__new_item__") {
        this.data.text = this.backup_text;
        this.data.tags = this.backup_tags;
        this.data.creation_time = this.backup_creation_time;
        this.edit_state_change(false);
      }
      this.edit_state_change(false);
      this.$emit('cancel', this.data);
    }
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
