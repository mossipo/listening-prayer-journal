// Akouō Greek School, Level 6: Greek for preaching. Beyond Machen: how the grammar you now know shapes the reading of a
// text, with the cautions a careful preacher needs. Where scholars disagree, both readings are given. Every verse quoted
// is the SBLGNT text. Words come from John (as in Levels 1 to 4); most questions are quiz items written into each lesson.

const AORPRES = ["present active", "imperfect active", "aorist active", "perfect active", "present active subjunctive", "aorist active subjunctive",
  "present active imperative", "aorist active imperative", "present active infinitive", "aorist active infinitive"];

export const LEVEL6 = [
  {
    id: "6.1", title: "What the genitive can mean", machen: "", minutes: 40,
    focus: "gen", pn: "noun",
    teach: [
      { h: "“Of” covers a lot", p: `<p>English "of" hides many relationships, and so does the Greek genitive. Naming the relationship is often where interpretation happens. The common ones:</p><ul><li><b>Possession or relationship:</b> <span lang="el">τέκνα θεοῦ</span> "children of God" (John 1:12).</li><li><b>Source or belonging:</b> <span lang="el">δύναμις θεοῦ</span> "God's power" (Romans 1:16).</li><li><b>Comparison:</b> <span lang="el">μείζονα ταύτης ἀγάπην</span> "greater love than this" (John 15:13).</li><li><b>Time:</b> <span lang="el">νυκτός</span> "by night" (John 3:2).</li></ul>` },
      { h: "Who does the action?", p: `<p>When the head noun names an action, the genitive can be its doer (<b>subjective</b>: "God loves") or its receiver (<b>objective</b>: "we love God"). <span lang="el">ἡ ἀγάπη τοῦ θεοῦ</span> in 1 John 2:5 can be "God's love" or "love for God"; the verse ties it to keeping his word, so many read "love for God", while others hear God's own love brought to completion in us. The grammar allows both; the context must decide.</p>` },
      { h: "A debate worth knowing", p: `<p>Galatians 2:16 says we are justified <span lang="el">διὰ πίστεως Ἰησοῦ Χριστοῦ</span>. Many translations read an objective genitive, "through faith in Jesus Christ", noting that the same verse goes on <span lang="el">εἰς Χριστὸν Ἰησοῦν ἐπιστεύσαμεν</span> "we believed in Christ Jesus". Others read a subjective genitive, "through the faithfulness of Jesus Christ". Both readings are held by careful scholars; when you preach it, say which you follow and why.</p>` }
    ],
    see: { mark: "focus", say: "Genitive nouns are underlined. For each, ask: what relationship does “of” stand for here?" },
    spot: [["gen", "is a noun in the genitive"]],
    quiz: [
      ["In John 1:12, τέκνα θεοῦ shows ...", "relationship: children of God", ["comparison: children greater than God", "time: children by God's day", "the object of an action"], "The genitive names whose children they are."],
      ["What is a subjective genitive?", "the genitive noun does the action", ["the genitive noun receives the action", "the genitive marks time", "the genitive follows a preposition"], "In “God's love” meaning “God loves”, θεοῦ is subjective."],
      ["What is an objective genitive?", "the genitive noun receives the action", ["the genitive noun does the action", "the genitive owns something", "the genitive compares"], "In “love for God”, θεοῦ is objective: God is loved."],
      ["ἡ ἀγάπη τοῦ θεοῦ in 1 John 2:5 can mean ...", "God's love, or love for God", ["only love about God", "love made out of God", "only God's kindness to animals"], "The grammar allows both; the context (keeping his word) leads many to read “love for God”."],
      ["Besides “faith in Jesus Christ”, how do some read πίστεως Ἰησοῦ Χριστοῦ (Galatians 2:16)?", "the faithfulness of Jesus Christ", ["faith instead of Jesus Christ", "Jesus Christ's lack of faith", "faith from the law"], "A subjective reading; both readings are held by careful scholars."],
      ["In John 15:13, ταύτης after μείζονα is a genitive of ...", "comparison: than this", ["time", "possession", "material"], "After a comparative, the genitive can mean “than”."],
      ["In Romans 1:16, δύναμις θεοῦ means ...", "God's power, the power that belongs to God", ["power over God", "power against God", "a powerful god"], "The genitive marks whose power it is."]
    ],
    practise: ["parseN", "quiz", "parseN", "quiz", "spot", "quiz", "parseN", "quiz"],
    check: ["parseN", "quiz", "quiz", "parseN", "quiz", "spot", "quiz", "parseN", "quiz", "spot"]
  },
  {
    id: "6.2", title: "The dative and the accusative at work", machen: "", minutes: 40,
    focus: "dat", pn: "noun",
    teach: [
      { h: "The dative", p: `<ul><li><b>Indirect object</b>, "to": <span lang="el">ἐντολὴν καινὴν δίδωμι ὑμῖν</span> "a new command I give to you" (John 13:34).</li><li><b>Means</b>, "by": <span lang="el">τῇ γὰρ χάριτί ἐστε σεσῳσμένοι</span> "for by grace you have been saved" (Ephesians 2:8).</li><li><b>Reference</b>, "with respect to": <span lang="el">ἀπεθάνομεν τῇ ἁμαρτίᾳ</span> "we died to sin" (Romans 6:2), that is, in relation to sin.</li><li><b>Time</b>, "on": <span lang="el">τῇ τρίτῃ ἡμέρᾳ</span> "on the third day" (Matthew 16:21).</li></ul>` },
      { h: "The accusative", p: `<ul><li><b>Direct object</b>, the most common use.</li><li><b>Two objects</b>, a person and a thing: <span lang="el">ἐκεῖνος ὑμᾶς διδάξει πάντα</span> "he will teach you all things" (John 14:26).</li><li><b>Extent of time</b>: <span lang="el">τρεῖς ἡμέρας</span> "for three days" (Matthew 12:40).</li><li><b>Subject of an infinitive</b>: <span lang="el">διὰ τὸ εἶναι αὐτόν</span> "because he was" (Luke 2:4).</li></ul>` }
    ],
    see: { mark: "focus", say: "Dative nouns are underlined. For each, ask: to, by, in, or with respect to?" },
    spot: [["dat", "is a noun in the dative"], ["acc", "is a noun in the accusative"]],
    quiz: [
      ["In Ephesians 2:8, τῇ χάριτι is a dative of ...", "means: by grace", ["time: on grace", "possession: grace's", "direct object: grace"], "Grace is the means by which you have been saved."],
      ["ἀπεθάνομεν τῇ ἁμαρτίᾳ (Romans 6:2) means ...", "we died with respect to sin", ["we died by means of sin", "we died on the day of sin", "sin died for us"], "A dative of reference: our relation to sin has ended."],
      ["In John 13:34, ὑμῖν is ...", "the indirect object: to you", ["the subject", "the direct object", "a dative of time"], "δίδωμι ὑμῖν, “I give to you”."],
      ["In Matthew 16:21, τῇ τρίτῃ ἡμέρᾳ means ...", "on the third day", ["for three days", "by the third day's power", "of the third day"], "The dative gives the point of time."],
      ["In John 14:26, why are both ὑμᾶς and πάντα accusative?", "διδάσκω takes two objects: the person taught and the thing taught", ["one is the subject", "πάντα follows a preposition", "ὑμᾶς is a mistake"], "“He will teach you all things”: a double accusative."],
      ["τρεῖς ἡμέρας (Matthew 12:40) is accusative to show ...", "how long: for three days", ["when exactly", "by what means", "whose days"], "The accusative of extent of time."],
      ["In Luke 2:4, αὐτόν in διὰ τὸ εἶναι αὐτόν is ...", "the subject of the infinitive", ["the object of διά", "a dative", "the main verb"], "The subject of an infinitive is in the accusative."]
    ],
    practise: ["parseN", "quiz", "parseN", "quiz", "spot", "quiz", "parseN", "quiz"],
    check: ["parseN", "quiz", "quiz", "parseN", "quiz", "spot", "quiz", "parseN", "quiz", "spot"]
  },
  {
    id: "6.3", title: "Aspect: how the action is pictured", machen: "", minutes: 45,
    focus: "aspect", tv: AORPRES,
    teach: [
      { h: "Three ways to picture an action", p: `<p>Greek tenses tell you less about <i>when</i> than English ones do, and more about <i>how the writer pictures the action</i>. This is called <b>aspect</b>.</p><ul><li><b>Present and imperfect:</b> the action seen from inside, as in progress, repeated or habitual.</li><li><b>Aorist:</b> the action seen as a whole, from outside, without describing its progress.</li><li><b>Perfect:</b> a completed action with a state that continues.</li></ul><p>Only in the indicative does the augment add past time. In the other moods, the tense is aspect alone.</p>` },
      { h: "Two cautions", p: `<ul><li>The aorist does not mean "once for all", "at a single moment" or "decisively" by itself. It simply leaves the action's progress undescribed. If a text means "once for all", it usually says so with a word like <span lang="el">ἐφάπαξ</span>.</li><li>The present does not always mean "continually". It can be a general truth, a habit, or simply a vivid way of telling.</li></ul><p>Aspect works together with the meaning of the verb and the context. Lean on it, but do not make it carry more than it can.</p>` },
      { h: "A test case: 1 John", p: `<p>John writes <span lang="el">ἵνα μὴ ἁμάρτητε</span> "so that you may not sin" (1 John 2:1, aorist), and later says of the one born of God <span lang="el">οὐ δύναται ἁμαρτάνειν</span> "he cannot sin" (3:9, present infinitive). Many interpreters read the present as describing a settled practice, "he cannot go on sinning", which sits well with 1:8-2:1, where John says believers do sin. Others caution against resting so much on the tense and look to the whole letter's argument. Either way, the aspect difference is worth noticing.</p>` }
    ],
    see: { mark: "focus", say: "Present, aorist and perfect verbs are underlined. Tap one: how is the action pictured?" },
    spot: [["aorAny", "is in the aorist"], ["presAny", "is in the present"]],
    quiz: [
      ["The aorist presents an action ...", "as a whole, without describing its progress", ["as continuing", "as finished with a lasting result", "as future"], "Perfective aspect: seen from outside, as a whole."],
      ["The present and imperfect present an action ...", "as in progress, repeated or habitual", ["as a whole", "as completed with a result", "only as past"], "Imperfective aspect: seen from inside."],
      ["The perfect presents ...", "a completed action with a continuing state", ["an action in progress", "a single moment only", "a wish"], "γέγραπται: written, and it stands written."],
      ["Does the aorist by itself mean “once for all”?", "No, it leaves the action's progress undescribed", ["Yes, always", "Only in the indicative", "Only in the passive"], "If a text means “once for all”, it usually says so with a word like ἐφάπαξ."],
      ["Where does Greek mark past time on the verb?", "in the indicative, with the augment", ["in every mood", "only in the participle", "only in the infinitive"], "Outside the indicative, tense shows aspect, not time."],
      ["In 1 John 3:9, many interpreters read οὐ δύναται ἁμαρτάνειν as ...", "he cannot go on sinning (a settled practice)", ["he has never sinned once", "he will sin in the future", "he must sin"], "The present infinitive suggests an ongoing practice, which fits 1:8-2:1; others caution against leaning on the tense alone."],
      ["ἵνα μὴ ἁμάρτητε (1 John 2:1) uses ...", "the aorist subjunctive", ["the present indicative", "the perfect", "the future"], "“So that you may not sin”, the action pictured as a whole."]
    ],
    practise: ["tv", "quiz", "tv", "quiz", "spot", "quiz", "tv", "quiz"],
    check: ["tv", "tv", "quiz", "quiz", "quiz", "spot", "tv", "quiz", "quiz", "spot"]
  },
  {
    id: "6.4", title: "Kinds of conditions", machen: "", minutes: 40,
    focus: "cond",
    teach: [
      { h: "Four kinds of “if”", p: `<ul><li><b>Assumed true for the argument</b>: <span lang="el">εἰ</span> with the indicative. Matthew 4:3, <span lang="el">Εἰ υἱὸς εἶ τοῦ θεοῦ</span> "if you are the Son of God". Romans 8:31, <span lang="el">εἰ ὁ θεὸς ὑπὲρ ἡμῶν, τίς καθ’ ἡμῶν;</span></li><li><b>Contrary to fact</b>: <span lang="el">εἰ</span> with a past indicative, and <span lang="el">ἄν</span> in the result. John 11:21, <span lang="el">εἰ ἦς ὧδε οὐκ ἂν ἀπέθανεν ὁ ἀδελφός μου</span>.</li><li><b>Possible, open</b>: <span lang="el">ἐάν</span> with the subjunctive. 1 John 1:9, <span lang="el">ἐὰν ὁμολογῶμεν τὰς ἁμαρτίας ἡμῶν</span> "if we confess our sins".</li><li><b>Less likely</b>: <span lang="el">εἰ</span> with the optative, rare. 1 Peter 3:14, <span lang="el">εἰ καὶ πάσχοιτε</span> "even if you should suffer".</li></ul>` },
      { h: "“If” is not always “since”", p: `<p>It is sometimes said that <span lang="el">εἰ</span> with the indicative means "since". It does not: it presents the condition as true <i>for the sake of the argument</i>. Paul writes <span lang="el">εἰ δὲ Χριστὸς οὐκ ἐγήγερται</span> "if Christ has not been raised" (1 Corinthians 15:14), a condition he believes is false. In Romans 8:31 the condition is true, but that comes from the context, not from the grammar.</p>` }
    ],
    see: { mark: "focus", say: "εἰ and ἐάν are underlined. Look at the verb that follows each: indicative, or subjunctive?" },
    spot: [["cond", "is εἰ or ἐάν, “if”"]],
    quiz: [
      ["εἰ with the indicative (Matthew 4:3) presents the condition as ...", "assumed true for the sake of the argument", ["certainly true, so always “since”", "contrary to fact", "a wish"], "The tempter assumes it to make his challenge; the grammar does not say whether it is true."],
      ["Why is 1 Corinthians 15:14 a good warning?", "Paul uses εἰ with the indicative for something he believes is false", ["it uses the optative", "it has no verb", "it uses ἐάν with the indicative"], "So εἰ with the indicative should not always be translated “since”."],
      ["John 11:21 is a condition ...", "contrary to fact", ["assumed true", "open for the future", "expressing a wish"], "εἰ with a past indicative and ἄν: he was not there, and the brother died."],
      ["1 John 1:9, ἐὰν ὁμολογῶμεν, is ...", "an open condition: ἐάν with the subjunctive", ["contrary to fact", "assumed true with the indicative", "a wish with the optative"], "“If we confess”, a real possibility."],
      ["εἰ καὶ πάσχοιτε (1 Peter 3:14) uses ...", "the optative: even if you should suffer", ["the indicative: since you suffer", "the imperative: suffer!", "the subjunctive after ἐάν"], "The rare optative presents a less likely possibility."],
      ["Which word in the result marks a condition contrary to fact?", "ἄν", ["ἵνα", "ὅτι", "γάρ"], "οὐκ ἂν ἀπέθανεν, “he would not have died”."],
      ["Romans 8:31, εἰ ὁ θεὸς ὑπὲρ ἡμῶν, is a condition ...", "assumed true", ["contrary to fact", "less likely", "about the past only"], "Paul assumes it, and the context shows he believes it."]
    ],
    practise: ["quiz", "spot", "quiz", "quiz", "spot", "quiz", "quiz", "spot"],
    check: ["quiz", "quiz", "spot", "quiz", "quiz", "spot", "quiz", "quiz", "spot", "spot"]
  },
  {
    id: "6.5", title: "The article and word order", machen: "", minutes: 45,
    focus: "art",
    teach: [
      { h: "Finding the subject", p: `<p>When two nominatives stand with <span lang="el">εἰμί</span>, the one with the article is usually the subject. In John 1:1, <span lang="el">θεὸς ἦν ὁ λόγος</span>, <span lang="el">ὁ λόγος</span> is the subject: "the Word was God". In 1 John 4:8, <span lang="el">ὁ θεὸς ἀγάπη ἐστίν</span>, God is the subject; the sentence cannot be turned into "love is God".</p>` },
      { h: "John 1:1 without the article", p: `<p>Why is <span lang="el">θεός</span> in 1:1c without the article, when 1:1b has <span lang="el">πρὸς τὸν θεόν</span>? The predicate comes first for emphasis, and without the article it describes what the Word is. Most grammarians read it as qualitative: the Word is fully God in nature. If John had written <span lang="el">ὁ θεός</span>, he would have made the Word and the Father one and the same person; if he had wanted "a god", the rest of the Gospel speaks against it (John 1:18; 20:28). The grammar keeps both truths: the Word is distinct from the Father, and he is God.</p>` },
      { h: "One article, two nouns", p: `<p>When one article governs two singular nouns describing persons, joined by <span lang="el">καί</span>, and neither is a proper name, both usually refer to the same person (Granville Sharp's rule). Titus 2:13, <span lang="el">τοῦ μεγάλου θεοῦ καὶ σωτῆρος ἡμῶν Ἰησοῦ Χριστοῦ</span>, "our great God and Saviour, Jesus Christ".</p>` },
      { h: "The article makes nouns", p: `<p>With the article almost anything can act as a noun: an adjective (<span lang="el">οἱ ἅγιοι</span> "the saints"), a participle (<span lang="el">ὁ πιστεύων</span> "the one who believes"), an infinitive (<span lang="el">τὸ εἶναι</span>), even a phrase (<span lang="el">τὸν ἐν τοῖς οὐρανοῖς</span>).</p>` }
    ],
    see: { mark: "focus", c: 1, v1: 1, v2: 2, say: "John 1:1-2. Every article is underlined. Which nouns have one, and which do not?" },
    spot: [["art", "is an article"]],
    quiz: [
      ["In θεὸς ἦν ὁ λόγος (John 1:1), which word is the subject?", "ὁ λόγος, because it has the article", ["θεός, because it comes first", "ἦν, the verb", "neither"], "With two nominatives and εἰμί, the one with the article is usually the subject."],
      ["Why is θεός without the article in John 1:1c?", "it is the predicate, placed first, describing what the Word is", ["it means “a god”", "the article fell out in copying", "Greek never puts the article with θεός"], "Most grammarians read it as qualitative: the Word is God in nature, distinct from the Father (1:1b)."],
      ["Titus 2:13 has one article over θεοῦ and σωτῆρος, so ...", "“God” and “Saviour” refer to one person, Jesus Christ", ["they refer to two persons", "neither refers to Jesus", "the article is optional"], "Granville Sharp's rule: one article, two singular personal nouns joined by καί, not proper names."],
      ["Can ὁ θεὸς ἀγάπη ἐστίν (1 John 4:8) be turned round to “love is God”?", "No, the article marks θεός as the subject", ["Yes, the order is free", "Only in the plural", "Only in English"], "Love describes God; the sentence does not reverse."],
      ["οἱ ἅγιοι means ...", "the saints, the holy ones", ["holy things", "a saint", "to be holy"], "The article turns the adjective into a noun."],
      ["In John 1:1b, πρὸς τὸν θεόν has the article because ...", "it identifies God the Father, with whom the Word was", ["every noun after πρός takes it", "it is the subject", "it is plural"], "John distinguishes the Word from the Father, then affirms the Word is God."]
    ],
    practise: ["parseN", "quiz", "parseN", "quiz", "spot", "quiz", "parseN", "quiz"],
    check: ["parseN", "quiz", "quiz", "parseN", "quiz", "spot", "quiz", "parseN", "quiz", "spot"]
  },
  {
    id: "6.6", title: "Following the argument", machen: "", minutes: 45,
    focus: "conn",
    teach: [
      { h: "Small words carry the logic", p: `<p>Before you study single words, follow the joints between clauses. The Study Desk's Structure view lays each sentence out; these words tell you how the pieces connect.</p><ul><li><span lang="el">γάρ</span> "for": gives a reason or explanation.</li><li><span lang="el">οὖν</span> "therefore, so": draws a conclusion or resumes. <span lang="el">Παρακαλῶ οὖν ὑμᾶς</span> (Romans 12:1) ties the call to all that came before.</li><li><span lang="el">δέ</span> "and, but": moves to the next step, often with a light contrast.</li><li><span lang="el">ἀλλά</span> "but": a strong contrast, often after a negative.</li><li><span lang="el">ἵνα</span> "so that, that": purpose, or the content of a request.</li><li><span lang="el">ὅτι</span> "that, because": content after verbs of saying and knowing, or a reason.</li></ul>` },
      { h: "Find the main verb", p: `<p>Participles and infinitives hang on a finite verb. In Romans 5:1, <span lang="el">Δικαιωθέντες οὖν ἐκ πίστεως εἰρήνην ἔχομεν πρὸς τὸν θεόν</span>, the main verb is <span lang="el">ἔχομεν</span> "we have"; the participle gives the ground: "having been justified by faith, we have peace with God".</p>` },
      { h: "Matthew 28:19-20", p: `<p><span lang="el">πορευθέντες οὖν μαθητεύσατε πάντα τὰ ἔθνη, βαπτίζοντες ... διδάσκοντες</span>. The one imperative is <span lang="el">μαθητεύσατε</span> "make disciples". The aorist participle before it, <span lang="el">πορευθέντες</span>, takes on the force of the command, as such participles usually do: "go and make disciples", rather than only "as you go". The two present participles, <span lang="el">βαπτίζοντες</span> and <span lang="el">διδάσκοντες</span>, describe how disciples are made.</p><p>The Desk also names five patterns for you (periphrastic, <span lang="el">οὐ μή</span>, the articular infinitive, <span lang="el">ἐάν</span> with the subjunctive, and the accusative subject of an infinitive). Each one you have now met in the School.</p>` }
    ],
    see: { mark: "focus", say: "Connecting words are underlined. For each, ask: reason, conclusion, contrast, purpose, or content?" },
    spot: [["conn", "is a connecting word: γάρ, οὖν, δέ, ἀλλά, ἵνα or ὅτι"]],
    quiz: [
      ["γάρ usually ...", "gives a reason or explanation", ["draws a conclusion", "states a purpose", "asks a question"], "“For”: what follows explains or supports what came before."],
      ["οὖν usually ...", "draws a conclusion: therefore", ["gives a reason", "marks a contrast after a negative", "asks a question"], "Romans 12:1, Παρακαλῶ οὖν, builds on chapters 1 to 11."],
      ["In Romans 5:1, what is the main verb?", "ἔχομεν, “we have”", ["Δικαιωθέντες, “having been justified”", "πίστεως, “faith”", "θεόν, “God”"], "The participle gives the ground; ἔχομεν carries the sentence."],
      ["In Matthew 28:19, which word is the command?", "μαθητεύσατε, “make disciples”", ["πορευθέντες, “having gone”", "βαπτίζοντες, “baptizing”", "ἔθνη, “nations”"], "It is the only imperative; the participles hang on it."],
      ["How does πορευθέντες relate to μαθητεύσατε?", "it shares the command's force: go and make disciples", ["it is a separate, unrelated command", "it means only “while you happen to be going”", "it is the subject"], "An aorist participle before an aorist imperative usually takes on its force."],
      ["βαπτίζοντες and διδάσκοντες (Matthew 28:19-20) describe ...", "how disciples are made", ["two new commands unrelated to the first", "what happened before going", "who the nations are"], "They are present participles describing the manner of making disciples."],
      ["ἀλλά usually marks ...", "a strong contrast, often after a negative", ["a reason", "a conclusion", "a purpose"], "οὐκ ... ἀλλά, “not ... but”."]
    ],
    practise: ["quiz", "spot", "quiz", "quiz", "spot", "quiz", "quiz", "spot"],
    check: ["quiz", "quiz", "spot", "quiz", "quiz", "spot", "quiz", "quiz", "spot", "spot"]
  },
  {
    id: "6.7", title: "From the Greek text to an outline", machen: "", minutes: 50,
    focus: "conn",
    teach: [
      { h: "A way to work", p: `<p>Here is one way to use what you have learned when you prepare to preach. It does not replace prayer, the Spirit's help, or your own reading of the text; it serves them.</p><ol><li>Read the passage in English, prayerfully, more than once.</li><li>Read it in Greek on the Study Desk with Graded reading on.</li><li>Open the Structure view. Find the main verbs and the main clauses.</li><li>Mark the connecting words: reasons, conclusions, contrasts, purposes.</li><li>Parse the main verbs: tense, voice and mood. Note what the aspect pictures, without pressing it too hard.</li><li>Study the key words in context: where else does the writer use them?</li><li>Check good commentaries, especially where scholars disagree.</li><li>Write the passage's main point in one plain sentence, in your own words.</li></ol>` },
      { h: "Worked example: Ephesians 2:8-10", p: `<ul><li>Main clause: <span lang="el">ἐστε σεσῳσμένοι</span> "you have been saved", a perfect: done, and it stands.</li><li>How: <span lang="el">τῇ χάριτι</span> (dative of means) <span lang="el">διὰ πίστεως</span> (through faith).</li><li>Not from us: <span lang="el">καὶ τοῦτο οὐκ ἐξ ὑμῶν, θεοῦ τὸ δῶρον· οὐκ ἐξ ἔργων</span>.</li><li>Purpose: <span lang="el">ἵνα μή τις καυχήσηται</span> "so that no one may boast".</li><li>Reason (<span lang="el">γάρ</span>, v. 10): <span lang="el">αὐτοῦ γάρ ἐσμεν ποίημα</span> "for we are his workmanship", created <span lang="el">ἐπὶ ἔργοις ἀγαθοῖς</span> "for good works".</li></ul><p>The outline follows the Greek: saved by grace, not by works, for good works.</p>` },
      { h: "Greek in the pulpit", p: `<p>Let the Greek inform what you say, not decorate it. A congregation needs the text made plain, not a lesson in parsing. When a Greek point matters, give it in simple English and show it from the passage. When scholars disagree, say so honestly.</p>` }
    ],
    see: { mark: "focus", say: "Connecting words are underlined. Trace how the sentences hold together." },
    spot: [["conn", "is a connecting word: γάρ, οὖν, δέ, ἀλλά, ἵνα or ὅτι"]],
    quiz: [
      ["What should you look for first when reading a passage's structure?", "the main verbs and main clauses", ["the rarest word", "the longest word", "the number of verses"], "Everything else hangs on the main verbs."],
      ["In Ephesians 2:10, γάρ introduces ...", "the reason: for we are his workmanship", ["a contrast", "a purpose", "a question"], "γάρ gives the explanation for what came before."],
      ["ἵνα μή τις καυχήσηται (Ephesians 2:9) expresses ...", "purpose: so that no one may boast", ["result already happened", "a condition", "a command to boast"], "ἵνα with the subjunctive: purpose."],
      ["ἐπὶ ἔργοις ἀγαθοῖς (Ephesians 2:10) tells ...", "what we were created for: good works", ["what saved us", "who we are", "where we live"], "Not saved by works, but created for good works."],
      ["What is Greek's right place in a sermon?", "to inform your understanding and make the text plain", ["to impress the congregation", "to replace the English Bible", "to prove every point from a tense"], "Give a Greek point in simple English, shown from the passage."],
      ["Before resting a point on one word's meaning, you should ...", "check how the writer uses it in context and elsewhere", ["take the first meaning in the lexicon", "use its English derivative", "trust its root meaning"], "Context decides meaning, not etymology."]
    ],
    practise: ["quiz", "spot", "quiz", "quiz", "spot", "quiz", "quiz", "spot"],
    check: ["quiz", "quiz", "spot", "quiz", "quiz", "spot", "quiz", "quiz", "spot", "spot"]
  },
  {
    id: "6.8", title: "Hear it as they heard it", machen: "", minutes: 30,
    focus: "diph",
    teach: [
      { h: "An optional lesson", p: `<p>You have read Greek with the Erasmian sounds, which give every letter its own sound. This lesson sketches how Greek was actually heard in the first century. It is for interest and for reading aloud; it changes nothing in the grammar or meaning.</p>` },
      { h: "How we know", p: `<p>Ordinary people in the Roman world misspelled words the way they said them. Papyrus letters and inscriptions from the period swap certain letters again and again, which shows that those letters had come to sound alike.</p>` },
      { h: "What had changed", p: `<ul><li><span lang="el">ει</span> was said like <span lang="el">ι</span>, "ee".</li><li><span lang="el">αι</span> was said like <span lang="el">ε</span>, "e" as in "get".</li><li><span lang="el">ο</span> and <span lang="el">ω</span> no longer differed in length, and neither did other long and short vowels.</li><li>The rough breathing, the "h" sound, was fading from everyday speech.</li><li>The accent was shifting from a change of pitch to a stress, close to what Erasmian readers do.</li><li><span lang="el">η, υ</span> and <span lang="el">οι</span> were moving toward the "ee" sound of later Greek, and consonants like <span lang="el">β, γ, δ</span> and <span lang="el">φ, θ, χ</span> were softening. How far each had gone by the first century, and in which regions, is still debated.</li></ul>` },
      { h: "Further reading", p: `<p>Benjamin Kantor, <i>The Pronunciation of New Testament Greek</i> (Eerdmans, 2023), argues the case in full from evidence in Judea and Galilee. Geoffrey Horrocks, <i>Greek: A History of the Language and Its Speakers</i> (2nd ed., 2010), and Francis T. Gignac, <i>A Grammar of the Greek Papyri of the Roman and Byzantine Periods</i>, vol. 1 (1976), describe the spelling evidence. Recordings in this sound are planned for the School.</p>` }
    ],
    see: { mark: "focus", c: 1, v1: 1, v2: 5, say: "John 1:1-5. Words with ει, αι or οι are underlined: these are the sounds that had changed most by the first century." },
    spot: [["diph", "has ει, αι or οι"]],
    quiz: [
      ["How do scholars know how Greek sounded in the first century?", "from spelling mistakes in papyri and inscriptions", ["from audio recordings", "from modern Greek alone", "from Erasmus' notes"], "Letters people confused when writing show which sounds had merged."],
      ["By the first century, ει was said like ...", "ι, “ee”", ["α, “ah”", "ου, “oo”", "two separate vowels"], "Papyri often write ι for ει and the reverse."],
      ["αι had come to sound like ...", "ε, “e” as in “get”", ["α ι, “ah-ee”", "ω, “oh”", "υ"], "αι and ε are often swapped in papyri."],
      ["What was happening to the rough breathing?", "it was fading from everyday speech", ["it was getting stronger", "it became a k sound", "it was written as a new letter"], "The h sound was dropping out of ordinary speech."],
      ["The Greek accent was changing from ...", "pitch to stress", ["stress to pitch", "stress to silence", "it did not change"], "By New Testament times the accent was moving toward stress."],
      ["Why does the School still teach Erasmian first?", "every letter keeps its own sound, which helps spelling, and meaning never changes", ["it is how the apostles spoke", "Koine is unknown", "modern Greek forbids it"], "Pronunciation choices do not affect grammar or meaning."]
    ],
    practise: ["quiz", "spot", "quiz", "quiz", "spot", "quiz", "quiz", "spot"],
    check: ["quiz", "quiz", "spot", "quiz", "quiz", "spot", "quiz", "quiz", "spot", "spot"]
  }
];
