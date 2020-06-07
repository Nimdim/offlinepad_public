import ru from "./ru.js"
import en from "./en.js"

import cryptobox from "./../cryptobox.js";

let LISTS = {
    en,
    ru,
};

let get_word = function(key, language) {
    return LISTS[language][key];
}

let get_one_dice = function() {
    let forever = true;
    while(forever) {
        let number = cryptobox.random_numbers_list(1)[0];
        if(number <= 251) {
            return Math.floor(number / 42) + 1;
        }
    }
}

let generate_word_index = function() {
    let list = [];
    for(let k = 0; k < 5; k++) {
      list.push(get_one_dice());
    }
    return list.join("");
}

let generate_indexes_list = function(count) {
    let indexes = [];
    for(let k = 0; k < count; k++) {
      indexes.push(generate_word_index());
    }
    return indexes;
}

let indexes_list_to_passphrase = function(list, language) {
    let result = [];
    for(let k = 0; k < list.length; k++) {
        let index = list[k];
        result.push(get_word(index, language))
    }
    return result;
}

export default {
    generate_indexes_list,
    indexes_list_to_passphrase,
};