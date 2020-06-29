<template>
  <full-screen-box :top="true" :fullscreen="true">
    <span>
      <span
      >
        Удаленка
      </span>
      <ul
        class="collection notepads-selector"
      >
        <li class="collection-item"
          @click="$emit('start-creation-wizard')"
        >
          <span>
            Информация для входа
          </span><br>
          <span>
            id: {{session_id}}
          </span><br>
          <span>
            password: {{password}}
          </span><br>
          <span>
            state: {{receiver_state}}
          </span>
        </li>
        <li class="collection-item"
          @click="$emit('start-creation-wizard')"
        >
          <span>
            Подключиться
          </span><br>
          <span>
            id
            <input
              v-model="connection_session_id"
              type="text"
            /> 
          </span><br>
          <span>
            password
            <input
              v-model="connection_password"
              type="text"
            /> 
          </span>
          <a class="waves-effect waves-light btn right"
            @click="connect"
          >
            подключиться
          </a>


        </li>
      </ul>
    </span>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";

//   var socket = new WebSocket("ws://localhost:8081/ws/");
  
//   socket.onopen = function() {
//     alert("Соединение установлено.");
//   };
  
//   socket.onclose = function(event) {
//     if (event.wasClean) {
//       alert('Соединение закрыто чисто');
//     } else {
//       alert('Обрыв соединения'); // например, "убит" процесс сервера
//     }
//     alert('Код: ' + event.code + ' причина: ' + event.reason);
//   };
  
//   socket.onmessage = function(event) {
//     alert("Получены данные " + event.data);
//   };
  
//   socket.onerror = function(error) {
//     alert("Ошибка " + error.message);
//   };
  
//   socket.send("Привет");

  export default {
    props: {
      show: Boolean,
    },
    
    components: {
      FullScreenBox,
    },

    computed: {
    },

    data: function() {
      let data = {
        session_id: "1111",
        password: "password",
        connection_session_id: "1111",
        connection_password: "password",
        receiver_state: "offline",
      };
      return data;
    },

    mounted: function() {
      this.receiver = null;
      this.connect_receiver();
    },

    beforeDestroy: function() {
      this.close_receiver();
    },

    watch: {
    },

    methods: {
      connect_receiver: function() {
        let socket = new WebSocket("ws://localhost:8080/ws/");
        this.receiver = socket;
        
        socket.onopen = () => {
          this.receiver_state = "connected";
          let data = {
            command: "receiver",
            id: this.session_id,
          };
          this.receiver.send(JSON.stringify(data));
        };
        
        socket.onclose = (event) => {
          this.receiver_state = "closed";
          event;
        //   if (event.wasClean) {
        //     alert('Соединение закрыто чисто');
        //   } else {
        //     alert('Обрыв соединения'); // например, "убит" процесс сервера
        //   }
        //   alert('Код: ' + event.code + ' причина: ' + event.reason);
          this.receiver = null;
        };
        
        socket.onmessage = (event) => {
          let command = JSON.parse(event.data);
          if(command.command == "request") {
              if(command.api == "notepads_list") {
                  let data = {
                      command: "response",
                      data: ["a", "b", "c"],
                  };
                  this.receiver.send(JSON.stringify(data));
              }
          }
          alert("Получены данные " + event.data);
        };
        
        socket.onerror = function(error) {
          alert("Ошибка " + error.message);
        };

      },

      close_receiver: function() {
        this.receiver.close();
        this.receiver = null;
      },

      connect: function() {
        let socket = new WebSocket("ws://localhost:8080/ws/");
        this.client = socket;
        
        socket.onopen = () => {
          this.receiver_state = "connected";
          let data = {
            command: "client",
            id: this.session_id,
          };
          this.client.send(JSON.stringify(data));
          data = {
            command: "request",
            api: "notepads_list",
          };
          this.client.send(JSON.stringify(data));
        };
        
        socket.onclose = (event) => {
          this.receiver_state = "closed";
          event;
        //   if (event.wasClean) {
        //     alert('Соединение закрыто чисто');
        //   } else {
        //     alert('Обрыв соединения'); // например, "убит" процесс сервера
        //   }
        //   alert('Код: ' + event.code + ' причина: ' + event.reason);
          this.receiver = null;
        };
        
        socket.onmessage = function(event) {
          alert("Получены данные " + event.data);
        };
        
        socket.onerror = function(error) {
          alert("Ошибка " + error.message);
        };
      },
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .collection.notepads-selector .collection-item {
    padding: 10px;
  }

  .new-notepad-mode {
    margin-left: 20px;
    margin-right: 20px;
    cursor: pointer;
  }

  .new-notepad-mode.active {
    text-decoration: underline;
    font-weight: bold;
  }

  .one-notepad-center {
      position: relative;
      display: inline-block;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
  }

</style>
