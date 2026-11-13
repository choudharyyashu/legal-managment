import { prisma } from '../../config/database.js';
import { DashboardSummaryResponse, ArAgingResponse } from './report.types.js';

export class ReportService {
  static async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const [
      totalClients,
      activeClients,
      prospectiveClients,
      totalMatters,
      activeMatters,
      discoveryMatters,
      trialMatters,
      concludedMatters,
      totalTasks,
      completedTasks,
      upcomingHearings,
      invoices,
      trustLedgers,
      practiceAreas,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: 'Active' } }),
      prisma.client.count({ where: { status: 'Prospective' } }),
      prisma.matter.count(),
      prisma.matter.count({ where: { status: 'Active' } }),
      prisma.matter.count({ where: { status: 'In Discovery' } }),
      prisma.matter.count({ where: { status: 'Trial Prep' } }),
      prisma.matter.count({ where: { status: 'Concluded' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'Completed' } }),
      prisma.calendarEvent.count({
        where: {
          isCourtAppearance: true,
          startTime: { gte: new Date() },
        },
      }),
      prisma.invoice.findMany({ select: { totalAmount: true, paidAmount: true, balanceDue: true } }),
      prisma.trustSubLedger.findMany({ select: { balance: true } }),
      prisma.practiceArea.findMany({
        select: {
          name: true,
          code: true,
          _count: { select: { matters: true } },
        },
      }),
    ]);

    const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalCollected = invoices.reduce((sum, i) => sum + Number(i.paidAmount), 0);
    const totalOutstandingAr = invoices.reduce((sum, i) => sum + Number(i.balanceDue), 0);
    const totalTrustBalance = trustLedgers.reduce((sum, l) => sum + Number(l.balance), 0);

    return {
      clients: {
        total: totalClients,
        active: activeClients,
        prospective: prospectiveClients,
      },
      matters: {
        total: totalMatters,
        active: activeMatters,
        inDiscovery: discoveryMatters,
        trialPrep: trialMatters,
        concluded: concludedMatters,
      },
      tasks: {
        total: totalTasks,
        pending: totalTasks - completedTasks,
        completed: completedTasks,
      },
      calendar: {
        upcomingCourtAppearancesCount: upcomingHearings,
      },
      financials: {
        totalInvoiced: Number(totalInvoiced.toFixed(2)),
        totalCollected: Number(totalCollected.toFixed(2)),
        totalOutstandingAr: Number(totalOutstandingAr.toFixed(2)),
        totalTrustBalance: Number(totalTrustBalance.toFixed(2)),
      },
      practiceAreas: practiceAreas.map((pa) => ({
        name: pa.name,
        code: pa.code,
        mattersCount: pa._count.matters,
      })),
    };
  }

  static async getArAging(): Promise<ArAgingResponse> {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: { balanceDue: { gt: 0 } },
      select: { balanceDue: true, issueDate: true },
    });

    const now = Date.now();
    let current = 0;
    let days31to60 = 0;
    let days61to90 = 0;
    let daysOver90 = 0;
    let totalOutstanding = 0;

    for (const inv of unpaidInvoices) {
      const balance = Number(inv.balanceDue);
      totalOutstanding += balance;
      const daysOld = Math.floor((now - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOld <= 30) {
        current += balance;
      } else if (daysOld <= 60) {
        days31to60 += balance;
      } else if (daysOld <= 90) {
        days61to90 += balance;
      } else {
        daysOver90 += balance;
      }
    }

    return {
      current: Number(current.toFixed(2)),
      days31to60: Number(days31to60.toFixed(2)),
      days61to90: Number(days61to90.toFixed(2)),
      daysOver90: Number(daysOver90.toFixed(2)),
      totalOutstanding: Number(totalOutstanding.toFixed(2)),
    };
  }
}
