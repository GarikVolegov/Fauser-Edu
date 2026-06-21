import { Router } from "express";
import { db, usersTable, classesTable, gradesTable, attendanceTable, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

function generatePdfBytes(lines: string[]): Buffer {
  const pageWidth = 595;
  const pageHeight = 842;
  let y = pageHeight - 80;
  const margin = 60;

  let stream = "";
  stream += "BT\n";
  stream += "/F1 20 Tf\n";
  stream += `${margin} ${y} Td\n`;
  stream += `(ITT G. Fauser di Novara) Tj\n`;
  y -= 30;
  stream += "/F1 12 Tf\n";
  stream += `0 -30 Td\n`;

  for (const line of lines) {
    const safe = line.replace(/[()\\]/g, c => `\\${c}`);
    stream += `(${safe}) Tj\n`;
    stream += "0 -20 Td\n";
  }
  stream += "ET\n";

  const streamBytes = Buffer.from(stream, "latin1");

  const header = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream\nendobj\n`;
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  const body = header + obj1 + obj2 + obj3 + obj4 + obj5;
  const xrefOffset = body.length;
  const xref = "xref\n0 6\n0000000000 65535 f \n" +
    `${(header.length).toString().padStart(10, "0")} 00000 n \n` +
    `${(header.length + obj1.length).toString().padStart(10, "0")} 00000 n \n` +
    `${(header.length + obj1.length + obj2.length).toString().padStart(10, "0")} 00000 n \n` +
    `${(header.length + obj1.length + obj2.length + obj3.length).toString().padStart(10, "0")} 00000 n \n` +
    `${(header.length + obj1.length + obj2.length + obj3.length + obj4.length).toString().padStart(10, "0")} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(body + xref + trailer, "latin1");
}

router.get("/:type", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { type } = req.params;

    const [cls] = user.classId
      ? await db.select().from(classesTable).where(eq(classesTable.id, user.classId)).limit(1)
      : [null];
    const className = cls ? `${(cls as any).anno}${(cls as any).sezione} - ${(cls as any).indirizzo}` : "Non assegnato";
    const today = new Date().toLocaleDateString("it-IT");

    let lines: string[] = [];

    if (type === "iscrizione") {
      lines = [
        "",
        `CERTIFICATO DI ISCRIZIONE`,
        "",
        `Si certifica che lo/la studente/ssa:`,
        `${user.firstName} ${user.lastName}`,
        ``,
        `e' regolarmente iscritto/a per l'Anno Scolastico 2025/2026`,
        `alla classe: ${className}`,
        ``,
        `presso l'Istituto Tecnico Tecnologico G. Fauser di Novara.`,
        ``,
        `Novara, ${today}`,
        ``,
        `Il Dirigente Scolastico`,
      ];
    } else if (type === "frequenza") {
      const attendance = user.id
        ? await db.select().from(attendanceTable).where(eq(attendanceTable.studentId, user.id))
        : [];
      const total = attendance.length;
      const present = attendance.filter(a => a.status === "presente").length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 100;

      lines = [
        "",
        `ATTESTATO DI FREQUENZA`,
        "",
        `Si attesta che lo/la studente/ssa:`,
        `${user.firstName} ${user.lastName}`,
        ``,
        `ha frequentato regolarmente le lezioni dell'Anno Scolastico 2025/2026`,
        `Classe: ${className}`,
        ``,
        `Percentuale di presenza: ${pct}%`,
        `Giorni presenti: ${present} su ${total}`,
        ``,
        `Novara, ${today}`,
        ``,
        `Il Dirigente Scolastico`,
      ];
    } else if (type === "pagella") {
      const grades = user.id
        ? await db.select().from(gradesTable).where(eq(gradesTable.studentId, user.id))
        : [];
      const subjects = await db.select().from(subjectsTable);
      const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

      const bySubject = new Map<number, number[]>();
      for (const g of grades) {
        if (!bySubject.has(g.subjectId)) bySubject.set(g.subjectId, []);
        bySubject.get(g.subjectId)!.push(parseFloat(String(g.value)));
      }

      lines = [
        "",
        `ESTRATTO PAGELLA`,
        "",
        `Studente: ${user.firstName} ${user.lastName}`,
        `Classe: ${className}`,
        `Anno Scolastico: 2025/2026`,
        ``,
        `MEDIE PER MATERIA:`,
        ``,
        ...Array.from(bySubject.entries()).map(([subId, vals]) => {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          return `${subjectMap.get(subId) ?? "Unknown"}: ${avg.toFixed(1)}`;
        }),
        ``,
        `Novara, ${today}`,
      ];
    } else {
      return res.status(400).json({ error: "Invalid certificate type" });
    }

    const pdf = generatePdfBytes(lines);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificato_${type}.pdf"`,
      "Content-Length": pdf.length,
    });
    res.send(pdf);
  } catch (err) {
    req.log.error({ err }, "Error generating certificate");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
