export function toPaise(amount) {
  return Math.round(Number(amount) * 100);
}

export function fromPaise(amountInPaise) {
  return Number((amountInPaise / 100).toFixed(2));
}

