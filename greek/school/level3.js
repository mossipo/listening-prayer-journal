// Akouō Greek School, Level 3: Participles and moods. Machen, New Testament Greek for Beginners (1923), Lessons XVII
// to XXII, retold in plain English. Same lesson shape as Level 1 (see level1.js), plus quiz: [question, right answer,
// [wrong answers], why] for points of grammar the data cannot ask about directly. Every verse quoted is the SBLGNT text.
import { gendered, pn, cn } from "./forms.js";

const TV2 = ["present active", "present middle or passive", "imperfect active", "future active", "aorist active", "aorist passive"];

export const LEVEL3 = [
  {
    id: "3.1", title: "The third declension", machen: "Lesson XVII", minutes: 40,
    focus: "n3",
    teach: [
      { h: "Find the stem in the genitive", p: `<p>Third declension nouns hide their stem in the nominative. <span lang="el">σάρξ</span> "flesh" looks short, but its genitive <span lang="el">σαρκός</span> shows the stem <span lang="el">σαρκ-</span>. Learn every third declension noun with its genitive: <span lang="el">σάρξ, σαρκός</span>; <span lang="el">ὄνομα, ὀνόματος</span>; <span lang="el">πατήρ, πατρός</span>. Then the endings go on the stem.</p>` },
      { table: { title: "σάρξ, flesh (feminine)", model: "σάρξ", kind: "noun", rows: cn("N-", "F", [["", "σάρξ"], ["-ος", "σαρκός"], ["-ι", "σαρκί"], ["-α", "σάρκα"], ["-ες", "σάρκες"], ["-ων", "σαρκῶν"], ["", "σαρξί(ν)"], ["-ας", "σάρκας"]]) } },
      { h: "Why the nominative looks different", p: `<p>The nominative adds <span lang="el">ς</span> to the stem, and the two letters merge: <span lang="el">κ</span> or <span lang="el">γ</span> with <span lang="el">ς</span> gives <span lang="el">ξ</span> (<span lang="el">σάρξ</span>); <span lang="el">τ</span> or <span lang="el">δ</span> drops out (<span lang="el">ἐλπίς, ἐλπίδος</span>, "hope"). The same thing happens in the dative plural before <span lang="el">σι</span>: <span lang="el">σαρξί</span>.</p>` },
      { table: { title: "πνεῦμα, spirit (neuter)", model: "πνεῦμα", kind: "noun", rows: cn("N-", "N", [["", "πνεῦμα"], ["-ος", "πνεύματος"], ["-ι", "πνεύματι"], ["", "πνεῦμα"], ["-α", "πνεύματα"], ["-ων", "πνευμάτων"], ["-σι(ν)", "πνεύμασι(ν)"], ["-α", "πνεύματα"]]) } },
      { h: "Neuters in -μα", p: `<p>Nouns ending in <span lang="el">-μα</span> are neuter and have the stem <span lang="el">-ματ-</span>: <span lang="el">ὄνομα, ὀνόματος</span> "name", <span lang="el">σῶμα, σώματος</span> "body". As with every neuter, the nominative and accusative are the same. John 3:6 has both kinds side by side: <span lang="el">τὸ γεγεννημένον ἐκ τῆς σαρκὸς σάρξ ἐστιν, καὶ τὸ γεγεννημένον ἐκ τοῦ πνεύματος πνεῦμά ἐστιν</span>.</p>` },
      { grid: { caption: "πατήρ, father, and ἀνήρ, man", head: ["", "πατήρ", "ἀνήρ"], el: [1, 2], rows: [
        ["nominative singular", "πατήρ", "ἀνήρ"], ["genitive singular", "πατρός", "ἀνδρός"], ["dative singular", "πατρί", "ἀνδρί"], ["accusative singular", "πατέρα", "ἄνδρα"],
        ["nominative plural", "πατέρες", "ἄνδρες"], ["genitive plural", "πατέρων", "ἀνδρῶν"], ["dative plural", "πατράσι(ν)", "ἀνδράσι(ν)"], ["accusative plural", "πατέρας", "ἄνδρας"]] } },
      { table: { title: "πατήρ, checked", model: "πατήρ", kind: "noun", hidden: true, rows: cn("N-", "M", [["", "πατήρ"], ["", "πατρός"], ["", "πατρί"], ["", "πατέρα"], ["", "πατέρες"], ["", "πατέρων"], ["", "πατράσι(ν)"], ["", "πατέρας"]]) } },
      { table: { title: "ἀνήρ, checked", model: "ἀνήρ", kind: "noun", hidden: true, rows: cn("N-", "M", [["", "ἀνήρ"], ["", "ἀνδρός"], ["", "ἀνδρί"], ["", "ἄνδρα"], ["", "ἄνδρες"], ["", "ἀνδρῶν"], ["", "ἀνδράσι(ν)"], ["", "ἄνδρας"]]) } },
      { h: "Learn the gender too", p: `<p>A third declension noun can be any gender, and the ending will not tell you which: <span lang="el">ἡ σάρξ</span>, <span lang="el">ὁ αἰών</span>, <span lang="el">τὸ πνεῦμα</span>. Learn each noun with its article. A few have a shorter accusative: <span lang="el">χάρις, χάριτος</span>, accusative <span lang="el">χάριν</span>.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Third declension nouns are underlined. Tap one and look for its stem." },
    spot: [["n3", "is a third declension noun"]],
    practise: ["ending", "parseN", "vocab", "form", "parseN", "toVocab", "parseN", "form"],
    check: ["ending", "parseN", "parseN", "form", "vocab", "toVocab", "spot", "parseN", "form", "vocab"],
    words: [
      ["σάρξ", 4561, "flesh, human nature"], ["πνεῦμα", 4151, "spirit, Spirit, wind, breath"], ["ὄνομα", 3686, "name"], ["σῶμα", 4983, "body"],
      ["πατήρ", 3962, "father"], ["ἀνήρ", 435, "man, husband"], ["γυνή", 1135, "woman, wife"], ["χάρις", 5485, "grace, favour, thanks"],
      ["πίστις", 4102, "faith, faithfulness, trust"], ["χείρ", 5495, "hand"], ["αἰών", 165, "age, eternity"], ["ἐλπίς", 1680, "hope"]
    ]
  },
  {
    id: "3.2", title: "Present participles", machen: "Lesson XVIII", minutes: 45,
    focus: "ppart", tv: [...TV2, "present active participle", "present middle or passive participle"],
    teach: [
      { h: "A verb that works like an adjective", p: `<p>A <b>participle</b> is a verbal adjective: a verb with tense and voice, declined like an adjective in gender, case and number. English participles end in "-ing": "believing", "the one who believes".</p>` },
      { table: { title: "Present active participle of λύω, masculine", model: "λύω", kind: "noun", rows: cn("V-PAP-", "M", [["-ων", "λύων"], ["-οντος", "λύοντος"], ["-οντι", "λύοντι"], ["-οντα", "λύοντα"], ["-οντες", "λύοντες"], ["-οντων", "λυόντων"], ["-ουσι(ν)", "λύουσι(ν)"], ["-οντας", "λύοντας"]]) } },
      ...gendered("Present active participle of λύω", "λύω", "V-PAP-", [["λύων", "λύουσα", "λῦον"], ["λύοντος", "λυούσης", "λύοντος"], ["λύοντι", "λυούσῃ", "λύοντι"], ["λύοντα", "λύουσαν", "λῦον"],
        ["λύοντες", "λύουσαι", "λύοντα"], ["λυόντων", "λυουσῶν", "λυόντων"], ["λύουσι(ν)", "λυούσαις", "λύουσι(ν)"], ["λύοντας", "λυούσας", "λύοντα"]]),
      { h: "How the endings work", p: `<p>The masculine and neuter take third declension endings on the stem <span lang="el">λυοντ-</span>; the feminine takes first declension endings like <span lang="el">δόξα</span> on <span lang="el">λυουσ-</span>. The middle and passive participle is simpler: <span lang="el">λυόμενος, λυομένη, λυόμενον</span>, declined exactly like <span lang="el">ἀγαθός</span>.</p>` },
      ...gendered("Participle of εἰμί, being", "εἰμί", "V-PAP-", [["ὤν", "οὖσα", "ὄν"], ["ὄντος", "οὔσης", "ὄντος"], ["ὄντι", "οὔσῃ", "ὄντι"], ["ὄντα", "οὖσαν", "ὄν"],
        ["ὄντες", "οὖσαι", "ὄντα"], ["ὄντων", "οὐσῶν", "ὄντων"], ["οὖσι(ν)", "οὔσαις", "οὖσι(ν)"], ["ὄντας", "οὔσας", "ὄντα"]]),
      { h: "Two main uses", p: `<ul><li><b>As a noun or adjective</b>, usually with the article: <span lang="el">ὁ πιστεύων</span> "the one who believes, whoever believes" (John 3:16); <span lang="el">ὁ ὢν εἰς τὸν κόλπον τοῦ πατρός</span> "the one who is at the Father's side" (John 1:18).</li><li><b>Beside the verb</b>, with no article, telling the circumstances: when, while, because, although. John 20:31, <span lang="el">ἵνα πιστεύοντες ζωὴν ἔχητε</span>, "that by believing you may have life".</li></ul>` },
      { h: "Time is relative", p: `<p>The tense of a participle shows time compared with the main verb, not with now. A present participle usually describes action going on <i>at the same time</i> as the main verb: "while believing". So a present participle beside a past verb is translated with "was": "while he was speaking".</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Present participles are underlined. Tap one: what does it agree with?" },
    spot: [["ppart", "is a present participle"]],
    quiz: [
      ["In John 3:16, what does ὁ πιστεύων mean?", "the one who believes", ["he believed", "believe!", "to believe"], "With the article, a participle works as a noun: ὁ πιστεύων, “the one who believes, whoever believes”."],
      ["A present participle usually describes action happening ...", "at the same time as the main verb", ["before the main verb", "after the main verb", "only in the present day"], "Its time is relative to the main verb: “while”. Beside a past verb, it means “while he was ...”."],
      ["A participle agrees with the word it describes in ...", "gender, case and number", ["person and number", "tense and voice", "case only"], "A participle is a verbal adjective, so like an adjective it agrees in gender, case and number."],
      ["Which form is the present middle or passive participle of λύω?", "λυόμενος", ["λύων", "λύσας", "λυθείς"], "λυόμενος, λυομένη, λυόμενον is declined like ἀγαθός."]
    ],
    practise: ["parseN", "ending", "quiz", "tv", "vocab", "parseN", "form", "toVocab"],
    check: ["parseN", "parseN", "tv", "tv", "ending", "quiz", "quiz", "spot", "vocab", "form"],
    words: [
      ["κηρύσσω", 2784, "I preach, proclaim", ["proclaim", "proclaims", "proclaimed", "proclaiming", "proclaimed"]],
      ["βαπτίζω", 907, "I baptize", ["baptize", "baptizes", "baptized", "baptizing", "baptized"]],
      ["πέμπω", 3992, "I send", ["send", "sends", "sent", "sending", "sent"]],
      ["ἄγω", 71, "I lead, bring", ["lead", "leads", "led", "leading", "led"]],
      ["ἐκβάλλω", 1544, "I cast out, drive out", ["cast out", "casts out", "cast out", "casting out", "cast out"]],
      ["ἀνοίγω", 455, "I open", ["open", "opens", "opened", "opening", "opened"]],
      ["κράζω", 2896, "I cry out, shout", ["cry out", "cries out", "cried out", "crying out", ""]],
      ["σπείρω", 4687, "I sow", ["sow", "sows", "sowed", "sowing", "sown"]],
      ["ὑπάγω", 5217, "I go away, go", ["go away", "goes away", "went away", "going away", ""]]
    ]
  },
  {
    id: "3.3", title: "Aorist participles; οὐ and μή", machen: "Lesson XIX", minutes: 45,
    focus: "apart", tv: [...TV2, "present active participle", "present middle or passive participle", "aorist active participle", "aorist middle participle"],
    teach: [
      { h: "No augment outside the indicative", p: `<p>The aorist participle is built on the aorist stem with its <span lang="el">σα</span>, but without the augment. The augment marks past time and belongs only to the indicative: <span lang="el">ἔλυσα</span> "I loosed", but <span lang="el">λύσας</span> "having loosed".</p>` },
      { table: { title: "Aorist active participle of λύω, masculine", model: "λύω", kind: "noun", rows: cn("V-AAP-", "M", [["-σας", "λύσας"], ["-σαντος", "λύσαντος"], ["-σαντι", "λύσαντι"], ["-σαντα", "λύσαντα"], ["-σαντες", "λύσαντες"], ["-σαντων", "λυσάντων"], ["-σασι(ν)", "λύσασι(ν)"], ["-σαντας", "λύσαντας"]]) } },
      ...gendered("Aorist active participle of λύω", "λύω", "V-AAP-", [["λύσας", "λύσασα", "λῦσαν"], ["λύσαντος", "λυσάσης", "λύσαντος"], ["λύσαντι", "λυσάσῃ", "λύσαντι"], ["λύσαντα", "λύσασαν", "λῦσαν"],
        ["λύσαντες", "λύσασαι", "λύσαντα"], ["λυσάντων", "λυσασῶν", "λυσάντων"], ["λύσασι(ν)", "λυσάσαις", "λύσασι(ν)"], ["λύσαντας", "λυσάσας", "λύσαντα"]]),
      { h: "Middle and second aorist", p: `<p>The aorist middle participle is <span lang="el">λυσάμενος, λυσαμένη, λυσάμενον</span>, like <span lang="el">ἀγαθός</span>. A second aorist participle takes the endings of the present participle on the second aorist stem: <span lang="el">ἐλθών</span> "having come" (from <span lang="el">ἦλθον</span>), <span lang="el">ἰδών</span> "having seen" (from <span lang="el">εἶδον</span>), <span lang="el">εἰπών</span> "having said".</p>` },
      { h: "Before the main verb", p: `<p>An aorist participle usually describes action that happened <i>before</i> the main verb. Translate with "when" or "after": Mark 2:5, <span lang="el">ἰδὼν ὁ Ἰησοῦς τὴν πίστιν αὐτῶν λέγει</span>, "when Jesus saw their faith, he said". Matthew 9:18, <span lang="el">ἐλθὼν προσεκύνει αὐτῷ</span>, "he came and knelt before him".</p>` },
      { h: "οὐ and μή", p: `<p>Greek has two words for "not". <span lang="el">οὐ</span> (<span lang="el">οὐκ</span> before a smooth breathing, <span lang="el">οὐχ</span> before a rough one) goes with the indicative. <span lang="el">μή</span> goes with everything else: participles, the subjunctive, the infinitive and the imperative. So <span lang="el">ὁ μὴ πιστεύων</span> is "the one who does not believe".</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Aorist participles are underlined. Look for σα without an augment, or a second aorist stem." },
    spot: [["apart", "is an aorist participle"]],
    quiz: [
      ["Which negative goes with a participle?", "μή", ["οὐ", "οὐκ", "οὐχ"], "οὐ negates the indicative; μή negates the other moods, including the participle."],
      ["An aorist participle usually describes action ...", "before the main verb", ["at the same time as the main verb", "after the main verb", "repeated over and over"], "Translate with “when” or “after”: ἰδὼν ὁ Ἰησοῦς ... λέγει, “when Jesus saw ... he said” (Mark 2:5)."],
      ["Does an aorist participle have an augment?", "No, the augment belongs only to the indicative", ["Yes, always", "Only in the middle", "Only in the plural"], "λύσας has no augment; only the indicative ἔλυσα does."],
      ["Which is the second aorist participle of ἔρχομαι?", "ἐλθών", ["ἦλθον", "ἐρχόμενος", "ἐλεύσομαι"], "ἐλθών is built on the second aorist stem ἐλθ- with no augment (Matthew 9:18)."],
      ["Which word for “not” is used before ἔχει?", "οὐκ", ["μή", "οὐχ", "οὐ"], "Before a vowel with a smooth breathing, οὐ becomes οὐκ: οὐκ ἔχει."]
    ],
    practise: ["parseN", "ending", "quiz", "tv", "vocab", "quiz", "form", "toVocab"],
    check: ["parseN", "parseN", "tv", "tv", "ending", "quiz", "quiz", "spot", "vocab", "toVocab"],
    words: [
      ["ἀποκτείνω", 615, "I kill", ["kill", "kills", "killed", "killing", "killed"]], ["αἴρω", 142, "I take up, take away", ["take up", "takes up", "took up", "taking up", "taken up"]],
      ["ἀπολύω", 630, "I release, send away", ["release", "releases", "released", "releasing", "released"]], ["φέρω", 5342, "I bring, carry, bear", ["bring", "brings", "brought", "bringing", "brought"]],
      ["πίνω", 4095, "I drink", ["drink", "drinks", "drank", "drinking", "drunk"]], ["μηδέ", 3366, "and not, nor, not even"], ["μηδείς", 3367, "no one, nothing"],
      ["οὐδείς", 3762, "no one, nothing, no"], ["ἰδού", 2400, "look! see!"]
    ]
  },
  {
    id: "3.4", title: "The aorist passive participle; the genitive absolute", machen: "Lesson XX", minutes: 40,
    focus: "appart", tv: [...TV2, "present active participle", "aorist active participle", "aorist middle participle", "aorist passive participle"],
    teach: [
      { h: "θε for the passive participle", p: `<p>The aorist passive participle uses the passive stem with <span lang="el">θ</span>, and no augment: <span lang="el">λυθείς</span> "having been loosed".</p>` },
      { table: { title: "Aorist passive participle of λύω, masculine", model: "λύω", kind: "noun", rows: cn("V-APP-", "M", [["-θεις", "λυθείς"], ["-θεντος", "λυθέντος"], ["-θεντι", "λυθέντι"], ["-θεντα", "λυθέντα"], ["-θεντες", "λυθέντες"], ["-θεντων", "λυθέντων"], ["-θεισι(ν)", "λυθεῖσι(ν)"], ["-θεντας", "λυθέντας"]]) } },
      ...gendered("Aorist passive participle of λύω", "λύω", "V-APP-", [["λυθείς", "λυθεῖσα", "λυθέν"], ["λυθέντος", "λυθείσης", "λυθέντος"], ["λυθέντι", "λυθείσῃ", "λυθέντι"], ["λυθέντα", "λυθεῖσαν", "λυθέν"],
        ["λυθέντες", "λυθεῖσαι", "λυθέντα"], ["λυθέντων", "λυθεισῶν", "λυθέντων"], ["λυθεῖσι(ν)", "λυθείσαις", "λυθεῖσι(ν)"], ["λυθέντας", "λυθείσας", "λυθέντα"]]),
      { h: "Answering", p: `<p>Some verbs use passive forms with an active meaning here too. Matthew 4:4 begins <span lang="el">ὁ δὲ ἀποκριθεὶς εἶπεν</span>, "but he answered and said".</p>` },
      { h: "The genitive absolute", p: `<p>When a participle and its subject stand apart from the rest of the sentence, both go into the genitive. This is the <b>genitive absolute</b>, and its subject is usually someone other than the subject of the main verb. Translate with "while", "when" or "after".</p><ul><li>Mark 5:35, <span lang="el">Ἔτι αὐτοῦ λαλοῦντος ἔρχονται</span>, "while he was still speaking, they came".</li><li>Matthew 9:18, <span lang="el">Ταῦτα αὐτοῦ λαλοῦντος αὐτοῖς</span>, "while he was saying these things to them".</li></ul><p>In both, <span lang="el">αὐτοῦ</span> is the subject of the participle <span lang="el">λαλοῦντος</span>, and neither belongs to the main clause.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Aorist passive participles are underlined. Look for θε or θει." },
    spot: [["appart", "is an aorist passive participle"], ["gpart", "is a participle in the genitive"]],
    quiz: [
      ["In Mark 5:35, Ἔτι αὐτοῦ λαλοῦντος means ...", "while he was still speaking", ["he still speaks", "still speak to him", "of his speech"], "A participle and its subject in the genitive, apart from the main clause, form a genitive absolute: “while he was still speaking”."],
      ["A genitive absolute is made of ...", "a participle and its subject, both in the genitive", ["a participle in the accusative", "an infinitive with the article", "a noun after a preposition"], "Its subject is usually someone other than the subject of the main verb."],
      ["Which is an aorist passive participle?", "λυθείς", ["λύσας", "λυόμενος", "λύων"], "The aorist passive participle has θε or θει: λυθείς, λυθέντος."],
      ["In Matthew 4:4, ἀποκριθεὶς εἶπεν means ...", "he answered and said", ["he was answered", "having been said", "answer and say!"], "ἀποκριθείς is passive in form but active in meaning: “answering”."]
    ],
    practise: ["parseN", "ending", "quiz", "tv", "vocab", "quiz", "form", "toVocab"],
    check: ["parseN", "parseN", "tv", "tv", "quiz", "quiz", "ending", "spot", "vocab", "toVocab"],
    words: [
      ["καιρός", 2540, "time, season, right moment"], ["χρόνος", 5550, "time, period of time"], ["θρόνος", 2362, "throne"], ["λίθος", 3037, "stone"],
      ["καρπός", 2590, "fruit"], ["ἀπόστολος", 652, "apostle, messenger"], ["σημεῖον", 4592, "sign, miracle"], ["εὐαγγέλιον", 2098, "good news, gospel"],
      ["πρόσωπον", 4383, "face, presence"], ["πλοῖον", 4143, "boat"]
    ]
  },
  {
    id: "3.5", title: "The subjunctive", machen: "Lesson XXI", minutes: 45,
    focus: "subj", tv: ["present active", "aorist active", "present active subjunctive", "aorist active subjunctive", "aorist passive subjunctive", "present active participle"],
    teach: [
      { h: "A mood for what may be", p: `<p>The indicative states things as they are. The <b>subjunctive</b> speaks of what may be, should be, or is wished for. It appears mostly after certain words, so learning those words teaches you the subjunctive. It has a present and an aorist, but no augment and no time of its own: the present pictures action as going on, the aorist as a whole.</p>` },
      { table: { title: "Present active subjunctive of λύω", model: "λύω", kind: "verb", rows: pn("V-PAS-", [["-ω", "λύω"], ["-ῃς", "λύῃς"], ["-ῃ", "λύῃ"], ["-ωμεν", "λύωμεν"], ["-ητε", "λύητε"], ["-ωσι(ν)", "λύωσι(ν)"]]) } },
      { table: { title: "Aorist active subjunctive of λύω", model: "λύω", kind: "verb", rows: pn("V-AAS-", [["-σω", "λύσω"], ["-σῃς", "λύσῃς"], ["-σῃ", "λύσῃ"], ["-σωμεν", "λύσωμεν"], ["-σητε", "λύσητε"], ["-σωσι(ν)", "λύσωσι(ν)"]]) } },
      { table: { title: "Aorist passive subjunctive of λύω", model: "λύω", kind: "verb", rows: pn("V-APS-", [["-θω", "λυθῶ"], ["-θῃς", "λυθῇς"], ["-θῃ", "λυθῇ"], ["-θωμεν", "λυθῶμεν"], ["-θητε", "λυθῆτε"], ["-θωσι(ν)", "λυθῶσι(ν)"]]) } },
      { h: "The sign: a long vowel", p: `<p>The subjunctive lengthens the vowel before the ending: <span lang="el">λύομεν</span> becomes <span lang="el">λύωμεν</span>, <span lang="el">λύετε</span> becomes <span lang="el">λύητε</span>. The subjunctive of <span lang="el">εἰμί</span> is just the long vowels: <span lang="el">ὦ, ᾖς, ᾖ, ὦμεν, ἦτε, ὦσι(ν)</span>.</p>` },
      { table: { title: "Subjunctive of εἰμί", model: "εἰμί", kind: "verb", hidden: true, rows: pn("V-PAS-", [["", "ὦ"], ["", "ᾖς"], ["", "ᾖ"], ["", "ὦμεν"], ["", "ἦτε"], ["", "ὦσι(ν)"]]) } },
      { h: "Where you will meet it", p: `<ul><li><b>Purpose</b>, after <span lang="el">ἵνα</span> "in order that": John 3:16, <span lang="el">ἵνα πᾶς ὁ πιστεύων εἰς αὐτὸν μὴ ἀπόληται ἀλλὰ ἔχῃ ζωὴν αἰώνιον</span>.</li><li><b>Conditions</b>, after <span lang="el">ἐάν</span> "if": John 3:3, <span lang="el">ἐὰν μή τις γεννηθῇ ἄνωθεν</span>, "unless someone is born from above".</li><li><b>"Let us"</b>, in the 1st plural: John 14:31, <span lang="el">ἄγωμεν ἐντεῦθεν</span>, "let us go from here".</li><li><b>"Do not"</b>, with <span lang="el">μή</span> and the aorist: Matthew 6:13, <span lang="el">μὴ εἰσενέγκῃς ἡμᾶς</span>, "do not lead us".</li><li><b>"Never"</b>, with <span lang="el">οὐ μή</span> and the aorist: John 6:35, <span lang="el">οὐ μὴ πεινάσῃ</span>, "will never hunger".</li></ul>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Subjunctive verbs are underlined. Look for the word before each one: ἵνα, ἐάν, μή." },
    spot: [["subj", "is a subjunctive verb"]],
    quiz: [
      ["What does ἵνα with the subjunctive usually express?", "purpose: in order that, so that", ["a fact", "a command", "a past event"], "John 3:16, ἵνα ... μὴ ἀπόληται, “so that ... should not perish”."],
      ["In John 14:31, ἄγωμεν means ...", "let us go", ["we went", "we are going", "they lead"], "A 1st person plural subjunctive can urge: “let us”."],
      ["What marks a verb as subjunctive?", "a long vowel before the ending, ω or η", ["an augment", "σα before the ending", "θη before the ending"], "λύωμεν, λύητε: the subjunctive lengthens the connecting vowel."],
      ["How does Greek say a strong “never”?", "οὐ μή with the aorist subjunctive", ["μή with the indicative", "οὐ with the infinitive", "ἵνα with the future"], "John 6:35, οὐ μὴ πεινάσῃ, “will never hunger”."],
      ["μὴ εἰσενέγκῃς ἡμᾶς (Matthew 6:13) is ...", "a prohibition: do not lead us", ["a question", "a purpose clause", "a statement of fact"], "μή with the aorist subjunctive forbids an action."],
      ["Does the subjunctive have an augment?", "No", ["Yes, in the aorist", "Yes, in the present", "Only after ἵνα"], "Only the indicative has the augment."]
    ],
    practise: ["ending", "parseV", "quiz", "tv", "vocab", "quiz", "form", "toVocab"],
    check: ["ending", "parseV", "tv", "tv", "quiz", "quiz", "quiz", "spot", "vocab", "form"],
    words: [
      ["ἄν", 302, "a particle that makes a statement conditional or indefinite; often not translated"], ["ὅπως", 3704, "that, in order that; how"], ["ὥστε", 5620, "so that, therefore"],
      ["ὅπου", 3699, "where, wherever"], ["πῶς", 4459, "how?"], ["ποῦ", 4226, "where?"], ["εἴτε", 1535, "if, whether; εἴτε ... εἴτε, whether ... or"],
      ["οὔτε", 3777, "and not; οὔτε ... οὔτε, neither ... nor"], ["διό", 1352, "therefore, for this reason"], ["ἤδη", 2235, "already, now"]
    ]
  },
  {
    id: "3.6", title: "The infinitive", machen: "Lesson XXII", minutes: 45,
    focus: "inf", tv: ["present active", "aorist active", "present active infinitive", "present middle or passive infinitive", "aorist active infinitive", "aorist passive infinitive", "aorist active subjunctive"],
    teach: [
      { h: "“To”", p: `<p>The <b>infinitive</b> is a verbal noun: "to loose". It has tense and voice but no person, so it has one form for each tense and voice. As with the subjunctive, its tense shows how the action is pictured, not when.</p>` },
      { table: { title: "Infinitives of λύω", model: "λύω", kind: "verb", rows: [
        ["present active", "-ειν", "λύειν", "V-PAN"], ["present middle or passive", "-εσθαι", "λύεσθαι", "V-PPN"], ["aorist active", "-σαι", "λῦσαι", "V-AAN"],
        ["aorist middle", "-σασθαι", "λύσασθαι", "V-AMN"], ["aorist passive", "-θηναι", "λυθῆναι", "V-APN"], ["second aorist active", "-ειν", "λιπεῖν", "V-2AAN", "λείπω"], ["of εἰμί", "", "εἶναι", "V-PAN", "εἰμί"]] } },
      { h: "Completing a verb", p: `<p>Many verbs and nouns are completed by an infinitive: <span lang="el">θέλω</span> "I want (to)", <span lang="el">δύναμαι</span> "I am able (to)", <span lang="el">δεῖ</span> "it is necessary (to)". John 1:12, <span lang="el">ἔδωκεν αὐτοῖς ἐξουσίαν τέκνα θεοῦ γενέσθαι</span>, "he gave them the right to become children of God".</p>` },
      { h: "With the article", p: `<p>Because it is a noun, the infinitive can take the neuter article, and then a preposition:</p><ul><li><span lang="el">ἐν τῷ</span> + infinitive, "while": Luke 24:51, <span lang="el">ἐν τῷ εὐλογεῖν αὐτὸν αὐτούς</span>, "while he was blessing them".</li><li><span lang="el">μετὰ τό</span>, "after": Matthew 26:32, <span lang="el">μετὰ δὲ τὸ ἐγερθῆναί με</span>, "after I am raised".</li><li><span lang="el">πρὸ τοῦ</span>, "before": John 1:48, <span lang="el">πρὸ τοῦ σε Φίλιππον φωνῆσαι</span>, "before Philip called you".</li><li><span lang="el">διὰ τό</span>, "because": Luke 2:4, <span lang="el">διὰ τὸ εἶναι αὐτὸν ἐξ οἴκου ... Δαυίδ</span>, "because he was of the house ... of David".</li></ul><p>The subject of an infinitive is in the accusative: in Luke 2:4, <span lang="el">αὐτόν</span> is the one who "was".</p>` },
      { h: "Reported speech", p: `<p>After verbs of saying, knowing and believing, Greek uses <span lang="el">ὅτι</span> with the indicative, and keeps the tense the speaker used. English shifts it: "he said that he <i>was</i>"; Greek says "he said that he <i>is</i>". Greek can also report speech with the accusative and infinitive.</p>` },
      { h: "Names", p: `<p>Most names are declined like other nouns: <span lang="el">Ἰησοῦς, Ἰησοῦ, Ἰησοῦ, Ἰησοῦν</span>. Hebrew names often are not declined at all: <span lang="el">Ἀβραάμ, Δαυίδ, Ἰσραήλ</span> keep one form, and the article or the sentence shows the case.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Infinitives are underlined. Tap one: what verb or phrase does it complete?" },
    spot: [["inf", "is an infinitive"]],
    quiz: [
      ["In John 1:12, ἐξουσίαν ... γενέσθαι means ...", "the right to become", ["they became", "becoming", "he became"], "The infinitive γενέσθαι completes ἐξουσίαν: “the right to become children of God”."],
      ["ἐν τῷ with the infinitive usually means ...", "while", ["after", "because", "before"], "Luke 24:51, ἐν τῷ εὐλογεῖν αὐτόν, “while he was blessing”."],
      ["μετὰ τό with the infinitive means ...", "after", ["while", "because", "in order to"], "Matthew 26:32, μετὰ δὲ τὸ ἐγερθῆναί με, “after I am raised”."],
      ["πρὸ τοῦ with the infinitive means ...", "before", ["after", "while", "so that"], "John 1:48, πρὸ τοῦ σε Φίλιππον φωνῆσαι, “before Philip called you”."],
      ["διὰ τό with the infinitive means ...", "because", ["through", "after", "before"], "Luke 2:4, διὰ τὸ εἶναι αὐτόν, “because he was”."],
      ["In reported speech with ὅτι, Greek keeps ...", "the tense the speaker used", ["the tense of the main verb", "the aorist always", "the infinitive"], "English shifts the tense; Greek keeps the original."],
      ["What case is the subject of an infinitive?", "accusative", ["nominative", "genitive", "dative"], "Luke 2:4, τὸ εἶναι αὐτόν: αὐτόν is the subject of εἶναι."]
    ],
    practise: ["tv", "ending", "quiz", "vocab", "tv", "quiz", "form", "toVocab"],
    check: ["tv", "tv", "tv", "ending", "quiz", "quiz", "quiz", "spot", "vocab", "toVocab"],
    words: [
      ["Ἀβραάμ", 11, "Abraham"], ["Δαυίδ", 1138, "David"], ["Ἰσραήλ", 2474, "Israel"], ["Ἰερουσαλήμ", 2419, "Jerusalem"],
      ["Μωϋσῆς", 3475, "Moses"], ["Σίμων", 4613, "Simon"], ["Γαλιλαία", 1056, "Galilee"], ["Πιλᾶτος", 4091, "Pilate"]
    ]
  }
];
