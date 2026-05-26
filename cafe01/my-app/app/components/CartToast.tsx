"use client";

import { useEffect, useRef, useState } from "react";

export interface ToastItem {
  id: string;
  name: string;
  price: string;
  image: string;
}

interface CartToastProps {
  toast: ToastItem | null;
  onDismiss: () => void;
}

export default function CartToast({ toast, onDismiss }: CartToastProps) {
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;

    // Force a reflow so the enter transition fires
    setShow(false);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShow(true));
    });

    // Auto-dismiss after 3s
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShow(false);
      setTimeout(onDismiss, 400);
    }, 3000);

    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast?.id]); // re-trigger on every NEW toast

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: "80px",
        right: show ? "20px" : "-420px",
        zIndex: 9999,
        transition: "right 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        maxWidth: "360px",
        width: "calc(100vw - 40px)",
      }}
    >
      {/* Main card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "linear-gradient(135deg, #1A110C 0%, #2C1E16 100%)",
          borderRadius: "16px",
          padding: "14px 16px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
          border: "1px solid rgba(34,197,94,0.3)",
        }}
      >
        {/* Thumbnail with checkmark */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src={toast.image}
            alt={toast.name}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "10px",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(34,197,94,0.5)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: "#22c55e",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 3px 0",
            }}
          >
            ✓ Added to Cart
          </p>
          <p
            style={{
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              margin: "0 0 2px 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {toast.name}
          </p>
          <p
            style={{
              color: "#C5A059",
              fontSize: "13px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {toast.price}
          </p>
        </div>

        {/* Cart icon */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(197,160,89,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#C5A059">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      {show && (
        <div
          style={{
            margin: "4px 8px 0",
            height: "3px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "99px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#22c55e",
              borderRadius: "99px",
              animation: "toastProgress 3s linear forwards",
            }}
          />
        </div>
      )}
    </div>
  );
}
