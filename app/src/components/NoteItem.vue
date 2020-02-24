<template>
  <li class="collection-item">
    <span v-if="delete_prompt !== true" v-on:click="$emit('click', data.id)">
      <template v-if="data.edit_state">
        <p>
          <span class="timestamp">
            <i class="material-icons">access_time</i>
            <span>{{data.creation_time | note_datetime}}</span>
          </span>

          <a class="waves-effect waves-teal btn right"
            v-on:click.prevent.stop="submit">
            <i class="material-icons">done</i>
          </a>
          <a class="waves-effect waves-teal btn right"
            @click.prevent.stop="$emit('cancel', data)">
            <i class="material-icons">cancel</i>
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
            <i class="material-icons add-tag-to-note"
              @click="delete_tag(index)">delete</i>
          </span>
          <span class="chip"
            @click="add_tag">
            <i class="material-icons add-tag-to-note">add</i>
          </span>
        </p>
        <textarea ref="textarea" class="materialize-textarea" v-model="data.text"></textarea>
      </template>
      <template v-else>
        <p>
          <span class="timestamp">
            <i class="material-icons">access_time</i>
            <span>{{data.creation_time | note_datetime}}</span>
          </span>
          <a class="waves-effect waves-teal btn-floating right">
            <i class="material-icons"
              @click.prevent.stop="delete_prompt = true">
              delete
            </i>
          </a>
          <a class="waves-effect waves-teal btn-floating right">
            <i class="material-icons"
              @click.prevent.stop="edit_item">
              create
            </i>
          </a>
        </p>
        <p>
          <span v-for="tag in data.tags" :key="tag.id" class="chip">{{get_tag_name(tag)}}</span>
        </p>
        <p class="multiline-text">{{data.text}}</p>
      </template>
    </span>
    <p v-else>
      <a class="waves-effect waves-teal btn tag_delete_btn"
        style="margin-right: 10px;"
        v-on:click.prevent.stop="delete_prompt = false">
        <i class="material-icons">Отмена</i>
      </a>
      <a class="waves-effect waves-teal btn tag_delete_btn"
        v-on:click.prevent.stop="$emit('delete', data.id)">
        <i class="material-icons">Удалить</i>
      </a>
    </p>
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
          window.M.textareaAutoResize(window.$(this.$refs.textarea));
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
