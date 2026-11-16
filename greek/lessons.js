// Akouō Plus, Greek Study Desk: short grammar lessons, offered when the passage you are reading has the feature.
// Written for Akouō in our own words (not taken from any published grammar). Each lesson is meant to be read in a
// minute or two: how to spot the form, how to read it, and a "Careful" note where readers often go wrong.
// Which words count is decided only by MACULA's parsing of each word (its grammar code), never guessed.

const has = (d, k, re) => !!d && re.test(d.f[k] || "");

export const LESSONS = [
  { id: "participle", one: "participle", many: "participles", test: d => has(d, "Form", /Participle/),
    title: "How to read a participle",
    body: [
      "A participle is a verb that works like an adjective. Like a verb it has tense and voice; like an adjective it has case, number and gender, and it agrees with the noun or pronoun it goes with.",
      "Look first for the article. With the article in front (ὁ πιστεύων) it usually works as a noun or describes a noun: \"the one who believes\". Without the article it usually tells you something about the main verb: when, why, how, or in spite of what.",
      "Common signs: -ντ- inside the word (πιστεύοντες), endings like -ων, -ουσα, -ον, -σας, -μενος for middle and passive, -θεις for the aorist passive, -κως for the perfect.",
      "The tense mainly shows how the action is viewed. An aorist participle often describes something before the main verb, a present participle something at the same time, but context decides."
    ],
    careful: "An adverbial participle does not label itself as \"when\", \"because\" or \"although\". Choose the one the context supports, and say so when more than one fits." },
  { id: "infinitive", one: "infinitive", many: "infinitives", test: d => has(d, "Form", /Infinitive/),
    title: "How to read an infinitive",
    body: [
      "An infinitive is a verb that works like a noun, usually \"to do\". It has tense and voice but no person or number.",
      "Common endings: -ειν (present or second aorist active), -σαι (aorist active), -σθαι (middle or passive), -θῆναι (aorist passive), -ναι (εἶναι, second aorists such as δοῦναι, and perfects in -έναι).",
      "Ask what job it does: completing another verb (θέλω, δύναμαι, δεῖ + infinitive), giving a purpose (\"in order to\"), or, with the article after a preposition, giving time or reason: ἐν τῷ + infinitive \"while\", μετὰ τό \"after\", πρὸ τοῦ \"before\", διὰ τό \"because\".",
      "If an infinitive has its own subject, that subject is usually in the accusative case."
    ] },
  { id: "aorist", one: "aorist", many: "aorist forms", test: d => has(d, "Tense", /Aorist/),
    title: "The aorist",
    body: [
      "The aorist presents an action as a whole, without looking inside it. It is the ordinary tense for telling what happened.",
      "In the indicative it usually refers to the past and has an augment (an ε- in front: ἐπίστευσαν). Many verbs add -σα- (first aorist); others use a different stem (second aorist: ἦλθον from ἔρχομαι, εἶπον from λέγω).",
      "Outside the indicative (participles, infinitives, subjunctives, imperatives) the aorist has no augment and does not by itself point to past time."
    ],
    careful: "The aorist does not mean \"once for all\" or \"at a single moment\". If the action really was once for all, that comes from the verb and the context, not from the tense." },
  { id: "imperfect", one: "imperfect", many: "imperfect forms", test: d => has(d, "Tense", /Imperfect/),
    title: "The imperfect",
    body: [
      "The imperfect looks at a past action from the inside, as going on: \"was doing\". It can mean an action in progress, a repeated or habitual one (\"used to\", \"kept on\"), one that was just starting (\"began to\") or one that was attempted (\"tried to\").",
      "It is built on the present stem with an augment and its own endings: -ον, -ες, -ε(ν), -ομεν, -ετε, -ον.",
      "Narratives often use the imperfect for background and the aorist for the main events."
    ] },
  { id: "perfect", one: "perfect or pluperfect", many: "perfect or pluperfect forms", test: d => has(d, "Tense", /Perfect|Pluperfect/),
    title: "The perfect",
    body: [
      "The perfect presents a state that results from an action: \"it stands written\" (γέγραπται), \"I have believed and still do\". The weight is often on the state.",
      "Look for reduplication, the first consonant repeated with ε at the front (πεπίστευκα, γέγραπται), and often -κα in the active.",
      "The pluperfect places that state in the past (\"had done\"). Some verbs, like οἶδα (\"I know\"), are perfect in form but present in meaning."
    ],
    careful: "Do not load every perfect with theology. It shows how the writer views the action, and many perfects are ordinary." },
  { id: "future", one: "future", many: "future forms", test: d => has(d, "Tense", /Future/),
    title: "The future",
    body: [
      "The future usually tells what will happen. Many verbs add -σ- before the ending (πιστεύσω).",
      "Besides prediction, the future can express a promise, an intention or, especially in quotations from the Old Testament, a command (\"you shall love\").",
      "Some verbs have middle forms in the future with an active meaning (ἔσομαι \"I will be\")."
    ] },
  { id: "subjunctive", one: "subjunctive", many: "subjunctives", test: d => has(d, "Mood", /Subjunctive/),
    title: "The subjunctive",
    body: [
      "The subjunctive presents an action as intended, possible or expected rather than stated as fact. You can often spot it by a lengthened vowel in the ending: ω or η (πιστεύωμεν, πιστεύητε).",
      "Watch for the word that introduces it: ἵνα (purpose, \"so that\"), ἐάν (\"if\", \"whenever\"), ὅταν (\"whenever\"), ἕως (\"until\").",
      "On its own it can mean \"let us\" (first person plural), ask a real question (\"what shall we do?\"), or with μή forbid an action. οὐ μή with the aorist subjunctive is the strongest way to say \"never\"."
    ],
    careful: "The subjunctive is not a sign of doubt in itself. After ἵνα it is simply the normal grammar." },
  { id: "imperative", one: "imperative", many: "imperatives", test: d => has(d, "Mood", /Imperative/),
    title: "The imperative",
    body: [
      "The imperative gives a command, a request or permission. Greek has second person (\"you, do\") and third person (\"let him do\") imperatives.",
      "The present imperative tends to view the action as ongoing or as a general way of life; the aorist imperative tends to view it as a whole, often a specific action.",
      "With μή, the present imperative forbids. To forbid with the aorist in the second person, Greek normally uses μή with the aorist subjunctive instead of the imperative."
    ],
    careful: "\"Stop doing\" for μή with the present imperative fits some verses but not all. Let the context show whether the action had already begun." },
  { id: "optative", one: "optative", many: "optatives", test: d => has(d, "Mood", /Optative/),
    title: "The optative",
    body: [
      "The optative is rare in the New Testament. It expresses a wish or prayer (\"may the God of peace sanctify you\") or a more remote possibility.",
      "Look for -οι- or -αι- in the ending. The best known example is μὴ γένοιτο, \"may it never be\"."
    ] },
  { id: "middle", one: "middle form", many: "middle forms", test: d => has(d, "Voice", /Middle/) && !has(d, "Voice", /Passive/),
    title: "The middle voice",
    body: [
      "In the middle voice the subject is involved in the action or affected by it: acting for itself, on itself, or with a personal stake.",
      "Many verbs appear only in middle forms but are translated as active (ἔρχομαι \"I come\"). The data calls these \"deponent\". Read them with the meaning the lexicon gives.",
      "English has no middle voice, so translations usually use an ordinary active verb."
    ],
    careful: "Not every middle carries a strong \"for oneself\" sense. Many are simply the normal form of the verb." },
  { id: "passive", one: "passive form", many: "passive forms", test: d => has(d, "Voice", /Passive/),
    title: "The passive voice",
    body: [
      "In the passive the subject receives the action: \"he was raised\". The doer may be named with ὑπό and the genitive (\"by\"), the means with the dative or ἐν.",
      "Look for -θη- in the aorist and future passive (ἠγέρθη). In the present and perfect, middle and passive share one form; the data shows which reading MACULA takes in context, and some are marked \"middle or passive\".",
      "Often no doer is named."
    ],
    careful: "Many readers see God as the unnamed doer of some passives. That can be right, but it is a reading of the context, not something the grammar proves." },
  { id: "genitive", one: "word in the genitive", many: "words in the genitive", test: d => has(d, "Case", /Genitive/),
    title: "The genitive",
    body: [
      "The genitive often comes into English as \"of\". It narrows or describes another word: possession, relationship, source, content, or the whole that something belongs to.",
      "All genitive plurals end in -ων. Common singular endings: -ου, -ης, -ας, -ος.",
      "Some genitives depend on a preposition (ἐκ, ἀπό, διά \"through\", ὑπό \"by\") or on a verb that takes the genitive."
    ],
    careful: "\"The love of God\" can mean God's love for us or our love for God. The grammar allows both; decide from the context and say why." },
  { id: "dative", one: "word in the dative", many: "words in the dative", test: d => has(d, "Case", /Dative/),
    title: "The dative",
    body: [
      "The dative often comes into English as \"to\", \"for\", \"by\", \"with\" or \"in\", with no separate Greek word behind it.",
      "Its main jobs: the indirect object (\"gave to them\"), advantage (\"for you\"), means (\"by grace\"), sphere or place (\"in the Spirit\"), and time when (\"on the third day\").",
      "Common endings: -ῳ, -ῃ, -ᾳ in the singular, -οις, -αις, -σι(ν) in the plural."
    ],
    careful: "The same dative can sometimes be read as means or as sphere. Weigh the options rather than pressing one." },
  { id: "article", one: "article", many: "articles", test: d => has(d, "Function", /Definite article/),
    title: "The article",
    body: [
      "Greek has a definite article (ὁ, ἡ, τό, \"the\") but no word for \"a\". The article marks something as specific or known, points back to something already mentioned, and shows the case, number and gender of the word it goes with, which helps you find the subject.",
      "It can turn almost anything into a noun: ὁ πιστεύων \"the one who believes\", τὰ ἄνω \"the things above\".",
      "A noun without the article may be indefinite (\"a\"), but it may also stress quality or simply be specific already."
    ],
    careful: "The presence or absence of the article is a clue, not a rule. Well-known verses such as John 1:1c are discussed at length in the grammars; weigh them before building on it." },
  { id: "nompronoun", one: "pronoun added for the subject", many: "pronouns added for the subject", test: d => has(d, "Function", /Personal pronoun/) && has(d, "Case", /Nominative/),
    title: "A pronoun added as the subject",
    body: [
      "A Greek verb already carries its subject in its ending: πιστεύω is \"I believe\". When a nominative pronoun such as ἐγώ, σύ, ἡμεῖς or ὑμεῖς is added, the writer has chosen to say it out loud.",
      "That often marks emphasis or contrast: \"I, for my part\", \"but you\". ἐγώ εἰμι is the best known example."
    ],
    careful: "Not every added pronoun is strongly emphatic; some writers use them more freely than others." }
];

// Lessons for these verses: [{ lesson, words: [word numbers] }], the most frequent first
export function lessonsFor(book, codes, verses, describe){
  const out = [];
  for (const L of LESSONS) {
    const words = [];
    for (const v of verses) for (let i = v.a; i < v.z; i++) if (L.test(describe(codes, book.code_(i)))) words.push(i);
    if (words.length) out.push({ lesson: L, words });
  }
  return out.sort((a, b) => b.words.length - a.words.length);
}
