// /api/reports/generate/route.js
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { reportType, dateRange, organisationId } = await req.json();
    
    // calculates date range
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - dateRange);

  
    
    const organisation = await prisma.organisation.findFirst({
      where: { name: "TestOrganisation" }
    });

    let reportData = {};

    switch (reportType) {
      case 'usage-stats':
        reportData = await generateUsageStats(organisation?.id, startDate, endDate);
        break;
      case 'user-activity':
        reportData = await generateUserActivity(organisation?.id, startDate, endDate);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // adds metadata to response
    reportData.metadata = {
      reportType,
      organisationId: organisation?.id,
      organisationName: organisation?.name,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: dateRange
      },
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(reportData);
  } 
  catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate report',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }, 
      { status: 500 }
    );
  }
}

async function generateUsageStats(organisationId, startDate, endDate) {
  try {
    const requests = await prisma.request.findMany({
      where: {
        organisationId,
        createdAt: { 
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        item: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // gets all products
    const products = await prisma.product.findMany({
      where: { organisationId },
      include: {
        items: {
          include: {
            requests: {
              where: { 
                createdAt: { 
                  gte: startDate,
                  lte: endDate
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    // calculates usage
      const productUsage = products.map(product => {
      const productRequests = requests.filter(req => 
        req.item && req.item.productId === product.id
      );
      
      const approved = productRequests.filter(req => req.status === 'APPROVED').length;
      const pending = productRequests.filter(req => req.status === 'PENDING').length;
      const denied = productRequests.filter(req => req.status === 'DENIED').length;
      
      const availableItems = product.items.filter(item => item.status === 'AVAILABLE').length;
      const inUseItems = product.items.filter(item => item.status === 'IN_USE').length;
      const lowStockThreshold = product.lowStockThreshold || 5;
      const isLowStock = availableItems < lowStockThreshold;
      
      const utilizationRate = product.totalQuantity > 0 ? 
        Number(((inUseItems / product.totalQuantity) * 100).toFixed(1)) : 0;
      
      return {
        id: product.id,
        name: product.name,
        category: product.category || 'Uncategorized',
        totalRequests: productRequests.length,
        approved,
        pending,
        denied,
        currentStock: availableItems,
        inUse: inUseItems,
        totalQuantity: product.totalQuantity,
        isLowStock,
        utilizationRate,
        approvalRate: productRequests.length > 0 ? 
          Number(((approved / productRequests.length) * 100).toFixed(1)) : 0
      };
    });

    // by most requested
    productUsage.sort((a, b) => b.totalRequests - a.totalRequests);

    // statistics calculation
    const totalRequests = requests.length;
    const approvedRequests = requests.filter(req => req.status === 'APPROVED').length;
    const pendingRequests = requests.filter(req => req.status === 'PENDING').length;
    const deniedRequests = requests.filter(req => req.status === 'DENIED').length;

    // active users
    const activeUsers = [...new Set(requests.map(req => req.userId))].length;

    // requests/day
    const requestTrends = {};
    const currentDate = new Date(startDate);
    
    // all dates are zeroed out
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      requestTrends[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // actual requests
    requests.forEach(req => {
      const date = req.createdAt.toISOString().split('T')[0];
      if (requestTrends.hasOwnProperty(date)) {
        requestTrends[date] += 1;
      }
    });

    const trendData = Object.entries(requestTrends).map(([date, count]) => ({
      date,
      count
    }));

    const averageApprovalTime = await calculateAverageApprovalTime(organisationId, startDate, endDate);

    return {
      summary: {
        totalRequests,
        approvedRequests,
        pendingRequests,
        deniedRequests,
        activeUsers,
        approvalRate: totalRequests > 0 ? 
          Number(((approvedRequests / totalRequests) * 100).toFixed(1)) : 0
      },
      productUsage,
      requestTrends: trendData,
      averageApprovalTime,
      topRequestedItems: productUsage.slice(0, 5),
      lowStockItems: productUsage.filter(p => p.isLowStock)
    };
  } 
  catch (error) {
    console.error('Error in generateUsageStats:', error);
    throw new Error(`Failed to generate usage statistics: ${error.message}`);
  }
}


async function generateUserActivity(organisationId, startDate, endDate) {
  try {
    const users = await prisma.user.findMany({
      where: {
        // organisationId
      },
      include: {
        requests: {
          where: {
            organisationId,
            createdAt: { 
              gte: startDate,
              lte: endDate
            }
          },
          orderBy: {
            createdAt: 'desc'
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
      
      const lastActivity = userRequests.length > 0 ? 
        userRequests[0].createdAt : null;
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
        totalRequests: userRequests.length,
        approved,
        pending,
        denied,
        currentlyBorrowed: user.assignedItems.length,
        lastActivity: lastActivity ? lastActivity.toISOString() : null,
        approvalRate: userRequests.length > 0 ? 
          Number(((approved / userRequests.length) * 100).toFixed(1)) : 0
      };
    });

    // by most active users
    userActivity.sort((a, b) => b.totalRequests - a.totalRequests);

    // get most active
    const mostActiveUsers = userActivity.filter(user => user.totalRequests > 0).slice(0, 10);

    // ser engagement metrics
    const totalUsers = users.length;
    const activeUsers = userActivity.filter(user => user.totalRequests > 0).length;
    const adminUsers = users.filter(user => user.isAdmin).length;

    return {
      summary: {
        totalUsers,
        activeUsers,
        adminUsers,
        inactiveUsers: totalUsers - activeUsers,
        averageRequestsPerUser: activeUsers > 0 ? 
          Number((userActivity.reduce((sum, user) => sum + user.totalRequests, 0) / activeUsers).toFixed(1)) : 0
      },
      userActivity,
      mostActiveUsers,
      userEngagement: {
        highActivity: userActivity.filter(user => user.totalRequests > 10).length,
        mediumActivity: userActivity.filter(user => user.totalRequests >= 3 && user.totalRequests <= 10).length,
        lowActivity: userActivity.filter(user => user.totalRequests > 0 && user.totalRequests < 3).length,
        noActivity: userActivity.filter(user => user.totalRequests === 0).length
      }
    };
  } 
  catch (error) {
    console.error('Error in generateUserActivity:', error);
    throw new Error(`Failed to generate user activity: ${error.message}`);
  }
}

// helpers
async function calculateAverageApprovalTime(organisationId, startDate, endDate) {
  try {
    const approvedRequests = await prisma.request.findMany({
      where: {
        organisationId,
        status: 'APPROVED',
        createdAt: { 
          gte: startDate,
          lte: endDate
        }
      }
    });

    if (approvedRequests.length === 0) return 0;

    const approvalTimes = approvedRequests.map(request => {
      return request.updatedAt.getTime() - request.createdAt.getTime();
    }).filter(time => time > 0);

    if (approvalTimes.length === 0) return 0;

    const averageMs = approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length;
    return Math.round(averageMs / (1000 * 60 * 60)); // to hours
  }
   catch (error) {
    console.error('Error calculating average approval time:', error);
    return;
  }
}

