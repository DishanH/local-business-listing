#!/usr/bin/env python3
"""
Generate 5000 unique businesses with rich data (offerings, specials, posts)
Each business will have multiple offering sections, specials, and posts for load testing
"""
import json
import random
from datetime import datetime, timedelta

# Load reference data
with open('seed-businesses.reference.json', 'r') as f:
    ref = json.load(f)

allowed = ref['allowed_values']

# Extract allowed values
categories_dict = allowed['categories']
all_categories = list(categories_dict.keys())
statuses = allowed['status']
price_levels = allowed['price_level']
post_types = allowed['post_type']
owner_profile_ids = allowed['owner_profile_ids']
cities = [c['slug'] for c in allowed['cities']['existing'] + allowed['cities']['ontario_optional_add_first']]
filters_global = allowed['filters_global']
filters_by_category = allowed['filters_by_category']

# Street names for Ontario
streets = [
    "Main St", "King St", "Queen St", "Dundas St", "York St", "Wellington St",
    "Victoria St", "Albert St", "Church St", "Market St", "Water St", "Front St",
    "John St", "William St", "George St", "Charles St", "James St", "Henry St",
    "Edward St", "Arthur St", "Patrick St", "Louis St", "Robert St", "David St",
    "Elizabeth St", "Maple St", "Oak St", "Pine St", "Cedar St", "Elm St"
]

# Business name components by category
business_names = {
    "restaurants": ["Bistro", "Kitchen", "Grill", "Eatery", "Table", "Fork", "Spoon", "Plate", "Dining Room"],
    "cafe": ["Cafe", "Coffee House", "Roastery", "Brew Bar", "Bean", "Cup", "Mug"],
    "bakery": ["Bakery", "Patisserie", "Bread Co", "Oven", "Dough", "Flour", "Rise"],
    "bars-nightlife": ["Bar", "Lounge", "Pub", "Tavern", "Brewery", "Tap Room"],
    "salon": ["Salon", "Studio", "Spa", "Beauty Bar", "Hair Lounge"],
    "gym": ["Fitness", "Gym", "Training Center", "Athletic Club", "Strength Co"],
    "florist": ["Florist", "Blooms", "Petals", "Garden", "Bouquet"],
    "yoga": ["Yoga Studio", "Wellness Center", "Mindful Space", "Zen Studio"],
    "petstore": ["Pet Supply", "Pet Paradise", "Paws", "Pet Store", "Animal Care"],
    "autoshop": ["Auto Care", "Auto Repair", "Auto Service", "Garage", "Motors"],
    "bookstore": ["Books", "Bookshop", "Reading Room", "Library", "Pages"],
    "retail-shopping": ["Boutique", "Shop", "Store", "Market", "Emporium"],
    "home-services": ["Services", "Solutions", "Experts", "Pros", "Specialists"],
    "professional-services": ["Associates", "Group", "Partners", "Consulting", "Advisors"],
    "health-medical": ["Clinic", "Center", "Practice", "Healthcare", "Medical"],
    "education-training": ["Academy", "School", "Institute", "Learning Center", "Studio"],
    "arts-entertainment": ["Gallery", "Studio", "Theater", "Arts Center", "Venue"],
    "events-party": ["Events", "Celebrations", "Party Place", "Event Space"],
    "travel-lodging": ["Inn", "Lodge", "Hotel", "Suites", "Stay"],
    "real-estate": ["Realty", "Properties", "Real Estate", "Homes"],
    "tech-electronics": ["Tech", "Electronics", "Digital", "Tech Hub", "Repair Shop"],
    "community-nonprofit": ["Center", "Foundation", "Community", "Society"],
    "kids-family": ["Kids Club", "Play Center", "Family Fun", "Kids Zone"],
    "pottery-crafts": ["Pottery", "Clay Studio", "Craft Studio", "Kiln"]
}

name_prefixes = [
    "Sunrise", "Golden", "Silver", "Crystal", "Emerald", "Ruby", "Sapphire",
    "Royal", "Imperial", "Majestic", "Grand", "Premier", "Elite", "Premium",
    "Urban", "Metro", "City", "Downtown", "Village", "Country", "Lakeside",
    "Riverside", "Mountain", "Valley", "Forest", "Garden", "Park", "Plaza",
    "Heritage", "Legacy", "Crown", "Pinnacle", "Summit", "Apex", "Peak"
]

# Offering data by category
offering_templates = {
    "restaurants": {
        "sections": ["Appetizers", "Main Course", "Desserts", "Beverages", "Daily Specials"],
        "items": ["Grilled Salmon", "Caesar Salad", "Pasta Primavera", "Ribeye Steak", "Chicken Parmesan", 
                  "Fish Tacos", "Burger Deluxe", "Vegetarian Platter", "Soup of the Day", "Chocolate Cake"]
    },
    "cafe": {
        "sections": ["Coffee & Espresso", "Breakfast", "Lunch", "Pastries", "Smoothies"],
        "items": ["Cappuccino", "Latte", "Americano", "Avocado Toast", "Croissant", "Muffin", "Bagel", 
                  "Breakfast Sandwich", "Acai Bowl", "Green Smoothie"]
    },
    "bakery": {
        "sections": ["Breads", "Pastries", "Cakes", "Cookies", "Seasonal Items"],
        "items": ["Sourdough Loaf", "Baguette", "Cinnamon Roll", "Danish", "Cupcakes", "Layer Cake",
                  "Chocolate Chip Cookies", "Macarons", "Tarts", "Pies"]
    },
    "gym": {
        "sections": ["Memberships", "Personal Training", "Group Classes", "Day Passes"],
        "items": ["Monthly Membership", "Annual Membership", "PT Package 10 Sessions", "Yoga Class Pass",
                  "Spinning Class", "CrossFit Package", "Drop-in Pass", "Family Membership"]
    },
    "salon": {
        "sections": ["Hair Services", "Color Services", "Spa Treatments", "Nail Services"],
        "items": ["Haircut & Style", "Highlights", "Balayage", "Hair Color", "Facial", "Massage",
                  "Manicure", "Pedicure", "Waxing", "Hair Treatment"]
    },
    "default": {
        "sections": ["Products", "Services", "Packages", "Memberships", "Specialty Items"],
        "items": ["Standard Service", "Premium Package", "Basic Plan", "Deluxe Option", "Custom Service",
                  "Starter Package", "Professional Service", "Express Option", "Ultimate Package"]
    }
}

# Special names and descriptions
special_templates = [
    {"name": "Happy Hour", "desc": "Special pricing on select items during off-peak hours", "label": "20% off"},
    {"name": "Weekend Special", "desc": "Exclusive weekend offer for our valued customers", "label": "BOGO"},
    {"name": "Early Bird", "desc": "Come in early and save on morning specials", "label": "$5 off"},
    {"name": "Student Discount", "desc": "Show your student ID for discount", "label": "15% off"},
    {"name": "Senior Special", "desc": "Special rates for seniors 65+", "label": "10% off"},
    {"name": "Family Deal", "desc": "Special package pricing for families", "label": "Bundle discount"},
    {"name": "Loyalty Reward", "desc": "Exclusive offer for repeat customers", "label": "Free upgrade"},
    {"name": "Seasonal Promotion", "desc": "Limited time seasonal offer", "label": "Special price"},
    {"name": "New Customer", "desc": "First-time customer special offer", "label": "50% off first visit"},
    {"name": "Referral Bonus", "desc": "Bring a friend and both save", "label": "Both get 15% off"}
]

# Post templates
post_templates = [
    {"title": "New Menu Items", "body": "We've added exciting new options to our menu. Come try them today!", "type": "update"},
    {"title": "Extended Hours", "body": "We're now open later to serve you better. Check our new hours!", "type": "update"},
    {"title": "Grand Opening Celebration", "body": "Join us for our grand opening with special discounts and giveaways", "type": "event"},
    {"title": "Limited Time Offer", "body": "Don't miss out on this exclusive limited-time promotion", "type": "offer"},
    {"title": "Customer Appreciation Day", "body": "Thank you for your support! Enjoy special deals all day", "type": "event"},
    {"title": "Holiday Hours", "body": "Check our special holiday operating hours", "type": "update"},
    {"title": "New Staff Members", "body": "Welcome our newest team members bringing fresh expertise", "type": "update"},
    {"title": "Renovation Complete", "body": "Our newly renovated space is ready. Come see the transformation!", "type": "update"},
    {"title": "Flash Sale", "body": "24-hour flash sale on select items. First come, first served!", "type": "offer"},
    {"title": "Community Event", "body": "Join us in supporting our local community with this special event", "type": "event"}
]

def generate_unique_slug(category, city, business_num):
    """Generate a unique kebab-case slug"""
    prefix = random.choice(name_prefixes).lower()
    category_part = category.replace('_', '-').replace(' ', '-')
    # Add variation to prevent duplicates
    variation = ["co", "group", "plus", "pro", "hub", "spot", "place", "point"][business_num % 8]
    return f"{prefix}-{category_part}-{variation}-{city}-{business_num}"

def generate_offerings(category, num_sections=3):
    """Generate multiple offering sections with multiple items each"""
    template = offering_templates.get(category, offering_templates["default"])
    sections = []
    
    for i in range(num_sections):
        section_name = random.choice(template["sections"])
        num_items = random.randint(3, 8)  # 3-8 items per section
        
        offerings = []
        for j in range(num_items):
            item_name = random.choice(template["items"])
            price_cents = random.randint(500, 10000) if random.random() > 0.2 else None
            price_label = None if price_cents else random.choice(["Market price", "Call for quote", "Varies"])
            tag = random.choice([None, None, None, "Popular", "New", "Signature", "Chef's pick", "Best value"])
            
            offerings.append({
                "name": f"{item_name} {j+1}",
                "description": f"High-quality {item_name.lower()} prepared with care and attention to detail",
                "price_cents": price_cents,
                "price_label": price_label,
                "tag": tag,
                "image_url": None,
                "is_available": random.random() > 0.1,  # 90% available
                "sort_order": j
            })
        
        sections.append({
            "name": f"{section_name}",
            "sort_order": i,
            "offerings": offerings
        })
    
    return sections

def generate_specials(num_specials=3):
    """Generate multiple specials"""
    specials = []
    
    for i in range(num_specials):
        template = random.choice(special_templates)
        day = random.choice([None, None, 0, 1, 2, 3, 4, 5, 6])  # 30% no specific day
        
        specials.append({
            "day_of_week": day,
            "name": template["name"],
            "description": template["desc"],
            "price_cents": None,
            "price_label": template["label"],
            "starts_on": None,
            "ends_on": None
        })
    
    return specials

def generate_posts(num_posts=4):
    """Generate multiple posts"""
    posts = []
    
    for i in range(num_posts):
        template = random.choice(post_templates)
        post_date = datetime.now() - timedelta(days=random.randint(0, 60))
        has_expiry = random.random() > 0.7  # 30% have expiry
        
        posts.append({
            "type": template["type"],
            "title": template["title"],
            "body": template["body"],
            "badge": random.choice([None, "New", "Offer", "Event"]),
            "published_at": post_date.isoformat() + "Z",
            "expires_at": (post_date + timedelta(days=30)).isoformat() + "Z" if has_expiry else None,
            "author_id": None
        })
    
    return posts

def generate_business(business_num, total_businesses):
    """Generate a single business with rich data"""
    
    # Ensure all categories are covered evenly
    category_index = business_num % len(all_categories)
    category = all_categories[category_index]
    
    subcategories = categories_dict[category]
    subcategory = random.choice(subcategories) if subcategories else None
    
    city = cities[business_num % len(cities)]  # Distribute across cities evenly
    
    # Create unique slug
    slug = generate_unique_slug(category, city, business_num)
    
    # Create business name
    prefix = name_prefixes[business_num % len(name_prefixes)]
    suffix_list = business_names.get(category, business_names["retail-shopping"])
    suffix = random.choice(suffix_list)
    name = f"{prefix} {suffix}"
    
    # Generate rich description
    descriptors = ["premier", "top-rated", "award-winning", "family-owned", "locally trusted",
                   "professional", "experienced", "certified", "licensed", "established"]
    actions = ["serving", "providing", "offering", "delivering", "specializing in"]
    qualities = ["exceptional", "outstanding", "high-quality", "premium", "superior",
                 "reliable", "trusted", "comprehensive", "personalized", "innovative"]
    
    descriptor = random.choice(descriptors)
    action = random.choice(actions)
    quality = random.choice(qualities)
    
    tagline = f"{descriptor.title()} {category.replace('-', ' ')} with {quality} service and attention to detail"
    description = f"A {descriptor} {category.replace('-', ' ')} business {action} {quality} {subcategory.replace('-', ' ') if subcategory else category.replace('-', ' ')} services in {city.replace('-', ' ').title()}. We pride ourselves on customer satisfaction, community involvement, and delivering excellence in everything we do. Visit us today to experience the difference."
    
    # Select filters
    filter_slugs = random.sample(filters_global, min(5, len(filters_global)))
    if category in filters_by_category:
        category_filters = random.sample(filters_by_category[category], 
                                        min(3, len(filters_by_category[category])))
        filter_slugs.extend(category_filters)
    
    # Generate rich keywords
    keywords = [
        category.replace('-', ' '),
        subcategory.replace('-', ' ') if subcategory else "",
        city.replace('-', ' '),
        random.choice(["affordable", "premium", "quality", "professional", "local"]),
        random.choice(["service", "experience", "expert", "specialist", "provider"])
    ]
    keywords = [k for k in keywords if k]  # Remove empty strings
    
    # Generate hours with some variation
    hours = []
    for day in range(7):
        if day == 0 and random.random() > 0.5:  # 50% closed Sunday
            hours.append({"day_of_week": day, "open_minute": None, "close_minute": None})
        else:
            open_minute = random.choice([420, 480, 540, 600])  # 7AM, 8AM, 9AM, 10AM
            duration = random.choice([540, 600, 660, 720, 780])  # 9-13 hours
            close_minute = open_minute + duration
            if day in [5, 6]:  # Weekend - might open later or close earlier
                open_minute = random.choice([540, 600, 660])
                close_minute = random.choice([1080, 1140, 1200, 1260])
            hours.append({"day_of_week": day, "open_minute": open_minute, "close_minute": close_minute})
    
    # Generate multiple images
    num_images = random.randint(2, 5)
    images = []
    for img_num in range(num_images):
        images.append({
            "url": f"https://picsum.photos/seed/{slug}-{img_num}/1000/750",
            "alt_text": f"{name} - {random.choice(['interior', 'exterior', 'product', 'service', 'team', 'atmosphere'])}",
            "sort_order": img_num
        })
    
    business = {
        "slug": slug,
        "name": name,
        "tagline": tagline[:150],  # Limit length
        "description": description[:500],  # Limit length
        "category_slug": category,
        "subcategory_slug": subcategory,
        "status": "published",
        "price_level": random.choice(price_levels),
        "email": "hello@example.com",
        "phone": f"+1-{random.choice(['519', '905', '226', '647', '613'])}-555-{str(business_num % 200).zfill(4)[:4]}",
        "website": f"https://example.com/{slug}",
        "address_line1": f"{random.randint(1, 999)} {random.choice(streets)}",
        "address_line2": None if random.random() > 0.3 else random.choice([
            f"Unit {random.randint(1, 50)}", 
            f"Suite {random.randint(100, 500)}", 
            f"Floor {random.randint(1, 5)}",
            "Building A", "Building B"
        ]),
        "city_slug": city,
        "postal_code": f"{random.choice(['N', 'L', 'M', 'K'])}{random.randint(1,9)}{random.choice(['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K'])} {random.randint(1,9)}{random.choice(['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K'])}{random.randint(1,9)}",
        "lat": round(random.uniform(42.5, 45.5), 6),
        "lng": round(random.uniform(-82.0, -75.0), 6),
        "cover_image_url": f"https://picsum.photos/seed/{slug}/1200/800",
        "is_featured": random.random() > 0.85,  # 15% featured
        "avg_rating": round(random.uniform(3.5, 5.0), 1),
        "review_count": random.randint(5, 800),
        "keywords": keywords,
        "published_at": "2026-07-01T12:00:00Z",
        "created_by": None,
        "owners": [{
            "profile_id": owner_profile_ids[business_num % 2],
            "role": "owner"
        }],
        "filter_slugs": list(set(filter_slugs)),
        "images": images,
        "hours": hours,
        "offering_sections": generate_offerings(category, random.randint(2, 5)),  # 2-5 sections
        "specials": generate_specials(random.randint(2, 5)),  # 2-5 specials
        "posts": generate_posts(random.randint(2, 6))  # 2-6 posts
    }
    
    # Progress indicator
    if business_num % 100 == 0:
        print(f"Generated {business_num}/{total_businesses} businesses...")
    
    return business

def main():
    total_businesses = 5000
    print(f"Starting generation of {total_businesses} businesses...")
    print(f"Using {len(all_categories)} categories: {', '.join(all_categories)}")
    print(f"Distributing across {len(cities)} cities")
    print()
    
    businesses = []
    for i in range(total_businesses):
        business = generate_business(i, total_businesses)
        businesses.append(business)
    
    output_file = 'seed-businesses-5000-generated.json'
    with open(output_file, 'w') as f:
        json.dump(businesses, f, indent=2)
    
    print()
    print(f"✓ Generated {len(businesses)} businesses in {output_file}")
    print(f"✓ Each business has 2-5 offering sections with 3-8 items each")
    print(f"✓ Each business has 2-5 specials")
    print(f"✓ Each business has 2-6 posts")
    print(f"✓ All {len(all_categories)} categories are evenly distributed")
    
    # Statistics
    total_offerings = sum(len(b['offering_sections']) for b in businesses)
    total_specials = sum(len(b['specials']) for b in businesses)
    total_posts = sum(len(b['posts']) for b in businesses)
    
    print()
    print("Statistics:")
    print(f"  Total offering sections: {total_offerings}")
    print(f"  Total specials: {total_specials}")
    print(f"  Total posts: {total_posts}")
    print(f"  Average offerings per business: {total_offerings/len(businesses):.1f}")
    print(f"  Average specials per business: {total_specials/len(businesses):.1f}")
    print(f"  Average posts per business: {total_posts/len(businesses):.1f}")

if __name__ == "__main__":
    main()
