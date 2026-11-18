// Akouō Greek School, Level 1: First sentences. Machen, New Testament Greek for Beginners (1923), Lessons III to IX,
// retold in plain English. Every model form in a table is checked against the New Testament data by the browser tests
// (tools/greek/test_school.py) wherever the New Testament uses that form; the "In the New Testament" column is filled
// from the data when the lesson opens.
//
// Grammar lessons add to the Level 0 shape:
//   focus: the kind of word the lesson teaches (a filter in school.js), used to underline words in See it and to pick
//          words for parsing; spot: [[filter, what to tap]]; tv: tense and voice labels taught so far
//   teach blocks: { table: { title, model, kind: "verb" | "noun", rows: [[label, ending, form, code]] } } and
//                 { grid: { caption, head: [...], rows: [[...]], el: [column numbers in Greek] } }
//   words: [lemma, Strong's, meaning, English forms for verbs: [base, he-form, past, -ing, passive past]]
// Exercise types beyond Level 0: ending, form (from the tables), parseV (person and number), parseN (case and number,
// with gender for articles, adjectives and pronouns), tv (tense and voice), meaning (what a verb form means),
// prep (what a preposition means with its case), vocab and toVocab (this lesson's words).

const PAI = [["1st singular", "-ω", "λύω", "V-PAI-1S"], ["2nd singular", "-εις", "λύεις", "V-PAI-2S"], ["3rd singular", "-ει", "λύει", "V-PAI-3S"],
  ["1st plural", "-ομεν", "λύομεν", "V-PAI-1P"], ["2nd plural", "-ετε", "λύετε", "V-PAI-2P"], ["3rd plural", "-ουσι(ν)", "λύουσι(ν)", "V-PAI-3P"]];

export const LEVEL1 = [
  {
    id: "1.1", title: "Verbs in the present", machen: "Lesson III", minutes: 35,
    focus: "pai", tv: ["present active"],
    teach: [
      { h: "The subject is inside the verb", p: `<p>English needs a separate word for who does the action: <i>I</i> say, <i>they</i> say. Greek puts it in the ending of the verb. <span lang="el">λέγω</span> is "I say", <span lang="el">λέγουσι</span> is "they say". Learn the six endings and you can tell who is acting in every verb of this kind.</p>` },
      { table: { title: "Present active indicative of λύω, I loose", model: "λύω", kind: "verb", rows: PAI } },
      { h: "Stem plus ending", p: `<p>Take off the <span lang="el">-ω</span> of the dictionary form and you have the stem: <span lang="el">λυ-</span>. Add the endings to it. Every verb in this lesson's list works the same way: <span lang="el">ἀκού-ω, ἀκού-εις, ἀκού-ει</span>.</p><p>The <span lang="el">ν</span> in brackets is called movable nu. It is often added at the end of a clause or before a vowel: <span lang="el">λέγουσι</span> or <span lang="el">λέγουσιν</span>. It changes nothing in the meaning.</p>` },
      { h: "What the present means", p: `<p>The present tense usually pictures the action as going on: <span lang="el">λύει</span> can be "he looses" or "he is loosing". A noun can stand in for "he": <span lang="el">λέγει Ἰησοῦς</span> is "Jesus says". When there is no noun, the ending alone gives the subject.</p><p><b>Indicative</b> means the verb states a fact or asks a question. Other moods come later.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Present active verbs are underlined. Tap one to see who is doing the action." },
    spot: [["pai", "is a present active verb"]],
    practise: ["ending", "parseV", "vocab", "meaning", "parseV", "form", "toVocab", "meaning"],
    check: ["ending", "parseV", "parseV", "meaning", "vocab", "toVocab", "spot", "form", "meaning", "parseV"],
    words: [
      ["ἔχω", 2192, "I have, hold", ["have", "has", "had", "having", "held"]],
      ["ἀκούω", 191, "I hear, listen", ["hear", "hears", "heard", "hearing", "heard"]],
      ["πιστεύω", 4100, "I believe, trust", ["believe", "believes", "believed", "believing", "believed"]],
      ["λαμβάνω", 2983, "I take, receive", ["take", "takes", "took", "taking", "taken"]],
      ["γινώσκω", 1097, "I know, come to know", ["know", "knows", "knew", "knowing", "known"]],
      ["θέλω", 2309, "I want, will, wish", ["want", "wants", "wanted", "wanting", "wanted"]],
      ["γράφω", 1125, "I write", ["write", "writes", "wrote", "writing", "written"]],
      ["βλέπω", 991, "I see, look at", ["see", "sees", "saw", "seeing", "seen"]],
      ["μένω", 3306, "I remain, stay", ["remain", "remains", "remained", "remaining", "remained"]]
    ]
  },
  {
    id: "1.2", title: "Nouns: the second declension", machen: "Lesson IV", minutes: 35,
    focus: "n2",
    teach: [
      { h: "Endings show the job", p: `<p>A Greek noun changes its ending to show its job in the sentence. Each job is called a <b>case</b>. A set of nouns that share endings is called a <b>declension</b>; this lesson's nouns mostly end in <span lang="el">-ος</span> or <span lang="el">-ον</span> in the dictionary.</p><ul><li><b>Nominative:</b> the subject. <span lang="el">λόγος</span> "a word" (doing something).</li><li><b>Genitive:</b> usually "of". <span lang="el">λόγου</span> "of a word".</li><li><b>Dative:</b> usually "to" or "for", and also "in" or "by". <span lang="el">λόγῳ</span> "to a word".</li><li><b>Accusative:</b> the direct object. <span lang="el">λόγον</span> "a word" (receiving the action).</li><li><b>Vocative:</b> calling someone. <span lang="el">κύριε</span> "Lord!"</li></ul>` },
      { table: { title: "λόγος, word (masculine)", model: "λόγος", kind: "noun", rows: [
        ["nominative singular", "-ος", "λόγος", "N-NSM"], ["genitive singular", "-ου", "λόγου", "N-GSM"], ["dative singular", "-ῳ", "λόγῳ", "N-DSM"], ["accusative singular", "-ον", "λόγον", "N-ASM"], ["vocative singular", "-ε", "λόγε", "N-VSM"],
        ["nominative plural", "-οι", "λόγοι", "N-NPM"], ["genitive plural", "-ων", "λόγων", "N-GPM"], ["dative plural", "-οις", "λόγοις", "N-DPM"], ["accusative plural", "-ους", "λόγους", "N-APM"]] } },
      { table: { title: "ἔργον, work (neuter)", model: "ἔργον", kind: "noun", rows: [
        ["nominative singular", "-ον", "ἔργον", "N-NSN"], ["genitive singular", "-ου", "ἔργου", "N-GSN"], ["dative singular", "-ῳ", "ἔργῳ", "N-DSN"], ["accusative singular", "-ον", "ἔργον", "N-ASN"],
        ["nominative plural", "-α", "ἔργα", "N-NPN"], ["genitive plural", "-ων", "ἔργων", "N-GPN"], ["dative plural", "-οις", "ἔργοις", "N-DPN"], ["accusative plural", "-α", "ἔργα", "N-APN"]] } },
      { h: "Two rules that save work", p: `<ul><li>A neuter noun's nominative and accusative are always the same. <span lang="el">ἔργα</span> can be the subject or the object; the sentence tells you which.</li><li>Masculine and neuter share the genitive and dative endings.</li></ul>` },
      { h: "Word order", p: `<p>Because the endings carry the jobs, Greek can put words in almost any order for emphasis. In John 1:1, <span lang="el">θεὸς ἦν ὁ λόγος</span> puts "God" first, yet <span lang="el">ὁ λόγος</span> is still the subject: "the Word was God".</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Second declension nouns are underlined. Tap one to see its case and number." },
    spot: [["n2", "is a second declension noun"], ["n2gen", "is a second declension noun in the genitive"]],
    practise: ["ending", "parseN", "vocab", "form", "parseN", "toVocab", "parseN", "vocab"],
    check: ["ending", "parseN", "parseN", "form", "vocab", "toVocab", "spot", "parseN", "form", "vocab"],
    words: [
      ["κύριος", 2962, "lord, Lord, master"], ["ἄνθρωπος", 444, "man, person, human being"], ["λόγος", 3056, "word, message"],
      ["υἱός", 5207, "son"], ["ἀδελφός", 80, "brother"], ["οὐρανός", 3772, "heaven, sky"], ["κόσμος", 2889, "world"],
      ["νόμος", 3551, "law"], ["ἔργον", 2041, "work, deed"], ["τέκνον", 5043, "child"]
    ]
  },
  {
    id: "1.3", title: "Nouns: the first declension", machen: "Lesson V", minutes: 30,
    focus: "n1f",
    teach: [
      { h: "Feminine nouns in -α and -η", p: `<p>Most nouns ending in <span lang="el">-α</span> or <span lang="el">-η</span> belong to the first declension, and nearly all of them are feminine. The cases do the same jobs you learned in the last lesson; only the endings differ.</p>` },
      { table: { title: "φωνή, voice", model: "φωνή", kind: "noun", rows: [
        ["nominative singular", "-η", "φωνή", "N-NSF"], ["genitive singular", "-ης", "φωνῆς", "N-GSF"], ["dative singular", "-ῃ", "φωνῇ", "N-DSF"], ["accusative singular", "-ην", "φωνήν", "N-ASF"],
        ["nominative plural", "-αι", "φωναί", "N-NPF"], ["genitive plural", "-ων", "φωνῶν", "N-GPF"], ["dative plural", "-αις", "φωναῖς", "N-DPF"], ["accusative plural", "-ας", "φωνάς", "N-APF"]] } },
      { table: { title: "ἡμέρα, day", model: "ἡμέρα", kind: "noun", rows: [
        ["nominative singular", "-α", "ἡμέρα", "N-NSF"], ["genitive singular", "-ας", "ἡμέρας", "N-GSF"], ["dative singular", "-ᾳ", "ἡμέρᾳ", "N-DSF"], ["accusative singular", "-αν", "ἡμέραν", "N-ASF"],
        ["nominative plural", "-αι", "ἡμέραι", "N-NPF"], ["genitive plural", "-ων", "ἡμερῶν", "N-GPF"], ["dative plural", "-αις", "ἡμέραις", "N-DPF"], ["accusative plural", "-ας", "ἡμέρας", "N-APF"]] } },
      { table: { title: "δόξα, glory", model: "δόξα", kind: "noun", rows: [
        ["nominative singular", "-α", "δόξα", "N-NSF"], ["genitive singular", "-ης", "δόξης", "N-GSF"], ["dative singular", "-ῃ", "δόξῃ", "N-DSF"], ["accusative singular", "-αν", "δόξαν", "N-ASF"],
        ["nominative plural", "-αι", "δόξαι", "N-NPF"], ["genitive plural", "-ων", "δοξῶν", "N-GPF"], ["dative plural", "-αις", "δόξαις", "N-DPF"], ["accusative plural", "-ας", "δόξας", "N-APF"]] } },
      { h: "How to tell the patterns apart", p: `<ul><li>After <span lang="el">ε, ι</span> or <span lang="el">ρ</span>, the <span lang="el">α</span> stays through the singular: <span lang="el">ἡμέρα, ἡμέρας</span>; <span lang="el">καρδία, καρδίας</span>.</li><li>After other letters, an <span lang="el">α</span> becomes <span lang="el">η</span> in the genitive and dative singular: <span lang="el">δόξα, δόξης</span>.</li><li>Nouns in <span lang="el">-η</span> keep <span lang="el">η</span> through the singular: <span lang="el">φωνή, φωνῆς</span>.</li><li>All three share the same plural, and the genitive plural always ends <span lang="el">-ῶν</span>.</li></ul><p><span lang="el">ἡμέρας</span> can be genitive singular or accusative plural. The article and the sentence decide; the next lesson shows how.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "First declension nouns are underlined. Tap one to see its case and number." },
    spot: [["n1f", "is a first declension noun"]],
    practise: ["ending", "parseN", "vocab", "form", "parseN", "toVocab", "parseN", "form"],
    check: ["ending", "parseN", "parseN", "form", "vocab", "toVocab", "spot", "parseN", "form", "vocab"],
    words: [
      ["ἡμέρα", 2250, "day"], ["γῆ", 1093, "earth, land"], ["καρδία", 2588, "heart"], ["ἁμαρτία", 266, "sin"],
      ["δόξα", 1391, "glory"], ["βασιλεία", 932, "kingdom, reign"], ["φωνή", 5456, "voice, sound"], ["ζωή", 2222, "life"],
      ["ἀγάπη", 26, "love"], ["ἐκκλησία", 1577, "church, assembly"], ["ἀλήθεια", 225, "truth"]
    ]
  },
  {
    id: "1.4", title: "The article and adjectives", machen: "Lesson VI", minutes: 40,
    focus: "art",
    teach: [
      { h: "The", p: `<p>Greek has a word for "the", the <b>article</b>, but no word for "a". A noun without the article is often translated with "a": <span lang="el">λόγος</span> "a word", <span lang="el">ὁ λόγος</span> "the word". The article agrees with its noun in gender, case and number, so it often tells you a noun's case when the noun's ending alone cannot.</p>` },
      { grid: { caption: "The article, ὁ ἡ τό", head: ["", "Masculine", "Feminine", "Neuter"], el: [1, 2, 3], rows: [
        ["nominative singular", "ὁ", "ἡ", "τό"], ["genitive singular", "τοῦ", "τῆς", "τοῦ"], ["dative singular", "τῷ", "τῇ", "τῷ"], ["accusative singular", "τόν", "τήν", "τό"],
        ["nominative plural", "οἱ", "αἱ", "τά"], ["genitive plural", "τῶν", "τῶν", "τῶν"], ["dative plural", "τοῖς", "ταῖς", "τοῖς"], ["accusative plural", "τούς", "τάς", "τά"]] } },
      { table: { title: "The article, masculine", model: "ὁ", kind: "noun", hidden: true, rows: [
        ["nominative singular", "", "ὁ", "T-NSM"], ["genitive singular", "", "τοῦ", "T-GSM"], ["dative singular", "", "τῷ", "T-DSM"], ["accusative singular", "", "τόν", "T-ASM"],
        ["nominative plural", "", "οἱ", "T-NPM"], ["genitive plural", "", "τῶν", "T-GPM"], ["dative plural", "", "τοῖς", "T-DPM"], ["accusative plural", "", "τούς", "T-APM"]] } },
      { table: { title: "The article, feminine", model: "ὁ", kind: "noun", hidden: true, rows: [
        ["nominative singular", "", "ἡ", "T-NSF"], ["genitive singular", "", "τῆς", "T-GSF"], ["dative singular", "", "τῇ", "T-DSF"], ["accusative singular", "", "τήν", "T-ASF"],
        ["nominative plural", "", "αἱ", "T-NPF"], ["genitive plural", "", "τῶν", "T-GPF"], ["dative plural", "", "ταῖς", "T-DPF"], ["accusative plural", "", "τάς", "T-APF"]] } },
      { table: { title: "The article, neuter", model: "ὁ", kind: "noun", hidden: true, rows: [
        ["nominative singular", "", "τό", "T-NSN"], ["genitive singular", "", "τοῦ", "T-GSN"], ["dative singular", "", "τῷ", "T-DSN"], ["accusative singular", "", "τό", "T-ASN"],
        ["nominative plural", "", "τά", "T-NPN"], ["genitive plural", "", "τῶν", "T-GPN"], ["dative plural", "", "τοῖς", "T-DPN"], ["accusative plural", "", "τά", "T-APN"]] } },
      { h: "Adjectives", p: `<p>An adjective has a masculine, a feminine and a neuter form, built on the endings you already know: masculine and neuter like <span lang="el">λόγος</span> and <span lang="el">ἔργον</span>, feminine like <span lang="el">φωνή</span> (or like <span lang="el">ἡμέρα</span> after <span lang="el">ε, ι, ρ</span>: <span lang="el">ἅγιος, ἁγία, ἅγιον</span>). It agrees with its noun in gender, case and number, even when the endings do not look alike.</p>` },
      { grid: { caption: "ἀγαθός, good", head: ["", "Masculine", "Feminine", "Neuter"], el: [1, 2, 3], rows: [
        ["nominative singular", "ἀγαθός", "ἀγαθή", "ἀγαθόν"], ["genitive singular", "ἀγαθοῦ", "ἀγαθῆς", "ἀγαθοῦ"], ["dative singular", "ἀγαθῷ", "ἀγαθῇ", "ἀγαθῷ"], ["accusative singular", "ἀγαθόν", "ἀγαθήν", "ἀγαθόν"],
        ["nominative plural", "ἀγαθοί", "ἀγαθαί", "ἀγαθά"], ["genitive plural", "ἀγαθῶν", "ἀγαθῶν", "ἀγαθῶν"], ["dative plural", "ἀγαθοῖς", "ἀγαθαῖς", "ἀγαθοῖς"], ["accusative plural", "ἀγαθούς", "ἀγαθάς", "ἀγαθά"]] } },
      { h: "Where the adjective stands", p: `<ul><li><b>Attributive</b> ("the good shepherd"): the article stands right before the adjective. John 10:11, <span lang="el">ὁ ποιμὴν ὁ καλός</span>, "the good shepherd"; the same meaning as <span lang="el">ὁ καλὸς ποιμήν</span>.</li><li><b>Predicate</b> ("the law is holy"): the adjective has no article of its own, and "is" is understood. Romans 7:12, <span lang="el">ὁ νόμος ἅγιος</span>, "the law is holy".</li><li><b>Standing alone</b>, an adjective with the article works as a noun: <span lang="el">οἱ ἅγιοι</span> "the holy ones, the saints".</li></ul>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Every article is underlined. Tap one to see its gender, case and number, then find the noun it goes with." },
    spot: [["art", "is an article"], ["adj2", "is an adjective"]],
    practise: ["parseN", "vocab", "parseN", "toVocab", "parseN", "vocab", "parseN", "toVocab"],
    check: ["parseN", "parseN", "parseN", "vocab", "toVocab", "spot", "parseN", "vocab", "parseN", "toVocab"],
    words: [
      ["ἅγιος", 40, "holy; as a noun, saint"], ["ἀγαθός", 18, "good"], ["καλός", 2570, "good, beautiful, fine"], ["νεκρός", 3498, "dead"],
      ["πρῶτος", 4413, "first"], ["ἴδιος", 2398, "one's own"], ["ἄλλος", 243, "other, another"]
    ]
  },
  {
    id: "1.5", title: "Masculine -ης nouns and prepositions", machen: "Lesson VII", minutes: 40,
    focus: "n1m",
    teach: [
      { h: "Masculine nouns of the first declension", p: `<p>A few first declension nouns are masculine and end in <span lang="el">-ης</span>. They follow <span lang="el">φωνή</span> except in two places: the genitive singular borrows <span lang="el">-ου</span> from the second declension, and the vocative ends in <span lang="el">-α</span>.</p>` },
      { table: { title: "μαθητής, disciple", model: "μαθητής", kind: "noun", rows: [
        ["nominative singular", "-ης", "μαθητής", "N-NSM"], ["genitive singular", "-ου", "μαθητοῦ", "N-GSM"], ["dative singular", "-ῃ", "μαθητῇ", "N-DSM"], ["accusative singular", "-ην", "μαθητήν", "N-ASM"],
        ["nominative plural", "-αι", "μαθηταί", "N-NPM"], ["genitive plural", "-ων", "μαθητῶν", "N-GPM"], ["dative plural", "-αις", "μαθηταῖς", "N-DPM"], ["accusative plural", "-ας", "μαθητάς", "N-APM"]] } },
      { h: "Prepositions", p: `<p>A preposition is followed by a noun in a particular case, and some prepositions change their meaning with the case. <span lang="el">ἐν</span> always takes the dative ("in"); <span lang="el">διά</span> with the genitive means "through" but with the accusative "because of". Learn each preposition with its case.</p>` },
      { grid: { caption: "Prepositions and their cases", head: ["", "with the genitive", "with the dative", "with the accusative"], el: [0], rows: [
        ["ἐν", "", "in, on, among", ""], ["εἰς", "", "", "into, to"], ["ἐκ, ἐξ", "out of, from", "", ""], ["ἀπό", "from, away from", "", ""],
        ["πρός", "", "", "to, toward, with"], ["διά", "through", "", "because of"], ["μετά", "with", "", "after"], ["κατά", "against, down from", "", "according to, throughout"],
        ["περί", "about, concerning", "", "around"], ["ὑπό", "by", "", "under"], ["παρά", "from", "beside, with", "alongside"], ["ἐπί", "on, over", "on, at, on the basis of", "on, onto, against"]] } },
      { h: "Short forms", p: `<p>Before a vowel a preposition may drop its last vowel: <span lang="el">δι’ αὐτοῦ</span> (John 1:3), <span lang="el">ἀπ’, μετ’, κατ’, ἐπ’</span>. Before a rough breathing the consonant changes too: <span lang="el">μεθ’, ἀφ’, καθ’, ἐφ’</span>. <span lang="el">ἐκ</span> becomes <span lang="el">ἐξ</span> before a vowel.</p>` },
      { words: true }
    ],
    see: { mark: "prep", say: "Prepositions are underlined. Tap the word after each one to see which case it takes." },
    spot: [["prep", "is a preposition"], ["n1m", "is a masculine -ης noun"]],
    practise: ["ending", "parseN", "prep", "vocab", "prep", "toVocab", "form", "prep"],
    check: ["prep", "prep", "parseN", "ending", "vocab", "toVocab", "spot", "prep", "form", "vocab"],
    words: [
      ["μαθητής", 3101, "disciple, learner"], ["προφήτης", 4396, "prophet"],
      ["ἐκ", 1537, "out of, from (with the genitive)"], ["ἐπί", 1909, "on, over; at; onto, against"], ["πρός", 4314, "to, toward, with (with the accusative)"],
      ["διά", 1223, "through (genitive); because of (accusative)"], ["ἀπό", 575, "from, away from (with the genitive)"], ["μετά", 3326, "with (genitive); after (accusative)"],
      ["κατά", 2596, "against (genitive); according to (accusative)"], ["περί", 4012, "about, concerning (genitive); around (accusative)"],
      ["ὑπό", 5259, "by (genitive); under (accusative)"], ["παρά", 3844, "from (genitive); beside (dative); alongside (accusative)"]
    ]
  },
  {
    id: "1.6", title: "Pronouns and the verb “to be”", machen: "Lesson VIII", minutes: 35,
    focus: "pron12", tv: ["present active"],
    teach: [
      { h: "I and you", p: `<p>The personal pronouns <span lang="el">ἐγώ</span> "I" and <span lang="el">σύ</span> "you" have their own forms. Because the verb ending already shows the subject, <span lang="el">ἐγώ</span> or <span lang="el">σύ</span> in the nominative adds emphasis: "<i>I</i> am the bread of life".</p>` },
      { table: { title: "ἐγώ, I; ἡμεῖς, we", model: "ἐγώ", kind: "noun", rows: [
        ["nominative singular", "", "ἐγώ", "P-1NS"], ["genitive singular", "", "μου", "P-1GS"], ["dative singular", "", "μοι", "P-1DS"], ["accusative singular", "", "με", "P-1AS"],
        ["nominative plural", "", "ἡμεῖς", "P-1NP"], ["genitive plural", "", "ἡμῶν", "P-1GP"], ["dative plural", "", "ἡμῖν", "P-1DP"], ["accusative plural", "", "ἡμᾶς", "P-1AP"]] } },
      { table: { title: "σύ, you; ὑμεῖς, you (plural)", model: "σύ", kind: "noun", rows: [
        ["nominative singular", "", "σύ", "P-2NS"], ["genitive singular", "", "σου", "P-2GS"], ["dative singular", "", "σοι", "P-2DS"], ["accusative singular", "", "σε", "P-2AS"],
        ["nominative plural", "", "ὑμεῖς", "P-2NP"], ["genitive plural", "", "ὑμῶν", "P-2GP"], ["dative plural", "", "ὑμῖν", "P-2DP"], ["accusative plural", "", "ὑμᾶς", "P-2AP"]] } },
      { h: "Words that lean", p: `<p><span lang="el">μου, μοι, με, σου, σοι, σε</span> usually have no accent of their own: they lean on the word before, and are called <b>enclitics</b>. When the speaker wants emphasis, the accented forms <span lang="el">ἐμοῦ, ἐμοί, ἐμέ</span> are used instead, as in <span lang="el">πρὸς ἐμέ</span> "to me" (John 6:35). The genitive often means "my" or "your": <span lang="el">ὁ λόγος μου</span> "my word".</p>` },
      { table: { title: "εἰμί, I am (present indicative)", model: "εἰμί", kind: "verb", rows: [
        ["1st singular", "", "εἰμί", "V-PAI-1S"], ["2nd singular", "", "εἶ", "V-PAI-2S"], ["3rd singular", "", "ἐστί(ν)", "V-PAI-3S"],
        ["1st plural", "", "ἐσμέν", "V-PAI-1P"], ["2nd plural", "", "ἐστέ", "V-PAI-2P"], ["3rd plural", "", "εἰσί(ν)", "V-PAI-3P"]] } },
      { h: "Using εἰμί", p: `<p><span lang="el">εἰμί</span> links the subject to a word that describes it, and that word is also in the nominative: John 6:35, <span lang="el">Ἐγώ εἰμι ὁ ἄρτος τῆς ζωῆς</span>, "I am the bread of life". All its forms except <span lang="el">εἶ</span> are enclitics, so in the text you often see them without an accent.</p>` },
      { words: true }
    ],
    see: { mark: "focus", c: 6, v1: 35, v2: 35, say: "John 6:35. The forms of ἐγώ are underlined. Find the emphatic Ἐγώ εἰμι, “I am”." },
    spot: [["pron12", "is a form of “I” or “you”"], ["eimi", "is a form of εἰμί"]],
    practise: ["parseN", "meaning", "vocab", "parseN", "parseV", "toVocab", "meaning", "parseN"],
    check: ["parseN", "parseN", "meaning", "parseV", "vocab", "toVocab", "spot", "parseN", "meaning", "vocab"],
    words: [
      ["ἀλλά", 235, "but"], ["οὖν", 3767, "therefore, so, then"], ["ἤ", 2228, "or; than"], ["τέ", 5037, "and; τε ... καί, both ... and"],
      ["οὐδέ", 3761, "and not, nor, not even"], ["νῦν", 3568, "now"], ["ἀμήν", 281, "amen, truly"]
    ],
    verbs: [["εἰμί", ["am", "is", "was", "being", ""], "be"]]
  },
  {
    id: "1.7", title: "This, that, and αὐτός", machen: "Lesson IX", minutes: 35,
    focus: "demo",
    teach: [
      { h: "This and that", p: `<p><span lang="el">οὗτος</span> means "this" and <span lang="el">ἐκεῖνος</span> "that". With a noun they stand outside the article: <span lang="el">οὗτος ὁ ἄνθρωπος</span> or <span lang="el">ὁ ἄνθρωπος οὗτος</span>, "this man". On their own they mean "this one, he" or "that one, he": <span lang="el">ἐκεῖνος ὑμᾶς διδάξει</span>, "he will teach you" (John 14:26).</p>` },
      { grid: { caption: "οὗτος, this", head: ["", "Masculine", "Feminine", "Neuter"], el: [1, 2, 3], rows: [
        ["nominative singular", "οὗτος", "αὕτη", "τοῦτο"], ["genitive singular", "τούτου", "ταύτης", "τούτου"], ["dative singular", "τούτῳ", "ταύτῃ", "τούτῳ"], ["accusative singular", "τοῦτον", "ταύτην", "τοῦτο"],
        ["nominative plural", "οὗτοι", "αὗται", "ταῦτα"], ["genitive plural", "τούτων", "τούτων", "τούτων"], ["dative plural", "τούτοις", "ταύταις", "τούτοις"], ["accusative plural", "τούτους", "ταύτας", "ταῦτα"]] } },
      { table: { title: "οὗτος, masculine", model: "οὗτος", kind: "noun", hidden: true, rows: [
        ["nominative singular", "", "οὗτος", "D-NSM"], ["genitive singular", "", "τούτου", "D-GSM"], ["dative singular", "", "τούτῳ", "D-DSM"], ["accusative singular", "", "τοῦτον", "D-ASM"],
        ["nominative plural", "", "οὗτοι", "D-NPM"], ["genitive plural", "", "τούτων", "D-GPM"], ["dative plural", "", "τούτοις", "D-DPM"], ["accusative plural", "", "τούτους", "D-APM"]] } },
      { table: { title: "οὗτος, feminine and neuter", model: "οὗτος", kind: "noun", hidden: true, rows: [
        ["nominative singular feminine", "", "αὕτη", "D-NSF"], ["genitive singular feminine", "", "ταύτης", "D-GSF"], ["accusative singular feminine", "", "ταύτην", "D-ASF"],
        ["nominative singular neuter", "", "τοῦτο", "D-NSN"], ["nominative plural neuter", "", "ταῦτα", "D-NPN"]] } },
      { h: "ἐκεῖνος", p: `<p><span lang="el">ἐκεῖνος, ἐκείνη, ἐκεῖνο</span> takes the endings of <span lang="el">ἀγαθός</span>, except that the neuter nominative and accusative singular is <span lang="el">ἐκεῖνο</span>, with no <span lang="el">ν</span>.</p>` },
      { h: "Three ways to use αὐτός", p: `<ul><li><b>As a pronoun</b>, "he, she, it, they", especially outside the nominative: <span lang="el">αὐτοῦ</span> "his, of him", <span lang="el">αὐτόν</span> "him", <span lang="el">αὐτοῖς</span> "to them".</li><li><b>After the article</b> it means "same": <span lang="el">ὁ αὐτὸς κύριος</span> "the same Lord".</li><li><b>Beside a noun with its article</b>, but not after the article, it means "himself, herself, itself": <span lang="el">αὐτὸς ὁ κύριος</span> "the Lord himself".</li></ul><p>Its endings are those of <span lang="el">ἀγαθός</span>, with neuter <span lang="el">αὐτό</span> in the nominative and accusative singular.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Forms of οὗτος and ἐκεῖνος are underlined. Tap one to see its gender, case and number." },
    spot: [["demo", "is a form of “this” or “that”"], ["autos", "is a form of αὐτός"]],
    practise: ["parseN", "vocab", "parseN", "toVocab", "parseN", "vocab", "parseN", "toVocab"],
    check: ["parseN", "parseN", "parseN", "vocab", "toVocab", "spot", "parseN", "vocab", "parseN", "toVocab"],
    words: [
      ["ἐκεῖνος", 1565, "that, that one"], ["οὕτως", 3779, "so, thus, in this way"], ["τότε", 5119, "then"],
      ["ἐκεῖ", 1563, "there"], ["καθώς", 2531, "just as, as"], ["πάλιν", 3825, "again"]
    ]
  }
];
