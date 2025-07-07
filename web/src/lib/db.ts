export type Item = {
  id: string;
  name: string;
  quantity: number;
};

export type BorrowRecord = {
  id: string;
  itemId: string;
  userId: string;
  quantity: number;
  borrowedAt: Date;
  returnedAt?: Date;
};

let items: Item[] = [
  { id: "1", name: "Projector", quantity: 5 },
  { id: "2", name: "Laptop", quantity: 10 },
];

let borrowRecords: BorrowRecord[] = [];

export const db = {
  getItem: (id: string) => items.find((i) => i.id === id),
  updateItemQuantity: (id: string, newQty: number) => {
    const item = items.find((i) => i.id === id);
    if (item) item.quantity = newQty;
  },
  addBorrowRecord: (record: BorrowRecord) => {
    borrowRecords.push(record);
  },
  returnItem: (recordId: string) => {
    const record = borrowRecords.find((r) => r.id === recordId);
    if (record && !record.returnedAt) {
      record.returnedAt = new Date();
      const item = items.find((i) => i.id === record.itemId);
      if (item) item.quantity += record.quantity;
    }
  },
  getAllBorrowRecords: () => borrowRecords,
};