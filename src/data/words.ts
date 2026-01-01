import { Word, WordBook } from '../types';
import { dictionaryService } from '../services/dictionary';

// 预设词库配置（词汇通过外部API动态获取）
export const presetWordLists: Record<string, string[]> = {
  // 基础高频词 - 最常用500词
  basic: [
    'a', 'abandon', 'ability', 'able', 'about', 'above', 'abroad', 'absence', 'absolute', 'absorb',
    'abstract', 'abuse', 'academic', 'accept', 'access', 'accident', 'accompany', 'accomplish', 'according', 'account',
    'accurate', 'accuse', 'achieve', 'acid', 'acknowledge', 'acquire', 'across', 'act', 'action', 'active',
    'activity', 'actor', 'actual', 'actually', 'add', 'addition', 'additional', 'address', 'adequate', 'adjust',
    'administration', 'admire', 'admit', 'adopt', 'adult', 'advance', 'advantage', 'adventure', 'advertise', 'advice',
    'advise', 'affair', 'affect', 'afford', 'afraid', 'after', 'afternoon', 'again', 'against', 'age',
    'agency', 'agent', 'ago', 'agree', 'agreement', 'ahead', 'aid', 'aim', 'air', 'aircraft',
    'airline', 'airport', 'alarm', 'album', 'alcohol', 'alive', 'all', 'allow', 'almost', 'alone',
    'along', 'already', 'also', 'alter', 'alternative', 'although', 'always', 'amateur', 'amazing', 'ambition',
    'among', 'amount', 'analyse', 'analysis', 'ancient', 'and', 'anger', 'angle', 'angry', 'animal',
    'announce', 'annual', 'another', 'answer', 'anxiety', 'anxious', 'any', 'anybody', 'anymore', 'anyone',
    'anything', 'anyway', 'anywhere', 'apart', 'apartment', 'apologize', 'apparent', 'appeal', 'appear', 'appearance',
    'apple', 'application', 'apply', 'appoint', 'appreciate', 'approach', 'appropriate', 'approve', 'area', 'argue',
    'argument', 'arise', 'arm', 'army', 'around', 'arrange', 'arrest', 'arrive', 'art', 'article',
    'artist', 'as', 'ashamed', 'aside', 'ask', 'aspect', 'assess', 'asset', 'assign', 'assist',
    'associate', 'assume', 'at', 'atmosphere', 'attach', 'attack', 'attempt', 'attend', 'attention', 'attitude',
    'attract', 'audience', 'author', 'authority', 'automatic', 'available', 'average', 'avoid', 'award', 'aware',
    'away', 'baby', 'back', 'background', 'bad', 'badly', 'bag', 'balance', 'ball', 'ban',
    'band', 'bank', 'bar', 'barrier', 'base', 'basic', 'basis', 'basket', 'bath', 'bathroom',
    'battle', 'be', 'beach', 'bear', 'beat', 'beautiful', 'beauty', 'because', 'become', 'bed',
    'bedroom', 'beer', 'before', 'begin', 'beginning', 'behavior', 'behind', 'being', 'belief', 'believe',
    'bell', 'belong', 'below', 'belt', 'bench', 'bend', 'beneath', 'benefit', 'beside', 'besides',
    'best', 'better', 'between', 'beyond', 'big', 'bill', 'bird', 'birth', 'bit', 'black',
    'blame', 'blind', 'block', 'blood', 'blow', 'blue', 'board', 'boat', 'body', 'book',
    'border', 'born', 'borrow', 'boss', 'both', 'bother', 'bottle', 'bottom', 'box', 'boy',
    'brain', 'branch', 'brand', 'brave', 'bread', 'break', 'breakfast', 'breath', 'breathe', 'bridge',
    'brief', 'bright', 'bring', 'broad', 'brother', 'brown', 'brush', 'budget', 'build', 'building',
    'burn', 'bus', 'business', 'busy', 'but', 'buy', 'by', 'cabinet', 'cake', 'call',
    'calm', 'camera', 'camp', 'campaign', 'can', 'cancel', 'cancer', 'candidate', 'cap', 'capable',
    'capacity', 'capital', 'captain', 'capture', 'car', 'card', 'care', 'career', 'careful', 'carry',
    'case', 'cash', 'cat', 'catch', 'category', 'cause', 'celebrate', 'cell', 'center', 'central',
    'century', 'certain', 'certainly', 'chain', 'chair', 'chairman', 'challenge', 'champion', 'chance', 'change',
    'channel', 'chapter', 'character', 'charge', 'charity', 'chart', 'cheap', 'check', 'cheese', 'chemical',
    'chest', 'chicken', 'chief', 'child', 'childhood', 'choice', 'choose', 'church', 'circle', 'citizen',
    'city', 'civil', 'claim', 'class', 'classic', 'classroom', 'clean', 'clear', 'clearly', 'client',
    'climate', 'climb', 'clock', 'close', 'clothes', 'cloud', 'club', 'coach', 'coast', 'coat',
    'code', 'coffee', 'coin', 'cold', 'collect', 'collection', 'college', 'color', 'column', 'combine',
    'come', 'comfort', 'comfortable', 'command', 'comment', 'commercial', 'commission', 'commit', 'committee', 'common',
    'communicate', 'communication', 'community', 'company', 'compare', 'competition', 'complete', 'complex', 'computer', 'concentrate',
    'concept', 'concern', 'condition', 'conduct', 'conference', 'confidence', 'confirm', 'conflict', 'connect', 'consider',
    'consist', 'constant', 'construct', 'consumer', 'contact', 'contain', 'content', 'context', 'continue', 'contract',
    'contribute', 'control', 'conversation', 'cook', 'cool', 'copy', 'corner', 'correct', 'cost', 'could',
    'count', 'country', 'couple', 'courage', 'course', 'court', 'cover', 'create', 'credit', 'crime',
    'crisis', 'critical', 'cross', 'crowd', 'cultural', 'culture', 'cup', 'current', 'customer', 'cut',
  ],
  
  // CET-4 核心词汇 - 约500词
  cet4: [
    'daily', 'damage', 'dance', 'danger', 'dangerous', 'dare', 'dark', 'data', 'date', 'daughter',
    'day', 'dead', 'deal', 'dear', 'death', 'debate', 'debt', 'decade', 'decide', 'decision',
    'declare', 'decline', 'deep', 'deeply', 'defeat', 'defend', 'defense', 'define', 'definite', 'definitely',
    'definition', 'degree', 'delay', 'deliver', 'demand', 'democracy', 'democratic', 'demonstrate', 'deny', 'department',
    'depend', 'dependent', 'describe', 'description', 'desert', 'deserve', 'design', 'desire', 'desk', 'despite',
    'destroy', 'detail', 'detailed', 'determine', 'develop', 'development', 'device', 'die', 'diet', 'difference',
    'different', 'difficult', 'difficulty', 'digital', 'dinner', 'direct', 'direction', 'directly', 'director', 'dirty',
    'disappear', 'disaster', 'discipline', 'discover', 'discovery', 'discuss', 'discussion', 'disease', 'dish', 'display',
    'distance', 'distinct', 'distinguish', 'distribute', 'district', 'disturb', 'divide', 'division', 'doctor', 'document',
    'dog', 'dollar', 'domestic', 'dominant', 'door', 'double', 'doubt', 'down', 'dozen', 'draft',
    'drag', 'drama', 'dramatic', 'draw', 'dream', 'dress', 'drink', 'drive', 'driver', 'drop',
    'drug', 'dry', 'due', 'during', 'dust', 'duty', 'each', 'eager', 'ear', 'early',
    'earn', 'earth', 'ease', 'easily', 'east', 'eastern', 'easy', 'eat', 'economic', 'economy',
    'edge', 'edition', 'editor', 'educate', 'education', 'educational', 'effect', 'effective', 'efficiency', 'efficient',
    'effort', 'egg', 'eight', 'either', 'elderly', 'elect', 'election', 'electric', 'electricity', 'electronic',
    'element', 'eliminate', 'else', 'elsewhere', 'emerge', 'emergency', 'emotion', 'emotional', 'emphasis', 'emphasize',
    'employ', 'employee', 'employer', 'employment', 'empty', 'enable', 'encounter', 'encourage', 'end', 'enemy',
    'energy', 'engage', 'engine', 'engineer', 'engineering', 'enjoy', 'enormous', 'enough', 'ensure', 'enter',
    'enterprise', 'entire', 'entirely', 'entrance', 'entry', 'environment', 'environmental', 'equal', 'equally', 'equipment',
    'era', 'error', 'escape', 'especially', 'essay', 'essential', 'establish', 'establishment', 'estate', 'estimate',
    'ethnic', 'evaluate', 'even', 'evening', 'event', 'eventually', 'ever', 'every', 'everybody', 'everyone',
    'everything', 'everywhere', 'evidence', 'evil', 'evolution', 'exact', 'exactly', 'examination', 'examine', 'example',
    'excellent', 'except', 'exception', 'exchange', 'excited', 'excitement', 'exciting', 'excuse', 'execute', 'executive',
    'exercise', 'exhibit', 'exhibition', 'exist', 'existence', 'existing', 'expand', 'expansion', 'expect', 'expectation',
    'expense', 'expensive', 'experience', 'experiment', 'expert', 'explain', 'explanation', 'explore', 'export', 'expose',
    'exposure', 'express', 'expression', 'extend', 'extension', 'extensive', 'extent', 'external', 'extra', 'extraordinary',
    'extreme', 'extremely', 'eye', 'face', 'facility', 'fact', 'factor', 'factory', 'fail', 'failure',
    'fair', 'fairly', 'faith', 'fall', 'false', 'familiar', 'family', 'famous', 'fan', 'fancy',
    'far', 'farm', 'farmer', 'fashion', 'fast', 'fat', 'fate', 'father', 'fault', 'favor',
    'favorite', 'fear', 'feature', 'federal', 'fee', 'feed', 'feel', 'feeling', 'fellow', 'female',
    'fence', 'festival', 'few', 'field', 'fifteen', 'fifth', 'fifty', 'fight', 'figure', 'file',
    'fill', 'film', 'final', 'finally', 'finance', 'financial', 'find', 'fine', 'finger', 'finish',
    'fire', 'firm', 'first', 'fish', 'fit', 'five', 'fix', 'flag', 'flat', 'flight',
    'float', 'floor', 'flow', 'flower', 'fly', 'focus', 'folk', 'follow', 'following', 'food',
    'foot', 'football', 'for', 'force', 'foreign', 'forest', 'forever', 'forget', 'forgive', 'form',
    'formal', 'format', 'former', 'formula', 'forth', 'fortune', 'forward', 'found', 'foundation', 'four',
    'fourth', 'frame', 'framework', 'free', 'freedom', 'frequency', 'frequent', 'frequently', 'fresh', 'friend',
    'friendly', 'friendship', 'from', 'front', 'fruit', 'fuel', 'full', 'fully', 'fun', 'function',
    'fund', 'fundamental', 'funny', 'furniture', 'further', 'furthermore', 'future', 'gain', 'game', 'gap',
    'garden', 'gas', 'gate', 'gather', 'gay', 'general', 'generally', 'generate', 'generation', 'generous',
  ],
  
  // CET-6 进阶词汇 - 约500词
  cet6: [
    'genuine', 'gesture', 'get', 'ghost', 'gift', 'girl', 'give', 'glad', 'glance', 'glass',
    'global', 'glory', 'go', 'goal', 'god', 'gold', 'golden', 'good', 'goods', 'govern',
    'government', 'governor', 'grab', 'grace', 'grade', 'gradually', 'graduate', 'grain', 'grand', 'grandfather',
    'grandmother', 'grant', 'graph', 'grasp', 'grass', 'grateful', 'gray', 'great', 'greatly', 'green',
    'greet', 'grey', 'ground', 'group', 'grow', 'growth', 'guarantee', 'guard', 'guess', 'guest',
    'guide', 'guideline', 'guilty', 'gun', 'guy', 'habit', 'hair', 'half', 'hall', 'hand',
    'handle', 'hang', 'happen', 'happy', 'hard', 'hardly', 'harm', 'harmful', 'harmony', 'hat',
    'hate', 'have', 'he', 'head', 'headline', 'headquarters', 'health', 'healthy', 'hear', 'hearing',
    'heart', 'heat', 'heaven', 'heavy', 'height', 'hell', 'hello', 'help', 'helpful', 'hence',
    'her', 'here', 'heritage', 'hero', 'herself', 'hesitate', 'hide', 'high', 'highlight', 'highly',
    'highway', 'hill', 'him', 'himself', 'hire', 'his', 'historian', 'historical', 'history', 'hit',
    'hold', 'holder', 'hole', 'holiday', 'holy', 'home', 'homeless', 'honest', 'honor', 'hope',
    'hopefully', 'horizon', 'horror', 'horse', 'hospital', 'host', 'hot', 'hotel', 'hour', 'house',
    'household', 'housing', 'how', 'however', 'huge', 'human', 'humble', 'humor', 'hundred', 'hungry',
    'hunt', 'hunter', 'hurt', 'husband', 'hypothesis', 'ice', 'idea', 'ideal', 'identical', 'identify',
    'identity', 'ideology', 'if', 'ignore', 'ill', 'illegal', 'illness', 'illustrate', 'image', 'imagination',
    'imagine', 'immediate', 'immediately', 'immigrant', 'immigration', 'impact', 'implement', 'implication', 'imply', 'import',
    'importance', 'important', 'impose', 'impossible', 'impress', 'impression', 'impressive', 'improve', 'improvement', 'in',
    'incentive', 'incident', 'include', 'including', 'income', 'incorporate', 'increase', 'increasingly', 'incredible', 'indeed',
    'independence', 'independent', 'index', 'indicate', 'indication', 'individual', 'industrial', 'industry', 'inevitable', 'infant',
    'inflation', 'influence', 'inform', 'information', 'ingredient', 'initial', 'initially', 'initiative', 'injury', 'inner',
    'innocent', 'innovation', 'input', 'inquiry', 'insect', 'inside', 'insight', 'insist', 'inspect', 'inspector',
    'inspire', 'install', 'instance', 'instant', 'instead', 'institute', 'institution', 'instruction', 'instrument', 'insurance',
    'intellectual', 'intelligence', 'intelligent', 'intend', 'intense', 'intensity', 'intention', 'interaction', 'interest', 'interested',
    'interesting', 'internal', 'international', 'internet', 'interpret', 'interpretation', 'intervention', 'interview', 'into', 'introduce',
    'introduction', 'invest', 'investigate', 'investigation', 'investigator', 'investment', 'investor', 'invite', 'involve', 'involved',
    'involvement', 'iron', 'island', 'isolate', 'issue', 'it', 'item', 'its', 'itself', 'jacket',
    'jail', 'jet', 'job', 'join', 'joint', 'joke', 'journal', 'journalist', 'journey', 'joy',
    'judge', 'judgment', 'juice', 'jump', 'junior', 'jury', 'just', 'justice', 'justify', 'keen',
    'keep', 'key', 'kick', 'kid', 'kill', 'kind', 'king', 'kiss', 'kitchen', 'knee',
    'knife', 'knock', 'know', 'knowledge', 'label', 'labor', 'laboratory', 'lack', 'lady', 'lake',
    'land', 'landscape', 'language', 'lap', 'large', 'largely', 'last', 'late', 'later', 'latest',
    'latter', 'laugh', 'launch', 'law', 'lawn', 'lawsuit', 'lawyer', 'lay', 'layer', 'lead',
    'leader', 'leadership', 'leading', 'leaf', 'league', 'lean', 'learn', 'learning', 'least', 'leather',
    'leave', 'lecture', 'left', 'leg', 'legacy', 'legal', 'legend', 'legislation', 'legitimate', 'lend',
    'length', 'less', 'lesson', 'let', 'letter', 'level', 'liberal', 'liberty', 'library', 'license',
    'lie', 'life', 'lifestyle', 'lifetime', 'lift', 'light', 'like', 'likely', 'limit', 'limitation',
    'limited', 'line', 'link', 'lip', 'list', 'listen', 'literary', 'literature', 'little', 'live',
    'living', 'load', 'loan', 'local', 'locate', 'location', 'lock', 'log', 'logic', 'logical',
    'lonely', 'long', 'look', 'loose', 'lord', 'lose', 'loss', 'lost', 'lot', 'loud',
  ],
  
  // 雅思核心词汇 - 约500词
  ielts: [
    'love', 'lovely', 'lover', 'low', 'lower', 'luck', 'lucky', 'lunch', 'lung', 'machine',
    'mad', 'magazine', 'magic', 'mail', 'main', 'mainly', 'mainstream', 'maintain', 'maintenance', 'major',
    'majority', 'make', 'male', 'mall', 'man', 'manage', 'management', 'manager', 'manner', 'manufacturer',
    'manufacturing', 'many', 'map', 'march', 'margin', 'mark', 'market', 'marketing', 'marriage', 'married',
    'marry', 'mask', 'mass', 'massive', 'master', 'match', 'material', 'math', 'matter', 'maximum',
    'may', 'maybe', 'mayor', 'me', 'meal', 'mean', 'meaning', 'meaningful', 'means', 'meanwhile',
    'measure', 'measurement', 'meat', 'mechanism', 'media', 'medical', 'medicine', 'medium', 'meet', 'meeting',
    'member', 'membership', 'memory', 'mental', 'mention', 'menu', 'merely', 'merge', 'merit', 'mess',
    'message', 'metal', 'method', 'middle', 'might', 'migration', 'mild', 'mile', 'military', 'milk',
    'million', 'mind', 'mine', 'mineral', 'minimum', 'minister', 'ministry', 'minor', 'minority', 'minute',
    'mirror', 'miss', 'missile', 'missing', 'mission', 'mistake', 'mix', 'mixture', 'mobile', 'mode',
    'model', 'moderate', 'modern', 'modest', 'modify', 'mom', 'moment', 'money', 'monitor', 'month',
    'mood', 'moon', 'moral', 'more', 'moreover', 'morning', 'mortgage', 'most', 'mostly', 'mother',
    'motion', 'motivate', 'motivation', 'motor', 'mount', 'mountain', 'mouse', 'mouth', 'move', 'movement',
    'movie', 'much', 'multiple', 'murder', 'muscle', 'museum', 'music', 'musical', 'musician', 'must',
    'mutual', 'my', 'myself', 'mystery', 'myth', 'naked', 'name', 'narrative', 'narrow', 'nation',
    'national', 'native', 'natural', 'naturally', 'nature', 'near', 'nearby', 'nearly', 'necessarily', 'necessary',
    'neck', 'need', 'negative', 'negotiate', 'negotiation', 'neighbor', 'neighborhood', 'neither', 'nerve', 'nervous',
    'net', 'network', 'never', 'nevertheless', 'new', 'newly', 'news', 'newspaper', 'next', 'nice',
    'night', 'nine', 'no', 'nobody', 'nod', 'noise', 'none', 'nonetheless', 'nor', 'normal',
    'normally', 'north', 'northern', 'nose', 'not', 'note', 'nothing', 'notice', 'notion', 'novel',
    'now', 'nowhere', 'nuclear', 'number', 'numerous', 'nurse', 'nut', 'object', 'objective', 'obligation',
    'observation', 'observe', 'observer', 'obtain', 'obvious', 'obviously', 'occasion', 'occasional', 'occasionally', 'occupation',
    'occupy', 'occur', 'ocean', 'odd', 'odds', 'of', 'off', 'offense', 'offensive', 'offer',
    'office', 'officer', 'official', 'often', 'oil', 'okay', 'old', 'Olympic', 'on', 'once',
    'one', 'ongoing', 'onion', 'online', 'only', 'onto', 'open', 'opening', 'operate', 'operation',
    'operator', 'opinion', 'opponent', 'opportunity', 'oppose', 'opposite', 'opposition', 'option', 'or', 'orange',
    'order', 'ordinary', 'organ', 'organic', 'organization', 'organize', 'orientation', 'origin', 'original', 'originally',
    'other', 'otherwise', 'ought', 'our', 'ourselves', 'out', 'outcome', 'outdoor', 'outer', 'outline',
    'output', 'outside', 'outstanding', 'over', 'overall', 'overcome', 'overlook', 'overnight', 'overseas', 'overwhelming',
    'owe', 'own', 'owner', 'ownership', 'pace', 'pack', 'package', 'page', 'pain', 'painful',
    'paint', 'painter', 'painting', 'pair', 'pale', 'palm', 'pan', 'panel', 'panic', 'paper',
    'paragraph', 'parallel', 'parent', 'park', 'parking', 'parliament', 'part', 'partial', 'partially', 'participant',
    'participate', 'participation', 'particular', 'particularly', 'partly', 'partner', 'partnership', 'party', 'pass', 'passage',
    'passenger', 'passion', 'passive', 'past', 'patch', 'path', 'patience', 'patient', 'pattern', 'pause',
    'pay', 'payment', 'peace', 'peaceful', 'peak', 'peer', 'penalty', 'pension', 'people', 'pepper',
    'per', 'perceive', 'percent', 'percentage', 'perception', 'perfect', 'perfectly', 'perform', 'performance', 'perhaps',
    'period', 'permanent', 'permission', 'permit', 'persist', 'person', 'personal', 'personality', 'personally', 'personnel',
    'perspective', 'persuade', 'phase', 'phenomenon', 'philosophy', 'phone', 'photo', 'photograph', 'photographer', 'phrase',
    'physical', 'physician', 'piano', 'pick', 'picture', 'pie', 'piece', 'pile', 'pilot', 'pin',
  ],
  
  // 托福核心词汇 - 约500词
  toefl: [
    'pink', 'pipe', 'pitch', 'place', 'plain', 'plan', 'plane', 'planet', 'planning', 'plant',
    'plastic', 'plate', 'platform', 'play', 'player', 'pleasant', 'please', 'pleasure', 'plenty', 'plot',
    'plus', 'pocket', 'poem', 'poet', 'poetry', 'point', 'pole', 'police', 'policy', 'political',
    'politician', 'politics', 'poll', 'pollution', 'pool', 'poor', 'pop', 'popular', 'popularity', 'population',
    'port', 'portion', 'portrait', 'pose', 'position', 'positive', 'possess', 'possession', 'possibility', 'possible',
    'possibly', 'post', 'pot', 'potato', 'potential', 'potentially', 'pound', 'pour', 'poverty', 'powder',
    'power', 'powerful', 'practical', 'practice', 'praise', 'pray', 'prayer', 'precisely', 'predict', 'prediction',
    'prefer', 'preference', 'pregnant', 'premise', 'premium', 'preparation', 'prepare', 'presence', 'present', 'presentation',
    'preserve', 'president', 'presidential', 'press', 'pressure', 'pretend', 'pretty', 'prevent', 'previous', 'previously',
    'price', 'pride', 'priest', 'primarily', 'primary', 'prime', 'principle', 'print', 'prior', 'priority',
    'prison', 'prisoner', 'privacy', 'private', 'prize', 'probably', 'problem', 'procedure', 'proceed', 'process',
    'produce', 'producer', 'product', 'production', 'profession', 'professional', 'professor', 'profile', 'profit', 'program',
    'progress', 'project', 'prominent', 'promise', 'promote', 'promotion', 'prompt', 'proof', 'proper', 'properly',
    'property', 'proportion', 'proposal', 'propose', 'proposed', 'prosecutor', 'prospect', 'protect', 'protection', 'protein',
    'protest', 'proud', 'prove', 'provide', 'provider', 'province', 'provision', 'psychological', 'psychology', 'public',
    'publication', 'publicity', 'publish', 'pull', 'punishment', 'purchase', 'pure', 'purple', 'purpose', 'pursue',
    'pursuit', 'push', 'put', 'qualify', 'quality', 'quantity', 'quarter', 'queen', 'question', 'quick',
    'quickly', 'quiet', 'quietly', 'quit', 'quite', 'quote', 'race', 'racial', 'radical', 'radio',
    'rail', 'rain', 'raise', 'range', 'rank', 'rapid', 'rapidly', 'rare', 'rarely', 'rate',
    'rather', 'rating', 'ratio', 'raw', 'reach', 'react', 'reaction', 'read', 'reader', 'reading',
    'ready', 'real', 'realistic', 'reality', 'realize', 'really', 'reason', 'reasonable', 'reasonably', 'recall',
    'receive', 'recent', 'recently', 'recipe', 'recognition', 'recognize', 'recommend', 'recommendation', 'record', 'recording',
    'recover', 'recovery', 'recruit', 'red', 'reduce', 'reduction', 'refer', 'reference', 'reflect', 'reflection',
    'reform', 'refugee', 'refuse', 'regard', 'regarding', 'regardless', 'regime', 'region', 'regional', 'register',
    'regular', 'regularly', 'regulate', 'regulation', 'reject', 'relate', 'related', 'relation', 'relationship', 'relative',
    'relatively', 'relax', 'release', 'relevant', 'relief', 'religion', 'religious', 'rely', 'remain', 'remaining',
    'remark', 'remarkable', 'remember', 'remind', 'remote', 'remove', 'repeat', 'repeatedly', 'replace', 'replacement',
    'reply', 'report', 'reporter', 'represent', 'representation', 'representative', 'republic', 'republican', 'reputation', 'request',
    'require', 'requirement', 'rescue', 'research', 'researcher', 'reservation', 'reserve', 'resident', 'residential', 'resign',
    'resist', 'resistance', 'resolution', 'resolve', 'resort', 'resource', 'respect', 'respond', 'respondent', 'response',
    'responsibility', 'responsible', 'rest', 'restaurant', 'restore', 'restriction', 'result', 'retain', 'retire', 'retirement',
    'return', 'reveal', 'revenue', 'reverse', 'review', 'revolution', 'reward', 'rhetoric', 'rhythm', 'rice',
    'rich', 'rid', 'ride', 'ridiculous', 'rifle', 'right', 'ring', 'rise', 'rising', 'risk',
    'ritual', 'rival', 'river', 'road', 'robot', 'rock', 'role', 'roll', 'romantic', 'roof',
    'room', 'root', 'rope', 'rose', 'rough', 'roughly', 'round', 'route', 'routine', 'row',
    'royal', 'rub', 'rubber', 'ruin', 'rule', 'ruling', 'run', 'runner', 'running', 'rural',
    'rush', 'Russian', 'sacred', 'sacrifice', 'sad', 'safe', 'safety', 'sake', 'salad', 'salary',
    'sale', 'salt', 'same', 'sample', 'sanction', 'sand', 'satellite', 'satisfaction', 'satisfy', 'Saturday',
    'sauce', 'save', 'saving', 'say', 'scale', 'scandal', 'scared', 'scenario', 'scene', 'schedule',
    'scheme', 'scholar', 'scholarship', 'school', 'science', 'scientific', 'scientist', 'scope', 'score', 'screen',
  ],
};

// 预设词库配置
export const builtinWordBooks: Omit<WordBook, 'wordIds'>[] = [
  {
    id: 'book_basic',
    name: '基础词汇',
    description: `适合入门学习的高频词汇（${presetWordLists.basic.length}词）`,
    category: 'builtin',
    wordCount: presetWordLists.basic.length,
    icon: '📚',
    color: '#3B82F6',
  },
  {
    id: 'book_cet4',
    name: 'CET-4 核心词汇',
    description: `大学英语四级考试必备词汇（${presetWordLists.cet4.length}词）`,
    category: 'builtin',
    wordCount: presetWordLists.cet4.length,
    icon: '🎓',
    color: '#10B981',
  },
  {
    id: 'book_cet6',
    name: 'CET-6 进阶词汇',
    description: `大学英语六级考试核心词汇（${presetWordLists.cet6.length}词）`,
    category: 'builtin',
    wordCount: presetWordLists.cet6.length,
    icon: '🏆',
    color: '#8B5CF6',
  },
  {
    id: 'book_ielts',
    name: '雅思词汇',
    description: `IELTS 考试高频核心词汇（${presetWordLists.ielts.length}词）`,
    category: 'builtin',
    wordCount: presetWordLists.ielts.length,
    icon: '🌍',
    color: '#F59E0B',
  },
  {
    id: 'book_toefl',
    name: '托福词汇',
    description: `TOEFL 考试必备词汇（${presetWordLists.toefl.length}词）`,
    category: 'builtin',
    wordCount: presetWordLists.toefl.length,
    icon: '🇺🇸',
    color: '#EF4444',
  },
];

// 从外部API获取单词详情
export async function fetchWordDetails(word: string): Promise<Word | null> {
  return dictionaryService.fetchWord(word);
}

// 批量获取单词详情
export async function fetchWordsDetails(words: string[]): Promise<Word[]> {
  return dictionaryService.fetchWords(words);
}

// 初始化指定词库的单词
export async function initializeWordBook(
  bookId: string,
  wordStorage: { save: (word: Word) => Promise<void>; getAll: () => Promise<Word[]> },
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const listKey = bookId.replace('book_', '');
  const wordList = presetWordLists[listKey];
  
  if (!wordList) {
    console.error(`词库 ${bookId} 不存在`);
    return [];
  }

  const existingWords = await wordStorage.getAll();
  const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));
  const wordIds: string[] = [];
  
  // 过滤出需要获取的新单词
  const newWords = wordList.filter(w => !existingWordSet.has(w.toLowerCase()));
  const total = newWords.length;
  
  for (let i = 0; i < newWords.length; i++) {
    const word = newWords[i];
    try {
      const wordData = await dictionaryService.fetchWord(word);
      if (wordData) {
        await wordStorage.save(wordData);
        wordIds.push(wordData.id);
      }
      onProgress?.(i + 1, total);
      // 添加延迟避免API限流
      if (i < newWords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`获取单词 ${word} 失败:`, error);
    }
  }
  
  // 添加已存在的单词ID
  for (const word of wordList) {
    const existing = existingWords.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (existing && !wordIds.includes(existing.id)) {
      wordIds.push(existing.id);
    }
  }
  
  return wordIds;
}

// 初始化内置数据（更新词库配置，单词按需加载）
export async function initializeBuiltinData(
  _wordStorage: { save: (word: Word) => Promise<void>; getAll: () => Promise<Word[]> },
  bookStorage: { save: (book: WordBook) => Promise<void>; getAll: () => Promise<WordBook[]> }
) {
  // _wordStorage 保留以兼容接口，单词将按需从API加载
  const existingBooks = await bookStorage.getAll();
  const existingBookMap = new Map(existingBooks.map(b => [b.id, b]));
  
  // 更新或创建内置词库配置
  for (const bookConfig of builtinWordBooks) {
    const existingBook = existingBookMap.get(bookConfig.id);
    const book: WordBook = {
      ...bookConfig,
      // 保留已下载的单词ID，否则设为空数组
      wordIds: existingBook?.wordIds || [],
    };
    // 如果已有单词，更新wordCount为实际数量
    if (book.wordIds.length > 0) {
      book.wordCount = book.wordIds.length;
    }
    await bookStorage.save(book);
  }
  console.log(`已更新 ${builtinWordBooks.length} 个预设词库配置`);
}

// 获取单词的增强信息（用于学习时）
export async function enhanceWord(word: Word): Promise<Word> {
  if (word.phonetic?.us || word.meanings.length > 1) {
    return word; // 已有详细信息，无需增强
  }
  
  try {
    const enhanced = await dictionaryService.fetchWord(word.word);
    if (enhanced) {
      return {
        ...word,
        phonetic: enhanced.phonetic.us ? enhanced.phonetic : word.phonetic,
        meanings: enhanced.meanings.length > 0 ? enhanced.meanings : word.meanings,
        examples: enhanced.examples.length > 0 ? enhanced.examples : word.examples,
        synonyms: enhanced.synonyms.length > 0 ? enhanced.synonyms : word.synonyms,
        antonyms: enhanced.antonyms.length > 0 ? enhanced.antonyms : word.antonyms,
      };
    }
  } catch (error) {
    console.error(`增强单词信息失败: ${word.word}`, error);
  }
  return word;
}
