'use server';

import { prisma } from '@/lib/prisma';

export async function getReportData(timeRange: 'week' | 'month', viewMode: 'user' | 'team') {
    // 1. Calculate dates
    const now = new Date();
    const startDate = new Date(now);
    if (timeRange === 'week') {
        // Go back 7 days for a rolling week
        startDate.setDate(now.getDate() - 7);
    } else {
        // Go back 30 days for a rolling month
        startDate.setDate(now.getDate() - 30);
    }

    // 2. Fetch users with their time logs and tasks within range
    const users = await prisma.user.findMany({
        include: {
            timeLogs: {
                where: {
                    date: {
                        gte: startDate,
                        lte: now,
                    }
                },
                include: {
                    task: true
                }
            },
            manager: true
        }
    });

    // 3. Process capacity (Assuming capacityHours is daily capacity, standard workweek is 5 days)
    const workDays = timeRange === 'week' ? 5 : 20;

    let targetRecords: any[] = [];
    
    // Setup generic structure based on viewMode
    if (viewMode === 'user') {
        targetRecords = users.map(user => {
            return {
                id: user.id,
                name: user.name,
                capacityTotalMinutes: (user.capacityHours || 8) * workDays * 60,
                timeLogs: user.timeLogs
            };
        });
    } else {
        // Group by manager/team
        const teamsMap = new Map();
        users.forEach(user => {
            const teamId = user.managerId || user.id; // Treat user as their own team if no manager
            const teamName = user.manager?.name ? `${user.manager.name}'s Team` : `${user.name} (Independent)`;
            
            if (!teamsMap.has(teamId)) {
                teamsMap.set(teamId, {
                    id: teamId,
                    name: teamName,
                    capacityTotalMinutes: 0,
                    timeLogs: []
                });
            }
            
            const team = teamsMap.get(teamId);
            team.capacityTotalMinutes += (user.capacityHours || 8) * workDays * 60;
            team.timeLogs = team.timeLogs.concat(user.timeLogs);
        });
        targetRecords = Array.from(teamsMap.values());
    }

    // 4. Calculate aggregates for each record (user or team)
    const processedRecords = targetRecords.map(record => {
        let totalMinutes = 0;
        let billableMinutes = 0;
        
        record.timeLogs.forEach((log: any) => {
            totalMinutes += log.timeSpentMinutes;
            if (log.billable) {
                billableMinutes += log.timeSpentMinutes;
            }
        });

        const nonBillableMinutes = totalMinutes - billableMinutes;
        const capacityUsagePercentage = record.capacityTotalMinutes > 0 
            ? Math.round((totalMinutes / record.capacityTotalMinutes) * 100) 
            : 0;

        const billablePercentage = totalMinutes > 0 
            ? Math.round((billableMinutes / totalMinutes) * 100) 
            : 0;

        return {
            id: record.id,
            name: record.name,
            totalHours: (totalMinutes / 60).toFixed(1),
            billableHours: (billableMinutes / 60).toFixed(1),
            nonBillableHours: (nonBillableMinutes / 60).toFixed(1),
            billablePercentage,
            capacityUsagePercentage,
            rawMetrics: {
                totalMinutes,
                billableMinutes,
                capacityTotalMinutes: record.capacityTotalMinutes
            }
        };
    });

    // 5. Aggregate system-wide top tasks
    const allLogs = users.flatMap(u => u.timeLogs);
    const taskMap = new Map();
    allLogs.forEach(log => {
        if (!log.task) return;
        const mapped = taskMap.get(log.taskId) || { id: log.taskId, title: log.task.title, minutes: 0 };
        mapped.minutes += log.timeSpentMinutes;
        taskMap.set(log.taskId, mapped);
    });

    const topTasks = Array.from(taskMap.values())
        .map(t => ({ name: t.title, hours: parseFloat((t.minutes / 60).toFixed(1)) }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5); // Top 5 tasks

    // 6. Aggregate system-wide billable ratio for big chart
    const totalSystemMinutes = allLogs.reduce((acc, log) => acc + log.timeSpentMinutes, 0);
    const totalSystemBillable = allLogs.filter(l => l.billable).reduce((acc, log) => acc + log.timeSpentMinutes, 0);

    return {
        records: processedRecords.sort((a, b) => b.rawMetrics.totalMinutes - a.rawMetrics.totalMinutes),
        overview: {
            billableRatio: [
                { name: 'Billable', value: Math.round(totalSystemBillable / 60) },
                { name: 'Non-Billable', value: Math.round((totalSystemMinutes - totalSystemBillable) / 60) }
            ],
            topTasks
        }
    };
}
