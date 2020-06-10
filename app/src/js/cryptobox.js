import aesjs from "aes-js";

let random_numbers_generator;
if(global == null) {
    random_numbers_generator = window.crypto.getRandomValues;
} else {
    let crypto = require('crypto');
    random_numbers_generator = (buf) => {
        let crypto_buf = crypto.randomBytes(buf.length);
        let typed_buf = new Uint8Array(crypto_buf);
        buf.set(typed_buf);
    }
}

let random_numbers_list = function(length) {
    let buf = new Uint8Array(length);
    random_numbers_generator(buf);
    let result = [];
    for(let k = 0; k < buf.length; k++) {
        result.push(buf[k]);
    }
    return result;
};

let create_aes = function(key, iv) {
    return new aesjs.ModeOfOperation.cbc(key, iv);
};

let add_padding = function(bytes) {
    let filled = bytes.length % 16;
    let needed = 16 - filled;
    let result = new Uint8Array(bytes.length + needed);
    result.set(bytes);
    let zeros = (new Array(needed)).fill(0);
    result.set(zeros, bytes.length);
    return result;
};

let remove_padding = function(bytes) {
    let last_index = bytes.length - 1;
    while(last_index > 0) {
        if(bytes[last_index] != 0) {
            break;
        }
        last_index -= 1;
    }
    let result = bytes.slice(0, last_index + 1);
    return result;
};

let encrypt = function(open_text, key) {
    var iv = new Uint8Array(16);
    random_numbers_generator(iv);
    let aes = create_aes(key, iv);

    var open_bytes = aesjs.utils.utf8.toBytes(open_text);
    open_bytes = add_padding(open_bytes);
    let encrypted_bytes = aes.encrypt(open_bytes);
    let encrypted_text = aesjs.utils.hex.fromBytes(iv) +
                         aesjs.utils.hex.fromBytes(encrypted_bytes);
    return encrypted_text;
};

let decrypt = function(encrypted_text, key) {
    let encrypted_bytes = aesjs.utils.hex.toBytes(encrypted_text);

    let iv = encrypted_bytes.slice(0, 16);
    let aes = create_aes(key, iv);
    encrypted_bytes = encrypted_bytes.slice(16);

    let open_bytes = aes.decrypt(encrypted_bytes);
    open_bytes = remove_padding(open_bytes);
    let open_text = aesjs.utils.utf8.fromBytes(open_bytes);
    return open_text;
};

let LOWER_CASE_LETTERS_ENG = "abcdefghijklmnopqrstuvwxyz";
let UPPER_CASE_LETTERS_ENG = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let LOWER_CASE_LETTERS_RU = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
let UPPER_CASE_LETTERS_RU = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
let NUMBERS = "0123456789";
let SPECIALS = "`~!@#№$%^&*()[]{};:'\"<>\\/?-=+_";
let ALPHABETS = [
    LOWER_CASE_LETTERS_ENG,
    UPPER_CASE_LETTERS_ENG,
    LOWER_CASE_LETTERS_RU,
    UPPER_CASE_LETTERS_RU,
    NUMBERS,
    SPECIALS,
];

let calc_alphabet_size = function(password) {
    let size = 0;
    for(let k = 0; k < ALPHABETS.length; k++) {
        let alphabet = ALPHABETS[k];
        if(is_alphabet_used(alphabet, password)) {
            size = size + alphabet.length;
        }
    }
    return size;
};

let is_alphabet_used = function(alphabet, password) {
    for(let k = 0; k < password.length; k++) {
        let letter = password[k];
        if(alphabet.indexOf(letter) >= 0) {
            return true;
        }
    }
    return false;
}

export default {
    random_numbers_list,
    encrypt,
    decrypt,
    calc_alphabet_size,
};
