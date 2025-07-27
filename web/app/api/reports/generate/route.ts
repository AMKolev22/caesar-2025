// /api/reports/generate/route.js
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

import { prisma } from "@/lib/instantiatePrisma"

export async function POST(req) {
  try {
    // Extract parameters from request body
    const { reportType, dateRange, organisationId } = await req.json();
    
    // Calculate the date range for the report: endDate = now, startDate = now - dateRange (in days)
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - dateRange);

    // Fetch organisation details by name (hardcoded here as "TestOrganisation")
    const organisation = await prisma.organisation.findFirst({
      where: { name: "TestOrganisation" }
    });

    let reportData = {};

    // Generate the appropriate report based on reportType
    switch (reportType) {
      case 'usage-stats':
        reportData = await generateUsageStats(organisation?.id, startDate, endDate);
        break;
      case 'user-activity':
        reportData = await generateUserActivity(organisation?.id, startDate, endDate);
        break;
      default:
        // Return error for invalid report type
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Add metadata info to the report data before sending response
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

    // Return the generated report data as JSON
    return NextResponse.json(reportData);
  } 
  catch (error) {
    // Log error and return generic failure message with detailed error info in dev mode
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

// Generates usage statistics report for a given organisation and date range
async function generateUsageStats(organisationId, startDate, endDate) {
  try {
    // Fetch requests for organisation in the date range, including related item, product, and user info
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

    // Fetch all products of the organisation with their items and requests (filtered by date range)
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

    // Calculate usage stats per product based on filtered requests and item statuses
    const productUsage = products.map(product => {
      const productRequests = requests.filter(req => 
        req.item && req.item.productId === product.id
      );
      
      const approved = productRequests.filter(req => req.status === 'APPROVED').length;
      const pending = productRequests.filter(req => req.status === 'PENDING').length;
      const denied = productRequests.filter(req => req.status === 'DENIED').length;
      
      const availableItems = product.items.filter(item => item.status === 'AVAILABLE').length;
      const inUseItems = product.items.filter(item => item.status === 'IN_USE').length;
      const lowStockThreshold = product.lowStockThreshold || 5; // default threshold if not set
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

    // Sort products by most requested first
    productUsage.sort((a, b) => b.totalRequests - a.totalRequests);

    // Calculate overall summary statistics
    const totalRequests = requests.length;
    const approvedRequests = requests.filter(req => req.status === 'APPROVED').length;
    const pendingRequests = requests.filter(req => req.status === 'PENDING').length;
    const deniedRequests = requests.filter(req => req.status === 'DENIED').length;

    // Calculate count of unique active users
    const activeUsers = [...new Set(requests.map(req => req.userId))].length;

    // Initialize request trends (requests per day) with zero counts for each date in range
    const requestTrends = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      requestTrends[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Count requests per day and update requestTrends
    requests.forEach(req => {
      const date = req.createdAt.toISOString().split('T')[0];
      if (requestTrends.hasOwnProperty(date)) {
        requestTrends[date] += 1;
      }
    });

    // Convert requestTrends object to an array of {date, count} objects
    const trendData = Object.entries(requestTrends).map(([date, count]) => ({
      date,
      count
    }));

    // Calculate average approval time (in hours) for approved requests
    const averageApprovalTime = await calculateAverageApprovalTime(organisationId, startDate, endDate);

    // Return detailed usage stats including summaries, product usage, trends, and highlighted items
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
      topRequestedItems: productUsage.slice(0, 5),       // top 5 requested products
      lowStockItems: productUsage.filter(p => p.isLowStock) // products flagged as low stock
    };
  } 
  catch (error) {
    console.error('Error in generateUsageStats:', error);
    throw new Error(`Failed to generate usage statistics: ${error.message}`);
  }
}

// Generates user activity report for a given organisation and date range
async function generateUserActivity(organisationId, startDate, endDate) {
  try {
    // Fetch all users (organisation filter commented out in your code) with requests and assigned items in date range
    const users = await prisma.user.findMany({
      where: {
        // organisationId filter currently commented out
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

    // Map users to user activity summaries
    const userActivity = users.map(user => {
      const userRequests = user.requests;
      const approved = userRequests.filter(req => req.status === 'APPROVED').length;
      const pending = userRequests.filter(req => req.status === 'PENDING').length;
      const denied = userRequests.filter(req => req.status === 'DENIED').length;
      
      // Get last activity date from latest request, or null if no requests
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

    // Sort users by most requests (activity)
    userActivity.sort((a, b) => b.totalRequests - a.totalRequests);

    // Get top 10 most active users who have made requests
    const mostActiveUsers = userActivity.filter(user => user.totalRequests > 0).slice(0, 10);

    // Calculate summary metrics for user engagement
    const totalUsers = users.length;
    const activeUsers = userActivity.filter(user => user.totalRequests > 0).length;
    const adminUsers = users.filter(user => user.isAdmin).length;

    // Return user activity report data including summary and detailed engagement
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

// Helper function to calculate average approval time in hours for approved requests
async function calculateAverageApprovalTime(organisationId, startDate, endDate) {
  try {
    // Fetch all approved requests in date range
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

    // Return 0 if no approved requests found
    if (approvedRequests.length === 0) return 0;

    // Calculate time differences between createdAt and updatedAt in milliseconds, filter valid times only
    const approvalTimes = approvedRequests.map(request => {
      return request.updatedAt.getTime() - request.createdAt.getTime();
    }).filter(time => time > 0);

    if (approvalTimes.length === 0) return 0;

    // Calculate average milliseconds, convert to hours and round
    const averageMs = approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length;
    return Math.round(averageMs / (1000 * 60 * 60)); // convert ms to hours
  }
   catch (error) {
    console.error('Error calculating average approval time:', error);
    return;
  }
}

