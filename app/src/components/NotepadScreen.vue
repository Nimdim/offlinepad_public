<template>
  <full-screen-box :fullscreen="true">


    <ul
      class="collection"
      style="margin-top: 70px;"
    >
      <li v-if="encrypted"
        class="collection-item"
      >
        <span>
          <span class="left">
            <font-awesome-icon icon="th" />
            Пин-код
            <span v-if="available_methods.pin"
              class="highlight"
            >
              подключен
            </span>
          </span><br>
          <span class="left wizard-hinttext"
          >
            Самый удобный способ защиты: для открытия блокнота требуется
            ввод всего нескольких цифр.
            Работает только при наличии доступа к серверу OfflinePad
          </span>
          <form class="col s12">
            <div class="row" style="margin: 0px;">
              <a
                class="waves-effect waves-teal btn left action-button"
                style="width: 100%"
                @click.prevent="$emit('set_pin')"
              >
                <span v-if="!available_methods.pin">Задать</span>
                <span v-else>Изменить</span>
              </a>
              <a
                v-if="available_methods.pin"
                class="waves-effect waves-teal btn right action-button"
                style="width: 100%; margin-top: 10px;"
                @click.prevent="$emit('delete_pin')"
              >
                Удалить
              </a>
            </div>
          </form>
        </span>
      </li>

      <li v-if="encrypted"
        class="collection-item"
      >
        <span>
          <span class="left">
            <font-awesome-icon icon="key" />
            Пароль
            <span v-if="available_methods.password"
              class="highlight"
            >
              подключен
            </span>
          </span><br>
          <span class="left wizard-hinttext">
            Открывайте блокнот удобным для вас паролем.
            Хранится на устройстве и работает вне зависимости от наличия сети.
          </span>
          <form class="col s12">
            <div class="row" style="margin: 0px;">
              <a
                class="waves-effect waves-teal btn left action-button"
                style="width: 100%"
                @click.prevent="$emit('set_password')"
              >
                <span v-if="!available_methods.password">Задать</span>
                <span v-else>Изменить</span>
              </a>
              <a
                v-if="available_methods.password"
                class="waves-effect waves-teal btn right action-button"
                style="width: 100%; margin-top: 10px;"
                @click.prevent="$emit('delete_password')"
              >
                Удалить
              </a>
            </div>
          </form>
        </span>
      </li>

      <li class="collection-item"
      >
        <span>
          <span class="left">
            <font-awesome-icon icon="file-download" />
            Резервная копия
          </span>
          <span class="left wizard-hinttext">
            Резервные копии позволят вам защитить ваши данные от потери,
            а также при переносе записей на другое устройство.
          </span>
          <form class="col s12">
            <div class="row" style="margin: 0px;">
              <a v-if="encrypted"
                class="waves-effect waves-teal btn action-button"
                style="width: 100%;"
                @click.prevent="$emit('export_encrypted')"
              >
                Зашифрованная
              </a>
              <span v-if="encrypted" class="left wizard-hinttext">
                Записи будут сохранены в зашифрованном виде.
                Доступ к ним возможен только при наличии ключевой фразы.
              </span>
              <a
                class="waves-effect waves-teal btn action-button"
                style="width: 100%;"
                @click.prevent="$emit('export_unencrypted')"
              >
                Незашифрованная
              </a>
              <span class="left wizard-hinttext">
                Записи блокнота будут сохранены в файл в исходном виде.
              </span>
            </div>
          </form>
        </span>
      </li>

      <li class="collection-item"
      >
        <span>
          <form class="col s12">
            <div class="row" style="margin: 0px;">
              <a
                class="waves-effect waves-teal btn red"
                style="width: 100%;"
                @click.prevent="$emit('delete')"
              >
                Удалить блокнот
              </a>
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
      available_methods: {
        type: Object,
        default: () => { return {}; },
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
