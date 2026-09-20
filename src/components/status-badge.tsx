import { StyleSheet, View } from 'react-native';

import type { AttendanceStatus } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/attendance-rules';

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const theme = useTheme();
  const tone = STATUS_TONE[status];

  return (
    <View style={[styles.badge, { backgroundColor: theme[`${tone}Muted`] }]}>
      <ThemedText type="smallBold" style={{ color: theme[tone] }}>
        {STATUS_LABEL[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    alignSelf: 'flex-start',
  },
});
