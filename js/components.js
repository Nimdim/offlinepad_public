Vue.component("opl-tag-item", {

    props: ["tag"],

    template: '<li class="collection-item" v-on:click="$emit(\'click\', tag.id)">' +
        '<p v-if="tag.hidden !== true">' +
        '<label v-on:click.stop="">' +
            '<input type="checkbox" v-model="tag.checked"/>' +
            '<span>{{tag.name}}</span>' +
        '</label>' +
        '<span class="badge">{{tag.count}}</span>' +
        '<a class="waves-effect waves-teal btn right tag_delete_btn" v-on:click.prevent.stop="$emit(\'hide\', tag.id)">' +
            '<i class="material-icons">delete</i>' +
        '</a>' +
        '</p>' +
        '<p v-else>' +
        '<span class="badge visibility_hidden">{{tag.count}}</span>' +
        '<span class="visiblilty_hidden">stub</span>' +
        '<a class="waves-effect waves-teal btn tag_delete_btn right" v-on:click.prevent.stop="$emit(\'show\', tag.id)">' +
            '<i class="material-icons">Отмена</i>' +
        '</a>' +
        '<a class="waves-effect waves-teal btn tag_delete_btn right" style="margin-right: 10px;" v-on:click.prevent.stop="$emit(\'delete\', tag.id)">' +
            '<i class="material-icons">Удалить</i>' +
        '</a>' +
        '</p>' +
    '</li>',

});

Vue.component("opl-loadscreen", {

    props: ["visible"],

    watch: {
        "visible": function(value) {
            setTimeout(function() {
                if(value) {
                    $("#loadscreen").fadeIn();
                } else {
                    $("#loadscreen").fadeOut();
                }
            }, 0);
        }
    },

    template: '<div id="loadscreen"> ' +
        '<span class="center_span"> ' +
        '<div class="preloader-wrapper big active"> ' +
        '<div class="spinner-layer spinner-blue-only"> ' +
            '<div class="circle-clipper left"> ' +
            '<div class="circle"></div> ' +
            '</div><div class="gap-patch"> ' +
            '<div class="circle"></div> ' +
            '</div><div class="circle-clipper right"> ' +
            '<div class="circle"></div> ' +
            '</div> ' +
        '</div> ' +
        '</div> ' +
        '</span> ' +
    '</div> ',

});
