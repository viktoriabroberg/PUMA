import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const CHART_HEIGHT = 120;

// Räknar hur många platser som sparats per månad de senaste `monthCount` månaderna
export function countPlacesPerMonth(places, monthCount = 6) {
  const now = new Date();
  const months = [];
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), count: 0 });
  }

  for (const place of places) {
    if (!place.created_at) continue;
    const created = new Date(place.created_at);
    const bucket = months.find(
      (m) => m.year === created.getFullYear() && m.month === created.getMonth()
    );
    if (bucket) bucket.count += 1;
  }

  return months;
}

// Stapeldiagram över sparade platser per månad. Tryck på en stapel för att se antalet i en tooltip.
export default function MonthlyPlacesChart({ data }) {
  // Ingen stapel är vald från början, ett nytt tryck på samma stapel stänger tooltipen
  const [selected, setSelected] = useState(null);
  const max = Math.max(1, ...data.map((m) => m.count));

  return (
    <View>
      <View style={styles.plot}>
        {data.map((m, i) => {
          const isSelected = i === selected;
          const height = m.count === 0 ? 2 : Math.max(4, (m.count / max) * CHART_HEIGHT);
          return (
            <Pressable
              key={`${m.year}-${m.month}`}
              onPress={() => setSelected(isSelected ? null : i)}
              // Vald kolumn ritas överst så att tooltipen inte hamnar bakom grannstaplarna
              style={[styles.column, isSelected && { zIndex: 1 }]}
              accessibilityRole="button"
              accessibilityLabel={`${MONTHS[m.month]} ${m.year}: ${m.count} platser`}
            >
              {isSelected && (
                <View style={[styles.tooltip, { bottom: height + 6 }]} pointerEvents="none">
                  <Text style={styles.tooltipValue}>
                    {m.count} {m.count === 1 ? 'plats' : 'platser'}
                  </Text>
                  <Text style={styles.tooltipDate}>{MONTHS[m.month]} {m.year}</Text>
                  <View style={styles.tooltipArrow} />
                </View>
              )}
              <View
                style={[
                  styles.bar,
                  { height, opacity: selected === null || isSelected ? 1 : 0.45 },
                  m.count === 0 && styles.barEmpty,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.axis}>
        {data.map((m, i) => (
          <Text
            key={`${m.year}-${m.month}`}
            style={[styles.axisLabel, i === selected && styles.axisLabelSelected]}
          >
            {MONTHS[m.month]}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    // Utrymme ovanför staplarna så att tooltipen får plats även över den högsta stapeln
    marginTop: 52,
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  column: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: {
    width: '60%',
    backgroundColor: COLORS.green,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barEmpty: { backgroundColor: COLORS.border, borderRadius: 1 },
  tooltip: {
    position: 'absolute',
    left: '50%',
    width: 84,
    marginLeft: -42,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.label,
    alignItems: 'center',
  },
  tooltipValue: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  tooltipDate: { fontSize: 11, color: '#FFFFFFB3' },
  tooltipArrow: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 8,
    backgroundColor: COLORS.label,
    transform: [{ rotate: '45deg' }],
  },
  axis: { flexDirection: 'row', gap: 2, marginTop: 6 },
  axisLabel: { flex: 1, textAlign: 'center', fontSize: 12, color: COLORS.secondaryLabel },
  axisLabelSelected: { color: COLORS.label, fontWeight: '600' },
});
