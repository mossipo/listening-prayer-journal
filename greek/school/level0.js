// Akouō Greek School, Level 0: Letters and sounds. Follows Machen, New Testament Greek for Beginners (1923),
// Lessons I and II, retold in plain English. Every example word and verse comes from the SBLGNT text of John that the
// Study Desk already carries; the exercises are built from it when the lesson opens.
//
// A lesson: { id, title, machen, minutes, letters: new letters, allow: what words may contain once this lesson is done
//   ("rough", "nasal", "subscript", "caps"), teach: [blocks], see: { c, v1, v2, mark, say }, practise: [types],
//   check: [types], words: [[lemma, Strong's, gloss]] added to the review deck when the lesson is passed }
// Teaching blocks: { h, p } a heading and paragraphs (HTML) · { chart: "letters", list } · { chart: "pairs" | "marks" |
//   "accents" | "punct" | "caps" } · { write: [letters] } · { words: true } the lesson's words with their meanings

export const LEVEL0 = [
  {
    id: "0.1", title: "Letters you already know", machen: "Lesson I", minutes: 20,
    letters: ["α", "β", "δ", "ε", "ι", "κ", "ο", "τ"],
    teach: [
      { h: "Twenty-four letters, three groups", p: `<p>Greek has 24 letters. You will learn them in three groups over three lessons: letters that look and sound like English, letters that look like English but are not, and new shapes.</p><p>Start with eight friends. Each looks like an English letter and makes nearly the same sound.</p>` },
      { chart: "letters", list: ["α", "β", "δ", "ε", "ι", "κ", "ο", "τ"] },
      { h: "Say them out loud", p: `<p>Read the chart aloud twice: the name, then the sound. Saying a letter while you look at it fixes it in memory faster than looking alone.</p><p>For now, ignore the small marks above some letters in real words. Lessons 4 and 6 explain them.</p>` },
      { write: ["α", "β", "δ", "ε", "ι", "κ", "ο", "τ"] },
      { h: "Your first real word", p: `<p><span lang="el">καί</span> is spelled kappa, alpha, iota: <b>kai</b>. It means "and", and it is the second most common word in the New Testament, used about 9,000 times. You can already read it.</p>` }
    ],
    see: { c: 1, v1: 1, v2: 1, mark: "letters", say: "John 1:1, the first verse of John's Gospel. The letters you just learned are highlighted. Tap a word to hear how it is spelled in English letters." },
    practise: ["name", "toLetter", "sound", "tlPick", "name", "tlPick", "toLetter", "sound"],
    check: ["name", "toLetter", "sound", "tlPick", "tlType", "spot", "name", "tlPick", "toLetter", "tlType"]
  },
  {
    id: "0.2", title: "Letters that fool you", machen: "Lesson I", minutes: 25,
    letters: ["γ", "η", "ν", "ρ", "υ", "χ", "ω"],
    teach: [
      { h: "Same shape, different letter", p: `<p>These seven letters look like English letters, but they are different letters with different sounds. They are the ones beginners misread most, so slow down here.</p>` },
      { chart: "letters", list: ["γ", "η", "ν", "ρ", "υ", "χ", "ω"] },
      { h: "The traps, one by one", p: `<ul><li><span lang="el">η</span> looks like n but is <b>ē</b>, a long e.</li><li><span lang="el">ν</span> looks like v but is <b>n</b>.</li><li><span lang="el">ρ</span> looks like p but is <b>r</b>.</li><li><span lang="el">υ</span> looks like u or y and is <b>u</b>.</li><li><span lang="el">χ</span> looks like x but is <b>ch</b>.</li><li><span lang="el">ω</span> looks like w but is <b>ō</b>, a long o.</li><li><span lang="el">γ</span> looks like y but is <b>g</b>.</li></ul><p>A line over a vowel in the English letters (ē, ō) marks a long vowel. It is how you tell <span lang="el">η</span> from <span lang="el">ε</span> and <span lang="el">ω</span> from <span lang="el">ο</span> when Greek is written in English letters.</p>` },
      { write: ["γ", "η", "ν", "ρ", "υ", "χ", "ω"] },
      { h: "Words you can read now", p: `<p>With 15 letters you can read <span lang="el">ἐγώ</span> (egō, "I"), <span lang="el">ἦν</span> (ēn, "was") and <span lang="el">νῦν</span> (nun, "now").</p>` }
    ],
    see: { c: 1, v1: 1, v2: 2, mark: "letters", say: "John 1:1-2. This lesson's letters are highlighted. Watch for ν at the end of words: it is n, not v." },
    practise: ["name", "toLetter", "sound", "tlPick", "tlPick", "name", "tlType", "tlPick"],
    check: ["name", "toLetter", "sound", "tlPick", "tlPick", "tlType", "spot", "name", "tlType", "tlPick"]
  },
  {
    id: "0.3", title: "New shapes", machen: "Lesson I", minutes: 25,
    letters: ["ζ", "θ", "λ", "μ", "ξ", "π", "σ", "φ", "ψ"],
    teach: [
      { h: "The last nine", p: `<p>These letters have no English look-alike, so learn each shape fresh. After this lesson you know the whole alphabet.</p>` },
      { chart: "letters", list: ["ζ", "θ", "λ", "μ", "ξ", "π", "σ", "φ", "ψ"] },
      { h: "Two ways to write sigma", p: `<p>Sigma is written <span lang="el">σ</span> inside a word and <span lang="el">ς</span> at the end of a word. They are the same letter with the same sound: <span lang="el">λόγος</span> (logos) has one of each.</p><p>Four letters stand for two English letters: <span lang="el">θ</span> th, <span lang="el">φ</span> ph, <span lang="el">χ</span> ch and <span lang="el">ψ</span> ps. Each is still one Greek letter.</p>` },
      { chart: "letters", list: ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω"], title: "The whole alphabet, in order" },
      { write: ["ζ", "θ", "λ", "μ", "ξ", "π", "σ", "φ", "ψ"] },
      { h: "Learn the order too", p: `<p>Dictionaries list words in alphabetical order, so learn the 24 letters in order. Say them in groups of four: alpha beta gamma delta, epsilon zeta eta theta, iota kappa lambda mu, nu xi omicron pi, rho sigma tau upsilon, phi chi psi omega.</p>` }
    ],
    see: { c: 1, v1: 1, v2: 3, mark: "letters", say: "John 1:1-3. Every letter is now one you know; this lesson's are highlighted. Try reading each word in English letters before you tap it." },
    practise: ["name", "toLetter", "sound", "tlPick", "tlType", "order", "tlPick", "tlType"],
    check: ["name", "toLetter", "sound", "tlPick", "tlType", "tlType", "order", "spot", "tlPick", "tlType"]
  },
  {
    id: "0.4", title: "Vowels, pairs and breathing marks", machen: "Lesson I", minutes: 30,
    letters: [], allow: ["rough", "nasal", "subscript"],
    teach: [
      { h: "Seven vowels", p: `<p>The vowels are <span lang="el">α ε η ι ο υ ω</span>. <span lang="el">ε</span> and <span lang="el">ο</span> are always short; <span lang="el">η</span> and <span lang="el">ω</span> are always long. <span lang="el">α ι υ</span> can be either, and nothing in the spelling tells you which.</p>` },
      { h: "Vowel pairs", p: `<p>Two vowels side by side often make one sound, called a diphthong. The second vowel is always <span lang="el">ι</span> or <span lang="el">υ</span>.</p>` },
      { chart: "pairs" },
      { h: "Breathing marks", p: `<p>Every word that starts with a vowel has a small mark over that vowel, called a breathing. The rough breathing (it curls like an opening quote mark ‘) adds an <b>h</b> sound: <span lang="el">ὁ</span> is ho. The smooth breathing (it curls like an apostrophe ’) adds nothing: <span lang="el">ἐν</span> is en.</p><p>When a word starts with a vowel pair, the mark sits on the second vowel: <span lang="el">αὐτός</span> (autos), <span lang="el">οὗτος</span> (houtos). A word starting with <span lang="el">ρ</span> or <span lang="el">υ</span> always takes the rough breathing: <span lang="el">ῥῆμα</span> (rhēma), <span lang="el">υἱός</span> (huios).</p>` },
      { chart: "marks" },
      { h: "Iota written underneath", p: `<p>Sometimes a small iota is written under <span lang="el">α η ω</span>: <span lang="el">ᾳ ῃ ῳ</span>. It is not pronounced, but it is part of the spelling and often tells you the word's job in the sentence. <span lang="el">τῷ</span> is said tō.</p>` },
      { h: "Gamma before a k sound", p: `<p>Before <span lang="el">γ κ ξ χ</span>, gamma is said <b>ng</b>, as in sing. <span lang="el">ἄγγελος</span> (angelos) is said ang-gel-os. It is where the English word angel comes from.</p>` }
    ],
    see: { c: 1, v1: 4, v2: 5, mark: "breath", say: "John 1:4-5. Words with a rough breathing are highlighted: each starts with an h sound. Look for the vowel pairs and the iota under ῳ and ᾳ too." },
    practise: ["pair", "breath", "tlPick", "pair", "tlType", "breath", "tlPick", "tlType"],
    check: ["pair", "pair", "breath", "breath", "tlPick", "tlType", "spot", "tlType", "tlPick", "tlType"]
  },
  {
    id: "0.5", title: "Capitals and punctuation", machen: "Lesson I", minutes: 20,
    letters: [], allow: ["rough", "nasal", "subscript", "caps"],
    teach: [
      { h: "Capitals", p: `<p>Printed Greek New Testaments use capital letters far less than English does: for names, and for the first word of a paragraph or of a quotation. Most capitals look like their small letters; a few do not.</p>` },
      { chart: "caps" },
      { h: "Breathing on a capital", p: `<p>On a capital vowel, the breathing and accent stand just before it, at the top left: <span lang="el">Ἰησοῦς</span> (Iēsous), <span lang="el">Ἐν</span> (En).</p>` },
      { h: "Four punctuation marks", p: `<p>The one that trips everyone: the Greek question mark looks like an English semicolon.</p>` },
      { chart: "punct" },
      { h: "A dropped vowel", p: `<p>When a short word ending in a vowel comes before a word starting with a vowel, the final vowel may be dropped and marked with an apostrophe: <span lang="el">δι’ αὐτοῦ</span> for <span lang="el">διὰ αὐτοῦ</span>, "through him", in John 1:3.</p>` }
    ],
    see: { c: 1, v1: 38, v2: 38, mark: "caps", say: "John 1:38. Capitals are highlighted. Find the two Greek question marks: Jesus asks, \"What are you looking for?\" and they answer with a question of their own." },
    practise: ["cap", "punct", "tlPick", "cap", "tlType", "punct", "cap", "tlPick"],
    check: ["cap", "cap", "punct", "punct", "tlPick", "tlType", "spot", "cap", "tlType", "tlPick"]
  },
  {
    id: "0.6", title: "Accents and stress", machen: "Lesson II", minutes: 25,
    letters: [], allow: ["rough", "nasal", "subscript", "caps"],
    teach: [
      { h: "Three accents", p: `<p>Most Greek words carry one accent mark over a vowel. In New Testament times the accent marked a change of pitch. Machen, like most teachers today, has you simply say the accented syllable louder, as English stresses a syllable.</p>` },
      { chart: "accents" },
      { h: "Where they can go", p: `<ul><li>The acute can stand on any of the last three syllables.</li><li>The circumflex can stand on the last two, and only on a long vowel or a pair.</li><li>The grave stands only on the last syllable: an acute there turns grave when another word follows without punctuation. That is why <span lang="el">καί</span> is printed <span lang="el">καὶ</span> in the middle of a sentence.</li></ul><p>Machen's Lesson II gives the full rules for placing accents. You do not need them to read; recognising the marks and stressing the right syllable is enough for now.</p>` },
      { h: "Accents can change the word", p: `<p>A few words differ only by their accent or breathing: <span lang="el">εἰ</span> (ei) means "if" but <span lang="el">εἶ</span> (ei) means "you are"; <span lang="el">τίς</span> asks "who?" while <span lang="el">τις</span> means "someone". Small words like <span lang="el">ἐν</span>, <span lang="el">ὁ</span> and <span lang="el">οὐ</span> have no accent at all; they lean on the next word.</p>` },
      { h: "How the app shows stress", p: `<p>From here on, when a word is spelled out in English letters, the stressed vowel is in bold: <span lang="el">λόγος</span> is l<b>o</b>gos, said LO-gos.</p>` }
    ],
    see: { c: 1, v1: 14, v2: 14, mark: "accent", say: "John 1:14, \"The Word became flesh.\" Each accented vowel is highlighted. Tap a word to see which syllable to stress." },
    practise: ["accent", "stress", "stress", "accent", "tlType", "stress", "accent", "stress"],
    check: ["accent", "accent", "stress", "stress", "stress", "tlType", "spot", "accent", "stress", "tlType"]
  },
  {
    id: "0.7", title: "Reading John 1:1 and your first words", machen: "Lesson I", minutes: 35,
    letters: [], allow: ["rough", "nasal", "subscript", "caps"],
    teach: [
      { h: "Read a whole verse", p: `<p>You know every letter and mark. Now read John 1:1 aloud, slowly, one word at a time. Use the English letters only to check yourself after you have tried.</p><p class="gk-big" lang="el">Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.</p><p>En archē ēn ho logos, kai ho logos ēn pros ton theon, kai theos ēn ho logos.</p><p>"In the beginning was the Word, and the Word was with God, and the Word was God."</p>` },
      { h: "Eighteen words that are everywhere", p: `<p>These 18 words make up nearly half of the New Testament: about 62,000 of its 138,000 words, counting every form of each. Learn to recognise them on sight and every verse you open will already be partly familiar. Passing this lesson adds them to your review deck, the same deck the Study Desk uses.</p>` },
      { words: true },
      { h: "Copy it by hand", p: `<p>Write John 1:1 on paper, saying each letter's name as you write it. Then check your copy against the verse letter by letter, marks included. Writing is the surest way to know you can see every letter.</p>` }
    ],
    see: { c: 1, v1: 1, v2: 2, mark: "sight", say: "John 1:1-2. The words from this lesson's list are highlighted. Tap any word to check its English letters and stress." },
    practise: ["sight", "toSight", "tlType", "sight", "toSight", "sight", "tlType", "toSight"],
    check: ["sight", "sight", "toSight", "sight", "toSight", "tlType", "tlType", "sight", "toSight", "spot"],
    words: [
      ["ὁ", 3588, "the"], ["καί", 2532, "and, also, even"], ["αὐτός", 846, "he, she, it; self"], ["σύ", 4771, "you"],
      ["δέ", 1161, "and, but"], ["ἐν", 1722, "in, on, among"], ["ἐγώ", 1473, "I"], ["εἰμί", 1510, "I am"],
      ["λέγω", 3004, "I say, speak"], ["εἰς", 1519, "into, to"], ["οὐ", 3756, "not"], ["ὅς", 3739, "who, which"],
      ["οὗτος", 3778, "this"], ["θεός", 2316, "God, god"], ["ὅτι", 3754, "that, because"], ["πᾶς", 3956, "all, every"],
      ["γάρ", 1063, "for"], ["μή", 3361, "not"]
    ]
  }
];
