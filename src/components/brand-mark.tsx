import Svg, { Circle, Path } from 'react-native-svg';

type BrandMarkProps = {
  /** 1024 격자 전체가 들어가는 상자 한 변. 마크 자체는 그 64% 정도를 차지한다. */
  size: number;
  color: string;
};

/**
 * 앱 아이콘과 같은 마크. 반경을 뜻하는 고리와, 그 경계 맨 위에 올라선 점 하나.
 * 도형은 assets/brand/mark.svg 와 같다 — 한쪽을 고치면 다른 쪽도 맞춘다.
 */
export function BrandMark({ size, color }: BrandMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Path
        d="M668.6 295.9 A280 280 0 1 1 355.4 295.9"
        fill="none"
        stroke={color}
        strokeWidth={96}
        strokeLinecap="round"
      />
      <Circle cx={512} cy={248} r={80} fill={color} />
    </Svg>
  );
}
