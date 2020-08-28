import { assert } from "chai";
import _ from "lodash";
import IndexedDBStorage from "../src/js/indexeddb_storage.js";

class TestStorage extends IndexedDBStorage {
    constructor() {
        super()
        this.DB_VERSION = 1;
    }

    _upgrade_needed(event) {
        let db = event.target.result;
        let store_options = { keyPath: "id", autoIncrement: true};
        switch(event.oldVersion) {
            case 0: {
                db.createObjectStore("test_items", store_options);
            }
        }
    }
}

describe("indexeddb tests", function() {
    let storage = new TestStorage();

    it("init", async function() {
        await storage.init("database");
    });

    it("create item", async function() {
        let item = {
            id: 1,
            data: "text",
        };
        let id = await storage.create_item_in_store("test_items", item);
        assert.equal(id, 1);
    });

    it("create item duplicate id", async function() {
        let item = {
            id: 1,
            data: "text1",
        };
        let error = false;
        try {
            await storage.create_item_in_store("test_items", item);
        } catch(e) {
            if(e.name == "ConstraintError") {
                error = true;
            }
        }
        assert.equal(error, true);
    });

    it("create items with duplicate id", async function() {
        let items = [
            {
                id: 2,
                data: "text2",
            },
            {
                id: 2,
                data: "text3",
            },
        ];
        let error = false;
        try {
            await storage.create_items_in_store("test_items", items);
        } catch(e) {
            if(e.name == "ConstraintError") {
                error = true;
            }
        }
        assert.equal(error, true);
    });
});
