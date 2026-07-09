import type { NextFunction, Request, Response } from "express";
import Vacation from "../../models/Vacation";
import Like from "../../models/Like";

// MySQL returns DECIMAL columns as strings - serialize price as a number
export function serializeVacation(vacation: Vacation) {
    const plain = vacation.get({ plain: true })
    return {
        ...plain,
        price: Number(plain.price)
    }
}

export async function getVacation(request: Request<{ vacationId: string }>, response: Response, next: NextFunction) {
    try {
        const { vacationId } = request.params

        const vacation = await Vacation.findByPk(vacationId)

        if (!vacation) return next({
            status: 404,
            message: 'vacation does not exist'
        })

        response.json(serializeVacation(vacation))
    } catch (e) {
        next(e)
    }
}

export async function createVacation(request: Request<object, object, { destination: string, description: string, startDate: Date, endDate: Date, price: number }>, response: Response, next: NextFunction) {
    try {
        const { imageUrl } = request

        const newVacation = await Vacation.create({
            ...request.body,
            imageUrl
        })

        response.json(serializeVacation(newVacation))
    } catch (e) {
        next(e)
    }
}

export async function updateVacation(request: Request<{ vacationId: string }, object, { destination: string, description: string, startDate: Date, endDate: Date, price: number }>, response: Response, next: NextFunction) {
    try {
        const { vacationId } = request.params

        const vacation = await Vacation.findByPk(vacationId)

        if (!vacation) return next({
            status: 404,
            message: 'vacation does not exist'
        })

        const { destination, description, startDate, endDate, price } = request.body
        vacation.set({ destination, description, startDate, endDate, price })

        // a new image is optional on update - keep the existing one if none arrived
        if (request.imageUrl) {
            vacation.imageUrl = request.imageUrl
        }

        await vacation.save()

        response.json(serializeVacation(vacation))
    } catch (e) {
        next(e)
    }
}

export async function deleteVacation(request: Request<{ vacationId: string }>, response: Response, next: NextFunction) {
    try {
        const { vacationId } = request.params

        // remove likes explicitly so the delete never trips on the foreign key
        await Like.destroy({ where: { vacationId } })

        const numberOfRowsDeleted = await Vacation.destroy({ where: { id: vacationId } })

        if (numberOfRowsDeleted === 0) return next({
            status: 404,
            message: 'vacation does not exist'
        })

        response.json({ success: true })
    } catch (e) {
        next(e)
    }
}