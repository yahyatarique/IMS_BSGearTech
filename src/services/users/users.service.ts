import HTTPS from "../HTTPS.service";

export default class UsersService {
  static async getUsers() {
    try {
      const response = await HTTPS.get("users");
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async login(username: string, password: string) {
    try {
      const response = await HTTPS.post("login", {
        username,
        password,
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}