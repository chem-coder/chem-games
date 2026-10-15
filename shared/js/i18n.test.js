import { test } from "node:test";
import assert from "node:assert/strict";
import { detectLang, makeT, pluralRu, elementName, LANGS } from "./i18n.js";

const fakeStore = (init = {}) => {
  const m = { ...init };
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = v; }, dump: () => m };
};

test("detectLang: URL wins and is remembered; then store; then en", () => {
  const st = fakeStore();
  assert.equal(detectLang("?lang=ru", st), "ru");
  assert.equal(st.dump()["cg-lang"], "ru");
  assert.equal(detectLang("", st), "ru");
  assert.equal(detectLang("?lang=xx", fakeStore()), "en");
  assert.equal(detectLang("", fakeStore()), "en");
});

test("makeT: translation, English fallback, key fallback, placeholders, function values", () => {
  const t = makeT({ en: { hi: "Hello {name}", only: "en only", n: (v) => `${v.n} items` }, ru: { hi: "Привет, {name}" } }, "ru");
  assert.equal(t("hi", { name: "Dalia" }), "Привет, Dalia");
  assert.equal(t("only"), "en only");
  assert.equal(t("missing"), "missing");
  assert.equal(t("n", { n: 3 }), "3 items");
});

test("pluralRu follows the 1 / 2–4 / 5+ rule incl. 11–14", () => {
  const f = (n) => pluralRu(n, "ошибка", "ошибки", "ошибок");
  assert.equal(f(1), "ошибка"); assert.equal(f(2), "ошибки"); assert.equal(f(4), "ошибки");
  assert.equal(f(5), "ошибок"); assert.equal(f(11), "ошибок"); assert.equal(f(21), "ошибка"); assert.equal(f(0), "ошибок");
});

test("elementName falls back to English when no localized name exists", () => {
  const el = { z: 1, name: "hydrogen" };
  assert.equal(elementName(el, "ru", { 1: "Водород" }), "Водород");
  assert.equal(elementName(el, "ru", {}), "hydrogen");
  assert.equal(elementName(el, "en", { 1: "Водород" }), "hydrogen");
  assert.deepEqual(LANGS, ["en", "ru"]);
});
