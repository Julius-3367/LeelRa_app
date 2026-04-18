import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// GET /api/v1/reports/export?type=pdf|xlsx&dateFrom=...&dateTo=...
export async function GET(request: NextRequest) {
  const { error } = await requireRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "xlsx";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      where.dateAttended = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      };
    }

    const events = await prisma.attendedEvent.findMany({
      where,
      include: {
        activity: { select: { title: true, eventDate: true } },
        loggedBy: { select: { name: true } },
      },
      orderBy: { dateAttended: "desc" },
    });

    const stats = await prisma.attendedEvent.aggregate({
      _count: { id: true },
      _sum: { participantCount: true },
      where,
    });

    if (type === "pdf") {
      return generatePdfReport(events, stats, dateFrom, dateTo);
    }

    return generateExcelReport(events, stats, dateFrom, dateTo);
  } catch (err) {
    console.error("[REPORTS_EXPORT]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR", statusCode: 500 },
      { status: 500 }
    );
  }
}

async function generateExcelReport(
  events: any[],
  stats: any,
  dateFrom: string | null,
  dateTo: string | null
): Promise<NextResponse> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LeelRa App";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Attended Events");

  // Header styling
  const headerStyle: Partial<ExcelJS.Style> = {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E7D32" } },
    font: { color: { argb: "FFFFFFFF" }, bold: true },
    alignment: { horizontal: "center" },
  };

  // Title row
  ws.mergeCells("A1:G1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "LeelRa App — Attended Events Report";
  titleCell.style = {
    font: { bold: true, size: 14, color: { argb: "FF2E7D32" } },
    alignment: { horizontal: "center" },
  };

  ws.mergeCells("A2:G2");
  const subtitleCell = ws.getCell("A2");
  subtitleCell.value = `Wakili Geoffrey Langat | Ainamoi Constituency | Generated: ${new Date().toLocaleDateString("en-KE")}`;
  subtitleCell.style = { alignment: { horizontal: "center" } };

  if (dateFrom || dateTo) {
    ws.mergeCells("A3:G3");
    ws.getCell("A3").value = `Period: ${dateFrom ? new Date(dateFrom).toLocaleDateString("en-KE") : "All time"} — ${dateTo ? new Date(dateTo).toLocaleDateString("en-KE") : "Present"}`;
    ws.getCell("A3").style = { alignment: { horizontal: "center" } };
  }

  // Summary
  ws.getCell("A5").value = "Total Events:";
  ws.getCell("B5").value = stats._count.id;
  ws.getCell("A6").value = "Total Participants:";
  ws.getCell("B6").value = stats._sum.participantCount ?? 0;

  // Column headers
  const headers = ["#", "Event Title", "Date Attended", "Venue", "Participants", "Notes", "Logged By"];
  const headerRow = ws.getRow(8);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.style = headerStyle;
  });

  ws.columns = [
    { key: "no", width: 5 },
    { key: "title", width: 40 },
    { key: "date", width: 18 },
    { key: "venue", width: 30 },
    { key: "participants", width: 14 },
    { key: "notes", width: 40 },
    { key: "loggedBy", width: 20 },
  ];

  // Data rows
  events.forEach((e, i) => {
    const row = ws.getRow(9 + i);
    row.values = [
      i + 1,
      e.activity?.title ?? "N/A",
      new Date(e.dateAttended).toLocaleDateString("en-KE"),
      e.venue,
      e.participantCount,
      e.notes ?? "",
      e.loggedBy?.name ?? "",
    ];
    if (i % 2 === 0) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F8E9" } };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="leelra-attended-events-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

async function generatePdfReport(
  events: any[],
  stats: any,
  dateFrom: string | null,
  dateTo: string | null
): Promise<NextResponse> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(
        new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="leelra-attended-events-${new Date().toISOString().slice(0, 10)}.pdf"`,
          },
        })
      );
    });
    doc.on("error", reject);

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill("#1B5E20");
    doc.fill("white").fontSize(20).font("Helvetica-Bold").text("LeelRa App", 40, 20);
    doc.fontSize(11).font("Helvetica").text("Wakili Geoffrey Langat | Ainamoi Constituency", 40, 45);
    doc.fontSize(9).text("Attended Events Report", 40, 60);
    doc.fill("#212121");

    doc.moveDown(3);

    // Period
    const period = dateFrom || dateTo
      ? `Period: ${dateFrom ? new Date(dateFrom).toLocaleDateString("en-KE") : "All time"} — ${dateTo ? new Date(dateTo).toLocaleDateString("en-KE") : "Present"}`
      : "All Time";

    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString("en-KE")}  |  ${period}`, { align: "right" });

    doc.moveDown();

    // Summary box
    doc.rect(40, doc.y, doc.page.width - 80, 50).fill("#E8F5E9").stroke("#2E7D32");
    const boxY = doc.y - 50;
    doc.fill("#2E7D32").fontSize(11).font("Helvetica-Bold")
      .text(`Total Events: ${stats._count.id}`, 60, boxY + 15);
    doc.text(`Total Participants: ${stats._sum.participantCount ?? 0}`, 220, boxY + 15);
    doc.fill("#212121");
    doc.moveDown(2);

    // Table header
    const tableTop = doc.y;
    const colWidths = [30, 180, 80, 120, 70, 50];
    const cols = ["#", "Event", "Date", "Venue", "Participants", "By"];
    let x = 40;
    doc.rect(40, tableTop, doc.page.width - 80, 20).fill("#2E7D32");
    doc.fill("white").fontSize(9).font("Helvetica-Bold");
    cols.forEach((col, i) => {
      doc.text(col, x + 3, tableTop + 5, { width: colWidths[i] });
      x += colWidths[i];
    });
    doc.fill("#212121").font("Helvetica");

    let y = tableTop + 22;
    events.forEach((e, i) => {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 40;
      }
      if (i % 2 === 0) {
        doc.rect(40, y - 2, doc.page.width - 80, 18).fill("#F1F8E9");
      }
      doc.fill("#212121");
      const row = [
        String(i + 1),
        e.activity?.title ?? "N/A",
        new Date(e.dateAttended).toLocaleDateString("en-KE"),
        e.venue,
        String(e.participantCount),
        e.loggedBy?.name?.split(" ")[0] ?? "",
      ];
      x = 40;
      row.forEach((cell, ci) => {
        doc.fontSize(8).text(cell.substring(0, 30), x + 3, y, { width: colWidths[ci] - 3 });
        x += colWidths[ci];
      });
      y += 18;
    });

    // Footer
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill("#1B5E20");
    doc.fill("white").fontSize(8).text(
      "LeelRa App  •  Wakili Geoffrey Langat  •  Ainamoi Constituency  •  Confidential",
      40,
      doc.page.height - 26,
      { align: "center" }
    );

    doc.end();
  });
}
