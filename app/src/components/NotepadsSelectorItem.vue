<template>
  <li class="collection-item"
    :class="{'selected': data.edit_state}"
    @click="$emit('click')"
  >
    <span>
      <div>
        <!-- <font-awesome-icon
          style="position: absolute;
                 left: 25px;"
          icon="book"
        /> -->
        <font-awesome-icon
          v-if="data.encrypted"
          style="margin-right: 5px;"
          icon="lock"
        />
        <span class="">{{data.notepad_name}}</span>
      </div>
    </span>
  </li>
</template>
<script>
  import _ from "lodash";

  export default {
    components: {
    },

    props: {
      item: Object,
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
