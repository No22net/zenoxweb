"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, type CartItem } from "./CartProvider";

export default function AddToCartButton({
  item,
  compact = false,
  goToCart = false,
}: {
  item: CartItem;
  compact?: boolean;
  goToCart?: boolean;
}) {
  const { add, items } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const inCart = items.some((i) => i.templateId === item.templateId) || added;

  return (
    <button
      type="button"
      onClick={() => {
        add(item);
        setAdded(true);
        if (goToCart) router.push("/cart");
      }}
      className={`btn btn-primary ${compact ? "!py-1.5 !px-3 text-xs" : ""}`}
    >
      {inCart ? "در سبد خرید ✓" : "افزودن به سبد"}
    </button>
  );
}
