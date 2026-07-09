import type { NextFunction, Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import Like from "../../models/Like";
import Vacation from "../../models/Vacation";

export async function like(request: Request<{ vacationId: string }>, response: Response, next: NextFunction) {
    try {
        const { userId } = request
        const { vacationId } = request.params

        const vacation = await Vacation.findByPk(vacationId)

        if (!vacation) return next({
            status: 404,
            message: 'vacation does not exist'
        })

        try {
            await Like.create({ userId, vacationId })
        } catch (e) {
            // already liked - treat as success so double clicks are harmless
            if (!(e instanceof UniqueConstraintError)) throw e
        }

        response.json({ success: true })
    } catch (e) {
        next(e)
    }
}

export async function unlike(request: Request<{ vacationId: string }>, response: Response, next: NextFunction) {
    try {
        const { userId } = request
        const { vacationId } = request.params

        const rowCount = await Like.destroy({
            where: { userId, vacationId }
        })

        if (rowCount === 0) return next({
            status: 404,
            message: 'you have not liked this vacation'
        })

        response.json({ success: true })
    } catch (e) {
        next(e)
    }
}