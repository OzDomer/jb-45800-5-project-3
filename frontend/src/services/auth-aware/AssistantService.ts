import type AssistantResponse from "../../models/AssistantResponse";
import AuthAwareService from "./AuthAware";

export default class AssistantService extends AuthAwareService {

    async ask(prompt: string): Promise<AssistantResponse> {
        const { data } = await this.axiosInstance.post<AssistantResponse>('/assistant', { prompt })
        return data
    }

}