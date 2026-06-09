import fs from "fs";

const p = process.argv[2];
let t = fs.readFileSync(p, "utf8");
const tags = [
  "WRAPPER", "HEADER", "INNER", "LIST", "SKELETON", "EMPTY", "CARD",
  "ICONWRAP", "ICONBOX", "BODY", "TOP", "META", "DATE", "CONTENT", "ACTIONS",
];
const OPEN_BAD = "<" + ["m", "o", "t", "i", "o", "n"].join("") + "." + ["d", "i", "v"].join("");
const OPEN_GOOD = "<" + ["d", "i", "v"].join("");
const CLOSE_BAD = "</" + ["m", "o", "t", "i", "o", "n"].join("") + "." + ["d", "i", "v"].join("") + ">";
const CLOSE_GOOD = "</" + ["d", "i", "v"].join("") + ">";

for (const tag of tags) {
  t = t.replaceAll(`<${tag}`, "<div");
  t = t.replaceAll(`</${tag}>`, "</motion.div>".replace("motion.div", "div"));
  t = t.replaceAll(`</${tag}>`, "</div>");
}
t = t.split(OPEN_BAD).join(OPEN_GOOD);
t = t.split(CLOSE_BAD).join(CLOSE_GOOD);
fs.writeFileSync(p, t);
console.log("ok", p);
