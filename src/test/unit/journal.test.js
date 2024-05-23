import { journals, createJournal, getJournal, deleteJournal } from '../../scripts/database/stores/journal';
import { assert, expect } from 'chai';

describe("Journal Stores", () => {
    it("Journal db initialized properly and empty", () => {
       expect(journals.get().length).eq(0);
    });

    it("Create journal", () => {
       createJournal("Hello World", "hello/world", "Hello World", ["Hello", "World"]);

       const content = journals.get();

       expect(content.length).eq(1);

       const journal = content[0];
       expect(journal.title).eq("Hello World");
       expect(journal.path).eq("hello/world");
       expect(journal.content).eq("Hello World");
       expect(journal.tags).to.have.members(["Hello", "World"]);
    });

    it("Create duplicate journal", () => {
        expect(
            () => createJournal("Hello World", "hello/world", "Hello World", ["Hello", "World"])
        ).to.throw()
    });

    it("Get valid journal", () => {
        const journal = getJournal("hello/world");

        expect(journal).not.null;

        expect(journal.title).eq("Hello World");
        expect(journal.path).eq("hello/world");
        expect(journal.content).eq("Hello World");
        expect(journal.tags).to.have.members(["Hello", "World"]);
    });

    it("Get invalid journal", () => {
        const journal = getJournal("does/not/exist");

        expect(journal).is.undefined;
    });

    it("Delete non-existing journal", () => {
        expect(deleteJournal("hello/world")).to.eq(true);

        expect(journals.get().length).eq(0);
    });

    it("Delete existing journal", () => {
        expect(deleteJournal("hello/world")).to.eq(false);
    });
});