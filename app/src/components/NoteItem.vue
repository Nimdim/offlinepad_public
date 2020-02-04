<template>
  <li class="collection-item">
    <span v-if="!note.hidden" v-on:click="$emit('click', note.id)">
      <p>
        <span class="timestamp">
          <i class="material-icons">access_time</i>
          <span>{{note.creation_time | note_datetime}}</span>
        </span>
        <a class="waves-effect waves-teal btn-floating right">
          <i class="material-icons" v-on:click.prevent.stop="$emit('hide', note.id)">delete</i>
        </a>
      </p>
      <p>
        <span v-for="tag in note.tags" :key="tag.id" class="chip">{{tag.name}}</span>
      </p>
      <p>{{note.text}}</p>
    </span>
    <p v-else>
      <a class="waves-effect waves-teal btn tag_delete_btn" style="margin-right: 10px;" v-on:click.prevent.stop="$emit('show', note.id)">
        <i class="material-icons">Отмена</i>
      </a>
      <a class="waves-effect waves-teal btn tag_delete_btn" v-on:click.prevent.stop="$emit('delete', note.id)">
        <i class="material-icons">Удалить</i>
      </a>
    </p>
  </li>
</template>

<script>

import moment from 'moment';

export default {
  props: {
    note: Object,
  },
  filters: {
    note_datetime: function(stamp) {
      return moment(stamp).format("DD MMMM YYYY HH:mm:ss");
    },
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
