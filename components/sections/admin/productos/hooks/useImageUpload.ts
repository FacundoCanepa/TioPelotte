"use client";
import { useState } from 'react'

export function useImageUpload() {
  const [loading, setLoading] = useState(false)

  const uploadImages = async (files: FileList | File[]) => {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files', file))
    setLoading(true)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error('Error al subir imagen')
      const urls = data.map((img: any) =>
        img.url.startsWith('/')
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${img.url}`
          : img.url
      )
      const ids = data.map((img: any) => ({ id: img.id }))
      return { ids, urls }
    } catch (err) {
      console.error(err)
      return { ids: [], urls: [] }
    } finally {
      setLoading(false)
    }
  }

  return { uploadImages, loading }
}