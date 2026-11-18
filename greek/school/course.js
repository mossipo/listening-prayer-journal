// Akouō Greek School: the seven levels, from the alphabet to Greek for preaching. Levels 0 to 4 follow the order of
// J. Gresham Machen, New Testament Greek for Beginners (1923, public domain); Levels 5 and 6 go beyond his book.
// A level with no lessons yet is shown as coming next, with what it will teach.
import { LEVEL0 } from "./level0.js";

export const LEVELS = [
  { n: 0, title: "Letters and sounds", machen: "Lessons I and II", goal: "Read John 1:1 aloud and copy it by hand",
    teaches: "The alphabet, Erasmian sounds, breathing marks, accents, reading aloud and writing by hand", lessons: LEVEL0 },
  { n: 1, title: "First sentences", machen: "Lessons III to IX", goal: "Read 1 John 1:5 word by word",
    teaches: "Present verbs, the article, first and second declension nouns, adjectives, prepositions, pronouns, and εἰμί", lessons: [] },
  { n: 2, title: "The verb system", machen: "Lessons X to XVI", goal: "Read John 1:1-14 with the Desk's help",
    teaches: "Middle and passive, imperfect, future, first and second aorist, aorist passive", lessons: [] },
  { n: 3, title: "Participles and moods", machen: "Lessons XVII to XXII", goal: "Read 1 John 1 with the Desk's help",
    teaches: "Third declension, participles, the genitive absolute, subjunctive, infinitive", lessons: [] },
  { n: 4, title: "Finishing the grammar", machen: "Lessons XXIII to XXXIII", goal: "Parse any form the Desk shows and say why",
    teaches: "Contract and liquid verbs, imperative, perfect, δίδωμι and the other -μι verbs, optative, conditions", lessons: [] },
  { n: 5, title: "Reading the New Testament", machen: "Beyond Machen", goal: "Read one chapter a week",
    teaches: "A graded reading path through 1 John, John, Mark and one of Paul's letters, using Graded mode and your known words", lessons: [] },
  { n: 6, title: "Greek for preaching", machen: "Beyond Machen", goal: "Work a sermon text from the Greek to an outline",
    teaches: "Uses of the cases, verb aspect, kinds of conditions, the named patterns, sentence structure, and an optional level on how the first churches heard Greek", lessons: [] }
];

export const ALL = LEVELS.flatMap(l => l.lessons.map(x => ({ ...x, level: l.n })));
export const lessonById = id => ALL.find(x => x.id === id) || null;
// The lesson before this one in the whole course, or null for the first
export const before = id => { const k = ALL.findIndex(x => x.id === id); return k > 0 ? ALL[k - 1] : null; };
export const after = id => { const k = ALL.findIndex(x => x.id === id); return k >= 0 && k + 1 < ALL.length ? ALL[k + 1] : null; };
export const PASS = 0.8;   // a checkpoint is passed at 80% or more
