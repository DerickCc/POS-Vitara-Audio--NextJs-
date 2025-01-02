import { PaymentModel } from "@/models/payment-history.model";
import { apiFetch } from "@/utils/api";

// PUT
export const updatePayment = async (payload: PaymentModel): Promise<string> => {
  try {
    const response = await apiFetch(`/api/payment`, {
      method: 'PUT',
      body: payload,
    });
    return response.message;
  } catch (e) {
    throw e + '';
  }
};