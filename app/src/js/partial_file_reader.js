let BLOCK_SIZE = 1024 * 100;

// function uintToString(uintArray) {
//     var encodedString = String.fromCharCode.apply(null, uintArray);
//         // decodedString = decodeURIComponent(escape(encodedString));
//     return encodedString;
//     // return decodedString;
// }

class PartialFileReader {
    constructor(file, callback) {
        this.file = file;
        this.size = file.size;
        this.processed = 0;
        this.callback = callback;
        this._abort = false;
    }

    start() {
        this.start = 0;
        this.buffer = new Uint8Array();
        return this._read_next();
    }

    abort() {
        this._abort = true;
    }

    async _read_next() {
        if(this.start < this.size) {
            this.end = this.start + BLOCK_SIZE;
            if(this.end > this.size) {
                this.end = this.size;
            }
            let data_part = await this._read_part();
            data_part = new Uint8Array(data_part);
            if(this._abort) {
                throw new Error("abort");
            }
            this.start = this.end;
            let new_buffer = new Uint8Array(this.buffer.length + data_part.length);
            new_buffer.set(this.buffer);
            new_buffer.set(data_part, this.buffer.length);
            this.buffer = new_buffer;
            await this._process_buffer();
            await this._read_next();
        }
    }

    _read_part() {
        let promise = new Promise(function (resolve) {
            let reader = new FileReader();
            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    resolve(evt.target.result);
                }
            };
            reader.readAsArrayBuffer(this._slice());
        }.bind(this));
        return promise;
    }

    _slice() {
        let blob;
        if (this.file.webkitSlice) {
            blob = this.file.webkitSlice(this.start, this.end);
        } else if (this.file.mozSlice) {
            blob = this.file.mozSlice(this.start, this.end);
        } else if (this.file.slice) {
            blob = this.file.slice(this.start, this.end);
        } else {
            throw new Error("can't slice");
        }
        return blob;
    }

    async _process_buffer() {
        while(await this._detect_dict());
    }

    async _detect_dict() {
        let index;
        let parenteese = 0;
        let start_detected = false;
        let start;
        for(index = 0; index < this.buffer.length; index++) {
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
                    let progress = this.processed / this.size;
                    await this.callback(JSON.parse(json_data), progress);
                    return !this._abort;
                }
            }
        }
        return false;
    }
}

export default PartialFileReader
