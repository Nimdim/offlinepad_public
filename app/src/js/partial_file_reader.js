let BLOCK_SIZE = 1024 * 100;

// function uintToString(uintArray) {
//     var encodedString = String.fromCharCode.apply(null, uintArray);
//         // decodedString = decodeURIComponent(escape(encodedString));
//     return encodedString;
//     // return decodedString;
// }

let slice_file = function(file, begin, end) {
    let blob;
    if (file.webkitSlice) {
        blob = file.webkitSlice(begin, end);
    } else if (file.mozSlice) {
        blob = file.mozSlice(begin, end);
    } else if (file.slice) {
        blob = file.slice(begin, end);
    } else {
        throw new Error("can't slice");
    }
    return blob;
}

let read_file = function(file) {
    let promise = new Promise(
        (resolve) => {
            let reader = new FileReader();
            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    resolve(evt.target.result);
                }
            };
            reader.readAsArrayBuffer(file);        
        }
    )
    return promise;
}

export class PartialFileReader {
    constructor(file, callback) {
        this.file = file;
        this.file_size = this._get_file_size(file);
        this.processed = 0;
        this.callback = callback;
        this._abort = false;
    }

    _get_file_size(file) {
        return file.size;
    }

    async start() {
        this.frame_start = 0;
        this.buffer = new Uint8Array();
        while((this.frame_start < this.file_size) && !this._abort) {
            await this._read_next();
        }
        return !this._abort;
    }

    abort() {
        this._abort = true;
    }

    async _read_next() {
        await this._read_next_frame();
        await this._process_buffer();
    }

    async _read_next_frame() {
        this.frame_end = this.frame_start + BLOCK_SIZE;
        if(this.frame_end > this.file_size) {
            this.frame_end = this.file_size;
        }
    
        let data_part = await this._read_file_frame();
        this._append_frame_to_buffer(data_part);
        this.frame_start = this.frame_end;    
    }

    async _read_file_frame() {
        let file_part = slice_file(this.file, this.frame_start, this.frame_end);
        return await read_file(file_part);
    }

    _append_frame_to_buffer(frame) {
        let frame_buffer = new Uint8Array(frame);
        let new_buffer = new Uint8Array(this.buffer.length + frame_buffer.length);
        new_buffer.set(this.buffer);
        new_buffer.set(frame_buffer, this.buffer.length);
        this.buffer = new_buffer;
    }

    async _process_buffer() {
        while(await this._detect_dict());
    }

    async _detect_dict() {
        let index;
        let parenteese = 0;
        let in_string = false;
        let start_detected = false;
        let start;
        for(index = 0; index < this.buffer.length; index++) {
            if(!in_string) {
                if(this.is_string_enter(this.buffer, index)) {
                    in_string = true;
                    continue;
                }
                if(this.buffer[index] == 123 /* { */) {
                    if(!start_detected) {
                        start_detected = true;
                        start = index;
                    }
                    parenteese += 1;
                }
                if(this.buffer[index] == 125 /* } */) {
                    parenteese -= 1;
                }
                if(start_detected) {
                    if(parenteese == 0) {
                        let end = index + 1;
                        let json_bytes = this.buffer.subarray(start, end);
                        let json_data = new TextDecoder("utf-8").decode(json_bytes);
                        this.processed += end;
                        this.buffer = this.buffer.slice(end);
                        let progress = this.processed / this.file_size;
                        await this.callback(JSON.parse(json_data), progress);
                        return !this._abort;
                    }
                }
            } else {
                if(this.is_string_exit(this.buffer, index)) {
                    in_string = false;
                }
            }
        }
        return false;
    }

    is_string_enter(buffer, index) {
        if(buffer[index] == 34 /* " */) {
            let count_escapers = 0;
            while(index > 0) {
                index--;
                if(buffer[index] == 92 /* \ */) {
                    count_escapers++;
                } else {
                    break;
                }
            }
            return (count_escapers % 2) == 0;
        }

        return false;
    }

    is_string_exit(buffer, index) {
        return this.is_string_enter(buffer, index);
    }

    get_buffer_value_at_pos(buffer, index) {
        if(index >= 0) {
            return buffer[index];
        } else {
            return 0;
        }
    }
}

export class MockedPartialFileReader extends PartialFileReader {
    _get_file_size(file) {
        return file.length;
    }

    async _read_file_frame() {
        return this.file.slice(this.frame_start, this.frame_end);
    }
}
