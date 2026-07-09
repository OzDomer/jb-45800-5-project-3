import type ItineraryResponse from "../../models/ItineraryResponse";
import AuthAwareService from "./AuthAware";

export default class ItineraryService extends AuthAwareService {

    async generate(vacationId: string): Promise<ItineraryResponse> {
        const { data } = await this.axiosInstance.post<ItineraryResponse>('/itinerary', { vacationId })
        return data
    }

}