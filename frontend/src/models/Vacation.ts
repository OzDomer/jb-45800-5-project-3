export default interface Vacation {
    id: string,
    destination: string,
    description: string,
    startDate: string,
    endDate: string,
    price: number,
    imageUrl: string,
    likesCount: number,
    likedByMe: boolean,
    createdAt: string,
    updatedAt: string
}