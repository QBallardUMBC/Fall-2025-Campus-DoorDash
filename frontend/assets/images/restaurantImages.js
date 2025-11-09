// frontend/assets/images/restaurantImages.js

export const restaurantImages = {
  // Crispy fried chicken tenders and burgers
  "Absurd Bird & Burgers": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
  
  // Chick-fil-A - actual chicken sandwich close-up
  "Chick-fil-A": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Chick-fil-A_Logo.svg/1200px-Chick-fil-A_Logo.svg.png", 
  // BBQ and Southern comfort food
  "Copperhead Jacks": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  
  // Dunkin' branded donuts and coffee
  "Dunkin": "https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=800&q=80",
  
  // Fresh bagels with cream cheese and spreads
  "Einstein Brother's Bagels": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
  
  // Halal chicken and rice platters
  "Halal Shack": "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=800&q=80",
  
  // Indian curry and tandoori dishes
  "Indian Kitchen": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
  
  // Italian pasta and pizza
  "Piccola Italia": "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=800&q=80",
  
  // Modern American fusion
  "R&D": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  
  // Starbucks coffee cup with green logo
  "Starbucks": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
  
  // Street food tacos and bowls
  "Street Fluent": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80",
  
  // Fresh sushi rolls platter
  "Sushi Do": "https://images.unsplash.com/photo-1563612116625-3012372fccce?auto=format&fit=crop&w=800&q=80",
  
  // Cozy coffee shop atmosphere
  "The Coffee Shop": "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=80",
  
  // Upscale dining hall
  "The Skylight Room": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  
  // Southern comfort food and breakfast
  "TRUE GRIT'S": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80",
  
  // Fresh salads and healthy bowls
  "Wild Greens": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
};

// Helper function to get restaurant image with fallback
export const getRestaurantImage = (restaurantName) => {
  return restaurantImages[restaurantName] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";
};