import React, { createContext, ReactElement, useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import FastImage, { Source } from 'react-native-fast-image'

type ImageZoomContextState = {
  isZooming: boolean;
  setIsZooming: React.Dispatch<React.SetStateAction<boolean>>;

  scale: Animated.Value;
  translate: Animated.ValueXY

  measuedView: MeasuredViewType | null;
  setMeasuredView: React.Dispatch<React.SetStateAction<MeasuredViewType | null>>;

  source: number | Source | undefined | null;
  setSource: React.Dispatch<React.SetStateAction<number | Source | undefined | null>>
}

export type MeasuredViewType = {
  fx: number;
  fy: number;
  width: number;
  height: number;
  px: number;
  py: number;
}

const defaultValues: ImageZoomContextState = {
  isZooming: false,
  setIsZooming: () => { },

  scale: new Animated.Value(1),
  translate: new Animated.ValueXY({ x: 0, y: 0 }),

  measuedView: { fx: 0, fy: 0, width: 0, height: 0, px: 0, py: 0 },
  setMeasuredView: () => { },

  source: '',
  setSource: () => { }
}

export const ImageZoomContext = createContext<ImageZoomContextState>(defaultValues)

interface ImageZoomContextProps {
  children: ReactElement;
}

export const ImageZoomProvider = ({ children }: ImageZoomContextProps) => {
  const [isZooming, setIsZooming] = useState(defaultValues.isZooming)
  const [measuedView, setMeasuredView] = useState(defaultValues.measuedView)
  const [source, setSource] = useState(defaultValues.source)
  const [shouldBeHidden, setShouldBeHidden] = useState(true)

  const scale = useRef(new Animated.Value(1)).current
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current

  const backgroundOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isZooming) {
      Animated.timing(backgroundOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true
      }
      ).start()
      setShouldBeHidden(false)
      return
    }

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(translate, {
        toValue: { x: 0, y: 0 },
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      setShouldBeHidden(true)
    })
  }, [isZooming])

  return (
    <ImageZoomContext.Provider
      value={{
        isZooming,
        setIsZooming,
        scale,
        translate,
        measuedView,
        setMeasuredView,
        source,
        setSource
      }}
    >
      {children}
      {!shouldBeHidden && <View style={{
        ...styles.hideImage,
        height: measuedView?.height,
        width: measuedView?.width,
        top: measuedView?.py,
        left: measuedView?.px
      }}
      />}
      {!shouldBeHidden && <View
        style={StyleSheet.absoluteFillObject}
        pointerEvents='none'
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject, {
              backgroundColor: '#000000',
              opacity: backgroundOpacity
            }]}
          pointerEvents='none'
        />
        <Animated.View style={{
          ...styles.absolute,
          left: measuedView?.px,
          top: measuedView?.py,
          transform: [
            { scale: scale },
            { translateX: translate.x },
            { translateY: translate.y }
          ]
        }}
        >
          {source && <FastImage
            style={{
              height: measuedView?.height,
              width: measuedView?.width
            }}
            resizeMode='cover'
            source={source!}
          />}
        </Animated.View>
      </View>}
    </ImageZoomContext.Provider>
  )
}

const styles = StyleSheet.create({
  hideImage: {
    position: 'absolute',
    backgroundColor: '#444'
  },
  rental: {
    justifyContent: 'flex-start',
    marginVertical: 16
  },
  absolute: {
    position: 'absolute'
  }
})
