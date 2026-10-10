import { StyleSheet, View } from 'react-native';

import type { MonthlySummary as MonthlySummaryData } from '@/api/types';
import { Card } from '@/components/card';
import { Figure } from '@/components/figure';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * 달의 머리말. 이 달에 일한 시간이 주인공 카드이고, 그 아래 날수 셋이 타일로 받친다.
 * 지각·조퇴는 하루라도 있으면 타일째 색이 든다 — 0이면 색까지 조용하다.
 */
export function MonthlySummary({ summary }: { summary: MonthlySummaryData | null }) {
  const worked = splitDuration(summary?.totalWorkedMinutes);

  return (
    <View style={styles.block}>
      <Card lift="mid" radius={Radius.lg} style={styles.headline}>
        <ThemedText type="label" themeColor="inkMuted">
          이 달 근무시간
        </ThemedText>
        <Figure value={worked.value} unit={worked.unit} size={44} />
      </Card>

      <View style={styles.tiles}>
        <Tile label="근무일" value={summary?.workedDays} />
        <Tile label="지각" value={summary?.lateDays} alert />
        <Tile label="조퇴" value={summary?.earlyLeaveDays} alert />
      </View>
    </View>
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
  const theme = useTheme();
  const tone: ThemeColor | undefined = alert && value ? 'warn' : undefined;

  return (
    <Card style={[styles.tile, tone ? { backgroundColor: theme.warnSoft } : null]}>
      <Figure
        value={value == null ? '—' : String(value)}
        unit={value == null ? undefined : '일'}
        size={22}
        themeColor={tone}
      />
      <ThemedText type="caption" themeColor={tone ?? 'inkMuted'}>
        {label}
      </ThemedText>
    </Card>
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
    gap: Spacing.three,
  },
  headline: {
    padding: Spacing.five,
    gap: Spacing.one,
  },
  tiles: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  tile: {
    flex: 1,
    gap: 1,
  },
});
