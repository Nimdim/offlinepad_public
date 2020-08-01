<template>
  <full-screen-box :fullscreen="true">


    <ul
      class="collection"
      style="margin-top: 70px;"
    >

      <li
        class="collection-item"
      >
        <span>
          <span class="left">
            <font-awesome-icon icon="th" />
            Название блокнота
          </span><br>
          <div class="col s12">
            <div class="row" style="margin: 0px;">
              <input
                ref="add_name_input"
                placeholder=""
                type="text"
                class="validate"
                v-model="notepad_name_local"
              >
              <a
                class="waves-effect waves-teal btn left action-button"
                style="width: 100%"
                @click.prevent="$emit('change_notepad_name', notepad_name_local)"
              >
                <span>Изменить</span>
              </a>
            </div>
          </div>
        </span>
      </li>

      <li
        class="collection-item"
      >
        <span>
          <span class="left">
            <font-awesome-icon icon="th" />
            Блокировка при неактивности
          </span><br>
          <span class="left wizard-hinttext"
          >
            Если не будете пользоваться блокнотом в течение указанного времени, будет выполнен автоматический выход на главный экран. Задайте время до блокировки в секундах от 20 до 180 (пусто - блокировка отключена).
          </span>
          <div class="col s12">
            <div class="row" style="margin: 0px;">
              <input
                ref="add_name_input"
                placeholder=""
                type="text"
                class="validate"
                v-model="notepad_lock_interval_local"
              >
              <a
                class="waves-effect waves-teal btn left action-button"
                style="width: 100%"
                @click.prevent="$emit('change_notepad_lock_interval', notepad_lock_interval_local)"
              >
                <span>Изменить</span>
              </a>
            </div>
          </div>
        </span>
      </li>

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
          <div class="col s12">
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
          </div>
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
          <div class="col s12">
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
          </div>
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
            Резервные копии позволят вам не потерять ваши данные при
            утере или поломке устройства,
            а также при переносе записей на другое устройство.
          </span>
          <div class="col s12">
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
                <span v-if="encrypted">Незашифрованная</span>
                <span v-else>Создать</span>
              </a>
              <span class="left wizard-hinttext" v-if="encrypted">
                Записи блокнота будут сохранены в файл в исходном виде.
              </span>
            </div>
          </div>
        </span>
      </li>

      <li class="collection-item"
      >
        <span>
          <div class="col s12">
            <div class="row" style="margin: 0px;">
              <a
                class="waves-effect waves-teal btn red"
                style="width: 100%;"
                @click.prevent="$emit('delete')"
              >
                Удалить блокнот
              </a>
            </div>
          </div>
        </span>
      </li>
    </ul>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";

  export default {
    props: {
      notepad_name: {
        type: String,
        required: true,
      },
      notepad_lock_interval: {
        type: String,
        default: "",
      },
      encrypted: {
        type: Boolean,
        default: false,
      },
      available_methods: {
        type: Object,
        default: () => { return {}; },
      },
    },

    data: function() {
      let data = {
        notepad_name_local: this.notepad_name,
        notepad_lock_interval_local: this.notepad_lock_interval,
      };
      return data;
    },

    components: {
      FullScreenBox,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
