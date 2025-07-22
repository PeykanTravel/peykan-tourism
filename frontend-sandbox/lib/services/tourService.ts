import { tokenService } from './tokenService';

export interface TourVariant {
  id: string;
  name: string;
  description: string;
  base_price: string; // Changed from price to base_price
  capacity: number;
  is_active: boolean;
  includes_transfer: boolean;
  includes_guide: boolean;
  includes_meal: boolean;
  includes_photographer: boolean;
  extended_hours: number;
  private_transfer: boolean;
  expert_guide: boolean;
  special_meal: boolean;
  pricing: Array<{
    id: string;
    age_group: string;
    age_group_display: string;
    factor: number;
    is_free: boolean;
    requires_services: boolean;
  }>;
}

export interface TourSchedule {
  id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_capacity: number;
  current_capacity: number;
  available_capacity: number;
  is_full: boolean;
  day_of_week: number;
  variant_capacities: Record<string, number>;
  cutoff_datetime: string;
}

export interface TourItinerary {
  id: string;
  title: string;
  description: string;
  duration_minutes: number; // Changed from duration to duration_minutes
  location: string;
  image?: string;
  order: number;
}

export interface Tour {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  location: string;
  price: number;
  currency: string;
  images: string[];
  duration_hours: number;
  max_participants: number;
  min_participants: number;
  average_rating?: number;
  review_count?: number;
  category?: {
    id: string;
    name: string;
    description: string;
  };
  variants: TourVariant[];
  schedules: TourSchedule[];
  itinerary: TourItinerary[];
  options: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    type: 'addon' | 'service' | 'feature';
  }>;
}

export interface AvailabilityCheckRequest {
  tour_id: string;
  variant_id: string;
  date: string;
  participants: {
    adult: number;
    child: number;
    infant: number;
  };
}

export interface AvailabilityCheckResponse {
  is_available: boolean;
  available_capacity: number;
  total_price: number;
  currency: string;
  message?: string;
}

export class TourService {
  private baseUrl = 'http://localhost:8000/api/v1';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = tokenService.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('تور مورد نظر یافت نشد');
        }
        if (response.status === 401) {
          throw new Error('نیاز به احراز هویت');
        }
        throw new Error(`خطای سرور: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async fetchTourDetails(slug: string): Promise<Tour> {
    try {
      console.log('Fetching tour details for slug:', slug);
      const tour = await this.request<Tour>(`/tours/${slug}/`);
      console.log('Tour data received:', tour);
      
      // تبدیل داده‌های API به فرمت مورد نیاز
      return {
        ...tour,
        variants: tour.variants || [],
        schedules: tour.schedules || [],
        itinerary: tour.itinerary || [],
        options: tour.options || []
      };
    } catch (error) {
      console.error('Error fetching tour details:', error);
      console.log('Using mock data as fallback');
      // در صورت خطا، داده‌های mock برگردان
      return this.getMockTourData();
    }
  }

  async fetchTourSchedules(tourId: string): Promise<{ schedules: TourSchedule[] }> {
    try {
      const response = await this.request<{ schedules: TourSchedule[] }>(`/tours/${tourId}/schedules/`);
      return response;
    } catch (error) {
      console.error('Error fetching tour schedules:', error);
      // در صورت خطا، داده‌های mock برگردان
      return {
        schedules: [
          {
            id: 'schedule-1',
            start_date: '2024-02-15',
            end_date: '2024-02-15',
            start_time: '08:00:00',
            end_time: '18:00:00',
            is_available: true,
            max_capacity: 20,
            current_capacity: 5,
            available_capacity: 15,
            is_full: false,
            day_of_week: 4,
            variant_capacities: {},
            cutoff_datetime: '2024-02-13T08:00:00'
          },
          {
            id: 'schedule-2',
            start_date: '2024-02-16',
            end_date: '2024-02-16',
            start_time: '09:00:00',
            end_time: '19:00:00',
            is_available: true,
            max_capacity: 20,
            current_capacity: 0,
            available_capacity: 20,
            is_full: false,
            day_of_week: 5,
            variant_capacities: {},
            cutoff_datetime: '2024-02-14T09:00:00'
          }
        ]
      };
    }
  }

  async checkTourAvailability(data: AvailabilityCheckRequest): Promise<AvailabilityCheckResponse> {
    try {
      const response = await this.request<AvailabilityCheckResponse>('/tours/check-availability/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error checking tour availability:', error);
      // در صورت خطا، پاسخ mock برگردان
      return {
        is_available: true,
        available_capacity: 10,
        total_price: 120,
        currency: 'USD',
        message: 'داده‌های موقت - اتصال به سرور برقرار نیست'
      };
    }
  }

  async calculateTourPricing(tourId: string, variantId: string, participants: { adult: number; child: number; infant: number }): Promise<any> {
    try {
      const response = await this.request('/tours/calculate-pricing/', {
        method: 'POST',
        body: JSON.stringify({
          tour_id: tourId,
          variant_id: variantId,
          participants
        }),
      });
      return response;
    } catch (error) {
      console.error('Error calculating tour pricing:', error);
      // در صورت خطا، محاسبه ساده برگردان
      const basePrice = 120;
      const totalPrice = (participants.adult * basePrice) + (participants.child * basePrice * 0.7);
      return {
        total_price: totalPrice,
        currency: 'USD',
        breakdown: {
          adult: participants.adult * basePrice,
          child: participants.child * basePrice * 0.7,
          infant: 0
        }
      };
    }
  }

  // داده‌های mock برای fallback
  private getMockTourData(): Tour {
    return {
      id: '61443932-0c84-42f8-b14b-812017253c48',
      slug: 'damavand-mountain-tour',
      title: 'تور کوه دماوند',
      short_description: 'صعود به بلندترین قله ایران',
      description: 'صعود به بلندترین قله ایران، دماوند، با بازدید از مناظر زیبای کوهستانی و تجربه‌ای فراموش‌نشدنی',
      location: 'کوه دماوند، استان مازندران',
      price: 120,
      currency: 'USD',
      images: ['/images/damavand.jpg'],
      duration_hours: 10,
      max_participants: 20,
      min_participants: 2,
      average_rating: 4.8,
      review_count: 156,
      category: {
        id: 'cat-1',
        name: 'کوهنوردی',
        description: 'تورهای کوهنوردی و صعود'
      },
      variants: [
        {
          id: 'variant-1',
          name: 'پکیج اقتصادی',
          description: 'تور استاندارد با خدمات پایه',
          base_price: '120',
          capacity: 20,
          is_active: true,
          includes_transfer: true,
          includes_guide: true,
          includes_meal: true,
          includes_photographer: false,
          extended_hours: 0,
          private_transfer: false,
          expert_guide: false,
          special_meal: false,
          pricing: [
            { id: 'price-1', age_group: 'adult', age_group_display: 'بزرگسال', factor: 1.0, is_free: false, requires_services: false },
            { id: 'price-2', age_group: 'child', age_group_display: 'کودک', factor: 0.7, is_free: false, requires_services: false },
            { id: 'price-3', age_group: 'infant', age_group_display: 'نوزاد', factor: 0.0, is_free: true, requires_services: false }
          ]
        },
        {
          id: 'variant-2',
          name: 'پکیج VIP',
          description: 'تور لوکس با خدمات ویژه',
          base_price: '200',
          capacity: 15,
          is_active: true,
          includes_transfer: true,
          includes_guide: true,
          includes_meal: true,
          includes_photographer: true,
          extended_hours: 0,
          private_transfer: false,
          expert_guide: true,
          special_meal: false,
          pricing: [
            { id: 'price-4', age_group: 'adult', age_group_display: 'بزرگسال', factor: 1.0, is_free: false, requires_services: false },
            { id: 'price-5', age_group: 'child', age_group_display: 'کودک', factor: 0.8, is_free: false, requires_services: false },
            { id: 'price-6', age_group: 'infant', age_group_display: 'نوزاد', factor: 0.0, is_free: true, requires_services: false }
          ]
        }
      ],
      schedules: [
        {
          id: 'schedule-1',
          start_date: '2024-02-15',
          end_date: '2024-02-15',
          start_time: '08:00:00',
          end_time: '18:00:00',
          is_available: true,
          max_capacity: 20,
          current_capacity: 5,
          available_capacity: 15,
          is_full: false,
          day_of_week: 4,
          variant_capacities: {},
          cutoff_datetime: '2024-02-13T08:00:00'
        },
        {
          id: 'schedule-2',
          start_date: '2024-02-16',
          end_date: '2024-02-16',
          start_time: '09:00:00',
          end_time: '19:00:00',
          is_available: true,
          max_capacity: 20,
          current_capacity: 0,
          available_capacity: 20,
          is_full: false,
          day_of_week: 5,
          variant_capacities: {},
          cutoff_datetime: '2024-02-14T09:00:00'
        }
      ],
      itinerary: [
        {
          id: 'itinerary-1',
          title: 'شروع سفر',
          description: 'حرکت از تهران به سمت دماوند',
          duration_minutes: 120,
          location: 'تهران - دماوند',
          order: 1
        },
        {
          id: 'itinerary-2',
          title: 'صعود',
          description: 'شروع صعود به قله دماوند',
          duration_minutes: 360,
          location: 'کوه دماوند',
          order: 2
        },
        {
          id: 'itinerary-3',
          title: 'بازگشت',
          description: 'بازگشت به تهران',
          duration_minutes: 120,
          location: 'دماوند - تهران',
          order: 3
        }
      ],
      options: [
        {
          id: 'guide',
          name: 'راهنمای تور',
          description: 'راهنمای حرفه‌ای و مجرب',
          price: 20,
          currency: 'USD',
          type: 'service'
        },
        {
          id: 'insurance',
          name: 'بیمه مسافرتی',
          description: 'پوشش بیمه‌ای کامل',
          price: 15,
          currency: 'USD',
          type: 'addon'
        }
      ]
    };
  }
}

export const tourService = new TourService(); 