import React, { useEffect, useRef, ReactNode, useCallback } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import React, { useEffect, useRef, ReactNode, useCallback, useState } from 'react'
import { View, Animated, StyleSheet, PanResponder } from 'react-native'
import FastImage, { FastImageProps } from 'react-native-fast-image'
import { Blurhash } from 'react-native-blurhash'
import useImageZoom from 'hooks/useImageZoom'

interface ImageProps extends Omit<FastImageProps, 'source'> {
  blurhash?: string;
  children?: ReactNode;
  shouldFadeIn?: boolean;
  blurhash?: string
  children?: ReactNode
  shouldFadeIn?: boolean
  source?: FastImageProps['source'] | undefined // allow only blurhash
  isZoomable?: boolean
}

let initDist = 0
let x1 = 0
let y1 = 0
let x2 = 0
let y2 = 0
let originX = 0
let originY = 0
let imgCenterX = 0
let imgCenterY = 0

const Image = (props: ImageProps) => {
  const fadeToImage = useRef(new Animated.Value(0)).current
  const fadeToBlur = useRef(new Animated.Value(0)).current
  const [shouldUpdateSource, setShouldUpdateSource] = useState(false)
  const { setIsZooming, setSource, setMeasuredView, scale, translate } = useImageZoom()
  const ref = useRef<View>(null)

  const { source, style, shouldFadeIn = false, blurhash, children, isZoomable = false } = props

  useEffect(() => {
    fadeToImage.setValue(0)
    Animated.timing(fadeToBlur, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])
  const fadeIn = useCallback(() => {
    fadeToImage.setValue(0)
    Animated.timing(fadeToImage, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  const { source, style, shouldFadeIn = false, blurhash, children } = props
  const measure = () => {
    ref?.current?.measure((fx, fy, width, height, px, py) => {
      imgCenterX = px + (width / 2)
      imgCenterY = py + (height / 2)
      setMeasuredView({ fx, fy, width, height, px, py })
    })
  }

  useEffect(() => {
    if (!shouldUpdateSource) return
    setSource(source)
    setShouldUpdateSource(false)
  }, [shouldUpdateSource, setSource, source])

  const panResponder = isZoomable
    ? useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: (initial_event) => initial_event.nativeEvent.touches.length === 2,
        onPanResponderStart: (initial_event) => {
          const touches = initial_event.nativeEvent.touches

          if (touches.length === 2) {
            measure()
            setIsZooming(true)
            setShouldUpdateSource(true)

            x1 = touches[0].pageX
            y1 = touches[0].pageY

            x2 = touches[1].pageX
            y2 = touches[1].pageY

            initDist = absDist(x1, y1, x2, y2)

            originX = Math.min(x1, x2) + Math.abs((x1 - x2) / 2)
            originY = Math.min(y1, y2) + Math.abs((y1 - y2) / 2)
          }
        },
        onMoveShouldSetPanResponder: (initial_event) => initial_event.nativeEvent.touches.length === 2,
        onPanResponderMove: (event) => {
          const touches = event.nativeEvent.touches
          if (touches.length === 2) {
            const [{ pageX: nx1, pageY: ny1 }, { pageX: nx2, pageY: ny2 }] = touches

            const newDist = absDist(nx1, ny1, nx2, ny2)
            const ratio = newDist / initDist

            const newMiddleX = Math.min(nx1, nx2) + Math.abs((nx1 - nx2) / 2)
            const newMiddleY = Math.min(ny1, ny2) + Math.abs((ny1 - ny2) / 2)

            const deltaMiddleX = (imgCenterX - originX) * ratio
            const deltaMiddleY = (imgCenterY - originY) * ratio

            const movedOriginX = imgCenterX - deltaMiddleX
            const movedOriginY = imgCenterY - deltaMiddleY

            const translateX = (newMiddleX - movedOriginX) / ratio
            const translateY = (newMiddleY - movedOriginY) / ratio

            scale.setValue(ratio)
            translate.setValue({ x: translateX, y: translateY })
          } else {
            setIsZooming(false)
          }
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderRelease: () => setIsZooming(false),
        onPanResponderTerminate: () => setIsZooming(false)
      })
    ).current
    : null

  const absDist = (x1: number, y1: number, x2: number, y2: number) => {
    const a = x1 - x2
    const b = y1 - y2

    return Math.abs(Math.sqrt(a * a + b * b))
  }

  return (
    <Animated.View style={[style, { opacity: shouldFadeIn ? fadeToBlur : 1 }]}>
    <Animated.View
      {...panResponder?.panHandlers}
      ref={ref}
      style={[style, { opacity: shouldFadeIn ? fadeToBlur : 1 }]}
    >
      <Blurhash
        style={StyleSheet.absoluteFillObject}
        blurhash={blurhash || 'L03u}{RPRPt7MdIAtRj[yDayj[j['}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: shouldFadeIn ? fadeToImage : 1 }]}>
        {source && <FastImage
          {...props}
          source={source}
          onLoadEnd={fadeIn}
        />}
      </Animated.View>
      <View style={[style, StyleSheet.absoluteFill]}>
      <View style={[style, StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}>
        {children}
      </View>
    </Animated.View>