import type Vacation from "../../models/Vacation";
import type VacationDraft from "../../models/VacationDraft";
import AuthAwareService from "./AuthAware";

export type VacationsFilter = 'all' | 'liked' | 'active' | 'upcoming'

export default class VacationsService extends AuthAwareService {

    async getVacations(filter: VacationsFilter, offset: number, limit: number): Promise<Vacation[]> {
        const { data } = await this.axiosInstance.get<Vacation[]>('/vacations', {
            params: { filter, offset, limit }
        })
        return data
    }

    async getSingleVacation(vacationId: string): Promise<Vacation> {
        const { data } = await this.axiosInstance.get<Vacation>(`/vacations/${vacationId}`)
        return data
    }

    async createVacation(draft: VacationDraft): Promise<Vacation> {
        const { data } = await this.axiosInstance.post<Vacation>('/vacations', draft, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return data
    }

    async updateVacation(vacationId: string, draft: VacationDraft): Promise<Vacation> {
        const { data } = await this.axiosInstance.patch<Vacation>(`/vacations/${vacationId}`, draft, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return data
    }

    async deleteVacation(vacationId: string): Promise<void> {
        await this.axiosInstance.delete(`/vacations/${vacationId}`)
    }

    async like(vacationId: string): Promise<void> {
        await this.axiosInstance.post(`/vacations/${vacationId}/like`)
    }

    async unlike(vacationId: string): Promise<void> {
        await this.axiosInstance.delete(`/vacations/${vacationId}/like`)
    }

}