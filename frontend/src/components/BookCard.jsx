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
      className="card-book flex flex-col"
    >
      <div className="relative overflow-hidden bg-[#F3F4F6] aspect-[3/4]">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = 'https://via.placeholder.com/200x267?text=No+Cover' }}
        />
        <div className="absolute top-2 left-2">
          {book.accessType === 'free'
            ? <span className="badge-free">Gratis</span>
            : <span className="badge-sale">Berbayar</span>}
        </div>
        {book.shelf === 'hot' && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">HOT</div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-[#6B7280] font-medium">{book.author}</p>
        <h3 className="text-sm font-bold text-[#374151] line-clamp-2 leading-snug">{book.title}</h3>

        {book.genre?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {book.genre.slice(0, 2).map(g => (
              <span key={g} className="bg-[#EBF5FF] text-[#0060AE] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">{g}</span>
            ))}
          </div>
        )}

        <StarRating score={book.averageRating || book.weightedRating || 0} total={book.totalRatings || 0} />

        <div className="mt-auto pt-1">
          {book.accessType === 'free'
            ? <p className="text-[#0060AE] font-extrabold text-sm">Gratis</p>
            : <p className="text-[#374151] font-extrabold text-sm">{formatPrice(book.price)}</p>}
        </div>
      </div>
    </div>
  )
}
