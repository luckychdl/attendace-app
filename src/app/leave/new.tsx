import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { leaveApi } from '@/api/leave';
import type { LeaveBalance, LeaveRequest, LeaveType } from '@/api/types';
import { AppButton } from '@/components/app-button';
import { Card } from '@/components/card';
import { Segmented } from '@/components/segmented';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Curve, Elevation, MaxContentWidth, Radius, Spacing, TouchTarget } from '@/constants/theme';
import { RangeCalendar, type DateRange } from '@/features/leave/range-calendar';
import { useEmployee } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useWorksite } from '@/hooks/use-worksite';
import { formatClock, minutesOfDay, toDateKey } from '@/lib/date';
import {
  countLeaveDays,
  datesInRange,
  describeLeave,
  formatDays,
  formatLeavePeriod,
  HOURLY_LEAVE_HOURS,
  hourlySlots,
  isActive,
  isSingleDay,
  LEAVE_TYPE_LABEL,
  overlaps,
  type TimeSlot,
} from '@/lib/leave-rules';

const TYPE_OPTIONS = (['annual', 'halfAm', 'halfPm', 'hourly'] as const).map((value) => ({
  value,
  label: LEAVE_TYPE_LABEL[value],
}));

const HOURS_OPTIONS = HOURLY_LEAVE_HOURS.map((value) => ({ value, label: `${value}시간` }));

const PROMPT: Record<LeaveType, string> = {
  annual: '휴가 첫날을 골라 주세요.',
  halfAm: '반차를 쓸 날을 골라 주세요.',
  halfPm: '반차를 쓸 날을 골라 주세요.',
  hourly: '시차를 쓸 날을 골라 주세요.',
};

export default function NewLeaveScreen() {
  const employee = useEmployee();
  const { worksite } = useWorksite();
  const theme = useTheme();
  const router = useRouter();
  const now = new Date();
  const today = toDateKey(now);

  const [type, setType] = useState<LeaveType>('annual');
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [hours, setHours] = useState<number>(HOURLY_LEAVE_HOURS[0]);
  const [slotStart, setSlotStart] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [existing, setExisting] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);

  const single = isSingleDay(type);
  const hourly = type === 'hourly';
  const startDate = range.start;
  const endDate = single ? range.start : (range.end ?? range.start);
  const balanceYear = Number((startDate ?? today).slice(0, 4));

  // 달력에 이미 잡힌 휴가를 찍어 두고 겹치는 시차 시간대를 막기 위해 오늘 이후의 살아 있는 신청을 읽는다.
  useEffect(() => {
    let cancelled = false;
    leaveApi
      .list(employee.id, today, `${Number(today.slice(0, 4)) + 1}-12-31`)
      .then((list) => {
        if (!cancelled) setExisting(list.filter(isActive));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [employee.id, today]);

  useEffect(() => {
    let cancelled = false;
    leaveApi
      .balance(employee.id, balanceYear)
      .then((next) => {
        if (!cancelled) setBalance(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [balanceYear, employee.id]);

  const markedDates = useMemo(
    () => new Set(existing.flatMap((leave) => datesInRange(leave.startDate, leave.endDate))),
    [existing],
  );

  const slots = useMemo(() => hourlySlots(worksite, hours), [worksite, hours]);

  /** 이미 지난 시간이거나 다른 휴가와 겹치는 시간대는 고를 수 없다. */
  const isSlotOpen = (slot: TimeSlot) => {
    if (!startDate) return true;
    if (startDate === today && slot.start <= (minutesOfDay(now) ?? 0)) return false;
    const candidate = {
      type: 'hourly' as const,
      startDate,
      endDate: startDate,
      startTime: formatClock(slot.start),
      endTime: formatClock(slot.end),
    };
    return !existing.some((leave) => overlaps(leave, candidate, worksite));
  };

  // 날짜나 시간을 바꿔서 고른 시간대가 막히면 선택이 풀린 것으로 본다.
  const slot = hourly ? slots.find((item) => item.start === slotStart && isSlotOpen(item)) : null;

  const days =
    startDate && endDate && (!hourly || slot)
      ? countLeaveDays(type, startDate, endDate, hourly ? hours : null)
      : 0;
  const after = balance ? balance.remaining - days : null;

  const handleTypeChange = (next: LeaveType) => {
    setType(next);
    // 하루짜리로 바꾸면 기간을 첫날 하루로 줄인다.
    if (isSingleDay(next) && range.start) setRange({ start: range.start, end: range.start });
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) return;
    setSubmitting(true);
    try {
      const saved = await leaveApi.request(
        {
          employeeId: employee.id,
          type,
          startDate,
          endDate,
          startTime: slot ? formatClock(slot.start) : null,
          hours: hourly ? hours : null,
          reason,
        },
        employee,
      );
      router.back();
      Alert.alert(
        saved.status === 'approved' ? '휴가가 등록되었습니다' : '신청했습니다',
        `${formatLeavePeriod(saved.startDate, saved.endDate)} ${describeLeave(saved)}\n${
          saved.status === 'approved' ? '바로 승인되었습니다.' : '팀장 결재를 기다립니다.'
        }`,
      );
    } catch (caught) {
      Alert.alert(
        '신청하지 못했습니다',
        caught instanceof Error ? caught.message : '잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const usage = hourly ? `${hours}시간 (${formatDays(days)}일)` : `${formatDays(days)}일`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <ThemedText type="heading" accessibilityRole="header">
            휴가 신청
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.close,
              Elevation.low,
              { backgroundColor: theme.surface, opacity: pressed ? 0.6 : 1 },
            ]}>
            <Ionicons name="close" size={20} color={theme.ink} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          <Segmented options={TYPE_OPTIONS} value={type} onChange={handleTypeChange} />

          <RangeCalendar
            value={range}
            onChange={setRange}
            single={single}
            minDate={today}
            markedDates={markedDates}
          />

          {hourly ? (
            <View style={styles.block}>
              <ThemedText type="label" themeColor="inkMuted">
                시간
              </ThemedText>
              <Segmented options={HOURS_OPTIONS} value={hours} onChange={setHours} />
              <View style={styles.slots}>
                {slots.map((item) => (
                  <SlotChip
                    key={item.start}
                    slot={item}
                    selected={slot?.start === item.start}
                    disabled={!isSlotOpen(item)}
                    onPress={() => setSlotStart(item.start)}
                  />
                ))}
              </View>
              <ThemedText type="caption" themeColor="inkMuted">
                점심시간(12–13시)은 시차에서 빠집니다.
              </ThemedText>
            </View>
          ) : null}

          <Card lift="mid" style={styles.summary}>
            {startDate && endDate ? (
              <>
                <ThemedText type="heading">
                  {formatLeavePeriod(startDate, endDate)}
                  {slot ? `  ${formatClock(slot.start)}–${formatClock(slot.end)}` : ''}
                </ThemedText>
                {hourly && !slot ? (
                  <ThemedText type="body" themeColor="inkMuted">
                    시간대를 골라 주세요.
                  </ThemedText>
                ) : (
                  <ThemedText type="body" themeColor="inkMuted">
                    {usage} 사용
                    {after != null ? `  ·  신청 후 남는 연차 ${formatDays(after)}일` : ''}
                  </ThemedText>
                )}
                {!single && !range.end ? (
                  <ThemedText type="caption" themeColor="inkMuted">
                    여러 날이면 마지막 날을 한 번 더 눌러 주세요.
                  </ThemedText>
                ) : null}
              </>
            ) : (
              <ThemedText type="body" themeColor="inkMuted">
                {PROMPT[type]}
              </ThemedText>
            )}
          </Card>

          <TextField
            label="사유 (선택)"
            placeholder={hourly ? '예: 은행 업무' : '예: 가족 여행'}
            value={reason}
            onChangeText={setReason}
            maxLength={100}
            returnKeyType="done"
          />

          <AppButton
            label={after != null && after < 0 ? '남은 연차가 부족해요' : '신청하기'}
            onPress={handleSubmit}
            loading={submitting}
            disabled={!startDate || days === 0 || (after != null && after < 0)}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** 시차 시간대 하나. 점심을 끼는 칸은 끝나는 시각이 한 시간 밀려 보인다. */
function SlotChip({
  slot,
  selected,
  disabled,
  onPress,
}: {
  slot: TimeSlot;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const label = `${formatClock(slot.start)}–${formatClock(slot.end)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} 시차`}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        disabled ? null : Elevation.low,
        {
          backgroundColor: theme.surface,
          opacity: disabled ? 0.35 : pressed && !selected ? 0.6 : 1,
        },
      ]}>
      {selected ? (
        <LinearGradient
          colors={[theme.accent, theme.accentTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.chipFill]}
        />
      ) : null}
      <ThemedText type="data" style={{ color: selected ? theme.accentOn : theme.ink }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  close: {
    width: TouchTarget - 8,
    height: TouchTarget - 8,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.seven,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  block: {
    gap: Spacing.two,
  },
  /** 두 칸씩. 시각이 나란히 읽혀야 비교가 쉽다. */
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
  },
  chip: {
    width: '48.5%',
    minHeight: TouchTarget,
    borderRadius: Radius.sm,
    borderCurve: Curve,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipFill: {
    borderRadius: Radius.sm,
    borderCurve: Curve,
  },
  summary: {
    gap: 2,
  },
});
