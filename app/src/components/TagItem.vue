<template>
  <li class="collection-item"
    :class="{'editing': data.edit_state}"
    v-on:click="$emit('click', data.id)"
  >
    <p style="margin-block-start: 0; margin-block-end: 0;">
      <input v-if="data.edit_state"
        ref="name"
        placeholder="Название метки"
        type="text"
        class="validate tag_name text-input--standart-style"
        style="width: calc(100% - 95px);"
        v-model="data.name"
        @keydown.enter="submit_edit"
        />
      <span class="tag_name" v-else v-html="'(' + data.count + ') ' + tag.name_highlighted"></span>
      <template v-if="data.edit_state">
        <a class="waves-effect waves-teal btn-small right tag_delete_btn"
          key="edit_submit"
          @click.prevent="submit_edit"
        >
          <font-awesome-icon icon="check" />
        </a>
        <a class="waves-effect waves-teal btn-small right tag_delete_btn red"
          key="edit_cancel"
          @click.prevent="cancel_edit">
          <font-awesome-icon icon="times-circle" />
        </a>
      </template>
      <template v-else-if="delete_prompt">
        <a class="waves-effect waves-teal btn-small right tag_delete_btn"
          key="delete_cancel"
          @click.prevent="delete_prompt = false">
          <font-awesome-icon icon="times-circle" />
        </a>
        <a class="waves-effect waves-teal btn-small right tag_delete_btn red"
          key="delete_submit"
          @click.prevent="$emit('delete', data.id)">
          <font-awesome-icon icon="trash" />
        </a>
      </template>
      <template v-else>
        <a class="waves-effect waves-teal btn-flat btn-small right tag_delete_btn"
          key="normal_delete"
          v-on:click.prevent="delete_prompt = true"
        >
          <font-awesome-icon icon="trash" class="grey_icon" />
        </a>
        <a class="waves-effect waves-teal btn-flat btn-small right tag_delete_btn"
          key="normal_edit"
          v-on:click.prevent="edit_item"
        >
          <font-awesome-icon icon="pen" class="grey_icon" />
        </a>
      </template>
      <template v-if="data.edit_state">
        <span v-if="data.error_existing_name"
          class="red-text"
        >
          метка с таким именем уже есть
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
        if(new_value) {
          this.enter_edit_state();
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
      this.$emit("edit_state_changed", data.data.edit_state);
      return data;
    },

    methods: {

      change_edit_state: function(value) {
        this.data.edit_state = value;
        this.$emit("edit_state_changed", value);
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
          this.data.error_existing_name = false;
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
    width: calc(100% - 160px);
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
