#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peykan.settings')
django.setup()

from tours.models import Tour, TourCategory

def check_tours():
    """Check existing tours in database."""
    print("🔍 Checking existing tours...")
    print("=" * 50)
    
    # Get all tours
    tours = Tour.objects.all().select_related('category')
    
    if not tours.exists():
        print("❌ No tours found in database!")
        return
    
    print(f"✅ Found {tours.count()} tours:")
    print()
    
    for tour in tours:
        print(f"📋 Tour: {tour.title}")
        print(f"   ID: {tour.id}")
        print(f"   Slug: {tour.slug}")
        print(f"   Category: {tour.category.name if tour.category else 'None'}")
        print(f"   Price: {tour.price} {tour.currency}")
        print(f"   Featured: {tour.is_featured}")
        print(f"   Popular: {tour.is_popular}")
        print(f"   Active: {tour.is_active}")
        print(f"   Image: {tour.image.url if tour.image else 'No image'}")
        print("-" * 30)
    
    # Check categories
    print("\n🏷️ Tour Categories:")
    categories = TourCategory.objects.all()
    for cat in categories:
        print(f"   - {cat.name} (ID: {cat.id})")
    
    # Check featured/popular tours
    featured_tours = tours.filter(is_featured=True)
    popular_tours = tours.filter(is_popular=True)
    
    print(f"\n⭐ Featured tours: {featured_tours.count()}")
    print(f"🔥 Popular tours: {popular_tours.count()}")
    
    if featured_tours.count() == 0:
        print("\n💡 Suggestion: Set some tours as featured for Home Page display")
        print("   You can do this in Django Admin or via shell:")
        print("   tour.is_featured = True")
        print("   tour.save()")

if __name__ == "__main__":
    check_tours() 