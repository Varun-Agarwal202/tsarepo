import React from 'react'

const DetailsPage = ({ data }) => {
  if (!data) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
        <p className="text-gray-600 mb-2">{data.address}</p>
        <p className="mb-2">Phone: {data.contact_number || 'N/A'}</p>
        <p className="mb-2">Rating: {data.rating} ⭐ ({data.user_ratings_total} reviews)</p>
        {data.website && (
          <a 
            href={data.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Visit Website
          </a>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.photos?.slice(0, 8).map((photoUrl, index) => (
            <img 
              key={index}
              src={photoUrl}
              alt={`${data.name} photo ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Opening Hours</h2>
        {data.opening_hours?.weekday_text?.map((hours, index) => (
          <p key={index} className="mb-1">{hours}</p>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <div className="space-y-4">
          {data.reviews?.map((review, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm card">
              <div className="flex items-center mb-2">
                <p className="font-semibold">{review.author_name}</p>
                <p className="ml-4 text-yellow-500">{'⭐'.repeat(review.rating)}</p>
              </div>
              <p className="text-white-700">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Leave a Review</h2>
        <div className="border rounded-lg p-4 shadow-sm card">
          <form>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="reviewText">Your Review</label>
              <textarea
                id="reviewText"
                className="w-full p-2 border rounded-lg"
                rows="4"
                placeholder="Write your review here..."
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="rating">Rating</label>
              <select id="rating" className="w-full p-2 border rounded-lg">
                <option value="">Select rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Review
            </button>
          </form>
        </div>  
      </div>
    </div>
  )
}

export default DetailsPage;