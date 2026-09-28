import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

// Splash "Langkah." — wordmark huruf besar sesuai desain splash,
// fade + scale halus, singkat, lalu fade out.
export const SplashScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, tension: 80, friction: 11, useNativeDriver: true }),
      ]),
      Animated.delay(560),
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]);
    seq.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => seq.stop();
  }, [onDone, opacity, scale]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.wordWrap, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.word}>LANGKAH</Text>
        <View style={styles.dot} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordWrap: { flexDirection: 'row', alignItems: 'flex-end' },
  word: {
    fontSize: 30,
    fontFamily: fonts.extraBold,
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 3,
    marginBottom: 6,
  },
});
