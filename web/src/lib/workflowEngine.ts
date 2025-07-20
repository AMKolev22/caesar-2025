import { PrismaClient } from '@/generated/prisma';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch'; 

const prisma = new PrismaClient();

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


export const checkAndExecuteWorkflows = async () => {
const workflows = await prisma.workflow.findMany({
  where: { enabled: true },
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
        if (availableCount <= (workflow.threshold ?? 0)) shouldRun = true;
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

        await fetch('http://localhost:3000/api/core/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: product.name,
            items: generatedItems,
          }),
        });

        break;

      case 'mark_unavailable':
        if (workflow.newStatus) {
          for (const item of brokenItems) {
            await prisma.item.update({
              where: { id: item.id },
              data: { status: workflow.newStatus },
            });
          }
        }
        break;

      case 'add_label':
        if (workflow.labelId) {
          await prisma.productLabel.upsert({
            where: {
              productId_labelId: {
                productId: product.id,
                labelId: workflow.labelId,
              },
            },
            update: {},
            create: {
              productId: product.id,
              labelId: workflow.labelId,
            },
          });
        }
        break;

      case 'notify':
        console.log("notify");
        break;

      default:
        continue;
    }
  }
};
