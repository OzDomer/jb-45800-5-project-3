import './Reports.css'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import useService from '../../../hooks/use-service'
import ReportsService, { type DestinationLikes } from '../../../services/auth-aware/ReportsService'
import Spinner from '../../common/spinner/Spinner'
import SpinnerButton from '../../common/spinner-button/SpinnerButton'
import { showErrorToast } from '../../common/show-error-toast'

export default function Reports() {

    const [report, setReport] = useState<DestinationLikes[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isDownloading, setIsDownloading] = useState<boolean>(false)

    const reportsService = useService(ReportsService)

    useEffect(() => {
        (async () => {
            try {
                setReport(await reportsService.getLikesReport())
            } catch (e) {
                showErrorToast(e)
            } finally {
                setIsLoading(false)
            }
        })()
    }, [])

    async function downloadCsv() {
        try {
            setIsDownloading(true)
            const blob = await reportsService.downloadCsv()

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'vacation-likes.csv'
            link.click()
            URL.revokeObjectURL(url)
        } catch (e) {
            showErrorToast(e)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className='Reports'>
            <div className='Reports-toolbar'>
                <h2>Vacation Likes Report</h2>
                <SpinnerButton
                    buttonText='Download CSV'
                    spinningText='preparing csv...'
                    isSpinning={isDownloading}
                    onClick={downloadCsv}
                />
            </div>

            {isLoading && <Spinner />}

            {!isLoading && report.length === 0 && (
                <p>no vacations to report on...</p>
            )}

            {!isLoading && report.length > 0 && (
                <div className='Reports-chart'>
                    <ResponsiveContainer width='100%' height={420}>
                        <BarChart data={report} margin={{ top: 12, right: 16, bottom: 60, left: 0 }} barCategoryGap='25%'>
                            <CartesianGrid vertical={false} stroke='var(--border)' strokeDasharray='3 3' />
                            <XAxis
                                dataKey='destination'
                                interval={0}
                                angle={-35}
                                textAnchor='end'
                                tick={{ fill: 'var(--text)', fontSize: 13 }}
                                tickLine={false}
                                axisLine={{ stroke: 'var(--border)' }}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: 'var(--text)', fontSize: 13 }}
                                tickLine={false}
                                axisLine={false}
                                width={36}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--accent-bg)' }}
                                contentStyle={{
                                    background: 'var(--bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 8,
                                    color: 'var(--text-h)'
                                }}
                            />
                            <Bar
                                dataKey='likes'
                                name='Likes'
                                fill='var(--chart-series)'
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}