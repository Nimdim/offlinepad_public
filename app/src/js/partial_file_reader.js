let BLOCK_SIZE = 1024 * 100;

class PartialFileReader {
    constructor(file, callback) {
        this.file = file;
        this.size = file.size;
        this.callback = callback;
        this.abort = false;
    }

    start() {
        this.start = 0;
        this.buffer = "";
        return this._read_next();
    }

    abort() {
        this.abort = true;
    }

    _read_next() {
        let promise;
        if(this.start < this.size) {
            this.end = this.start + BLOCK_SIZE;
            if(this.end > this.size) {
                this.end = this.size;
            }
            promise = this._read_part().then(function(data_part) {
                if(this.abort) {
                    throw new Error("abort");
                }
                this.start = this.end;
                this.buffer = this.buffer + data_part;
                this._process_buffer();
                return this._read_next();
            }.bind(this));
        } else {
            promise = Promise.resolve();
        }
        return promise;
    }

    _read_part() {
        let promise = new Promise(function (resolve) {
            let reader = new FileReader();
            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    resolve(evt.target.result);
                }
            };
            reader.readAsText(this._slice());
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

    _process_buffer() {
        while(this._detect_dict());
    }

    _detect_dict() {
        let index;
        let parenteese = 0;
        let start_detected = false;
        let start;
        for(index = 0; index < this.buffer.length; index++) {
            if(this.buffer[index] == "{") {
                if(!start_detected) {
                    start_detected = true;
                    start = index;
                }
                parenteese += 1;
            }
            if(this.buffer[index] == "}") {
                parenteese -= 1;
            }
            if(start_detected) {
                if(parenteese == 0) {
                    let end = index + 1;
                    let json_data = this.buffer.slice(start, end);
                    this.buffer = this.buffer.slice(end);
                    this.callback(JSON.parse(json_data));
                    return true;
                }
            }
        }
        return false;
    }
}

export default PartialFileReader
