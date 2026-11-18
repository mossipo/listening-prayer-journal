// Akouō Greek School, Level 5: Reading the New Testament. A graded path through whole passages: 1 John, then John,
// Mark and Ephesians. Each lesson is one passage (read: { b: book code, c, v1, v2 }). Its new words are worked out
// when it opens (the passage's words the School has not taught yet, most common first, with STEPBible's short gloss),
// and every exercise uses the passage itself. Notes quote the SBLGNT text exactly.

const TV = ["present active", "present middle or passive", "imperfect active", "future active", "aorist active", "aorist middle", "aorist passive",
  "perfect active", "perfect middle or passive", "present active participle", "aorist active participle", "present active subjunctive",
  "aorist active subjunctive", "present active infinitive", "aorist active infinitive", "present active imperative", "aorist active imperative"];
const SPOT = [["readV", "is a verb with a person (I, you, he, ...)"], ["readGen", "is a noun in the genitive"], ["readPart", "is a participle"]];
const PRACTISE = ["parseV", "parseN", "tv", "vocab", "quiz", "parseV", "toVocab", "quiz"];
const CHECK = ["parseV", "parseN", "parseV", "tv", "quiz", "quiz", "vocab", "toVocab", "spot", "parseN"];
const read = (h, p) => ({ h, p });
const STEPS = read("How to read it", `<ol><li>Read the passage in Greek aloud, slowly, once through. Do not stop at every unknown word.</li><li>Read it again verse by verse. Tap the words you do not know, and use the notes above.</li><li>Only then show the English and compare.</li><li>Open it on the Study Desk with Graded reading on, and read it once more the next day.</li></ol>`);

export const LEVEL5 = [
  {
    id: "5.1", title: "Walking in the light", machen: "", minutes: 40, read: { b: "1JN", c: 1, v1: 5, v2: 10 },
    tv: TV,
    teach: [
      read("About this passage", `<p>John's first letter uses a small vocabulary and short sentences, which is why almost every Greek course begins its reading here. In 1 John 1:5-10 John sets out a message he has heard: God is light. Three times someone says something about themselves; three times John answers it.</p>`),
      { share: true },
      read("Things to watch for", `<ul><li>All five verses after verse 5 open with <span lang="el">ἐάν</span> and a subjunctive: <span lang="el">ἐὰν εἴπωμεν</span> "if we say" (vv. 6, 8, 10), <span lang="el">ἐὰν ... περιπατῶμεν</span> "if we walk" (v. 7), <span lang="el">ἐὰν ὁμολογῶμεν</span> "if we confess" (v. 9).</li><li><span lang="el">ὁ θεὸς φῶς ἐστιν</span> (v. 5): <span lang="el">φῶς</span> has no article. It says what God is, not that light is God.</li><li><span lang="el">ἡμαρτήκαμεν</span> (v. 10) is a perfect: "we have sinned", with the result still standing.</li><li><span lang="el">ἵνα ἀφῇ ... καὶ καθαρίσῃ</span> (v. 9): after "faithful and just", <span lang="el">ἵνα</span> gives what his faithfulness leads to: "so that he forgives ... and cleanses".</li></ul>`),
      { words: true }, STEPS
    ],
    see: { mark: "read", say: "1 John 1:5-10. Words new to you are underlined. Tap any word for its form and meaning." },
    spot: SPOT,
    quiz: [
      ["How do verses 6, 8 and 10 begin?", "ἐὰν εἴπωμεν, “if we say”", ["ὅτι ὁ θεός, “that God”", "καὶ ἔστιν, “and it is”", "ἵνα ἀφῇ, “so that he forgives”"], "Three times John quotes a claim with ἐὰν εἴπωμεν and answers it."],
      ["In verse 5, ὁ θεὸς φῶς ἐστιν means ...", "God is light", ["light is God", "God is in the light", "God made the light"], "The subject has the article (ὁ θεός); φῶς without the article says what God is."],
      ["What tense is ἡμαρτήκαμεν (v. 10)?", "perfect", ["aorist", "present", "future"], "The reduplication and κα mark the perfect: “we have sinned”."],
      ["ὁμολογῶμεν (v. 9) is a ...", "present subjunctive after ἐάν", ["present indicative", "aorist imperative", "future indicative"], "ἐάν takes the subjunctive; the long ω before the ending shows it."]
    ],
    practise: PRACTISE, check: CHECK
  },
  {
    id: "5.2", title: "God is love", machen: "", minutes: 40, read: { b: "1JN", c: 4, v1: 7, v2: 12 },
    tv: TV,
    teach: [
      read("About this passage", `<p>In 1 John 4:7-12 John grounds the command to love one another in what God is and what he has done: he sent his Son. The same few words return again and again: <span lang="el">ἀγάπη, ἀγαπάω, θεός, ἀλλήλους</span>.</p>`),
      { share: true },
      read("Things to watch for", `<ul><li><span lang="el">ἀγαπῶμεν ἀλλήλους</span> (v. 7) is a 1st plural subjunctive: "let us love one another".</li><li><span lang="el">ὁ θεὸς ἀγάπη ἐστίν</span> (v. 8): as in 1:5, the predicate has no article. Love describes God; the sentence does not turn round.</li><li><span lang="el">οὐχ ὅτι ἡμεῖς ἠγαπήκαμεν ... ἀλλ’ ὅτι αὐτὸς ἠγάπησεν</span> (v. 10): perfect beside aorist, and <span lang="el">ἡμεῖς</span> against <span lang="el">αὐτός</span>, "not that we have loved ... but that he loved".</li><li><span lang="el">εἰ οὕτως ὁ θεὸς ἠγάπησεν ἡμᾶς</span> (v. 11): εἰ with the indicative, a condition taken as true: "if God so loved us".</li></ul>`),
      { words: true }, STEPS
    ],
    see: { mark: "read", say: "1 John 4:7-12. Words new to you are underlined." },
    spot: SPOT,
    quiz: [
      ["In verse 7, ἀγαπῶμεν ἀλλήλους means ...", "let us love one another", ["we loved one another", "love one another!", "they love each other"], "A 1st plural subjunctive urging the readers: “let us”."],
      ["In verse 10, what contrast does John draw?", "not that we have loved God, but that he loved us", ["not that God loved us, but that we loved him", "not love, but sending", "not the Son, but the Father"], "οὐχ ὅτι ... ἀλλ’ ὅτι sets ἡμεῖς against αὐτός."],
      ["What tense is ἀπέσταλκεν (v. 9)?", "perfect", ["aorist", "imperfect", "present"], "Reduplication and κα: “he has sent”."],
      ["εἰ οὕτως ὁ θεὸς ἠγάπησεν ἡμᾶς (v. 11) is a condition ...", "assumed true: “if God so loved us”", ["contrary to fact", "about the future", "expressing a wish"], "εἰ with the indicative assumes the condition for the argument; here John clearly believes it."]
    ],
    practise: PRACTISE, check: CHECK
  },
  {
    id: "5.3", title: "In the beginning was the Word", machen: "", minutes: 50, read: { b: "JHN", c: 1, v1: 1, v2: 18 },
    tv: TV,
    teach: [
      read("About this passage", `<p>The prologue of John's Gospel is longer than anything you have read so far, but much of its vocabulary is now yours. It moves from the Word with God before creation, through John the Baptist's witness, to the Word made flesh.</p>`),
      { share: true },
      read("Things to watch for", `<ul><li>The imperfect <span lang="el">ἦν</span> "was" (vv. 1-2, 4, 9-10) describes the Word's existence; the aorist <span lang="el">ἐγένετο</span> "came into being, became" describes what happened (vv. 3, 6, 14).</li><li><span lang="el">δι’ αὐτοῦ</span> (v. 3): <span lang="el">διά</span> with the genitive, "through him".</li><li><span lang="el">ὅσοι δὲ ἔλαβον αὐτόν</span> (v. 12): "as many as received him".</li><li><span lang="el">ἐσκήνωσεν</span> (v. 14) is related to <span lang="el">σκηνή</span> "tent": "he dwelt", literally "he pitched his tent".</li><li><span lang="el">ἐξηγήσατο</span> (v. 18), "he has made him known", is the source of the English word "exegesis".</li></ul>`),
      { words: true }, STEPS
    ],
    see: { mark: "read", say: "John 1:1-18. Words new to you are underlined. Show the English only after a first try." },
    spot: SPOT,
    quiz: [
      ["Which verb describes the Word's existence in verses 1-2?", "ἦν, the imperfect “was”", ["ἐγένετο, “came into being”", "ἔλαβον, “received”", "ἐσκήνωσεν, “dwelt”"], "ἦν pictures continuing existence; ἐγένετο marks what came to be."],
      ["δι’ αὐτοῦ (v. 3) means ...", "through him", ["because of him", "after him", "for him"], "διά with the genitive means “through”."],
      ["ἐσκήνωσεν (v. 14) comes from a word meaning ...", "tent", ["flesh", "glory", "grace"], "σκηνή is a tent; the Word “pitched his tent” among us."],
      ["Which English word comes from ἐξηγήσατο (v. 18)?", "exegesis", ["exodus", "example", "existence"], "ἐξηγέομαι, “make known, explain”, gives us “exegesis”."]
    ],
    practise: PRACTISE, check: CHECK
  },
  {
    id: "5.4", title: "Born from above", machen: "", minutes: 50, read: { b: "JHN", c: 3, v1: 1, v2: 16 },
    tv: TV,
    teach: [
      read("About this passage", `<p>Nicodemus comes to Jesus by night, and the conversation turns on a word with two meanings. It ends with the best-known verse in the New Testament, now readable in Greek.</p>`),
      { share: true },
      read("Things to watch for", `<ul><li><span lang="el">νυκτός</span> (v. 2): the genitive of time, "by night".</li><li><span lang="el">ἄνωθεν</span> (vv. 3, 7) can mean "from above" or "again". Nicodemus hears "again" (v. 4); Jesus' talk of the Spirit points "from above". English has to choose; the Greek holds both.</li><li><span lang="el">μὴ δύναται ... εἰσελθεῖν;</span> (v. 4): a question with <span lang="el">μή</span> expects "no".</li><li><span lang="el">Οὕτως γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον ὥστε ... ἔδωκεν</span> (v. 16): <span lang="el">οὕτως</span> is "in this way"; <span lang="el">ὥστε</span> with the indicative gives a result that really happened: "he gave".</li></ul>`),
      { words: true }, STEPS
    ],
    see: { mark: "read", say: "John 3:1-16. Words new to you are underlined." },
    spot: SPOT,
    quiz: [
      ["ἄνωθεν (v. 3) can mean ...", "from above, or again", ["only again", "only from heaven", "quickly"], "Nicodemus takes it as “again”; Jesus means “from above”. The word holds both."],
      ["The question in verse 4 begins with μή, so it expects the answer ...", "no", ["yes", "maybe", "no answer"], "μή in a question expects “no”."],
      ["In verse 16, οὕτως means ...", "in this way", ["so much", "therefore", "then"], "οὕτως is an adverb of manner: God loved the world in this way, that he gave his Son."],
      ["In verse 16, ὥστε ... ἔδωκεν expresses ...", "a result that happened: he gave", ["a purpose not yet done", "a condition", "a question"], "ὥστε with the indicative states an actual result."]
    ],
    practise: PRACTISE, check: CHECK
  },
  {
    id: "5.5", title: "The true vine", machen: "", minutes: 45, read: { b: "JHN", c: 15, v1: 1, v2: 11 },
    tv: TV,
    teach: [
      read("About this passage", `<p>In John 15:1-11 Jesus calls himself the true vine. One verb, <span lang="el">μένω</span> "remain, abide", carries the passage; count how often it appears.</p>`),
      { share: true },
      read("Things to watch for", `<ul><li><span lang="el">μείνατε ἐν ἐμοί</span> (v. 4): an aorist imperative, "remain in me".</li><li><span lang="el">ὁ μένων ἐν ἐμοί</span> (v. 5): a participle with the article, "the one who remains in me".</li><li><span lang="el">χωρὶς ἐμοῦ οὐ δύνασθε ποιεῖν οὐδέν</span> (v. 5): Greek piles up negatives for emphasis: "apart from me you can do nothing".</li><li><span lang="el">ὃ ἐὰν θέλητε αἰτήσασθε</span> (v. 7): a relative with ἐάν and the subjunctive, "whatever you want", then an aorist imperative, "ask".</li></ul>`),
      { words: true }, STEPS
    ],
    see: { mark: "read", say: "John 15:1-11. Words new to you are underlined." },
    spot: SPOT,
    quiz: [
      ["μείνατε ἐν ἐμοί (v. 4) is ...", "an aorist imperative: remain in me", ["an aorist indicative: you remained in me", "a future: you will remain", "an infinitive: to remain"], "μείνατε is the aorist active imperative 2nd plural of the liquid verb μένω."],
      ["ὁ μένων ἐν ἐμοί (v. 5) means ...", "the one who remains in me", ["he remained in me", "remain in me!", "to remain in me"], "A participle with the article works as a noun."],
      ["οὐ δύνασθε ποιεῖν οὐδέν (v. 5): what do the two negatives do?", "they strengthen each other: you can do nothing", ["they cancel out: you can do something", "one asks a question", "one is a mistake"], "In Greek, a second negative after οὐ adds emphasis."],
      ["ὃ ἐὰν θέλητε (v. 7) means ...", "whatever you want", ["if you wanted it", "what you wanted", "when you will want"], "A relative with ἐάν and the subjunctive: “whatever”."]
    ],
    practise: PRACTISE, check: CHECK
  },
  {
    id: "5.6", title: "The beginning of the gospel", machen: "", minutes: 45, read: { b: "MRK", c: 1, v1: 1, v2: 15 },
    tv: TV,
    teach: [
      read("About this passage", `<p>Mark writes quickly and plainly. His opening moves from John the Baptist to Jesus' baptism, the testing in the wilderness, and Jesus' first preaching in Galilee, all in fifteen verses.</p>`),
      { share: true },
      read("Things to watch for", `<ul><li><span lang="el">Ἀρχὴ τοῦ εὐαγγελίου Ἰησοῦ χριστοῦ</span> (v. 1) has no verb: it is a title.</li><li><span lang="el">Καθὼς γέγραπται</span> (v. 2), "as it is written": the perfect you met in Lesson 4.7.</li><li><span lang="el">εὐθύς</span> "immediately" (vv. 10, 12) is one of Mark's favourite words.</li><li><span lang="el">Πεπλήρωται ὁ καιρὸς καὶ ἤγγικεν ἡ βασιλεία τοῦ θεοῦ· μετανοεῖτε καὶ πιστεύετε</span> (v. 15): two perfects ("is fulfilled", "has come near"), then two present imperatives ("repent and believe").</li></ul>`),
      { words: true }, STEPS
    ],
    see: { mark: "read", say: "Mark 1:1-15. Words new to you are underlined." },
    spot: SPOT,
    quiz: [
      ["Verse 1 has no main verb because ...", "it is a title", ["the verb is understood as “was”", "Mark forgot it", "the verb is at the end of verse 2"], "Ἀρχὴ τοῦ εὐαγγελίου ... heads the book."],
      ["What tense are Πεπλήρωται and ἤγγικεν (v. 15)?", "perfect", ["aorist", "present", "imperfect"], "Both have reduplication: the time has been fulfilled and stands fulfilled; the kingdom has come near."],
      ["μετανοεῖτε καὶ πιστεύετε (v. 15) are ...", "present imperatives: repent and believe", ["present indicatives: you repent and believe", "aorist infinitives", "future indicatives"], "In Jesus' call they are commands; the present pictures an ongoing turning and believing."],
      ["Which word is a favourite of Mark's, meaning “immediately”?", "εὐθύς", ["καθώς", "ἀρχή", "καιρός"], "Mark uses εὐθύς over forty times."]
    ],
    practise: PRACTISE, check: CHECK
  },
  {
    id: "5.7", title: "The sower", machen: "", minutes: 40, read: { b: "MRK", c: 4, v1: 1, v2: 9 },
    tv: TV,
    teach: [
      read("About this passage", `<p>Jesus teaches from a boat, and the parable of the sower begins with a call to listen and ends with one. Mark's storytelling style is easy to follow: one clause after another, joined with <span lang="el">καί</span>.</p>`),
      { share: true },
      read("Things to watch for", `<ul><li><span lang="el">Ἀκούετε. ἰδοὺ ἐξῆλθεν ὁ σπείρων σπεῖραι</span> (v. 3): an imperative, "listen", then "the sower went out to sow". <span lang="el">ὁ σπείρων</span> is a participle used as a noun; <span lang="el">σπεῖραι</span> is an aorist infinitive of purpose.</li><li><span lang="el">ἐν τῷ σπείρειν</span> (v. 4): the article with the infinitive, "while he was sowing".</li><li><span lang="el">ὃ μὲν ... καὶ ἄλλο</span> (vv. 4-5): "some (seed) ... and other (seed)".</li><li><span lang="el">Ὃς ἔχει ὦτα ἀκούειν ἀκουέτω</span> (v. 9): a 3rd person imperative, "let the one who has ears to hear, hear".</li></ul>`),
      { words: true }, STEPS
    ],
    see: { mark: "read", say: "Mark 4:1-9. Words new to you are underlined." },
    spot: SPOT,
    quiz: [
      ["In verse 3, σπεῖραι means ...", "to sow (expressing purpose)", ["sowing", "he sowed", "sow!"], "An aorist infinitive after a verb of going gives the purpose: “he went out to sow”."],
      ["ἐν τῷ σπείρειν (v. 4) means ...", "while he was sowing", ["after he sowed", "because he sowed", "in order to sow"], "ἐν τῷ with the infinitive: “while”."],
      ["ἀκουέτω (v. 9) is ...", "a 3rd person imperative: let him hear", ["a 1st person subjunctive", "a future indicative", "an infinitive"], "The ending -έτω marks the 3rd singular imperative."],
      ["How does Mark mostly join his clauses here?", "with καί, “and”", ["with γάρ, “for”", "with οὖν, “therefore”", "with ἵνα, “so that”"], "Mark's plain, quick style links one event to the next with καί."]
    ],
    practise: PRACTISE, check: CHECK
  },
  {
    id: "5.8", title: "By grace you have been saved", machen: "", minutes: 50, read: { b: "EPH", c: 2, v1: 1, v2: 10 },
    tv: TV,
    teach: [
      read("About this passage", `<p>Paul writes in long sentences that hold several thoughts together; Ephesians 2:1-10 is a good place to learn to follow them. Find the main verbs first, then hang the rest on them.</p>`),
      { share: true },
      read("Things to watch for", `<ul><li>Verse 1 begins <span lang="el">Καὶ ὑμᾶς ὄντας νεκρούς</span> "and you, being dead", but the verb it is waiting for does not come until verse 5: <span lang="el">συνεζωοποίησεν</span> "he made alive together".</li><li><span lang="el">χάριτί ἐστε σεσῳσμένοι</span> (vv. 5, 8): a form of <span lang="el">εἰμί</span> with a perfect passive participle, "you have been saved", and remain so.</li><li><span lang="el">τῇ γὰρ χάριτι ... διὰ πίστεως</span> (v. 8): the dative names the means, "by grace"; <span lang="el">διά</span> with the genitive, "through faith".</li><li><span lang="el">καὶ τοῦτο οὐκ ἐξ ὑμῶν</span> (v. 8): <span lang="el">τοῦτο</span> is neuter, while <span lang="el">χάρις</span> and <span lang="el">πίστις</span> are feminine, so most interpreters take "this" to mean the whole saving work just described.</li></ul>`),
      { words: true }, STEPS
    ],
    see: { mark: "read", say: "Ephesians 2:1-10. Words new to you are underlined. Look for the main verbs first." },
    spot: SPOT,
    quiz: [
      ["Which verb completes the sentence begun in verse 1?", "συνεζωοποίησεν, “he made alive together” (v. 5)", ["ὄντας, “being” (v. 1)", "ἠγάπησεν, “he loved” (v. 4)", "περιπατήσωμεν, “we should walk” (v. 10)"], "Verses 1-3 describe who “you” were; the main verb arrives in verse 5."],
      ["ἐστε σεσῳσμένοι (v. 8) means ...", "you have been saved, and remain so", ["you will be saved", "you were being saved", "you save yourselves"], "εἰμί with a perfect passive participle gives a perfect: a completed act with a lasting result."],
      ["Why do most interpreters take τοῦτο (v. 8) to mean the whole saving work?", "it is neuter, while χάρις and πίστις are feminine", ["it is plural", "it comes before the verb", "it is in the genitive"], "A neuter pronoun usually points to an idea or an act, not to a feminine noun."],
      ["In verse 8, τῇ χάριτι is dative because it names ...", "the means: by grace", ["the time: on grace", "the owner: of grace", "the object: grace itself"], "The dative of means: “by”."]
    ],
    practise: PRACTISE, check: CHECK
  }
];
