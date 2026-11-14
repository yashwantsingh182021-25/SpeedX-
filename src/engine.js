// SpeedX offline engine: Hinglish / chat-style text -> proper English.
// Free, runs fully on-device. Every change is recorded with a category so the
// Insights screen can show what kind of mistakes you make most.

export const CATEGORIES = {
  hinglish: { label: 'Hinglish → English', weight: 1, tip: 'Try thinking the sentence in English first: Subject → Verb → Object ("I am going home").' },
  spelling: { label: 'Spelling', weight: 1, tip: 'Typing the full word builds memory. Short forms like "becoz" slow down learning.' },
  slang: { label: 'Chat short-forms', weight: 0.5, tip: '"u", "r", "pls" are fine with friends, but write full words in proper messages.' },
  grammar: { label: 'Grammar', weight: 1.5, tip: 'Check that the verb agrees with the subject: he/she/it → "does", "has", "is".' },
  missing_verb: { label: 'Missing verb', weight: 1.5, tip: 'English sentences need a helping verb: "I am going", "Are you free?", "She is busy".' },
  capitalization: { label: 'Capital letters', weight: 0.3, tip: 'Start every sentence with a capital letter and always write "I" in capitals.' },
  punctuation: { label: 'Punctuation', weight: 0.3, tip: 'End sentences with "." and questions with "?". One "!" is enough.' },
};

// ---------- dictionaries ----------

const PLACES = {
  ghar: 'home', office: 'the office', college: 'college', school: 'school', market: 'the market',
  bazaar: 'the market', bazar: 'the market', mandir: 'the temple', dukaan: 'the shop', dukan: 'the shop',
  hospital: 'the hospital', station: 'the station', gym: 'the gym', class: 'class', bahar: 'outside',
  upar: 'upstairs', neeche: 'downstairs', wahan: 'there', waha: 'there', yahan: 'here', yaha: 'here',
};

const VERBS = {
  // root: [base, -ing, past participle]
  kar: ['do', 'doing'], ja: ['go', 'going'], jaa: ['go', 'going'], aa: ['come', 'coming'],
  kha: ['eat', 'eating'], pi: ['drink', 'drinking'], pee: ['drink', 'drinking'], so: ['sleep', 'sleeping'],
  padh: ['study', 'studying'], parh: ['study', 'studying'], dekh: ['watch', 'watching'],
  sun: ['listen', 'listening'], bol: ['say', 'saying'], likh: ['write', 'writing'], khel: ['play', 'playing'],
  soch: ['think', 'thinking'], ruk: ['wait', 'waiting'], chal: ['walk', 'walking'], bana: ['make', 'making'],
  pakda: ['catch', 'catching'], dhoondh: ['search', 'searching'], dhund: ['search', 'searching'],
  nikal: ['leave', 'leaving'], pahunch: ['reach', 'reaching'], bhej: ['send', 'sending'],
  sikh: ['learn', 'learning'], seekh: ['learn', 'learning'], baith: ['sit', 'sitting'], bhaag: ['run', 'running'],
  daud: ['run', 'running'], has: ['laugh', 'laughing'], ro: ['cry', 'crying'], naha: ['bathe', 'bathing'],
  le: ['take', 'taking'], de: ['give', 'giving'], mil: ['meet', 'meeting'], call: ['call', 'calling'],
  text: ['text', 'texting'], wait: ['wait', 'waiting'], try: ['try', 'trying'], work: ['work', 'working'],
};

const SUBJECTS = {
  main: 'I', mai: 'I', mein: 'I', tum: 'you', tu: 'you', aap: 'you', hum: 'we', ham: 'we',
  wo: 'he', woh: 'he', vo: 'he', voh: 'he', ye: 'this', yeh: 'this',
};

// Multi-word phrases (checked first, longest first). Keys are lowercase.
const PHRASES = {
  'kya haal hai': 'how are you', 'kya haal chaal': 'how are you', 'kaise ho': 'how are you', 'kaisi ho': 'how are you',
  'kese ho': 'how are you', 'aap kaise hain': 'how are you', 'kya chal raha hai': "what's going on",
  'kya scene hai': "what's the plan", 'kya hua': 'what happened', 'kya baat hai': "what's the matter",
  'kitne baje': 'at what time', 'kitna hua': 'how much is it', 'kitne ka hai': 'how much is it',
  'mujhe nahi pata': "I don't know", 'mujhe nhi pata': "I don't know", 'pata nahi': "I don't know",
  'pata nhi': "I don't know", 'koi baat nahi': 'no problem', 'koi baat nhi': 'no problem',
  'chalo theek hai': 'okay, fine', 'theek hai': 'okay', 'thik hai': 'okay', 'thik h': 'okay', 'theek h': 'okay',
  'bahut accha': 'very good', 'bohot accha': 'very good', 'bahut acha': 'very good', 'bohot acha': 'very good',
  'kal milte hain': 'see you tomorrow', 'kal milte h': 'see you tomorrow', 'phir milte hain': 'see you later',
  'baad me baat karte hain': "let's talk later", 'baad mein baat karte hain': "let's talk later",
  'baad me baat karte h': "let's talk later", 'baad me baat karenge': "we'll talk later",
  'mujhe bhook lagi hai': 'I am hungry', 'mujhe bhuk lagi hai': 'I am hungry',
  'thak gaya hoon': 'I am tired', 'thak gaya hu': 'I am tired', 'thak gayi hoon': 'I am tired', 'thak gayi hu': 'I am tired',
  'so gaye kya': 'did you sleep', 'so gaye': 'did you sleep', 'khana khaya kya': 'did you eat', 'khana khaya': 'did you eat',
  'khana kha liya': 'I have eaten', 'ghar pahunch gaya': 'I reached home', 'ghar pahunch gayi': 'I reached home',
  'ghar pahuch gaya': 'I reached home', 'jaldi aao': 'come quickly', 'jaldi aa jao': 'come quickly',
  'aa jao': 'come', 'chinta mat karo': "don't worry", 'tension mat lo': "don't worry", 'tension mat le': "don't worry",
  'kuch nahi': 'nothing', 'kuch nhi': 'nothing', 'kyu nahi': 'why not', 'kyun nahi': 'why not', 'sach me': 'really',
  'sach mein': 'really', 'main bhi': 'me too', 'mai bhi': 'me too', 'maaf karna': 'sorry', 'maaf kijiye': 'sorry',
  'bahut bahut dhanyavaad': 'thank you so much', 'bahut shukriya': 'thank you so much',
  'mujhe lagta hai': 'I think', 'mujhe laga': 'I thought', 'kab aaoge': 'when will you come',
  'kab aa rahe ho': 'when are you coming', 'kaha ho': 'where are you', 'kahan ho': 'where are you',
  'tum kaha ho': 'where are you', 'tum kahan ho': 'where are you', 'aap kaha ho': 'where are you',
  'aap kahan hain': 'where are you', 'kya kar rahe ho': 'what are you doing', 'kya kar rhe ho': 'what are you doing',
  'kya kar rahi ho': 'what are you doing', 'kya kr rhe ho': 'what are you doing', 'kya karu': 'what should I do',
  'main aa raha hoon': 'I am coming', 'main aata hoon': "I'll come", 'main aaunga': 'I will come',
  'main aaungi': 'I will come', 'main jaunga': 'I will go', 'main jaungi': 'I will go',
  'main karunga': 'I will do it', 'main karungi': 'I will do it', 'call karo': 'call me', 'call karna': 'call me',
  'call kar': 'call me', 'msg karo': 'message me', 'message karo': 'message me', 'reply karo': 'reply',
  'bata dena': 'let me know', 'batao': 'tell me', 'bata do': 'tell me', 'ruko zara': 'wait a moment',
  'ek minute': 'one minute', 'happy wala birthday': 'happy birthday', 'mubarak ho': 'congratulations',
  'badhai ho': 'congratulations', 'kya bolu': 'what can I say', 'samajh gaya': 'I understood',
  'samajh gayi': 'I understood', 'samajh nahi aaya': "I didn't understand", 'samajh nhi aaya': "I didn't understand",
  'mujhe pasand hai': 'I like it', 'mast hai': "it's great", 'bekar hai': "it's bad",
};

// Single Hindi/Hinglish words -> English (unambiguous only; "me", "to", "hi" are skipped on purpose).
const WORDS = {
  kya: 'what', kyu: 'why', kyun: 'why', kyon: 'why', kaise: 'how', kese: 'how', kaisa: 'how', kab: 'when',
  kaha: 'where', kahan: 'where', kaun: 'who', kon: 'who', kitna: 'how much', kitne: 'how many',
  haan: 'yes', han: 'yes', haa: 'yes', nahi: 'no', nhi: 'no', nahin: 'no', nai: 'no', mat: "don't",
  kyunki: 'because', kyuki: 'because', kyoki: 'because', lekin: 'but', magar: 'but', aur: 'and',
  bhi: 'also', sab: 'everything', sabko: 'everyone', kuch: 'something', bahut: 'very', bohot: 'very',
  bht: 'very', boht: 'very', abhi: 'now', aaj: 'today', kal: 'tomorrow', parso: 'day after tomorrow',
  phir: 'again', fir: 'again', jaldi: 'quickly', thoda: 'a little', zyada: 'more', jyada: 'more',
  shukriya: 'thank you', dhanyavaad: 'thank you', dhanyawad: 'thank you', accha: 'okay', acha: 'okay',
  achha: 'okay', theek: 'fine', thik: 'fine', pakka: 'sure', matlab: 'I mean', bas: 'just', sirf: 'only',
  mujhe: 'me', mujhko: 'me', tumhe: 'you', tumhein: 'you', tujhe: 'you', aapko: 'you', humein: 'us',
  mera: 'my', meri: 'my', mere: 'my', tera: 'your', teri: 'your', tere: 'your', tumhara: 'your',
  tumhari: 'your', aapka: 'your', aapki: 'your', uska: 'his', uski: 'her', hamara: 'our', humara: 'our',
  ghar: 'home', khana: 'food', kaam: 'work', paani: 'water', pani: 'water', dost: 'friend', doston: 'friends',
  pyaar: 'love', pyar: 'love', din: 'day', raat: 'night', subah: 'morning', shaam: 'evening', paisa: 'money',
  paise: 'money', baat: 'talk', log: 'people', ladka: 'boy', ladki: 'girl', chalo: "let's go", ruko: 'wait',
  suno: 'listen', dekho: 'look', aao: 'come', jao: 'go', bolo: 'tell me', ye: 'this', yeh: 'this',
  wo: 'that', woh: 'that', vo: 'that', yahan: 'here', yaha: 'here', wahan: 'there', waha: 'there',
  acchi: 'good', achi: 'good', achhi: 'good', maine: 'I', kiya: 'did', padha: 'studied', khaya: 'ate', dekha: 'saw', gaya: 'went', gayi: 'went', aaya: 'came', aayi: 'came', bola: 'said', socha: 'thought', liya: 'took', diya: 'gave', mast: 'great', bekar: 'bad', bura: 'bad', sundar: 'beautiful', khush: 'happy',
  pareshan: 'worried', busy: 'busy', saath: 'with', ke: 'of', ka: 'of', ki: 'of', liye: 'for', se: 'from',
  par: 'on', mein: 'in', main: 'I', mai: 'I', tum: 'you', aap: 'you', hum: 'we', ham: 'we',
  hai: 'is', hain: 'are', hoon: 'am', hu: 'am', hun: 'am', ho: 'are', tha: 'was', thi: 'was', the_: 'were',
  chahiye: 'need', pasand: 'like', pata: 'know', samjha: 'understood', yaar: '', yar: '', na: '', re: '', bhai: 'bro', bhaiya: 'brother', didi: 'sister',
};

// Words removed silently as fillers (still counted as hinglish).
const FILLERS = new Set(['yaar', 'yar', 're']);

const SLANG = {
  u: 'you', r: 'are', ur: 'your', y: 'why', n: 'and', k: 'okay', kk: 'okay', okk: 'okay', okie: 'okay',
  pls: 'please', plz: 'please', plss: 'please', thx: 'thanks', thnx: 'thanks', thnks: 'thanks', ty: 'thank you',
  msg: 'message', msgs: 'messages', gm: 'good morning', gn: 'good night', tc: 'take care', hw: 'how',
  abt: 'about', bday: 'birthday', lyk: 'like', luv: 'love', frnd: 'friend', frnds: 'friends', wanna: 'want to',
  gonna: 'going to', gotta: 'have to', dunno: "don't know", btw: 'by the way', idk: "I don't know",
  imo: 'in my opinion', asap: 'as soon as possible', bcoz: 'because', bcz: 'because', becoz: 'because',
  coz: 'because', cuz: 'because', bc: 'because', b4: 'before', gr8: 'great', '2day': 'today', '2morrow': 'tomorrow',
  tmrw: 'tomorrow', tmr: 'tomorrow', wat: 'what', wht: 'what', wid: 'with', wen: 'when', der: 'there',
  dis: 'this', dat: 'that', ppl: 'people', sry: 'sorry', srry: 'sorry', bro: 'bro', ofc: 'of course',
  nvm: 'never mind', wbu: 'what about you', hbu: 'how about you', rn: 'right now', np: 'no problem',
  tq: 'thank you', tysm: 'thank you so much', gud: 'good', nyc: 'nice', fyn: 'fine', m: 'am',
};

const SPELLING = {
  tommorow: 'tomorrow', tomorow: 'tomorrow', tomoro: 'tomorrow', tommorrow: 'tomorrow', recieve: 'receive',
  recieved: 'received', beleive: 'believe', definately: 'definitely', definatly: 'definitely',
  seperate: 'separate', untill: 'until', wich: 'which', thier: 'their', teh: 'the', adn: 'and', alot: 'a lot',
  ofcourse: 'of course', infront: 'in front', wierd: 'weird', occured: 'occurred', accomodate: 'accommodate',
  goverment: 'government', enviroment: 'environment', truely: 'truly', finaly: 'finally', realy: 'really',
  beautifull: 'beautiful', happend: 'happened', freind: 'friend', freinds: 'friends', becuase: 'because',
  togather: 'together', writting: 'writing', comming: 'coming', begining: 'beginning', sucess: 'success',
  succesful: 'successful', neccessary: 'necessary', necessery: 'necessary', adress: 'address',
  embarass: 'embarrass', existance: 'existence', grammer: 'grammar', knowlege: 'knowledge',
  libary: 'library', noticable: 'noticeable', occassion: 'occasion', persue: 'pursue', prefered: 'preferred',
  reccomend: 'recommend', recomend: 'recommend', relevent: 'relevant', rember: 'remember', remeber: 'remember',
  shedule: 'schedule', similiar: 'similar', sincerly: 'sincerely', speach: 'speech', suprise: 'surprise',
  tounge: 'tongue', wether: 'whether', anyways: 'anyway', paln: 'plan', hte: 'the', taht: 'that',
  waht: 'what', yuo: 'you', jsut: 'just', becouse: 'because', bcause: 'because', plese: 'please',
  pleas: 'please', thanku: 'thank you', thankyou: 'thank you', sory: 'sorry', welcom: 'welcome',
  morining: 'morning', mornig: 'morning', nite: 'night', tonite: 'tonight', gud: 'good', buisness: 'business',
  bussiness: 'business', calender: 'calendar', collegue: 'colleague', commited: 'committed',
  concious: 'conscious', dissapoint: 'disappoint', excercise: 'exercise', finnaly: 'finally',
  foriegn: 'foreign', guage: 'gauge', harrass: 'harass', independant: 'independent', intrest: 'interest',
  intresting: 'interesting', millenium: 'millennium', mispell: 'misspell', oppurtunity: 'opportunity',
  posible: 'possible', probaly: 'probably', propably: 'probably', publically: 'publicly',
  questionaire: 'questionnaire', reciept: 'receipt', resturant: 'restaurant', sentance: 'sentence',
  stoped: 'stopped', studing: 'studying', truley: 'truly', unfortunatly: 'unfortunately', untill_: 'until',
  vaccum: 'vacuum', wensday: 'Wednesday', wendsday: 'Wednesday', febuary: 'February',
  im: "I'm", dont: "don't", cant: "can't", didnt: "didn't", doesnt: "doesn't", isnt: "isn't",
  wasnt: "wasn't", havent: "haven't", hasnt: "hasn't", shouldnt: "shouldn't", couldnt: "couldn't",
  wouldnt: "wouldn't", arent: "aren't", werent: "weren't", thats: "that's", whats: "what's",
  ive: "I've", youre: "you're", theyre: "they're", wont: "won't", lets_: "let's",
};

const ING_WORDS = new Set(Object.values(VERBS).map((v) => v[1]).concat([
  'having', 'sleeping', 'reading', 'running', 'feeling', 'getting', 'leaving', 'trying', 'looking',
  'planning', 'travelling', 'traveling', 'driving', 'cooking', 'working', 'enjoying', 'missing',
]));

const STATES = 'busy|free|ready|tired|late|sick|fine|ok|okay|sure|home|here|there|hungry|bored|done|outside|available|awake|sleepy|angry|happy|sad|serious|online';

const QUESTION_START = /^(what|why|how|when|where|who|whom|which|whose|are|is|am|was|were|do|does|did|can|could|will|would|should|shall|have|has|had|may|might|aren't|isn't|don't|doesn't|didn't|can't|won't)\b/i;

// ---------- helpers ----------

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordCount(text) {
  return (text.match(/[\p{L}\p{N}']+/gu) || []).length;
}

// Apply a regex replacement and record every change.
function rule(state, re, replacer, type, note) {
  state.text = state.text.replace(re, (...args) => {
    const match = args[0];
    const offset = args[args.length - 2];
    const whole = args[args.length - 1];
    const groups = args.slice(1, -2);
    const out = typeof replacer === 'function' ? replacer(match, groups, offset, whole) : replacer;
    if (out === null || out === undefined || out === match) return match;
    state.changes.push({ from: match.trim(), to: out.trim(), type, note: typeof note === 'function' ? note(match, out) : note });
    return out;
  });
}

function mapWordsRule(state, dict, type, note) {
  const keys = Object.keys(dict).filter((k) => !k.endsWith('_')).sort((a, b) => b.length - a.length);
  if (!keys.length) return;
  const re = new RegExp(`(?<![\\p{L}\\p{N}'])(${keys.map(escapeRe).join('|')})(?![\\p{L}\\p{N}'])`, 'giu');
  rule(state, re, (m) => dict[m.toLowerCase()], type, note);
}

function previousWord(whole, offset) {
  const before = whole.slice(0, offset).trimEnd();
  const m = before.match(/([\p{L}']+)$/u);
  return m ? m[1].toLowerCase() : '';
}

// ---------- pipeline ----------

function hinglishPass(state) {
  // Progressive tense: "main ghar ja raha hoon" -> "I am going home"
  const subj = Object.keys(SUBJECTS).join('|');
  const verbs = Object.keys(VERBS).sort((a, b) => b.length - a.length).join('|');
  const progressive = new RegExp(
    `\\b(${subj})\\s+((?:[\\p{L}]+\\s+){0,3}?)(${verbs})\\s+(?:raha|rahi|rahe|rha|rhi|rhe)\\s+(hoon|hu|hun|ho|hai|hain|h|tha|thi|the)\\b`,
    'giu',
  );
  rule(state, progressive, (m, g) => {
    const s = SUBJECTS[g[0].toLowerCase()];
    const past = /^(tha|thi|the)$/i.test(g[3]);
    let aux;
    if (s === 'I') aux = past ? 'was' : 'am';
    else if (s === 'you' || s === 'we') aux = past ? 'were' : 'are';
    else aux = past ? 'was' : 'is';
    const ing = VERBS[g[2].toLowerCase()][1];
    const middle = g[1].trim().split(/\s+/).filter(Boolean).map((w) => w.toLowerCase());
    const qw = middle.find((w) => ['kya', 'kaha', 'kahan', 'kab', 'kyu', 'kyun', 'kaise'].includes(w));
    const time = middle.filter((w) => ['abhi', 'aaj', 'kal'].includes(w)).map((w) => WORDS[w]);
    const rest = middle
      .filter((w) => w !== qw && !['abhi', 'aaj', 'kal'].includes(w))
      .map((w) => PLACES[w] ?? WORDS[w] ?? w)
      .filter(Boolean);
    const tail = [...rest, ...time].join(' ');
    if (qw) return `${WORDS[qw]} ${aux} ${s} ${ing}${tail ? ' ' + tail : ''}`;
    return `${s} ${aux} ${ing}${tail ? ' ' + tail : ''}`;
  }, 'hinglish', 'Hindi verb phrase → English tense (subject + helping verb + -ing)');

  // "main busy hoon" -> "I am busy", "tum free ho?" -> "are you free?"
  const stateRe = new RegExp(`\\b(main|mai|tum|aap|hum|wo|woh|vo)\\s+(${STATES})\\s+(hoon|hu|hun|ho|hai|hain|h)\\b(\\s*\\?)?`, 'giu');
  rule(state, stateRe, (m, g) => {
    const s = SUBJECTS[g[0].toLowerCase()];
    const aux = s === 'I' ? 'am' : s === 'he' ? 'is' : 'are';
    if (g[3]) return `${aux} ${s} ${g[1]}?`;
    return `${s} ${aux} ${g[1]}`;
  }, 'hinglish', 'Hindi word order → English (subject + am/is/are + word)');

  // "mujhe X chahiye" -> "I need X"; "mujhe X pasand hai" -> "I like X"
  rule(state, /\b(?:mujhe|mujhko)\s+((?:[\p{L}]+\s+){1,3}?)chahiye\b/giu,
    (m, g) => `I need ${g[0].trim().split(/\s+/).map((w) => WORDS[w.toLowerCase()] ?? w).join(' ')}`,
    'hinglish', '"mujhe … chahiye" → "I need …"');
  rule(state, /\b(?:mujhe|mujhko)\s+((?:[\p{L}]+\s+){1,3}?)pasand\s+(?:hai|h)\b/giu,
    (m, g) => `I like ${g[0].trim().split(/\s+/).map((w) => WORDS[w.toLowerCase()] ?? w).join(' ')}`,
    'hinglish', '"mujhe … pasand hai" → "I like …"');

  // Fixed phrases
  mapWordsRule(state, PHRASES, 'hinglish', 'Common Hinglish phrase → natural English');

  // Remaining single words — only when the message really looks Hinglish, so that
  // English words such as "main", "log" or "mat" are not touched in English messages.
  if (!(state.hinglish ?? looksHinglish(state.text))) return;
  const before = state.changes.length;
  mapWordsRule(state, WORDS, 'hinglish', (m) => (FILLERS.has(m.toLowerCase()) || m.toLowerCase() === 'na'
    ? 'Filler word removed – not needed in proper English'
    : 'Hindi word → English'));
  // "this good is" -> "this is good" (Hindi puts the verb last)
  if (state.changes.length > before) {
    rule(state, /\b(I|you|we|they|he|she|it|this|that|everything)((?:\s+(?!very\b)[\p{L}]+)?)\s+((?:very\s+|so\s+|a little\s+)?(?!am\b|is\b|are\b|was\b|were\b)[\p{L}]+)\s+(am|is|are|was|were)\b/gu,
      (m, g) => `${g[0]}${g[1]} ${g[3]} ${g[2]}`,
      'hinglish', 'Verb moved after the subject (English order)');
  }
  // Clean double spaces left behind by removed fillers
  state.text = state.text.replace(/[ \t]{2,}/g, ' ').replace(/ +([,.!?])/g, '$1').replace(/^ +| +$/gm, '');
}

function grammarPass(state) {
  rule(state, /\bi\s+am\s+agree\b/gi, 'I agree', 'grammar', '"agree" is already a verb – drop "am"');
  rule(state, /\bmyself\s+([A-Za-z]+)\b(?=\s*(?:here|from|and|,|\.|$))/gim, (m, g) => `I am ${g[0][0].toUpperCase()}${g[0].slice(1)}`,
    'grammar', 'Introduce yourself with "I am …", not "Myself …"');
  rule(state, /\bdo the needful\b/gi, 'please do what is needed', 'grammar', '"Do the needful" is not used in standard English');
  rule(state, /\b(he|she|it)\s+don't\b/gi, (m, g) => `${g[0]} doesn't`, 'grammar', 'he/she/it → "doesn\'t"');
  rule(state, /\b(he|she|it)\s+have\b/gi, (m, g, o, w) => (/\b(will|would|should|could|might|must|may|to)\s+$/i.test(w.slice(0, o)) ? null : `${g[0]} has`),
    'grammar', 'he/she/it → "has"');
  rule(state, /\b(he|she|it)\s+are\b/gi, (m, g) => `${g[0]} is`, 'grammar', 'he/she/it → "is"');
  rule(state, /\b(you|we|they)\s+is\b/gi, (m, g) => `${g[0]} are`, 'grammar', 'you/we/they → "are"');
  rule(state, /\b(you|we|they)\s+was\b/gi, (m, g) => `${g[0]} were`, 'grammar', 'you/we/they → "were"');
  rule(state, /\bi\s+is\b/gi, 'I am', 'grammar', 'I → "am"');
  rule(state, /\b(did(?:n't| not)?|does(?:n't| not)?|do(?:n't| not)?)\s+(went|came|ate|saw|told|gave|took|got|wrote|knew|said|made|bought|brought|thought)\b/gi,
    (m, g) => {
      const base = { went: 'go', came: 'come', ate: 'eat', saw: 'see', told: 'tell', gave: 'give', took: 'take', got: 'get', wrote: 'write', knew: 'know', said: 'say', made: 'make', bought: 'buy', brought: 'bring', thought: 'think' };
      return `${g[0]} ${base[g[1].toLowerCase()]}`;
    }, 'grammar', 'After did/does/do use the base verb ("did not go")');
  rule(state, /\bmore\s+(better|easier|bigger|faster|smaller|happier|worse)\b/gi, (m, g) => g[0], 'grammar', 'Comparative already means "more" – drop "more"');
  rule(state, /\bdiscuss\s+about\b/gi, 'discuss', 'grammar', '"discuss" needs no "about"');
  rule(state, /\breturn\s+back\b/gi, 'return', 'grammar', '"return" already means "go back"');
  rule(state, /\b(am|is|are|was|were)\s+((?:\w+ing)\s+)?since\s+(\d+)\s+(minutes?|hours?|days?|weeks?|months?|years?)\b/gi,
    (m, g) => `${g[0]} ${g[1] || ''}for ${g[2]} ${g[3]}`.replace(/\s+/g, ' '), 'grammar', 'Use "for" with a length of time, "since" with a starting point');
  // Third person -s: "she go" -> "she goes"
  rule(state, /\b(he|she|it)\s+(go|come|eat|want|like|need|know|say|do|study|watch|play|live|work|think|love|hate|feel|try)\b/gi,
    (m, g, o, w) => {
      const prev = previousWord(w, o);
      if (['did', 'does', 'do', 'will', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 'let', 'make', 'made', 'to', 'help', 'let\'s', 'didn\'t', 'doesn\'t', 'can\'t', 'won\'t', 'shall'].includes(prev)) return null;
      const v = g[1].toLowerCase();
      const third = { go: 'goes', do: 'does', study: 'studies', watch: 'watches', try: 'tries', say: 'says' }[v] || `${v}s`;
      return `${g[0]} ${third}`;
    }, 'grammar', 'he/she/it + verb takes "-s" ("she goes")');
  // a / an
  rule(state, /\b(a|A)\s+([aeiouAEIOU][\p{L}]*)/gu, (m, g) => {
    if (/^(u[nbst]i|use|usu|uti|eu|one|once|uni)/i.test(g[1])) return null;
    return `${g[0] === 'A' ? 'An' : 'an'} ${g[1]}`;
  }, 'grammar', 'Use "an" before a vowel sound');
  rule(state, /\b(a|A)\s+(hour|hours|honest|heir|honou?r)\b/g, (m, g) => `${g[0] === 'A' ? 'An' : 'an'} ${g[1]}`, 'grammar', 'Use "an" before a vowel sound ("an hour")');
  rule(state, /\b(an|An)\s+([b-df-hj-np-tv-z][\p{L}]*)/gu, (m, g) => {
    if (/^(hour|honest|honou?r|heir|mba|mla|fir|sms|x-?ray)/i.test(g[1])) return null;
    return `${g[0] === 'An' ? 'A' : 'a'} ${g[1]}`;
  }, 'grammar', 'Use "a" before a consonant sound');
  // Question word order: "what you are doing" -> "what are you doing"
  rule(state, /\b(what|where|why|how|when)\s+(you|he|she|they|we|it)\s+(are|is|am|were|was)\b(?=[^.!\n]*\?|\s+\w+ing\b)/gi,
    (m, g) => `${g[0]} ${g[2]} ${g[1]}`, 'grammar', 'In questions, the helping verb comes before the subject');
}

function missingVerbPass(state) {
  const ing = [...ING_WORDS].join('|');
  rule(state, new RegExp(`\\b(I|you|we|they|he|she|it)\\s+(${ing}|[a-z]{3,}ing)\\b`, 'gi'), (m, g, o, w) => {
    const prev = previousWord(w, o);
    if (['am', 'is', 'are', 'was', 'were', 'be', 'been', 'thank', 'see', 'saw', 'heard', 'hear', 'keep', 'kept', 'left', 'love', 'like', 'imagine', 'mind', 'without', 'about', 'of', 'for', 'with', 'by', 'after', 'before'].includes(prev)) return null;
    const verb = g[1].toLowerCase();
    if (['thing', 'something', 'nothing', 'anything', 'everything', 'morning', 'evening', 'king', 'ring', 'sing', 'bring', 'spring', 'wing', 'string', 'sibling', 'during', 'darling', 'building', 'wedding', 'meeting', 'feeling', 'ceiling'].includes(verb) && !/^(feeling|meeting)$/.test(verb)) return null;
    const s = g[0].toLowerCase();
    const aux = s === 'i' ? 'am' : ['he', 'she', 'it'].includes(s) ? 'is' : 'are';
    return `${g[0]} ${aux} ${g[1]}`;
  }, 'missing_verb', (m, out) => `Add the helping verb: "${out}"`);

  // "you free?" -> "are you free?"
  rule(state, new RegExp(`(^|[.!?]\\s+|\\n)(you|he|she|they|we)\\s+(${STATES})\\s*\\?`, 'gim'), (m, g) => {
    const s = g[1].toLowerCase();
    const aux = ['he', 'she'].includes(s) ? 'is' : 'are';
    return `${g[0]}${aux} ${g[1]} ${g[2]}?`;
  }, 'missing_verb', 'Yes/no questions start with "are/is"');

  // "I busy" / "she late" -> "I am busy"
  rule(state, new RegExp(`\\b(I|you|we|they|he|she)\\s+(${STATES})\\b(?!\\s*\\?)`, 'gi'), (m, g, o, w) => {
    const prev = previousWord(w, o);
    if (['am', 'is', 'are', 'was', 'were', 'make', 'made', 'keep', 'let', 'get', 'got', 'want', 'with', 'thank', 'see', 'call', 'tell', 'told', 'if', 'feel', 'felt'].includes(prev)) return null;
    const s = g[0].toLowerCase();
    const aux = s === 'i' ? 'am' : ['he', 'she'].includes(s) ? 'is' : 'are';
    return `${g[0]} ${aux} ${g[1]}`;
  }, 'missing_verb', (m, out) => `Add the helping verb: "${out}"`);
}

function capitalizationPass(state) {
  rule(state, /(?<![\p{L}'])i(?=(?:'m|'ll|'ve|'d)?(?![\p{L}]))/gu, 'I', 'capitalization', 'Always write "I" as a capital letter');
  rule(state, /(^|[.!?]\s+|\n\s*)([a-z])/gu, (m, g) => `${g[0]}${g[1].toUpperCase()}`, 'capitalization', 'Start a sentence with a capital letter');
}

function punctuationPass(state) {
  rule(state, /([!?])\1+/g, (m, g) => g[0], 'punctuation', 'One "!" or "?" is enough');
  rule(state, /\.{4,}/g, '...', 'punctuation', 'Use three dots for "…"');
  rule(state, /\s+([,.!?;:])(?!\S*\w\.)/g, (m, g) => g[0], 'punctuation', 'No space before punctuation');
  rule(state, /,(?=[\p{L}])/gu, ', ', 'punctuation', 'Add a space after a comma');

  // End of each line: add "?" or "." when missing (skip lines ending in emoji / symbols).
  const lines = state.text.split('\n');
  state.text = lines.map((line) => {
    const t = line.trimEnd();
    if (!t || !/[\p{L}\p{N}]$/u.test(t)) return line;
    const lastSentence = t.split(/(?<=[.!?])\s+/).pop();
    const isQ = QUESTION_START.test(lastSentence.trim()) && !/^(what|how)\s+(a|an|nice|great|beautiful|lovely)\b/i.test(lastSentence.trim());
    const mark = isQ ? '?' : '.';
    state.changes.push({ from: lastSentence.split(/\s+/).slice(-1)[0], to: lastSentence.split(/\s+/).slice(-1)[0] + mark, type: 'punctuation', note: mark === '?' ? 'A question ends with "?"' : 'End the sentence with a full stop' });
    return t + mark;
  }).join('\n');

  // A line that is a question but ends with "." -> "?"
  state.text = state.text.replace(/(^|[.!?]\s+|\n)([^.!?\n]+)\./g, (m, pre, sentence) => {
    if (QUESTION_START.test(sentence.trim()) && !/^(how are you doing|what a)\b/i.test(sentence.trim()) && /^(what|why|how|when|where|who|which|are|is|do|does|did|can|could|will|would|should)\b/i.test(sentence.trim())) {
      if (/^(what|how)\s+(a|an|nice|great)\b/i.test(sentence.trim())) return m;
      state.changes.push({ from: `${sentence.trim()}.`, to: `${sentence.trim()}?`, type: 'punctuation', note: 'A question ends with "?"' });
      return `${pre}${sentence}?`;
    }
    return m;
  });
}

/**
 * Convert text. Returns { output, changes, stats }.
 * stats.before / stats.after are 0-100 "English scores".
 */
export function convert(input) {
  const state = { text: input.replace(/\r\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim(), changes: [] };
  if (!state.text) return { output: '', changes: [], stats: emptyStats() };
  state.hinglish = looksHinglish(state.text); // decided on what the user typed

  hinglishPass(state);
  mapWordsRule(state, SLANG, 'slang', (m, out) => `"${m}" → "${out}" in proper writing`);
  mapWordsRule(state, SPELLING, 'spelling', (m, out) => `Correct spelling: "${out}"`);
  grammarPass(state);
  missingVerbPass(state);
  capitalizationPass(state);
  punctuationPass(state);

  const changes = state.changes.filter((c) => c.from.toLowerCase() !== c.to.toLowerCase() || c.type === 'capitalization');
  // Word-by-word Hindi replacements are a sign that a full-sentence translation (AI) would read better.
  const wordByWord = changes.filter((c) => c.type === 'hinglish' && c.note === 'Hindi word → English').length;
  const lowConfidence = wordByWord >= 3 || leftoverHindi(state.text).length > 0;
  return { output: state.text, changes, stats: scoreStats(input, state.text, changes), lowConfidence };
}

function emptyStats() {
  return { words: 0, counts: {}, before: 100, after: 100 };
}

export function countByType(changes) {
  const counts = {};
  for (const c of changes) counts[c.type] = (counts[c.type] || 0) + 1;
  return counts;
}

export function scoreFromChanges(text, changes) {
  const words = Math.max(1, wordCount(text));
  const weighted = changes.reduce((sum, c) => sum + (CATEGORIES[c.type]?.weight ?? 1), 0);
  return Math.max(0, Math.round(100 * (1 - Math.min(1, weighted / (words * 1.5)))));
}

function scoreStats(input, output, changes) {
  // "after" = how the converted text scores when checked again (honest re-check, not a fixed 100).
  let after = 100;
  if (output) {
    const recheck = { text: output, changes: [] };
    hinglishPass(recheck);
    mapWordsRule(recheck, SLANG, 'slang', '');
    mapWordsRule(recheck, SPELLING, 'spelling', '');
    grammarPass(recheck);
    missingVerbPass(recheck);
    const leftovers = leftoverHindi(output).map((w) => ({ from: w, to: w, type: 'hinglish' }));
    after = scoreFromChanges(output, recheck.changes.concat(leftovers));
  }
  return {
    words: wordCount(input),
    counts: countByType(changes),
    before: scoreFromChanges(input, changes),
    after,
  };
}

function looksHinglish(text) {
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  const hits = words.filter((w) => HINDI_HINTS.has(w) || STRONG_HINTS.has(w)).length;
  return hits >= 1 && hits / Math.max(1, words.length) >= 0.1;
}

const STRONG_HINTS = new Set(['hai', 'hain', 'hoon', 'mujhe', 'kya', 'nahi', 'nhi', 'bhi', 'yaar', 'yar', 'accha', 'acha',
  'theek', 'thik', 'kyu', 'kyun', 'kaise', 'kaha', 'kahan', 'abhi', 'aaj', 'tumhe', 'mera', 'meri', 'tera', 'teri', 'aur',
  'bahut', 'bohot', 'kuch', 'haan', 'chalo', 'bhai', 'bhaiya', 'didi', 'ghar', 'khana', 'kaam', 'dost', 'lekin', 'kyunki', 'mai', 'tum', 'aap', 'hu']);

/** Rough check for leftover Hindi words — used to suggest the AI engine. */
const HINDI_HINTS = new Set(['hai', 'hain', 'ho', 'hoon', 'hu', 'raha', 'rahi', 'rahe', 'kar', 'karo', 'karna', 'tha', 'thi',
  'mujhe', 'tum', 'aap', 'kya', 'nahi', 'bhi', 'kuch', 'gaya', 'gayi', 'liya', 'diya', 'wala', 'wali', 'apna', 'apni',
  'jab', 'tab', 'agar', 'toh', 'kaun', 'kisi', 'kisko', 'karke', 'lagta', 'laga', 'chahta', 'chahti', 'sakta', 'sakti']);

export function leftoverHindi(text) {
  return (text.toLowerCase().match(/[a-z]+/g) || []).filter((w) => HINDI_HINTS.has(w));
}

/** Word-level diff (LCS) for the before/after view. Returns [{type:'same'|'del'|'add', text}] */
export function diffWords(a, b) {
  const A = a.split(/(\s+)/).filter((t) => t !== '');
  const B = b.split(/(\s+)/).filter((t) => t !== '');
  const n = A.length;
  const m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  const push = (type, text) => {
    const last = out[out.length - 1];
    if (last && last.type === type) last.text += text;
    else out.push({ type, text });
  };
  while (i < n && j < m) {
    if (A[i] === B[j]) { push('same', A[i]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) { push('del', A[i]); i++; } else { push('add', B[j]); j++; }
  }
  while (i < n) push('del', A[i++]);
  while (j < m) push('add', B[j++]);
  return out;
}
