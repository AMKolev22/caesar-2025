import { PrismaClient } from '@/generated/prisma';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';

import { prisma } from "@/lib/instantiatePrisma"

let autoIncrementCounter = new Map<string, number>();

const generateSerialCode = (
  pattern: string | null | undefined,
  index: number,
  workflowId: number
): string => {
  const randomSuffix = randomBytes(4).toString('hex');
  const timestamp = Date.now();
  
  if (!pattern) {
    return `autogen-${timestamp}-${index}-${randomSuffix}`;
  }
  
  const incrementMatch = pattern.match(/increment\((\d+)\)\((\d+)\)/);
  if (incrementMatch) {
    const startNum = parseInt(incrementMatch[1], 10);
    const maxNum = parseInt(incrementMatch[2], 10);
    const current = autoIncrementCounter.get(workflowId.toString()) ?? startNum;
    
    if (current > maxNum) {
      autoIncrementCounter.set(workflowId.toString(), startNum + 1);
      return pattern.replace(/increment\(\d+\)\(\d+\)/, startNum.toString());
    } else {
      autoIncrementCounter.set(workflowId.toString(), current + 1);
      return pattern.replace(/increment\(\d+\)\(\d+\)/, current.toString());
    }
  }
  
  const autoMatch = pattern.match(/\{autoincrement\((\d+)\)\}/);
  if (autoMatch) {
    const startNum = parseInt(autoMatch[1], 10);
    const current = autoIncrementCounter.get(workflowId.toString()) ?? startNum;
    autoIncrementCounter.set(workflowId.toString(), current + 1);
    return pattern.replace(/\{autoincrement\(\d+\)\}/, current.toString());
  }
  
  if (pattern.includes('*')) {
    return pattern.replace('*', `${timestamp}-${index}-${randomSuffix}`);
  }
  
  return `generated-${timestamp}-${index}-${randomSuffix}`;
};

export const checkAndExecuteWorkflows = async (organisationId?: number) => {
  const workflows = await prisma.workflow.findMany({
    where: { 
      enabled: true,
      ...(organisationId && { product: { organisationId } })
    },
    include: {
      product: { include: { items: true } },
      label: true,
    },
  });

  for (const workflow of workflows) {
    const product = workflow.product;
    const items = product.items;
    const availableCount = items.filter(i => i.status === 'AVAILABLE').length;
    const brokenItems = items.filter(i => i.status === 'BROKEN');
    
    let shouldRun = false;

    switch (workflow.triggerType) {
      case 'quantity_below':
        if (availableCount < (workflow.threshold ?? 0)) shouldRun = true;
        break;
      case 'any_broken':
        if (brokenItems.length > 0) shouldRun = true;
        break;
      default:
        continue;
    }

    if (!shouldRun) continue;

    switch (workflow.actionType) {
      case 'restock':
        const generatedItems = [];
        for (let i = 0; i < (workflow.restockQuantity ?? 0); i++) {
          const code = generateSerialCode(workflow.serialPattern, i, workflow.id);
          generatedItems.push({ serialCode: code });
        }
        
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/core/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: product.name,
            items: generatedItems,
          }),
        });
        
        if (!res.ok) {
          console.error('Failed to restock items:', await response.text());
        }
        break;

      case 'mark_unavailable':
        for (const item of brokenItems) {
          await prisma.item.update({
            where: { id: item.id },
            data: { status: 'BROKEN' },
          });
        }
        break;

      case 'add_label':
        if (workflow.labelId) {
          const existingLabels = await prisma.productLabel.findMany({
            where: { productId: product.id },
            select: { labelId: true }
          });
          
          const existingLabelIds = existingLabels.map(pl => pl.labelId);
          
          if (!existingLabelIds.includes(workflow.labelId)) {
            const allLabelIds = [...existingLabelIds, workflow.labelId];
            
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/core/products/labels`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product.id,
                labelIds: allLabelIds,
              }),
            });
            
            if (!response.ok) {
              console.error('Failed to add label:', await response.text());
            }
          }
        }
        break;

      case 'notify':
        const subject = `Workflow Alert: ${product.name}`;
        let message = '';
        
        switch (workflow.triggerType) {
          case 'quantity_below':
            message = `Product "${product.name}" has ${availableCount} available items, which is below the threshold of ${workflow.threshold}.`;
            break;
          case 'any_broken':
            message = `Product "${product.name}" has ${brokenItems.length} broken items that need attention.`;
            break;
        }
        
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/smtp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'admin@example.com', 
            subject,
            text: message,
            html: `<p>${message}</p>`,
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send notification:', await response.text());
        }
        break;

      default:
        continue;
    }
  }
};
