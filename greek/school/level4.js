// Akouō Greek School, Level 4: Finishing the grammar. Machen, New Testament Greek for Beginners (1923), Lessons XXIII
// to XXXIII, retold in plain English. Same lesson shape as Level 3 (see level1.js and level3.js). Every verse quoted is
// the SBLGNT text; every model form the New Testament uses is checked against the data by the tests.
import { gendered, pn, cn } from "./forms.js";

const TVI = ["present active", "imperfect active", "future active", "aorist active", "aorist passive"];

export const LEVEL4 = [
  {
    id: "4.1", title: "Contract verbs", machen: "Lesson XXIII", minutes: 45,
    focus: "cpai", tv: ["present active", "imperfect active", "future active", "aorist active", "present middle or passive"],
    teach: [
      { h: "Vowels that merge", p: `<p>Some verbs have a stem ending in <span lang="el">ε, α</span> or <span lang="el">ο</span>: <span lang="el">ποιέω</span> "I do", <span lang="el">ἀγαπάω</span> "I love", <span lang="el">πληρόω</span> "I fill". In the present and imperfect, that vowel merges with the vowel of the ending. This is called <b>contraction</b>. The dictionary shows the uncontracted form; the text shows the contracted one: <span lang="el">ποιῶ</span>, not <span lang="el">ποιέω</span>.</p>` },
      { table: { title: "ποιέω, I do, make: present active indicative", model: "ποιέω", kind: "verb", rows: pn("V-PAI-", [["-ῶ", "ποιῶ"], ["-εῖς", "ποιεῖς"], ["-εῖ", "ποιεῖ"], ["-οῦμεν", "ποιοῦμεν"], ["-εῖτε", "ποιεῖτε"], ["-οῦσι(ν)", "ποιοῦσι(ν)"]]) } },
      { table: { title: "ἀγαπάω, I love: present active indicative", model: "ἀγαπάω", kind: "verb", rows: pn("V-PAI-", [["-ῶ", "ἀγαπῶ"], ["-ᾷς", "ἀγαπᾷς"], ["-ᾷ", "ἀγαπᾷ"], ["-ῶμεν", "ἀγαπῶμεν"], ["-ᾶτε", "ἀγαπᾶτε"], ["-ῶσι(ν)", "ἀγαπῶσι(ν)"]]) } },
      { table: { title: "πληρόω, I fill, fulfil: present active indicative", model: "πληρόω", kind: "verb", rows: pn("V-PAI-", [["-ῶ", "πληρῶ"], ["-οῖς", "πληροῖς"], ["-οῖ", "πληροῖ"], ["-οῦμεν", "πληροῦμεν"], ["-οῦτε", "πληροῦτε"], ["-οῦσι(ν)", "πληροῦσι(ν)"]]) } },
      { grid: { caption: "How the vowels merge", head: ["", "with ε", "with ο", "with ει", "with ου"], el: [0, 1, 2, 3, 4], rows: [
        ["ε", "ει", "ου", "ει", "ου"], ["α", "α", "ω", "ᾳ", "ω"], ["ο", "ου", "ου", "οι", "ου"]] } },
      { h: "The imperfect, and the other tenses", p: `<p>The imperfect contracts the same way: <span lang="el">ἐποίουν, ἐποίεις, ἐποίει, ἐποιοῦμεν, ἐποιεῖτε, ἐποίουν</span>. Outside the present and imperfect there is nothing to contract: the vowel simply lengthens before the tense sign. <span lang="el">ποιήσω, ἐποίησα</span>; <span lang="el">ἀγαπήσω, ἠγάπησα</span>; <span lang="el">πληρώσω, ἐπλήρωσα</span>. (<span lang="el">καλέω</span> keeps its short vowel: <span lang="el">ἐκάλεσα</span>.)</p><p>John 13:34 shows contracts in a row: <span lang="el">ἐντολὴν καινὴν δίδωμι ὑμῖν ἵνα ἀγαπᾶτε ἀλλήλους, καθὼς ἠγάπησα ὑμᾶς</span>.</p>` },
      { table: { title: "ποιέω: imperfect active indicative", model: "ποιέω", kind: "verb", hidden: true, rows: pn("V-IAI-", [["", "ἐποίουν"], ["", "ἐποίεις"], ["", "ἐποίει"], ["", "ἐποιοῦμεν"], ["", "ἐποιεῖτε"], ["", "ἐποίουν"]]) } },
      { words: true }
    ],
    see: { mark: "focus", say: "Contract verbs in the present and imperfect are underlined. Look for the circumflex where the vowels merged." },
    spot: [["cpai", "is a contract verb in the present or imperfect"]],
    practise: ["ending", "parseV", "meaning", "tv", "vocab", "parseV", "form", "toVocab"],
    check: ["ending", "parseV", "parseV", "meaning", "tv", "vocab", "toVocab", "spot", "form", "meaning"],
    words: [
      ["ποιέω", 4160, "I do, make", ["do", "does", "did", "doing", "done"]], ["λαλέω", 2980, "I speak", ["speak", "speaks", "spoke", "speaking", "spoken"]],
      ["ἀγαπάω", 25, "I love", ["love", "loves", "loved", "loving", "loved"]], ["ζητέω", 2212, "I seek, look for", ["seek", "seeks", "sought", "seeking", "sought"]],
      ["τηρέω", 5083, "I keep, guard, obey", ["keep", "keeps", "kept", "keeping", "kept"]], ["καλέω", 2564, "I call, invite", ["call", "calls", "called", "calling", "called"]],
      ["πληρόω", 4137, "I fill, fulfil", ["fulfil", "fulfils", "fulfilled", "fulfilling", "fulfilled"]], ["ζάω", 2198, "I live", ["live", "lives", "lived", "living", ""]],
      ["ἀκολουθέω", 190, "I follow", ["follow", "follows", "followed", "following", "followed"]], ["μαρτυρέω", 3140, "I testify, bear witness", ["testify", "testifies", "testified", "testifying", "testified"]],
      ["περιπατέω", 4043, "I walk, live", ["walk", "walks", "walked", "walking", ""]]
    ]
  },
  {
    id: "4.2", title: "Liquid verbs", machen: "Lesson XXIV", minutes: 35,
    focus: "liq", tv: TVI,
    teach: [
      { h: "λ, μ, ν, ρ refuse the σ", p: `<p>Verbs whose stem ends in <span lang="el">λ, μ, ν</span> or <span lang="el">ρ</span>, the "liquid" letters, do not take the <span lang="el">σ</span> of the future and first aorist.</p><ul><li>The <b>future</b> adds <span lang="el">ε</span> instead, which contracts like <span lang="el">ποιέω</span>: <span lang="el">κρινῶ</span> "I will judge". It looks like a present of a contract verb; the accent and the context tell you.</li><li>The <b>aorist</b> keeps the <span lang="el">α</span> without the <span lang="el">σ</span>, and often lengthens the stem vowel: <span lang="el">μένω, ἔμεινα</span>; <span lang="el">ἀποστέλλω, ἀπέστειλα</span>.</li></ul>` },
      { table: { title: "κρίνω, I judge: future active indicative", model: "κρίνω", kind: "verb", rows: pn("V-FAI-", [["-ῶ", "κρινῶ"], ["-εῖς", "κρινεῖς"], ["-εῖ", "κρινεῖ"], ["-οῦμεν", "κρινοῦμεν"], ["-εῖτε", "κρινεῖτε"], ["-οῦσι(ν)", "κρινοῦσι(ν)"]]) } },
      { table: { title: "μένω, I remain: aorist active indicative", model: "μένω", kind: "verb", rows: pn("V-AAI-", [["-α", "ἔμεινα"], ["-ας", "ἔμεινας"], ["-ε(ν)", "ἔμεινε(ν)"], ["-αμεν", "ἐμείναμεν"], ["-ατε", "ἐμείνατε"], ["-αν", "ἔμειναν"]]) } },
      { grid: { caption: "Liquid verbs you know", head: ["Present", "Future", "Aorist"], el: [0, 1, 2], rows: [
        ["κρίνω", "κρινῶ", "ἔκρινα"], ["μένω", "μενῶ", "ἔμεινα"], ["ἀποστέλλω", "ἀποστελῶ", "ἀπέστειλα"], ["αἴρω", "ἀρῶ", "ἦρα"], ["ἀποκτείνω", "ἀποκτενῶ", "ἀπέκτεινα"], ["ἐγείρω", "ἐγερῶ", "ἤγειρα"]] } },
      { table: { title: "Liquid aorists, checked", hidden: true, kind: "verb", rows: [
        ["", "", "ἔκρινα", "V-AAI-1S", "κρίνω"], ["", "", "ἀπέστειλεν", "V-AAI-3S", "ἀποστέλλω"], ["", "", "ἦραν", "V-AAI-3P", "αἴρω"], ["", "", "ἀπέκτειναν", "V-AAI-3P", "ἀποκτείνω"], ["", "", "ἤγειρεν", "V-AAI-3S", "ἐγείρω"], ["", "", "μενεῖ", "V-FAI-3S", "μένω"]] } },
      { words: true }
    ],
    see: { mark: "focus", say: "Liquid futures and aorists are underlined. Notice: no σ." },
    spot: [["liq", "is a liquid future or aorist"]],
    practise: ["ending", "parseV", "meaning", "tv", "vocab", "form", "toVocab", "meaning"],
    check: ["ending", "parseV", "tv", "tv", "meaning", "meaning", "vocab", "toVocab", "spot", "form"],
    words: [
      ["χαίρω", 5463, "I rejoice, am glad; χαῖρε, greetings"], ["ἀναβαίνω", 305, "I go up, come up", ["go up", "goes up", "went up", "going up", ""]],
      ["καταβαίνω", 2597, "I come down, go down", ["come down", "comes down", "came down", "coming down", ""]], ["ὑπάρχω", 5225, "I am, exist; τὰ ὑπάρχοντα, possessions"],
      ["πείθω", 3982, "I persuade; perfect, I am confident", ["persuade", "persuades", "persuaded", "persuading", "persuaded"]], ["θεωρέω", 2334, "I see, look at, observe", ["see", "sees", "saw", "seeing", "seen"]],
      ["δοκέω", 1380, "I think, seem"], ["αἰτέω", 154, "I ask, ask for", ["ask", "asks", "asked", "asking", "asked"]], ["ἐρωτάω", 2065, "I ask, request", ["ask", "asks", "asked", "asking", "asked"]]
    ]
  },
  {
    id: "4.3", title: "More third declension nouns; adjectives in -ης", machen: "Lesson XXV", minutes: 40,
    focus: "n3b",
    teach: [
      { h: "Three more patterns", p: `<p>Three groups of third declension nouns change their stem vowel as they decline. Each is common enough to learn as a pattern.</p>` },
      { table: { title: "πόλις, city (feminine)", model: "πόλις", kind: "noun", rows: cn("N-", "F", [["-ις", "πόλις"], ["-εως", "πόλεως"], ["-ει", "πόλει"], ["-ιν", "πόλιν"], ["-εις", "πόλεις"], ["-εων", "πόλεων"], ["-εσι(ν)", "πόλεσι(ν)"], ["-εις", "πόλεις"]]) } },
      { table: { title: "βασιλεύς, king (masculine)", model: "βασιλεύς", kind: "noun", rows: cn("N-", "M", [["-ευς", "βασιλεύς"], ["-εως", "βασιλέως"], ["-ει", "βασιλεῖ"], ["-εα", "βασιλέα"], ["-εις", "βασιλεῖς"], ["-εων", "βασιλέων"], ["-ευσι(ν)", "βασιλεῦσι(ν)"], ["-εις", "βασιλεῖς"]]) } },
      { table: { title: "ἔθνος, nation (neuter)", model: "ἔθνος", kind: "noun", rows: cn("N-", "N", [["-ος", "ἔθνος"], ["-ους", "ἔθνους"], ["-ει", "ἔθνει"], ["-ος", "ἔθνος"], ["-η", "ἔθνη"], ["-ων", "ἐθνῶν"], ["-εσι(ν)", "ἔθνεσι(ν)"], ["-η", "ἔθνη"]]) } },
      { h: "Watch for look-alikes", p: `<ul><li>Nouns like <span lang="el">πόλις</span> include many words for ideas: <span lang="el">πίστις</span> "faith", <span lang="el">δύναμις</span> "power", <span lang="el">ἀνάστασις</span> "resurrection".</li><li><span lang="el">ἔθνος</span> ends in <span lang="el">-ος</span> but is neuter and third declension: its genitive is <span lang="el">ἔθνους</span>, not <span lang="el">ἔθνου</span>. The article tells you: <span lang="el">τὸ ἔθνος</span>. In the plural, <span lang="el">τὰ ἔθνη</span> often means "the Gentiles".</li><li><span lang="el">πόλεις</span> and <span lang="el">βασιλεῖς</span> are both nominative and accusative plural.</li></ul>` },
      ...gendered("ἀληθής, true", "ἀληθής", "A-", [["ἀληθής", "ἀληθής", "ἀληθές"], ["ἀληθοῦς", "ἀληθοῦς", "ἀληθοῦς"], ["ἀληθεῖ", "ἀληθεῖ", "ἀληθεῖ"], ["ἀληθῆ", "ἀληθῆ", "ἀληθές"],
        ["ἀληθεῖς", "ἀληθεῖς", "ἀληθῆ"], ["ἀληθῶν", "ἀληθῶν", "ἀληθῶν"], ["ἀληθέσι(ν)", "ἀληθέσι(ν)", "ἀληθέσι(ν)"], ["ἀληθεῖς", "ἀληθεῖς", "ἀληθῆ"]]),
      { h: "Adjectives in -ης, -ες", p: `<p>Adjectives like <span lang="el">ἀληθής</span> "true" use one form for masculine and feminine and another for neuter, on the pattern of <span lang="el">ἔθνος</span>. You met one in John 1:14: <span lang="el">πλήρης χάριτος καὶ ἀληθείας</span>, "full of grace and truth".</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Nouns like πόλις, βασιλεύς and ἔθνος are underlined." },
    spot: [["n3b", "is a noun like πόλις, βασιλεύς or ἔθνος"], ["n3", "is a third declension noun"]],
    practise: ["ending", "parseN", "vocab", "form", "parseN", "toVocab", "parseN", "form"],
    check: ["ending", "parseN", "parseN", "form", "vocab", "toVocab", "spot", "parseN", "form", "vocab"],
    words: [
      ["πόλις", 4172, "city, town"], ["βασιλεύς", 935, "king"], ["ἀρχιερεύς", 749, "high priest, chief priest"], ["γραμματεύς", 1122, "scribe, expert in the law"],
      ["ἔθνος", 1484, "nation, people; plural, the Gentiles"], ["ὄρος", 3735, "mountain, hill"], ["δύναμις", 1411, "power, miracle"], ["ὕδωρ", 5204, "water"],
      ["φῶς", 5457, "light"], ["πῦρ", 4442, "fire"]
    ]
  },
  {
    id: "4.4", title: "All, many, one; numbers", machen: "Lesson XXVI", minutes: 40,
    focus: "pas",
    teach: [
      { h: "πᾶς, all, every", p: `<p><span lang="el">πᾶς</span> takes third declension endings in the masculine and neuter and first declension in the feminine, like the aorist participle <span lang="el">λύσας</span>. In the singular without the article it usually means "every"; with the article, "the whole"; in the plural, "all".</p>` },
      ...gendered("πᾶς, all, every", "πᾶς", "A-", [["πᾶς", "πᾶσα", "πᾶν"], ["παντός", "πάσης", "παντός"], ["παντί", "πάσῃ", "παντί"], ["πάντα", "πᾶσαν", "πᾶν"],
        ["πάντες", "πᾶσαι", "πάντα"], ["πάντων", "πασῶν", "πάντων"], ["πᾶσι(ν)", "πάσαις", "πᾶσι(ν)"], ["πάντας", "πάσας", "πάντα"]]),
      { grid: { caption: "εἷς, one", head: ["", "Masculine", "Feminine", "Neuter"], el: [1, 2, 3], rows: [
        ["nominative", "εἷς", "μία", "ἕν"], ["genitive", "ἑνός", "μιᾶς", "ἑνός"], ["dative", "ἑνί", "μιᾷ", "ἑνί"], ["accusative", "ἕνα", "μίαν", "ἕν"]] } },
      { table: { title: "εἷς, checked", model: "εἷς", kind: "noun", hidden: true, rows: [
        ["nominative masculine", "", "εἷς", "A-NSM"], ["genitive masculine", "", "ἑνός", "A-GSM"], ["dative masculine", "", "ἑνί", "A-DSM"], ["accusative masculine", "", "ἕνα", "A-ASM"],
        ["nominative feminine", "", "μία", "A-NSF"], ["genitive feminine", "", "μιᾶς", "A-GSF"], ["dative feminine", "", "μιᾷ", "A-DSF"], ["accusative feminine", "", "μίαν", "A-ASF"], ["nominative neuter", "", "ἕν", "A-NSN"]] } },
      ...gendered("πολύς, much, many", "πολύς", "A-", [["πολύς", "πολλή", "πολύ"], ["πολλοῦ", "πολλῆς", "πολλοῦ"], ["πολλῷ", "πολλῇ", "πολλῷ"], ["πολύν", "πολλήν", "πολύ"],
        ["πολλοί", "πολλαί", "πολλά"], ["πολλῶν", "πολλῶν", "πολλῶν"], ["πολλοῖς", "πολλαῖς", "πολλοῖς"], ["πολλούς", "πολλάς", "πολλά"]]),
      { h: "πολύς and μέγας", p: `<p><span lang="el">πολύς</span> and <span lang="el">μέγας</span> "great" use a short stem in four places (masculine nominative and accusative singular, neuter nominative and accusative singular: <span lang="el">πολύς, πολύν, πολύ</span>; <span lang="el">μέγας, μέγαν, μέγα</span>) and a longer stem everywhere else (<span lang="el">πολλ-, μεγάλ-</span>), with the endings of <span lang="el">ἀγαθός</span>.</p>` },
      { grid: { caption: "Numbers", head: ["", "Greek", "", "Greek"], el: [1, 3], rows: [
        ["one", "εἷς", "seven", "ἑπτά"], ["two", "δύο", "eight", "ὀκτώ"], ["three", "τρεῖς", "nine", "ἐννέα"], ["four", "τέσσαρες", "ten", "δέκα"], ["five", "πέντε", "twelve", "δώδεκα"], ["six", "ἕξ", "first, second, third", "πρῶτος, δεύτερος, τρίτος"]] } },
      { h: "Phrases that work like adjectives", p: `<p>A prepositional phrase with the article can describe a noun just as an adjective does: Matthew 5:16, <span lang="el">τὸν πατέρα ὑμῶν τὸν ἐν τοῖς οὐρανοῖς</span>, "your Father who is in heaven". The accusative can measure time or distance: Matthew 12:40, <span lang="el">τρεῖς ἡμέρας καὶ τρεῖς νύκτας</span>, "for three days and three nights".</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Forms of πᾶς are underlined. Tap one: is it “every” or “all”?" },
    spot: [["pas", "is a form of πᾶς"], ["num", "is a form of εἷς, πολύς or μέγας"]],
    quiz: [
      ["In Matthew 5:16, τὸν πατέρα ὑμῶν τὸν ἐν τοῖς οὐρανοῖς means ...", "your Father who is in heaven", ["your Father went to heaven", "to your Father in the heavens he went", "the heavens of your Father"], "The article τόν makes the phrase ἐν τοῖς οὐρανοῖς describe πατέρα, like an adjective."],
      ["In Matthew 12:40, τρεῖς ἡμέρας is accusative because ...", "it measures how long", ["it is the subject", "it follows a preposition", "it shows possession"], "The accusative can express extent of time: “for three days”."],
      ["Which form is the masculine accusative singular of πολύς?", "πολύν", ["πολλόν", "πολλοῦ", "πολλή"], "πολύς uses its short stem in the masculine nominative and accusative singular: πολύς, πολύν."],
      ["What does πᾶς usually mean in the singular without the article?", "every", ["all of them", "the whole of it", "none"], "πᾶς ἄνθρωπος, “every person”; with the article, “the whole”; in the plural, “all”."]
    ],
    practise: ["parseN", "form", "quiz", "vocab", "parseN", "toVocab", "quiz", "form"],
    check: ["parseN", "parseN", "form", "form", "quiz", "quiz", "vocab", "toVocab", "spot", "parseN"],
    words: [
      ["πολύς", 4183, "much, many; plural, many"], ["εἷς", 1520, "one"], ["δύο", 1417, "two"], ["τρεῖς", 5140, "three"], ["ἑπτά", 2033, "seven"],
      ["δώδεκα", 1427, "twelve"], ["μέγας", 3173, "great, large"], ["ἕκαστος", 1538, "each, every"], ["τρίτος", 5154, "third"],
      ["σύν", 4862, "with (with the dative)"], ["ὑπέρ", 5228, "for, on behalf of (genitive); above (accusative)"], ["ἐνώπιον", 1799, "before, in the presence of"]
    ]
  },
  {
    id: "4.5", title: "Who, which, someone", machen: "Lesson XXVII", minutes: 40,
    focus: "rel",
    teach: [
      { h: "The relative pronoun", p: `<p><span lang="el">ὅς, ἥ, ὅ</span> means "who, which, that". It looks like the article with a rough breathing and an accent. It agrees with the word it refers back to in gender and number, but its case comes from its own clause: John 1:26, <span lang="el">μέσος ὑμῶν ἕστηκεν ὃν ὑμεῖς οὐκ οἴδατε</span>, "among you stands one whom you do not know". <span lang="el">ὅν</span> is accusative because it is the object of <span lang="el">οἴδατε</span>.</p>` },
      ...gendered("ὅς, who, which", "ὅς", "R-", [["ὅς", "ἥ", "ὅ"], ["οὗ", "ἧς", "οὗ"], ["ᾧ", "ᾗ", "ᾧ"], ["ὅν", "ἥν", "ὅ"],
        ["οἵ", "αἵ", "ἅ"], ["ὧν", "ὧν", "ὧν"], ["οἷς", "αἷς", "οἷς"], ["οὕς", "ἅς", "ἅ"]]),
      { h: "Who? and someone", p: `<p><span lang="el">τίς, τί</span> asks "who? what?", and <span lang="el">τί</span> also means "why?". It takes third declension endings and always has an acute on its first syllable: <span lang="el">τίς, τίνος, τίνι, τίνα</span>. The same forms without the accent (they are enclitics) mean "someone, something, a certain": <span lang="el">τις, τινός</span>. John 3:3, <span lang="el">ἐὰν μή τις γεννηθῇ ἄνωθεν</span>, "unless someone is born from above".</p>` },
      ...gendered("τίς, who? what?", "τίς", "I-", [["τίς", "τίς", "τί"], ["τίνος", "τίνος", "τίνος"], ["τίνι", "τίνι", "τίνι"], ["τίνα", "τίνα", "τί"],
        ["τίνες", "τίνες", "τίνα"], ["τίνων", "τίνων", "τίνων"], ["τίσι(ν)", "τίσι(ν)", "τίσι(ν)"], ["τίνας", "τίνας", "τίνα"]]),
      { h: "Questions and “whoever”", p: `<ul><li>A question about what to do uses the subjunctive: Luke 3:10, <span lang="el">Τί οὖν ποιήσωμεν;</span> "What then should we do?"</li><li>A relative with <span lang="el">ἄν</span> (or <span lang="el">ἐάν</span>) and the subjunctive means "whoever, whatever": John 2:5, <span lang="el">Ὅ τι ἂν λέγῃ ὑμῖν ποιήσατε</span>, "Do whatever he tells you"; Matthew 5:19, <span lang="el">ὃς ἐὰν οὖν λύσῃ</span>, "whoever then relaxes".</li></ul>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Relative pronouns are underlined. Tap one and find the word it refers back to." },
    spot: [["rel", "is a relative pronoun"], ["interr", "is a form of τίς or τις"]],
    quiz: [
      ["A relative pronoun takes its case from ...", "its own clause", ["the word it refers back to", "the main verb", "the preposition before it"], "It agrees with its antecedent in gender and number, but its case is its job in its own clause."],
      ["In John 3:3, τις means ...", "someone", ["who?", "why?", "which"], "Without an accent of its own, τις is the indefinite “someone”."],
      ["Τί οὖν ποιήσωμεν; (Luke 3:10) means ...", "What then should we do?", ["Who then did it?", "Why have we done it?", "What did we do then?"], "A question about what to do uses the subjunctive: a deliberative question."],
      ["ὃς ἐὰν λύσῃ (Matthew 5:19) means ...", "whoever relaxes", ["who relaxed", "if he relaxes", "which he relaxes"], "A relative with ἄν or ἐάν and the subjunctive means “whoever”."]
    ],
    practise: ["parseN", "form", "quiz", "vocab", "parseN", "toVocab", "quiz", "form"],
    check: ["parseN", "parseN", "form", "form", "quiz", "quiz", "vocab", "toVocab", "spot", "parseN"],
    words: [
      ["τίς", 5101, "who? which? what? why?"], ["τις", 5100, "someone, something, a certain"], ["ὅστις", 3748, "whoever, who"], ["ὅσος", 3745, "as great as, as many as"],
      ["τοιοῦτος", 5108, "such, of such a kind"], ["ἑαυτοῦ", 1438, "himself, herself, itself; plural, themselves"], ["οὐχί", 3780, "not; in a question, expects “yes”"],
      ["ὧδε", 5602, "here"], ["ἔξω", 1854, "outside, out"]
    ]
  },
  {
    id: "4.6", title: "The imperative", machen: "Lesson XXVIII", minutes: 40,
    focus: "imp", tv: [...TVI, "present active imperative", "aorist active imperative", "aorist passive imperative", "present middle or passive imperative", "aorist active subjunctive"],
    teach: [
      { h: "Commands", p: `<p>The <b>imperative</b> gives commands. It has a 2nd person, "you, do this", and a 3rd person, "let him do this". There is no augment. The present pictures the action as ongoing or habitual, the aorist as a whole.</p>` },
      { table: { title: "Present active imperative of λύω", model: "λύω", kind: "verb", rows: pn("V-PAM-", [["-ε", "λῦε"], ["-ετω", "λυέτω"], ["-ετε", "λύετε"], ["-ετωσαν", "λυέτωσαν"]], [1, 2, 4, 5]) } },
      { table: { title: "Aorist active imperative of λύω", model: "λύω", kind: "verb", rows: pn("V-AAM-", [["-σον", "λῦσον"], ["-σατω", "λυσάτω"], ["-σατε", "λύσατε"], ["-σατωσαν", "λυσάτωσαν"]], [1, 2, 4, 5]) } },
      { table: { title: "Aorist passive imperative of λύω", model: "λύω", kind: "verb", rows: pn("V-APM-", [["-θητι", "λύθητι"], ["-θητω", "λυθήτω"], ["-θητε", "λύθητε"], ["-θητωσαν", "λυθήτωσαν"]], [1, 2, 4, 5]) } },
      { h: "The middle", p: `<p>The present middle imperative is <span lang="el">λύου, λυέσθω, λύεσθε, λυέσθωσαν</span>; the aorist middle <span lang="el">λῦσαι, λυσάσθω, λύσασθε, λυσάσθωσαν</span>. Note that <span lang="el">λῦσαι</span> is also the aorist active infinitive; the context decides.</p><p>The 2nd plural present imperative <span lang="el">λύετε</span> looks exactly like the indicative "you loose". John 14:1, <span lang="el">πιστεύετε εἰς τὸν θεόν, καὶ εἰς ἐμὲ πιστεύετε</span>, can be read either way; most translations take at least the second as a command.</p>` },
      { h: "Do not", p: `<p>A prohibition uses <span lang="el">μή</span> with either the present imperative or the aorist subjunctive (not the aorist imperative). With the present imperative it often forbids something already happening or a habit: John 6:20, <span lang="el">μὴ φοβεῖσθε</span>, "do not be afraid"; John 14:1, <span lang="el">Μὴ ταρασσέσθω ὑμῶν ἡ καρδία</span>, "let not your heart be troubled". With the aorist subjunctive it forbids the action as a whole: <span lang="el">μὴ εἰσενέγκῃς ἡμᾶς</span>.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Imperatives are underlined. Who is being told to do what?" },
    spot: [["imp", "is an imperative"]],
    quiz: [
      ["Which person does the imperative not have?", "1st person", ["2nd person", "3rd person", "plural"], "Commands go to “you” or “he, she, they”; “let us” uses the subjunctive."],
      ["How does Greek forbid an action?", "μή with the present imperative or the aorist subjunctive", ["οὐ with the imperative", "μή with the aorist imperative", "οὐ μή with the present indicative"], "μὴ φοβεῖσθε (John 6:20); μὴ εἰσενέγκῃς (Matthew 6:13)."],
      ["λυέτω means ...", "let him loose", ["you loose!", "they were loosing", "to loose"], "The 3rd person imperative: “let him (her, it) loose”."],
      ["Which form is both an aorist middle imperative and an aorist active infinitive?", "λῦσαι", ["λῦσον", "λύσατε", "λυθῆναι"], "λῦσαι can be “to loose” or “loose for yourself!”; the context decides."]
    ],
    practise: ["ending", "parseV", "tv", "quiz", "vocab", "form", "quiz", "toVocab"],
    check: ["ending", "parseV", "tv", "tv", "quiz", "quiz", "vocab", "toVocab", "spot", "form"],
    words: [
      ["ἀσπάζομαι", 782, "I greet"], ["δέχομαι", 1209, "I receive, welcome"], ["προσκυνέω", 4352, "I worship, bow down before"], ["δοξάζω", 1392, "I glorify, praise"],
      ["συνάγω", 4863, "I gather together"], ["φοβέομαι", 5399, "I fear, am afraid"], ["κάθημαι", 2521, "I sit"], ["ἐπερωτάω", 1905, "I ask, question"]
    ]
  },
  {
    id: "4.7", title: "The perfect", machen: "Lesson XXIX", minutes: 40,
    focus: "perf", tv: [...TVI, "perfect active", "perfect middle or passive"],
    teach: [
      { h: "Done, and still standing", p: `<p>The <b>perfect</b> describes a completed action whose result continues. <span lang="el">γέγραπται</span> means "it has been written", and so "it stands written". Jesus answers the tempter with it in Matthew 4:4: <span lang="el">Γέγραπται</span>, "It is written". John 20:31, <span lang="el">ταῦτα δὲ γέγραπται ἵνα πιστεύητε</span>, "these are written so that you may believe".</p>` },
      { table: { title: "Perfect active indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-RAI-", [["-κα", "λέλυκα"], ["-κας", "λέλυκας"], ["-κε(ν)", "λέλυκε(ν)"], ["-καμεν", "λελύκαμεν"], ["-κατε", "λελύκατε"], ["-κασι(ν)", "λελύκασι(ν)"]]) } },
      { table: { title: "Perfect middle and passive indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-RPI-", [["-μαι", "λέλυμαι"], ["-σαι", "λέλυσαι"], ["-ται", "λέλυται"], ["-μεθα", "λελύμεθα"], ["-σθε", "λέλυσθε"], ["-νται", "λέλυνται"]]) } },
      { h: "How to spot it", p: `<ul><li><b>Reduplication</b>: the first consonant is doubled with <span lang="el">ε</span> in front of the stem: <span lang="el">λε-λυ-κα</span>, <span lang="el">γέ-γραπ-ται</span>. A verb that starts with a vowel lengthens it instead: <span lang="el">ἀγαπάω, ἠγάπηκα</span>. Unlike the augment, reduplication stays in every mood.</li><li>The active usually has <span lang="el">κα</span>. Some have a second perfect without <span lang="el">κ</span>: John 3:2, <span lang="el">ἐλήλυθας</span> "you have come".</li><li>The middle and passive add endings straight to the stem, with no connecting vowel: <span lang="el">λέλυ-ται</span>.</li></ul>` },
      { h: "The pluperfect", p: `<p>The pluperfect puts the completed state in the past, with an augment: <span lang="el">ἐλελύκειν</span> "I had loosed". It is rare. You will meet <span lang="el">ᾔδει</span> "he knew" most often, in the next lessons.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Perfect verbs are underlined. Look for the doubled first letter." },
    spot: [["perf", "is a perfect verb"]],
    quiz: [
      ["What does the perfect tense describe?", "a completed action whose result continues", ["an action going on in the past", "an action in the future", "a single moment only"], "γέγραπται, “it has been written and stands written”."],
      ["What is the mark of the perfect?", "reduplication: λε-λυ-κα", ["an augment only", "a σ before the ending", "a θη before the ending"], "The first consonant doubles with ε: λέλυκα, γέγραπται."],
      ["In Matthew 4:4, Γέγραπται means ...", "It is written", ["He wrote", "Write!", "It will be written"], "A perfect passive: written, and still standing."],
      ["Does reduplication stay outside the indicative?", "Yes, it stays in every mood", ["No, only the indicative has it", "Only in the passive", "Only in the plural"], "Unlike the augment, reduplication stays: the participle γεγεννημένον (John 3:6) has it."]
    ],
    practise: ["ending", "parseV", "tv", "quiz", "meaning", "vocab", "form", "toVocab"],
    check: ["ending", "parseV", "tv", "tv", "quiz", "quiz", "meaning", "vocab", "toVocab", "spot"],
    words: [
      ["γεννάω", 1080, "I beget, become the father of; passive, I am born", ["beget", "begets", "begot", "begetting", "begotten"]], ["εὐαγγελίζω", 2097, "I announce good news, preach the gospel (usually middle)"],
      ["ῥῆμα", 4487, "word, saying, thing"], ["θέλημα", 2307, "will, desire"], ["στόμα", 4750, "mouth"], ["αἷμα", 129, "blood"],
      ["ἱμάτιον", 2440, "garment, cloak"], ["σάββατον", 4521, "Sabbath; week"], ["δαιμόνιον", 1140, "demon"]
    ]
  },
  {
    id: "4.8", title: "Comparison, adverbs and useful constructions", machen: "Lesson XXX", minutes: 45,
    focus: "comp",
    teach: [
      { h: "Greater, greatest", p: `<p>Most adjectives form a comparative with <span lang="el">-τερος</span> and a superlative with <span lang="el">-τατος</span>: <span lang="el">ἰσχυρός</span> "strong", <span lang="el">ἰσχυρότερος</span> "stronger". Some common ones are irregular, like <span lang="el">μέγας</span> "great", <span lang="el">μείζων</span> "greater". In the New Testament the comparative often does the work of the superlative too.</p>` },
      { grid: { caption: "μείζων, greater", head: ["", "Masculine and feminine", "Neuter"], el: [1, 2], rows: [
        ["nominative singular", "μείζων", "μεῖζον"], ["genitive singular", "μείζονος", "μείζονος"], ["dative singular", "μείζονι", "μείζονι"], ["accusative singular", "μείζονα", "μεῖζον"],
        ["nominative plural", "μείζονες", "μείζονα"], ["genitive plural", "μειζόνων", "μειζόνων"], ["dative plural", "μείζοσι(ν)", "μείζοσι(ν)"], ["accusative plural", "μείζονας", "μείζονα"]] } },
      { table: { title: "μείζων, checked", model: "μέγας", kind: "noun", hidden: true, rows: [
        ["nominative singular masculine", "", "μείζων", "A-NSM-C"], ["genitive singular masculine", "", "μείζονος", "A-GSM-C"], ["accusative singular masculine", "", "μείζονα", "A-ASM-C"], ["nominative singular neuter", "", "μεῖζον", "A-NSN-C"],
        ["accusative plural neuter", "", "μείζονα", "A-APN-C"], ["accusative plural feminine", "", "μείζονας", "A-APF-C"]] } },
      { h: "Than", p: `<p>"Than" is either <span lang="el">ἤ</span>, or simply the genitive: John 15:13, <span lang="el">μείζονα ταύτης ἀγάπην οὐδεὶς ἔχει</span>, "no one has greater love than this". <span lang="el">ταύτης</span> is the genitive of comparison.</p>` },
      { h: "Adverbs, and a few cases worth knowing", p: `<ul><li>Many adverbs end in <span lang="el">-ως</span>, from the genitive plural with <span lang="el">ν</span> changed to <span lang="el">ς</span>: <span lang="el">καλός, καλῶς</span> "well"; <span lang="el">οὕτως</span> "thus".</li><li>The <b>genitive</b> can tell the time within which something happens: John 3:2, <span lang="el">ἦλθεν πρὸς αὐτὸν νυκτός</span>, "he came to him by night".</li><li>The <b>dative</b> can give the point of time: Matthew 16:21, <span lang="el">τῇ τρίτῃ ἡμέρᾳ ἐγερθῆναι</span>, "to be raised on the third day".</li><li>The possessive adjectives are <span lang="el">ἐμός</span> "my", <span lang="el">σός</span> "your", <span lang="el">ἡμέτερος</span> "our", <span lang="el">ὑμέτερος</span> "your (plural)".</li></ul>` },
      { h: "Questions that expect an answer", p: `<p>A question with <span lang="el">οὐ</span> expects "yes"; a question with <span lang="el">μή</span> expects "no". John 6:67, <span lang="el">Μὴ καὶ ὑμεῖς θέλετε ὑπάγειν;</span> "You do not want to go away too, do you?"</p>` },
      { h: "More uses of ἵνα", p: `<p>Besides purpose, <span lang="el">ἵνα</span> with the subjunctive often gives the content of a command, request or wish: John 13:34, <span lang="el">ἐντολὴν καινὴν δίδωμι ὑμῖν ἵνα ἀγαπᾶτε ἀλλήλους</span>, "a new command I give you, that you love one another".</p>` },
      { words: true }
    ],
    see: { mark: "focus", c: 5, v1: 20, v2: 20, say: "John 5:20. The comparative μείζονα, “greater (works)”, is underlined; τούτων after it is the genitive of comparison, “than these”." },
    spot: [["comp", "is a comparative or superlative"]],
    quiz: [
      ["In John 15:13, μείζονα ταύτης ἀγάπην means ...", "greater love than this", ["this great love", "love greater than all", "the greatest love of this"], "ταύτης is a genitive of comparison: “than this”."],
      ["A question beginning with μή expects the answer ...", "no", ["yes", "maybe", "it does not expect an answer"], "John 6:67, Μὴ καὶ ὑμεῖς θέλετε ὑπάγειν; “You do not want to go too, do you?”"],
      ["A question beginning with οὐ expects the answer ...", "yes", ["no", "maybe", "it does not expect an answer"], "οὐ in a question expects agreement."],
      ["In John 3:2, νυκτός means ...", "by night", ["of the night", "to the night", "night (subject)"], "The genitive can tell the time within which something happens."],
      ["In John 13:34, ἵνα ἀγαπᾶτε ἀλλήλους gives ...", "the content of the command", ["the reason for it", "a result", "a question"], "After a word of commanding, ἵνα often means “that”: the command is “love one another”."],
      ["What does καλῶς mean?", "well", ["good (adjective)", "beautiful ones", "call!"], "Adverbs often end in -ως: καλός, καλῶς."]
    ],
    practise: ["quiz", "vocab", "quiz", "toVocab", "form", "quiz", "vocab", "toVocab"],
    check: ["quiz", "quiz", "quiz", "quiz", "form", "vocab", "toVocab", "vocab", "spot", "quiz"],
    words: [
      ["μᾶλλον", 3123, "more, rather"], ["δίκαιος", 1342, "righteous, just"], ["πονηρός", 4190, "evil, wicked; ὁ πονηρός, the evil one"], ["πιστός", 4103, "faithful, believing"],
      ["αἰώνιος", 166, "eternal"], ["ἀγαπητός", 27, "beloved, dear"], ["ἔσχατος", 2078, "last"], ["μακάριος", 3107, "blessed, happy"],
      ["κακός", 2556, "bad, evil"], ["ἐμός", 1699, "my, mine"], ["λοιπός", 3062, "remaining; οἱ λοιποί, the rest"], ["δεξιός", 1188, "right; ἐκ δεξιῶν, at the right hand"]
    ]
  },
  {
    id: "4.9", title: "δίδωμι, I give", machen: "Lesson XXXI", minutes: 45,
    focus: "mi", tv: [...TVI, "perfect active"],
    teach: [
      { h: "Verbs in -μι", p: `<p>A small group of very common verbs end in <span lang="el">-μι</span> instead of <span lang="el">-ω</span> in the dictionary. In the present they reduplicate with <span lang="el">ι</span> and add endings straight to the stem: <span lang="el">δί-δω-μι</span>, from the stem <span lang="el">δο-</span>. Outside the present they mostly behave like ordinary verbs.</p>` },
      { table: { title: "δίδωμι: present active indicative", model: "δίδωμι", kind: "verb", rows: pn("V-PAI-", [["-μι", "δίδωμι"], ["-ς", "δίδως"], ["-σι(ν)", "δίδωσι(ν)"], ["-μεν", "δίδομεν"], ["-τε", "δίδοτε"], ["-ασι(ν)", "διδόασι(ν)"]]) } },
      { table: { title: "δίδωμι: aorist active indicative", model: "δίδωμι", kind: "verb", rows: pn("V-AAI-", [["-κα", "ἔδωκα"], ["-κας", "ἔδωκας"], ["-κε(ν)", "ἔδωκε(ν)"], ["-καμεν", "ἐδώκαμεν"], ["-κατε", "ἐδώκατε"], ["-καν", "ἔδωκαν"]]) } },
      { grid: { caption: "The main parts of δίδωμι", head: ["", "Form", "Meaning"], el: [1], rows: [
        ["present", "δίδωμι", "I give"], ["future", "δώσω", "I will give"], ["aorist", "ἔδωκα", "I gave"], ["perfect", "δέδωκα", "I have given"], ["aorist passive", "ἐδόθην", "I was given"]] } },
      { h: "John 3:16", p: `<p>The aorist with <span lang="el">κα</span> is the form you will see most: John 3:16, <span lang="el">τὸν υἱὸν τὸν μονογενῆ ἔδωκεν</span>, "he gave his one and only Son". Outside the indicative, the aorist uses the short stem: infinitive <span lang="el">δοῦναι</span>, imperative <span lang="el">δός</span> "give!", subjunctive <span lang="el">δῷ</span>.</p>` },
      { table: { title: "γινώσκω: second aorist indicative", model: "γινώσκω", kind: "verb", rows: pn("V-2AAI-", [["", "ἔγνων"], ["", "ἔγνως"], ["", "ἔγνω"], ["", "ἔγνωμεν"], ["", "ἔγνωτε"], ["", "ἔγνωσαν"]]) } },
      { h: "Three more things from Machen's lesson", p: `<ul><li><span lang="el">γινώσκω</span> has a second aorist with no connecting vowel, like a <span lang="el">-μι</span> verb: <span lang="el">ἔγνων</span> "I knew".</li><li>The article with <span lang="el">μέν</span> and <span lang="el">δέ</span> means "the one ... the other": <span lang="el">οἱ μὲν ... οἱ δέ</span> "some ... others". At the start of a sentence, <span lang="el">ὁ δέ</span> means "and he" or "but he": John 6:20, <span lang="el">ὁ δὲ λέγει αὐτοῖς</span>.</li><li>An aorist participle can describe the same act as the main verb: <span lang="el">ἀποκριθεὶς εἶπεν</span>, "he answered and said".</li></ul>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Forms of -μι verbs are underlined. Tap one: present or aorist?" },
    spot: [["mi", "is a form of a -μι verb"]],
    quiz: [
      ["In John 3:16, ἔδωκεν means ...", "he gave", ["he gives", "he will give", "he has given"], "ἔδωκεν is the aorist of δίδωμι, built with κα."],
      ["οἱ μὲν ... οἱ δέ means ...", "some ... others", ["the men ... the women", "these ... those things", "indeed ... but"], "The article with μέν and δέ: “the ones ... the others”."],
      ["What is the stem of δίδωμι?", "δο-", ["διδ-", "δωμ-", "δι-"], "The present reduplicates with ι: δί-δω-μι from δο-."],
      ["ἀποκριθεὶς εἶπεν means ...", "he answered and said", ["after answering, later he said", "he was answered and spoke", "answer and say!"], "Here the aorist participle and the main verb describe one act."]
    ],
    practise: ["ending", "parseV", "meaning", "tv", "quiz", "vocab", "form", "toVocab"],
    check: ["ending", "parseV", "meaning", "tv", "quiz", "quiz", "vocab", "toVocab", "spot", "form"],
    words: [
      ["δίδωμι", 1325, "I give", ["give", "gives", "gave", "giving", "given"]], ["παραδίδωμι", 3860, "I hand over, betray, entrust", ["hand over", "hands over", "handed over", "handing over", "handed over"]],
      ["ἐντολή", 1785, "commandment"], ["κεφαλή", 2776, "head"], ["συναγωγή", 4864, "synagogue"], ["χαρά", 5479, "joy"],
      ["ἀρχή", 746, "beginning, ruler"], ["ἐπαγγελία", 1860, "promise"], ["σοφία", 4678, "wisdom"], ["παραβολή", 3850, "parable"], ["γλῶσσα", 1100, "tongue, language"]
    ]
  },
  {
    id: "4.10", title: "τίθημι, ἀφίημι and others", machen: "Lesson XXXII", minutes: 40,
    focus: "mi", tv: [...TVI, "perfect active", "perfect middle or passive"],
    teach: [
      { h: "τίθημι, I put, place", p: `<p><span lang="el">τίθημι</span> works like <span lang="el">δίδωμι</span>, from the stem <span lang="el">θε-</span>. John 10:11, <span lang="el">ὁ ποιμὴν ὁ καλὸς τὴν ψυχὴν αὐτοῦ τίθησιν ὑπὲρ τῶν προβάτων</span>, "the good shepherd lays down his life for the sheep".</p>` },
      { table: { title: "τίθημι: present active indicative", model: "τίθημι", kind: "verb", rows: pn("V-PAI-", [["-μι", "τίθημι"], ["-ς", "τίθης"], ["-σι(ν)", "τίθησι(ν)"], ["-μεν", "τίθεμεν"], ["-τε", "τίθετε"], ["-ασι(ν)", "τιθέασι(ν)"]]) } },
      { table: { title: "τίθημι: aorist active indicative", model: "τίθημι", kind: "verb", rows: pn("V-AAI-", [["-κα", "ἔθηκα"], ["-κας", "ἔθηκας"], ["-κε(ν)", "ἔθηκε(ν)"], ["-καμεν", "ἐθήκαμεν"], ["-κατε", "ἐθήκατε"], ["-καν", "ἔθηκαν"]]) } },
      { h: "ἀφίημι, I let go, forgive", p: `<p><span lang="el">ἀφίημι</span> (<span lang="el">ἀπό</span> + <span lang="el">ἵημι</span>) means "let go", and so "leave", "permit", and "forgive". Its aorist is <span lang="el">ἀφῆκα</span>; the New Testament's 2nd singular is <span lang="el">ἀφῆκες</span> (Revelation 2:4). Mark 2:5, <span lang="el">Τέκνον, ἀφίενταί σου αἱ ἁμαρτίαι</span>, "Child, your sins are forgiven" (present passive). In Luke 11:4 the New Testament uses the ordinary <span lang="el">-ω</span> ending: <span lang="el">ἀφίομεν</span> "we forgive".</p>` },
      { table: { title: "ἀφίημι: aorist active indicative", model: "ἀφίημι", kind: "verb", rows: pn("V-AAI-", [["-κα", "ἀφῆκα"], ["-κες", "ἀφῆκες"], ["-κε(ν)", "ἀφῆκε(ν)"], ["-καμεν", "ἀφήκαμεν"], ["-κατε", "ἀφήκατε"], ["-καν", "ἀφῆκαν"]]) } },
      { h: "δείκνυμι and ἀπόλλυμι", p: `<p>Verbs in <span lang="el">-νυμι</span> add <span lang="el">νυ</span> in the present: John 5:20, <span lang="el">πάντα δείκνυσιν αὐτῷ</span>, "he shows him all things". The New Testament often gives them <span lang="el">-ω</span> endings: John 2:18, <span lang="el">δεικνύεις</span>. <span lang="el">ἀπόλλυμι</span> means "destroy" in the active and "perish" in the middle: John 3:16, <span lang="el">μὴ ἀπόληται</span>, "should not perish".</p>` },
      { h: "Result and “until”", p: `<ul><li><span lang="el">ὥστε</span> with the accusative and infinitive gives a result: Matthew 8:24, <span lang="el">ὥστε τὸ πλοῖον καλύπτεσθαι</span>, "so that the boat was being swamped".</li><li><span lang="el">ἕως</span> (often with <span lang="el">ἄν</span>) and the subjunctive means "until": Matthew 5:18, <span lang="el">ἕως ἂν παρέλθῃ ὁ οὐρανὸς καὶ ἡ γῆ</span>, "until heaven and earth pass away".</li></ul>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Forms of -μι verbs are underlined." },
    spot: [["mi", "is a form of a -μι verb"]],
    quiz: [
      ["In John 10:11, τίθησιν means ...", "lays down", ["laid down", "will lay down", "to lay down"], "τίθησιν is the present of τίθημι, 3rd singular."],
      ["Which meaning does ἀφίημι not have?", "to give", ["to forgive", "to leave", "to permit"], "ἀφίημι means let go: leave, permit, forgive."],
      ["ὥστε with the infinitive expresses ...", "result", ["purpose", "time", "a question"], "Matthew 8:24, ὥστε τὸ πλοῖον καλύπτεσθαι, “so that the boat was being swamped”."],
      ["ἕως ἄν with the subjunctive means ...", "until", ["while", "because", "if"], "Matthew 5:18, ἕως ἂν παρέλθῃ, “until ... pass away”."],
      ["In John 3:16, ἀπόληται means ...", "perish", ["destroy", "lose", "release"], "ἀπόλλυμι in the middle means “perish”."]
    ],
    practise: ["ending", "parseV", "meaning", "quiz", "tv", "vocab", "form", "toVocab"],
    check: ["ending", "parseV", "meaning", "tv", "quiz", "quiz", "vocab", "toVocab", "spot", "form"],
    words: [
      ["τίθημι", 5087, "I put, place, lay down", ["put", "puts", "put", "putting", "put"]], ["ἀφίημι", 863, "I let go, leave, permit, forgive", ["forgive", "forgives", "forgave", "forgiving", "forgiven"]],
      ["ἀπόλλυμι", 622, "I destroy; middle, I perish"], ["δείκνυμι", 1166, "I show"], ["πούς", 4228, "foot"], ["νύξ", 3571, "night"],
      ["μήτηρ", 3384, "mother"], ["παιδίον", 3813, "child, little child"], ["τυφλός", 5185, "blind"]
    ]
  },
  {
    id: "4.11", title: "ἵστημι, οἶδα, wishes and “if only”", machen: "Lesson XXXIII", minutes: 45,
    focus: "oida", tv: [...TVI, "perfect active"],
    teach: [
      { h: "ἵστημι: two meanings", p: `<p><span lang="el">ἵστημι</span> has two sides. Some forms mean "set, make stand" (transitive); others mean "stand" (intransitive). The aorist shows it most clearly.</p>` },
      { grid: { caption: "The main parts of ἵστημι", head: ["", "Form", "Meaning"], el: [1], rows: [
        ["present", "ἵστημι", "I set, make stand"], ["first aorist", "ἔστησα", "I set, made stand"], ["second aorist", "ἔστην", "I stood"], ["perfect", "ἕστηκα", "I stand"], ["aorist passive", "ἐστάθην", "I was set; I stood"]] } },
      { table: { title: "ἵστημι, checked", hidden: true, kind: "verb", rows: [
        ["", "", "ἔστησεν", "V-AAI-3S", "ἵστημι"], ["", "", "ἔστη", "V-2AAI-3S", "ἵστημι"], ["", "", "ἕστηκεν", "V-RAI-3S", "ἵστημι"], ["", "", "ἕστηκα", "V-RAI-1S", "ἵστημι"], ["", "", "ἐστάθη", "V-API-3S", "ἵστημι"]] } },
      { h: "Perfect with a present meaning", p: `<p>The perfect <span lang="el">ἕστηκα</span> means "I have taken my stand", and so "I stand": John 1:26, <span lang="el">μέσος ὑμῶν ἕστηκεν</span>, "among you stands one". <span lang="el">οἶδα</span> "I know" works the same way: it is perfect in form, present in meaning, and its pluperfect <span lang="el">ᾔδειν</span> means "I knew".</p>` },
      { table: { title: "οἶδα, I know", model: "οἶδα", kind: "verb", rows: pn("V-RAI-", [["", "οἶδα"], ["", "οἶδας"], ["", "οἶδε(ν)"], ["", "οἴδαμεν"], ["", "οἴδατε"], ["", "οἴδασι(ν)"]]) } },
      { h: "The optative: wishes", p: `<p>The <b>optative</b> is rare in the New Testament. It mostly expresses a wish: Paul's <span lang="el">μὴ γένοιτο</span>, "may it never be!" (Romans 6:2). Luke also uses it in indirect questions: Luke 1:29, <span lang="el">ποταπὸς εἴη ὁ ἀσπασμὸς οὗτος</span>, "what sort of greeting this might be".</p>` },
      { h: "If only", p: `<p>A condition contrary to fact uses <span lang="el">εἰ</span> with a past tense of the indicative, and <span lang="el">ἄν</span> in the result: John 11:21, <span lang="el">Κύριε, εἰ ἦς ὧδε οὐκ ἂν ἀπέθανεν ὁ ἀδελφός μου</span>, "Lord, if you had been here, my brother would not have died". The grammar itself tells you it did not happen.</p>` },
      { h: "γίνομαι", p: `<p><span lang="el">γίνομαι</span> means "become", "happen", "come", or simply "be". Luke often begins a story with <span lang="el">ἐγένετο</span>, "it came to pass", "it happened": Luke 2:1, <span lang="el">Ἐγένετο δὲ ἐν ταῖς ἡμέραις ἐκείναις</span>.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Forms of οἶδα are underlined. Perfect in form, present in meaning: “I know”." },
    spot: [["oida", "is a form of οἶδα"], ["mi", "is a form of a -μι verb"]],
    quiz: [
      ["In John 1:26, ἕστηκεν means ...", "stands", ["stood up once", "made stand", "will stand"], "The perfect of ἵστημι has a present meaning: “he has taken his stand”, “he stands”."],
      ["What tense is οἶδα in form?", "perfect, with a present meaning", ["present", "aorist", "future"], "οἶδα is perfect in form; it means “I know”."],
      ["μὴ γένοιτο (Romans 6:2) expresses ...", "a wish: may it never be!", ["a command", "a purpose", "a past fact"], "The optative mostly expresses wishes."],
      ["In John 11:21, εἰ ἦς ὧδε οὐκ ἂν ἀπέθανεν means ...", "if you had been here, he would not have died", ["if you are here, he will not die", "when you were here, he did not die", "because you were here, he did not die"], "εἰ with a past indicative and ἄν: a condition contrary to fact."],
      ["Which form means “I stood”?", "ἔστην", ["ἔστησα", "ἵστημι", "στήσω"], "The second aorist ἔστην is intransitive: “I stood”; ἔστησα means “I set”."]
    ],
    practise: ["parseV", "meaning", "quiz", "tv", "vocab", "form", "quiz", "toVocab"],
    check: ["parseV", "meaning", "meaning", "tv", "quiz", "quiz", "quiz", "vocab", "toVocab", "spot"],
    words: [
      ["ἵστημι", 2476, "I set, make stand; I stand"], ["ἀνίστημι", 450, "I raise; I rise, stand up"], ["οἶδα", 1492, "I know"], ["φημί", 5346, "I say"],
      ["μέσος", 3319, "middle; ἐν μέσῳ, among"], ["διδάσκαλος", 1320, "teacher"], ["πρεσβύτερος", 4245, "elder, older"], ["εὐθύς", 2117, "immediately, at once"], ["δέω", 1210, "I bind, tie"]
    ]
  }
];
