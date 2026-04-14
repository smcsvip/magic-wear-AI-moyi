import { TryonResponse } from '@/types'

export async function mockTryonApi(personImage: File, clothesImage: File): Promise<TryonResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResults = [
        'https://images.unsplash.com/photo-15158866571-94035c443ded?w=800',
        'https://images.unsplash.com/photo-1483985988355-763728e193ae?w=800',
        'https://images.unsplash.com/photo-1496747614766-403375634528?w=800',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
        'https://images.unsplash.com/photo-1515762299759-0b8a9a8d8c4e?w=800'
      ]

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]

      resolve({
        success: true,
        imageUrl: randomResult,
        message: '试穿成功'
      })
    }, 2000)
  })
}
