'use client';

import { formatMoney, parseMoney } from '@/lib/format';

interface Props {
  value: number;
  onChange: (v: number) => void;
  currency?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function MoneyInput({
  value,
  onChange,
  currency = 'تومان',
  placeholder = '۰',
  disabled,
}: Props) {
  return (
    <div className="money-wrap">
      <input
        className="input num"
        inputMode="numeric"
        disabled={disabled}
        value={value ? formatMoney(value) : ''}
        placeholder={placeholder}
        onChange={(e) => onChange(parseMoney(e.target.value))}
      />
      <span className="suffix">{currency}</span>
    </div>
  );
}
