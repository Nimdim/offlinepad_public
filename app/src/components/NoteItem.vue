<template>
  <li class="collection-item">
    <span>
      <template v-if="data.edit_state">
        <p>
          <span class="timestamp">
            <font-awesome-icon icon="calendar-alt" />&nbsp;
            <input
              type="text"
              class="datepicker"
              ref="date"
              style="width: 90px;"
              :value="picker_date"
            />
            <input
              type="text"
              class="timepicker"
              ref="time"
              style="width: 45px; margin-left: 10px;"
              :value="picker_time"
            />
              <!-- @click="select_datetime" -->
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

export default {
  components: {
    TagsList,
  },

  props: {
    note: Object,
    tags: Array,
  },

  data: function() {
    let data = {
      data: _.cloneDeep(this.note),
      delete_prompt: false,
      picker_date: "",
      picker_time: "",
    };
    if(data.data.edit_state == null) {
      data.data.edit_state = false;
    }
    return data;
  },

  filters: {
    note_datetime: function(stamp) {
      return moment(stamp).format("DD MMMM YYYY HH:mm");
    },
  },

  watch: {
    "data.edit_state": function(value) {
      if(value) {
        setTimeout(function() {
          this.enter_edit_mode();
        }.bind(this), 0);
      } else {
        window.M.Datepicker.getInstance(this.$refs.date).destroy();
        window.M.Timepicker.getInstance(this.$refs.time).destroy();
      }
    },
  },

  mounted: function() {
    if(this.data.edit_state) {
      this.enter_edit_mode();
    }
  },

  methods: {
    enter_edit_mode: function() {
      this.picker_date = moment(this.data.creation_time).format("DD.MM.YYYY");
      this.picker_time = moment(this.data.creation_time).format("HH:mm");
      window.M.textareaAutoResize(this.$refs.textarea);
      let date_options = {
        format: "dd.mm.yyyy",
      };
      let time_options = {
        twelveHour: false,
      };
      window.M.Datepicker.init(this.$refs.date, date_options);
      window.M.Timepicker.init(this.$refs.time, time_options);
    },

    "submit": function() {
      let datetime = this.$refs.date.value + " " + this.$refs.time.value;
      let stamp = moment(datetime, "DD.MM.YYYY HH:mm").unix() * 1000;
      this.data.creation_time = stamp;
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

    cancel_edit: function() {
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
