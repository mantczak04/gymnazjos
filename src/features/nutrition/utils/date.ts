export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateInputValue() {
  return toDateInputValue(new Date());
}

export function shiftDateInputValue(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return todayDateInputValue();
  }

  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}
