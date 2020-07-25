import { assert } from "chai";
import _ from "lodash";

import { MockedPartialFileReader } from './../src/js/partial_file_reader.js';

describe("partial file reader tests", function() {
    let readed_data = [];
    let reader_callback = async function(object) {
        readed_data.push(object);
    };

    it("simple no objects", async function() {
        let data = '';
        data = new TextEncoder("utf-8").encode(data);
        let EXPECTED = [];
        let reader = new MockedPartialFileReader(data, reader_callback);
        let result = await reader.start();
        assert.equal(result, true);
        assert.deepEqual(readed_data, EXPECTED);
    });

    it("simple one object", async function() {
        let data = '{"a": 1}';
        data = new TextEncoder("utf-8").encode(data);
        let EXPECTED = [
            {
                "a": 1,
            },
        ];
        readed_data = [];
        let reader = new MockedPartialFileReader(data, reader_callback);
        let result = await reader.start();
        assert.equal(result, true);
        assert.deepEqual(readed_data, EXPECTED);
    });

    it("simple two objects", async function() {
        let data = '{"a": 1}{"b": 2}';
        data = new TextEncoder("utf-8").encode(data);
        let EXPECTED = [
            {
                "a": 1,
            },
            {
                "b": 2,
            },
        ];
        readed_data = [];
        let reader = new MockedPartialFileReader(data, reader_callback);
        let result = await reader.start();
        assert.equal(result, true);
        assert.deepEqual(readed_data, EXPECTED);
    });

    it("complex with escaping", async function() {
        let data = '{"a\\"}}}":"\\"}}}"}{"b}}}": "}}}\\\\2"}';
        data = new TextEncoder("utf-8").encode(data);
        let EXPECTED = [
            {
                "a\"}}}": "\"}}}",
            },
            {
                "b}}}": "}}}\\2",
            },
        ];
        readed_data = [];
        let reader = new MockedPartialFileReader(data, reader_callback);
        let result = await reader.start();
        assert.equal(result, true);
        assert.deepEqual(readed_data, EXPECTED);
    });
});
