"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    async function comprobar() {
      const { data } = await supabase.rpc("es_admin");
      setEsAdmin(!!data);
    }
    comprobar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salir() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const items = [
    { href: "/buscar", icono: "🔍", texto: "Buscar" },
    { href: "/matches", icono: "💛", texto: "Matches" },
    { href: "/cuestionario", icono: "👤", texto: "Mi perfil" },
  ];
  if (esAdmin) {
    items.push({ href: "/admin", icono: "🛡️", texto: "Admin" });
  }

  return (
    <nav style={styles.nav}>
      {items.map((it) => {
        const activo = pathname === it.href;
        return (
          <button
            key={it.href}
            style={{ ...styles.item, ...(activo ? styles.itemActivo : {}) }}
            onClick={() => router.push(it.href)}
          >
            <span style={styles.icono}>{it.icono}</span>
            <span style={styles.texto}>{it.texto}</span>
          </button>
        );
      })}
      <button style={styles.item} onClick={salir}>
        <span style={styles.icono}>↩️</span>
        <span style={styles.texto}>Salir</span>
      </button>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "64px",
    background: "#FBF4E9",
    borderTop: "1px solid #E0D2BC",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
    zIndex: 100,
  },
  item: {
    background: "transparent",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    cursor: "pointer",
    color: "#8A7C6B",
    padding: "6px 10px",
    flex: 1,
  },
  itemActivo: { color: "#B85C3C" },
  icono: { fontSize: "20px", lineHeight: 1 },
  texto: { fontSize: "11px", fontWeight: 600 },
};
