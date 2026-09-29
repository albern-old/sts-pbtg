import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface BoundaryState {
  error: Error | null;
}

interface BoundaryProps {
  children?: React.ReactNode;
}

// Jaring pengaman: jika ada error fatal saat render, tampilkan layar fallback
// alih-alih aplikasi langsung crash ("mental") saat dibuka.
export class RootErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Ups, terjadi kesalahan</Text>
          <Text style={styles.message}>{String(error.message || error)}</Text>
          <Pressable style={styles.button} onPress={() => this.setState({ error: null })}>
            <Text style={styles.buttonText}>Coba Lagi</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: colors.ink500,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
