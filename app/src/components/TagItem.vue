<template>
  <li class="collection-item"
    :class="{'editing': data.edit_state}"
    style="padding-top: 5px; padding-right: 5px; padding-bottom: 5px; padding-left: 10px;"
    v-on:click="$emit('click', data.id)"
  >
    <p style="margin-block-start: 0; margin-block-end: 0;">
      <input v-if="data.edit_state"
        ref="name"
        placeholder="Название тега"
        type="text"
        class="validate tag_name text-input--standart-style"
        style="width: calc(100% - 115px);"
        v-model="data.name"
        @keydown.ctrl.enter="submit_edit"
        @click.stop=""
        />
      <template v-else>
        <span class="chip" style="position: relative; top: -9px; margin-right: 15px; margin-bottom: 0px;">{{data.count}}</span>
        <span class="tag_name" v-html="tag.name_highlighted"></span>
      </template>
      <template v-if="data.edit_state">
        <a class="waves-effect waves-teal btn-small right tag_delete_btn"
          key="edit_submit"
          style="margin-right: 10px;"
          @click.stop.prevent="submit_edit"
        >
          <font-awesome-icon icon="check" />
        </a>
        <a class="waves-effect waves-teal btn-small right tag_delete_btn red button-space"
          key="edit_cancel"
          @click.stop.prevent="cancel_edit">
          <font-awesome-icon icon="times-circle" />
        </a>
      </template>
      <template v-else-if="delete_prompt">
        <a class="waves-effect waves-teal btn-small right tag_delete_btn"
          key="delete_cancel"
          style="margin-right: 10px;"
          @click.stop.prevent="delete_prompt = false">
          <font-awesome-icon icon="times-circle" />
        </a>
        <a class="waves-effect waves-teal btn-small right tag_delete_btn red button-space"
          key="delete_submit"
          @click.stop.prevent="$emit('delete', data.id)">
          <font-awesome-icon icon="trash" />
        </a>
      </template>
      <template v-else>
        <a class="waves-effect waves-teal btn-flat btn-small right tag_delete_btn"
          key="normal_delete"
          style="margin-right: 10px;"
          @click.stop.prevent="delete_prompt = true"
        >
          <font-awesome-icon icon="trash" class="grey_icon" />
        </a>
        <a class="waves-effect waves-teal btn-flat btn-small right tag_delete_btn button-space"
          key="normal_edit"
          @click.stop.prevent="edit_item"
        >
          <font-awesome-icon icon="pen" class="grey_icon" />
        </a>
      </template>
      <template v-if="data.edit_state">
        <span v-if="error_text"
          class="red-text"
        >
          {{error_text}}
        </span>
      </template>
    </p>
  </li>
</template>

<script>
  import _ from "lodash";

  export default {

    props: {
      tag: Object,
    },

    mounted: function() {
      if(this.data.id == "__new_item__") {
        this.enter_edit_state();
      }
    },

    watch: {
      "data.edit_state": function(new_value) {
        this.$emit("edit_state_changed", this.data);
        if(new_value) {
          this.enter_edit_state();
        }
      },
    },

    computed: {
      error_text: function() {
        if(this.data.error == "existing") {
          return "Тег с таким названием существует";
        } else if (this.data.error == "empty") {
          return "название не может быть пустым";
        } else {
          return null;
        }
      },
    },

    data: function() {
      let data = {
        delete_prompt: false,
        data: _.cloneDeep(this.tag),
      }
      if(data.data.edit_state == null) {
        data.data.edit_state = false;
      }
      data.data.error = null;
      this.$emit("edit_state_changed", data.data);
      return data;
    },

    methods: {

      change_edit_state: function(value) {
        this.data.edit_state = value;
        this.$emit("edit_state_changed", this.data);
      },

      enter_edit_state: function() {
        this.$nextTick(() => {
          this.$refs.name.focus();
        });
      },

      edit_item: function() {
        this.backup_name = this.data.name;
        this.change_edit_state(true);
      },

      cancel_edit: function() {
        if(this.data.id != "__new_item__") {
          this.data.error = null;
          this.change_edit_state(false);
          this.data.name = this.backup_name;
        }
        this.change_edit_state(false);
        this.$emit('cancel', this.data);
      },

      submit_edit: function() {
        this.change_edit_state(false);
        this.$emit('submit', this.data);
      },
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  span.tag_name {
    width: calc(100% - 180px);
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
