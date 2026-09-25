import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationDone: () => void;
}

export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onAnimationDone }) => {
  const boxTranslateX = useRef(new Animated.Value(-width)).current; 
  const boxSpin = useRef(new Animated.Value(0)).current; 
  const iconScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  // Pulse animation values
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  const [isFinishing, setIsFinishing] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    Animated.spring(boxTranslateX, {
      toValue: 0,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      
      setShowPulse(true);

      // Start the cascading pulse loops
      const p1 = Animated.loop(Animated.timing(pulse1, { toValue: 1, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
      const p2 = Animated.loop(Animated.timing(pulse2, { toValue: 1, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
      const p3 = Animated.loop(Animated.timing(pulse3, { toValue: 1, duration: 1500, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
      
      p1.start();
      Animated.sequence([Animated.delay(500), Animated.timing(new Animated.Value(0), {toValue: 0, duration: 0, useNativeDriver: true})]).start(() => p2.start());
      Animated.sequence([Animated.delay(1000), Animated.timing(new Animated.Value(0), {toValue: 0, duration: 0, useNativeDriver: true})]).start(() => p3.start());

      Animated.sequence([
        Animated.timing(boxSpin, {
          toValue: 1, 
          duration: 600,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(boxSpin, {
          toValue: 8, 
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start(() => {
        // Stop pulses when spin finishes
        p1.stop();
        p2.stop();
        p3.stop();
        setShowPulse(false);

        Animated.sequence([
          Animated.spring(iconScale, {
            toValue: 1,
            tension: 120,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(textTranslateY, {
              toValue: 0,
              tension: 50,
              friction: 6,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(1200),
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        ]).start(() => {
          setIsFinishing(true);
          onAnimationDone();
        });
      });
    });
  }, []);

  const spinInterpolation = boxSpin.interpolate({
    inputRange: [0, 1, 8],
    outputRange: ['0deg', '360deg', '2880deg'], 
  });

  // Helper to generate styles for each pulse ring
  const getPulseStyle = (animValue: Animated.Value) => {
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.5] // Ring scales up from 100x100 to 250x250
    });
    const opacity = animValue.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0.6, 0.2, 0] // Fades out nicely
    });
    return {
      opacity,
      transform: [{ scale }]
    };
  };

  return (
    <Animated.View 
      style={[styles.container, { opacity: splashOpacity }]} 
      pointerEvents={isFinishing ? 'none' : 'auto'}
    >
      <View style={styles.contentWrapper}>
        
        {/* GROUP TRANSLATEX: Box and Pulses move horizontally together! */}
        <Animated.View style={{ transform: [{ translateX: boxTranslateX }], alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          
          {/* Pulsing rings rendered BEHIND the main box */}
          {showPulse && (
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', zIndex: 1 }]}>
              <Animated.View style={[styles.pulseRing, getPulseStyle(pulse1)]} />
              <Animated.View style={[styles.pulseRing, getPulseStyle(pulse2)]} />
              <Animated.View style={[styles.pulseRing, getPulseStyle(pulse3)]} />
            </View>
          )}

          {/* Core Spinning Box */}
          <Animated.View
            style={[
              styles.roundedBox,
              { transform: [{ rotate: spinInterpolation }] },
            ]}
          >
            {/* Logo reveals AFTER the pulses and spinning stop */}
            {!showPulse && (
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <Activity size={56} color="#FFFFFF" strokeWidth={2.5} />
              </Animated.View>
            )}
          </Animated.View>

        </Animated.View>
        
        <Animated.View 
          style={[
            styles.textContainer, 
            { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }
          ]}
        >
          <Text style={styles.title}>Kinetic Pulse</Text>
        </Animated.View>

      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: '#F8FAFC',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 100, 
    height: 100,
    borderRadius: 28, // Matches the box radius!
    backgroundColor: '#93C5FD',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  roundedBox: {
    width: 100, height: 100,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom moved to parent wrapper so absolute pulse centers correctly
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10, // above the pulses
  },
  textContainer: { alignItems: 'center' },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
});
