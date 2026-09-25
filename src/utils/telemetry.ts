import {
  ActivityLevel,
  BMICategoryInfo,
  BMICategoryType,
  BodyFatCategoryInfo,
  Gender,
  GenderPhysiologyInfo,
  HeartRateZone,
  TelemetryMetrics,
} from '../types';

export function getBMICategory(bmi: number, gender: Gender = 'male'): BMICategoryInfo {
  if (gender === 'male') {
    if (bmi < 18.5) {
      return {
        type: 'underweight',
        label: 'Kurus',
        badge: 'Di Bawah Normal',
        color: '#3B82F6',
        lightBg: 'rgba(59, 130, 246, 0.1)',
        borderAccent: '#3B82F6',
        range: '< 18.5',
        minVal: 0,
        maxVal: 18.5,
        summary: 'Indeks massa tubuh di bawah batas ideal pria. Kerap disertai massa otot rangka rendah dan defisit cadangan energi.',
        athleticAdvice: 'Fokus pada latihan beban compound (squat, bench press, deadlift, overhead press) 3-4x seminggu untuk memicu hormon testosteron dan hipertrofi otot.',
        nutritionAdvice: 'Surplus kalori terukur +400-500 kkal per hari dengan asupan protein 1.8-2.2g/kg berat badan dan karbohidrat kompleks berkualitas tinggi.',
        riskNotice: 'Rentan terhadap penurunan imunitas, atrofi otot, dan penurunan kepadatan tulang aksial.',
        genderFocusTitle: 'Protokol Pria: Hipertrofi Otot Rangka & Penguatan Testosteron',
        obesityStandardNotice: 'Standar Obesitas Lemak Pria: ≥ 25% (Rentang Sehat Normal Pria: 10% – 20%).',
      };
    }
    if (bmi <= 24.9) {
      return {
        type: 'normal',
        label: 'Normal',
        badge: 'Rentang Ideal',
        color: '#3B82F6',
        lightBg: 'rgba(59, 130, 246, 0.1)',
        borderAccent: '#3B82F6',
        range: '18.5 – 24.9',
        minVal: 18.5,
        maxVal: 24.9,
        summary: 'Komposisi massa tubuh seimbang dengan rasio massa otot dan lemak optimal khas pria dewasa prima.',
        athleticAdvice: 'Pertahankan periodisasi latihan: padukan latihan resistensi beban progresif dengan kardio aerobik Zona 2 untuk menjaga elastisitas vaskular.',
        nutritionAdvice: 'Pola makan isokalorik seimbang dengan rasio makronutrien 45% karbohidrat, 30% protein, dan 25% lemak sehat esensial.',
        riskNotice: 'Profil risiko kardiovaskular terendah dengan fungsi endotel dan sensitivitas insulin prima.',
        genderFocusTitle: 'Protokol Pria: Pemeliharaan Komposisi Atletik Fungsional',
        obesityStandardNotice: 'Standar Obesitas Lemak Pria: ≥ 25% (Rentang Sehat Normal Pria: 10% – 20%).',
      };
    }
    if (bmi <= 29.9) {
      return {
        type: 'overweight',
        label: 'Gemuk',
        badge: 'Kelebihan Beban',
        color: '#F59E0B',
        lightBg: 'rgba(245, 158, 11, 0.1)',
        borderAccent: '#F59E0B',
        range: '25.0 – 29.9',
        minVal: 25.0,
        maxVal: 29.9,
        summary: 'Kelebihan massa tubuh pria berpotensi terakumulasi sebagai lemak viseral intra-abdominal (tipe apel) yang membebani pembuluh darah.',
        athleticAdvice: 'Tingkatkan latihan kardio Zona 2 (45-60 menit, 3-4x seminggu) dikombinasikan dengan latihan sirkuit beban untuk membakar lemak viseral tanpa mengorbankan otot bebas lemak.',
        nutritionAdvice: 'Defisit kalori 350-450 kkal, perbanyak protein tanpa lemak (ikan, dada ayam, tempe), dan batasi alkohol serta gula cair yang memicu lemak perut.',
        riskNotice: 'Waspadai lingkar pinggang > 90 cm; risiko peningkatan trigliserida darah dan hipertensi esensial.',
        genderFocusTitle: 'Protokol Pria: Oksidasi Lemak Viseral Sentral & Retensi Otot',
        obesityStandardNotice: 'Standar Obesitas Lemak Pria: ≥ 25% (Ambang Bahaya Lingkar Perut Pria > 90 cm).',
      };
    }
    return {
      type: 'obese',
      label: 'Obesitas',
      badge: 'Kategori Kritis',
      color: '#EF4444',
      lightBg: 'rgba(239, 68, 68, 0.1)',
      borderAccent: '#EF4444',
      range: '≥ 30.0',
      minVal: 30.0,
      maxVal: 50.0,
      summary: 'Beban massa tubuh tinggi pada pria yang memberikan tekanan mekanis aksial pada persendian dan resistensi vaskular sistemik tinggi.',
      athleticAdvice: 'Gunakan olahraga rendah beban sendi (low-impact) seperti jalan cepat kemiringan (incline walking), sepeda statis, atau mendayung (rowing). Hindari lompat/sprint keras untuk melindungi lutut & pinggang.',
      nutritionAdvice: 'Program hipokalorik terukur (defisit 500-600 kkal), kontrol porsi ketat dengan makanan kaya mikronutrien zinc & magnesium, cukupi air putih minimal 3.2L/hari.',
      riskNotice: 'Risiko tinggi perlemakan hati (fatty liver), sleep apnea, hiperkolesterol, dan resistensi insulin viseral.',
      genderFocusTitle: 'Protokol Pria: Dekompresi Kardiovaskular & Reduksi Lemak Viseral',
      obesityStandardNotice: 'Standar Obesitas Pria: Lemak Tubuh ≥ 25% & Lingkar Pinggang > 90 cm (Kategori Obesitas Sentral/Viseral).',
    };
  } else {
    // FEMALE / WANITA
    if (bmi < 18.5) {
      return {
        type: 'underweight',
        label: 'Kurus',
        badge: 'Di Bawah Normal',
        color: '#3B82F6',
        lightBg: 'rgba(59, 130, 246, 0.1)',
        borderAccent: '#3B82F6',
        range: '< 18.5',
        minVal: 0,
        maxVal: 18.5,
        summary: 'Indeks massa tubuh berada di bawah batas sehat wanita. Berisiko mengganggu regulasi estrogen dan kepadatan mineral tulang.',
        athleticAdvice: 'Latihan penguatan otot berbasis beban tubuh atau resistensi ringan (pilates, bodyweight training) guna merangsang regenerasi kepadatan tulang tanpa memicu stres kortisol tinggi.',
        nutritionAdvice: 'Surplus kalori padat nutrisi +300-400 kkal, konsumsi lemak sehat (alpukat, kacang almond, minyak zaitun) untuk menjaga fungsi reproduksi dan siklus hormonal teratur.',
        riskNotice: 'Rentan terhadap gangguan siklus menstruasi (amenore hipotalamik), risiko osteopenia dini, dan defisiensi zat besi.',
        genderFocusTitle: 'Protokol Wanita: Kepadatan Tulang & Keseimbangan Hormon Estrogen',
        obesityStandardNotice: 'Standar Obesitas Lemak Wanita: ≥ 32% (Wanita membutuhkan lemak esensial 10% - 13%).',
      };
    }
    if (bmi <= 24.9) {
      return {
        type: 'normal',
        label: 'Normal',
        badge: 'Rentang Ideal',
        color: '#3B82F6',
        lightBg: 'rgba(59, 130, 246, 0.1)',
        borderAccent: '#3B82F6',
        range: '18.5 – 24.9',
        minVal: 18.5,
        maxVal: 24.9,
        summary: 'Komposisi tubuh wanita yang ideal dengan cadangan lemak esensial prima untuk metabolisme dan keseimbangan endokrin.',
        athleticAdvice: 'Kombinasikan latihan ketahanan kardiovaskular dengan penguatan otot core dan panggul. Manfaatkan efisiensi alami wanita dalam recovery otot antar sesi latihan.',
        nutritionAdvice: 'Pola makan padat gizi seimbang: penuhi kebutuhan zat besi (mencegah anemia lelah), kalsium, dan vitamin D3 untuk proteksi tulang jangka panjang.',
        riskNotice: 'Profil kesehatan prima dengan stabilitas hormonal, densitas tulang optimal, dan risiko metabolik sangat rendah.',
        genderFocusTitle: 'Protokol Wanita: Daya Tahan Oksidatif & Keseimbangan Endokrin',
        obesityStandardNotice: 'Standar Obesitas Lemak Wanita: ≥ 32% (Rentang Sehat Normal Wanita: 18% – 28%).',
      };
    }
    if (bmi <= 29.9) {
      return {
        type: 'overweight',
        label: 'Gemuk',
        badge: 'Kelebihan Beban',
        color: '#F59E0B',
        lightBg: 'rgba(245, 158, 11, 0.1)',
        borderAccent: '#F59E0B',
        range: '25.0 – 29.9',
        minVal: 25.0,
        maxVal: 29.9,
        summary: 'Kelebihan massa tubuh pada wanita umumnya terdistribusi di panggul, paha, dan subkutan. Memerlukan perhatian pada sudut panggul (Q-Angle) lutut.',
        athleticAdvice: 'Manfaatkan keunggulan alami wanita dalam oksidasi lemak saat latihan intensitas Zona 2 (60-70% HRmax). Sertakan latihan penguatan gluteus medius dan hamstring untuk menstabilkan sendi lutut.',
        nutritionAdvice: 'Terapkan defisit kalori moderat 300-400 kkal. Hindari diet ekstrem/lapar yang memicu stres hormonal (RED-S), perbanyak serat sayuran dan protein nabati/hewani seimbang.',
        riskNotice: 'Waspadai lingkar pinggang > 80 cm; tekanan berlebih pada persendian patellofemoral lutut saat menaiki tangga atau melompat.',
        genderFocusTitle: 'Protokol Wanita: Optimalisasi Oksidasi Lemak & Stabilitas Sendi Pelvis',
        obesityStandardNotice: 'Standar Obesitas Lemak Wanita: ≥ 32% (Ambang Bahaya Lingkar Perut Wanita > 80 cm).',
      };
    }
    return {
      type: 'obese',
      label: 'Obesitas',
      badge: 'Kategori Kritis',
      color: '#EF4444',
      lightBg: 'rgba(239, 68, 68, 0.1)',
      borderAccent: '#EF4444',
      range: '≥ 30.0',
      minVal: 30.0,
      maxVal: 50.0,
      summary: 'Beban massa tubuh tinggi pada wanita yang memperbesar sudut valgus lutut (Q-Angle) dan memicu kelelahan pada ligamen kaki.',
      athleticAdvice: 'Prioritaskan olahraga tanpa beban gravitasi (zero-impact) seperti renang, aqua aerobics, atau sepeda statis. Hindari lari jalanan aspal pada awal fase untuk melindungi meniskus dan tendon lutut.',
      nutritionAdvice: 'Defisit terukur 400-500 kkal dengan supervisi gizi, cukupi kalsium (1000mg/hari) dan asam folat, perbanyak makanan anti-inflamasi alami (jahe, teh hijau, sayuran silangan).',
      riskNotice: 'Beban berat pada sendi panggul-lutut, risiko sindrom metabolik, resistensi insulin, dan fluktuasi hormon estrogen.',
      genderFocusTitle: 'Protokol Wanita: Proteksi Sendi Lutut (Q-Angle) & Oksidasi Lemak Subkutan',
      obesityStandardNotice: 'Standar Obesitas Wanita: Lemak Tubuh ≥ 32% & Lingkar Pinggang > 80 cm (Kategori Obesitas Subkutan-Perifer).',
    };
  }
}

export function getBodyFatCategory(bf: number, gender: Gender): BodyFatCategoryInfo {
  if (gender === 'male') {
    if (bf < 10) {
      return {
        status: 'low',
        label: 'Sangat Kering',
        badge: 'Level Atletik',
        color: '#3B82F6',
        thresholdNotice: 'Pria < 10% (Kategori Binaraga / Atletik Ekstrem)',
        description: 'Kadar lemak sangat rendah, cocok untuk kompetisi tetapi perlu dijaga agar tidak menurunkan hormon testosteron.',
      };
    }
    if (bf <= 20) {
      return {
        status: 'optimal',
        label: 'Optimal',
        badge: 'Kebugaran Prima',
        color: '#3B82F6',
        thresholdNotice: 'Pria 10% – 20% (Rentang Sehat Ideal Pria)',
        description: 'Komposisi lemak sehat untuk pria dengan profil vaskular dan metabolisme prima.',
      };
    }
    if (bf <= 24.9) {
      return {
        status: 'overfat',
        label: 'Ambang Batas',
        badge: 'Kelebihan Lemak',
        color: '#F59E0B',
        thresholdNotice: 'Pria 21% – 24.9% (Mendekati Batas Obesitas Pria)',
        description: 'Kelebihan lemak mulai terdeteksi. Disarankan meningkatkan kardio Zona 2 dan defisit kalori moderat.',
      };
    }
    return {
      status: 'obese',
      label: 'Obesitas Lemak',
      badge: 'Ambang Klinis Pria',
      color: '#EF4444',
      thresholdNotice: 'Pria ≥ 25% (Standar Obesitas Lemak Klinis Pria)',
      description: 'Persentase lemak tubuh pria melampaui batas sehat 25%, berisiko tinggi memicu penumpukan lemak viseral dan resistensi metabolik.',
    };
  } else {
    // FEMALE
    if (bf < 18) {
      return {
        status: 'low',
        label: 'Rendah',
        badge: 'Level Atletik',
        color: '#3B82F6',
        thresholdNotice: 'Wanita < 18% (Lemak Esensial Minimum: 10-13%)',
        description: 'Kadar lemak sangat rendah untuk wanita. Pantau asupan kalori agar siklus hormonal estrogen tetap stabil.',
      };
    }
    if (bf <= 28) {
      return {
        status: 'optimal',
        label: 'Optimal',
        badge: 'Kebugaran Prima',
        color: '#3B82F6',
        thresholdNotice: 'Wanita 18% – 28% (Rentang Sehat Ideal Wanita)',
        description: 'Komposisi lemak tubuh ideal untuk wanita yang menjaga keseimbangan estrogen, stamina, dan metabolisme optimal.',
      };
    }
    if (bf <= 31.9) {
      return {
        status: 'overfat',
        label: 'Ambang Batas',
        badge: 'Kelebihan Lemak',
        color: '#F59E0B',
        thresholdNotice: 'Wanita 29% – 31.9% (Mendekati Batas Obesitas Wanita)',
        description: 'Kadar lemak mendekati batas obesitas wanita. Prioritaskan latihan kardio pembakaran lemak berkelanjutan.',
      };
    }
    return {
      status: 'obese',
      label: 'Obesitas Lemak',
      badge: 'Ambang Klinis Wanita',
      color: '#EF4444',
      thresholdNotice: 'Wanita ≥ 32% (Standar Obesitas Lemak Klinis Wanita)',
      description: 'Persentase lemak tubuh wanita melampaui ambang batas sehat 32%. Memerlukan protokol proteksi sendi lutut dan defisit kalori terukur.',
    };
  }
}

export function calculateTelemetry(
  heightCm: number,
  weightKg: number,
  age: number,
  gender: Gender,
  activity: ActivityLevel = 'moderate'
): TelemetryMetrics {
  const heightM = heightCm / 100;
  const bmiRaw = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const bmi = Math.round(bmiRaw * 10) / 10;

  // Kategori BMI sensitif gender dengan rekomendasi klinis & latihan terpisah
  const category = getBMICategory(bmi, gender);

  // Rentang berat badan ideal sensitif gender (massa otot & densitas tulang pria lebih padat)
  // Pria: BMI 19.5 - 24.5 | Wanita: BMI 18.5 - 23.5
  const idealBmiMin = gender === 'male' ? 19.5 : 18.5;
  const idealBmiMax = gender === 'male' ? 24.5 : 23.5;
  const idealWeightMin = Math.round(idealBmiMin * heightM * heightM * 10) / 10;
  const idealWeightMax = Math.round(idealBmiMax * heightM * heightM * 10) / 10;

  let weightDeltaToNormal = 0;
  if (weightKg > idealWeightMax) {
    weightDeltaToNormal = Math.round((weightKg - idealWeightMax) * 10) / 10;
  } else if (weightKg < idealWeightMin) {
    weightDeltaToNormal = Math.round((weightKg - idealWeightMin) * 10) / 10;
  }

  // Basal Metabolic Rate (BMR) - Formula Mifflin-St Jeor
  // Pria: 10W + 6.25H - 5A + 5
  // Wanita: 10W + 6.25H - 5A - 161 (selisih ~166 kkal karena massa otot bebas lemak pria rata-rata lebih tinggi)
  let bmrRaw: number;
  if (gender === 'male') {
    bmrRaw = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmrRaw = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  const bmr = Math.max(800, Math.round(bmrRaw));

  // TDEE Multipliers (Standar Harris-Benedict & Mifflin-St Jeor)
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };
  const activityMultiplier = activityMultipliers[activity] || 1.55;
  const tdee = Math.round(bmr * activityMultiplier);
  const activityCalories = Math.max(0, tdee - bmr);

  // Deurenberg Body Fat Formula:
  // %BF = (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4 (Sex: male = 1, female = 0)
  const sexFactor = gender === 'male' ? 1 : 0;
  const bfRaw = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  const bodyFatPercentage = Math.max(5, Math.min(60, Math.round(bfRaw * 10) / 10));
  const bodyFatCategory = getBodyFatCategory(bodyFatPercentage, gender);

  // Hidrasi yang direkomendasikan berbasis Berat Badan & Tingkat Aktivitas
  const hydrationBonuses: Record<ActivityLevel, number> = {
    sedentary: 0.1,
    light: 0.3,
    moderate: 0.6,
    active: 0.9,
    athlete: 1.4,
  };
  const hydrationActivityBonus = hydrationBonuses[activity] || 0.6;
  const baseWater = (weightKg * 35) / 1000;
  const waterIntakeLiters = Math.round((baseWater + hydrationActivityBonus) * 10) / 10;

  // Formula Detak Jantung Maksimal (HRmax) Spesifik Gender:
  // Pria: Formula Tanaka / Fox (JACC): HRmax = 208 - (0.7 × Usia)
  // Wanita: Formula Klinis Gulati (Circulation 2010): HRmax = 206 - (0.88 × Usia)
  let maxHeartRate: number;
  let hrFormulaName: string;
  if (gender === 'female') {
    maxHeartRate = Math.max(120, Math.round(206 - 0.88 * age));
    hrFormulaName = 'Formula Klinis Gulati (Standar Wanita: 206 - 0.88×Usia)';
  } else {
    maxHeartRate = Math.max(120, Math.round(208 - 0.7 * age));
    hrFormulaName = 'Formula Tanaka (Standar Pria: 208 - 0.7×Usia)';
  }

  // Zona Detak Jantung Latihan dengan Tips Fisiologis Khusus Gender
  const heartRateZones: HeartRateZone[] = [
    {
      zone: 1,
      name: 'Recovery & Warm-up',
      rangePercentage: '50% - 60%',
      bpmRange: `${Math.round(maxHeartRate * 0.5)} - ${Math.round(maxHeartRate * 0.6)} bpm`,
      intensity: 'Light Effort',
      color: '#3B82F6',
      description: 'Restorasi aktif, oksigenasi jaringan sel, pemanasan dan pendinginan sendi.',
      genderTip:
        gender === 'female'
          ? 'Sangat baik untuk sirkulasi mikrovaskular dan mencegah kekakuan sendi panggul.'
          : 'Gunakan untuk pemanasan mobilitas panggul dan hamstring sebelum angkat beban.',
    },
    {
      zone: 2,
      name: 'Fat Oxidation & Base',
      rangePercentage: '60% - 70%',
      bpmRange: `${Math.round(maxHeartRate * 0.6)} - ${Math.round(maxHeartRate * 0.7)} bpm`,
      intensity: 'Moderate Endurance',
      color: '#3B82F6',
      description: 'Zona emas pembakaran lemak dan ekspansi kepadatan mitokondria otot.',
      genderTip:
        gender === 'female'
          ? '🌟 Zona Emas Wanita: Fisiologi wanita membakar asam lemak 15% lebih efisien di zona ini.'
          : '🌟 Zona Emas Pria: Efektif mengikis timbunan lemak viseral intra-abdominal tanpa mengikis massa otot.',
    },
    {
      zone: 3,
      name: 'Aerobic Power',
      rangePercentage: '70% - 80%',
      bpmRange: `${Math.round(maxHeartRate * 0.7)} - ${Math.round(maxHeartRate * 0.8)} bpm`,
      intensity: 'Tempo / Aerobik',
      color: '#84CC16',
      description: 'Peningkatan volume sekuncup jantung dan ekspansi kapasitas kardiopulmonal.',
      genderTip:
        gender === 'female'
          ? 'Membangun daya tahan aerobik stabil untuk aktivitas lari santai atau senam dinamis.'
          : 'Meningkatkan kapasitas pompa jantung dan ambang stamina olahraga kompetitif.',
    },
    {
      zone: 4,
      name: 'Lactate Threshold',
      rangePercentage: '80% - 90%',
      bpmRange: `${Math.round(maxHeartRate * 0.8)} - ${Math.round(maxHeartRate * 0.9)} bpm`,
      intensity: 'Hard / Threshold',
      color: '#F59E0B',
      description: 'Daya tahan otot tinggi di bawah akumulasi laktat, penjagaan kecepatan lomba.',
      genderTip:
        gender === 'female'
          ? 'Latihan tempo interval terukur; pastikan hidrasi dan elektrolit mencukupi.'
          : 'Meningkatkan ambang akumulasi asam laktat untuk kecepatan lari jarak menengah.',
    },
    {
      zone: 5,
      name: 'Neuromuscular Peak',
      rangePercentage: '90% - 100%',
      bpmRange: `${Math.round(maxHeartRate * 0.9)} - ${maxHeartRate} bpm`,
      intensity: 'Maksimum Sprint',
      color: '#EF4444',
      description: 'Kekuatan anaerobik eksplosif, output sprint maksimum & kapasitas VO2 max.',
      genderTip:
        gender === 'female'
          ? 'Interval singkat (15-30 detik); beri jeda istirahat penuh untuk menjaga stabilitas postur.'
          : 'Puncak daya ledak anaerobik; hindari durasi terlalu lama untuk mencegah kelelahan saraf motorik.',
    },
  ];

  const genderPhysiology: GenderPhysiologyInfo = {
    gender,
    genderLabel: gender === 'male' ? 'Pria' : 'Wanita',
    hrFormulaName,
    bodyFatThresholds:
      gender === 'male'
        ? 'Normal: 10%–20% • Ambang Obesitas: ≥25%'
        : 'Normal: 18%–28% • Ambang Obesitas: ≥32%',
    obesityStandardNotice:
      gender === 'male'
        ? 'Standar Obesitas Pria: Lemak ≥ 25% | Lingkar Pinggang > 90 cm (Kecenderungan Lemak Viseral Sentral / Tipe Apel)'
        : 'Standar Obesitas Wanita: Lemak ≥ 32% | Lingkar Pinggang > 80 cm (Kecenderungan Lemak Subkutan Perifer / Tipe Pir & Beban Sendi Lutut Q-Angle)',
    trainingFocusTitle:
      gender === 'male'
        ? 'Protokol Latihan Pria: Pembakaran Lemak Viseral & Beban Progresif'
        : 'Protokol Latihan Wanita: Proteksi Sendi Lutut & Oksidasi Lemak Maksimal',
    trainingFocusDesc:
      gender === 'male'
        ? 'Pria memiliki massa otot lebih tinggi dan kapasitas glikolitik kuat. Prioritaskan latihan beban compound untuk mengaktifkan hormon anabolik + Kardio Zona 2 untuk melunturkan lemak perut.'
        : 'Wanita memiliki efisiensi pembakaran lemak lebih tinggi di Zona 2 dan recovery lebih cepat. Prioritaskan olahraga low-impact untuk melindungi sendi lutut (Q-Angle) + penguatan gluteus & panggul.',
    nutritionFocusTitle:
      gender === 'male'
        ? 'Fokus Nutrisi Pria: Protein Tinggi & Kontrol Lemak Jenuh'
        : 'Fokus Nutrisi Wanita: Kalsium, Zat Besi & Keseimbangan Estrogen',
    nutritionFocusDesc:
      gender === 'male'
        ? 'Kebutuhan protein 1.8-2.2g/kg untuk mencegah katabolisme otot. Batasi lemak jenuh dan alkohol yang memicu perlemakan viseral.'
        : 'Cukupi zat besi (cegah anemia saat olahraga) dan kalsium (proteksi densitas tulang). Hindari diet defisit ekstrem agar siklus hormon tetap teratur.',
  };

  return {
    bmi,
    category,
    idealWeightMin,
    idealWeightMax,
    weightDeltaToNormal,
    bmr,
    tdee,
    activityLevel: activity,
    activityMultiplier,
    activityCalories,
    hydrationActivityBonus,
    bodyFatPercentage,
    bodyFatCategory,
    genderPhysiology,
    waterIntakeLiters,
    maxHeartRate,
    heartRateZones,
  };
}
