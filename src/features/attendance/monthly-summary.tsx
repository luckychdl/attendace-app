import { StyleSheet, View } from 'react-native';

import type { MonthlySummary as MonthlySummaryData } from '@/api/types';
import { Card } from '@/components/card';
import { Figure } from '@/components/figure';
import { ThemedText } from '@/components/themed-text';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * 달의 머리말. 이 달에 일한 시간이 주인공이고, 그 아래 날수 셋이 받친다.
 * 지각·조퇴는 하루라도 있으면 색이 붙는다 — 0이면 색까지 조용하다.
 */
export function MonthlySummary({ summary }: { summary: MonthlySummaryData | null }) {
  const theme = useTheme();
  const worked = splitDuration(summary?.totalWorkedMinutes);

  return (
    <Card lift="mid" style={styles.block}>
      <View style={styles.headline}>
        <ThemedText type="label" themeColor="inkMuted">
          이 달 근무시간
        </ThemedText>
        <Figure value={worked.value} unit={worked.unit} size={40} />
      </View>

      <View style={[styles.tiles, { borderTopColor: theme.hairline }]}>
        <Tile label="근무일" value={summary?.workedDays} />
        <View style={[styles.divider, { backgroundColor: theme.hairline }]} />
        <Tile label="지각" value={summary?.lateDays} alert />
        <View style={[styles.divider, { backgroundColor: theme.hairline }]} />
        <Tile label="조퇴" value={summary?.earlyLeaveDays} alert />
      </View>
    </Card>
  );
}

function Tile({
  label,
  value,
  alert,
}: {
  label: string;
  value: number | undefined;
  /** 0보다 크면 짚어 줄 값인지 */
  alert?: boolean;
}) {
  const tone: ThemeColor | undefined = alert && value ? 'warn' : undefined;

  return (
    <View style={styles.tile}>
      <Figure
        value={value == null ? '—' : String(value)}
        unit={value == null ? undefined : '일'}
        size={22}
        themeColor={tone}
      />
      <ThemedText type="caption" themeColor={tone ?? 'inkMuted'}>
        {label}
      </ThemedText>
    </View>
  );
}

/** 8시간 32분을 숫자 한 덩이와 한글 단위로 쪼갠다. */
function splitDuration(minutes: number | null | undefined) {
  if (minutes == null) return { value: '—', unit: undefined };
  const abs = Math.max(0, Math.round(minutes));
  return { value: String(Math.floor(abs / 60)), unit: `시간 ${abs % 60}분` };
}

const styles = StyleSheet.create({
  block: {
    padding: Spacing.five,
    gap: Spacing.four,
  },
  headline: {
    gap: Spacing.one,
  },
  tiles: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.four,
  },
  tile: {
    flex: 1,
    gap: 1,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginRight: Spacing.four,
  },
});
