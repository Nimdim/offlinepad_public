<template>
  <full-screen-box :fullscreen="true">


    <ul
      class="collection notepads-selector"
      style="margin-top: 70px;"
    >
      <li v-if="encrypted"
        class="collection-item"
      >
        <span>
          Пин-код
          <form class="col s12">
            <div class="row" style="margin: 0px;">
              <div class="input-field col s12" style="margin: 0px;">
                <a
                  class="waves-effect waves-teal btn left"
                  @click.prevent="$emit('set_pin')"
                >
                  Задать
                </a>
                <a
                  class="waves-effect waves-teal btn right"
                  @click.prevent="$emit('delete_pin')"
                >
                  Удалить
                </a>
              </div>
            </div>
          </form>
        </span>
      </li>

      <li v-if="encrypted"
        class="collection-item"
      >
        <span>
          Пароль
          <form class="col s12">
            <div class="row" style="margin: 0px;">
              <div class="input-field col s12" style="margin: 0px;">
                <a
                  class="waves-effect waves-teal btn left"
                  @click.prevent="$emit('set_password')"
                >
                  Задать
                </a>
                <a
                  class="waves-effect waves-teal btn right"
                  @click.prevent="$emit('delete_password')"
                >
                  Удалить
                </a>
              </div>
            </div>
          </form>
        </span>
      </li>

      <li class="collection-item"
      >
        <span>
          Резервная копия
          <form class="col s12">
            <div class="row" style="margin: 0px;">
              <div class="input-field col s12" style="margin: 0px;">
                <a v-if="encrypted"
                  class="waves-effect waves-teal btn"
                  style="width: 100%;"
                  @click.prevent="$emit('export_encrypted')"
                >
                  Зашифрованная
                </a>
                <a
                  class="waves-effect waves-teal btn"
                  style="width: 100%;"
                  @click.prevent="$emit('export_unencrypted')"
                >
                  Незашифрованная
                </a>
              </div>
            </div>
          </form>
        </span>
      </li>

      <li class="collection-item"
      >
        <span>
          <form class="col s12">
            <div class="row" style="margin: 0px;">
              <div class="input-field col s12" style="margin: 0px;">
                <a
                  class="waves-effect waves-teal btn red"
                  style="width: 100%;"
                  @click.prevent="$emit('delete')"
                >
                  Удалить блокнот
                </a>
              </div>
            </div>
          </form>
        </span>
      </li>
    </ul>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";

  export default {
    props: {
      encrypted: {
        type: Boolean,
        default: false,
      },
    },

    components: {
      FullScreenBox,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
