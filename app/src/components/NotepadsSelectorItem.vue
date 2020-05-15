<template>
  <li class="collection-item"
    :class="{'selected': data.edit_state}"
    @click="$emit('click')"
  >
    <span>
      <div style="">
        <font-awesome-icon icon="lock" v-show="data.encrypted" />
        <span class="">{{data.notepad_name}}</span>
        <a class="waves-effect waves-light btn-small right"
          style="position: relative; top: -6px;"
          @click.stop="$emit('open')"
        >
          <font-awesome-icon icon="book-open" />
        </a>
      </div>
      <div v-if="active">
        <preloader v-if="deleting" />
        <template v-else>
          <a class="waves-effect waves-light btn"
            style="width: 100%; margin-top: 10px;"
            @click="$emit('save')"
          >
            <font-awesome-icon icon="download" />
            Скачать резервную копию
          </a>
          <div v-if="delete_prompt">
            <a class="waves-effect waves-light btn red"
              key="delete_ok"
              style="width: 50%; margin-top: 10px;"
              @click="remove"
            >
              <font-awesome-icon icon="check" />
              Подтвердить
            </a>
            <a class="waves-effect waves-light btn"
              key="delete_cancel"
              style="width: 50%; margin-top: 10px;"
              @click="delete_prompt = false"
            >
              <font-awesome-icon icon="times-circle" />
              Отмена
            </a>
          </div>
          <div v-else>
            <a class="waves-effect waves-light btn red"
              key="normal_delete"
              style="width: 100%; margin-top: 10px;"
              @click="delete_prompt = true"
            >
              <font-awesome-icon icon="trash" />
              Удалить
            </a>
          </div>
        </template>
      </div>
    </span>
  </li>
</template>
<script>
  import _ from "lodash";
  import Preloader from './Preloader.vue'

  export default {
    components: {
      Preloader,
    },

    props: {
      item: Object,
      active: Boolean,
    },

    mounted: function() {
    },

    watch: {
    },

    data: function() {
      let data = {
        data: _.cloneDeep(this.item),
        delete_prompt: false,
        deleting: false,
      };
      return data;
    },

    methods: {
      remove: function() {
        this.deleting = true;
        this.$emit('remove');
      },
    }
  }
</script>
