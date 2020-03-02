<template>
  <li class="collection-item">
    <span>
      <template v-if="data.edit_state">
        <p>
          <span class="timestamp">
            <font-awesome-icon icon="calendar-alt" />&nbsp;
            <span>{{data.creation_time | note_datetime}}</span>
          </span>

          <a class="waves-effect waves-teal btn-small right"
            v-on:click.prevent.stop="submit">
            <font-awesome-icon icon="check" />
          </a>
          <a class="waves-effect waves-teal btn-small right red"
            @click.prevent.stop="$emit('cancel', data)">
            <font-awesome-icon icon="times-circle" />
          </a>
        </p>
        <p>
          <span v-for="(tag, index) in data.tags" :key="tag.id" class="chip">
            <select class="browser-default" v-model="data.tags[index]">
              <option value="0" disabled selected>Выберите</option>
              <option v-for="global_tag in tags" :key="global_tag.id"
                :value="global_tag.id" :selected="tag == global_tag.id">
                {{global_tag.name}}
              </option>
            </select>
            <font-awesome-icon icon="trash" @click="delete_tag(index)" />
          </span>
          <span class="chip"
            @click="add_tag">
            <font-awesome-icon icon="plus" />
          </span>
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
            <a class="waves-effect waves-teal btn-flat btn-small right">
              <font-awesome-icon icon="trash" class="grey_icon" @click.prevent.stop="delete_prompt = true" />
            </a>
            <a class="waves-effect waves-teal btn-flat btn-small right">
              <font-awesome-icon icon="pen" class="grey_icon" @click.prevent.stop="edit_item" />
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

export default {
  props: {
    note: Object,
    tags: Array,
  },
  data: function() {
    let data = {
      data: _.cloneDeep(this.note),
      delete_prompt: false,
    };
    return data;
  },
  filters: {
    note_datetime: function(stamp) {
      return moment(stamp).format("DD MMMM YYYY HH:mm:ss");
    },
  },
  watch: {
    "data.edit_state": function(value) {
      if(value) {
        setTimeout(function() {
          window.M.textareaAutoResize(this.$refs.textarea);
        }.bind(this), 0);
      }
    },
  },
  methods: {
    "submit": function() {
      this.data.tags = _.filter(this.data.tags, function(tag) {return tag != 0;})
      this.$emit('submit', this.data);
    },

    "add_tag": function() {
      this.data.tags.push(0);
    },
    
    "delete_tag": function(index) {
      this.data.tags.splice(index, 1);
    },

    "get_tag_name": function(tag_id) {
      let tag = _.find(this.tags, function(item) {return item.id == tag_id});
      return tag.name;
    },

    "edit_item": function() {
      this.data._old_text = this.data.text;
      this.data._old_tags = _.cloneDeep(this.data.tags);
      this.data.edit_state = true;
    },
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
