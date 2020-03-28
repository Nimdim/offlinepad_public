<template>
  <li class="collection-item" v-on:click="$emit('click', data.id)">
    <p style="margin-block-start: 0; margin-block-end: 0;">
      <input v-if="data.edit_state"
        placeholder="Название метки"
        type="text"
        class="validate tag_name"
        v-model="data.name" />
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
    data: function() {
      let data = {
        delete_prompt: false,
        data: _.cloneDeep(this.tag),
      }
      if(data.data.edit_state == null) {
        data.data.edit_state = false;
      }
      return data;
    },
    methods: {
      edit_item: function() {
        this.backup_name = this.data.name;
        this.data.edit_state = true;
      },

      cancel_edit: function() {
        this.data.error_existing_name = false;
        this.data.edit_state = false;
        this.data.name = this.backup_name;
        this.$emit('cancel', this.data);
      },

      submit_edit: function() {
        this.data.edit_state = false;
        this.$emit('submit', this.data);
      },
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  input[type=text].tag_name {
    width: calc(100% - 95px);
    height: 2em;
  }
  span.tag_name {
    width: calc(100% - 160px);
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
