export const HZCOMPANY_COMMISSION_RATE = 0.2;

export function applyHzcompanyCommission(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  return Math.round(value * (1 + HZCOMPANY_COMMISSION_RATE));
}

export function removeHzcompanyCommission(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return value;
  return Math.round(value / (1 + HZCOMPANY_COMMISSION_RATE));
}

export function applyCommissionToProductPayload(payload: Record<string, any>) {
  const nextPayload = { ...payload };

  if (typeof nextPayload.price === "number") {
    nextPayload.price = applyHzcompanyCommission(nextPayload.price);
  }

  if (nextPayload.packaging) {
    if (Array.isArray(nextPayload.packaging)) {
      nextPayload.packaging = nextPayload.packaging.map((item: any) => {
        if (!item || typeof item !== "object") return item;
        return {
          ...item,
          price: applyHzcompanyCommission(item.price),
        };
      });
    } else if (typeof nextPayload.packaging === "object") {
      nextPayload.packaging = {
        ...nextPayload.packaging,
        price: applyHzcompanyCommission(nextPayload.packaging.price),
      };
    }
  }

  return nextPayload;
}
