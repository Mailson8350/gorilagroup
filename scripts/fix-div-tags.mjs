import fs from "fs";

const files = process.argv.slice(2);
const badOpen = "<" + "motion" + "." + "div";
const goodOpen = "<" + "motion.div".slice(-3); // div -> actually "div" from slice(-3) of "motion.div" is "div" - wrong

// badOpen = <motion.div
// goodOpen = <div
const openFrom = "<" + "motion" + "." + "motion.div".substring(7); // wrong

const OPEN_BAD = "<" + ["m","o","t","i","o","n"].join("") + "." + ["d","i","v"].join("");
const OPEN_GOOD = "<" + ["d","i","v"].join("");
const CLOSE_BAD = "</" + ["m","o","t","i","o","n"].join("") + "." + ["d","i","v"].join("") + ">";
const CLOSE_GOOD = "</" + ["d","i","v"].join("") + ">";

for (const p of files) {
  let t = fs.readFileSync(p, "utf8");
  if (t.includes("from \"motion/react\"") || t.includes("from 'motion/react'")) {
    console.log(p, "skip (uses framer motion)");
    continue;
  }
  const n = (t.match(new RegExp(OPEN_BAD.replace(".", "\\."), "g")) || []).length;
  t = t.split(OPEN_BAD).join(OPEN_GOOD);
  t = t.split(CLOSE_BAD).join(CLOSE_GOOD);
  fs.writeFileSync(p, t);
  console.log(p, "fixed", n, "tags");
}
