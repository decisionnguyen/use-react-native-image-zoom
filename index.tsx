
import { ImageZoomContext } from 'context/ImageZoomContext'
import { useContext } from 'react'

const useImageZoom = () => useContext(ImageZoomContext)

export default useImageZoom
