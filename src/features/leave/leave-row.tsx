import { Pressable, StyleSheet, View } from 'react-native';

import type { LeaveRequest } from '@/api/types';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  describeLeave,
  formatDays,
  formatLeaveHours,
  formatLeavePeriod,
  LEAVE_STATUS_LABEL,
  LEAVE_STATUS_TONE,
} from '@/lib/leave-rules';

type LeaveRowProps = {
  leave: LeaveRequest;
  /** 결재함에서는 누가 신청했는지가 먼저다. */
  showApplicant?: boolean;
  /** 누르면 할 일. 없으면 누를 수 없는 줄이 된다. */
  onPress?: () => void;
  accessibilityHint?: string;
  /** 줄 아래에 붙는 버튼 묶음 (승인·반려) */
  children?: React.ReactNode;
};

/** 휴가 신청 한 건. 기간, 종류와 일수(시차는 시간), 결재 상태. */
export function LeaveRow({
  leave,
  showApplicant,
  onPress,
  accessibilityHint,
  children,
}: LeaveRowProps) {
  const theme = useTheme();

  const detail = [
    showApplicant ? leave.employeeName : null,
    describeLeave(leave),
    leave.type === 'hourly' ? formatLeaveHours(leave.days) : `${formatDays(leave.days)}일`,
    leave.reason,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityHint={accessibilityHint}
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.head, { opacity: pressed ? 0.6 : 1 }]}>
        <View style={styles.text}>
          <ThemedText type="heading">
            {formatLeavePeriod(leave.startDate, leave.endDate)}
          </ThemedText>
          <ThemedText type="caption" themeColor="inkMuted">
            {detail}
          </ThemedText>
          {leave.decidedBy && leave.status !== 'pending' && leave.status !== 'cancelled' ? (
            <ThemedText type="caption" themeColor="inkMuted">
              {leave.decidedBy} {LEAVE_STATUS_LABEL[leave.status]}
            </ThemedText>
          ) : null}
        </View>

        {showApplicant ? null : (
          <StatusPill
            tone={LEAVE_STATUS_TONE[leave.status]}
            label={LEAVE_STATUS_LABEL[leave.status]}
          />
        )}
      </Pressable>

      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
