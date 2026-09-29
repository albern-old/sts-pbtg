import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  DialogOptions,
  settleDialog,
  subscribeToDialog,
} from '../../services/dialog';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

// Host modal untuk dialog in-app (lihat src/services/dialog.ts).
// Dipasang sekali di root App, selalu mounted, animasi fade.
export const DialogHost: React.FC = () => {
  const [request, setRequest] = useState<DialogOptions | null>(null);

  useEffect(() => subscribeToDialog(setRequest), []);

  if (!request) return null;

  const isConfirm = Boolean(request.cancelLabel);
  const confirmLabel = request.confirmLabel ?? 'OK';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => settleDialog(false)}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{request.title}</Text>
          {request.message ? (
            <Text style={styles.message}>{request.message}</Text>
          ) : null}
          <View
            style={[
              styles.actions,
              isConfirm ? styles.actionsPair : styles.actionsSingle,
            ]}
          >
            {isConfirm && request.cancelLabel ? (
              <TouchableOpacity
                testID="dialog-cancel"
                accessibilityRole="button"
                style={styles.button}
                onPress={() => settleDialog(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonNeutralLabel}>{request.cancelLabel}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              testID="dialog-confirm"
              accessibilityRole="button"
              style={[
                styles.button,
                request.destructive ? styles.buttonDanger : styles.buttonPrimary,
              ]}
              onPress={() => settleDialog(true)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.buttonLabel,
                  request.destructive ? styles.buttonDangerLabel : undefined,
                ]}
              >
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceLowest,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    gap: 8,
    boxShadow: '0px 10px 48px rgba(11,28,48,0.18)',
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
  },
  message: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionsPair: {
    flexDirection: 'row-reverse',
  },
  actionsSingle: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.dangerSoft,
  },
  buttonLabel: {
    fontSize: 14.5,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  buttonDangerLabel: {
    color: colors.danger,
  },
  buttonNeutralLabel: {
    fontSize: 14.5,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
});
