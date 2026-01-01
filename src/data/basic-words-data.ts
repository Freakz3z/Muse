import { Word } from '../types'

// 基础词汇本 - 内置完整单词数据（50个常用单词）
export const basicWordsData: Word[] = [
  {
    id: 'word_hello',
    word: 'hello',
    phonetic: { us: '/həˈloʊ/', uk: '/həˈləʊ/' },
    meanings: [
      { partOfSpeech: 'int.', definition: 'Used as a greeting', translation: '你好，喂' }
    ],
    examples: ['Hello! How are you today?', 'She said hello to everyone in the room.'],
    synonyms: ['hi', 'hey', 'greetings'],
    antonyms: ['goodbye', 'bye'],
    collocations: [],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_world',
    word: 'world',
    phonetic: { us: '/wɜːrld/', uk: '/wɜːld/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'The earth and all the people and things on it', translation: '世界，地球' }
    ],
    examples: ['People from all over the world come to visit.', 'The internet has changed the world.'],
    synonyms: ['earth', 'globe', 'planet'],
    antonyms: [],
    collocations: ['around the world', 'world peace'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_time',
    word: 'time',
    phonetic: { us: '/taɪm/', uk: '/taɪm/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'The continued progress of existence', translation: '时间' },
      { partOfSpeech: 'v.', definition: 'Plan or arrange when something should happen', translation: '计时，安排时间' }
    ],
    examples: ['What time is it?', 'Time flies when you are having fun.'],
    synonyms: ['moment', 'period', 'duration'],
    antonyms: [],
    collocations: ['save time', 'waste time', 'on time'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_love',
    word: 'love',
    phonetic: { us: '/lʌv/', uk: '/lʌv/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'An intense feeling of deep affection', translation: '爱，喜爱' },
      { partOfSpeech: 'v.', definition: 'Feel deep affection for', translation: '爱，热爱' }
    ],
    examples: ['I love you.', 'She loves reading books.'],
    synonyms: ['adore', 'cherish', 'treasure'],
    antonyms: ['hate', 'detest'],
    collocations: ['fall in love', 'true love'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_book',
    word: 'book',
    phonetic: { us: '/bʊk/', uk: '/bʊk/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A written or printed work consisting of pages', translation: '书，书籍' },
      { partOfSpeech: 'v.', definition: 'Reserve accommodation or a place', translation: '预订' }
    ],
    examples: ['I am reading a book.', 'Can you book a table for dinner?'],
    synonyms: ['volume', 'publication', 'tome'],
    antonyms: [],
    collocations: ['read a book', 'book a flight'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_good',
    word: 'good',
    phonetic: { us: '/ɡʊd/', uk: '/ɡʊd/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'To be desired or approved of', translation: '好的，优秀的' },
      { partOfSpeech: 'n.', definition: 'That which is morally right', translation: '善，好处' }
    ],
    examples: ['That is a good idea.', 'She is a good person.'],
    synonyms: ['excellent', 'great', 'fine'],
    antonyms: ['bad', 'poor', 'terrible'],
    collocations: ['good morning', 'good luck'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_learn',
    word: 'learn',
    phonetic: { us: '/lɜːrn/', uk: '/lɜːn/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Gain knowledge or skill by studying', translation: '学习，学会' }
    ],
    examples: ['I want to learn English.', 'She learns quickly.'],
    synonyms: ['study', 'master', 'acquire'],
    antonyms: ['forget', 'unlearn'],
    collocations: ['learn from', 'learn by heart'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_study',
    word: 'study',
    phonetic: { us: '/ˈstʌdi/', uk: '/ˈstʌdi/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Devote time and attention to gaining knowledge', translation: '学习，研究' },
      { partOfSpeech: 'n.', definition: 'The devotion of time to acquiring knowledge', translation: '学习，研究' }
    ],
    examples: ['He studies hard every day.', 'This is an interesting study.'],
    synonyms: ['learn', 'research', 'examine'],
    antonyms: [],
    collocations: ['study abroad', 'case study'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_work',
    word: 'work',
    phonetic: { us: '/wɜːrk/', uk: '/wɜːk/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Be engaged in physical or mental activity', translation: '工作，运转' },
      { partOfSpeech: 'n.', definition: 'Activity involving mental or physical effort', translation: '工作，作品' }
    ],
    examples: ['I work in an office.', 'This machine does not work.'],
    synonyms: ['labor', 'toil', 'job'],
    antonyms: ['rest', 'play', 'relax'],
    collocations: ['hard work', 'work hard'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_day',
    word: 'day',
    phonetic: { us: '/deɪ/', uk: '/deɪ/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A period of 24 hours', translation: '天，日子' }
    ],
    examples: ['What day is it today?', 'Have a nice day!'],
    synonyms: ['date', 'period'],
    antonyms: ['night'],
    collocations: ['every day', 'one day', 'all day'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_year',
    word: 'year',
    phonetic: { us: '/jɪr/', uk: '/jɪə(r)/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'The time taken by the earth to make one revolution', translation: '年，年份' }
    ],
    examples: ['Happy New Year!', 'She is 20 years old.'],
    synonyms: ['annum'],
    antonyms: [],
    collocations: ['last year', 'next year', 'this year'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_people',
    word: 'people',
    phonetic: { us: '/ˈpiːpl/', uk: '/ˈpiːpl/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'Human beings in general or considered collectively', translation: '人，人们' }
    ],
    examples: ['Many people love music.', 'People are waiting outside.'],
    synonyms: ['persons', 'individuals', 'folks'],
    antonyms: [],
    collocations: ['young people', 'many people'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_think',
    word: 'think',
    phonetic: { us: '/θɪŋk/', uk: '/θɪŋk/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Have a particular opinion or belief', translation: '想，认为' }
    ],
    examples: ['I think you are right.', 'What do you think about this?'],
    synonyms: ['believe', 'consider', 'suppose'],
    antonyms: [],
    collocations: ['think about', 'think of'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_know',
    word: 'know',
    phonetic: { us: '/noʊ/', uk: '/nəʊ/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Be aware of through observation or inquiry', translation: '知道，了解' }
    ],
    examples: ['I know the answer.', 'Do you know him?'],
    synonyms: ['understand', 'comprehend', 'realize'],
    antonyms: ['ignore', 'misunderstand'],
    collocations: ['get to know', 'let me know'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_make',
    word: 'make',
    phonetic: { us: '/meɪk/', uk: '/meɪk/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Form something by putting parts together', translation: '制造，做' }
    ],
    examples: ['She makes breakfast every morning.', 'Let me make a phone call.'],
    synonyms: ['create', 'produce', 'build'],
    antonyms: ['destroy', 'break'],
    collocations: ['make a decision', 'make friends'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_take',
    word: 'take',
    phonetic: { us: '/teɪk/', uk: '/teɪk/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Lay hold of with hands', translation: '拿，取' }
    ],
    examples: ['Take this book.', 'It takes time to learn.'],
    synonyms: ['grab', 'seize', 'get'],
    antonyms: ['give', 'offer'],
    collocations: ['take care', 'take place'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_see',
    word: 'see',
    phonetic: { us: '/siː/', uk: '/siː/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Perceive with the eyes', translation: '看见，明白' }
    ],
    examples: ['I can see you.', 'See you later!'],
    synonyms: ['observe', 'view', 'watch'],
    antonyms: ['miss', 'overlook'],
    collocations: ['see a doctor', 'see you'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_come',
    word: 'come',
    phonetic: { us: '/kʌm/', uk: '/kʌm/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Move toward or arrive at a place', translation: '来，到来' }
    ],
    examples: ['Come here, please.', 'Spring has come.'],
    synonyms: ['arrive', 'approach', 'reach'],
    antonyms: ['go', 'leave', 'depart'],
    collocations: ['come back', 'come from'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_want',
    word: 'want',
    phonetic: { us: '/wɑːnt/', uk: '/wɒnt/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Have a desire to possess or do', translation: '想要，需要' }
    ],
    examples: ['I want to go home.', 'What do you want?'],
    synonyms: ['desire', 'wish', 'need'],
    antonyms: ['reject', 'refuse'],
    collocations: ['want to', 'if you want'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_give',
    word: 'give',
    phonetic: { us: '/ɡɪv/', uk: '/ɡɪv/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Freely transfer the possession of', translation: '给，提供' }
    ],
    examples: ['Give me the book.', 'He gives good advice.'],
    synonyms: ['provide', 'offer', 'present'],
    antonyms: ['take', 'receive', 'keep'],
    collocations: ['give up', 'give away'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_use',
    word: 'use',
    phonetic: { us: '/juːz/', uk: '/juːz/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Take or consume for a purpose', translation: '使用，利用' },
      { partOfSpeech: 'n.', definition: 'The action of using something', translation: '使用，用途' }
    ],
    examples: ['May I use your pen?', 'This tool has many uses.'],
    synonyms: ['utilize', 'employ', 'apply'],
    antonyms: ['discard', 'waste'],
    collocations: ['make use of', 'in use'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_find',
    word: 'find',
    phonetic: { us: '/faɪnd/', uk: '/faɪnd/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Discover after a deliberate search', translation: '找到，发现' }
    ],
    examples: ['I cannot find my keys.', 'Did you find what you needed?'],
    synonyms: ['discover', 'locate', 'detect'],
    antonyms: ['lose', 'miss'],
    collocations: ['find out', 'find it easy'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_tell',
    word: 'tell',
    phonetic: { us: '/tel/', uk: '/tel/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Communicate information to someone', translation: '告诉，讲述' }
    ],
    examples: ['Tell me the truth.', 'Can you tell me the way?'],
    synonyms: ['inform', 'notify', 'relate'],
    antonyms: ['conceal', 'hide'],
    collocations: ['tell a story', 'tell the truth'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_ask',
    word: 'ask',
    phonetic: { us: '/æsk/', uk: '/ɑːsk/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Say something to obtain information', translation: '问，询问' }
    ],
    examples: ['May I ask a question?', 'He asked for help.'],
    synonyms: ['inquire', 'question', 'request'],
    antonyms: ['answer', 'reply'],
    collocations: ['ask for', 'ask about'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_feel',
    word: 'feel',
    phonetic: { us: '/fiːl/', uk: '/fiːl/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Be aware of through touch or emotions', translation: '感觉，觉得' }
    ],
    examples: ['I feel happy.', 'How do you feel today?'],
    synonyms: ['sense', 'perceive', 'experience'],
    antonyms: [],
    collocations: ['feel like', 'feel good'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_try',
    word: 'try',
    phonetic: { us: '/traɪ/', uk: '/traɪ/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Make an attempt or effort to do something', translation: '尝试，试图' }
    ],
    examples: ['Try your best.', 'Let me try again.'],
    synonyms: ['attempt', 'endeavor', 'strive'],
    antonyms: ['abandon', 'quit'],
    collocations: ['try to', 'try on'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_call',
    word: 'call',
    phonetic: { us: '/kɔːl/', uk: '/kɔːl/' },
    meanings: [
      { partOfSpeech: 'v.', definition: 'Give a name to or describe as', translation: '叫，称呼；打电话' },
      { partOfSpeech: 'n.', definition: 'A telephone conversation', translation: '电话' }
    ],
    examples: ['Call me tomorrow.', 'They call him Tom.'],
    synonyms: ['name', 'telephone', 'summon'],
    antonyms: [],
    collocations: ['phone call', 'call back'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_hand',
    word: 'hand',
    phonetic: { us: '/hænd/', uk: '/hænd/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'The end part of a person\'s arm', translation: '手' },
      { partOfSpeech: 'v.', definition: 'Pick something up and give it to', translation: '递，交' }
    ],
    examples: ['Raise your hand.', 'Hand me the book, please.'],
    synonyms: ['palm', 'give', 'pass'],
    antonyms: [],
    collocations: ['by hand', 'hand in'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_place',
    word: 'place',
    phonetic: { us: '/pleɪs/', uk: '/pleɪs/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A particular position or location', translation: '地方，位置' },
      { partOfSpeech: 'v.', definition: 'Put in a particular position', translation: '放置' }
    ],
    examples: ['This is a beautiful place.', 'Place the book on the table.'],
    synonyms: ['location', 'spot', 'position'],
    antonyms: [],
    collocations: ['take place', 'in place'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_home',
    word: 'home',
    phonetic: { us: '/hoʊm/', uk: '/həʊm/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'The place where one lives', translation: '家，家乡' },
      { partOfSpeech: 'adv.', definition: 'To or at one\'s home', translation: '在家，回家' }
    ],
    examples: ['I am going home.', 'Home is where the heart is.'],
    synonyms: ['house', 'residence', 'dwelling'],
    antonyms: [],
    collocations: ['at home', 'go home'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_school',
    word: 'school',
    phonetic: { us: '/skuːl/', uk: '/skuːl/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'An institution for educating children', translation: '学校' }
    ],
    examples: ['I go to school every day.', 'She teaches at a school.'],
    synonyms: ['academy', 'institute', 'college'],
    antonyms: [],
    collocations: ['go to school', 'after school'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_life',
    word: 'life',
    phonetic: { us: '/laɪf/', uk: '/laɪf/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'The condition that distinguishes living things', translation: '生命，生活' }
    ],
    examples: ['Life is beautiful.', 'She has a happy life.'],
    synonyms: ['existence', 'being', 'living'],
    antonyms: ['death'],
    collocations: ['way of life', 'real life'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_house',
    word: 'house',
    phonetic: { us: '/haʊs/', uk: '/haʊs/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A building for human habitation', translation: '房子，住宅' }
    ],
    examples: ['They live in a big house.', 'Welcome to my house.'],
    synonyms: ['home', 'residence', 'dwelling'],
    antonyms: [],
    collocations: ['house price', 'my house'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_name',
    word: 'name',
    phonetic: { us: '/neɪm/', uk: '/neɪm/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A word by which a person or thing is known', translation: '名字，名称' },
      { partOfSpeech: 'v.', definition: 'Give a name to', translation: '命名' }
    ],
    examples: ['What is your name?', 'They named their son John.'],
    synonyms: ['title', 'designation', 'label'],
    antonyms: [],
    collocations: ['first name', 'last name'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_friend',
    word: 'friend',
    phonetic: { us: '/frend/', uk: '/frend/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A person with whom one has a bond of mutual affection', translation: '朋友' }
    ],
    examples: ['She is my best friend.', 'Make new friends but keep the old.'],
    synonyms: ['companion', 'buddy', 'pal'],
    antonyms: ['enemy', 'foe'],
    collocations: ['best friend', 'close friend'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_family',
    word: 'family',
    phonetic: { us: '/ˈfæməli/', uk: '/ˈfæməli/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A group consisting of parents and children', translation: '家庭，家人' }
    ],
    examples: ['I love my family.', 'Family is important.'],
    synonyms: ['household', 'relatives', 'kin'],
    antonyms: [],
    collocations: ['family member', 'big family'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_child',
    word: 'child',
    phonetic: { us: '/tʃaɪld/', uk: '/tʃaɪld/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A young human being', translation: '儿童，孩子' }
    ],
    examples: ['She has two children.', 'The child is playing.'],
    synonyms: ['kid', 'youngster', 'offspring'],
    antonyms: ['adult', 'parent'],
    collocations: ['only child', 'young child'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_woman',
    word: 'woman',
    phonetic: { us: '/ˈwʊmən/', uk: '/ˈwʊmən/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'An adult human female', translation: '女人，妇女' }
    ],
    examples: ['She is a strong woman.', 'The woman is a teacher.'],
    synonyms: ['lady', 'female'],
    antonyms: ['man', 'male'],
    collocations: ['young woman', 'business woman'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_man',
    word: 'man',
    phonetic: { us: '/mæn/', uk: '/mæn/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'An adult human male', translation: '男人，人类' }
    ],
    examples: ['He is a good man.', 'Man has walked on the moon.'],
    synonyms: ['male', 'gentleman', 'person'],
    antonyms: ['woman', 'female'],
    collocations: ['young man', 'old man'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_water',
    word: 'water',
    phonetic: { us: '/ˈwɔːtər/', uk: '/ˈwɔːtə(r)/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A colorless transparent liquid', translation: '水' },
      { partOfSpeech: 'v.', definition: 'Pour water over a plant', translation: '浇水' }
    ],
    examples: ['I need a glass of water.', 'Water the plants.'],
    synonyms: ['liquid', 'H2O'],
    antonyms: [],
    collocations: ['drinking water', 'hot water'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_food',
    word: 'food',
    phonetic: { us: '/fuːd/', uk: '/fuːd/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'Any nutritious substance that people eat', translation: '食物，食品' }
    ],
    examples: ['I love Chinese food.', 'Food is essential for life.'],
    synonyms: ['nourishment', 'sustenance', 'meal'],
    antonyms: [],
    collocations: ['fast food', 'healthy food'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_money',
    word: 'money',
    phonetic: { us: '/ˈmʌni/', uk: '/ˈmʌni/' },
    meanings: [
      { partOfSpeech: 'n.', definition: 'A current medium of exchange', translation: '钱，货币' }
    ],
    examples: ['Money cannot buy happiness.', 'I need more money.'],
    synonyms: ['cash', 'currency', 'funds'],
    antonyms: [],
    collocations: ['save money', 'spend money'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_happy',
    word: 'happy',
    phonetic: { us: '/ˈhæpi/', uk: '/ˈhæpi/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Feeling or showing pleasure', translation: '快乐的，幸福的' }
    ],
    examples: ['I am happy to see you.', 'She looks happy today.'],
    synonyms: ['joyful', 'cheerful', 'content'],
    antonyms: ['sad', 'unhappy', 'miserable'],
    collocations: ['happy birthday', 'feel happy'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_big',
    word: 'big',
    phonetic: { us: '/bɪɡ/', uk: '/bɪɡ/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Of considerable size or extent', translation: '大的，巨大的' }
    ],
    examples: ['This is a big house.', 'He has big dreams.'],
    synonyms: ['large', 'huge', 'enormous'],
    antonyms: ['small', 'tiny', 'little'],
    collocations: ['big deal', 'big city'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_small',
    word: 'small',
    phonetic: { us: '/smɔːl/', uk: '/smɔːl/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Of limited size', translation: '小的，少的' }
    ],
    examples: ['This is a small room.', 'She has a small dog.'],
    synonyms: ['little', 'tiny', 'minute'],
    antonyms: ['big', 'large', 'huge'],
    collocations: ['small business', 'small talk'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_new',
    word: 'new',
    phonetic: { us: '/nuː/', uk: '/njuː/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Not existing before', translation: '新的，新鲜的' }
    ],
    examples: ['I bought a new car.', 'Happy New Year!'],
    synonyms: ['fresh', 'novel', 'recent'],
    antonyms: ['old', 'ancient', 'used'],
    collocations: ['new year', 'brand new'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_old',
    word: 'old',
    phonetic: { us: '/oʊld/', uk: '/əʊld/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Having lived for a long time', translation: '老的，旧的' }
    ],
    examples: ['He is an old man.', 'This is an old book.'],
    synonyms: ['aged', 'ancient', 'elderly'],
    antonyms: ['new', 'young', 'modern'],
    collocations: ['old friend', 'how old'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_long',
    word: 'long',
    phonetic: { us: '/lɔːŋ/', uk: '/lɒŋ/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Measuring a great distance', translation: '长的，长久的' },
      { partOfSpeech: 'adv.', definition: 'For a long time', translation: '长久地' }
    ],
    examples: ['This is a long road.', 'How long will it take?'],
    synonyms: ['lengthy', 'extended', 'prolonged'],
    antonyms: ['short', 'brief'],
    collocations: ['long time', 'as long as'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_short',
    word: 'short',
    phonetic: { us: '/ʃɔːrt/', uk: '/ʃɔːt/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Measuring a small distance', translation: '短的，矮的' }
    ],
    examples: ['She has short hair.', 'It is a short story.'],
    synonyms: ['brief', 'concise', 'little'],
    antonyms: ['long', 'tall', 'extended'],
    collocations: ['in short', 'short time'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_high',
    word: 'high',
    phonetic: { us: '/haɪ/', uk: '/haɪ/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Of great vertical extent', translation: '高的，高级的' },
      { partOfSpeech: 'adv.', definition: 'At or to a considerable height', translation: '高地' }
    ],
    examples: ['This is a high mountain.', 'The price is too high.'],
    synonyms: ['tall', 'elevated', 'lofty'],
    antonyms: ['low', 'short'],
    collocations: ['high school', 'high quality'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
  {
    id: 'word_low',
    word: 'low',
    phonetic: { us: '/loʊ/', uk: '/ləʊ/' },
    meanings: [
      { partOfSpeech: 'adj.', definition: 'Of less than average height', translation: '低的，少的' }
    ],
    examples: ['The table is too low.', 'Prices are low today.'],
    synonyms: ['short', 'small', 'little'],
    antonyms: ['high', 'tall', 'elevated'],
    collocations: ['low price', 'low voice'],
    frequency: 'high',
    tags: ['基础词汇'],
  },
]
