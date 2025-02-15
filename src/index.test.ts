import { parse } from ".";

describe("Parser", () => {
  describe("Simple Expressions", () => {
    it("should parse simple id & value combos", () => {
      expect(parse("id:3")).toMatchObject({ id: 3 });

      expect(parse("slug:getting-started")).toMatchObject({
        slug: "getting-started",
      });
    });
  });

  describe("Global Expressions", () => {
    it("should parse simple id & value combos", () => {
      expect(parse("hello")).toBeNull();

      expect(
        parse("123456", {
          attributes: {
            id: { type: "number", searchable: true },
            tags: { type: "string", array: true, searchable: true },
            html: { type: "string", fulltext: true, searchable: true },
          },
        })
      ).toMatchObject({
        $or: [
          {
            id: 123456,
          },
          { tags: { $contains: ["123456"] } },
          { html: { $fulltext: "123456" } },
        ],
      });

      expect(
        parse("hello", {
          attributes: {
            id: { type: "string", searchable: true },
            tags: { type: "string", array: true, searchable: true },
            html: { type: "string", fulltext: true, searchable: true },
          },
        })
      ).toMatchObject({
        $or: [
          {
            id: "hello",
          },
          { tags: { $contains: ["hello"] } },
          { html: { $fulltext: "hello" } },
        ],
      });

      expect(
        parse("hello world", {
          attributes: {
            id: { type: "string", searchable: true },
            tags: { type: "string", array: true, searchable: true },
            html: { type: "string", fulltext: true, searchable: true },
          },
        })
      ).toMatchObject({
        $and: [
          {
            $or: [
              {
                id: "hello",
              },
              { tags: { $contains: ["hello"] } },
              { html: { $fulltext: "hello" } },
            ],
          },
          {
            $or: [
              {
                id: "world",
              },
              { tags: { $contains: ["world"] } },
              { html: { $fulltext: "world" } },
            ],
          },
        ],
      });

      expect(
        parse(`"hello world"`, {
          attributes: {
            id: { type: "string", searchable: true },
            tags: { type: "string", array: true, searchable: true },
            html: { type: "string", fulltext: true, searchable: true },
          },
        })
      ).toMatchObject({
        $or: [
          {
            id: "hello world",
          },
          { tags: { $contains: ["hello world"] } },
          { html: { $fulltext: "hello world" } },
        ],
      });
    });
  });

  describe("Comparison Query Operators", () => {
    it("can parse standard equals", () => {
      expect(parse(`count:5`)).toMatchObject({ count: 5 });

      expect(parse(`tag:getting-started`)).toMatchObject({
        tag: "getting-started",
      });

      expect(parse(`author:"Joe Bloggs"`)).toMatchObject({
        author: "Joe Bloggs",
      });

      expect(parse(`author:"123-test"`)).toMatchObject({ author: "123-test" });
    });

    it("can parse not equals", () => {
      expect(parse(`-count:5`)).toMatchObject({ $not: { count: 5 } });

      expect(parse(`-tag:getting-started`)).toMatchObject({
        $not: { tag: "getting-started" },
      });

      expect(parse(`-author:"Joe Bloggs"`)).toMatchObject({
        $not: { author: "Joe Bloggs" },
      });
    });

    it("can parse greater than", () => {
      expect(parse(`count:>5`)).toMatchObject({ count: { $gt: 5 } });

      expect(parse(`tag:>getting-started`)).toMatchObject({
        tag: { $gt: "getting-started" },
      });

      expect(parse(`author:>"Joe Bloggs"`)).toMatchObject({
        author: { $gt: "Joe Bloggs" },
      });
    });

    it("can parse less than", () => {
      expect(parse(`count:<5`)).toMatchObject({ count: { $lt: 5 } });

      expect(parse(`tag:<getting-started`)).toMatchObject({
        tag: { $lt: "getting-started" },
      });

      expect(parse(`author:<"Joe Bloggs"`)).toMatchObject({
        author: { $lt: "Joe Bloggs" },
      });
    });

    it("can parse greater than or equals", () => {
      expect(parse(`count:>=5`)).toMatchObject({ count: { $gte: 5 } });

      expect(parse(`tag:>=getting-started`)).toMatchObject({
        tag: { $gte: "getting-started" },
      });

      expect(parse(`author:>="Joe Bloggs"`)).toMatchObject({
        author: { $gte: "Joe Bloggs" },
      });
    });

    it("can parse less than or equals", () => {
      expect(parse(`count:<=5`)).toMatchObject({ count: { $lte: 5 } });

      expect(parse(`tag:<=getting-started`)).toMatchObject({
        tag: { $lte: "getting-started" },
      });

      expect(parse(`author:<="Joe Bloggs"`)).toMatchObject({
        author: { $lte: "Joe Bloggs" },
      });
    });
  });

  describe("Values", () => {
    it("can parse null", () => {
      expect(parse("image:null")).toMatchObject({ image: null });
    });

    it("can parse NOT null", () => {
      expect(parse("-image:null")).toMatchObject({ $not: { image: null } });
    });

    it("can parse true", () => {
      expect(parse("featured:true")).toMatchObject({ featured: true });
    });

    it("can parse NOT true", () => {
      expect(parse("-featured:true")).toMatchObject({
        $not: { featured: true },
      });
    });

    it("can parse false", () => {
      expect(parse("featured:false")).toMatchObject({ featured: false });
    });

    it("can parse NOT false", () => {
      expect(parse("-featured:false")).toMatchObject({
        $not: { featured: false },
      });
    });

    it("can parse a Number", () => {
      expect(parse("count:5")).toMatchObject({ count: 5 });
    });

    it("can parse NOT a Number", () => {
      expect(parse("-count:5")).toMatchObject({ $not: { count: 5 } });
    });

    it("can parse a Bigint", () => {
      expect(parse("count:9007199254740992")).toMatchObject({
        count: "9007199254740992",
      });
    });

    it("can parse NOT a Bigint", () => {
      expect(parse("-count:9007199254740992")).toMatchObject({
        $not: { count: "9007199254740992" },
      });
    });

    it("can parse a Date", () => {
      expect(parse(`date:2022-01-01`)).toMatchObject({
        date: new Date("2022-01-01"),
      });
    });

    it("can parse NOT a Date", () => {
      expect(parse("-date:2022-01-01")).toMatchObject({
        $not: { date: new Date("2022-01-01") },
      });
    });

    it("can parse a Datetime", () => {
      expect(parse(`date:2022-01-01T12:34:56`)).toMatchObject({
        date: new Date("2022-01-01T12:34:56"),
      });
    });

    it("can parse NOT a Datetime", () => {
      expect(parse("-date:2022-01-01T12:34:56")).toMatchObject({
        $not: { date: new Date("2022-01-01T12:34:56") },
      });
    });

    it("can parse a Datetime with timezone", () => {
      expect(parse(`date:2022-01-01T12:34:56+08:00`)).toMatchObject({
        date: new Date("2022-01-01T12:34:56+08:00"),
      });
    });

    it("can parse NOT a Datetime with timezone", () => {
      expect(parse("-date:2022-01-01T12:34:56+08:00")).toMatchObject({
        $not: { date: new Date("2022-01-01T12:34:56+08:00") },
      });
    });
  });

  describe("Logical Query Operators", () => {
    it("$and", () => {
      expect(parse("page:false status:published")).toMatchObject({
        $and: [{ page: false }, { status: "published" }],
      });
    });

    it("$or", () => {
      expect(parse("page:true OR featured:true")).toMatchObject({
        $or: [{ page: true }, { featured: true }],
      });

      expect(parse("page:true OR page:false")).toMatchObject({
        $or: [{ page: true }, { page: false }],
      });
    });
  });

  describe("Whitespace rules", function () {
    it("will ignore whitespace in expressions", function () {
      expect(parse(`- count : 5`)).toMatchObject(parse(`-count:5`));
      expect(parse(`- author : joe  tag : photo`)).toMatchObject(
        parse(`-author:joe tag:photo`)
      );
    });

    it("will not ignore whitespace in strings", function () {
      expect(parse(`author : "Hello World"`)).not.toMatchObject(
        parse(`author:'HelloWorld'`)
      );
    });
  });
});
