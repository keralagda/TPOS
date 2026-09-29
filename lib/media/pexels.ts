/**
 * Pexels High-Resolution Travel Photography Service
 * Delivers verified, dynamic photos for destinations, stays, gems, and travel circles
 */

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographerUrl: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export class PexelsService {
  private static apiKey = process.env.PEXELS_API_KEY || 't9I35fxpNwdP7j3wstIADhfdOjJviuGfIH18A5Kdo4koOJpdYlAUOL0O';
  private static baseUrl = 'https://api.pexels.com/v1';

  /**
   * Search travel photography from Pexels API
   */
  static async searchPhotos(query: string, options?: {
    perPage?: number;
    page?: number;
    orientation?: 'landscape' | 'portrait' | 'square';
  }): Promise<PexelsPhoto[]> {
    const perPage = options?.perPage ?? 12;
    const page = options?.page ?? 1;
    const orientation = options?.orientation ?? 'landscape';

    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=${orientation}`;
      const response = await fetch(url, {
        headers: {
          Authorization: this.apiKey,
        },
        next: { revalidate: 3600 }, // Cache images for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.photos || []) as PexelsPhoto[];
    } catch (err: any) {
      console.warn(`Pexels fetch failed for "${query}":`, err.message);
      return [];
    }
  }

  /**
   * Get curated destination photography
   */
  static async getDestinationPhotos(destination: string, count: number = 4): Promise<string[]> {
    const photos = await this.searchPhotos(`${destination} travel landmark`, { perPage: count });
    if (photos.length > 0) {
      return photos.map(p => p.src.large);
    }
    // Fallback Unsplash image if Pexels has no match
    return ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'];
  }
}
