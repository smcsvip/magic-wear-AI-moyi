export interface TryonRequest {
  personImage: File
  clothesImage: File
}

export interface TryonResponse {
  success: boolean
  imageUrl: string
  message: string
}

export interface ImageQuality {
  score: number
  issues: string[]
  suggestions: string[]
}

export interface TryonState {
  personImage: File | null
  clothesImage: File | null
  personImagePreview: string | null
  clothesImagePreview: string | null
  resultImage: string | null
  isLoading: boolean
  error: string | null
}

export interface TryonHistoryItem {
  id: string
  personImagePreview: string
  clothesImagePreview: string
  resultImage: string
  timestamp: Date
}
