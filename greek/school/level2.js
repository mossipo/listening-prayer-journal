// Akouō Greek School, Level 2: The verb system. Machen, New Testament Greek for Beginners (1923), Lessons X to XVI,
// retold in plain English. Same lesson shape as Level 1 (see level1.js). A table row may name its own dictionary
// word as a fifth item, for tables that mix verbs (the second aorists).

const pn = (code, forms) => ["1st singular", "2nd singular", "3rd singular", "1st plural", "2nd plural", "3rd plural"].map((l, k) => [l, forms[k][0], forms[k][1], code + ["1S", "2S", "3S", "1P", "2P", "3P"][k]]);

export const LEVEL2 = [
  {
    id: "2.1", title: "Middle and passive; deponent verbs", machen: "Lesson X", minutes: 40,
    focus: "pmpi", tv: ["present active", "present middle or passive"],
    teach: [
      { h: "Voice", p: `<p>Voice shows how the subject relates to the action.</p><ul><li><b>Active:</b> the subject acts. <span lang="el">λύω</span> "I loose".</li><li><b>Passive:</b> the subject receives the action. <span lang="el">λύομαι</span> "I am being loosed".</li><li><b>Middle:</b> the subject acts with some involvement of itself, often for its own sake. It is usually translated like an active.</li></ul><p>In the present tense the middle and the passive have the same forms, so the sentence decides which is meant.</p>` },
      { table: { title: "Present middle and passive indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-PPI-", [["-ομαι", "λύομαι"], ["-ῃ", "λύῃ"], ["-εται", "λύεται"], ["-ομεθα", "λυόμεθα"], ["-εσθε", "λύεσθε"], ["-ονται", "λύονται"]]) } },
      { h: "Deponent verbs", p: `<p>Some verbs have middle or passive forms but an active meaning. Their dictionary form ends in <span lang="el">-ομαι</span>: <span lang="el">ἔρχομαι</span> "I come", <span lang="el">γίνομαι</span> "I become". They are called <b>deponent</b> verbs. <span lang="el">ἔρχεται</span> means "he comes", never "he is come-d".</p>` },
      { h: "By whom, and by what", p: `<p>With a passive verb, <span lang="el">ὑπό</span> with the genitive names the person who does the action ("by"). The dative alone can name the thing used ("by means of"). Machen teaches both here; you will meet them often in Paul.</p>` },
      { h: "Compound verbs", p: `<p>Many verbs have a preposition joined to the front: <span lang="el">ἐξ-έρχομαι</span> "I go out", <span lang="el">εἰσ-έρχομαι</span> "I go in", <span lang="el">ἀπ-έρχομαι</span> "I go away", <span lang="el">προσ-έρχομαι</span> "I come to". Knowing the preposition often gives you the meaning.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Present middle and passive verbs are underlined. Tap one: is it a deponent, with an active meaning?" },
    spot: [["pmpi", "is a present middle or passive verb"]],
    practise: ["ending", "parseV", "tv", "meaning", "vocab", "parseV", "toVocab", "meaning"],
    check: ["ending", "parseV", "tv", "tv", "meaning", "vocab", "toVocab", "spot", "parseV", "meaning"],
    words: [
      ["ἔρχομαι", 2064, "I come, go", ["come", "comes", "came", "coming", ""]],
      ["γίνομαι", 1096, "I become, happen, am", ["become", "becomes", "became", "becoming", ""]],
      ["δύναμαι", 1410, "I am able, can"],
      ["πορεύομαι", 4198, "I go, travel", ["go", "goes", "went", "going", ""]],
      ["ἀποκρίνομαι", 611, "I answer", ["answer", "answers", "answered", "answering", ""]],
      ["ἐξέρχομαι", 1831, "I go out, come out", ["go out", "goes out", "went out", "going out", ""]],
      ["εἰσέρχομαι", 1525, "I go in, enter", ["enter", "enters", "entered", "entering", ""]],
      ["ἀπέρχομαι", 565, "I go away, depart", ["go away", "goes away", "went away", "going away", ""]],
      ["προσέρχομαι", 4334, "I come to, approach", ["come to", "comes to", "came to", "coming to", ""]],
      ["προσεύχομαι", 4336, "I pray", ["pray", "prays", "prayed", "praying", ""]],
      ["σῴζω", 4982, "I save, rescue, heal", ["save", "saves", "saved", "saving", "saved"]]
    ]
  },
  {
    id: "2.2", title: "The imperfect", machen: "Lesson XI", minutes: 40,
    focus: "iai", tv: ["present active", "present middle or passive", "imperfect active"],
    teach: [
      { h: "Past action going on", p: `<p>The imperfect tense pictures past action as going on or repeated: <span lang="el">ἔλυον</span> "I was loosing" or "I used to loose". John 1:1 begins with an imperfect: <span lang="el">Ἐν ἀρχῇ ἦν ὁ λόγος</span>, "In the beginning <i>was</i> the Word".</p>` },
      { table: { title: "Imperfect active indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-IAI-", [["-ον", "ἔλυον"], ["-ες", "ἔλυες"], ["-ε(ν)", "ἔλυε(ν)"], ["-ομεν", "ἐλύομεν"], ["-ετε", "ἐλύετε"], ["-ον", "ἔλυον"]]) } },
      { h: "The augment", p: `<p>The imperfect puts an <b>augment</b> before the stem, a mark of past time in the indicative.</p><ul><li>Before a consonant it is <span lang="el">ἐ-</span>: <span lang="el">λύω, ἔλυον</span>.</li><li>A vowel at the start of the stem is lengthened instead: <span lang="el">ἀκούω, ἤκουον</span>; <span lang="el">ἐσθίω, ἤσθιον</span>. <span lang="el">ἔχω</span> is irregular: <span lang="el">εἶχον</span>.</li><li>In a compound verb the augment comes after the preposition: <span lang="el">ἀποστέλλω, ἀπέστελλον</span>.</li></ul><p>The 1st singular and the 3rd plural look the same (<span lang="el">ἔλυον</span>). The sentence shows which is meant.</p>` },
      { table: { title: "Imperfect of εἰμί", model: "εἰμί", kind: "verb", rows: pn("V-IAI-", [["", "ἤμην"], ["", "ἦς"], ["", "ἦν"], ["", "ἦμεν"], ["", "ἦτε"], ["", "ἦσαν"]]) } },
      { words: true }
    ],
    see: { mark: "focus", say: "Imperfect active verbs are underlined. Look for the augment at the front of each." },
    spot: [["iai", "is an imperfect active verb"]],
    practise: ["ending", "parseV", "tv", "meaning", "vocab", "parseV", "toVocab", "form"],
    check: ["ending", "parseV", "tv", "tv", "meaning", "vocab", "toVocab", "spot", "parseV", "meaning"],
    words: [
      ["ἐσθίω", 2068, "I eat", ["eat", "eats", "ate", "eating", "eaten"]],
      ["διδάσκω", 1321, "I teach", ["teach", "teaches", "taught", "teaching", "taught"]],
      ["κρίνω", 2919, "I judge, decide", ["judge", "judges", "judged", "judging", "judged"]],
      ["ἐγείρω", 1453, "I raise, wake", ["raise", "raises", "raised", "raising", "raised"]],
      ["βάλλω", 906, "I throw, put", ["throw", "throws", "threw", "throwing", "thrown"]],
      ["ἀποστέλλω", 649, "I send", ["send", "sends", "sent", "sending", "sent"]],
      ["μέλλω", 3195, "I am about to"],
      ["ἀποθνῄσκω", 599, "I die", ["die", "dies", "died", "dying", ""]],
      ["εὑρίσκω", 2147, "I find", ["find", "finds", "found", "finding", "found"]]
    ],
    verbs: [["εἰμί", ["am", "is", "was", "being", ""], "be"]]
  },
  {
    id: "2.3", title: "The imperfect middle and passive", machen: "Lesson XII", minutes: 30,
    focus: "impi", tv: ["present active", "present middle or passive", "imperfect active", "imperfect middle or passive"],
    teach: [
      { h: "Same augment, middle endings", p: `<p>The imperfect middle and passive takes the augment of the imperfect active and endings like those of the present middle. As in the present, the middle and passive look the same.</p>` },
      { table: { title: "Imperfect middle and passive indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-IPI-", [["-ομην", "ἐλυόμην"], ["-ου", "ἐλύου"], ["-ετο", "ἐλύετο"], ["-ομεθα", "ἐλυόμεθα"], ["-εσθε", "ἐλύεσθε"], ["-οντο", "ἐλύοντο"]]) } },
      { h: "Deponents in the imperfect", p: `<p>A deponent verb keeps its active meaning: <span lang="el">ἤρχετο</span> "he was coming", <span lang="el">ἐπορεύοντο</span> "they were going".</p>` },
      { h: "καί and οὐδέ", p: `<p><span lang="el">καί</span> means "and", but also "also" and "even". <span lang="el">καί ... καί</span> means "both ... and". <span lang="el">οὐδέ</span> means "and not, nor", or "not even"; <span lang="el">οὐδέ ... οὐδέ</span> is "neither ... nor".</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Imperfect middle and passive verbs are underlined." },
    spot: [["impi", "is an imperfect middle or passive verb"], ["iai", "is an imperfect active verb"]],
    practise: ["ending", "parseV", "tv", "vocab", "tv", "toVocab", "meaning", "vocab"],
    check: ["ending", "parseV", "tv", "tv", "tv", "meaning", "vocab", "toVocab", "spot", "vocab"],
    words: [
      ["ὄχλος", 3793, "crowd"], ["οἶκος", 3624, "house, household"], ["θάνατος", 2288, "death"], ["δοῦλος", 1401, "slave, servant"],
      ["λαός", 2992, "people"], ["ἄγγελος", 32, "angel, messenger"], ["ὀφθαλμός", 3788, "eye"], ["ἄρτος", 740, "bread, loaf"],
      ["τόπος", 5117, "place"], ["ὁδός", 3598, "way, road (a feminine noun of the second declension)"]
    ]
  },
  {
    id: "2.4", title: "The future", machen: "Lesson XIII", minutes: 40,
    focus: "fi", tv: ["present active", "present middle or passive", "imperfect active", "imperfect middle or passive", "future active", "future middle"],
    teach: [
      { h: "A σ for the future", p: `<p>The future adds <span lang="el">σ</span> to the stem and then takes the present endings: <span lang="el">λύσω</span> "I will loose". There is no augment; that belongs to past time.</p>` },
      { table: { title: "Future active indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-FAI-", [["-σω", "λύσω"], ["-σεις", "λύσεις"], ["-σει", "λύσει"], ["-σομεν", "λύσομεν"], ["-σετε", "λύσετε"], ["-σουσι(ν)", "λύσουσι(ν)"]]) } },
      { table: { title: "Future middle indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-FMI-", [["-σομαι", "λύσομαι"], ["-σῃ", "λύσῃ"], ["-σεται", "λύσεται"], ["-σομεθα", "λυσόμεθα"], ["-σεσθε", "λύσεσθε"], ["-σονται", "λύσονται"]]) } },
      { h: "When the σ meets a consonant", p: `<ul><li><span lang="el">π, β, φ</span> with <span lang="el">σ</span> become <span lang="el">ψ</span>: <span lang="el">βλέπω, βλέψω</span>; <span lang="el">γράφω, γράψω</span>.</li><li><span lang="el">κ, γ, χ</span> with <span lang="el">σ</span> become <span lang="el">ξ</span>: <span lang="el">ἄγω, ἄξω</span>.</li><li><span lang="el">τ, δ, θ</span> drop out before <span lang="el">σ</span>: <span lang="el">σῴζω, σώσω</span>.</li></ul>` },
      { h: "Futures with middle forms", p: `<p>Some verbs that are active in the present have a middle future with an active meaning: <span lang="el">γινώσκω, γνώσομαι</span> "I will know"; <span lang="el">λαμβάνω, λήμψομαι</span> "I will receive". The future of <span lang="el">εἰμί</span> is <span lang="el">ἔσομαι</span>: <span lang="el">ἔσται</span> "he will be".</p>` },
      { table: { title: "Future of εἰμί", model: "εἰμί", kind: "verb", rows: pn("V-FDI-", [["", "ἔσομαι"], ["", "ἔσῃ"], ["", "ἔσται"], ["", "ἐσόμεθα"], ["", "ἔσεσθε"], ["", "ἔσονται"]]) } },
      { words: true }
    ],
    see: { mark: "focus", say: "Future verbs are underlined. Look for the σ (or ψ, ξ) before the ending." },
    spot: [["fi", "is a future verb"]],
    practise: ["ending", "parseV", "tv", "meaning", "vocab", "tv", "toVocab", "meaning"],
    check: ["ending", "parseV", "tv", "tv", "meaning", "meaning", "vocab", "toVocab", "spot", "form"],
    words: [
      ["ἵνα", 2443, "in order that, so that, that"], ["εἰ", 1487, "if"], ["ἐάν", 1437, "if (with a less definite sense)"], ["ὅτε", 3753, "when"],
      ["ὅταν", 3752, "whenever, when"], ["ἕως", 2193, "until; as far as"], ["ἔτι", 2089, "still, yet"], ["ὡς", 5613, "as, like; when"],
      ["μέν", 3303, "indeed; μέν ... δέ, on the one hand ... on the other"]
    ],
    verbs: [["εἰμί", ["am", "is", "was", "being", ""], "be"]]
  },
  {
    id: "2.5", title: "The first aorist", machen: "Lesson XIV", minutes: 40,
    focus: "aai1", tv: ["present active", "present middle or passive", "imperfect active", "imperfect middle or passive", "future active", "future middle", "aorist active", "aorist middle"],
    teach: [
      { h: "The action as a whole", p: `<p>The aorist presents an action as a whole, without picturing it as going on. In the indicative it usually refers to the past: <span lang="el">ἔλυσα</span> "I loosed". Compare the imperfect, <span lang="el">ἔλυον</span> "I was loosing".</p><p>A caution worth keeping: the aorist does not by itself mean "once for all" or "at a single moment". It simply does not describe the action's progress. The context says the rest.</p>` },
      { table: { title: "First aorist active indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-AAI-", [["-σα", "ἔλυσα"], ["-σας", "ἔλυσας"], ["-σε(ν)", "ἔλυσε(ν)"], ["-σαμεν", "ἐλύσαμεν"], ["-σατε", "ἐλύσατε"], ["-σαν", "ἔλυσαν"]]) } },
      { table: { title: "First aorist middle indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-AMI-", [["-σαμην", "ἐλυσάμην"], ["-σω", "ἐλύσω"], ["-σατο", "ἐλύσατο"], ["-σαμεθα", "ἐλυσάμεθα"], ["-σασθε", "ἐλύσασθε"], ["-σαντο", "ἐλύσαντο"]]) } },
      { h: "How to spot it", p: `<p>Augment, stem, <span lang="el">σα</span>, ending: <span lang="el">ἐ-λύ-σα-μεν</span>. The consonant changes you met in the future happen here too: <span lang="el">ἔγραψα</span> "I wrote". Some verbs whose stem ends in <span lang="el">λ, μ, ν, ρ</span> drop the <span lang="el">σ</span> and keep the <span lang="el">α</span>: <span lang="el">ἔκρινα</span> "I judged", <span lang="el">ἀπέστειλα</span> "I sent".</p>` },
      { h: "Believing", p: `<p><span lang="el">πιστεύω</span> takes three constructions: the dative, "believe someone" (<span lang="el">ἐπιστεύετε Μωϋσεῖ</span>, "you believed Moses", John 5:46); <span lang="el">εἰς</span> with the accusative, "believe in" (John 3:16, <span lang="el">ὁ πιστεύων εἰς αὐτόν</span>); and <span lang="el">ὅτι</span>, "believe that".</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "First aorist verbs are underlined. Look for the augment and the σα." },
    spot: [["aai1", "is a first aorist verb"]],
    practise: ["ending", "parseV", "tv", "meaning", "vocab", "tv", "toVocab", "meaning"],
    check: ["ending", "parseV", "tv", "tv", "meaning", "meaning", "vocab", "toVocab", "spot", "form"],
    words: [
      ["ψυχή", 5590, "soul, life, self"], ["εἰρήνη", 1515, "peace"], ["ὥρα", 5610, "hour"], ["ἐξουσία", 1849, "authority, right"],
      ["δικαιοσύνη", 1343, "righteousness, justice"], ["οἰκία", 3614, "house, home"], ["θάλασσα", 2281, "sea, lake"]
    ]
  },
  {
    id: "2.6", title: "The second aorist", machen: "Lesson XV", minutes: 40,
    focus: "aai2", tv: ["present active", "present middle or passive", "imperfect active", "imperfect middle or passive", "future active", "future middle", "aorist active", "aorist middle"],
    teach: [
      { h: "A different stem", p: `<p>Some verbs form the aorist differently: with the endings of the imperfect, but on a different stem. Machen's model is <span lang="el">λείπω</span> "I leave": imperfect <span lang="el">ἔλειπον</span> "I was leaving", second aorist <span lang="el">ἔλιπον</span> "I left". The second aorist means the same as the first aorist; only the form differs.</p>` },
      { table: { title: "Second aorist active indicative of λείπω", model: "λείπω", kind: "verb", rows: pn("V-2AAI-", [["-ον", "ἔλιπον"], ["-ες", "ἔλιπες"], ["-ε(ν)", "ἔλιπε(ν)"], ["-ομεν", "ἐλίπομεν"], ["-ετε", "ἐλίπετε"], ["-ον", "ἔλιπον"]]) } },
      { table: { title: "Second aorist middle indicative of λείπω", model: "λείπω", kind: "verb", rows: pn("V-2AMI-", [["-ομην", "ἐλιπόμην"], ["-ου", "ἐλίπου"], ["-ετο", "ἐλίπετο"], ["-ομεθα", "ἐλιπόμεθα"], ["-εσθε", "ἐλίπεσθε"], ["-οντο", "ἐλίποντο"]]) } },
      { h: "Learn them with the verb", p: `<p>You cannot work out a second aorist; you learn it with the verb. These are among the most common in the New Testament.</p>` },
      { grid: { caption: "Common second aorists", head: ["Present", "Aorist", "Meaning"], el: [0, 1], rows: [
        ["λέγω", "εἶπον", "I said"], ["ἔρχομαι", "ἦλθον", "I came"], ["γίνομαι", "ἐγενόμην", "I became"], ["ὁράω", "εἶδον", "I saw"],
        ["λαμβάνω", "ἔλαβον", "I took, received"], ["εὑρίσκω", "εὗρον", "I found"], ["ἐσθίω", "ἔφαγον", "I ate"], ["βάλλω", "ἔβαλον", "I threw"],
        ["ἀποθνῄσκω", "ἀπέθανον", "I died"], ["πίπτω", "ἔπεσα", "I fell (the New Testament spelling of ἔπεσον)"], ["ἔχω", "ἔσχον", "I had"]] } },
      { table: { title: "Second aorists, checked", hidden: true, kind: "verb", rows: [
        ["", "", "εἶπον", "V-2AAI-3P", "λέγω"], ["", "", "ἦλθον", "V-2AAI-3P", "ἔρχομαι"], ["", "", "ἐγένετο", "V-2ADI-3S", "γίνομαι"], ["", "", "εἶδον", "V-2AAI-3P", "ὁράω"],
        ["", "", "ἔλαβον", "V-2AAI-3P", "λαμβάνω"], ["", "", "εὗρον", "V-2AAI-3P", "εὑρίσκω"], ["", "", "ἔφαγον", "V-2AAI-3P", "ἐσθίω"], ["", "", "ἔβαλον", "V-2AAI-3P", "βάλλω"],
        ["", "", "ἀπέθανεν", "V-2AAI-3S", "ἀποθνῄσκω"], ["", "", "ἔπεσα", "V-2AAI-1S", "πίπτω"], ["", "", "ἔσχον", "V-2AAI-3P", "ἔχω"]] } },
      { h: "Mixed endings", p: `<p>In the New Testament some second aorists also take first aorist endings: <span lang="el">εἶπαν</span> beside <span lang="el">εἶπον</span>, <span lang="el">ἦλθαν</span> beside <span lang="el">ἦλθον</span>. Both mean the same.</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Second aorist verbs are underlined. Most are forms of εἶπον, ἦλθον or ἐγένετο." },
    spot: [["aai2", "is a second aorist verb"]],
    practise: ["ending", "parseV", "tv", "meaning", "vocab", "tv", "toVocab", "meaning"],
    check: ["ending", "parseV", "tv", "tv", "meaning", "meaning", "vocab", "toVocab", "spot", "parseV"],
    words: [
      ["ὁράω", 3708, "I see", ["see", "sees", "saw", "seeing", "seen"]], ["πίπτω", 4098, "I fall", ["fall", "falls", "fell", "falling", ""]],
      ["μόνος", 3441, "only, alone"], ["ὅλος", 3650, "whole, all"], ["ἕτερος", 2087, "other, another, different"], ["ἀλλήλων", 240, "one another"]
    ]
  },
  {
    id: "2.7", title: "The aorist and future passive", machen: "Lesson XVI", minutes: 40,
    focus: "api", tv: ["present active", "present middle or passive", "imperfect active", "imperfect middle or passive", "future active", "future middle", "aorist active", "aorist middle", "aorist passive", "future passive"],
    teach: [
      { h: "θη for the passive", p: `<p>Unlike the present and imperfect, the aorist and future have passive forms of their own, marked by <span lang="el">θη</span>. The aorist passive has the augment: <span lang="el">ἐλύθην</span> "I was loosed". The future passive adds <span lang="el">θησ</span> and middle endings: <span lang="el">λυθήσομαι</span> "I will be loosed".</p>` },
      { table: { title: "Aorist passive indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-API-", [["-θην", "ἐλύθην"], ["-θης", "ἐλύθης"], ["-θη", "ἐλύθη"], ["-θημεν", "ἐλύθημεν"], ["-θητε", "ἐλύθητε"], ["-θησαν", "ἐλύθησαν"]]) } },
      { table: { title: "Future passive indicative of λύω", model: "λύω", kind: "verb", rows: pn("V-FPI-", [["-θησομαι", "λυθήσομαι"], ["-θησῃ", "λυθήσῃ"], ["-θησεται", "λυθήσεται"], ["-θησομεθα", "λυθησόμεθα"], ["-θησεσθε", "λυθήσεσθε"], ["-θησονται", "λυθήσονται"]]) } },
      { h: "In the text", p: `<p>The stem may change a little before <span lang="el">θ</span>: <span lang="el">ἐγείρω</span> gives <span lang="el">ἠγέρθη</span>, "he was raised" (Matthew 28:6, "He is not here, for he has risen"). Some verbs have a second aorist passive with no <span lang="el">θ</span>: <span lang="el">ἐγράφη</span> "it was written".</p><p>Some verbs use passive forms with an active meaning in the aorist. John often writes <span lang="el">ἀπεκρίθη Ἰησοῦς</span>, "Jesus answered".</p>` },
      { words: true }
    ],
    see: { mark: "focus", say: "Aorist and future passive verbs are underlined. Look for θη." },
    spot: [["api", "is an aorist or future passive verb"]],
    practise: ["ending", "parseV", "tv", "meaning", "vocab", "tv", "toVocab", "meaning"],
    check: ["ending", "parseV", "tv", "tv", "tv", "meaning", "meaning", "vocab", "toVocab", "spot"],
    words: [
      ["Ἰησοῦς", 2424, "Jesus"], ["Χριστός", 5547, "Christ, Messiah, Anointed One"], ["Ἰουδαῖος", 2453, "Jewish; a Jew, Judean"], ["Φαρισαῖος", 5330, "Pharisee"],
      ["Πέτρος", 4074, "Peter"], ["Παῦλος", 3972, "Paul"], ["Ἰωάννης", 2491, "John"]
    ]
  }
];
