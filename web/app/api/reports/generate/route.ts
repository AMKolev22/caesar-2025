// /api/reports/generate/route.js
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { reportType, dateRange, organisationId } = await req.json();
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    const organisation = await prisma.organisation.findUnique({
      where: { name: "TestOrganisation" } // Replace with dynamic org selection
    });

    if (!organisation) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    }

    let reportData = {};

    switch (reportType) {
      case 'usage-stats':
        reportData = await generateUsageStats(organisation.id, startDate);
        break;
      case 'inventory-status':
        reportData = await generateInventoryStatus(organisation.id);
        break;
      case 'user-activity':
        reportData = await generateUserActivity(organisation.id, startDate);
        break;
      case 'maintenance-report':
        reportData = await generateMaintenanceReport(organisation.id, startDate);
        break;
      case 'comprehensive':
        reportData = await generateComprehensiveReport(organisation.id, startDate);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

async function generateUsageStats(organisationId, startDate) {
  // Get request statistics
  const requests = await prisma.request.findMany({
    where: {
      organisationId,
      createdAt: { gte: startDate }
    },
    include: {
      item: {
        include: {
          product: true
        }
      },
      user: true
    }
  });

  // Get all products with their current stock
  const products = await prisma.product.findMany({
    where: { organisationId },
    include: {
      items: {
        include: {
          requests: {
            where: { createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  // Calculate usage statistics per product
  const productUsage = products.map(product => {
    const productRequests = requests.filter(req => req.item.productId === product.id);
    const approved = productRequests.filter(req => req.status === 'APPROVED').length;
    const pending = productRequests.filter(req => req.status === 'PENDING').length;
    const denied = productRequests.filter(req => req.status === 'DENIED').length;
    
    const availableItems = product.items.filter(item => item.status === 'AVAILABLE').length;
    const isLowStock = product.totalQuantity < 5; // Configurable threshold
    
    return {
      name: product.name,
      totalRequests: productRequests.length,
      approved,
      pending,
      denied,
      currentStock: availableItems,
      totalQuantity: product.totalQuantity,
      isLowStock,
      utilizationRate: product.totalQuantity > 0 ? 
        ((product.totalQuantity - availableItems) / product.totalQuantity * 100).toFixed(1) : 0
    };
  });

  // Sort by most requested
  productUsage.sort((a, b) => b.totalRequests - a.totalRequests);

  // Calculate overall statistics
  const totalRequests = requests.length;
  const approvedRequests = requests.filter(req => req.status === 'APPROVED').length;
  const pendingRequests = requests.filter(req => req.status === 'PENDING').length;
  const deniedRequests = requests.filter(req => req.status === 'DENIED').length;

  // Get unique active users
  const activeUsers = [...new Set(requests.map(req => req.userId))].length;

  // Request trends by day
  const requestTrends = {};
  requests.forEach(req => {
    const date = req.createdAt.toISOString().split('T')[0];
    requestTrends[date] = (requestTrends[date] || 0) + 1;
  });

  return {
    totalRequests,
    approvedRequests,
    pendingRequests,
    deniedRequests,
    activeUsers,
    productUsage,
    requestTrends,
    averageApprovalTime: await calculateAverageApprovalTime(organisationId, startDate)
  };
}

async function generateInventoryStatus(organisationId) {
  const items = await prisma.item.findMany({
    where: { organisationId },
    include: {
      product: true,
      assignedUser: true
    }
  });

  const inventoryItems = items.map(item => ({
    id: item.id,
    serialCode: item.serialCode,
    productName: item.product.name,
    status: item.status,
    assignedTo: item.assignedUser ? item.assignedUser.name : null,
    location: item.product.location,
    createdAt: item.createdAt.toISOString().split('T')[0]
  }));

  // Status breakdown
  const statusBreakdown = {
    AVAILABLE: items.filter(item => item.status === 'AVAILABLE').length,
    IN_USE: items.filter(item => item.status === 'IN_USE').length,
    BROKEN: items.filter(item => item.status === 'BROKEN').length,
    UNDER_REPAIR: items.filter(item => item.status === 'UNDER_REPAIR').length
  };

  // Low stock products
  const products = await prisma.product.findMany({
    where: { organisationId },
    include: {
      items: true
    }
  });

  const lowStockProducts = products.filter(product => {
    const availableCount = product.items.filter(item => item.status === 'AVAILABLE').length;
    return availableCount < 5; // Configurable threshold
  }).map(product => ({
    name: product.name,
    totalQuantity: product.totalQuantity,
    availableQuantity: product.items.filter(item => item.status === 'AVAILABLE').length
  }));

  return {
    totalItems: items.length,
    availableItems: statusBreakdown.AVAILABLE,
    borrowedItems: statusBreakdown.IN_USE,
    brokenItems: statusBreakdown.BROKEN,
    repairItems: statusBreakdown.UNDER_REPAIR,
    inventoryItems,
    statusBreakdown,
    lowStockProducts
  };
}

async function generateUserActivity(organisationId, startDate) {
  const users = await prisma.user.findMany({
    include: {
      requests: {
        where: {
          organisationId,
          createdAt: { gte: startDate }
        }
      },
      assignedItems: {
        where: { organisationId }
      }
    }
  });

  const userActivity = users.map(user => {
    const userRequests = user.requests;
    const approved = userRequests.filter(req => req.status === 'APPROVED').length;
    const pending = userRequests.filter(req => req.status === 'PENDING').length;
    const denied = userRequests.filter(req => req.status === 'DENIED').length;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      totalRequests: userRequests.length,
      approved,
      pending,
      denied,
      currentlyBorrowed: user.assignedItems.length,
      lastActivity: userRequests.length > 0 ? 
        Math.max(...userRequests.map(req => req.createdAt.getTime())) : null
    };
  });

  // Sort by most active users
  userActivity.sort((a, b) => b.totalRequests - a.totalRequests);

  // Most active users
  const mostActiveUsers = userActivity.slice(0, 10);

  return {
    totalUsers: users.length,
    activeUsers: userActivity.filter(user => user.totalRequests > 0).length,
    userActivity,
    mostActiveUsers
  };
}

async function generateMaintenanceReport(organisationId, startDate) {
  const brokenItems = await prisma.item.findMany({
    where: {
      organisationId,
      status: 'BROKEN'
    },
    include: {
      product: true,
      requests: {
        where: { type: 'REPAIR' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const underRepairItems = await prisma.item.findMany({
    where: {
      organisationId,
      status: 'UNDER_REPAIR'
    },
    include: {
      product: true,
      requests: {
        where: { type: 'REPAIR' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const repairRequests = await prisma.request.findMany({
    where: {
      organisationId,
      type: 'REPAIR',
      createdAt: { gte: startDate }
    },
    include: {
      item: {
        include: {
          product: true
        }
      },
      user: true
    }
  });

  return {
    brokenItems: brokenItems.length,
    underRepairItems: underRepairItems.length,
    totalRepairRequests: repairRequests.length,
    brokenItemsList: brokenItems.map(item => ({
      serialCode: item.serialCode,
      productName: item.product.name,
      reportedDate: item.requests[0]?.createdAt || null
    })),
    underRepairItemsList: underRepairItems.map(item => ({
      serialCode: item.serialCode,
      productName: item.product.name,
      repairStartDate: item.requests[0]?.createdAt || null
    })),
    repairTrends: calculateRepairTrends(repairRequests)
  };
}

async function generateComprehensiveReport(organisationId, startDate) {
  const [usageStats, inventoryStatus, userActivity, maintenanceReport] = await Promise.all([
    generateUsageStats(organisationId, startDate),
    generateInventoryStatus(organisationId),
    generateUserActivity(organisationId, startDate),
    generateMaintenanceReport(organisationId, startDate)
  ]);

  return {
    summary: {
      totalItems: inventoryStatus.totalItems,
      totalRequests: usageStats.totalRequests,
      totalUsers: userActivity.totalUsers,
      activeUsers: userActivity.activeUsers,
      pendingRequests: usageStats.pendingRequests,
      lowStockItems: inventoryStatus.lowStockProducts.length,
      brokenItems: maintenanceReport.brokenItems,
      utilizationRate: calculateOverallUtilization(inventoryStatus)
    },
    usageStats,
    inventoryStatus,
    userActivity,
    maintenanceReport,
    insights: generateInsights(usageStats, inventoryStatus, userActivity, maintenanceReport)
  };
}

async function calculateAverageApprovalTime(organisationId, startDate) {
  const approvedRequests = await prisma.request.findMany({
    where: {
      organisationId,
      status: 'APPROVED',
      createdAt: { gte: startDate }
    },
    include: {
      statusLogs: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (approvedRequests.length === 0) return 0;

  const approvalTimes = approvedRequests.map(request => {
    const createdLog = request.statusLogs.find(log => log.status === 'PENDING');
    const approvedLog = request.statusLogs.find(log => log.status === 'APPROVED');
    
    if (createdLog && approvedLog) {
      return approvedLog.createdAt.getTime() - createdLog.createdAt.getTime();
    }
    return 0;
  }).filter(time => time > 0);

  if (approvalTimes.length === 0) return 0;

  const averageMs = approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length;
  return Math.round(averageMs / (1000 * 60 * 60)); // Convert to hours
}

function calculateRepairTrends(repairRequests) {
  const trends = {};
  repairRequests.forEach(req => {
    const month = req.createdAt.toISOString().slice(0, 7); // YYYY-MM
    trends[month] = (trends[month] || 0) + 1;
  });
  return trends;
}

function calculateOverallUtilization(inventoryStatus) {
  if (inventoryStatus.totalItems === 0) return 0;
  return ((inventoryStatus.borrowedItems / inventoryStatus.totalItems) * 100).toFixed(1);
}

function generateInsights(usageStats, inventoryStatus, userActivity, maintenanceReport) {
  const insights = [];

  // Usage insights
  if (usageStats.approvedRequests > 0) {
    const approvalRate = (usageStats.approvedRequests / usageStats.totalRequests * 100).toFixed(1);
    insights.push({
      type: 'success',
      title: 'Request Approval Rate',
      message: `${approvalRate}% of requests are being approved, indicating good inventory availability.`
    });
  }

  // Inventory insights
  if (inventoryStatus.lowStockProducts.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${inventoryStatus.lowStockProducts.length} products are running low and need restocking.`
    });
  }

  // User activity insights
  const avgRequestsPerUser = userActivity.totalUsers > 0 ? 
    (usageStats.totalRequests / userActivity.activeUsers).toFixed(1) : 0;
  
  if (Number(avgRequestsPerUser) > 5) {
    insights.push({
      type: 'info',
      title: 'High User Engagement',
      message: `Average of ${avgRequestsPerUser} requests per active user shows good system utilization.`
    });
  }

  // Maintenance insights
  if (maintenanceReport.brokenItems > 0) {
    insights.push({
      type: 'error',
      title: 'Maintenance Required',
      message: `${maintenanceReport.brokenItems} items are broken and need immediate attention.`
    });
  }

  // Most popular items
  if (usageStats.productUsage.length > 0) {
    const mostPopular = usageStats.productUsage[0];
    insights.push({
      type: 'info',
      title: 'Most Popular Item',
      message: `"${mostPopular.name}" is the most requested item with ${mostPopular.totalRequests} requests.`
    });
  }

  return insights;
}