import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
interface BiometricInputProps {
  label: string;
  sublabel?: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  decimalPlaces?: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  presets?: number[];
  secondaryBadge?: string;
}

export const BiometricInput: React.FC<BiometricInputProps> = ({
  label,
  sublabel,
  value,
  unit,
  min,
  max,
  step = 1,
  decimalPlaces = 0,
  onChange,
  icon,
  presets,
  secondaryBadge,
}) => {

  const [inputText, setInputText] = useState<string>(
    decimalPlaces > 0 ? value.toFixed(decimalPlaces) : Math.round(value).toString()
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sinkronisasi teks input jika nilai prop berubah dari luar (misal tombol reset/preset)
  useEffect(() => {
    if (!isFocused) {
      setInputText(
        decimalPlaces > 0 ? value.toFixed(decimalPlaces) : Math.round(value).toString()
      );
    }
  }, [value, isFocused, decimalPlaces]);

  const commitValue = (textToCommit: string) => {
    const cleaned = textToCommit.replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) {
      setInputText(
        decimalPlaces > 0 ? value.toFixed(decimalPlaces) : Math.round(value).toString()
      );
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    const finalVal =
      decimalPlaces > 0
        ? Math.round(clamped * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
        : Math.round(clamped);

    setInputText(
      decimalPlaces > 0 ? finalVal.toFixed(decimalPlaces) : finalVal.toString()
    );
    onChange(finalVal);
  };

  const handleTextChange = (text: string) => {
    // Izinkan angka dan satu tanda desimal (koma atau titik)
    const sanitized = text.replace(/[^0-9.,]/g, '');
    setInputText(sanitized);

    const cleaned = sanitized.replace(',', '.');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      const finalVal =
        decimalPlaces > 0
          ? Math.round(parsed * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
          : Math.round(parsed);
      onChange(finalVal);
    }
  };

  const handleDecrement = () => {
    const nextVal = Math.max(
      min,
      Math.round((value - step) * Math.pow(10, decimalPlaces || 1)) /
        Math.pow(10, decimalPlaces || 1)
    );
    onChange(nextVal);
    setInputText(
      decimalPlaces > 0 ? nextVal.toFixed(decimalPlaces) : nextVal.toString()
    );
  };

  const handleIncrement = () => {
    const nextVal = Math.min(
      max,
      Math.round((value + step) * Math.pow(10, decimalPlaces || 1)) /
        Math.pow(10, decimalPlaces || 1)
    );
    onChange(nextVal);
    setInputText(
      decimalPlaces > 0 ? nextVal.toFixed(decimalPlaces) : nextVal.toString()
    );
  };

  return (
    <View style={styles.cardContainer}>
      {/* Label & Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.labelGroup}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <View>
            <Text style={styles.label}>{label}</Text>
            {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
          </View>
        </View>

        {secondaryBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{secondaryBadge}</Text>
          </View>
        )}
      </View>

      {/* Input Pod & Stepper Buttons Row */}
      <View style={styles.stepperRow}>
        {/* Tombol Kurang (-) */}
        <TouchableOpacity
          style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
          activeOpacity={0.7}
        >
          <Minus size={18} color={value <= min ? '#94A3B8' : '#0F172A'} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Input Langsung Pod (Bisa Langsung Diketik) */}
        <View
          style={[
            styles.inputPod,
            isFocused && styles.inputPodFocused,
          ]}
        >
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              commitValue(inputText);
            }}
            onSubmitEditing={() => commitValue(inputText)}
            keyboardType={decimalPlaces > 0 ? 'decimal-pad' : 'number-pad'}
            returnKeyType="done"
            selectTextOnFocus
            placeholder={value.toString()}
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>{unit}</Text>
          </View>
        </View>

        {/* Tombol Tambah (+) */}
        <TouchableOpacity
          style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
          onPress={handleIncrement}
          disabled={value >= max}
          activeOpacity={0.7}
        >
          <Plus size={18} color={value >= max ? '#94A3B8' : '#0F172A'} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Quick Presets Chips (jika disediakan) */}
      {presets && presets.length > 0 && (
        <View style={styles.presetsContainer}>
          <Text style={styles.presetsTitle}>Preset Cepat:</Text>
          <View style={styles.presetsRow}>
            {presets.map((p) => {
              const isActive = Math.abs(value - p) < 0.1;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.presetChip, isActive && styles.presetChipActive]}
                  onPress={() => {
                    onChange(p);
                    setInputText(
                      decimalPlaces > 0 ? p.toFixed(decimalPlaces) : p.toString()
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sublabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  inputPod: {
    flex: 1,
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  inputPodFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    paddingVertical: 0,
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginLeft: 6,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  presetsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  presetsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
});
