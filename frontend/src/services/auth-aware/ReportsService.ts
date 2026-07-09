import AuthAwareService from "./AuthAware";

export interface DestinationLikes {
    destination: string,
    likes: number
}

export default class ReportsService extends AuthAwareService {

    async getLikesReport(): Promise<DestinationLikes[]> {
        const { data } = await this.axiosInstance.get<DestinationLikes[]>('/reports/likes')
        return data
    }

    async downloadCsv(): Promise<Blob> {
        const { data } = await this.axiosInstance.get<Blob>('/reports/csv', {
            responseType: 'blob'
        })
        return data
    }

}