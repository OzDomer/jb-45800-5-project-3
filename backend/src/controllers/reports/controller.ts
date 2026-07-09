import type { NextFunction, Request, Response } from "express";
import Vacation from "../../models/Vacation";
import User from "../../models/User";

async function getLikesPerDestination(): Promise<{ destination: string, likes: number }[]> {
    const vacations = await Vacation.findAll({
        include: [{
            model: User,
            as: 'likers',
            attributes: ['id'],
            through: { attributes: [] }
        }],
        order: [['startDate', 'ASC']]
    })

    return vacations.map(vacation => ({
        destination: vacation.destination,
        likes: vacation.likers.length
    }))
}

export async function likesReport(request: Request, response: Response, next: NextFunction) {
    try {
        response.json(await getLikesPerDestination())
    } catch (e) {
        next(e)
    }
}

export async function likesCsv(request: Request, response: Response, next: NextFunction) {
    try {
        const rows = await getLikesPerDestination()

        const csv = [
            'Destination, Likes',
            ...rows.map(({ destination, likes }) => `${destination}, ${likes}`)
        ].join('\n')

        response.setHeader('Content-Type', 'text/csv')
        response.setHeader('Content-Disposition', 'attachment; filename=vacation-likes.csv')
        response.send(csv)
    } catch (e) {
        next(e)
    }
}