"use client";

import { useRouter } from "next/navigation";

export default function PrivacidadPage() {
  const router = useRouter();

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <button style={styles.volver} onClick={() => router.back()}>← Volver</button>

        <h1 style={styles.titulo}>Política de privacidad</h1>
        <p style={styles.fecha}>Última actualización: [FECHA]</p>

        <h2 style={styles.h2}>1. Quién es responsable de tus datos</h2>
        <p style={styles.p}>
          El responsable del tratamiento de tus datos es [NOMBRE DEL RESPONSABLE
          / SOCIEDAD], con domicilio en [DIRECCIÓN] y correo de contacto
          [EMAIL DE CONTACTO]. Puedes dirigirte a esa dirección para cualquier
          cuestión relacionada con tus datos.
        </p>

        <h2 style={styles.h2}>2. Qué datos tratamos</h2>
        <p style={styles.p}>
          Para prestar el servicio tratamos: tu nombre, email, edad, sexo, país
          y provincia, tu fotografía, información sobre tu práctica religiosa
          (frecuencia, formación, institución o movimiento al que perteneces),
          el texto que escribes sobre ti y tu usuario de Telegram.
        </p>
        <p style={styles.p}>
          Algunos de estos datos —en particular los relativos a tus creencias
          religiosas y el hecho de buscar pareja— son categorías especiales de
          datos, que reciben una protección reforzada. Solo los tratamos con tu
          consentimiento explícito, que nos das al registrarte.
        </p>

        <h2 style={styles.h2}>3. Para qué los usamos</h2>
        <p style={styles.p}>
          Usamos tus datos únicamente para el funcionamiento del servicio:
          crear tu perfil, mostrarte a otras personas compatibles, permitir que
          marquéis interés mutuo y, en caso de match, facilitar el contacto a
          través de Telegram. No usamos tus datos con fines publicitarios ni
          los vendemos a terceros.
        </p>

        <h2 style={styles.h2}>4. Quién puede ver tus datos</h2>
        <p style={styles.p}>
          Tu perfil (foto y datos, salvo tu Telegram) es visible para otras
          personas registradas del sexo opuesto que han completado el proceso.
          Tu usuario de Telegram solo se revela a personas con las que tengas un
          match mutuo. Los administradores pueden acceder a los datos en caso de
          denuncia o para la gestión del servicio.
        </p>

        <h2 style={styles.h2}>5. Dónde se guardan</h2>
        <p style={styles.p}>
          Tus datos se almacenan en la infraestructura de nuestro proveedor
          tecnológico [PROVEEDOR / Supabase], en servidores ubicados en
          [UBICACIÓN, p. ej. la Unión Europea].
        </p>

        <h2 style={styles.h2}>6. Tus derechos</h2>
        <p style={styles.p}>
          Puedes acceder, rectificar o eliminar tus datos en cualquier momento.
          Desde tu perfil puedes editar tu información, y desde los ajustes de
          tu cuenta puedes eliminarla por completo, lo que borra todos tus datos
          de forma permanente. También puedes escribirnos a [EMAIL DE CONTACTO]
          para ejercer cualquiera de tus derechos o presentar una reclamación
          ante la autoridad de protección de datos competente.
        </p>

        <h2 style={styles.h2}>7. Edad mínima</h2>
        <p style={styles.p}>
          El servicio está dirigido exclusivamente a personas mayores de 18
          años. Al registrarte confirmas que eres mayor de edad.
        </p>

        <p style={styles.aviso}>
          [Este texto es una base y debe ser revisado por un asesor en
          protección de datos antes del lanzamiento público.]
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", background: "#F4ECDD", padding: "32px 20px" },
  card: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "16px",
    padding: "36px",
    maxWidth: "640px",
    margin: "0 auto",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  volver: {
    background: "transparent",
    border: "none",
    color: "#B85C3C",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "16px",
  },
  titulo: { fontFamily: "Georgia, serif", color: "#33291F", fontSize: "28px", marginBottom: "4px" },
  fecha: { color: "#8A7C6B", fontSize: "13px", marginBottom: "20px" },
  h2: { fontFamily: "Georgia, serif", color: "#9A4A2E", fontSize: "18px", marginTop: "22px", marginBottom: "8px" },
  p: { color: "#5C5042", fontSize: "15px", lineHeight: 1.65, marginBottom: "10px" },
  aviso: {
    marginTop: "24px",
    padding: "12px",
    background: "#F3E0D5",
    borderRadius: "8px",
    color: "#9A4A2E",
    fontSize: "13px",
    fontStyle: "italic",
  },
};
