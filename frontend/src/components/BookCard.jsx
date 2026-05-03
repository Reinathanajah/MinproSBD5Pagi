import React from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating.jsx'

export default function BookCard({ book }) {
  const navigate = useNavigate()

  const formatPrice = (p) =>
    p === 0 ? 'Rp 0,00' : `Rp ${p?.toLocaleString('id-ID')}`

  return (
    <div
      onClick={() => navigate(`/book/${book._id}`)}
      className="card-book glass-card flex flex-col h-full bg-white/60 backdrop-blur-md"
    >
      <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-700 ease-in-out"
          onError={e => { e.target.src = 'https://via.placeholder.com/200x267?text=No+Cover' }}
        />
        <div className="absolute top-3 left-3">
          {book.accessType === 'free'
            ? <span className="badge-free shadow-sm">GRATIS</span>
            : <span className="badge-sale shadow-sm">BERBAYAR</span>}
        </div>
        {book.shelf === 'hot' && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">HOT</div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest truncate">{book.author}</p>
        <h3 className="text-sm sm:text-base font-extrabold text-black line-clamp-2 leading-tight uppercase tracking-tighter">{book.title}</h3>

        {book.genre?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {book.genre.slice(0, 2).map(g => (
              <span key={g} className="bg-white/60 border border-white/50 text-gray-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">{g}</span>
            ))}
          </div>
        )}

        <div className="mt-1">
          <StarRating score={book.averageRating || book.weightedRating || 0} total={book.totalRatings || 0} />
        </div>

        <div className="mt-auto pt-3 flex justify-between items-end">
          {book.accessType === 'free'
            ? <p className="text-black font-extrabold text-sm sm:text-base uppercase tracking-tight">GRATIS</p>
            : <p className="text-black font-extrabold text-sm sm:text-base tracking-tight">{formatPrice(book.price)}</p>}
          <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-300 font-bold">&rarr;</span>
        </div>
      </div>
    </div>
  )
}
