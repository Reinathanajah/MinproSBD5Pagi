import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const DAY = 86400000

const daysAgo = (d) => new Date(Date.now() - d * DAY)

const pickRandom = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

const cover = (seed) => `https://picsum.photos/seed/${seed}/400/600`

const analyzeSentiment = (text) => {
  const lower = text.toLowerCase()
  const pos = ['bagus','keren','mantap','luar biasa','suka','recommend','good','great','excellent','amazing']
  const neg = ['buruk','jelek','payah','sampah','tidak suka','bad','terrible','awful','membosankan','gagal']
  let score = 0
  pos.forEach(w => { if (lower.includes(w)) score++ })
  neg.forEach(w => { if (lower.includes(w)) score-- })
  if (score > 0) return 'positive'
  if (score < 0) return 'negative'
  return 'neutral'
}

const computeWeightedRating = (R, v, C = 3, m = 10, ageDays = 5) => {
  const bayesian = (v / (v + m)) * R + (m / (v + m)) * C
  const timeFactor = 1 / (1 + ageDays / 30)
  return parseFloat((bayesian * (0.8 + 0.2 * timeFactor)).toFixed(4))
}

const userSchema = new mongoose.Schema({
  fullName: String, phone: String, email: { type: String, unique: true },
  password: String, age: Number, job: String, country: String,
  role: { type: String, default: 'user' },
  genrePreferences: { liked: { type: Array, default: undefined }, avoided: { type: Array, default: undefined } },
  myRecommendation: { bookId: mongoose.Schema.Types.ObjectId, reason: String, source: String, lockedAt: Date },
  myRatings:  { type: Array, default: undefined },
  myComments: { type: Array, default: undefined },
  viewedBooks:{ type: Array, default: undefined }
}, { timestamps: true })

const commentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, userName: String,
  text: String, sentiment: String,
  likes: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  createdAt: { type: Date, default: Date.now }
})

const bookSchema = new mongoose.Schema({
  title: String, author: String, releaseYear: Number, isbn: { type: String, sparse: true, unique: true },
  accessType: String, price: { type: Number, default: 0 },
  pageCount: Number, publisher: String, genre: [String], coverImage: String,
  status: { type: String, default: 'active' }, shelf: { type: String, default: 'cold' },
  totalViews: { type: Number, default: 0 }, uniqueViewers: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 }, totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 }, weightedRating: { type: Number, default: 0 },
  clickLogs: { type: Array, default: [] },
  embeddedComments: { type: [commentSchema], default: [] },
  embeddedRatings: { type: Array, default: [] },
  optionalAttributes: { type: Array, default: [] },
  registeredAt: Date
}, { timestamps: true })

bookSchema.index({ title: 'text', author: 'text' })

const bookByUsersSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, unique: true },
  books: { type: Array, default: [] }
}, { timestamps: true })

const User       = mongoose.model('User',       userSchema)
const Book       = mongoose.model('Book',       bookSchema)
const BookByUsers= mongoose.model('BookByUsers',bookByUsersSchema)

const GENRES = ['Fiksi','Non-Fiksi','Sains & Teknologi','Sejarah','Biografi','Bisnis & Ekonomi','Psikologi','Filsafat','Self-Help','Romance','Thriller','Petualangan','Fantasi','Kesehatan','Anak-anak']

const BOOK_DATA = [
  { title: 'Laskar Pelangi',          author: 'Andrea Hirata',      releaseYear: 2005, isbn: '978-979-1kls01-1', publisher: 'Bentang Pustaka',  genre: ['Fiksi','Petualangan'],   pageCount: 529 },
  { title: 'Bumi Manusia',            author: 'Pramoedya Ananta Toer', releaseYear: 1980, isbn: '978-979-1kls02-2', publisher: 'Hasta Mitra',    genre: ['Fiksi','Sejarah'],       pageCount: 535 },
  { title: 'Atomic Habits',           author: 'James Clear',         releaseYear: 2018, isbn: '978-979-1kls03-3', publisher: 'Avery',           genre: ['Self-Help','Psikologi'],  pageCount: 320 },
  { title: 'Sapiens',                 author: 'Yuval Noah Harari',   releaseYear: 2011, isbn: '978-979-1kls04-4', publisher: 'Harper',          genre: ['Sejarah','Non-Fiksi'],   pageCount: 443 },
  { title: 'The Alchemist',           author: 'Paulo Coelho',        releaseYear: 1988, isbn: '978-979-1kls05-5', publisher: 'HarperCollins',   genre: ['Fiksi','Petualangan'],   pageCount: 208 },
  { title: 'Rich Dad Poor Dad',       author: 'Robert Kiyosaki',     releaseYear: 1997, isbn: '978-979-1kls06-6', publisher: 'Warner Books',    genre: ['Bisnis & Ekonomi','Self-Help'], pageCount: 336 },
  { title: 'Thinking Fast and Slow',  author: 'Daniel Kahneman',     releaseYear: 2011, isbn: '978-979-1kls07-7', publisher: 'Farrar Straus',   genre: ['Psikologi','Non-Fiksi'],  pageCount: 499 },
  { title: 'Dune',                    author: 'Frank Herbert',        releaseYear: 1965, isbn: '978-979-1kls08-8', publisher: 'Chilton Books',   genre: ['Fiksi','Fantasi'],       pageCount: 688 },
  { title: 'The Psychology of Money', author: 'Morgan Housel',       releaseYear: 2020, isbn: '978-979-1kls09-9', publisher: 'Harriman House',  genre: ['Bisnis & Ekonomi','Psikologi'], pageCount: 256 },
  { title: 'Meditations',             author: 'Marcus Aurelius',     releaseYear: 180,  isbn: '978-979-1kls10-0', publisher: 'Penguin Classics', genre: ['Filsafat','Self-Help'],  pageCount: 254 },
  { title: 'Zero to One',             author: 'Peter Thiel',         releaseYear: 2014, isbn: '978-979-1kls11-1', publisher: 'Crown Business',  genre: ['Bisnis & Ekonomi'],      pageCount: 224 },
  { title: 'The Pragmatic Programmer',author: 'David Thomas',        releaseYear: 1999, isbn: '978-979-1kls12-2', publisher: 'Addison-Wesley',  genre: ['Sains & Teknologi'],     pageCount: 352 },
  { title: 'Sebuah Seni untuk Bersikap Bodo Amat', author: 'Mark Manson', releaseYear: 2016, isbn: '978-979-1kls13-3', publisher: 'HarperOne', genre: ['Self-Help','Psikologi'], pageCount: 224 },
  { title: 'Perahu Kertas',           author: 'Dewi Lestari',        releaseYear: 2009, isbn: '978-979-1kls14-4', publisher: 'Bentang',         genre: ['Fiksi','Romance'],       pageCount: 444 },
  { title: 'The 7 Habits',            author: 'Stephen Covey',       releaseYear: 1989, isbn: '978-979-1kls15-5', publisher: 'Free Press',      genre: ['Self-Help'],             pageCount: 432 },
  { title: 'Clean Code',              author: 'Robert C. Martin',    releaseYear: 2008, isbn: '978-979-1kls16-6', publisher: 'Prentice Hall',   genre: ['Sains & Teknologi'],     pageCount: 464 },
  { title: 'Homo Deus',               author: 'Yuval Noah Harari',   releaseYear: 2015, isbn: '978-979-1kls17-7', publisher: 'Harper',          genre: ['Sejarah','Non-Fiksi'],   pageCount: 464 },
  { title: 'The Lean Startup',        author: 'Eric Ries',           releaseYear: 2011, isbn: '978-979-1kls18-8', publisher: 'Crown Business',  genre: ['Bisnis & Ekonomi'],      pageCount: 336 },
  { title: 'Start With Why',          author: 'Simon Sinek',         releaseYear: 2009, isbn: '978-979-1kls19-9', publisher: 'Portfolio',       genre: ['Bisnis & Ekonomi','Self-Help'], pageCount: 256 },
  { title: 'Ikigai',                  author: 'Hector Garcia',       releaseYear: 2016, isbn: '978-979-1kls20-0', publisher: 'Penguin Life',    genre: ['Self-Help','Filsafat'],  pageCount: 208 },
  { title: 'The Great Gatsby',        author: 'F. Scott Fitzgerald', releaseYear: 1925, isbn: '978-979-1kls21-1', publisher: 'Scribner',        genre: ['Fiksi'],                 pageCount: 180 },
  { title: 'Design Patterns',         author: 'Gang of Four',        releaseYear: 1994, isbn: '978-979-1kls22-2', publisher: 'Addison-Wesley',  genre: ['Sains & Teknologi'],     pageCount: 395 },
  { title: 'The Subtle Art',          author: 'Mark Manson',         releaseYear: 2016, isbn: '978-979-1kls23-3', publisher: 'HarperOne',       genre: ['Self-Help'],             pageCount: 224 },
  { title: 'Man Search for Meaning',  author: 'Viktor Frankl',       releaseYear: 1946, isbn: '978-979-1kls24-4', publisher: 'Beacon Press',    genre: ['Psikologi','Biografi'],  pageCount: 184 },
  { title: 'Pulang',                  author: 'Tere Liye',           releaseYear: 2015, isbn: '978-979-1kls25-5', publisher: 'Republika',       genre: ['Fiksi','Petualangan'],   pageCount: 400 },
  { title: 'Good to Great',           author: 'Jim Collins',         releaseYear: 2001, isbn: '978-979-1kls26-6', publisher: 'HarperBusiness',  genre: ['Bisnis & Ekonomi'],      pageCount: 320 },
  { title: 'The Power of Now',        author: 'Eckhart Tolle',       releaseYear: 1997, isbn: '978-979-1kls27-7', publisher: 'New World Lib',   genre: ['Self-Help','Filsafat'],  pageCount: 229 },
  { title: 'Outliers',                author: 'Malcolm Gladwell',    releaseYear: 2008, isbn: '978-979-1kls28-8', publisher: 'Little Brown',    genre: ['Non-Fiksi','Psikologi'], pageCount: 309 },
  { title: 'Negeri 5 Menara',         author: 'Ahmad Fuadi',         releaseYear: 2009, isbn: '978-979-1kls29-9', publisher: 'Gramedia',        genre: ['Fiksi','Sejarah'],       pageCount: 423 },
  { title: 'Brief History of Time',   author: 'Stephen Hawking',     releaseYear: 1988, isbn: '978-979-1kls30-0', publisher: 'Bantam Books',    genre: ['Sains & Teknologi','Non-Fiksi'], pageCount: 212 }
]

const POS_COMMENTS = [
  'Buku ini benar-benar keren! Sangat menginspirasi.',
  'Luar biasa, saya sangat menyukai alur ceritanya.',
  'Bagus sekali, rekomendasi untuk semua orang!',
  'Keren banget, salah satu buku terbaik yang pernah saya baca.',
  'Mantap! Penulisnya sangat pandai menyampaikan ide.',
  'Amazing book, highly recommend to everyone.',
  'Sangat bagus dan membuka wawasan saya.',
  'Buku yang keren, tidak bisa berhenti membaca.',
  'Luar biasa sekali, recommended!',
  'Mantap jiwa! Buku wajib baca.'
]

const NEG_COMMENTS = [
  'Menurut saya buku ini cukup membosankan.',
  'Alurnya lambat dan jelek, kurang menarik.',
  'Buruk sekali, tidak sesuai ekspektasi saya.',
  'Payah, saya tidak suka gaya penulisannya.',
  'Jelek, pemborosan waktu membacanya.'
]

const NEUTRAL_COMMENTS = [
  'Buku yang cukup informatif.',
  'Alurnya standar, tidak terlalu menonjol.',
  'Isinya lumayan, cocok untuk pemula.',
  'Bisa dibaca, meski tidak terlalu berkesan.',
  'Cukup baik untuk referensi awal.'
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  await User.deleteMany({})
  await Book.deleteMany({})
  await BookByUsers.deleteMany({})
  console.log('Database cleared')

  const hashed      = await bcrypt.hash('Password123!', 10)
  const hashedAdmin = await bcrypt.hash('admin', 10)

  const users = await User.insertMany([
    { fullName: 'Administrator', phone: '000000000', email: 'admin@gmail.com', password: hashedAdmin, age: 30, job: 'Other', country: 'Indonesia', role: 'admin' },
    { fullName: 'Budi Santoso',       phone: '081234567890', email: 'budi@gmail.com',    password: hashed, age: 24, job: 'Software Engineer',  country: 'Indonesia' },
    { fullName: 'Siti Rahayu',        phone: '082345678901', email: 'siti@gmail.com',    password: hashed, age: 29, job: 'Guru / Pengajar',    country: 'Indonesia' },
    { fullName: 'Ahmad Fauzi',        phone: '083456789012', email: 'ahmad@gmail.com',   password: hashed, age: 35, job: 'Data Scientist',     country: 'Malaysia' },
    { fullName: 'Maria Santos',       phone: '084567890123', email: 'maria@gmail.com',   password: hashed, age: 28, job: 'Psikolog',           country: 'Philippines' },
    { fullName: 'James Wilson',       phone: '085678901234', email: 'james@gmail.com',   password: hashed, age: 32, job: 'Pengusaha / Entrepreneur', country: 'United States' }
  ])
  console.log(`${users.length} Users created`)

  const [admin, budi, siti, ahmad, maria, james] = users
  const regularUsers = [budi, siti, ahmad, maria, james]

  const now = Date.now()
  const books = []

  for (let i = 0; i < 30; i++) {
    const data       = BOOK_DATA[i]
    const isRecent   = i < 15
    const daysOffset = isRecent ? (1 + (i % 10)) : (20 + (i % 11))
    const regDate    = daysAgo(daysOffset)
    const accessType = i % 3 === 0 ? 'sale' : 'free'

    const optionals = []
    if (i < 5) {
      optionals.push({ key: 'ebook_url',  label: 'E-Book PDF',    type: 'ebook',  value: `https://fakeebooks.io/${data.isbn}.pdf` })
    }
    if (i >= 5 && i < 10) {
      optionals.push({ key: 'audio_url',  label: 'Audio Player',  type: 'audio',  value: `https://fakeaudio.io/${data.isbn}.mp3` })
    }

    books.push({
      ...data,
      coverImage: cover(data.isbn.replace(/[^a-z0-9]/gi, '')),
      accessType,
      price:      accessType === 'sale' ? 0 : 0,
      status:     'active',
      shelf:      'cold',
      optionalAttributes: optionals,
      registeredAt: regDate,
      createdAt:    regDate,
      updatedAt:    regDate,
      totalViews: 0, uniqueViewers: 0, totalComments: 0,
      totalRatings: 0, averageRating: 0, weightedRating: 0,
      clickLogs: [], embeddedComments: [], embeddedRatings: []
    })
  }

  const createdBooks = await Book.insertMany(books, { timestamps: false })
  console.log(`${createdBooks.length} Books created`)

  const recentBooks = createdBooks.filter((_, i) => i < 15)
  const oldBooks    = createdBooks.filter((_, i) => i >= 15)

  const hotCandidates       = recentBooks.slice(0, 4)
  const mostCommentedBooks  = recentBooks.slice(4, 7)
  const mostViewedBooks     = recentBooks.slice(7, 10)
  const coldAvoidBooks      = [...recentBooks.slice(10), ...oldBooks.slice(0, 6)]
  const sepiBooks           = oldBooks.slice(6)

  console.log('Injecting HOT SHELF interactions...')
  for (const book of hotCandidates) {
    const clicks = []
    for (const u of regularUsers) {
      for (let c = 0; c < 25; c++) {
        clicks.push({ userId: u._id.toString(), ip: `10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`, ts: daysAgo(Math.random() * 10) })
      }
    }
    const ratings = regularUsers.map(u => ({ userId: u._id, score: 4 + Math.round(Math.random()), createdAt: daysAgo(Math.random() * 10) }))
    const avgRating = ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    const wr = computeWeightedRating(avgRating, ratings.length, 3, 10, 5)

    const comments = POS_COMMENTS.slice(0, 5).map((text, idx) => ({
      userId:    regularUsers[idx % regularUsers.length]._id,
      userName:  regularUsers[idx % regularUsers.length].fullName,
      text, sentiment: 'positive', likes: [], createdAt: daysAgo(Math.random() * 8)
    }))

    await Book.findByIdAndUpdate(book._id, {
      clickLogs:        clicks.slice(0, 150),
      embeddedComments: comments,
      embeddedRatings:  ratings,
      totalViews:       clicks.length,
      uniqueViewers:    regularUsers.length,
      totalComments:    comments.length,
      totalRatings:     ratings.length,
      averageRating:    parseFloat(avgRating.toFixed(2)),
      weightedRating:   wr,
      shelf:            'hot'
    })
  }

  console.log('Injecting MOST COMMENTED interactions...')
  for (const book of mostCommentedBooks) {
    const comments = []
    for (let i = 0; i < 8; i++) {
      const u    = regularUsers[i % regularUsers.length]
      const text = i < 5 ? POS_COMMENTS[i] : NEUTRAL_COMMENTS[i - 5]
      comments.push({ userId: u._id, userName: u.fullName, text, sentiment: analyzeSentiment(text), likes: [], createdAt: daysAgo(Math.random() * 12) })
    }
    const clicks = regularUsers.flatMap(u => Array.from({ length: 5 }, () => ({ userId: u._id.toString(), ip: '10.1.1.1', ts: daysAgo(Math.random() * 10) })))
    await Book.findByIdAndUpdate(book._id, {
      clickLogs:        clicks,
      embeddedComments: comments,
      totalViews:       clicks.length,
      uniqueViewers:    regularUsers.length,
      totalComments:    comments.length
    })
  }

  console.log('Injecting MOST VIEWED interactions...')
  for (const book of mostViewedBooks) {
    const clicks = []
    for (const u of regularUsers) {
      for (let c = 0; c < 35; c++) {
        clicks.push({ userId: u._id.toString(), ip: `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`, ts: daysAgo(Math.random() * 13) })
      }
    }
    await Book.findByIdAndUpdate(book._id, {
      clickLogs:    clicks.slice(0, 150),
      totalViews:   clicks.length,
      uniqueViewers: regularUsers.length
    })
  }

  console.log('Injecting COLD / IS AVOID interactions...')
  for (let i = 0; i < coldAvoidBooks.length; i++) {
    const book    = coldAvoidBooks[i]
    const isAvoid = i < 4
    if (isAvoid) {
      const ratings = regularUsers.slice(0, 2).map(u => ({ userId: u._id, score: 1 + Math.round(Math.random()), createdAt: daysAgo(Math.random() * 25) }))
      const avgRating = ratings.reduce((s, r) => s + r.score, 0) / ratings.length
      const negComments = NEG_COMMENTS.slice(0, 2).map((text, idx) => ({
        userId: regularUsers[idx]._id, userName: regularUsers[idx].fullName,
        text, sentiment: 'negative', likes: [], createdAt: daysAgo(Math.random() * 20)
      }))
      await Book.findByIdAndUpdate(book._id, {
        embeddedRatings:  ratings,
        embeddedComments: negComments,
        totalRatings:     ratings.length,
        totalComments:    negComments.length,
        averageRating:    parseFloat(avgRating.toFixed(2)),
        weightedRating:   computeWeightedRating(avgRating, ratings.length, 3, 10, 22)
      })
    }
  }

  console.log('Injecting User genre preferences and myRatings/myComments...')

  const budiLikes   = hotCandidates.flatMap(b => b.genre)
  const sitiAvoids  = coldAvoidBooks.slice(0, 2).flatMap(b => b.genre)

  await User.findByIdAndUpdate(budi._id, {
    genrePreferences: {
      liked:   [...new Set(budiLikes)].map(g => ({ genre: g, score: 3 })),
      avoided: []
    },
    myRatings: hotCandidates.slice(0, 2).map(b => ({ bookId: b._id, score: 5, createdAt: daysAgo(2) })),
    myComments: hotCandidates.slice(0, 2).map(b => ({ bookId: b._id, text: 'Buku ini sangat bagus!', sentiment: 'positive', createdAt: daysAgo(2) })),
    viewedBooks: hotCandidates.map(b => ({ bookId: b._id, count: 3, lastViewed: daysAgo(1) })),
    myRecommendation: { bookId: hotCandidates[0]._id, reason: 'view on buku hot', source: 'view', lockedAt: daysAgo(5) }
  })

  await User.findByIdAndUpdate(siti._id, {
    genrePreferences: {
      liked:   [],
      avoided: [...new Set(sitiAvoids)].map(g => ({ genre: g, score: 2 }))
    },
    myRatings:  coldAvoidBooks.slice(0, 2).map(b => ({ bookId: b._id, score: 2, createdAt: daysAgo(15) })),
    myComments: coldAvoidBooks.slice(0, 1).map(b => ({ bookId: b._id, text: 'Buku ini jelek dan membosankan.', sentiment: 'negative', createdAt: daysAgo(15) })),
    viewedBooks: coldAvoidBooks.slice(0, 2).map(b => ({ bookId: b._id, count: 1, lastViewed: daysAgo(14) }))
  })

  console.log('Creating BookByUsers checkout records...')

  const checkoutMap = [
    { user: budi,  books: hotCandidates.slice(0, 3) },
    { user: siti,  books: hotCandidates.slice(1, 4) },
    { user: ahmad, books: mostCommentedBooks.slice(0, 2) },
    { user: maria, books: mostViewedBooks.slice(0, 2) },
    { user: james, books: [...hotCandidates.slice(0, 1), ...mostViewedBooks.slice(0, 2)] }
  ]

  for (const entry of checkoutMap) {
    await BookByUsers.create({
      userId: entry.user._id,
      books:  entry.books.map(b => ({ bookId: b._id, acquiredAt: daysAgo(Math.random() * 7), lastReadAt: daysAgo(Math.random() * 3) }))
    })
  }
  console.log(`${checkoutMap.length} BookByUsers records created`)

  const hotIds = new Set(hotCandidates.map(b => b._id.toString()))
  for (const b of createdBooks) {
    if (hotIds.has(b._id.toString())) {
      await Book.findByIdAndUpdate(b._id, { shelf: 'hot' })
    }
  }
  console.log('Shelf assignments finalized')

  console.log('\n==============================')
  console.log('SEEDING COMPLETE')
  console.log('==============================')
  console.log(`Users:        ${users.length}  (1 admin + 5 reguler)`)
  console.log(`Books:        ${createdBooks.length}  (15 recent < 14d, 15 old > 14d)`)
  console.log(`Hot Shelf:    ${hotCandidates.length} buku`)
  console.log(`Most Comment: ${mostCommentedBooks.length} buku`)
  console.log(`Most Viewed:  ${mostViewedBooks.length} buku`)
  console.log(`Cold/Avoid:   ${coldAvoidBooks.length} buku`)
  console.log(`BookByUsers:  ${checkoutMap.length} records`)
  console.log('==============================\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1) })
