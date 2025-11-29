export interface IUser {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
}

export interface IShop {
  _id: string;
  name: string;
  phone: string;
  email: string;
  id: string;
}

export interface ITransaction {
  _id: string;
  method: string;
  status: "Paid" | "Unpaid";
  transactionId: string;
  isDeleted: boolean;
  createdAt: string;
  user?: IUser;
  order?: string;
  shop?: IShop;
  paymentIntent?: string;
  amount?: number;
  updatedAt?: string;
}

export interface ITransactionsResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      limit: number;
      page: number;
      totalPage: number;
    };
    payments: ITransaction[];
  };
}

export interface ISingleTransactionResponse {
  success: boolean;
  message: string;
  data: ITransaction;
}