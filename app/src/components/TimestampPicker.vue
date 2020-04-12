<template>
  <span class="timestamp">
    <input
      type="text"
      class="datepicker text-input--standart-style center"
      ref="date"
      style="width: 76px;"
      :value="picker_date"
    />
    <input
      type="text"
      class="timepicker text-input--standart-style center"
      ref="time"
      style="width: 45px; margin-left: 10px;"
      :value="picker_time"
    />
  </span>
</template>

<script>

import moment from "moment";

export default {
  props: {
    value: Number,
  },

  data: function() {
    let moment_stamp = moment(this.value);
    let data = {
      picker_date: moment_stamp.format("DD.MM.YYYY"),
      picker_time: moment_stamp.format("HH:mm"),
    };
    return data;
  },

  mounted: function() {
    let selected_date = moment(this.picker_date, "DD.MM.YYYY").toDate();
    let _this = this;
    let date_options = {
      format: "dd.mm.yyyy",
      firstDay: 1,
      defaultDate: selected_date,
      setDefaultDate: true,
      onClose: function() {
        _this.submit();
      },
      i18n: {
        cancel: 'Отмена',
        clear: 'Сбросить',
        done: 'Ок',
        previousMonth: '‹',
        nextMonth: '›',
        months:
        [
          'Январь',
          'Февраль',
          'Март',
          'Апрель',
          'Май',
          'Июнь',
          'Июль',
          'Август',
          'Сентябрь',
          'Октябрь',
          'Ноябрь',
          'Декабрь'
        ],
        monthsShort:
        [
          'Янв',
          'Фев',
          'Мар',
          'Апр',
          'Май',
          'Июн',
          'Июл',
          'Авг',
          'Сен',
          'Окт',
          'Ноя',
          'Дек'
        ], 
        weekdays:
        [
          'Воскресенье',
          'Понедельник',
          'Вторник',
          'Среда',
          'Четверг',
          'Пятница',
          'Суббота'
        ],
        weekdaysShort:
        [
          'Вск',
          'Пн',
          'Вт',
          'Ср',
          'Чтв',
          'Пт',
          'Сб'
        ],
        weekdaysAbbrev: ['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'],
      },
    };
    let time_options = {
      twelveHour: false,
      onCloseEnd: function() {
        _this.submit();
      },
      i18n: {
        cancel: 'Отмена',
        clear: 'Очистить',
        done: 'Ок',
      },
    };
    window.M.Datepicker.init(this.$refs.date, date_options);
    window.M.Timepicker.init(this.$refs.time, time_options);
  },

  beforeDestroy: function() {
    window.M.Datepicker.getInstance(this.$refs.date).destroy();
    window.M.Timepicker.getInstance(this.$refs.time).destroy();
  },

  methods: {
    "submit": function() {
      let datetime = this.$refs.date.value + " " + this.$refs.time.value;
      let stamp = moment(datetime, "DD.MM.YYYY HH:mm").unix() * 1000;
      this.$emit("change", stamp);
    },
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
