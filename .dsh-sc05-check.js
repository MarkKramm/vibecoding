const fs = require('fs');
const p = 'ai-roadmaps/safety-career/05-phase-career-in-the-ai-era.md';
const buf = fs.readFileSync(p);
const t = buf.toString('utf8');
const L = t.split('\n');
console.log('lines:', L.length - (t.endsWith('\n') ? 1 : 0));
console.log('BOM:', buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF);
console.log('CRLF count:', (t.match(/\r\n/g) || []).length);
console.log('tab count:', (t.match(/\t/g) || []).length);
console.log('emdash U+2014:', (t.match(/\u2014/g) || []).length);
console.log('ellipsis U+2026:', (t.match(/\u2026/g) || []).length);

const req = [
  '## Goal of this phase',
  '## Estimated time',
  "## Skills you'll gain",
  '## Specific topics to learn',
  '## Tools for This Phase',
  '## Free/cheap resources',
  '## Lesson: Career in the AI Era',
  '## Hands-on practice tasks',
  '## Common Pitfalls',
  '## Deliverable / proof of work',
  '## Checklist',
  '## Quiz',
  "## You're ready to move on when...",
  '## Free vs Paid',
];
const nl = String.fromCharCode(10);
const pos = req.map((h) => t.indexOf(nl + h + nl));
console.log('all H2 present:', pos.every((x) => x >= 0));
console.log('H2 order ascending:', pos.every((v, i) => i === 0 || v > pos[i - 1]));
console.log('total H2:', (t.match(/^## /gm) || []).length);
console.log('H2 lines:', JSON.stringify(t.match(/^## .*$/gm), null, 0));

const tasks = [...t.matchAll(/^(\d+)\. .*<!-- id: (sc-05-career-in-the-ai-era-t\d\d) band: (quick|focused|deep|ongoing) energy: (low|normal|high) -->/gm)];
console.log('tasks:', tasks.length);
const chk = [...t.matchAll(/^- \[ \] .*<!-- id: (sc-05-career-in-the-ai-era-c\d\d) energy: (low|normal|high) -->/gm)];
console.log('checklist:', chk.length);
const qids = [...t.matchAll(/^### (Q\d)\. .*<!-- id: (sc-05-career-in-the-ai-era-q\d\d) energy: (low|normal|high) -->/gm)];
console.log('quiz headings with ids:', qids.length, qids.map((m) => m[1] + '=' + m[2]).join(' '));
console.log('option lines carrying ids (must be 0):', (t.match(/^- \[.\] .*<!-- id:/gm) || []).length);

const qb = t.split(/^### Q\d+\./m).slice(1);
const tally = { A: 0, B: 0, C: 0, D: 0 };
qb.forEach((b) => {
  const opts = [...b.matchAll(/^- \[( |x)\] /gm)];
  const i = opts.findIndex((o) => o[1] === 'x');
  tally['ABCD'[i]]++;
});
console.log('position tally:', JSON.stringify(tally), 'max:', Math.max(...Object.values(tally)));
console.log('Why lines:', (t.match(/^\*\*Why:\*\*/gm) || []).length);
console.log('Unverified markers:', (t.match(/\*\*Unverified\*\*/g) || []).length);

// id uniqueness + sequential padding
const allIds = [...t.matchAll(/id: (sc-05-career-in-the-ai-era-[tcq]\d\d)/g)].map((m) => m[1]);
const set = new Set(allIds);
console.log('authored ids:', allIds.length, 'unique:', set.size);
const prereqOk = /^prerequisites:\n  - safety-career\/04$/m.test(t);
console.log('prereq ok:', prereqOk);
console.log('has sc-04 prereq only:', /prerequisites:\n  - safety-career\/04\n---/.test(t));
