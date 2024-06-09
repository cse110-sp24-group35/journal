import { journals, createJournal, getJournal, deleteJournal } from '../../scripts/database/stores/journal';
import { expect } from 'chai';

describe("Journal Stores", () => {
    beforeEach(() => {
        // Reset the journals state before each test
        journals.set([]);
    });

    it("Journal db initialized properly and empty", () => {
        expect(journals.get().length).to.eq(0);
    });

    it("Create journal", () => {
        createJournal("Hello World", "hello/world", "Hello World", ["Hello", "World"]);

        const content = journals.get();

        expect(content.length).to.eq(1);

        const journal = content[0];
        expect(journal.title).to.eq("Hello World");
        expect(journal.path).to.eq("hello/world");
        expect(journal.content).to.eq("Hello World");
        expect(journal.tags).to.have.members(["Hello", "World"]);
    });

    it("Create duplicate journal", () => {
        createJournal("Hello World", "hello/world", "Hello World", ["Hello", "World"]);

        expect(() => createJournal("Hello World", "hello/world", "Hello World", ["Hello", "World"]))
            .to.throw(Error, 'Journal with path hello/world already exists!');
    });

    it("Remove leading slashes from path", () => {
        createJournal("Hello World", "/hello/world", "Hello World", ["Hello", "World"]);

        const content = journals.get();

        expect(content.length).to.equal(1);

        const journal = content[0];
        expect(journal.path).to.equal("hello/world");

        createJournal("Another Journal", "///another/path", "Content", ["Tag1", "Tag2"]);

        const anotherContent = journals.get();
        expect(anotherContent.length).to.equal(2);

        const anotherJournal = anotherContent[1];
        expect(anotherJournal.path).to.equal("another/path");
    });

    it("Throw error if path is invalid after removing slashes", () => {
        expect(() => createJournal("Invalid Path Journal", "////", "Content", ["Tag1", "Tag2"]))
            .to.throw(Error, "The path is not valid!");
    });

    it("Get valid journal", () => {
        createJournal("Hello World", "hello/world", "Hello World", ["Hello", "World"]);
        const journal = getJournal("hello/world");

        expect(journal).not.to.be.null;

        expect(journal.title).to.eq("Hello World");
        expect(journal.path).to.eq("hello/world");
        expect(journal.content).to.eq("Hello World");
        expect(journal.tags).to.have.members(["Hello", "World"]);
    });

    it("Get invalid journal", () => {
        const journal = getJournal("does/not/exist");

        expect(journal).to.be.undefined;
    });

    it("Delete existing journal", () => {
        createJournal("Hello World", "hello/world", "Hello World", ["Hello", "World"]);
        expect(deleteJournal("hello/world")).to.eq(true);

        expect(journals.get().length).to.eq(0);
    });

    it("Delete non-existing journal", () => {
        expect(deleteJournal("hello/world")).to.eq(false);
    });
});