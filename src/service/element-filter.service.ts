import { ElementFilterApiApi } from "api";
import { AxiosStatic } from "axios";

export default class ElementFilterService {
  elementFilterApi: ElementFilterApiApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.elementFilterApi = new ElementFilterApiApi({}, baseUrl, axios);
  }

  // 获取所有的筛选大类
  async getAllFilterCategories() {
    const response = await this.elementFilterApi.getAllFilterCategoriesUsingGET();
    return response.data.data || [];
  }

  // 获取所有的筛选分类
  async getElemFiltersByCategory(categoryId: number) {
    const response = await this.elementFilterApi.getElemFiltersByCategoryUsingGET(
      categoryId,
    );
    return response.data.data || [];
  }
}
