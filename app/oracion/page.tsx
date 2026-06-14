"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Cada oración: el texto completo y las 4 palabras (en orden) que se ocultan.
// Los índices marcan QUÉ posiciones de palabra se ocultan.
// Pep puede ajustar textos y qué palabras esconder.
const ORACIONES = [
  {
    titulo: "Padre Nuestro",
    palabras:
      "Padre nuestro que estás en el cielo santificado sea tu Nombre venga a nosotros tu reino".split(
        " "
      ),
    ocultas: [1, 6, 7, 11], // nuestro, cielo, santificado, venga
    distractores: ["Señor", "tierra"],
  },
  {
    titulo: "Avemaría",
    palabras:
      "Dios te salve María llena eres de gracia el Señor es contigo bendita tú eres entre todas las mujeres".split(
        " "
      ),
    ocultas: [3, 4, 11, 12], // María, llena, contigo, bendita
    distractores: ["gloria", "santa"],
  },
  {
    titulo: "Gloria",
    palabras:
      "Gloria al Padre y al Hijo y al Espíritu Santo como era en el principio ahora y siempre".split(
        " "
      ),
    ocultas: [2, 5, 9, 14], // Padre, Hijo, Santo, principio
    distractores: ["mundo", "amén"],
  },
];

function barajar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function OracionPage() {
  const supabase = createClient();
  const router = useRouter();

  const [indice, setIndice] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const oracion = ORACIONES[indice];
  // Secuencia correcta de palabras ocultas, en orden
  const correctas = oracion.ocultas.map((i) => oracion.palabras[i]);

  const [opciones, setOpciones] = useState<string[]>([]);
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    setOpciones(barajar([...correctas, ...oracion.distractores]));
    setElegidas([]);
    setError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice]);

  function elegir(palabra: string) {
    if (elegidas.length >= correctas.length) return;
    setElegidas((e) => [...e, palabra]);
    setError(false);
  }

  function deshacer() {
    setElegidas((e) => e.slice(0, -1));
    setError(false);
  }

  function comprobar() {
    const ok =
      elegidas.length === correctas.length &&
      elegidas.every((p, i) => p === correctas[i]);
    if (ok) {
      if (indice < ORACIONES.length - 1) setIndice((i) => i + 1);
      else finalizar();
    } else {
      setError(true);
      setElegidas([]);
    }
  }

  async function finalizar() {
    setGuardando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ oracion_completada: true })
        .eq("id", user.id);
    }
    router.push("/cuestionario");
  }

  // Construye la oración mostrando huecos numerados o la palabra ya elegida
  let huecoN = 0;
  const render = oracion.palabras.map((p, i) => {
    if (oracion.ocultas.includes(i)) {
      const posicion = oracion.ocultas.indexOf(i);
      const elegida = elegidas[posicion];
      huecoN++;
      return (
        <span key={i} style={elegida ? styles.huecoLleno : styles.huecoVacio}>
          {elegida ?? huecoN}
        </span>
      );
    }
    return (
      <span key={i} style={styles.palabra}>
        {p}{" "}
      </span>
    );
  });

  const completa = elegidas.length === correctas.length;

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <p style={styles.intro}>
          Antes de continuar, te invitamos a un momento de oración. Completa las
          palabras que faltan en cada oración, tocándolas en su orden.
        </p>

        <p style={styles.progreso}>
          Oración {indice + 1} de {ORACIONES.length}
        </p>
        <h2 style={styles.tituloOracion}>{oracion.titulo}</h2>

        <p style={styles.textoOracion}>{render}</p>

        <div style={styles.opciones}>
          {opciones.map((p) => (
            <button
              key={p}
              style={{
                ...styles.ficha,
                opacity: elegidas.includes(p) ? 0.35 : 1,
              }}
              onClick={() => elegir(p)}
              disabled={elegidas.includes(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {error && (
          <p style={styles.error}>No es correcto. Inténtalo de nuevo con calma.</p>
        )}

        <div style={styles.acciones}>
          {elegidas.length > 0 && (
            <button style={styles.botonSec} onClick={deshacer}>
              Deshacer
            </button>
          )}
          <button
            style={{
              ...styles.boton,
              opacity: completa && !guardando ? 1 : 0.5,
            }}
            onClick={comprobar}
            disabled={!completa || guardando}
          >
            {guardando
              ? "Un momento..."
              : indice < ORACIONES.length - 1
              ? "Comprobar"
              : "Finalizar oración"}
          </button>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#F4ECDD",
    padding: "24px",
  },
  card: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "560px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  intro: {
    color: "#5C5042",
    fontSize: "15px",
    lineHeight: 1.6,
    fontStyle: "italic",
    marginBottom: "24px",
    textAlign: "center",
  },
  progreso: {
    color: "#8A7C6B",
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "4px",
  },
  tituloOracion: {
    fontFamily: "Georgia, serif",
    color: "#9A4A2E",
    fontSize: "22px",
    textAlign: "center",
    marginBottom: "20px",
  },
  textoOracion: {
    fontFamily: "Georgia, serif",
    color: "#33291F",
    fontSize: "18px",
    lineHeight: 2,
    textAlign: "center",
    marginBottom: "24px",
  },
  palabra: {},
  huecoVacio: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "30px",
    height: "26px",
    borderRadius: "6px",
    border: "1px dashed #B85C3C",
    background: "#FFFCF6",
    color: "#B85C3C",
    fontSize: "13px",
    fontFamily: "-apple-system, sans-serif",
    margin: "0 4px",
    verticalAlign: "middle",
  },
  huecoLleno: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 10px",
    height: "28px",
    borderRadius: "6px",
    background: "#B85C3C",
    color: "#FBF4E9",
    margin: "0 4px",
    verticalAlign: "middle",
  },
  opciones: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "center",
    marginBottom: "8px",
  },
  ficha: {
    padding: "10px 16px",
    border: "1px solid #E0D2BC",
    borderRadius: "8px",
    background: "#F3E0D5",
    color: "#33291F",
    fontSize: "16px",
    fontFamily: "Georgia, serif",
    cursor: "pointer",
  },
  error: {
    color: "#9A4A2E",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "12px",
  },
  acciones: {
    marginTop: "24px",
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    alignItems: "center",
  },
  boton: {
    padding: "14px 32px",
    border: "none",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  botonSec: {
    padding: "14px 20px",
    border: "1px solid #D8BFA9",
    borderRadius: "8px",
    background: "transparent",
    color: "#8A7C6B",
    fontSize: "15px",
    cursor: "pointer",
  },
};
