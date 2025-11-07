import HTTPS from "../HTTPS.service";

interface OrderProfilePOST {
  name: string;
  type: string;
  material: string;
  materialRate: number;
  cutSizeWidth: number;
  cutSizeHeight: number;
  burningWastage: number;
  heatTreatmentRate: number;
  heatTreatmentInefficacy: number;
  availableInventory: number;
}

export default class OrderService {
  static async createOrderProfile(data: OrderProfilePOST) {
    try {
      const response = await HTTPS.post("/api/order-profiles", data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async fetchOrderProfiles() {
    try {
      const response = await HTTPS.get("/api/order-profiles");
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async updateOrderProfile(id: number, data: OrderProfilePOST) {
    try {
      const response = await HTTPS.put(`/api/order-profiles/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}