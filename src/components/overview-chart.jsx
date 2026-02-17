"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function OverviewChart({ data }) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>User Registrations (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'short' })}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ background: '#333', border: 'none', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#2563eb" // Blue-600
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                                dot={true}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
