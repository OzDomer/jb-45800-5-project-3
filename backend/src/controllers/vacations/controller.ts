import type { NextFunction, Request, Response } from "express";
import { Op, type WhereOptions } from "sequelize";
import Vacation from "../../models/Vacation";
import Like from "../../models/Like";
import User from "../../models/User";
import type { ListVacationsQuery } from "./validator";

// MySQL returns DECIMAL columns as strings - serialize price as a number
export function serializeVacation(vacation: Vacation) {
    const plain = vacation.get({ plain: true })
    return {
        ...plain,
        price: Number(plain.price)
    }
}

function serializeVacationWithLikes(vacation: Vacation, userId: string) {
    const { likers = [], ...plain } = vacation.get({ plain: true })
    return {
        ...plain,
        price: Number(plain.price),
        likesCount: likers.length,
        likedByMe: likers.some((liker: { id: string }) => liker.id === userId)
    }
}

// DATEONLY columns compare against a plain YYYY-MM-DD string in local time
function todayDateOnly(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export async function getVacations(request: Request, response: Response, next: NextFunction) {
    try {
        const { userId } = request
        const { filter, offset, limit } = request.validatedQuery as ListVacationsQuery

        const today = todayDateOnly()

        let where: WhereOptions = {}

        switch (filter) {
            case 'active':
                where = {
                    startDate: { [Op.lte]: today },
                    endDate: { [Op.gte]: today }
                }
                break
            case 'upcoming':
                where = { startDate: { [Op.gt]: today } }
                break
            case 'liked': {
                // resolve my liked vacation ids first, so the likers include
                // below still holds ALL likers (needed for likesCount)
                const myLikes = await Like.findAll({ where: { userId }, attributes: ['vacationId'] })
                where = { id: { [Op.in]: myLikes.map(({ vacationId }) => vacationId) } }
                break
            }
        }

        const vacations = await Vacation.findAll({
            where,
            include: [{
                model: User,
                as: 'likers',
                attributes: ['id'],
                through: { attributes: [] }
            }],
            order: [['startDate', 'ASC']],
            limit,
            offset
        })

        response.json(vacations.map(vacation => serializeVacationWithLikes(vacation, userId)))
    } catch (e) {
        next(e)
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